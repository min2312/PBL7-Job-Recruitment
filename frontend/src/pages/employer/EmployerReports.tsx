import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Users, Target, Award } from 'lucide-react';

const applicationsByMonth = [
  { month: 'T1', applications: 12, hires: 2 },
  { month: 'T2', applications: 24, hires: 4 },
  { month: 'T3', applications: 18, hires: 3 },
  { month: 'T4', applications: 35, hires: 6 },
  { month: 'T5', applications: 28, hires: 5 },
  { month: 'T6', applications: 42, hires: 8 },
];



const conversionData = [
  { stage: 'Ứng tuyển', count: 120 },
  { stage: 'Sàng lọc', count: 80 },
  { stage: 'Phỏng vấn', count: 35 },
  { stage: 'Đề nghị', count: 15 },
  { stage: 'Tuyển dụng', count: 10 },
];

export default function EmployerReports() {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold text-foreground tracking-tight">Báo cáo</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Tổng quan hiệu quả tuyển dụng của công ty</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: 'Tổng ứng viên', value: '159', change: '+23%', color: 'text-primary', bg: 'bg-primary/10' },
          { icon: Target, label: 'Tỷ lệ chuyển đổi', value: '8.3%', change: '+2.1%', color: 'text-success', bg: 'bg-success/10' },
          { icon: TrendingUp, label: 'Thời gian tuyển TB', value: '18 ngày', change: '-3 ngày', color: 'text-info', bg: 'bg-info/10' },
          { icon: Award, label: 'Đã tuyển', value: '28', change: '+5', color: 'text-warning', bg: 'bg-warning/10' },
        ].map(stat => (
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
              <p className="text-xs text-success mt-2">{stat.change} so với tháng trước</p>
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
              <BarChart data={applicationsByMonth}>
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
            <BarChart data={conversionData} layout="vertical">
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
