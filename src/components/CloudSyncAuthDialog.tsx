
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import AuthForm from "@/components/AuthForm";
import ProtectedForm from "@/components/ProtectedForm";

interface CloudSyncAuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthSuccess: () => void;
}

const CloudSyncAuthDialog = ({ open, onOpenChange, onAuthSuccess }: CloudSyncAuthDialogProps) => {
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [protectedFormKey, setProtectedFormKey] = useState(0);

  const handleCaptchaVerified = (token: string) => {
    console.log('Cloud sync captcha verified with token:', token ? 'received' : 'missing');
    setCaptchaToken(token);
  };

  const handleCaptchaReset = () => {
    console.log('Resetting cloud sync captcha token');
    setCaptchaToken(null);
    // Force re-render of ProtectedForm to get a fresh captcha
    setProtectedFormKey(prev => prev + 1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <ProtectedForm 
          key={protectedFormKey}
          onVerified={handleCaptchaVerified} 
          onReset={handleCaptchaReset}
          action="cloud-sync" 
          className="mb-6"
        >
          <AuthForm 
            onAuthSuccess={onAuthSuccess} 
            captchaToken={captchaToken}
            onCaptchaReset={handleCaptchaReset}
          />
        </ProtectedForm>
      </DialogContent>
    </Dialog>
  );
};

export default CloudSyncAuthDialog;
