import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, Routes, Route, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Shield } from "lucide-react";
import { AdminOverview } from "./AdminOverview";
import { AdminUsers } from "./AdminUsers";
import { AdminJobs } from "./AdminJobs";
import AdminJobDetail from "./AdminJobDetail";
import { AdminCompanies } from "./AdminCompanies";
import { AdminCompaniesDetail } from "./AdminCompaniesDetail";
import { AdminApplications } from './AdminApplications';
// import { AdminReports } from './AdminReports';
import { AdminSettings } from "./AdminSettings";

export default function AdminDashboard() {
	const { user, isAuthReady } = useAuth();
	const location = useLocation();
	const mainRef = useRef<HTMLDivElement>(null);

	// Tự động cuộn lên đầu trang khi chuyển Route
	useEffect(() => {
		if (mainRef.current) {
			mainRef.current.scrollTop = 0;
		}
	}, [location.pathname]);

	if (!isAuthReady) {
		return (
			<div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground bg-background">
				<div className="flex flex-col items-center gap-4">
					<div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
					<p className="animate-pulse font-medium">Khởi tạo môi trường quản trị...</p>
				</div>
			</div>
		);
	}

	if (!user || user.role !== "ADMIN") return <Navigate to="/login" />;

	return (
		<SidebarProvider>
			<div className="min-h-screen flex w-full bg-[#f8fafc] dark:bg-[#020617]">
				<AdminSidebar />
				<div className="flex-1 flex flex-col min-w-0 overflow-hidden">
					<header className="sticky top-0 z-20 h-16 w-full flex items-center border-b border-border/40 px-6 gap-4 bg-background/80 backdrop-blur-md shrink-0">
						<SidebarTrigger className="hover:bg-muted" />
						<div className="h-6 w-px bg-border/60 mx-2" />
						<div className="flex items-center gap-3">
							<div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20">
								<Shield className="w-5 h-5 text-white" />
							</div>
							<div>
								<h1 className="font-black text-sm text-foreground tracking-tight">
									Bảng điều khiển Admin
								</h1>
								<p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
									Hệ thống MNP Recruitment
								</p>
							</div>
						</div>
					</header>
					<main ref={mainRef} className="flex-1 overflow-y-auto">
						<div className="p-8 max-w-[1600px] mx-auto">
							<Routes>
								<Route index element={<AdminOverview />} />
								<Route path="users" element={<AdminUsers />} />
								<Route path="jobs" element={<AdminJobs />} />
								<Route path="jobs/:id" element={<AdminJobDetail />} />
								<Route path="companies" element={<AdminCompanies />} />
								<Route
									path="companies/:id"
									element={<AdminCompaniesDetail />}
								/>
								<Route path="applications" element={<AdminApplications />} />
								{/* <Route path="reports" element={<AdminReports />} /> */}
								<Route path="settings" element={<AdminSettings />} />
							</Routes>
						</div>
					</main>
				</div>
			</div>
		</SidebarProvider>
	);
}
