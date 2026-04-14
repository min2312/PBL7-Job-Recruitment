import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Filter, Star, Sparkles, MapPin, Briefcase } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface Candidate {
  id: number;
  name: string;
  avatar: string;
  skills: string[];
  experience: string;
  matchingScore: number;
  status: 'applied' | 'interview' | 'accepted' | 'rejected';
  expectedSalary: string;
  location: string;
}

const mockCandidates: Candidate[] = [
  { id: 1, name: 'Nguyễn Văn A', avatar: 'NVA', skills: ['React', 'TypeScript', 'Node.js'], experience: '3 năm', matchingScore: 92, status: 'interview', expectedSalary: '25-30 triệu', location: 'Hà Nội' },
  { id: 2, name: 'Trần Thị B', avatar: 'TTB', skills: ['Python', 'Django', 'SQL'], experience: '5 năm', matchingScore: 85, status: 'applied', expectedSalary: '30-40 triệu', location: 'HCM' },
  { id: 3, name: 'Lê Văn C', avatar: 'LVC', skills: ['Marketing', 'SEO', 'Analytics'], experience: '2 năm', matchingScore: 78, status: 'applied', expectedSalary: '15-20 triệu', location: 'Đà Nẵng' },
  { id: 4, name: 'Phạm Thị D', avatar: 'PTD', skills: ['.NET', 'C#', 'Azure'], experience: '4 năm', matchingScore: 88, status: 'accepted', expectedSalary: '28-35 triệu', location: 'Hà Nội' },
  { id: 5, name: 'Hoàng Văn E', avatar: 'HVE', skills: ['Java', 'Spring', 'Microservices'], experience: '6 năm', matchingScore: 95, status: 'interview', expectedSalary: '35-45 triệu', location: 'HCM' },
  { id: 6, name: 'Đỗ Thị F', avatar: 'DTF', skills: ['UI/UX', 'Figma', 'CSS'], experience: '2 năm', matchingScore: 72, status: 'rejected', expectedSalary: '18-22 triệu', location: 'Hà Nội' },
];

const statusConfig: Record<string, { label: string; className: string }> = {
  applied: { label: 'Đã ứng tuyển', className: 'bg-info/10 text-info border-info/20' },
  interview: { label: 'Phỏng vấn', className: 'bg-warning/10 text-warning border-warning/20' },
  accepted: { label: 'Đã nhận', className: 'bg-success/10 text-success border-success/20' },
  rejected: { label: 'Từ chối', className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

export default function EmployerCandidates() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('score');

  const filtered = mockCandidates
    .filter(c => {
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.skills.some(s => s.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => sortBy === 'score' ? b.matchingScore - a.matchingScore : a.name.localeCompare(b.name));

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
                <SelectItem value="applied">Đã ứng tuyển</SelectItem>
                <SelectItem value="interview">Phỏng vấn</SelectItem>
                <SelectItem value="accepted">Đã nhận</SelectItem>
                <SelectItem value="rejected">Từ chối</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">Điểm phù hợp</SelectItem>
                <SelectItem value="name">Tên A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Candidate Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(candidate => {
          const config = statusConfig[candidate.status];
          return (
            <Card key={candidate.id} className="hover:shadow-md transition-all group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">{candidate.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">{candidate.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" /> {candidate.location}
                      </div>
                    </div>
                  </div>
                  {/* AI Matching Score */}
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span className="text-sm font-bold text-primary">{candidate.matchingScore}%</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Briefcase className="w-3.5 h-3.5" /> {candidate.experience} kinh nghiệm
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {candidate.skills.map(skill => (
                    <Badge key={skill} variant="secondary" className="text-xs font-normal">{skill}</Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={config.className}>{config.label}</Badge>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" size="sm">Xem CV</Button>
                    <Button size="sm">Liên hệ</Button>
                  </div>
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
