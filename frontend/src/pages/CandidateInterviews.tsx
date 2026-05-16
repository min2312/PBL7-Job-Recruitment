import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import NumberedPagination from "@/components/NumberedPagination";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Video, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  HelpCircle,
  Loader2,
  CalendarCheck,
  Filter
} from "lucide-react";
import axiosClient from "@/services/axiosClient";
import { toast } from "react-toastify";
import { useAuth } from "@/hooks/useAuth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusConfig: Record<string, { label: string, className: string, icon: any }> = {
  PENDING: { label: "Chờ xác nhận", className: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: HelpCircle },
  ACCEPTED: { label: "Đã đồng ý", className: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle2 },
  DECLINED: { label: "Đã từ chối", className: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
  COMPLETED: { label: "Đã hoàn thành", className: "bg-blue-50 text-blue-700 border-blue-200", icon: CheckCircle2 },
  CANCELLED: { label: "Đã hủy", className: "bg-slate-50 text-slate-700 border-slate-200", icon: XCircle },
  EXPIRED: { label: "Đã hết hạn", className: "bg-gray-50 text-gray-400 border-gray-100", icon: Clock },
};

export default function CandidateInterviews() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchInterviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/api/interviews", {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          status: filterStatus
        }
      });
      if (res.data.errCode === 0) {
        setInterviews(res.data.data);
        if (res.data.pagination) {
          setTotalPages(res.data.pagination.totalPages);
        }
      }
    } catch (error) {
      console.error("Error fetching interviews:", error);
      toast.error("Không thể tải danh sách lịch phỏng vấn");
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterStatus]);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  const handleResponse = async (id: number, status: string) => {
    setProcessingId(id);
    try {
      const res = await axiosClient.put("/api/interviews/update-status", {
        id,
        status,
        note: ""
      });
      if (res.data.errCode === 0) {
        toast.success(status === 'ACCEPTED' ? 'Đã chấp nhận lịch phỏng vấn' : 'Đã từ chối lịch phỏng vấn');
        await fetchInterviews();
      } else {
        toast.error(res.data.message || 'Có lỗi xảy ra');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Không thể cập nhật trạng thái';
      toast.error(msg);
    } finally {
      setProcessingId(null);
    }
  };

  const handleFilterChange = (val: string) => {
    setFilterStatus(val);
    setCurrentPage(1); // Reset to first page
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl flex-1">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground tracking-tight">Lịch phỏng vấn của tôi</h1>
          <p className="text-muted-foreground mt-1">Quản lý các lời mời và lịch hẹn phỏng vấn từ nhà tuyển dụng</p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={filterStatus} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Lọc trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả lịch hẹn</SelectItem>
              <SelectItem value="PENDING">Chờ xác nhận</SelectItem>
              <SelectItem value="ACCEPTED">Đã đồng ý</SelectItem>
              <SelectItem value="DECLINED">Đã từ chối</SelectItem>
              <SelectItem value="COMPLETED">Đã hoàn thành</SelectItem>
              <SelectItem value="EXPIRED">Đã hết hạn</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
          <p>Đang tải danh sách lịch phỏng vấn...</p>
        </div>
      ) : interviews.length === 0 ? (
        <Card className="border-dashed border-2 bg-transparent">
          <CardContent className="py-20 flex flex-col items-center justify-center text-muted-foreground">
            <CalendarCheck className="w-16 h-16 mb-4 opacity-10" />
            <p className="text-lg font-medium">Không tìm thấy lịch phỏng vấn nào</p>
            <p className="text-sm">Hãy thử thay đổi bộ lọc hoặc kiểm tra lại sau.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6">
            {interviews.map((interview) => {
              const config = statusConfig[interview.status] || statusConfig.PENDING;
              const isOnlineInApp = interview.type === "online_inapp" || (!interview.type && (interview.location?.includes("/interview/room") || interview.location === "MNP_LIVE_STUDIO"));
              const isOnlineExternal = interview.type === "online_external" || (!interview.type && !isOnlineInApp && interview.location?.startsWith("http"));
              const isOffline = interview.type === "offline" || (!isOnlineInApp && !isOnlineExternal);
              const date = new Date(interview.scheduled_at);

              return (
                <Card key={interview.id} className="overflow-hidden border-border/60 shadow-sm hover:shadow-md transition-all bg-white">
                  <div className="flex flex-col md:flex-row">
                    <div className="bg-slate-900 text-white p-6 md:w-48 flex flex-col items-center justify-center text-center">
                      <span className="text-sm font-medium uppercase tracking-wider opacity-70">Tháng {date.getMonth() + 1}</span>
                      <span className="text-4xl font-bold my-1">{date.getDate()}</span>
                      <span className="text-sm font-medium opacity-70">{date.getFullYear()}</span>
                      <div className="mt-4 flex items-center gap-1.5 text-sm font-semibold bg-white/10 px-3 py-1 rounded-full">
                        <Clock className="w-3.5 h-3.5" />
                        {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <CardContent className="p-6 flex-1">
                      <div className="flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <Badge className={`mb-2 ${config.className} border flex items-center gap-1.5 w-fit`}>
                              <config.icon className="w-3 h-3" />
                              {config.label}
                            </Badge>
                            <h3 className="text-xl font-bold text-slate-900">{interview.job?.title}</h3>
                            <p className="text-blue-600 font-semibold">{interview.employer?.name}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-auto">
                          <div className="flex items-start gap-3 text-sm text-muted-foreground">
                            <div className="mt-0.5 p-2 bg-slate-100 rounded-lg">
                              {isOnlineInApp ? <Video className="w-4 h-4 text-purple-600" /> : isOnlineExternal ? <Video className="w-4 h-4 text-blue-600" /> : <MapPin className="w-4 h-4 text-emerald-600" />}
                            </div>
                            <div>
                              <p className="font-bold text-slate-700">{isOnlineInApp ? "Phỏng vấn trực tuyến (MNP Live Studio)" : isOnlineExternal ? "Phỏng vấn Online (Link ngoài)" : "Phỏng vấn trực tiếp"}</p>
                              {isOnlineInApp ? (
                                <p className="text-purple-600 font-semibold">Phòng phỏng vấn Full HD bảo mật trên hệ thống</p>
                              ) : isOnlineExternal ? (
                                <a href={interview.location} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all font-medium">
                                  {interview.location}
                                </a>
                              ) : (
                                <p className="font-medium text-slate-600">{interview.location || "Tại văn phòng"}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-3 self-end">
                            {isOnlineInApp && interview.status === 'ACCEPTED' && (
                              <Button 
                                className="bg-purple-600 hover:bg-purple-700 text-white gap-2 rounded-xl font-semibold shadow-sm"
                                onClick={() => navigate(`/interview/room/${interview.id}`)}
                              >
                                <Video className="w-4 h-4" /> Vào MNP Live Studio
                              </Button>
                            )}
                            {isOnlineExternal && interview.status === 'ACCEPTED' && (
                              <Button 
                                className="bg-blue-600 hover:bg-blue-700 text-white gap-2 rounded-xl font-semibold shadow-sm"
                                onClick={() => window.open(interview.location, '_blank')}
                              >
                                <Video className="w-4 h-4" /> Tham gia Link ngoài
                              </Button>
                            )}
                            {interview.status === 'PENDING' && (
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                  onClick={() => handleResponse(interview.id, 'DECLINED')}
                                  disabled={processingId === interview.id}
                                >
                                  {processingId === interview.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Từ chối"}
                                </Button>
                                <Button 
                                  className="bg-emerald-600 hover:bg-emerald-700"
                                  onClick={() => handleResponse(interview.id, 'ACCEPTED')}
                                  disabled={processingId === interview.id}
                                >
                                  {processingId === interview.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Chấp nhận lời mời"}
                                </Button>
                              </div>
                            )}
                            {interview.status === 'EXPIRED' && (
                              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-500 rounded-xl border border-slate-200/60 text-sm font-medium">
                                <Clock className="w-4 h-4 text-slate-400" />
                                <span>Lời mời này đã hết hạn phản hồi</span>
                              </div>
                            )}
                            {interview.status === 'ACCEPTED' && isOffline && (
                               <p className="text-sm text-green-600 font-medium italic bg-green-50 px-3 py-1 rounded-full">Bạn đã đồng ý tham gia buổi phỏng vấn này.</p>
                            )}
                            {interview.status === 'DECLINED' && (
                               <p className="text-sm text-red-600 font-medium italic bg-red-50 px-3 py-1 rounded-full">Bạn đã từ chối buổi phỏng vấn này.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-10">
              <NumberedPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
