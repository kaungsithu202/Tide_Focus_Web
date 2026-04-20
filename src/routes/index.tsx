import { Button } from "@/components/ui/button";
import {
  SEO_DEFAULT_DESCRIPTION,
  SEO_DEFAULT_TITLE,
  useDocumentMetadata,
} from "@/lib/seo";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Waves,
  Timer,
  CircleDot,
  Clock,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

const sessions = [
  {
    title: "Product roadmap planning",
    duration: "45 min focus + 10 min break",
    time: "9:00 AM",
    status: "complete" as const,
    color: "ocean-700",
  },
  {
    title: "Deep coding sprint",
    duration: "90 min flow + 20 min walk",
    time: "11:00 AM",
    status: "active" as const,
    color: "ocean-500",
    elapsed: 34,
    total: 90,
  },
  {
    title: "Weekly review & planning",
    duration: "30 min reflection",
    time: "3:00 PM",
    status: "upcoming" as const,
    color: "ocean-300",
  },
];

function RouteComponent() {
  useDocumentMetadata({
    title: SEO_DEFAULT_TITLE,
    description: SEO_DEFAULT_DESCRIPTION,
    robots: "index, follow",
    path: "/",
  });

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-ocean-100/15 via-background to-background" />

      <svg
        viewBox="0 0 1800 320"
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 w-full opacity-[0.12] md:h-64 lg:h-80"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 200 C200 180 400 220 600 200 C800 180 1000 160 1200 190 C1400 210 1600 180 1800 200 L1800 320 L0 320 Z"
          fill="#02367b"
          style={{ animation: "wave-drift-1 8s ease-in-out infinite" }}
        />
        <path
          d="M0 210 C300 190 500 240 700 210 C900 185 1100 220 1300 195 C1500 215 1700 190 1800 205 L1800 320 L0 320 Z"
          fill="#0496c7"
          style={{ animation: "wave-drift-2 10s ease-in-out infinite" }}
        />
        <path
          d="M0 225 C250 210 450 240 650 220 C850 200 1050 230 1250 215 C1450 225 1650 205 1800 220 L1800 320 L0 320 Z"
          fill="#55e2e9"
          style={{ animation: "wave-drift-3 12s ease-in-out infinite" }}
        />
      </svg>

      <header className="relative z-10" role="banner">
        <div className="container flex items-center justify-between py-5">
          <nav
            className="flex items-center gap-2.5"
            aria-label="Tide Focus navigation"
          >
            <img
              src="/images/logo-rm.png"
              width={32}
              height={32}
              alt="Tide Focus logo"
              className="size-8"
            />
            <span className="font-original-surfer text-xl text-ocean-800">
              Tide Focus
            </span>
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild variant="ocean">
              <Link to="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="container pt-10 pb-16 sm:pt-16 sm:pb-24 lg:pt-28 lg:pb-32">
          <div className="max-w-2xl">
            <div className="mb-5 sm:mb-6 inline-flex items-center gap-2 rounded-full border border-ocean-300/50 bg-ocean-100/20 px-3 py-1 text-xs font-medium tracking-wide text-ocean-700">
              <Waves size={13} aria-hidden="true" />
              Focus timer for deep work
            </div>

            <h1 className="font-original-surfer text-4xl leading-[1.1] text-ocean-900 md:text-5xl lg:text-6xl lg:leading-[1.08]">
              A calmer focus timer,
              <br />
              one tide at a time.
            </h1>

            <p className="mt-4 max-w-lg text-[15px] leading-7 text-muted-foreground sm:mt-6 sm:text-base md:text-lg md:leading-8">
              Tide Focus is a focus timer for deep work with stopwatch and timer
              sessions, wave-based categories, ambient sound, and lightweight review
              so you can stay consistent without burning out.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
              <Button size="lg" variant="ocean" asChild className="w-full sm:w-auto">
                <Link to="/register" className="gap-2 justify-center">
                  Get started free
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </Button>
              <Button size="lg" variant="ghost" asChild className="w-full sm:w-auto">
                <Link to="/login" className="justify-center">Sign in</Link>
              </Button>
            </div>

            <div className="mt-6 grid max-w-2xl gap-3 text-sm text-ocean-800 sm:grid-cols-3">
              <div className="rounded-2xl border border-ocean-200/70 bg-background/75 px-4 py-3 shadow-sm backdrop-blur-sm">
                Focus timer and stopwatch
              </div>
              <div className="rounded-2xl border border-ocean-200/70 bg-background/75 px-4 py-3 shadow-sm backdrop-blur-sm">
                Session review and analytics
              </div>
              <div className="rounded-2xl border border-ocean-200/70 bg-background/75 px-4 py-3 shadow-sm backdrop-blur-sm">
                Wave categories and ambient audio
              </div>
            </div>
          </div>
        </section>

        <section className="container pb-16 sm:pb-24 lg:pb-32">
          <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-5 sm:p-8 lg:p-10 shadow-sm">
            <div className="flex items-center gap-3 mb-1">
              <Timer size={18} className="text-ocean-500" aria-hidden="true" />
              <h2 className="font-original-surfer text-2xl text-ocean-800 md:text-3xl">
                Today's flow
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6 sm:mb-8">
              A snapshot of what a focused day looks like.
            </p>

            <div className="space-y-0 divide-y divide-border">
              {sessions.map((session) => (
                <div
                  key={session.title}
                  className={`flex items-center gap-3 sm:gap-4 py-4 sm:py-5 first:pt-0 last:pb-0 ${
                    session.status === "upcoming" ? "opacity-50" : ""
                  }`}
                >
                  <div
                    className={`flex size-9 shrink-0 items-center justify-center rounded-lg bg-${session.color}/10`}
                  >
                    {session.status === "complete" ? (
                      <CheckCircle2 size={16} className="text-ocean-700" aria-hidden="true" />
                    ) : session.status === "active" ? (
                      <CircleDot size={16} className="text-ocean-500" aria-hidden="true" />
                    ) : (
                      <Clock size={16} className="text-muted-foreground" aria-hidden="true" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">
                        {session.title}
                      </p>
                      {session.status === "active" && (
                        <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-ocean-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ocean-500 shrink-0">
                          <span className="relative flex size-1.5">
                            <span className="absolute inline-flex size-full animate-ping rounded-full bg-ocean-500 opacity-75" />
                            <span className="relative inline-flex size-1.5 rounded-full bg-ocean-500" />
                          </span>
                          In flow
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground truncate">
                      {session.duration}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    {session.status === "active" && "elapsed" in session && "total" in session ? (
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-xs font-medium tabular-nums text-ocean-500">
                          {session.elapsed}m / {session.total}m
                        </span>
                        <div className="h-1 w-14 sm:w-16 rounded-full bg-ocean-100">
                          <div
                            className="h-full rounded-full bg-ocean-500 transition-all"
                            style={{ width: `${(session.elapsed / session.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    ) : session.status === "complete" ? (
                      <span className="text-xs font-medium text-ocean-700">Complete</span>
                    ) : (
                      <span className="text-xs font-medium text-muted-foreground">{session.time}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container pb-16 sm:pb-20 lg:pb-28">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-original-surfer text-2xl text-ocean-900 md:text-3xl">
              Less noise. More depth.
            </h2>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Free to use. No credit card, no setup friction.
              Just open it and start your first session.
            </p>
            <div className="mt-6">
              <Button size="lg" variant="ocean" asChild className="w-full sm:w-auto">
                <Link to="/register" className="gap-2 justify-center">
                  Create free account
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border">
        <div className="container py-6 flex flex-col-reverse items-center justify-between gap-3 sm:flex-row sm:gap-0 text-xs text-muted-foreground">
          <span>&copy; 2025 Tide Focus</span>
          <div className="flex items-center gap-5">
            <span className="cursor-default">Privacy</span>
            <span className="cursor-default">Terms</span>
            <span className="cursor-default">Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
