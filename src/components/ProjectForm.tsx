
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    status: initialData?.status || "Pending"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      finalPrice: parseFloat(formData.finalPrice) || 0,
      vatRate: parseFloat(formData.vatRate) || 20,
      id: initialData?.id || Date.now().toString(),
      totalReceived: initialData?.totalReceived || 0,
      totalRemaining: initialData?.totalRemaining || parseFloat(formData.finalPrice) || 0,
      lastPayment: initialData?.lastPayment || "No payments yet",
      createdAt: initialData?.createdAt || new Date().toISOString()
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{initialData ? "Edit Project" : "New Project"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="address">Property Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              placeholder="e.g., 43 Higher Swan Lane, BL3 3AJ"
              required
            />
          </div>
          <div>
            <Label htmlFor="finalPrice">Final Price (£)</Label>
            <Input
              id="finalPrice"
              type="number"
              step="0.01"
              value={formData.finalPrice}
              onChange={(e) => setFormData({...formData, finalPrice: e.target.value})}
              placeholder="134400.00"
              required
            />
          </div>
          <div>
            <Label htmlFor="vatRate">VAT Rate (%)</Label>
            <Select value={formData.vatRate} onValueChange={(value) => setFormData({...formData, vatRate: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0%</SelectItem>
                <SelectItem value="5">5%</SelectItem>
                <SelectItem value="20">20%</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              {initialData ? "Update" : "Create"} Project
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProjectForm;
