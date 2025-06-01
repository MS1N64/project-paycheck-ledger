
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, TrendingUp, DollarSign } from "lucide-react";
import { Project } from "@/types";

interface DashboardStatsProps {
  projects: Project[];
}

const DashboardStats = ({ projects }: DashboardStatsProps) => {
  const totalValue = projects.reduce((sum, project) => sum + project.finalPrice, 0);
  const totalReceived = projects.reduce((sum, project) => sum + project.totalReceived, 0);
  const activeProjects = projects.filter(p => p.status !== "Completed").length;

  return (
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
  );
};

export default DashboardStats;
