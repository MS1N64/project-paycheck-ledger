
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
    setIsVerifying(true);

    try {
      const { data, error } = await supabase.functions.invoke('verify-captcha', {
        body: { 
          token, 
          action,
          userIp: await getUserIP()
        }
      });

      if (error) {
        console.error('Captcha verification error:', error);
        return { 
          success: false, 
          error: 'Verification service unavailable' 
        };
      }

      if (data.success) {
        return { 
          success: true, 
          remainingAttempts: data.remainingAttempts 
        };
      } else {
        return { 
          success: false, 
          error: data.error,
          remainingAttempts: data.remainingAttempts,
          rateLimited: data.rateLimited
        };
      }
    } catch (error) {
      console.error('Captcha verification error:', error);
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
      const response = await fetch('https://api.ipify.org?format=json');
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
