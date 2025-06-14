
import { useLocation } from "react-router-dom";

interface BrandHeaderProps {
  showSlogan?: boolean;
  size?: "sm" | "md" | "lg";
  forceSecondaryLogo?: boolean;
}

const BrandHeader = ({ showSlogan = true, size = "md", forceSecondaryLogo = false }: BrandHeaderProps) => {
  const location = useLocation();
  
  // Use primary logo on main page (/), secondary logo everywhere else
  const isMainPage = location.pathname === "/";
  const usePrimaryLogo = isMainPage && !forceSecondaryLogo;
  
  const sizeClasses = {
    sm: {
      logo: "h-12 w-12"
    },
    md: {
      logo: "h-16 w-16"
    },
    lg: {
      logo: "h-20 w-20"
    }
  };

  const logoSrc = usePrimaryLogo 
    ? "/lovable-uploads/79c8de50-64f1-4119-8e64-d4e6942d87fd.png"
    : "/lovable-uploads/66268146-2321-41b8-880e-efc8cb74bbfb.png";

  return (
    <div className="flex items-center justify-center">
      <img 
        src={logoSrc}
        alt="Dass & Sons Ltd Logo"
        className={`${sizeClasses[size].logo} object-contain`}
      />
    </div>
  );
};

export default BrandHeader;
