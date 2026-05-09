import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Eye,
	Building2,
	Search,
	Globe,
	MapPin,
	Users,
	Trash2,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import axiosClient from "@/services/axiosClient";
import ConfirmModal from "@/components/ConfirmModal";
import NumberedPagination from "@/components/NumberedPagination";

export function AdminCompanies() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [companies, setCompanies] = useState<any[]>([]);
	const [totalItems, setTotalItems] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");

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
		fetchCompanies();
	}, [currentPage, debouncedSearch]);

	const fetchCompanies = async () => {
		setLoading(true);
		try {
			const res = await axiosClient.get("/api/admin/companies", {
				params: {
					page: currentPage,
					limit: 10,
					search: debouncedSearch,
				},
			});
			if (res.data.errCode === 0) {
				setCompanies(res.data.data.companies);
				setTotalItems(res.data.data.totalItems);
				setTotalPages(res.data.data.totalPages);
			}
		} catch (error) {
			console.error("Error fetching companies:", error);
			toast.error("Không thể tải danh sách công ty");
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = (id: number) => {
		setConfirmModal({
			isOpen: true,
			title: "Xóa công ty?",
			description:
				"Hành động này sẽ xóa vĩnh viễn thông tin công ty và mọi dữ liệu liên quan. Bạn có chắc chắn?",
			onConfirm: async () => {
				toast.info("Tính năng đang được phát triển");
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
							<Building2 className="w-6 h-6" />
						</div>
						Quản lý công ty
					</h1>
					<p className="text-muted-foreground mt-1 text-sm font-medium">
						Hiện có {totalItems} doanh nghiệp trên hệ thống
					</p>
				</div>
				<div className="flex items-center gap-2">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
						<input
							type="text"
							placeholder="Tìm tên công ty..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="pl-10 pr-4 py-2.5 bg-card/50 border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-[280px] transition-all"
						/>
					</div>
				</div>
			</div>

			<div className="bg-card/40 backdrop-blur-md rounded-[2rem] border border-border/50 overflow-hidden shadow-xl">
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="bg-muted/30 border-b border-border/50">
								<th className="text-left p-5 font-bold text-muted-foreground uppercase tracking-widest text-[10px] w-[35%]">
									Công ty
								</th>
								<th className="text-left p-5 font-bold text-muted-foreground uppercase tracking-widest text-[10px] w-[25%]">
									Liên hệ
								</th>
								<th className="text-left p-5 font-bold text-muted-foreground uppercase tracking-widest text-[10px] w-[15%]">
									Quy mô
								</th>
								<th className="text-left p-5 font-bold text-muted-foreground uppercase tracking-widest text-[10px] w-[10%]">
									Xác minh
								</th>
								<th className="text-right p-5 font-bold text-muted-foreground uppercase tracking-widest text-[10px] w-[15%]">
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
									: companies.map((c, i) => (
											<motion.tr
												key={c.id}
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												exit={{ opacity: 0 }}
												transition={{ delay: i * 0.05 }}
												className="hover:bg-primary/[0.02] transition-colors"
											>
												<td className="p-5">
													<div className="flex items-center gap-4">
														<div className="w-12 h-12 rounded-2xl bg-white p-2 border border-border/50 flex items-center justify-center shrink-0 shadow-sm">
															<img
																src={
																	c.logo ||
																	"https://placehold.co/100x100?text=Logo"
																}
																alt={c.name}
																className="w-full h-full object-contain"
															/>
														</div>
														<div className="min-w-0">
															<div
																className="font-bold text-foreground text-base truncate hover:text-primary transition-colors cursor-pointer"
																onClick={() =>
																	navigate(`/admin/companies/${c.id}`)
																}
															>
																{c.name}
															</div>
															<div className="text-xs text-muted-foreground font-medium flex items-center gap-1 truncate">
																<Globe className="w-3 h-3 shrink-0" />
																{c.website_url || "N/A"}
															</div>
														</div>
													</div>
												</td>
												<td className="p-5">
													<div className="flex flex-col gap-1 min-w-0">
														<div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
															<MapPin className="w-3.5 h-3.5 shrink-0" />
															<span className="truncate">
																{c.company_address || "N/A"}
															</span>
														</div>
														<div className="text-[11px] font-bold text-primary truncate pl-5">
															{c.email || "Liên hệ qua admin"}
														</div>
													</div>
												</td>
												<td className="p-5">
													<div className="flex items-center gap-2 text-muted-foreground font-medium">
														<Users className="w-4 h-4" />
														{c.company_scale || "N/A"}
													</div>
												</td>
												<td className="p-5 text-center">
													{c.isBlocked ? (
														<Badge className="bg-red-500/10 text-red-600 border-red-500/20 font-bold text-[10px] uppercase">
															Bị khóa
														</Badge>
													) : (
														<Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold text-[10px] uppercase">
															Đã xác thực
														</Badge>
													)}
												</td>
												<td className="p-5 text-right">
													<div className="flex gap-2 justify-end">
														<Button
															variant="ghost"
															size="sm"
															className="h-9 w-9 p-0 text-muted-foreground hover:bg-muted/50 rounded-xl"
															onClick={() =>
																navigate(`/admin/companies/${c.id}`)
															}
															title="Xem chi tiết"
														>
															<Eye className="w-4.5 h-4.5" />
														</Button>
														<Button
															variant="ghost"
															size="sm"
															className="h-9 w-9 p-0 text-destructive hover:bg-destructive/10 rounded-xl"
															onClick={() => handleDelete(c.id)}
															title="Xóa công ty"
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
		</motion.div>
	);
}
