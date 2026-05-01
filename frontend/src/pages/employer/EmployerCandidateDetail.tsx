import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft, Mail, Phone, MapPin, MessageSquare, Download, FileText, Loader2, CheckCircle2, XCircle, Calendar
} from 'lucide-react';
import axiosClient from '@/services/axiosClient';
import { toast } from 'react-toastify';

const statusConfig: Record<string, { label: string; emoji: string; className: string }> = {
  pending: { label: 'Đã nộp', emoji: '🟡', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  interview: { label: 'Phỏng vấn', emoji: '🟣', className: 'bg-purple-50 text-purple-700 border-purple-200' },
  approved: { label: 'Đã nhận', emoji: '🟢', className: 'bg-green-50 text-green-700 border-green-200' },
  rejected: { label: 'Từ chối', emoji: '🔴', className: 'bg-red-50 text-red-700 border-red-200' },
};

interface Props {
  refreshData?: () => void;
}

export default function EmployerCandidateDetail({ refreshData }: Props) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchApplication = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/api/employer/applications/${id}`);
      if (res.data.errCode === 0) {
        setApplication(res.data.data);
      } else {
        toast.error(res.data.errMessage || 'Lỗi lấy thông tin hồ sơ');
      }
    } catch (error) {
      console.error('Error fetching application detail:', error);
      toast.error('Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
    window.scrollTo(0, 0);
  }, [id]);

  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (url: string, filename: string) => {
    setDownloading(true);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download error:', error);
      // If CORS fails, it will open in new window
      window.open(url, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await axiosClient.put('/api/employer/applications/status', {
        applicationId: id,
        status: newStatus
      });
      if (res.data.errCode === 0) {
        toast.success(`Đã cập nhật trạng thái: ${statusConfig[newStatus].label}`);
        setApplication({ ...application, status: newStatus });
        if (refreshData) refreshData();
      } else {
        toast.error(res.data.errMessage || 'Cập nhật thất bại');
      }
    } catch (error) {
      toast.error('Lỗi kết nối máy chủ');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Đang tải thông tin hồ sơ...
      </div>
    );
  }

  if (!application) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-10">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
        </Button>
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground text-sm">
            Không tìm thấy thông tin hồ sơ ứng tuyển
          </CardContent>
        </Card>
      </div>
    );
  }

  const applicant = application.User;
  const job = application.Job;
  const config = statusConfig[application.status] || statusConfig.pending;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách
        </Button>
        
        <div className="flex gap-2">
          {application.status === 'pending' && (
            <Button 
              size="sm" 
              variant="outline" 
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
              onClick={() => handleStatusChange('interview')}
              disabled={updating}
            >
              {updating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Calendar className="w-4 h-4 mr-2" />}
              Mời phỏng vấn
            </Button>
          )}
          
          {(application.status === 'pending' || application.status === 'interview') && (
            <>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-green-600 border-green-200 hover:bg-green-50"
                onClick={() => handleStatusChange('approved')}
                disabled={updating}
              >
                {updating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                Chấp nhận
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => handleStatusChange('rejected')}
                disabled={updating}
              >
                {updating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                Từ chối
              </Button>
            </>
          )}
        </div>
      </div>

      <Card className="rounded-xl border-border/60 shadow-sm overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-2xl font-bold text-slate-600 shrink-0 overflow-hidden">
               {applicant?.profilePicture ? (
                 <img src={applicant.profilePicture} alt="" className="w-full h-full object-cover" />
               ) : (
                 applicant?.name?.charAt(0)
               )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold">{applicant?.name}</h1>
                <Badge className={config.className}>{config.label}</Badge>
              </div>
              <p className="text-muted-foreground font-medium">Vị trí: {job?.title}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" /> {applicant?.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" /> {applicant?.phone || 'Chưa cập nhật'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-xl border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Giới thiệu</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {applicant?.description || 'Ứng viên chưa cung cấp thông tin giới thiệu.'}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-border/60 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold">Hồ sơ đính kèm (CV)</CardTitle>
              {application.cv_file && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDownload(application.cv_file, `CV_${applicant?.name?.replace(/\s+/g, '_')}.pdf`)}
                  disabled={downloading}
                >
                  {downloading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  {downloading ? 'Đang xử lý...' : 'Tải xuống'}
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
               {application.cv_file ? (
                 <div className="aspect-[1/1.4] w-full bg-slate-100">
                    <iframe 
                      src={`${application.cv_file}#toolbar=0`} 
                      className="w-full h-full border-none"
                      title="CV Preview"
                    />
                 </div>
               ) : (
                 <div className="py-20 text-center text-muted-foreground text-sm">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    Ứng viên chưa đính kèm CV
                 </div>
               )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-xl border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase text-muted-foreground">Chi tiết ứng tuyển</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Ngày nộp</p>
                <p className="text-sm font-bold">{new Date(application.createdAt).toLocaleDateString('vi-VN')}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Công việc</p>
                <p className="text-sm font-bold text-blue-600 hover:underline cursor-pointer" onClick={() => navigate(`/employer/jobs/${job?.id}`)}>
                  {job?.title}
                </p>
              </div>
              <Separator />
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => navigate('../messages', { state: { applicant } })}>
                <MessageSquare className="w-4 h-4 mr-2" /> Nhắn tin
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase text-muted-foreground">Trạng thái xử lý</CardTitle>
            </CardHeader>
            <CardContent>
               <div className={`p-4 rounded-lg border ${config.className}`}>
                  <p className="text-sm font-bold">{config.label}</p>
                  <p className="text-[10px] uppercase mt-1 opacity-70">Cập nhật: {new Date(application.updatedAt).toLocaleDateString('vi-VN')}</p>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
