import * as React from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

interface SearchableSelectOption {
	value: string;
	label: string;
}

interface SearchableSelectProps {
	options: SearchableSelectOption[];
	value: string;
	onValueChange: (value: string) => void;
	placeholder?: string;
	searchPlaceholder?: string;
	icon?: React.ReactNode;
	className?: string;
	triggerClassName?: string;
}

export function SearchableSelect({
	options,
	value,
	onValueChange,
	placeholder = "Chọn...",
	searchPlaceholder = "Tìm kiếm...",
	icon,
	className,
	triggerClassName,
}: SearchableSelectProps) {
	const [open, setOpen] = React.useState(false);
	const [search, setSearch] = React.useState("");
	const inputRef = React.useRef<HTMLInputElement>(null);

	const selectedLabel =
		options.find((o) => o.value === value)?.label || placeholder;

	const filtered = search.trim()
		? options.filter((o) =>
				o.label.toLowerCase().includes(search.toLowerCase()),
			)
		: options;

	// Focus input when popover opens
	React.useEffect(() => {
		if (open) {
			setTimeout(() => inputRef.current?.focus(), 0);
		} else {
			setSearch("");
		}
	}, [open]);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					type="button"
					className={cn(
						"flex items-center gap-2 min-h-[44px] px-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-sm text-slate-900 hover:border-slate-400 transition-colors focus:outline-none focus:border-slate-900 min-w-[220px]",
						triggerClassName,
					)}
				>
					{icon && (
						<span className="flex-shrink-0 text-slate-400">{icon}</span>
					)}
					<span className="flex-1 text-left truncate">{selectedLabel}</span>
					<ChevronDown className="w-4 h-4 flex-shrink-0 text-slate-400" />
				</button>
			</PopoverTrigger>
			<PopoverContent
				className={cn(
					"p-0 w-[--radix-popover-trigger-width] rounded-xl shadow-lg border-slate-200",
					className,
				)}
				align="start"
				sideOffset={4}
			>
				{/* Search input */}
				<div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100">
					<Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
					<input
						ref={inputRef}
						type="text"
						placeholder={searchPlaceholder}
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="flex-1 outline-none text-sm bg-transparent text-slate-900 placeholder:text-slate-400 font-medium"
					/>
				</div>
				{/* Options list */}
				<div className="max-h-60 overflow-y-auto py-1">
					{filtered.length === 0 ? (
						<div className="px-3 py-4 text-center text-sm text-slate-400">
							Không tìm thấy kết quả
						</div>
					) : (
						filtered.map((option) => {
							const isSelected = option.value === value;
							return (
								<button
									key={option.value}
									type="button"
									onClick={() => {
										onValueChange(option.value);
										setOpen(false);
									}}
									className={cn(
										"w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-left transition-colors cursor-pointer",
										isSelected
											? "bg-slate-100 text-slate-900"
											: "text-slate-700 hover:bg-slate-50 hover:text-slate-900",
									)}
								>
									<Check
										className={cn(
											"w-4 h-4 flex-shrink-0",
											isSelected ? "opacity-100" : "opacity-0",
										)}
									/>
									<span className="truncate">{option.label}</span>
								</button>
							);
						})
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
}
