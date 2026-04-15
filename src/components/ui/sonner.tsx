import type { CSSProperties } from "react"
import {
  CheckCircle2,
  CircleAlert,
  Info,
  LoaderCircle,
  TriangleAlert,
  X,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

import { cn } from "@/lib/utils"

const toastClassNames = {
  toast: cn(
    "group pointer-events-auto flex w-full items-start gap-3 rounded-xl border border-ocean-700/12 bg-card px-4 py-3.5 pr-10 text-foreground shadow-sm",
    "max-sm:pr-11"
  ),
  content: "grid gap-1",
  title: "text-sm font-semibold leading-5 tracking-tight text-foreground",
  description: "text-[13px] leading-5 text-muted-foreground",
  icon: "mt-0.5 flex size-5 items-center justify-center text-ocean-700",
  actionButton:
    "inline-flex h-8 shrink-0 items-center justify-center rounded-md bg-ocean-700 px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-ocean-800 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 max-sm:h-11",
  cancelButton:
    "inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 max-sm:h-11",
  closeButton:
    "absolute right-3 top-3 inline-flex size-7 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-ocean-700/20 hover:bg-ocean-100/20 hover:text-ocean-800 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 max-sm:size-11",
  success:
    "border-ocean-700/16 bg-[color-mix(in_oklab,var(--color-card)_92%,var(--color-ocean-100)_8%)] [&_[data-description]]:text-ocean-900/80 [&_[data-icon]]:text-ocean-700",
  info:
    "border-ocean-700/16 bg-[color-mix(in_oklab,var(--color-card)_92%,var(--color-ocean-100)_8%)] [&_[data-description]]:text-ocean-900/80 [&_[data-icon]]:text-ocean-700",
  warning:
    "border-ocean-500/20 bg-[color-mix(in_oklab,var(--color-card)_90%,var(--color-ocean-300)_10%)] [&_[data-description]]:text-ocean-900/80 [&_[data-icon]]:text-ocean-800",
  error:
    "border-destructive/20 bg-[color-mix(in_oklab,var(--color-card)_93%,var(--color-destructive)_7%)] [&_[data-description]]:text-foreground/80 [&_[data-icon]]:text-destructive",
  loading:
    "border-ocean-700/16 bg-[color-mix(in_oklab,var(--color-card)_92%,var(--color-ocean-100)_8%)] [&_[data-description]]:text-ocean-900/80 [&_[data-icon]]:text-ocean-700",
}

const defaultIcons = {
  success: <CheckCircle2 className="size-4" />,
  info: <Info className="size-4" />,
  warning: <TriangleAlert className="size-4" />,
  error: <CircleAlert className="size-4" />,
  loading: <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />,
  close: <X className="size-4" />,
}

const Toaster = ({
  className,
  icons,
  style,
  toastOptions,
  ...props
}: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      position="top-right"
      closeButton
      expand
      visibleToasts={4}
      duration={4000}
      offset={16}
      mobileOffset={16}
      containerAriaLabel="Notifications"
      className={cn("toaster group font-sans", className)}
      icons={{ ...defaultIcons, ...icons }}
      style={{
        ...(style ?? {}),
        "--width": "min(24rem, calc(100vw - 2rem))",
      } as CSSProperties}
      toastOptions={{
        unstyled: true,
        closeButtonAriaLabel: "Dismiss notification",
        ...toastOptions,
        classNames: {
          ...toastClassNames,
          ...toastOptions?.classNames,
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
