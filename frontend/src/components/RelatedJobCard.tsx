import { Link, useNavigate } from 'react-router-dom';
import { Job } from '@/data/mockData';
import { MapPin, Heart, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import axiosClient from '@/services/axiosClient';
import { toast } from 'react-toastify';

interface RelatedJobCardProps {
  job: Job;
  onMouseEnter?: (jobId: number, event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: () => void;
}

export default function RelatedJobCard({ job, onMouseEnter, onMouseLeave }: RelatedJobCardProps) {
  const company = (job as any).Company;
  const firstLocation = (job as any).locations?.[0];
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if job status on component mount
  useEffect(() => {
    setIsSaved(job.isSaved || false);
    setIsApplied(job.isApplied || false);
  }, [job.isSaved, job.isApplied]);

  const [isApplied, setIsApplied] = useState(job.isApplied || false);
  const [isCancelling, setIsCancelling] = useState(false);

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
        jobId: job.id,
      });
      const data = response.data;

      if (data.errCode === 0) {
        setIsSaved(!isSaved);
        toast.success(isSaved ? 'Job removed from saved list' : 'Job saved successfully');
      } else {
        toast.error('Error saving job: ' + data.errMessage);
      }
    } catch (error) {
      toast.error('An error occurred while saving the job.');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelApply = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    
    setIsCancelling(true);
    try {
      const response = await axiosClient.delete('/api/jobs/cancel-apply', {
        data: { jobId: job.id }
      });
      if (response.data.errCode === 0) {
        setIsApplied(false);
        toast.success('Hủy ứng tuyển thành công');
      } else {
        toast.error(response.data.errMessage || 'Lỗi khi hủy ứng tuyển');
      }
    } catch (error) {
      toast.error('Lỗi hệ thống khi hủy ứng tuyển');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onMouseEnter) {
      onMouseEnter(job.id, e);
    }
  };

  const handleMouseLeave = () => {
    if (onMouseLeave) {
      onMouseLeave();
    }
  };

  return (
    <Card
      className="group border-2 border-slate-200 hover:border-black p-3 hover:shadow-xl transition-all bg-white"
      onClick={() => navigate(`/jobs/${job.id}`)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex gap-3">
        {/* Logo - Left */}
        <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border-2 border-black overflow-hidden">
          {company?.logo ? (
            <img 
              src={company.logo} 
              alt={company.name} 
              className="w-full h-full object-contain p-1"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64?text=Logo';
              }}
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-slate-300 to-slate-400 rounded"></div>
          )}
        </div>

        {/* Content - Middle */}
        <div className="flex-1 min-w-0">
          {/* Title & Salary */}
          <div className="flex items-start justify-between gap-3 mb-1">
            <div className="flex-1">
              <Link to={`/jobs/${job.id}`} className="font-bold text-slate-900 text-sm line-clamp-2 hover:text-slate-700 group-hover:underline block flex items-center">
                {job.title}
                <CheckCircle className="w-3.5 h-3.5 text-black ml-1.5 flex-shrink-0" />
              </Link>
            </div>
            <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-900 font-bold text-xs rounded flex-shrink-0 whitespace-nowrap">
              {job.salary}
            </span>
          </div>

          {/* Company */}
          <div className="mb-2">
            <Link
              to={`/companies/${company?.id ?? job.companyId}`}
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-slate-600 font-medium flex items-center hover:text-slate-900 hover:underline"
            >
              {company?.name || 'Công ty'}
              <CheckCircle className="w-3 h-3 text-black ml-1 flex-shrink-0" />
            </Link>
          </div>

          {/* Location */}
          <div className="flex items-center gap-4 mb-3 pb-2">
            <span className="text-xs text-slate-700 font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
              {firstLocation?.name || 'Chưa xác định'}
            </span>
          </div>

          {/* Heart Button */}
          <div className="flex items-center justify-end gap-2">
            <button 
              onClick={(e) => {
                if (isApplied) {
                  handleCancelApply(e);
                } else {
                  navigate(`/jobs/${job.id}`);
                }
              }}
              disabled={isCancelling}
              className={`hidden group-hover:flex h-8 items-center justify-center px-3 text-xs font-semibold rounded transition-colors ${
                isApplied 
                  ? "bg-rose-500 hover:bg-rose-600 text-white" 
                  : "bg-black text-white hover:bg-slate-800"
              }`}
            >
              {isApplied ? 'Hủy ứng tuyển' : 'Ứng tuyển'}
            </button>
            <button 
              onClick={handleSaveJob}
              disabled={isLoading}
              className={`w-8 h-8 flex items-center justify-center rounded-full border border-black hover:bg-slate-200 transition-colors ${isSaved ? 'bg-slate-900' : ''}`}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-white text-white' : 'text-black'}`} />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
