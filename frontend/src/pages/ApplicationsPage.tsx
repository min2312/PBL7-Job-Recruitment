import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle, Clock, AlertCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import JobNeedsBanner from '@/components/JobNeedsBanner';

type ApplicationStatus = 'all' | 'received' | 'viewed' | 'reviewed' | 'remind' | 'suitable' | 'unsuitable';

const applicationTabs = [
  { id: 'all', label: 'Tất cả', icon: null, tooltip: '' },
  { id: 'received', label: 'Tiếp nhận', icon: CheckCircle, tooltip: 'NTD đã nhận được CV' },
  { id: 'viewed', label: 'Đã xem', icon: Clock, tooltip: 'NTD đã xem hồ sơ' },
  { id: 'reviewed', label: 'Duyệt hồ số', icon: FileText, tooltip: 'Quá vòng sơ duyệt, phòng ban chuyên môn đang đánh giá CV' },
  { id: 'remind', label: 'Cần nhắc', icon: AlertCircle, tooltip: 'NTD đang cần nhắc CV của bạn một lần sau' },
  { id: 'suitable', label: 'Phù hợp', icon: ThumbsUp, tooltip: 'NTD đánh giá CV của bạn "Phù hợp", có thể được xem xét sang vòng sau' },
  { id: 'unsuitable', label: 'Chưa phù hợp', icon: ThumbsDown, tooltip: 'NTD đánh giá CV của bạn "Chưa phù hợp"' },
] as const;

