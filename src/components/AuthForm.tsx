import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff } from "lucide-react";

interface AuthFormProps {
  onAuthSuccess: () => void;
  captchaToken: string | null;
  onCaptchaReset?: () => void;
}

const AuthForm = ({ onAuthSuccess, captchaToken, onCaptchaReset }: AuthFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: ""
  });

  const handleAuthError = (error: any) => {
    console.error('Authentication error:', error);
    
    // Reset captcha on auth failure to get a new token
    if (onCaptchaReset) {
      setTimeout(() => {
        onCaptchaReset();
      }, 1500);
    }
    
    let errorMessage = error.message || "An error occurred during authentication";
    
    // Handle specific captcha errors
    if (error.message?.includes('captcha') || error.code === 'captcha_failed') {
      errorMessage = "Security verification failed. Please complete the captcha again.";
    }
    
    toast({
      title: "Authentication failed",
      description: errorMessage,
      variant: "destructive",
    });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!captchaToken) {
      toast({
        title: "Verification required",
        description: "Please complete the captcha verification first.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting sign in for:', formData.email, 'with captcha token');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
        options: {
          captchaToken: captchaToken
        }
      });

      console.log('Sign in response:', { data, error });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      });
      onAuthSuccess();
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!captchaToken) {
      toast({
        title: "Verification required",
        description: "Please complete the captcha verification first.",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting sign up for:', formData.email, 'with captcha token');
      
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          captchaToken: captchaToken,
          data: {
            full_name: formData.fullName || formData.email,
          }
        }
      });

      console.log('Sign up response:', { data, error });

      if (error) throw error;

      // Check if email confirmation is required
      if (data.user && !data.session) {
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link to complete your registration.",
        });
      } else if (data.session) {
        // Auto-signed in (email confirmation disabled)
        toast({
          title: "Account created!",
          description: "Welcome to Dass & Sons Ltd.",
        });
        onAuthSuccess();
      }
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full border-[#E3E8EF] bg-white shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-[#0A2C56]">Access Your Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#F5F7FA] border border-[#E3E8EF]">
            <TabsTrigger 
              value="signin"
              className="text-[#0A2C56] data-[state=active]:bg-white data-[state=active]:border data-[state=active]:border-[#0A2C56]/20"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger 
              value="signup"
              className="text-[#0A2C56] data-[state=active]:bg-white data-[state=active]:border data-[state=active]:border-[#0A2C56]/20"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="bg-[#F5F7FA] p-4 rounded-lg border border-[#E3E8EF]">
                <Label htmlFor="signin-email" className="text-[#0A2C56] font-medium">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  className="mt-2 bg-white border-[#E3E8EF] focus:border-[#0A2C56] focus:ring-[#0A2C56] text-[#0A2C56]"
                  placeholder="Enter your email"
                />
              </div>
              <div className="bg-[#F5F7FA] p-4 rounded-lg border border-[#E3E8EF]">
                <Label htmlFor="signin-password" className="text-[#0A2C56] font-medium">Password</Label>
                <div className="relative mt-2">
                  <Input
                    id="signin-password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                    className="bg-white border-[#E3E8EF] focus:border-[#0A2C56] focus:ring-[#0A2C56] pr-10 text-[#0A2C56]"
                    placeholder="Enter your password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-[#0A2C56]/70" />
                    ) : (
                      <Eye className="h-4 w-4 text-[#0A2C56]/70" />
                    )}
                  </Button>
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-[#0A2C56] hover:bg-[#0A2C56]/90 text-white"
                disabled={loading || !captchaToken}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="bg-[#F5F7FA] p-4 rounded-lg border border-[#E3E8EF]">
                <Label htmlFor="signup-name" className="text-[#0A2C56] font-medium">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="mt-2 bg-white border-[#E3E8EF] focus:border-[#0A2C56] focus:ring-[#0A2C56] text-[#0A2C56]"
                  placeholder="Enter your full name"
                />
              </div>
              <div className="bg-[#F5F7FA] p-4 rounded-lg border border-[#E3E8EF]">
                <Label htmlFor="signup-email" className="text-[#0A2C56] font-medium">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  className="mt-2 bg-white border-[#E3E8EF] focus:border-[#0A2C56] focus:ring-[#0A2C56] text-[#0A2C56]"
                  placeholder="Enter your email"
                />
              </div>
              <div className="bg-[#F5F7FA] p-4 rounded-lg border border-[#E3E8EF]">
                <Label htmlFor="signup-password" className="text-[#0A2C56] font-medium">Password</Label>
                <div className="relative mt-2">
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                    className="bg-white border-[#E3E8EF] focus:border-[#0A2C56] focus:ring-[#0A2C56] pr-10 text-[#0A2C56]"
                    placeholder="Create a password (min. 6 characters)"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-[#0A2C56]/70" />
                    ) : (
                      <Eye className="h-4 w-4 text-[#0A2C56]/70" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="bg-[#F5F7FA] p-4 rounded-lg border border-[#E3E8EF]">
                <Label htmlFor="confirm-password" className="text-[#0A2C56] font-medium">Confirm Password</Label>
                <div className="relative mt-2">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    required
                    className="bg-white border-[#E3E8EF] focus:border-[#0A2C56] focus:ring-[#0A2C56] pr-10 text-[#0A2C56]"
                    placeholder="Confirm your password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-[#0A2C56]/70" />
                    ) : (
                      <Eye className="h-4 w-4 text-[#0A2C56]/70" />
                    )}
                  </Button>
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-[#0A2C56] hover:bg-[#0A2C56]/90 text-white"
                disabled={loading || !captchaToken}
              >
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AuthForm;
