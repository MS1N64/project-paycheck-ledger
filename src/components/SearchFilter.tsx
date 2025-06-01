
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";

interface SearchFilterProps {
  onFilterChange: (filters: any) => void;
}

const SearchFilter = ({ onFilterChange }: SearchFilterProps) => {
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    dateFrom: "",
    dateTo: "",
    minAmount: "",
    maxAmount: ""
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: "",
      status: "all",
      dateFrom: "",
      dateTo: "",
      minAmount: "",
      maxAmount: ""
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== "" && value !== "all");

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-slate-800 flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Search & Filter
          {hasActiveFilters && (
            <Button
              size="sm"
              variant="outline"
              onClick={clearFilters}
              className="ml-auto border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search projects by address..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="pl-10 border-slate-300 focus:border-slate-500"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Status</label>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
              <SelectTrigger className="border-slate-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Date From</label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              className="border-slate-300 focus:border-slate-500"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Date To</label>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange("dateTo", e.target.value)}
              className="border-slate-300 focus:border-slate-500"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Min Amount (£)</label>
            <Input
              type="number"
              placeholder="0"
              value={filters.minAmount}
              onChange={(e) => handleFilterChange("minAmount", e.target.value)}
              className="border-slate-300 focus:border-slate-500"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Max Amount (£)</label>
            <Input
              type="number"
              placeholder="No limit"
              value={filters.maxAmount}
              onChange={(e) => handleFilterChange("maxAmount", e.target.value)}
              className="border-slate-300 focus:border-slate-500"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchFilter;
