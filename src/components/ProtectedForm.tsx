
import { useState, ReactNode, useRef } from 'react';
import HCaptcha from './HCaptcha';
import { useCaptchaVerification } from '@/hooks/useCaptchaVerification';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProtectedFormProps {
  children: ReactNode;
  onVerified: () => void;
  action?: string;
  className?: string;
}

const HCAPTCHA_SITE_KEY = 'ES_4ae431844cd34cb0b089832c906b142d';

const ProtectedForm = ({ children, onVerified, action, className = '' }: ProtectedFormProps) => {
  const [isVerified, setIsVerified] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [showRateLimitWarning, setShowRateLimitWarning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const captchaRef = useRef<HTMLDivElement>(null);
  
  const { verifyCaptcha, isVerifying } = useCaptchaVerification();
  const { toast } = useToast();

  const resetCaptcha = () => {
    const resetFn = (captchaRef.current as any)?.getAttribute('reset');
    if (resetFn) {
      resetFn();
    }
    setCaptchaToken(null);
    setVerificationError(null);
    setIsVerified(false);
    setIsProcessing(false);
  };

  const handleCaptchaVerify = async (token: string) => {
    if (isProcessing) {
      console.log('Already processing verification, ignoring duplicate token');
      return;
    }

    console.log('Starting captcha verification for action:', action);
    setIsProcessing(true);
    setCaptchaToken(token);
    setVerificationError(null);

    try {
      const result = await verifyCaptcha(token, action);

      if (result.success) {
        setIsVerified(true);
        onVerified();
        toast({
          title: "Verification successful",
          description: "You can now proceed with your request.",
        });
      } else {
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

        // Reset captcha on failure
        setTimeout(resetCaptcha, 1000);
      }
    } catch (error) {
      console.error('Captcha verification error:', error);
      setVerificationError('Network error during verification');
      setTimeout(resetCaptcha, 1000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCaptchaError = (error: string) => {
    console.error('Captcha widget error:', error);
    setVerificationError(error);
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
    setIsVerified(false);
    setCaptchaToken(null);
    setVerificationError(null);
    setIsProcessing(false);
    toast({
      title: "Verification expired",
      description: "Please complete the captcha again.",
      variant: "destructive",
    });
  };

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
