
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
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Client Summary</h1>
            <p className="text-slate-600 mt-1">Overview of all clients and their projects</p>
          </div>
        </div>

        {clientSummaries.length === 0 ? (
          <Card className="border-slate-200">
            <CardContent className="text-center py-12">
              <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No clients found</h3>
              <p className="text-slate-600 mb-6">Create some projects with client information to see summaries here</p>
              <Button onClick={() => navigate("/")} className="bg-slate-800 hover:bg-slate-700">
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-800">Client Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-slate-600">Client Name</TableHead>
                      <TableHead className="text-slate-600">Email</TableHead>
                      <TableHead className="text-slate-600 text-center">Projects</TableHead>
                      <TableHead className="text-slate-600 text-right">Total Value</TableHead>
                      <TableHead className="text-slate-600 text-right">Total Received</TableHead>
                      <TableHead className="text-slate-600 text-right">Outstanding</TableHead>
                      <TableHead className="text-slate-600 text-center">Last Payment</TableHead>
                      <TableHead className="text-slate-600 text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientSummaries.map((summary, index) => (
                      <TableRow key={index} className="hover:bg-slate-50">
                        <TableCell className="font-medium text-slate-800">
                          {summary.clientName}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {summary.clientEmail || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="bg-slate-100 text-slate-800">
                            {summary.projectCount}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-slate-800">
                          £{getTotalValue(summary).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-emerald-600 font-semibold">
                          £{summary.totalReceived.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-amber-600 font-semibold">
                          £{summary.totalOutstanding.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center text-slate-600">
                          {summary.lastPaymentDate}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewClient(summary.clientName)}
                            className="border-slate-300 text-slate-700 hover:bg-slate-100"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ClientSummary;
