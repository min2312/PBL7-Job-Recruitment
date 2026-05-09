import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Eye,
	Trash2,
	Briefcase,
	Building2,
	Search,
	MapPin,
	Calendar,
	Clock,
	CheckCircle2,
	XCircle,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import axiosClient from "@/services/axiosClient";
import ConfirmModal from "@/components/ConfirmModal";
import InfoModal from "@/components/InfoModal";
import NumberedPagination from "@/components/NumberedPagination";

export function AdminJobs() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [jobs, setJobs] = useState<any[]>([]);
	const [totalItems, setTotalItems] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState("ALL");
	const [debouncedSearch, setDebouncedSearch] = useState("");

	// Modal states
	const [confirmModal, setConfirmModal] = useState<{
		isOpen: boolean;
		title: string;
		description: string;
		onConfirm: () => void;
	}>({
		isOpen: false,
		title: "",
		description: "",
		onConfirm: () => {},
	});

	const [infoModal, setInfoModal] = useState<{
		isOpen: boolean;
		title: string;
		description: string;
		variant: "success" | "info";
		onConfirm: () => void;
	}>({
		isOpen: false,
		title: "",
		description: "",
		variant: "info",
		onConfirm: () => {},
	});

	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(search);
			setCurrentPage(1);
		}, 500);
		return () => clearTimeout(timer);
	}, [search]);

	useEffect(() => {
		fetchJobs();
	}, [currentPage, debouncedSearch, statusFilter]);

	const fetchJobs = async () => {
		setLoading(true);
		try {
			const res = await axiosClient.get("/api/admin/jobs", {
				params: {
					page: currentPage,
					limit: 10,
					search: debouncedSearch,
					status: statusFilter,
				},
			});
			if (res.data.errCode === 0) {
				setJobs(res.data.data.jobs);
				setTotalItems(res.data.data.totalItems);
				setTotalPages(res.data.data.totalPages);
			}
		} catch (error) {
			console.error("Error fetching jobs:", error);
			toast.error("Không thể tải danh sách việc làm");
		} finally {
			setLoading(false);
		}
	};

	const handleUpdateStatus = (id: number, currentStatus: string) => {
		const nextStatus = currentStatus === "open" ? "closed" : "open";

		if (nextStatus === "closed") {
			setConfirmModal({
				isOpen: true,
				title: "Đóng tin tuyển dụng?",
				description:
					"Ứng viên sẽ không thể tìm thấy hoặc ứng tuyển vào tin này nữa.",
				onConfirm: async () => {
					try {
						const res = await axiosClient.post("/api/admin/jobs/status", {
							jobId: id,
							status: nextStatus,
						});
						if (res.data.errCode === 0) {
							toast.success("Đã đóng tin tuyển dụng");
							fetchJobs();
						}
					} catch (error) {
						toast.error("Thao tác thất bại");
					}
					setConfirmModal((prev) => ({ ...prev, isOpen: false }));
				},
			});
		} else {
			setInfoModal({
				isOpen: true,
				title: "Mở lại tin tuyển dụng?",
				description:
					"Tin tuyển dụng sẽ hiển thị công khai và cho phép ứng tuyển.",
				variant: "success",
				onConfirm: async () => {
					try {
						const res = await axiosClient.post("/api/admin/jobs/status", {
							jobId: id,
							status: nextStatus,
						});
						if (res.data.errCode === 0) {
							toast.success("Đã mở lại tin tuyển dụng");
							fetchJobs();
						}
					} catch (error) {
						toast.error("Thao tác thất bại");
					}
					setInfoModal((prev) => ({ ...prev, isOpen: false }));
				},
			});
		}
	};

	const handleDelete = (id: number) => {
		setConfirmModal({
			isOpen: true,
			title: "Xóa tin tuyển dụng?",
			description:
				"Hành động này sẽ xóa vĩnh viễn tin tuyển dụng và toàn bộ đơn ứng tuyển liên quan.",
			onConfirm: async () => {
				try {
					const res = await axiosClient.delete("/api/admin/jobs/delete", {
						data: { jobId: id },
					});
					if (res.data.errCode === 0) {
						toast.success("Đã xóa tin tuyển dụng");
						fetchJobs();
					}
				} catch (error) {
					toast.error("Xóa thất bại");
				}
				setConfirmModal((prev) => ({ ...prev, isOpen: false }));
			},
		});
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className="space-y-6"
		>
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
						<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
							<Briefcase className="w-6 h-6" />
						</div>
						Quản lý việc làm
					</h1>
					<p className="text-muted-foreground mt-1 text-sm font-medium">
						Hiện có tổng cộng {totalItems} tin tuyển dụng trong hệ thống
					</p>
				</div>
				<div className="flex items-center gap-2">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
						<input
							type="text"
							placeholder="Tìm theo tiêu đề..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="pl-10 pr-4 py-2.5 bg-card/50 border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-[280px] transition-all"
						/>
					</div>
					<select
						value={statusFilter}
						onChange={(e) => {
							setStatusFilter(e.target.value);
							setCurrentPage(1);
						}}
						className="bg-card/50 border border-border/50 px-4 py-2.5 rounded-xl text-sm focus:outline-none cursor-pointer font-bold"
					>
						<option value="ALL">Tất cả trạng thái</option>
						<option value="open">Đang mở</option>
						<option value="closed">Đã đóng</option>
					</select>
				</div>
			</div>

			<div className="bg-card/40 backdrop-blur-md rounded-[2rem] border border-border/50 overflow-hidden shadow-xl">
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="bg-muted/30 border-b border-border/50">
								<th className="text-left p-5 font-bold text-muted-foreground uppercase tracking-widest text-[10px] w-[30%]">
									Việc làm
								</th>
								<th className="text-left p-5 font-bold text-muted-foreground uppercase tracking-widest text-[10px] w-[20%]">
									Lương & Cấp bậc
								</th>
								<th className="text-left p-5 font-bold text-muted-foreground uppercase tracking-widest text-[10px] w-[15%]">
									Ngày đăng
								</th>
								<th className="text-left p-5 font-bold text-muted-foreground uppercase tracking-widest text-[10px] w-[15%]">
									Trạng thái
								</th>
								<th className="text-right p-5 font-bold text-muted-foreground uppercase tracking-widest text-[10px] w-[20%]">
									Hành động
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border/30">
							<AnimatePresence mode="popLayout">
								{loading
									? Array.from({ length: 5 }).map((_, i) => (
											<tr key={`skeleton-${i}`} className="animate-pulse">
												<td colSpan={5} className="p-8">
													<div className="h-4 bg-muted/50 rounded-full w-full"></div>
												</td>
											</tr>
										))
									: jobs.map((j, i) => (
											<motion.tr
												key={j.id}
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												exit={{ opacity: 0 }}
												transition={{ delay: i * 0.05 }}
												className="hover:bg-primary/[0.02] transition-colors"
											>
												<td className="p-5">
													<div className="flex items-center gap-4">
														<div className="w-12 h-12 rounded-2xl bg-muted/50 overflow-hidden flex items-center justify-center border border-border/50 shrink-0">
															{j.Company?.logo ? (
																<img
																	src={j.Company.logo}
																	alt=""
																	className="w-full h-full object-cover"
																/>
															) : (
																<Building2 className="w-6 h-6 text-muted-foreground/30" />
															)}
														</div>
														<div className="min-w-0">
															<div
																className="font-bold text-foreground text-base truncate hover:text-primary transition-colors cursor-pointer"
																onClick={() => navigate(`/admin/jobs/${j.id}`)}
															>
																{j.title}
															</div>
															<div className="text-xs text-muted-foreground font-medium flex items-center gap-1 truncate">
																<Building2 className="w-3 h-3 shrink-0" />
																{j.Company?.name}
															</div>
														</div>
													</div>
												</td>
												<td className="p-5">
													<div className="space-y-1">
														<div className="text-sm font-bold text-emerald-600 truncate">
															{j.salary || "Thỏa thuận"}
														</div>
														<div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-muted/50 px-1.5 py-0.5 rounded inline-block">
															{j.level}
														</div>
													</div>
												</td>
												<td className="p-5">
													<div className="flex items-center gap-2 text-muted-foreground font-medium whitespace-nowrap">
														<Calendar className="w-4 h-4" />
														{new Date(j.createdAt).toLocaleDateString("vi-VN")}
													</div>
												</td>
												<td className="p-5">
													<div className="flex flex-col gap-1">
														{j.isHiddenByBlockedEmployer ? (
															<Badge className="bg-red-600 text-white border-none font-black text-[10px] uppercase px-2 py-1 h-auto w-fit shadow-[0_0_10px_rgba(220,38,38,0.3)] animate-pulse">
																Tài khoản bị khóa
															</Badge>
														) : (
															<div className="flex items-center gap-2">
																<div
																	className={`w-2 h-2 rounded-full shrink-0 ${j.status === "open" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"}`}
																></div>
																<span
																	className={`text-xs font-bold uppercase tracking-tight whitespace-nowrap ${j.status === "open" ? "text-emerald-500" : "text-red-500"}`}
																>
																	{j.status === "open" ? "Đang mở" : "Đã đóng"}
																</span>
															</div>
														)}
													</div>
												</td>
												<td className="p-5 text-right">
													<div className="flex gap-2 justify-end">
														<Button
															variant="ghost"
															size="sm"
															className={`h-9 w-9 p-0 rounded-xl ${j.isHiddenByBlockedEmployer ? "opacity-20 cursor-not-allowed" : j.status === "open" ? "text-amber-500 hover:bg-amber-500/10" : "text-emerald-500 hover:bg-emerald-500/10"}`}
															onClick={() =>
																!j.isHiddenByBlockedEmployer &&
																handleUpdateStatus(j.id, j.status)
															}
															title={
																j.isHiddenByBlockedEmployer
																	? "NTD bị khóa"
																	: j.status === "open"
																		? "Đóng tin"
																		: "Mở lại"
															}
														>
															{j.status === "open" ? (
																<XCircle className="w-4.5 h-4.5" />
															) : (
																<CheckCircle2 className="w-4.5 h-4.5" />
															)}
														</Button>
														<Button
															variant="ghost"
															size="sm"
															className="h-9 w-9 p-0 text-muted-foreground hover:bg-muted/50 rounded-xl"
															onClick={() => navigate(`/admin/jobs/${j.id}`)}
															title="Xem chi tiết"
														>
															<Eye className="w-4.5 h-4.5" />
														</Button>
														<Button
															variant="ghost"
															size="sm"
															className="h-9 w-9 p-0 text-destructive hover:bg-destructive/10 rounded-xl"
															onClick={() => handleDelete(j.id)}
															title="Xóa tin"
														>
															<Trash2 className="w-4.5 h-4.5" />
														</Button>
													</div>
												</td>
											</motion.tr>
										))}
							</AnimatePresence>
						</tbody>
					</table>
				</div>

				{totalPages > 1 && (
					<div className="p-6 border-t border-border/30 flex items-center justify-between bg-muted/10">
						<p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
							Tổng {totalItems} kết quả
						</p>
						<NumberedPagination
							currentPage={currentPage}
							totalPages={totalPages}
							onPageChange={(page) => setCurrentPage(page)}
						/>
					</div>
				)}
			</div>

			<ConfirmModal
				isOpen={confirmModal.isOpen}
				onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
				onConfirm={confirmModal.onConfirm as any}
				title={confirmModal.title}
				description={confirmModal.description}
			/>

			<InfoModal
				isOpen={infoModal.isOpen}
				onClose={() => setInfoModal((prev) => ({ ...prev, isOpen: false }))}
				onConfirm={infoModal.onConfirm as any}
				title={infoModal.title}
				description={infoModal.description}
				variant={infoModal.variant}
				confirmText="Xác nhận"
			/>
		</motion.div>
	);
}
