import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, Search, MapPin, ChevronDown, Laptop } from 'lucide-react';
import JobNeedsBanner from '@/components/JobNeedsBanner';

export default function SavedJobsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocations, setSelectedLocations] = useState<Set<number>>(new Set());
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);

  // Mock saved jobs (empty for now)
  const savedJobs: any[] = [];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const locations = [
    { id: 1, name: 'Hà Nội' },
    { id: 2, name: 'TP Hồ Chí Minh' },
    { id: 3, name: 'Đà Nẵng' },
    { id: 4, name: 'Hải Phòng' },
    { id: 5, name: 'Cần Thơ' },
    { id: 6, name: 'Cộng hòa' },
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
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
    <div className="min-h-screen bg-slate-50">
      {/* Job Needs Banner */}
      <JobNeedsBanner onUpdateClick={() => navigate('/login')} />

      {/* Search Banner */}
      <div className="bg-white px-6 py-4 border-b border-slate-200">
        <div className="container max-w-6xl mx-auto">
          <div className="flex gap-2 items-center flex-wrap">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[280px]">
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

      <div className="container max-w-6xl mx-auto py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-8">
          <Link to="/" className="text-slate-900 hover:underline font-medium">Trang chủ</Link>
          <span className="text-slate-400">›</span>
          <span className="text-slate-600">Việc làm đã lưu</span>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-8">Việc làm đã lưu</h1>

        {savedJobs.length === 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Empty State - Left */}
            <div className="lg:col-span-2">
              <Card className="p-12 border-slate-200 flex flex-col items-center justify-center min-h-[400px]">
                {/* Empty Icon */}
                <div className="mb-6">
                  <div className="w-40 h-40 mx-auto relative">
                    {/* Simple empty basket illustration */}
                    <svg viewBox="0 0 200 200" className="w-full h-full">
                      {/* Basket */}
                      <path 
                        d="M 60 80 L 40 140 Q 40 160 60 160 L 140 160 Q 160 160 160 140 L 140 80" 
                        stroke="#cbd5e1" strokeWidth="3" fill="none"
                      />
                      {/* Handle */}
                      <path 
                        d="M 70 80 Q 100 40 130 80" 
                        stroke="#cbd5e1" strokeWidth="3" fill="none"
                      />
                      {/* Basket lines */}
                      <line x1="60" y1="100" x2="140" y2="100" stroke="#cbd5e1" strokeWidth="2" />
                      <line x1="60" y1="120" x2="140" y2="120" stroke="#cbd5e1" strokeWidth="2" />
                      
                      {/* Cute face */}
                      <circle cx="85" cy="115" r="2" fill="#cbd5e1" />
                      <circle cx="115" cy="115" r="2" fill="#cbd5e1" />
                      <path d="M 90 130 Q 100 135 110 130" stroke="#cbd5e1" strokeWidth="2" fill="none" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                {/* Empty Message */}
                <h2 className="text-2xl font-bold text-slate-900 mb-3 text-center">Bạn chưa lưu công việc nào!</h2>
                <p className="text-slate-600 text-center mb-8 max-w-sm">Hãy lưu những công việc mà bạn quan tâm để dễ dàng theo dõi và ứng tuyển sau này.</p>

                {/* Action Button */}
                <Button 
                  size="lg"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-8 py-3 rounded-full"
                  onClick={() => navigate('/')}
                >
                  Tìm việc ngay →
                </Button>
              </Card>
            </div>

            {/* Promotional Section - Right */}
            <div className="lg:col-span-1">
              <Card className="p-6 border-slate-200 bg-gradient-to-br from-teal-50 to-teal-100 overflow-hidden">
                {/* Decorative dots */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-200 rounded-full opacity-20 -mr-16 -mt-16"></div>
                
                <div className="relative z-10">
                  {/* Title */}
                  <h3 className="text-xl font-bold text-teal-900 mb-2">CV "Hỏi" Trên Tay</h3>
                  <p className="text-sm text-teal-800 mb-6">Apply Ngay Việc Hot</p>

                  {/* Description */}
                  <p className="text-xs text-teal-700 mb-4 leading-relaxed">
                    Nền tảng tạo CV online hàng đầu Việt Nam
                  </p>

                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <span className="text-xs text-teal-900 font-medium">25 mẫu CV chuyên nghiệp</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <span className="text-xs text-teal-900 font-medium">Chuẩn theo ngành nghề</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <span className="text-xs text-teal-900 font-medium">Xuất PDF, doc dễ dàng</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button 
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm py-2"
                  >
                    Xem ngay
                  </Button>
                </div>
              </Card>

              {/* Info Cards */}
              <div className="mt-4 space-y-3">
                <div className="bg-white rounded-lg p-4 border border-slate-200 flex items-center gap-3">
                  <Laptop className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <span className="text-xs text-slate-700">Gợi ý công việc</span>
                </div>
                <div className="bg-white rounded-lg p-4 border border-slate-200 flex items-center gap-3">
                  <Heart className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <span className="text-xs text-slate-700">0 Việc đã lưu</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Show saved jobs when they exist
          <div className="grid grid-cols-1 gap-4">
            <p className="text-slate-600">Showing {savedJobs.length} saved jobs</p>
            {/* Jobs list will go here */}
          </div>
        )}
      </div>
    </div>
  );
}
