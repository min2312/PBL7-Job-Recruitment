import { useAuth } from '@/hooks/useAuth';
import { Navigate, Routes, Route } from 'react-router-dom';
import { applications, jobs, getCompanyById } from '@/data/mockData';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { EmployerSidebar } from '@/components/EmployerSidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EmployerOverview from '@/pages/employer/EmployerOverview';
import EmployerJobs from '@/pages/employer/EmployerJobs';
import EmployerJobDetail from '@/pages/employer/EmployerJobDetail';
import EmployerJobCreate from '@/pages/employer/EmployerJobCreate';
import EmployerJobEdit from '@/pages/employer/EmployerJobEdit';
import EmployerCandidates from '@/pages/employer/EmployerCandidates';
import EmployerMessages from '@/pages/employer/EmployerMessages';
import EmployerSchedule from '@/pages/employer/EmployerSchedule';
import EmployerReports from '@/pages/employer/EmployerReports';
import EmployerSettings from '@/pages/employer/EmployerSettings';

export default function EmployerDashboard() {
  const { user, isAuthReady } = useAuth();

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Đang kiểm tra phiên đăng nhập...
      </div>
    );
  }

  if (!user || user.role !== 'EMPLOYER') return <Navigate to="/login" />;

  const company = user.companyId ? getCompanyById(user.companyId) : null;
  const myJobs = jobs.filter(j => j.companyId === user.companyId);
  const myJobIds = myJobs.map(j => j.id);
  const myApplications = applications.filter(a => myJobIds.includes(a.jobId));

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <EmployerSidebar />
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-14 flex items-center border-b border-border px-4 gap-4 bg-card sticky top-0 z-10">
            <SidebarTrigger />
            <div className="flex items-center gap-2">
              {company?.logo && (
                <div className="w-7 h-7 rounded-md bg-muted overflow-hidden border border-border">
                  <img src={company.logo} alt="" className="w-full h-full object-contain" />
                </div>
              )}
              <span className="text-sm font-semibold text-foreground hidden sm:inline">{company?.name || 'Nhà tuyển dụng'}</span>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative h-8 w-8">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />
              </Button>
              <Avatar className="w-8 h-8 cursor-pointer">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {user.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
          </header>

          {/* Main */}
          <main className="flex-1 px-6 py-6 overflow-auto">
            <Routes>
              <Route index element={<EmployerOverview myJobs={myJobs} myApplications={myApplications} />} />
              <Route path="jobs" element={<EmployerJobs myJobs={myJobs} />} />
              <Route path="jobs/create" element={<EmployerJobCreate />} />
              <Route path="jobs/:id" element={<EmployerJobDetail />} />
              <Route path="jobs/edit/:id" element={<EmployerJobEdit />} />
              <Route path="candidates" element={<EmployerCandidates />} />
              <Route path="messages" element={<EmployerMessages />} />
              <Route path="schedule" element={<EmployerSchedule />} />
              <Route path="reports" element={<EmployerReports />} />
              <Route path="settings" element={<EmployerSettings />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
