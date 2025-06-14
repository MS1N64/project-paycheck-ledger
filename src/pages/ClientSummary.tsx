
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, ArrowLeft, Users } from "lucide-react";
import { SecureStorage } from "@/lib/dataIntegrity";
import { Project, Payment } from "@/types";

interface ClientSummaryData {
  clientName: string;
  clientEmail?: string;
  projectCount: number;
  totalReceived: number;
  totalOutstanding: number;
  lastPaymentDate: string;
  projects: Project[];
}

const ClientSummary = () => {
  const navigate = useNavigate();
  const [clientSummaries, setClientSummaries] = useState<ClientSummaryData[]>([]);

  useEffect(() => {
    const projects = SecureStorage.getItem<Project[]>("projects") || [];
    const payments = SecureStorage.getItem<Payment[]>("payments") || [];

    // Group projects by client
    const clientMap = new Map<string, ClientSummaryData>();

    projects.forEach(project => {
      const clientKey = project.clientName || "Unknown Client";
      
      if (!clientMap.has(clientKey)) {
        clientMap.set(clientKey, {
          clientName: clientKey,
          clientEmail: project.clientEmail,
          projectCount: 0,
          totalReceived: 0,
          totalOutstanding: 0,
          lastPaymentDate: "Never",
          projects: []
        });
      }

      const clientData = clientMap.get(clientKey)!;
      clientData.projectCount++;
      clientData.totalReceived += project.totalReceived;
      clientData.totalOutstanding += project.totalRemaining;
      clientData.projects.push(project);

      // Find last payment date for this client
      const clientPayments = payments.filter(p => 
        clientData.projects.some(proj => proj.id === p.projectId)
      );
      
      if (clientPayments.length > 0) {
        const lastPayment = clientPayments.reduce((latest, current) => 
          new Date(current.date) > new Date(latest.date) ? current : latest
        );
        clientData.lastPaymentDate = new Date(lastPayment.date).toLocaleDateString();
      }
    });

    setClientSummaries(Array.from(clientMap.values()));
  }, []);

  const handleViewClient = (clientName: string) => {
    // Navigate to search page with client filter
    navigate(`/search?client=${encodeURIComponent(clientName)}`);
  };

  const getTotalValue = (summary: ClientSummaryData) => {
    return summary.totalReceived + summary.totalOutstanding;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 w-full sm:w-auto"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="w-full sm:w-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200">Client Summary</h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">Overview of all clients and their projects</p>
          </div>
        </div>

        {clientSummaries.length === 0 ? (
          <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <CardContent className="text-center py-8 sm:py-12 px-4">
              <Users className="h-12 w-12 sm:h-16 sm:w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">No clients found</h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4 sm:mb-6">Create some projects with client information to see summaries here</p>
              <Button 
                onClick={() => navigate("/")} 
                className="bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 w-full sm:w-auto"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <CardHeader className="px-3 sm:px-6">
              <CardTitle className="text-slate-800 dark:text-slate-200">Client Overview</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="overflow-x-auto -mx-3 sm:mx-0">
                <div className="min-w-[800px] sm:min-w-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">Client Name</TableHead>
                        <TableHead className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm hidden sm:table-cell">Email</TableHead>
                        <TableHead className="text-slate-600 dark:text-slate-400 text-center text-xs sm:text-sm">Projects</TableHead>
                        <TableHead className="text-slate-600 dark:text-slate-400 text-right text-xs sm:text-sm">Total Value</TableHead>
                        <TableHead className="text-slate-600 dark:text-slate-400 text-right text-xs sm:text-sm">Received</TableHead>
                        <TableHead className="text-slate-600 dark:text-slate-400 text-right text-xs sm:text-sm">Outstanding</TableHead>
                        <TableHead className="text-slate-600 dark:text-slate-400 text-center text-xs sm:text-sm hidden lg:table-cell">Last Payment</TableHead>
                        <TableHead className="text-slate-600 dark:text-slate-400 text-center text-xs sm:text-sm">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientSummaries.map((summary, index) => (
                        <TableRow key={index} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                          <TableCell className="font-medium text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                            <div className="max-w-[120px] sm:max-w-none truncate">
                              {summary.clientName}
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm hidden sm:table-cell">
                            <div className="max-w-[150px] truncate">
                              {summary.clientEmail || "-"}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200 text-xs">
                              {summary.projectCount}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                            £{getTotalValue(summary).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right text-emerald-600 dark:text-emerald-400 font-semibold text-xs sm:text-sm">
                            £{summary.totalReceived.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right text-amber-600 dark:text-amber-400 font-semibold text-xs sm:text-sm">
                            £{summary.totalOutstanding.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-center text-slate-600 dark:text-slate-400 text-xs sm:text-sm hidden lg:table-cell">
                            {summary.lastPaymentDate}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewClient(summary.clientName)}
                              className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs px-2 py-1"
                            >
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                              <span className="hidden sm:inline">View</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ClientSummary;
