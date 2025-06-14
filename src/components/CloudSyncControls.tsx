
import { Button } from "@/components/ui/button";
import { Upload, Download, LogOut } from "lucide-react";
import { User } from "@supabase/supabase-js";

interface CloudSyncControlsProps {
  user: User | null;
  cloudSyncEnabled: boolean;
  syncing: boolean;
  onSyncToCloud: () => void;
  onSyncFromCloud: () => void;
  onSignOut: () => void;
  onSignInClick: () => void;
}

const CloudSyncControls = ({ 
  user, 
  cloudSyncEnabled, 
  syncing, 
  onSyncToCloud, 
  onSyncFromCloud, 
  onSignOut,
  onSignInClick 
}: CloudSyncControlsProps) => {
  if (user) {
    return (
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <div className="text-sm text-slate-600">
          Signed in as: <span className="font-medium">{user.email}</span>
        </div>
        
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onSyncToCloud}
            disabled={syncing || !cloudSyncEnabled}
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-2" />
            {syncing ? "Syncing..." : "Backup to Cloud"}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={onSyncFromCloud}
            disabled={syncing || !cloudSyncEnabled}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            {syncing ? "Loading..." : "Load from Cloud"}
          </Button>
        </div>
        
        <Button
          size="sm"
          variant="outline"
          onClick={onSignOut}
          className="w-full border-red-300 text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    );
  }

  if (!user && cloudSyncEnabled) {
    return (
      <div className="pt-4 border-t border-slate-200">
        <Button
          onClick={onSignInClick}
          className="w-full bg-slate-800 hover:bg-slate-700"
        >
          Sign In to Enable Cloud Sync
        </Button>
      </div>
    );
  }

  return null;
};

export default CloudSyncControls;
