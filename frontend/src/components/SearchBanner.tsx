import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, MapPin, Search } from "lucide-react";
import { SearchableSelect } from "@/components/ui/searchable-select";
import axiosClient from "@/services/axiosClient";

export default function SearchBanner() {
	const navigate = useNavigate();

	// State for data
	const [categories, setCategories] = useState<any[]>([]);
	const [locations, setLocations] = useState<any[]>([]);
	const bannerRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const mouseRef = useRef({ x: -999, y: -999 });
	const particlesRef = useRef<any[]>([]);

	// Local state for search banner
	const [localSearch, setLocalSearch] = useState("");
	const [localCategory, setLocalCategory] = useState("all");
	const [localLocation, setLocalLocation] = useState(
		"Tất cả tỉnh/thành phố",
	);

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
		const canvas = canvasRef.current;
		const banner = bannerRef.current;
		if (!canvas || !banner) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const COLORS = [
			"#378ADD",
			"#E24B4A",
			"#EF9F27",
			"#1D9E75",
			"#7F77DD",
			"#D4537E",
		];
		let width = 0;
		let height = 0;
		let raf: number;

		function resize() {
			width = canvas.width = banner.offsetWidth;
			height = canvas.height = banner.offsetHeight;
		}

		class Particle {
			x = 0;
			y = 0;
			vx = 0;
			vy = 0;
			size = 0;
			color = "";
			alpha = 0;
			angle = 0;
			angleV = 0;

			constructor() {
				this.reset(true);
			}

			reset(cold: boolean) {
				this.x = Math.random() * width;
				this.y = cold ? Math.random() * height : -10;
				this.vx = (Math.random() - 0.5) * 0.4;
				this.vy = Math.random() * 0.3 + 0.05;
				this.size = Math.random() * 3 + 1.2;
				this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
				this.alpha = Math.random() * 0.5 + 0.25;
				this.angle = Math.random() * Math.PI * 2;
				this.angleV = (Math.random() - 0.5) * 0.04;
			}

			update() {
				const { x: mx, y: my } = mouseRef.current;
				const dx = this.x - mx;
				const dy = this.y - my;
				const dist = Math.sqrt(dx * dx + dy * dy);
				if (dist < 120) {
					const force = (120 - dist) / 120;
					this.vx += (dx / dist) * force * 0.25;
					this.vy += (dy / dist) * force * 0.25;
				}
				this.vx *= 0.97;
				this.vy *= 0.97;
				this.vy += 0.012;
				this.x += this.vx;
				this.y += this.vy;
				this.angle += this.angleV;
				if (
					this.y > height + 10 ||
					this.x < -20 ||
					this.x > width + 20
				)
					this.reset(false);
			}

			draw() {
				ctx.save();
				ctx.globalAlpha = this.alpha;
				ctx.translate(this.x, this.y);
				ctx.rotate(this.angle);
				ctx.fillStyle = this.color;
				ctx.beginPath();
				ctx.ellipse(0, 0, this.size, this.size * 2.5, 0, 0, Math.PI * 2);
				ctx.fill();
				ctx.restore();
			}
		}

		resize();
		particlesRef.current = Array.from({ length: 100 }, () => new Particle());

		function loop() {
			ctx.clearRect(0, 0, width, height);
			particlesRef.current.forEach((p) => {
				p.update();
				p.draw();
			});
			raf = requestAnimationFrame(loop);
		}

		const handleMouseMove = (e: MouseEvent) => {
			const r = banner.getBoundingClientRect();
			mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
		};

		const handleMouseLeave = () => {
			mouseRef.current = { x: -999, y: -999 };
		};

		const handleResize = () => resize();

		banner.addEventListener("mousemove", handleMouseMove);
		banner.addEventListener("mouseleave", handleMouseLeave);
		window.addEventListener("resize", handleResize);
		loop();

		return () => {
			cancelAnimationFrame(raf);
			banner.removeEventListener("mousemove", handleMouseMove);
			banner.removeEventListener("mouseleave", handleMouseLeave);
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	useEffect(() => {
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

	const handleSearchSubmit = () => {
		const params = new URLSearchParams();
		if (localSearch) params.set("search", localSearch);
		if (localCategory && localCategory !== "all") {
			params.set("categoryId", localCategory);
		}
		if (localLocation && localLocation !== "Tất cả tỉnh/thành phố") {
			params.set("location", localLocation);
		}

		navigate(`/job-search?${params.toString()}`);
	};

	return (
		<div
			ref={bannerRef}
			className="relative w-full bg-white px-6 py-6 border-b border-slate-200"
		>
			<canvas
				ref={canvasRef}
				className="absolute inset-0 w-full h-full pointer-events-none"
				style={{ zIndex: 1 }}
			/>
			<div
				className="max-w-6xl mx-auto flex flex-col md:flex-row gap-4 md:items-center"
				style={{ zIndex: 2 }}
			>
				{/* Text search input */}
				<div className="flex-1 relative flex items-center gap-2 px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus-within:border-slate-900 transition-all group min-h-[48px]">
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
					triggerClassName="h-[48px] min-w-[220px] px-4 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-sm text-slate-900 hover:border-slate-400 focus:border-slate-900"
				/>

				{/* Location dropdown */}
				<SearchableSelect
					value={localLocation}
					onValueChange={setLocalLocation}
					options={locationOptions}
					placeholder="Tất cả tỉnh/thành phố"
					searchPlaceholder="Tìm tỉnh/thành phố..."
					icon={<MapPin className="w-4 h-4" />}
					triggerClassName="h-[48px] min-w-[240px] px-4 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-sm text-slate-900 hover:border-slate-400 focus:border-slate-900"
				/>

				{/* Search button */}
				<button
					onClick={handleSearchSubmit}
					className="px-8 py-2.5 bg-black text-white hover:bg-slate-800 rounded-xl font-bold text-sm whitespace-nowrap shadow-md min-h-[48px] transition-colors"
				>
					Tìm kiếm
				</button>
			</div>
		</div>
	);
}
