import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Building2, Camera, Shield, Bell, Palette, Loader2, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { updateEmployerLogo, deleteEmployerLogo } from '@/services/authService';
import { toast } from 'react-toastify';
import ConfirmModal from '@/components/ConfirmModal';

export default function EmployerSettings() {
  const { user, login } = useAuth();
  const company = user?.company || null as any;
  const [isSavingLogo, setIsSavingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
    isLoading: false
  });

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsSavingLogo(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const updatedUser = await updateEmployerLogo(formData);
      login(updatedUser);
      toast.success('Cập nhật logo thành công!');
    } catch (error: any) {
      toast.error('Lỗi: ' + error.message);
    } finally {
      setIsSavingLogo(false);
    }
  };

  const handleLogoRemove = () => {
    if (!user) return;
    
    setConfirmModal({
      isOpen: true,
      title: 'Xóa logo công ty',
      description: 'Bạn có chắc chắn muốn xóa logo hiện tại? Hình ảnh sẽ được quay về mặc định.',
      isLoading: false,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isLoading: true }));
        try {
          const updatedUser = await deleteEmployerLogo();
          login(updatedUser);
          toast.success('Đã xóa logo công ty');
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (error: any) {
          toast.error('Lỗi khi xóa logo: ' + error.message);
        } finally {
          setConfirmModal(prev => ({ ...prev, isLoading: false }));
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Cài đặt</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Quản lý thông tin công ty và tài khoản</p>
      </div>

      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Company Profile */}
        <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg font-semibold">Thông tin công ty</CardTitle>
          </div>
          <CardDescription>Cập nhật thông tin hiển thị trên trang tuyển dụng</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Avatar className="w-20 h-20">
                {company?.logo ? (
                  <img src={company.logo} alt="Logo" className="w-full h-full rounded-full object-contain" />
                ) : (
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {company?.name?.charAt(0) || 'C'}
                  </AvatarFallback>
                )}
              </Avatar>
              {isSavingLogo && (
                <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  className="gap-2"
                  disabled={isSavingLogo}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-4 h-4" /> 
                  {isSavingLogo ? 'Đang xử lý...' : 'Đổi logo'}
                </Button>
                
                {company?.logo && !isSavingLogo && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleLogoRemove}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleLogoUpload}
              />
              <p className="text-[10px] text-muted-foreground">Định dạng: JPG, PNG. Tối đa 2MB.</p>
            </div>
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
                <Input placeholder="https://..." className="mt-1.5" defaultValue={company?.website_url || ''}/>
              </div>
              <div>
                <Label>Quy mô</Label>
                <Input placeholder="50-100 nhân viên" className="mt-1.5" defaultValue={company?.company_scale || ''}/>
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
            <CardTitle className="text-lg font-semibold">Tài khoản</CardTitle>
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
            <CardTitle className="text-lg font-semibold">Thông báo</CardTitle>
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

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        description={confirmModal.description}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        isLoading={confirmModal.isLoading}
      />
    </div>
  );
}
