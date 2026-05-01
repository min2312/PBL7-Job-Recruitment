import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface NumberedPaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	className?: string;
}

/**
 * Generates the array of page numbers to display.
 * Shows first pages, last pages, current page neighborhood, and ellipses.
 * Example: [1, 2, 3, '...', 8, 9, 10, '...', 33, 34]
 */
function getPageNumbers(
	current: number,
	total: number,
): (number | "...")[] {
	if (total <= 7) {
		return Array.from({ length: total }, (_, i) => i + 1);
	}

	const pages: (number | "...")[] = [];
	const showStart = Math.max(2, current - 1);
	const showEnd = Math.min(total - 1, current + 1);

	// Always show page 1
	pages.push(1);

	// Ellipsis after 1 if gap
	if (showStart > 2) {
		pages.push("...");
	}

	// Middle pages
	for (let i = showStart; i <= showEnd; i++) {
		pages.push(i);
	}

	// Ellipsis before last if gap
	if (showEnd < total - 1) {
		pages.push("...");
	}

	// Always show last page
	pages.push(total);

	return pages;
}

export default function NumberedPagination({
	currentPage,
	totalPages,
	onPageChange,
	className,
}: NumberedPaginationProps) {
	if (totalPages <= 1) return null;

	const pages = getPageNumbers(currentPage, totalPages);

	return (
		<div
			className={cn(
				"flex items-center justify-center gap-1",
				className,
			)}
		>
			{/* Previous */}
			<button
				onClick={() => {
					onPageChange(Math.max(1, currentPage - 1));
					window.scrollTo(0, 0);
				}}
				disabled={currentPage === 1}
				className="w-9 h-9 flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
				aria-label="Trang trước"
			>
				<ChevronLeft className="w-4 h-4" />
			</button>

			{/* Page numbers */}
			{pages.map((page, idx) =>
				page === "..." ? (
					<span
						key={`ellipsis-${idx}`}
						className="w-9 h-9 flex items-center justify-center text-sm text-slate-400 select-none"
					>
						...
					</span>
				) : (
					<button
						key={page}
						onClick={() => {
							if (page !== currentPage) {
								onPageChange(page);
								window.scrollTo(0, 0);
							}
						}}
						className={cn(
							"w-9 h-9 flex items-center justify-center rounded-md text-sm font-semibold transition-colors",
							page === currentPage
								? "bg-emerald-600 text-white shadow-sm"
								: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
						)}
						aria-current={page === currentPage ? "page" : undefined}
					>
						{page}
					</button>
				),
			)}

			{/* Next */}
			<button
				onClick={() => {
					onPageChange(Math.min(totalPages, currentPage + 1));
					window.scrollTo(0, 0);
				}}
				disabled={currentPage === totalPages}
				className="w-9 h-9 flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
				aria-label="Trang sau"
			>
				<ChevronRight className="w-4 h-4" />
			</button>

			{/* Jump to page */}
			<div className="flex items-center gap-2 ml-4 text-sm text-slate-500">
				<span>Đến trang:</span>
				<input
					type="number"
					min={1}
					max={totalPages}
					className="w-12 h-9 px-1 text-center border border-slate-200 rounded-md focus:outline-none focus:border-emerald-500 transition-colors"
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							const val = parseInt((e.target as HTMLInputElement).value);
							if (val >= 1 && val <= totalPages) {
								onPageChange(val);
								window.scrollTo(0, 0);
							}
						}
					}}
					placeholder="..."
				/>
			</div>
		</div>
	);
}
