import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import axiosClient from '@/services/axiosClient';
import { toast } from 'react-toastify';

interface Props {
  refreshData?: () => void;
}

export default function EmployerJobCreate({ refreshData }: Props) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    level: '',
    salary: '',
    gender: 'Không yêu cầu',
    age: '',
    experience: 'Không yêu cầu',
    education: 'Không yêu cầu',
    employmentType: 'Toàn thời gian',
    quantity: '1',
    startDate: '',
    endDate: '',
    description: '',
    requirement: '',
    benefit: '',
    workLocation: '',
    workTime: '',
    categoryIds: [] as number[],
    locationIds: [] as number[],
  });

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, locRes] = await Promise.all([
          axiosClient.get('/api/categories'),
          axiosClient.get('/api/locations')
        ]);
        if (catRes.data.errCode === 0) setCategories(catRes.data.data);
        if (locRes.data.errCode === 0) setLocations(locRes.data.data);
      } catch (error) {
        console.error('Error fetching metadata:', error);
      }
    };
    fetchMetadata();
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.salary || !formData.description) {
      toast.warn('Vui lòng điền các trường bắt buộc');
      return;
    }
    
    setLoading(true);
    try {
      const payload = {
        ...formData,
        quantity: parseInt(formData.quantity) || 1,
        age: formData.age ? parseInt(formData.age) : null,
      };
      
      const res = await axiosClient.post('/api/jobs/create', payload);
      if (res.data.errCode === 0) {
        toast.success('Đăng tin tuyển dụng thành công!');
        if (refreshData) refreshData();
        navigate('/employer/jobs');
      } else {
        toast.error(res.data.errMessage || 'Đăng tin thất bại');
      }
    } catch (error) {
      toast.error('Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
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

            {/* 1. Tên công việc & Vị trí */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Tên công việc <span className="text-destructive">*</span>
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
                <Label htmlFor="level" className="text-sm font-medium">
                  Vị trí
                </Label>
                <Input
                  id="level"
                  name="level"
                  placeholder="VD: Frontend Developer"
                  value={formData.level}
                  onChange={handleChange}
                  className="h-9"
                />
              </div>
            </div>

            {/* 2. Lương & Số lượng */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            {/* Metadata: Category & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Ngành nghề
                </Label>
                <Select 
                  value={formData.categoryIds[0]?.toString()} 
                  onValueChange={(val) => setFormData(prev => ({ ...prev, categoryIds: [parseInt(val)] }))}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Chọn ngành nghề" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Khu vực
                </Label>
                <Select 
                  value={formData.locationIds[0]?.toString()} 
                  onValueChange={(val) => setFormData(prev => ({ ...prev, locationIds: [parseInt(val)] }))}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Chọn tỉnh thành" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(loc => (
                      <SelectItem key={loc.id} value={loc.id.toString()}>{loc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 3. Giới tính & Tuổi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Giới tính
                </Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Chọn giới tính" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Không yêu cầu">Không yêu cầu</SelectItem>
                    <SelectItem value="Nam">Nam</SelectItem>
                    <SelectItem value="Nữ">Nữ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="age" className="text-sm font-medium">
                  Tuổi
                </Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  placeholder="VD: 25"
                  value={formData.age}
                  onChange={handleChange}
                  className="h-9"
                />
              </div>
            </div>

            {/* 4. Kinh nghiệm & Học vấn & Hình thức */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
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
                <Label className="text-sm font-medium">
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

              <div className="space-y-2">
                <Label className="text-sm font-medium">
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
            </div>

            {/* 5. Ngày bắt đầu & kết thúc nộp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm font-medium">
                  Ngày bắt đầu nhận hồ sơ
                </Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-sm font-medium">
                  Ngày kết thúc nhận hồ sơ
                </Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="h-9"
                />
              </div>
            </div>

            {/* 6. Mô tả công việc */}
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

            {/* 7. Yêu cầu ứng viên */}
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

            {/* 8. Quyền lợi */}
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

            {/* 9. Địa điểm & Thời gian làm việc */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/employer/jobs')}
                className="flex-1"
                disabled={loading}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Tạo tin tuyển dụng
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}