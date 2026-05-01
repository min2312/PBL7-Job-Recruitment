import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MessageSquare, Eye } from 'lucide-react';
import NumberedPagination from '@/components/NumberedPagination';

const statusConfig: Record<string, { label: string; emoji: string; className: string }> = {
  pending: { label: 'Đã nộp', emoji: '🟡', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  interview: { label: 'Phỏng vấn', emoji: '🟣', className: 'bg-purple-50 text-purple-700 border-purple-200' },
  approved: { label: 'Đã nhận', emoji: '🟢', className: 'bg-green-50 text-green-700 border-green-200' },
  rejected: { label: 'Từ chối', emoji: '🔴', className: 'bg-red-50 text-red-700 border-red-200' },
};

interface Props {
  myApplications: any[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number, limit: number, search?: string, status?: string) => void;
  refreshData: () => void;
}

export default function EmployerCandidates({ myApplications, total, page, limit, onPageChange, refreshData }: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Server-side search and status filter with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // Fetch data based on search and statusFilter
      // Convert 'all' to empty string for backend
      const statusParam = statusFilter === 'all' ? '' : statusFilter;
      
      // Always reset to page 1 when filtering/searching
      onPageChange(1, limit, search, statusParam);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search, statusFilter]);

  const filtered = myApplications; // Server returns filtered page

  // Group applications by candidate
  const groupedCandidates = useMemo(() => {
    const groups: Record<number, any> = {};
    filtered.forEach(app => {
      const userId = app.user_id;
      if (!groups[userId]) {
        groups[userId] = {
          user: app.User,
          applications: []
        };
      }
      groups[userId].applications.push(app);
    });
    // Sort candidates by their most recent application
    return Object.values(groups).sort((a: any, b: any) => {
      const dateA = new Date(a.applications[0].createdAt).getTime();
      const dateB = new Date(b.applications[0].createdAt).getTime();
      return dateB - dateA;
    });
  }, [filtered]);

  // Pagination logic (now based on unique candidates)
  const totalPages = Math.ceil(groupedCandidates.length / limit);
  const currentCandidates = groupedCandidates.slice((page - 1) * limit, page * limit);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Ứng viên</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          {groupedCandidates.length} ứng viên ({filtered.length} lượt ứng tuyển)
        </p>
      </div>

      {/* Search & Filters */}
      <Card className="border border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Tìm kiếm theo tên ứng viên, email..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="pending">🟡 Đã nộp</SelectItem>
                <SelectItem value="interview">🟣 Phỏng vấn</SelectItem>
                <SelectItem value="approved">🟢 Đã nhận</SelectItem>
                <SelectItem value="rejected">🔴 Từ chối</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Candidate Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentCandidates.map((group: any) => {
          const applicant = group.user;
          const apps = group.applications;
          const hasMultiple = apps.length > 1;

          return (
            <Card key={applicant?.id} className="hover:shadow-md transition-all border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <CardContent className="p-0 flex-1">
                <div className="p-5">
                  {/* Candidate Header */}
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold shrink-0 overflow-hidden ring-2 ring-slate-50">
                         {applicant?.profilePicture ? (
                           <img src={applicant.profilePicture} alt="" className="w-full h-full object-cover" />
                         ) : (
                           applicant?.name?.charAt(0).toUpperCase()
                         )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate text-base">{applicant?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{applicant?.email}</p>
                      </div>
                    </div>
                    {hasMultiple && (
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 text-[10px] whitespace-nowrap">
                        {apps.length} vị trí
                      </Badge>
                    )}
                  </div>

                  {/* Applications List */}
                  <div className="space-y-3 mb-2">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Vị trí ứng tuyển</p>
                    <div className="space-y-2 max-h-[160px] overflow-auto pr-1 custom-scrollbar">
                      {apps.map((app: any) => {
                        const config = statusConfig[app.status] || statusConfig.pending;
                        return (
                          <div key={app.id} className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-100 group/item hover:bg-white hover:border-slate-200 transition-all">
                            <div className="flex justify-between items-start gap-2 mb-1.5">
                              <p className="text-xs font-bold text-slate-800 line-clamp-1 flex-1">{app.Job?.title}</p>
                              <Badge variant="outline" className={`${config.className} text-[9px] px-1.5 py-0 h-4 font-bold uppercase`}>
                                {config.label}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-slate-200/60">
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(app.createdAt).toLocaleDateString('vi-VN')}
                              </span>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-7 px-2 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 gap-1.5"
                                onClick={() => navigate(`/employer/candidates/${app.id}`)}
                              >
                                <Eye className="w-3.5 h-3.5" /> Chi tiết
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>

              <div className="px-5 pb-5 pt-0">
                <Button 
                  className="w-full h-9 text-xs bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                  onClick={() => navigate('../messages', { state: { applicant } })}
                >
                  <MessageSquare className="w-3 h-3 mr-2" /> Nhắn tin cho ứng viên
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {currentCandidates.length === 0 && (
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="p-12 text-center text-muted-foreground">
            Không tìm thấy ứng viên nào phù hợp
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      <div className="flex justify-center pt-6">
        <NumberedPagination 
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(p) => onPageChange(p, limit)}
        />
      </div>
    </div>
  );
}
