import {
	Shield,
	Users,
	Briefcase,
	Building2,
	FileText,
	BarChart3,
	Settings,
	LogOut,
	Home,
	ChevronRight,
    CreditCard
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarFooter,
	useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const items = [
	{ title: "Tổng quan", url: "/admin", icon: BarChart3 },
	{ title: "Người dùng", url: "/admin/users", icon: Users },
	{ title: "Việc làm", url: "/admin/jobs", icon: Briefcase },
	{ title: "Công ty", url: "/admin/companies", icon: Building2 },
	{ title: "Đơn ứng tuyển", url: "/admin/applications", icon: FileText },
    { title: "Giao dịch", url: "/admin/transactions", icon: CreditCard },
	// { title: 'Báo cáo', url: '/admin/reports', icon: Shield },
	// { title: 'Cài đặt', url: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
	const { state } = useSidebar();
	const { user, logout } = useAuth();
	const collapsed = state === "collapsed";

	return (
		<Sidebar
			collapsible="icon"
			className="border-r border-border/50 bg-card/50 backdrop-blur-xl"
		>
			<SidebarContent>
				<div className="p-4 mb-4">
					{!collapsed ? (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="flex items-center gap-3 px-2 py-3 bg-primary/10 rounded-2xl border border-primary/20 shadow-lg shadow-primary/5"
						>
							<div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
								<Shield className="w-5 h-5 text-primary-foreground" />
							</div>
							<div>
								<h2 className="text-sm font-bold tracking-tight text-foreground">
									MNP Admin
								</h2>
								<p className="text-[10px] font-medium text-primary/70 uppercase tracking-widest">
									Management
								</p>
							</div>
						</motion.div>
					) : (
						<div className="flex justify-center py-2">
							<div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
								<Shield className="w-5 h-5 text-primary-foreground" />
							</div>
						</div>
					)}
				</div>

				<SidebarGroup>
					{!collapsed && (
						<SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 mb-2 px-6">
							Main Menu
						</SidebarGroupLabel>
					)}
					<SidebarGroupContent className={collapsed ? "px-2" : "px-3"}>
						<SidebarMenu>
							{items.map((item) => (
								<SidebarMenuItem key={item.title} className="mb-1">
									<SidebarMenuButton
										asChild
										className={collapsed ? "h-10 w-10 mx-auto" : "h-11"}
									>
										<NavLink
											to={item.url}
											end={item.url === "/admin"}
											className={cn(
												"group flex items-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200",
												collapsed ? "justify-center p-0" : "gap-3 px-3 py-2",
											)}
											activeClassName="!bg-primary !text-primary-foreground shadow-lg shadow-primary/20 !font-semibold"
										>
											<item.icon
												className={cn(
													"shrink-0 transition-transform group-hover:scale-110",
													collapsed ? "h-5 w-5" : "h-5 w-5",
												)}
											/>
											{!collapsed && (
												<span className="flex-1 truncate">{item.title}</span>
											)}
											{!collapsed && (
												<ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50 group-[.active]:opacity-0 transition-opacity" />
											)}
										</NavLink>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<div className={cn("mt-auto py-4", collapsed ? "px-2" : "px-6")}>
					<SidebarMenuButton
						asChild
						className={collapsed ? "justify-center" : ""}
					>
						<NavLink
							to="/"
							className={cn(
								"flex items-center text-xs font-medium text-muted-foreground hover:text-primary transition-colors",
								collapsed ? "justify-center" : "gap-3",
							)}
						>
							<Home className="w-4 h-4" />
							{!collapsed && <span>Quay lại Website</span>}
						</NavLink>
					</SidebarMenuButton>
				</div>
			</SidebarContent>

			<SidebarFooter
				className={cn(
					"border-t border-border/50 bg-muted/20",
					collapsed ? "p-2" : "p-4",
				)}
			>
				{!collapsed && user && (
					<div className="flex items-center gap-3 mb-4 px-2 py-2 rounded-xl bg-background/50 border border-border/50">
						<div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-inner">
							{user.name?.charAt(0) || "A"}
						</div>
						<div className="min-w-0">
							<p className="text-xs font-bold text-foreground truncate">
								{user.name}
							</p>
							<p className="text-[10px] text-muted-foreground truncate">
								{user.email}
							</p>
						</div>
					</div>
				)}
				<Button
					variant="ghost"
					size="sm"
					onClick={logout}
					className={cn(
						"w-full h-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all",
						collapsed ? "justify-center p-0" : "justify-start gap-3 px-3",
					)}
				>
					<LogOut className="w-4 h-4" />
					{!collapsed && <span className="font-medium">Đăng xuất</span>}
				</Button>
			</SidebarFooter>
		</Sidebar>
	);
}
