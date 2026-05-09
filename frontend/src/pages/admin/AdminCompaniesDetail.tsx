import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, MapPin, Globe, Users, Phone, Mail, 
  ArrowLeft, ExternalLink, Briefcase, Trash2,
  Calendar, Info
} from 'lucide-react';
import axiosClient from '@/services/axiosClient';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export function AdminCompaniesDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchCompanyDetail();
  }, [id]);

  const fetchCompanyDetail = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/api/admin/companies/${id}`);
      if (res.data.errCode === 0) {
        setCompany(res.data.data);
      } else {
        toast.error("Không tìm thấy thông tin công ty");
      }
    } catch (error) {
      console.error("Error fetching company detail:", error);
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="mt-4 font-bold text-muted-foreground">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-xl font-bold mb-2">Không tìm thấy công ty</h2>
        <Button onClick={() => navigate('/admin/companies')}>Quay lại danh sách</Button>
      </div>
    );
  }

  const contactUser = company.users?.[0] || {};
  const companyJobs = company.Jobs || [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-20"
    >
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
      <div className="bg-card rounded-[2.5rem] border border-border/50 overflow-hidden shadow-xl">
        <div className="h-40 bg-gradient-to-r from-primary/20 via-purple-500/10 to-blue-500/10 border-b border-border/50 relative">
           <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.1) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        </div>
        <div className="px-10 pb-10">
          <div className="relative -mt-16 mb-8 flex flex-wrap items-end justify-between gap-6">
            <div className="flex items-end gap-8">
              <div className="w-36 h-36 rounded-3xl bg-white border-8 border-card shadow-2xl flex items-center justify-center overflow-hidden p-6 group transition-transform hover:scale-105">
                <img src={company.logo || 'https://placehold.co/200x200?text=Logo'} alt={company.name} className="w-full h-full object-contain" />
              </div>
              <div className="mb-4">
                <h1 className="text-4xl font-black text-foreground tracking-tight mb-2">{company.name}</h1>
                <div className="flex items-center gap-6 text-muted-foreground font-bold text-sm">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-primary" />
                    {company.company_address || "Chưa cập nhật địa chỉ"}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-primary" />
                    Quy mô: {company.company_scale || "N/A"}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-4 mb-4">
              {company.website_url && (
                <Button variant="outline" className="h-12 px-6 rounded-2xl gap-2 font-bold border-border/50 hover:bg-muted" asChild>
                  <a href={company.website_url} target="_blank" rel="noopener noreferrer">
                    <Globe className="w-4.5 h-4.5" />
                    Trang web
                    <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-50" />
                  </a>
                </Button>
              )}
              <Button variant="destructive" className="h-12 px-6 rounded-2xl gap-2 font-bold shadow-lg shadow-destructive/20">
                <Trash2 className="w-4.5 h-4.5" />
                Xóa công ty
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12 border-t border-border/30 pt-12">
            <div className="lg:col-span-2 space-y-12">
              <div className="bg-muted/10 p-8 rounded-[2rem] border border-border/30">
                <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                  <div className="w-2 h-8 bg-primary rounded-full"></div>
                  Giới thiệu công ty
                </h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-lg font-medium">
                  {company.description || "Công ty chưa cung cấp thông tin giới thiệu chi tiết."}
                </p>
              </div>

              <div>
                <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                  <div className="w-2 h-8 bg-primary rounded-full"></div>
                  Việc làm đang tuyển ({companyJobs.length})
                </h3>
                <div className="grid gap-4">
                  {companyJobs.map((job: any) => (
                    <Link 
                      key={job.id} 
                      to={`/admin/jobs/${job.id}`}
                      className="flex items-center justify-between p-6 rounded-[1.5rem] border border-border/50 hover:border-primary/40 hover:bg-primary/[0.03] transition-all group shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors border border-border/30">
                          <Briefcase className="w-7 h-7 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                        </div>
                        <div>
                          <div className="font-black text-lg group-hover:text-primary transition-colors tracking-tight">{job.title}</div>
                          <div className="text-xs font-bold text-muted-foreground flex items-center gap-4 mt-1 uppercase tracking-wider">
                            <span className="text-emerald-600">Lương: {job.salary}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              Đăng ngày: {new Date(job.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="px-4 py-1.5 rounded-xl border-border/50 font-bold group-hover:bg-primary group-hover:text-white transition-all">Chi tiết</Badge>
                    </Link>
                  ))}
                  {companyJobs.length === 0 && (
                    <div className="text-center p-12 bg-muted/20 rounded-[2rem] border-2 border-dashed border-border/50 text-muted-foreground">
                      <Info className="w-10 h-10 mx-auto mb-4 opacity-20" />
                      <p className="font-bold">Hiện chưa có tin tuyển dụng nào từ công ty này.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-card rounded-[2rem] p-8 border border-border/50 shadow-sm space-y-8">
                <h3 className="text-lg font-black tracking-tight">Thông tin liên hệ</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Số điện thoại</div>
                      <div className="text-base font-bold text-foreground">{contactUser.phone || "N/A"}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Email quản trị</div>
                      <div className="text-base font-bold text-foreground truncate">{contactUser.email || "N/A"}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Trụ sở chính</div>
                      <div className="text-sm font-bold text-foreground leading-snug">{company.company_address || "N/A"}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-500/5 rounded-[2rem] p-8 border border-emerald-500/10 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                  <span className="text-sm font-black text-emerald-700 uppercase tracking-widest">Đã xác thực</span>
                </div>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                  Doanh nghiệp này đã vượt qua quy trình kiểm duyệt và xác minh thông tin pháp nhân.
                </p>
                <Button className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 font-bold shadow-lg shadow-emerald-500/20" variant="default">
                  Quản lý NTD liên kết
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
