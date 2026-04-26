import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, MapPin, Briefcase } from "lucide-react";
import JobCard from "@/components/JobCard";
import NumberedPagination from "@/components/NumberedPagination";
import { SearchableSelect } from "@/components/ui/searchable-select";
import axiosClient from "@/services/axiosClient";
import { useAuth } from "@/hooks/useAuth";

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

export default function JobSearchPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const { user } = useAuth();

	// State for data
	const [jobs, setJobs] = useState<any[]>([]);
	const [categories, setCategories] = useState<any[]>([]);
	const [locations, setLocations] = useState<any[]>([]);
	const [total, setTotal] = useState(0);
	const [isLoading, setIsLoading] = useState(false);

	// Sync params with state
	const searchQuery = searchParams.get("search") || "";
	const selectedCategory = searchParams.get("categoryId") || "all";
	const selectedLocation =
		searchParams.get("location") || "Tất cả tỉnh/thành phố";
	const selectedExperience = searchParams.get("experience") || "Tất cả";
	const selectedSalary = searchParams.get("salary") || "Tất cả";
	const currentPage = parseInt(searchParams.get("page") || "1");
	const pageSize = 20;

	// Update URL params
	const updateParams = (newParams: Record<string, string>) => {
		const params = new URLSearchParams(searchParams);
		Object.entries(newParams).forEach(([key, value]) => {
			if (
				value === "all" ||
				value === "Tất cả" ||
				value === "Tất cả tỉnh/thành phố" ||
				!value
			) {
				params.delete(key);
			} else {
				params.set(key, value);
			}
		});
		// Reset page on filter change
		if (!newParams.page) params.set("page", "1");
		setSearchParams(params);
	};

	const handleSearchSubmit = () => {
		updateParams({
			search: localSearch,
			categoryId: localCategory,
			location: localLocation,
		});
	};

	// Local state for search banner
	const [localSearch, setLocalSearch] = useState(searchQuery);
	const [localCategory, setLocalCategory] = useState(selectedCategory);
	const [localLocation, setLocalLocation] = useState(selectedLocation);

	// Sync local state when URL changes
	useEffect(() => {
		setLocalSearch(searchQuery);
		setLocalCategory(selectedCategory);
		setLocalLocation(selectedLocation);
	}, [searchQuery, selectedCategory, selectedLocation]);

	// Memoized options for searchable selects
	const categoryOptions = useMemo(
		() => [
			{ value: "all", label: "Tất cả lĩnh vực" },
			...categories.map((cat) => ({
				value: cat.id.toString(),
				label: cat.name,
			})),
		],
		[categories],
	);

	const locationOptions = useMemo(
		() => [
			{ value: "Tất cả tỉnh/thành phố", label: "Tất cả tỉnh/thành phố" },
			...locations.map((loc) => ({
				value: loc.name,
				label: loc.name,
			})),
		],
		[locations],
	);

	useEffect(() => {
		window.scrollTo(0, 0);
		// Fetch categories and locations
		const fetchOptions = async () => {
			try {
				const [catRes, locRes] = await Promise.all([
					axiosClient.get("/api/categories"),
					axiosClient.get("/api/locations"),
				]);
				if (catRes.data.data) setCategories(catRes.data.data);
				if (locRes.data.data) setLocations(locRes.data.data);
			} catch (err) {
				console.error("Failed to fetch options", err);
			}
		};
		fetchOptions();
	}, []);

	useEffect(() => {
		const fetchJobs = async () => {
			setIsLoading(true);
			try {
				const params: Record<string, any> = {
					limit: pageSize,
					page: currentPage,
				};
				if (user?.id) params.userId = user.id;
				if (searchQuery) params.search = searchQuery;
				if (selectedCategory && selectedCategory !== "all")
					params.categoryId = selectedCategory;
				if (selectedLocation && selectedLocation !== "Tất cả tỉnh/thành phố")
					params.location = selectedLocation;
				if (selectedExperience && selectedExperience !== "Tất cả")
					params.experience = selectedExperience;
				if (selectedSalary && selectedSalary !== "Tất cả")
					params.salary = selectedSalary;

				const res = await axiosClient.get("/api/jobs/search", { params });
				if (res.data.jobs) {
					setJobs(res.data.jobs.jobs || []);
					setTotal(res.data.jobs.total || 0);
				}
			} catch (error) {
				console.error("Failed to fetch jobs", error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchJobs();
	}, [currentPage, searchQuery, selectedCategory, selectedLocation, selectedExperience, selectedSalary, pageSize, user]);

	const totalPages = Math.max(1, Math.ceil(total / pageSize));

	return (
		<div className="min-h-screen bg-slate-50 pb-12">
			{/* Search Banner inline */}
			<div className="w-full bg-white px-6 py-8 border-b border-slate-200">
				<div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-3">
					{/* Text search input */}
					<div className="flex-1 relative flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus-within:border-slate-900 transition-all group min-h-[44px]">
						<Search className="w-5 h-5 text-slate-400 group-focus-within:text-slate-900 flex-shrink-0" />
						<input
							type="text"
							placeholder="Tên công việc, vị trí"
							value={localSearch}
							onChange={(e) => setLocalSearch(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
							className="flex-1 outline-none text-sm bg-transparent font-medium text-slate-900 placeholder:text-slate-400"
						/>
					</div>

					{/* Category dropdown */}
					<SearchableSelect
						value={localCategory}
						onValueChange={setLocalCategory}
						options={categoryOptions}
						placeholder="Tất cả lĩnh vực"
						searchPlaceholder="Tìm lĩnh vực..."
						icon={<Briefcase className="w-4 h-4" />}
					/>

					{/* Location dropdown */}
					<SearchableSelect
						value={localLocation}
						onValueChange={setLocalLocation}
						options={locationOptions}
						placeholder="Tất cả tỉnh/thành phố"
						searchPlaceholder="Tìm tỉnh/thành phố..."
						icon={<MapPin className="w-4 h-4" />}
					/>

					{/* Search button */}
					<button
						onClick={handleSearchSubmit}
						className="px-8 py-2 bg-black text-white hover:bg-slate-800 rounded-lg font-bold text-sm whitespace-nowrap shadow-md min-h-[44px] transition-colors"
					>
						Tìm kiếm
					</button>
				</div>
			</div>

			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
				<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
					{/* Sidebar */}
					<div className="lg:col-span-1 space-y-6">
						{/* Mức lương */}
						<div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
							<h3 className="font-bold text-slate-900 mb-5 pb-3 border-b border-slate-100">
								Mức lương
							</h3>
							<div className="space-y-4">
								{salaries.map((sal) => (
									<label
										key={sal}
										className="flex items-center gap-3 cursor-pointer group"
									>
										<div className="relative flex items-center justify-center w-5 h-5 flex-shrink-0">
											<input
												type="radio"
												name="salary"
												checked={selectedSalary === sal}
												onChange={() => updateParams({ salary: sal })}
												className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded-full checked:border-emerald-600 cursor-pointer transition-colors focus:outline-none"
											/>
											<div className="absolute w-2.5 h-2.5 bg-emerald-600 rounded-full scale-0 peer-checked:scale-100 transition-transform pointer-events-none"></div>
										</div>
										<span
											className={`text-sm font-medium transition-colors cursor-pointer ${selectedSalary === sal ? "text-emerald-700" : "text-slate-700 group-hover:text-slate-900"}`}
										>
											{sal}
										</span>
									</label>
								))}
							</div>
						</div>

						{/* Kinh nghiệm */}
						<div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
							<h3 className="font-bold text-slate-900 mb-5 pb-3 border-b border-slate-100">
								Kinh nghiệm
							</h3>
							<div className="space-y-4">
								{experiences.map((exp) => (
									<label
										key={exp}
										className="flex items-center gap-3 cursor-pointer group"
									>
										<div className="relative flex items-center justify-center w-5 h-5 flex-shrink-0">
											<input
												type="radio"
												name="experience"
												checked={selectedExperience === exp}
												onChange={() => updateParams({ experience: exp })}
												className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded-full checked:border-emerald-600 cursor-pointer transition-colors focus:outline-none"
											/>
											<div className="absolute w-2.5 h-2.5 bg-emerald-600 rounded-full scale-0 peer-checked:scale-100 transition-transform pointer-events-none"></div>
										</div>
										<span
											className={`text-sm font-medium transition-colors cursor-pointer ${selectedExperience === exp ? "text-emerald-700" : "text-slate-700 group-hover:text-slate-900"}`}
										>
											{exp}
										</span>
									</label>
								))}
							</div>
						</div>
					</div>

					{/* Jobs List */}
					<div className="lg:col-span-3">
						<div className="mb-6 flex justify-between items-end">
							<h2 className="text-xl font-bold text-slate-900">
								Có {total} việc làm phù hợp
							</h2>
						</div>

						{isLoading ? (
							<div className="py-20 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 shadow-sm">
								<div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
								<p className="font-medium text-slate-500">
									Đang tìm kiếm việc làm...
								</p>
							</div>
						) : jobs.length === 0 ? (
							<div className="py-20 text-center font-medium text-slate-500 bg-white rounded-xl border border-slate-200 shadow-sm">
								Không tìm thấy công việc phù hợp với tiêu chí của bạn.
							</div>
						) : (
							<div className="space-y-4">
								{jobs.map((job) => (
									<JobCard key={job.id} job={job} variant="list" />
								))}
							</div>
						)}

						{/* Pagination */}
						<NumberedPagination
							currentPage={currentPage}
							totalPages={totalPages}
							onPageChange={(page) => updateParams({ page: page.toString() })}
							className="mt-8"
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
