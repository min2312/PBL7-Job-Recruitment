import { useAuth } from "@/hooks/useAuth";
import {
	Navigate,
	Routes,
	Route,
	useLocation,
	useNavigate,
} from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { EmployerSidebar } from "@/components/EmployerSidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Bell,
	User,
	CheckCircle2,
	Loader2,
	MessageSquare,
	Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect, useMemo } from "react";
import axiosClient from "@/services/axiosClient";
import EmployerOverview from "@/pages/employer/EmployerOverview";
import EmployerJobs from "@/pages/employer/EmployerJobs";
import EmployerJobDetail from "@/pages/employer/EmployerJobDetail";
import EmployerJobCreate from "@/pages/employer/EmployerJobCreate";
import EmployerJobEdit from "@/pages/employer/EmployerJobEdit";
import EmployerCandidates from "@/pages/employer/EmployerCandidates";
import EmployerCandidateDetail from "@/pages/employer/EmployerCandidateDetail";
import EmployerMessages from "@/pages/employer/EmployerMessages";
import EmployerSchedule from "@/pages/employer/EmployerSchedule";
import EmployerReports from "@/pages/employer/EmployerReports";
import EmployerSettings from "@/pages/employer/EmployerSettings";
import PaymentResult from "@/pages/employer/PaymentResult";
import { useSocket } from "@/contexts/SocketContext";

