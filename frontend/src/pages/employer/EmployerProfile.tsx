// import { useState, useEffect } from 'react';
// import { useAuth } from '@/hooks/useAuth';
// import { Navigate, Link, useLocation } from 'react-router-dom';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import {
//   ArrowLeft, User, Mail, Phone, Save, Edit3, Lock, Eye, EyeOff,
//   CheckCircle, AlertCircle, Camera, Upload, File, X, Download, Globe, MapPin, Users, Briefcase
// } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';

// export default function EmployerProfile() {
//   const { user, isAuthReady } = useAuth();
//   const location = useLocation();

//   // Scroll to top when page loads or location changes
//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, [location]);

//   const [editing, setEditing] = useState(false);
//   const [saveSuccess, setSaveSuccess] = useState(false);
//   const [logoPreview, setLogoPreview] = useState<string | null>(null);

//   const [profile, setProfile] = useState({
//     companyName: '',
//     email: '',
//     phone: '',
//     website: '',
//     address: '',
//     industry: '',
//     employeeCount: '',
//     description: 'Chúng tôi là một công ty hàng đầu trong lĩnh vực công nghệ, tuyển dụng những tài năng xuất sắc.',
//   });

//   // Password change state
//   const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
//   const [showPass, setShowPass] = useState({ current: false, newPass: false, confirm: false });
//   const [passError, setPassError] = useState('');
//   const [passSuccess, setPassSuccess] = useState(false);

//   if (!isAuthReady) {
//     return (
//       <div className="min-h-[40vh] flex items-center justify-center">
//         <div className="flex items-center gap-3 text-muted-foreground">
//           <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
//           <span className="text-sm">Đang kiểm tra phiên đăng nhập...</span>
//         </div>
//       </div>
//     );
//   }

//   if (!user || user.role !== 'EMPLOYER') return <Navigate to="/login" />;

//   if (profile.companyName === '' && user) {
//     setProfile(p => ({ ...p, companyName: user.name, email: user.email, phone: user.phone || '' }));
//   }

//   const handleSave = () => {
//     setEditing(false);
//     setSaveSuccess(true);
//     setTimeout(() => setSaveSuccess(false), 3000);
//   };

//   const handlePasswordChange = () => {
//     setPassError('');
//     if (!passwords.current) return setPassError('Vui lòng nhập mật khẩu hiện tại.');
//     if (passwords.newPass.length < 8) return setPassError('Mật khẩu mới tối thiểu 8 ký tự.');
//     if (passwords.newPass !== passwords.confirm) return setPassError('Xác nhận mật khẩu không khớp.');
//     setPassSuccess(true);
//     setPasswords({ current: '', newPass: '', confirm: '' });
//     setTimeout(() => setPassSuccess(false), 3000);
//   };

//   const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setLogoPreview(reader.result as string);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const initials = profile.companyName
//     ? profile.companyName.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()
//     : 'CP';

//   return (
//     <div className="min-h-screen bg-background">
//       {/* Banner */}
//       <div className="h-24 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

//       <div className="max-w-5xl mx-auto px-4 pb-12">
//         {/* Profile Header Card */}
//         <div className="bg-card border border-border rounded-2xl p-6 -mt-12 mb-8 relative z-10 shadow-sm">
//           <div className="flex items-center gap-4 flex-1">
//             <div className="relative group cursor-pointer">
//               {/* Logo Display */}
//               <div className={`w-20 h-20 rounded-lg flex items-center justify-center text-2xl font-bold text-white flex-shrink-0 transition-all group-hover:ring-2 group-hover:ring-blue-400 ${
//                 logoPreview ? 'bg-cover bg-center' : 'bg-gradient-to-br from-blue-600 to-indigo-600'
//               }`}
//               style={logoPreview ? { backgroundImage: `url(${logoPreview})` } : {}}>
//                 {!logoPreview && initials}
//               </div>
              
//               {/* Upload Overlay */}
//               <div className="absolute inset-0 rounded-lg bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
//                 <Camera className="w-6 h-6 text-white" />
//               </div>
              
//               {/* Hidden File Input */}
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={handleLogoUpload}
//                 className="hidden"
//                 id="logo-upload"
//               />
//               <label htmlFor="logo-upload" className="absolute inset-0 rounded-lg cursor-pointer" />
//             </div>
//             <div>
//               <h1 className="text-2xl font-bold text-foreground">{profile.companyName || 'Tên công ty'}</h1>
//               <p className="text-sm text-muted-foreground">{profile.email}</p>
//             </div>
//           </div>
//         </div>

