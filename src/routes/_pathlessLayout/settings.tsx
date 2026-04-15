import { isAxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  ShieldAlert,
  ShieldCheck,
  LoaderCircle,
  QrCode,
  RefreshCcw,
  User,
  Mail,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useDisableTwoFa,
  useGenerateTwoFa,
  useGetUser,
  useValidateTwoFa,
} from "@/features/settings/queries";

export const Route = createFileRoute("/_pathlessLayout/settings")({
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

function ProfileCard({ user, isLoading }: { user?: { name: string; email: string } | null; isLoading: boolean }) {
  return (
    <div className={cn(
      "rounded-2xl border border-border bg-background p-6",
      "transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-sm motion-safe:hover:border-ocean-200/80 motion-reduce:transition-none"
    )}>
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-5">
        Profile
      </h2>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-ocean-700/8 text-ocean-700">
            <User size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Name</p>
            {isLoading ? (
              <Skeleton className="h-4 w-24 mt-1" />
            ) : (
              <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-ocean-700/8 text-ocean-700">
            <Mail size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Email</p>
            {isLoading ? (
              <Skeleton className="h-4 w-32 mt-1" />
            ) : (
              <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TwoFactorCard({
  user,
  onEnable,
  onDisable,
}: {
  user?: { twoFaEnable: boolean } | null;
  onEnable: () => void;
  onDisable: () => void;
}) {
  const isEnabled = user?.twoFaEnable;
  
  return (
    <div className={cn(
      "rounded-2xl border border-border bg-background p-6",
      "transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-sm motion-safe:hover:border-ocean-200/80 motion-reduce:transition-none"
    )}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Two-factor authentication
        </h2>
        {isEnabled ? (
          <ShieldCheck className="size-5 text-ocean-600" />
        ) : (
          <ShieldAlert className="size-5 text-amber-600 motion-safe:animate-[gentle-breathe_3s_ease-in-out_infinite] motion-reduce:animate-none" />
        )}
      </div>
      
      <div className="space-y-4">
        <Badge
          variant={isEnabled ? "secondary" : "outline"}
          className={
            isEnabled
              ? "bg-ocean-700/10 text-ocean-700 border-ocean-700/20"
              : "text-amber-700 border-amber-200"
          }
        >
          {isEnabled ? "Enabled" : "Not enabled"}
        </Badge>
        
        <p className="text-sm text-muted-foreground leading-relaxed">
          {isEnabled
            ? "Your account requires a code from your authenticator app when signing in."
            : "Add an extra layer of security by enabling two-factor authentication."}
        </p>
        
        <div className="pt-2">
          {isEnabled ? (
            <Button variant="outline" size="sm" onClick={onDisable}>
              Disable 2FA
            </Button>
          ) : (
            <Button className="bg-ocean-700 hover:bg-ocean-800" size="sm" onClick={onEnable}>
              Enable 2FA
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function RouteComponent() {
  const queryClient = useQueryClient();
  const { data: user, isLoading: isLoadingUser } = useGetUser();
  const {
    mutateAsync: generateTwoFaAsync,
    isPending: isGeneratingTwoFa,
  } = useGenerateTwoFa();
  const {
    mutateAsync: validateTwoFaAsync,
    isPending: isValidatingTwoFa,
  } = useValidateTwoFa();
  const {
    mutateAsync: disableTwoFaAsync,
    isPending: isDisablingTwoFa,
  } = useDisableTwoFa();

  const [setupOpen, setSetupOpen] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);
  const [setupCode, setSetupCode] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (qrCodeUrl) {
        URL.revokeObjectURL(qrCodeUrl);
      }
    };
  }, [qrCodeUrl]);

  const clearQrCode = () => {
    setQrCodeUrl((previousUrl) => {
      if (previousUrl) {
        URL.revokeObjectURL(previousUrl);
      }
      return null;
    });
  };

  const resetSetupState = () => {
    setSetupCode("");
    clearQrCode();
  };

  const resetDisableState = () => {
    setDisableCode("");
    setCurrentPassword("");
  };

  const refreshUser = async () => {
    await queryClient.invalidateQueries({ queryKey: ["user"] });
  };

  const requestQrCode = async () => {
    return toast.promise(
      generateTwoFaAsync().then((blob) => {
        setQrCodeUrl((previousUrl) => {
          if (previousUrl) {
            URL.revokeObjectURL(previousUrl);
          }
          return URL.createObjectURL(blob);
        });
        return blob;
      }),
      {
        loading: "Generating QR code...",
        success: "QR code ready",
        error: getErrorMessage,
      }
    );
  };

  const handleSetupDialogChange = (open: boolean) => {
    setSetupOpen(open);
    if (!open) {
      resetSetupState();
      return;
    }
    if (!qrCodeUrl) {
      void requestQrCode();
    }
  };

  const handleDisableDialogChange = (open: boolean) => {
    setDisableOpen(open);
    if (!open) {
      resetDisableState();
    }
  };

  const handleSetupSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await toast.promise(
      validateTwoFaAsync({ totp: setupCode }).then(async (response) => {
        await refreshUser();
        handleSetupDialogChange(false);
        return response;
      }),
      {
        loading: "Verifying code...",
        success: (response) => response.message,
        error: getErrorMessage,
      }
    );
  };

  const handleDisableSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await toast.promise(
      disableTwoFaAsync({
        currentPassword,
        totp: disableCode,
      }).then(async (response) => {
        await refreshUser();
        handleDisableDialogChange(false);
        return response;
      }),
      {
        loading: "Disabling two-factor authentication...",
        success: (response) => response.message,
        error: getErrorMessage,
      }
    );
  };

  return (
    <div className="container md:container-md py-8 md:py-12">
      <header
        className={cn(
          "mb-10",
          "motion-safe:animate-[overview-card-in_480ms_cubic-bezier(0.22,1,0.36,1)_both] motion-safe:opacity-0"
        )}
      >
        <p className="text-xs font-medium text-ocean-700/80 uppercase tracking-widest mb-2">
          Settings
        </p>
        <h1 className="font-original-surfer text-4xl text-ocean-900">
          Account
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className={cn(
            "motion-safe:animate-[overview-card-in_480ms_80ms_cubic-bezier(0.22,1,0.36,1)_both] motion-safe:opacity-0"
          )}
        >
          <ProfileCard user={user} isLoading={isLoadingUser} />
        </div>
        <div
          className={cn(
            "motion-safe:animate-[overview-card-in_480ms_140ms_cubic-bezier(0.22,1,0.36,1)_both] motion-safe:opacity-0"
          )}
        >
          <TwoFactorCard
            user={user}
            onEnable={() => handleSetupDialogChange(true)}
            onDisable={() => handleDisableDialogChange(true)}
          />
        </div>
      </div>

      <Dialog open={setupOpen} onOpenChange={handleSetupDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set up two-factor authentication</DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app, then enter the generated code to finish setup.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex min-h-64 items-center justify-center rounded-xl border border-border bg-muted/20 p-4">
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt="Two-factor authentication QR code"
                  className="h-56 w-56 rounded-lg border border-border bg-white p-3"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
                  {isGeneratingTwoFa ? (
                    <LoaderCircle className="size-6 animate-spin" />
                  ) : (
                    <QrCode className="size-6" />
                  )}
                  <p>Preparing your QR code...</p>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => void requestQrCode()}
                disabled={isGeneratingTwoFa}
              >
                <RefreshCcw className={isGeneratingTwoFa ? "animate-spin mr-2" : "mr-2"} />
                Regenerate QR code
              </Button>
            </div>

            <form onSubmit={handleSetupSubmit} className="space-y-4">
              <div className="space-y-2">
                <LabelText htmlFor="setup-totp">Verification code</LabelText>
                <Input
                  id="setup-totp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="123456"
                  value={setupCode}
                  onChange={(event) => {
                    setSetupCode(event.target.value.replace(/\D/g, "").slice(0, 6));
                  }}
                  className="h-11 text-center text-lg tracking-[0.35em] font-semibold"
                  maxLength={6}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSetupDialogChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-ocean-700 hover:bg-ocean-800"
                  disabled={isValidatingTwoFa || setupCode.length !== 6}
                >
                  {isValidatingTwoFa ? "Verifying..." : "Enable 2FA"}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={disableOpen} onOpenChange={handleDisableDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable two-factor authentication</DialogTitle>
            <DialogDescription>
              Confirm your password and current authenticator code to disable 2FA.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleDisableSubmit} className="space-y-4">
            <div className="space-y-2">
              <LabelText htmlFor="disable-password">Current password</LabelText>
              <Input
                id="disable-password"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                placeholder="Enter your current password"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <LabelText htmlFor="disable-totp">Verification code</LabelText>
              <Input
                id="disable-totp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                value={disableCode}
                onChange={(event) => {
                  setDisableCode(event.target.value.replace(/\D/g, "").slice(0, 6));
                }}
                className="h-11 text-center text-lg tracking-[0.35em] font-semibold"
                maxLength={6}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDisableDialogChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={
                  isDisablingTwoFa ||
                  currentPassword.length === 0 ||
                  disableCode.length !== 6
                }
              >
                {isDisablingTwoFa ? "Disabling..." : "Disable 2FA"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LabelText({
  children,
  htmlFor,
}: {
  children: ReactNode;
  htmlFor: string;
}) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium">
      {children}
    </label>
  );
}