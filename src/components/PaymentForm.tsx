
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

  const calculateVAT = (invoiceAmount: number) => {
    return invoiceAmount * 0.20; // 20% VAT
  };

  const calculateInvoiceWithVAT = (invoiceAmount: number) => {
    return invoiceAmount * 1.20; // Invoice + 20% VAT
  };

  const handleInvoiceChange = (value: string) => {
    const invoiceAmount = parseFloat(value) || 0;
    const vatAmount = calculateVAT(invoiceAmount);
    
    setFormData({
      ...formData, 
      invoice: value,
      vat: vatAmount.toFixed(2)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const invoiceAmount = parseFloat(formData.invoice) || 0;
    const invoiceWithVAT = calculateInvoiceWithVAT(invoiceAmount);
    
    const payment = {
      id: Date.now().toString(),
      projectId,
      ...formData,
      invoice: invoiceAmount,
      invoiceWithVAT: invoiceWithVAT,
      transfer: parseFloat(formData.transfer) || 0,
      cash: parseFloat(formData.cash) || 0,
      vat: parseFloat(formData.vat) || 0,
      total: invoiceWithVAT + (parseFloat(formData.transfer) || 0) + (parseFloat(formData.cash) || 0),
      createdAt: new Date().toISOString()
    };
    onSubmit(payment);
  };

  const invoiceAmount = parseFloat(formData.invoice) || 0;
  const invoiceWithVAT = calculateInvoiceWithVAT(invoiceAmount);

  return (
    <Card className="w-full max-w-md mx-auto border-slate-200">
      <CardHeader>
        <CardTitle className="text-slate-800">Add Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="stage" className="text-slate-700">Payment Stage</Label>
            <Input
              id="stage"
              value={formData.stage}
              onChange={(e) => setFormData({...formData, stage: e.target.value})}
              placeholder="e.g., STAGE 1 PAYMENTS"
              required
              className="border-slate-300 focus:border-slate-500"
            />
          </div>
          <div>
            <Label className="text-slate-700">Payment Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal border-slate-300",
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
          <div className="space-y-3">
            <div>
              <Label htmlFor="invoice" className="text-slate-700">Invoice (£) - Excl. VAT</Label>
              <Input
                id="invoice"
                type="number"
                step="0.01"
                value={formData.invoice}
                onChange={(e) => handleInvoiceChange(e.target.value)}
                placeholder="0.00"
                className="border-slate-300 focus:border-slate-500"
              />
              {invoiceAmount > 0 && (
                <div className="mt-2 p-2 bg-slate-50 rounded text-sm border border-slate-200">
                  <div className="flex justify-between">
                    <span>Invoice (Excl. VAT):</span>
                    <span>£{invoiceAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT (20%):</span>
                    <span>£{calculateVAT(invoiceAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-1">
                    <span>Invoice (Incl. VAT):</span>
                    <span>£{invoiceWithVAT.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="transfer" className="text-slate-700">Transfer (£)</Label>
              <Input
                id="transfer"
                type="number"
                step="0.01"
                value={formData.transfer}
                onChange={(e) => setFormData({...formData, transfer: e.target.value})}
                placeholder="0.00"
                className="border-slate-300 focus:border-slate-500"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="cash" className="text-slate-700">Cash (£)</Label>
            <Input
              id="cash"
              type="number"
              step="0.01"
              value={formData.cash}
              onChange={(e) => setFormData({...formData, cash: e.target.value})}
              placeholder="0.00"
              className="border-slate-300 focus:border-slate-500"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1 bg-slate-800 hover:bg-slate-700">
              Add Payment
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

export default PaymentForm;
