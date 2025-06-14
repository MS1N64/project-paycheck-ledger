import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "@/components/AuthForm";
import ProtectedForm from "@/components/ProtectedForm";
import { useAuth } from "@/hooks/useAuth";

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [protectedFormKey, setProtectedFormKey] = useState(0);

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (user && !loading) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  const handleAuthSuccess = () => {
    navigate("/");
  };

  const handleCaptchaVerified = (token: string) => {
    console.log('Captcha verified with token:', token ? 'received' : 'missing');
    setCaptchaToken(token);
  };

  const handleCaptchaReset = () => {
    console.log('Resetting captcha token');
    setCaptchaToken(null);
    // Force re-render of ProtectedForm to get a fresh captcha
    setProtectedFormKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A2C56]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src="/lovable-uploads/66268146-2321-41b8-880e-efc8cb74bbfb.png"
            alt="Dass & Sons Ltd"
            className="h-16 w-16 mx-auto mb-4 object-contain"
          />
          <h1 className="text-2xl font-bold text-[#0A2C56] mb-2">
            Dass & Sons Ltd
          </h1>
          <p className="text-[#0A2C56]/70 text-sm">
            Project Management Dashboard
          </p>
        </div>
        
        <ProtectedForm 
          key={protectedFormKey}
          onVerified={handleCaptchaVerified} 
          onReset={handleCaptchaReset}
          action="auth" 
          className="mb-6"
        >
          <AuthForm 
            onAuthSuccess={handleAuthSuccess} 
            captchaToken={captchaToken}
            onCaptchaReset={handleCaptchaReset}
          />
        </ProtectedForm>
        
        <div className="mt-6 text-center text-xs text-[#0A2C56]/60">
          Rooted in tradition, Driven by excellence
        </div>
      </div>
    </div>
  );
};

export default Auth;
