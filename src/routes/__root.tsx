import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Toaster } from "sonner";
import { NuqsAdapter } from "nuqs/adapters/tanstack-router";
const RootLayout = () => (
  <>
    <NuqsAdapter>
      <hr />
      <Outlet />
      <Toaster richColors position="top-right" closeButton expand={true} />
      {/* <TanStackRouterDevtools /> */}
    </NuqsAdapter>
  </>
);

export const Route = createRootRoute({ component: RootLayout });
