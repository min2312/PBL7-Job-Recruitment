import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Plus } from 'lucide-react';
import { jobs } from '@/data/mockData';

export default function EmployerJobCreate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    salary: '',
    level: '',
    experience: '',
    education: '',
    employmentType: '',
    quantity: '',
    description: '',
    requirement: '',
    benefit: '',
    workLocation: '',
    workTime: '',
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate form
    if (!formData.title || !formData.salary || !formData.description) {
      alert('Vui lòng điền các trường bắt buộc');
      return;
    }
    // Create new job
    const newJob = {
      id: Math.max(...jobs.map(j => j.id)) + 1,
      ...formData,
      quantity: parseInt(formData.quantity) || 1,
      categoryIds: [1],
      locationIds: [1],
      companyId: 1,
      createdAt: new Date().toLocaleDateString('vi-VN'),
    };
    console.log('New Job:', newJob);
    // TODO: Call API to create job
    navigate(`/employer/jobs`);
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
        <span className="text-foreground font-medium">Tạo tin mới</span>
      </div>

      {/* Create Job Form */}
      <Card className="rounded-xl border-border/60 shadow-sm">
        <CardHeader className="border-b border-border/60">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            <div>
              <CardTitle className="text-xl">Tạo tin tuyển dụng mới</CardTitle>
              <CardDescription>Điền đầy đủ thông tin để đăng tin tuyển dụng</CardDescription>
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
                  value={formData.title}
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
                  value={formData.salary}
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
                <Select value={formData.level} onValueChange={(value) => setFormData(prev => ({ ...prev, level: value }))}>
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
                <Select value={formData.experience} onValueChange={(value) => setFormData(prev => ({ ...prev, experience: value }))}>
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
                <Select value={formData.education} onValueChange={(value) => setFormData(prev => ({ ...prev, education: value }))}>
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
                <Select value={formData.employmentType} onValueChange={(value) => setFormData(prev => ({ ...prev, employmentType: value }))}>
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
                  value={formData.quantity}
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
                value={formData.description}
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
                value={formData.requirement}
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
                value={formData.benefit}
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
                value={formData.workLocation}
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
                value={formData.workTime}
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
                onClick={() => navigate('/employer/jobs')}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="w-4 h-4 mr-2" /> Tạo tin tuyển dụng
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
