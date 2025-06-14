import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { SecureStorage } from "@/lib/dataIntegrity";
import { ensureUniqueProjectId } from "@/lib/idGenerator";
import { Project, Payment } from "@/types";
import { ToastVariant } from "@/types/toast";

interface UseProjectOperationsProps {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  setAllPayments: (payments: Payment[]) => void;
}

export const useProjectOperations = ({
  projects,
  setProjects,
  setAllPayments
}: UseProjectOperationsProps) => {
  const { toast } = useToast();
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

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

  const handleShowProjectForm = () => {
    setShowProjectForm(true);
  };

  const handleCancelProjectForm = () => {
    setShowProjectForm(false);
    setEditingProject(null);
  };

  return {
    editingProject,
    showProjectForm,
    projectToDelete,
    setProjectToDelete,
    handleCreateProject,
    handleEditProject,
    handleDeleteProject,
    confirmDeleteProject,
    handleRestoreProject,
    handlePermanentDelete,
    handleShowProjectForm,
    handleCancelProjectForm
  };
};
