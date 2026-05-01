import { Link, useNavigate } from "react-router-dom";
import {
	Job,
	getCompanyById,
	getCategoryById,
	getLocationById,
} from "@/data/mockData";
import {
	MapPin,
	Clock,
	Briefcase,
	Bookmark,
	DollarSign,
	Heart,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { set } from "date-fns";
import axiosClient from "@/services/axiosClient";
import { toast } from "react-toastify";

interface JobCardProps {
	job: Job;
	onMouseEnter?: (
		jobId: number,
		event: React.MouseEvent<HTMLDivElement>,
	) => void;
	onMouseLeave?: () => void;
	variant?: "grid" | "list"; // grid for TopJobsList, list for others
	onSaveToggle?: () => void;
}

export default function JobCard({
	job,
	onMouseEnter,
	onMouseLeave,
	variant = "grid",
	onSaveToggle,
}: JobCardProps) {
	const company = (job as any).Company ?? getCompanyById(job.companyId);
	const firstCategory =
		(job as any).categories?.[0] ??
		(job.categoryIds?.[0] ? getCategoryById(job.categoryIds[0]) : null);
	const firstLocation =
		(job as any).locations?.[0] ??
		(job.locationIds?.[0] ? getLocationById(job.locationIds[0]) : null);
	const [isSaved, setIsSaved] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const { user } = useAuth();
	const navigate = useNavigate();


  useEffect(() => {
    setIsSaved(job.isSaved || false);
  }, [job.isSaved]);

	const handleSaveJob = async (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		e.stopPropagation();

		if (!user?.id) {
			// Redirect to login if not authenticated
			window.location.href = "/login";
			return;
		}

		setIsLoading(true);
		try {
			const response = await axiosClient.post(`/api/jobs/save`, {
        userId: user.id,
        jobId: job.id
      });
			const data = response.data;

			if (data.errCode === 0) {
				setIsSaved(!isSaved);
        toast.success(isSaved ? "Job removed from saved list" : "Job saved successfully");
				if (onSaveToggle) onSaveToggle();
			} else {
				toast.error("Error saving job: " + data.errMessage);
			}
		} catch (error) {
			toast.error("An error occurred while saving the job.");
			console.error("Error:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
		if (onMouseEnter) {
			onMouseEnter(job.id, e);
		}
	};

	if (variant === "grid") {
		// Grid variant for TopJobsList
		return (
			<Card
				className="p-4 border-2 border-slate-200 hover:border-black hover:shadow-lg transition-all cursor-pointer group h-[200px] flex flex-col overflow-hidden bg-white"
				onClick={() => navigate(`/jobs/${job.id}`, { state: { job } })}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={onMouseLeave}
			>
				<div className="flex gap-3 flex-shrink-0">
					<div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-200 overflow-hidden">
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
							<div className="w-8 h-8 bg-gradient-to-br from-slate-300 to-slate-400 rounded-lg"></div>
						)}
					</div>
					<div className="flex-1 min-w-0">
						<div
							className="font-semibold text-slate-900 text-sm line-clamp-2 hover:text-slate-700 group-hover:underline block leading-snug"
						>
							{job.title}
						</div>
						<Link
							to={`/companies/${company?.id ?? job.companyId}`}
							onClick={(e) => e.stopPropagation()}
							className="text-xs text-slate-600 mt-0.5 line-clamp-1 font-medium hover:text-slate-900 hover:underline inline-block"
						>
							{company?.name || job.companyId}
						</Link>
					</div>
					<button
						onClick={handleSaveJob}
						disabled={isLoading}
						className={`w-8 h-8 flex items-center justify-center rounded-full border border-black hover:bg-slate-200 transition-colors flex-shrink-0 ${isSaved ? "bg-slate-900" : ""}`}
					>
						<Heart
							className={`w-4 h-4 ${isSaved ? "fill-white text-white" : "text-black"}`}
						/>
					</button>
				</div>

				{/* Salary, Location and Experience - always at bottom */}
				<div className="flex items-center gap-2 mt-auto pt-3 flex-wrap">
					<span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-md border border-emerald-200/50 whitespace-nowrap">
						<DollarSign className="w-3 h-3" />
						<span className="truncate max-w-[100px]">{job.salary || "Thoả thuận"}</span>
					</span>
					<span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 whitespace-nowrap">
						<MapPin className="w-3 h-3 flex-shrink-0 text-slate-400" />
						<span className="truncate max-w-[80px]">{firstLocation?.name || "Chưa xác định"}</span>
					</span>
					<span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 whitespace-nowrap">
						<Clock className="w-3 h-3 flex-shrink-0 text-slate-400" />
						<span className="truncate max-w-[80px]">{job.experience || "Chưa xác định"}</span>
					</span>
				</div>
			</Card>
		);
	}

	// Default variant (list/detailed)
	return (
		<div
			className="block group hover:cursor-pointer"
			onClick={() => navigate(`/jobs/${job.id}`, { state: { job } })}
		>
			<div className="relative bg-card rounded-lg border border-border p-5 transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5">
				<button
					className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition"
					onClick={handleSaveJob}
				>
					<Bookmark className={`w-5 h-5 ${isSaved ? "fill-yellow-500 text-yellow-500" : "text-black"}`}	 />
				</button>

				<div className="flex gap-4">
					<div className="w-14 h-14 rounded-lg bg-muted flex-shrink-0 overflow-hidden border border-border">
						{company?.logo && (
							<img
								src={company.logo}
								alt={company.name}
								className="w-full h-full object-contain"
								onError={(e) => {
									(e.target as HTMLImageElement).style.display = "none";
								}}
							/>
						)}
					</div>
					<div className="flex-1 min-w-0">
						<div
							className="font-heading font-semibold text-foreground group-hover:text-primary transition line-clamp-1 group-hover:underline"
						>
							{job.title}
						</div>
						<Link
							to={`/companies/${company?.id ?? job.companyId}`}
							onClick={(e) => e.stopPropagation()}
							className="text-sm text-muted-foreground mt-1 line-clamp-1 hover:text-foreground hover:underline inline-block"
						>
							{company?.name}
						</Link>
					</div>
				</div>

				<div className="mt-4 flex flex-wrap gap-2">
					{job.isApplied && (
						<Badge className="bg-rose-100 text-rose-700 border-rose-200 text-xs font-bold">
							Đã ứng tuyển
						</Badge>
					)}
					<Badge className="bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
						{job.salary}
					</Badge>
					{firstLocation && (
						<Badge variant="outline" className="text-xs font-normal gap-1">
							<MapPin className="w-3 h-3" />
							{firstLocation.name}
						</Badge>
					)}
					<Badge variant="outline" className="text-xs font-normal gap-1">
						<Clock className="w-3 h-3" />
						{job.experience}
					</Badge>
				</div>

				<div className="mt-3 flex items-center justify-between">
					{firstCategory && (
						<span className="text-xs text-muted-foreground flex items-center gap-1">
							<Briefcase className="w-3 h-3" />
							{firstCategory.name}
						</span>
					)}
					{/* <span className="text-xs text-muted-foreground">{job.createdAt}</span> */}
				</div>
			</div>
		</div>
	);
}
