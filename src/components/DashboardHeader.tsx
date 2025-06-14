
import { Button } from "@/components/ui/button";
import { Plus, Cloud } from "lucide-react";

interface DashboardHeaderProps {
  onCreateProject: () => void;
  onShowCloudSync?: () => void;
}

const DashboardHeader = ({ onCreateProject, onShowCloudSync }: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Project Dashboard</h1>
        <p className="text-slate-600 mt-1">Manage your construction projects and payments</p>
      </div>
      <div className="flex gap-2">
        {onShowCloudSync && (
          <Button
            onClick={onShowCloudSync}
            variant="outline"
            className="border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            <Cloud className="h-4 w-4 mr-2" />
            Cloud Sync
          </Button>
        )}
        <Button
          onClick={onCreateProject}
          className="bg-slate-800 hover:bg-slate-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
