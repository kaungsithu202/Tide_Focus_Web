import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin, useTwoFaLogin } from "@/features/login/queries";
import type {
  LoginChallengeResponse,
  LoginResponse,
  LoginSuccessResponse,
} from "@/features/login/types";
import { getPostAuthRedirectTo } from "@/lib/auth";
import { useAuth } from "@/store";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff, ShieldCheck } from "lucide-react";

interface TwoFactorChallengeState extends LoginChallengeResponse {
  issuedAt: number;
}

const isLoginSuccessResponse = (
  response: LoginResponse
): response is LoginSuccessResponse => "accessToken" in response;

const getErrorMessage = (error: unknown) => {
  if (!isAxiosError(error)) {
    return error instanceof Error ? error.message : "Something went wrong";
  }

  const data = error.response?.data as
    | { error?: { message?: string }; message?: string }
    | undefined;

  return data?.error?.message || data?.message || error.message;
};

const formatRemainingTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");

  return `${mins}:${secs}`;
};

interface LoginFormProps {
  redirectTo?: string;
}

export function LoginForm({ redirectTo }: LoginFormProps) {
  const {
    mutateAsync: loginAsync,
    isPending: isPendingLogin,
  } = useLogin();
  const {
    mutateAsync: twoFaLoginAsync,
    isPending: isPendingTwoFaLogin,
  } = useTwoFaLogin();

  const setAccessToken = useAuth((state) => state.setAccessToken);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [totp, setTotp] = useState("");
  const [challenge, setChallenge] = useState<TwoFactorChallengeState | null>(
    null
  );
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  const isPending = isPendingLogin || isPendingTwoFaLogin;
  const isTwoFactorStep = Boolean(challenge);
  const postAuthRedirectTo = redirectTo
    ? getPostAuthRedirectTo(redirectTo)
    : null;

  useEffect(() => {
    if (!challenge) {
      setRemainingSeconds(null);
      return;
    }

    const updateRemainingSeconds = () => {
      const elapsedSeconds = Math.floor((Date.now() - challenge.issuedAt) / 1000);
      const nextRemainingSeconds = Math.max(
        challenge.expiresInSeconds - elapsedSeconds,
        0
      );

      setRemainingSeconds(nextRemainingSeconds);

      if (nextRemainingSeconds === 0) {
        setChallenge(null);
        setTotp("");
        toast.error("Two-factor verification expired. Please sign in again.");
      }
    };

    updateRemainingSeconds();

    const intervalId = window.setInterval(updateRemainingSeconds, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [challenge]);

  const twoFactorHint = useMemo(() => {
    if (remainingSeconds === null) {
      return "Enter the 6-digit code from your authenticator app.";
    }

    return `Enter the 6-digit code from your authenticator app. This challenge expires in ${formatRemainingTime(
      remainingSeconds
    )}.`;
  }, [remainingSeconds]);

  const completeLogin = (response: LoginSuccessResponse) => {
    setAccessToken(response.accessToken);
    setChallenge(null);
    setTotp("");
    navigate({
      href: getPostAuthRedirectTo(redirectTo),
      replace: true,
    });
  };

  async function onSubmitCredentials(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    toast.promise(
      loginAsync({ email, password }).then((response: LoginResponse) => {
        if (isLoginSuccessResponse(response)) {
          completeLogin(response);
          return response;
        }

        setChallenge({
          ...response,
          issuedAt: Date.now(),
        });
        setTotp("");

        return response;
      }),
      {
        loading: "Loading...",
        success: (response) =>
          isLoginSuccessResponse(response)
            ? "Signed in successfully"
            : "Two-factor code required",
        error: getErrorMessage,
      }
    );
  }

  async function onSubmitTwoFactorCode(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!challenge) {
      return;
    }

    toast.promise(
      twoFaLoginAsync({
        tempToken: challenge.tempToken,
        totp,
      }).then((response) => {
        completeLogin(response);
        return response;
      }),
      {
        loading: "Verifying code...",
        success: "Signed in successfully",
        error: getErrorMessage,
      }
    );
  }

  const resetTwoFactorStep = () => {
    setChallenge(null);
    setTotp("");
  };

  return (
    <div className="w-full max-w-sm space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          {isTwoFactorStep ? "Two-factor verification" : "Welcome back"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isTwoFactorStep
            ? twoFactorHint
            : "Enter your credentials to access your account"}
        </p>
        {postAuthRedirectTo ? (
          <div className="inline-flex max-w-full items-center rounded-full border border-ocean-200 bg-ocean-50 px-3 py-1 text-xs text-ocean-700">
            You&apos;ll return to
            <span className="ml-1 truncate font-medium">
              {postAuthRedirectTo}
            </span>
          </div>
        ) : null}
      </div>

      {isTwoFactorStep ? (
        <form onSubmit={onSubmitTwoFactorCode} className="space-y-5">
          <div className="rounded-2xl border border-ocean-200 bg-ocean-50/60 p-4 text-center">
            <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-ocean-100 text-ocean-700">
              <ShieldCheck className="size-5" />
            </div>
            <p className="text-sm font-medium text-foreground">Authenticator code</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Open your authenticator app and enter the current code to finish signing in.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="totp">Verification code</Label>
            <Input
              id="totp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              required
              value={totp}
              onChange={(event) => {
                setTotp(event.target.value.replace(/\D/g, "").slice(0, 6));
              }}
              disabled={isPending}
              className="h-12 text-center text-lg tracking-[0.35em] font-semibold"
              maxLength={6}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11 text-sm font-medium bg-ocean-700 hover:bg-ocean-800"
            disabled={isPending || totp.length !== 6}
          >
            {isPendingTwoFaLogin ? "Verifying..." : "Verify code"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            disabled={isPending}
            onClick={resetTwoFactorStep}
          >
            <ArrowLeft className="size-4" />
            Use a different account
          </Button>
        </form>
      ) : (
        <form onSubmit={onSubmitCredentials} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isPending}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                to="/forgot-password"
                search={redirectTo ? { redirect: redirectTo } : {}}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isPending}
                className="h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 text-sm font-medium bg-ocean-700 hover:bg-ocean-800"
            disabled={isPending}
          >
            {isPendingLogin ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      )}

      {!isTwoFactorStep && (
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
              <Link
                to="/forgot-password"
                search={redirectTo ? { redirect: redirectTo } : {}}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Forgot password?
              </Link>
        </p>
      )}
    </div>
  );
}
