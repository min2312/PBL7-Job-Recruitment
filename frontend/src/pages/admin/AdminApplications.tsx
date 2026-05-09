import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
		</motion.div>
	);
}
