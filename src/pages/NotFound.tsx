
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, AlertTriangle } from "lucide-react";
import BrandHeader from "@/components/BrandHeader";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-soft-white dark:bg-slate-900">
      <div className="text-center max-w-md mx-auto px-6">
        {/* Brand header with secondary logo */}
        <div className="mb-8 flex justify-center">
          <BrandHeader size="md" showSlogan={false} forceSecondaryLogo={true} />
        </div>
        
        {/* Error icon */}
        <div className="mb-6 flex justify-center">
          <div className="bg-dass-blue/10 rounded-full p-4">
            <AlertTriangle className="h-12 w-12 text-dass-blue" />
          </div>
        </div>
        
        {/* Error content */}
        <h1 className="text-6xl font-bold text-dass-blue mb-4 font-inter">404</h1>
        <h2 className="text-2xl font-semibold text-slate-grey mb-2 font-inter">Page Not Found</h2>
        <p className="text-slate-grey/70 mb-8 font-roboto leading-relaxed">
          The page you're looking for doesn't exist or has been moved. 
          Let's get you back to your project dashboard.
        </p>
        
        {/* Action button */}
        <Button 
          asChild
          className="bg-dass-blue hover:bg-dass-blue-dark text-white font-medium px-6 py-3"
        >
          <a href="/">
            <Home className="mr-2 h-4 w-4" />
            Return to Dashboard
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
