import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MapPin, Briefcase, Users, Globe, Heart, Share2, Phone, Mail, ArrowLeft, Plus, Search, Copy, Facebook, Twitter, Linkedin, ChevronDown } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import JobCard from '@/components/JobCard';
import JobNeedsBanner from '@/components/JobNeedsBanner';
import { useAuth } from '@/hooks/useAuth';
import axiosClient from '@/services/axiosClient';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { toast } from 'react-toastify';

// JobSaveButton component for reusable save functionality
function JobSaveButton({ jobId, isSaved }: { jobId: number; isSaved: boolean }) {
  const [isSavedState, setIsSavedState] = useState(isSaved);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleSaveJob = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user?.id) {
      window.location.href = '/login';
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosClient.post('/api/jobs/save', {
        userId: user.id,
        jobId: jobId
      });
      const data = response.data;
      
      if (data.errCode === 0) {
        setIsSavedState(!isSavedState);
        toast.success(isSavedState ? 'Job removed from saved list' : 'Job saved successfully');
      } else {
        console.error('Error saving job:', data.errMessage);
        toast.error('Error saving job: ' + data.errMessage);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while saving the job.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleSaveJob}
      disabled={isLoading}
      className={`w-8 h-8 flex items-center justify-center rounded-full border border-black hover:bg-slate-200 transition-colors flex-shrink-0 ${isSaved ? 'bg-slate-900' : ''}`}
    >
      <Heart className={`w-4 h-4 ${isSavedState ? 'fill-white text-white' : 'text-black'}`} />
    </button>
  );
}

