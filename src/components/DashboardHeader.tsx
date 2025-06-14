
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import DarkModeToggle from "@/components/DarkModeToggle";
import MainNavigation from "@/components/MainNavigation";
import BrandHeader from "@/components/BrandHeader";

interface DashboardHeaderProps {
  onCreateProject: () => void;
}

const DashboardHeader = ({ onCreateProject }: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col gap-4 mb-6 sm:mb-8">
      {/* Brand header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <BrandHeader size="lg" />
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
          {/* Mobile navigation */}
          <div className="md:hidden">
            <MainNavigation />
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <DarkModeToggle />
            <Button 
              onClick={onCreateProject} 
              className="bg-dass-blue hover:bg-dass-blue-dark text-white text-sm sm:text-base px-3 sm:px-4 py-2 font-medium"
              size="sm"
            >
              <Plus className="mr-1 sm:mr-2 h-4 w-4" />
              <span className="hidden xs:inline">New Project</span>
              <span className="xs:hidden">New</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main dashboard title */}
      <div className="w-full sm:w-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-grey dark:text-gray-100 mb-1 sm:mb-2 font-inter">
          Project Dashboard
        </h2>
        <p className="text-sm sm:text-base text-slate-grey/80 dark:text-gray-400 font-roboto">
          Manage your construction projects and track payments
        </p>
      </div>
      
      {/* Desktop navigation menu */}
      <div className="hidden md:flex justify-center sm:justify-start">
        <MainNavigation />
      </div>
    </div>
  );
};

export default DashboardHeader;
