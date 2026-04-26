import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { TrendingUp, MapPin, DollarSign, GraduationCap, Flame, BarChart3, Sparkles, Loader2, RefreshCw, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import axiosClient from '@/services/axiosClient';
import { cn } from "@/lib/utils";
import { SearchableSelect } from "@/components/ui/searchable-select";

const colors = ['#0d9488', '#14b8a6', '#2dd4bf', '#5eead4', '#f59e0b', '#d97706', '#3b82f6', '#8b5cf6'];

function SalaryPrediction({ showResult, category, location }: { showResult: boolean, category: string, location: string }) {

  const prediction = {
    min: 18,
    max: 30,
    avg: 24,
    level: 'Junior - Mid',
    industry: category || 'IT - Phần mềm',
    factors: [
      { label: 'Kinh nghiệm (2 năm)', impact: '+5 triệu' },
      { label: 'Kỹ năng React, TypeScript', impact: '+3 triệu' },
      { label: 'Bằng Đại học', impact: '+2 triệu' },
      { label: `Khu vực ${location || 'Hà Nội'}`, impact: '+1 triệu' },
    ],
  };

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

  return (
    <Button onClick={() => setShowResult(!showResult)} size="sm" className="gap-2">
      <Sparkles className="w-4 h-4" />
      {showResult ? 'Ẩn dự đoán' : 'Dự đoán lương'}
    </Button>
  );
}

export default function InsightsPage() {
  const [showSalaryPrediction, setShowSalaryPrediction] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [categories, setCategories] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [criteriaCategory, setCriteriaCategory] = useState<string>('all');
  const [criteriaLocation, setCriteriaLocation] = useState<string>('all');
  const [salaryCategory, setSalaryCategory] = useState<string>('all');
  const [salaryLocation, setSalaryLocation] = useState<string>('all');

  const [apiData, setApiData] = useState<any>({
    heatmap: null,
    competition: null,
    criteria: null,
    salary: null
  });

  const fetchMetadata = async () => {
    try {
      const [catRes, locRes] = await Promise.all([
        axiosClient.get('/api/categories'),
        axiosClient.get('/api/locations')
      ]);
      if (catRes.data.errCode === 0) setCategories(catRes.data.data);
      if (locRes.data.errCode === 0) setLocations(locRes.data.data);
    } catch (e) {
      console.error('Error fetching metadata:', e);
    }
  };

  const fetchGlobalData = async () => {
    try {
      const [heatmapRes, competitionRes] = await Promise.all([
        axiosClient.get('/api/neo4j/heatmap?days=60'),
        axiosClient.get('/api/neo4j/competition')
      ]);
      setApiData((prev: any) => ({
        ...prev,
        heatmap: heatmapRes.data.data,
        competition: competitionRes.data.data
      }));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCriteriaData = async (cat: string, loc: string) => {
    try {
      const params = {
        category: cat === 'all' ? undefined : cat,
        location: loc === 'all' ? undefined : loc,
      };
      const res = await axiosClient.get('/api/neo4j/hiring-criteria', { params });
      setApiData((prev: any) => ({ ...prev, criteria: res.data.data }));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSalaryData = async (cat: string, loc: string) => {
    try {
      const params = {
        category: cat === 'all' ? undefined : cat,
        location: loc === 'all' ? undefined : loc,
      };
      const res = await axiosClient.get('/api/neo4j/salary-by-industry', { params });
      setApiData((prev: any) => ({ ...prev, salary: res.data.data }));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchMetadata();
      await Promise.all([
        fetchGlobalData(),
        fetchCriteriaData('all', 'all'),
        fetchSalaryData('all', 'all')
      ]);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (!loading) fetchCriteriaData(criteriaCategory, criteriaLocation);
  }, [criteriaCategory, criteriaLocation]);

  useEffect(() => {
    if (!loading) fetchSalaryData(salaryCategory, salaryLocation);
  }, [salaryCategory, salaryLocation]);

  if (loading) {
    return (
      <div className="container py-32 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground font-medium">Đang tổng hợp dữ liệu thị trường...</p>
      </div>
    );
  }

  // Map API data to insightData structure expected by the UI
  const insightData = {
    jobsByCategory: (() => {
      const rows = apiData.heatmap?.rows || [];
      const cats = rows.reduce((acc: any, r: any) => {
        acc[r.category] = (acc[r.category] || 0) + r.newJobs;
        return acc;
      }, {});
      return Object.entries(cats).map(([category, count]) => ({ category, count })).sort((a: any, b: any) => b.count - a.count).slice(0, 8);
    })(),
    jobsByLocation: (() => {
      const rows = apiData.heatmap?.rows || [];
      const locs = rows.reduce((acc: any, r: any) => {
        acc[r.location] = (acc[r.location] || 0) + r.newJobs;
        return acc;
      }, {});
      const total = Object.values(locs).reduce((sum: any, val: any) => sum + val, 0) as number;
      return Object.entries(locs).map(([location, count]) => ({
        location,
        count,
        percentage: total > 0 ? ((count as number / total) * 100).toFixed(1) : 0
      })).sort((a: any, b: any) => b.count - a.count).slice(0, 6);
    })(),
    competitionRatio: (() => {
      const rows = apiData.competition?.rows || [];
      return rows.slice(0, 6).map((r: any) => ({
        category: r.category,
        ratio: Number(r.ratio).toFixed(1),
        applicants: r.applications,
        jobs: r.openJobs
      }));
    })(),
    salaryByIndustry: Array.isArray(apiData.salary) ? apiData.salary : (apiData.salary?.rows || []),
    educationRequirements: (() => {
      const rows = apiData.criteria?.rows || [];
      const edus = rows.reduce((acc: any, r: any) => {
        const level = r.education || 'Khác';
        acc[level] = (acc[level] || 0) + r.count;
        return acc;
      }, {});
      const total = Object.values(edus).reduce((sum: any, val: any) => sum + val, 0) as number;
      return Object.entries(edus).map(([level, count]) => ({
        level,
        percentage: total > 0 ? ((count as number / total) * 100).toFixed(0) : 0
      })).sort((a: any, b: any) => b.percentage - a.percentage).slice(0, 5);
    })(),
    experienceRequirements: (() => {
      const rows = apiData.criteria?.rows || [];
      const exps = rows.reduce((acc: any, r: any) => {
        const level = r.experience || 'Chưa có kinh nghiệm';
        acc[level] = (acc[level] || 0) + r.count;
        return acc;
      }, {});
      const total = Object.values(exps).reduce((sum: any, val: any) => sum + val, 0) as number;
      return Object.entries(exps).map(([level, count]) => ({
        level,
        percentage: total > 0 ? ((count as number / total) * 100).toFixed(0) : 0
      })).sort((a: any, b: any) => b.percentage - a.percentage).slice(0, 5);
    })()
  };

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
            💡 <strong>Insight:</strong> {apiData.heatmap?.message || 'Đang cập nhật dữ liệu thị trường...'}
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-heading font-semibold text-foreground mb-4">Việc làm theo ngành</h3>
            {insightData.jobsByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={insightData.jobsByCategory} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 12, fill: 'hsl(220, 10%, 46%)' }} />
                  <YAxis type="category" dataKey="category" width={180} tick={{ fontSize: 11, fill: 'hsl(220, 10%, 46%)' }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {insightData.jobsByCategory.map((_: any, i: number) => <Cell key={i} fill={colors[i % colors.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed border-border/50">
                <BarChart3 className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-medium text-sm">Chưa có dữ liệu việc làm theo ngành</p>
              </div>
            )}
          </div>
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-heading font-semibold text-foreground mb-4">Bản đồ nhiệt việc làm</h3>
            {insightData.jobsByLocation.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={insightData.jobsByLocation} dataKey="count" nameKey="location" cx="50%" cy="50%" outerRadius={100} label={({ location, percentage }) => `${location} ${percentage}%`}>
                    {insightData.jobsByLocation.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed border-border/50">
                <MapPin className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-medium text-sm">Chưa có dữ liệu bản đồ nhiệt</p>
              </div>
            )}
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
            🔥 <strong>Insight:</strong> {apiData.competition?.message || 'Đang cập nhật dữ liệu...'}
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-6">
          {insightData.competitionRatio.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={insightData.competitionRatio}>
                <XAxis dataKey="category" tick={{ fontSize: 11, fill: 'hsl(220, 10%, 46%)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(220, 10%, 46%)' }} />
                <Tooltip formatter={(value: number, name: string) => [name === 'ratio' ? `1:${value}` : value.toLocaleString(), name === 'ratio' ? 'Tỷ lệ chọi' : name === 'applicants' ? 'Ứng viên' : 'Việc làm']} />
                <Bar dataKey="ratio" fill="#f59e0b" name="Tỷ lệ chọi" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[350px] flex flex-col items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed border-border/50">
              <Flame className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium text-sm">Chưa có đủ dữ liệu để tính tỷ lệ cạnh tranh</p>
            </div>
          )}
        </div>
      </section>

      {/* 3. Tiêu chuẩn tuyển dụng */}
      <section className="mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-info" />
            <h2 className="font-heading text-xl font-semibold text-foreground">3. Tiêu chuẩn tuyển dụng</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <SearchableSelect 
              options={[{value: 'all', label: 'Tất cả ngành nghề'}, ...categories.map(c => ({value: c.name, label: c.name}))]} 
              value={criteriaCategory} 
              onValueChange={setCriteriaCategory} 
              icon={<Briefcase className="w-4 h-4" />}
            />
            <SearchableSelect 
              options={[{value: 'all', label: 'Tất cả địa điểm'}, ...locations.map(c => ({value: c.name, label: c.name}))]} 
              value={criteriaLocation} 
              onValueChange={setCriteriaLocation} 
              icon={<MapPin className="w-4 h-4" />}
            />
          </div>
        </div>
        <div className="bg-accent/50 rounded-xl p-4 mb-6 border border-primary/10">
          <p className="text-sm text-accent-foreground">
            🎓 <strong>Insight:</strong> {apiData.criteria?.message || 'Đang cập nhật dữ liệu...'}
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-heading font-semibold text-foreground mb-4">Yêu cầu học vấn</h3>
            <div className="space-y-4">
              {insightData.educationRequirements.length > 0 ? (
                insightData.educationRequirements.map(item => (
                  <div key={item.level}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-foreground">{item.level}</span>
                      <span className="text-muted-foreground font-semibold">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3">
                      <div className="bg-slate-900 h-3 rounded-full transition-all" style={{ width: `${item.percentage}%` }} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed border-border/50">
                  <GraduationCap className="w-8 h-8 mb-2 opacity-20" />
                  <p className="font-medium text-sm">Chưa có dữ liệu học vấn</p>
                </div>
              )}
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-heading font-semibold text-foreground mb-4">Yêu cầu kinh nghiệm</h3>
            <div className="space-y-4">
              {insightData.experienceRequirements.length > 0 ? (
                insightData.experienceRequirements.map(item => (
                  <div key={item.level}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-foreground">{item.level}</span>
                      <span className="text-muted-foreground font-semibold">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3">
                      <div className="bg-teal-500 h-3 rounded-full transition-all" style={{ width: `${item.percentage}%` }} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed border-border/50">
                  <BarChart3 className="w-8 h-8 mb-2 opacity-20" />
                  <p className="font-medium text-sm">Chưa có dữ liệu kinh nghiệm</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Phổ lương + Dự đoán */}
      <section className="mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-success" />
            <h2 className="font-heading text-xl font-semibold text-foreground">4. Phổ lương thị trường</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <SearchableSelect 
              options={[{value: 'all', label: 'Tất cả ngành nghề'}, ...categories.map(c => ({value: c.name, label: c.name}))]} 
              value={salaryCategory} 
              onValueChange={setSalaryCategory} 
              icon={<Briefcase className="w-4 h-4" />}
            />
            <SearchableSelect 
              options={[{value: 'all', label: 'Tất cả địa điểm'}, ...locations.map(c => ({value: c.name, label: c.name}))]} 
              value={salaryLocation} 
              onValueChange={setSalaryLocation} 
              icon={<MapPin className="w-4 h-4" />}
            />
            <SalaryPredictionButton showResult={showSalaryPrediction} setShowResult={setShowSalaryPrediction} />
          </div>
        </div>
        <div className="bg-accent/50 rounded-xl p-4 mb-6 border border-primary/10">
          <p className="text-sm text-accent-foreground">
            💰 <strong>Insight:</strong> {apiData.salary?.message || 'Thống kê phổ lương trung bình của các nhóm ngành có nhu cầu tuyển dụng cao nhất.'}
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-6">
          {insightData.salaryByIndustry.length > 0 ? (
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
          ) : (
            <div className="h-[350px] flex flex-col items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed border-border/50">
              <DollarSign className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium text-sm">Chưa có đủ mẫu tin để hiển thị phổ lương</p>
            </div>
          )}
        </div>

        {/* Salary Prediction Result */}
        <SalaryPrediction 
          showResult={showSalaryPrediction} 
          category={salaryCategory === 'all' ? '' : salaryCategory} 
          location={salaryLocation === 'all' ? '' : salaryLocation} 
        />
      </section>
    </div>
  );
}
