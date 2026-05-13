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
import { Loader2, DollarSign } from "lucide-react";
import axiosClient from "@/services/axiosClient";
import { toast } from "react-toastify";

export default function AdminTransactions() {
	const [transactions, setTransactions] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchTransactions = async () => {
			try {
				const res = await axiosClient.get("/api/admin/transactions");
				if (res.data.errCode === 0) {
					setTransactions(res.data.data);
				} else {
					toast.error("Không thể tải danh sách giao dịch");
				}
			} catch (error) {
				toast.error("Lỗi kết nối máy chủ");
			} finally {
				setLoading(false);
			}
		};
		fetchTransactions();
	}, []);

	if (loading) {
		return (
			<div className="flex justify-center items-center h-64">
				<Loader2 className="w-8 h-8 animate-spin text-primary" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold tracking-tight">Giao dịch PayOS</h2>
				<p className="text-muted-foreground">
					Lịch sử thanh toán dịch vụ đẩy tin của Nhà tuyển dụng
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg">
						<DollarSign className="w-5 h-5 text-emerald-500" />
						Lịch sử thanh toán
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Mã đơn</TableHead>
								<TableHead>Người dùng</TableHead>
								<TableHead>Công việc</TableHead>
								<TableHead className="text-right">Số tiền</TableHead>
								<TableHead className="text-center">Trạng thái</TableHead>
								<TableHead className="text-right">Thời gian</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{transactions.length === 0 ? (
								<TableRow>
									<TableCell colSpan={6} className="text-center text-muted-foreground py-10">
										Chưa có giao dịch nào
									</TableCell>
								</TableRow>
							) : (
								transactions.map((t) => (
									<TableRow key={t.id}>
										<TableCell className="font-mono text-xs">{t.orderCode}</TableCell>
										<TableCell>
											<div className="font-medium">{t.User?.name || "N/A"}</div>
											<div className="text-xs text-muted-foreground">{t.User?.email}</div>
										</TableCell>
										<TableCell>
											{t.Job?.title || <span className="text-muted-foreground italic">Đã xóa</span>}
										</TableCell>
										<TableCell className="text-right font-semibold text-emerald-600">
											{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(t.amount)}
										</TableCell>
										<TableCell className="text-center">
											{t.status === 'SUCCESS' ? (
												<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
													Thành công
												</span>
											) : t.status === 'PENDING' ? (
												<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
													Chờ xử lý
												</span>
											) : (
												<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
													Đã hủy
												</span>
											)}
										</TableCell>
										<TableCell className="text-right text-xs">
											{new Date(t.createdAt).toLocaleString('vi-VN')}
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
