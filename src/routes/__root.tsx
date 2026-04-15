import { Toaster } from "@/components/ui/sonner";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { NuqsAdapter } from "nuqs/adapters/tanstack-router";
const RootLayout = () => (
  <NuqsAdapter>
    <Outlet />
    <Toaster />
    {/* <TanStackRouterDevtools /> */}
  </NuqsAdapter>
);

export const Route = createRootRoute({ component: RootLayout });
