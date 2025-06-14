
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CaptchaRequest {
  token: string;
  action?: string;
  userIp?: string;
}

interface RateLimitEntry {
  ip: string;
  attempts: number;
  last_attempt: string;
  blocked_until?: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes

async function checkRateLimit(ip: string): Promise<{ allowed: boolean; remainingAttempts?: number }> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - RATE_LIMIT_WINDOW);

  try {
    // Get or create rate limit entry
    const { data: rateLimitData, error } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('ip', ip)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Rate limit check error:', error);
      return { allowed: true }; // Allow on error to prevent blocking legitimate users
    }

    const existingEntry = rateLimitData as RateLimitEntry | null;

    // Check if IP is currently blocked
    if (existingEntry?.blocked_until) {
      const blockedUntil = new Date(existingEntry.blocked_until);
      if (now < blockedUntil) {
        return { allowed: false, remainingAttempts: 0 };
      }
    }

    // Count recent attempts
    const lastAttempt = existingEntry?.last_attempt ? new Date(existingEntry.last_attempt) : null;
    const isWithinWindow = lastAttempt && lastAttempt > windowStart;
    const currentAttempts = isWithinWindow ? (existingEntry?.attempts || 0) : 0;

    if (currentAttempts >= MAX_ATTEMPTS) {
      // Block the IP
      await supabase
        .from('rate_limits')
        .upsert({
          ip,
          attempts: currentAttempts + 1,
          last_attempt: now.toISOString(),
          blocked_until: new Date(now.getTime() + BLOCK_DURATION).toISOString()
        });
      
      return { allowed: false, remainingAttempts: 0 };
    }

    // Update attempt count
    await supabase
      .from('rate_limits')
      .upsert({
        ip,
        attempts: isWithinWindow ? currentAttempts + 1 : 1,
        last_attempt: now.toISOString(),
        blocked_until: null
      });

    return { 
      allowed: true, 
      remainingAttempts: MAX_ATTEMPTS - (isWithinWindow ? currentAttempts + 1 : 1)
    };
  } catch (error) {
    console.error('Rate limiting error:', error);
    return { allowed: true }; // Allow on error
  }
}

async function verifyHCaptcha(token: string, userIp?: string): Promise<{ success: boolean; error?: string }> {
  // Get the secret key from environment variables
  const secretKey = Deno.env.get('HCAPTCHA_SECRET_KEY');
  
  if (!secretKey) {
    console.error('hCaptcha secret key not found in environment variables');
    return { success: false, error: 'hCaptcha secret key not configured' };
  }

  console.log('Attempting hCaptcha verification with token length:', token?.length);

  try {
    const formData = new FormData();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (userIp) {
      formData.append('remoteip', userIp);
    }

    console.log('Sending verification request to hCaptcha API');
    const response = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      console.error('hCaptcha API response not ok:', response.status, response.statusText);
      return { success: false, error: 'hCaptcha API unavailable' };
    }

    const result = await response.json();
    console.log('hCaptcha verification result:', result);
    
    if (result.success) {
      console.log('hCaptcha verification successful');
      return { success: true };
    } else {
      const errorCodes = result['error-codes'] || [];
      console.error('hCaptcha verification failed with error codes:', errorCodes);
      
      // Provide more specific error messages
      if (errorCodes.includes('invalid-input-secret')) {
        return { success: false, error: 'Invalid hCaptcha secret key configuration' };
      } else if (errorCodes.includes('invalid-input-response')) {
        return { success: false, error: 'Invalid captcha response token' };
      } else if (errorCodes.includes('timeout-or-duplicate')) {
        return { success: false, error: 'Captcha token has expired or been used already' };
      } else {
        return { 
          success: false, 
          error: errorCodes.join(', ') || 'Captcha verification failed' 
        };
      }
    }
  } catch (error) {
    console.error('hCaptcha verification network error:', error);
    return { success: false, error: 'Captcha verification service unavailable' };
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { token, action, userIp }: CaptchaRequest = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Captcha token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get client IP
    const clientIp = userIp || 
                    req.headers.get('cf-connecting-ip') || 
                    req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown';

    console.log(`Captcha verification attempt from IP: ${clientIp}, Action: ${action || 'unknown'}`);

    // Check rate limiting
    const rateLimitResult = await checkRateLimit(clientIp);
    
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ 
          error: 'Too many attempts. Please try again later.',
          rateLimited: true 
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify captcha
    const captchaResult = await verifyHCaptcha(token, clientIp);

    if (captchaResult.success) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Captcha verified successfully',
          remainingAttempts: rateLimitResult.remainingAttempts
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ 
          error: captchaResult.error || 'Captcha verification failed',
          remainingAttempts: rateLimitResult.remainingAttempts
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error in captcha verification:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
