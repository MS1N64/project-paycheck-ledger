
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Clock, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Reminder {
  id: string;
  projectId: string;
  projectAddress: string;
  type: "overdue" | "upcoming" | "milestone";
  message: string;
  date: string;
  priority: "high" | "medium" | "low";
}

interface PaymentRemindersProps {
  projects: any[];
}

const PaymentReminders = ({ projects }: PaymentRemindersProps) => {
  const { toast } = useToast();
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    // Generate reminders based on project data
    const newReminders: Reminder[] = [];
    
    projects.forEach(project => {
      const daysSinceLastPayment = project.lastPayment !== "No payments yet" 
        ? Math.floor((new Date().getTime() - new Date(project.lastPayment).getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      
      // Overdue payment reminder
      if (project.totalRemaining > 0 && daysSinceLastPayment > 30) {
        newReminders.push({
          id: `overdue-${project.id}`,
          projectId: project.id,
          projectAddress: project.address,
          type: "overdue",
          message: `Payment overdue by ${daysSinceLastPayment - 30} days`,
          date: new Date().toLocaleDateString(),
          priority: "high"
        });
      }
      
      // Upcoming milestone reminder
      if (project.status === "In Progress" && project.totalRemaining > 0) {
        newReminders.push({
          id: `upcoming-${project.id}`,
          projectId: project.id,
          projectAddress: project.address,
          type: "upcoming",
          message: "Next payment milestone approaching",
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          priority: "medium"
        });
      }
    });
    
    setReminders(newReminders);
  }, [projects]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-amber-100 text-amber-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "overdue": return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "upcoming": return <Clock className="h-4 w-4 text-amber-600" />;
      default: return <Bell className="h-4 w-4 text-blue-600" />;
    }
  };

  const dismissReminder = (reminderId: string) => {
    setReminders(prev => prev.filter(r => r.id !== reminderId));
    toast({
      title: "Reminder Dismissed",
      description: "Reminder has been removed.",
    });
  };

  if (reminders.length === 0) {
    return (
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-800 flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Payment Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-slate-500">
            <Bell className="h-12 w-12 mx-auto mb-2 text-slate-300" />
            <p>No active reminders</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-slate-800 flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Payment Reminders ({reminders.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {reminders.map((reminder) => (
          <div key={reminder.id} className="flex items-start justify-between p-3 border border-slate-200 rounded-lg">
            <div className="flex items-start gap-3">
              {getTypeIcon(reminder.type)}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-slate-800">{reminder.projectAddress}</h4>
                  <Badge className={getPriorityColor(reminder.priority)}>
                    {reminder.priority}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600">{reminder.message}</p>
                <p className="text-xs text-slate-500 mt-1">Due: {reminder.date}</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => dismissReminder(reminder.id)}
              className="border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              Dismiss
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PaymentReminders;
