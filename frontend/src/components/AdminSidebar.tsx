import { Shield, Users, Briefcase, Building2, FileText, BarChart3, Settings } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/hooks/useAuth';
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
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const items = [
  { title: 'Tổng quan', url: '/admin', icon: Shield },
  { title: 'Người dùng', url: '/admin/users', icon: Users },
  { title: 'Việc làm', url: '/admin/jobs', icon: Briefcase },
  { title: 'Công ty', url: '/admin/companies', icon: Building2 },
  // { title: 'Đơn ứng tuyển', url: '/admin/applications', icon: FileText },
  // { title: 'Báo cáo', url: '/admin/reports', icon: BarChart3 },
  { title: 'Cài đặt', url: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const { user, logout } = useAuth();
  const collapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-2 px-2">
            Quản trị hệ thống
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        {!collapsed && user && (
          <div className="mb-2 px-2">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">{user.email}</p>
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={logout} className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground">
          <LogOut className="w-4 h-4" />
          {!collapsed && 'Đăng xuất'}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
