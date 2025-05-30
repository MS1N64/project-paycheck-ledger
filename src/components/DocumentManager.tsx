
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Upload, Download, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  projectId: string;
}

interface DocumentManagerProps {
  projectId: string;
}

const DocumentManager = ({ projectId }: DocumentManagerProps) => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    // Simulate file upload
    setTimeout(() => {
      const newDoc: Document = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        size: file.size,
        uploadDate: new Date().toLocaleDateString(),
        projectId
      };
      
      setDocuments(prev => [...prev, newDoc]);
      setUploading(false);
      
      toast({
        title: "Document Uploaded",
        description: `${file.name} has been uploaded successfully.`,
      });
    }, 1500);
  };

  const handleDeleteDocument = (docId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
    toast({
      title: "Document Deleted",
      description: "Document has been removed.",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-slate-800 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Documents
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="file-upload" className="text-slate-700">Upload Document</Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="file-upload"
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              className="border-slate-300 focus:border-slate-500"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
            />
            <Button
              type="button"
              disabled={uploading}
              className="bg-slate-800 hover:bg-slate-700"
            >
              <Upload className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {documents.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <FileText className="h-12 w-12 mx-auto mb-2 text-slate-300" />
            <p>No documents uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-slate-600" />
                  <div>
                    <p className="font-medium text-slate-800">{doc.name}</p>
                    <p className="text-xs text-slate-500">
                      {formatFileSize(doc.size)} • {doc.uploadDate}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="border-slate-300 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentManager;
