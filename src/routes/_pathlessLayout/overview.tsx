import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAllSessions } from "@/features/focus/queries";
import { getFocusTime } from "@/lib/datetime";
import { getTotalElapsedSeconds } from "@/lib/totalFousTime";
import { createFileRoute, Link } from "@tanstack/react-router";
import { format, parseISO, startOfMonth, endOfMonth } from "date-fns";
import {
  HourglassIcon,
  CheckCircle,
  CalendarIcon,
  ArrowRight,
  AlertTriangle,
  WavesIcon,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";

const REVEAL_CLASS =
  "motion-safe:animate-[overview-card-in_480ms_cubic-bezier(0.22,1,0.36,1)_both] motion-safe:opacity-0";

const getDelay = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` });

function StatBlock({
  icon: Icon,
  label,
  value,
  revealDelay,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  revealDelay?: number;
}) {
  return (
    <div
      style={revealDelay !== undefined ? getDelay(revealDelay) : undefined}
      className={cn(
        REVEAL_CLASS,
        "flex items-center gap-3 rounded-xl bg-muted/40 px-4 py-4",
        "transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-sm motion-safe:hover:border-ocean-200/60 motion-reduce:transition-none border border-transparent"
      )}
    >
      <div className="flex shrink-0 size-10 items-center justify-center rounded-lg bg-ocean-700/8 text-ocean-700">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        <p className="text-base font-bold tabular-nums text-foreground truncate">
          {value}
        </p>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_pathlessLayout/overview")({
  component: RouteComponent,
});

function RouteComponent() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const currentDate = new Date();
  const formattedDate = format(currentDate, "EEEE, MMMM d");
  
  const query = useGetAllSessions();
  const isLoading = query.isLoading;
  const isError = query.isError;
  const sessions = query.data ?? [];

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthSessions = sessions.filter(
    (s) => {
      const date = parseISO(s.startedAt);
      return date >= monthStart && date <= monthEnd;
    }
  );

  const totalFocusedDays = new Set(
    sessions.map((s) => format(parseISO(s.startedAt), "yyyy-MM-dd"))
  ).size;

  const hasSessions = sessions.length > 0;

  if (isError) {
    return (
      <div className="container py-10 text-center md:container-md md:py-12 flex flex-col items-center gap-4">
        <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle size={24} className="text-destructive" />
        </div>
        <div>
          <p className="font-medium text-foreground">Failed to load overview</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Something went wrong. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 md:container-md md:py-12">
      <header
        className={cn(
          REVEAL_CLASS,
          "sticky top-0 z-10 -mx-4 mb-6 border-b border-border/50 bg-background/95 px-4 py-4 backdrop-blur-sm sm:mb-8 sm:py-6 md:-mx-6 md:mb-10 md:px-6 md:py-8"
        )}
      >
        <p className="text-xs font-medium text-ocean-700/80 uppercase tracking-widest mb-2">
          Workspace Overview
        </p>
        <h1 className="font-original-surfer text-3xl leading-tight text-ocean-900 sm:text-4xl">
          {formattedDate}
        </h1>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px] lg:gap-12">
          <div className="space-y-3 sm:space-y-4">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
          <Skeleton className="h-96 rounded-xl" />
        </div>
      ) : hasSessions ? (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px] lg:gap-12">
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <StatBlock
                icon={HourglassIcon}
                label="Total Time"
                value={getFocusTime(getTotalElapsedSeconds(sessions))}
                revealDelay={80}
              />
              <StatBlock
                icon={CheckCircle}
                label="Sessions"
                value={sessions.length}
                revealDelay={140}
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <StatBlock
                icon={CalendarIcon}
                label="Active Days"
                value={totalFocusedDays}
                revealDelay={200}
              />
              <StatBlock
                icon={HourglassIcon}
                label="This Month"
                value={getFocusTime(getTotalElapsedSeconds(monthSessions))}
                revealDelay={260}
              />
            </div>
          </div>

          <div
            className={cn(REVEAL_CLASS, "relative lg:sticky lg:top-8 lg:self-start")}
            style={getDelay(320)}
          >
            <div
              aria-hidden="true"
              className="absolute -inset-6 rounded-[2.5rem] bg-ocean-100/40 blur-3xl -z-10 motion-safe:animate-[gentle-breathe_5s_ease-in-out_infinite] motion-reduce:hidden"
            />
            <Calendar
              sessions={monthSessions}
              mode="single"
              selected={new Date()}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="rounded-2xl border border-border shadow-sm w-full"
            />
          </div>
        </div>
      ) : (
        <div
          className={cn(
            REVEAL_CLASS,
            "mx-auto mt-6 max-w-md rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center sm:mt-8 sm:p-10"
          )}
        >
          <div className="flex size-14 items-center justify-center rounded-full bg-ocean-700/8 text-ocean-700 mx-auto mb-5 motion-safe:animate-[gentle-breathe_4s_ease-in-out_infinite] motion-reduce:animate-none">
            <WavesIcon size={28} />
          </div>
          <p className="text-base font-medium text-foreground mb-2">
            No focus sessions recorded yet.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Your deep work journey starts with a single wave.
          </p>
          <Button
            asChild
            className={cn(
              "w-full justify-center gap-2 bg-ocean-700 shadow-[0_14px_24px_-14px_rgba(2,54,123,0.5)] hover:bg-ocean-800 sm:w-auto",
              "transition-[transform,box-shadow,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[0_18px_28px_-14px_rgba(2,54,123,0.55)] motion-safe:active:scale-[0.98] motion-reduce:transition-none"
            )}
          >
            <Link to="/focus">
              Start focusing
              <ArrowRight size={16} />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
