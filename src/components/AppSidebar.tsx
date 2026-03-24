import {
  LayoutDashboard,
  Users,
  Kanban,
  Briefcase,
  Clock,
  BarChart3,
  UsersRound,
  Settings,
} from "lucide-react";
import logoHelenAssad from "@/assets/logo-helen-assad.png";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
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
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Contatos", url: "/contatos", icon: Users },
  { title: "Pipeline", url: "/pipeline", icon: Kanban },
  { title: "Casos", url: "/casos", icon: Briefcase },
  { title: "Prazos", url: "/prazos", icon: Clock },
];

const adminItems = [
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
  { title: "Equipe", url: "/equipe", icon: UsersRound },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { role } = useAuth();
  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <img src={logoHelenAssad} alt="Helen Assad" className="w-9 h-9 rounded-lg object-contain bg-white flex-shrink-0" />
          {!collapsed && (
            <div className="min-w-0">
              <h2 className="font-serif text-sm font-bold text-sidebar-primary truncate">Helen Assad</h2>
              <p className="text-[10px] text-sidebar-muted-foreground truncate">Advogada Previdenciária</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-muted-foreground text-[10px] uppercase tracking-wider">
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} end={item.url === "/"} className="hover:bg-sidebar-accent" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                      <item.icon className="w-4 h-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {role === "admin" && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-muted-foreground text-[10px] uppercase tracking-wider">
              Administração
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink to={item.url} className="hover:bg-sidebar-accent" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                        <item.icon className="w-4 h-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border">
        {!collapsed && (
          <p className="text-[10px] text-sidebar-muted-foreground text-center">© 2026 Assad CRM v1.0</p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
