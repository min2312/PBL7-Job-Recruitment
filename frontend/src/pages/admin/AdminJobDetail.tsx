import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { jobs, applications, getCompanyById, getLocationById, users } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft, Trash2, Briefcase, MapPin, DollarSign, Users as UsersIcon,
  Clock, Building2, FileText, Star, Gift, CalendarDays, Mail, Download, MoreVertical, Eye, AlertCircle
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function AdminJobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const job = jobs.find(j => j.id === Number(id));
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Briefcase className="w-12 h-12 opacity-30 mb-3" />
        <p className="text-lg font-medium">Không tìm thấy tin tuyển dụng</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/admin/jobs')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách
        </Button>
      </div>
    );
  }

  const company = getCompanyById(job.companyId);
  const locationNames = job.locationIds.map(id => getLocationById(id)?.name).filter(Boolean);
  const jobApps = applications.filter(a => a.jobId === job.id);

  // Tính toán trạng thái công việc
  const isExpired = job.endDate && new Date(job.endDate) < new Date();
  const daysLeft = job.endDate
    ? Math.ceil((new Date(job.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const getJobStatus = () => {
    if (isExpired) return { text: 'Hết hạn', color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400' };
    if (daysLeft && daysLeft <= 7) return { text: 'Sắp hết hạn', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400' };
    return { text: 'Đang tuyển', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400' };
  };

  const jobStatus = getJobStatus();

  const handleDelete = () => {
    // TODO: Implement delete functionality
    setShowDeleteDialog(false);
    navigate('/admin/jobs');
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link to="/admin/jobs" className="hover:text-foreground transition-colors flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Quản lý việc làm
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">Chi tiết công việc</span>
      </div>

      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-1">Chi tiết tin tuyển dụng</h1>
        <p className="text-sm text-muted-foreground">Xem và kiểm duyệt nội dung chi tiết của công việc</p>
      </div>

      {/* 🧩 1. JOB INFO SECTION */}
      <Card className="rounded-lg border-border/60 shadow-sm">
        <CardContent className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 min-w-0 flex-1">
              <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                {company?.logo ? (
                  <img src={company.logo} alt="" className="w-10 h-10 object-contain rounded" />
                ) : (
                  <Briefcase className="w-8 h-8 text-primary" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <h1 className="text-2xl font-bold text-foreground">{job.title}</h1>
                  <Badge variant="outline" className={jobStatus.color}>
                    {jobStatus.text}
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-3">{company?.name}</p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4" /> {job.salary}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> {locationNames.join(', ')}
                  </span>
                  {daysLeft && (
                    <span className={`flex items-center gap-1.5 ${isExpired ? 'text-red-500' : 'text-emerald-500'}`}>
                      <CalendarDays className="w-4 h-4" />
                      {isExpired ? 'Hết hạn' : `Còn ${daysLeft} ngày`}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Basic Info Grid */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" /> Thông tin chung
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Vị trí</p>
                <p className="text-sm font-medium text-foreground mt-1">{job.level}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Hình thức</p>
                <p className="text-sm font-medium text-foreground mt-1">{job.employmentType}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Số lượng tuyển</p>
                <p className="text-sm font-medium text-foreground mt-1">{job.quantity} người</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Kinh nghiệm</p>
                <p className="text-sm font-medium text-foreground mt-1">{job.experience}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Học vấn</p>
                <p className="text-sm font-medium text-foreground mt-1">{job.education}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Ngày đăng</p>
                <p className="text-sm font-medium text-foreground mt-1">{job.createdAt}</p>
              </div>
              {job.endDate && (
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Hạn chót</p>
                  <p className="text-sm font-medium text-foreground mt-1">{job.endDate}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Job Description */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Mô tả công việc
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>

          <Separator />

          {/* Requirements */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Yêu cầu ứng viên
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {job.requirement}
            </p>
          </div>

          <Separator />

          {/* Benefits */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Gift className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Quyền lợi
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {job.benefit}
            </p>
          </div>

          <Separator />

          {/* Work Location & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-violet-600 dark:text-violet-400" /> Địa điểm làm việc
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {job.workLocation}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-600 dark:text-sky-400" /> Thời gian làm việc
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {job.workTime}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ⚙️ 2. ADMIN MANAGEMENT SECTION */}
      <Card className="rounded-lg border-border/60 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Quản lý tin tuyển dụng</h3>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className={jobStatus.color}>
                  {jobStatus.text}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {jobApps.length} ứng viên
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => navigate(`/admin/companies/${job.companyId}`)}
              >
                <Eye className="w-4 h-4" /> Xem công ty
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="gap-2"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="w-4 h-4" /> Xóa tin
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 👥 3. APPLICANTS SECTION */}
      <Card className="rounded-lg border-border/60 shadow-sm">
        <CardContent className="p-6">
          <Tabs defaultValue="applicants" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="applicants" className="gap-2">
                <UsersIcon className="w-4 h-4" /> Ứng viên ({jobApps.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="applicants" className="space-y-4">
              {jobApps.length === 0 ? (
                <div className="text-center py-12">
                  <UsersIcon className="w-12 h-12 opacity-30 mx-auto mb-3" />
                  <p className="text-muted-foreground">Chưa có ứng viên nào</p>
                </div>
              ) : (
                <div className="rounded-lg border border-border/60 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên ứng viên</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Ngày nộp</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobApps.map(app => {
                        const candidate = users.find(u => u.id === app.userId);

                        return (
                          <TableRow key={app.id} className="hover:bg-muted/40">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                    {candidate?.name?.charAt(0) || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-sm">{candidate?.name || 'Ứng viên'}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              <div className="flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5" />
                                {candidate?.email || 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {app.createdAt}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {app.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" className="gap-1.5 h-8">
                                  <Download className="w-3.5 h-3.5" /> CV
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button size="icon" variant="ghost" className="h-8 w-8">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem className="gap-2">
                                      <Eye className="w-4 h-4" /> Xem hồ sơ
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="gap-2 text-red-500">
                                      <Trash2 className="w-4 h-4" /> Xóa
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Xác nhận xóa tin tuyển dụng
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tin "{job.title}" không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 my-4 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm font-medium text-red-900 dark:text-red-100">Ảnh hưởng:</p>
            <ul className="text-sm text-red-800 dark:text-red-200 list-disc list-inside space-y-1">
              <li>{jobApps.length} ứng viên sẽ bị ảnh hưởng</li>
              <li>Tất cả dữ liệu liên quan sẽ bị xóa</li>
            </ul>
          </div>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Xóa
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
