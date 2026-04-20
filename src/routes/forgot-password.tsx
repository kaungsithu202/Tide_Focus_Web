import { isAxiosError } from "axios";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPassword } from "@/features/password-reset/queries";
import { useDocumentMetadata } from "@/lib/seo";

export const Route = createFileRoute("/forgot-password")({
  component: RouteComponent,
});

const getErrorMessage = (error: unknown) => {
  if (!isAxiosError(error)) {
    return error instanceof Error ? error.message : "Something went wrong";
  }

  const data = error.response?.data as
    | { error?: { message?: string }; message?: string }
    | undefined;

  return data?.error?.message || data?.message || error.message;
};

function RouteComponent() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { mutateAsync: forgotPasswordAsync, isPending } = useForgotPassword();

  useDocumentMetadata({
    title: "Forgot Password | Tide Focus",
    description: "Request a secure password reset link for your Tide Focus account.",
    robots: "noindex, nofollow",
    path: "/forgot-password",
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim();

    await toast.promise(
      forgotPasswordAsync({ email: normalizedEmail }).then(() => {
        setEmail(normalizedEmail);
        setSubmitted(true);
        return true;
      }),
      {
        loading: "Sending reset link...",
        success: "If that email exists, a reset link is on its way.",
        error: getErrorMessage,
      }
    );
  };

  const handleTryAnotherEmail = () => {
    setSubmitted(false);
    setEmail("");
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="relative hidden lg:flex lg:w-1/2 items-center justify-center overflow-hidden bg-gradient-to-br from-ocean-900 via-ocean-700 to-ocean-500">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-ocean-100 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-ocean-300 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 h-48 w-48 rounded-full bg-ocean-100 blur-2xl" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-40">
          <svg
            viewBox="0 0 1800 320"
            className="absolute bottom-0 h-full w-full opacity-[0.08]"
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
            className="absolute bottom-0 h-full w-full opacity-[0.06]"
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
            className="absolute bottom-0 h-full w-full opacity-[0.04]"
            preserveAspectRatio="none"
          >
            <path
              d="M0 225 C250 210 450 240 650 220 C850 200 1050 230 1250 215 C1450 225 1650 205 1800 220 L1800 320 L0 320 Z"
              fill="white"
              style={{ animation: "wave-drift-3 12s ease-in-out infinite" }}
            />
          </svg>
        </div>

        <div className="relative z-10 max-w-lg px-12 text-center">
          <h1 className="mb-6 font-original-surfer text-5xl font-bold tracking-tight text-white">
            Tide Focus
          </h1>
          <p className="text-lg leading-relaxed text-white/80">
            Regain access gently. We&apos;ll send a secure reset link so you can get back
            to your next wave without friction.
          </p>

          <div className="mt-10 space-y-3 rounded-2xl border border-white/12 bg-white/8 px-5 py-4 text-left backdrop-blur-[2px]">
            <p className="text-sm font-medium text-white">What to expect</p>
            <p className="text-sm leading-relaxed text-white/75">
              The reset link is single-use, expires in 30 minutes, and only goes out if
              the email matches an account.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center bg-background px-5 py-8 sm:px-8">
        <div className="mb-8 flex items-center gap-2.5 lg:hidden">
          <img src="/images/logo-rm.png" width={32} height={32} alt="Tide Focus logo" className="size-8" />
          <span className="font-original-surfer text-xl text-ocean-800">Tide Focus</span>
        </div>
        <div className="w-full max-w-md space-y-8">
          {submitted ? (
            <div className="space-y-8 text-center" aria-live="polite">
              <div className="space-y-4">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-ocean-700/10 text-ocean-700">
                  <CheckCircle2 className="size-7" />
                </div>
                <div className="space-y-2">
                  <h1 className="font-original-surfer text-3xl font-semibold tracking-tight text-ocean-900">
                    Check your inbox
                  </h1>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    If <span className="font-medium text-foreground">{email}</span> matches an
                    account, we&apos;ve sent a password reset link. The link expires in 30
                    minutes.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-ocean-200/70 bg-ocean-50/70 p-4 text-left">
                <p className="text-sm font-medium text-foreground">Not seeing it?</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Check spam or promotions, then try another email if needed.
                </p>
              </div>

              <div className="space-y-3">
                <Button asChild variant="ocean" className="h-11 w-full text-sm font-medium">
                  <Link to="/login">
                    <ArrowLeft className="size-4" />
                    Back to sign in
                  </Link>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full text-sm font-medium"
                  onClick={handleTryAnotherEmail}
                >
                  Use a different email
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-3 text-center">
                <div className="mb-4 flex items-center justify-center gap-2">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-ocean-700 text-white shadow-sm">
                    <Mail className="size-5" />
                  </div>
                </div>
                <h1 className="font-original-surfer text-3xl font-semibold tracking-tight text-ocean-900">
                  Forgot your password?
                </h1>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Enter the email you use for Tide Focus and we&apos;ll send a secure reset
                  link.
                </p>
              </div>

              <div className="rounded-2xl border border-ocean-200/70 bg-ocean-50/60 p-4 text-sm text-muted-foreground">
                We&apos;ll only use this email to send password recovery instructions.
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    disabled={isPending}
                    className="h-11"
                    autoComplete="email"
                    inputMode="email"
                  />
                </div>

                <Button
                  type="submit"
                  variant="ocean"
                  className="h-11 w-full text-sm font-medium"
                  disabled={isPending || email.trim().length === 0}
                >
                  {isPending ? "Sending reset link..." : "Send reset link"}
                </Button>
              </form>

              <div className="text-center text-sm">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-ocean-700"
                >
                  <ArrowLeft className="size-4" />
                  Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
