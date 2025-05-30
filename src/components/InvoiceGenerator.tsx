
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Download, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InvoiceGeneratorProps {
  projectId: string;
  projectAddress: string;
  clientInfo?: any;
}

const InvoiceGenerator = ({ projectId, projectAddress, clientInfo }: InvoiceGeneratorProps) => {
  const { toast } = useToast();
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: `INV-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: "",
    amount: "",
    vatRate: "20"
  });

  const handleGenerateInvoice = () => {
    const amount = parseFloat(invoiceData.amount) || 0;
    const vatAmount = amount * (parseFloat(invoiceData.vatRate) / 100);
    const totalAmount = amount + vatAmount;

    // Generate invoice HTML
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoiceData.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
          .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .company-info { text-align: left; }
          .invoice-info { text-align: right; }
          .client-info { margin: 30px 0; }
          .invoice-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
          .invoice-table th, .invoice-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          .invoice-table th { background-color: #f8f9fa; }
          .total-section { text-align: right; margin-top: 20px; }
          .total-row { display: flex; justify-content: space-between; padding: 5px 0; }
          .final-total { font-weight: bold; font-size: 1.2em; border-top: 2px solid #333; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-info">
            <h1>DASS & SONS</h1>
            <p>Construction Services</p>
          </div>
          <div class="invoice-info">
            <h2>INVOICE</h2>
            <p><strong>Invoice #:</strong> ${invoiceData.invoiceNumber}</p>
            <p><strong>Date:</strong> ${new Date(invoiceData.date).toLocaleDateString()}</p>
            <p><strong>Due Date:</strong> ${new Date(invoiceData.dueDate).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div class="client-info">
          <h3>Bill To:</h3>
          <p><strong>${clientInfo?.name || 'Client Name'}</strong></p>
          <p>${clientInfo?.address || 'Client Address'}</p>
          <p>${clientInfo?.email || ''}</p>
          <p>${clientInfo?.phone || ''}</p>
        </div>
        
        <table class="invoice-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>Project: ${projectAddress}</strong><br>
                ${invoiceData.description}
              </td>
              <td>£${amount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="total-section">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>£${amount.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>VAT (${invoiceData.vatRate}%):</span>
            <span>£${vatAmount.toFixed(2)}</span>
          </div>
          <div class="total-row final-total">
            <span>Total:</span>
            <span>£${totalAmount.toFixed(2)}</span>
          </div>
        </div>
        
        <div style="margin-top: 40px; font-size: 0.9em; color: #666;">
          <p>Payment terms: Net 30 days</p>
          <p>Thank you for your business!</p>
        </div>
      </body>
      </html>
    `;

    // Create and download the invoice
    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice_${invoiceData.invoiceNumber}.html`;
    a.click();

    toast({
      title: "Invoice Generated",
      description: `Invoice ${invoiceData.invoiceNumber} has been created and downloaded.`,
    });
  };

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-slate-800 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Generate Invoice
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="invoiceNumber" className="text-slate-700">Invoice Number</Label>
            <Input
              id="invoiceNumber"
              value={invoiceData.invoiceNumber}
              onChange={(e) => setInvoiceData({...invoiceData, invoiceNumber: e.target.value})}
              className="border-slate-300 focus:border-slate-500"
            />
          </div>
          <div>
            <Label htmlFor="date" className="text-slate-700">Invoice Date</Label>
            <Input
              id="date"
              type="date"
              value={invoiceData.date}
              onChange={(e) => setInvoiceData({...invoiceData, date: e.target.value})}
              className="border-slate-300 focus:border-slate-500"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="description" className="text-slate-700">Description</Label>
          <Textarea
            id="description"
            value={invoiceData.description}
            onChange={(e) => setInvoiceData({...invoiceData, description: e.target.value})}
            placeholder="Construction work as per agreement..."
            className="border-slate-300 focus:border-slate-500"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="amount" className="text-slate-700">Amount (£) - Excl. VAT</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={invoiceData.amount}
              onChange={(e) => setInvoiceData({...invoiceData, amount: e.target.value})}
              placeholder="0.00"
              className="border-slate-300 focus:border-slate-500"
            />
          </div>
          <div>
            <Label htmlFor="vatRate" className="text-slate-700">VAT Rate (%)</Label>
            <Input
              id="vatRate"
              type="number"
              value={invoiceData.vatRate}
              onChange={(e) => setInvoiceData({...invoiceData, vatRate: e.target.value})}
              className="border-slate-300 focus:border-slate-500"
            />
          </div>
        </div>
        
        {invoiceData.amount && (
          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>£{parseFloat(invoiceData.amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>VAT ({invoiceData.vatRate}%):</span>
              <span>£{(parseFloat(invoiceData.amount) * (parseFloat(invoiceData.vatRate) / 100)).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold border-t pt-2">
              <span>Total:</span>
              <span>£{(parseFloat(invoiceData.amount) * (1 + parseFloat(invoiceData.vatRate) / 100)).toFixed(2)}</span>
            </div>
          </div>
        )}
        
        <Button 
          onClick={handleGenerateInvoice}
          className="w-full bg-slate-800 hover:bg-slate-700"
          disabled={!invoiceData.amount || !invoiceData.description}
        >
          <Download className="h-4 w-4 mr-2" />
          Generate & Download Invoice
        </Button>
      </CardContent>
    </Card>
  );
};

export default InvoiceGenerator;
