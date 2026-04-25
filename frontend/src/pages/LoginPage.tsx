import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Briefcase, User, Shield, ArrowRight } from 'lucide-react';
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

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    if (!isAuthReady || !user) return;
    if (user.role === 'ADMIN') navigate('/admin', { replace: true });
    else if (user.role === 'EMPLOYER') navigate('/employer', { replace: true });
    else navigate('/', { replace: true });
  }, [isAuthReady, user, navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const scope = activeTab === 'admin' ? 'admin' : 'user';
      const authenticatedUser = await loginWithScope(scope, { email, password });
      login(authenticatedUser);
      toast.success('Đăng nhập thành công!');
      if (authenticatedUser.role === 'ADMIN') navigate('/admin', { replace: true });
      else if (authenticatedUser.role === 'EMPLOYER') navigate('/employer', { replace: true });
      else navigate('/', { replace: true });
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
    { key: 'candidate' as const, label: 'Ứng viên', icon: User },
    { key: 'employer' as const, label: 'Nhà tuyển dụng', icon: Briefcase },
    { key: 'admin' as const, label: 'Admin', icon: Shield },
  ];

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-sm text-muted-foreground animate-pulse">Đang kiểm tra phiên đăng nhập...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Brand */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-12 bg-slate-900 overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute top-1/2 -right-32 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute -bottom-20 left-1/4 w-64 h-64 rounded-full bg-white/5" />

        {/* Logo */}
        <Link to="/" className="relative z-10 flex items-center gap-3 group w-fit">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Briefcase className="w-5 h-5 text-slate-900" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">JobHub</span>
        </Link>

        {/* Middle content */}
        <div className="relative z-10 space-y-6">
          <div className="space-y-2">
            <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">Chào mừng trở lại</p>
            <h2 className="text-4xl font-bold text-white leading-tight">
              Tìm việc làm<br />
              <span className="text-slate-400">phù hợp nhất</span><br />
              với bạn.
            </h2>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
            Kết nối hàng ngàn ứng viên với nhà tuyển dụng uy tín. Hành trình sự nghiệp của bạn bắt đầu từ đây.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { value: '50K+', label: 'Việc làm' },
              { value: '12K+', label: 'Doanh nghiệp' },
              { value: '200K+', label: 'Ứng viên' },
            ].map(stat => (
              <div key={stat.label} className="bg-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
                <p className="text-white font-bold text-lg">{stat.value}</p>
                <p className="text-slate-400 text-xs mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10">
          <p className="text-slate-600 text-xs">© 2025 JobHub. All rights reserved.</p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex flex-col min-h-screen bg-white">
        {/* Mobile logo bar */}
        <div className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">JobHub</span>
          </Link>
          <Link to="/" className="text-sm text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1">
            Trang chủ
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Đăng nhập</h1>
              <p className="text-slate-500 text-sm">Chọn vai trò và nhập thông tin của bạn</p>
            </div>

            {/* Role tabs */}
            <div className="flex gap-1.5 mb-6 p-1 bg-slate-100 rounded-xl">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setErrorMessage(''); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    activeTab === tab.key
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">Email</Label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  className="h-11 border-slate-200 focus:border-slate-900 focus:ring-slate-900/10 rounded-lg"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-slate-700">Mật khẩu</Label>
                  <a href="#" className="text-xs text-slate-500 hover:text-slate-900 transition-colors">
                    Quên mật khẩu?
                  </a>
                </div>
                <PasswordInput
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="h-11 border-slate-200 focus:border-slate-900 focus:ring-slate-900/10 rounded-lg"
                />
              </div>

              {errorMessage && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-semibold rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Đang đăng nhập...
                  </>
                ) : (
                  <>
                    Đăng nhập
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-xs text-slate-400">hoặc</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            {/* Register CTA */}
            <div className="text-center">
              <p className="text-sm text-slate-500 mb-3">Chưa có tài khoản?</p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 w-full justify-center h-11 border border-slate-200 hover:border-slate-900 text-slate-700 hover:text-slate-900 font-semibold rounded-lg text-sm transition-all duration-150"
              >
                Đăng ký miễn phí
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}