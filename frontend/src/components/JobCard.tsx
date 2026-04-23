import { Link, useNavigate } from 'react-router-dom';
import { Job, getCompanyById, getCategoryById, getLocationById } from '@/data/mockData';
import { MapPin, Clock, Briefcase, Bookmark, DollarSign, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface JobCardProps {
  job: Job;
  onMouseEnter?: (jobId: number, event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: () => void;
  variant?: 'grid' | 'list'; // grid for TopJobsList, list for others
}

export default function JobCard({ job, onMouseEnter, onMouseLeave, variant = 'grid' }: JobCardProps) {
  const company = getCompanyById(job.companyId);
  const firstCategory = job.categoryIds[0] ? getCategoryById(job.categoryIds[0]) : null;
  const firstLocation = job.locationIds[0] ? getLocationById(job.locationIds[0]) : null;
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if job is saved on component mount
  useEffect(() => {
    if (user?.id) {
      checkJobSaved();
    }
  }, [job.id, user?.id]);

  const checkJobSaved = async () => {
    try {
      const response = await fetch(`/api/jobs/check-saved?jobId=${job.id}`, {
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
      // Redirect to login if not authenticated
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
        body: JSON.stringify({ jobId: job.id }),
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

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onMouseEnter) {
      onMouseEnter(job.id, e);
    }
  };

  if (variant === 'grid') {
    // Grid variant for TopJobsList
    return (
      <Card
        className="p-4 border-2 border-slate-200 hover:border-black hover:shadow-lg transition-all cursor-pointer group h-[140px] flex flex-col overflow-hidden"
        onClick={() => navigate(`/jobs/${job.id}`)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="flex gap-3 mb-3 flex-shrink-0">
          <div className="w-14 h-14 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-200">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-300 to-slate-400 rounded-lg"></div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <Link to={`/jobs/${job.id}`} className="font-semibold text-slate-900 text-sm line-clamp-2 hover:text-slate-700 group-hover:underline block">
                  {job.title}
                </Link>
                <Link
                  to={`/companies/${company?.id ?? job.companyId}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs text-slate-600 mt-1 line-clamp-1 font-medium hover:text-slate-900 hover:underline inline-block"
                >
                  {company?.name || job.companyId}
                </Link>
              </div>
            </div>
          </div>
          <button
            onClick={handleSaveJob}
            disabled={isLoading}
            className={`w-8 h-8 flex items-center justify-center rounded-full border border-black hover:bg-slate-200 transition-colors flex-shrink-0 ${isSaved ? 'bg-slate-900' : ''}`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-white text-white' : 'text-black'}`} />
          </button>
        </div>

        {/* Salary, Location and Experience */}
        <div className="flex items-center justify-between gap-2 mt-auto">
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-900 text-xs font-bold px-2 py-1 rounded-full border border-slate-200">
            <DollarSign className="w-3 h-3" />
            {job.salary}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-600 line-clamp-1">
            <MapPin className="w-4 h-4 flex-shrink-0 text-slate-500" />
            {firstLocation?.name || 'Chưa xác định'}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-600">
            <Clock className="w-4 h-4 flex-shrink-0 text-slate-500" />
            1 năm
          </span>
        </div>
      </Card>
    );
  }

  // Default variant (list/detailed)
  return (
    <div className="block group" onClick={() => navigate(`/jobs/${job.id}`)}>
      <div className="relative bg-card rounded-lg border border-border p-5 transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5">
        <button
          className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <Bookmark className="w-5 h-5" />
        </button>

        <div className="flex gap-4">
          <div className="w-14 h-14 rounded-lg bg-muted flex-shrink-0 overflow-hidden border border-border">
            {company?.logo && (
              <img
                src={company.logo}
                alt={company.name}
                className="w-full h-full object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <Link
              to={`/jobs/${job.id}`}
              className="font-heading font-semibold text-foreground group-hover:text-primary transition line-clamp-1 group-hover:underline"
            >
              {job.title}
            </Link>
            <Link
              to={`/companies/${company?.id ?? job.companyId}`}
              onClick={(e) => e.stopPropagation()}
              className="text-sm text-muted-foreground mt-1 line-clamp-1 hover:text-foreground hover:underline inline-block"
            >
              {company?.name}
            </Link>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge className="bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
            {job.salary}
          </Badge>
          {firstLocation && (
            <Badge variant="outline" className="text-xs font-normal gap-1">
              <MapPin className="w-3 h-3" />
              {firstLocation.name}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs font-normal gap-1">
            <Clock className="w-3 h-3" />
            {job.experience}
          </Badge>
        </div>

        <div className="mt-3 flex items-center justify-between">
          {firstCategory && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Briefcase className="w-3 h-3" />
              {firstCategory.name}
            </span>
          )}
          <span className="text-xs text-muted-foreground">{job.createdAt}</span>
        </div>
      </div>
    </div>
  );
}
