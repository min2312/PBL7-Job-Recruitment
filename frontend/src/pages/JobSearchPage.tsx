import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ChevronDown, MapPin, DollarSign, Briefcase, CheckCircle2, Heart } from 'lucide-react';
import JobCard from '@/components/JobCard';
import { jobs as mockJobs, getCompanyById } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import SearchBanner from '@/components/SearchBanner';

export default function JobSearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const positionParam = searchParams.get('position');
  const categoryParam = searchParams.get('category');

  const [selectedLevelOfWork, setSelectedLevelOfWork] = useState('Không lọc');
  const [selectedWorkShift, setSelectedWorkShift] = useState('Làm thứ 7');
  const [selectedExperience, setSelectedExperience] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 40;

  // Mock data
  const levelOfWorks = ['Không lọc', 'Làm thứ 7', 'Tin đăng không đề cập'];
  const jobCategories = [
    { name: 'Sales Bán lẻ/Dịch vụ tiêu dùng', count: 1724 },
    { name: 'Kinh doanh/Bán hàng khác', count: 1418 },
    { name: 'Sales Admin/Sales Support', count: 1084 },
    { name: 'Sales Giáo dục/Khoá học', count: 982 },
    { name: 'Sales Tài chính/Ngân hàng/Bảo hiểm', count: 787 }
  ];

  const experiences = ['Chưa có kinh nghiệm', '1 năm trở xuống', '1 năm', '2 năm', '3 năm'];

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Filter jobs based on position/category params
  const filteredJobs = mockJobs; // Mock filtered jobs
  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pagedJobs = filteredJobs.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [positionParam, categoryParam]);

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: transparent;
          border-radius: 2px;
        }
        .scrollbar-thin:hover::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
        }
      `}</style>

      {/* Search Banner */}
      <SearchBanner />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-24 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg p-6 space-y-6 sticky top-20 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-thin">
              {/* Level of Work Section */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2 text-xs">
                  <span>Nghi thứ 7</span>
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-50">
                    <input type="radio" name="levelOfWork" defaultChecked className="w-4 h-4" />
                    <span className="text-xs text-slate-700">Không lọc</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-50">
                    <input type="radio" name="levelOfWork" className="w-4 h-4" />
                    <span className="text-xs text-slate-700">Làm thứ 7</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-50">
                    <input type="radio" name="levelOfWork" className="w-4 h-4" />
                    <span className="text-xs text-slate-700">Tin đăng không đề cập</span>
                  </label>
                </div>
              </div>

              {/* Job Categories Section */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-4 text-xs">Lọc theo danh mục nghề</h3>
                <div className="space-y-2">
                  {jobCategories.map((category) => (
                    <div key={category.name}>
                      <button
                        onClick={() => setExpandedCategory(expandedCategory === category.name ? null : category.name)}
                        className="w-full flex items-center justify-between p-2 rounded hover:bg-slate-50 text-left"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="checkbox"
                            className="w-4 h-4"
                            readOnly
                          />
                          <span className="text-xs text-slate-700">{category.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 ml-auto mr-2">({category.count})</span>
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      </button>
                      {expandedCategory === category.name && (
                        <div className="ml-6 mt-2 space-y-2 border-l border-slate-200 pl-2">
                          {['Sub item 1', 'Sub item 2'].map((item) => (
                            <label key={item} className="flex items-center gap-2 cursor-pointer text-xs">
                              <input type="checkbox" className="w-3 h-3" />
                              <span className="text-slate-600">{item}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <button className="text-green-600 text-xs font-semibold mt-3 hover:underline">
                  Xem thêm
                </button>
              </div>

              {/* Experience Section */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-4 text-xs">Kinh nghiệm</h3>
                <div className="space-y-2">
                  {experiences.map((exp) => (
                    <label key={exp} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-50">
                      <input
                        type="checkbox"
                        className="w-4 h-4"
                        onChange={(e) => setSelectedExperience(e.target.checked ? exp : '')}
                      />
                      <span className="text-xs text-slate-700">{exp}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Job List */}
          <div className="lg:col-span-7">
            {/* Filter Bar */}
            <div className="bg-white rounded-lg p-4 mb-6 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-slate-900">Tên công ty</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="rounded-full text-xs">
                  ✓ Tên việc làm
                </Button>
                <Button variant="outline" className="rounded-full text-xs">
                  Tên công ty
                </Button>
                <Button variant="outline" className="rounded-full text-xs">
                  Cả hai
                </Button>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-sm text-slate-600">Sắp xếp theo:</span>
                <Button variant="outline" className="text-xs">
                  Search by AI
                </Button>
              </div>
            </div>

            {/* Jobs Grid */}
            <div className="space-y-4">
              {pagedJobs.map((job) => {
                const company = getCompanyById(job.companyId);
                return (
                <div 
                  key={job.id} 
                  className="group bg-white rounded-lg border border-slate-200 hover:border-black p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/jobs/${job.id}`)}
                >
                  <div className="flex gap-4">
                    {/* Company Logo */}
                    <div className="w-20 h-20 bg-slate-100 rounded-lg flex-shrink-0 flex items-center justify-center border border-slate-200">
                      <span className="text-xs font-bold text-slate-400">LOGO</span>
                    </div>

                    {/* Job Info */}
                    <div className="flex-1">
                      {/* Row 1: Job Title + Salary */}
                      <div className="flex justify-between items-start mb-2">
                        <Link
                          to={`/jobs/${job.id}`}
                          className="font-semibold text-slate-900 text-sm flex-1 hover:text-slate-700 group-hover:underline"
                        >
                          {job.title}
                        </Link>
                        <span className="text-slate-900 font-semibold text-sm whitespace-nowrap ml-2">{job.salary}</span>
                      </div>
                      
                      {/* Row 2: Company Name */}
                      <Link
                        to={`/companies/${company?.id ?? job.companyId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-slate-600 font-medium mb-2 inline-block hover:text-slate-900 hover:underline"
                      >
                        {company?.name || 'Công ty'}
                      </Link>
                      
                      {/* Row 3: Location + Experience */}
                      <div className="flex gap-2 text-[11px] text-slate-600 mb-2">
                        <span className="bg-slate-100 px-2 py-1 rounded-full">Hồ Chí Minh (mới)</span>
                        <span className="bg-slate-100 px-2 py-1 rounded-full">Không yêu cầu</span>
                      </div>
                      
                      {/* Row 4: Job Category Tags */}
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-slate-600">
                          <span>Sales bất động sản/Môi giới bất động sản</span>
                          <span className="text-green-600 font-semibold cursor-pointer ml-2">+11</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-500 group-hover:hidden">Đăng 1 ngày trước</span>
                          <button 
                            onClick={() => navigate(`/jobs/${job.id}`)}
                            className="hidden group-hover:flex h-8 items-center justify-center px-3 bg-black text-white text-xs font-semibold rounded hover:bg-slate-800 transition-colors"
                          >
                            Ứng tuyển
                          </button>
                          <button 
                            className="w-8 h-8 flex items-center justify-center rounded-full border border-black hover:bg-slate-200 transition-colors"
                          >
                            <Heart className="w-4 h-4 text-black" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              <Button
                variant="outline"
                className="text-xs"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Trước
              </Button>
              <span className="text-xs text-slate-600">
                Trang {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                className="text-xs"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Sau
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
