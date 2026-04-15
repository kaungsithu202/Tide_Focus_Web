import { LoginForm } from "@/components/LoginForm";
import { createFileRoute } from "@tanstack/react-router";
import { parseAuthRedirectSearch, redirectIfAuthenticated } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  validateSearch: parseAuthRedirectSearch,
  beforeLoad: async ({ search }) => {
    await redirectIfAuthenticated(search.redirect);
  },
  component: LoginPage,
});

function LoginPage() {
  const { redirect } = Route.useSearch();

  return (
    <div className="min-h-screen flex">
      <div className="relative hidden lg:flex lg:w-1/2 items-center justify-center overflow-hidden bg-gradient-to-br from-ocean-900 via-ocean-700 to-ocean-500">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-ocean-100 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-ocean-300 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-ocean-100 rounded-full blur-2xl" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-40">
          <svg
            viewBox="0 0 1800 320"
            className="absolute bottom-0 w-full h-full opacity-[0.08]"
            preserveAspectRatio="none"
          >
            <path
              d="M0 200 C200 180 400 220 600 200 C800 180 1000 160 1200 190 C1400 210 1600 180 1800 200 L1800 320 L0 320 Z"
              fill="white"
              style={{ animation: "wave-drift-1 8s ease-in-out infinite" }}
            />
          </svg>
          <svg
            viewBox="0 0 1800 320"
            className="absolute bottom-0 w-full h-full opacity-[0.06]"
            preserveAspectRatio="none"
          >
            <path
              d="M0 210 C300 190 500 240 700 210 C900 185 1100 220 1300 195 C1500 215 1700 190 1800 205 L1800 320 L0 320 Z"
              fill="white"
              style={{ animation: "wave-drift-2 10s ease-in-out infinite" }}
            />
          </svg>
          <svg
            viewBox="0 0 1800 320"
            className="absolute bottom-0 w-full h-full opacity-[0.04]"
            preserveAspectRatio="none"
          >
            <path
              d="M0 225 C250 210 450 240 650 220 C850 200 1050 230 1250 215 C1450 225 1650 205 1800 220 L1800 320 L0 320 Z"
              fill="white"
              style={{ animation: "wave-drift-3 12s ease-in-out infinite" }}
            />
          </svg>
        </div>

        <div className="relative z-10 px-12 max-w-lg text-center">
          <h1 className="text-5xl font-bold text-white font-original-surfer tracking-tight mb-6">
            Tide Focus
          </h1>
          <p className="text-lg text-white/80 leading-relaxed">
            Ride the tide of time &mdash; focus on what truly matters.
          </p>
          <div className="mt-12 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-white/30" />
            <div className="w-2 h-2 rounded-full bg-ocean-300" />
            <div className="h-px w-12 bg-white/30" />
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <LoginForm redirectTo={redirect} />
      </div>
    </div>
  );
}
