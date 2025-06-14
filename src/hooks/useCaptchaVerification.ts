
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CaptchaVerificationResult {
  success: boolean;
  error?: string;
  remainingAttempts?: number;
  rateLimited?: boolean;
}

export const useCaptchaVerification = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  const verifyCaptcha = async (
    token: string, 
    action?: string
  ): Promise<CaptchaVerificationResult> => {
    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      console.error('Invalid token provided to verifyCaptcha');
      return { 
        success: false, 
        error: 'Invalid captcha token' 
      };
    }

    setIsVerifying(true);
    console.log('Verifying captcha token for action:', action);

    try {
      const userIP = await getUserIP();
      console.log('User IP obtained:', userIP ? 'yes' : 'no');

      const { data, error } = await supabase.functions.invoke('verify-captcha', {
        body: { 
          token: token.trim(), 
          action: action || 'default',
          userIp: userIP
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        return { 
          success: false, 
          error: 'Verification service unavailable' 
        };
      }

      console.log('Captcha verification response:', data);

      if (data?.success) {
        return { 
          success: true, 
          remainingAttempts: data.remainingAttempts 
        };
      } else {
        return { 
          success: false, 
          error: data?.error || 'Verification failed',
          remainingAttempts: data?.remainingAttempts,
          rateLimited: data?.rateLimited
        };
      }
    } catch (error) {
      console.error('Network error during captcha verification:', error);
      return { 
        success: false, 
        error: 'Network error during verification' 
      };
    } finally {
      setIsVerifying(false);
    }
  };

  const getUserIP = async (): Promise<string | undefined> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch('https://api.ipify.org?format=json', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.warn('Could not get user IP:', error);
      return undefined;
    }
  };

  return {
    verifyCaptcha,
    isVerifying
  };
};