export default function EmployerDashboard() {
	const { user, isAuthReady } = useAuth();
	const location = useLocation();
	const navigate = useNavigate();
	const [notificationOpen, setNotificationOpen] = useState(false);
	const notificationRef = useRef<HTMLDivElement>(null);

	const [myJobs, setMyJobs] = useState<any[]>([]);
	const [totalJobs, setTotalJobs] = useState(0);
	const [jobPage, setJobPage] = useState(1);
	const [jobLimit, setJobLimit] = useState(10);

	const [myApplications, setMyApplications] = useState<any[]>([]);
	const [totalApps, setTotalApps] = useState(0);
	const [appPage, setAppPage] = useState(1);
	const [appLimit, setAppLimit] = useState(9);

	const [isLoadingData, setIsLoadingData] = useState(true);

	const fetchJobs = async (page = 1, limit = 10, search = "", status = "") => {
		setIsLoadingData(true);
		try {
			const res = await axiosClient.get(
				`/api/employer/jobs?page=${page}&limit=${limit}&search=${search}&status=${status}`,
			);
			if (res.data.errCode === 0) {
				setMyJobs(res.data.data.jobs || []);
				setTotalJobs(res.data.data.total || 0);
				setJobPage(page);
				setJobLimit(limit);
			}
		} catch (error) {
			console.error("Error fetching jobs:", error);
		} finally {
			setIsLoadingData(false);
		}
	};

	const fetchApplications = async (
		page = 1,
		limit = 9,
		search = "",
		status = "",
	) => {
		setIsLoadingData(true);
		try {
			const res = await axiosClient.get(
				`/api/employer/applications?page=${page}&limit=${limit}&search=${search}&status=${status}`,
			);
			if (res.data.errCode === 0) {
				setMyApplications(res.data.data.applications || []);
				setTotalApps(res.data.data.total || 0);
				setAppPage(page);
				setAppLimit(limit);
			}
		} catch (error) {
			console.error("Error fetching applications:", error);
		} finally {
			setIsLoadingData(false);
		}
	};

	const fetchData = async () => {
		if (!user || user.role !== "EMPLOYER") return;
		await Promise.all([fetchJobs(1, 10), fetchApplications(1, 9)]);
	};

	const [notifications, setNotifications] = useState<any[]>([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [isLoadingNoti, setIsLoadingNoti] = useState(false);

	const fetchNotifications = async (pageNum = 1, isLoadMore = false) => {
		if (isLoadingNoti) return;
		setIsLoadingNoti(true);
		try {
			const response = await axiosClient.get(
				`/api/notifications?page=${pageNum}&limit=10`,
			);
			if (response.data.errCode === 0) {
				const newNotis = response.data.data;
				if (isLoadMore) {
					setNotifications((prev) => [...prev, ...newNotis]);
				} else {
					setNotifications(newNotis);
					setUnreadCount(newNotis.filter((n: any) => !n.is_read).length);
				}
				setHasMore(pageNum < response.data.pagination.totalPages);
				setPage(pageNum);
			}
		} catch (error) {
			console.error("Error fetching notifications:", error);
		} finally {
			setIsLoadingNoti(false);
		}
	};

	useEffect(() => {
		fetchData();
		fetchNotifications();
	}, [user]);

	const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
		const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
		if (
			scrollHeight - scrollTop <= clientHeight + 50 &&
			hasMore &&
			!isLoadingNoti
		) {
			fetchNotifications(page + 1, true);
		}
	};

	const { socket } = useSocket();
	useEffect(() => {
		if (socket) {
			socket.on("newNotification", (notification: any) => {
				setNotifications((prev) => [notification, ...prev]);
				setUnreadCount((prev) => prev + 1);
			});
			return () => {
				socket.off("newNotification");
			};
		}
	}, [socket]);

	const handleMarkAllAsRead = async () => {
		try {
			await axiosClient.put("/api/notifications/read-all");
			setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
			setUnreadCount(0);
		} catch (error) {
			console.error("Error marking all as read:", error);
		}
	};

	// Close notification when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				notificationRef.current &&
				!notificationRef.current.contains(event.target as Node)
			) {
				setNotificationOpen(false);
			}
		};

		if (notificationOpen) {
			document.addEventListener("mousedown", handleClickOutside);
			return () =>
				document.removeEventListener("mousedown", handleClickOutside);
		}
	}, [notificationOpen]);

	// Close notification when route changes
	useEffect(() => {
		setNotificationOpen(false);
	}, [location.pathname]);

	if (!isAuthReady) {
		return (
			<div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
				<Loader2 className="w-5 h-5 animate-spin mr-2" />
				Đang kiểm tra phiên đăng nhập...
			</div>
		);
	}

	if (!user || user.role !== "EMPLOYER") return <Navigate to="/login" />;

	const company = user.company;

	return (
		<SidebarProvider>
			<div className="min-h-screen flex w-full bg-background">
				<EmployerSidebar />
				<div className="flex-1 flex flex-col">
					{/* Header */}
					<header className="h-14 flex items-center border-b border-border px-4 gap-4 bg-card sticky top-0 z-10">
						<SidebarTrigger />
						<div className="flex items-center gap-2">
							{company?.logo && (
								<div className="w-7 h-7 rounded-md bg-muted overflow-hidden border border-border">
									<img
										src={company.logo}
										alt=""
										className="w-full h-full object-contain"
									/>
								</div>
							)}
							<span className="text-sm font-semibold text-foreground hidden sm:inline">
								{company?.name || "Nhà tuyển dụng"}
							</span>
						</div>

						<div className="ml-auto flex items-center gap-2">
							{/* Chat Icon */}
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 hover:bg-muted"
								onClick={() => navigate("messages")}
							>
								<MessageSquare className="w-4 h-4" />
							</Button>

							{/* Notification Bell */}
							<div className="relative" ref={notificationRef}>
								<Button
									variant="ghost"
									size="icon"
									className="relative h-8 w-8 hover:bg-muted"
									onClick={() => {
										setNotificationOpen(!notificationOpen);
										if (!notificationOpen) setUnreadCount(0);
									}}
								>
									<Bell className="w-4 h-4" />
									{unreadCount > 0 && (
										<span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full animate-pulse">
											{unreadCount > 9 ? "9+" : unreadCount}
										</span>
									)}
								</Button>

								{/* Notification Dropdown */}
								{notificationOpen && (
									<div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 shadow-xl rounded-xl z-50 overflow-hidden">
										{/* Header */}
										<div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center">
											<h3 className="font-semibold text-sm text-foreground">
												Thông báo
											</h3>
											<button
												onClick={handleMarkAllAsRead}
												className="text-[10px] text-primary hover:underline"
											>
												Đánh dấu đã đọc
											</button>
										</div>

										{/* Notifications List */}
										<div
											className="max-h-80 overflow-y-auto"
											onScroll={handleScroll}
										>
											{notifications.length > 0 ? (
												<>
													{notifications.map((noti) => (
														<div
															key={noti.id}
															className={`px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer ${!noti.is_read ? "bg-blue-50/30" : ""}`}
															onClick={() => {
																if (!noti.is_read) {
																	axiosClient.put(
																		`/api/notifications/read/${noti.id}`,
																	);
																	setNotifications((prev) =>
																		prev.map((n) =>
																			n.id === noti.id
																				? { ...n, is_read: true }
																				: n,
																		),
																	);
																}
																if (noti.type.startsWith("INTERVIEW"))
																	navigate("schedule");
																else if (noti.type === "NEW_APPLICANT")
																	navigate("candidates");
																else if (noti.type === "NEW_MESSAGE")
																	navigate("messages", {
																		state: { partnerId: noti.reference_id },
																	});
																setNotificationOpen(false);
															}}
														>
															<div className="flex items-start gap-3">
																<div
																	className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
																		noti.type.includes("INTERVIEW")
																			? "bg-amber-100 text-amber-600"
																			: noti.type === "NEW_MESSAGE"
																				? "bg-green-100 text-green-600"
																				: "bg-blue-100 text-blue-600"
																	}`}
																>
																	{noti.type === "NEW_MESSAGE" ? (
																		<Mail className="w-4 h-4" />
																	) : (
																		<Bell className="w-4 h-4" />
																	)}
																</div>
																<div className="flex-1 min-w-0">
																	<p
																		className={`text-xs ${!noti.is_read ? "font-bold" : "font-medium"} text-foreground`}
																	>
																		{noti.content}
																	</p>
																	<p className="text-[10px] text-slate-400 mt-1">
																		{new Date(
																			noti.created_at ||
																				noti.createdAt ||
																				Date.now(),
																		).toLocaleString("vi-VN")}
																	</p>
																</div>
															</div>
														</div>
													))}
													{isLoadingNoti && (
														<div className="py-2 flex justify-center">
															<Loader2 className="w-4 h-4 animate-spin text-primary" />
														</div>
													)}
												</>
											) : (
												<div className="px-4 py-6 text-center">
													<p className="text-sm text-muted-foreground">
														Không có thông báo mới
													</p>
												</div>
											)}
										</div>
									</div>
								)}
							</div>

							<Avatar className="w-8 h-8 cursor-pointer">
								<AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
									{user.name?.charAt(0) || "U"}
								</AvatarFallback>
							</Avatar>
						</div>
					</header>

					{/* Main */}
					<main className="flex-1 px-6 py-6 overflow-auto">
						<Routes>
							<Route
								index
								element={
									<EmployerOverview
										myJobs={myJobs}
										myApplications={myApplications}
									/>
								}
							/>
							<Route
								path="jobs"
								element={
									<EmployerJobs
										myJobs={myJobs}
										total={totalJobs}
										page={jobPage}
										limit={jobLimit}
										onPageChange={fetchJobs}
										refreshData={fetchData}
									/>
								}
							/>
							<Route
								path="jobs/create"
								element={<EmployerJobCreate refreshData={fetchData} />}
							/>
							<Route
								path="jobs/:id"
								element={<EmployerJobDetail refreshData={fetchData} />}
							/>
							<Route
								path="jobs/edit/:id"
								element={<EmployerJobEdit refreshData={fetchData} />}
							/>
							<Route
								path="candidates"
								element={
									<EmployerCandidates
										myApplications={myApplications}
										total={totalApps}
										page={appPage}
										limit={appLimit}
										onPageChange={fetchApplications}
										refreshData={fetchData}
									/>
								}
							/>
							<Route
								path="candidates/:id"
								element={<EmployerCandidateDetail refreshData={fetchData} />}
							/>
							<Route path="messages" element={<EmployerMessages />} />
							<Route path="schedule" element={<EmployerSchedule />} />
							<Route path="reports" element={<EmployerReports />} />
							<Route path="settings" element={<EmployerSettings />} />
							<Route path="payment-result" element={<PaymentResult />} />
						</Routes>
					</main>
				</div>
			</div>
		</SidebarProvider>
	);
}
