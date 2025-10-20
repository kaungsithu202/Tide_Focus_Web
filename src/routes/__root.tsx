import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Toaster } from "sonner";
import { NuqsAdapter } from "nuqs/adapters/tanstack-router";
const RootLayout = () => (
  <>
    <NuqsAdapter>
      {/* <div>
      <Link to="/" className="[&.active]:font-bold">
        Home
      </Link>{" "}
      <Link to="/about" className="[&.active]:font-bold">
        About
      </Link>
    </div> */}
      <hr />
      <Outlet />
      <Toaster richColors position="top-right" closeButton expand={true} />
      <TanStackRouterDevtools />
    </NuqsAdapter>
  </>
);

export const Route = createRootRoute({ component: RootLayout });
