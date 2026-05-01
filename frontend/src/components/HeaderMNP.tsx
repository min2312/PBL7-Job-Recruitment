import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePageLoad } from '@/contexts/PageLoadContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Bell, ChevronDown, ArrowRight, User, LogOut, Mail, Briefcase, CheckCircle2 } from 'lucide-react';
import { useState, useRef, useEffect, memo } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default memo(function HeaderMNP() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { triggerPageLoad } = usePageLoad();
  const [jobMenuOpen, setJobMenuOpen] = useState(false);
  const [companyMenuOpen, setCompanyMenuOpen] = useState(false);
  const [careerMenuOpen, setCareerMenuOpen] = useState(false);
  const [toolMenuOpen, setToolMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const closeJobMenuTimeoutRef = useRef<NodeJS.Timeout>();
  const closeCompanyMenuTimeoutRef = useRef<NodeJS.Timeout>();
  const closeCareerMenuTimeoutRef = useRef<NodeJS.Timeout>();
  const closeToolMenuTimeoutRef = useRef<NodeJS.Timeout>();
  const navRef = useRef<HTMLElement>(null);
  const companyBtnRef = useRef<HTMLDivElement>(null);
  const careerBtnRef = useRef<HTMLDivElement>(null);
  const toolBtnRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  // Close all dropdowns when location changes
  useEffect(() => {
    setJobMenuOpen(false);
    setCompanyMenuOpen(false);
    setCareerMenuOpen(false);
    setToolMenuOpen(false);
    setNotificationOpen(false);
  }, [location.pathname]);

  // Close notification when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
    };

    if (notificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [notificationOpen]);

  const handleJobMenuEnter = () => {
    if (closeJobMenuTimeoutRef.current) clearTimeout(closeJobMenuTimeoutRef.current);
    setCareerMenuOpen(false);
    setToolMenuOpen(false);
    setCompanyMenuOpen(false);
    setJobMenuOpen(true);
  };

  const handleJobMenuLeave = () => {
    closeJobMenuTimeoutRef.current = setTimeout(() => setJobMenuOpen(false), 150);
  };

  const handleCompanyMenuEnter = () => {
    if (closeCompanyMenuTimeoutRef.current) clearTimeout(closeCompanyMenuTimeoutRef.current);
    setJobMenuOpen(false);
    setToolMenuOpen(false);
    setCareerMenuOpen(false);
    setCompanyMenuOpen(true);
  };

  const handleCompanyMenuLeave = () => {
    closeCompanyMenuTimeoutRef.current = setTimeout(() => setCompanyMenuOpen(false), 150);
  };

  const handleCareerMenuEnter = () => {
    if (closeCareerMenuTimeoutRef.current) clearTimeout(closeCareerMenuTimeoutRef.current);
    setJobMenuOpen(false);
    setToolMenuOpen(false);
    setCompanyMenuOpen(false);
    setCareerMenuOpen(true);
  };

  const handleCareerMenuLeave = () => {
    closeCareerMenuTimeoutRef.current = setTimeout(() => setCareerMenuOpen(false), 150);
  };

  const handleToolMenuEnter = () => {
    if (closeToolMenuTimeoutRef.current) clearTimeout(closeToolMenuTimeoutRef.current);
    setJobMenuOpen(false);
    setCareerMenuOpen(false);
    setCompanyMenuOpen(false);
    setToolMenuOpen(true);
  };

  const handleToolMenuLeave = () => {
    closeToolMenuTimeoutRef.current = setTimeout(() => setToolMenuOpen(false), 150);
  };

  const handleHomeClick = () => {
    if (location.pathname === '/') {
      triggerPageLoad();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  const handleNavigate = (path: string) => {
    if (location.pathname === path) {
      triggerPageLoad();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate(path);
    }
  };

  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleHomeClick}>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-slate-900">MNP</h1>
              <p className="text-xs text-slate-500 font-medium">Master New Potential</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav ref={navRef} className="hidden md:flex items-center gap-1">
            <div
              className="relative"
              onMouseEnter={handleJobMenuEnter}
              onMouseLeave={handleJobMenuLeave}
            >
              <Button 
                onClick={handleHomeClick}
                variant="ghost" 
                className="gap-1 text-base font-semibold text-slate-600 hover:text-black"
              >
                Việc làm
                <ChevronDown className="w-4 h-4" />
              </Button>

              {jobMenuOpen && (
                <div
                  className="absolute top-full left-0 mt-2 bg-white border border-slate-200 shadow-xl z-50 rounded-xl transition-all duration-300 origin-top animate-in fade-in slide-in-from-top-2"
                  style={{ width: 'fit-content' }}
                >
                  <div className="px-6 py-6" style={{ display: 'grid', gridTemplateColumns: 'auto', gap: '12px' }}>
                    {/* Col 1: VIỆC LÀM */}
                    <div className="pr-0 max-w-none">
                      {/* <div className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-2">Việc làm</div> */}
                      <div className="flex flex-col gap-4">
                        <button onClick={() => handleNavigate('/job-search')} className="flex items-center gap-1 text-sm text-slate-700 hover:text-black text-left group font-medium whitespace-nowrap">
                          <span>Tìm việc làm</span>
                          <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                        </button>
                        <button onClick={() => handleNavigate('/saved-jobs')} className="flex items-center gap-1 text-sm text-slate-700 hover:text-black text-left group font-medium whitespace-nowrap">
                          <span>Việc làm đã lưu</span>
                          <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                        </button>
                        <button onClick={() => handleNavigate('/applications')} className="flex items-center gap-1 text-sm text-slate-700 hover:text-black text-left group font-medium whitespace-nowrap">
                          <span>Việc làm đã ứng tuyển</span>
                          <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                        </button>
                        {/* <button onClick={() => handleNavigate('/jobs')} className="flex items-center gap-1 text-sm text-slate-700 hover:text-black text-left group font-medium">
                          <span>Việc làm phù hợp</span>
                          <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                        </button> */}
                      </div>
                    </div>

                    {/* Col 2: THEO VỊ TRÍ */}
                    {/* <div>
                      <div className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-2">Việc làm theo vị trí</div>
                      <div className="flex flex-col gap-4">
                        {['Nhân viên kinh doanh','Kế toán','Marketing','Hành chính nhân sự','Chăm sóc khách hàng','Ngân hàng','IT'].map(item => (
                          <button key={item} onClick={() => navigate(`/job-search?position=${encodeURIComponent(item)}`)} className="flex items-center gap-1 text-sm text-slate-700 hover:text-black text-left group font-medium">
                            <span>Việc làm {item}</span>
                            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                          </button>
                        ))}
                      </div>
                    </div> */}

                    {/* Col 3: VIỆC LÀM THEO LĨNH VỰC */}
                    {/* <div>
                      <div className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-2 invisible">Spacer</div>
                      <div className="flex flex-col gap-4">
                        {['Lao động phổ thông','Senior','Kỹ sư xây dựng','Thiết kế đồ họa','Bất động sản','Giáo dục','Telesales'].map(item => (
                          <button key={item} onClick={() => navigate(`/job-search?category=${encodeURIComponent(item)}`)} className="flex items-center gap-1 text-sm text-slate-700 hover:text-black text-left group font-medium">
                            <span>Việc làm {item}</span>
                            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                          </button>
                        ))}
                      </div>
                    </div> */}
                  </div>
                </div>
              )}
            </div>

            <Button 
              onClick={() => handleNavigate('/companies')} 
              variant="ghost" 
              className="gap-1 text-base font-semibold text-slate-600 hover:text-black"
            >
              Công ty
            </Button>

            <Button
              onClick={() => handleNavigate('/insights')}
              variant="ghost"
              className="gap-1 text-base font-semibold text-slate-600 hover:text-black"
            >
              Thị trường
            </Button>

            {false && (
              <div
                onMouseEnter={handleToolMenuEnter}
                onMouseLeave={handleToolMenuLeave}
              >
                <Button variant="ghost" className="gap-1 text-base font-semibold text-slate-600 hover:text-black">
                  Công cụ
                  <ChevronDown className="w-4 h-4" />
                </Button>

                {toolMenuOpen && (() => {
                  const navLeft = navRef.current?.getBoundingClientRect().left ?? 0;
                  const btnLeft = toolBtnRef.current?.getBoundingClientRect().left ?? 0;
                  const offset = -(btnLeft - navLeft);
                  return (
                    <div
                      className="absolute top-full bg-white border border-slate-200 shadow-xl z-50 rounded-xl transition-all duration-300 origin-top animate-in fade-in slide-in-from-top-2"
                      style={{ minWidth: '800px', left: `${offset}px`, marginTop: '8px' }}
                    >
                    <div className="px-6 py-6 grid grid-cols-3 gap-8">
                      {/* Col 1: KHÁM PHÁ VÀ NÂNG CẤP BẢN THÂN */}
                      <div>
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-4">Khám phá và nâng cấp bản thân</div>
                        <div className="flex flex-col gap-2.5">
                          <button onClick={() => handleNavigate('/jobs')} className="flex items-center gap-1 text-base text-slate-600 hover:text-black text-left group">
                            <span>Bộ câu hỏi phỏng vấn</span>
                            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                          </button>
                          <button onClick={() => handleNavigate('/jobs')} className="flex items-center gap-1 text-base text-slate-600 hover:text-black text-left group">
                            <span>Trắc nghiệm MBTI</span>
                            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                          </button>
                          <button onClick={() => handleNavigate('/jobs')} className="flex items-center gap-1 text-base text-slate-600 hover:text-black text-left group">
                            <span>Trắc nghiệm MI</span>
                            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                          </button>
                        </div>
                      </div>

                      {/* Col 2: CÔNG CỤ */}
                      <div>
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-4">Công cụ</div>
                        <div className="flex flex-col gap-2.5">
                          <button onClick={() => handleNavigate('/jobs')} className="flex items-center gap-1 text-base text-slate-600 hover:text-black text-left group">
                            <span>Tính lương Gross - Net</span>
                            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                          </button>
                          <button onClick={() => handleNavigate('/jobs')} className="flex items-center gap-1 text-base text-slate-600 hover:text-black text-left group">
                            <span>Tính thuế thu nhập cá nhân</span>
                            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                          </button>
                        </div>
                      </div>

                      {/* Col 3: HỖ TRỢ TÀI CHÍNH */}
                      <div>
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-4">Hỗ trợ tài chính</div>
                        <div className="flex flex-col gap-2.5">
                          <button onClick={() => handleNavigate('/jobs')} className="flex items-center gap-1 text-base text-slate-600 hover:text-black text-left group">
                            <span>Bảo hiểm xã hội</span>
                            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                          </button>
                        </div>
                      </div>
                    </div>
                    </div>
                  );
                })()}
              </div>
            )}


            {false && (
              <div
                ref={careerBtnRef}
                className="relative"
                onMouseEnter={handleCareerMenuEnter}
                onMouseLeave={handleCareerMenuLeave}
              >
                <Button variant="ghost" className="gap-1 text-base font-semibold text-slate-600 hover:text-black">
                  Cẩm nang nghề nghiệp
                  <ChevronDown className="w-4 h-4" />
                </Button>

                {careerMenuOpen && (() => {
                  const navLeft = navRef.current?.getBoundingClientRect().left ?? 0;
                  const btnLeft = careerBtnRef.current?.getBoundingClientRect().left ?? 0;
                  const offset = -(btnLeft - navLeft);
                  return (
                    <div
                      className="absolute top-full bg-white border border-slate-200 shadow-xl z-50 rounded-xl transition-all duration-300 origin-top animate-in fade-in slide-in-from-top-2"
                      style={{ minWidth: '650px', left: `${offset}px`, marginTop: '8px' }}
                    >
                    <div className="px-6 py-6 grid grid-cols-2 gap-4">
                      {/* Col 1: HƯỚNG DẪN + KỸ NĂNG */}
                      <div>
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-4">Hướng dẫn nghề nghiệp</div>
                        <div className="flex flex-col gap-2.5">
                          <button onClick={() => handleNavigate('/jobs')} className="flex items-center gap-1 text-base text-slate-600 hover:text-black text-left group">
                            <span>Định hướng nghề nghiệp</span>
                            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                          </button>
                          <button onClick={() => handleNavigate('/jobs')} className="flex items-center gap-1 text-base text-slate-600 hover:text-black text-left group">
                            <span>Bí kíp tìm việc</span>
                            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                          </button>
                        </div>
                      </div>

                      {/* Col 2: INSIGHTS & FEATURES */}
                      <div>
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-4">Bài viết nổi bật</div>
                        <div className="space-y-3">
                          <div className="text-[13px] text-slate-600 hover:text-black cursor-pointer">
                            <p className="font-semibold mb-1">Ngành Marketing là gì?</p>
                            <p className="text-[12px] text-slate-500">Khám phá cơ hội việc làm...</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <div className="relative" ref={notificationRef}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative hover:bg-muted"
              onClick={() => {
                setNotificationOpen(!notificationOpen);
                setJobMenuOpen(false);
                setCompanyMenuOpen(false);
                setCareerMenuOpen(false);
                setToolMenuOpen(false);
              }}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </Button>
            
            {/* Notification Dropdown */}
            {notificationOpen && (
              <div className="absolute right-0 top-full mt-3 w-80 bg-white border border-slate-200 shadow-xl rounded-xl z-50 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-5 py-3 border-b border-slate-200">
                  <h3 className="font-semibold text-sm text-foreground">Thông báo</h3>
                </div>
                
                {/* Notifications List */}
                <div className="max-h-96 overflow-y-auto">
                  {user?.role === 'EMPLOYER' ? (
                    <>
                      {/* Today's interviews notification */}
                      <div className="px-5 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                            <Bell className="w-4 h-4 text-amber-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">Lịch phỏng vấn hôm nay</p>
                            <p className="text-xs text-muted-foreground mt-1">Bạn có 2 buổi phỏng vấn được lên lịch hôm nay</p>
                            <p className="text-xs text-muted-foreground mt-1">09:00 - 10:30, 14:00 - 15:30</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* New application notification */}
                      <div className="px-5 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">Ứng viên mới ứng tuyển</p>
                            <p className="text-xs text-muted-foreground mt-1">Nguyễn Văn A vừa ứng tuyển vị trí Frontend Developer</p>
                            <p className="text-xs text-muted-foreground mt-1">5 phút trước</p>
                          </div>
                        </div>
                      </div>

                      {/* Profile update notification */}
                      <div className="px-5 py-3 hover:bg-slate-50 transition-colors cursor-pointer group">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">Hồ sơ công ty</p>
                            <p className="text-xs text-muted-foreground mt-1">Gợi ý: Cập nhật ảnh bìa công ty để thu hút ứng viên</p>
                            <p className="text-xs text-muted-foreground mt-1">1 ngày trước</p>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Application status notification */}
                      <div className="px-5 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">Phỏng vấn được xác nhận</p>
                            <p className="text-xs text-muted-foreground mt-1">Vị trí Frontend Developer - TechCorp</p>
                            <p className="text-xs text-muted-foreground mt-1">Hôm nay lúc 14:00</p>
                          </div>
                        </div>
                      </div>

                      {/* Job recommendation notification */}
                      <div className="px-5 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
                            <Briefcase className="w-4 h-4 text-violet-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">Việc làm phù hợp</p>
                            <p className="text-xs text-muted-foreground mt-1">3 việc làm mới phù hợp với hồ sơ của bạn</p>
                            <p className="text-xs text-muted-foreground mt-1">2 giờ trước</p>
                          </div>
                        </div>
                      </div>

                      {/* Message notification */}
                      <div className="px-5 py-3 hover:bg-slate-50 transition-colors cursor-pointer group">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center shrink-0 mt-0.5">
                            <Mail className="w-4 h-4 text-pink-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">Tin nhắn từ nhà tuyển dụng</p>
                            <p className="text-xs text-muted-foreground mt-1">TechCorp: Chúng tôi rất quan tâm đến hồ sơ của bạn...</p>
                            <p className="text-xs text-muted-foreground mt-1">3 giờ trước</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Footer */}
                <div className="border-t border-slate-200 px-5 py-3 bg-slate-50 text-center">
                  <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                    Xem tất cả thông báo
                  </button>
                </div>
              </div>
            )}
          </div>

          {user ? (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.profilePicture} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {user.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleNavigate('/candidate/profile')}>
                  <User className="w-4 h-4 mr-2" /> Hồ sơ
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => logout()}>
                  <LogOut className="w-4 h-4 mr-2" /> Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button onClick={() => navigate('/login')} className="bg-black hover:bg-slate-800 text-white">
                Đăng nhập
              </Button>
              <Button onClick={() => navigate('/register')} className="bg-white hover:bg-slate-200 text-black">
                Đăng ký
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
});
