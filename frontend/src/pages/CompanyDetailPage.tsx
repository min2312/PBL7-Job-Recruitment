import { useParams, useNavigate, Link } from 'react-router-dom';
import { companies, jobs } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { MapPin, Briefcase, Users, Globe, Heart, Share2, Phone, Mail, ArrowLeft, Plus, Search, Copy, Facebook, Twitter, Linkedin } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import JobCard from '@/components/JobCard';
import JobNeedsBanner from '@/components/JobNeedsBanner';
import { useAuth } from '@/hooks/useAuth';

// JobSaveButton component for reusable save functionality
function JobSaveButton({ jobId }: { jobId: number }) {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      checkJobSaved();
    }
  }, [jobId, user?.id]);

  const checkJobSaved = async () => {
    try {
      const response = await fetch(`/api/jobs/check-saved?jobId=${jobId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      const data = await response.json();
      if (data.errCode === 0) {
        setIsSaved(data.isSaved);
      }
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const handleSaveJob = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user?.id) {
      window.location.href = '/login';
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = isSaved ? '/api/jobs/unsave' : '/api/jobs/save';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId: jobId }),
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.errCode === 0) {
        setIsSaved(!isSaved);
      } else {
        console.error('Error saving job:', data.errMessage);
      }
    } catch (error) {
      console.error('Error:', error);
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
      <Heart className={`w-4 h-4 ${isSaved ? 'fill-white text-white' : 'text-black'}`} />
    </button>
  );
}

export default function CompanyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const companyId = Number(id);

  // Memoize company data
  const company = useMemo(
    () => companies.find(c => c.id === companyId),
    [companyId]
  ) as any;
  
  // Memoize company jobs
  const companyJobs = useMemo(
    () => jobs.filter(j => j.companyId === companyId),
    [companyId]
  );

  // Scroll to top when company id changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

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
                  {company.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-white" />
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-white hover:underline font-medium"
                      >
                        {company.website.replace('https://', '').replace('http://', '')}
                      </a>
                    </div>
                  )}

                  {/* Employees */}
                  {company.employees && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-white" />
                      <span className="text-sm text-white font-medium">{company.employees}</span>
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
                {companyJobs.length > 0 ? (
                  <>
                    {/* Search Bar */}
                    <div className="mb-6 flex items-center gap-3">
                      {/* Search Input */}
                      <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-200">
                        <Search className="w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Tên công việc, vị trị ứng tuyển..."
                          className="flex-1 outline-none text-sm text-slate-700 placeholder-slate-400 bg-transparent"
                        />
                      </div>

                      {/* Location Select */}
                      <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-200 min-w-max">
                        <MapPin className="w-5 h-5 text-slate-400" />
                        <select className="outline-none text-sm text-slate-900 bg-transparent font-medium">
                          <option>Tất cả tỉnh/thành phố</option>
                          <option>Hà Nội</option>
                          <option>Hồ Chí Minh</option>
                        </select>
                        {/* <span className="text-slate-400 text-xs">▼</span> */}
                      </div>

                      {/* Search Button */}
                      <button className="px-6 py-2 bg-black text-white rounded-lg font-semibold text-sm hover:bg-slate-800 transition-colors whitespace-nowrap">
                        Tìm kiếm
                      </button>
                    </div>

                    {/* Job Cards */}
                    <div className="space-y-3">
                      {companyJobs.slice(0, 3).map(job => (
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
                                <Link
                                  to={`/jobs/${job.id}`}
                                  className="font-bold text-slate-900 text-sm line-clamp-1 hover:text-slate-700 group-hover:underline"
                                >
                                  {job.title} ✓
                                </Link>
                                <span className="text-sm font-bold text-black whitespace-nowrap">8 - 10 triệu</span>
                              </div>

                              {/* Company Name */}
                              <p className="text-slate-600 text-xs mb-2 line-clamp-1 flex items-center gap-1">
                                <span className="w-4 h-4 flex items-center justify-center bg-teal-600 text-white rounded-full text-[10px]">✓</span>
                                {company.name}
                              </p>

                              {/* Tags */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                                  {company.address || 'Hà Nội'} (mới)
                                </span>
                                <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                                  Còn {Math.floor(Math.random() * 15) + 10} ngày để ứng tuyển
                                </span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex-shrink-0 flex items-center gap-2">
                              <button 
                                onClick={() => navigate(`/jobs/${job.id}`)}
                                className="px-4 py-2 bg-black text-white rounded-lg font-semibold text-sm hover:bg-slate-800 transition-colors whitespace-nowrap"
                              >
                                Ứng tuyển
                              </button>
                              <JobSaveButton jobId={job.id} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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
                {company.address && (
                  <div className="mb-6">
                    <div className="flex items-start gap-3 mb-4">
                      <MapPin className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500 font-semibold mb-1">Địa chỉ công ty</p>
                        <p className="text-sm text-slate-700">{company.address}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Map Section */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    🗺️ Xem bản đồ
                  </h4>
                  <div className="w-full h-48 bg-slate-200 rounded-lg flex items-center justify-center border border-slate-300">
                    <span className="text-slate-500">Bản đồ công ty</span>
                  </div>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(company.address || '')}`}
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
