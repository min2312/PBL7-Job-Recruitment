import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, TrendingUp, Clock, Briefcase } from 'lucide-react';

const statusConfig = {
  pending: { label: 'Đang chờ', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  interview: { label: 'Phỏng vấn', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  approved: { label: 'Đã duyệt', className: 'bg-green-100 text-green-700 border-green-200' },
  rejected: { label: 'Từ chối', className: 'bg-red-100 text-red-700 border-red-200' },
};

const jobStatusConfig = {
  open: { label: 'Đang tuyển', className: 'bg-green-100 text-green-700 border-green-200' },
  closed: { label: 'Đã đóng', className: 'bg-slate-100 text-slate-700 border-slate-200' },
};

interface Props {
  myJobs: any[];
  myApplications: any[];
}

export default function EmployerOverview({ myJobs, myApplications }: Props) {
  const navigate = useNavigate();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const pendingCount = myApplications.filter(a => a.status === 'pending').length;
  const applicationRate = myJobs.length > 0 ? Math.round((myApplications.length / myJobs.length) * 10) / 10 : 0;
  
  const stats = [
    { icon: FileText, label: 'Tin tuyển dụng', value: myJobs.length, color: 'text-blue-600', bg: 'bg-blue-50', action: () => navigate('/employer/jobs') },
    { icon: Users, label: 'Hồ sơ ứng tuyển', value: myApplications.length, color: 'text-emerald-600', bg: 'bg-emerald-50', action: () => navigate('/employer/candidates') },
    { icon: TrendingUp, label: 'TB. Ứng viên/Tin', value: applicationRate, color: 'text-purple-600', bg: 'bg-purple-50', action: () => navigate('/employer/reports') },
    { icon: Clock, label: 'Chờ xử lý', value: pendingCount, color: 'text-amber-600', bg: 'bg-amber-50', action: () => navigate('/employer/candidates') },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Tổng quan</h2>
          <p className="text-sm text-muted-foreground">Chào mừng bạn trở lại trang quản trị tuyển dụng</p>
        </div>
        <Button onClick={() => navigate('/employer/jobs/create')} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" /> Đăng tin mới
        </Button>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <Card 
            key={stat.label} 
            className="cursor-pointer hover:shadow-md transition-all"
            onClick={stat.action}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground font-medium uppercase">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Ứng viên mới nhất</CardTitle>
              <Button variant="link" size="sm" onClick={() => navigate('/employer/candidates')}>Xem tất cả</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {myApplications.slice(0, 5).map(app => {
              const job = app.Job;
              const applicant = app.User;
              const config = statusConfig[app.status as keyof typeof statusConfig] || statusConfig.pending;
              return (
                <div
                  key={app.id}
                  onClick={() => navigate(`/employer/candidates/${app.id}`)}
                  className="flex items-center gap-4 p-3 rounded-lg border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 shrink-0 overflow-hidden">
                    {applicant?.profilePicture ? (
                      <img src={applicant.profilePicture} alt="" className="w-full h-full object-cover" />
                    ) : (
                      applicant?.name?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{applicant?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">Ứng tuyển: {job?.title}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className={config.className}>
                      {config.label}
                    </Badge>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(app.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              );
            })}
            {myApplications.length === 0 && (
              <div className="py-10 text-center text-muted-foreground text-sm">
                Chưa có ứng viên nào ứng tuyển.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Job Posts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tin đăng mới nhất</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {myJobs.slice(0, 5).map(job => {
              const status = jobStatusConfig[job.status as keyof typeof jobStatusConfig] || jobStatusConfig.open;
              return (
                <div
                  key={job.id}
                  onClick={() => navigate(`/employer/jobs/${job.id}`)}
                  className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all cursor-pointer group"
                >
                  <p className="font-medium text-sm truncate group-hover:text-blue-600 transition-colors">{job.title}</p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline" className={`text-[10px] ${status.className}`}>{status.label}</Badge>
                    <span className="text-xs font-bold text-slate-700">{job.applicantCount || 0} ứng viên</span>
                  </div>
                </div>
              );
            })}
            {myJobs.length === 0 && (
              <div className="py-10 text-center text-muted-foreground text-sm">
                Bạn chưa đăng tin tuyển dụng nào.
              </div>
            )}
            <Button variant="outline" className="w-full mt-2 h-9" onClick={() => navigate('/employer/jobs')}>
              Quản lý tin đăng
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper icons
function Plus(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
