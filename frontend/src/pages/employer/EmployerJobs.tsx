import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Plus, Search, MoreVertical, Loader2 } from "lucide-react";
import axiosClient from "@/services/axiosClient";
import { toast } from "react-toastify";
import NumberedPagination from "@/components/NumberedPagination";
import ConfirmModal from "@/components/ConfirmModal";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

interface Props {
	myJobs: any[];
	total: number;
	page: number;
	limit: number;
	onPageChange: (
		page: number,
		limit: number,
		search?: string,
		status?: string,
	) => void;
	refreshData: () => void;
}

export default function EmployerJobs({
	myJobs,
	total,
	page,
	limit,
	onPageChange,
	refreshData,
}: Props) {
	const navigate = useNavigate();
	const [search, setSearch] = useState("");
	const [deleteJobId, setDeleteJobId] = useState<number | null>(null);
	const [deleting, setDeleting] = useState(false);

	// Server-side search with debounce
	useEffect(() => {
		const delayDebounceFn = setTimeout(() => {
			// Avoid fetching on mount if search is empty since parent already fetched
			if (search !== "") {
				onPageChange(1, limit, search);
			} else if (page !== 1) {
				// If search is cleared, go back to page 1
				onPageChange(1, limit, "");
			}
		}, 500);

		return () => clearTimeout(delayDebounceFn);
	}, [search]);

	const confirmDelete = async () => {
		if (!deleteJobId) return;
		setDeleting(true);
		try {
			const res = await axiosClient.delete(`/api/jobs/delete/${deleteJobId}`);
			if (res.data.errCode === 0) {
				toast.success("Xóa tin tuyển dụng thành công");
				refreshData();
			} else {
				toast.error(res.data.errMessage || "Xóa thất bại");
			}
		} catch (error) {
			toast.error("Lỗi kết nối máy chủ");
		} finally {
			setDeleting(false);
			setDeleteJobId(null);
		}
	};

	// Scroll to top on mount
	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	// 🔥 xử lý data
	const jobs = myJobs.map((job) => {
		const isExpired = job.endDate && new Date(job.endDate) < new Date();

		return {
			...job,
			isExpired,
			applicantCount: job.applicantCount || 0,
			locationName:
				job.locations
					?.map((loc: any) => loc.name)
					.filter(Boolean)
					.join(", ") || "Toàn quốc",
		};
	});

	// 🔎 data is already filtered by server
	const filtered = jobs;

	const totalPages = Math.ceil(total / limit);

	return (
		<div className="space-y-6 max-w-6xl">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h2 className="text-2xl font-bold">Tin tuyển dụng</h2>
					<p className="text-sm text-muted-foreground">
						{myJobs.length} tin đăng
					</p>
				</div>

				<Button onClick={() => navigate("/employer/jobs/create")}>
					<Plus className="w-4 h-4 mr-2" /> Tạo tin mới
				</Button>
			</div>

			{/* Search */}
			<div className="flex gap-3">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
					<Input
						placeholder="Tìm theo tiêu đề..."
						className="pl-10"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>
			</div>

			{/* Table */}
			<Card>
				<CardContent className="p-0">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Tên công việc</TableHead>
								<TableHead>Vị trí</TableHead>
								<TableHead className="text-center">Số lượng ứng viên</TableHead>
								<TableHead className="text-center">Trạng thái</TableHead>
								<TableHead>Hạn nộp</TableHead>
								<TableHead className="text-right">Thao tác</TableHead>
							</TableRow>
						</TableHeader>

						<TableBody>
							{filtered.map((job) => {
								const daysLeft = job.endDate
									? Math.ceil(
											(new Date(job.endDate).getTime() - Date.now()) /
												(1000 * 60 * 60 * 24),
										)
									: null;

								return (
									<TableRow
										key={job.id}
										className="cursor-pointer hover:bg-muted/40"
										onClick={() => navigate(`/employer/jobs/${job.id}`)}
									>
										{/* Title */}
										<TableCell className="font-semibold">{job.title}</TableCell>

										{/* Location */}
										<TableCell>{job.locationName || "Chưa xác định"}</TableCell>

										{/* Applicants */}
										<TableCell className="text-center">
											{job.applicantCount}
										</TableCell>

										{/* Status */}
										<TableCell className="text-center">
											{job.status === "open" ? (
												<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
													Đang mở
												</span>
											) : (
												<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
													Đã đóng
												</span>
											)}
										</TableCell>

										{/* Deadline */}
										<TableCell>
											<div className="flex flex-col text-sm">
												<span>{job.endDate || "Không thời hạn"}</span>

												{job.endDate && (
													<span
														className={
															job.isExpired
																? "text-red-500 text-xs"
																: "text-emerald-500 text-xs"
														}
													>
														{job.isExpired ? "Hết hạn" : `Còn ${daysLeft} ngày`}
													</span>
												)}
											</div>
										</TableCell>

										{/* Actions */}
										<TableCell
											className="text-right"
											onClick={(e) => e.stopPropagation()}
										>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="icon">
														<MoreVertical className="w-4 h-4" />
													</Button>
												</DropdownMenuTrigger>

												<DropdownMenuContent align="end">
													<DropdownMenuItem
														onClick={() => navigate(`/employer/jobs/${job.id}`)}
													>
														Xem chi tiết
													</DropdownMenuItem>

													<DropdownMenuItem
														onClick={() =>
															navigate(`/employer/jobs/edit/${job.id}`)
														}
													>
														Chỉnh sửa
													</DropdownMenuItem>

													<DropdownMenuItem
														onClick={() => setDeleteJobId(job.id)}
														className="text-red-500"
													>
														Xóa
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									</TableRow>
								);
							})}

							{filtered.length === 0 && (
								<TableRow>
									<TableCell colSpan={5} className="text-center py-10">
										Không có dữ liệu
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			<div className="flex justify-center mt-6">
				<NumberedPagination
					currentPage={page}
					totalPages={totalPages}
					onPageChange={(p) => onPageChange(p, limit)}
				/>
			</div>

			{/* Delete Dialog */}
			<ConfirmModal
				isOpen={deleteJobId !== null}
				onClose={() => setDeleteJobId(null)}
				onConfirm={confirmDelete}
				isLoading={deleting}
				title="Xác nhận xóa"
				description="Hành động này không thể hoàn tác"
			/>
		</div>
	);
}
