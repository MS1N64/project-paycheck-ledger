
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProjectForm from "@/components/ProjectForm";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardStats from "@/components/DashboardStats";
import DashboardSidebar from "@/components/DashboardSidebar";
import ProjectGrid from "@/components/ProjectGrid";
import { useToast } from "@/hooks/use-toast";
import { SecureStorage } from "@/lib/dataIntegrity";
import { Project, Payment, FilterState } from "@/types";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [allPayments, setAllPayments] = useState<Payment[]>([]);

  useEffect(() => {
    try {
      const savedProjects = SecureStorage.getItem<Project[]>("projects") || [];
      const savedPayments = SecureStorage.getItem<Payment[]>("payments") || [];
      setProjects(savedProjects);
      setFilteredProjects(savedProjects);
      setAllPayments(savedPayments);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: "Data Load Error",
        description: "Some data could not be loaded. Please check data integrity.",
        variant: "destructive"
      });
    }
  }, [toast]);

  const handleFilterChange = (filters: FilterState) => {
    let filtered = [...projects];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(project =>
        project.address.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.clientName?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Status filter
    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter(project => project.status === filters.status);
    }

    // Amount filters
    if (filters.minAmount) {
      filtered = filtered.filter(project => project.finalPrice >= parseFloat(filters.minAmount));
    }
    if (filters.maxAmount) {
      filtered = filtered.filter(project => project.finalPrice <= parseFloat(filters.maxAmount));
    }

    // Date filters
    if (filters.dateFrom || filters.dateTo) {
      filtered = filtered.filter(project => {
        const projectDate = new Date(project.createdAt);
        const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
        const toDate = filters.dateTo ? new Date(filters.dateTo) : null;
        
        if (fromDate && projectDate < fromDate) return false;
        if (toDate && projectDate > toDate) return false;
        return true;
      });
    }

    setFilteredProjects(filtered);
  };

  const handleCreateProject = (project: Project) => {
    try {
      const updatedProjects = editingProject 
        ? projects.map(p => p.id === editingProject.id ? project : p)
        : [...projects, project];
      
      setProjects(updatedProjects);
      setFilteredProjects(updatedProjects);
      SecureStorage.setItem("projects", updatedProjects);
      setShowProjectForm(false);
      setEditingProject(null);
      
      toast({
        title: editingProject ? "Project Updated" : "Project Created",
        description: `${project.address} has been ${editingProject ? "updated" : "created"} successfully.`,
      });
    } catch (error) {
      toast({
        title: "Save Error",
        description: "Failed to save project. Please try again.",
        variant: "destructive"
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
    try {
      const updatedProjects = projects.filter(p => p.id !== id);
      setProjects(updatedProjects);
      setFilteredProjects(updatedProjects);
      SecureStorage.setItem("projects", updatedProjects);
      
      // Also remove related payments
      const payments = SecureStorage.getItem<Payment[]>("payments") || [];
      const updatedPayments = payments.filter((p: Payment) => p.projectId !== id);
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
        variant: "destructive"
      });
    }
  };

  const handleViewProject = (id: string) => {
    navigate(`/project/${id}`);
  };

  const handleShowProjectForm = () => {
    setShowProjectForm(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <DashboardHeader onCreateProject={handleShowProjectForm} />

        <DashboardStats projects={projects} />

        <DashboardSidebar 
          projects={projects}
          allPayments={allPayments}
          onFilterChange={handleFilterChange}
        />

        {showProjectForm && (
          <div className="mb-8">
            <ProjectForm
              onSubmit={handleCreateProject}
              onCancel={() => {
                setShowProjectForm(false);
                setEditingProject(null);
              }}
              initialData={editingProject}
            />
          </div>
        )}

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
