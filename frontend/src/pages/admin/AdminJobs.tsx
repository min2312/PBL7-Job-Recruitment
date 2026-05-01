import { useState, useEffect } from 'react';
import { jobs, applications } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Eye, Trash2, Briefcase, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AdminJobs() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-1">Quản lý việc làm</h1>
        <p className="text-sm text-muted-foreground">Xem và quản lý tất cả tin tuyển dụng</p>
      </div>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-4 font-medium text-muted-foreground">Tiêu đề</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Mức lương</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Cấp bậc</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Ngày đăng</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(j => (
                <tr key={j.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                  <td 
                    className="p-4 font-medium text-foreground max-w-xs truncate cursor-pointer hover:text-primary transition-colors"
                    onClick={() => navigate(`/admin/jobs/${j.id}`)}
                  >
                    {j.title}
                  </td>
                  <td className="p-4 text-muted-foreground">{j.salary}</td>
                  <td className="p-4 text-muted-foreground">{j.level}</td>
                  <td className="p-4 text-muted-foreground">{j.createdAt}</td>
                  <td className="p-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        title="Xem công ty"
                        onClick={() => navigate(`/admin/companies/${j.companyId}`)}
                      >
                        <Building2 className="w-4 h-4 text-primary" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        title="Xem chi tiết việc làm"
                        onClick={() => navigate(`/admin/jobs/${j.id}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
