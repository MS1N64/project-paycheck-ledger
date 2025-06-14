
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { generateUniqueId } from "@/lib/idGenerator";
import ProtectedForm from "./ProtectedForm";

interface ProjectFormProps {
  onSubmit: (project: any) => void;
  onCancel: () => void;
  initialData?: any;
}

const ProjectForm = ({ onSubmit, onCancel, initialData }: ProjectFormProps) => {
  const [formData, setFormData] = useState({
    address: initialData?.address || "",
    finalPrice: initialData?.finalPrice || "",
    vatRate: initialData?.vatRate || "20",
    status: initialData?.status || "Pending",
    currency: initialData?.currency || "GBP",
    clientName: initialData?.clientName || "",
    clientEmail: initialData?.clientEmail || "",
    clientPhone: initialData?.clientPhone || "",
    clientAddress: initialData?.clientAddress || "",
    notes: initialData?.notes || ""
  });

  const [isVerified, setIsVerified] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isVerified) {
      return;
    }

    onSubmit({
      ...formData,
      finalPrice: parseFloat(formData.finalPrice) || 0,
      vatRate: parseFloat(formData.vatRate) || 20,
      id: initialData?.id || generateUniqueId(),
      totalReceived: initialData?.totalReceived || 0,
      totalRemaining: initialData?.totalRemaining || parseFloat(formData.finalPrice) || 0,
      lastPayment: initialData?.lastPayment || "No payments yet",
      createdAt: initialData?.createdAt || new Date().toISOString()
    });
  };

  const handleVerificationSuccess = () => {
    setIsVerified(true);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-[#F5F7FA]">
      <Card className="w-full border-[#E3E8EF] bg-white dark:bg-slate-800">
        <CardHeader className="bg-white dark:bg-slate-800">
          <CardTitle className="text-[#0A2C56] dark:text-white">{initialData ? "Edit Project" : "New Project"}</CardTitle>
        </CardHeader>
        <CardContent className="bg-white dark:bg-slate-800">
          <ProtectedForm 
            onVerified={handleVerificationSuccess}
            action={initialData ? "edit_project" : "create_project"}
            className="space-y-6"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="address" className="text-[#0A2C56] dark:text-slate-200">Property Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    required
                    className="border-[#E3E8EF] focus:border-[#0A2C56] bg-white dark:bg-slate-700 dark:border-slate-600"
                  />
                </div>
                
                <div>
                  <Label htmlFor="finalPrice" className="text-[#0A2C56] dark:text-slate-200">Final Price</Label>
                  <div className="flex gap-2">
                    <Select value={formData.currency} onValueChange={(value) => setFormData({...formData, currency: value})}>
                      <SelectTrigger className="w-20 border-[#E3E8EF] bg-white dark:bg-slate-700 dark:border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-800 border-[#E3E8EF] dark:border-slate-600">
                        <SelectItem value="GBP">£</SelectItem>
                        <SelectItem value="USD">$</SelectItem>
                        <SelectItem value="EUR">€</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      id="finalPrice"
                      type="number"
                      step="0.01"
                      value={formData.finalPrice}
                      onChange={(e) => setFormData({...formData, finalPrice: e.target.value})}
                      required
                      className="flex-1 border-[#E3E8EF] focus:border-[#0A2C56] bg-white dark:bg-slate-700 dark:border-slate-600"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="vatRate" className="text-[#0A2C56] dark:text-slate-200">VAT Rate (%)</Label>
                  <Select value={formData.vatRate} onValueChange={(value) => setFormData({...formData, vatRate: value})}>
                    <SelectTrigger className="border-[#E3E8EF] bg-white dark:bg-slate-700 dark:border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border-[#E3E8EF] dark:border-slate-600">
                      <SelectItem value="0">0%</SelectItem>
                      <SelectItem value="5">5%</SelectItem>
                      <SelectItem value="20">20%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="status" className="text-[#0A2C56] dark:text-slate-200">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger className="border-[#E3E8EF] bg-white dark:bg-slate-700 dark:border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border-[#E3E8EF] dark:border-slate-600">
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#0A2C56] dark:text-white">Client Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientName" className="text-[#0A2C56] dark:text-slate-200">Client Name</Label>
                    <Input
                      id="clientName"
                      value={formData.clientName}
                      onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                      className="border-[#E3E8EF] focus:border-[#0A2C56] bg-white dark:bg-slate-700 dark:border-slate-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientEmail" className="text-[#0A2C56] dark:text-slate-200">Client Email</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={formData.clientEmail}
                      onChange={(e) => setFormData({...formData, clientEmail: e.target.value})}
                      className="border-[#E3E8EF] focus:border-[#0A2C56] bg-white dark:bg-slate-700 dark:border-slate-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientPhone" className="text-[#0A2C56] dark:text-slate-200">Client Phone</Label>
                    <Input
                      id="clientPhone"
                      value={formData.clientPhone}
                      onChange={(e) => setFormData({...formData, clientPhone: e.target.value})}
                      className="border-[#E3E8EF] focus:border-[#0A2C56] bg-white dark:bg-slate-700 dark:border-slate-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientAddress" className="text-[#0A2C56] dark:text-slate-200">Client Address</Label>
                    <Input
                      id="clientAddress"
                      value={formData.clientAddress}
                      onChange={(e) => setFormData({...formData, clientAddress: e.target.value})}
                      className="border-[#E3E8EF] focus:border-[#0A2C56] bg-white dark:bg-slate-700 dark:border-slate-600"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="notes" className="text-[#0A2C56] dark:text-slate-200">Project Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="border-[#E3E8EF] focus:border-[#0A2C56] bg-white dark:bg-slate-700 dark:border-slate-600"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-[#0A2C56] hover:bg-[#002244] text-white">
                  {initialData ? "Update" : "Create"} Project
                </Button>
                <Button type="button" variant="outline" onClick={onCancel} className="border-[#E3E8EF] text-[#0A2C56] hover:bg-[#F5F7FA] dark:border-slate-600 dark:text-slate-200">
                  Cancel
                </Button>
              </div>
            </form>
          </ProtectedForm>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectForm;
