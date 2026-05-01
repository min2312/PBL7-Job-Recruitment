import { useState, useEffect } from 'react';
import { Settings, Bell, Lock, Globe, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AdminSettings() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <>
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-1 flex items-center gap-2">
          <Settings className="w-8 h-8 text-primary" />
          Cài đặt hệ thống
        </h1>
        <p className="text-sm text-muted-foreground">Cấu hình các tham số vận hành của website MNP</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-card rounded-xl border border-border shadow-sm">
            <div className="p-6 border-b border-border flex items-center gap-3">
              <Globe className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold">Cấu hình chung</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-semibold">Tên website</label>
                <input className="bg-background border border-border p-2.5 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" defaultValue="MNP recruitment" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-semibold">Email liên hệ</label>
                <input className="bg-background border border-border p-2.5 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" defaultValue="contact@MNP.com" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-semibold">Mô tả hệ thống</label>
                <textarea rows={3} className="bg-background border border-border p-2.5 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none resize-none" defaultValue="Master New Potential." />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border shadow-sm">
            <div className="p-6 border-b border-border flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold">Bảo mật & Phê duyệt</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <div>
                  <div className="text-sm font-bold">Tự động duyệt tin tuyển dụng</div>
                  <div className="text-xs text-muted-foreground">Các tin đăng mới sẽ được hiển thị ngay lập tức</div>
                </div>
                <div className="w-10 h-5 bg-muted rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 w-3 h-3 bg-foreground rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <div>
                  <div className="text-sm font-bold">Yêu cầu xác thực công ty</div>
                  <div className="text-xs text-muted-foreground">NTD phải upload giấy phép kinh doanh</div>
                </div>
                <div className="w-10 h-5 bg-primary rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4" /> Thông báo Admin
            </h4>
            <div className="space-y-3">
              {[
                'Thông báo đơn ứng tuyển mới',
                'Thông báo công ty đăng ký mới',
                'Báo cáo tin tuyển dụng vi phạm',
              ].map((txt, i) => (
                <label key={i} className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-border" />
                  <span className="text-sm group-hover:text-primary transition-colors">{txt}</span>
                </label>
              ))}
            </div>
          </div>

          <Button className="w-full py-6 font-bold text-lg shadow-lg shadow-primary/20">
            Lưu toàn bộ cài đặt
          </Button>
        </div>
      </div>
    </>
  );
}
