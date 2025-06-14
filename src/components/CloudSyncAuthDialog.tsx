
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

  const handleCaptchaVerified = (token: string) => {
    console.log('Cloud sync captcha verified with token:', token ? 'received' : 'missing');
    setCaptchaToken(token);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <ProtectedForm onVerified={handleCaptchaVerified} action="cloud-sync" className="mb-6">
          <AuthForm onAuthSuccess={onAuthSuccess} captchaToken={captchaToken} />
        </ProtectedForm>
      </DialogContent>
    </Dialog>
  );
};

export default CloudSyncAuthDialog;
