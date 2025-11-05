import type React from "react";
import { useState } from "react";
// import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "@tanstack/react-router";
import { useLogin } from "@/features/login/queries";
import { toast } from "sonner";
import { useAuth } from "@/store";
import type { LoginResponse } from "@/features/login/types";

export function LoginForm() {
  const {
    mutate: login,
    mutateAsync: loginAsync,
    isPending: isPendingLogin,
  } = useLogin();

  const setAccessToken = useAuth((state) => state.setAccessToken);

  const navigate = useNavigate();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    toast.promise(
      loginAsync(
        {
          email: event.target?.email?.value,
          password: event.target?.password?.value,
        },
        {
          onSuccess: (res: LoginResponse) => {
            setAccessToken(res.accessToken);
            navigate({
              to: "/focus",
              replace: true,
            });
          },
        }
      ),
      {
        loading: "Loading...",
        success: "Success",
        error: "Error",
      }
    );
  }

  return (
    <Card className="w-full max-w-md border-0 shadow-none lg:border lg:shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl md:text-4xl font-bold font-original-surfer tracking-tight">
          WELCOME BACK
        </CardTitle>
        <CardDescription className="text-sm md:text-base text-pretty font-original-surfer">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              required
              disabled={isPendingLogin}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              required
              disabled={isPendingLogin}
              className="h-11"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-9 md:h-11 text-sm md:text-base"
            disabled={isPendingLogin}
          >
            {isPendingLogin ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <p className="text-center text-xs md:text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-primary hover:underline font-medium"
          >
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
