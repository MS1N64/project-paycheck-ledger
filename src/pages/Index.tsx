
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Building, TrendingUp, DollarSign } from "lucide-react";
import ProjectCard from "@/components/ProjectCard";
import ProjectForm from "@/components/ProjectForm";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projects, setProjects] = useState<any[]>([]);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);

  useEffect(() => {
    const savedProjects = JSON.parse(localStorage.getItem("projects") || "[]");
    setProjects(savedProjects);
  }, []);

  const handleCreateProject = (project: any) => {
    const updatedProjects = editingProject 
      ? projects.map(p => p.id === editingProject.id ? project : p)
      : [...projects, project];
    
    setProjects(updatedProjects);
    localStorage.setItem("projects", JSON.stringify(updatedProjects));
    setShowProjectForm(false);
    setEditingProject(null);
    
    toast({
      title: editingProject ? "Project Updated" : "Project Created",
      description: `${project.address} has been ${editingProject ? "updated" : "created"} successfully.`,
    });
  };

  const handleEditProject = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      setEditingProject(project);
      setShowProjectForm(true);
    }
  };

  const handleDeleteProject = (id: string) => {
    const updatedProjects = projects.filter(p => p.id !== id);
    setProjects(updatedProjects);
    localStorage.setItem("projects", JSON.stringify(updatedProjects));
    
    // Also remove related payments
    const payments = JSON.parse(localStorage.getItem("payments") || "[]");
    const updatedPayments = payments.filter((p: any) => p.projectId !== id);
    localStorage.setItem("payments", JSON.stringify(updatedPayments));
    
    toast({
      title: "Project Deleted",
      description: "Project and all related payments have been removed.",
    });
  };

  const handleViewProject = (id: string) => {
    navigate(`/project/${id}`);
  };

  const totalValue = projects.reduce((sum, project) => sum + project.finalPrice, 0);
  const totalReceived = projects.reduce((sum, project) => sum + project.totalReceived, 0);
  const activeProjects = projects.filter(p => p.status !== "Completed").length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-6">
            <img 
              src="/lovable-uploads/7d3f7b33-caa8-4493-8e10-edf7a631b0e2.png" 
              alt="DASS & SONS" 
              className="h-16 w-auto"
            />
            <div>
              <h1 className="text-4xl font-bold text-slate-800 mb-2">Project Payment Tracker</h1>
              <p className="text-slate-600">Manage and track payments for all your property projects</p>
            </div>
          </div>
          <Button onClick={() => setShowProjectForm(true)} size="lg" className="bg-slate-800 hover:bg-slate-700">
            <Plus className="h-5 w-5 mr-2" />
            New Project
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Projects</CardTitle>
              <Building className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{projects.length}</div>
              <p className="text-xs text-slate-500">{activeProjects} active</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">£{totalValue.toLocaleString()}</div>
              <p className="text-xs text-slate-500">Across all projects</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Received</CardTitle>
              <TrendingUp className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">£{totalReceived.toLocaleString()}</div>
              <p className="text-xs text-slate-500">
                {totalValue > 0 ? Math.round((totalReceived / totalValue) * 100) : 0}% of total
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Outstanding</CardTitle>
              <DollarSign className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">£{(totalValue - totalReceived).toLocaleString()}</div>
              <p className="text-xs text-slate-500">Remaining to collect</p>
            </CardContent>
          </Card>
        </div>

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

        {projects.length === 0 ? (
          <Card className="border-slate-200">
            <CardContent className="text-center py-12">
              <Building className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No projects yet</h3>
              <p className="text-slate-600 mb-6">Get started by creating your first property project</p>
              <Button onClick={() => setShowProjectForm(true)} className="bg-slate-800 hover:bg-slate-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onView={handleViewProject}
                onEdit={handleEditProject}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
