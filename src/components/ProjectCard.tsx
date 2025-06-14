
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Eye, Trash2, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProjectCardProps {
  project: {
    id: string;
    address: string;
    totalReceived: number;
    totalRemaining: number;
    finalPrice: number;
    status: string;
    lastPayment: string;
  };
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const ProjectCard = ({ project, onView, onEdit, onDelete }: ProjectCardProps) => {
  const isMobile = useIsMobile();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
      case "In Progress": return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200";
      case "Pending": return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      default: return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200";
    }
  };

  const ActionsSection = () => {
    if (isMobile) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <DropdownMenuItem onClick={() => onView(project.id)} className="text-slate-700 dark:text-slate-300">
              <Eye className="h-4 w-4 mr-2" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(project.id)} className="text-slate-700 dark:text-slate-300">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(project.id)} className="text-red-600 dark:text-red-400">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          onClick={() => onView(project.id)}
        >
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          onClick={() => onEdit(project.id)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          onClick={() => onDelete(project.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
      <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 flex-1">
            {project.address}
          </CardTitle>
          <Badge className={`${getStatusColor(project.status)} text-xs flex-shrink-0`}>
            {project.status}
          </Badge>
        </div>
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
        <div className="pt-2">
          <ActionsSection />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
