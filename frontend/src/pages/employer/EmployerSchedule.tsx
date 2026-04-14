import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Video,
  MapPin,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Pencil,
  Trash2,
  X,
  CalendarCheck2,
  Clock4,
  Link2,
  User2,
  Briefcase,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { applications, users, jobs } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';

interface Interview {
  id: number;
  candidateName: string;
  candidateId: number;
  jobTitle: string;
  date: string;
  time: string;
  type: 'online' | 'offline';
  status: 'scheduled' | 'completed' | 'cancelled';
  link?: string;
  location?: string;
}

const statusConfig: Record<string, { label: string; className: string; dotColor: string }> = {
  scheduled: {
    label: 'Đã lên lịch',
    className: 'bg-blue-50 text-blue-600 border-blue-200',
    dotColor: 'bg-blue-500',
  },
  completed: {
    label: 'Hoàn thành',
    className: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    dotColor: 'bg-emerald-500',
  },
  cancelled: {
    label: 'Đã hủy',
    className: 'bg-red-50 text-red-500 border-red-200',
    dotColor: 'bg-red-500',
  },
};

const avatarColors = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-indigo-600',
  'from-teal-500 to-emerald-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
];

// Helper to get today's date string
const getTodayStr = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};
const TODAY = getTodayStr();

const initialInterviews: Interview[] = [
  { id: 1, candidateId: 1, candidateName: 'Nguyễn Văn A', jobTitle: 'Frontend Developer', date: '2026-04-07', time: '09:00', type: 'online', status: 'scheduled', link: 'https://meet.google.com/abc-xyz' },
  { id: 2, candidateId: 2, candidateName: 'Hoàng Văn E', jobTitle: 'Backend .NET Developer', date: '2026-04-07', time: '14:00', type: 'offline', status: 'scheduled', location: 'Phòng họp A, Tầng 3' },
  { id: 3, candidateId: 2, candidateName: 'Trần Thị B', jobTitle: 'Python Developer', date: TODAY, time: '10:30', type: 'online', status: 'scheduled', link: 'https://zoom.us/j/123456' },
  { id: 4, candidateId: 1, candidateName: 'Nguyễn Văn A', jobTitle: 'Kế Toán Tổng Hợp', date: TODAY, time: '14:00', type: 'offline', status: 'scheduled', location: 'Phòng họp B, Tầng 2' },
  { id: 5, candidateId: 3, candidateName: 'Phạm Thị D', jobTitle: '.NET Developer', date: '2026-04-05', time: '15:00', type: 'offline', status: 'completed', location: 'Văn phòng chính' },
];

// ---------- Edit Dialog ----------
interface EditDialogProps {
  interview: Interview;
  open: boolean;
  onClose: () => void;
  onSave: (updated: Interview) => void;
}

