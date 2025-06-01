
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Upload, Shield } from "lucide-react";
import { SecureStorage } from "@/lib/dataIntegrity";
import { useToast } from "@/hooks/use-toast";

const DataBackup = () => {
  const { toast } = useToast();
  const [importFile, setImportFile] = useState<File | null>(null);

  const handleExport = () => {
    try {
      const backupData = SecureStorage.exportData();
      const blob = new Blob([backupData], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `project-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Backup Created",
        description: "Your data has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to create backup. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toast({
        title: "No File Selected",
        description: "Please select a backup file to import.",
        variant: "destructive"
      });
      return;
    }

    try {
      const fileContent = await importFile.text();
      const result = SecureStorage.importData(fileContent);
      
      if (result.success) {
        toast({
          title: "Import Successful",
          description: result.message,
        });
        // Refresh the page to load new data
        window.location.reload();
      } else {
        toast({
          title: "Import Failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to read backup file.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <Shield className="h-5 w-5" />
          Data Backup & Security
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-slate-700 mb-2">Export Your Data</h4>
          <p className="text-sm text-slate-600 mb-3">
            Create a secure backup of all your projects and payments.
          </p>
          <Button onClick={handleExport} variant="outline" className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Export Backup
          </Button>
        </div>
        
        <div>
          <h4 className="font-semibold text-slate-700 mb-2">Import Data</h4>
          <p className="text-sm text-slate-600 mb-3">
            Restore your data from a backup file.
          </p>
          <div className="space-y-3">
            <div>
              <Label htmlFor="backup-file" className="text-slate-700">Select Backup File</Label>
              <Input
                id="backup-file"
                type="file"
                accept=".json"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="border-slate-300"
              />
            </div>
            <Button 
              onClick={handleImport} 
              variant="outline" 
              className="w-full"
              disabled={!importFile}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Backup
            </Button>
          </div>
        </div>
        
        <div className="bg-blue-50 p-3 rounded text-sm">
          <p className="text-blue-800">
            <strong>Security Note:</strong> Your data is stored locally on your device. 
            Regular backups ensure you don't lose important information.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataBackup;