export default function CompanyDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSaved, setIsSaved] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [company, setCompany] = useState<any>(location.state?.company || null);
  const [companyJobs, setCompanyJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentJobPage, setCurrentJobPage] = useState(1);
  const [totalJobPages, setTotalJobPages] = useState(1);
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [jobLocation, setJobLocation] = useState('Tất cả tỉnh/thành phố');
  const [submittedJobSearch, setSubmittedJobSearch] = useState('');
  const [submittedJobLocation, setSubmittedJobLocation] = useState('Tất cả tỉnh/thành phố');
  const [locations, setLocations] = useState<any[]>([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axiosClient.get('/api/locations');
        if (response.data.errCode === 0) {
          setLocations(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };
    fetchLocations();
  }, []);

  const locationOptions = useMemo(
    () => [
      { value: "Tất cả tỉnh/thành phố", label: "Tất cả tỉnh/thành phố" },
      ...locations.map((loc) => ({ value: loc.name, label: loc.name })),
    ],
    [locations],
  );
 
  useEffect(() => {
    const fetchCompanyData = async () => {
      setIsLoading(true);
      try {
        if (!company) {
          const compRes = await axiosClient.get(`/api/companies/${id}`);
          if (compRes.data.errCode === 0) {
            setCompany(compRes.data.data);
          }
        }

        const jobsRes = await axiosClient.get(`/api/jobs/company/${id}`, {
          params: { page: currentJobPage, limit: 10, search: submittedJobSearch, location: submittedJobLocation, userId: user?.id }
        });
        const jobsData = jobsRes.data;
        if (jobsData.errCode === 0 && jobsData.data && jobsData.data.jobs) {
          setCompanyJobs(jobsData.data.jobs);
          setTotalJobPages(Math.ceil(jobsData.data.total / 10) || 1);
        } else if (jobsData.errCode === 0 && Array.isArray(jobsData.data)) {
          setCompanyJobs(jobsData.data);
          setTotalJobPages(Math.ceil(jobsData.data.length / 10) || 1);
        }
      } catch (error) {
        console.error('Error fetching company details:', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchCompanyData();
  }, [id, currentJobPage, submittedJobSearch, submittedJobLocation, user]);

  // Scroll to top when company id changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-lg text-slate-500">Đang tải thông tin công ty...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Công ty không tồn tại</h1>
            <Button 
              onClick={() => navigate('/companies')}
              className="bg-black hover:bg-slate-800 text-white px-6 py-2 rounded-lg"
            >
              Quay lại danh sách công ty
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">

      {/* Job Needs Banner */}
      <JobNeedsBanner />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-24 py-3">
          <div className="flex items-center gap-2 text-sm">
            <button 
              onClick={() => navigate('/companies')}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Danh sách Công ty
            </button>
            <span className="text-slate-400">›</span>
            <span className="text-slate-600">Thông tin công ty & tin tuyển dụng từ {company.name}</span>
          </div>
        </div>
      </div>

      {/* Hero Section with Company Header */}
      <div 
        className="relative bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1586996694871-f6bc61ba6a44?w=1600&h=400&fit=crop")',
          minHeight: '340px'
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/40"></div>

        {/* Main Hero Container */}
        <div className="relative py-12 h-full flex items-center">
          <div className="w-full max-w-7xl mx-auto px-24">
            <div className="w-full flex items-center justify-between gap-12">
              {/* Left: Company Logo */}
              <div className="flex-shrink-0">
                <div className="w-40 h-40 bg-white rounded-2xl border-4 border-white flex items-center justify-center overflow-hidden shadow-2xl">
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=Logo';
                    }}
                  />
                </div>
              </div>

              {/* Center: Company Information */}
              <div className="flex-1">
                {/* Company Name */}
                <h1 className="text-2xl font-bold text-white mb-4 leading-tight">
                  {company.name}
                </h1>

                {/* Key Info Grid */}
                <div className="flex items-center gap-8 flex-wrap">
                  {/* Website */}
                  {company.website_url && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-white" />
                      <a
                        href={company.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-white hover:underline font-medium"
                      >
                        {company.website_url.replace('https://', '').replace('http://', '')}
                      </a>
                    </div>
                  )}

                  {/* Employees */}
                  {company.company_scale && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-white" />
                      <span className="text-sm text-white font-medium">{company.company_scale}</span>
                    </div>
                  )}

                  {/* Followers */}
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-white" />
                    <span className="text-sm text-white font-medium">2404 người theo dõi</span>
                  </div>
                </div>
              </div>

              {/* Right: Follow Button */}
              <div className="flex-shrink-0">
                <Button
                  onClick={() => setIsSaved(!isSaved)}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-white text-slate-900 hover:bg-slate-100 transition-all shadow-lg hover:shadow-xl whitespace-nowrap"
                >
                  <Plus className="w-5 h-5" />
                  {isSaved ? 'Đang theo dõi' : 'Theo dõi công ty'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Gradient Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-24 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Company Description */}
            <div className="mb-12">
              <div className="bg-gradient-to-r from-slate-900 to-slate-600 text-white px-6 py-2 rounded-t-lg font-bold text-base mb-0">
                Giới thiệu công ty
              </div>
              <div className="bg-slate-50 rounded-b-lg p-6 border border-slate-200">
                <p className={`text-slate-700 leading-relaxed whitespace-pre-line ${!isDescriptionExpanded ? 'line-clamp-3' : ''}`}>
                  {company.description || 'Công ty chuyên cung cấp giải pháp tuyên dụng hàng đầu tại Việt Nam. Với mục tiêu kết nối nhân tài với cơ hội việc làm tốt nhất, chúng tôi đã phục vụ hàng ngàn ứng viên và nhà tuyển dụng.'}
                </p>
                <button 
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="text-slate-500 text-sm font-medium mt-2 hover:text-slate-700 transition-colors"
                >
                  {isDescriptionExpanded ? 'Thu gọn ▲' : 'Xem thêm ▼'}
                </button>
              </div>
            </div>

            {/* Rating Section */}
            <div className="mb-12">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Bạn thấy độ tin cậy & rõ ràng của thông tin công ty này thế nào?</h3>
              <div className="grid grid-cols-5 gap-4">
                {[
                  { label: 'Không đáng tin cậy\n& rõ ràng', icon: '😢' },
                  { label: 'Ít đáng tin cậy\n& rõ ràng', icon: '😕' },
                  { label: 'Bình thường', icon: '😐' },
                  { label: 'Đáng tin cậy\n& rõ ràng', icon: '🙂' },
                  { label: 'Rất đáng tin cậy\n& rõ ràng', icon: '😍' }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-all group"
                  >
                    <div className="text-3xl transition-all duration-300 group-hover:grayscale-0 group-hover:scale-125 group-hover:rotate-12 grayscale drop-shadow-sm group-hover:drop-shadow-lg">{item.icon}</div>
                    <p className="text-xs text-slate-600 text-center whitespace-pre-line group-hover:text-slate-900 transition-colors">{item.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Recruitment Section */}
            <div>
              <div className="bg-gradient-to-r from-slate-900 to-slate-600 text-white px-6 py-2 rounded-t-lg font-bold text-base mb-0">
                Tuyển dụng
              </div>
              <div className="bg-slate-50 rounded-b-lg p-6 border border-slate-200">
                {/* Search Bar */}
                <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-3 rounded-xl border-2 border-slate-200 shadow-sm">
                  {/* Search Input */}
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-transparent focus-within:border-slate-900 focus-within:bg-white transition-all group">
                    <Search className="w-5 h-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                    <input
                      type="text"
                      placeholder="Tên công việc, vị trí ứng tuyển..."
                      value={jobSearchQuery}
                      onChange={(e) => setJobSearchQuery(e.target.value)}
                      className="flex-1 outline-none text-sm text-slate-700 placeholder-slate-400 bg-transparent font-medium"
                    />
                  </div>

                  {/* Location Select */}
                  <SearchableSelect
                    value={jobLocation}
                    onValueChange={setJobLocation}
                    options={locationOptions}
                    placeholder="Tất cả tỉnh/thành phố"
                    searchPlaceholder="Tìm tỉnh/thành phố..."
                    icon={<MapPin className="w-4 h-4" />}
                  />

                  {/* Search Button */}
                  <button 
                    onClick={() => {
                      setCurrentJobPage(1);
                      setSubmittedJobSearch(jobSearchQuery);
                      setSubmittedJobLocation(jobLocation);
                    }}
                    className="px-8 py-2.5 bg-black text-white rounded-lg font-bold text-sm hover:bg-slate-800 transition-all shadow-md whitespace-nowrap"
                  >
                    Tìm kiếm
                  </button>
                </div>

                {companyJobs.length > 0 ? (
                  <>
                    {/* Job Cards */}
                    <div className="space-y-3">
                      {companyJobs.map(job => (
                        <div
                          key={job.id}
                          className="bg-white rounded-lg p-4 border border-slate-200 hover:border-slate-300 hover:bg-slate-100 transition-all group cursor-pointer"
                          onClick={() => navigate(`/jobs/${job.id}`)}
                        >
                          <div className="flex items-start gap-4">
                            {/* Logo */}
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden border border-slate-300">
                                <img
                                  src={company.logo}
                                  alt={company.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/50?text=Logo';
                                  }}
                                />
                              </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              {/* Job Title with Salary */}
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <div
                                  className="font-bold text-slate-900 text-sm line-clamp-1 hover:text-slate-700 group-hover:underline"
                                >
                                  {job.title}
                                </div>
                                <span className="text-sm font-bold text-black whitespace-nowrap">
                                  {job.salary || 'Thoả thuận'}
                                </span>
                              </div>

                              {/* Company Name */}
                              <p className="text-slate-600 text-xs mb-2 line-clamp-1 flex items-center gap-1">
                                <span className="w-4 h-4 flex items-center justify-center bg-teal-600 text-white rounded-full text-[10px]">✓</span>
                                {company.name}
                              </p>

                              {/* Tags */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                                  {job.locations?.map((location: any) => location.name).join(', ') || 'Chưa xác định'}
                                </span>
                                {job.experience && (
                                  <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                                    {job.experience}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex-shrink-0 flex items-center gap-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/jobs/${job.id}`);
                                }}
                                className="px-4 py-2 bg-black text-white rounded-lg font-semibold text-sm hover:bg-slate-800 transition-colors whitespace-nowrap"
                              >
                                Ứng tuyển
                              </button>
                              <JobSaveButton jobId={job.id} isSaved = {job.isSaved} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalJobPages > 1 && (
                      <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-slate-200">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentJobPage(prev => Math.max(1, prev - 1))}
                          disabled={currentJobPage === 1}
                          className="px-4 py-2"
                        >
                          ← Trước
                        </Button>
                        <span className="text-sm font-semibold text-slate-700">
                          {currentJobPage}/{totalJobPages}
                        </span>
                        <Button
                          variant="outline"
                          onClick={() => setCurrentJobPage(prev => Math.min(totalJobPages, prev + 1))}
                          disabled={currentJobPage === totalJobPages}
                          className="px-4 py-2"
                        >
                          Tiếp →
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-white rounded-lg p-8 text-center">
                    <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600 font-medium">Hiện tại không có việc làm nào tại công ty này</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Info Card */}
            <div>
              <div className="bg-gradient-to-r from-slate-900 to-slate-600 text-white px-6 py-2 rounded-t-lg font-bold text-base mb-0">
                Thông tin liên hệ
              </div>
              <div className="bg-slate-50 rounded-b-lg p-6 border border-slate-200">
                {/* Địa chỉ công ty */}
                {company.company_address && (
                  <div className="mb-6">
                    <div className="flex items-start gap-3 mb-4">
                      <MapPin className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500 font-semibold mb-1">Địa chỉ công ty</p>
                        <p className="text-sm text-slate-700">{company.company_address}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Map Section */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    🗺️ Xem bản đồ
                  </h4>
                  <div className="w-full h-64 bg-slate-200 rounded-lg overflow-hidden border border-slate-300 shadow-inner">
                    {company.company_address ? (
                      <iframe
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        style={{ border: 0 }}
                        src={`https://www.google.com/maps?q=${encodeURIComponent(company.company_address)}&output=embed`}
                        allowFullScreen
                        title="Company Location"
                        loading="lazy"
                      ></iframe>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-slate-500 italic">Địa chỉ đang được cập nhật...</span>
                      </div>
                    )}
                  </div>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(company.company_address || '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 font-semibold text-sm mt-2 inline-block hover:underline"
                  >
                    Mở trong Maps ↗
                  </a>
                </div>
              </div>
            </div>

            {/* Share Company Section */}
            <div>
              <div className="bg-gradient-to-r from-slate-900 to-slate-600 text-white px-6 py-2 rounded-t-lg font-bold text-base mb-0">
                Chia sẻ công ty tới bạn bè
              </div>
              <div className="bg-slate-50 rounded-b-lg p-6 border border-slate-200 space-y-6">
                {/* Sao chép đường dẫn */}
                <div>
                  <h5 className="font-semibold text-slate-900 mb-3">Sao chép đường dẫn</h5>
                  <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-4 py-3">
                    <input
                      type="text"
                      value={`${window.location.origin}/companies/${company.id}`}
                      readOnly
                      className="flex-1 bg-transparent text-slate-600 text-sm outline-none truncate"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/companies/${company.id}`);
                        alert('Đã sao chép đường dẫn!');
                      }}
                      className="flex-shrink-0 p-2 hover:bg-slate-100 rounded transition-colors"
                      title="Sao chép"
                    >
                      <Copy className="w-5 h-5 text-slate-600" />
                    </button>
                  </div>
                </div>

                {/* Chia sẻ qua mạng xã hội */}
                <div>
                  <h5 className="font-semibold text-slate-900 mb-3">Chia sẻ qua mạng xã hội</h5>
                  <div className="flex gap-3">
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      title="Chia sẻ qua Facebook"
                    >
                      <Facebook className="w-5 h-5" />
                    </a>
                    <a
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(company.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors"
                      title="Chia sẻ qua Twitter"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                      title="Chia sẻ qua LinkedIn"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
