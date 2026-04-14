import { useParams, useNavigate, Link } from 'react-router-dom';
import { jobs, applications, getCompanyById, getCategoryById, getLocationById, users } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft, Pencil, XCircle, RotateCcw, Briefcase, MapPin, DollarSign, Users as UsersIcon,
  Clock, Building2, FileText, Star, Gift, CalendarDays, CheckCircle, Plus
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function EmployerJobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const job = jobs.find(j => j.id === Number(id));

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Briefcase className="w-12 h-12 opacity-30 mb-3" />
        <p className="text-lg font-medium">Không tìm thấy tin tuyển dụng</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/employer/jobs')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách
        </Button>
      </div>
    );
  }

  const company = getCompanyById(job.companyId);
  const categoryNames = job.categoryIds.map(id => getCategoryById(id)?.name).filter(Boolean);
  const locationNames = job.locationIds.map(id => getLocationById(id)?.name).filter(Boolean);
  const jobApps = applications.filter(a => a.jobId === job.id);
  const isOpen = jobs.indexOf(job) % 3 !== 0;

  const sections = [
    { title: 'Mô tả công việc', icon: FileText, content: job.description, color: 'text-primary', bgColor: 'bg-primary/10' },
    { title: 'Yêu cầu ứng viên', icon: Star, content: job.requirement, color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-950' },
    { title: 'Quyền lợi', icon: Gift, content: job.benefit, color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-50 dark:bg-emerald-950' },
    { title: 'Địa điểm làm việc', icon: MapPin, content: job.workLocation, color: 'text-violet-600 dark:text-violet-400', bgColor: 'bg-violet-50 dark:bg-violet-950' },
    { title: 'Thời gian làm việc', icon: Clock, content: job.workTime, color: 'text-sky-600 dark:text-sky-400', bgColor: 'bg-sky-50 dark:bg-sky-950' },
  ];

  const overviewItems = [
    { label: 'Ngành nghề', value: categoryNames.join(', ') || '—' },
    { label: 'Kinh nghiệm', value: job.experience },
    { label: 'Hình thức', value: job.employmentType },
    { label: 'Cấp bậc', value: job.level },
    { label: 'Học vấn', value: job.education },
    { label: 'Số lượng', value: `${job.quantity} người` },
  ];

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/employer/jobs" className="hover:text-foreground transition-colors flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Danh sách tin
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate">{job.title}</span>
      </div>

      {/* Header Card */}
      <Card className="rounded-xl border-border/60 shadow-sm">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-3 sm:gap-4 min-w-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                {company?.logo ? (
                  <img src={company.logo} alt="" className="w-8 h-8 sm:w-10 sm:h-10 object-contain rounded" />
                ) : (
                  <Briefcase className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-xl font-bold text-foreground">{job.title}</h1>
                  <Badge
                    variant="outline"
                    className={
                      isOpen
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400'
                        : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400'
                    }
                  >
                    {isOpen ? 'Đang mở' : 'Đã đóng'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{company?.name}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> {job.salary}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {locationNames.join(', ')}</span>
                  <span className="flex items-center gap-1.5"><UsersIcon className="w-3.5 h-3.5" /> {jobApps.length} ứng viên</span>
                  <span className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" /> {job.createdAt}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start gap-2 shrink-0 self-start">
              <Button onClick={() => navigate('/employer/jobs/create')} className="gap-2 w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700" size="sm">
                <Plus className="w-4 h-4" /> Tạo tin mới
              </Button>
              <Button onClick={() => navigate(`/employer/jobs/edit/${job.id}`)} className="gap-2 w-full sm:w-auto" size="sm">
                <Pencil className="w-4 h-4" /> Chỉnh sửa
              </Button>
              <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
                {isOpen ? <><XCircle className="w-4 h-4" /> Đóng tin</> : <><RotateCcw className="w-4 h-4" /> Mở lại</>}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 items-start">
        {/* Left Column - Main Content */}
        <Card className="rounded-xl border-border/60 shadow-sm">
          <CardContent className="p-4 sm:p-6 space-y-0">
            {/* Overview Grid */}
            <div>
              <h2 className="text-base font-semibold flex items-center gap-2 text-foreground mb-4">
                <Building2 className="w-4 h-4 text-primary" /> Thông tin chung
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
                {overviewItems.map(item => (
                  <div key={item.label}>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Continuous Sections */}
            {sections.map((section) => (
              <div key={section.title}>
                <Separator className="my-5" />
                <div>
                  <h2 className="text-base font-semibold flex items-center gap-2 text-foreground mb-3">
                    <div className={`w-7 h-7 rounded-md ${section.bgColor} flex items-center justify-center shrink-0`}>
                      <section.icon className={`w-4 h-4 ${section.color}`} />
                    </div>
                    {section.title}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line pl-0 sm:pl-9">
                    {section.content}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Right Column - Applicants Sidebar */}
        <div className="lg:sticky lg:top-20">
          <Card className="rounded-xl border-border/60 shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <h2 className="text-base font-semibold flex items-center gap-2 text-foreground mb-4">
                <UsersIcon className="w-4 h-4 text-primary" /> Ứng viên đã ứng tuyển ({jobApps.length})
              </h2>

              {jobApps.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Chưa có ứng viên nào</p>
              ) : (
                <div className="space-y-3">
                  {jobApps.map(app => {
                    const candidate = users.find(u => u.id === app.userId);
                    return (
                      <div
                        key={app.id}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border/60 hover:bg-muted/40 transition-colors"
                      >
                        <Avatar className="w-9 h-9 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {candidate?.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">{candidate?.name || 'Ứng viên'}</p>
                          <p className="text-xs text-muted-foreground">{app.createdAt}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="shrink-0 text-xs gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Duyệt
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
