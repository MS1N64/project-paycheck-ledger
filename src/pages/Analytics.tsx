
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, PieChart, BarChart3 } from "lucide-react";
import { SecureStorage } from "@/lib/dataIntegrity";
import { Project, Payment } from "@/types";
import MonthlyIncomeChart from "@/components/analytics/MonthlyIncomeChart";
import PaymentMethodChart from "@/components/analytics/PaymentMethodChart";
import OutstandingDebtChart from "@/components/analytics/OutstandingDebtChart";
import ProjectStatusChart from "@/components/analytics/ProjectStatusChart";

const Analytics = () => {
  const navigate = useNavigate();
  const [projects] = useState<Project[]>(() => {
    try {
      return SecureStorage.getItem<Project[]>("projects") || [];
    } catch (error) {
      console.error('Failed to load projects:', error);
      return [];
    }
  });
  
  const [payments] = useState<Payment[]>(() => {
    try {
      return SecureStorage.getItem<Payment[]>("payments") || [];
    } catch (error) {
      console.error('Failed to load payments:', error);
      return [];
    }
  });

  const analytics = useMemo(() => {
    const totalValue = projects.reduce((sum, project) => sum + project.finalPrice, 0);
    const totalReceived = projects.reduce((sum, project) => sum + project.totalReceived, 0);
    const totalOutstanding = totalValue - totalReceived;
    const totalPayments = payments.length;

    return {
      totalValue,
      totalReceived,
      totalOutstanding,
      totalPayments
    };
  }, [projects, payments]);

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="mb-4 border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Charts & Analytics</h1>
            <p className="text-slate-600">Visualize your project performance and financial data</p>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total Projects</CardTitle>
                <BarChart3 className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-800">{projects.length}</div>
              </CardContent>
            </Card>
            
            <Card className="border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total Received</CardTitle>
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">£{analytics.totalReceived.toLocaleString()}</div>
              </CardContent>
            </Card>
            
            <Card className="border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Outstanding</CardTitle>
                <PieChart className="h-4 w-4 text-amber-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">£{analytics.totalOutstanding.toLocaleString()}</div>
              </CardContent>
            </Card>
            
            <Card className="border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total Payments</CardTitle>
                <BarChart3 className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{analytics.totalPayments}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <MonthlyIncomeChart payments={payments} />
          <PaymentMethodChart payments={payments} />
          <OutstandingDebtChart projects={projects} />
          <ProjectStatusChart projects={projects} />
        </div>
      </div>
    </div>
  );
};

export default Analytics;
