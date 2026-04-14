import { useParams, Link, useNavigate } from 'react-router-dom';
import { jobs, getCompanyById, getCategoryById, getLocationById, categories, locations, Category } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, GraduationCap, Briefcase, Users, Calendar, Share2, Building2, FileText, Heart, Send, DollarSign, Facebook, Linkedin, Twitter, Copy, ChevronDown, Search, Menu, Laptop, Gift, Package } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import RelatedJobs from '@/components/RelatedJobs';
import JobNeedsBanner from '@/components/JobNeedsBanner';

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<number>>(new Set());
  const [selectedLocations, setSelectedLocations] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -999, y: -999 });
  const particlesRef = useRef<any[]>([]);
  const job = jobs.find(j => j.id === Number(id));

  // Group categories by type
  const categoryGroups = {
    'Công nghệ / IT': [9, 22, 25, 33, 16],
    'Tài chính / Ngân hàng': [14, 15, 35, 36],
    'Sản xuất / Cơ khí': [4, 23, 24, 17],
    'Kinh doanh': [10, 32, 39, 20],
    'Bán lẻ / Thương mại': [1, 13, 18, 12, 6],
    'Bất động sản / Xây dựng': [3, 19],
    'Du lịch / Nhà hàng': [5, 28],
    'Y tế / Dược phẩm': [21],
    'Giáo dục': [8],
    'Khác': [2, 7, 11, 26, 27, 29, 30, 31, 34, 37, 38, 40, 41],
  };

  // Scroll to top when job changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Particle animation background
  useEffect(() => {
    const canvas = canvasRef.current;
    const banner = bannerRef.current;
    if (!canvas || !banner) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const COLORS = ['#378ADD', '#E24B4A', '#EF9F27', '#1D9E75', '#7F77DD', '#D4537E'];
    let W = 0, H = 0, raf: number;

    function resize() {
      W = canvas.width = banner.offsetWidth;
      H = canvas.height = banner.offsetHeight;
    }

    class Particle {
      x: number = 0;
      y: number = 0;
      vx: number = 0;
      vy: number = 0;
      size: number = 0;
      color: string = '';
      alpha: number = 0;
      angle: number = 0;
      angleV: number = 0;

      constructor() {
        this.reset(true);
      }

      reset(cold: boolean) {
        this.x = Math.random() * W;
        this.y = cold ? Math.random() * H : -10;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = Math.random() * 0.3 + 0.05;
        this.size = Math.random() * 3 + 1.2;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.alpha = Math.random() * 0.5 + 0.25;
        this.angle = Math.random() * Math.PI * 2;
        this.angleV = (Math.random() - 0.5) * 0.04;
      }

      update() {
        const { x: mx, y: my } = mouseRef.current;
        const dx = this.x - mx;
        const dy = this.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const force = (120 - dist) / 120;
          this.vx += (dx / dist) * force * 0.25;
          this.vy += (dy / dist) * force * 0.25;
        }
        this.vx *= 0.97;
        this.vy *= 0.97;
        this.vy += 0.012;
        this.x += this.vx;
        this.y += this.vy;
        this.angle += this.angleV;
        if (this.y > H + 10 || this.x < -20 || this.x > W + 20) this.reset(false);
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    resize();
    particlesRef.current = Array.from({ length: 100 }, () => new Particle());

    function loop() {
      ctx.clearRect(0, 0, W, H);
      particlesRef.current.forEach(p => {
        p.update();
        p.draw();
      });
      raf = requestAnimationFrame(loop);
    }

    const handleMouseMove = (e: MouseEvent) => {
      const r = banner.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -999, y: -999 };
    };

    const handleResize = () => resize();

    banner.addEventListener('mousemove', handleMouseMove);
    banner.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);
    loop();

    return () => {
      cancelAnimationFrame(raf);
      banner.removeEventListener('mousemove', handleMouseMove);
      banner.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle indeterminate state for group checkboxes
  useEffect(() => {
    Object.keys(categoryGroups).forEach(groupName => {
      const checkbox = document.querySelector(`input[data-group="${groupName}"]`) as HTMLInputElement;
      if (checkbox) {
        const groupCategoryIds = categoryGroups[groupName as keyof typeof categoryGroups];
        const isSomeSelected = groupCategoryIds.some(id => selectedCategories.has(id));
        const isAllSelected = groupCategoryIds.every(id => selectedCategories.has(id));
        checkbox.indeterminate = isSomeSelected && !isAllSelected;
      }
    });
  }, [selectedCategories]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!job) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground text-lg">Không tìm thấy việc làm</p>
        <Link to="/jobs"><Button className="mt-4">Quay lại danh sách</Button></Link>
      </div>
    );
  }

  const company = getCompanyById(job.companyId);
  const categoryNames = job.categoryIds.map(id => getCategoryById(id)?.name).filter(Boolean);
  const locationNames = job.locationIds.map(id => getLocationById(id)?.name).filter(Boolean);

  const relatedJobs = jobs
    .filter(j => j.id !== job.id)
    .map(j => {
      let score = 0;
      if (j.categoryIds.some(cid => job.categoryIds.includes(cid))) score += 2;
      if (j.locationIds.some(lid => job.locationIds.includes(lid))) score += 1;
      if (j.level === job.level) score += 1;
      return { job: j, score };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(r => r.job);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Fixed Social Icons Sidebar */}
      <div className="hidden lg:flex fixed left-20 top-1/3 flex-col gap-4 z-40">
        <button className="group w-10 h-10 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 bg-white relative">
          <Facebook className="w-5 h-5 text-slate-600" />
          <span className="absolute left-full ml-2 whitespace-nowrap bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            Chia sẻ qua Facebook
          </span>
        </button>
        <button className="group w-10 h-10 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 bg-white relative">
          <Twitter className="w-5 h-5 text-slate-600" />
          <span className="absolute left-full ml-2 whitespace-nowrap bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            Chia sẻ qua Twitter
          </span>
        </button>
        <button className="group w-10 h-10 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 bg-white relative">
          <Linkedin className="w-5 h-5 text-slate-600" />
          <span className="absolute left-full ml-2 whitespace-nowrap bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            Chia sẻ qua LinkedIn
          </span>
        </button>
        <button className="group w-10 h-10 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 bg-white relative">
          <Copy className="w-5 h-5 text-slate-600" />
          <span className="absolute left-full ml-2 whitespace-nowrap bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            Sao chép liên kết
          </span>
        </button>
      </div>

      {/* Job Needs Banner */}
      <JobNeedsBanner onUpdateClick={() => navigate('/login')} />

      {/* Black Search Banner with Particle Background */}
      <div ref={bannerRef} className="relative w-full bg-white px-6 py-5">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 1 }}
        />
        <div className="container relative space-y-3" style={{ zIndex: 2 }}>
          {/* Search Controls */}
          <div className="flex gap-2 justify-center items-center flex-wrap">
            {/* Category Dropdown - Large Modal */}
            <div className="relative" ref={categoryRef}>
              <button 
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="px-4 py-2.5 bg-white text-slate-700 rounded font-medium text-sm hover:bg-slate-100 flex items-center gap-1.5 w-48 border border-slate-900 whitespace-nowrap"
              >
                <Menu className="w-4 h-4 flex-shrink-0" />
                <span className="truncate text-sm">Danh mục Nghề</span>
                <ChevronDown className="w-4 h-4 flex-shrink-0 ml-auto" />
              </button>

              {/* Category Dropdown Modal - MOVED INSIDE categoryRef div */}
              {showCategoryDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowCategoryDropdown(false)} />
                  <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col"
                    style={{ width: '1135px', maxHeight: '480px' }}>
                    
                    {/* Header */}
                    <div className="px-5 py-3 flex justify-between items-center bg-white border-b border-slate-200">
                      <h3 className="font-semibold text-slate-900 text-sm flex-1">Chọn Nhóm ngành, Ngành hoặc Chuyên môn</h3>
                      <button onClick={() => setShowCategoryDropdown(false)} className="text-slate-400 hover:text-slate-900 text-lg leading-none ml-3 flex-shrink-0">✕</button>
                    </div>
                    
                    {/* Search with black border */}
                    <div className="px-5 pb-3 bg-white border-b border-slate-200">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Nhập từ khóa tìm kiếm"
                          value={categorySearchQuery}
                          onChange={(e) => setCategorySearchQuery(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 rounded-lg border-2 border-slate-900 focus:outline-none text-xs"
                        />
                      </div>
                    </div>
                    
                    {/* Content - 3 Columns */}
                    <div className="flex overflow-hidden" style={{ height: '300px' }}>
                      {/* Column 1: NHÓM NGÀNH */}
                      <div className="overflow-y-auto border-r border-slate-200 bg-white" style={{ width: '280px' }}>
                        <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 sticky top-0">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Nhóm ngành</p>
                        </div>
                        <div className="py-1">
                          {Object.keys(categoryGroups).map(groupName => {
                            const groupCategoryIds = categoryGroups[groupName as keyof typeof categoryGroups];
                            const isAllSelected = groupCategoryIds.every(id => selectedCategories.has(id));
                            const isSomeSelected = groupCategoryIds.some(id => selectedCategories.has(id));
                            
                            return (
                              <label
                                key={groupName}
                                onMouseEnter={() => setSelectedGroup(groupName)}
                                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-semibold rounded hover:bg-slate-100 cursor-pointer ${
                                  selectedGroup === groupName ? 'bg-slate-100 text-slate-900' : 'text-slate-700'
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    data-group={groupName}
                                    onChange={(e) => {
                                      const newSet = new Set(selectedCategories);
                                      if (e.target.checked) {
                                        // Add all categories in this group
                                        groupCategoryIds.forEach(id => newSet.add(id));
                                      } else {
                                        // Remove all categories in this group
                                        groupCategoryIds.forEach(id => newSet.delete(id));
                                      }
                                      setSelectedCategories(newSet);
                                    }}
                                    className="w-3.5 h-3.5 rounded border-slate-300 cursor-pointer"
                                  />
                                  {groupName}
                                </span>
                                <span className="text-slate-400 text-sm">›</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Column 2: NGÀNH */}
                      <div className="overflow-y-auto border-r border-slate-200 bg-white" style={{ width: '200px' }}>
                        <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 sticky top-0">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Ngành</p>
                        </div>
                        <div className="py-1">
                          {selectedGroup ? (
                            categoryGroups[selectedGroup as keyof typeof categoryGroups]
                              .map(catId => categories.find(c => c.id === catId))
                              .filter((cat): cat is Category => cat !== undefined)
                              .filter(cat => cat.name.toLowerCase().includes(categorySearchQuery.toLowerCase()))
                              .map(cat => (
                                <label key={cat.id} className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 rounded cursor-pointer text-sm font-semibold break-words">
                                  <input
                                    type="checkbox"
                                    checked={selectedCategories.has(cat.id)}
                                    onChange={(e) => {
                                      const newSet = new Set(selectedCategories);
                                      if (e.target.checked) newSet.add(cat.id);
                                      else newSet.delete(cat.id);
                                      setSelectedCategories(newSet);
                                    }}
                                    className="w-3.5 h-3.5 rounded border-slate-300 cursor-pointer flex-shrink-0"
                                  />
                                  <span className="break-words">{cat.name}</span>
                                </label>
                              ))
                          ) : (
                            <p className="text-xs text-slate-400 py-8 text-center">Vui lòng chọn Nhóm ngành</p>
                          )}
                        </div>
                      </div>

                      {/* Column 3: VỊ TRỊ CHUYÊN MÔN */}
                      <div className="overflow-y-auto border-l border-slate-200 bg-white flex-1">
                        <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 sticky top-0">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Vị trí chuyên môn</p>
                        </div>
                        <div className="px-4 py-8 text-center bg-white">
                          <p className="text-xs text-slate-400">Vui lòng chọn ngành</p>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-2.5 bg-white border-t flex justify-between items-center">
                      <p className="text-xs text-slate-500">
                        Bạn gặp vấn đề với Danh mục Nghề?{' '}
                        <button className="text-slate-900 hover:underline font-medium">Gửi góp ý</button>
                      </p>
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={() => { setSelectedCategories(new Set()); setCategorySearchQuery(''); }}
                          className="px-3 py-1.5 text-slate-500 hover:text-slate-700 text-xs"
                        >
                          Bỏ chọn tất cả
                        </button>
                        <button
                          onClick={() => { setShowCategoryDropdown(false); setCategorySearchQuery(''); }}
                          className="px-4 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={() => { setShowCategoryDropdown(false); setCategorySearchQuery(''); }}
                          className="px-5 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-bold"
                        >
                          Chọn
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* Search Input with Icon */}
            <div className="relative flex-1 min-w-[280px] max-w-xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Vị trí tuyển dụng"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2.5 rounded text-sm border border-slate-900 focus:outline-none"
              />
            </div>
            
            {/* Location Dropdown */}
            <div className="relative" ref={locationRef}>
              <button 
                onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                className="px-4 py-2.5 bg-white text-slate-700 rounded font-medium text-sm hover:bg-slate-100 flex items-center gap-1.5 w-60 border border-slate-900"
              >
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="truncate text-sm">
                  {selectedLocations.size > 0 
                    ? (() => {
                        const selectedLocationIds = Array.from(selectedLocations);
                        const firstLocation = locations.find(l => l.id === selectedLocationIds[0]);
                        return selectedLocations.size === 1 
                          ? firstLocation?.name 
                          : `${firstLocation?.name} +${selectedLocations.size - 1}`;
                      })()
                    : 'Địa điểm'
                  }
                </span>
                {selectedLocations.size > 0 && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedLocations(new Set());
                      setShowLocationDropdown(false);
                    }}
                    className="text-slate-400 hover:text-slate-900 text-sm leading-none flex-shrink-0"
                  >
                    ✕
                  </button>
                )}
                <ChevronDown className="w-4 h-4 flex-shrink-0 ml-auto" />
              </button>
              {showLocationDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowLocationDropdown(false)} />
                  <div className="absolute top-full right-0 mt-2 z-50 bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col"
                    style={{ width: '400px', maxHeight: '480px' }}>
                    
                    {/* Header */}
                    <div className="px-5 py-3 flex justify-between items-center bg-white border-b border-slate-200">
                      <h3 className="font-semibold text-slate-900 text-sm flex-1">Chọn Địa điểm</h3>
                      <button onClick={() => setShowLocationDropdown(false)} className="text-slate-400 hover:text-slate-900 text-lg leading-none ml-3 flex-shrink-0">✕</button>
                    </div>
                    
                    {/* Content - Location List */}
                    <div className="overflow-y-auto" style={{ height: '300px' }}>
                      {locations.map(loc => (
                        <label key={loc.id} className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 rounded text-sm font-semibold break-words group cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedLocations.has(loc.id)}
                            onChange={(e) => {
                              const newSet = new Set(selectedLocations);
                              if (e.target.checked) newSet.add(loc.id);
                              else newSet.delete(loc.id);
                              setSelectedLocations(newSet);
                            }}
                            className="w-3.5 h-3.5 rounded border-slate-300 cursor-pointer flex-shrink-0"
                          />
                          <span className="break-words flex-1">{loc.name}</span>
                          {selectedLocations.has(loc.id) && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const newSet = new Set(selectedLocations);
                                newSet.delete(loc.id);
                                setSelectedLocations(newSet);
                              }}
                              className="text-slate-400 hover:text-slate-900 text-sm leading-none flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ✕
                            </button>
                          )}
                        </label>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-2.5 bg-white border-t flex justify-between items-center">
                      <p className="text-xs text-slate-500">
                        Bạn gặp vấn đề với Địa điểm?{' '}
                        <button className="text-slate-900 hover:underline font-medium">Gửi góp ý</button>
                      </p>
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={() => setSelectedLocations(new Set())}
                          className="px-3 py-1.5 text-slate-500 hover:text-slate-700 text-xs"
                        >
                          Bỏ chọn tất cả
                        </button>
                        <button
                          onClick={() => setShowLocationDropdown(false)}
                          className="px-4 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={() => setShowLocationDropdown(false)}
                          className="px-5 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-bold"
                        >
                          Chọn
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <button className="px-5 py-2.5 bg-slate-900 text-white hover:bg-slate-800 rounded font-medium text-sm whitespace-nowrap">
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      <div className="container py-6 max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <Link to="/" className="text-slate-900 hover:underline font-medium">Trang chủ</Link>
          <span className="text-slate-400">›</span>
          <Link to="/jobs" className="text-slate-900 hover:underline font-medium">Tìm việc làm {categoryNames[0]}</Link>
          <span className="text-slate-400">›</span>
          <span className="text-slate-600">{job.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-7 space-y-6">
            {/* Job Header */}
            <div className="bg-white rounded-lg p-6 border border-slate-200">
              {/* Title */}
              <h1 className="text-2xl font-bold text-slate-900 mb-4">{job.title}</h1>

              {/* Key Info Badges */}
              <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Thu nhập</p>
                    <p className="font-semibold text-slate-900">{job.salary}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Địa điểm</p>
                    <p className="font-semibold text-slate-900">{locationNames.join(', ')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Kinh nghiệm</p>
                    <p className="font-semibold text-slate-900">2 năm</p>
                  </div>
                </div>
              </div>

              {/* Links & Deadline */}
              <div className="space-y-2 mb-6 pb-6 border-b border-slate-200">
                <a href="#" className="text-slate-900 text-sm font-medium hover:underline">Xem mức lương thị trường cho vị trí này »</a>
                <p className="text-sm text-slate-600">Hạn nộp hồ sơ: <span className="font-semibold">15/05/2026</span> (Còn 35 ngày)</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  size="lg" 
                  className="flex-grow bg-slate-900 hover:bg-slate-800 text-white font-bold text-base gap-2 rounded-lg py-6"
                  onClick={() => {
                    if (!user) {
                      navigate('/login');
                    } else {
                      alert('Ứng tuyển cho: ' + job.title);
                    }
                  }}
                >
                  <Send className="w-5 h-5" />
                  Ứng tuyển ngay
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-slate-300 text-slate-900 hover:border-slate-900 hover:bg-slate-50 rounded-lg px-6"
                  onClick={() => setIsSaved(!isSaved)}
                >
                  <Heart className={`w-5 h-5 ${isSaved ? 'fill-slate-900 text-slate-900' : ''}`} />
                  Lưu tin
                </Button>
              </div>
            </div>

            {/* Chi tiết tin tuyển dụng */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b-2 border-slate-900">
                <div className="w-8 h-8 flex items-center justify-center rounded bg-slate-200">
                  <FileText className="w-5 h-5 text-slate-900" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Chi tiết tin tuyển dụng</h2>
              </div>

              <div className="space-y-6">
                {/* Yêu cầu */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-slate-900">Yêu cầu:</h3>
                    <a href="#" className="text-slate-900 font-medium hover:underline text-sm">Xem chi tiết Yêu cầu</a>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-block bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full font-medium text-sm">1 năm kinh nghiệm</span>
                    <span className="inline-block bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full font-medium text-sm">Cao Đẳng trở lên</span>
                    <span className="inline-block bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full font-medium text-sm">Tuổi 20 - 30</span>
                  </div>
                </div>

                {/* Quyền lợi */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-slate-900">Quyền lợi:</h3>
                    <a href="#" className="text-slate-900 font-medium hover:underline text-sm">Xem chi tiết Quyền lợi</a>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-block bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full font-medium text-sm">Nghi thứ 7</span>
                    <span className="inline-block bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full font-medium text-sm">Bảo hiểm xã hội</span>
                    <span className="inline-block bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full font-medium text-sm">Bảo hiểm sức khỏe</span>
                  </div>
                </div>

                {/* Chuyên môn */}
                <div>
                  <h3 className="font-bold text-slate-900 mb-3">Chuyên môn:</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-block bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full font-medium text-sm">Kinh doanh phụ tùng ô tô/xe máy/xe điện</span>
                    <span className="inline-block bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full font-medium text-sm">Marketing / Quảng cáo</span>
                    <span className="inline-block bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full font-medium text-sm">B2B</span>
                    <span className="inline-block bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full font-medium text-sm">B2C</span>
                    <span className="inline-block bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full font-medium text-sm">Direct Sales</span>
                    <span className="inline-block bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full font-medium text-sm">Online Sales</span>
                  </div>
                </div>

                {/* Mô tả công việc */}
                <div>
                  <h3 className="font-bold text-slate-900 mb-3">Mô tả công việc</h3>
                  <ul className="list-disc list-inside space-y-2 text-slate-700 text-sm">
                    <li>Tư vấn khách hàng hàng trực tiếp tại công ty và từ các kênh online của công ty</li>
                    <li>Tiếp nhận nhu cầu, chăm sóc khách hàng, giải đáp thắc mắc về sản phẩm</li>
                    <li>Hỗ trợ khách hàng trong quá trình mua hàng, chốt đơn và hậu mãi</li>
                    <li>Phối hợp với phòng Marketing triển khai các hoạt động bán hàng và chăm sóc khách hàng</li>
                    <li>Thực hiện các công việc khác theo sự phân công của quản lý</li>
                  </ul>
                </div>

                {/* Thu nhập */}
                <div>
                  <h3 className="font-bold text-slate-900 mb-3">Thu nhập</h3>
                  <ul className="list-disc list-inside space-y-2 text-slate-700 text-sm">
                    <li>Thu nhập: 10 - 25 triệu VNĐ</li>
                    <li>Lương cứng: Đến 10 triệu VNĐ</li>
                    <li>Lương cứng phụ thuộc vào doanh số</li>
                  </ul>
                </div>

                {/* Phụ cấp */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 flex-shrink-0 mt-1">
                    <Package className="w-5 h-5 text-slate-900" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2">Phụ cấp</h3>
                    <p className="text-slate-700 text-sm">Ăn trưa, Xăng xe, Gửi xe, Điện thoại</p>
                  </div>
                </div>

                {/* Thiết bị làm việc */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 flex-shrink-0 mt-1">
                    <Laptop className="w-5 h-5 text-slate-900" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2">Thiết bị làm việc</h3>
                    <p className="text-slate-700 text-sm">Được cấp Điện thoại, Máy tính, Tai nghe</p>
                  </div>
                </div>

                {/* Quyền lợi chi tiết */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 flex-shrink-0 mt-1">
                    <Gift className="w-5 h-5 text-slate-900" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2">Quyền lợi</h3>
                    <ul className="space-y-1 text-slate-700 text-sm">
                      <li>Bảo hiểm xã hội, Bảo hiểm sức khỏe, Team building, Du lịch hàng năm</li>
                      <li>Thưởng lễ, thưởng lễ - Tết - thưởng năm, quà sinh nhật, tiệc chúc mừng và các chế độ phúc lợi hiếu - hỷ</li>
                      <li>Du lịch tối thiểu 2 lần/năm, teambuilding, picnic và nhiều hoạt động gắn kết ý nghĩa</li>
                    </ul>
                  </div>
                </div>

                {/* Địa điểm làm việc */}
                <div>
                  <h3 className="font-bold text-slate-900 mb-3">Địa điểm làm việc</h3>
                  <p className="text-slate-700 text-sm mb-2">- Hà Nội: 30 Lê Hồng Phong, Hà Đông, Phương Hà Đông (quận Hà Đông cũ)</p>
                </div>

                {/* Thời gian làm việc */}
                <div>
                  <h3 className="font-bold text-slate-900 mb-3">Thời gian làm việc</h3>
                  <p className="text-slate-700 text-sm">Thứ 2 - Thứ 6 (từ 08:00 đến 17:00)</p>
                </div>

                {/* Cách thức ứng tuyển */}
                <div>
                  <h3 className="font-bold text-slate-900 mb-3">Cách thức ứng tuyển</h3>
                  <p className="text-slate-700 text-sm">Ứng viên nộp hồ sơ trực tuyến bằng cách bấm <span className="font-semibold">Ứng tuyển ngay dưới đây</span>.</p>
                </div>

                {/* Hạn nộp hồ sơ */}
                <div>
                  <h3 className="font-bold text-slate-900 mb-3">Hạn nộp hồ sơ</h3>
                  <p className="text-slate-700 text-sm">Hạn nộp hồ sơ: 15/05/2026</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button 
                    size="lg" 
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-base gap-2 rounded-lg px-6"
                    onClick={() => {
                      if (!user) {
                        navigate('/login');
                      } else {
                        alert('Ứng tuyển cho: ' + job.title);
                      }
                    }}
                  >
                    <Send className="w-5 h-5" />
                    Ứng tuyển ngay
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-2 border-slate-300 text-slate-900 hover:border-slate-900 hover:bg-slate-50 rounded-lg px-6"
                    onClick={() => setIsSaved(!isSaved)}
                  >
                    <Heart className={`w-5 h-5 ${isSaved ? 'fill-slate-900 text-slate-900' : ''}`} />
                    Lưu tin
                  </Button>
                </div>

                {/* Alert Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                  <div className="w-6 h-6 flex-shrink-0 mt-0.5">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">i</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-blue-900">
                      <span className="font-semibold">Báo cáo tin tuyển dụng:</span> Nếu bạn thấy rằng tin tuyển dụng này không đúng hoặc có dấu hiệu lừa đảo, 
                      <a href="#" className="text-blue-600 font-semibold hover:underline"> hãy phản ánh với chúng tôi.</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Jobs Section */}
            {job && <RelatedJobs currentJobId={job.id} currentJob={job} />}
          </div>

          {/* Sidebar - Company Info */}
          <div className="lg:col-span-3 space-y-3">
            {/* Company Info Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{company?.name || 'Công ty'}</h3>
                </div>
                <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-slate-400" />
                </div>
              </div>
              <a href="#" className="text-teal-600 text-xs font-medium hover:underline inline-block">
                Xem trang công ty →
              </a>
              <div className="space-y-2 border-t pt-3">
                <div className="flex items-start gap-2">
                  <Users className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500">Quy mô:</p>
                    <p className="text-sm font-medium text-slate-900">25-99 nhân viên</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Briefcase className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500">Lĩnh vực:</p>
                    <p className="text-sm font-medium text-slate-900">Xây dựng</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500">Địa điểm:</p>
                    <p className="text-sm font-medium text-slate-900">{locationNames.join(', ')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Thông tin chung */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-900 mb-3 text-base">Thông tin chung</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Cấp bậc</p>
                    <p className="text-sm font-medium text-slate-900">Nhân viên</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Học vấn</p>
                    <p className="text-sm font-medium text-slate-900">Cao Đẳng trở lên</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Số lượng</p>
                    <p className="text-sm font-medium text-slate-900">1 người</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Hình thức</p>
                    <p className="text-sm font-medium text-slate-900">Toàn thời gian</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-4">
              {/* Danh mục Nghề liên quan */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3 text-base">Danh mục Nghề liên quan</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-block bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-sm">Kinh doanh/Bán hàng</span>
                  <span className="inline-block bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-sm">Sản xuất</span>
                  <span className="inline-block bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-sm">Sales Sản xuất</span>
                  <span className="inline-block bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-sm">Kinh doanh phụ tùng ô tô/xe máy/xe điện</span>
                </div>
              </div>

              {/* Kỹ năng cần có */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-slate-900 mb-3 text-base">Kỹ năng cần có</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-block bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-sm">Tin học văn phòng</span>
                  <span className="inline-block bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-sm">Xử lý tình huống</span>
                  <span className="inline-block bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-sm">Giao tiếp</span>
                </div>
              </div>

              {/* Tìm việc theo khu vực */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-slate-900 mb-3 text-base">Tìm việc theo khu vực</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-block bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-sm">Hà Nội</span>
                  <span className="inline-block bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-sm">Việc làm Nhân Viên Bán Hàng tại Hà Nội</span>
                  <span className="inline-block bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-sm">Phương Hà Đông - Hà Nội</span>
                  <a href="#" className="text-slate-900 font-medium hover:underline text-sm">Xem thêm</a>
                </div>
              </div>
            </div>

            {/* Job Safety Tips Card */}
            <div className="bg-white rounded-lg border-2 border-slate-900 p-4">
              <div className="flex items-start gap-3 mb-4 pb-4 border-b border-slate-200">
                <div className="w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white font-bold text-sm">i</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">Bí kíp Tìm việc an toàn</h3>
              </div>

              <p className="text-sm text-slate-700 mb-3">Dưới đây là những dấu hiệu của các tổ chức, cá nhân tuyển dụng không minh bạch:</p>

              {/* Warning Signs Carousel */}
              <div className="space-y-3">
                {/* Sign 1 */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-2">1. Dấu hiệu phổ biến:</h4>
                  <div className="bg-slate-50 rounded-lg p-3 mb-2">
                    <div className="w-full h-24 bg-slate-200 rounded flex items-center justify-center mb-2 text-xs text-slate-400">
                      [Minh họa]
                    </div>
                    <p className="text-sm text-slate-600 text-center">Nội dung mô tả công việc sai</p>
                  </div>
                  <div className="flex justify-center gap-1.5">
                    <button className="w-1.5 h-1.5 bg-slate-300 rounded-full hover:bg-slate-400"></button>
                    <button className="w-1.5 h-1.5 bg-slate-300 rounded-full hover:bg-slate-400"></button>
                    <button className="w-1.5 h-1.5 bg-slate-300 rounded-full hover:bg-slate-400"></button>
                    <button className="w-1.5 h-1.5 bg-slate-300 rounded-full hover:bg-slate-400"></button>
                    <button className="w-1.5 h-1.5 bg-slate-300 rounded-full hover:bg-slate-400"></button>
                    <button className="w-1.5 h-1.5 bg-slate-300 rounded-full hover:bg-slate-400"></button>
                  </div>
                </div>

                {/* Warning Details */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-2">2. Cần làm gì khi gặp việc làm, công ty không minh bạch:</h4>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li className="flex gap-2">
                      <span className="text-slate-900 font-bold flex-shrink-0">•</span>
                      <span>Kiểm tra thông tin về công ty, việc làm trước khi ứng tuyển</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-slate-900 font-bold flex-shrink-0">•</span>
                      <span>Báo cáo tin tuyển dụng với TopCV thông qua nút "<span className="font-semibold">Báo cáo tin tuyển dụng</span>" để được hỗ trợ và giúp các ứng viên khác tránh rơi vào bẫy</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-slate-900 font-bold flex-shrink-0">•</span>
                      <span>Hoặc liên hệ với TopCV thông qua kênh hỗ trợ ứng viên của TopCV:</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold flex-shrink-0">Email:</span>
                      <a href="mailto:hotro@topcv.vn" className="text-teal-600 hover:underline">hotro@topcv.vn</a>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold flex-shrink-0">Hotline:</span>
                      <a href="tel:02466805588" className="text-teal-600 hover:underline">(024) 6680 5588</a>
                    </li>
                  </ul>
                </div>
              </div>

              <button className="w-full mt-3 py-2 text-sm bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800">
                Báo cáo tin tuyển dụng
              </button>

              <p className="text-sm text-slate-600 text-center mt-2">
                Tìm hiểu thêm kinh nghiệm phòng tránh lừa đảo 
                <a href="#" className="text-teal-600 font-semibold hover:underline"> tại đây</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
