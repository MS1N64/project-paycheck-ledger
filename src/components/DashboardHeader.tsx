
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface DashboardHeaderProps {
  onCreateProject: () => void;
}

const DashboardHeader = ({ onCreateProject }: DashboardHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center gap-6">
        <img 
          src="/lovable-uploads/7d3f7b33-caa8-4493-8e10-edf7a631b0e2.png" 
          alt="DASS & SONS" 
          className="h-24 w-auto"
        />
        <div>
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Project Payment Tracker</h1>
          <p className="text-slate-600">Manage and track payments for all your property projects</p>
        </div>
      </div>
      <Button onClick={onCreateProject} size="lg" className="bg-slate-800 hover:bg-slate-700">
        <Plus className="h-5 w-5 mr-2" />
        New Project
      </Button>
    </div>
  );
};

export default DashboardHeader;
