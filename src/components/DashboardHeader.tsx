
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import DarkModeToggle from "@/components/DarkModeToggle";
import MainNavigation from "@/components/MainNavigation";

interface DashboardHeaderProps {
  onCreateProject: () => void;
}

const DashboardHeader = ({ onCreateProject }: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col gap-4 mb-6 sm:mb-8">
      {/* Main header with title and actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-auto">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2">
            Project Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Manage your construction projects and track payments
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
          {/* Mobile navigation - shown on left side of mobile header */}
          <div className="md:hidden">
            <MainNavigation />
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <DarkModeToggle />
            <Button 
              onClick={onCreateProject} 
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base px-3 sm:px-4 py-2"
              size="sm"
            >
              <Plus className="mr-1 sm:mr-2 h-4 w-4" />
              <span className="hidden xs:inline">New Project</span>
              <span className="xs:hidden">New</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Desktop navigation menu */}
      <div className="hidden md:flex justify-center sm:justify-start">
        <MainNavigation />
      </div>
    </div>
  );
};

export default DashboardHeader;
