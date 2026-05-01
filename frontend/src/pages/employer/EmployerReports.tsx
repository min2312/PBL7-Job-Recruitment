import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Users, Target, Award, Loader2 } from 'lucide-react';
import axiosClient from '@/services/axiosClient';

// Mock data removed, replaced with API data

export default function EmployerReports() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  // Scroll to top and fetch data on mount
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/api/employer/statistics');
      if (response.data.errCode === 0) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Đang tải dữ liệu báo cáo...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 text-center bg-card rounded-xl border border-dashed">
        <p className="text-muted-foreground">Không thể tải dữ liệu báo cáo. Vui lòng thử lại sau.</p>
      </div>
    );
  }

  const kpiStats = [
    { icon: Users, label: 'Tổng ứng viên', value: stats.totalCandidates.toString(), change: '+0%', color: 'text-primary', bg: 'bg-primary/10' },
    { icon: Target, label: 'Tỷ lệ chuyển đổi', value: `${stats.conversionRate}%`, change: '+0%', color: 'text-success', bg: 'bg-success/10' },
    { icon: TrendingUp, label: 'Thời gian tuyển TB', value: `${stats.averageTimeToHire} ngày`, change: '0 ngày', color: 'text-info', bg: 'bg-info/10' },
    { icon: Award, label: 'Đã tuyển', value: stats.hiredCount.toString(), change: '+0', color: 'text-warning', bg: 'bg-warning/10' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold text-foreground tracking-tight">Báo cáo</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Tổng quan hiệu quả tuyển dụng của công ty</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiStats.map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold font-heading text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Dữ liệu thời gian thực</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-heading font-semibold">Ứng viên & Tuyển dụng theo tháng</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.applicationsByMonth}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="applications" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Ứng viên" />
                <Bar dataKey="hires" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} name="Tuyển dụng" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-heading font-semibold">Phễu tuyển dụng</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats.conversionData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis dataKey="stage" type="category" width={80} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} name="Số lượng" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
