import { useState, useEffect } from 'react';
import { users, companies, applications, jobs } from '@/data/mockData';
import { Users, Briefcase, Building2, FileText, LayoutDashboard } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const pieColors = ['#2563eb', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export function AdminOverview() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
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

  const stats = [
    { icon: Users, label: 'Người dùng', value: users.length, color: 'bg-blue-500/10 text-blue-600', border: 'border-blue-500/20' },
    { icon: Briefcase, label: 'Việc làm', value: jobs.length, color: 'bg-purple-500/10 text-purple-600', border: 'border-purple-500/20' },
    { icon: Building2, label: 'Công ty', value: companies.length, color: 'bg-cyan-500/10 text-cyan-600', border: 'border-cyan-500/20' },
    { icon: FileText, label: 'Đơn ứng tuyển', value: applications.length, color: 'bg-emerald-500/10 text-emerald-600', border: 'border-emerald-500/20' },
  ];

  return (
    <>
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-1 flex items-center gap-2">
          <LayoutDashboard className="w-8 h-8 text-primary" />
          Tổng quan hệ thống
        </h1>
        <p className="text-sm text-muted-foreground">Thống kê và phân tích hoạt động của JobHub</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className={`bg-card rounded-xl border ${stat.border} p-6 shadow-sm hover:shadow-md transition-shadow`}>
            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="font-heading text-3xl font-bold text-foreground">{stat.value}</div>
            <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h3 className="font-heading text-lg font-semibold mb-6 text-foreground flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
            Phân bổ người dùng
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={roleData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                label
              >
                {roleData.map((_, i) => <Cell key={i} fill={pieColors[i]} stroke="none" />)}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h3 className="font-heading text-lg font-semibold mb-6 text-foreground flex items-center gap-2">
            <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
            Trạng thái đơn ứng tuyển
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie 
                data={statusData} 
                dataKey="value" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                innerRadius={60}
                outerRadius={100} 
                paddingAngle={5}
                label
              >
                {statusData.map((_, i) => <Cell key={i} fill={pieColors[i+3]} stroke="none" />)}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div> */}
      </div>
    </>
  );
}
