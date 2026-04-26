import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Search } from 'lucide-react';
import JobNeedsBanner from '@/components/JobNeedsBanner';
import JobCard from '@/components/JobCard';
import NumberedPagination from '@/components/NumberedPagination';
import { useAuth } from '@/hooks/useAuth';
import axiosClient from '@/services/axiosClient';

export default function SavedJobsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const currentPage = parseInt(searchParams.get('page') || '1');
  const pageSize = 10;

  const fetchSavedJobs = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const res = await axiosClient.get('/api/jobs/saved', {
        params: { 
          userId: user.id,
          page: currentPage,
          limit: pageSize
        }
      });
      if (res.data.errCode === 0) {
        setSavedJobs(res.data.data.jobs);
        setTotal(res.data.data.total);
      }
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchSavedJobs();
  }, [user, currentPage]);

  const handlePageChange = (page: number) => {
    setSearchParams({ page: page.toString() });
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <JobNeedsBanner onUpdateClick={() => navigate('/login')} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Việc làm đã lưu</h1>
            <p className="text-slate-500 mt-1">Danh sách các công việc bạn đã lưu lại để ứng tuyển sau</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm text-sm font-bold text-slate-700">
            {savedJobs.length} Việc làm
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-black rounded-full animate-spin mb-4"></div>
            <p className="font-medium text-slate-500">Đang tải danh sách...</p>
          </div>
        ) : savedJobs.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-2xl border border-slate-200 shadow-sm px-6">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-slate-300" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Bạn chưa lưu việc làm nào</h2>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">
              Lưu lại các việc làm hấp dẫn để dễ dàng theo dõi và ứng tuyển bất cứ lúc nào.
            </p>
            <Button 
              className="bg-black hover:bg-slate-800 text-white rounded-xl px-8 py-6 font-bold"
              onClick={() => navigate('/job-search')}
            >
              Tìm kiếm việc làm ngay
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {savedJobs.map((job) => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  variant="list" 
                  onSaveToggle={fetchSavedJobs}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex justify-center">
                <NumberedPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
