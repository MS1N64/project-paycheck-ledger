
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Project } from "@/types";
import { format, parseISO } from "date-fns";

interface OutstandingDebtChartProps {
  projects: Project[];
}

const OutstandingDebtChart = ({ projects }: OutstandingDebtChartProps) => {
  const sortedProjects = [...projects].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  let cumulativeDebt = 0;
  const chartData = sortedProjects.map(project => {
    cumulativeDebt += project.totalRemaining;
    return {
      date: format(new Date(project.createdAt), 'MMM yyyy'),
      debt: cumulativeDebt,
      projectName: project.address
    };
  });

  const chartConfig = {
    debt: {
      label: "Outstanding Debt",
      color: "hsl(25, 95%, 53%)",
    },
  };

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-slate-800">Outstanding Debt Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[300px]">
            <LineChart data={chartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0];
                    return (
                      <div className="bg-white p-3 border rounded shadow-lg">
                        <p className="font-medium">{label}</p>
                        <p className="text-sm">Outstanding: £{data.value?.toLocaleString()}</p>
                        <p className="text-xs text-slate-500">{data.payload.projectName}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line 
                type="monotone" 
                dataKey="debt" 
                stroke="var(--color-debt)" 
                strokeWidth={2}
                dot={{ fill: "var(--color-debt)", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ChartContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-slate-500">
            No project data available
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OutstandingDebtChart;
