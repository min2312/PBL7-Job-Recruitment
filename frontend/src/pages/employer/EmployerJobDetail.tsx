import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, Pencil, Trash2, Lock, RotateCcw, Briefcase, MapPin, DollarSign, Users as UsersIcon,
  Clock, Mail, Download, MoreVertical, Eye, Loader2, Calendar
} from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import axiosClient from '@/services/axiosClient';
import { toast } from 'react-toastify';

interface Props {
  refreshData?: () => void;
}

export default function EmployerJobDetail({ refreshData }: Props) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [updatingAppId, setUpdatingAppId] = useState<number | null>(null);

  const fetchJobData = async () => {
    setLoading(true);
    try {
      const [jobRes, appsRes] = await Promise.all([
        axiosClient.get(`/api/jobs/${id}`),
        axiosClient.get(`/api/employer/applications?jobId=${id}`)
      ]);

      if (jobRes.data.errCode === 0) {
        setJob(jobRes.data.data);
      }
      if (appsRes.data.errCode === 0) {
        setApplications(appsRes.data.data.applications || []);
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
      toast.error('Lỗi lấy thông tin công việc');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobData();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Đang tải thông tin chi tiết...
      </div>
    );
  }

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

  const company = job.Company;
  const locationNames = job.locations?.map((loc: any) => loc.name) || [];
  const isExpired = job.endDate && new Date(job.endDate) < new Date();

  const handleStatusChange = async (appId: number, newStatus: string) => {
    setUpdatingAppId(appId);
    try {
      const res = await axiosClient.put('/api/employer/applications/status', {
        applicationId: appId,
        status: newStatus
      });
      if (res.data.errCode === 0) {
        toast.success('Cập nhật trạng thái thành công');
        setApplications(prev => prev.map(app => app.id === appId ? { ...app, status: newStatus } : app));
        if (refreshData) refreshData();
      } else {
        toast.error(res.data.errMessage || 'Cập nhật thất bại');
      }
    } catch (error) {
      toast.error('Lỗi kết nối máy chủ');
    } finally {
      setUpdatingAppId(null);
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = job.status === 'open' ? 'closed' : 'open';
    setIsTogglingStatus(true);
    try {
      const res = await axiosClient.put(`/api/jobs/update/${id}`, { status: newStatus });
      if (res.data.errCode === 0) {
        toast.success(`Đã ${newStatus === 'open' ? 'mở' : 'đóng'} tin tuyển dụng`);
        setJob(prev => prev ? { ...prev, status: newStatus } : null);
        if (refreshData) refreshData();
      } else {
        toast.error(res.data.errMessage || 'Thao tác thất bại');
      }
    } catch (error) {
      toast.error('Lỗi kết nối máy chủ');
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleDeleteJob = async () => {
    setDeleting(true);
    try {
      const res = await axiosClient.delete(`/api/jobs/delete/${id}`);
      if (res.data.errCode === 0) {
        toast.success('Xóa tin tuyển dụng thành công');
        if (refreshData) refreshData();
        navigate('/employer/jobs');
      } else {
        toast.error(res.data.errMessage || 'Xóa thất bại');
      }
    } catch (error) {
      toast.error('Lỗi kết nối máy chủ');
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/employer/jobs" className="hover:text-foreground transition-colors flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Danh sách tin
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate">{job.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Job Info Card */}
          <Card className="rounded-xl border-border/60 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-border/60">
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center shrink-0 border border-border/60 overflow-hidden">
                    {company?.logo ? (
                      <img src={company.logo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Briefcase className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">{job.title}</h1>
                    <p className="text-muted-foreground font-medium">{company?.name}</p>
                    <div className="flex gap-2 mt-2">
                       <Badge variant={job.status === 'open' ? 'outline' : 'destructive'} className={job.status === 'open' ? 'text-emerald-600 border-emerald-600' : ''}>
                         {job.status === 'open' ? 'Đang tuyển' : 'Đã đóng'}
                       </Badge>
                       {isExpired && <Badge variant="destructive">Hết hạn</Badge>}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-muted/50 border border-border/40">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Mức lương</p>
                  <p className="text-sm font-semibold text-foreground mt-1">{job.salary}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border border-border/40">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Địa điểm</p>
                  <p className="text-sm font-semibold text-foreground mt-1 truncate">{locationNames[0] || 'Toàn quốc'}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border border-border/40">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Hình thức</p>
                  <p className="text-sm font-semibold text-foreground mt-1">{job.employmentType}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border border-border/40">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Hạn nộp</p>
                  <p className="text-sm font-semibold text-foreground mt-1">
                    {job.endDate ? new Date(job.endDate).toLocaleDateString('vi-VN') : 'Không thời hạn'}
                  </p>
                </div>
              </div>

              {/* Descriptions */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-primary" /> Mô tả công việc
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {job.description}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                    <UsersIcon className="w-4 h-4 text-primary" /> Yêu cầu ứng viên
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {job.requirement}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" /> Quyền lợi
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {job.benefit}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Applicants Table */}
          <Card className="rounded-xl border-border/60 shadow-sm overflow-hidden">
             <CardHeader className="border-b border-border/60">
                <CardTitle className="text-lg">Danh sách ứng viên ({applications.length})</CardTitle>
             </CardHeader>
             <CardContent className="p-0">
               <Table>
                 <TableHeader>
                   <TableRow className="bg-muted/30">
                     <TableHead className="font-bold">Ứng viên</TableHead>
                     <TableHead className="font-bold">Ngày nộp</TableHead>
                     <TableHead className="font-bold">Trạng thái</TableHead>
                     <TableHead className="text-right font-bold">Thao tác</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {applications.map(app => (
                     <TableRow key={app.id}>
                       <TableCell>
                         <div className="flex items-center gap-3">
                           <Avatar className="w-8 h-8">
                             <AvatarImage src={app.User?.profilePicture} />
                             <AvatarFallback className="text-[10px]">{app.User?.name?.charAt(0)}</AvatarFallback>
                           </Avatar>
                           <div>
                             <p className="text-sm font-bold">{app.User?.name}</p>
                             <p className="text-[11px] text-muted-foreground">{app.User?.email}</p>
                           </div>
                         </div>
                       </TableCell>
                       <TableCell className="text-xs text-muted-foreground">
                         {new Date(app.createdAt).toLocaleDateString('vi-VN')}
                       </TableCell>
                       <TableCell>
                         <Select 
                            value={app.status} 
                            onValueChange={(val) => handleStatusChange(app.id, val)}
                            disabled={updatingAppId === app.id}
                          >
                           <SelectTrigger className="w-32 h-8 text-xs border-none bg-muted/50">
                             <SelectValue />
                           </SelectTrigger>
                           <SelectContent>
                             <SelectItem value="pending" className="text-xs">Đã nộp</SelectItem>
                             <SelectItem value="interview" className="text-xs">Phỏng vấn</SelectItem>
                             <SelectItem value="approved" className="text-xs">Đã nhận</SelectItem>
                             <SelectItem value="rejected" className="text-xs">Từ chối</SelectItem>
                           </SelectContent>
                         </Select>
                       </TableCell>
                       <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-primary hover:text-primary hover:bg-primary/10"
                            onClick={() => navigate(`/employer/candidates/${app.id}`)}
                          >
                            Chi tiết
                          </Button>
                       </TableCell>
                     </TableRow>
                   ))}
                   {applications.length === 0 && (
                     <TableRow>
                       <TableCell colSpan={4} className="text-center py-10 text-muted-foreground text-sm">
                         Chưa có ứng viên nào ứng tuyển
                       </TableCell>
                     </TableRow>
                   )}
                 </TableBody>
               </Table>
             </CardContent>
          </Card>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <Card className="rounded-xl border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Thao tác</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start gap-2 h-10 bg-emerald-600 hover:bg-emerald-700" 
                onClick={() => navigate(`/employer/jobs/edit/${job.id}`)}
              >
                <Pencil className="w-4 h-4" /> Chỉnh sửa tin
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2 h-10"
                onClick={handleToggleStatus}
                disabled={isTogglingStatus}
              >
                {isTogglingStatus ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : job.status === 'open' ? (
                  <Lock className="w-4 h-4" />
                ) : (
                  <RotateCcw className="w-4 h-4" />
                )}
                {job.status === 'open' ? 'Đóng tuyển dụng' : 'Mở tuyển dụng lại'}
              </Button>
              <Button 
                variant="destructive" 
                className="w-full justify-start gap-2 h-10"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="w-4 h-4" /> Xóa tin đăng
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Thống kê nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Lượt ứng tuyển</span>
                <span className="text-sm font-bold">{applications.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Ngày đăng</span>
                <span className="text-sm font-bold">{new Date(job.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
              <Separator />
              <div className="pt-2">
                 <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Mã tin</p>
                 <p className="text-xs font-mono text-muted-foreground">#JOB-{job.id}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Dialog */}
      <ConfirmModal 
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteJob}
        isLoading={deleting}
        title="Xác nhận xóa tin tuyển dụng"
        description={`Bạn có chắc chắn muốn xóa tin "${job.title}"? Hành động này không thể hoàn tác và tất cả dữ liệu ứng viên liên quan sẽ bị ảnh hưởng.`}
      />
    </div>
  );
}
