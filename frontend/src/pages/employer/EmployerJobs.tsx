import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { applications, Job, getLocationById } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, MoreVertical } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Props {
  myJobs: Job[];
}

export default function EmployerJobs({ myJobs }: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [deleteJobId, setDeleteJobId] = useState<number | null>(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 🔥 xử lý data
  const jobs = myJobs.map((job) => {
    const isExpired =
      job.endDate && new Date(job.endDate) < new Date();

    return {
      ...job,
      isExpired,
      applicantCount: applications.filter(a => a.jobId === job.id).length,
      locationName: job.locationIds
        .map(id => getLocationById(id)?.name)
        .filter(Boolean)
        .join(', '),
    };
  });

  // 🔎 search
  const filtered = jobs.filter(j =>
    j.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Tin tuyển dụng</h2>
          <p className="text-sm text-muted-foreground">
            {myJobs.length} tin đăng
          </p>
        </div>

        <Button onClick={() => navigate('/employer/jobs/create')}>
          <Plus className="w-4 h-4 mr-2" /> Tạo tin mới
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tiêu đề..."
            className="pl-10"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên công việc</TableHead>
                <TableHead>Vị trí</TableHead>
                <TableHead className="text-center">Số lượng ứng viên</TableHead>
                <TableHead>Hạn nộp</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.map(job => {
                const daysLeft = job.endDate
                  ? Math.ceil(
                    (new Date(job.endDate).getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24)
                  )
                  : null;

                return (
                  <TableRow
                    key={job.id}
                    className="cursor-pointer hover:bg-muted/40"
                    onClick={() => navigate(`/employer/jobs/${job.id}`)}
                  >
                    {/* Title */}
                    <TableCell className="font-semibold">
                      {job.title}
                    </TableCell>

                    {/* Location */}
                    <TableCell>
                      {job.locationName || 'Chưa xác định'}
                    </TableCell>

                    {/* Applicants */}
                    <TableCell className="text-center">
                      {job.applicantCount}
                    </TableCell>

                    {/* Deadline */}
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <span>{job.endDate || 'Chưa có'}</span>

                        {job.endDate && (
                          <span
                            className={
                              job.isExpired
                                ? 'text-red-500 text-xs'
                                : 'text-emerald-500 text-xs'
                            }
                          >
                            {job.isExpired
                              ? 'Hết hạn'
                              : `Còn ${daysLeft} ngày`}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell
                      className="text-right"
                      onClick={e => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/employer/jobs/${job.id}`)}>
                            Xem chi tiết
                          </DropdownMenuItem>

                          <DropdownMenuItem onClick={() => navigate(`/employer/jobs/edit/${job.id}`)}>
                            Chỉnh sửa
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => setDeleteJobId(job.id)}
                            className="text-red-500"
                          >
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}

              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

          </Table>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={deleteJobId !== null} onOpenChange={() => setDeleteJobId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={() => setDeleteJobId(null)}>
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}