
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

  // Use the custom hook for filtering
  const { filteredProjects, handleFilterChange } = useProjectFilter(projects);

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
      const updatedProjects = projects.filter(p => p.id !== projectToDelete);
      setProjects(updatedProjects);
      SecureStorage.setItem("projects", updatedProjects);
      
      // Also remove related payments
      const payments = SecureStorage.getItem<Payment[]>("payments") || [];
      const updatedPayments = payments.filter((p: Payment) => p.projectId !== projectToDelete);
      SecureStorage.setItem("payments", updatedPayments);
      setAllPayments(updatedPayments);
      
      toast({
        title: "Project Deleted",
        description: "Project and all related payments have been removed.",
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

  const handleViewProject = (id: string) => {
    navigate(`/project/${id}`);
  };

  const handleShowProjectForm = () => {
    setShowProjectForm(true);
  };

  const projectToDeleteData = projects.find(p => p.id === projectToDelete);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <DashboardHeader onCreateProject={handleShowProjectForm} />

        <DashboardStats projects={projects} />

        <DashboardSidebar 
          projects={projects}
          allPayments={allPayments}
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
              <AlertDialogTitle>Delete Project</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{projectToDeleteData?.address}"? 
                This action cannot be undone and will also remove all related payments.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDeleteProject}
                className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Project
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <ProjectGrid
          filteredProjects={filteredProjects}
          projects={projects}
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
