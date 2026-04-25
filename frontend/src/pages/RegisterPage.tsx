import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Briefcase, User, Mail, Phone, AlertCircle, ArrowRight, Building2 } from 'lucide-react';
import { toast } from 'react-toastify';
import axiosClient from '@/services/axiosClient';

export default function RegisterPage() {
  const { user, isAuthReady, login } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'candidate' | 'employer'>('candidate');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [taxId, setTaxId] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    if (!isAuthReady || !user) return;
    navigate('/', { replace: true });
  }, [isAuthReady, user, navigate]);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!name.trim()) errors.name = 'Vui lòng nhập họ tên';
    if (!email.trim()) errors.email = 'Vui lòng nhập email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Email không hợp lệ';
    if (!phone.trim()) errors.phone = 'Vui lòng nhập số điện thoại';
    else if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) errors.phone = 'Số điện thoại phải có ít nhất 10 chữ số';
    if (!password) errors.password = 'Vui lòng nhập mật khẩu';
    else if (password.length < 6) errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    if (!confirmPassword) errors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    else if (password !== confirmPassword) errors.confirmPassword = 'Mật khẩu không khớp';
    if (activeTab === 'employer') {
      if (!companyName.trim()) errors.companyName = 'Vui lòng nhập tên công ty';
      if (!taxId.trim()) errors.taxId = 'Vui lòng nhập mã số thuế';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const clearError = (field: string) => {
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const newUser = {
        email,
        password,
        name: name,
        phone,
        role: activeTab === 'employer' ? 'EMPLOYER' : 'CANDIDATE',
        ...(activeTab === 'employer' && { companyName, taxId }),
      };
      const registeredUser = await axiosClient.post("/api/register", newUser);
      console.log('Registered user response:', registeredUser);
      if(registeredUser.data.errCode === 0){
        toast.success('Đăng ký thành công!');
        navigate('/login', { replace: true });
      } else {
        setErrorMessage(registeredUser.data.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        toast.error('Đăng ký thất bại');
      }
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      toast.error('Đăng ký thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const FieldError = ({ field }: { field: string }) =>
    validationErrors[field] ? (
      <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
        <AlertCircle className="w-3 h-3 flex-shrink-0" />
        {validationErrors[field]}
      </p>
    ) : null;

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
      <div className="hidden lg:flex lg:w-[42%] relative flex-col justify-between p-12 bg-slate-900 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute top-1/3 -right-28 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 left-1/3 w-56 h-56 rounded-full bg-white/5" />

        {/* Logo */}
        <Link to="/" className="relative z-10 flex items-center gap-3 group w-fit">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Briefcase className="w-5 h-5 text-slate-900" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">JobHub</span>
        </Link>

        {/* Steps guide */}
        <div className="relative z-10 space-y-6">
          <div className="space-y-2">
            <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">Bắt đầu miễn phí</p>
            <h2 className="text-4xl font-bold text-white leading-tight">
              3 bước để<br />
              <span className="text-slate-400">bắt đầu hành trình</span>
            </h2>
          </div>

          <div className="space-y-4 pt-2">
            {[
              { step: '01', title: 'Tạo tài khoản', desc: 'Đăng ký miễn phí trong 2 phút' },
              { step: '02', title: 'Hoàn thiện hồ sơ', desc: 'Thêm kỹ năng và kinh nghiệm của bạn' },
              { step: '03', title: 'Ứng tuyển ngay', desc: 'Tìm và apply hàng ngàn cơ hội' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <span className="text-slate-600 font-bold text-xs mt-0.5 w-6 flex-shrink-0">{item.step}</span>
                <div className="flex-1 pb-4 border-b border-slate-800 last:border-0">
                  <p className="text-white font-semibold text-sm">{item.title}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-slate-600 text-xs">© 2025 JobHub. All rights reserved.</p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex flex-col min-h-screen bg-white overflow-y-auto">
        {/* Mobile logo bar */}
        <div className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">JobHub</span>
          </Link>
          <Link to="/" className="text-sm text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1">
            Trang chủ <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="flex-1 flex items-start justify-center px-6 py-10">
          <div className="w-full max-w-sm">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Tạo tài khoản</h1>
              <p className="text-slate-500 text-sm">Chọn vai trò để bắt đầu đăng ký</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1.5 mb-6 p-1 bg-slate-100 rounded-xl">
              {[
                { key: 'candidate' as const, label: 'Ứng viên', icon: User },
                { key: 'employer' as const, label: 'Nhà tuyển dụng', icon: Building2 },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setValidationErrors({}); setErrorMessage(''); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
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

            {/* Error */}
            {errorMessage && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg mb-4">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full name */}
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Họ và tên</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <Input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={name}
                    onChange={e => { setName(e.target.value); clearError('name'); }}
                    className={`pl-9 h-11 rounded-lg border-slate-200 ${validationErrors.name ? 'border-red-400' : ''}`}
                  />
                </div>
                <FieldError field="name" />
              </div>

              {/* Email */}
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); clearError('email'); }}
                    className={`pl-9 h-11 rounded-lg border-slate-200 ${validationErrors.email ? 'border-red-400' : ''}`}
                  />
                </div>
                <FieldError field="email" />
              </div>

              {/* Phone */}
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Số điện thoại</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <Input
                    type="tel"
                    placeholder="0812345678"
                    value={phone}
                    onChange={e => { setPhone(e.target.value); clearError('phone'); }}
                    className={`pl-9 h-11 rounded-lg border-slate-200 ${validationErrors.phone ? 'border-red-400' : ''}`}
                  />
                </div>
                <FieldError field="phone" />
              </div>

              {/* Employer fields */}
              {activeTab === 'employer' && (
                <div className="p-4 bg-slate-50 rounded-xl space-y-4 border border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Thông tin doanh nghiệp</p>
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Tên công ty</Label>
                    <Input
                      type="text"
                      placeholder="Công ty TNHH ABC"
                      value={companyName}
                      onChange={e => { setCompanyName(e.target.value); clearError('companyName'); }}
                      className={`h-11 rounded-lg border-slate-200 ${validationErrors.companyName ? 'border-red-400' : ''}`}
                    />
                    <FieldError field="companyName" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Mã số thuế</Label>
                    <Input
                      type="text"
                      placeholder="0123456789"
                      value={taxId}
                      onChange={e => { setTaxId(e.target.value); clearError('taxId'); }}
                      className={`h-11 rounded-lg border-slate-200 ${validationErrors.taxId ? 'border-red-400' : ''}`}
                    />
                    <FieldError field="taxId" />
                  </div>
                </div>
              )}

              {/* Password */}
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Mật khẩu</Label>
                <PasswordInput
                  placeholder="Tối thiểu 6 ký tự"
                  value={password}
                  onChange={e => { setPassword(e.target.value); clearError('password'); }}
                  className={`h-11 rounded-lg border-slate-200 ${validationErrors.password ? 'border-red-400' : ''}`}
                />
                <FieldError field="password" />
              </div>

              {/* Confirm password */}
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Xác nhận mật khẩu</Label>
                <PasswordInput
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); clearError('confirmPassword'); }}
                  className={`h-11 rounded-lg border-slate-200 ${validationErrors.confirmPassword ? 'border-red-400' : ''}`}
                />
                <FieldError field="confirmPassword" />
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 mt-0.5 accent-slate-900 flex-shrink-0" />
                <span className="text-xs text-slate-500 leading-relaxed">
                  Tôi đồng ý với{' '}
                  <a href="#" className="text-slate-900 font-semibold hover:underline">Điều khoản dịch vụ</a>
                  {' '}và{' '}
                  <a href="#" className="text-slate-900 font-semibold hover:underline">Chính sách bảo mật</a>
                </span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-semibold rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Đang đăng ký...
                  </>
                ) : (
                  <>Đăng ký miễn phí <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            {/* Divider + Login link */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-xs text-slate-400">hoặc</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            <div className="text-center">
              <p className="text-sm text-slate-500 mb-3">Đã có tài khoản?</p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 w-full justify-center h-11 border border-slate-200 hover:border-slate-900 text-slate-700 hover:text-slate-900 font-semibold rounded-lg text-sm transition-all duration-150"
              >
                Đăng nhập ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}