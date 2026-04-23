import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePageLoad } from '@/contexts/PageLoadContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bell, ChevronDown, ArrowRight, User, LogOut } from 'lucide-react';
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
  const closeJobMenuTimeoutRef = useRef<NodeJS.Timeout>();
  const closeCompanyMenuTimeoutRef = useRef<NodeJS.Timeout>();
  const closeCareerMenuTimeoutRef = useRef<NodeJS.Timeout>();
  const closeToolMenuTimeoutRef = useRef<NodeJS.Timeout>();
  const navRef = useRef<HTMLElement>(null);
  const companyBtnRef = useRef<HTMLDivElement>(null);
  const careerBtnRef = useRef<HTMLDivElement>(null);
  const toolBtnRef = useRef<HTMLDivElement>(null);

  // Close all dropdowns when location changes
  useEffect(() => {
    setJobMenuOpen(false);
    setCompanyMenuOpen(false);
    setCareerMenuOpen(false);
    setToolMenuOpen(false);
  }, [location.pathname]);

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
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </Button>

          {user ? (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Avatar className="w-8 h-8">
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
            <Button onClick={() => navigate('/login')} className="bg-black hover:bg-slate-800 text-white">
              Đăng nhập
            </Button>
          )}
        </div>
      </div>
    </header>
  );
});
