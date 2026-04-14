import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Routes, Route } from 'react-router-dom';
import { jobs, users, companies, applications } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Shield, Users, Briefcase, Building2, FileText, Eye, Trash2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const pieColors = ['#0d9488', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899'];

function OverviewTab() {
  const roleData = [
    { name: 'Ứng viên', value: users.filter(u => u.role === 'CANDIDATE').length },
    { name: 'Nhà tuyển dụng', value: users.filter(u => u.role === 'EMPLOYER').length },
    { name: 'Admin', value: users.filter(u => u.role === 'ADMIN').length },
  ];

  const statusData = [
    { name: 'Đang chờ', value: applications.filter(a => a.status === 'pending').length },
    { name: 'Đã duyệt', value: applications.filter(a => a.status === 'approved').length },
    { name: 'Từ chối', value: applications.filter(a => a.status === 'rejected').length },
  ];

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Users, label: 'Người dùng', value: users.length, color: 'text-primary' },
          { icon: Briefcase, label: 'Việc làm', value: jobs.length, color: 'text-info' },
          { icon: Building2, label: 'Công ty', value: companies.length, color: 'text-secondary' },
          { icon: FileText, label: 'Đơn ứng tuyển', value: applications.length, color: 'text-success' },
        ].map(stat => (
          <div key={stat.label} className="bg-card rounded-xl border border-border p-5">
            <stat.icon className={`w-8 h-8 ${stat.color} mb-2`} />
            <div className="font-heading text-2xl font-bold text-foreground">{stat.value}</div>
            <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-heading text-lg font-semibold mb-4 text-foreground">Phân bổ người dùng</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={roleData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {roleData.map((_, i) => <Cell key={i} fill={pieColors[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-heading text-lg font-semibold mb-4 text-foreground">Trạng thái đơn ứng tuyển</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {statusData.map((_, i) => <Cell key={i} fill={pieColors[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}

function UsersTab() {
  return (
    <>
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-1">Quản lý người dùng</h1>
        <p className="text-sm text-muted-foreground">Xem và quản lý tất cả người dùng trong hệ thống</p>
      </div>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-4 font-medium text-muted-foreground">Tên</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Email</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Vai trò</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t border-border">
                  <td className="p-4 font-medium text-foreground">{u.name}</td>
                  <td className="p-4 text-muted-foreground">{u.email}</td>
                  <td className="p-4">
                    <Badge variant="outline" className={
                      u.role === 'ADMIN' ? 'border-primary/30 text-primary' :
                      u.role === 'EMPLOYER' ? 'border-secondary/30 text-secondary' :
                      'border-info/30 text-info'
                    }>
                      {u.role === 'CANDIDATE' ? 'Ứng viên' : u.role === 'EMPLOYER' ? 'NTD' : 'Admin'}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
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

function JobsTab() {
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
                <tr key={j.id} className="border-t border-border">
                  <td className="p-4 font-medium text-foreground max-w-xs truncate">{j.title}</td>
                  <td className="p-4 text-muted-foreground">{j.salary}</td>
                  <td className="p-4 text-muted-foreground">{j.level}</td>
                  <td className="p-4 text-muted-foreground">{j.createdAt}</td>
                  <td className="p-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
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

export default function AdminDashboard() {
  const { user } = useAuth();
  if (!user || user.role !== 'ADMIN') return <Navigate to="/login" />;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b border-border px-4 gap-4 bg-card">
            <SidebarTrigger />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-heading text-sm font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-xs text-muted-foreground">Quản trị hệ thống JobHub</p>
              </div>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <Routes>
              <Route index element={<OverviewTab />} />
              <Route path="users" element={<UsersTab />} />
              <Route path="jobs" element={<JobsTab />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
