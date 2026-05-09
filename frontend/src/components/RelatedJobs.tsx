import { Job } from "@/data/mockData";
import RelatedJobCard from "./RelatedJobCard";
import JobPreviewPopup from "./JobPreviewPopup";
import axiosClient from "@/services/axiosClient";
import axiosAI from "@/services/axiosAI";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

interface RelatedJobsProps {
	currentJobId: number;
	currentJob: Job;
}

export default function RelatedJobs({
	currentJobId,
	currentJob,
}: RelatedJobsProps) {
	const [relatedJobs, setRelatedJobs] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const { user } = useAuth();
	const [hoveredJobId, setHoveredJobId] = useState<number | null>(null);
	const [previewPosition, setPreviewPosition] = useState<{
		top: number;
		left: number;
	} | null>(null);
	const [popupHovered, setPopupHovered] = useState(false);
	const gridRef = useRef<HTMLDivElement>(null);
	const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		return () => {
			if (hideTimeoutRef.current) {
				clearTimeout(hideTimeoutRef.current);
			}
		};
	}, []);

	useEffect(() => {
		const fetchFallbackJobs = async () => {
			try {
				const categoryId =
					(currentJob as any).categories?.[0]?.id ||
					(currentJob as any).categoryIds?.[0];
				const params: any = { limit: 5 };
				if (user?.id) params.userId = user.id;
				if (categoryId) params.categoryId = categoryId;

				const res = await axiosClient.get("/api/jobs/search", { params });
				if (res.data.errCode === 0 && res.data.jobs) {
					const filtered = (res.data.jobs.jobs || []).filter(
						(j: any) => j.id !== currentJobId,
					);
					setRelatedJobs(filtered.slice(0, 4));
				}
			} catch (e) {
				console.error("Fallback failed", e);
			}
		};

		const fetchRelatedJobs = async () => {
			if (!currentJobId || !currentJob) return;
			setIsLoading(true);
			try {
				// 1. Gọi AI Server để lấy ID các job liên quan ngữ nghĩa
				const aiRes = await axiosAI.get("/api/recommend", {
					params: {
						q: currentJob.title,
						limit: 5,
						exclude_id: currentJobId,
					},
				});

				if (aiRes.data.errCode === 0) {
					const recommended = aiRes.data.data; // List {id, job_title, ...}

					// 2. Fetch chi tiết từng job từ Backend chính để có đầy đủ thông tin (Company, salary, ...)
					const detailPromises = recommended.map((item: any) =>
						axiosClient
							.get(`/api/jobs/${item.id}`, {
								params: { userId: user?.id },
							})
							.then((res) => (res.data.errCode === 0 ? res.data.data : null)),
					);

					const fullJobs = await Promise.all(detailPromises);
					setRelatedJobs(fullJobs.filter((j) => j !== null).slice(0, 4));
				} else {
					// Fallback nếu AI lỗi
					console.warn("AI Recommendation failed, using category fallback");
					fetchFallbackJobs();
				}
			} catch (err) {
				console.error("Failed to fetch related jobs from AI", err);
				fetchFallbackJobs();
			} finally {
				setIsLoading(false);
			}
		};

		fetchRelatedJobs();
	}, [currentJobId, currentJob, user]);

	const handlePopupHover = (hovered: boolean) => {
		setPopupHovered(hovered);
		if (hovered) {
			// Clear timeout when mouse enters popup
			if (hideTimeoutRef.current) {
				clearTimeout(hideTimeoutRef.current);
				hideTimeoutRef.current = null;
			}
		} else {
			// Set timeout when mouse leaves popup
			hideTimeoutRef.current = setTimeout(() => {
				setHoveredJobId(null);
				setPreviewPosition(null);
			}, 200);
		}
	};

	if (relatedJobs.length === 0) {
		return null;
	}

	return (
		<div className="mt-12">
			{/* Header with black line */}
			<div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-black">
				<div className="w-1 h-6 bg-black rounded"></div>
				<h2 className="text-lg font-bold text-slate-900">Việc làm liên quan</h2>
			</div>

			{/* List of related jobs */}
			<div className="space-y-3" ref={gridRef}>
				{relatedJobs.map((job) => (
					<div key={job.id} className="relative">
						<RelatedJobCard
							job={job}
							onMouseEnter={(jobId, event) => {
								// Clear any pending hide timeout
								if (hideTimeoutRef.current) {
									clearTimeout(hideTimeoutRef.current);
									hideTimeoutRef.current = null;
								}
								const rect = event.currentTarget.getBoundingClientRect();
								setHoveredJobId(jobId);
								// Calculate position for fixed popup - outside card
								let leftPos = rect.right + 12;
								let topPos = rect.top;
								// If popup would overflow to the right, show it on the left
								if (leftPos + 384 > window.innerWidth) {
									leftPos = rect.left - 384 - 12;
								}
								// Adjust top if popup would overflow bottom
								if (topPos + 450 > window.innerHeight) {
									topPos = window.innerHeight - 470;
								}
								setPreviewPosition({
									top: Math.max(20, topPos),
									left: Math.max(20, leftPos),
								});
							}}
							onMouseLeave={() => {
								// Delay hiding popup to allow mouse to move into it
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

			{/* Note for future word2vec integration */}
			<div className="text-xs text-slate-500 mt-4">
				{/* TODO: Replace scoring logic with word2vec similarity when available */}
			</div>
		</div>
	);
}
