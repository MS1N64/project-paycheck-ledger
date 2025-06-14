
import { Building2 } from "lucide-react";

interface BrandHeaderProps {
  showSlogan?: boolean;
  size?: "sm" | "md" | "lg";
}

const BrandHeader = ({ showSlogan = true, size = "md" }: BrandHeaderProps) => {
  const sizeClasses = {
    sm: {
      title: "text-lg font-semibold",
      slogan: "text-xs",
      icon: "h-5 w-5"
    },
    md: {
      title: "text-2xl font-bold",
      slogan: "text-sm",
      icon: "h-6 w-6"
    },
    lg: {
      title: "text-4xl font-bold",
      slogan: "text-base",
      icon: "h-8 w-8"
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center bg-dass-blue rounded-lg p-2">
        <Building2 className={`${sizeClasses[size].icon} text-white`} />
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