export default function ApplicationsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedTab, setSelectedTab] = useState<ApplicationStatus>('all');
  const [applications, setApplications] = useState<any[]>([]);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Trigger any data refresh logic here when page is loaded/reloaded
  }, [location.pathname]);

  // Mock: Chưa có ứng tuyển nào
  const hasApplications = applications.length > 0;

  const getStatusBadgeColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'received':
        return 'bg-slate-100 text-slate-900 border-slate-200';
      case 'viewed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'reviewed':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'remind':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'suitable':
        return 'bg-slate-100 text-slate-900 border-slate-200';
      case 'unsuitable':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Job Needs Banner */}
      <JobNeedsBanner onUpdateClick={() => navigate('/login')} />

      <div className="container max-w-6xl mx-auto py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Việc làm đã ứng tuyển</h1>

        {/* Tabs - Outside and above card */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 pb-2">
            {applicationTabs.map(tab => (
              <div
                key={tab.id}
                className="relative"
                onMouseEnter={() => setHoveredTab(tab.id)}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <button
                  onClick={() => setSelectedTab(tab.id as ApplicationStatus)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedTab === tab.id
                      ? 'border-2 border-black text-black bg-white'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {tab.label}
                </button>
                
                {/* Tooltip */}
                {hoveredTab === tab.id && tab.tooltip && (
                  <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-slate-700 text-white text-xs rounded z-50 pointer-events-none whitespace-normal w-max max-w-[200px]">
                    <div className="text-center">{tab.tooltip}</div>
                    <div className="absolute left-1/2 transform -translate-x-1/2 top-full border-4 border-transparent border-t-slate-700 border-t-4"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {!hasApplications ? (
          <>
            {selectedTab === 'all' ? (
              // Keep original layout for "Tất cả" tab - centered
              <Card className="p-12 border-slate-200 flex flex-col items-center justify-center min-h-[400px]">
                {/* Empty Icon */}
                <div className="mb-6">
                  <div className="w-48 h-48 mx-auto relative">
                    <svg viewBox="0 0 200 200" className="w-full h-full">
                      {/* Document illustration */}
                      <rect x="60" y="40" width="80" height="120" rx="4" stroke="#cbd5e1" strokeWidth="2" fill="none" />
                      
                      {/* Lines on document */}
                      <line x1="70" y1="60" x2="130" y2="60" stroke="#cbd5e1" strokeWidth="2" />
                      <line x1="70" y1="75" x2="130" y2="75" stroke="#cbd5e1" strokeWidth="2" />
                      <line x1="70" y1="90" x2="120" y2="90" stroke="#cbd5e1" strokeWidth="2" />
                      
                      {/* Search symbol - magnifying glass */}
                      <circle cx="100" cy="130" r="20" stroke="#cbd5e1" strokeWidth="2" fill="none" />
                      <line x1="115" y1="145" x2="130" y2="160" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
                          
                      {/* Cute face inside */}
                      <circle cx="90" cy="125" r="1.5" fill="#cbd5e1" />
                      <circle cx="110" cy="125" r="1.5" fill="#cbd5e1" />
                      <path d="M 95 135 Q 100 140 105 135" stroke="#cbd5e1" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                {/* Empty Message */}
                <h2 className="text-2xl font-bold text-slate-900 mb-3 text-center">Bạn chưa ứng tuyển công việc nào!</h2>
                <p className="text-slate-600 text-center mb-8 max-w-sm">Hãy khám phá hàng ngàn công việc phù hợp và ứng tuyển ngay để tìm cơ hội nghề nghiệp lý tưởng.</p>

                {/* Action Button */}
                <Button 
                  size="lg"
                  className="bg-black hover:bg-slate-800 text-white font-bold px-8 py-3 rounded-full"
                  onClick={() => navigate('/')}
                >
                  Tìm việc ngay →
                </Button>
              </Card>
            ) : (
              // New layout for other tabs - centered
              <Card className="pt-6 px-12 pb-12 border-slate-200 flex flex-col items-center justify-center min-h-[400px]">
                {/* Info text on top left */}
                <p className="w-full text-sm text-slate-500 font-medium mb-2 text-left">
                  {applicationTabs.find(tab => tab.id === selectedTab)?.tooltip}
                </p>

                {/* Character Icon */}
                <div className="mb-6">
                  <div className="w-48 h-48 mx-auto relative">
                    <svg viewBox="0 0 200 200" className="w-full h-full">
                      {/* Character illustration */}
                      {/* Head */}
                      <circle cx="100" cy="60" r="25" stroke="#cbd5e1" strokeWidth="2.5" fill="none" />
                      
                      {/* Body */}
                      <path d="M 85 80 L 75 120 L 85 140 L 115 140 L 125 120 L 115 80 Z" stroke="#cbd5e1" strokeWidth="2.5" fill="none" />
                      
                      {/* Arms */}
                      <line x1="85" y1="90" x2="60" y2="95" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
                      <line x1="115" y1="90" x2="140" y2="95" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
                      
                      {/* Hands */}
                      <circle cx="60" cy="95" r="4" stroke="#cbd5e1" strokeWidth="2" fill="none" />
                      <circle cx="140" cy="95" r="4" stroke="#cbd5e1" strokeWidth="2" fill="none" />
                      
                      {/* Speech bubble */}
                      <ellipse cx="130" cy="45" rx="35" ry="30" stroke="#cbd5e1" strokeWidth="2.5" fill="none" />
                      <path d="M 110 70 L 98 85 L 115 75 Z" stroke="#cbd5e1" strokeWidth="2.5" fill="none" />
                      
                      {/* Chest mark */}
                      <rect x="92" y="100" width="16" height="12" stroke="#cbd5e1" strokeWidth="2" fill="#cbd5e1" />
                    </svg>
                  </div>
                </div>

                {/* Empty Message */}
                <h2 className="text-lg font-medium text-slate-400 mb-6 text-center">
                  Hiện tại không có công việc nào nằm trong danh sách này!
                </h2>

                {/* Action Button */}
                <Button 
                  size="lg"
                  className="bg-black hover:bg-slate-800 text-white font-bold px-8 py-3 rounded-full"
                  onClick={() => navigate('/')}
                >
                  Tìm việc ngay →
                </Button>
              </Card>
            )}
          </>
        ) : (
          // Show applications when they exist
          <div>
            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 pb-2">
              {applicationTabs.map(tab => (
                <div
                  key={tab.id}
                  className="relative"
                  onMouseEnter={() => setHoveredTab(tab.id)}
                  onMouseLeave={() => setHoveredTab(null)}
                >
                  <button
                    onClick={() => setSelectedTab(tab.id as ApplicationStatus)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                      selectedTab === tab.id
                        ? 'border-2 border-black text-black bg-white'
                        : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                  
                  {/* Tooltip */}
                  {hoveredTab === tab.id && tab.tooltip && (
                    <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-slate-700 text-white text-xs rounded z-50 pointer-events-none whitespace-normal w-max max-w-[200px]">
                      <div className="text-center">{tab.tooltip}</div>
                      <div className="absolute left-1/2 transform -translate-x-1/2 top-full border-4 border-transparent border-t-slate-700 border-t-4"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Filter applications by selected tab */}
            {(() => {
              const filteredApplications = selectedTab === 'all' 
                ? applications 
                : applications.filter(app => app.status === selectedTab);

              if (filteredApplications.length === 0 && selectedTab !== 'all') {
                // Show empty state when no applications for this tab
                return (
                  <Card className="pt-6 px-12 pb-12 border-slate-200 flex flex-col items-center justify-center min-h-[400px]">
                    {/* Info text on top left */}
                    <p className="w-full text-sm text-slate-500 font-medium mb-2 text-left">
                      {applicationTabs.find(tab => tab.id === selectedTab)?.tooltip}
                    </p>

                    {/* Character Icon */}
                    <div className="mb-6">
                      <div className="w-48 h-48 mx-auto relative">
                        <svg viewBox="0 0 200 200" className="w-full h-full">
                          {/* Character illustration */}
                          {/* Head */}
                          <circle cx="100" cy="60" r="25" stroke="#cbd5e1" strokeWidth="2.5" fill="none" />
                          
                          {/* Body */}
                          <path d="M 85 80 L 75 120 L 85 140 L 115 140 L 125 120 L 115 80 Z" stroke="#cbd5e1" strokeWidth="2.5" fill="none" />
                          
                          {/* Arms */}
                          <line x1="85" y1="90" x2="60" y2="95" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
                          <line x1="115" y1="90" x2="140" y2="95" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
                          
                          {/* Hands */}
                          <circle cx="60" cy="95" r="4" stroke="#cbd5e1" strokeWidth="2" fill="none" />
                          <circle cx="140" cy="95" r="4" stroke="#cbd5e1" strokeWidth="2" fill="none" />
                          
                          {/* Speech bubble */}
                          <ellipse cx="130" cy="45" rx="35" ry="30" stroke="#cbd5e1" strokeWidth="2.5" fill="none" />
                          <path d="M 110 70 L 98 85 L 115 75 Z" stroke="#cbd5e1" strokeWidth="2.5" fill="none" />
                          
                          {/* Chest mark */}
                          <rect x="92" y="100" width="16" height="12" stroke="#cbd5e1" strokeWidth="2" fill="#cbd5e1" />
                        </svg>
                      </div>
                    </div>

                    {/* Empty Message */}
                    <h2 className="text-lg font-medium text-slate-400 mb-6 text-center">
                      Hiện tại không có công việc nào nằm trong danh sách này!
                    </h2>

                    {/* Action Button */}
                    <Button 
                      size="lg"
                      className="bg-black hover:bg-slate-800 text-white font-bold px-8 py-3 rounded-full"
                      onClick={() => navigate('/')}
                    >
                      Tìm việc ngay →
                    </Button>
                  </Card>
                );
              }

              // Show applications list
              return (
                <div className="space-y-3">
                  {filteredApplications.map((app) => (
                    <Card key={app.id} className="border-2 border-black p-4 hover:shadow-lg transition-all">
                      <div className="flex gap-4">
                        {/* Logo */}
                        <div className="w-16 h-16 bg-slate-100 rounded-lg flex-shrink-0 flex items-center justify-center border border-slate-200">
                          <div className="w-12 h-12 bg-gradient-to-br from-slate-300 to-slate-400 rounded"></div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex-1">
                              <h3 className="font-bold text-slate-900 text-base line-clamp-1">{app.jobTitle}</h3>
                              <p className="text-xs text-slate-600 font-medium">{app.companyName}</p>
                            </div>
                            <Badge className={`${getStatusBadgeColor(app.status)} border`}>
                              {app.statusLabel}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-6 text-xs text-slate-600 mb-2">
                            <span>{app.location}</span>
                            <span>Ứng tuyển: {app.appliedDate}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-600">Cập nhật: {app.updatedDate}</span>
                            <Button variant="ghost" className="h-8 px-3 text-xs text-slate-700 hover:bg-slate-100">
                              Xem chi tiết
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
