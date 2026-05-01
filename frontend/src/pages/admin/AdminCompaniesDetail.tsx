import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { companies, jobs, getLocationById } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, MapPin, Globe, Users, Phone, Mail, 
  ArrowLeft, ExternalLink, Briefcase, Trash2
} from 'lucide-react';

export function AdminCompaniesDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const company = companies.find(c => c.id === Number(id));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-xl font-bold mb-2">Không tìm thấy công ty</h2>
        <Button onClick={() => navigate('/admin/companies')}>Quay lại danh sách</Button>
      </div>
    );
  }

  const companyJobs = jobs.filter(j => j.companyId === company.id);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link to="/admin/companies" className="hover:text-foreground transition-colors flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Quản lý công ty
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">Chi tiết công ty</span>
      </div>

      {/* Header Profile */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="h-32 bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b border-border"></div>
        <div className="px-8 pb-8">
          <div className="relative -mt-12 mb-6 flex flex-wrap items-end justify-between gap-6">
            <div className="flex items-end gap-6">
              <div className="w-32 h-32 rounded-2xl bg-white border-4 border-card shadow-xl flex items-center justify-center overflow-hidden">
                <img src={company.logo} alt={company.name} className="w-full h-full object-contain p-4" />
              </div>
              <div className="mb-2">
                <h1 className="text-3xl font-bold text-foreground mb-1">{company.name}</h1>
                <div className="flex items-center gap-4 text-muted-foreground text-sm">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {company.address}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {company.employees}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mb-2">
              <Button variant="outline" className="gap-2" asChild>
                <a href={company.website} target="_blank" rel="noopener noreferrer">
                  <Globe className="w-4 h-4" />
                  Trang web
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </Button>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="w-4 h-4" />
                Xóa công ty
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 border-t border-border pt-8">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                  Giới thiệu công ty
                </h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {company.description}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                  Việc làm đang tuyển ({companyJobs.length})
                </h3>
                <div className="grid gap-3">
                  {companyJobs.map(job => (
                    <Link 
                      key={job.id} 
                      to={`/admin/jobs/${job.id}`}
                      className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                          <Briefcase className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                        </div>
                        <div>
                          <div className="font-bold group-hover:text-primary transition-colors">{job.title}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <span>Lương: {job.salary}</span>
                            <span>•</span>
                            <span>Hạn: {job.endDate || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">Xem chi tiết</Badge>
                    </Link>
                  ))}
                  {companyJobs.length === 0 && (
                    <div className="text-center p-8 bg-muted/20 rounded-xl border border-dashed border-border text-muted-foreground">
                      Hiện chưa có tin tuyển dụng nào từ công ty này.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-muted/30 rounded-2xl p-6 border border-border">
                <h3 className="font-bold mb-4">Thông tin liên hệ</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-background rounded-lg border border-border">
                      <Phone className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Số điện thoại</div>
                      <div className="text-sm font-medium">{company.phone}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-background rounded-lg border border-border">
                      <Mail className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Email liên hệ</div>
                      <div className="text-sm font-medium">{company.email}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-background rounded-lg border border-border">
                      <Building2 className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Trụ sở chính</div>
                      <div className="text-sm font-medium">{company.address}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                <h3 className="font-bold mb-2">Trạng thái phê duyệt</h3>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-600">Đã xác thực</span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  Công ty này đã hoàn tất quá trình xác minh thông tin doanh nghiệp.
                </p>
                <Button className="w-full" variant="outline">Quản lý tài khoản NTD</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
