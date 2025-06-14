
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
import { Project } from "@/types";

interface DeleteProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | undefined;
  onConfirm: () => void;
}

const DeleteProjectDialog = ({
  open,
  onOpenChange,
  project,
  onConfirm
}: DeleteProjectDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[95vw] max-w-md bg-white border-slate-grey/20">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-slate-grey font-inter">Move to Recycle Bin</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-grey/70 font-roboto">
            Are you sure you want to move "{project?.address}" to the recycle bin? 
            You can restore it later from the recycle bin.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel className="w-full sm:w-auto border-slate-grey/30 text-slate-grey hover:bg-slate-grey/10">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Move to Recycle Bin
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteProjectDialog;
