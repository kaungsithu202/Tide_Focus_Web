import {
  Calendar,
  ChartNoAxesColumnIcon,
  Home,
  Inbox,
  LogOutIcon,
  Search,
  Settings,
  Ship,
  ShipIcon,
  SquareChartGantt,
  SquareChartGanttIcon,
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
} from "@/components/ui/sidebar";
import { Link } from "@tanstack/react-router";
import { Button } from "../ui/button";
import { useLogout } from "@/api/queries";

// Menu items.
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
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const { mutate: logout } = useLogout();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Tide Focus</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button onClick={() => logout()} variant="outline">
          <LogOutIcon />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
