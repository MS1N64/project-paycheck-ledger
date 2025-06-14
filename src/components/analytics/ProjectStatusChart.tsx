
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Project } from "@/types";

interface ProjectStatusChartProps {
  projects: Project[];
}

const ProjectStatusChart = ({ projects }: ProjectStatusChartProps) => {
  const statusData = projects.reduce((acc, project) => {
    acc[project.status] = (acc[project.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(statusData).map(([status, count]) => ({
    status,
    count,
  }));

  const chartConfig = {
    count: {
      label: "Project Count",
    },
    Pending: {
      label: "Pending",
      color: "hsl(25, 95%, 53%)", // Orange instead of yellow
    },
    "In Progress": {
      label: "In Progress", 
      color: "hsl(221, 83%, 53%)", // Blue
    },
    Completed: {
      label: "Completed",
      color: "hsl(142, 76%, 36%)", // Green
    },
  };

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-slate-800">Project Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[300px]">
            <BarChart data={chartData}>
              <XAxis dataKey="status" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar 
                dataKey="count" 
                fill="hsl(221, 83%, 53%)"
                radius={4}
              />
            </BarChart>
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

export default ProjectStatusChart;
