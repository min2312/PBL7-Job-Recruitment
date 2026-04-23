import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, Laptop, CheckCircle } from 'lucide-react';
import JobNeedsBanner from '@/components/JobNeedsBanner';
import { jobs, getCompanyById, getLocationById } from '@/data/mockData';
import { getRelatedJobsForMultipleJobs } from '@/utils/jobSimilarity';

export default function SavedJobsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Mock saved jobs - use first 2 jobs as example
  const savedJobs = jobs.slice(0, 2).map(job => ({
    ...job,
    savedDate: '17/04/2026 - 12:13'
  }));

  useEffect(() => {
    window.scrollTo(0, 0);
    // Trigger any data refresh logic here when page is loaded/reloaded
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Job Needs Banner */}
      <JobNeedsBanner onUpdateClick={() => navigate('/login')} />

      <div className="container max-w-6xl mx-auto py-12">
        {savedJobs.length === 0 && (
          <h1 className="text-3xl font-bold text-slate-900 mb-8">Việc làm đã lưu</h1>
        )}

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
                  className="bg-black hover:bg-slate-800 text-white font-bold px-8 py-3 rounded-full"
                  onClick={() => navigate('/')}
                >
                  Tìm việc ngay →
                </Button>
              </Card>
            </div>

            {/* Promotional Section - Right */}
            <div className="lg:col-span-1">
              <Card className="p-6 border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
                {/* Decorative dots */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-200 rounded-full opacity-20 -mr-16 -mt-16"></div>
                
                <div className="relative z-10">
                  {/* Title */}
                  <h3 className="text-xl font-bold text-slate-900 mb-2">CV "Hỏi" Trên Tay</h3>
                  <p className="text-sm text-slate-800 mb-6">Apply Ngay Việc Hot</p>

                  {/* Description */}
                  <p className="text-xs text-slate-700 mb-4 leading-relaxed">
                    Nền tảng tạo CV online hàng đầu Việt Nam
                  </p>

                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <span className="text-xs text-slate-900 font-medium">25 mẫu CV chuyên nghiệp</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <span className="text-xs text-slate-900 font-medium">Chuẩn theo ngành nghề</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <span className="text-xs text-slate-900 font-medium">Xuất PDF, doc dễ dàng</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button 
                    className="w-full bg-black hover:bg-slate-800 text-white font-bold text-sm py-2"
                  >
                    Xem ngay
                  </Button>
                </div>
              </Card>

              {/* Info Cards */}
              <div className="mt-4 space-y-3">
                <div className="bg-white rounded-lg p-4 border border-slate-200 flex items-center gap-3">
                  <Laptop className="w-5 h-5 text-black flex-shrink-0" />
                  <span className="text-xs text-slate-700">Gợi ý công việc</span>
                </div>
                <div className="bg-white rounded-lg p-4 border border-slate-200 flex items-center gap-3">
                  <Heart className="w-5 h-5 text-black flex-shrink-0" />
                  <span className="text-xs text-slate-700">0 Việc đã lưu</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Show saved jobs when they exist
          <>
            {/* Saved Jobs Section */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Danh sách {savedJobs.length} việc làm đã lưu
              </h2>
              
              <div className="space-y-4">
                {savedJobs.map((job) => {
                  const company = getCompanyById(job.companyId);
                  const firstLocation = job.locationIds[0] ? getLocationById(job.locationIds[0]) : null;
                  
                  return (
                    <Card key={job.id} className="border-2 border-slate-200 hover:border-black p-5 hover:shadow-xl transition-all bg-slate-100">
                      <div className="flex gap-4">
                        {/* Company Logo */}
                        <div className="flex-shrink-0">
                          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center border-4 border-black flex-shrink-0">
                            <div className="w-16 h-16 bg-gradient-to-br from-gray-600 to-slate-700 rounded-lg"></div>
                          </div>
                        </div>

                        {/* Job Details */}
                        <div className="flex-1">
                          {/* Header: Title, Company, Salary */}
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1">
                              <h3 className="text-base font-bold text-slate-900 mb-1">
                                {job.title}
                                {job.title.includes('Content Marketing') && <CheckCircle className="w-4 h-4 text-black inline ml-2" />}
                                {job.title.includes('Developer') && <CheckCircle className="w-4 h-4 text-black inline ml-2" />}
                              </h3>
                              <p className="text-xs text-slate-500 font-medium">{company?.name}</p>
                            </div>
                            <span className="inline-block px-3 py-1 bg-slate-100 text-slate-900 font-bold text-sm rounded flex-shrink-0 whitespace-nowrap">
                              {job.salary}
                            </span>
                          </div>

                          {/* Location & Experience */}
                          <div className="flex items-center gap-6 mb-4 pb-3">
                            <span className="text-xs text-slate-700 font-medium">
                              {firstLocation?.name || 'Chưa xác định'}
                            </span>
                            <span className="text-xs text-slate-700 font-medium">
                              {job.experience}
                            </span>
                          </div>

                          {/* Footer: Saved Date & Action Buttons */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">
                              Đã lưu: {(job as any).savedDate}
                            </span>
                            <div className="flex items-center gap-3">
                              <button className="w-8 h-8 flex items-center justify-center rounded-full border border-black hover:bg-slate-200 transition-colors">
                                <Heart className="w-4 h-4 text-black fill-black" />
                              </button>
                              <span className="text-xs text-slate-700 font-medium">Cập nhật 12 phút trước</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Similar Jobs Section */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Việc làm tương tự việc bạn đã lưu
              </h2>
              
              <div className="space-y-4">
                {getRelatedJobsForMultipleJobs(savedJobs, jobs).map((job) => {
                  const company = getCompanyById(job.companyId);
                  const firstLocation = job.locationIds[0] ? getLocationById(job.locationIds[0]) : null;
                  
                  return (
                    <Card key={job.id} className="border-2 border-slate-200 hover:border-black p-3 hover:shadow-xl transition-all bg-white">
                      <div className="flex gap-3">
                        {/* Company Logo */}
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center border-2 border-black flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg"></div>
                          </div>
                        </div>

                        {/* Job Details */}
                        <div className="flex-1">
                          {/* Header: Title & Salary */}
                          <div className="flex items-start justify-between gap-3 mb-1">
                            <div className="flex-1">
                              <h3 className="text-sm font-bold text-slate-900 mb-0.5 flex items-center">
                                {job.title}
                                <CheckCircle className="w-3.5 h-3.5 text-black ml-1.5 flex-shrink-0" />
                              </h3>
                            </div>
                            <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-900 font-bold text-xs rounded flex-shrink-0 whitespace-nowrap">
                              {job.salary}
                            </span>
                          </div>

                          {/* Company with checkmark */}
                          <div className="mb-2">
                            <p className="text-xs text-slate-600 font-medium flex items-center">
                              {company?.name}
                              <CheckCircle className="w-3 h-3 text-black ml-1 flex-shrink-0" />
                            </p>
                          </div>

                          {/* Location & Experience */}
                          <div className="flex items-center gap-4 mb-3 pb-2">
                            <span className="text-xs text-slate-700 font-medium">
                              {firstLocation?.name || 'Chưa xác định'}
                            </span>
                            <span className="text-xs text-slate-700 font-medium">
                              {job.experience}
                            </span>
                          </div>

                          {/* Footer: Action Buttons */}
                          <div className="flex items-center justify-end">
                            <div className="flex items-center gap-2">
                              <button className="w-7 h-7 flex items-center justify-center rounded-full border border-black hover:bg-slate-200 transition-colors">
                                <Heart className="w-3.5 h-3.5 text-black" />
                              </button>
                              <span className="text-xs text-slate-700 font-medium">Cập nhật 12 phút trước</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
