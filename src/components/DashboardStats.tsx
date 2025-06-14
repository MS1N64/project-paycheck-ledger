
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
      <Card className="border-slate-200 dark:border-slate-700 bg-[#F5F7FA] dark:bg-slate-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-xs sm:text-sm font-medium text-[#0A2C56] dark:text-slate-400">Total Projects</CardTitle>
          <Building className="h-3 w-3 sm:h-4 sm:w-4 text-[#0A2C56] dark:text-slate-400" />
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="text-lg sm:text-2xl font-bold text-[#0A2C56] dark:text-slate-200">{projects.length}</div>
          <p className="text-xs text-[#0A2C56]/70 dark:text-slate-400">{activeProjects} active</p>
        </CardContent>
      </Card>
      <Card className="border-slate-200 dark:border-slate-700 bg-[#F5F7FA] dark:bg-slate-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-xs sm:text-sm font-medium text-[#0A2C56] dark:text-slate-400">Total Value</CardTitle>
          <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-[#0A2C56] dark:text-slate-400" />
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="text-lg sm:text-2xl font-bold text-[#0A2C56] dark:text-slate-200">£{totalValue.toLocaleString()}</div>
          <p className="text-xs text-[#0A2C56]/70 dark:text-slate-400">Across all projects</p>
        </CardContent>
      </Card>
      <Card className="border-slate-200 dark:border-slate-700 bg-[#F5F7FA] dark:bg-slate-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-xs sm:text-sm font-medium text-[#0A2C56] dark:text-slate-400">Total Received</CardTitle>
          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-[#0A2C56] dark:text-slate-400" />
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="text-lg sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">£{totalReceived.toLocaleString()}</div>
          <p className="text-xs text-[#0A2C56]/70 dark:text-slate-400">
            {totalValue > 0 ? Math.round((totalReceived / totalValue) * 100) : 0}% of total
          </p>
        </CardContent>
      </Card>
      <Card className="border-slate-200 dark:border-slate-700 col-span-2 lg:col-span-1 bg-[#F5F7FA] dark:bg-slate-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-xs sm:text-sm font-medium text-[#0A2C56] dark:text-slate-400">Outstanding</CardTitle>
          <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-[#0A2C56] dark:text-slate-400" />
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="text-lg sm:text-2xl font-bold text-[#0A2C56] dark:text-amber-400">£{(totalValue - totalReceived).toLocaleString()}</div>
          <p className="text-xs text-[#0A2C56]/70 dark:text-slate-400">Remaining to collect</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
