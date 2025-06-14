import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ProjectForm from "@/components/ProjectForm";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardStats from "@/components/DashboardStats";
import DashboardSidebar from "@/components/DashboardSidebar";
import ProjectGrid from "@/components/ProjectGrid";
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
import { SecureStorage } from "@/lib/dataIntegrity";
import { ensureUniqueProjectId } from "@/lib/idGenerator";
import { Project, Payment, FilterState } from "@/types";

// Debounce utility function
const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<FilterState>({
    search: "",
    status: "all",
    minAmount: "",
    maxAmount: "",
    dateFrom: "",
    dateTo: ""
  });

  // Cache for filtered results
  const [filterCache, setFilterCache] = useState<Map<string, Project[]>>(new Map());

  // Debounce the filter changes to avoid excessive filtering
  const debouncedFilters = useDebounce(currentFilters, 300);

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

  // Memoized filter function for better performance
  const applyFilters = useCallback((projects: Project[], filters: FilterState): Project[] => {
    // Create cache key from filters
    const cacheKey = JSON.stringify(filters);
    
    // Check if we have cached results
    if (filterCache.has(cacheKey)) {
      console.log('Using cached filter results');
      return filterCache.get(cacheKey)!;
    }

    console.log('Computing new filter results');
    let filtered = [...projects];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(project =>
        project.address.toLowerCase().includes(searchLower) ||
        project.clientName?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter(project => project.status === filters.status);
    }

    // Amount filters
    if (filters.minAmount) {
      const minAmount = parseFloat(filters.minAmount);
      filtered = filtered.filter(project => project.finalPrice >= minAmount);
    }
    if (filters.maxAmount) {
      const maxAmount = parseFloat(filters.maxAmount);
      filtered = filtered.filter(project => project.finalPrice <= maxAmount);
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

    // Cache the result
    const newCache = new Map(filterCache);
    newCache.set(cacheKey, filtered);
    
    // Limit cache size to prevent memory issues
    if (newCache.size > 10) {
      const firstKey = newCache.keys().next().value;
      newCache.delete(firstKey);
    }
    
    setFilterCache(newCache);
    return filtered;
  }, [filterCache]);

  // Apply filters when debounced filters or projects change
  useEffect(() => {
    const filtered = applyFilters(projects, debouncedFilters);
    setFilteredProjects(filtered);
  }, [projects, debouncedFilters, applyFilters]);

  // Clear cache when projects change significantly
  useEffect(() => {
    setFilterCache(new Map());
  }, [projects.length]);

  const handleFilterChange = useCallback((filters: FilterState) => {
    setCurrentFilters(filters);
  }, []);

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
    setFilteredProjects(updatedProjects);
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
      setFilteredProjects(projects);
      
      toast({
        title: "Save Error",
        description: "Failed to save project. Changes have been reverted.",
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
    setProjectToDelete(id);
  };

  const confirmDeleteProject = () => {
    if (!projectToDelete) return;
    
    try {
      const updatedProjects = projects.filter(p => p.id !== projectToDelete);
      setProjects(updatedProjects);
      setFilteredProjects(updatedProjects);
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
        variant: "destructive"
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
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <DashboardHeader onCreateProject={handleShowProjectForm} />

        <DashboardStats projects={projects} />

        <DashboardSidebar 
          projects={projects}
          allPayments={allPayments}
          onFilterChange={handleFilterChange}
        />

        <Dialog open={showProjectForm} onOpenChange={setShowProjectForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Project</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{projectToDeleteData?.address}"? 
                This action cannot be undone and will also remove all related payments.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDeleteProject}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
