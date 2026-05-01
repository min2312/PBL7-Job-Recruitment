import { Building2, Search } from "lucide-react";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import JobNeedsBanner from "@/components/JobNeedsBanner";
import axiosClient from "@/services/axiosClient";
import NumberedPagination from "@/components/NumberedPagination";

export default function CompaniesPage() {
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState("list");
	const [searchQuery, setSearchQuery] = useState("");
	const [submittedSearchQuery, setSubmittedSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [companies, setCompanies] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [totalPages, setTotalPages] = useState(1);
	const itemsPerPage = 9;
	const companiesGridRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const fetchCompanies = async () => {
			try {
				setIsLoading(true);
				const response = await axiosClient.get("/api/companies", {
					params: {
						page: currentPage,
						limit: itemsPerPage,
						search: submittedSearchQuery,
					},
				});
				const data = response.data;
				if (data.errCode === 0 && data.data && data.data.companies) {
					setCompanies(data.data.companies);
					setTotalPages(Math.ceil(data.data.total / itemsPerPage) || 1);
				}
			} catch (error) {
				console.error("Error fetching companies:", error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchCompanies();
	}, [currentPage, submittedSearchQuery]);

	// Scroll to top when component mounts
	useEffect(() => {
		// Sử dụng requestAnimationFrame để scroll smooth mà không flickering
		const id = requestAnimationFrame(() => {
			window.scrollTo({ top: 0, behavior: "smooth" });
		});

		return () => cancelAnimationFrame(id);
	}, []);

	// Memoize navigation handler
	const handleCompanyClick = useCallback(
		(company: any) => {
			navigate(`/companies/${company.id}`, { state: { company } });
		},
		[navigate],
	);

	// Reset to first page when search query changes
	useEffect(() => {
		setCurrentPage(1);
	}, [searchQuery]);

	// Scroll to companies grid when page changes
	useEffect(() => {
		if (companiesGridRef.current) {
			companiesGridRef.current.scrollIntoView({
				behavior: "smooth",
				block: "start",
			});
		}
	}, [currentPage]);

	return (
		<div className="min-h-screen bg-white">
			{/* Job Needs Banner */}
			<JobNeedsBanner onUpdateClick={() => navigate("/login")} />
			{/* Tabs */}
			<div className="bg-white border-b border-slate-200">
				<div className="max-w-7xl mx-auto px-12">
					<div className="flex gap-8">
						<button
							onClick={() => setActiveTab("list")}
							className={`py-4 px-2 font-semibold text-base transition-all border-b-2 ${
								activeTab === "list"
									? "text-slate-900 border-slate-900"
									: "text-slate-500 border-transparent hover:text-slate-700"
							}`}
						>
							Danh sách công ty
						</button>
						<button
							onClick={() => setActiveTab("top")}
							className={`py-4 px-2 font-semibold text-base transition-all border-b-2 ${
								activeTab === "top"
									? "text-slate-900 border-slate-900"
									: "text-slate-500 border-transparent hover:text-slate-700"
							}`}
						>
							Top công ty
						</button>
					</div>
				</div>
			</div>

			{/* Hero Section */}
			<div className="bg-emerald-50 py-12">
				<div className="max-w-7xl mx-auto px-12">
					<h1 className="text-4xl font-bold text-slate-900 mb-4">
						Khám phá 100.000+ công ty nổi bật
					</h1>
					<p className="text-lg text-slate-600 mb-8">
						Tra cứu thông tin công ty và tìm kiếm nơi làm việc tốt nhất dành cho
						bạn
					</p>

					{/* Search Bar */}
					<div className="flex gap-2 items-center">
						<div className="flex-1 relative max-w-md h-full">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
							<input
								type="text"
								placeholder="Nhập tên công ty"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full h-full pl-10 pr-4 py-3 rounded-lg border border-transparent hover:ring-1 hover:ring-black focus:outline-none focus:ring-1 focus:ring-black text-base transition-colors"
							/>
						</div>
						<Button
							onClick={() => {
								setCurrentPage(1);
								setSubmittedSearchQuery(searchQuery);
							}}
							className="bg-black hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-semibold"
						>
							Tìm kiếm
						</Button>
					</div>
				</div>
			</div>

			{/* Companies Grid */}
			<div ref={companiesGridRef} className="max-w-7xl mx-auto px-12 py-12">
				<h2 className="text-2xl font-bold text-slate-900 mb-8 uppercase tracking-wide">
					Danh sách các công ty nổi bật
				</h2>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{isLoading ? (
						<div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-12">
							<p className="text-slate-500 text-lg">
								Đang tải danh sách công ty...
							</p>
						</div>
					) : (
						companies.map((company) => {
							const description =
								company.description ||
								"Công ty chuyên cung cấp giải pháp hàng đầu.";

							return (
								<div
									key={company.id}
									onClick={() => handleCompanyClick(company)}
									className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-black transition-all cursor-pointer group"
								>
									{/* Company Image */}
									<div className="w-full h-56 bg-slate-100 overflow-hidden border-b border-slate-200 group-hover:bg-slate-200 transition-colors">
										<img
											src={company.logo}
											alt={company.name}
											className="w-full h-full object-contain"
											onError={(e) => {
												(e.target as HTMLImageElement).style.display = "none";
											}}
										/>
									</div>

									{/* Company Info */}
									<div className="p-4">
										<h3 className="font-bold text-sm text-slate-900 line-clamp-2 mb-3 group-hover:underline transition-all">
											{company.name.toUpperCase()}
										</h3>
										<p className="text-xs text-slate-600 line-clamp-3 mb-3">
											{description}
										</p>
									</div>
								</div>
							);
						})
					)}
				</div>

				{!isLoading && companies.length === 0 && (
					<div className="text-center py-12">
						<p className="text-slate-500 text-lg">
							Không tìm thấy công ty phù hợp
						</p>
					</div>
				)}

				{/* Pagination */}
				{!isLoading && companies.length > 0 && totalPages > 1 && (
					<div className="mt-12 pt-8 border-t border-slate-200">
						<NumberedPagination
							currentPage={currentPage}
							totalPages={totalPages}
							onPageChange={setCurrentPage}
						/>
					</div>
				)}
			</div>
		</div>
	);
}
