import { jobs } from '@/data/mockData';
import TopJobsList from '@/pages/TopJobsList';

export default function JobListPage() {
  return (
    <div className="container py-8">
      <TopJobsList jobs={jobs} />
    </div>
  );
}
