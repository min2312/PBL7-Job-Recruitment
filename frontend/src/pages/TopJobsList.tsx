import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Bookmark, ChevronLeft, ChevronRight, MapPin, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Job, getLocationById } from '@/data/mockData';
import JobCard from '@/components/JobCard';
import JobPreviewPopup from '@/components/JobPreviewPopup';

interface TopJobsListProps {
  jobs: Job[];
}

export default function TopJobsList({ jobs }: TopJobsListProps) {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedSalary, setSelectedSalary] = useState<string>('all');
  const [selectedExperience, setSelectedExperience] = useState<string>('all');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('location');
  const [currentPage, setCurrentPage] = useState(0);
  const [hoveredJobId, setHoveredJobId] = useState<number | null>(null);
  const [previewPosition, setPreviewPosition] = useState<{ top: number; left: number } | null>(null);
  const [popupHovered, setPopupHovered] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (tabsRef.current) {
      const scrollAmount = 300;
      if (direction === 'left') {
        tabsRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        tabsRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  useEffect(() => {
    setSelectedLocation('all');
    setSelectedSalary('all');
    setSelectedExperience('all');
    setSelectedIndustry('all');
    setCurrentPage(0);
  }, [filterType]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  const locations = ['Ngẫu Nhiên', 'Hà Nội', 'Thành phố Hồ Chí Minh (cũ)', 'Miền Bắc', 'Miền Nam'];
  const salaries = ['Tất cả', 'Dưới 10 triệu', 'Từ 10-15 triệu', 'Từ 15-20 triệu', 'Từ 20-25 triệu', 'Từ 25-30 triệu', 'Trên 30-50 triệu', 'Trên 50 triệu', 'Thỏa thuận'];
  const experiences = ['Tất cả', 'Chưa có kinh nghiệm', '1 năm trở xuống', '1 năm', '2 năm', '3 năm', 'Từ 4-5 năm', 'Trên 5 năm'];
  const industries = ['Tất cả', 'Kinh doanh / Bán hàng', 'Biên / Phiên dịch', 'Báo chí / Truyền hình', 'Bưu chính - Viên thông', 'Bảo hiểm', 'Bất động sản'];

  const filterOptions = [
    { label: 'Địa điểm', value: 'location' },
    { label: 'Mức lương', value: 'salary' },
    { label: 'Kinh nghiệm', value: 'experience' },
    { label: 'Ngành nghề', value: 'industry' }
  ];

  const getFilterLabel = () => {
    const option = filterOptions.find(opt => opt.value === filterType);
    return option?.label || 'Địa điểm';
  };

  const getCurrentItems = () => {
    switch(filterType) {
      case 'salary': return salaries;
      case 'experience': return experiences;
      case 'industry': return industries;
      default: return locations;
    }
  };
  
  const filteredJobs = selectedLocation === 'all' 
    ? jobs 
    : jobs.filter(job => {
        const location = getLocationById(job.locationIds?.[0])?.name;
        return location?.includes(selectedLocation);
      });

  const jobsPerPage = 12;
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const displayedJobs = filteredJobs.slice(currentPage * jobsPerPage, (currentPage + 1) * jobsPerPage);

  const handlePrevPage = () => {
    setCurrentPage(prev => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => (prev === totalPages - 1 ? 0 : prev + 1));
  };

  const handlePopupHover = (hovered: boolean) => {
    setPopupHovered(hovered);
    if (hovered) {
      // Clear timeout when mouse enters popup
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    } else {
      // Set timeout when mouse leaves popup
      hideTimeoutRef.current = setTimeout(() => {
        setHoveredJobId(null);
        setPreviewPosition(null);
      }, 200);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-slate-900">Việc làm tốt nhất</h2>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-6 h-6 bg-slate-200 rounded-full animate-pulse"></div>
            <span className="text-slate-600">Cố Pháp TOPPYAI</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-1.5 border-2 border-slate-900 rounded-full transition-all text-slate-900 hover:bg-slate-900 hover:text-white">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="p-1.5 border-2 border-slate-900 rounded-full transition-all text-slate-900 hover:bg-slate-900 hover:text-white">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 min-h-[44px]">
          <label className="text-sm font-medium text-slate-700 whitespace-nowrap">Lọc theo:</label>
          <div className="relative w-48">
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-700 w-full appearance-none cursor-pointer bg-white font-medium"
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Dynamic Tabs on same row - aligned right */}
          <div className="flex items-center gap-2 ml-auto" style={{ contain: 'layout' }}>
            <button 
              onClick={() => scroll('left')}
              className="p-1 border-2 border-slate-900 rounded-full transition-all text-slate-900 hover:bg-slate-900 hover:text-white flex-shrink-0"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            
            <div 
              ref={tabsRef}
              className="flex items-center gap-2 overflow-x-auto scroll-smooth hide-scrollbar max-w-[800px]"
              style={{ scrollBehavior: 'smooth' }}
            >
              {getCurrentItems().map((item, idx) => {
                const isSelected = 
                  filterType === 'location' && ((idx === 0 && selectedLocation === 'all') || selectedLocation === item) ||
                  filterType === 'salary' && ((idx === 0 && selectedSalary === 'all') || selectedSalary === item) ||
                  filterType === 'experience' && ((idx === 0 && selectedExperience === 'all') || selectedExperience === item) ||
                  filterType === 'industry' && ((idx === 0 && selectedIndustry === 'all') || selectedIndustry === item);

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      const value = idx === 0 ? 'all' : item;
                      if (filterType === 'location') setSelectedLocation(value);
                      else if (filterType === 'salary') setSelectedSalary(value);
                      else if (filterType === 'experience') setSelectedExperience(value);
                      else if (filterType === 'industry') setSelectedIndustry(value);
                      setCurrentPage(0);
                    }}
                    className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all border-2 flex-shrink-0 ${
                      isSelected
                        ? 'bg-black text-white border-black'
                        : 'bg-slate-100 text-slate-600 border-slate-100 hover:border-slate-900'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
            
            <button 
              onClick={() => scroll('right')}
              className="p-1 border-2 border-slate-900 rounded-full transition-all text-slate-900 hover:bg-slate-900 hover:text-white flex-shrink-0"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-slate-50 border border-slate-300 rounded-lg p-4 flex items-center gap-3">
          <div className="w-5 h-5 bg-slate-400 rounded-full flex items-center justify-center text-white text-xs font-bold">i</div>
          <p className="text-sm text-slate-700">
            Dị chuột vào tiêu đề để xem thêm thông tin chi tiết
          </p>
          <button className="ml-auto text-slate-400 hover:text-slate-600">✕</button>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="w-full grid grid-cols-3 gap-3 auto-rows-max relative" ref={gridRef}>
        {displayedJobs.map(job => (
          <div key={job.id} className="relative">
            <JobCard 
              job={job}
              variant="grid"
              onMouseEnter={(jobId, event) => {
                // Clear any pending hide timeout
                if (hideTimeoutRef.current) {
                  clearTimeout(hideTimeoutRef.current);
                  hideTimeoutRef.current = null;
                }
                // Clear any pending hide timeout
                if (hideTimeoutRef.current) {
                  clearTimeout(hideTimeoutRef.current);
                  hideTimeoutRef.current = null;
                }
                const rect = event.currentTarget.getBoundingClientRect();
                setHoveredJobId(jobId);
                // Calculate position for fixed popup - outside card
                let leftPos = rect.right + 6;
                let topPos = rect.top;
                // If popup would overflow to the right, show it on the left
                if (leftPos + 384 > window.innerWidth) {
                  leftPos = rect.left - 384 - 6;
                }
                // Adjust top if popup would overflow bottom
                if (topPos + 450 > window.innerHeight) {
                  topPos = window.innerHeight - 470;
                }
                setPreviewPosition({
                  top: Math.max(20, topPos),
                  left: Math.max(20, leftPos)
                });
              }}
              onMouseLeave={() => {
                // Delay hiding popup to allow mouse to move into it
                hideTimeoutRef.current = setTimeout(() => {
                  if (!popupHovered) {
                    setHoveredJobId(null);
                    setPreviewPosition(null);
                  }
                }, 200);
              }}
            />
            {hoveredJobId === job.id && previewPosition && (
              <JobPreviewPopup 
                job={job} 
                position={previewPosition}
                onPopupHover={handlePopupHover}
              />
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 h-[40px]">
        {totalPages > 1 && (
          <>
            <button
              onClick={handlePrevPage}
              className="p-1.5 border-2 border-slate-900 rounded-full transition-all text-slate-900 hover:bg-slate-900 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-slate-500">
              {currentPage + 1} / {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              className="p-1.5 border-2 border-slate-900 rounded-full transition-all text-slate-900 hover:bg-slate-900 hover:text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
