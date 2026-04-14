import { Job, jobs } from '@/data/mockData';
import RelatedJobCard from './RelatedJobCard';
import JobPreviewPopup from './JobPreviewPopup';
import { useState, useRef, useEffect } from 'react';

interface RelatedJobsProps {
  currentJobId: number;
  currentJob: Job;
}

export default function RelatedJobs({ currentJobId, currentJob }: RelatedJobsProps) {
  const [hoveredJobId, setHoveredJobId] = useState<number | null>(null);
  const [previewPosition, setPreviewPosition] = useState<{ top: number; left: number } | null>(null);
  const [popupHovered, setPopupHovered] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Logic hiện tại: Tính điểm dựa trên category, location, level
   * Sau này: Thay bằng word2vec similarity
   */
  const relatedJobs = jobs
    .filter(j => j.id !== currentJobId)
    .map(j => {
      let score = 0;
      // Compare categories
      if (j.categoryIds.some(cid => currentJob.categoryIds.includes(cid))) score += 2;
      // Compare locations
      if (j.locationIds.some(lid => currentJob.locationIds.includes(lid))) score += 1;
      // Compare levels
      if (j.level === currentJob.level) score += 1;
      return { job: j, score };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(r => r.job);

  const handlePopupHover = (hovered: boolean) => {
    setPopupHovered(hovered);
    if (hovered) {
      // Clear timeout when mouse enters popup
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    } else {
      // Set timeout when mouse leaves popup
      hideTimeoutRef.current = setTimeout(() => {
        setHoveredJobId(null);
        setPreviewPosition(null);
      }, 200);
    }
  };

  if (relatedJobs.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      {/* Header with green line */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-emerald-600">
        <div className="w-1 h-6 bg-emerald-600 rounded"></div>
        <h2 className="text-lg font-bold text-slate-900">Việc làm liên quan</h2>
      </div>

      {/* List of related jobs */}
      <div className="space-y-3" ref={gridRef}>
        {relatedJobs.map(job => (
          <div key={job.id} className="relative">
            <RelatedJobCard
              job={job}
              onMouseEnter={(jobId, event) => {
                // Clear any pending hide timeout
                if (hideTimeoutRef.current) {
                  clearTimeout(hideTimeoutRef.current);
                  hideTimeoutRef.current = null;
                }
                const rect = event.currentTarget.getBoundingClientRect();
                setHoveredJobId(jobId);
                // Calculate position for fixed popup - outside card
                let leftPos = rect.right + 12;
                let topPos = rect.top;
                // If popup would overflow to the right, show it on the left
                if (leftPos + 384 > window.innerWidth) {
                  leftPos = rect.left - 384 - 12;
                }
                // Adjust top if popup would overflow bottom
                if (topPos + 450 > window.innerHeight) {
                  topPos = window.innerHeight - 470;
                }
                setPreviewPosition({
                  top: Math.max(20, topPos),
                  left: Math.max(20, leftPos)
                });
              }}
              onMouseLeave={() => {
                // Delay hiding popup to allow mouse to move into it
                hideTimeoutRef.current = setTimeout(() => {
                  if (!popupHovered) {
                    setHoveredJobId(null);
                    setPreviewPosition(null);
                  }
                }, 200);
              }}
            />
            {hoveredJobId === job.id && previewPosition && (
              <JobPreviewPopup
                job={job}
                position={previewPosition}
                onPopupHover={handlePopupHover}
              />
            )}
          </div>
        ))}
      </div>

      {/* Note for future word2vec integration */}
      <div className="text-xs text-slate-500 mt-4">
        {/* TODO: Replace scoring logic with word2vec similarity when available */}
      </div>
    </div>
  );
}
