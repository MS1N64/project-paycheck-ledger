
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Eye, Trash2 } from "lucide-react";

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
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-emerald-100 text-emerald-800";
      case "In Progress": return "bg-slate-100 text-slate-800";
      case "Pending": return "bg-amber-100 text-amber-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-slate-800 line-clamp-2">
            {project.address}
          </CardTitle>
          <Badge className={getStatusColor(project.status)}>
            {project.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Total Received</p>
            <p className="font-semibold text-emerald-600">£{project.totalReceived.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-slate-500">Remaining</p>
            <p className="font-semibold text-amber-600">£{project.totalRemaining.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-slate-500">Final Price</p>
            <p className="font-semibold text-slate-800">£{project.finalPrice.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-slate-500">Last Payment</p>
            <p className="font-medium text-slate-700">{project.lastPayment}</p>
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-100"
            onClick={() => onView(project.id)}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-slate-300 text-slate-700 hover:bg-slate-100"
            onClick={() => onEdit(project.id)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-slate-300 text-slate-700 hover:bg-slate-100"
            onClick={() => onDelete(project.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
