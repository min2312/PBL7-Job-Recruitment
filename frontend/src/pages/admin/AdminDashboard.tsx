import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, Routes, Route, useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Shield } from 'lucide-react';
import { AdminOverview } from './AdminOverview';
import { AdminUsers } from './AdminUsers';
import { AdminJobs } from './AdminJobs';
import AdminJobDetail from './AdminJobDetail';
import { AdminCompanies } from './AdminCompanies';
import { AdminCompaniesDetail } from './AdminCompaniesDetail';
// import { AdminApplications } from './AdminApplications';
// import { AdminReports } from './AdminReports';
import { AdminSettings } from './AdminSettings';

export default function AdminDashboard() {
  const { user, isAuthReady } = useAuth();
  const location = useLocation();
  const mainRef = useRef<HTMLDivElement>(null);

  // Tự động cuộn lên đầu trang khi chuyển Route
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Đang kiểm tra phiên đăng nhập...
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') return <Navigate to="/login" />;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
          <header className="sticky top-0 z-20 h-14 w-full flex items-center border-b border-border px-4 gap-4 bg-card shrink-0">
            <SidebarTrigger />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-heading text-sm font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-xs text-muted-foreground">Quản trị hệ thống JobHub</p>
              </div>
            </div>
          </header>
          <main
            ref={mainRef}
            className="flex-1 overflow-y-scroll"
          >
            <div className="p-6">
              <Routes>
                <Route index element={<AdminOverview />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="jobs" element={<AdminJobs />} />
                <Route path="jobs/:id" element={<AdminJobDetail />} />
                <Route path="companies" element={<AdminCompanies />} />
                <Route path="companies/:id" element={<AdminCompaniesDetail />} />
                {/* <Route path="applications" element={<AdminApplications />} /> */}
                {/* <Route path="reports" element={<AdminReports />} /> */}
                <Route path="settings" element={<AdminSettings />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
