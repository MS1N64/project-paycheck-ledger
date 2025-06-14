
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DataBackup from "@/components/DataBackup";

const DataBackupPage = () => {
  const navigate = useNavigate();

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
            <h1 className="text-3xl font-bold text-slate-800">Data Backup & Security</h1>
            <p className="text-slate-600 mt-1">Manage your data backups and security settings</p>
          </div>
        </div>

        <div className="max-w-2xl">
          <DataBackup />
        </div>
      </div>
    </div>
  );
};

export default DataBackupPage;
