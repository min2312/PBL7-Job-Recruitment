import { companies } from '@/data/mockData';
import { Building2 } from 'lucide-react';

export default function CompaniesPage() {
  return (
    <div className="container py-8">
      <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Danh sách công ty</h1>
      <p className="text-muted-foreground mb-8">Khám phá các công ty hàng đầu đang tuyển dụng</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {companies.map(company => (
          <div key={company.id} className="bg-card rounded-xl border border-border p-5 hover:shadow-md hover:border-primary/30 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden border border-border flex-shrink-0">
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="min-w-0">
                <h3 className="font-heading text-sm font-semibold text-foreground line-clamp-2 leading-tight">{company.name}</h3>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Building2 className="w-3 h-3" />
              <span>Đang tuyển</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
