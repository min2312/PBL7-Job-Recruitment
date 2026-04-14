import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { jobs } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';

export default function EmployerJobEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const job = jobs.find(j => j.id === Number(id));

  const [form, setForm] = useState({
    title: job?.title || '',
    salary: job?.salary || '',
    level: job?.level || '',
    experience: job?.experience || '',
    education: job?.education || '',
    employmentType: job?.employmentType || '',
    quantity: String(job?.quantity || 1),
    description: job?.description || '',
    requirement: job?.requirement || '',
    benefit: job?.benefit || '',
    workLocation: job?.workLocation || '',
    workTime: job?.workTime || '',
  });

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg font-medium">Không tìm thấy tin tuyển dụng</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/employer/jobs')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách
        </Button>
      </div>
    );
  }

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle save
    navigate(`/employer/jobs/${job.id}`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => navigate('/employer/jobs')}
          className="hover:text-foreground transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Danh sách tin
        </button>
        <span>/</span>
        <span className="text-foreground font-medium">Chỉnh sửa</span>
      </div>

      {/* Edit Job Form */}
      <Card className="rounded-xl border-border/60 shadow-sm">
        <CardHeader className="border-b border-border/60">
          <div className="flex items-center gap-2">
            <Save className="w-5 h-5 text-primary" />
            <div>
              <CardTitle className="text-xl">Chỉnh sửa tin tuyển dụng</CardTitle>
              <CardDescription>{job.title}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title & Salary Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Chức danh <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="VD: Lập trình viên React"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary" className="text-sm font-medium">
                  Mức lương <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="salary"
                  name="salary"
                  placeholder="VD: 15 - 25 triệu"
                  value={form.salary}
                  onChange={handleChange}
                  required
                  className="h-9"
                />
              </div>
            </div>

            {/* Level, Experience, Education Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="level" className="text-sm font-medium">
                  Cấp bậc
                </Label>
                <Select value={form.level} onValueChange={(value) => setForm(prev => ({ ...prev, level: value }))}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Chọn cấp bậc" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Intern">Intern</SelectItem>
                    <SelectItem value="Junior">Junior</SelectItem>
                    <SelectItem value="Senior">Senior</SelectItem>
                    <SelectItem value="Lead">Lead</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience" className="text-sm font-medium">
                  Kinh nghiệm
                </Label>
                <Select value={form.experience} onValueChange={(value) => setForm(prev => ({ ...prev, experience: value }))}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Chọn kinh nghiệm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Không yêu cầu">Không yêu cầu</SelectItem>
                    <SelectItem value="Dưới 1 năm">Dưới 1 năm</SelectItem>
                    <SelectItem value="1-3 năm">1-3 năm</SelectItem>
                    <SelectItem value="3-5 năm">3-5 năm</SelectItem>
                    <SelectItem value="Trên 5 năm">Trên 5 năm</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="education" className="text-sm font-medium">
                  Học vấn
                </Label>
                <Select value={form.education} onValueChange={(value) => setForm(prev => ({ ...prev, education: value }))}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Chọn học vấn" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Không yêu cầu">Không yêu cầu</SelectItem>
                    <SelectItem value="THPT">THPT</SelectItem>
                    <SelectItem value="Cao đẳng">Cao đẳng</SelectItem>
                    <SelectItem value="Đại học">Đại học</SelectItem>
                    <SelectItem value="Thạc sĩ">Thạc sĩ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Employment Type & Quantity Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employmentType" className="text-sm font-medium">
                  Hình thức làm việc
                </Label>
                <Select value={form.employmentType} onValueChange={(value) => setForm(prev => ({ ...prev, employmentType: value }))}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Chọn hình thức" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Toàn thời gian">Toàn thời gian</SelectItem>
                    <SelectItem value="Bán thời gian">Bán thời gian</SelectItem>
                    <SelectItem value="Hợp đồng">Hợp đồng</SelectItem>
                    <SelectItem value="Tự do">Tự do</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-sm font-medium">
                  Số lượng cần tuyển
                </Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  placeholder="VD: 5"
                  value={form.quantity}
                  onChange={handleChange}
                  className="h-9"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Mô tả công việc <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Mô tả chi tiết về công việc, nhiệm vụ..."
                value={form.description}
                onChange={handleChange}
                required
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Requirements */}
            <div className="space-y-2">
              <Label htmlFor="requirement" className="text-sm font-medium">
                Yêu cầu ứng viên
              </Label>
              <Textarea
                id="requirement"
                name="requirement"
                placeholder="Các yêu cầu về kỹ năng, kinh nghiệm..."
                value={form.requirement}
                onChange={handleChange}
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Benefits */}
            <div className="space-y-2">
              <Label htmlFor="benefit" className="text-sm font-medium">
                Quyền lợi
              </Label>
              <Textarea
                id="benefit"
                name="benefit"
                placeholder="Các quyền lợi, phúc lợi cho ứng viên..."
                value={form.benefit}
                onChange={handleChange}
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Work Location */}
            <div className="space-y-2">
              <Label htmlFor="workLocation" className="text-sm font-medium">
                Địa điểm làm việc
              </Label>
              <Textarea
                id="workLocation"
                name="workLocation"
                placeholder="VD: TP. Hồ Chí Minh, Quận 1"
                value={form.workLocation}
                onChange={handleChange}
                rows={2}
                className="resize-none"
              />
            </div>

            {/* Work Time */}
            <div className="space-y-2">
              <Label htmlFor="workTime" className="text-sm font-medium">
                Thời gian làm việc
              </Label>
              <Textarea
                id="workTime"
                name="workTime"
                placeholder="VD: Thứ 2 - Thứ 6, 8h30 - 17h30"
                value={form.workTime}
                onChange={handleChange}
                rows={2}
                className="resize-none"
              />
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/employer/jobs/${job.id}`)}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" /> Lưu thay đổi
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
