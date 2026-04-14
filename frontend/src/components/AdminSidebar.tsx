import { Shield, Users, Briefcase, Building2, FileText, BarChart3, Settings } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const items = [
  { title: 'Tổng quan', url: '/admin', icon: Shield },
  { title: 'Người dùng', url: '/admin/users', icon: Users },
  { title: 'Việc làm', url: '/admin/jobs', icon: Briefcase },
  { title: 'Công ty', url: '/admin/companies', icon: Building2 },
  { title: 'Đơn ứng tuyển', url: '/admin/applications', icon: FileText },
  { title: 'Báo cáo', url: '/admin/reports', icon: BarChart3 },
  { title: 'Cài đặt', url: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Quản trị hệ thống</SidebarGroupLabel>
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
    </Sidebar>
  );
}
