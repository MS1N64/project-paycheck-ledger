import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Download } from "lucide-react";
import PaymentForm from "@/components/PaymentForm";
import PaymentTable from "@/components/PaymentTable";
import ProjectTimeline from "@/components/ProjectTimeline";
import DocumentManager from "@/components/DocumentManager";
import InvoiceGenerator from "@/components/InvoiceGenerator";
import { useToast } from "@/hooks/use-toast";

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [deletedItems, setDeletedItems] = useState<Map<string, { item: any; type: 'payment' | 'project'; timestamp: number }>>(new Map());

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

  const updateProjectTotals = (newPayments: any[]) => {
    const projects = JSON.parse(localStorage.getItem("projects") || "[]");
    const updatedProjects = projects.map((p: any) => {
      if (p.id === id) {
        const totalReceived = newPayments
          .filter((pay: any) => pay.projectId === id)
          .reduce((sum: number, pay: any) => sum + pay.total, 0);
        return {
          ...p,
          totalReceived,
          totalRemaining: p.finalPrice - totalReceived,
          lastPayment: newPayments.length > 0 ? new Date().toLocaleDateString() : p.lastPayment
        };
      }
      return p;
    });
    localStorage.setItem("projects", JSON.stringify(updatedProjects));
    setProject(updatedProjects.find((p: any) => p.id === id));
  };

  const handleAddPayment = async (payment: any) => {
    // Optimistic update - add payment immediately to UI
    const optimisticPayments = [...payments, payment];
    setPayments(optimisticPayments);
    updateProjectTotals(optimisticPayments);
    setShowPaymentForm(false);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Persist to localStorage (simulating successful API call)
      const allPayments = JSON.parse(localStorage.getItem("payments") || "[]");
      const updatedPayments = [...allPayments, payment];
      localStorage.setItem("payments", JSON.stringify(updatedPayments));
      
      toast({
        title: "Payment Added",
        description: "Payment has been successfully recorded.",
      });
    } catch (error) {
      // Revert optimistic update on failure
      setPayments(payments);
      updateProjectTotals(payments);
      
      toast({
        title: "Error",
        description: "Failed to add payment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    const paymentToDelete = payments.find(p => p.id === paymentId);
    if (!paymentToDelete) return;

    // Optimistic update - remove payment immediately from UI
    const optimisticPayments = payments.filter(p => p.id !== paymentId);
    setPayments(optimisticPayments);
    updateProjectTotals(optimisticPayments);

    // Store deleted item for potential undo
    const deletedItem = {
      item: paymentToDelete,
      type: 'payment' as const,
      timestamp: Date.now()
    };
    setDeletedItems(prev => new Map(prev).set(paymentId, deletedItem));

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Persist deletion to localStorage
      const allPayments = JSON.parse(localStorage.getItem("payments") || "[]");
      const updatedPayments = allPayments.filter((p: any) => p.id !== paymentId);
      localStorage.setItem("payments", JSON.stringify(updatedPayments));
      
      toast({
        title: "Payment Deleted",
        description: "Payment has been removed.",
        action: (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleUndoDelete(paymentId)}
            className="ml-2"
          >
            Undo
          </Button>
        )
      });

      // Auto-cleanup undo option after 10 seconds
      setTimeout(() => {
        setDeletedItems(prev => {
          const newMap = new Map(prev);
          newMap.delete(paymentId);
          return newMap;
        });
      }, 10000);
      
    } catch (error) {
      // Revert optimistic update on failure
      setPayments(payments);
      updateProjectTotals(payments);
      setDeletedItems(prev => {
        const newMap = new Map(prev);
        newMap.delete(paymentId);
        return newMap;
      });
      
      toast({
        title: "Error",
        description: "Failed to delete payment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUndoDelete = async (itemId: string) => {
    const deletedItem = deletedItems.get(itemId);
    if (!deletedItem || deletedItem.type !== 'payment') return;

    // Restore payment optimistically
    const restoredPayments = [...payments, deletedItem.item];
    setPayments(restoredPayments);
    updateProjectTotals(restoredPayments);

    // Remove from deleted items
    setDeletedItems(prev => {
      const newMap = new Map(prev);
      newMap.delete(itemId);
      return newMap;
    });

    try {
      // Persist restoration to localStorage
      const allPayments = JSON.parse(localStorage.getItem("payments") || "[]");
      const updatedPayments = [...allPayments, deletedItem.item];
      localStorage.setItem("payments", JSON.stringify(updatedPayments));
      
      toast({
        title: "Payment Restored",
        description: "Payment has been restored successfully.",
      });
    } catch (error) {
      // Revert if restoration fails
      const revertedPayments = payments.filter(p => p.id !== itemId);
      setPayments(revertedPayments);
      updateProjectTotals(revertedPayments);
      setDeletedItems(prev => new Map(prev).set(itemId, deletedItem));
      
      toast({
        title: "Error",
        description: "Failed to restore payment. Please try again.",
        variant: "destructive"
      });
    }
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
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project?.address.replace(/[^a-zA-Z0-9]/g, "_")}_payments.csv`;
    a.click();
  };

  const generateTimeline = () => {
    const milestones: Array<{
      id: string;
      stage: string;
      description: string;
      status: "completed" | "current" | "pending";
      date?: string;
      amount?: number;
    }> = [
      {
        id: "project-start",
        stage: "Project Started",
        description: "Project initiated and planning begun",
        status: "completed",
        date: new Date(project?.createdAt).toLocaleDateString()
      }
    ];

    payments.forEach((payment, index) => {
      milestones.push({
        id: payment.id,
        stage: payment.stage,
        description: `Payment received: £${payment.total.toLocaleString()}`,
        status: "completed",
        date: new Date(payment.date).toLocaleDateString(),
        amount: payment.total
      });
    });

    if (project?.totalRemaining > 0) {
      milestones.push({
        id: "final-payment",
        stage: "Final Payment",
        description: `Remaining amount: £${project.totalRemaining.toLocaleString()}`,
        status: project.status === "Completed" ? "completed" : "pending"
      });
    }

    return milestones;
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">Project not found</h2>
          <Button onClick={() => navigate("/")} className="bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 w-full sm:w-auto">Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  const clientInfo = {
    name: project.clientName,
    email: project.clientEmail,
    phone: project.clientPhone,
    address: project.clientAddress
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <img 
              src="/lovable-uploads/7d3f7b33-caa8-4493-8e10-edf7a631b0e2.png" 
              alt="DASS & SONS" 
              className="h-12 sm:h-20 w-auto flex-shrink-0"
            />
            <Button 
              variant="outline" 
              onClick={() => navigate("/")} 
              className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm sm:text-base"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </div>
          <h1 className="text-xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 w-full sm:w-auto break-words">{project.address}</h1>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Final Price</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <p className="text-lg sm:text-2xl font-bold text-slate-800 dark:text-slate-200">
                {project.currency === 'USD' ? '$' : project.currency === 'EUR' ? '€' : '£'}{project.finalPrice.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Total Received</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <p className="text-lg sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {project.currency === 'USD' ? '$' : project.currency === 'EUR' ? '€' : '£'}{project.totalReceived.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Remaining</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <p className="text-lg sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
                {project.currency === 'USD' ? '$' : project.currency === 'EUR' ? '€' : '£'}{project.totalRemaining.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Progress</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <p className="text-lg sm:text-2xl font-bold text-slate-700 dark:text-slate-300">
                {project.finalPrice > 0 ? Math.round((project.totalReceived / project.finalPrice) * 100) : 0}%
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="lg:col-span-2 order-2 lg:order-1">
            <ProjectTimeline projectId={project.id} milestones={generateTimeline()} />
          </div>
          <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
            <InvoiceGenerator 
              projectId={project.id}
              projectAddress={project.address}
              clientInfo={clientInfo}
            />
            <DocumentManager projectId={project.id} />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          <Button 
            onClick={() => setShowPaymentForm(true)} 
            className="bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Payment
          </Button>
          {payments.length > 0 && (
            <Button 
              variant="outline" 
              onClick={exportToCSV} 
              className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 w-full sm:w-auto"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>

        {showPaymentForm && (
          <div className="mb-6 sm:mb-8">
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
