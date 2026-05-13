import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import axiosClient from "@/services/axiosClient";
import { usePageLoad } from "@/contexts/PageLoadContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
	Bell,
	ChevronDown,
	ArrowRight,
	User,
	LogOut,
	Mail,
	Briefcase,
	CheckCircle2,
	MessageSquare,
	Loader2,
	CalendarCheck,
} from "lucide-react";
import { useSocket } from "@/contexts/SocketContext";
import { useState, useRef, useEffect, memo } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "react-toastify";

export default memo(function HeaderMNP() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const { triggerPageLoad } = usePageLoad();
	const [jobMenuOpen, setJobMenuOpen] = useState(false);
	const [companyMenuOpen, setCompanyMenuOpen] = useState(false);
	const [careerMenuOpen, setCareerMenuOpen] = useState(false);
	const [toolMenuOpen, setToolMenuOpen] = useState(false);
	const [notificationOpen, setNotificationOpen] = useState(false);
	const [notifications, setNotifications] = useState<any[]>([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [isLoadingNoti, setIsLoadingNoti] = useState(false);
	const { socket } = useSocket();

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

	const fetchUnreadMessagesCount = async () => {
		try {
			const res = await axiosClient.get("/api/messages/unread-count");
			if (res.data.errCode === 0) {
				setUnreadMessagesCount(res.data.data);
			}
		} catch (error) {
			console.error("Error fetching unread messages count:", error);
		}
	};

	useEffect(() => {
		if (user) {
			fetchNotifications();
			fetchUnreadMessagesCount();
		}
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

	const handleMarkAllAsRead = async () => {
		try {
			await axiosClient.put("/api/notifications/read-all");
			setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
			setUnreadCount(0);
		} catch (error) {
			console.error("Error marking all as read:", error);
		}
	};

	const closeJobMenuTimeoutRef = useRef<NodeJS.Timeout>();
	const closeCompanyMenuTimeoutRef = useRef<NodeJS.Timeout>();
	const closeCareerMenuTimeoutRef = useRef<NodeJS.Timeout>();
	const closeToolMenuTimeoutRef = useRef<NodeJS.Timeout>();
	const navRef = useRef<HTMLElement>(null);
	const companyBtnRef = useRef<HTMLDivElement>(null);
	const careerBtnRef = useRef<HTMLDivElement>(null);
	const toolBtnRef = useRef<HTMLDivElement>(null);
	const notificationRef = useRef<HTMLDivElement>(null);

	// Socket listener for new notifications and messages
	useEffect(() => {
		if (socket) {
			socket.on("newNotification", (notification: any) => {
				setNotifications((prev) => [notification, ...prev]);
				setUnreadCount((prev) => prev + 1);
			});

			socket.on("receiveMessage", (message: any) => {
				// Only increment if we're not currently on the messages page with that partner
				// For simplicity in Header, we'll just re-fetch the count
				fetchUnreadMessagesCount();
			});

			socket.on("unreadCountUpdate", (data: any) => {
				setUnreadMessagesCount(data.totalUnread);
			});

			return () => {
				socket.off("newNotification");
				socket.off("receiveMessage");
				socket.off("unreadCountUpdate");
			};
		}
	}, [socket]);

	// Close all dropdowns when location changes
	useEffect(() => {
		setJobMenuOpen(false);
		setCompanyMenuOpen(false);
		setCareerMenuOpen(false);
		setToolMenuOpen(false);
		setNotificationOpen(false);
	}, [location.pathname]);

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

	const handleJobMenuEnter = () => {
		if (closeJobMenuTimeoutRef.current)
			clearTimeout(closeJobMenuTimeoutRef.current);
		setCareerMenuOpen(false);
		setToolMenuOpen(false);
		setCompanyMenuOpen(false);
		setJobMenuOpen(true);
	};

	const handleJobMenuLeave = () => {
		closeJobMenuTimeoutRef.current = setTimeout(
			() => setJobMenuOpen(false),
			150,
		);
	};

	const handleCompanyMenuEnter = () => {
		if (closeCompanyMenuTimeoutRef.current)
			clearTimeout(closeCompanyMenuTimeoutRef.current);
		setJobMenuOpen(false);
		setToolMenuOpen(false);
		setCareerMenuOpen(false);
		setCompanyMenuOpen(true);
	};

	const handleCompanyMenuLeave = () => {
		closeCompanyMenuTimeoutRef.current = setTimeout(
			() => setCompanyMenuOpen(false),
			150,
		);
	};

	const handleCareerMenuEnter = () => {
		if (closeCareerMenuTimeoutRef.current)
			clearTimeout(closeCareerMenuTimeoutRef.current);
		setJobMenuOpen(false);
		setToolMenuOpen(false);
		setCompanyMenuOpen(false);
		setCareerMenuOpen(true);
	};

	const handleCareerMenuLeave = () => {
		closeCareerMenuTimeoutRef.current = setTimeout(
			() => setCareerMenuOpen(false),
			150,
		);
	};

	const handleToolMenuEnter = () => {
		if (closeToolMenuTimeoutRef.current)
			clearTimeout(closeToolMenuTimeoutRef.current);
		setJobMenuOpen(false);
		setCareerMenuOpen(false);
		setCompanyMenuOpen(false);
		setToolMenuOpen(true);
	};

	const handleToolMenuLeave = () => {
		closeToolMenuTimeoutRef.current = setTimeout(
			() => setToolMenuOpen(false),
			150,
		);
	};

	const handleHomeClick = () => {
		if (location.pathname === "/") {
			triggerPageLoad();
			window.scrollTo({ top: 0, behavior: "smooth" });
		} else {
			navigate("/");
		}
	};

	const handleNavigate = (path: string, options?: any) => {
		if (location.pathname === path && !options) {
			triggerPageLoad();
			window.scrollTo({ top: 0, behavior: "smooth" });
		} else {
			navigate(path, options);
		}
	};

	if (location.pathname === "/login" || location.pathname === "/register") {
		return null;
	}

	return (
		<header className="bg-white border-b border-slate-200 sticky top-0 z-50">
			<div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
				<div className="flex items-center gap-8">
					<div
						className="flex items-center gap-3 cursor-pointer"
						onClick={handleHomeClick}
					>
						<div className="flex flex-col">
							<h1 className="text-2xl font-bold text-slate-900">MNP</h1>
							<p className="text-xs text-slate-500 font-medium">
								Master New Potential
							</p>
						</div>
					</div>

					{/* Navigation Menu */}
					<nav ref={navRef} className="hidden md:flex items-center gap-1">
						<div
							className="relative"
							onMouseEnter={handleJobMenuEnter}
							onMouseLeave={handleJobMenuLeave}
						>
							<Button
								onClick={handleHomeClick}
								variant="ghost"
								className="gap-1 text-base font-semibold text-slate-600 hover:text-black"
							>
								Việc làm
								<ChevronDown className="w-4 h-4" />
							</Button>

							{jobMenuOpen && (
								<div
									className="absolute top-full left-0 mt-2 bg-white border border-slate-200 shadow-xl z-50 rounded-xl transition-all duration-300 origin-top animate-in fade-in slide-in-from-top-2"
									style={{ width: "fit-content" }}
								>
									<div
										className="px-6 py-6"
										style={{
											display: "grid",
											gridTemplateColumns: "auto",
											gap: "12px",
										}}
									>
										{/* Col 1: VIỆC LÀM */}
										<div className="pr-0 max-w-none">
											{/* <div className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-2">Việc làm</div> */}
											<div className="flex flex-col gap-4">
												<button
													onClick={() => handleNavigate("/job-search")}
													className="flex items-center gap-1 text-sm text-slate-700 hover:text-black text-left group font-medium whitespace-nowrap"
												>
													<span>Tìm việc làm</span>
													<ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
												</button>
												<button
													onClick={() => handleNavigate("/saved-jobs")}
													className="flex items-center gap-1 text-sm text-slate-700 hover:text-black text-left group font-medium whitespace-nowrap"
												>
													<span>Việc làm đã lưu</span>
													<ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
												</button>
												<button
													onClick={() => handleNavigate("/applications")}
													className="flex items-center gap-1 text-sm text-slate-700 hover:text-black text-left group font-medium whitespace-nowrap"
												>
													<span>Việc làm đã ứng tuyển</span>
													<ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
												</button>
												{/* <button onClick={() => handleNavigate('/jobs')} className="flex items-center gap-1 text-sm text-slate-700 hover:text-black text-left group font-medium">
                          <span>Việc làm phù hợp</span>
                          <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                        </button> */}
											</div>
										</div>

										{/* Col 2: THEO VỊ TRÍ */}
										{/* <div>
                      <div className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-2">Việc làm theo vị trí</div>
                      <div className="flex flex-col gap-4">
                        {['Nhân viên kinh doanh','Kế toán','Marketing','Hành chính nhân sự','Chăm sóc khách hàng','Ngân hàng','IT'].map(item => (
                          <button key={item} onClick={() => navigate(`/job-search?position=${encodeURIComponent(item)}`)} className="flex items-center gap-1 text-sm text-slate-700 hover:text-black text-left group font-medium">
                            <span>Việc làm {item}</span>
                            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                          </button>
                        ))}
                      </div>
                    </div> */}

										{/* Col 3: VIỆC LÀM THEO LĨNH VỰC */}
										{/* <div>
                      <div className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-2 invisible">Spacer</div>
                      <div className="flex flex-col gap-4">
                        {['Lao động phổ thông','Senior','Kỹ sư xây dựng','Thiết kế đồ họa','Bất động sản','Giáo dục','Telesales'].map(item => (
                          <button key={item} onClick={() => navigate(`/job-search?category=${encodeURIComponent(item)}`)} className="flex items-center gap-1 text-sm text-slate-700 hover:text-black text-left group font-medium">
                            <span>Việc làm {item}</span>
                            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                          </button>
                        ))}
                      </div>
                    </div> */}
									</div>
								</div>
							)}
						</div>

						<Button
							onClick={() => handleNavigate("/companies")}
							variant="ghost"
							className="gap-1 text-base font-semibold text-slate-600 hover:text-black"
						>
							Công ty
						</Button>

						<Button
							onClick={() => handleNavigate("/insights")}
							variant="ghost"
							className="gap-1 text-base font-semibold text-slate-600 hover:text-black"
						>
							Thị trường
						</Button>

						<Button
							onClick={() => handleNavigate("/interviews")}
							variant="ghost"
							className="gap-1 text-base font-semibold text-slate-600 hover:text-black"
						>
							Lịch Phỏng Vấn
						</Button>

						{false && (
							<div
								onMouseEnter={handleToolMenuEnter}
								onMouseLeave={handleToolMenuLeave}
							>
								<Button
									variant="ghost"
									className="gap-1 text-base font-semibold text-slate-600 hover:text-black"
								>
									Công cụ
									<ChevronDown className="w-4 h-4" />
								</Button>

								{toolMenuOpen &&
									(() => {
										const navLeft =
											navRef.current?.getBoundingClientRect().left ?? 0;
										const btnLeft =
											toolBtnRef.current?.getBoundingClientRect().left ?? 0;
										const offset = -(btnLeft - navLeft);
										return (
											<div
												className="absolute top-full bg-white border border-slate-200 shadow-xl z-50 rounded-xl transition-all duration-300 origin-top animate-in fade-in slide-in-from-top-2"
												style={{
													minWidth: "800px",
													left: `${offset}px`,
													marginTop: "8px",
												}}
											>
												<div className="px-6 py-6 grid grid-cols-3 gap-8">
													{/* Col 1: KHÁM PHÁ VÀ NÂNG CẤP BẢN THÂN */}
													<div>
														<div className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-4">
															Khám phá và nâng cấp bản thân
														</div>
														<div className="flex flex-col gap-2.5">
															<button
																onClick={() => handleNavigate("/jobs")}
																className="flex items-center gap-1 text-base text-slate-600 hover:text-black text-left group"
															>
																<span>Bộ câu hỏi phỏng vấn</span>
																<ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
															</button>
															<button
																onClick={() => handleNavigate("/jobs")}
																className="flex items-center gap-1 text-base text-slate-600 hover:text-black text-left group"
															>
																<span>Trắc nghiệm MBTI</span>
																<ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
															</button>
															<button
																onClick={() => handleNavigate("/jobs")}
																className="flex items-center gap-1 text-base text-slate-600 hover:text-black text-left group"
															>
																<span>Trắc nghiệm MI</span>
																<ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
															</button>
														</div>
													</div>

													{/* Col 2: CÔNG CỤ */}
													<div>
														<div className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-4">
															Công cụ
														</div>
														<div className="flex flex-col gap-2.5">
															<button
																onClick={() => handleNavigate("/jobs")}
																className="flex items-center gap-1 text-base text-slate-600 hover:text-black text-left group"
															>
																<span>Tính lương Gross - Net</span>
																<ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
															</button>
															<button
																onClick={() => handleNavigate("/jobs")}
																className="flex items-center gap-1 text-base text-slate-600 hover:text-black text-left group"
															>
																<span>Tính thuế thu nhập cá nhân</span>
																<ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
															</button>
														</div>
													</div>

													{/* Col 3: HỖ TRỢ TÀI CHÍNH */}
													<div>
														<div className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-4">
															Hỗ trợ tài chính
														</div>
														<div className="flex flex-col gap-2.5">
															<button
																onClick={() => handleNavigate("/jobs")}
																className="flex items-center gap-1 text-base text-slate-600 hover:text-black text-left group"
															>
																<span>Bảo hiểm xã hội</span>
																<ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
															</button>
														</div>
													</div>
												</div>
											</div>
										);
									})()}
							</div>
						)}

						{false && (
							<div
								ref={careerBtnRef}
								className="relative"
								onMouseEnter={handleCareerMenuEnter}
								onMouseLeave={handleCareerMenuLeave}
							>
								<Button
									variant="ghost"
									className="gap-1 text-base font-semibold text-slate-600 hover:text-black"
								>
									Cẩm nang nghề nghiệp
									<ChevronDown className="w-4 h-4" />
								</Button>

								{careerMenuOpen &&
									(() => {
										const navLeft =
											navRef.current?.getBoundingClientRect().left ?? 0;
										const btnLeft =
											careerBtnRef.current?.getBoundingClientRect().left ?? 0;
										const offset = -(btnLeft - navLeft);
										return (
											<div
												className="absolute top-full bg-white border border-slate-200 shadow-xl z-50 rounded-xl transition-all duration-300 origin-top animate-in fade-in slide-in-from-top-2"
												style={{
													minWidth: "650px",
													left: `${offset}px`,
													marginTop: "8px",
												}}
											>
												<div className="px-6 py-6 grid grid-cols-2 gap-4">
													{/* Col 1: HƯỚNG DẪN + KỸ NĂNG */}
													<div>
														<div className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-4">
															Hướng dẫn nghề nghiệp
														</div>
														<div className="flex flex-col gap-2.5">
															<button
																onClick={() => handleNavigate("/jobs")}
																className="flex items-center gap-1 text-base text-slate-600 hover:text-black text-left group"
															>
																<span>Định hướng nghề nghiệp</span>
																<ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
															</button>
															<button
																onClick={() => handleNavigate("/jobs")}
																className="flex items-center gap-1 text-base text-slate-600 hover:text-black text-left group"
															>
																<span>Bí kíp tìm việc</span>
																<ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
															</button>
														</div>
													</div>

													{/* Col 2: INSIGHTS & FEATURES */}
													<div>
														<div className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-4">
															Bài viết nổi bật
														</div>
														<div className="space-y-3">
															<div className="text-[13px] text-slate-600 hover:text-black cursor-pointer">
																<p className="font-semibold mb-1">
																	Ngành Marketing là gì?
																</p>
																<p className="text-[12px] text-slate-500">
																	Khám phá cơ hội việc làm...
																</p>
															</div>
														</div>
													</div>
												</div>
											</div>
										);
									})()}
							</div>
						)}
					</nav>
				</div>

				<div className="flex items-center gap-4">
					{/* Chat Icon */}
					<Button
						variant="ghost"
						size="icon"
						className="relative hover:bg-muted"
						onClick={() => {
							const chatPath =
								user?.role === "EMPLOYER" ? "/employer/messages" : "/messages";
							handleNavigate(chatPath);
						}}
					>
						<MessageSquare className="w-5 h-5" />
						{unreadMessagesCount > 0 && (
							<span className="absolute top-1 right-1 w-4 h-4 bg-primary text-white text-[10px] flex items-center justify-center rounded-full">
								{unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
							</span>
						)}
					</Button>

					{/* Notification Bell */}
					<div className="relative" ref={notificationRef}>
						<Button
							variant="ghost"
							size="icon"
							className="relative hover:bg-slate-100 transition-colors"
							onClick={() => setNotificationOpen(!notificationOpen)}
						>
							<Bell className="w-5 h-5 text-slate-600" />
							{unreadCount > 0 && (
								<span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-bold">
									{unreadCount > 9 ? "9+" : unreadCount}
								</span>
							)}
						</Button>

						{notificationOpen && (
							<div className="absolute right-0 top-full mt-3 w-80 bg-white border border-slate-200 shadow-xl rounded-xl z-50 overflow-hidden">
								<div className="bg-gradient-to-r from-slate-50 to-slate-100 px-5 py-3 border-b border-slate-200">
									<h3 className="font-semibold text-sm text-foreground">
										Thông báo
									</h3>
								</div>

								<div className="max-h-80 overflow-y-auto" onScroll={handleScroll}>
									{notifications.length > 0 ? (
										<>
											{notifications.map((noti) => {
												const rawType = (noti.type || "").toUpperCase();
												const rawContent = (noti.content || "").toLowerCase();
												// Chuẩn hóa tiếng Việt để so sánh chính xác (NFC)
												const content = rawContent.normalize("NFC");
												const isRead = noti.is_read;
												
												let Icon = Mail;
												let iconBg = "bg-slate-100 text-slate-600";
												let typeLabel = rawType || "THÔNG BÁO";
												
												// Nhận diện loại thông báo dựa trên type HOẶC content (fallback cho data cũ)
												const isInterview = rawType.includes("INTERVIEW") || content.includes("phỏng vấn");
												const isApplication = rawType.includes("APPLICATION") || rawType.includes("APPLICANT") || content.includes("ứng tuyển");
												const isJobStatus = rawType.includes("JOB") || rawType.includes("STATUS") || content.includes("trạng thái");

												if (isInterview) {
													Icon = CalendarCheck;
													iconBg = "bg-amber-100 text-amber-600";
													if (!rawType) typeLabel = "PHỎNG VẤN";
												} else if (isApplication) {
													Icon = Briefcase;
													iconBg = "bg-blue-100 text-blue-600";
													if (!rawType) typeLabel = "ỨNG TUYỂN";
												} else if (isJobStatus) {
													Icon = Briefcase;
													iconBg = "bg-emerald-100 text-emerald-600";
													if (!rawType) typeLabel = "TRẠNG THÁI";
												}

												return (
													<div
														key={noti.id}
														className={`px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-all cursor-pointer relative ${!isRead ? "bg-blue-50" : "bg-white"}`}
														onClick={async () => {
															setNotificationOpen(false);
															if (!isRead) {
																const updated = notifications.map((n) => (n.id === noti.id ? { ...n, is_read: true } : n));
																setNotifications(updated);
																setUnreadCount(updated.filter(n => !n.is_read).length);
																// Đợi API cập nhật xong để tránh race condition khi chuyển trang
																await axiosClient.put(`/api/notifications/read/${noti.id}`).catch(err => console.error(err));
																if (rawType === "NEW_MESSAGE") fetchUnreadMessagesCount();
															}

															const isEmployer = user?.role === "EMPLOYER";
															
															if (isInterview || rawType.includes("STATUS")) {
																handleNavigate(isEmployer ? "/employer/schedule" : "/interviews");
															} else if (isApplication) {
																handleNavigate(isEmployer ? "/employer/applications" : "/applications");
															} else if (rawType === "NEW_MESSAGE") {
																handleNavigate(isEmployer ? "/employer/messages" : "/messages", {
																	state: { partnerId: noti.reference_id },
																});
															}
														}}
													>
														<div className="flex items-start gap-3">
															<div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${iconBg}`}>
																<Icon className="w-4 h-4" />
															</div>
															<div className="flex-1 min-w-0">
																<p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
																	{typeLabel.replace(/_/g, " ")}
																</p>
																<p className={`text-sm ${!isRead ? "font-bold text-blue-900" : "font-medium text-slate-600"}`}>
																	{noti.content}
																</p>
																<p className="text-[10px] text-slate-400 mt-1">
																	{new Date(noti.created_at || noti.createdAt || Date.now()).toLocaleString("vi-VN")}
																</p>
															</div>
															{!isRead && (
																<div className="absolute right-3 top-1/2 -translate-y-1/2">
																	<div className="w-2 h-2 bg-blue-600 rounded-full shadow-sm"></div>
																</div>
															)}
														</div>
													</div>
												);
											})}
											{isLoadingNoti && (
												<div className="py-2 flex justify-center">
													<Loader2 className="w-4 h-4 animate-spin text-primary" />
												</div>
											)}
										</>
									) : (
										<div className="px-5 py-8 text-center text-muted-foreground text-sm">
											Không có thông báo nào
										</div>
									)}
								</div>

								<div className="border-t border-slate-200 px-5 py-3 bg-slate-50 text-center">
									<button
										onClick={handleMarkAllAsRead}
										className="text-xs font-medium text-slate-500 hover:text-primary transition-colors"
									>
										Đánh dấu đã đọc tất cả
									</button>
								</div>
							</div>
						)}
					</div>

					{user ? (
						<DropdownMenu modal={false}>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon">
									<Avatar className="w-8 h-8">
										<AvatarImage src={user.profilePicture} />
										<AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
											{user.name?.charAt(0) || "U"}
										</AvatarFallback>
									</Avatar>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-48">
								{user.role === "EMPLOYER" ? (
									<DropdownMenuItem onClick={() => handleNavigate("/employer")}>
										<Briefcase className="w-4 h-4 mr-2" /> Quản lý tuyển dụng
									</DropdownMenuItem>
								) : (
									<>
										<DropdownMenuItem
											onClick={() => handleNavigate("/candidate/profile")}
										>
											<User className="w-4 h-4 mr-2" /> Hồ sơ cá nhân
										</DropdownMenuItem>
									</>
								)}
								<DropdownMenuItem onClick={() => logout()}>
									<LogOut className="w-4 h-4 mr-2" /> Đăng xuất
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<>
							<Button
								onClick={() => navigate("/login")}
								className="bg-black hover:bg-slate-800 text-white"
							>
								Đăng nhập
							</Button>
							<Button
								onClick={() => navigate("/register")}
								className="bg-white hover:bg-slate-200 text-black"
							>
								Đăng ký
							</Button>
						</>
					)}
				</div>
			</div>
		</header>
	);
});
