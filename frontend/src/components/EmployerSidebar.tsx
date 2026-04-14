import { LayoutDashboard, FileText, Users, MessageSquare, CalendarDays, BarChart3, Settings, LogOut } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/hooks/useAuth';
import { getCompanyById } from '@/data/mockData';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';

const menuItems = [
  { title: 'Dashboard', url: '/employer', icon: LayoutDashboard },
  { title: 'Tin tuyển dụng', url: '/employer/jobs', icon: FileText },
  { title: 'Ứng viên', url: '/employer/candidates', icon: Users },
  { title: 'Tin nhắn', url: '/employer/messages', icon: MessageSquare },
  { title: 'Lịch phỏng vấn', url: '/employer/schedule', icon: CalendarDays },
  { title: 'Báo cáo', url: '/employer/reports', icon: BarChart3 },
  { title: 'Cài đặt', url: '/employer/settings', icon: Settings },
];

export function EmployerSidebar() {
  const { state } = useSidebar();
  const { user, logout } = useAuth();
  const collapsed = state === 'collapsed';
  const company = user?.companyId ? getCompanyById(user.companyId) : null;

  const handleLogout = () => {
    logout();
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent className="pt-4">
        {/* Company Logo Section */}
        <div className="px-3 mb-6">
          <div className="flex items-center justify-center">
            {company?.logo ? (
              <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden border border-border flex items-center justify-center">
                <img src={company.logo} alt={company.name} className="w-full h-full object-contain p-1" />
              </div>
            ) : (
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                  {company?.name?.charAt(0) || 'C'}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/employer'}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                      activeClassName="bg-accent text-primary font-semibold"
                    >
                      <item.icon className="h-[18px] w-[18px] shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full gap-2 justify-start"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Đăng xuất</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
