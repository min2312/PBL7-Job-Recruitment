import { Link } from 'react-router-dom';
import { Job, getCompanyById, getLocationById } from '@/data/mockData';
import { MapPin, Heart } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface RelatedJobCardProps {
  job: Job;
  onMouseEnter?: (jobId: number, event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: () => void;
}

export default function RelatedJobCard({ job, onMouseEnter, onMouseLeave }: RelatedJobCardProps) {
  const company = getCompanyById(job.companyId);
  const firstLocation = job.locationIds[0] ? getLocationById(job.locationIds[0]) : null;

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
      className="p-4 border-2 border-slate-100 hover:border-slate-900 transition-all cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex gap-4">
        {/* Logo - Left */}
        <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-200 overflow-hidden">
          <div className="w-20 h-20 bg-gradient-to-br from-slate-300 to-slate-400 rounded"></div>
        </div>

        {/* Content - Middle */}
        <div className="flex-1 min-w-0">
          <Link to={`/jobs/${job.id}`} className="font-semibold text-slate-900 text-base line-clamp-2 hover:text-emerald-600 block">
            {job.title}
          </Link>
          <p className="text-xs text-slate-600 mt-1 line-clamp-1 font-medium">{company?.name || 'Công ty'}</p>
          
          {/* Salary Badge */}
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200 mt-2">
            💵 {job.salary}
          </span>

          {/* Location and Updated Time */}
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-600">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              {firstLocation?.name || 'Chưa xác định'}
            </span>
            <span className="text-slate-500">Cập nhật 2 tuần trước</span>
          </div>
        </div>

        {/* Action Buttons - Right */}
        <div className="flex flex-col items-end justify-between flex-shrink-0">
          <div></div>
          <button className="text-slate-900 hover:text-slate-700 transition-colors">
            <Heart className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} />
          </button>
        </div>
      </div>
    </Card>
  );
}
