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

function StatBlock({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-muted/40 px-4 py-4">
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
      <div className="container md:container-md py-12 flex flex-col items-center gap-4 text-center">
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
    <div className="container md:container-md py-8 md:py-12">
      <header className="sticky top-0 z-10 -mx-4 px-4 md:-mx-6 md:px-6 py-6 md:py-8 bg-background/95 backdrop-blur-sm mb-10 border-b border-border/50">
        <p className="text-xs font-medium text-ocean-700/80 uppercase tracking-widest mb-2">
          Workspace Overview
        </p>
        <h1 className="font-original-surfer text-4xl text-ocean-900">
          {formattedDate}
        </h1>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
          <div className="space-y-4">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
          <Skeleton className="h-96 rounded-xl" />
        </div>
      ) : hasSessions ? (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatBlock
                icon={HourglassIcon}
                label="Total Time"
                value={getFocusTime(getTotalElapsedSeconds(sessions))}
              />
              <StatBlock
                icon={CheckCircle}
                label="Sessions"
                value={sessions.length}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatBlock
                icon={CalendarIcon}
                label="Active Days"
                value={totalFocusedDays}
              />
              <StatBlock
                icon={HourglassIcon}
                label="This Month"
                value={getFocusTime(getTotalElapsedSeconds(monthSessions))}
              />
            </div>
          </div>

          <div className="relative lg:sticky lg:top-8 lg:self-start">
            <div className="absolute -inset-6 bg-ocean-100/40 rounded-[2.5rem] blur-3xl -z-10" />
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
        <div className="max-w-md mx-auto mt-8 rounded-2xl border border-dashed border-border p-10 text-center bg-muted/20">
          <div className="flex size-14 items-center justify-center rounded-full bg-ocean-700/8 text-ocean-700 mx-auto mb-5">
            <WavesIcon size={28} />
          </div>
          <p className="text-base font-medium text-foreground mb-2">
            No focus sessions recorded yet.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Your deep work journey starts with a single wave.
          </p>
          <Button asChild className="gap-2 bg-ocean-700 hover:bg-ocean-800">
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