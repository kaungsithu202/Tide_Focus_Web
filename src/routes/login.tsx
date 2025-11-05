import { LoginForm } from "@/components/LoginForm";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img
          src={"/images/authbg.webp"}
          alt="Login background"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute bottom-0 left-0 right-0 p-12">
          <blockquote className="space-y-2">
            <p className="text-lg text-balance text-card">
              “Ride the tide of time — focus on what truly matters.”
            </p>
          </blockquote>
        </div>
      </div>

      <div className="flex items-center justify-center p-8">
        <LoginForm />
      </div>
    </div>
  );
}
