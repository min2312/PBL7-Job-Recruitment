import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft, Mail, Phone, MapPin, MessageSquare, Download, Eye, FileText
} from 'lucide-react';

interface CandidateDetail {
  id: number;
  name: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  address?: string;
  jobTitle: string;
  level: string;
  applicationDate: string;
  status: 'applied' | 'reviewing' | 'interview' | 'accepted' | 'rejected';
  cvUrl?: string;
  experience?: string;
  education?: string;
  projects?: Array<{ name: string; description: string; tech: string[] }>;
  interviewDate?: string;
  interviewNotes?: string;
  internalRating?: number;
  hrNotes?: string;
}

const mockCandidateDetails: Record<number, CandidateDetail> = {
  1: {
    id: 1,
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@gmail.com',
    phone: '0901234567',
    dateOfBirth: '1995-03-15',
    address: 'Hà Nội',
    jobTitle: 'React Developer',
    level: 'Senior',
    applicationDate: '2026-04-28',
    status: 'interview',
    cvUrl: '/cv/nguyenvana.pdf',
    experience: '5 năm kinh nghiệm phát triển web, chuyên React và TypeScript',
    education: 'Đại học Bách Khoa Hà Nội - Khoa Công Nghệ Thông Tin',
    projects: [
      { name: 'E-commerce Platform', description: 'Xây dựng nền tảng thương mại điện tử', tech: ['React', 'Node.js', 'MongoDB'] },
      { name: 'Booking System', description: 'Hệ thống đặt phòng trực tuyến', tech: ['React', 'Firebase', 'Tailwind'] },
    ],
    interviewDate: '2026-05-05 10:00',
    interviewNotes: 'Ứng viên có kinh nghiệm tốt, trả lời tốt các câu hỏi kỹ thuật',
    internalRating: 4.5,
    hrNotes: 'Ứng viên rất phù hợp với vị trí, kỹ năng giao tiếp tốt',
  },
  2: {
    id: 2,
    name: 'Trần Thị B',
    email: 'tranthib@gmail.com',
    phone: '0912345678',
    dateOfBirth: '1998-07-22',
    address: 'TP. Hồ Chí Minh',
    jobTitle: 'Python Developer',
    level: 'Mid-level',
    applicationDate: '2026-04-27',
    status: 'applied',
    cvUrl: '/cv/tranthib.pdf',
    experience: '3 năm làm việc với Python, Django, FastAPI',
    education: 'Đại học RMIT - Khoa Công Nghệ Thông Tin',
    projects: [
      { name: 'Data Analytics Dashboard', description: 'Dashboard phân tích dữ liệu', tech: ['Python', 'Django', 'PostgreSQL'] },
    ],
    hrNotes: 'Cần tiếp tục đánh giá trong vòng phỏng vấn kỹ thuật',
  },
};

const statusConfig: Record<string, { label: string; emoji: string; className: string }> = {
  applied: { label: 'Đã nộp', emoji: '🟡', className: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400' },
  reviewing: { label: 'Đang xét', emoji: '🔵', className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400' },
  interview: { label: 'Phỏng vấn', emoji: '🟣', className: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-400' },
  accepted: { label: 'Đã nhận', emoji: '🟢', className: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400' },
  rejected: { label: 'Từ chối', emoji: '🔴', className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400' },
};

export default function EmployerCandidateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const candidateId = Number(id);
  const candidate = mockCandidateDetails[candidateId];
  const config = candidate ? statusConfig[candidate.status] : null;

  // Scroll to top when component mounts or id changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!candidate) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
          </Button>
        </div>
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            Không tìm thấy ứng viên
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
        </Button>
      </div>

      {/* Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{candidate.name}</h1>
              <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4" /> {candidate.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4" /> {candidate.phone}
                </span>
                {candidate.address && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> {candidate.address}
                  </span>
                )}
              </div>
            </div>
            <Badge variant="outline" className={`${config?.className} whitespace-nowrap`}>
              {config?.emoji} {config?.label}
            </Badge>
          </div>

          <Separator />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Tên công việc</p>
              <p className="text-sm font-medium text-foreground mt-1">{candidate.jobTitle}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Vị trí</p>
              <p className="text-sm font-medium text-foreground mt-1">{candidate.level}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Ngày nộp đơn</p>
              <p className="text-sm font-medium text-foreground mt-1">{candidate.applicationDate}</p>
            </div>
            {candidate.dateOfBirth && (
              <div>
                <p className="text-xs text-muted-foreground font-medium">Ngày sinh</p>
                <p className="text-sm font-medium text-foreground mt-1">{candidate.dateOfBirth}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="space-y-6">
        {/* CV Section */}
        <Card>
          <CardHeader>
            <CardTitle>CV</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {candidate.cvUrl ? (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-muted-foreground mb-4">CV: {candidate.name}</p>
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" className="gap-2">
                      <Eye className="w-4 h-4" /> Xem CV
                    </Button>
                    <Button className="gap-2">
                      <Download className="w-4 h-4" /> Tải xuống
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Chưa có CV
              </div>
            )}
          </CardContent>
        </Card>

        {/* Interview Section */}
        <Card>
          <CardHeader>
            <CardTitle>Phỏng vấn</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Button 
              className="w-full gap-2"
              onClick={() => navigate('/employer/schedule', { 
                state: { 
                  candidateId: candidate.id, 
                  candidateName: candidate.name,
                  jobTitle: candidate.jobTitle,
                  openCreateDialog: true
                } 
              })}
            >
              <MessageSquare className="w-4 h-4" /> Lên lịch phỏng vấn
            </Button>
          </CardContent>
        </Card>

        {/* Status History Section */}
        <Card>
          <CardHeader>
            <CardTitle>Lịch sử trạng thái</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Đã nộp đơn</p>
                  <p className="text-xs text-muted-foreground">2026-04-28</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Đang xét</p>
                  <p className="text-xs text-muted-foreground">2026-04-29</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border border-border rounded-lg bg-purple-50 dark:bg-purple-950/30">
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Phỏng vấn</p>
                  <p className="text-xs text-muted-foreground">2026-04-30 (hiện tại)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
