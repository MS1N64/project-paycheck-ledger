
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ProjectForm from "@/components/ProjectForm";
import { Project } from "@/types";

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingProject: Project | null;
  onSubmit: (project: Project) => void;
  onCancel: () => void;
}

const ProjectFormDialog = ({
  open,
  onOpenChange,
  editingProject,
  onSubmit,
  onCancel
}: ProjectFormDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] w-[95vw] sm:w-full overflow-y-auto p-3 sm:p-6 bg-white border-slate-grey/20">
        <ProjectForm
          onSubmit={onSubmit}
          onCancel={onCancel}
          initialData={editingProject}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ProjectFormDialog;
