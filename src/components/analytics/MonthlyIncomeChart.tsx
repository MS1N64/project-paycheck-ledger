
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Payment } from "@/types";
import { format, parseISO, startOfMonth, isSameMonth } from "date-fns";

interface MonthlyIncomeChartProps {
  payments: Payment[];
}

const MonthlyIncomeChart = ({ payments }: MonthlyIncomeChartProps) => {
  const monthlyData = payments.reduce((acc, payment) => {
    const paymentDate = new Date(payment.date);
    const monthKey = format(startOfMonth(paymentDate), 'yyyy-MM');
    const monthLabel = format(paymentDate, 'MMM yyyy');
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        month: monthLabel,
        total: 0,
        transfer: 0,
        cash: 0,
        count: 0
      };
    }
    
    acc[monthKey].total += payment.total;
    acc[monthKey].transfer += payment.transfer;
    acc[monthKey].cash += payment.cash;
    acc[monthKey].count += 1;
    
    return acc;
  }, {} as Record<string, { month: string; total: number; transfer: number; cash: number; count: number }>);

  const chartData = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

  const chartConfig = {
    total: {
      label: "Total Income",
      color: "hsl(142, 76%, 36%)",
    },
    transfer: {
      label: "Transfer",
      color: "hsl(221, 83%, 53%)",
    },
    cash: {
      label: "Cash",
      color: "hsl(48, 96%, 53%)",
    },
  };

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-slate-800">Monthly Income</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[300px]">
            <BarChart data={chartData}>
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="total" fill="var(--color-total)" radius={4} />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-slate-500">
            No payment data available
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MonthlyIncomeChart;