function EditDialog({ interview, open, onClose, onSave }: EditDialogProps) {
  const [form, setForm] = useState<Interview>({ ...interview });

  const set = (key: keyof Interview, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg flex items-center gap-2">
            <Pencil className="w-4 h-4 text-primary" />
            Chỉnh sửa lịch phỏng vấn
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Candidate */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <User2 className="w-3.5 h-3.5" /> Ứng viên
            </Label>
            <Input
              value={form.candidateName}
              onChange={e => set('candidateName', e.target.value)}
              placeholder="Tên ứng viên"
            />
          </div>

          {/* Job title */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" /> Vị trí ứng tuyển
            </Label>
            <Input
              value={form.jobTitle}
              onChange={e => set('jobTitle', e.target.value)}
              placeholder="Vị trí ứng tuyển"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <CalendarCheck2 className="w-3.5 h-3.5" /> Ngày phỏng vấn
              </Label>
              <Input
                type="date"
                value={form.date}
                onChange={e => set('date', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Clock4 className="w-3.5 h-3.5" /> Giờ phỏng vấn
              </Label>
              <Input
                type="time"
                value={form.time}
                onChange={e => set('time', e.target.value)}
              />
            </div>
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Hình thức</Label>
            <Select value={form.type} onValueChange={v => set('type', v as 'online' | 'offline')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">
                  <span className="flex items-center gap-2"><Video className="w-4 h-4 text-violet-500" /> Online</span>
                </SelectItem>
                <SelectItem value="offline">
                  <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-amber-500" /> Trực tiếp</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Conditional field */}
          {form.type === 'online' ? (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5" /> Link phỏng vấn
              </Label>
              <Input
                value={form.link || ''}
                onChange={e => set('link', e.target.value)}
                placeholder="https://meet.google.com/..."
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Địa điểm
              </Label>
              <Input
                value={form.location || ''}
                onChange={e => set('location', e.target.value)}
                placeholder="Phòng họp A, Tầng 3..."
              />
            </div>
          )}

          {/* Status */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Trạng thái</Label>
            <Select value={form.status} onValueChange={v => set('status', v as Interview['status'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Đã lên lịch</SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              <X className="w-4 h-4 mr-1.5" /> Hủy
            </Button>
            <Button className="flex-1" onClick={() => { onSave(form); onClose(); }}>
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Lưu thay đổi
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Create Dialog ----------
interface CreateDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (interview: Interview) => void;
  availableCandidates: { userId: number; userName: string; jobTitle: string; jobId: number }[];
}

function CreateDialog({ open, onClose, onAdd, availableCandidates }: CreateDialogProps) {
  const [selectedApp, setSelectedApp] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState<'online' | 'offline'>('online');
  const [link, setLink] = useState('');
  const [location, setLocation] = useState('');

  const selectedCandidate = availableCandidates.find(
    c => `${c.userId}-${c.jobId}` === selectedApp
  );

  const handleSubmit = () => {
    if (!selectedCandidate || !date || !time) return;
    const newInterview: Interview = {
      id: Date.now(),
      candidateId: selectedCandidate.userId,
      candidateName: selectedCandidate.userName,
      jobTitle: selectedCandidate.jobTitle,
      date,
      time,
      type,
      status: 'scheduled',
      link: type === 'online' ? link : undefined,
      location: type === 'offline' ? location : undefined,
    };
    onAdd(newInterview);
    // Reset
    setSelectedApp(''); setDate(''); setTime('');
    setType('online'); setLink(''); setLocation('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg flex items-center gap-2">
            <CalendarCheck2 className="w-5 h-5 text-primary" />
            Lên lịch phỏng vấn mới
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Select candidate from applied list */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <User2 className="w-3.5 h-3.5" /> Chọn ứng viên đã ứng tuyển
            </Label>
            <Select value={selectedApp} onValueChange={setSelectedApp}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn ứng viên..." />
              </SelectTrigger>
              <SelectContent>
                {availableCandidates.map(c => (
                  <SelectItem key={`${c.userId}-${c.jobId}`} value={`${c.userId}-${c.jobId}`}>
                    <div className="flex flex-col">
                      <span className="font-medium">{c.userName}</span>
                      <span className="text-xs text-muted-foreground">{c.jobTitle}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCandidate && (
            <div className="bg-muted/50 rounded-lg px-4 py-3 text-sm flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {selectedCandidate.userName.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-foreground">{selectedCandidate.userName}</p>
                <p className="text-xs text-muted-foreground">{selectedCandidate.jobTitle}</p>
              </div>
            </div>
          )}

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <CalendarCheck2 className="w-3.5 h-3.5" /> Ngày phỏng vấn
              </Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Clock4 className="w-3.5 h-3.5" /> Giờ bắt đầu
              </Label>
              <Input type="time" value={time} onChange={e => setTime(e.target.value)} />
            </div>
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Hình thức phỏng vấn</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('online')}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-lg border-2 py-2.5 text-sm font-medium transition-all',
                  type === 'online'
                    ? 'border-violet-500 bg-violet-50 text-violet-700'
                    : 'border-border text-muted-foreground hover:border-muted-foreground/40'
                )}
              >
                <Video className="w-4 h-4" /> Online
              </button>
              <button
                type="button"
                onClick={() => setType('offline')}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-lg border-2 py-2.5 text-sm font-medium transition-all',
                  type === 'offline'
                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                    : 'border-border text-muted-foreground hover:border-muted-foreground/40'
                )}
              >
                <MapPin className="w-4 h-4" /> Trực tiếp
              </button>
            </div>
          </div>

          {/* Conditional */}
          {type === 'online' ? (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5" /> Link phỏng vấn
              </Label>
              <Input
                value={link}
                onChange={e => setLink(e.target.value)}
                placeholder="https://meet.google.com/..."
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Địa điểm tổ chức
              </Label>
              <Input
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Phòng họp A, Tầng 3..."
              />
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Hủy
            </Button>
            <Button
              className="flex-1"
              disabled={!selectedCandidate || !date || !time}
              onClick={handleSubmit}
            >
              <CalendarCheck2 className="w-4 h-4 mr-1.5" />
              Gửi lời mời phỏng vấn
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Main Component ----------
export default function EmployerSchedule() {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<Interview[]>(initialInterviews);
  // default undefined = show all
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [editTarget, setEditTarget] = useState<Interview | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Today string YYYY-MM-DD
  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, []);

  // Auto-set past "scheduled" interviews to "completed" on mount
  useEffect(() => {
    setInterviews(prev =>
      prev.map(i => {
        if (i.status === 'scheduled' && i.date < todayStr) {
          return { ...i, status: 'completed' };
        }
        return i;
      })
    );
  }, [todayStr]);

  // Build candidate list from applications for this employer's company
  const myJobs = jobs.filter(j => j.companyId === user?.companyId);
  const myJobIds = myJobs.map(j => j.id);
  const myApplications = applications.filter(
    a => myJobIds.includes(a.jobId) && a.status !== 'rejected'
  );
  const availableCandidates = myApplications.map(app => {
    const candidate = users.find(u => u.id === app.userId);
    const job = jobs.find(j => j.id === app.jobId);
    return {
      userId: app.userId,
      userName: candidate?.name || 'Ứng viên',
      jobTitle: job?.title || 'Không rõ',
      jobId: app.jobId,
    };
  });

  // Interviews happening today
  const todayInterviews = interviews.filter(
    i => i.date === todayStr && i.status !== 'cancelled'
  );

  const scheduledCount = interviews.filter(i => i.status === 'scheduled').length;
  const completedCount = interviews.filter(i => i.status === 'completed').length;

  const PAGE_SIZE = 5;
  const [currentPage, setCurrentPage] = useState(1);

  const selectedDateStr = date
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    : '';

  // Sort newest first (date desc, then time desc), then apply date filter
  const sortedInterviews = [...interviews].sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    return dateCompare !== 0 ? dateCompare : b.time.localeCompare(a.time);
  });
  const filteredInterviews = selectedDateStr
    ? sortedInterviews.filter(i => i.date === selectedDateStr)
    : sortedInterviews;

  // Pagination — only paginate when showing ALL (no date filter)
  const isPaginated = !selectedDateStr;
  const totalPages = isPaginated ? Math.ceil(filteredInterviews.length / PAGE_SIZE) : 1;
  const pagedInterviews = isPaginated
    ? filteredInterviews.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
    : filteredInterviews;

  const handleSave = (updated: Interview) => {
    setInterviews(prev => prev.map(i => (i.id === updated.id ? updated : i)));
  };

  const handleDelete = (id: number) => {
    setInterviews(prev => prev.filter(i => i.id !== id));
  };

  const handleAdd = (interview: Interview) => {
    setInterviews(prev => [...prev, interview]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-bold text-foreground tracking-tight">Lịch phỏng vấn</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{scheduledCount} buổi phỏng vấn sắp tới</p>
        </div>

        {/* Create button */}
        <Button
          onClick={() => setCreateOpen(true)}
          className="relative gap-2 shadow-md bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 pl-4 pr-5"
        >
          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Plus className="w-3.5 h-3.5" />
          </span>
          Tạo lịch phỏng vấn
        </Button>
      </div>

      {/* Today's Interview Banner */}
      {todayInterviews.length > 0 && !bannerDismissed && (
        <div className="relative flex items-center gap-4 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 px-5 py-3.5 shadow-sm overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-amber-200/40 blur-2xl pointer-events-none" />

          {/* Bell icon */}
          <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4 text-amber-600" />
          </div>

          {/* Content */}
          <p className="flex-1 text-sm font-semibold text-amber-800">
            🗓️ Hôm nay có{' '}
            <span className="text-amber-600">{todayInterviews.length} buổi phỏng vấn</span>
            {' '}được lên lịch
          </p>

          {/* View today button */}
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 text-xs border-amber-300 text-amber-700 hover:bg-amber-100 bg-white/70 hidden sm:inline-flex"
            onClick={() => { setDate(new Date()); setCurrentPage(1); }}
          >
            Xem lịch hôm nay
          </Button>

          {/* Dismiss */}
          <button
            className="text-amber-400 hover:text-amber-600 transition-colors shrink-0"
            onClick={() => setBannerDismissed(true)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                <CalendarDays className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-blue-500 font-medium">Sắp tới</p>
                <p className="text-xl font-bold text-blue-700">{scheduledCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-teal-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-emerald-500 font-medium">Hoàn thành</p>
                <p className="text-xl font-bold text-emerald-700">{completedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-violet-50 to-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
                <Video className="w-4 h-4 text-violet-600" />
              </div>
              <div>
                <p className="text-xs text-violet-500 font-medium">Online</p>
                <p className="text-xl font-bold text-violet-700">{interviews.filter(i => i.type === 'online').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-orange-500 font-medium">Trực tiếp</p>
                <p className="text-xl font-bold text-orange-700">{interviews.filter(i => i.type === 'offline').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] xl:grid-cols-[360px_1fr] gap-6 items-start">
        {/* Calendar */}
        <Card className="shadow-sm border border-border/60">
          <CardHeader className="pb-2 px-5 pt-5">
            <CardTitle className="text-base font-semibold text-foreground">Lịch tháng</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-5">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => { setDate(d); setCurrentPage(1); }}
              className="pointer-events-auto w-full"
              classNames={{
                months: 'w-full',
                month: 'space-y-3 w-full',
                caption: 'flex justify-center pt-1 relative items-center w-full',
                caption_label: 'text-sm font-semibold',
                nav: 'space-x-1 flex items-center',
                nav_button: cn(
                  'h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 rounded-md hover:bg-muted transition-colors'
                ),
                nav_button_previous: 'absolute left-1',
                nav_button_next: 'absolute right-1',
                table: 'w-full border-collapse space-y-1',
                head_row: 'flex w-full',
                head_cell: 'text-muted-foreground rounded-md flex-1 font-medium text-[0.75rem] text-center',
                row: 'flex w-full mt-1',
                cell: 'flex-1 text-center text-sm p-0 relative focus-within:relative focus-within:z-20',
                day: cn(
                  'h-9 w-9 mx-auto p-0 font-normal rounded-full hover:bg-primary/10 transition-colors aria-selected:opacity-100'
                ),
                day_selected:
                  'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-full',
                day_today: 'bg-accent text-accent-foreground font-semibold',
                day_outside: 'text-muted-foreground/40 opacity-50',
                day_disabled: 'text-muted-foreground opacity-50',
                day_range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
                day_hidden: 'invisible',
              }}
            />

            {/* Only show "Đang xem" when a date is selected */}
            {date ? (
              <div className="mt-3 pt-3 border-t border-border/60">
                <p className="text-xs text-muted-foreground text-center">
                  Đang xem:{' '}
                  <span className="font-semibold text-foreground">
                    {date.toLocaleDateString('vi-VN', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </span>
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2 text-xs text-muted-foreground h-7"
                  onClick={() => { setDate(undefined); setCurrentPage(1); }}
                >
                  ← Xem tất cả lịch
                </Button>
              </div>
            ) : (
              <div className="mt-3 pt-3 border-t border-border/60">
                <p className="text-xs text-muted-foreground text-center">
                  Chọn một ngày để lọc lịch phỏng vấn
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Interview List */}
        <div className="space-y-4 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-semibold text-foreground text-base">
              {selectedDateStr
                ? filteredInterviews.length > 0
                  ? `Phỏng vấn ngày ${date?.toLocaleDateString('vi-VN')}`
                  : `Ngày ${date?.toLocaleDateString('vi-VN')}`
                : 'Tất cả lịch phỏng vấn'}
            </h3>
            <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
              {filteredInterviews.length} buổi
            </span>
          </div>
          {/* Reset page when date filter changes */}
          {/* (handled inline via key prop) */}

          {filteredInterviews.length === 0 ? (
            <Card className="border-dashed shadow-none">
              <CardContent className="py-14 flex flex-col items-center justify-center text-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                  <CalendarDays className="w-7 h-7 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Không có lịch phỏng vấn</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Không có buổi phỏng vấn nào vào ngày này.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => { setDate(undefined); setCurrentPage(1); }}>
                  Xem tất cả
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pagedInterviews.map((interview, index) => {
                const config = statusConfig[interview.status];
                const globalIndex = (currentPage - 1) * PAGE_SIZE + index;
                const gradientColor = avatarColors[globalIndex % avatarColors.length];
                return (
                  <Card
                    key={interview.id}
                    className="shadow-sm border border-border/60 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group overflow-hidden"
                  >
                    <CardContent className="p-0">
                      <div className="flex items-stretch">
                        {/* Time strip */}
                        <div className="flex flex-col items-center justify-center px-4 py-4 bg-muted/40 border-r border-border/50 shrink-0 min-w-[76px]">
                          <p className="text-base font-bold text-foreground tabular-nums leading-none">
                            {interview.time}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {interview.date.slice(8, 10)}/{interview.date.slice(5, 7)}
                          </p>
                        </div>

                        {/* Main content */}
                        <div className="flex items-center justify-between gap-4 flex-1 min-w-0 px-5 py-4">
                          {/* Avatar + Info */}
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div
                              className={cn(
                                'w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 text-white font-bold text-sm shadow-sm',
                                gradientColor
                              )}
                            >
                              {interview.candidateName.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground text-sm truncate">
                                {interview.candidateName}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">{interview.jobTitle}</p>
                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <span
                                  className={cn(
                                    'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full',
                                    interview.type === 'online'
                                      ? 'bg-violet-50 text-violet-600'
                                      : 'bg-amber-50 text-amber-600'
                                  )}
                                >
                                  {interview.type === 'online' ? (
                                    <><Video className="w-3 h-3" /> Online</>
                                  ) : (
                                    <><MapPin className="w-3 h-3" /> Trực tiếp</>
                                  )}
                                </span>
                                {(interview.link || interview.location) && (
                                  <span className="text-[10px] text-muted-foreground truncate max-w-[160px]">
                                    {interview.link || interview.location}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right: Status + Actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-xs font-medium border hidden sm:inline-flex',
                                config.className
                              )}
                            >
                              <span
                                className={cn(
                                  'w-1.5 h-1.5 rounded-full mr-1.5 inline-block',
                                  config.dotColor
                                )}
                              />
                              {config.label}
                            </Badge>

                            {/* Edit button */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-muted opacity-0 group-hover:opacity-100 transition-all"
                              onClick={() => setEditTarget(interview)}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>

                            {/* Delete button */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                              onClick={() => handleDelete(interview.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>

                            {interview.status === 'scheduled' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs gap-1 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors"
                              >
                                Tham gia
                                <ChevronRight className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {/* Pagination — only shown when viewing all */}
              {isPaginated && totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-muted-foreground">
                    Trang {currentPage} / {totalPages} &nbsp;·&nbsp; {filteredInterviews.length} lịch
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-xs"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => p - 1)}
                    >
                      ← Trước
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <Button
                        key={page}
                        variant={page === currentPage ? 'default' : 'outline'}
                        size="sm"
                        className="h-8 w-8 p-0 text-xs"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-xs"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => p + 1)}
                    >
                      Sau →
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      {editTarget && (
        <EditDialog
          interview={editTarget}
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          onSave={handleSave}
        />
      )}

      {/* Create Dialog */}
      <CreateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onAdd={handleAdd}
        availableCandidates={availableCandidates}
      />
    </div>
  );
}
