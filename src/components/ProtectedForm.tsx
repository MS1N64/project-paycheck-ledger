
import React, { useState, ReactNode, useRef } from 'react';
import HCaptcha from './HCaptcha';
import { useCaptchaVerification } from '@/hooks/useCaptchaVerification';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProtectedFormProps {
  children: ReactNode;
  onVerified: (token: string) => void;
  onReset?: () => void;
  action?: string;
  className?: string;
}

// Using your real hCaptcha site key
const HCAPTCHA_SITE_KEY = '0732bed2-e24c-4466-8ca8-36dc71782aac';

const ProtectedForm = ({ children, onVerified, onReset, action, className = '' }: ProtectedFormProps) => {
  const [isVerified, setIsVerified] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [showRateLimitWarning, setShowRateLimitWarning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [captchaKey, setCaptchaKey] = useState(0); // Force re-render of captcha
  const captchaRef = useRef<HTMLDivElement>(null);
  
  const { verifyCaptcha, isVerifying } = useCaptchaVerification();
  const { toast } = useToast();

  const resetCaptcha = () => {
    console.log('Resetting captcha form state');
    
    // Reset all state
    setCaptchaToken(null);
    setVerificationError(null);
    setIsVerified(false);
    setIsProcessing(false);
    setShowRateLimitWarning(false);
    
    // Force re-render of captcha widget with new key
    setCaptchaKey(prev => prev + 1);
    
    // Call parent reset if provided
    if (onReset) {
      onReset();
    }
  };

  const handleCaptchaVerify = async (token: string) => {
    if (isProcessing) {
      console.log('Already processing verification, ignoring duplicate token');
      return;
    }

    console.log('Captcha token received for action:', action, 'with token length:', token?.length);
    setIsProcessing(true);
    setCaptchaToken(token);
    setVerificationError(null);

    try {
      // For auth actions, skip our verification and pass token directly to Supabase
      // This prevents the "already-seen-response" error
      if (action === 'auth' || action === 'cloud-sync') {
        console.log('Skipping pre-verification for auth action, passing token directly');
        setIsVerified(true);
        onVerified(token);
        toast({
          title: "Verification successful",
          description: "You can now proceed with authentication.",
        });
        return;
      }

      // For other actions, verify through our edge function
      const result = await verifyCaptcha(token, action);

      if (result.success) {
        console.log('Captcha verification successful');
        setIsVerified(true);
        onVerified(token);
        toast({
          title: "Verification successful",
          description: "You can now proceed with your request.",
        });
      } else {
        console.error('Captcha verification failed:', result.error);
        setIsVerified(false);
        setVerificationError(result.error || 'Verification failed');
        
        if (result.rateLimited) {
          setShowRateLimitWarning(true);
          toast({
            title: "Too many attempts",
            description: "Please wait before trying again.",
            variant: "destructive",
          });
        } else if (result.remainingAttempts !== undefined && result.remainingAttempts <= 2) {
          setShowRateLimitWarning(true);
        }

        // Reset captcha on failure after a short delay
        setTimeout(resetCaptcha, 1500);
      }
    } catch (error) {
      console.error('Captcha verification error:', error);
      setVerificationError('Network error during verification');
      setTimeout(resetCaptcha, 1500);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCaptchaError = (error: string) => {
    console.error('Captcha widget error:', error);
    
    // Handle specific error cases
    if (error.includes('site key') || error.includes('sitekey')) {
      setVerificationError('Configuration error: Invalid site key. Please contact support.');
    } else if (error.includes('network') || error.includes('load')) {
      setVerificationError('Network error: Please check your connection and try again.');
    } else {
      setVerificationError(error);
    }
    
    setIsVerified(false);
    setIsProcessing(false);
    
    toast({
      title: "Captcha error",
      description: error,
      variant: "destructive",
    });
  };

  const handleCaptchaExpire = () => {
    console.log('Captcha expired, resetting form');
    resetCaptcha();
    toast({
      title: "Verification expired",
      description: "Please complete the captcha again.",
      variant: "destructive",
    });
  };

  // Expose reset function to parent components that might need it
  const handleAuthFailure = () => {
    console.log('Authentication failed, resetting captcha for fresh token');
    resetCaptcha();
  };

  // Add this to the ref so parent components can call it
  React.useEffect(() => {
    if (captchaRef.current) {
      (captchaRef.current as any).resetForAuthFailure = handleAuthFailure;
    }
  }, []);

  if (!isVerified) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-800">Security Verification</h3>
          </div>
          <p className="text-slate-600 mb-4">
            Please complete the security check to continue
          </p>
        </div>

        {showRateLimitWarning && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              You're approaching the rate limit. Please complete the verification carefully.
            </AlertDescription>
          </Alert>
        )}

        {verificationError && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 flex items-center justify-between">
              <span>{verificationError}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={resetCaptcha}
                className="ml-2"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-center">
          <div ref={captchaRef}>
            <HCaptcha
              key={captchaKey}
              sitekey={HCAPTCHA_SITE_KEY}
              onVerify={handleCaptchaVerify}
              onError={handleCaptchaError}
              onExpire={handleCaptchaExpire}
              theme="light"
              size="normal"
              className="flex justify-center"
            />
          </div>
        </div>

        {(isVerifying || isProcessing) && (
          <div className="text-center text-slate-600">
            <div className="animate-spin inline-block w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full mr-2"></div>
            Verifying...
          </div>
        )}
      </div>
    );
  }

  return <div className={className}>{children}</div>;
};

export default ProtectedForm;
