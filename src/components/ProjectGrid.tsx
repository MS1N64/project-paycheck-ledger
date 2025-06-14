
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Building } from "lucide-react";
import ProjectCard from "@/components/ProjectCard";
import { Project } from "@/types";

interface ProjectGridProps {
  filteredProjects: Project[];
  projects: Project[];
  onViewProject: (id: string) => void;
  onEditProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onCreateProject: () => void;
}

const ProjectGrid = ({ 
  filteredProjects, 
  projects, 
  onViewProject, 
  onEditProject, 
  onDeleteProject, 
  onCreateProject 
}: ProjectGridProps) => {
  if (filteredProjects.length === 0) {
    return (
      <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <CardContent className="text-center py-8 sm:py-12 px-4">
          <Building className="h-12 w-12 sm:h-16 sm:w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
            {projects.length === 0 ? "No projects yet" : "No projects match your filters"}
          </h3>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4 sm:mb-6">
            {projects.length === 0 
              ? "Get started by creating your first property project"
              : "Try adjusting your search criteria"
            }
          </p>
          {projects.length === 0 && (
            <Button 
              onClick={onCreateProject} 
              className="bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Project
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {filteredProjects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onView={onViewProject}
          onEdit={onEditProject}
          onDelete={onDeleteProject}
        />
      ))}
    </div>
  );
};

export default ProjectGrid;
