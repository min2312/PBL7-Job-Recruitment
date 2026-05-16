import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import {
	Loader2,
	DollarSign,
	CheckCircle2,
	Clock,
	XCircle,
	Calendar,
	TrendingUp,
	RefreshCw,
	Layers,
	FileText,
	User as UserIcon,
	Filter,
} from "lucide-react";
import axiosClient from "@/services/axiosClient";
import { toast } from "react-toastify";
import NumberedPagination from "@/components/NumberedPagination";
import { cn } from "@/lib/utils";

export default function AdminTransactions() {
	const [transactions, setTransactions] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	// Bộ lọc
	const [status, setStatus] = useState("ALL");
	const [mode, setMode] = useState<"all" | "day" | "month" | "year">("all");

	const TODAY_STR = new Date().toISOString().split("T")[0];
	const THIS_MONTH_STR = TODAY_STR.slice(0, 7);
	const THIS_YEAR_STR = TODAY_STR.slice(0, 4);

	const [dateValue, setDateValue] = useState(TODAY_STR);

	// Phân trang
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalRecords, setTotalRecords] = useState(0);

	// Thống kê
	const [statistics, setStatistics] = useState({
		totalRevenue: 0,
		successCount: 0,
		pendingCount: 0,
		cancelledCount: 0,
	});

	const handleModeChange = (newMode: "all" | "day" | "month" | "year") => {
		setMode(newMode);
		setCurrentPage(1);
		if (newMode === "day") setDateValue(TODAY_STR);
		else if (newMode === "month") setDateValue(THIS_MONTH_STR);
		else if (newMode === "year") setDateValue(THIS_YEAR_STR);
	};

	const fetchTransactions = async (
		page = currentPage,
		currentStatus = status,
		currentMode = mode,
		currentDateVal = dateValue,
	) => {
		try {
			if (!refreshing) setLoading(true);
			const params: any = {
				page,
				limit: 10,
				status: currentStatus,
				mode: currentMode,
				dateValue: currentMode !== "all" ? currentDateVal : undefined,
			};

			const res = await axiosClient.get("/api/admin/transactions", { params });
			if (res.data.errCode === 0) {
				setTransactions(res.data.data || []);
				if (res.data.pagination) {
					setTotalPages(res.data.pagination.totalPages || 1);
					setTotalRecords(res.data.pagination.totalRecords || 0);
				}
				if (res.data.statistics) {
					setStatistics(res.data.statistics);
				}
			} else {
				toast.error(res.data.errMessage || "Không thể tải danh sách giao dịch");
			}
		} catch (error) {
			toast.error("Lỗi kết nối máy chủ");
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	useEffect(() => {
		fetchTransactions(currentPage, status, mode, dateValue);
	}, [currentPage, status, mode, dateValue]);

	const formatVND = (amount: number) => {
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(amount);
	};

	return (
		<div className="space-y-8 pb-12">
			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl">
				<div>
					<h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
						<div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
							<DollarSign className="w-8 h-8" />
						</div>
						Quản lý Giao dịch MNP
					</h2>
					<p className="text-slate-300 mt-2 text-sm font-medium max-w-2xl">
						Hệ thống theo dõi và phân tích dòng tiền thanh toán dịch vụ đẩy tin tuyển dụng nổi bật của doanh nghiệp theo thời gian thực.
					</p>
				</div>
				<div className="flex items-center gap-3">
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							setRefreshing(true);
							fetchTransactions(currentPage, status, mode, dateValue);
						}}
						disabled={loading || refreshing}
						className="bg-white/10 hover:bg-white/20 border-white/20 text-white font-semibold gap-2 h-10 px-4 rounded-xl backdrop-blur-md transition-all"
					>
						<RefreshCw className={cn("w-4 h-4", refreshing ? "animate-spin" : "")} />
						Cập nhật dữ liệu
					</Button>
				</div>
			</div>

			{/* Thống kê Tổng quan (Metrics Grid) */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
				<Card className="border-border/60 shadow-sm hover:shadow-md transition-all bg-white relative overflow-hidden group">
					<div className="absolute top-0 left-0 h-1 w-full bg-emerald-500 transition-all group-hover:h-1.5" />
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div className="space-y-1">
								<p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
									Tổng doanh thu
								</p>
								<p className="text-2xl font-black text-emerald-600">
									{formatVND(statistics.totalRevenue)}
								</p>
							</div>
							<div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 group-hover:scale-110 transition-transform">
								<TrendingUp className="w-6 h-6" />
							</div>
						</div>
						<p className="text-xs text-slate-500 mt-3 flex items-center gap-1 font-medium">
							<span className="text-emerald-600 font-bold">100%</span> từ các đơn hàng thành công
						</p>
					</CardContent>
				</Card>

				<Card className="border-border/60 shadow-sm hover:shadow-md transition-all bg-white relative overflow-hidden group">
					<div className="absolute top-0 left-0 h-1 w-full bg-blue-500 transition-all group-hover:h-1.5" />
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div className="space-y-1">
								<p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
									Giao dịch thành công
								</p>
								<p className="text-2xl font-black text-blue-600">
									{statistics.successCount}
								</p>
							</div>
							<div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 group-hover:scale-110 transition-transform">
								<CheckCircle2 className="w-6 h-6" />
							</div>
						</div>
						<p className="text-xs text-slate-500 mt-3 flex items-center gap-1 font-medium">
							Dịch vụ ghim tin đã được kích hoạt tự động
						</p>
					</CardContent>
				</Card>

				<Card className="border-border/60 shadow-sm hover:shadow-md transition-all bg-white relative overflow-hidden group">
					<div className="absolute top-0 left-0 h-1 w-full bg-amber-500 transition-all group-hover:h-1.5" />
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div className="space-y-1">
								<p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
									Đang chờ thanh toán
								</p>
								<p className="text-2xl font-black text-amber-600">
									{statistics.pendingCount}
								</p>
							</div>
							<div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100 group-hover:scale-110 transition-transform">
								<Clock className="w-6 h-6" />
							</div>
						</div>
						<p className="text-xs text-slate-500 mt-3 flex items-center gap-1 font-medium">
							Đơn hàng đang chờ chuyển khoản từ MNP
						</p>
					</CardContent>
				</Card>

				<Card className="border-border/60 shadow-sm hover:shadow-md transition-all bg-white relative overflow-hidden group">
					<div className="absolute top-0 left-0 h-1 w-full bg-rose-500 transition-all group-hover:h-1.5" />
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div className="space-y-1">
								<p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
									Đơn hàng đã hủy
								</p>
								<p className="text-2xl font-black text-rose-600">
									{statistics.cancelledCount}
								</p>
							</div>
							<div className="p-3 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 group-hover:scale-110 transition-transform">
								<XCircle className="w-6 h-6" />
							</div>
						</div>
						<p className="text-xs text-slate-500 mt-3 flex items-center gap-1 font-medium">
							Khách hàng hủy hoặc quá hạn thanh toán
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Thanh Bộ lọc (Filter Bar) */}
			<Card className="border-border/60 shadow-sm bg-white overflow-hidden">
				<CardContent className="p-5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-slate-50/50">
					{/* Chế độ thời gian (Mode Selector) */}
					<div className="flex flex-wrap items-center gap-2">
						<span className="text-sm font-bold text-slate-700 flex items-center gap-1.5 mr-2">
							<Calendar className="w-4 h-4 text-primary" /> Khung thời gian:
						</span>
						<div className="inline-flex p-1 bg-slate-200/80 rounded-xl gap-1">
							{(
								[
									{ id: "all", label: "Tất cả" },
									{ id: "day", label: "Theo ngày" },
									{ id: "month", label: "Theo tháng" },
									{ id: "year", label: "Theo năm" },
								] as const
							).map((item) => (
								<button
									key={item.id}
									onClick={() => handleModeChange(item.id)}
									className={cn(
										"px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all",
										mode === item.id
											? "bg-white text-slate-900 shadow-sm font-black"
											: "text-slate-600 hover:text-slate-900 hover:bg-white/50",
									)}
								>
									{item.label}
								</button>
							))}
						</div>

						{/* Input chọn giá trị thời gian (nếu mode != all) */}
						{mode !== "all" && (
							<DatePicker
								picker={mode === "month" ? "month" : mode === "year" ? "year" : "date"}
								value={dateValue ? dayjs(dateValue) : null}
								format={mode === "month" ? "MM/YYYY" : mode === "year" ? "YYYY" : "DD/MM/YYYY"}
								onChange={(date) => {
									if (date) {
										const formatStr = mode === "month" ? "YYYY-MM" : mode === "year" ? "YYYY" : "YYYY-MM-DD";
										setDateValue(date.format(formatStr));
										setCurrentPage(1);
									}
								}}
								allowClear={false}
								className="w-44 h-10 rounded-xl text-xs font-bold border border-slate-200 shadow-sm hover:border-purple-400 focus:border-purple-600 px-3.5"
							/>
						)}
					</div>

					{/* Bộ lọc trạng thái (Status Filter) */}
					<div className="flex items-center gap-3">
						<span className="text-sm font-bold text-slate-700 flex items-center gap-1.5 whitespace-nowrap">
							<Filter className="w-4 h-4 text-primary" /> Trạng thái:
						</span>
						<Select
							value={status}
							onValueChange={(val) => {
								setStatus(val);
								setCurrentPage(1);
							}}
						>
							<SelectTrigger className="w-44 h-10 bg-white border-slate-200 hover:bg-slate-50 text-xs font-bold shadow-sm rounded-xl px-3.5 py-2 text-slate-700 font-semibold">
								<SelectValue placeholder="Tất cả trạng thái" />
							</SelectTrigger>
							<SelectContent className="bg-white rounded-2xl shadow-xl border border-slate-100">
								<SelectItem value="ALL" className="font-medium">Tất cả trạng thái</SelectItem>
								<SelectItem value="SUCCESS" className="font-medium">Thành công</SelectItem>
								<SelectItem value="PENDING" className="font-medium">Đang chờ</SelectItem>
								<SelectItem value="CANCELLED" className="font-medium">Đã hủy</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Danh sách Bảng Giao dịch */}
			<Card className="border-border/60 shadow-sm bg-white overflow-hidden">
				<CardHeader className="border-b border-border/40 px-6 py-4 flex flex-row items-center justify-between bg-slate-50/50">
					<CardTitle className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
						<FileText className="w-5 h-5 text-purple-600" />
						Danh sách Giao dịch Chi tiết
					</CardTitle>
					<div className="text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
						Tổng số: <span className="text-purple-600 font-black">{totalRecords}</span> bản ghi
					</div>
				</CardHeader>
				<CardContent className="p-0">
					{loading && !refreshing ? (
						<div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
							<Loader2 className="w-10 h-10 animate-spin text-purple-600 mb-3" />
							<p className="text-sm font-medium">Đang tải dữ liệu giao dịch...</p>
						</div>
					) : (
						<Table>
							<TableHeader className="bg-slate-100/80">
								<TableRow>
									<TableHead className="w-28 font-bold text-slate-700">Mã đơn</TableHead>
									<TableHead className="font-bold text-slate-700">Người thanh toán</TableHead>
									<TableHead className="font-bold text-slate-700">Gói dịch vụ</TableHead>
									<TableHead className="text-right font-bold text-slate-700">Số tiền</TableHead>
									<TableHead className="text-center font-bold text-slate-700">Trạng thái</TableHead>
									<TableHead className="text-right font-bold text-slate-700">Thời gian</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{transactions.length === 0 ? (
									<TableRow>
										<TableCell colSpan={6} className="text-center text-muted-foreground py-16">
											<div className="flex flex-col items-center justify-center space-y-2">
												<Layers className="w-12 h-12 text-slate-300 opacity-60" />
												<p className="text-base font-semibold text-slate-600">Không tìm thấy giao dịch nào</p>
												<p className="text-xs text-slate-400">Thử điều chỉnh khung thời gian hoặc bộ lọc trạng thái</p>
											</div>
										</TableCell>
									</TableRow>
								) : (
									transactions.map((t) => (
										<TableRow key={t.id} className="hover:bg-slate-50/80 transition-colors group">
											{/* Order Code */}
											<TableCell className="font-mono text-xs font-bold text-slate-700 group-hover:text-purple-600 transition-colors">
												#{t.orderCode}
											</TableCell>

											{/* User Info */}
											<TableCell>
												<div className="flex items-center gap-3">
													<div className="w-9 h-9 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
														{t.User?.profilePicture ? (
															<img
																src={t.User.profilePicture}
																alt={t.User.name}
																className="w-full h-full object-cover"
															/>
														) : (
															<UserIcon className="w-4 h-4 text-slate-500" />
														)}
													</div>
													<div className="max-w-[200px] sm:max-w-none">
														<div className="font-extrabold text-sm text-slate-800 truncate">
															{t.User?.name || "Người dùng ẩn danh"}
														</div>
														<div className="text-xs text-slate-500 truncate font-medium">
															{t.User?.email || "Không có email"}
														</div>
													</div>
												</div>
											</TableCell>

											{/* Job Service Item */}
											<TableCell>
												<div className="flex items-center gap-2">
													<span className="px-2 py-0.5 bg-amber-500 text-white rounded-md text-[10px] font-extrabold uppercase shadow-sm">
														Ghim VIP 7 Ngày
													</span>
													<span className="font-semibold text-sm text-slate-700 max-w-[250px] truncate">
														{t.Job?.title || <span className="text-slate-400 italic">Công việc đã bị gỡ</span>}
													</span>
												</div>
											</TableCell>

											{/* Amount */}
											<TableCell className="text-right font-black text-emerald-600 text-base">
												{formatVND(t.amount)}
											</TableCell>

											{/* Status Badge */}
											<TableCell className="text-center">
												{t.status === "SUCCESS" ? (
													<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm gap-1.5">
														<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
														Thành công
													</span>
												) : t.status === "PENDING" ? (
													<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-700 border border-amber-200 shadow-sm gap-1.5">
														<span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
														Chờ xử lý
													</span>
												) : (
													<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-rose-50 text-rose-700 border border-rose-200 shadow-sm gap-1.5">
														<span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
														Đã hủy
													</span>
												)}
											</TableCell>

											{/* Date */}
											<TableCell className="text-right text-xs font-bold text-slate-500">
												{new Date(t.createdAt).toLocaleString("vi-VN", {
													hour: "2-digit",
													minute: "2-digit",
													day: "2-digit",
													month: "2-digit",
													year: "numeric",
												})}
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					)}

					{/* Phân trang (Pagination Footer) */}
					{totalPages > 1 && (
						<div className="border-t border-border/40 px-6 py-5 flex items-center justify-center bg-slate-50/50">
							<NumberedPagination
								currentPage={currentPage}
								totalPages={totalPages}
								onPageChange={(page) => setCurrentPage(page)}
							/>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
