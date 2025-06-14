
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Trash2 } from "lucide-react";
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

interface RecycleBinProps {
  deletedProjects: Project[];
  onRestoreProject: (id: string) => void;
  onPermanentDelete: (id: string) => void;
}

const RecycleBin = ({ deletedProjects, onRestoreProject, onPermanentDelete }: RecycleBinProps) => {
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
      case "In Progress": return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200";
      case "Pending": return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      default: return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200";
    }
  };

  const formatDeletedDate = (deletedAt: string) => {
    return new Date(deletedAt).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const projectToDeleteData = deletedProjects.find(p => p.id === projectToDelete);

  if (deletedProjects.length === 0) {
    return (
      <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <CardContent className="text-center py-8 sm:py-12 px-4">
          <RotateCcw className="h-12 w-12 sm:h-16 sm:w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
            Recycle bin is empty
          </h3>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Deleted projects will appear here and can be restored for 30 days
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {deletedProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow duration-200 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 opacity-75">
            <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 flex-1">
                  {project.address}
                </CardTitle>
                <Badge className={`${getStatusColor(project.status)} text-xs flex-shrink-0`}>
                  {project.status}
                </Badge>
              </div>
              {project.deletedAt && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Deleted: {formatDeletedDate(project.deletedAt)}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Total Received</p>
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400 text-sm sm:text-base">£{project.totalReceived.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Remaining</p>
                  <p className="font-semibold text-amber-600 dark:text-amber-400 text-sm sm:text-base">£{project.totalRemaining.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Final Price</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm sm:text-base">£{project.finalPrice.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Last Payment</p>
                  <p className="font-medium text-slate-700 dark:text-slate-300 text-xs sm:text-sm truncate">{project.lastPayment}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-emerald-300 dark:border-emerald-600 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-800"
                  onClick={() => onRestoreProject(project.id)}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Restore
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-800"
                  onClick={() => setProjectToDelete(project.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!projectToDelete} onOpenChange={() => setProjectToDelete(null)}>
        <AlertDialogContent className="w-[95vw] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete "{projectToDeleteData?.address}"? 
              This action cannot be undone and will permanently remove the project and all related data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (projectToDelete) {
                  onPermanentDelete(projectToDelete);
                  setProjectToDelete(null);
                }
              }}
              className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default RecycleBin;
