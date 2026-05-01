import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FileText, Upload, CheckCircle2, AlertCircle, Loader2, X, Send } from 'lucide-react';
import { toast } from 'react-toastify';
import axiosClient from '@/services/axiosClient';
import { User } from '@/data/mockData';

interface ApplyJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: number;
  jobTitle: string;
  user: User | null;
  onSuccess?: () => void;
}

export default function ApplyJobModal({
  isOpen,
  onClose,
  jobId,
  jobTitle,
  user,
  onSuccess,
}: ApplyJobModalProps) {
  const [applyMethod, setApplyMethod] = useState<'existing' | 'upload'>(
    user?.cv_file ? 'existing' : 'upload'
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fullName = user?.cv_file ? user.cv_file.split('/').pop() || '' : '';
  const cleanName = fullName.replace(/^\d+-+/, '');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds 5MB limit');
        return;
      }
      if (file.type !== 'application/pdf' && 
          file.type !== 'application/msword' && 
          file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        toast.error('Only PDF or Word files are allowed');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleApply = async () => {
    if (applyMethod === 'upload' && !selectedFile) {
      toast.error('Vui lòng tải lên CV của bạn');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('jobId', jobId.toString());
      formData.append('userId', user?.id.toString() || '');
      formData.append('useExistingCv', (applyMethod === 'existing').toString());

      if (applyMethod === 'upload' && selectedFile) {
        formData.append('cv_file', selectedFile);
      }

      const response = await axiosClient.post('/api/jobs/apply', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.errCode === 0) {
        toast.success('Ứng tuyển thành công!');
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(response.data.errMessage || 'Có lỗi xảy ra khi ứng tuyển');
      }
    } catch (error: any) {
      console.error('Apply job error:', error);
      toast.error(error.response?.data?.errMessage || 'Lỗi hệ thống khi ứng tuyển');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasExistingCv = !!user?.cv_file;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-6 bg-slate-900 text-white">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Send className="w-5 h-5 text-emerald-400" />
            Ứng tuyển công việc
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            Bạn đang ứng tuyển vị trí: <span className="text-white font-semibold">{jobTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6 bg-white">
          <RadioGroup
            value={applyMethod}
            onValueChange={(val) => setApplyMethod(val as 'existing' | 'upload')}
            className="grid grid-cols-1 gap-4"
          >
            {/* Option 1: Use existing CV */}
            <div
              className={`relative border-2 rounded-xl p-4 transition-all duration-200 cursor-pointer ${
                !hasExistingCv ? 'opacity-50 grayscale bg-slate-50 cursor-not-allowed border-slate-200' : 
                applyMethod === 'existing' ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900' : 'border-slate-100 hover:border-slate-200'
              }`}
              onClick={() => hasExistingCv && setApplyMethod('existing')}
            >
              <div className="flex items-start gap-4">
                <RadioGroupItem
                  value="existing"
                  id="existing"
                  disabled={!hasExistingCv}
                  className="mt-1 sr-only"
                />
                <div className={`p-2 rounded-lg ${applyMethod === 'existing' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="existing" className={`font-bold text-base cursor-pointer ${!hasExistingCv ? 'text-slate-400' : 'text-slate-900'}`}>
                      Sử dụng CV đã tải lên
                    </Label>
                    {applyMethod === 'existing' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                  </div>
                  {hasExistingCv ? (
                    <p className="text-sm text-slate-500 mt-1 truncate max-w-[300px]">
                      {cleanName || fullName}
                    </p>
                  ) : (
                    <div className="flex items-center gap-1.5 mt-1 text-amber-600">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <p className="text-xs font-medium">Bạn chưa có CV trong hồ sơ</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Option 2: Upload new CV */}
            <div
              className={`relative border-2 rounded-xl p-4 transition-all duration-200 cursor-pointer ${
                applyMethod === 'upload' ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900' : 'border-slate-100 hover:border-slate-200'
              }`}
              onClick={() => setApplyMethod('upload')}
            >
              <div className="flex items-start gap-4">
                <RadioGroupItem value="upload" id="upload" className="mt-1 sr-only" />
                <div className={`p-2 rounded-lg ${applyMethod === 'upload' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <Upload className="w-6 h-6" />
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="upload" className="font-bold text-base text-slate-900 cursor-pointer">
                      Tải lên CV mới
                    </Label>
                    {applyMethod === 'upload' && !selectedFile && <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse"></div>}
                    {applyMethod === 'upload' && selectedFile && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    Hỗ trợ định dạng .pdf, .doc, .docx (Tối đa 5MB)
                  </p>
                  
                  {applyMethod === 'upload' && (
                    <div className="mt-4">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                      />
                      {selectedFile ? (
                        <div className="flex items-center justify-between p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileText className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span className="text-sm font-medium text-emerald-700 truncate">{selectedFile.name}</span>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFile(null);
                            }}
                            className="p-1 hover:bg-emerald-100 rounded-full text-emerald-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-dashed border-2 hover:border-slate-900 hover:bg-slate-50"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Chọn file từ máy tính
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </RadioGroup>
        </div>

        <DialogFooter className="p-6 bg-slate-50 border-t">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting} className="font-semibold">
            Hủy
          </Button>
          <Button
            className="bg-slate-900 hover:bg-slate-800 text-white min-w-[140px] font-bold"
            onClick={handleApply}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              'Gửi ứng tuyển'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

