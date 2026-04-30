import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobs, users } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, TrendingUp, Clock, Check, X, Eye, Activity, Zap, AlertCircle } from 'lucide-react';

const statusConfig = {
  pending: { label: 'Đang chờ', className: 'bg-warning/10 text-warning border-warning/20' },
  approved: { label: 'Đã duyệt', className: 'bg-success/10 text-success border-success/20' },
  rejected: { label: 'Từ chối', className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

const jobStatusConfig = {
  open: { label: 'Đang mở', className: 'bg-success/10 text-success border-success/20' },
  closed: { label: 'Đã đóng', className: 'bg-muted text-muted-foreground border-border' },
};

interface Props {
  myJobs: typeof jobs;
  myApplications: { id: number; userId: number; jobId: number; status: string; createdAt: string }[];
}

export default function EmployerOverview({ myJobs, myApplications }: Props) {
  const navigate = useNavigate();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const approvedCount = myApplications.filter(a => a.status === 'approved').length;
  const pendingCount = myApplications.filter(a => a.status === 'pending').length;
  const applicationRate = myJobs.length > 0 ? Math.round((myApplications.length / myJobs.length) * 100) : 0;
  
  // Mock data for views and conversion
  const totalViews = 245;
  const conversionRate = myApplications.length > 0 ? Math.round((myApplications.length / totalViews) * 100) : 0;
  const avgHiringTime = '18 ngày';
  const bestJob = myJobs.length > 0 ? myJobs[0] : null;

  const stats = [
    { icon: FileText, label: 'Tin đăng', value: myJobs.length, bg: 'bg-primary/10', color: 'text-primary', action: () => navigate('/employer/jobs') },
    { icon: Users, label: 'Ứng viên', value: myApplications.length, bg: 'bg-info/10', color: 'text-info', action: () => navigate('/employer/candidates') },
    { icon: TrendingUp, label: 'Tỷ lệ ứng tuyển', value: `${applicationRate}%`, bg: 'bg-success/10', color: 'text-success', action: () => navigate('/employer/reports') },
    { icon: Clock, label: 'Đang chờ duyệt', value: pendingCount, bg: 'bg-warning/10', color: 'text-warning', action: () => navigate('/employer/candidates') },
    { icon: Eye, label: 'Lượt xem', value: totalViews, bg: 'bg-violet-50', color: 'text-violet-600', action: () => navigate('/employer/reports') },
    { icon: Activity, label: 'Tỷ lệ chuyển đổi', value: `${conversionRate}%`, bg: 'bg-cyan-50', color: 'text-cyan-600', action: () => navigate('/employer/reports') },
    { icon: Zap, label: 'TG.TB tuyển được', value: avgHiringTime, bg: 'bg-orange-50', color: 'text-orange-600', action: () => navigate('/employer/reports') },
  ];

  const topJobs = myJobs.length > 0 ? [{ ...myJobs[0], views: 85, applications: myApplications.filter(a => a.jobId === myJobs[0].id).length }] : [];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-heading font-bold text-foreground tracking-tight">Tổng quan</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{myJobs.length} tin đăng, {myApplications.length} ứng viên</p>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {stats.map(stat => (
          <button
            key={stat.label}
            onClick={stat.action}
            className="hover:shadow-md transition-all active:scale-95"
          >
            <Card className="hover:border-primary/30 transition-colors cursor-pointer h-full">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div className="text-left">
                    <p className="text-xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      {/* Notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-blue-50/50 border border-blue-200">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-blue-900">Có ứng viên mới</p>
            <p className="text-xs text-blue-700 mt-0.5">3 ứng viên mới hôm nay</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-r from-orange-50 to-orange-50/50 border border-orange-200">
          <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-orange-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-orange-900">Job sắp hết hạn</p>
            <p className="text-xs text-orange-700 mt-0.5">2 tin tuyển dụng có hiệu lực còn lại &lt; 7 ngày</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-heading font-semibold">Đơn ứng tuyển gần đây</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {myApplications.slice(0, 5).map(app => {
              const job = jobs.find(j => j.id === app.jobId);
              const applicant = users.find(u => u.id === app.userId);
              const config = statusConfig[app.status as keyof typeof statusConfig];
              return (
                <button
                  key={app.id}
                  onClick={() => navigate('/employer/candidates')}
                  className="w-full text-left hover:bg-muted/60 transition-colors rounded-lg"
                >
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/40 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                      {applicant?.name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground">{applicant?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{job?.title}</p>
                    </div>
                    <Badge variant="outline" className={`text-[11px] shrink-0 ${config.className}`}>{config.label}</Badge>
                    {app.status === 'pending' && (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-success hover:bg-success/10" onClick={e => e.stopPropagation()}>
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={e => e.stopPropagation()}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Job Posts */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-heading font-semibold">Tin tuyển dụng gần đây</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {myJobs.slice(0, 5).map(job => {
              const applicantCount = myApplications.filter(a => a.jobId === job.id).length;
              const status = jobStatusConfig.open; // mock all as open
              return (
                <button
                  key={job.id}
                  onClick={() => navigate('/employer/jobs')}
                  className="w-full text-left hover:bg-muted/40 transition-colors rounded-lg"
                >
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/40 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground">{job.title}</p>
                      <p className="text-xs text-muted-foreground">{job.salary}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium text-foreground">{applicantCount}</p>
                      <p className="text-[11px] text-muted-foreground">ứng viên</p>
                    </div>
                    <Badge variant="outline" className={`text-[11px] shrink-0 ${status.className}`}>{status.label}</Badge>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
