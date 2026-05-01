import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft, User, Mail, Phone, Save, Edit3, Lock, Eye, EyeOff,
  CheckCircle, AlertCircle, Camera, Upload, File, X, Download, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { updateProfile, changePassword, removeFile } from '@/services/authService';
import { toast } from 'react-toastify';
import ConfirmModal from '@/components/ConfirmModal';

export default function CandidateProfile() {
  const { user, isAuthReady, login } = useAuth();
  const location = useLocation();

  // Scroll to top when page loads or location changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  const [editing, setEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
  });

  // CV upload state
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvFileName, setCvFileName] = useState<string | null>(null);
  const [cvPreviewUrl, setCvPreviewUrl] = useState<string | null>(null);
  const [cvUploadSuccess, setCvUploadSuccess] = useState(false);
  const [cvError, setCvError] = useState('');
  // Password change state
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [showPass, setShowPass] = useState({ current: false, newPass: false, confirm: false });
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);

  // Global confirm modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: async () => {},
    isLoading: false
  });

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
    setProfile({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      bio: user.description || '',
    });
    
    if (user.cv_file) {
      const urlParts = user.cv_file.split('/');
      const fullName = urlParts[urlParts.length - 1];
      const cleanName = fullName.replace(/^\d+-+/, ''); 
      setCvFileName(cleanName || fullName);
    }
  }

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('id', user.id.toString());
      formData.append('name', profile.name);
      formData.append('phone', profile.phone);
      formData.append('description', profile.bio);
      
      if (avatarFile) {
        formData.append('profilePicture', avatarFile);
      }
      
      if (cvFile) {
        formData.append('cv_file', cvFile);
      }

      const updatedUser = await updateProfile(formData);
      login(updatedUser); // Update global state
      
      setEditing(false);
      setSaveSuccess(true);
      toast.success('Cập nhật thông tin thành công!');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      toast.error(error.message || 'Cập nhật thất bại');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setPassError('');
    if (!passwords.current) return setPassError('Vui lòng nhập mật khẩu hiện tại.');
    if (passwords.newPass.length < 8) return setPassError('Mật khẩu mới tối thiểu 8 ký tự.');
    if (passwords.newPass !== passwords.confirm) return setPassError('Xác nhận mật khẩu không khớp.');
    
    setIsChangingPass(true);
    try {
      await changePassword({
        current: passwords.current,
        newPass: passwords.newPass
      });
      
      setPassSuccess(true);
      setPasswords({ current: '', newPass: '', confirm: '' });
      toast.success('Đổi mật khẩu thành công!');
      setTimeout(() => setPassSuccess(false), 3000);
    } catch (error: any) {
      setPassError(error.message || 'Đổi mật khẩu thất bại');
      toast.error(error.message || 'Đổi mật khẩu thất bại');
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        setIsAvatarModalOpen(true); // Mở modal khi đã có ảnh preview
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarSave = async () => {
    if (!avatarFile || !user) return;
    setIsSavingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('id', user.id.toString());
      formData.append('profilePicture', avatarFile);

      const updatedUser = await updateProfile(formData);
      login(updatedUser);
      toast.success('Cập nhật ảnh đại diện thành công!');
      setIsAvatarModalOpen(false); // Chỉ đóng modal khi thành công
    } catch (error: any) {
      toast.error('Lỗi: ' + error.message);
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const handleAvatarRemove = () => {
    if (!user) return;
    
    setConfirmModal({
      isOpen: true,
      title: 'Xóa ảnh đại diện',
      description: 'Bạn có chắc chắn muốn xóa ảnh đại diện hiện tại? Hành động này không thể hoàn tác.',
      isLoading: false,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isLoading: true }));
        try {
          await removeFile('avatar');
          login({ ...user, profilePicture: '' });
          setAvatarPreview(null);
          setAvatarFile(null);
          setIsAvatarModalOpen(false);
          toast.success('Đã xóa ảnh đại diện');
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (error: any) {
          toast.error('Lỗi khi xóa ảnh: ' + error.message);
        } finally {
          setConfirmModal(prev => ({ ...prev, isLoading: false }));
        }
      }
    });
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
      setCvPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCVRemove = async () => {
    // Nếu là file mới chọn (chưa lưu)
    if (cvFile) {
      if (cvPreviewUrl) {
        URL.revokeObjectURL(cvPreviewUrl);
      }
      setCvFile(null);
      setCvFileName(null);
      setCvPreviewUrl(null);
      setCvError('');
      return;
    }

    // Nếu là file đã có trên Server
    if (user?.cv_file) {
      setConfirmModal({
        isOpen: true,
        title: 'Xóa CV hiện tại',
        description: 'Hệ thống sẽ xóa file CV cũ của bạn. Bạn sẽ cần tải lên file mới để nhà tuyển dụng có thể xem.',
        isLoading: false,
        onConfirm: async () => {
          setConfirmModal(prev => ({ ...prev, isLoading: true }));
          try {
            await removeFile('cv');
            login({ ...user, cv_file: '' });
            setCvFileName(null);
            setCvPreviewUrl(null);
            toast.success('Đã xóa CV thành công');
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
          } catch (error: any) {
            toast.error('Lỗi khi xóa CV: ' + error.message);
          } finally {
            setConfirmModal(prev => ({ ...prev, isLoading: false }));
          }
        }
      });
    }
  };

  const handleCVSave = async() => {
    if (cvFile) {
      if (!user) return;
      setIsSaving(true);
      try {
        const formData = new FormData();
        formData.append('id', user.id.toString());
        formData.append('cv_file', cvFile);

        const updatedUser = await updateProfile(formData);
        console.log(updatedUser);
        login(updatedUser); 
        setEditing(false);
        setSaveSuccess(true);
        toast.success('Cập nhật thông tin thành công!');
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (error: any) {
        toast.error(error.message || 'Cập nhật thất bại');
      } finally {
        setIsSaving(false);
      }
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
      setCvPreviewUrl(URL.createObjectURL(file));
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
            <div className="relative group">
              {/* Avatar Display */}
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white flex-shrink-0 transition-all group-hover:ring-2 group-hover:ring-blue-400 ${
                (user?.profilePicture) ? 'bg-cover bg-center' : (profile.name.toLowerCase().includes('a') ? 'bg-blue-500' : 'bg-gradient-to-br from-purple-500 to-pink-500')
              }`}
              style={(user?.profilePicture) ? { backgroundImage: `url(${user?.profilePicture})` } : {}}>
                {!(user?.profilePicture) && initials}
              </div>
              
              {/* Upload & Delete Overlays */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full overflow-hidden">
                <label 
                  htmlFor="avatar-upload" 
                  className="flex-1 h-full flex flex-col items-center justify-center hover:bg-white/10 transition-colors cursor-pointer border-r border-white/20"
                >
                  <Camera className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-medium">Sửa</span>
                </label>
                
                {user?.profilePicture && (
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleAvatarRemove();
                    }}
                    className="flex-1 h-full flex flex-col items-center justify-center hover:bg-red-500/40 transition-colors"
                  >
                    <X className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-medium">Xóa</span>
                  </button>
                )}
              </div>
              
              <input
                type="file"
                id="avatar-upload"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarUpload}
              />
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
                <Button variant="outline" size="sm" onClick={() => setEditing(false)} className="border-gray-300" disabled={isSaving}>Huỷ</Button>
                <Button onClick={handleSave} size="sm" className="gap-2 bg-black hover:bg-gray-800 text-white" disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Lưu
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

            {!cvFileName ? (
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
                <div className="flex items-center gap-3 overflow-hidden flex-1">
                  <File className="w-8 h-8 text-blue-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <a 
                      href={cvFile ? cvPreviewUrl || '#' : user?.cv_file} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-foreground truncate block hover:text-blue-500 hover:underline transition-colors"
                      title="Click để xem CV"
                    >
                      {cvFileName}
                    </a>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {cvFile ? `${(cvFile.size / 1024).toFixed(1)} KB` : ''}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={handleCVRemove}
                    className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors rounded-md hover:bg-red-50 dark:hover:bg-red-950/30"
                    title="Xóa CV"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {cvFile && (
              <Button
                onClick={handleCVSave}
                className="w-full gap-2 bg-black hover:bg-gray-800 text-white"
                disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Lưu CV
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
            disabled={!passwords.current || !passwords.newPass || !passwords.confirm || isChangingPass}
            className="w-full gap-2 mt-4 bg-black hover:bg-gray-800 text-white disabled:bg-gray-400 disabled:cursor-not-allowed">
            {isChangingPass ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            Cập nhật mật khẩu
          </Button>
          </div>
        </Section>
      </div>

      {/* Avatar Update Modal */}
      <AnimatePresence>
        {isAvatarModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSavingAvatar && setIsAvatarModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h3 className="text-lg font-bold">Cập nhật ảnh đại diện</h3>
                <button 
                  onClick={() => setIsAvatarModalOpen(false)}
                  className="p-1 hover:bg-muted rounded-full transition-colors"
                  disabled={isSavingAvatar}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-8 flex flex-col items-center">
                <div className="w-48 h-48 rounded-full border-4 border-primary/20 p-1 mb-6">
                  <div 
                    className="w-full h-full rounded-full bg-cover bg-center shadow-inner"
                    style={{ backgroundImage: `url(${avatarPreview})` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground text-center mb-2">
                  Bạn có chắc chắn muốn sử dụng ảnh này làm ảnh đại diện?
                </p>
              </div>

              <div className="p-6 bg-muted/50 flex flex-col gap-3">
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={() => setIsAvatarModalOpen(false)}
                    disabled={isSavingAvatar}
                  >
                    Hủy
                  </Button>
                  <Button 
                    className="flex-1 bg-black hover:bg-gray-800 text-white gap-2"
                    onClick={handleAvatarSave}
                    disabled={isSavingAvatar}
                  >
                    {isSavingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Lưu ảnh
                  </Button>
                </div>
                
                {user?.profilePicture && !avatarFile && (
                  <Button
                    variant="ghost"
                    className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={handleAvatarRemove}
                    disabled={isSavingAvatar}
                  >
                    <X className="w-4 h-4 mr-2" /> Xóa ảnh hiện tại
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        description={confirmModal.description}
        isLoading={confirmModal.isLoading}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
      />
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