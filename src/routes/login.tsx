import { LoginForm } from "@/components/LoginForm";
import { createFileRoute } from "@tanstack/react-router";
import LoginBackGroundImage from "@/assets/loginBg.png";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  console.log("LoginBackGroundImage", LoginBackGroundImage);
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* <img
        src={LoginBackGroundImage}
        alt="Login background"
        className="absolute inset-0 h-full w-full object-cover"
      /> */}
      <div className="relative hidden lg:block">
        <img
          src={LoginBackGroundImage}
          alt="Login background"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-background/40 to-background/30" />
        <div className="absolute bottom-0 left-0 right-0 p-12">
          <blockquote className="space-y-2">
            <p className="text-lg text-balance text-card">
              "This platform has transformed the way we work. The intuitive
              design and powerful features make every task effortless."
            </p>
            <footer className="text-sm text-card/80">
              Sofia Chen, Product Designer
            </footer>
          </blockquote>
        </div>
      </div>

      <div className="flex items-center justify-center p-8">
        <LoginForm />
      </div>
    </div>
  );
}
