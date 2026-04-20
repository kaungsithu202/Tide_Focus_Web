import { isAxiosError } from "axios";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResetPassword } from "@/features/password-reset/queries";
import { useDocumentMetadata } from "@/lib/seo";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
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
  const { token } = Route.useSearch();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const { mutateAsync: resetPasswordAsync, isPending } = useResetPassword();

  useDocumentMetadata({
    title: "Reset Password | Tide Focus",
    description: "Set a new password and return to your Tide Focus sessions.",
    robots: "noindex, nofollow",
    path: "/reset-password",
  });

  const isTokenMissing = token.length === 0;
  const isPasswordLongEnough = newPassword.length >= 8;
  const doPasswordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;
  const showPasswordMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const isFormValid = isPasswordLongEnough && newPassword === confirmPassword;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await toast.promise(
      resetPasswordAsync({ token, newPassword }).then((response) => {
        setSuccess(true);
        return response;
      }),
      {
        loading: "Resetting password...",
        success: (response) => response.message || "Password updated successfully.",
        error: getErrorMessage,
      }
    );
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
            Set a new password and return to your flow. The reset link is secure,
            time-limited, and meant for a smooth handoff back into focused work.
          </p>

          <div className="mt-10 space-y-3 rounded-2xl border border-white/12 bg-white/8 px-5 py-4 text-left backdrop-blur-[2px]">
            <p className="text-sm font-medium text-white">A secure reset</p>
            <p className="text-sm leading-relaxed text-white/75">
              Choose a password with at least 8 characters. Once saved, the link can&apos;t
              be reused.
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
          {isTokenMissing ? (
            <div className="space-y-8 text-center" aria-live="polite">
              <div className="space-y-4">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                  <AlertTriangle className="size-7" />
                </div>
                <div className="space-y-2">
                  <h1 className="font-original-surfer text-3xl font-semibold tracking-tight text-ocean-900">
                    Invalid reset link
                  </h1>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    This link is missing its reset token or is incomplete. Request a fresh
                    password reset link to continue.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200/70 bg-amber-50/80 p-4 text-left">
                <p className="text-sm font-medium text-foreground">Need a new link?</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Go back to forgot password and request another reset email.
                </p>
              </div>

              <div className="space-y-3">
                <Button asChild variant="ocean" className="h-11 w-full text-sm font-medium">
                  <Link to="/forgot-password">Request a new reset link</Link>
                </Button>
                <Button asChild variant="outline" className="h-11 w-full text-sm font-medium">
                  <Link to="/login">
                    <ArrowLeft className="size-4" />
                    Back to sign in
                  </Link>
                </Button>
              </div>
            </div>
          ) : success ? (
            <div className="space-y-8 text-center" aria-live="polite">
              <div className="space-y-4">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-ocean-700/10 text-ocean-700">
                  <CheckCircle2 className="size-7" />
                </div>
                <div className="space-y-2">
                  <h1 className="font-original-surfer text-3xl font-semibold tracking-tight text-ocean-900">
                    Password updated
                  </h1>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Your password has been reset successfully. You can now sign in with
                    your new password.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-ocean-200/70 bg-ocean-50/70 p-4 text-left">
                <p className="text-sm font-medium text-foreground">You&apos;re all set</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Return to sign in and continue your next focus session.
                </p>
              </div>

              <div className="space-y-3">
                <Button asChild variant="ocean" className="h-11 w-full text-sm font-medium">
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button asChild variant="outline" className="h-11 w-full text-sm font-medium">
                  <Link to="/forgot-password">Reset another password</Link>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-3 text-center">
                <div className="mb-4 flex items-center justify-center gap-2">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-ocean-700 text-white shadow-sm">
                    <Lock className="size-5" />
                  </div>
                </div>
                <h1 className="font-original-surfer text-3xl font-semibold tracking-tight text-ocean-900">
                  Set a new password
                </h1>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Choose a new password with at least 8 characters to secure your account.
                </p>
              </div>

              <div className="rounded-2xl border border-ocean-200/70 bg-ocean-50/60 p-4 text-sm text-muted-foreground">
                Use something memorable to you and hard for others to guess.
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      required
                      disabled={isPending}
                      className="h-11 pr-12"
                      autoComplete="new-password"
                      aria-invalid={!isPasswordLongEnough && newPassword.length > 0}
                      aria-describedby="password-hint"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-0 top-0 inline-flex h-11 w-11 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-ocean-700 focus-visible:outline-none focus-visible:text-ocean-700"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                      disabled={isPending}
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  <p id="password-hint" className="text-xs text-muted-foreground">
                    {isPasswordLongEnough || newPassword.length === 0
                      ? "At least 8 characters."
                      : "Use at least 8 characters."}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm new password</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Repeat your new password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                    disabled={isPending}
                    className="h-11"
                    autoComplete="new-password"
                    aria-invalid={showPasswordMismatch}
                    aria-describedby={showPasswordMismatch ? "confirm-password-error" : undefined}
                  />
                  {showPasswordMismatch ? (
                    <p id="confirm-password-error" className="text-xs text-destructive">
                      Passwords do not match.
                    </p>
                  ) : confirmPassword.length > 0 && doPasswordsMatch ? (
                    <p className="text-xs text-ocean-700">Passwords match.</p>
                  ) : null}
                </div>

                <Button
                  type="submit"
                  variant="ocean"
                  className="h-11 w-full text-sm font-medium"
                  disabled={isPending || !isFormValid}
                >
                  {isPending ? "Resetting password..." : "Reset password"}
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
