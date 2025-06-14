
import { useState, ReactNode } from 'react';
import HCaptcha from './HCaptcha';
import { useCaptchaVerification } from '@/hooks/useCaptchaVerification';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';

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
  
  const { verifyCaptcha, isVerifying } = useCaptchaVerification();
  const { toast } = useToast();

  const handleCaptchaVerify = async (token: string) => {
    setCaptchaToken(token);
    setVerificationError(null);

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
    }
  };

  const handleCaptchaError = (error: string) => {
    setVerificationError(error);
    setIsVerified(false);
    toast({
      title: "Captcha error",
      description: error,
      variant: "destructive",
    });
  };

  const handleCaptchaExpire = () => {
    setIsVerified(false);
    setCaptchaToken(null);
    setVerificationError(null);
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
            <AlertDescription className="text-red-800">
              {verificationError}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-center">
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

        {isVerifying && (
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
