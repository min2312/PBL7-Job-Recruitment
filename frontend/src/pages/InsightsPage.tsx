import { useState } from 'react';
import { insightData } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { TrendingUp, MapPin, DollarSign, GraduationCap, Flame, BarChart3, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const colors = ['#0d9488', '#14b8a6', '#2dd4bf', '#5eead4', '#f59e0b', '#d97706', '#3b82f6', '#8b5cf6'];

function SalaryPrediction() {
  const { user } = useAuth();
  const [showResult, setShowResult] = useState(false);

  const prediction = {
    min: 18,
    max: 30,
    avg: 24,
    level: 'Junior - Mid',
    industry: 'IT - Phần mềm',
    factors: [
      { label: 'Kinh nghiệm (2 năm)', impact: '+5 triệu' },
      { label: 'Kỹ năng React, TypeScript', impact: '+3 triệu' },
      { label: 'Bằng Đại học', impact: '+2 triệu' },
      { label: 'Khu vực Hà Nội', impact: '+1 triệu' },
    ],
  };

  if (!user || user.role !== 'CANDIDATE') {
    return null;
  }

  return (
    <AnimatePresence>
      {showResult && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden mt-6"
        >
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="mb-4">
              <h3 className="font-heading font-semibold text-foreground">Dự đoán mức lương của bạn</h3>
              <p className="text-sm text-muted-foreground">Dựa trên thông tin từ profile và CV của bạn</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-muted rounded-lg p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Thấp nhất</p>
                <p className="font-heading text-2xl font-bold text-foreground">{prediction.min} <span className="text-sm font-normal">triệu</span></p>
              </div>
              <div className="bg-primary/10 rounded-lg p-4 text-center border border-primary/20">
                <p className="text-xs text-primary mb-1">Dự đoán</p>
                <p className="font-heading text-3xl font-bold text-primary">{prediction.avg} <span className="text-sm font-normal">triệu</span></p>
              </div>
              <div className="bg-muted rounded-lg p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Cao nhất</p>
                <p className="font-heading text-2xl font-bold text-foreground">{prediction.max} <span className="text-sm font-normal">triệu</span></p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>{prediction.min} triệu</span>
                <span>{prediction.max} triệu</span>
              </div>
              <div className="w-full h-4 bg-muted rounded-full relative overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary/60 via-primary to-primary/60"
                  style={{ width: `${((prediction.avg - prediction.min) / (prediction.max - prediction.min)) * 100}%`, marginLeft: '10%' }}
                />
                <div
                  className="absolute top-0 w-1 h-full bg-secondary"
                  style={{ left: `${((prediction.avg - prediction.min) / (prediction.max - prediction.min)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Các yếu tố ảnh hưởng:</h4>
              <div className="space-y-2">
                {prediction.factors.map((f, i) => (
                  <div key={i} className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/50">
                    <span className="text-foreground">{f.label}</span>
                    <span className="text-success font-medium">{f.impact}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-4 italic">
              * Kết quả dự đoán dựa trên phân tích dữ liệu thị trường và thông tin profile của bạn.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SalaryPredictionButton({ showResult, setShowResult }: { showResult: boolean; setShowResult: (v: boolean) => void }) {
  const { user } = useAuth();
  if (!user || user.role !== 'CANDIDATE') return null;

  return (
    <Button onClick={() => setShowResult(!showResult)} size="sm" className="gap-2">
      <Sparkles className="w-4 h-4" />
      {showResult ? 'Ẩn dự đoán' : 'Dự đoán lương'}
    </Button>
  );
}

export default function InsightsPage() {
  const [showSalaryPrediction, setShowSalaryPrediction] = useState(false);

  return (
    <div className="container py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="w-8 h-8 text-primary" />
          <h1 className="font-heading text-3xl font-bold text-foreground">Thống kê thị trường lao động</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Phân tích xu hướng tuyển dụng, mức lương, tỷ lệ cạnh tranh dựa trên dữ liệu từ hơn 1,500 tin tuyển dụng và 50,000 ứng viên.
        </p>
      </motion.div>

      {/* 1. Nhu cầu tuyển dụng */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-primary" />
          <h2 className="font-heading text-xl font-semibold text-foreground">1. Nhu cầu tuyển dụng theo ngành & địa điểm</h2>
        </div>
        <div className="bg-accent/50 rounded-xl p-4 mb-6 border border-primary/10">
          <p className="text-sm text-accent-foreground">
            💡 <strong>Insight:</strong> Tháng này, ngành <strong>'IT - Phần mềm'</strong> tại <strong>'Hà Nội'</strong> đang có nhu cầu tuyển dụng cao nhất với <strong>520 việc làm mới</strong>, chiếm <strong>30%</strong> toàn thị trường.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-heading font-semibold text-foreground mb-4">Việc làm theo ngành</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={insightData.jobsByCategory} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 12, fill: 'hsl(220, 10%, 46%)' }} />
                <YAxis type="category" dataKey="category" width={180} tick={{ fontSize: 11, fill: 'hsl(220, 10%, 46%)' }} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {insightData.jobsByCategory.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-heading font-semibold text-foreground mb-4">Bản đồ nhiệt việc làm</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={insightData.jobsByLocation} dataKey="count" nameKey="location" cx="50%" cy="50%" outerRadius={100} label={({ location, percentage }) => `${location} ${percentage}%`}>
                  {insightData.jobsByLocation.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* 2. Tỷ lệ cạnh tranh */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-5 h-5 text-secondary" />
          <h2 className="font-heading text-xl font-semibold text-foreground">2. Mức độ cạnh tranh theo ngành</h2>
        </div>
        <div className="bg-accent/50 rounded-xl p-4 mb-6 border border-primary/10">
          <p className="text-sm text-accent-foreground">
            🔥 <strong>Insight:</strong> Ngành <strong>'Marketing / Truyền thông'</strong> đang có tỷ lệ cạnh tranh khốc liệt nhất: Trung bình <strong>1 vị trí có 45 ứng viên</strong> nộp CV (Tỷ lệ chọi <strong>1:45</strong>).
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-6">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={insightData.competitionRatio}>
              <XAxis dataKey="category" tick={{ fontSize: 11, fill: 'hsl(220, 10%, 46%)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(220, 10%, 46%)' }} />
              <Tooltip formatter={(value: number, name: string) => [name === 'ratio' ? `1:${value}` : value.toLocaleString(), name === 'ratio' ? 'Tỷ lệ chọi' : name === 'applicants' ? 'Ứng viên' : 'Việc làm']} />
              <Bar dataKey="ratio" fill="#f59e0b" name="Tỷ lệ chọi" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 3. Tiêu chuẩn tuyển dụng */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap className="w-5 h-5 text-info" />
          <h2 className="font-heading text-xl font-semibold text-foreground">3. Tiêu chuẩn tuyển dụng</h2>
        </div>
        <div className="bg-accent/50 rounded-xl p-4 mb-6 border border-primary/10">
          <p className="text-sm text-accent-foreground">
            🎓 <strong>Insight:</strong> Đối với vị trí <strong>'Trưởng/Phó phòng'</strong> ngành <strong>'Bán lẻ'</strong>, <strong>80%</strong> các công ty yêu cầu kinh nghiệm <strong>'Trên 5 năm'</strong> và bằng <strong>'Đại học trở lên'</strong>.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-heading font-semibold text-foreground mb-4">Yêu cầu học vấn</h3>
            <div className="space-y-4">
              {insightData.educationRequirements.map(item => (
                <div key={item.level}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground">{item.level}</span>
                    <span className="text-muted-foreground font-semibold">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div className="bg-primary h-3 rounded-full transition-all" style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-heading font-semibold text-foreground mb-4">Yêu cầu kinh nghiệm</h3>
            <div className="space-y-4">
              {insightData.experienceRequirements.map(item => (
                <div key={item.level}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground">{item.level}</span>
                    <span className="text-muted-foreground font-semibold">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div className="bg-secondary h-3 rounded-full transition-all" style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Phổ lương + Dự đoán */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-success" />
            <h2 className="font-heading text-xl font-semibold text-foreground">4. Phổ lương thị trường</h2>
          </div>
          <SalaryPredictionButton showResult={showSalaryPrediction} setShowResult={setShowSalaryPrediction} />
        </div>
        <div className="bg-accent/50 rounded-xl p-4 mb-6 border border-primary/10">
          <p className="text-sm text-accent-foreground">
            💰 <strong>Insight:</strong> Mức lương trung bình cho nhân sự kinh nghiệm <strong>'1 năm'</strong> ngành <strong>'Tài chính'</strong> tại <strong>'Hồ Chí Minh'</strong> đang dao động từ <strong>12 - 18 triệu đồng</strong>.
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-6">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={insightData.salaryByIndustry}>
              <XAxis dataKey="category" tick={{ fontSize: 11, fill: 'hsl(220, 10%, 46%)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(220, 10%, 46%)' }} unit=" tr" />
              <Tooltip formatter={(value: number) => [`${value} triệu`, '']} />
              <Bar dataKey="min" fill="#99f6e4" name="Thấp nhất" radius={[4, 4, 0, 0]} />
              <Bar dataKey="avg" fill="#14b8a6" name="Trung bình" radius={[4, 4, 0, 0]} />
              <Bar dataKey="max" fill="#0d9488" name="Cao nhất" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Salary Prediction Result */}
        <SalaryPrediction />
      </section>
    </div>
  );
}
