import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import z from "zod";
import { useRegister } from "../../_api/_queries";
import { getPostAuthRedirectTo } from "@/lib/auth";
import { useAuth } from "@/store";
import type { RegisterResponse } from "../../_types";
import { Waves } from "lucide-react";

const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type FormValues = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  redirectTo?: string;
}

function RegisterForm({ redirectTo }: RegisterFormProps) {
  const { mutate: register, isPending } = useRegister();
  const navigate = useNavigate();
  const setAccessToken = useAuth((state) => state.setAccessToken);
  const postAuthRedirectTo = redirectTo
    ? getPostAuthRedirectTo(redirectTo)
    : null;

  const form = useForm<FormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: FormValues) {
    register(
      {
        name: values.name,
        email: values.email,
        password: values.password,
      },
      {
        onSuccess: (res: RegisterResponse) => {
          setAccessToken(res.accessToken);
          navigate({
            href: getPostAuthRedirectTo(redirectTo),
            replace: true,
          });
        },
      }
    );
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="space-y-2 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-ocean-700">
            <Waves size={20} className="text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-original-surfer font-semibold text-ocean-900 tracking-tight">
          Create your account
        </h1>
        <p className="text-muted-foreground text-sm">
          Start your focus journey today
        </p>
        {postAuthRedirectTo ? (
          <div className="inline-flex max-w-full items-center rounded-full border border-ocean-200 bg-ocean-50 px-3 py-1 text-xs text-ocean-700 mt-2">
            After signup, you&apos;ll continue to
            <span className="ml-1 truncate font-medium">
              {postAuthRedirectTo}
            </span>
          </div>
        ) : null}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm font-medium">Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Your full name"
                    className="h-11"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm font-medium">Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="you@example.com"
                    type="email"
                    className="h-11"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm font-medium">Password</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Min. 8 characters"
                    type="password"
                    className="h-11"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm font-medium">Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Repeat your password"
                    type="password"
                    className="h-11"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full h-11 text-sm bg-ocean-700 hover:bg-ocean-800"
            disabled={isPending}
          >
            {isPending ? "Creating account..." : "Create account"}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              search={{ redirect: redirectTo }}
              className="text-ocean-700 font-medium hover:text-ocean-800 underline underline-offset-4 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </form>
      </Form>

      <div className="text-center text-xs text-muted-foreground">
        By creating an account, you agree to our{" "}
        <a
          href="/terms"
          className="underline underline-offset-4 hover:text-ocean-700 transition-colors"
        >
          Terms of Service
        </a>{" "}
        and{" "}
        <a
          href="/privacy"
          className="underline underline-offset-4 hover:text-ocean-700 transition-colors"
        >
          Privacy Policy
        </a>
      </div>
    </div>
  );
}

export default RegisterForm;