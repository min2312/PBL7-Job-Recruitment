import { Job } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { DollarSign, MapPin, Clock } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import axiosClient from "@/services/axiosClient";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import { TruncatedLocations } from "./TruncatedLocations";

interface JobPreviewPopupProps {
	job: Job;
	position?: { top: number; left: number };
	onPopupHover?: (hovered: boolean) => void;
}

export default function JobPreviewPopup({
	job,
	position,
	onPopupHover,
}: JobPreviewPopupProps) {
	const navigate = useNavigate();
	const { user } = useAuth();
	const [isApplied, setIsApplied] = useState(job.isApplied || false);
	const [isCancelling, setIsCancelling] = useState(false);
	
	const company = (job as any).Company;
	const locations = (job as any).locations?.map((l: any) => l.name) || [];
	const headerLocationName = locations[0] ?? null;
	const detailedLocation = job.workLocation || headerLocationName;

	const handleCancelApply = async (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!user) {
			navigate('/login');
			return;
		}
		
		setIsCancelling(true);
		try {
			const response = await axiosClient.delete('/api/jobs/cancel-apply', {
				data: { jobId: job.id }
			});
			if (response.data.errCode === 0) {
				setIsApplied(false);
				toast.success('Hủy ứng tuyển thành công');
			} else {
				toast.error(response.data.errMessage || 'Lỗi khi hủy ứng tuyển');
			}
		} catch (error) {
			toast.error('Lỗi hệ thống khi hủy ứng tuyển');
		} finally {
			setIsCancelling(false);
		}
	};
	return (
		<div
			className="fixed z-50 bg-white rounded-lg border border-slate-300 shadow-2xl p-6 w-96 animate-in fade-in max-h-[380px] overflow-y-auto"
			style={{
				top: position?.top || 0,
				left: position?.left || 0,
			}}
			onMouseEnter={() => onPopupHover?.(true)}
			onMouseLeave={() => onPopupHover?.(false)}
		>
			{/* Company Header */}
			<div className="flex items-start gap-3 mb-4">
				<div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-200">
					{company?.logo ? (
						<img
							src={company.logo}
							alt={company?.name || "company"}
							className="w-full h-full object-contain"
							onError={(e) => {
								(e.target as HTMLImageElement).style.display = "none";
							}}
						/>
					) : (
						<div className="w-10 h-10 bg-gradient-to-br from-slate-300 to-slate-400 rounded-lg"></div>
					)}
				</div>
				<div className="flex-1 min-w-0">
					<h3 className="font-bold text-slate-900 text-base line-clamp-2">
						{job.title}
					</h3>
					<p className="text-sm text-slate-600 mt-1 font-medium">
						{company?.name || "Công ty"}
					</p>
				</div>
			</div>

			{/* Key Info - Grid Layout */}
			<div className="mb-4 pb-4 border-b border-slate-200">
				<div className="grid grid-cols-3 gap-3">
					<div className="text-center">
						<div className="flex items-center justify-center gap-1 mb-1">
							<DollarSign className="w-4 h-4 text-emerald-600" />
						</div>
						<p className="text-sm font-semibold text-slate-900 line-clamp-2">
							{job.salary || "chưa xác định"}
						</p>
					</div>
					<div className="text-center">
						<div className="flex items-center justify-center gap-1 mb-1">
							<MapPin className="w-4 h-4 text-slate-600" />
						</div>
						<div className="text-sm font-semibold text-slate-900">
							<TruncatedLocations locations={locations} maxShow={1} />
						</div>
					</div>
					<div className="text-center">
						<div className="flex items-center justify-center gap-1 mb-1">
							<Clock className="w-4 h-4 text-slate-600" />
						</div>
						<p className="text-sm font-semibold text-slate-900">
							{job.experience || "Chưa xác định"}
						</p>
					</div>
				</div>
			</div>

			{/* Description Preview */}
			<div className="mb-4">
				<h4 className="font-semibold text-slate-900 text-sm mb-3 flex items-center gap-2">
					<div className="w-1 h-4 bg-emerald-600 rounded"></div>
					Mô tả công việc
				</h4>
				{job.description ? (
					<div className="text-xs text-slate-600 space-y-2">
						{job.description
							.split(/\n{1,}|\.|\n/)
							.filter(Boolean)
							.slice(0, 6)
							.map((p: string, idx: number) => (
								<p key={idx} className="truncate text-sm">
									{p.trim()}
									{idx === 5 ? "..." : ""}
								</p>
							))}
					</div>
				) : (
					<ul className="text-xs text-slate-600 space-y-2">
						<li className="flex gap-2">
							<span className="text-emerald-600 font-bold">•</span>
							<span>
								Tiếp nhận chứng từ từ phía khách hàng, kiểm tra tính hợp lệ của
								chứng từ
							</span>
						</li>
						<li className="flex gap-2">
							<span className="text-emerald-600 font-bold">•</span>
							<span>
								Xử lý tờ khai xuất nhập khẩu thuốc lá hàng nhà máy, hàng kinh
								doanh
							</span>
						</li>
						<li className="flex gap-2">
							<span className="text-emerald-600 font-bold">•</span>
							<span>
								Phân luồng tờ khai sau khi có xác nhận từ phía khách hàng
							</span>
						</li>
					</ul>
				)}
			</div>

			{/* Requirements */}
			<div className="mb-4">
				<h4 className="font-semibold text-slate-900 text-sm mb-3 flex items-center gap-2">
					<div className="w-1 h-4 bg-emerald-600 rounded"></div>
					Yêu cầu ứng viên
				</h4>
				{job.requirement ? (
					<div className="text-xs text-slate-600 space-y-2">
						{job.requirement
							.split(/\n{1,}|\.|\n/)
							.filter(Boolean)
							.slice(0, 6)
							.map((p: string, idx: number) => (
								<p key={idx} className="truncate">
									{p.trim()}
									{idx === 5 ? "..." : ""}
								</p>
							))}
					</div>
				) : (
					<ul className="text-xs text-slate-600 space-y-2">
						<li className="flex gap-2">
							<span className="text-emerald-600 font-bold">•</span>
							<span>Tốt nghiệp THPT trở lên</span>
						</li>
						<li className="flex gap-2">
							<span className="text-emerald-600 font-bold">•</span>
							<span>Kỹ năng tính toán, chú ý chi tiết</span>
						</li>
					</ul>
				)}
			</div>

			{/* Benefits */}
			<div className="mb-4">
				<h4 className="font-semibold text-slate-900 text-sm mb-3 flex items-center gap-2">
					<div className="w-1 h-4 bg-emerald-600 rounded"></div>
					Quyền lợi
				</h4>
				{job.benefit ? (
					<div className="text-xs text-slate-600 space-y-2">
						{job.benefit
							.split(/\n{1,}|\.|\n/)
							.filter(Boolean)
							.slice(0, 6)
							.map((p: string, idx: number) => (
								<p key={idx} className="truncate">
									{p.trim()}
									{idx === 5 ? "..." : ""}
								</p>
							))}
					</div>
				) : (
					<ul className="text-xs text-slate-600 space-y-2">
						<li className="flex gap-2">
							<span className="text-emerald-600 font-bold">•</span>
							<span>Bảo hiểm xã hội đầy đủ</span>
						</li>
						<li className="flex gap-2">
							<span className="text-emerald-600 font-bold">•</span>
							<span>Thưởng hiệu suất, phụ cấp ăn ca</span>
						</li>
					</ul>
				)}
			</div>
			{/* Work Location & Time */}
			<div className="mb-4 pb-4 border-b border-slate-200">
				<div className="grid grid-cols-2 gap-3">
					<div>
						<h4 className="font-semibold text-slate-900 text-xs mb-2">
							Địa điểm làm việc
						</h4>
						<div className="text-xs text-slate-600 flex items-center gap-1">
							<MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
							{job.workLocation ? (
								<span className="whitespace-pre-line">{job.workLocation}</span>
							) : (
								<TruncatedLocations locations={locations} maxShow={1} className="text-xs" />
							)}
						</div>
					</div>
					<div>
						<h4 className="font-semibold text-slate-900 text-xs mb-2">
							Thời gian làm việc
						</h4>
						<p className="text-xs text-slate-600 flex items-center gap-1">
							<Clock className="w-3 h-3 text-slate-500 flex-shrink-0" />
							<span className="whitespace-pre-line">{job.workTime || job.employmentType || "Chưa xác định"}</span>
						</p>
					</div>
				</div>
			</div>

			{/* Action Buttons */}
			<div className="flex gap-2">
				<Button
					size="sm"
					className={`border-2 text-xs font-semibold rounded-lg px-3 py-2 transition-all ${
						isApplied 
							? "bg-rose-500 hover:bg-rose-600 border-rose-500 text-white" 
							: "border-slate-900 bg-white text-slate-900 hover:bg-slate-900 hover:text-white"
					}`}
					onClick={(e) => {
						if (isApplied) {
							handleCancelApply(e);
						} else {
							navigate(`/jobs/${job.id}`, { state: { job } });
						}
					}}
					disabled={isCancelling}
				>
					{isCancelling ? (
						<Loader2 className="w-3 h-3 animate-spin" />
					) : isApplied ? (
						'Hủy ứng tuyển'
					) : (
						'Ứng tuyển'
					)}
				</Button>
				<Button
					size="sm"
					className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg px-4 py-2 transition-all"
					onClick={() => navigate(`/jobs/${job.id}`, { state: { job } })}
				>
					Xem chi tiết
				</Button>
			</div>
		</div>
	);
}
