
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import ProjectDetail from "./pages/ProjectDetail";
import DataBackupPage from "./pages/DataBackup";
import NotFound from "./pages/NotFound";
import SearchFilterPage from "./pages/SearchFilter";
import Analytics from "./pages/Analytics";
import ClientSummary from "./pages/ClientSummary";

const queryClient = new QueryClient();

const AppContent = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Index />
        </ProtectedRoute>
      } />
      <Route path="/project/:id" element={
        <ProtectedRoute>
          <ProjectDetail />
        </ProtectedRoute>
      } />
      <Route path="/backup" element={
        <ProtectedRoute>
          <DataBackupPage />
        </ProtectedRoute>
      } />
      <Route path="/search" element={
        <ProtectedRoute>
          <SearchFilterPage />
        </ProtectedRoute>
      } />
      <Route path="/analytics" element={
        <ProtectedRoute>
          <Analytics />
        </ProtectedRoute>
      } />
      <Route path="/clients" element={
        <ProtectedRoute>
          <ClientSummary />
        </ProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
    <Toaster />
    <Sonner />
  </BrowserRouter>
);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
