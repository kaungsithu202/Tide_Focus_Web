import { AppSidebar } from "@/components/common/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { requireAuth } from "@/lib/auth";

export const Route = createFileRoute("/_pathlessLayout")({
  beforeLoad: async ({ location }) => {
    await requireAuth(location.href);
  },
  component: LayoutComponent,
});

function LayoutComponent() {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <main className="w-full">
        <SidebarTrigger />
        <Outlet />
      </main>
    </SidebarProvider>
  );
}
