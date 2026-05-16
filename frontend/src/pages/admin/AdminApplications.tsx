import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	FileText,
	Search,
	Calendar,
	User,
	Briefcase,
	Eye,
	ExternalLink,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import axiosClient from "@/services/axiosClient";

export function AdminApplications() {
	const [loading, setLoading] = useState(true);
	const [applications, setApplications] = useState<any[]>([]);
	const [totalItems, setTotalItems] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedApp, setSelectedApp] = useState<any>(null);
	const [showModal, setShowModal] = useState(false);

	useEffect(() => {
		window.scrollTo(0, 0);
		fetchApplications();
	}, [currentPage]);

	const fetchApplications = async () => {
		setLoading(true);
		try {
			const res = await axiosClient.get("/api/admin/applications", {
				params: {
					page: currentPage,
					limit: 10,
				},
			});
			if (res.data.errCode === 0) {
				setApplications(res.data.data.applications);
				setTotalItems(res.data.data.totalItems);
				setTotalPages(res.data.data.totalPages);
			}
		} catch (error) {
			console.error("Error fetching applications:", error);
			toast.error("Không thể tải danh sách đơn ứng tuyển");
		} finally {
			setLoading(false);
		}
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "pending":
				return (
					<Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold uppercase text-[10px]">
						Đang chờ
					</Badge>
				);
			case "interview":
				return (
					<Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 font-bold uppercase text-[10px]">
						Phỏng vấn
					</Badge>
				);
			case "approved":
				return (
					<Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold uppercase text-[10px]">
						Đã duyệt
					</Badge>
				);
			case "rejected":
				return (
					<Badge className="bg-red-500/10 text-red-600 border-red-500/20 font-bold uppercase text-[10px]">
						Từ chối
					</Badge>
				);
			default:
				return (
					<Badge className="bg-muted text-muted-foreground font-bold uppercase text-[10px]">
						{status}
					</Badge>
				);
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className="space-y-6"
		>
			<div>
				<h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
					<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
						<FileText className="w-6 h-6" />
					</div>
					Quản lý đơn ứng tuyển
				</h1>
				<p className="text-muted-foreground mt-1 text-sm font-medium">
					Theo dõi tất cả lượt ứng tuyển trên toàn hệ thống ({totalItems})
				</p>
			</div>

			<div className="bg-card/40 backdrop-blur-md rounded-[2rem] border border-border/50 overflow-hidden shadow-xl">
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="bg-muted/30 border-b border-border/50">
								<th className="text-left p-5 font-bold text-muted-foreground uppercase tracking-widest text-[10px] w-[30%]">
									Ứng viên
								</th>
								<th className="text-left p-5 font-bold text-muted-foreground uppercase tracking-widest text-[10px] w-[30%]">
									Công việc
								</th>
								<th className="text-left p-5 font-bold text-muted-foreground uppercase tracking-widest text-[10px] w-[15%]">
									Ngày gửi
								</th>
								<th className="text-left p-5 font-bold text-muted-foreground uppercase tracking-widest text-[10px] w-[15%]">
									Trạng thái
								</th>
								<th className="text-right p-5 font-bold text-muted-foreground uppercase tracking-widest text-[10px] w-[10%]">
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
									: applications.map((app, i) => (
											<motion.tr
												key={app.id}
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												exit={{ opacity: 0 }}
												transition={{ delay: i * 0.05 }}
												className="hover:bg-primary/[0.02] transition-colors"
											>
												<td className="p-5">
													<div className="flex items-center gap-3">
														<div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
															{app.User?.name?.charAt(0)}
														</div>
														<div className="min-w-0">
															<div className="font-bold text-foreground truncate">
																{app.User?.name}
															</div>
															<div className="text-[10px] text-muted-foreground font-medium truncate">
																{app.User?.email}
															</div>
														</div>
													</div>
												</td>
												<td className="p-5">
													<div className="flex items-center gap-2 font-bold text-foreground truncate">
														<Briefcase className="w-4 h-4 text-primary/40 shrink-0" />
														{app.Job?.title}
													</div>
												</td>
												<td className="p-5">
													<div className="flex items-center gap-2 text-muted-foreground font-medium whitespace-nowrap">
														<Calendar className="w-4 h-4" />
														{new Date(app.createdAt).toLocaleDateString(
															"vi-VN",
														)}
													</div>
												</td>
												<td className="p-5">{getStatusBadge(app.status)}</td>
												<td className="p-5 text-right">
													<Button
														variant="ghost"
														size="sm"
														onClick={() => {
															setSelectedApp(app);
															setShowModal(true);
														}}
														className="h-9 w-9 p-0 hover:bg-primary/10 text-primary rounded-xl"
													>
														<Eye className="w-4.5 h-4.5" />
													</Button>
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
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								disabled={currentPage === 1}
								onClick={() => setCurrentPage(prev => prev - 1)}
								className="rounded-xl font-bold gap-1"
							>
								<ChevronLeft className="w-4 h-4" /> Trước
							</Button>
							
							<div className="flex items-center gap-1.5 px-4 h-9 bg-card/50 rounded-xl border border-border/50 text-sm font-bold text-foreground">
								Trang {currentPage} / {totalPages}
							</div>

							<Button
								variant="outline"
								size="sm"
								disabled={currentPage === totalPages}
								onClick={() => setCurrentPage(prev => prev + 1)}
								className="rounded-xl font-bold gap-1"
							>
								Sau <ChevronRight className="w-4 h-4" />
							</Button>
						</div>
					</div>
				)}
			</div>

			{/* Modal Chi tiết đơn ứng tuyển (View-only) */}
			<Dialog open={showModal} onOpenChange={setShowModal}>
				<DialogContent className="max-w-2xl bg-white rounded-3xl p-8 border-0 shadow-2xl">
					<DialogHeader>
						<DialogTitle className="text-2xl font-black text-slate-800 flex items-center gap-3">
							<div className="w-10 h-10 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
								<FileText className="w-5 h-5" />
							</div>
							Chi tiết đơn ứng tuyển
						</DialogTitle>
					</DialogHeader>

					{selectedApp && (
						<div className="space-y-6 mt-4">
							{/* Thông tin ứng viên */}
							<div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex items-center gap-4">
								<div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xl font-extrabold shrink-0">
									{selectedApp.User?.name?.charAt(0)}
								</div>
								<div>
									<h3 className="text-lg font-bold text-slate-800">{selectedApp.User?.name}</h3>
									<p className="text-sm font-semibold text-slate-500 mt-0.5">{selectedApp.User?.email}</p>
									{selectedApp.User?.phone && (
										<p className="text-sm font-medium text-slate-500 mt-0.5">SĐT: {selectedApp.User?.phone}</p>
									)}
								</div>
							</div>

							{/* Công việc ứng tuyển */}
							<div className="space-y-3">
								<div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Công việc ứng tuyển</div>
								<div className="bg-purple-50 text-purple-700 rounded-2xl p-4 font-bold flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Briefcase className="w-5 h-5" />
										<span>{selectedApp.Job?.title}</span>
									</div>
									<a
										href={`/jobs/${selectedApp.Job?.id || selectedApp.job_id}`}
										target="_blank"
										rel="noreferrer"
										className="text-xs font-bold bg-white px-3 py-1.5 rounded-xl border border-purple-200 text-purple-600 flex items-center gap-1 hover:bg-purple-100 transition-all"
									>
										Xem tin <ExternalLink className="w-3.5 h-3.5" />
									</a>
								</div>
							</div>

							{/* Trạng thái & Quản lý */}
							<div className="grid grid-cols-2 gap-4">
								<div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-center">
									<div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Ngày nộp đơn</div>
									<div className="text-sm font-bold text-slate-700 flex items-center gap-2">
										<Calendar className="w-4 h-4 text-primary" />
										{new Date(selectedApp.createdAt).toLocaleDateString("vi-VN", {
											day: "2-digit",
											month: "2-digit",
											year: "numeric",
											hour: "2-digit",
											minute: "2-digit",
										})}
									</div>
								</div>
								<div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-center items-start">
									<div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Trạng thái hiện tại</div>
									<div>{getStatusBadge(selectedApp.status)}</div>
								</div>
							</div>

							{/* CV Đính kèm */}
							<div className="space-y-3">
								<div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hồ sơ ứng viên (CV/Resume)</div>
								{selectedApp.cv_file ? (
									<div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between">
										<div className="flex items-center gap-3 font-bold text-sm text-slate-700">
											<div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs uppercase">PDF/DOC</div>
											<span className="truncate max-w-xs">{selectedApp.cv_file.split('/').pop()}</span>
										</div>
										<a
											href={selectedApp.cv_file}
											target="_blank"
											rel="noreferrer"
											className="bg-primary text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md hover:bg-primary/90 transition-all inline-block"
										>
											Xem / Tải CV
										</a>
									</div>
								) : (
									<div className="bg-amber-50 text-amber-600 font-bold rounded-2xl p-4 text-xs flex items-center gap-2">
										<span>⚠️ Ứng viên không đính kèm file CV (Sử dụng hồ sơ trực tuyến).</span>
									</div>
								)}
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</motion.div>
	);
}
