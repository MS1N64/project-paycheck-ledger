
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardStats from "@/components/DashboardStats";
import DashboardSidebar from "@/components/DashboardSidebar";
import ProjectGrid from "@/components/ProjectGrid";
import ProjectFormDialog from "@/components/ProjectFormDialog";
import DeleteProjectDialog from "@/components/DeleteProjectDialog";
import { useToast } from "@/hooks/use-toast";
import { useProjectFilter } from "@/hooks/useProjectFilter";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { useProjectOperations } from "@/hooks/useProjectOperations";
import { SecureStorage } from "@/lib/dataIntegrity";
import { Project, Payment } from "@/types";
import { ToastVariant } from "@/types/toast";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [allPayments, setAllPayments] = useState<Payment[]>([]);

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

  // Use the custom hook for project operations
  const {
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
  } = useProjectOperations({
    projects,
    setProjects,
    setAllPayments
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

  const handleViewProject = (id: string) => {
    navigate(`/project/${id}`);
  };

  const handleProjectFormOpenChange = (open: boolean) => {
    if (!open) {
      handleCancelProjectForm();
    }
  };

  const projectToDeleteData = activeProjects.find(p => p.id === projectToDelete);

  return (
    <div className="min-h-screen bg-soft-white dark:bg-slate-900">
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

        <ProjectFormDialog
          open={showProjectForm}
          onOpenChange={handleProjectFormOpenChange}
          editingProject={editingProject}
          onSubmit={handleCreateProject}
          onCancel={handleCancelProjectForm}
        />

        <DeleteProjectDialog
          open={!!projectToDelete}
          onOpenChange={() => setProjectToDelete(null)}
          project={projectToDeleteData}
          onConfirm={confirmDeleteProject}
        />

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
