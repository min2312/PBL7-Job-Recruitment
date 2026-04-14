import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import HeaderMNP from "@/components/HeaderMNP";
import Footer from "@/components/Footer";
import HomePage from "@/pages/HomePage";
import JobListPage from "@/pages/JobListPage";
import JobDetailPage from "@/pages/JobDetailPage";
import SavedJobsPage from "@/pages/SavedJobsPage";
import LoginPage from "@/pages/LoginPage";
import EmployerDashboard from "@/pages/EmployerDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import InsightsPage from "@/pages/InsightsPage";
import CompaniesPage from "@/pages/CompaniesPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Dashboards with their own sidebar layout */}
            <Route path="/employer/*" element={<EmployerDashboard />} />
            <Route path="/admin/*" element={<AdminDashboard />} />

            {/* Public pages - HomePage manages its own header */}
            <Route path="/" element={<HomePage />} />
            
            {/* Other public pages with HeaderMNP */}
            <Route path="*" element={
              <div className="min-h-screen flex flex-col">
                <HeaderMNP />
                <main className="flex-1">
                  <Routes>
                    <Route path="/jobs" element={<JobListPage />} />
                    <Route path="/jobs/:id" element={<JobDetailPage />} />
                    <Route path="/saved-jobs" element={<SavedJobsPage />} />
                    <Route path="/companies" element={<CompaniesPage />} />
                    <Route path="/insights" element={<InsightsPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
