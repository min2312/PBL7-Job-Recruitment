import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	MapPin,
	Clock,
	GraduationCap,
	Briefcase,
	Users,
	Calendar,
	Share2,
	Building2,
	FileText,
	Heart,
	Send,
	DollarSign,
	Facebook,
	Linkedin,
	Twitter,
	Copy,
	ChevronDown,
	Search,
	Menu,
	Laptop,
	Gift,
	Package,
	X,
	Trash,
	Loader2,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import RelatedJobs from "@/components/RelatedJobs";
import JobNeedsBanner from "@/components/JobNeedsBanner";
import SearchBanner from "@/components/SearchBanner";
import { toast } from "react-toastify";
import axiosClient from "@/services/axiosClient";
import ApplyJobModal from "@/components/ApplyJobModal";
import { TruncatedLocations } from "@/components/TruncatedLocations";

export default function JobDetailPage({ job: jobProp }: { job?: any }) {
	const { id } = useParams();
	const navigate = useNavigate();
	const location = useLocation();
	const { user } = useAuth();

	const stateJob = (location.state as any)?.job;
	const [job, setJob] = useState<any>(jobProp ?? stateJob);
	const [isLoadingJob, setIsLoadingJob] = useState(!job);
	const [isSaved, setIsSaved] = useState(job?.isSaved || false);
	const [isApplied, setIsApplied] = useState(job?.isApplied || false);
	const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
	const [isCancelling, setIsCancelling] = useState(false);

	useEffect(() => {
		if (id) {
			const fetchJob = async () => {
				if (!job) setIsLoadingJob(true);
				try {
					const res = await axiosClient.get(`/api/jobs/${id}`, {
						params: { userId: user?.id },
					});
					if (res.data.errCode === 0) {
						setJob(res.data.data);
						setIsSaved(res.data.data.isSaved || false);
						setIsApplied(res.data.data.isApplied || false);
					}
				} catch (err) {
					console.error("Failed to fetch job", err);
				} finally {
					setIsLoadingJob(false);
				}
			};
			fetchJob();
		}
	}, [id, user]);

	useEffect(() => {
		if (job) {
			setIsSaved(job.isSaved || false);
			setIsApplied(job.isApplied || false);
		}
	}, [job]);

	// Scroll to top when job changes
	useEffect(() => {
		window.scrollTo(0, 0);
	}, [id, jobProp, stateJob]);
	if (isLoadingJob) {
		return (
			<div className="container py-20 text-center">
				<div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
				<p className="text-muted-foreground text-lg">
					Đang tải thông tin việc làm...
				</p>
			</div>
		);
	}

	if (!job) {
		return (
			<div className="container py-20 text-center">
				<p className="text-muted-foreground text-lg">Không tìm thấy việc làm</p>
				<Link to="/jobs">
					<Button className="mt-4">Quay lại danh sách</Button>
				</Link>
			</div>
		);
	}

	const HandleSave = async () => {
		if (!user) {
			navigate("/login");
			return;
		}
		try {
			const response = await axiosClient.post("/api/jobs/save", {
				userId: user.id,
				jobId: job.id,
			});
			const data = response.data;
			if (data.errCode === 0) {
				setIsSaved(!isSaved);
				toast.success(
					isSaved ? "Job removed from saved list" : "Job saved successfully",
				);
			} else {
				toast.error("Error saving job: " + data.errMessage);
			}
		} catch (error) {
			toast.error("Error saving job");
			console.error("Error:", error);
		}
	};

	const HandleCancelApply = async () => {
		if (!user) {
			navigate("/login");
			return;
		}

		setIsCancelling(true);
		try {
			const response = await axiosClient.delete("/api/jobs/cancel-apply", {
				data: { jobId: job.id },
			});
			if (response.data.errCode === 0) {
				setIsApplied(false);
				toast.success("Hủy ứng tuyển thành công");
			} else {
				toast.error(response.data.errMessage || "Lỗi khi hủy ứng tuyển");
			}
		} catch (error) {
			toast.error("Lỗi hệ thống khi hủy ứng tuyển");
			console.error("Cancel apply error:", error);
		} finally {
			setIsCancelling(false);
		}
	};

	const company = (job as any).Company || job.Company;
	const categoriesList = job?.categories || [];
	const locationsList = job?.locations || [];

	const categoryNames = categoriesList.map((c: any) => c.name);
	const locationNames = locationsList.map((l: any) => l.name);

	const displayCategories = categoryNames.join(", ") || "Chưa xác định";
	const displayLocation = locationNames.join(", ") || "Chưa xác định";
	const detailedLocation = job.workLocation || displayLocation;
	const displayWorkTime = job.workTime || job.employmentType || "Chưa xác định";

	const jobCategoryIds = job.categoryIds ?? [];
	const jobLocationIds = job.locationIds ?? [];

	return (
		<div className="min-h-screen bg-slate-50">
			{/* Fixed Social Icons Sidebar */}
			<div className="hidden lg:flex fixed left-20 top-1/3 flex-col gap-4 z-40">
				<button className="group w-10 h-10 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 bg-white relative">
					<Facebook className="w-5 h-5 text-slate-600" />
					<span className="absolute left-full ml-2 whitespace-nowrap bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
						Chia sẻ qua Facebook
					</span>
				</button>
				<button className="group w-10 h-10 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 bg-white relative">
					<Twitter className="w-5 h-5 text-slate-600" />
					<span className="absolute left-full ml-2 whitespace-nowrap bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
						Chia sẻ qua Twitter
					</span>
				</button>
				<button className="group w-10 h-10 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 bg-white relative">
					<Linkedin className="w-5 h-5 text-slate-600" />
					<span className="absolute left-full ml-2 whitespace-nowrap bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
						Chia sẻ qua LinkedIn
					</span>
				</button>
				<button className="group w-10 h-10 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 bg-white relative">
					<Copy className="w-5 h-5 text-slate-600" />
					<span className="absolute left-full ml-2 whitespace-nowrap bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
						Sao chép liên kết
					</span>
				</button>
			</div>

			{/* Job Needs Banner */}
			<JobNeedsBanner onUpdateClick={() => navigate("/login")} />

			{/* Search Banner */}
			<SearchBanner />

			<div className="container py-6 max-w-6xl mx-auto">
				{/* Breadcrumb */}
				<div className="flex items-center gap-2 text-sm mb-6">
					<Link to="/" className="text-slate-900 hover:underline font-medium">
						Trang chủ
					</Link>
					<span className="text-slate-400">›</span>
					<Link
						to="/jobs"
						className="text-slate-900 hover:underline font-medium"
					>
						Tìm việc làm {categoryNames[0] || "mới nhất"}
					</Link>
					<span className="text-slate-400">›</span>
					<span className="text-slate-600">{job.title}</span>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
					{/* Main Content */}
					<div className="lg:col-span-7 space-y-6">
						{/* Job Header */}
						<div className="bg-white rounded-lg p-6 border border-slate-200">
							{/* Title */}
							<h1 className="text-2xl font-bold text-slate-900 mb-4">
								{job.title}
							</h1>

							{/* Key Info Badges */}
							<div className="grid grid-cols-3 gap-6 mb-6">
								<div className="flex items-center gap-3">
									<div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center flex-shrink-0">
										<DollarSign className="w-6 h-6 text-white" />
									</div>
									<div>
										<p className="text-xs text-slate-500">Thu nhập</p>
										<p className="font-semibold text-slate-900">{job.salary}</p>
									</div>
								</div>
								<div className="flex items-center gap-3">
									<div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center flex-shrink-0">
										<MapPin className="w-6 h-6 text-white" />
									</div>
									<div>
										<p className="text-xs text-slate-500">Địa điểm</p>
										<div className="font-semibold text-slate-900">
											<TruncatedLocations locations={locationNames} />
										</div>
									</div>
								</div>
								<div className="flex items-center gap-3">
									<div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center flex-shrink-0">
										<Clock className="w-6 h-6 text-white" />
									</div>
									<div>
										<p className="text-xs text-slate-500">Kinh nghiệm</p>
										<p className="font-semibold text-slate-900">
											{job.experience || "Chưa xác định"}
										</p>
									</div>
								</div>
							</div>

							{/* Action Buttons */}
							<div className="flex gap-3">
								<Button
									size="lg"
									className={`flex-grow font-bold text-base gap-2 rounded-lg py-6 ${
										isApplied
											? "bg-rose-500 hover:bg-rose-600 text-white"
											: "bg-slate-900 hover:bg-slate-800 text-white"
									}`}
									onClick={() => {
										if (!user) {
											navigate("/login");
										} else if (isApplied) {
											HandleCancelApply();
										} else {
											setIsApplyModalOpen(true);
										}
									}}
									disabled={isCancelling}
								>
									{isApplied ? (
										<>
											{isCancelling ? (
												<Loader2 className="w-5 h-5 animate-spin" />
											) : (
												<Trash className="w-5 h-5" />
											)}
											Hủy ứng tuyển
										</>
									) : (
										<>
											<Send className="w-5 h-5" />
											Ứng tuyển ngay
										</>
									)}
								</Button>
								<Button
									size="lg"
									variant="outline"
									className="border-2 border-slate-300 text-slate-900 hover:border-slate-900 hover:bg-slate-50 rounded-lg px-6"
									onClick={() => HandleSave()}
								>
									<Heart
										className={`w-5 h-5 ${isSaved ? "fill-slate-900 text-slate-900" : ""}`}
									/>
									Lưu tin
								</Button>
							</div>
						</div>

						{/* Chi tiết tin tuyển dụng */}
						<div className="bg-white rounded-lg border border-slate-200 p-6">
							<div className="flex items-center gap-3 mb-6 pb-6 border-b-2 border-slate-900">
								<div className="w-8 h-8 flex items-center justify-center rounded bg-slate-200">
									<FileText className="w-5 h-5 text-slate-900" />
								</div>
								<h2 className="text-lg font-bold text-slate-900">
									Chi tiết tin tuyển dụng
								</h2>
							</div>

							<div className="space-y-6">
								{/* Yêu cầu */}
								<div>
									<div className="flex items-center justify-between mb-3">
										<h3 className="font-bold text-slate-900">
											Yêu cầu ứng viên:
										</h3>
									</div>
									{job.requirement ? (
										<p className="text-slate-700 text-sm whitespace-pre-line">
											{job.requirement}
										</p>
									) : (
										<div className="flex flex-wrap gap-2">
											<span className="inline-block bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full font-medium text-sm">
												1 năm kinh nghiệm
											</span>
											<span className="inline-block bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full font-medium text-sm">
												Cao Đẳng trở lên
											</span>
											<span className="inline-block bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full font-medium text-sm">
												Tuổi 20 - 30
											</span>
										</div>
									)}
								</div>

								{/* Mô tả công việc */}
								<div>
									<h3 className="font-bold text-slate-900 mb-3">
										Mô tả công việc
									</h3>
									{job.description ? (
										<p className="text-slate-700 text-sm whitespace-pre-line">
											{job.description}
										</p>
									) : (
										<ul className="list-disc list-inside space-y-2 text-slate-700 text-sm">
											<li>
												Tư vấn khách hàng hàng trực tiếp tại công ty và từ các
												kênh online của công ty
											</li>
											<li>
												Tiếp nhận nhu cầu, chăm sóc khách hàng, giải đáp thắc
												mắc về sản phẩm
											</li>
											<li>
												Hỗ trợ khách hàng trong quá trình mua hàng, chốt đơn và
												hậu mãi
											</li>
											<li>
												Phối hợp với phòng Marketing triển khai các hoạt động
												bán hàng và chăm sóc khách hàng
											</li>
										</ul>
									)}
								</div>

								{/* Thu nhập */}
								<div>
									<h3 className="font-bold text-slate-900 mb-3">Thu nhập</h3>
									<ul className="list-disc list-inside space-y-2 text-slate-700 text-sm">
										<li>Thu nhập: 10 - 25 triệu VNĐ</li>
										<li>Lương cứng: Đến 10 triệu VNĐ</li>
										<li>Lương cứng phụ thuộc vào doanh số</li>
									</ul>
								</div>

								{/* Phụ cấp */}
								<div className="flex items-start gap-3">
									<div className="w-6 h-6 flex-shrink-0 mt-1">
										<Package className="w-5 h-5 text-slate-900" />
									</div>
									<div>
										<h3 className="font-bold text-slate-900 mb-2">Phụ cấp</h3>
										<p className="text-slate-700 text-sm">
											Ăn trưa, Xăng xe, Gửi xe, Điện thoại
										</p>
									</div>
								</div>

								{/* Thiết bị làm việc */}
								<div className="flex items-start gap-3">
									<div className="w-6 h-6 flex-shrink-0 mt-1">
										<Laptop className="w-5 h-5 text-slate-900" />
									</div>
									<div>
										<h3 className="font-bold text-slate-900 mb-2">
											Thiết bị làm việc
										</h3>
										<p className="text-slate-700 text-sm">
											Được cấp Điện thoại, Máy tính, Tai nghe
										</p>
									</div>
								</div>

								{/* Quyền lợi chi tiết */}
								<div className="flex items-start gap-3">
									<div className="w-6 h-6 flex-shrink-0 mt-1">
										<Gift className="w-5 h-5 text-slate-900" />
									</div>
									<div>
										<h3 className="font-bold text-slate-900 mb-2">Quyền lợi</h3>
										{job.benefit ? (
											<p className="text-slate-700 text-sm whitespace-pre-line">
												{job.benefit}
											</p>
										) : (
											<ul className="space-y-1 text-slate-700 text-sm">
												<li>
													Bảo hiểm xã hội, Bảo hiểm sức khỏe, Team building, Du
													lịch hàng năm
												</li>
												<li>
													Thưởng lễ, thưởng lễ - Tết - thưởng năm, quà sinh
													nhật, tiệc chúc mừng và các chế độ phúc lợi hiếu - hỷ
												</li>
												<li>
													Du lịch tối thiểu 2 lần/năm, teambuilding, picnic và
													nhiều hoạt động gắn kết ý nghĩa
												</li>
											</ul>
										)}
									</div>
								</div>

								{/* Địa điểm làm việc */}
								<div>
									<h3 className="font-bold text-slate-900 mb-3">
										Địa điểm làm việc
									</h3>
									<div className="text-slate-700 text-sm mb-2">
										{job.workLocation ? (
											<p className="whitespace-pre-line">{job.workLocation}</p>
										) : (
											<TruncatedLocations locations={locationNames} maxShow={5} />
										)}
									</div>
								</div>

								{/* Thời gian làm việc */}
								<div>
									<h3 className="font-bold text-slate-900 mb-3">
										Thời gian làm việc
									</h3>
									<p className="text-slate-700 text-sm">{displayWorkTime}</p>
								</div>

								{/* Cách thức ứng tuyển */}
								<div>
									<h3 className="font-bold text-slate-900 mb-3">
										Cách thức ứng tuyển
									</h3>
									<p className="text-slate-700 text-sm">
										Ứng viên nộp hồ sơ trực tuyến bằng cách bấm{" "}
										<span className="font-semibold">
											Ứng tuyển ngay dưới đây
										</span>
										.
									</p>
								</div>

								{/* Action Buttons */}
								<div className="flex gap-3 pt-4">
									<Button
										size="lg"
										className={`font-bold text-base gap-2 rounded-lg px-6 ${
											isApplied
												? "bg-rose-500 hover:bg-rose-600 text-white"
												: "bg-slate-900 hover:bg-slate-800 text-white"
										}`}
										onClick={() => {
											if (!user) {
												navigate("/login");
											} else if (isApplied) {
												HandleCancelApply();
											} else {
												setIsApplyModalOpen(true);
											}
										}}
										disabled={isCancelling}
									>
										{isApplied ? (
											<>
												{isCancelling ? (
													<Loader2 className="w-5 h-5 animate-spin" />
												) : (
													<X className="w-5 h-5" />
												)}
												Hủy ứng tuyển
											</>
										) : (
											<>
												<Send className="w-5 h-5" />
												Ứng tuyển ngay
											</>
										)}
									</Button>
									<Button
										size="lg"
										variant="outline"
										className="border-2 border-slate-300 text-slate-900 hover:border-slate-900 hover:bg-slate-50 rounded-lg px-6"
										onClick={() => HandleSave()}
									>
										<Heart
											className={`w-5 h-5 ${isSaved ? "fill-slate-900 text-slate-900" : ""}`}
										/>
										Lưu tin
									</Button>
								</div>

								{/* Alert Box */}
								<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
									<div className="w-6 h-6 flex-shrink-0 mt-0.5">
										<div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
											<span className="text-white font-bold text-sm">i</span>
										</div>
									</div>
									<div>
										<p className="text-sm text-blue-900">
											<span className="font-semibold">
												Báo cáo tin tuyển dụng:
											</span>{" "}
											Nếu bạn thấy rằng tin tuyển dụng này không đúng hoặc có
											dấu hiệu lừa đảo,
											<a
												href="#"
												className="text-blue-600 font-semibold hover:underline"
											>
												{" "}
												hãy phản ánh với chúng tôi.
											</a>
										</p>
									</div>
								</div>
							</div>
						</div>

						{/* Related Jobs Section */}
						{job && <RelatedJobs currentJobId={job.id} currentJob={job} />}
					</div>

					{/* Sidebar - Company Info */}
					<div className="lg:col-span-3 space-y-3">
						{/* Company Info Card */}
						<div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
							<div className="flex items-start justify-between gap-2">
								<div>
									<h3 className="font-bold text-slate-900 text-base">
										{company?.name || "Công ty"}
									</h3>
								</div>
								<div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center flex-shrink-0">
									{company.logo ? (
										<img
											src={company.logo}
											alt={company.name}
											className="w-14 h-14 object-contain"
										/>
									) : (
										<Building2 className="w-5 h-5 text-slate-400" />
									)}
								</div>
							</div>
							<a
								href={`/companies/${company.id}`}
								className="text-teal-600 text-xs font-medium hover:underline inline-block"
							>
								Xem trang công ty →
							</a>
							<div className="space-y-2 border-t pt-3">
								<div className="flex items-start gap-2">
									<Users className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
									<div>
										<p className="text-xs text-slate-500">Quy mô:</p>
										<p className="text-sm font-medium text-slate-900">
											{company.company_scale}
										</p>
									</div>
								</div>
								<div className="flex items-start gap-2">
									<Briefcase className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
									<div>
										<p className="text-xs text-slate-500">Lĩnh vực:</p>
										<p className="text-sm font-medium text-slate-900">
											{categoryNames.join(", ") || "Chưa xác định"}
										</p>
									</div>
								</div>
								<div className="flex items-start gap-2">
									<MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
									<div>
										<p className="text-xs text-slate-500">Địa điểm</p>
										<div className="font-semibold text-slate-900">
											<TruncatedLocations locations={locationNames} maxShow={2} />
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Thông tin chung */}
						<div className="bg-white rounded-lg border border-slate-200 p-4">
							<h3 className="font-semibold text-slate-900 mb-3 text-base">
								Thông tin chung
							</h3>
							<div className="space-y-3">
								<div className="flex items-start gap-2">
									<div className="w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center flex-shrink-0">
										<Briefcase className="w-3.5 h-3.5 text-white" />
									</div>
									<div>
										<p className="text-xs text-slate-500">Cấp bậc</p>
										<p className="text-sm font-medium text-slate-900">
											{job.level || "Chưa xác định"}
										</p>
									</div>
								</div>
								<div className="flex items-start gap-2">
									<div className="w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center flex-shrink-0">
										<GraduationCap className="w-3.5 h-3.5 text-white" />
									</div>
									<div>
										<p className="text-xs text-slate-500">Học vấn</p>
										<p className="text-sm font-medium text-slate-900">
											{job.education || "Chưa xác định"}
										</p>
									</div>
								</div>
								<div className="flex items-start gap-2">
									<div className="w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center flex-shrink-0">
										<Users className="w-3.5 h-3.5 text-white" />
									</div>
									<div>
										<p className="text-xs text-slate-500">Số lượng</p>
										<p className="text-sm font-medium text-slate-900">
											{job.quantity ? `${job.quantity} người` : "Chưa xác định"}
										</p>
									</div>
								</div>
								<div className="flex items-start gap-2">
									<div className="w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center flex-shrink-0">
										<Calendar className="w-3.5 h-3.5 text-white" />
									</div>
									<div>
										<p className="text-xs text-slate-500">Hình thức</p>
										<p className="text-sm font-medium text-slate-900">
											{job.employmentType || "Chưa xác định"}
										</p>
									</div>
								</div>
							</div>
						</div>

						<div className="bg-white rounded-lg border border-slate-200 p-4 space-y-4">
							{/* Danh mục Nghề liên quan */}
							<div>
								<h3 className="font-semibold text-slate-900 mb-3 text-base">
									Danh mục Nghề liên quan
								</h3>
								<div className="flex flex-wrap gap-2">
									<span className="inline-block bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-sm">
										Kinh doanh/Bán hàng
									</span>
									<span className="inline-block bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-sm">
										Sản xuất
									</span>
									<span className="inline-block bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-sm">
										Sales Sản xuất
									</span>
									<span className="inline-block bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-sm">
										Kinh doanh phụ tùng ô tô/xe máy/xe điện
									</span>
								</div>
							</div>

							{/* Kỹ năng cần có */}
							<div className="border-t pt-4">
								<h3 className="font-semibold text-slate-900 mb-3 text-base">
									Kỹ năng cần có
								</h3>
								<div className="flex flex-wrap gap-2">
									<span className="inline-block bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-sm">
										Tin học văn phòng
									</span>
									<span className="inline-block bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-sm">
										Xử lý tình huống
									</span>
									<span className="inline-block bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-sm">
										Giao tiếp
									</span>
								</div>
							</div>

							{/* Tìm việc theo khu vực */}
							<div className="border-t pt-4">
								<h3 className="font-semibold text-slate-900 mb-3 text-base">
									Tìm việc theo khu vực
								</h3>
								<div className="flex flex-wrap gap-2">
									<span className="inline-block bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-sm">
										Hà Nội
									</span>
									<span className="inline-block bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-sm">
										Việc làm Nhân Viên Bán Hàng tại Hà Nội
									</span>
									<span className="inline-block bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-sm">
										Phương Hà Đông - Hà Nội
									</span>
									<a
										href="#"
										className="text-slate-900 font-medium hover:underline text-sm"
									>
										Xem thêm
									</a>
								</div>
							</div>
						</div>

						{/* Job Safety Tips Card */}
						<div className="bg-white rounded-lg border-2 border-slate-900 p-4">
							<div className="flex items-start gap-3 mb-4 pb-4 border-b border-slate-200">
								<div className="w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
									<span className="text-white font-bold text-sm">i</span>
								</div>
								<h3 className="text-base font-bold text-slate-900">
									Bí kíp Tìm việc an toàn
								</h3>
							</div>

							<p className="text-sm text-slate-700 mb-3">
								Dưới đây là những dấu hiệu của các tổ chức, cá nhân tuyển dụng
								không minh bạch:
							</p>

							{/* Warning Signs Carousel */}
							<div className="space-y-3">
								{/* Sign 1 */}
								<div>
									<h4 className="text-sm font-semibold text-slate-900 mb-2">
										1. Dấu hiệu phổ biến:
									</h4>
									<div className="bg-slate-50 rounded-lg p-3 mb-2">
										<div className="w-full h-24 bg-slate-200 rounded flex items-center justify-center mb-2 text-xs text-slate-400">
											[Minh họa]
										</div>
										<p className="text-sm text-slate-600 text-center">
											Nội dung mô tả công việc sai
										</p>
									</div>
									<div className="flex justify-center gap-1.5">
										<button className="w-1.5 h-1.5 bg-slate-300 rounded-full hover:bg-slate-400"></button>
										<button className="w-1.5 h-1.5 bg-slate-300 rounded-full hover:bg-slate-400"></button>
										<button className="w-1.5 h-1.5 bg-slate-300 rounded-full hover:bg-slate-400"></button>
										<button className="w-1.5 h-1.5 bg-slate-300 rounded-full hover:bg-slate-400"></button>
										<button className="w-1.5 h-1.5 bg-slate-300 rounded-full hover:bg-slate-400"></button>
										<button className="w-1.5 h-1.5 bg-slate-300 rounded-full hover:bg-slate-400"></button>
									</div>
								</div>

								{/* Warning Details */}
								<div>
									<h4 className="text-sm font-semibold text-slate-900 mb-2">
										2. Cần làm gì khi gặp việc làm, công ty không minh bạch:
									</h4>
									<ul className="space-y-2 text-sm text-slate-700">
										<li className="flex flex-col gap-3">
											<div className="flex gap-2">
												<span className="text-slate-900 font-bold flex-shrink-0">•</span>
												<span className="text-sm">Kiểm tra thông tin về công ty, việc làm trước khi ứng tuyển</span>
											</div>
											<div className="pl-5 space-y-3">
												<div>
													<h4 className="font-bold text-slate-900 text-sm mb-1">Địa điểm làm việc:</h4>
													<div className="text-slate-700 text-sm">
														{job.workLocation ? (
															<p className="whitespace-pre-line">{job.workLocation}</p>
														) : (
															<TruncatedLocations locations={locationNames} maxShow={3} />
														)}
													</div>
												</div>
												<div>
													<h4 className="font-bold text-slate-900 text-sm mb-1">Thời gian làm việc:</h4>
													<p className="text-slate-700 text-sm">{displayWorkTime || "Chưa xác định"}</p>
												</div>
												<div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 pt-2 border-t border-slate-100">
													<div className="flex gap-1.5 items-center">
														<span className="font-semibold text-xs text-slate-500 uppercase tracking-wider">Email:</span>
														<a href="mailto:hotro@topcv.vn" className="text-teal-600 hover:underline text-sm font-medium">hotro@topcv.vn</a>
													</div>
													<div className="flex gap-1.5 items-center">
														<span className="font-semibold text-xs text-slate-500 uppercase tracking-wider">Hotline:</span>
														<a href="tel:02466805588" className="text-teal-600 hover:underline text-sm font-medium">(024) 6680 5588</a>
													</div>
												</div>
											</div>
										</li>
									</ul>
								</div>
							</div>

							<button className="w-full mt-3 py-2 text-sm bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800">
								Báo cáo tin tuyển dụng
							</button>

							<p className="text-sm text-slate-600 text-center mt-2">
								Tìm hiểu thêm kinh nghiệm phòng tránh lừa đảo
								<a
									href="#"
									className="text-teal-600 font-semibold hover:underline"
								>
									{" "}
									tại đây
								</a>
							</p>
						</div>
					</div>
				</div>
			</div>

			<ApplyJobModal
				isOpen={isApplyModalOpen}
				onClose={() => setIsApplyModalOpen(false)}
				jobId={job.id}
				jobTitle={job.title}
				user={user}
				onSuccess={() => setIsApplied(true)}
			/>
		</div>
	);
}
