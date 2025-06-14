import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProjectForm from "@/components/ProjectForm";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardStats from "@/components/DashboardStats";
import DashboardSidebar from "@/components/DashboardSidebar";
import ProjectGrid from "@/components/ProjectGrid";
import CloudSyncSettings from "@/components/CloudSyncSettings";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useProjectFilter } from "@/hooks/useProjectFilter";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { SecureStorage } from "@/lib/dataIntegrity";
import { ensureUniqueProjectId } from "@/lib/idGenerator";
import { Project, Payment } from "@/types";
import { ToastVariant } from "@/types/toast";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  // Filter active projects only for the main grid
  const activeProjects = projects.filter(p => !p.deletedAt);
  
  // Use the custom hook for filtering active projects only
  const { filteredProjects, handleFilterChange } = useProjectFilter(activeProjects);

  // Set up real-time sync for projects and payments
  useRealtimeSync({
    onProjectsUpdate: setProjects,
    onPaymentsUpdate: setAllPayments,
    enabled: true
  });

  useEffect(() => {
    try {
      const savedProjects = SecureStorage.getItem<Project[]>("projects") || [];
      const savedPayments = SecureStorage.getItem<Payment[]>("payments") || [];
      setProjects(savedProjects);
      setAllPayments(savedPayments);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: "Data Load Error",
        description: "Some data could not be loaded. Please check data integrity.",
        variant: ToastVariant.DESTRUCTIVE
      });
    }
  }, [toast]);

  const handleCreateProject = (project: Project) => {
    let updatedProjects;
    let optimisticProject = project;
    
    if (editingProject) {
      // For editing, keep the existing ID
      updatedProjects = projects.map(p => p.id === editingProject.id ? project : p);
    } else {
      // For new projects, ensure unique ID to prevent collisions
      const uniqueId = ensureUniqueProjectId(projects, project.id);
      optimisticProject = { ...project, id: uniqueId };
      updatedProjects = [...projects, optimisticProject];
      
      console.log(`Creating new project with unique ID: ${uniqueId}`);
    }
    
    // Optimistic UI update - immediately update the UI state
    setProjects(updatedProjects);
    setShowProjectForm(false);
    setEditingProject(null);
    
    // Show immediate success feedback
    toast({
      title: editingProject ? "Project Updated" : "Project Created",
      description: `${project.address} has been ${editingProject ? "updated" : "created"} successfully.`,
    });
    
    // Attempt to save to storage in the background
    try {
      SecureStorage.setItem("projects", updatedProjects);
    } catch (error) {
      console.error('Failed to save project:', error);
      
      // Revert optimistic update on failure
      setProjects(projects);
      
      toast({
        title: "Save Error",
        description: "Failed to save project. Changes have been reverted.",
        variant: ToastVariant.DESTRUCTIVE
      });
    }
  };

  const handleEditProject = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      setEditingProject(project);
      setShowProjectForm(true);
    }
  };

  const handleDeleteProject = (id: string) => {
    setProjectToDelete(id);
  };

  const confirmDeleteProject = () => {
    if (!projectToDelete) return;
    
    try {
      // Soft delete: set deletedAt timestamp instead of removing
      const updatedProjects = projects.map(p => 
        p.id === projectToDelete 
          ? { ...p, deletedAt: new Date().toISOString() }
          : p
      );
      setProjects(updatedProjects);
      SecureStorage.setItem("projects", updatedProjects);
      
      toast({
        title: "Project Moved to Recycle Bin",
        description: "Project has been moved to the recycle bin and can be restored.",
      });
    } catch (error) {
      toast({
        title: "Delete Error",
        description: "Failed to delete project. Please try again.",
        variant: ToastVariant.DESTRUCTIVE
      });
    } finally {
      setProjectToDelete(null);
    }
  };

  const handleRestoreProject = (id: string) => {
    try {
      const updatedProjects = projects.map(p => 
        p.id === id 
          ? { ...p, deletedAt: undefined }
          : p
      );
      setProjects(updatedProjects);
      SecureStorage.setItem("projects", updatedProjects);
      
      toast({
        title: "Project Restored",
        description: "Project has been successfully restored from the recycle bin.",
      });
    } catch (error) {
      toast({
        title: "Restore Error",
        description: "Failed to restore project. Please try again.",
        variant: ToastVariant.DESTRUCTIVE
      });
    }
  };

  const handlePermanentDelete = (id: string) => {
    try {
      const updatedProjects = projects.filter(p => p.id !== id);
      setProjects(updatedProjects);
      SecureStorage.setItem("projects", updatedProjects);
      
      // Also remove related payments
      const payments = SecureStorage.getItem<Payment[]>("payments") || [];
      const updatedPayments = payments.filter((p: Payment) => p.projectId !== id);
      SecureStorage.setItem("payments", updatedPayments);
      setAllPayments(updatedPayments);
      
      toast({
        title: "Project Permanently Deleted",
        description: "Project and all related payments have been permanently removed.",
      });
    } catch (error) {
      toast({
        title: "Delete Error",
        description: "Failed to permanently delete project. Please try again.",
        variant: ToastVariant.DESTRUCTIVE
      });
    }
  };

  const handleViewProject = (id: string) => {
    navigate(`/project/${id}`);
  };

  const handleShowProjectForm = () => {
    setShowProjectForm(true);
  };

  const projectToDeleteData = activeProjects.find(p => p.id === projectToDelete);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <DashboardHeader onCreateProject={handleShowProjectForm} />

        <DashboardStats projects={activeProjects} />

        <DashboardSidebar 
          projects={projects}
          allPayments={allPayments}
          onFilterChange={handleFilterChange}
          onRestoreProject={handleRestoreProject}
          onPermanentDelete={handlePermanentDelete}
        />

        <Dialog open={showProjectForm} onOpenChange={setShowProjectForm}>
          <DialogContent className="max-w-4xl max-h-[95vh] w-[95vw] sm:w-full overflow-y-auto p-3 sm:p-6">
            <ProjectForm
              onSubmit={handleCreateProject}
              onCancel={() => {
                setShowProjectForm(false);
                setEditingProject(null);
              }}
              initialData={editingProject}
            />
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!projectToDelete} onOpenChange={() => setProjectToDelete(null)}>
          <AlertDialogContent className="w-[95vw] max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Move to Recycle Bin</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to move "{projectToDeleteData?.address}" to the recycle bin? 
                You can restore it later from the recycle bin.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDeleteProject}
                className="w-full sm:w-auto bg-amber-600 text-white hover:bg-amber-700"
              >
                Move to Recycle Bin
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <ProjectGrid
          filteredProjects={filteredProjects}
          projects={activeProjects}
          onViewProject={handleViewProject}
          onEditProject={handleEditProject}
          onDeleteProject={handleDeleteProject}
          onCreateProject={handleShowProjectForm}
        />
      </div>
    </div>
  );
};

export default Index;