//         <AnimatePresence>
//           {saveSuccess && (
//             <motion.div
//               initial={{ opacity: 0, y: -8 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -8 }}
//               className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-center gap-2 text-green-700 dark:text-green-400 text-sm mb-4">
//               <CheckCircle className="w-4 h-4 flex-shrink-0" />
//               Cập nhật thành công!
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {/* Company Information Section */}
//         <Section 
//           title="Thông tin công ty"
//           action={
//             !editing ? (
//               <Button onClick={() => setEditing(true)} className="gap-2 bg-black hover:bg-gray-800 text-white" size="sm">
//                 <Edit3 className="w-4 h-4" /> Chỉnh sửa
//               </Button>
//             ) : (
//               <div className="flex gap-2">
//                 <Button variant="outline" size="sm" onClick={() => setEditing(false)} className="border-gray-300">Huỷ</Button>
//                 <Button onClick={handleSave} size="sm" className="gap-2 bg-black hover:bg-gray-800 text-white">
//                   <Save className="w-4 h-4" /> Lưu
//                 </Button>
//               </div>
//             )
//           }
//         >
//           <div className="space-y-4">
//             {/* Row 1: Company Name, Email */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block flex items-center gap-1.5">
//                   <Briefcase className="w-3 h-3" /> Tên công ty
//                 </label>
//                 <Input 
//                   value={profile.companyName} 
//                   onChange={e => setProfile(p => ({ ...p, companyName: e.target.value }))} 
//                   placeholder="Nhập tên công ty"
//                   disabled={!editing}
//                   className="bg-gray-50 dark:bg-gray-900 disabled:opacity-70"
//                 />
//               </div>
//               <div>
//                 <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block flex items-center gap-1.5">
//                   <Mail className="w-3 h-3" /> Email công ty
//                 </label>
//                 <Input 
//                   type="email" 
//                   value={profile.email} 
//                   onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} 
//                   placeholder="Nhập email công ty"
//                   disabled={!editing}
//                   className="bg-gray-50 dark:bg-gray-900 disabled:opacity-70"
//                 />
//               </div>
//             </div>

//             {/* Row 2: Phone, Website */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block flex items-center gap-1.5">
//                   <Phone className="w-3 h-3" /> Số điện thoại
//                 </label>
//                 <Input 
//                   value={profile.phone} 
//                   onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} 
//                   placeholder="Nhập số điện thoại"
//                   disabled={!editing}
//                   className="bg-gray-50 dark:bg-gray-900 disabled:opacity-70"
//                 />
//               </div>
//               <div>
//                 <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block flex items-center gap-1.5">
//                   <Globe className="w-3 h-3" /> Website
//                 </label>
//                 <Input 
//                   value={profile.website} 
//                   onChange={e => setProfile(p => ({ ...p, website: e.target.value }))} 
//                   placeholder="https://example.com"
//                   disabled={!editing}
//                   className="bg-gray-50 dark:bg-gray-900 disabled:opacity-70"
//                 />
//               </div>
//             </div>

//             {/* Row 3: Address, Industry */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block flex items-center gap-1.5">
//                   <MapPin className="w-3 h-3" /> Địa chỉ
//                 </label>
//                 <Input 
//                   value={profile.address} 
//                   onChange={e => setProfile(p => ({ ...p, address: e.target.value }))} 
//                   placeholder="Nhập địa chỉ công ty"
//                   disabled={!editing}
//                   className="bg-gray-50 dark:bg-gray-900 disabled:opacity-70"
//                 />
//               </div>
//               <div>
//                 <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block flex items-center gap-1.5">
//                   <Briefcase className="w-3 h-3" /> Lĩnh vực hoạt động
//                 </label>
//                 <Input 
//                   value={profile.industry} 
//                   onChange={e => setProfile(p => ({ ...p, industry: e.target.value }))} 
//                   placeholder="VD: Công nghệ, Tài chính..."
//                   disabled={!editing}
//                   className="bg-gray-50 dark:bg-gray-900 disabled:opacity-70"
//                 />
//               </div>
//             </div>

//             {/* Row 4: Employee Count, Description */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block flex items-center gap-1.5">
//                   <Users className="w-3 h-3" /> Số lượng nhân viên
//                 </label>
//                 <Input 
//                   value={profile.employeeCount} 
//                   onChange={e => setProfile(p => ({ ...p, employeeCount: e.target.value }))} 
//                   placeholder="VD: 50-100 nhân viên"
//                   disabled={!editing}
//                   className="bg-gray-50 dark:bg-gray-900 disabled:opacity-70"
//                 />
//               </div>
//               <div>
//                 <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Mô tả công ty</label>
//                 <Textarea 
//                   value={profile.description} 
//                   onChange={e => setProfile(p => ({ ...p, description: e.target.value }))} 
//                   placeholder="Mô tả về công ty của bạn..." 
//                   rows={2} 
//                   className="resize-none bg-gray-50 dark:bg-gray-900 disabled:opacity-70"
//                   disabled={!editing}
//                 />
//               </div>
//             </div>
//           </div>
//         </Section>

