
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface PaymentFormProps {
  onSubmit: (payment: any) => void;
  onCancel: () => void;
  projectId: string;
}

const PaymentForm = ({ onSubmit, onCancel, projectId }: PaymentFormProps) => {
  const [formData, setFormData] = useState({
    stage: "",
    date: new Date(),
    invoice: "",
    transfer: "",
    cash: "",
    vat: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payment = {
      id: Date.now().toString(),
      projectId,
      ...formData,
      invoice: parseFloat(formData.invoice) || 0,
      transfer: parseFloat(formData.transfer) || 0,
      cash: parseFloat(formData.cash) || 0,
      vat: parseFloat(formData.vat) || 0,
      total: (parseFloat(formData.invoice) || 0) + (parseFloat(formData.transfer) || 0) + (parseFloat(formData.cash) || 0),
      createdAt: new Date().toISOString()
    };
    onSubmit(payment);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Add Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="stage">Payment Stage</Label>
            <Input
              id="stage"
              value={formData.stage}
              onChange={(e) => setFormData({...formData, stage: e.target.value})}
              placeholder="e.g., STAGE 1 PAYMENTS"
              required
            />
          </div>
          <div>
            <Label>Payment Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? format(formData.date, "dd/MM/yyyy") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => date && setFormData({...formData, date})}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="invoice">Invoice (£)</Label>
              <Input
                id="invoice"
                type="number"
                step="0.01"
                value={formData.invoice}
                onChange={(e) => setFormData({...formData, invoice: e.target.value})}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="transfer">Transfer (£)</Label>
              <Input
                id="transfer"
                type="number"
                step="0.01"
                value={formData.transfer}
                onChange={(e) => setFormData({...formData, transfer: e.target.value})}
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="cash">Cash (£)</Label>
              <Input
                id="cash"
                type="number"
                step="0.01"
                value={formData.cash}
                onChange={(e) => setFormData({...formData, cash: e.target.value})}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="vat">VAT (£)</Label>
              <Input
                id="vat"
                type="number"
                step="0.01"
                value={formData.vat}
                onChange={(e) => setFormData({...formData, vat: e.target.value})}
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Add Payment
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

export default PaymentForm;
