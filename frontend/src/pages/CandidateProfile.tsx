import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft, User, Mail, Phone, Save, Edit3, Lock, Eye, EyeOff,
  CheckCircle, AlertCircle, Camera, Upload, File, X, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CandidateProfile() {
  const { user, isAuthReady } = useAuth();
  const location = useLocation();

  // Scroll to top when page loads or location changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  const [editing, setEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    bio: 'Tôi là một chuyên viên có kinh nghiệm trong lĩnh vực công nghệ, đam mê xây dựng các sản phẩm số chất lượng cao.',
  });

  // CV upload state
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvFileName, setCvFileName] = useState<string | null>(null);
  const [cvUploadSuccess, setCvUploadSuccess] = useState(false);
  const [cvError, setCvError] = useState('');

  // Password change state
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [showPass, setShowPass] = useState({ current: false, newPass: false, confirm: false });
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);

  if (!isAuthReady) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-sm">Đang kiểm tra phiên đăng nhập...</span>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'CANDIDATE') return <Navigate to="/login" />;

  if (profile.name === '' && user) {
    setProfile(p => ({ ...p, name: user.name, email: user.email, phone: user.phone || '' }));
  }

  const handleSave = () => {
    setEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handlePasswordChange = () => {
    setPassError('');
    if (!passwords.current) return setPassError('Vui lòng nhập mật khẩu hiện tại.');
    if (passwords.newPass.length < 8) return setPassError('Mật khẩu mới tối thiểu 8 ký tự.');
    if (passwords.newPass !== passwords.confirm) return setPassError('Xác nhận mật khẩu không khớp.');
    setPassSuccess(true);
    setPasswords({ current: '', newPass: '', confirm: '' });
    setTimeout(() => setPassSuccess(false), 3000);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setCvError('');
    
    if (file) {
      // Validate file type
      if (!file.type.includes('pdf')) {
        setCvError('Vui lòng chọn file PDF');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setCvError('Kích thước file tối đa 5MB');
        return;
      }
      
      setCvFile(file);
      setCvFileName(file.name);
    }
  };

  const handleCVRemove = () => {
    setCvFile(null);
    setCvFileName(null);
    setCvError('');
  };

  const handleCVSave = () => {
    if (cvFile) {
      setCvUploadSuccess(true);
      setTimeout(() => setCvUploadSuccess(false), 3000);
    }
  };

  const handleCVDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setCvError('');
      
      if (!file.type.includes('pdf')) {
        setCvError('Vui lòng chọn file PDF');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setCvError('Kích thước file tối đa 5MB');
        return;
      }
      
      setCvFile(file);
      setCvFileName(file.name);
    }
  };

  const initials = profile.name
    ? profile.name.split(' ').slice(-2).map((w: string) => w[0]).join('').toUpperCase()
    : 'UV';

  return (
    <div className="min-h-screen bg-background">
      {/* Banner */}
      <div className="h-24 bg-gradient-to-r from-blue-300 via-purple-300 to-pink-200" />

      <div className="max-w-5xl mx-auto px-4 pb-12">
        {/* Profile Header Card */}
        <div className="bg-card border border-border rounded-2xl p-6 -mt-12 mb-8 relative z-10 shadow-sm">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative group cursor-pointer">
              {/* Avatar Display */}
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white flex-shrink-0 transition-all group-hover:ring-2 group-hover:ring-blue-400 ${
                avatarPreview ? 'bg-cover bg-center' : (profile.name.toLowerCase().includes('a') ? 'bg-blue-500' : 'bg-gradient-to-br from-purple-500 to-pink-500')
              }`}
              style={avatarPreview ? { backgroundImage: `url(${avatarPreview})` } : {}}>
                {!avatarPreview && initials}
              </div>
              
              {/* Upload Overlay */}
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
              
              {/* Hidden File Input */}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                id="avatar-upload"
              />
              <label htmlFor="avatar-upload" className="absolute inset-0 rounded-full cursor-pointer" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{profile.name || 'Tên ứng viên'}</h1>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-center gap-2 text-green-700 dark:text-green-400 text-sm mb-4">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              Cập nhật thành công!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Personal Information Section */}
        <Section 
          title="Thông tin cá nhân"
          action={
            !editing ? (
              <Button onClick={() => setEditing(true)} className="gap-2 bg-black hover:bg-gray-800 text-white" size="sm">
                <Edit3 className="w-4 h-4" /> Chỉnh sửa
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditing(false)} className="border-gray-300">Huỷ</Button>
                <Button onClick={handleSave} size="sm" className="gap-2 bg-black hover:bg-gray-800 text-white">
                  <Save className="w-4 h-4" /> Lưu
                </Button>
              </div>
            )
          }
        >
          <div className="space-y-4">
            {/* Row 1: Full Name, Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Họ và tên</label>
                <Input 
                  value={profile.name} 
                  onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} 
                  placeholder="Nhập họ tên"
                  disabled={!editing}
                  className="bg-gray-50 dark:bg-gray-900 disabled:opacity-70"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Email</label>
                <Input 
                  type="email" 
                  value={profile.email} 
                  onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} 
                  placeholder="Nhập email"
                  disabled={!editing}
                  className="bg-gray-50 dark:bg-gray-900 disabled:opacity-70"
                />
              </div>
            </div>

            {/* Row 2: Phone, Bio */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Số điện thoại</label>
                <Input 
                  value={profile.phone} 
                  onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} 
                  placeholder="Nhập số điện thoại"
                  disabled={!editing}
                  className="bg-gray-50 dark:bg-gray-900 disabled:opacity-70"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Giới thiệu bản thân</label>
                <Textarea 
                  value={profile.bio} 
                  onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} 
                  placeholder="Viết về bạn..." 
                  rows={2} 
                  className="resize-none bg-gray-50 dark:bg-gray-900 disabled:opacity-70"
                  disabled={!editing}
                />
              </div>
            </div>
          </div>
        </Section>

        {/* CV Upload Section */}
        <Section title="Upload CV">
          <div className="space-y-4">
            <AnimatePresence>
              {cvError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-center gap-2 text-red-700 dark:text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {cvError}
                </motion.div>
              )}
              {cvUploadSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-center gap-2 text-green-700 dark:text-green-400 text-sm">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  Tải lên CV thành công!
                </motion.div>
              )}
            </AnimatePresence>

            {!cvFile ? (
              <div
                onDrop={handleCVDrop}
                onDragOver={e => e.preventDefault()}
                className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/30 hover:bg-muted/50"
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleCVUpload}
                  className="hidden"
                  id="cv-upload"
                />
                <label htmlFor="cv-upload" className="cursor-pointer flex flex-col items-center gap-3">
                  <Upload className="w-10 h-10 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Kéo thả hoặc click để tải lên CV</p>
                    <p className="text-xs text-muted-foreground mt-1">Chỉ hỗ trợ file PDF, tối đa 5MB</p>
                  </div>
                </label>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="border border-border rounded-lg p-4 bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <File className="w-8 h-8 text-blue-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{cvFileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {(cvFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCVRemove}
                  className="text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {cvFile && (
              <Button
                onClick={handleCVSave}
                className="w-full gap-2 bg-black hover:bg-gray-800 text-white">
                <Download className="w-4 h-4" /> Lưu CV
              </Button>
            )}
          </div>
        </Section>

        {/* Security Section */}
        <Section title="Bảo mật thông tin">
          <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block flex items-center gap-1.5">
              <Lock className="w-3 h-3" /> Mật khẩu hiện tại
            </label>
            <div className="relative">
              <Input
                type={showPass.current ? 'text' : 'password'}
                value={passwords.current}
                onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
                placeholder="Nhập mật khẩu hiện tại"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPass(p => ({ ...p, current: !p.current }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPass.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block flex items-center gap-1.5">
              <Lock className="w-3 h-3" /> Mật khẩu mới
            </label>
            <div className="relative">
              <Input
                type={showPass.newPass ? 'text' : 'password'}
                value={passwords.newPass}
                onChange={e => setPasswords(p => ({ ...p, newPass: e.target.value }))}
                placeholder="Tối thiểu 8 ký tự"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPass(p => ({ ...p, newPass: !p.newPass }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPass.newPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwords.newPass && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      passwords.newPass.length < 8
                        ? 'w-1/3 bg-red-500'
                        : passwords.newPass.length < 12
                        ? 'w-2/3 bg-yellow-500'
                        : 'w-full bg-green-500'
                    }`}
                  />
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {passwords.newPass.length < 8 ? 'Yếu' : passwords.newPass.length < 12 ? 'Trung bình' : 'Mạnh'}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block flex items-center gap-1.5">
              <Lock className="w-3 h-3" /> Xác nhận mật khẩu
            </label>
            <div className="relative">
              <Input
                type={showPass.confirm ? 'text' : 'password'}
                value={passwords.confirm}
                onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                placeholder="Nhập lại mật khẩu mới"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPass(p => ({ ...p, confirm: !p.confirm }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPass.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {passError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-center gap-2 text-red-700 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {passError}
              </motion.div>
            )}
            {passSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-center gap-2 text-green-700 dark:text-green-400 text-sm">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                Đổi mật khẩu thành công!
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            onClick={handlePasswordChange}
            disabled={!passwords.current || !passwords.newPass || !passwords.confirm}
            className="w-full gap-2 mt-4 bg-black hover:bg-gray-800 text-white disabled:bg-gray-400 disabled:cursor-not-allowed">
            <Lock className="w-4 h-4" /> Cập nhật mật khẩu
          </Button>
          </div>
        </Section>
      </div>
    </div>
  );
}

// ──────────────────────────── HELPER COMPONENTS ────────────────────────────

function Section({ title, children, className, action }: { title: string; children: React.ReactNode; className?: string; action?: React.ReactNode }) {
  return (
    <div className={`bg-card border border-border rounded-2xl p-5 md:p-6 mb-6 ${className || ''}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-foreground text-sm uppercase tracking-wide text-muted-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1 block">
        {icon && <span className="opacity-60">{icon}</span>}{label}
      </label>
      <div className="text-sm">{children}</div>
    </div>
  );
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="bg-card border border-dashed border-border rounded-xl p-8 text-center">
      <div className="text-muted-foreground/40 flex justify-center mb-2">{icon}</div>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}