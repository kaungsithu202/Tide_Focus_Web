import { useGetRefreshToken } from "@/api/queries";
import { getRefreshTokenService } from "@/api/services";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { use } from "react";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <header className="flex items-center justify-around py-5" role="banner">
        <nav
          className="flex items-center gap-3"
          aria-label="Tide Focus navigation"
        >
          <img
            src="/images/logo.png"
            width={40}
            height={40}
            alt="Tide Focus logo — blue ocean wave icon"
            className="size-10"
          />
          <h1 className="font-extrabold text-2xl text-ocean-800 font-original-surfer">
            Tide Focus
          </h1>
        </nav>

        <Button
          asChild
          variant="default"
          aria-label="Get started with Tide Focus"
        >
          <Link to="/login">Get Started</Link>
        </Button>
      </header>

      <Separator aria-hidden="true" />

      <main
        className="flex flex-col items-center text-center leading-6 px-4"
        role="main"
      >
        <section className="mt-20 max-w-2xl">
          <h2 className="text-5xl font-bold font-toucon text-ocean-800">
            Find your flow. Focus with calm.
          </h2>
          <p className="text-gray-500 mt-5">
            Tide Focus blends mindfulness and productivity to help you stay in
            rhythm — focus deeply, rest intentionally, and make every moment
            meaningful.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Button variant="default" asChild>
              <Link
                to="/login"
                className="flex items-center gap-1"
                aria-label="Try Tide Focus now"
              >
                Try It Now <ArrowRight aria-hidden="true" />
              </Link>
            </Button>

            <p className="text-gray-500 text-sm">
              Free forever • Start focusing in seconds
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
