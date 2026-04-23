import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Menu, MapPin, Search } from 'lucide-react';
import { categories, locations, Category } from '@/data/mockData';

export default function SearchBanner() {
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

  return (
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
                                      groupCategoryIds.forEach(id => newSet.add(id));
                                    } else {
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
  );
}
