import * as React from "react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface TruncatedLocationsProps {
	locations: string[];
	maxShow?: number;
	className?: string;
}

export function TruncatedLocations({
	locations,
	maxShow = 2,
	className,
}: TruncatedLocationsProps) {
	if (!locations || locations.length === 0) {
		return (
			<span className={cn("text-slate-500", className)}>Chưa xác định</span>
		);
	}

	const showList = locations.slice(0, maxShow);
	const remainingCount = locations.length - maxShow;

	return (
		<div
			className={cn("inline-flex items-center flex-wrap gap-y-1", className)}
		>
			<span className="text-inherit">{showList.join(", ")}</span>
			{remainingCount > 0 && (
				<TooltipProvider delayDuration={100}>
					<Tooltip>
						<TooltipTrigger asChild>
							<span className="text-slate-900 font-bold cursor-help ml-1 whitespace-nowrap hover:underline">
								và {remainingCount} địa điểm khác
							</span>
						</TooltipTrigger>
						<TooltipContent className="max-w-[300px] bg-slate-900 text-white p-3 text-xs rounded-lg shadow-xl border-none">
							<div className="flex flex-wrap gap-1">
								{locations.map((loc, idx) => (
									<span
										key={idx}
										className="after:content-[','] last:after:content-[''] mr-1"
									>
										{loc}
									</span>
								))}
							</div>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			)}
		</div>
	);
}
