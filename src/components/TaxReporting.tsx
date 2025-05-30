
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Download, FileText } from "lucide-react";

interface TaxReportingProps {
  payments: any[];
}

const TaxReporting = ({ payments }: TaxReportingProps) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [taxSummary, setTaxSummary] = useState({
    totalInvoiced: 0,
    totalVAT: 0,
    totalReceived: 0,
    quarters: [] as any[]
  });

  useEffect(() => {
    calculateTaxSummary();
  }, [payments, selectedYear]);

  const calculateTaxSummary = () => {
    const yearPayments = payments.filter(payment => 
      new Date(payment.date).getFullYear().toString() === selectedYear
    );

    const quarters = [
      { name: "Q1", months: [0, 1, 2], totalInvoiced: 0, totalVAT: 0, totalReceived: 0 },
      { name: "Q2", months: [3, 4, 5], totalInvoiced: 0, totalVAT: 0, totalReceived: 0 },
      { name: "Q3", months: [6, 7, 8], totalInvoiced: 0, totalVAT: 0, totalReceived: 0 },
      { name: "Q4", months: [9, 10, 11], totalInvoiced: 0, totalVAT: 0, totalReceived: 0 }
    ];

    let totalInvoiced = 0;
    let totalVAT = 0;
    let totalReceived = 0;

    yearPayments.forEach(payment => {
      const month = new Date(payment.date).getMonth();
      const quarter = quarters.find(q => q.months.includes(month));
      
      if (quarter) {
        quarter.totalInvoiced += payment.invoice || 0;
        quarter.totalVAT += payment.vat || 0;
        quarter.totalReceived += payment.total || 0;
      }
      
      totalInvoiced += payment.invoice || 0;
      totalVAT += payment.vat || 0;
      totalReceived += payment.total || 0;
    });

    setTaxSummary({
      totalInvoiced,
      totalVAT,
      totalReceived,
      quarters
    });
  };

  const exportTaxReport = () => {
    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>VAT Tax Report ${selectedYear} - DASS & SONS</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .summary-table th, .summary-table td { border: 1px solid #ddd; padding: 12px; text-align: right; }
          .summary-table th { background-color: #f8f9fa; text-align: center; }
          .total-row { font-weight: bold; background-color: #f0f9ff; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>DASS & SONS</h1>
          <h2>VAT Tax Report for ${selectedYear}</h2>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        
        <h3>Quarterly Breakdown</h3>
        <table class="summary-table">
          <thead>
            <tr>
              <th>Quarter</th>
              <th>Total Invoiced (Excl. VAT)</th>
              <th>VAT Collected</th>
              <th>Total Received</th>
            </tr>
          </thead>
          <tbody>
            ${taxSummary.quarters.map(quarter => `
              <tr>
                <td style="text-align: center;">${quarter.name}</td>
                <td>£${quarter.totalInvoiced.toFixed(2)}</td>
                <td>£${quarter.totalVAT.toFixed(2)}</td>
                <td>£${quarter.totalReceived.toFixed(2)}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td style="text-align: center;">TOTAL</td>
              <td>£${taxSummary.totalInvoiced.toFixed(2)}</td>
              <td>£${taxSummary.totalVAT.toFixed(2)}</td>
              <td>£${taxSummary.totalReceived.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        
        <div style="margin-top: 40px; font-size: 0.9em; color: #666;">
          <p><strong>Note:</strong> This report is for informational purposes. Please consult with your accountant for official tax filings.</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([reportHTML], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VAT_Report_${selectedYear}.html`;
    a.click();
  };

  const availableYears = Array.from(new Set(
    payments.map(p => new Date(p.date).getFullYear())
  )).sort((a, b) => b - a);

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-slate-800 flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          VAT Tax Reporting
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">Tax Year</label>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="border-slate-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded border border-blue-200">
            <p className="text-sm text-blue-600 mb-1">Total Invoiced (Excl. VAT)</p>
            <p className="text-xl font-bold text-blue-800">£{taxSummary.totalInvoiced.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-emerald-50 rounded border border-emerald-200">
            <p className="text-sm text-emerald-600 mb-1">VAT Collected</p>
            <p className="text-xl font-bold text-emerald-800">£{taxSummary.totalVAT.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-amber-50 rounded border border-amber-200">
            <p className="text-sm text-amber-600 mb-1">Total Received</p>
            <p className="text-xl font-bold text-amber-800">£{taxSummary.totalReceived.toFixed(2)}</p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-slate-800 mb-3">Quarterly Breakdown</h4>
          <div className="space-y-2">
            {taxSummary.quarters.map(quarter => (
              <div key={quarter.name} className="flex justify-between items-center p-3 border border-slate-200 rounded">
                <span className="font-medium text-slate-700">{quarter.name} {selectedYear}</span>
                <div className="text-right">
                  <p className="text-sm text-slate-600">Invoiced: £{quarter.totalInvoiced.toFixed(2)}</p>
                  <p className="text-sm text-slate-600">VAT: £{quarter.totalVAT.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button 
          onClick={exportTaxReport}
          className="w-full bg-slate-800 hover:bg-slate-700"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Tax Report
        </Button>
      </CardContent>
    </Card>
  );
};

export default TaxReporting;
