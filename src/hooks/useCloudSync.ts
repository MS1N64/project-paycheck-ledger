
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { CloudSyncService } from "@/services/cloudSync";
import { Project, Payment } from "@/types";
import { SecureStorage } from "@/lib/dataIntegrity";

interface UseCloudSyncProps {
  projects: Project[];
  payments: Payment[];
  onDataSync: (projects: Project[], payments: Payment[]) => void;
}

export const useCloudSync = ({ projects, payments, onDataSync }: UseCloudSyncProps) => {
  const { toast } = useToast();
  const { user, isAuthenticated, signOut } = useAuth();
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const savedCloudSyncEnabled = localStorage.getItem('cloudSyncEnabled') === 'true';
    setCloudSyncEnabled(savedCloudSyncEnabled && isAuthenticated);
  }, [isAuthenticated]);

  const handleToggleCloudSync = async (enabled: boolean) => {
    if (enabled && !isAuthenticated) {
      return { requiresAuth: true };
    }

    if (enabled && isAuthenticated) {
      // Auto-sync when enabling
      await handleSyncToCloud();
    }

    setCloudSyncEnabled(enabled);
    localStorage.setItem('cloudSyncEnabled', enabled.toString());
    return { requiresAuth: false };
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

  const enableCloudSync = () => {
    setCloudSyncEnabled(true);
    localStorage.setItem('cloudSyncEnabled', 'true');
    
    toast({
      title: "Authentication successful",
      description: "Cloud sync is now enabled.",
    });

    // Auto-sync after successful authentication
    setTimeout(() => handleSyncToCloud(), 1000);
  };

  return {
    cloudSyncEnabled,
    syncing,
    isAuthenticated,
    user,
    handleToggleCloudSync,
    handleSyncToCloud,
    handleSyncFromCloud,
    handleSignOut,
    enableCloudSync
  };
};
