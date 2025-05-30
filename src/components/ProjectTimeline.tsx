
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Circle } from "lucide-react";

interface TimelineItem {
  id: string;
  stage: string;
  description: string;
  status: "completed" | "current" | "pending";
  date?: string;
  amount?: number;
}

interface ProjectTimelineProps {
  projectId: string;
  milestones: TimelineItem[];
}

const ProjectTimeline = ({ projectId, milestones }: ProjectTimelineProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-5 w-5 text-emerald-600" />;
      case "current": return <Clock className="h-5 w-5 text-amber-600" />;
      default: return <Circle className="h-5 w-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-emerald-100 text-emerald-800";
      case "current": return "bg-amber-100 text-amber-800";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-slate-800">Project Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <div key={milestone.id} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                {getStatusIcon(milestone.status)}
                {index < milestones.length - 1 && (
                  <div className="w-px h-8 bg-slate-300 mt-2"></div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-800">{milestone.stage}</h4>
                  <Badge className={getStatusColor(milestone.status)}>
                    {milestone.status}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600">{milestone.description}</p>
                <div className="flex gap-4 text-xs text-slate-500">
                  {milestone.date && <span>Date: {milestone.date}</span>}
                  {milestone.amount && <span>Amount: £{milestone.amount.toLocaleString()}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectTimeline;
