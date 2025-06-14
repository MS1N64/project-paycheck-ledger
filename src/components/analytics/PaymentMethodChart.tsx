
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { Payment } from "@/types";

interface PaymentMethodChartProps {
  payments: Payment[];
}

const PaymentMethodChart = ({ payments }: PaymentMethodChartProps) => {
  const paymentMethodData = payments.reduce((acc, payment) => {
    acc.transfer += payment.transfer;
    acc.cash += payment.cash;
    return acc;
  }, { transfer: 0, cash: 0 });

  const chartData = [
    {
      name: "Transfer",
      value: paymentMethodData.transfer,
      color: "#3b82f6"
    },
    {
      name: "Cash",
      value: paymentMethodData.cash,
      color: "#f97316" // Orange instead of yellow
    }
  ].filter(item => item.value > 0);

  const chartConfig = {
    transfer: {
      label: "Transfer",
      color: "hsl(221, 83%, 53%)",
    },
    cash: {
      label: "Cash",
      color: "hsl(25, 95%, 53%)", // Orange instead of yellow
    },
  };

  return (
    <Card className="border-slate-200 bg-[#F5F7FA]">
      <CardHeader>
        <CardTitle className="text-[#0A2C56]">Payment Method Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[300px]">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0];
                    return (
                      <div className="bg-white p-3 border rounded shadow-lg">
                        <p className="font-medium">{data.payload.name}</p>
                        <p className="text-sm">£{data.value?.toLocaleString()}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-[#0A2C56]/70">
            No payment data available
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentMethodChart;
