import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { companies } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Eye, Trash2, Building2, MapPin, Users } from 'lucide-react';

export function AdminCompanies() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <>
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-1 flex items-center gap-2">
          <Building2 className="w-8 h-8 text-primary" />
          Quản lý công ty
        </h1>
        <p className="text-sm text-muted-foreground">Xem và phê duyệt các doanh nghiệp tham gia hệ thống</p>
      </div>
      
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-semibold text-muted-foreground w-[100px]">Logo</th>
                <th className="text-left p-4 font-semibold text-muted-foreground w-[40%]">Tên công ty</th>
                <th className="text-left p-4 font-semibold text-muted-foreground w-[30%]">Địa điểm</th>
                <th className="text-right p-4 font-semibold text-muted-foreground w-[150px]">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {companies.map(c => (
                <tr key={c.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                  <td className="p-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                  </td>
                  <td className="p-4 font-bold text-foreground">
                    <div>{c.name}</div>
                    <div className="text-[10px] text-muted-foreground font-normal">ID: COMP-{c.id}</div>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground/60" />
                      {c.address}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm" className="h-9 w-9 p-0 bg-muted/50 hover:bg-primary/10 hover:text-primary transition-colors" asChild>
                        <Link to={`/admin/companies/${c.id}`}>
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-9 w-9 p-0 bg-muted/50 text-destructive hover:bg-destructive/10 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
