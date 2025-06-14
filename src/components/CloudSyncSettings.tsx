
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Cloud, CloudOff, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCloudSync } from "@/hooks/useCloudSync";
import CloudSyncControls from "@/components/CloudSyncControls";
import CloudSyncAuthDialog from "@/components/CloudSyncAuthDialog";
import { Project, Payment } from "@/types";

interface CloudSyncSettingsProps {
  projects: Project[];
  payments: Payment[];
  onDataSync: (projects: Project[], payments: Payment[]) => void;
}

const CloudSyncSettings = ({ projects, payments, onDataSync }: CloudSyncSettingsProps) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  
  const {
    cloudSyncEnabled,
    syncing,
    user,
    handleToggleCloudSync,
    handleSyncToCloud,
    handleSyncFromCloud,
    handleSignOut,
    enableCloudSync
  } = useCloudSync({ projects, payments, onDataSync });

  const onToggleCloudSync = async (enabled: boolean) => {
    const result = await handleToggleCloudSync(enabled);
    if (result.requiresAuth) {
      setShowAuthDialog(true);
    }
  };

  const handleAuthSuccess = async () => {
    setShowAuthDialog(false);
    enableCloudSync();
  };

  if (authLoading) {
    return (
      <Card className="border-slate-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-800 flex items-center gap-2">
            {cloudSyncEnabled ? <Cloud className="h-5 w-5" /> : <CloudOff className="h-5 w-5" />}
            Cloud Sync Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-slate-700">Enable Cloud Sync</Label>
              <p className="text-sm text-slate-500">
                Sync your data to the cloud for backup and access across devices
              </p>
            </div>
            <Switch
              checked={cloudSyncEnabled}
              onCheckedChange={onToggleCloudSync}
            />
          </div>

          <CloudSyncControls
            user={user}
            cloudSyncEnabled={cloudSyncEnabled}
            syncing={syncing}
            onSyncToCloud={handleSyncToCloud}
            onSyncFromCloud={handleSyncFromCloud}
            onSignOut={handleSignOut}
            onSignInClick={() => setShowAuthDialog(true)}
          />
        </CardContent>
      </Card>

      <CloudSyncAuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default CloudSyncSettings;
