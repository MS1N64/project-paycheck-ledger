import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Cloud, CloudOff, Upload, Download, LogOut, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import AuthForm from "@/components/AuthForm";
import ProtectedForm from "@/components/ProtectedForm";
import { CloudSyncService } from "@/services/cloudSync";
import { Project, Payment } from "@/types";
import { SecureStorage } from "@/lib/dataIntegrity";

interface CloudSyncSettingsProps {
  projects: Project[];
  payments: Payment[];
  onDataSync: (projects: Project[], payments: Payment[]) => void;
}

const CloudSyncSettings = ({ projects, payments, onDataSync }: CloudSyncSettingsProps) => {
  const { toast } = useToast();
  const { user, isAuthenticated, signOut, loading: authLoading } = useAuth();
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  useEffect(() => {
    const savedCloudSyncEnabled = localStorage.getItem('cloudSyncEnabled') === 'true';
    setCloudSyncEnabled(savedCloudSyncEnabled && isAuthenticated);
  }, [isAuthenticated]);

  const handleToggleCloudSync = async (enabled: boolean) => {
    if (enabled && !isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }

    if (enabled && isAuthenticated) {
      // Auto-sync when enabling
      await handleSyncToCloud();
    }

    setCloudSyncEnabled(enabled);
    localStorage.setItem('cloudSyncEnabled', enabled.toString());
  };

  const handleAuthSuccess = async () => {
    setShowAuthDialog(false);
    setCloudSyncEnabled(true);
    localStorage.setItem('cloudSyncEnabled', 'true');
    
    toast({
      title: "Authentication successful",
      description: "Cloud sync is now enabled.",
    });

    // Auto-sync after successful authentication
    setTimeout(() => handleSyncToCloud(), 1000);
  };

  const handleCaptchaVerified = (token: string) => {
    console.log('Cloud sync captcha verified with token:', token ? 'received' : 'missing');
    setCaptchaToken(token);
  };

  const handleSyncToCloud = async () => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to sync data to cloud.",
        variant: "destructive"
      });
      return;
    }

    setSyncing(true);
    try {
      const result = await CloudSyncService.performFullSync(projects, payments, user.id);
      
      if (result.success) {
        toast({
          title: "Sync successful",
          description: `Synced ${projects.length} projects and ${payments.length} payments to cloud.`,
        });
      } else {
        throw new Error('Sync failed');
      }
    } catch (error) {
      toast({
        title: "Sync failed",
        description: "Failed to sync data to cloud. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncFromCloud = async () => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to sync data from cloud.",
        variant: "destructive"
      });
      return;
    }

    setSyncing(true);
    try {
      const result = await CloudSyncService.loadFromCloud(user.id);
      
      if (result.success) {
        // Update local storage and app state
        SecureStorage.setItem("projects", result.projects);
        SecureStorage.setItem("payments", result.payments);
        onDataSync(result.projects, result.payments);
        
        toast({
          title: "Data loaded from cloud",
          description: `Loaded ${result.projects.length} projects and ${result.payments.length} payments.`,
        });
      } else {
        throw new Error('Failed to load from cloud');
      }
    } catch (error) {
      toast({
        title: "Load failed",
        description: "Failed to load data from cloud. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setCloudSyncEnabled(false);
    localStorage.setItem('cloudSyncEnabled', 'false');
    toast({
      title: "Signed out",
      description: "Cloud sync has been disabled.",
    });
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
              onCheckedChange={handleToggleCloudSync}
            />
          </div>

          {isAuthenticated && (
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <div className="text-sm text-slate-600">
                Signed in as: <span className="font-medium">{user?.email}</span>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSyncToCloud}
                  disabled={syncing || !cloudSyncEnabled}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {syncing ? "Syncing..." : "Backup to Cloud"}
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSyncFromCloud}
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
                onClick={handleSignOut}
                className="w-full border-red-300 text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          )}

          {!isAuthenticated && cloudSyncEnabled && (
            <div className="pt-4 border-t border-slate-200">
              <Button
                onClick={() => setShowAuthDialog(true)}
                className="w-full bg-slate-800 hover:bg-slate-700"
              >
                Sign In to Enable Cloud Sync
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="max-w-md">
          <ProtectedForm onVerified={handleCaptchaVerified} action="cloud-sync" className="mb-6">
            <AuthForm onAuthSuccess={handleAuthSuccess} captchaToken={captchaToken} />
          </ProtectedForm>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CloudSyncSettings;