//         {/* Security Section */}
//         <Section title="Bảo mật thông tin">
//           <div className="space-y-4">
//           <div>
//             <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block flex items-center gap-1.5">
//               <Lock className="w-3 h-3" /> Mật khẩu hiện tại
//             </label>
//             <div className="relative">
//               <Input
//                 type={showPass.current ? 'text' : 'password'}
//                 value={passwords.current}
//                 onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
//                 placeholder="Nhập mật khẩu hiện tại"
//                 className="pr-10"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPass(p => ({ ...p, current: !p.current }))}
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
//                 {showPass.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//               </button>
//             </div>
//           </div>

//           <div>
//             <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block flex items-center gap-1.5">
//               <Lock className="w-3 h-3" /> Mật khẩu mới
//             </label>
//             <div className="relative">
//               <Input
//                 type={showPass.newPass ? 'text' : 'password'}
//                 value={passwords.newPass}
//                 onChange={e => setPasswords(p => ({ ...p, newPass: e.target.value }))}
//                 placeholder="Tối thiểu 8 ký tự"
//                 className="pr-10"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPass(p => ({ ...p, newPass: !p.newPass }))}
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
//                 {showPass.newPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//               </button>
//             </div>
//             {passwords.newPass && (
//               <div className="mt-2 flex items-center gap-2">
//                 <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
//                   <div
//                     className={`h-full transition-all ${
//                       passwords.newPass.length < 8
//                         ? 'w-1/3 bg-red-500'
//                         : passwords.newPass.length < 12
//                         ? 'w-2/3 bg-yellow-500'
//                         : 'w-full bg-green-500'
//                     }`}
//                   />
//                 </div>
//                 <span className="text-xs text-muted-foreground whitespace-nowrap">
//                   {passwords.newPass.length < 8 ? 'Yếu' : passwords.newPass.length < 12 ? 'Trung bình' : 'Mạnh'}
//                 </span>
//               </div>
//             )}
//           </div>

//           <div>
//             <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block flex items-center gap-1.5">
//               <Lock className="w-3 h-3" /> Xác nhận mật khẩu
//             </label>
//             <div className="relative">
//               <Input
//                 type={showPass.confirm ? 'text' : 'password'}
//                 value={passwords.confirm}
//                 onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
//                 placeholder="Nhập lại mật khẩu mới"
//                 className="pr-10"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPass(p => ({ ...p, confirm: !p.confirm }))}
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
//                 {showPass.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//               </button>
//             </div>
//           </div>

//           <AnimatePresence>
//             {passError && (
//               <motion.div
//                 initial={{ opacity: 0, y: -8 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -8 }}
//                 className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-center gap-2 text-red-700 dark:text-red-400 text-sm">
//                 <AlertCircle className="w-4 h-4 flex-shrink-0" />
//                 {passError}
//               </motion.div>
//             )}
//             {passSuccess && (
//               <motion.div
//                 initial={{ opacity: 0, y: -8 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -8 }}
//                 className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-center gap-2 text-green-700 dark:text-green-400 text-sm">
//                 <CheckCircle className="w-4 h-4 flex-shrink-0" />
//                 Đổi mật khẩu thành công!
//               </motion.div>
//             )}
//           </AnimatePresence>

//           <Button
//             onClick={handlePasswordChange}
//             disabled={!passwords.current || !passwords.newPass || !passwords.confirm}
//             className="w-full gap-2 mt-4 bg-black hover:bg-gray-800 text-white disabled:bg-gray-400 disabled:cursor-not-allowed">
//             <Lock className="w-4 h-4" /> Cập nhật mật khẩu
//           </Button>
//           </div>
//         </Section>
//       </div>
//     </div>
//   );
// }

// // ──────────────────────────── HELPER COMPONENTS ────────────────────────────

// function Section({ title, children, className, action }: { title: string; children: React.ReactNode; className?: string; action?: React.ReactNode }) {
//   return (
//     <div className={`bg-card border border-border rounded-2xl p-5 md:p-6 mb-6 ${className || ''}`}>
//       <div className="flex items-center justify-between mb-4">
//         <h2 className="font-semibold text-foreground text-sm uppercase tracking-wide text-muted-foreground">{title}</h2>
//         {action}
//       </div>
//       {children}
//     </div>
//   );
// }

// function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
//   return (
//     <div>
//       <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1 block">
//         {icon && <span className="opacity-60">{icon}</span>}{label}
//       </label>
//       <div className="text-sm">{children}</div>
//     </div>
//   );
// }

// function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
//   return (
//     <div className="bg-card border border-dashed border-border rounded-xl p-8 text-center">
//       <div className="text-muted-foreground/40 flex justify-center mb-2">{icon}</div>
//       <p className="text-sm text-muted-foreground">{text}</p>
//     </div>
//   );
// }
