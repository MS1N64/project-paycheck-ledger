
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import DarkModeToggle from "@/components/DarkModeToggle";

interface DashboardHeaderProps {
  onCreateProject: () => void;
}

const DashboardHeader = ({ onCreateProject }: DashboardHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Project Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your construction projects and track payments
        </p>
      </div>
      <div className="flex items-center gap-4">
        <DarkModeToggle />
        <Button 
          onClick={onCreateProject} 
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
