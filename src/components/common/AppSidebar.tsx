import {
  Calendar,
  ChartNoAxesColumnIcon,
  Home,
  Inbox,
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
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from "@tanstack/react-router";

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
    url: "#",
    icon: ChartNoAxesColumnIcon,
  },
  {
    title: "Search",
    url: "#",
    icon: Search,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
];

export function AppSidebar() {
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
    </Sidebar>
  );
}
