import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Eye,
	Trash2,
	Pencil,
	Users as UsersIcon,
	Search,
	Filter,
	ShieldCheck,
	ShieldAlert,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import axiosClient from "@/services/axiosClient";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmModal from "@/components/ConfirmModal";
import InfoModal from "@/components/InfoModal";
import NumberedPagination from "@/components/NumberedPagination";

export function AdminUsers() {
	const [loading, setLoading] = useState(true);
	const [users, setUsers] = useState<any[]>([]);
	const [totalItems, setTotalItems] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [search, setSearch] = useState("");
	const [roleFilter, setRoleFilter] = useState("ALL");
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
		fetchUsers();
	}, [currentPage, debouncedSearch, roleFilter]);

	const fetchUsers = async () => {
		setLoading(true);
		try {
			const res = await axiosClient.get("/api/admin/users", {
				params: {
					page: currentPage,
					limit: 10,
					search: debouncedSearch,
					role: roleFilter,
				},
			});
			if (res.data.errCode === 0) {
				setUsers(res.data.data.users);
				setTotalItems(res.data.data.totalItems);
				setTotalPages(res.data.data.totalPages);
			}
		} catch (error) {
			console.error("Error fetching users:", error);
			toast.error("Không thể tải danh sách người dùng");
		} finally {
			setLoading(false);
		}
	};

	const handleSuspend = (id: number) => {
		setConfirmModal({
			isOpen: true,
			title: "Tạm khóa người dùng?",
			description:
				"Người dùng này sẽ không thể đăng nhập vào hệ thống cho đến khi được mở khóa lại.",
			onConfirm: async () => {
				try {
					const res = await axiosClient.post("/api/admin/users/suspend", {
						userId: id,
					});
					if (res.data.errCode === 0) {
						toast.success("Đã tạm khóa người dùng");
						fetchUsers();
					}
				} catch (error) {
					toast.error("Thao tác thất bại");
				}
				setConfirmModal((prev) => ({ ...prev, isOpen: false }));
			},
		});
	};

	const handleActivate = (id: number) => {
		setInfoModal({
			isOpen: true,
			title: "Kích hoạt lại tài khoản?",
			description:
				"Người dùng này sẽ có thể đăng nhập và sử dụng đầy đủ các tính năng của hệ thống.",
			variant: "success",
			onConfirm: async () => {
				try {
					const res = await axiosClient.post("/api/admin/users/activate", {
						userId: id,
					});
					if (res.data.errCode === 0) {
						toast.success("Đã kích hoạt người dùng");
						fetchUsers();
					}
				} catch (error) {
					toast.error("Thao tác thất bại");
				}
				setInfoModal((prev) => ({ ...prev, isOpen: false }));
			},
		});
	};

	const handleDelete = (id: number) => {
		setConfirmModal({
			isOpen: true,
			title: "Xác nhận xóa vĩnh viễn?",
			description:
				"Hành động này không thể hoàn tác. Mọi dữ liệu liên quan đến người dùng này sẽ bị xóa khỏi hệ thống.",
			onConfirm: async () => {
				try {
					const res = await axiosClient.delete("/api/admin/users/delete", {
						data: { userId: id },
					});
					if (res.data.errCode === 0) {
						toast.success("Đã xóa người dùng");
						fetchUsers();
					}
				} catch (error) {
					toast.error("Thao tác thất bại");
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
							<UsersIcon className="w-6 h-6" />
						</div>
						Quản lý người dùng
					</h1>
					<p className="text-muted-foreground mt-1 text-sm font-medium">
						Hiện có tổng cộng {totalItems} tài khoản trong hệ thống
					</p>
				</div>
				<div className="flex items-center gap-2">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
						<input
							type="text"
							placeholder="Tìm theo tên hoặc email..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="pl-10 pr-4 py-2.5 bg-card/50 border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-[280px] transition-all"
						/>
					</div>
					<select
						value={roleFilter}
						onChange={(e) => {
							setRoleFilter(e.target.value);
							setCurrentPage(1);
						}}
						className="bg-card/50 border border-border/50 px-4 py-2.5 rounded-xl text-sm focus:outline-none cursor-pointer font-bold"
					>
						<option value="ALL">Tất cả vai trò</option>
						<option value="ADMIN">Admin</option>
						<option value="EMPLOYER">Nhà tuyển dụng</option>
						<option value="CANDIDATE">Ứng viên</option>
					</select>
				</div>
			</div>

			<div className="bg-card/40 backdrop-blur-md rounded-[2rem] border border-border/50 overflow-hidden shadow-xl">
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="bg-muted/30 border-b border-border/50">
								<th className="text-left p-5 font-bold text-muted-foreground uppercase tracking-widest text-[10px] w-[35%]">
									Người dùng
								</th>
								<th className="text-left p-5 font-bold text-muted-foreground uppercase tracking-widest text-[10px] w-[15%]">
									Vai trò
								</th>
								<th className="text-left p-5 font-bold text-muted-foreground uppercase tracking-widest text-[10px] w-[15%]">
									Ngày tạo
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
									: users.map((u, i) => (
											<motion.tr
												key={u.id}
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												exit={{ opacity: 0 }}
												transition={{ delay: i * 0.05 }}
												className="hover:bg-primary/[0.02] transition-colors"
											>
												<td className="p-5">
													<div className="flex items-center gap-3">
														<div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center font-bold text-primary border border-primary/10 shrink-0">
															{u.name?.charAt(0)}
														</div>
														<div className="min-w-0">
															<div className="font-bold text-foreground text-base truncate">
																{u.name}
															</div>
															<div className="text-xs text-muted-foreground font-medium truncate">
																{u.email}
															</div>
														</div>
													</div>
												</td>
												<td className="p-5">
													<Badge
														variant="outline"
														className={`px-2.5 py-0.5 rounded-lg font-bold text-[10px] uppercase tracking-wider ${
															u.role === "ADMIN"
																? "bg-purple-500/10 text-purple-600 border-purple-500/20"
																: u.role === "EMPLOYER"
																	? "bg-blue-500/10 text-blue-600 border-blue-500/20"
																	: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
														}`}
													>
														{u.role === "CANDIDATE"
															? "Ứng viên"
															: u.role === "EMPLOYER"
																? "Nhà tuyển dụng"
																: "Admin"}
													</Badge>
												</td>
												<td className="p-5 text-muted-foreground font-medium whitespace-nowrap">
													{new Date(u.createdAt).toLocaleDateString("vi-VN")}
												</td>
												<td className="p-5">
													<div className="flex items-center gap-2">
														<div
															className={`w-2 h-2 rounded-full shrink-0 ${!u.is_active ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"}`}
														></div>
														<span
															className={`text-xs font-bold uppercase tracking-tight whitespace-nowrap ${!u.is_active ? "text-red-500" : "text-emerald-500"}`}
														>
															{!u.is_active ? "Bị khóa" : "Hoạt động"}
														</span>
													</div>
												</td>
												<td className="p-5 text-right">
													<div className="flex gap-2 justify-end">
														{!u.is_active ? (
															<Button
																onClick={() => handleActivate(u.id)}
																variant="ghost"
																size="sm"
																className="h-9 w-9 p-0 text-emerald-600 hover:bg-emerald-500/10 rounded-xl"
																title="Kích hoạt"
															>
																<ShieldCheck className="w-4.5 h-4.5" />
															</Button>
														) : (
															<Button
																onClick={() => handleSuspend(u.id)}
																variant="ghost"
																size="sm"
																className="h-9 w-9 p-0 text-amber-600 hover:bg-amber-500/10 rounded-xl"
																title="Tạm khóa"
															>
																<ShieldAlert className="w-4.5 h-4.5" />
															</Button>
														)}
														<Button
															variant="ghost"
															size="sm"
															className="h-9 w-9 p-0 text-destructive hover:bg-destructive/10 rounded-xl"
															onClick={() => handleDelete(u.id)}
															title="Xóa vĩnh viễn"
														>
															<Trash2 className="w-4.5 h-4.5" />
														</Button>
													</div>
												</td>
											</motion.tr>
										))}
							</AnimatePresence>
							{!loading && users.length === 0 && (
								<tr>
									<td colSpan={5} className="text-center p-20">
										<div className="flex flex-col items-center gap-3">
											<div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
												<UsersIcon className="w-8 h-8 text-muted-foreground/30" />
											</div>
											<p className="text-muted-foreground font-bold">
												Không tìm thấy người dùng nào
											</p>
										</div>
									</td>
								</tr>
							)}
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
