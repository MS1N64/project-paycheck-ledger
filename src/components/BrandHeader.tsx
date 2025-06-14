
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
      title: "text-lg font-semibold",
      slogan: "text-xs",
      logo: "h-8 w-8"
    },
    md: {
      title: "text-2xl font-bold",
      slogan: "text-sm",
      logo: "h-10 w-10"
    },
    lg: {
      title: "text-4xl font-bold",
      slogan: "text-base",
      logo: "h-12 w-12"
    }
  };

  const logoSrc = usePrimaryLogo 
    ? "/lovable-uploads/79c8de50-64f1-4119-8e64-d4e6942d87fd.png"
    : "/lovable-uploads/66268146-2321-41b8-880e-efc8cb74bbfb.png";

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center">
        <img 
          src={logoSrc}
          alt="Dass & Sons Ltd Logo"
          className={`${sizeClasses[size].logo} object-contain`}
        />
      </div>
      <div className="flex flex-col">
        <h1 className={`${sizeClasses[size].title} text-dass-blue font-inter leading-tight`}>
          Dass & Sons Ltd
        </h1>
        {showSlogan && (
          <p className={`${sizeClasses[size].slogan} text-slate-grey font-roboto italic`}>
            Rooted in tradition, Driven by excellence
          </p>
        )}
      </div>
    </div>
  );
};

export default BrandHeader;
