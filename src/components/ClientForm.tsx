
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface ClientFormProps {
  onSubmit: (client: any) => void;
  onCancel: () => void;
  initialData?: any;
}

const ClientForm = ({ onSubmit, onCancel, initialData }: ClientFormProps) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    address: initialData?.address || "",
    notes: initialData?.notes || ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      id: initialData?.id || Date.now().toString(),
      createdAt: initialData?.createdAt || new Date().toISOString()
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto border-slate-200">
      <CardHeader>
        <CardTitle className="text-slate-800">{initialData ? "Edit Client" : "New Client"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-slate-700">Client Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="John Smith"
              required
              className="border-slate-300 focus:border-slate-500"
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-slate-700">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="john@example.com"
              className="border-slate-300 focus:border-slate-500"
            />
          </div>
          <div>
            <Label htmlFor="phone" className="text-slate-700">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="07123 456789"
              className="border-slate-300 focus:border-slate-500"
            />
          </div>
          <div>
            <Label htmlFor="address" className="text-slate-700">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              placeholder="Client address"
              className="border-slate-300 focus:border-slate-500"
            />
          </div>
          <div>
            <Label htmlFor="notes" className="text-slate-700">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Additional notes about the client"
              className="border-slate-300 focus:border-slate-500"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1 bg-slate-800 hover:bg-slate-700">
              {initialData ? "Update" : "Create"} Client
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="border-slate-300 text-slate-700 hover:bg-slate-100">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ClientForm;
