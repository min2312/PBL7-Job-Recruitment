import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle, Clock, AlertCircle, ThumbsUp, ThumbsDown, MapPin } from 'lucide-react';
import JobNeedsBanner from '@/components/JobNeedsBanner';
import axiosClient from '@/services/axiosClient';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

type ApplicationStatus = 'all' | 'pending' | 'interview' | 'approved' | 'rejected';

const applicationTabs = [
  { id: 'all', label: 'Tất cả', icon: null, tooltip: '' },
  { id: 'pending', label: 'Tiếp nhận', icon: CheckCircle, tooltip: 'NTD đã nhận được CV' },
  { id: 'interview', label: 'Mời phỏng vấn', icon: Clock, tooltip: 'NTD mời bạn tham gia phỏng vấn' },
  { id: 'approved', label: 'Phù hợp', icon: ThumbsUp, tooltip: 'NTD đánh giá CV của bạn "Phù hợp"' },
  { id: 'rejected', label: 'Chưa phù hợp', icon: ThumbsDown, tooltip: 'NTD đánh giá CV của bạn "Chưa phù hợp"' },
] as const;

export default function ApplicationsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<ApplicationStatus>('all');
  const [applications, setApplications] = useState<any[]>([]);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchApplications = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await axiosClient.get('/api/my-applications');
      if (res.data.errCode === 0) {
        setApplications(res.data.data);
      }
    } catch (error) {
      console.error('Fetch applications error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchApplications();
  }, [location.pathname, user]);

  // Mock: Chưa có ứng tuyển nào
  const hasApplications = applications.length > 0;

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-slate-100 text-slate-900 border-slate-200';
      case 'interview':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'approved':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Đã tiếp nhận';
      case 'interview': return 'Mời phỏng vấn';
      case 'approved': return 'Đã chấp nhận';
      case 'rejected': return 'Chưa phù hợp';
      default: return status;
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
                    <Card key={app.id} className="border border-slate-200 p-4 hover:shadow-md transition-all group cursor-pointer" onClick={() => navigate(`/jobs/${app.Job?.id}`)}>
                      <div className="flex gap-4">
                        {/* Logo */}
                        <div className="w-16 h-16 bg-white rounded-lg flex-shrink-0 flex items-center justify-center border border-slate-200 overflow-hidden shadow-sm group-hover:border-slate-400 transition-colors">
                          <img 
                            src={app.Job?.Company?.logo || 'https://via.placeholder.com/64?text=Logo'} 
                            alt={app.Job?.Company?.name} 
                            className="w-full h-full object-contain p-1"
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex-1">
                              <h3 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-emerald-600 transition-colors">{app.Job?.title}</h3>
                              <p className="text-sm text-slate-600 font-medium">{app.Job?.Company?.name}</p>
                            </div>
                            <Badge className={`${getStatusBadgeColor(app.status)} border shadow-sm`}>
                              {getStatusLabel(app.status)}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-6 text-xs text-slate-600 mb-2">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {app.Job?.locations?.[0]?.name || 'Chưa xác định'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Ứng tuyển: {app.createdAt ? format(new Date(app.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi }) : '...'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500 italic">Cập nhật: {app.updatedAt ? format(new Date(app.updatedAt), 'dd/MM/yyyy HH:mm', { locale: vi }) : '...'}</span>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="h-8 px-4 text-xs font-bold border-slate-900 hover:bg-slate-900 hover:text-white transition-all"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/jobs/${app.Job?.id}`);
                              }}
                            >
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
