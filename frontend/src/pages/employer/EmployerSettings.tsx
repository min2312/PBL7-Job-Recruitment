import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Building2, Camera, Shield, Bell, Palette } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { getCompanyById } from '@/data/mockData';

export default function EmployerSettings() {
  const { user } = useAuth();
  const company = user?.companyId ? getCompanyById(user.companyId) : null;

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold text-foreground tracking-tight">Cài đặt</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Quản lý thông tin công ty và tài khoản</p>
      </div>

      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Company Profile */}
        <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg font-heading font-semibold">Thông tin công ty</CardTitle>
          </div>
          <CardDescription>Cập nhật thông tin hiển thị trên trang tuyển dụng</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="bg-primary/10 text-primary text-xl">{company?.name?.charAt(0) || 'C'}</AvatarFallback>
            </Avatar>
            <Button variant="outline" className="gap-2"><Camera className="w-4 h-4" /> Đổi logo</Button>
          </div>
          <div className="grid gap-4">
            <div>
              <Label>Tên công ty</Label>
              <Input defaultValue={company?.name || ''} className="mt-1.5" />
            </div>
            <div>
              <Label>Mô tả công ty</Label>
              <textarea className="w-full min-h-[100px] rounded-lg border border-input bg-background p-3 text-sm mt-1.5" defaultValue={company?.description || ''} placeholder="Giới thiệu về công ty..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Website</Label>
                <Input placeholder="https://..." className="mt-1.5" />
              </div>
              <div>
                <Label>Quy mô</Label>
                <Input placeholder="50-100 nhân viên" className="mt-1.5" />
              </div>
            </div>
          </div>
          <Button>Lưu thay đổi</Button>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg font-heading font-semibold">Tài khoản</CardTitle>
          </div>
          <CardDescription>Quản lý email và mật khẩu</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input defaultValue={user?.email || ''} className="mt-1.5" />
          </div>
          <div>
            <Label>Mật khẩu hiện tại</Label>
            <Input type="password" placeholder="••••••••" className="mt-1.5" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Mật khẩu mới</Label>
              <Input type="password" placeholder="••••••••" className="mt-1.5" />
            </div>
            <div>
              <Label>Xác nhận mật khẩu</Label>
              <Input type="password" placeholder="••••••••" className="mt-1.5" />
            </div>
          </div>
          <Button variant="outline">Đổi mật khẩu</Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg font-heading font-semibold">Thông báo</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: 'Email khi có ứng viên mới', description: 'Nhận email khi có ứng viên ứng tuyển' },
            { label: 'Tin nhắn mới', description: 'Thông báo khi nhận tin nhắn từ ứng viên' },
            { label: 'Nhắc lịch phỏng vấn', description: 'Nhắc nhở trước buổi phỏng vấn 30 phút' },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <Switch defaultChecked />
            </div>
          ))}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
