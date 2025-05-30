
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Download } from "lucide-react";
import PaymentForm from "@/components/PaymentForm";
import PaymentTable from "@/components/PaymentTable";
import { useToast } from "@/hooks/use-toast";

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  useEffect(() => {
    const projects = JSON.parse(localStorage.getItem("projects") || "[]");
    const currentProject = projects.find((p: any) => p.id === id);
    if (currentProject) {
      setProject(currentProject);
    }

    const allPayments = JSON.parse(localStorage.getItem("payments") || "[]");
    const projectPayments = allPayments.filter((p: any) => p.projectId === id);
    setPayments(projectPayments);
  }, [id]);

  const handleAddPayment = (payment: any) => {
    const allPayments = JSON.parse(localStorage.getItem("payments") || "[]");
    const updatedPayments = [...allPayments, payment];
    localStorage.setItem("payments", JSON.stringify(updatedPayments));
    setPayments(prev => [...prev, payment]);
    
    // Update project totals
    const projects = JSON.parse(localStorage.getItem("projects") || "[]");
    const updatedProjects = projects.map((p: any) => {
      if (p.id === id) {
        const totalReceived = updatedPayments
          .filter((pay: any) => pay.projectId === id)
          .reduce((sum: number, pay: any) => sum + pay.total, 0);
        return {
          ...p,
          totalReceived,
          totalRemaining: p.finalPrice - totalReceived,
          lastPayment: new Date().toLocaleDateString()
        };
      }
      return p;
    });
    localStorage.setItem("projects", JSON.stringify(updatedProjects));
    setProject(updatedProjects.find((p: any) => p.id === id));
    
    setShowPaymentForm(false);
    toast({
      title: "Payment Added",
      description: "Payment has been successfully recorded.",
    });
  };

  const handleDeletePayment = (paymentId: string) => {
    const allPayments = JSON.parse(localStorage.getItem("payments") || "[]");
    const updatedPayments = allPayments.filter((p: any) => p.id !== paymentId);
    localStorage.setItem("payments", JSON.stringify(updatedPayments));
    setPayments(prev => prev.filter(p => p.id !== paymentId));
    
    // Update project totals
    const projects = JSON.parse(localStorage.getItem("projects") || "[]");
    const updatedProjects = projects.map((p: any) => {
      if (p.id === id) {
        const totalReceived = updatedPayments
          .filter((pay: any) => pay.projectId === id)
          .reduce((sum: number, pay: any) => sum + pay.total, 0);
        return {
          ...p,
          totalReceived,
          totalRemaining: p.finalPrice - totalReceived
        };
      }
      return p;
    });
    localStorage.setItem("projects", JSON.stringify(updatedProjects));
    setProject(updatedProjects.find((p: any) => p.id === id));
    
    toast({
      title: "Payment Deleted",
      description: "Payment has been removed.",
    });
  };

  const exportToCSV = () => {
    const headers = ["Date", "Stage", "Invoice", "Transfer", "Cash", "VAT", "Total"];
    const rows = payments.map(payment => [
      new Date(payment.date).toLocaleDateString(),
      payment.stage,
      payment.invoice,
      payment.transfer,
      payment.cash,
      payment.vat,
      payment.total
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.join(","))
      .join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project?.address.replace(/[^a-zA-Z0-9]/g, "_")}_payments.csv`;
    a.click();
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Project not found</h2>
          <Button onClick={() => navigate("/")}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">{project.address}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">Final Price</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">£{project.finalPrice.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">Total Received</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">£{project.totalReceived.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">Remaining</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-orange-600">£{project.totalRemaining.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-600">Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">
                {project.finalPrice > 0 ? Math.round((project.totalReceived / project.finalPrice) * 100) : 0}%
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 mb-6">
          <Button onClick={() => setShowPaymentForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Payment
          </Button>
          {payments.length > 0 && (
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>

        {showPaymentForm && (
          <div className="mb-8">
            <PaymentForm
              projectId={project.id}
              onSubmit={handleAddPayment}
              onCancel={() => setShowPaymentForm(false)}
            />
          </div>
        )}

        <PaymentTable payments={payments} onDeletePayment={handleDeletePayment} />
      </div>
    </div>
  );
};

export default ProjectDetail;
