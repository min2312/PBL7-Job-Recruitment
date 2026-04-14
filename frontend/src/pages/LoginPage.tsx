import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { users } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Briefcase, User, Shield } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'candidate' | 'employer' | 'admin'>('candidate');

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const quickLogin = (role: 'CANDIDATE' | 'EMPLOYER' | 'ADMIN') => {
    const user = users.find(u => u.role === role);
    if (user) {
      login(user);
      if (role === 'ADMIN') navigate('/admin');
      else if (role === 'EMPLOYER') navigate('/employer');
      else navigate('/');  // Candidate → Home
    }
  };

  const tabs = [
    { key: 'candidate' as const, label: 'Ứng viên', icon: User, role: 'CANDIDATE' as const },
    { key: 'employer' as const, label: 'Nhà tuyển dụng', icon: Briefcase, role: 'EMPLOYER' as const },
    { key: 'admin' as const, label: 'Admin', icon: Shield, role: 'ADMIN' as const },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Đăng nhập JobHub</h1>
          <p className="text-muted-foreground text-sm mt-1">Chọn vai trò để trải nghiệm</p>
        </div>

        {/* Role tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <div className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input placeholder="email@example.com" className="mt-1" />
            </div>
            <div>
              <Label>Mật khẩu</Label>
              <Input type="password" placeholder="••••••••" className="mt-1" />
            </div>
            <Button className="w-full" onClick={() => quickLogin(tabs.find(t => t.key === activeTab)!.role)}>
              Đăng nhập
            </Button>
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center mb-3">Đăng nhập nhanh (demo)</p>
            <div className="grid grid-cols-3 gap-2">
              {tabs.map(tab => (
                <Button
                  key={tab.key}
                  variant="outline"
                  size="sm"
                  onClick={() => quickLogin(tab.role)}
                  className="text-xs"
                >
                  {tab.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
