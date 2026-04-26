import { useNavigate, Routes, Route } from 'react-router-dom';
import { usePageLoad } from '@/contexts/PageLoadContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, ChevronLeft, ChevronRight, Briefcase, TrendingUp, MapPin } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import axiosClient from '@/services/axiosClient';
import TopJobsList from '@/pages/TopJobsList';
import CandidateProfile from '@/pages/CandidateProfile';
import HeaderMNP from '@/components/HeaderMNP';

const jobCategories = [
  { id: 1, name: 'Việc làm' },
  { id: 2, name: 'Công cụ' },
  { id: 3, name: 'Cẩm nang nghề nghiệp' },
];

// Banner component with mouse tracking effect
function CandidateBanner({ navigate }: { navigate: any }) {
  const bannerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -999, y: -999 });
  const particlesRef = useRef<any[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const banner = bannerRef.current!;
    const ctx = canvas.getContext('2d')!;
    const COLORS = ['#378ADD','#E24B4A','#EF9F27','#1D9E75','#7F77DD','#D4537E'];

    let W = 0, H = 0, raf: number;

    function resize() {
      W = canvas.width = banner.offsetWidth;
      H = canvas.height = banner.offsetHeight;
    }

    class Particle {
      x = 0; y = 0; vx = 0; vy = 0;
      size = 0; color = ''; alpha = 0;
      angle = 0; angleV = 0;

      constructor() { this.reset(true); }

      reset(cold: boolean) {
        this.x = Math.random() * W;
        this.y = cold ? Math.random() * H : -10;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = Math.random() * 0.5 + 0.1;
        this.size = Math.random() * 3 + 1.2;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.alpha = Math.random() * 0.5 + 0.25;
        this.angle = Math.random() * Math.PI * 2;
        this.angleV = (Math.random() - 0.5) * 0.04;
      }

      update() {
        const { x: mx, y: my } = mouseRef.current;
        const dx = this.x - mx, dy = this.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const force = (120 - dist) / 120;
          this.vx += (dx / dist) * force * 0.25;
          this.vy += (dy / dist) * force * 0.25;
        }
        this.vx *= 0.97; this.vy *= 0.97;
        this.vy += 0.02; // gravity
        this.x += this.vx; this.y += this.vy;
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
        // ellipse dài = hình đóm lá
        ctx.ellipse(0, 0, this.size, this.size * 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    resize();
    particlesRef.current = Array.from({ length: 140 }, () => new Particle());

    function loop() {
      ctx.clearRect(0, 0, W, H);
      particlesRef.current.forEach(p => { p.update(); p.draw(); });
      raf = requestAnimationFrame(loop);
    }

    const handleMouseMove = (e: MouseEvent) => {
      const r = banner.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const handleMouseLeave = () => { mouseRef.current = { x: -999, y: -999 }; };
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

  return (
    <div ref={bannerRef} className="relative w-full h-96 overflow-hidden bg-white">
      {/* Canvas thay thế toàn bộ sparkle cũ */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 1 }}
      />

      {/* Content giữ nguyên */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-6" style={{ zIndex: 2 }}>
        <h1 className="text-4xl font-bold text-black mb-3">
          Tìm Cơ Hội Nghề Nghiệp Lý Tưởng
        </h1>
        <p className="text-lg text-slate-700 mb-6 max-w-2xl">
          Khám phá hàng ngàn công việc từ các công ty hàng đầu. Ứng tuyển ngay và phát triển sự nghiệp của bạn.
        </p>
        <div className="flex gap-4">
          <Button
            className="bg-black hover:bg-slate-900 text-white font-semibold px-6 py-2 rounded-lg flex items-center gap-2"
            onClick={() => navigate('/job-search')}
          >
            <Search className="w-4 h-4" />
            Tìm kiếm công việc
          </Button>
          <Button
            variant="outline"
            className="border-slate-800 text-slate-800 hover:text-slate-800 hover:bg-slate-200 font-semibold px-6 py-2 rounded-lg"
            onClick={() => navigate('/companies')}
          >
            Khám phá công ty
          </Button>
        </div>
      </div>
    </div>
  );
}

function CandidateJobsList() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [marketSummary, setMarketSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchMarketSummary();
  }, []);

  useEffect(() => {
    fetchCategories(currentPage);
  }, [currentPage]);

  const fetchCategories = async (page: number) => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/api/neo4j/categories-paginated?page=${page}&limit=6`);
      if (res.data.errCode === 0) {
        setCategories(res.data.data.categories);
        setTotalPages(Math.ceil(res.data.data.total / 6));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMarketSummary = async () => {
    try {
      const res = await axiosClient.get('/api/neo4j/market-summary');
      if (res.data.errCode === 0) {
        setMarketSummary(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching market summary:', error);
    }
  };

  const handlePrevCategory = () => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : totalPages));
  };

  const handleNextCategory = () => {
    setCurrentPage((prev) => (prev < totalPages ? prev + 1 : 1));
  };

  return (
    <>
      <div className="flex-1 max-w-full mx-auto w-full py-6 px-48 space-y-6">
        <div className="grid grid-cols-10 gap-6 min-h-[400px]">
          {/* Sidebar - Left (Thống kê thị trường) */}
          <aside className="col-span-3 flex flex-col gap-4">
            <Card className="p-5 border-slate-200 bg-gradient-to-br from-white to-slate-50">
              <h3 className="font-bold text-slate-900 mb-5 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-600" />
                Thống kê thị trường
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Tổng việc làm</p>
                    <p className="text-xl font-bold text-slate-900">
                      {marketSummary?.totalJobs?.toLocaleString() || '...'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-teal-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Ngành hot nhất</p>
                    <p className="text-sm font-bold text-slate-900 line-clamp-1">
                      {marketSummary?.topCategory?.name || '...'}
                    </p>
                    <p className="text-xs text-slate-400">{marketSummary?.topCategory?.count || 0} việc làm</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Khu vực sôi động</p>
                    <p className="text-sm font-bold text-slate-900">
                      {marketSummary?.topLocation?.name || '...'}
                    </p>
                    <p className="text-xs text-slate-400">{marketSummary?.topLocation?.count || 0} việc làm</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-black rounded-xl text-white">
                <p className="text-xs opacity-80 mb-1">Dữ liệu được cập nhật từ</p>
                <p className="text-sm font-bold">Hệ Thống Dữ Liệu MNP</p>
                <div className="mt-3 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-400 w-2/3"></div>
                </div>
              </div>
            </Card>
          </aside>

          {/* Top Industries - Right */}
          <div className="col-span-7">
            <Card className="p-6 border-slate-200 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Top ngành nghề nổi bật</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Khám phá cơ hội việc làm theo từng lĩnh vực chuyên môn.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-500 font-medium">
                    Trang {currentPage}/{totalPages}
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={handlePrevCategory}
                      className="p-1.5 border-2 border-black rounded-full transition-all text-black hover:bg-black hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={handleNextCategory}
                      className="p-1.5 border-2 border-black rounded-full transition-all text-black hover:bg-black hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 flex-1">
                {loading ? (
                  [1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="bg-slate-50 rounded-lg p-4 text-center animate-pulse">
                      <div className="w-16 h-16 bg-slate-200 rounded-lg mx-auto mb-3"></div>
                      <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto mb-2"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/2 mx-auto"></div>
                    </div>
                  ))
                ) : (
                  categories.map((cat, index) => (
                    <div 
                      key={index} 
                      className="bg-slate-50 rounded-xl p-5 text-center hover:shadow-lg transition-all cursor-pointer border border-transparent hover:border-teal-100 group"
                      onClick={() => navigate(`/job-search?categoryId=${cat.id}`)}
                    >
                      <div className="w-14 h-14 bg-white shadow-sm rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Briefcase className="w-6 h-6 text-teal-600" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-2 mb-2 group-hover:text-teal-700 transition-colors">
                        {cat.name}
                      </h4>
                      <p className="text-xs text-teal-600 font-bold bg-teal-50 inline-block px-3 py-1 rounded-full">
                        {cat.jobCount} việc làm
                      </p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>

        <div className="space-y-4 min-h-[600px]">
          <TopJobsList />
        </div>
      </div>
    </>
  );
}

export default function CandidateDashboard() {
  const navigate = useNavigate();
  const { isLoading } = usePageLoad();

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col ${isLoading ? 'animate-page-load' : ''}`}>
      {/* Header */}
      <HeaderMNP />

      {/* Banner */}
      <CandidateBanner navigate={navigate} />

      <Routes>
        <Route index element={<CandidateJobsList />} />
        <Route path="profile" element={<CandidateProfile embedded />} />
      </Routes>
    </div>
  );
}
