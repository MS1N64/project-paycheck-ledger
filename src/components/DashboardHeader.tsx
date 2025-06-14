
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import MainNavigation from "./MainNavigation";
import UserMenu from "./UserMenu";

interface DashboardHeaderProps {
  onCreateProject: () => void;
}

const DashboardHeader = ({ onCreateProject }: DashboardHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <img 
            src="/lovable-uploads/66268146-2321-41b8-880e-efc8cb74bbfb.png"
            alt="Dass & Sons Ltd"
            className="h-8 w-8 object-contain"
          />
          <div>
            <h1 className="text-2xl font-bold text-[#0A2C56]">Project Dashboard</h1>
            <p className="text-[#0A2C56]/70 text-sm">Rooted in tradition, Driven by excellence</p>
          </div>
        </div>
        <MainNavigation />
      </div>
      
      <div className="flex items-center gap-4">
        <Button 
          onClick={onCreateProject}
          className="bg-[#0A2C56] hover:bg-[#0A2C56]/90 text-white border-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
        <UserMenu />
      </div>
    </div>
  );
};

export default DashboardHeader;
