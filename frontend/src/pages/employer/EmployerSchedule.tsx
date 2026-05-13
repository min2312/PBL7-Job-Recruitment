import { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NumberedPagination from "@/components/NumberedPagination";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Plus,
	Video,
	MapPin,
	CalendarDays,
	CheckCircle2,
	ChevronRight,
	Pencil,
	Trash2,
	X,
	CalendarCheck2,
	Clock4,
	Link2,
	User2,
	Briefcase,
	Bell,
	Loader2,
} from "lucide-react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import axiosClient from "@/services/axiosClient";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "react-toastify";

interface Interview {
	id: number;
	candidateName: string;
	candidateId: number;
	jobId: number;
	jobTitle: string;
	date: string;
	time: string;
	type: "online" | "offline";
	status:
		| "pending"
		| "accepted"
		| "scheduled"
		| "completed"
		| "cancelled"
		| "declined"
		| "expired";
	link?: string;
	location?: string;
	candidateAvatar?: string;
}

const statusConfig: Record<
	string,
	{ label: string; className: string; dotColor: string }
> = {
	pending: {
		label: "Chờ xác nhận",
		className: "bg-yellow-50 text-yellow-600 border-yellow-200",
		dotColor: "bg-yellow-500",
	},
	accepted: {
		label: "Đã đồng ý",
		className: "bg-blue-50 text-blue-600 border-blue-200",
		dotColor: "bg-blue-500",
	},
	scheduled: {
		label: "Đã lên lịch",
		className: "bg-indigo-50 text-indigo-600 border-indigo-200",
		dotColor: "bg-indigo-500",
	},
	completed: {
		label: "Hoàn thành",
		className: "bg-emerald-50 text-emerald-600 border-emerald-200",
		dotColor: "bg-emerald-500",
	},
	cancelled: {
		label: "Đã hủy",
		className: "bg-red-50 text-red-500 border-red-200",
		dotColor: "bg-red-500",
	},
	declined: {
		label: "Từ chối",
		className: "bg-slate-50 text-slate-500 border-slate-200",
		dotColor: "bg-slate-400",
	},
	expired: {
		label: "Hết hạn",
		className: "bg-gray-50 text-gray-400 border-gray-200",
		dotColor: "bg-gray-300",
	},
};

const avatarColors = [
	"from-violet-500 to-purple-600",
	"from-blue-500 to-indigo-600",
	"from-teal-500 to-emerald-600",
	"from-rose-500 to-pink-600",
	"from-amber-500 to-orange-600",
];

// Helper to get today's date string
const getTodayStr = () => {
	const now = new Date();
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};
const TODAY = getTodayStr();

// ---------- Edit Dialog ----------
interface EditDialogProps {
	interview: Interview;
	open: boolean;
	onClose: () => void;
	onSave: (updated: Interview) => void;
}

