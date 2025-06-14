
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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
          <Building className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="text-lg sm:text-2xl font-bold text-card-foreground">{projects.length}</div>
          <p className="text-xs text-muted-foreground">{activeProjects} active</p>
        </CardContent>
      </Card>
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Value</CardTitle>
          <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="text-lg sm:text-2xl font-bold text-card-foreground">£{totalValue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Across all projects</p>
        </CardContent>
      </Card>
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Received</CardTitle>
          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">£{totalReceived.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {totalValue > 0 ? Math.round((totalReceived / totalValue) * 100) : 0}% of total
          </p>
        </CardContent>
      </Card>
      <Card className="border-border col-span-2 lg:col-span-1 bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Outstanding</CardTitle>
          <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="text-lg sm:text-2xl font-bold text-primary">£{(totalValue - totalReceived).toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Remaining to collect</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
