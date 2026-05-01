import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { PageLoadProvider, usePageLoad } from "@/contexts/PageLoadContext";
import HeaderMNP from "@/components/HeaderMNP";
import Footer from "@/components/Footer";
import HomePage from "@/pages/HomePage";
import JobListPage from "@/pages/JobListPage";
import JobDetailPage from "@/pages/JobDetailPage";
import SavedJobsPage from "@/pages/SavedJobsPage";
import ApplicationsPage from "@/pages/ApplicationsPage";
import LoginPage from "@/pages/LoginPage";
import EmployerDashboard from "@/pages/EmployerDashboard";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import InsightsPage from "@/pages/InsightsPage";
import CompaniesPage from "@/pages/CompaniesPage";
import CompanyDetailPage from "@/pages/CompanyDetailPage";
import JobSearchPage from "@/pages/JobSearchPage";
import RegisterPage from "@/pages/RegisterPage";
import CandidateProfile from "@/pages/CandidateProfile";
import NotFound from "@/pages/NotFound";
import { Bounce, ToastContainer } from "react-toastify";
import PrivateRoutes from "./routes/PrivateRoutes";

const queryClient = new QueryClient();

// Add animation styles
const styles = `
  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-page-load {
    animation: fadeInDown 0.6s ease-out;
  }
`;

// Main content wrapper component
function MainContent() {
  const { isLoading } = usePageLoad();
  
  return (
    <div className="min-h-screen flex flex-col">
      <HeaderMNP />
      <main className={`flex-1 ${isLoading ? 'animate-page-load' : ''}`}>
        <Routes>
          {/* Public Routes */}
          <Route path="/jobs" element={<JobListPage />} />
          <Route path="/job-search" element={<JobSearchPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/companies/:id" element={<CompanyDetailPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Private Routes */}
          <Route element={<PrivateRoutes />}>
            <Route path="/saved-jobs" element={<SavedJobsPage />} />
            <Route path="/applications" element={<ApplicationsPage />} />
            <Route path="/candidate/profile" element={<CandidateProfile />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <style>{styles}</style>
    <TooltipProvider>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        transition={Bounce}
      />
      <BrowserRouter>
        <AuthProvider>
          <PageLoadProvider>
            <Toaster />
            <Sonner />

            <Routes>
              {/* Dashboards - Được bảo vệ bằng PrivateRoutes */}
              <Route element={<PrivateRoutes />}>
                <Route path="/employer/*" element={<EmployerDashboard />} />
                <Route path="/admin/*" element={<AdminDashboard />} />
              </Route>

              {/* Public pages - HomePage manages its own header */}
              <Route path="/" element={<HomePage />} />

              {/* Other public pages with HeaderMNP */}
              <Route path="*" element={<MainContent />} />
            </Routes>
          </PageLoadProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;