import RegisterForm from "@/features/register/_components/RegisterForm";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/register")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Image */}
      <div className="hidden lg:block relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="images/authbg.webp"
            alt="Modern architecture"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      </div>

      {/* Right side - Register Form */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <RegisterForm />
      </div>
    </div>
  );
}
