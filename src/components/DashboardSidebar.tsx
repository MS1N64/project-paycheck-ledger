
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BarChart3, Search, Trash2, Users, Database, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import RecycleBin from "./RecycleBin";
import SearchFilter from "./SearchFilter";
import TaxReporting from "./TaxReporting";
import { Project, Payment, FilterState } from "@/types";

interface DashboardSidebarProps {
  projects: Project[];
  allPayments: Payment[];
  onFilterChange?: (filters: FilterState) => void;
  onRestoreProject?: (id: string) => void;
  onPermanentDelete?: (id: string) => void;
}

const DashboardSidebar = ({ 
  projects, 
  allPayments, 
  onFilterChange,
  onRestoreProject,
  onPermanentDelete
}: DashboardSidebarProps) => {
  const navigate = useNavigate();
  const [showRecycleBin, setShowRecycleBin] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showTaxReporting, setShowTaxReporting] = useState(false);

  // Filter out deleted projects for active count and get deleted projects for recycle bin
  const activeProjects = projects.filter(p => !p.deletedAt);
  const deletedProjects = projects.filter(p => p.deletedAt);

  const stats = [
    {
      title: "Active Projects",
      value: activeProjects.length,
      description: "Currently active",
      icon: BarChart3,
      color: "text-blue-600 dark:text-blue-400"
    },
    {
      title: "Total Payments",
      value: allPayments.length,
      description: "Recorded payments",
      icon: Database,
      color: "text-emerald-600 dark:text-emerald-400"
    },
    {
      title: "Recycle Bin",
      value: deletedProjects.length,
      description: "Deleted projects",
      icon: Trash2,
      color: "text-amber-600 dark:text-amber-400",
      onClick: () => setShowRecycleBin(true)
    }
  ];

  const quickActions = [
    {
      label: "Search & Filter",
      icon: Search,
      onClick: () => setShowSearch(true),
      description: "Advanced search"
    },
    {
      label: "Analytics",
      icon: BarChart3,
      onClick: () => navigate("/analytics"),
      description: "View insights"
    },
    {
      label: "Client Summary",
      icon: Users,
      onClick: () => navigate("/clients"),
      description: "Manage clients"
    },
    {
      label: "Tax Reporting",
      icon: Settings,
      onClick: () => setShowTaxReporting(true),
      description: "Generate reports"
    }
  ];

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Stats Cards */}
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {stats.map((stat, index) => (
              <Card 
                key={index} 
                className={`border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 ${
                  stat.onClick ? 'cursor-pointer hover:shadow-lg transition-shadow duration-200' : ''
                }`}
                onClick={stat.onClick}
              >
                <CardContent className="p-3 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                        {stat.title}
                      </p>
                      <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200">
                        {stat.value}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {stat.description}
                      </p>
                    </div>
                    <stat.icon className={`h-6 w-6 sm:h-8 sm:w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-4">
          <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <CardHeader className="pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-base sm:text-lg text-slate-800 dark:text-slate-200">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 px-3 sm:px-6 pb-3 sm:pb-6">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  onClick={action.onClick}
                  className="w-full justify-start text-left h-auto py-2 px-2 sm:px-3 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <action.icon className="h-4 w-4 mr-2 sm:mr-3 text-slate-600 dark:text-slate-400" />
                  <div className="flex-1">
                    <div className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                      {action.label}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {action.description}
                    </div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recycle Bin Dialog */}
      <Dialog open={showRecycleBin} onOpenChange={setShowRecycleBin}>
        <DialogContent className="max-w-6xl max-h-[95vh] w-[95vw] sm:w-full overflow-y-auto p-3 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-amber-600" />
              Recycle Bin ({deletedProjects.length})
            </DialogTitle>
          </DialogHeader>
          <RecycleBin 
            deletedProjects={deletedProjects}
            onRestoreProject={onRestoreProject || (() => {})}
            onPermanentDelete={onPermanentDelete || (() => {})}
          />
        </DialogContent>
      </Dialog>

      {/* Search Dialog */}
      <Dialog open={showSearch} onOpenChange={setShowSearch}>
        <DialogContent className="max-w-4xl max-h-[95vh] w-[95vw] sm:w-full overflow-y-auto p-3 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search & Filter Projects
            </DialogTitle>
          </DialogHeader>
          <SearchFilter onFilterChange={onFilterChange || (() => {})} />
        </DialogContent>
      </Dialog>

      {/* Tax Reporting Dialog */}
      <Dialog open={showTaxReporting} onOpenChange={setShowTaxReporting}>
        <DialogContent className="max-w-4xl max-h-[95vh] w-[95vw] sm:w-full overflow-y-auto p-3 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Tax Reporting
            </DialogTitle>
          </DialogHeader>
          <TaxReporting projects={activeProjects} payments={allPayments} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DashboardSidebar;
