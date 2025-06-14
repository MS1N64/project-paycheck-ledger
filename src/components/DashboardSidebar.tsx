
import PaymentReminders from "@/components/PaymentReminders";
import TaxReporting from "@/components/TaxReporting";
import { Project, Payment } from "@/types";

interface DashboardSidebarProps {
  projects: Project[];
  allPayments: Payment[];
}

const DashboardSidebar = ({ projects, allPayments }: DashboardSidebarProps) => {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="space-y-6">
          <PaymentReminders projects={projects} />
        </div>
      </div>

      {allPayments.length > 0 && (
        <div className="mb-8">
          <TaxReporting payments={allPayments} />
        </div>
      )}
    </>
  );
};

export default DashboardSidebar;
