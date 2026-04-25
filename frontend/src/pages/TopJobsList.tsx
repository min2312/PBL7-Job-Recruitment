import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	Bookmark,
	ChevronLeft,
	ChevronRight,
	MapPin,
	DollarSign,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosClient from "@/services/axiosClient";
import JobCard from "@/components/JobCard";
import JobPreviewPopup from "@/components/JobPreviewPopup";

export default function TopJobsList() {
	const navigate = useNavigate();
	const [selectedLocation, setSelectedLocation] =
		useState<string>("Ngẫu Nhiên");
	const [selectedSalary, setSelectedSalary] = useState<string>("Tất cả");
	const [selectedExperience, setSelectedExperience] =
		useState<string>("Tất cả");
	const [filterType, setFilterType] = useState<string>("location");
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [jobs, setJobs] = useState<any[]>([]);
	const [total, setTotal] = useState(0);
	const [pageSize, setPageSize] = useState(12);
	const [seed, setSeed] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [hoveredJobId, setHoveredJobId] = useState<number | null>(null);
	const [previewPosition, setPreviewPosition] = useState<{
		top: number;
		left: number;
	} | null>(null);
	const [popupHovered, setPopupHovered] = useState(false);
	const tabsRef = useRef<HTMLDivElement>(null);
	const gridRef = useRef<HTMLDivElement>(null);
	const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	const locations = [
		"Ngẫu Nhiên",
		"Hà Nội",
		"Thành phố Hồ Chí Minh (cũ)",
		"Miền Bắc",
		"Miền Nam",
	];
	const salaries = [
		"Tất cả",
		"Dưới 10 triệu",
		"Từ 10-15 triệu",
		"Từ 15-20 triệu",
		"Từ 20-25 triệu",
		"Từ 25-30 triệu",
		"Trên 30-50 triệu",
		"Trên 50 triệu",
		"Thỏa thuận",
	];
	const experiences = [
		"Tất cả",
		"Chưa có kinh nghiệm",
		"1 năm trở xuống",
		"1 năm",
		"2 năm",
		"3 năm",
		"Từ 4-5 năm",
		"Trên 5 năm",
	];

	const filterOptions = [
		{ label: "Địa điểm", value: "location" },
		{ label: "Mức lương", value: "salary" },
		{ label: "Kinh nghiệm", value: "experience" },
	];

	const mapLocationToApi = (loc: string) => {
		if (!loc || loc === "all" || loc === "Ngẫu Nhiên" || loc === "Tất cả")
			return "all";
		if (loc.includes("Hà Nội") || loc.toLowerCase().includes("hà nội"))
			return "hanoi";
		if (
			loc.toLowerCase().includes("hồ chí minh") ||
			loc.toLowerCase().includes("hcm") ||
			loc.toLowerCase().includes("sài gòn")
		)
			return "hcm";
		if (
			loc.toLowerCase().includes("miền bắc") ||
			(loc.toLowerCase().includes("miền") && loc.toLowerCase().includes("bắc"))
		)
			return "mienbac";
		if (
			loc.toLowerCase().includes("miền nam") ||
			(loc.toLowerCase().includes("miền") && loc.toLowerCase().includes("nam"))
		)
			return "miennam";
		return loc;
	};

	// Fetch jobs from backend with deterministic seed support
	const fetchJobs = async (page = 1, useExistingSeed = true) => {
		try {
			setLoading(true);
			setError(null);
			const params: any = {
				location: mapLocationToApi(selectedLocation),
				limit: pageSize,
				page,
			};
			if (selectedSalary && selectedSalary !== "Tất cả")
				params.salary = selectedSalary;
			if (selectedExperience && selectedExperience !== "Tất cả")
				params.experience = selectedExperience;
			if (useExistingSeed && seed) params.seed = seed;

			const resp = await axiosClient.get("/api/jobs/random", { params });
			const data = resp.data?.jobs || {};
			const serverJobs = data.jobs || [];
			const dt = data || null;
			console.log("serverJobs", serverJobs);
			// Normalize to frontend shape and include Company
			const normalized = serverJobs.map((j: any) => ({
				id: j.id ?? j.job_id,
				title: j.title,
				companyId:
					j.companyId ?? j.company_id ?? j.Company?.id ?? j.company?.id,
				Company: j.Company || j.company || null,
				salary: j.salary ?? j.salary_range ?? "",
				level: j.level ?? "",
				experience: j.experience ?? "",
				education: j.education ?? "",
				employmentType: j.employment_type ?? j.employmentType,
				// Normalize work location/time fields from various backend shapes
				workLocation: j.workLocation ?? j.work_location ?? j.locationName ?? (j.locations && j.locations[0]?.name) ?? j.workLocationName ?? '',
				workTime: j.workTime ?? j.work_time ?? j.work_time_detail ?? j.work_time_description ?? j.employment_type ?? j.employmentType ?? '',
				description: j.description ?? "",
				categories: j.categories || [],
				requirement: j.requirement || "",
				benefit: j.benefit || "",
				categoryIds: (j.categories || []).map((c: any) => c.id) || [],
				locations: j.locations || [],
				locationIds: (j.locations || []).map((l: any) => l.id) || [],
				createdAt: j.createdAt ?? j.created_at,
			}));

			setJobs(normalized);
			setTotal(dt?.total ?? 0);
			setPageSize(dt?.pageSize ?? pageSize);

			// If server returned a seed, save it. If we didn't send one and server suggested seed, store it for next pages.
			if (dt?.seed) setSeed(dt.seed);
			setCurrentPage(dt?.page ?? page);
		} catch (e: any) {
			console.error("Failed fetch jobs", e);
			setError("Không thể tải việc làm");
		} finally {
			setLoading(false);
		}
	};

	// Initial load and reload when filters change
	useEffect(() => {
		// when filters change, reset seed so server generates a new order and returns a seed
		setSeed(null);
		fetchJobs(1, false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedLocation, selectedSalary, selectedExperience]);

	const totalPages = Math.max(1, Math.ceil(total / pageSize));

	const handlePrevPage = () => {
		const next = currentPage <= 1 ? totalPages : currentPage - 1;
		fetchJobs(next, true);
	};

	const handleNextPage = () => {
		const next = currentPage >= totalPages ? 1 : currentPage + 1;
		fetchJobs(next, true);
	};

	const scroll = (direction: "left" | "right") => {
		if (tabsRef.current) {
			const scrollAmount = 300;
			if (direction === "left")
				tabsRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
			else tabsRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
		}
	};

	useEffect(() => {
		return () => {
			if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
		};
	}, []);

	const handlePopupHover = (hovered: boolean) => {
		setPopupHovered(hovered);
		if (hovered) {
			if (hideTimeoutRef.current) {
				clearTimeout(hideTimeoutRef.current);
				hideTimeoutRef.current = null;
			}
		} else {
			hideTimeoutRef.current = setTimeout(() => {
				setHoveredJobId(null);
				setPreviewPosition(null);
			}, 200);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<h2 className="text-2xl font-bold text-slate-900">
						Việc làm tốt nhất
					</h2>
				</div>
				<div className="flex gap-2">
					<button
						className="p-1.5 border-2 border-slate-900 rounded-full transition-all text-slate-900 hover:bg-slate-900 hover:text-white"
						onClick={() => handlePrevPage()}
					>
						<ChevronLeft className="w-4 h-4" />
					</button>
					<button
						className="p-1.5 border-2 border-slate-900 rounded-full transition-all text-slate-900 hover:bg-slate-900 hover:text-white"
						onClick={() => handleNextPage()}
					>
						<ChevronRight className="w-4 h-4" />
					</button>
				</div>
			</div>

			<div className="space-y-4">
				<div className="flex items-center gap-3 min-h-[44px]">
					<label className="text-sm font-medium text-slate-700 whitespace-nowrap">
						Lọc theo:
					</label>
					<div className="relative w-48">
						<select
							value={filterType}
							onChange={(e) => setFilterType(e.target.value)}
							className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-700 w-full appearance-none cursor-pointer bg-white font-medium"
						>
							{filterOptions.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					</div>

					<div
						className="flex items-center gap-2 ml-auto"
						style={{ contain: "layout" }}
					>
						<button
							onClick={() => scroll("left")}
							className="p-1 border-2 border-slate-900 rounded-full transition-all text-slate-900 hover:bg-slate-900 hover:text-white flex-shrink-0"
						>
							<ChevronLeft className="w-3 h-3" />
						</button>
						<div
							ref={tabsRef}
							className="flex items-center gap-2 overflow-x-auto scroll-smooth hide-scrollbar max-w-[800px]"
						>
							{(() => {
								const options =
									filterType === "location"
										? locations
										: filterType === "salary"
											? salaries
											: experiences;
								const firstLabel =
									filterType === "location" ? "Ngẫu Nhiên" : "Tất cả";
								return options.map((item, idx) => {
									const value = idx === 0 ? firstLabel : item;
									const isSelected =
										(filterType === "location" && selectedLocation === value) ||
										(filterType === "salary" && selectedSalary === value) ||
										(filterType === "experience" &&
											selectedExperience === value);
									return (
										<button
											key={idx}
											onClick={() => {
												if (filterType === "location")
													setSelectedLocation(value);
												else if (filterType === "salary")
													setSelectedSalary(value);
												else if (filterType === "experience")
													setSelectedExperience(value);
												setCurrentPage(1);
											}}
											className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all border-2 flex-shrink-0 ${isSelected ? "bg-black text-white border-black" : "bg-slate-100 text-slate-600 border-slate-100 hover:border-slate-900"}`}
										>
											{value}
										</button>
									);
								});
							})()}
						</div>
						<button
							onClick={() => scroll("right")}
							className="p-1 border-2 border-slate-900 rounded-full transition-all text-slate-900 hover:bg-slate-900 hover:text-white flex-shrink-0"
						>
							<ChevronRight className="w-3 h-3" />
						</button>
					</div>
				</div>
			</div>

			{/* Jobs Grid */}
			<div
				className="w-full grid grid-cols-3 gap-3 auto-rows-max relative"
				ref={gridRef}
			>
				{loading && (
					<div className="col-span-3 text-center py-8">Đang tải...</div>
				)}
				{!loading &&
					jobs.map((job) => (
						<div key={job.id} className="relative">
							<JobCard
								job={job}
								variant="grid"
								onMouseEnter={(jobId, event) => {
									if (hideTimeoutRef.current) {
										clearTimeout(hideTimeoutRef.current);
										hideTimeoutRef.current = null;
									}
									const rect = event.currentTarget.getBoundingClientRect();
									setHoveredJobId(jobId);
									let leftPos = rect.right + 6;
									let topPos = rect.top;
									if (leftPos + 384 > window.innerWidth)
										leftPos = rect.left - 384 - 6;
									if (topPos + 450 > window.innerHeight)
										topPos = window.innerHeight - 470;
									setPreviewPosition({
										top: Math.max(20, topPos),
										left: Math.max(20, leftPos),
									});
								}}
								onMouseLeave={() => {
									hideTimeoutRef.current = setTimeout(() => {
										if (!popupHovered) {
											setHoveredJobId(null);
											setPreviewPosition(null);
										}
									}, 200);
								}}
							/>
							{hoveredJobId === job.id && previewPosition && (
								<JobPreviewPopup
									job={job}
									position={previewPosition}
									onPopupHover={handlePopupHover}
								/>
							)}
						</div>
					))}
			</div>

			{/* Pagination */}
			<div className="flex items-center justify-center gap-2 h-[40px]">
				{totalPages > 1 && (
					<>
						<button
							onClick={handlePrevPage}
							className="p-1.5 border-2 border-slate-900 rounded-full transition-all text-slate-900 hover:bg-slate-900 hover:text-white"
						>
							<ChevronLeft className="w-4 h-4" />
						</button>
						<span className="text-sm text-slate-500">
							{currentPage} / {totalPages}
						</span>
						<button
							onClick={handleNextPage}
							className="p-1.5 border-2 border-slate-900 rounded-full transition-all text-slate-900 hover:bg-slate-900 hover:text-white"
						>
							<ChevronRight className="w-4 h-4" />
						</button>
					</>
				)}
			</div>
		</div>
	);
}
