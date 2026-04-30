import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface Candidate {
  id: number;
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  level: string;
  applicationDate: string;
  status: 'applied' | 'reviewing' | 'interview' | 'accepted' | 'rejected';
}

const mockCandidates: Candidate[] = [
  { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@gmail.com', phone: '0901234567', jobTitle: 'React Developer', level: 'Senior', applicationDate: '2026-04-28', status: 'interview' },
  { id: 2, name: 'Trần Thị B', email: 'tranthib@gmail.com', phone: '0912345678', jobTitle: 'Python Developer', level: 'Mid-level', applicationDate: '2026-04-27', status: 'applied' },
  { id: 3, name: 'Lê Văn C', email: 'levanc@gmail.com', phone: '0923456789', jobTitle: 'Marketing Manager', level: 'Mid-level', applicationDate: '2026-04-26', status: 'reviewing' },
  { id: 4, name: 'Phạm Thị D', email: 'phamthid@gmail.com', phone: '0934567890', jobTitle: '.NET Developer', level: 'Senior', applicationDate: '2026-04-25', status: 'accepted' },
  { id: 5, name: 'Hoàng Văn E', email: 'hoangvane@gmail.com', phone: '0945678901', jobTitle: 'Java Developer', level: 'Senior', applicationDate: '2026-04-24', status: 'interview' },
  { id: 6, name: 'Đỗ Thị F', email: 'dothif@gmail.com', phone: '0956789012', jobTitle: 'UI/UX Designer', level: 'Junior', applicationDate: '2026-04-23', status: 'rejected' },
];

const statusConfig: Record<string, { label: string; emoji: string; className: string }> = {
  applied: { label: 'Đã nộp', emoji: '🟡', className: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400' },
  reviewing: { label: 'Đang xét', emoji: '🔵', className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400' },
  interview: { label: 'Phỏng vấn', emoji: '🟣', className: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-400' },
  accepted: { label: 'Đã nhận', emoji: '🟢', className: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400' },
  rejected: { label: 'Từ chối', emoji: '🔴', className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400' },
};

export default function EmployerCandidates() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filtered = mockCandidates
    .filter(c => {
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold text-foreground tracking-tight">Ứng viên</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{mockCandidates.length} ứng viên</p>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Tìm kiếm theo tên, kỹ năng..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="applied">🟡 Đã nộp</SelectItem>
                <SelectItem value="reviewing">🔵 Đang xét</SelectItem>
                <SelectItem value="interview">🟣 Phỏng vấn</SelectItem>
                <SelectItem value="accepted">🟢 Đã nhận</SelectItem>
                <SelectItem value="rejected">🔴 Từ chối</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Candidate Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(candidate => {
          const config = statusConfig[candidate.status];
          return (
            <Card key={candidate.id} className="hover:shadow-md transition-all group">
              <CardContent className="p-5">
                {/* Header: Tên & Status Badge */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-lg text-foreground">{candidate.name}</p>
                  </div>
                  <Badge variant="outline" className={`${config.className} whitespace-nowrap shrink-0`}>
                    {config.emoji} {config.label}
                  </Badge>
                </div>

                {/* Email & Phone */}
                <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Email:</span>
                    <a href={`mailto:${candidate.email}`} className="text-primary hover:underline truncate">
                      {candidate.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">SĐT:</span>
                    <a href={`tel:${candidate.phone}`} className="text-primary hover:underline">
                      {candidate.phone}
                    </a>
                  </div>
                </div>

                {/* Job Info */}
                <div className="space-y-2 mb-4 pb-4 border-b border-border">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Tên công việc</p>
                    <p className="text-sm font-medium text-foreground">{candidate.jobTitle}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Vị trí</p>
                      <p className="text-sm font-medium text-foreground">{candidate.level}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Ngày nộp</p>
                      <p className="text-sm font-medium text-foreground">{candidate.applicationDate}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    size="sm"
                    onClick={() => navigate(`../candidates/${candidate.id}`)}
                  >
                    Xem chi tiết
                  </Button>
                  <Button 
                    className="flex-1" 
                    size="sm"
                    onClick={() => navigate('../messages', { state: { candidate } })}
                  >
                    Liên hệ
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            Không tìm thấy ứng viên nào phù hợp
          </CardContent>
        </Card>
      )}
    </div>
  );
}
