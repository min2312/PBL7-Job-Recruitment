import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { users } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Briefcase, User, Shield } from 'lucide-react';
import { loginWithScope } from '@/services/authService';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const { user, isAuthReady, login } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'candidate' | 'employer' | 'admin'>('candidate');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!isAuthReady || !user) {
      return;
    }

    if (user.role === 'ADMIN') {
      navigate('/admin', { replace: true });
    } else if (user.role === 'EMPLOYER') {
      navigate('/employer', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  }, [isAuthReady, user, navigate]);

  const handleQuickFill = (role: 'CANDIDATE' | 'EMPLOYER' | 'ADMIN') => {
    const userAccount = users.find((item) => item.role === role);
    if (!userAccount) {
      return;
    }

    setActiveTab(role === 'ADMIN' ? 'admin' : role === 'EMPLOYER' ? 'employer' : 'candidate');
    setEmail(userAccount.email);
    setPassword('');
    setErrorMessage('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const scope = activeTab === 'admin' ? 'admin' : 'user';
      const authenticatedUser = await loginWithScope(scope, { email, password });
      login(authenticatedUser);
      if(authenticatedUser){
        toast.success("Đăng nhập thành công!");
      }
      if (authenticatedUser.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else if (authenticatedUser.role === 'EMPLOYER') {
        navigate('/employer', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message ||
        error?.response?.data?.errMessage ||
        'Đăng nhập thất bại. Kiểm tra lại email và mật khẩu.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { key: 'candidate' as const, label: 'Ứng viên', icon: User, role: 'CANDIDATE' as const },
    { key: 'employer' as const, label: 'Nhà tuyển dụng', icon: Briefcase, role: 'EMPLOYER' as const },
    { key: 'admin' as const, label: 'Admin', icon: Shield, role: 'ADMIN' as const },
  ];

  if (!isAuthReady) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12">
        <div className="text-sm text-muted-foreground">Đang kiểm tra phiên đăng nhập...</div>
      </div>
    );
  }

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
              onClick={() => {
                setActiveTab(tab.key);
                setErrorMessage('');
              }}
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

        <form className="bg-card rounded-xl border border-border p-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input
                placeholder="email@example.com"
                className="mt-1"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
            </div>
            <div>
              <Label>Mật khẩu</Label>
              <PasswordInput
                placeholder="••••••••"
                className="mt-1"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
            </div>
            {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              Đăng nhập
            </Button>
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center mb-3">Điền nhanh tài khoản demo</p>
            <div className="grid grid-cols-3 gap-2">
              {tabs.map(tab => (
                <Button
                  key={tab.key}
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => handleQuickFill(tab.role)}
                  className="text-xs"
                >
                  {tab.label}
                </Button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
