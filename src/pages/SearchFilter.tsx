
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SearchFilter from "@/components/SearchFilter";

const SearchFilterPage = () => {
  const navigate = useNavigate();

  const handleFilterChange = (filters: any) => {
    console.log('Filters applied:', filters);
    // Note: This page is standalone, so filters don't affect the main dashboard
    // Users would need to go back to dashboard to see filtered results
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="mb-4 border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Search & Filter</h1>
            <p className="text-slate-600 mt-1">Configure search and filter settings for your projects</p>
          </div>
        </div>

        <div className="max-w-2xl">
          <SearchFilter onFilterChange={handleFilterChange} />
        </div>
      </div>
    </div>
  );
};

export default SearchFilterPage;
