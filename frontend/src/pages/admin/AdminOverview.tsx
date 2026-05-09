import { useState, useEffect } from "react";
import {
	Users,
	Briefcase,
	Building2,
	FileText,
	LayoutDashboard,
	TrendingUp,
	ArrowUpRight,
	Activity,
} from "lucide-react";
import {
	PieChart,
	Pie,
	Cell,
	ResponsiveContainer,
	Tooltip,
	Legend,
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";
import axiosClient from "@/services/axiosClient";

const pieColors = [
	"#3b82f6",
	"#a855f7",
	"#06b6d4",
	"#10b981",
	"#f59e0b",
	"#ef4444",
];

export function AdminOverview() {
	const [stats, setStats] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		window.scrollTo(0, 0);
		fetchStats();
	}, []);

	const fetchStats = async () => {
		try {
			const res = await axiosClient.get("/api/admin/statistics");
			if (res.data.errCode === 0) {
				setStats(res.data.data);
			}
		} catch (error) {
			console.error("Error fetching admin stats:", error);
		} finally {
			setLoading(false);
		}
	};

	if (loading || !stats) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="flex flex-col items-center gap-4">
					<div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
					<p className="text-sm text-muted-foreground animate-pulse">
						Đang tải dữ liệu hệ thống...
					</p>
				</div>
			</div>
		);
	}

	const roleData = stats.userByRole.map((r: any) => ({
		name:
			r.role === "CANDIDATE"
				? "Ứng viên"
				: r.role === "EMPLOYER"
					? "Nhà tuyển dụng"
					: "Admin",
		value: parseInt(r.count),
	}));

	const appData = stats.applicationByStatus.map((s: any) => ({
		name:
			s.status === "pending"
				? "Chờ duyệt"
				: s.status === "approved"
					? "Đã duyệt"
					: "Từ chối",
		value: parseInt(s.count),
	}));

	const mainStats = [
		{
			icon: Users,
			label: "Người dùng",
			value: stats.totalUsers,
			trend: stats.trends?.users || "+0%",
			color: "from-blue-500 to-blue-600",
			shadow: "shadow-blue-500/20",
		},
		{
			icon: Briefcase,
			label: "Việc làm",
			value: stats.totalJobs,
			trend: stats.trends?.jobs || "+0%",
			color: "from-purple-500 to-purple-600",
			shadow: "shadow-purple-500/20",
		},
		{
			icon: Building2,
			label: "Công ty",
			value: stats.totalCompanies,
			trend: stats.trends?.companies || "+0%",
			color: "from-emerald-500 to-emerald-600",
			shadow: "shadow-emerald-500/20",
		},
		{
			icon: TrendingUp,
			label: "Đơn ứng tuyển",
			value: stats.totalApplications,
			trend: "+0%", // Application trend can be added later if needed
			color: "from-amber-500 to-amber-600",
			shadow: "shadow-amber-500/20",
		},
	];

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { y: 20, opacity: 0 },
		visible: { y: 0, opacity: 1 },
	};

	return (
		<motion.div
			variants={containerVariants}
			initial="hidden"
			animate="visible"
			className="space-y-8"
		>
			<div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
				<div>
					<motion.h1
						variants={itemVariants}
						className="text-4xl font-black tracking-tight text-foreground flex items-center gap-3"
					>
						<div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
							<LayoutDashboard className="w-7 h-7 text-primary" />
						</div>
						Tổng quan hệ thống
					</motion.h1>
					<motion.p
						variants={itemVariants}
						className="text-muted-foreground mt-2 font-medium"
					>
						Theo dõi và phân tích hiệu suất hoạt động của nền tảng
					</motion.p>
				</div>
				<motion.div
					variants={itemVariants}
					className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-xl border border-border/50 text-xs font-bold text-muted-foreground"
				>
					<Activity className="w-4 h-4 text-emerald-500" />
					Cập nhật trực tiếp: {new Date().toLocaleTimeString("vi-VN")}
				</motion.div>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
				{mainStats.map((stat, i) => (
					<motion.div
						key={stat.label}
						variants={itemVariants}
						whileHover={{ y: -5 }}
						className={`relative group bg-card/40 backdrop-blur-md rounded-3xl border border-border/50 p-6 shadow-xl ${stat.shadow} transition-all duration-300 overflow-hidden`}
					>
						<div
							className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-[0.03] rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500`}
						></div>

						<div className="flex items-center justify-between mb-4">
							<div
								className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-inherit/20`}
							>
								<stat.icon className="w-6 h-6" />
							</div>
							<div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 text-emerald-600 rounded-lg text-[10px] font-bold">
								<ArrowUpRight className="w-3 h-3" />
								{stat.trend}
							</div>
						</div>

						<div className="space-y-1">
							<div className="text-3xl font-black text-foreground tracking-tight">
								{stat.value.toLocaleString()}
							</div>
							<div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
								{stat.label}
							</div>
						</div>
					</motion.div>
				))}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<motion.div
					variants={itemVariants}
					className="bg-card/40 backdrop-blur-md rounded-[2rem] border border-border/50 p-8 shadow-xl"
				>
					<div className="flex items-center justify-between mb-8">
						<h3 className="text-xl font-bold text-foreground flex items-center gap-3">
							<div className="w-2 h-8 bg-blue-500 rounded-full"></div>
							Phân bổ người dùng
						</h3>
						<TrendingUp className="w-5 h-5 text-muted-foreground/30" />
					</div>
					<div className="h-[300px] w-full">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									data={roleData}
									dataKey="value"
									nameKey="name"
									cx="50%"
									cy="50%"
									innerRadius={80}
									outerRadius={110}
									paddingAngle={8}
									stroke="none"
								>
									{roleData.map((_: any, i: number) => (
										<Cell key={i} fill={pieColors[i % pieColors.length]} />
									))}
								</Pie>
								<Tooltip
									contentStyle={{
										backgroundColor: "rgba(23, 23, 23, 0.8)",
										backdropFilter: "blur(8px)",
										borderRadius: "16px",
										border: "1px solid rgba(255,255,255,0.1)",
										padding: "12px",
										boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
									}}
									itemStyle={{ color: "#fff", fontWeight: "bold" }}
								/>
								<Legend
									verticalAlign="bottom"
									height={36}
									iconType="circle"
									formatter={(value) => (
										<span className="text-xs font-bold text-muted-foreground">
											{value}
										</span>
									)}
								/>
							</PieChart>
						</ResponsiveContainer>
					</div>
				</motion.div>

				<motion.div
					variants={itemVariants}
					className="bg-card/40 backdrop-blur-md rounded-[2rem] border border-border/50 p-8 shadow-xl"
				>
					<div className="flex items-center justify-between mb-8">
						<h3 className="text-xl font-bold text-foreground flex items-center gap-3">
							<div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
							Trạng thái đơn ứng tuyển
						</h3>
						<TrendingUp className="w-5 h-5 text-muted-foreground/30" />
					</div>
					<div className="h-[300px] w-full">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									data={appData}
									dataKey="value"
									nameKey="name"
									cx="50%"
									cy="50%"
									innerRadius={80}
									outerRadius={110}
									paddingAngle={8}
									stroke="none"
								>
									{appData.map((_: any, i: number) => (
										<Cell
											key={i}
											fill={pieColors[(i + 3) % pieColors.length]}
										/>
									))}
								</Pie>
								<Tooltip
									contentStyle={{
										backgroundColor: "rgba(23, 23, 23, 0.8)",
										backdropFilter: "blur(8px)",
										borderRadius: "16px",
										border: "1px solid rgba(255,255,255,0.1)",
										padding: "12px",
										boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
									}}
									itemStyle={{ color: "#fff", fontWeight: "bold" }}
								/>
								<Legend
									verticalAlign="bottom"
									height={36}
									iconType="circle"
									formatter={(value) => (
										<span className="text-xs font-bold text-muted-foreground">
											{value}
										</span>
									)}
								/>
							</PieChart>
						</ResponsiveContainer>
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
}
