import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Mail, Phone, MapPin, Briefcase, GraduationCap, Plus, X, Save, Upload, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

interface Experience {
  id: number;
  company: string;
  position: string;
  period: string;
  description: string;
}

interface Education {
  id: number;
  school: string;
  degree: string;
  period: string;
}

export default function CandidateProfile({ embedded = false }: { embedded?: boolean }) {
  const { user, isAuthReady } = useAuth();
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: 'Hà Nội, Việt Nam',
    bio: 'Tôi là một chuyên viên có kinh nghiệm trong lĩnh vực công nghệ, đam mê xây dựng các sản phẩm số chất lượng cao.',
    skills: ['React', 'TypeScript', 'Node.js', 'SQL', 'Git', 'Agile'],
    cvFile: 'cv_nguyen_van_a.pdf',
  });

  const [experiences, setExperiences] = useState<Experience[]>([
    { id: 1, company: 'Công ty ABC Tech', position: 'Frontend Developer', period: '2024 - Hiện tại', description: 'Phát triển giao diện web sử dụng React & TypeScript. Tối ưu hiệu suất ứng dụng.' },
    { id: 2, company: 'Công ty XYZ Solutions', position: 'Junior Developer', period: '2022 - 2024', description: 'Tham gia phát triển dự án e-commerce. Viết unit test và tích hợp API.' },
  ]);

  const [educations, setEducations] = useState<Education[]>([
    { id: 1, school: 'Đại học Bách khoa Hà Nội', degree: 'Kỹ sư CNTT', period: '2018 - 2022' },
  ]);

  const [newSkill, setNewSkill] = useState('');

  if (!isAuthReady) {
    return <div className="min-h-[40vh] flex items-center justify-center text-sm text-muted-foreground">Đang kiểm tra phiên đăng nhập...</div>;
  }

  if (!user || user.role !== 'CANDIDATE') return <Navigate to="/login" />;

  if (profile.name === '' && user) {
    setProfile(p => ({ ...p, name: user.name, email: user.email, phone: user.phone || '' }));
  }

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile(p => ({ ...p, skills: [...p.skills, newSkill.trim()] }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setProfile(p => ({ ...p, skills: p.skills.filter(s => s !== skill) }));
  };

  const addExperience = () => {
    setExperiences(prev => [...prev, { id: Date.now(), company: '', position: '', period: '', description: '' }]);
  };

  const updateExperience = (id: number, field: keyof Experience, value: string) => {
    setExperiences(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const removeExperience = (id: number) => {
    setExperiences(prev => prev.filter(e => e.id !== id));
  };

  const addEducation = () => {
    setEducations(prev => [...prev, { id: Date.now(), school: '', degree: '', period: '' }]);
  };

  const updateEducation = (id: number, field: keyof Education, value: string) => {
    setEducations(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const removeEducation = (id: number) => {
    setEducations(prev => prev.filter(e => e.id !== id));
  };

  return (
    <div className={embedded ? '' : 'container py-8 max-w-4xl'}>
      {!embedded && (
        <Link to="/candidate" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="w-4 h-4" /> Quay lại Dashboard
        </Link>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                <User className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h1 className="font-heading text-2xl font-bold text-foreground">{profile.name}</h1>
                <p className="text-muted-foreground text-sm">{profile.email}</p>
              </div>
            </div>
            <Button
              variant={editing ? 'default' : 'outline'}
              onClick={() => setEditing(!editing)}
              className="gap-2"
            >
              {editing ? <><Save className="w-4 h-4" /> Lưu thay đổi</> : 'Chỉnh sửa'}
            </Button>
          </div>
        </div>

        {/* Personal Info */}
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <h2 className="font-heading text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" /> Thông tin cá nhân
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Họ và tên</label>
              {editing ? (
                <Input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
              ) : (
                <p className="text-foreground font-medium flex items-center gap-2"><User className="w-4 h-4 text-muted-foreground" />{profile.name}</p>
              )}
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Email</label>
              {editing ? (
                <Input value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
              ) : (
                <p className="text-foreground font-medium flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" />{profile.email}</p>
              )}
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Số điện thoại</label>
              {editing ? (
                <Input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
              ) : (
                <p className="text-foreground font-medium flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" />{profile.phone || 'Chưa cập nhật'}</p>
              )}
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Địa chỉ</label>
              {editing ? (
                <Input value={profile.address} onChange={e => setProfile(p => ({ ...p, address: e.target.value }))} />
              ) : (
                <p className="text-foreground font-medium flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground" />{profile.address}</p>
              )}
            </div>
          </div>
          <div className="mt-4">
            <label className="text-sm text-muted-foreground mb-1 block">Giới thiệu bản thân</label>
            {editing ? (
              <Textarea value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} rows={3} />
            ) : (
              <p className="text-sm text-foreground leading-relaxed">{profile.bio}</p>
            )}
          </div>
        </div>

        {/* CV */}
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <h2 className="font-heading text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" /> CV của bạn
          </h2>
          {profile.cvFile ? (
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <FileText className="w-8 h-8 text-primary" />
              <div className="flex-1">
                <p className="font-medium text-foreground">{profile.cvFile}</p>
                <p className="text-xs text-muted-foreground">Đã upload ngày 25/03/2026</p>
              </div>
              {editing && (
                <Button variant="outline" size="sm" className="gap-1"><Upload className="w-4 h-4" /> Thay đổi</Button>
              )}
            </div>
          ) : (
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">Kéo thả hoặc nhấn để upload CV</p>
              <Button variant="outline" size="sm" className="mt-3">Chọn file</Button>
            </div>
          )}
        </div>

        {/* Skills */}
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Kỹ năng</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {profile.skills.map(skill => (
              <Badge key={skill} className="bg-primary/10 text-primary border border-primary/20 gap-1">
                {skill}
                {editing && (
                  <button onClick={() => removeSkill(skill)} className="ml-1 hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>
          {editing && (
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                placeholder="Thêm kỹ năng..."
                className="max-w-xs"
                onKeyDown={e => e.key === 'Enter' && addSkill()}
              />
              <Button variant="outline" size="sm" onClick={addSkill}><Plus className="w-4 h-4" /></Button>
            </div>
          )}
        </div>

        {/* Experience */}
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" /> Kinh nghiệm làm việc
            </h2>
            {editing && (
              <Button variant="outline" size="sm" onClick={addExperience} className="gap-1"><Plus className="w-4 h-4" /> Thêm</Button>
            )}
          </div>
          <div className="space-y-4">
            {experiences.map(exp => (
              <div key={exp.id} className="relative border-l-2 border-primary/30 pl-4 pb-2">
                {editing ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input value={exp.position} onChange={e => updateExperience(exp.id, 'position', e.target.value)} placeholder="Vị trí" className="flex-1" />
                      <button onClick={() => removeExperience(exp.id)} className="text-destructive hover:text-destructive/80"><X className="w-4 h-4" /></button>
                    </div>
                    <Input value={exp.company} onChange={e => updateExperience(exp.id, 'company', e.target.value)} placeholder="Công ty" />
                    <Input value={exp.period} onChange={e => updateExperience(exp.id, 'period', e.target.value)} placeholder="Thời gian (VD: 2022 - 2024)" />
                    <Textarea value={exp.description} onChange={e => updateExperience(exp.id, 'description', e.target.value)} placeholder="Mô tả công việc" rows={2} />
                  </div>
                ) : (
                  <>
                    <h3 className="font-semibold text-foreground">{exp.position}</h3>
                    <p className="text-sm text-primary">{exp.company}</p>
                    <p className="text-xs text-muted-foreground mb-1">{exp.period}</p>
                    <p className="text-sm text-muted-foreground">{exp.description}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" /> Học vấn
            </h2>
            {editing && (
              <Button variant="outline" size="sm" onClick={addEducation} className="gap-1"><Plus className="w-4 h-4" /> Thêm</Button>
            )}
          </div>
          <div className="space-y-4">
            {educations.map(edu => (
              <div key={edu.id} className="relative border-l-2 border-secondary/30 pl-4 pb-2">
                {editing ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input value={edu.school} onChange={e => updateEducation(edu.id, 'school', e.target.value)} placeholder="Trường" className="flex-1" />
                      <button onClick={() => removeEducation(edu.id)} className="text-destructive hover:text-destructive/80"><X className="w-4 h-4" /></button>
                    </div>
                    <Input value={edu.degree} onChange={e => updateEducation(edu.id, 'degree', e.target.value)} placeholder="Bằng cấp" />
                    <Input value={edu.period} onChange={e => updateEducation(edu.id, 'period', e.target.value)} placeholder="Thời gian" />
                  </div>
                ) : (
                  <>
                    <h3 className="font-semibold text-foreground">{edu.school}</h3>
                    <p className="text-sm text-primary">{edu.degree}</p>
                    <p className="text-xs text-muted-foreground">{edu.period}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
