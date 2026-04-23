import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Briefcase, User, Shield, Mail, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';

export default function RegisterPage() {
  const { user, isAuthReady, login } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'candidate' | 'employer'>('candidate');
  
  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [taxId, setTaxId] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!isAuthReady || !user) {
      return;
    }
    navigate('/', { replace: true });
  }, [isAuthReady, user, navigate]);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!fullName.trim()) {
      errors.fullName = 'Vui lòng nhập họ tên';
    }

    if (!email.trim()) {
      errors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Email không hợp lệ';
    }

    if (!phone.trim()) {
      errors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      errors.phone = 'Số điện thoại phải có ít nhất 10 chữ số';
    }

    if (!password) {
      errors.password = 'Vui lòng nhập mật khẩu';
    } else if (password.length < 6) {
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Mật khẩu không khớp';
    }

    if (activeTab === 'employer') {
      if (!companyName.trim()) {
        errors.companyName = 'Vui lòng nhập tên công ty';
      }
      if (!taxId.trim()) {
        errors.taxId = 'Vui lòng nhập mã số thuế';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Mock registration - in real app, call actual API
      const newUser = {
        id: Math.random(),
        email,
        password,
        name: fullName,
        phone,
        role: activeTab === 'employer' ? 'EMPLOYER' : 'CANDIDATE',
        ...(activeTab === 'employer' && { companyName, taxId }),
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      login(newUser);
      toast.success('Đăng ký thành công!');
      
      if (activeTab === 'employer') {
        navigate('/employer', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message ||
        'Đăng ký thất bại. Vui lòng thử lại.'
      );
      toast.error('Đăng ký thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { key: 'candidate' as const, label: 'Ứng viên', icon: User },
    { key: 'employer' as const, label: 'Nhà tuyển dụng', icon: Briefcase },
  ];

  if (!isAuthReady) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12">
        <div className="text-sm text-muted-foreground">Đang kiểm tra phiên đăng nhập...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Đăng ký</h1>
          <p className="text-slate-600">Tạo tài khoản để bắt đầu</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white rounded-lg p-1 shadow-sm">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setValidationErrors({});
                  setErrorMessage('');
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded font-semibold text-sm transition-all ${
                  activeTab === tab.key
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">
          {/* Error Message */}
          {errorMessage && (
            <div className="flex gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-slate-700 font-semibold">
              Họ và tên
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <Input
                id="fullName"
                type="text"
                placeholder="Nhập họ và tên"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (validationErrors.fullName) {
                    setValidationErrors({ ...validationErrors, fullName: '' });
                  }
                }}
                className={`pl-10 ${validationErrors.fullName ? 'border-red-500' : ''}`}
              />
            </div>
            {validationErrors.fullName && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {validationErrors.fullName}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700 font-semibold">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (validationErrors.email) {
                    setValidationErrors({ ...validationErrors, email: '' });
                  }
                }}
                className={`pl-10 ${validationErrors.email ? 'border-red-500' : ''}`}
              />
            </div>
            {validationErrors.email && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {validationErrors.email}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-slate-700 font-semibold">
              Số điện thoại
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <Input
                id="phone"
                type="tel"
                placeholder="0812345678"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (validationErrors.phone) {
                    setValidationErrors({ ...validationErrors, phone: '' });
                  }
                }}
                className={`pl-10 ${validationErrors.phone ? 'border-red-500' : ''}`}
              />
            </div>
            {validationErrors.phone && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {validationErrors.phone}
              </p>
            )}
          </div>

          {/* Employer-only fields */}
          {activeTab === 'employer' && (
            <>
              {/* Company Name */}
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-slate-700 font-semibold">
                  Tên công ty
                </Label>
                <Input
                  id="companyName"
                  type="text"
                  placeholder="Nhập tên công ty"
                  value={companyName}
                  onChange={(e) => {
                    setCompanyName(e.target.value);
                    if (validationErrors.companyName) {
                      setValidationErrors({ ...validationErrors, companyName: '' });
                    }
                  }}
                  className={validationErrors.companyName ? 'border-red-500' : ''}
                />
                {validationErrors.companyName && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors.companyName}
                  </p>
                )}
              </div>

              {/* Tax ID */}
              <div className="space-y-2">
                <Label htmlFor="taxId" className="text-slate-700 font-semibold">
                  Mã số thuế
                </Label>
                <Input
                  id="taxId"
                  type="text"
                  placeholder="Nhập mã số thuế"
                  value={taxId}
                  onChange={(e) => {
                    setTaxId(e.target.value);
                    if (validationErrors.taxId) {
                      setValidationErrors({ ...validationErrors, taxId: '' });
                    }
                  }}
                  className={validationErrors.taxId ? 'border-red-500' : ''}
                />
                {validationErrors.taxId && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors.taxId}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-700 font-semibold">
              Mật khẩu
            </Label>
            <PasswordInput
              id="password"
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (validationErrors.password) {
                  setValidationErrors({ ...validationErrors, password: '' });
                }
              }}
              className={validationErrors.password ? 'border-red-500' : ''}
            />
            {validationErrors.password && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {validationErrors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-slate-700 font-semibold">
              Xác nhận mật khẩu
            </Label>
            <PasswordInput
              id="confirmPassword"
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (validationErrors.confirmPassword) {
                  setValidationErrors({ ...validationErrors, confirmPassword: '' });
                }
              }}
              className={validationErrors.confirmPassword ? 'border-red-500' : ''}
            />
            {validationErrors.confirmPassword && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {validationErrors.confirmPassword}
              </p>
            )}
          </div>

          {/* Terms */}
          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
            <input type="checkbox" id="terms" className="w-4 h-4 mt-1" />
            <label htmlFor="terms" className="text-xs text-slate-600">
              Tôi đồng ý với <a href="#" className="text-slate-900 font-semibold hover:underline">Điều khoản dịch vụ</a> và <a href="#" className="text-slate-900 font-semibold hover:underline">Chính sách bảo mật</a>
            </label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
          </Button>

          {/* Login Link */}
          <div className="text-center pt-4 border-t border-slate-200">
            <p className="text-slate-600 text-sm">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-slate-900 font-semibold hover:underline">
                Đăng nhập
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
