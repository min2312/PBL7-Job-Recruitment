import { Button } from '@/components/ui/button';

interface JobNeedsBannerProps {
  onUpdateClick?: () => void;
}

export default function JobNeedsBanner({ onUpdateClick }: JobNeedsBannerProps) {
  return (
    <div className="bg-white px-3 py-1 border-b border-slate-200">
      <div className="container max-w-6xl mx-auto">
        <div className="flex items-center justify-center gap-1 flex-wrap">
          <p className="text-slate-600 text-[11px] font-medium">
            Hãy chia sẻ nhu cầu công việc để nhận gợi ý việc làm tốt nhất
          </p>
          <Button 
            className="bg-black hover:bg-slate-900 text-white font-bold text-[11px] px-3 py-1 rounded-full whitespace-nowrap"
            onClick={onUpdateClick}
          >
            Cập nhật nhu cầu →
          </Button>
        </div>
      </div>
    </div>
  );
}
