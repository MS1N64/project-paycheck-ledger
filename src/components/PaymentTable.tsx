
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";

interface Payment {
  id: string;
  stage: string;
  date: Date;
  invoice: number;
  invoiceWithVAT?: number;
  transfer: number;
  cash: number;
  vat: number;
  total: number;
}

interface PaymentTableProps {
  payments: Payment[];
  onDeletePayment: (id: string) => void;
}

const PaymentTable = ({ payments, onDeletePayment }: PaymentTableProps) => {
  const totals = payments.reduce(
    (acc, payment) => ({
      invoice: acc.invoice + payment.invoice,
      invoiceWithVAT: acc.invoiceWithVAT + (payment.invoiceWithVAT || payment.invoice * 1.20),
      transfer: acc.transfer + payment.transfer,
      cash: acc.cash + payment.cash,
      vat: acc.vat + (payment.vat || payment.invoice * 0.20),
      total: acc.total + payment.total,
    }),
    { invoice: 0, invoiceWithVAT: 0, transfer: 0, cash: 0, vat: 0, total: 0 }
  );

  const formatCurrency = (amount: number) => `£${amount.toFixed(2)}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-teal-600 hover:bg-teal-600">
                <TableHead className="text-white font-semibold">Date</TableHead>
                <TableHead className="text-white font-semibold">Stage</TableHead>
                <TableHead className="text-white font-semibold text-right">Invoice (Excl VAT)</TableHead>
                <TableHead className="text-white font-semibold text-right">Invoice (Incl VAT)</TableHead>
                <TableHead className="text-white font-semibold text-right">Transfer</TableHead>
                <TableHead className="text-white font-semibold text-right">Cash</TableHead>
                <TableHead className="text-white font-semibold text-right">VAT</TableHead>
                <TableHead className="text-white font-semibold text-right">Total</TableHead>
                <TableHead className="text-white font-semibold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                    No payments recorded yet
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => {
                  const invoiceWithVAT = payment.invoiceWithVAT || payment.invoice * 1.20;
                  const vatAmount = payment.vat || payment.invoice * 0.20;
                  
                  return (
                    <TableRow key={payment.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {format(new Date(payment.date), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>{payment.stage}</TableCell>
                      <TableCell className="text-right font-mono">
                        {payment.invoice > 0 ? formatCurrency(payment.invoice) : "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {payment.invoice > 0 ? formatCurrency(invoiceWithVAT) : "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {payment.transfer > 0 ? formatCurrency(payment.transfer) : "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {payment.cash > 0 ? formatCurrency(payment.cash) : "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {payment.invoice > 0 ? formatCurrency(vatAmount) : "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {formatCurrency(payment.total)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onDeletePayment(payment.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
              {payments.length > 0 && (
                <TableRow className="bg-teal-50 font-semibold">
                  <TableCell colSpan={2} className="text-right font-bold">
                    TOTALS:
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(totals.invoice)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold">
                    {formatCurrency(totals.invoiceWithVAT)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(totals.transfer)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(totals.cash)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(totals.vat)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-teal-700">
                    {formatCurrency(totals.total)}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentTable;
