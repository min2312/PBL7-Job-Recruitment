import { useAuth } from '@/hooks/useAuth';
import { Navigate, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { EmployerSidebar } from '@/components/EmployerSidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, User, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect, useMemo } from 'react';
import axiosClient from '@/services/axiosClient';
import EmployerOverview from '@/pages/employer/EmployerOverview';
import EmployerJobs from '@/pages/employer/EmployerJobs';
import EmployerJobDetail from '@/pages/employer/EmployerJobDetail';
import EmployerJobCreate from '@/pages/employer/EmployerJobCreate';
import EmployerJobEdit from '@/pages/employer/EmployerJobEdit';
import EmployerCandidates from '@/pages/employer/EmployerCandidates';
import EmployerCandidateDetail from '@/pages/employer/EmployerCandidateDetail';
import EmployerMessages from '@/pages/employer/EmployerMessages';
import EmployerSchedule from '@/pages/employer/EmployerSchedule';
import EmployerReports from '@/pages/employer/EmployerReports';
import EmployerSettings from '@/pages/employer/EmployerSettings';

export default function EmployerDashboard() {
  const { user, isAuthReady } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [jobPage, setJobPage] = useState(1);
  const [jobLimit, setJobLimit] = useState(10);

  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [totalApps, setTotalApps] = useState(0);
  const [appPage, setAppPage] = useState(1);
  const [appLimit, setAppLimit] = useState(9);

  const [isLoadingData, setIsLoadingData] = useState(true);

  const fetchJobs = async (page = 1, limit = 10, search = '', status = '') => {
    setIsLoadingData(true);
    try {
      const res = await axiosClient.get(`/api/employer/jobs?page=${page}&limit=${limit}&search=${search}&status=${status}`);
      if (res.data.errCode === 0) {
        setMyJobs(res.data.data.jobs || []);
        setTotalJobs(res.data.data.total || 0);
        setJobPage(page);
        setJobLimit(limit);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const fetchApplications = async (page = 1, limit = 9, search = '', status = '') => {
    setIsLoadingData(true);
    try {
      const res = await axiosClient.get(`/api/employer/applications?page=${page}&limit=${limit}&search=${search}&status=${status}`);
      if (res.data.errCode === 0) {
        setMyApplications(res.data.data.applications || []);
        setTotalApps(res.data.data.total || 0);
        setAppPage(page);
        setAppLimit(limit);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const fetchData = async () => {
    if (!user || user.role !== 'EMPLOYER') return;
    await Promise.all([fetchJobs(1, 10), fetchApplications(1, 9)]);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Đang kiểm tra phiên đăng nhập...
      </div>
    );
  }

  if (!user || user.role !== 'EMPLOYER') return <Navigate to="/login" />;

  const company = user.company;
  
  // Get today's date
  const todayStr = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  })();

  // Mock interview data (keep for now as requested)
  const mockInterviews: any[] = []; 
  const todayInterviews = mockInterviews.filter(i => i.date === todayStr);

  // New applications (mock: applications created in last 24 hours)
  const newApplications = myApplications.filter(app => {
    const createdDate = new Date(app.createdAt);
    const now = new Date();
    return (now.getTime() - createdDate.getTime()) < (24 * 60 * 60 * 1000);
  }).slice(0, 5);

  // Close notification when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
    };

    if (notificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [notificationOpen]);

  // Close notification when route changes
  useEffect(() => {
    setNotificationOpen(false);
  }, [location.pathname]);

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
              {/* Notification Bell */}
              <div className="relative" ref={notificationRef}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative h-8 w-8 hover:bg-muted"
                  onClick={() => setNotificationOpen(!notificationOpen)}
                >
                  <Bell className="w-4 h-4" />
                  {todayInterviews.length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive animate-pulse" />
                  )}
                </Button>

                {/* Notification Dropdown */}
                {notificationOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 shadow-xl rounded-xl z-50 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-2.5 border-b border-slate-200">
                      <h3 className="font-semibold text-sm text-foreground">Thông báo</h3>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-80 overflow-y-auto">
                      {/* Today's interviews */}
                      {todayInterviews.length > 0 && (
                        <div 
                          className="px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => {
                            navigate('schedule');
                            setNotificationOpen(false);
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                              <Bell className="w-4 h-4 text-amber-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">Lịch phỏng vấn hôm nay</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Bạn có <span className="font-semibold text-amber-600">{todayInterviews.length} buổi phỏng vấn</span> được lên lịch
                              </p>
                              <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                                {todayInterviews.map(i => (
                                  <p key={i.id}>{i.time} - {i.candidateName}</p>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* New applications */}
                      {newApplications.length > 0 && (
                        <div 
                          className="px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => {
                            navigate('candidates');
                            setNotificationOpen(false);
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">Ứng viên mới ứng tuyển</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                <span className="font-semibold text-blue-600">{newApplications.length} ứng viên</span> vừa ứng tuyển
                              </p>
                              <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                                {newApplications.map(app => {
                                  const job = myJobs.find(j => j.id === app.jobId);
                                  return (
                                    <p key={app.id}>{users.find(u => u.id === app.userId)?.name || 'Ứng viên'} - {job?.title || 'Vị trí'}</p>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* No notifications */}
                      {todayInterviews.length === 0 && newApplications.length === 0 && (
                        <div className="px-4 py-6 text-center">
                          <p className="text-sm text-muted-foreground">Không có thông báo mới</p>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-slate-200 px-4 py-2.5 bg-slate-50 text-center">
                      <button 
                        className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                        onClick={() => {
                          navigate('schedule');
                          setNotificationOpen(false);
                        }}
                      >
                        Xem tất cả thông báo
                      </button>
                    </div>
                  </div>
                )}
              </div>

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
              <Route path="jobs" element={<EmployerJobs myJobs={myJobs} total={totalJobs} page={jobPage} limit={jobLimit} onPageChange={fetchJobs} refreshData={fetchData} />} />
              <Route path="jobs/create" element={<EmployerJobCreate refreshData={fetchData} />} />
              <Route path="jobs/:id" element={<EmployerJobDetail refreshData={fetchData} />} />
              <Route path="jobs/edit/:id" element={<EmployerJobEdit refreshData={fetchData} />} />
              <Route path="candidates" element={<EmployerCandidates myApplications={myApplications} total={totalApps} page={appPage} limit={appLimit} onPageChange={fetchApplications} refreshData={fetchData} />} />
              <Route path="candidates/:id" element={<EmployerCandidateDetail refreshData={fetchData} />} />
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