function EditDialog({ interview, open, onClose, onSave }: EditDialogProps) {
	const [form, setForm] = useState<Interview>({ ...interview });
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Sync form when interview changes
	useEffect(() => {
		if (interview) {
			setForm({ ...interview });
		}
	}, [interview, open]);

	const set = (key: keyof Interview, value: string) =>
		setForm((prev) => ({ ...prev, [key]: value }));

	const handleSave = async () => {
		// Validation: Chặn ngày quá khứ
		const selectedDateTime = new Date(`${form.date}T${form.time}`);
		if (selectedDateTime < new Date()) {
			toast.error("Thời gian phỏng vấn không được ở trong quá khứ!");
			return;
		}

		setIsSubmitting(true);
		try {
			await onSave(form);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(v) => {
				if (!v && !isSubmitting) onClose();
			}}
		>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle className="font-heading text-lg flex items-center gap-2">
						<Pencil className="w-4 h-4 text-primary" />
						Chỉnh sửa lịch phỏng vấn
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-4 mt-2">
					{/* Candidate */}
					<div className="space-y-1.5">
						<Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
							<User2 className="w-3.5 h-3.5" /> Ứng viên
						</Label>
						<Input
							value={form.candidateName}
							onChange={(e) => set("candidateName", e.target.value)}
							placeholder="Tên ứng viên"
							disabled
						/>
					</div>

					{/* Job title */}
					<div className="space-y-1.5">
						<Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
							<Briefcase className="w-3.5 h-3.5" /> Vị trí ứng tuyển
						</Label>
						<Input
							value={form.jobTitle}
							onChange={(e) => set("jobTitle", e.target.value)}
							placeholder="Vị trí ứng tuyển"
							disabled
						/>
					</div>

					{/* Date & Time */}
					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-1.5">
							<Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
								<CalendarCheck2 className="w-3.5 h-3.5" /> Ngày phỏng vấn
							</Label>
							<Input
								type="date"
								value={form.date}
								min={TODAY}
								onChange={(e) => set("date", e.target.value)}
								disabled={isSubmitting}
							/>
						</div>
						<div className="space-y-1.5">
							<Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
								<Clock4 className="w-3.5 h-3.5" /> Giờ phỏng vấn
							</Label>
							<Input
								type="time"
								value={form.time}
								onChange={(e) => set("time", e.target.value)}
								disabled={isSubmitting}
							/>
						</div>
					</div>

					{/* Type */}
					<div className="space-y-1.5">
						<Label className="text-xs font-medium text-muted-foreground">
							Hình thức
						</Label>
						<Select
							value={form.type}
							onValueChange={(v) => set("type", v as "online" | "offline")}
							disabled={isSubmitting}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="online">
									<span className="flex items-center gap-2">
										<Video className="w-4 h-4 text-violet-500" /> Online
									</span>
								</SelectItem>
								<SelectItem value="offline">
									<span className="flex items-center gap-2">
										<MapPin className="w-4 h-4 text-amber-500" /> Trực tiếp
									</span>
								</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Conditional field */}
					{form.type === "online" ? (
						<div className="space-y-1.5">
							<Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
								<Link2 className="w-3.5 h-3.5" /> Link phỏng vấn
							</Label>
							<Input
								value={form.link || ""}
								onChange={(e) => set("link", e.target.value)}
								placeholder="https://meet.google.com/..."
								disabled={isSubmitting}
							/>
						</div>
					) : (
						<div className="space-y-1.5">
							<Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
								<MapPin className="w-3.5 h-3.5" /> Địa điểm
							</Label>
							<Input
								value={form.location || ""}
								onChange={(e) => set("location", e.target.value)}
								placeholder="Phòng họp A, Tầng 3..."
								disabled={isSubmitting}
							/>
						</div>
					)}

					<div className="flex gap-2 pt-2">
						<Button
							variant="outline"
							className="flex-1"
							onClick={onClose}
							disabled={isSubmitting}
						>
							<X className="w-4 h-4 mr-1.5" /> Hủy
						</Button>
						<Button
							className="flex-1"
							onClick={handleSave}
							disabled={isSubmitting}
						>
							{isSubmitting ? (
								<Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
							) : (
								<CheckCircle2 className="w-4 h-4 mr-1.5" />
							)}
							{isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

// ---------- Create Dialog ----------
interface CreateDialogProps {
	open: boolean;
	onClose: () => void;
	onAdd: (interview: Interview) => void;
	availableCandidates: {
		userId: number;
		userName: string;
		jobTitle: string;
		jobId: number;
	}[];
	preFilledCandidate?: {
		candidateId: number;
		candidateName: string;
		jobTitle: string;
	} | null;
}

function CreateDialog({
	open,
	onClose,
	onAdd,
	availableCandidates,
	preFilledCandidate,
}: CreateDialogProps) {
	const [selectedApp, setSelectedApp] = useState("");
	const [date, setDate] = useState("");
	const [time, setTime] = useState("");
	const [type, setType] = useState<"online" | "offline">("online");
	const [link, setLink] = useState("");
	const [location, setLocation] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Auto-fill if preFilledCandidate is provided
	useEffect(() => {
		if (preFilledCandidate && open) {
			const matching = availableCandidates.find(
				(c) =>
					c.userId === preFilledCandidate.candidateId &&
					c.jobId === preFilledCandidate.jobId,
			);
			if (matching) {
				setSelectedApp(`${matching.userId}-${matching.jobId}`);
			}
		}
	}, [open, preFilledCandidate, availableCandidates]);

	const selectedCandidate = availableCandidates.find(
		(c) => `${c.userId}-${c.jobId}` === selectedApp,
	);

	const handleSubmit = async () => {
		if (!selectedCandidate || !date || !time) return;
		setIsSubmitting(true);
		try {
			const newInterview: Interview = {
				id: Date.now(),
				candidateId: selectedCandidate.userId,
				candidateName: selectedCandidate.userName,
				jobId: selectedCandidate.jobId,
				jobTitle: selectedCandidate.jobTitle,
				date,
				time,
				type,
				status: "scheduled",
				link: type === "online" ? link : undefined,
				location: type === "offline" ? location : undefined,
			};
			await onAdd(newInterview);
			// Reset
			setSelectedApp("");
			setDate("");
			setTime("");
			setType("online");
			setLink("");
			setLocation("");
			onClose();
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(v) => {
				if (!v && !isSubmitting) onClose();
			}}
		>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle className="font-heading text-lg flex items-center gap-2">
						<CalendarCheck2 className="w-5 h-5 text-primary" />
						Lên lịch phỏng vấn mới
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-4 mt-2">
					{/* Select candidate from applied list */}
					<div className="space-y-1.5">
						<Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
							<User2 className="w-3.5 h-3.5" /> Chọn ứng viên đã ứng tuyển
						</Label>
						<Select
							value={selectedApp}
							onValueChange={setSelectedApp}
							disabled={isSubmitting}
						>
							<SelectTrigger>
								<SelectValue placeholder="Chọn ứng viên..." />
							</SelectTrigger>
							<SelectContent>
								{availableCandidates.map((c) => (
									<SelectItem
										key={`${c.userId}-${c.jobId}`}
										value={`${c.userId}-${c.jobId}`}
									>
										<div className="flex flex-col">
											<span className="font-medium">{c.userName}</span>
											<span className="text-xs text-muted-foreground">
												{c.jobTitle}
											</span>
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{selectedCandidate && (
						<div className="bg-muted/50 rounded-lg px-4 py-3 text-sm flex items-center gap-3">
							<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
								{selectedCandidate.userName.charAt(0)}
							</div>
							<div>
								<p className="font-medium text-foreground">
									{selectedCandidate.userName}
								</p>
								<p className="text-xs text-muted-foreground">
									{selectedCandidate.jobTitle}
								</p>
							</div>
						</div>
					)}

					{/* Date & Time */}
					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-1.5">
							<Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
								<CalendarCheck2 className="w-3.5 h-3.5" /> Ngày phỏng vấn
							</Label>
							<Input
								type="date"
								value={date}
								min={TODAY}
								onChange={(e) => setDate(e.target.value)}
								disabled={isSubmitting}
							/>
						</div>
						<div className="space-y-1.5">
							<Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
								<Clock4 className="w-3.5 h-3.5" /> Giờ bắt đầu
							</Label>
							<Input
								type="time"
								value={time}
								onChange={(e) => setTime(e.target.value)}
								disabled={isSubmitting}
							/>
						</div>
					</div>

					{/* Type */}
					<div className="space-y-1.5">
						<Label className="text-xs font-medium text-muted-foreground">
							Hình thức phỏng vấn
						</Label>
						<div className="grid grid-cols-2 gap-2">
							<button
								type="button"
								disabled={isSubmitting}
								onClick={() => setType("online")}
								className={cn(
									"flex items-center justify-center gap-2 rounded-lg border-2 py-2.5 text-sm font-medium transition-all",
									type === "online"
										? "border-violet-500 bg-violet-50 text-violet-700"
										: "border-border text-muted-foreground hover:border-muted-foreground/40",
									isSubmitting && "opacity-50 cursor-not-allowed",
								)}
							>
								<Video className="w-4 h-4" /> Online
							</button>
							<button
								type="button"
								disabled={isSubmitting}
								onClick={() => setType("offline")}
								className={cn(
									"flex items-center justify-center gap-2 rounded-lg border-2 py-2.5 text-sm font-medium transition-all",
									type === "offline"
										? "border-amber-500 bg-amber-50 text-amber-700"
										: "border-border text-muted-foreground hover:border-muted-foreground/40",
									isSubmitting && "opacity-50 cursor-not-allowed",
								)}
							>
								<MapPin className="w-4 h-4" /> Trực tiếp
							</button>
						</div>
					</div>

					{/* Conditional */}
					{type === "online" ? (
						<div className="space-y-1.5">
							<Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
								<Link2 className="w-3.5 h-3.5" /> Link phỏng vấn
							</Label>
							<Input
								value={link}
								onChange={(e) => setLink(e.target.value)}
								placeholder="https://meet.google.com/..."
								disabled={isSubmitting}
							/>
						</div>
					) : (
						<div className="space-y-1.5">
							<Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
								<MapPin className="w-3.5 h-3.5" /> Địa điểm tổ chức
							</Label>
							<Input
								value={location}
								onChange={(e) => setLocation(e.target.value)}
								placeholder="Phòng họp A, Tầng 3..."
								disabled={isSubmitting}
							/>
						</div>
					)}

					<div className="flex gap-2 pt-2">
						<Button
							variant="outline"
							className="flex-1"
							onClick={onClose}
							disabled={isSubmitting}
						>
							Hủy
						</Button>
						<Button
							className="flex-1"
							disabled={!selectedCandidate || !date || !time || isSubmitting}
							onClick={handleSubmit}
						>
							{isSubmitting ? (
								<Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
							) : (
								<CalendarCheck2 className="w-4 h-4 mr-1.5" />
							)}
							{isSubmitting ? "Đang gửi..." : "Gửi lời mời phỏng vấn"}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

// ---------- Main Component ----------
export default function EmployerSchedule() {
	const { user } = useAuth();
	const location = useLocation();

	// Move states to top
	const [interviews, setInterviews] = useState<Interview[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [totalPages, setTotalPages] = useState(1);
	const [currentPage, setCurrentPage] = useState(1);
	const [filterStatus, setFilterStatus] = useState("ALL");
	const PAGE_SIZE = 6;

	// Other states
	const [date, setDate] = useState<Date | undefined>(undefined);
	const [editTarget, setEditTarget] = useState<Interview | null>(null);
	const [createOpen, setCreateOpen] = useState(false);
	const [preFilledCandidate, setPreFilledCandidate] = useState<{
		candidateId: number;
		candidateName: string;
		jobTitle: string;
		jobId: number;
	} | null>(null);

	const [myApplications, setMyApplications] = useState<any[]>([]);
	const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [updatingId, setUpdatingId] = useState<number | null>(null);

	const fetchData = async (page = 1, selectedDate?: Date) => {
		setIsLoading(true);
		try {
			// Format date for API if present
			const dateParam = selectedDate ? selectedDate.toISOString() : "";

			const [interviewRes, appRes] = await Promise.all([
				axiosClient.get(
					`/api/interviews?page=${page}&limit=${PAGE_SIZE}&status=${filterStatus}&date=${dateParam}`,
				),
				axiosClient.get("/api/employer/applications/all"),
			]);

			if (interviewRes.data.errCode === 0) {
				const formatted = interviewRes.data.data.map((i: any) => {
					const d = new Date(i.scheduled_at);
					const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
					const timeStr = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

					return {
						id: i.id,
						candidateId: i.candidate_id,
						candidateName: i.candidate?.name || "Ứng viên",
						candidateAvatar: i.candidate?.profile_picture,
						jobId: i.job_id,
						jobTitle: i.job?.title || "Vị trí",
						date: dateStr,
						time: timeStr,
						type: i.location?.toLowerCase().includes("http")
							? "online"
							: "offline",
						status: i.status.toLowerCase(),
						link: i.location?.toLowerCase().includes("http")
							? i.location
							: undefined,
						location: !i.location?.toLowerCase().includes("http")
							? i.location
							: undefined,
					};
				});
				setInterviews(formatted);
				if (interviewRes.data.pagination) {
					setTotalPages(interviewRes.data.pagination.totalPages);
				}
			}

			if (appRes.data.errCode === 0) {
				setMyApplications(appRes.data.data || []);
			}
		} catch (error) {
			console.error("Error fetching data:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchData(currentPage, date);
	}, [currentPage, filterStatus, date]);

	const availableCandidates = useMemo(() => {
		return myApplications
			.filter((app) => app.status !== "REJECTED")
			.map((app) => ({
				userId: app.userId,
				userName: app.User?.name || "Ứng viên",
				jobTitle: app.Job?.title || "Vị trí",
				jobId: app.jobId,
			}));
	}, [myApplications]);

	const scheduledCount = useMemo(
		() =>
			interviews.filter(
				(i) =>
					i.status === "scheduled" ||
					i.status === "pending" ||
					i.status === "accepted",
			).length,
		[interviews],
	);
	const completedCount = useMemo(
		() => interviews.filter((i) => i.status === "completed").length,
		[interviews],
	);
	const onlineCount = useMemo(
		() => interviews.filter((i) => i.type === "online").length,
		[interviews],
	);
	const offlineCount = useMemo(
		() => interviews.filter((i) => i.type === "offline").length,
		[interviews],
	);

	const handleUpdateStatus = async (id: number, status: string) => {
		if (updatingId) return;
		setUpdatingId(id);
		try {
			const res = await axiosClient.put("/api/interviews/update", {
				id,
				status: status.toUpperCase(),
			});
			if (res.data.errCode === 0) {
				toast.success("Cập nhật trạng thái thành công!");
				await fetchData(currentPage, date);
			} else {
				toast.error(res.data.message || "Lỗi khi cập nhật trạng thái");
			}
		} catch (error: any) {
			const msg =
				error.response?.data?.message || "Lỗi khi cập nhật trạng thái";
			toast.error(msg);
		} finally {
			setUpdatingId(null);
		}
	};

	const handleJoinMeet = (link: string) => {
		if (link) {
			window.open(link, "_blank");
		} else {
			toast.info("Không tìm thấy link phỏng vấn.");
		}
	};

	const handleAdd = async (newInterview: any) => {
		// Validation: Chặn ngày quá khứ
		const selectedDateTime = new Date(
			`${newInterview.date}T${newInterview.time}`,
		);
		if (selectedDateTime < new Date()) {
			toast.error("Thời gian phỏng vấn không được ở trong quá khứ!");
			return;
		}

		try {
			// Convert local time to ISO for storage
			const isoAt = new Date(
				`${newInterview.date}T${newInterview.time}`,
			).toISOString();
			const res = await axiosClient.post("/api/interviews/create", {
				candidate_id: newInterview.candidateId,
				job_id: newInterview.jobId,
				scheduled_at: isoAt,
				location:
					newInterview.type === "online"
						? newInterview.link
						: newInterview.location,
				note: "",
			});
			if (res.data.errCode === 0) {
				toast.success("Đã tạo lịch phỏng vấn!");
				fetchData(currentPage);
			} else {
				toast.error(res.data.message || "Lỗi khi tạo lịch.");
			}
		} catch (error: any) {
			const msg = error.response?.data?.message || "Lỗi khi tạo lịch.";
			toast.error(msg);
			throw error;
		}
	};

	const handleSave = async (updated: Interview) => {
		try {
			const isoAt = new Date(`${updated.date}T${updated.time}`).toISOString();
			const res = await axiosClient.put("/api/interviews/update", {
				id: updated.id,
				scheduled_at: isoAt,
				location: updated.type === "online" ? updated.link : updated.location,
				status: updated.status.toUpperCase(),
			});
			if (res.data.errCode === 0) {
				toast.success("Đã cập nhật lịch phỏng vấn!");
				fetchData(currentPage);
				setEditTarget(null);
			} else {
				toast.error(res.data.message || "Lỗi khi cập nhật.");
			}
		} catch (error: any) {
			const msg = error.response?.data?.message || "Lỗi khi cập nhật.";
			toast.error(msg);
			throw error;
		}
	};

	const handleDelete = async () => {
		if (!deleteTargetId) return;
		setIsDeleting(true);
		try {
			const res = await axiosClient.delete(`/api/interviews/${deleteTargetId}`);
			if (res.data.errCode === 0) {
				toast.success("Đã xóa lịch phỏng vấn.");
				fetchData(currentPage);
				setDeleteTargetId(null);
			} else {
				toast.error(res.data.message || "Lỗi khi xóa.");
			}
		} catch (error: any) {
			const msg = error.response?.data?.message || "Lỗi khi xóa.";
			toast.error(msg);
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-heading font-bold text-foreground tracking-tight">
						Lịch phỏng vấn
					</h2>
					<p className="text-sm text-muted-foreground mt-0.5">
						Quản lý các buổi phỏng vấn của công ty
					</p>
				</div>

				{/* Filter and Create */}
				<div className="flex items-center gap-3">
					<div className="flex items-center gap-2">
						<Select
							value={filterStatus}
							onValueChange={(v) => {
								setFilterStatus(v);
								setCurrentPage(1);
							}}
						>
							<SelectTrigger className="w-[180px] h-10 shadow-sm">
								<SelectValue placeholder="Lọc trạng thái" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="ALL">Tất cả</SelectItem>
								<SelectItem value="PENDING">Đang chờ</SelectItem>
								<SelectItem value="ACCEPTED">Đã đồng ý</SelectItem>
								<SelectItem value="COMPLETED">Hoàn thành</SelectItem>
								<SelectItem value="DECLINED">Ứng viên từ chối</SelectItem>
								<SelectItem value="CANCELLED">Đã hủy</SelectItem>
								<SelectItem value="EXPIRED">Đã hết hạn</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<Button
						onClick={() => setCreateOpen(true)}
						className="gap-2 h-10 shadow-md bg-primary hover:bg-primary/90"
					>
						<Plus className="w-4 h-4" />
						Tạo lịch
					</Button>
				</div>
			</div>

			{/* Stats Row */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
				{[
					{
						label: "Sắp tới",
						count: scheduledCount,
						icon: CalendarDays,
						color: "blue",
					},
					{
						label: "Hoàn thành",
						count: completedCount,
						icon: CheckCircle2,
						color: "emerald",
					},
					{ label: "Online", count: onlineCount, icon: Video, color: "violet" },
					{
						label: "Trực tiếp",
						count: offlineCount,
						icon: MapPin,
						color: "amber",
					},
				].map((stat) => (
					<Card
						key={stat.label}
						className="border-none shadow-sm bg-white overflow-hidden group"
					>
						<CardContent className="p-4 relative">
							<div
								className={cn(
									"absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-[0.03] transition-transform group-hover:scale-110",
									`bg-${stat.color}-500`,
								)}
							/>
							<div className="flex items-center gap-4">
								<div
									className={cn(
										"w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6",
										`bg-${stat.color}-50 text-${stat.color}-600`,
									)}
								>
									<stat.icon className="w-6 h-6" />
								</div>
								<div>
									<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
										{stat.label}
									</p>
									<p className="text-2xl font-bold text-slate-900 leading-tight">
										{stat.count}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			<div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
				{/* Calendar Column */}
				<Card className="border-none shadow-sm bg-white h-fit xl:sticky xl:top-6">
					<CardHeader className="pb-3 border-b border-slate-50">
						<CardTitle className="text-lg font-bold flex items-center justify-between">
							<div className="flex items-center gap-2">
								<CalendarCheck2 className="w-5 h-5 text-primary" />
								Lịch tháng
							</div>
							{date && (
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setDate(undefined)}
									className="h-8 text-[10px] text-primary hover:bg-primary/5 px-2"
								>
									Xóa lọc
								</Button>
							)}
						</CardTitle>
					</CardHeader>
					<CardContent className="p-3">
						<Calendar
							mode="single"
							selected={date}
							onSelect={setDate}
							className="w-full p-0"
							classNames={{
								months: "w-full",
								month: "w-full space-y-4",
								table: "w-full border-collapse",
								head_row: "flex w-full",
								head_cell:
									"text-muted-foreground rounded-md flex-1 font-medium text-[0.8rem] py-2",
								row: "flex w-full mt-2",
								cell: "flex-1 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
								day: cn(
									buttonVariants({ variant: "ghost" }),
									"h-10 w-full p-0 font-normal aria-selected:opacity-100 hover:bg-primary/10 hover:text-primary transition-all",
								),
								day_selected:
									"bg-primary text-white hover:bg-primary hover:text-white focus:bg-primary focus:text-white rounded-lg shadow-md",
								day_today: "bg-slate-100 text-slate-900 font-bold rounded-lg",
								nav_button: cn(
									buttonVariants({ variant: "outline" }),
									"h-8 w-8 bg-white p-0 border-slate-200 hover:bg-slate-50 hover:text-primary",
								),
								caption_label: "text-base font-bold text-slate-900",
							}}
						/>
					</CardContent>
				</Card>

				{/* List Column */}
				<div className="xl:col-span-2 space-y-4">
					<div className="flex items-center justify-between">
						<h3 className="text-lg font-bold text-slate-900">
							Danh sách phỏng vấn
						</h3>
						<p className="text-xs text-muted-foreground font-medium">
							Trang {currentPage} / {totalPages}
						</p>
					</div>

					<div className="space-y-3">
						{isLoading ? (
							<div className="py-20 flex justify-center">
								<Loader2 className="w-8 h-8 animate-spin text-primary/40" />
							</div>
						) : interviews.length > 0 ? (
							interviews.map((item) => (
								<Card
									key={item.id}
									className="border-none shadow-sm hover:shadow-md transition-all group bg-white overflow-hidden relative"
								>
									<div
										className={cn(
											"absolute left-0 top-0 bottom-0 w-1.5",
											item.status === "completed"
												? "bg-emerald-500"
												: item.status === "cancelled"
													? "bg-red-500"
													: "bg-primary",
										)}
									/>
									<CardContent className="p-4">
										<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
											<div className="flex items-start gap-4">
												<div
													className={cn(
														"w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-sm shrink-0 overflow-hidden",
														!item.candidateAvatar &&
															avatarColors[item.id % avatarColors.length],
													)}
												>
													{item.candidateAvatar ? (
														<img
															src={item.candidateAvatar}
															alt={item.candidateName}
															className="w-full h-full object-cover"
														/>
													) : (
														item.candidateName.charAt(0)
													)}
												</div>
												<div className="min-w-0">
													<div className="flex items-center gap-2 mb-1">
														<h4 className="font-bold text-slate-900 truncate">
															{item.candidateName}
														</h4>
														<Badge
															variant="outline"
															className={cn(
																"text-[10px] px-2 py-0 border-none shadow-none",
																statusConfig[item.status]?.className ||
																	"bg-slate-100 text-slate-600",
															)}
														>
															{statusConfig[item.status]?.label || item.status}
														</Badge>
													</div>
													<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
														<span className="flex items-center gap-1">
															<Briefcase className="w-3.5 h-3.5" />{" "}
															{item.jobTitle}
														</span>
														<span className="flex items-center gap-1">
															<CalendarDays className="w-3.5 h-3.5" />{" "}
															{item.date}
														</span>
														<span className="flex items-center gap-1 font-medium text-slate-600">
															<Clock4 className="w-3.5 h-3.5" /> {item.time}
														</span>
													</div>
												</div>
											</div>

											<div className="flex items-center gap-2 md:self-center">
												{item.type === "online" ? (
													<Button
														size="sm"
														onClick={() => handleJoinMeet(item.link || "")}
														className="h-9 px-4 bg-violet-600 hover:bg-violet-700 text-white gap-2 shadow-sm"
													>
														<Video className="w-4 h-4" /> Tham gia
													</Button>
												) : (
													<div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium border border-amber-100">
														<MapPin className="w-3.5 h-3.5" /> Trực tiếp
													</div>
												)}

												{["pending", "accepted", "scheduled"].includes(
													item.status,
												) ? (
													<Button
														size="sm"
														variant="outline"
														disabled={updatingId === item.id}
														onClick={() =>
															handleUpdateStatus(item.id, "COMPLETED")
														}
														className="h-9 border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
													>
														{updatingId === item.id ? (
															<Loader2 className="w-4 h-4 mr-2 animate-spin" />
														) : null}
														Hoàn thành
													</Button>
												) : null}

												<div className="flex items-center gap-1 ml-2">
													{item.status !== "completed" && (
														<Button
															size="icon"
															variant="ghost"
															className="h-8 w-8 text-slate-400 hover:text-primary"
															onClick={() => setEditTarget(item)}
														>
															<Pencil className="w-3.5 h-3.5" />
														</Button>
													)}
													<Button
														size="icon"
														variant="ghost"
														className="h-8 w-8 text-slate-400 hover:text-red-500"
														onClick={() => setDeleteTargetId(item.id)}
													>
														<Trash2 className="w-3.5 h-3.5" />
													</Button>
												</div>
											</div>
										</div>
									</CardContent>
								</Card>
							))
						) : (
							<div className="bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100 py-16 flex flex-col items-center text-center px-6">
								<div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
									<CalendarDays className="w-8 h-8 text-slate-200" />
								</div>
								<h4 className="text-slate-900 font-bold mb-1">
									Không có lịch phỏng vấn
								</h4>
								<p className="text-sm text-slate-500 max-w-[280px]">
									Hãy chọn một ngày khác hoặc tạo lịch phỏng vấn mới cho ứng
									viên của bạn.
								</p>
								<Button
									variant="outline"
									className="mt-6 gap-2"
									onClick={() => {
										setDate(undefined);
										setFilterStatus("ALL");
									}}
								>
									Xem tất cả
								</Button>
							</div>
						)}

						{totalPages > 1 && (
							<div className="mt-8">
								<NumberedPagination
									currentPage={currentPage}
									totalPages={totalPages}
									onPageChange={setCurrentPage}
								/>
							</div>
						)}
					</div>
				</div>
			</div>

			<EditDialog
				interview={editTarget!}
				open={!!editTarget}
				onClose={() => setEditTarget(null)}
				onSave={handleSave}
			/>

			<CreateDialog
				open={createOpen}
				onClose={() => {
					setCreateOpen(false);
					setPreFilledCandidate(null);
				}}
				onAdd={handleAdd}
				availableCandidates={availableCandidates}
				preFilledCandidate={preFilledCandidate}
			/>

			<AlertDialog
				open={!!deleteTargetId}
				onOpenChange={(o) => {
					if (!o && !isDeleting) setDeleteTargetId(null);
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
						<AlertDialogDescription>
							Hành động này không thể hoàn tác. Lịch phỏng vấn này sẽ bị xóa
							vĩnh viễn khỏi hệ thống.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
						<AlertDialogAction
							disabled={isDeleting}
							onClick={(e) => {
								e.preventDefault();
								handleDelete();
							}}
							className="bg-red-600 hover:bg-red-700"
						>
							{isDeleting ? (
								<Loader2 className="w-4 h-4 mr-2 animate-spin" />
							) : (
								<Trash2 className="w-4 h-4 mr-2" />
							)}
							{isDeleting ? "Đang xóa..." : "Xác nhận xóa"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
