
import SearchFilter from "@/components/SearchFilter";
import PaymentReminders from "@/components/PaymentReminders";
import TaxReporting from "@/components/TaxReporting";
import { Project, Payment, FilterState } from "@/types";

interface DashboardSidebarProps {
  projects: Project[];
  allPayments: Payment[];
  onFilterChange: (filters: FilterState) => void;
}

const DashboardSidebar = ({ projects, allPayments, onFilterChange }: DashboardSidebarProps) => {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <SearchFilter onFilterChange={onFilterChange} />
        </div>
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
