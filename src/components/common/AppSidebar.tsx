import {
  ChartNoAxesColumnIcon,
  LogOutIcon,
  Settings,
  ShipIcon,
  SquareChartGanttIcon,
  Waves,
  BarChart3Icon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link } from "@tanstack/react-router";
import { Button } from "../ui/button";
import { useLogout } from "@/api/queries";

const items = [
  {
    title: "Focus",
    url: "/focus",
    icon: ShipIcon,
  },
  {
    title: "Review",
    url: "/review",
    icon: SquareChartGanttIcon,
  },
  {
    title: "Overview",
    url: "/overview",
    icon: ChartNoAxesColumnIcon,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3Icon,
  },
  {
    title: "Waves",
    url: "/waves",
    icon: Waves,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const { mutate: logout } = useLogout();
  const { setOpenMobile } = useSidebar();

  const handleClick = () => {
    setOpenMobile(false);
  };

  return (
    <Sidebar variant="floating" className="border-sidebar-border">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <div className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-md bg-ocean-700">
                <Waves size={12} className="text-white" />
              </div>
              <span className="font-original-surfer text-sm text-ocean-900 tracking-wide">
                Tide Focus
              </span>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      to={item.url}
                      onClick={handleClick}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-ocean-700/8 hover:text-ocean-700 [&.active]:bg-ocean-700/10 [&.active]:text-ocean-700"
                    >
                      <item.icon size={18} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="mt-auto border-t border-sidebar-border pt-4">
        <Button
          onClick={() => logout()}
          variant="ghost"
          className="w-full justify-start gap-3 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-ocean-700/8 hover:text-ocean-700"
        >
          <LogOutIcon size={18} />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}