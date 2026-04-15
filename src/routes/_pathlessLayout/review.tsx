import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDeleteSession,
  useGetAllSessions,
} from "@/features/focus/queries";
import { TimerType } from "@/features/focus/types";
import { getFocusTime } from "@/lib/datetime";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  differenceInMinutes,
  endOfDay,
  format,
  startOfDay,
  subDays,
} from "date-fns";
import {
  Clock4Icon,
  TrashIcon,
  WavesIcon,
  AlertTriangle,
  HourglassIcon,
  CircleCheckBigIcon,
  TimerIcon,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Calendar as CalendarIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_pathlessLayout/review")({
  component: RouteComponent,
});

type SortOption = "newest" | "oldest";

function DateRangePickerTrigger({
  dateRange,
  onDateRangeChange,
}: {
  dateRange: { from: Date; to: Date };
  onDateRangeChange: (range: { from: Date; to: Date }) => void;
}) {
  const [open, setOpen] = useState(false);

  const handleSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from && range?.to) {
      onDateRangeChange({ from: range.from, to: range.to });
      setOpen(false);
    } else if (range?.from) {
      onDateRangeChange({ from: range.from, to: range.from });
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          id="review-date-range"
          className={cn(
            "h-9 w-auto justify-start px-2.5 text-left font-normal",
            !dateRange && "text-muted-foreground"
          )}
        >
          <CalendarIcon size={14} className="mr-2" />
          {dateRange.from ? (
            <>
              {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d, yyyy")}
            </>
          ) : (
            "Pick a date range"
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto min-w-[560px] max-w-[600px] p-0" align="start">
        <Calendar
          mode="range"
          defaultMonth={dateRange.from}
          selected={{ from: dateRange.from, to: dateRange.to }}
          onSelect={handleSelect}
          numberOfMonths={2}
          disabled={(date) => date > new Date()}
          sessions={[]}
          showSessionTooltips={false}
        />
      </PopoverContent>
    </Popover>
  );
}

function RouteComponent() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [sort, setSort] = useState<SortOption>("newest");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const startDate = startOfDay(dateRange.from).toISOString();
  const endDate = endOfDay(dateRange.to).toISOString();

  const { data: sessions, isLoading, isError } = useGetAllSessions({
    startDate,
    endDate,
  });
  const { mutate: deleteSession } = useDeleteSession();

  const sortedSessions = [...(sessions || [])].sort((a, b) => {
    const dateA = new Date(a.startedAt).getTime();
    const dateB = new Date(b.startedAt).getTime();
    return sort === "newest" ? dateB - dateA : dateA - dateB;
  });

  const totalFocusTime = sortedSessions.reduce(
    (acc, curr) => acc + curr.elapsedSeconds,
    0
  );

  const hasSessions = sortedSessions.length > 0;

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteSession(deleteTarget, {
      onSuccess: () => {
        toast.success("Session deleted");
        setDeleteTarget(null);
      },
      onError: () => {
        toast.error("Failed to delete session");
        setDeleteTarget(null);
      },
    });
  };

  return (
    <div className="container md:container-md py-6 md:py-8">
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <CalendarIcon size={14} className="text-ocean-700" />
          <span className="text-xs font-medium text-ocean-700/80 uppercase tracking-widest">
            History
          </span>
        </div>
        <h1 className="font-original-surfer text-4xl text-ocean-900">
          Review Sessions
        </h1>
        <p className="text-muted-foreground mt-2">
          Browse and filter your focus session history.
        </p>
      </header>

      <div className="flex flex-wrap items-end gap-4 mb-8 p-4 rounded-xl bg-muted/30 border border-border/50">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Date Range
          </label>
          <DateRangePickerTrigger
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Sort
          </label>
          <div className="flex items-center gap-1">
            <Button
              variant={sort === "newest" ? "default" : "outline"}
              size="sm"
              onClick={() => setSort("newest")}
              className={sort === "newest" ? "bg-ocean-700 hover:bg-ocean-800" : ""}
            >
              <ArrowDown size={14} className="mr-1" />
              Newest
            </Button>
            <Button
              variant={sort === "oldest" ? "default" : "outline"}
              size="sm"
              onClick={() => setSort("oldest")}
              className={sort === "oldest" ? "bg-ocean-700 hover:bg-ocean-800" : ""}
            >
              <ArrowUp size={14} className="mr-1" />
              Oldest
            </Button>
          </div>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <HourglassIcon size={14} className="text-ocean-700" />
            <span className="text-muted-foreground">Time:</span>
            <span className="font-semibold tabular-nums">
              {getFocusTime(totalFocusTime)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CircleCheckBigIcon size={14} className="text-ocean-700" />
            <span className="text-muted-foreground">Sessions:</span>
            <span className="font-semibold tabular-nums">
              {sortedSessions.length}
            </span>
          </div>
        </div>
      </div>

      <section aria-label="Sessions">
        {isError ? (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle size={24} className="text-destructive" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                Failed to load sessions
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Something went wrong. Please try again.
              </p>
            </div>
          </div>
        ) : isLoading ? (
          <div className="space-y-0 divide-y divide-border">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-5 py-5">
                <div className="w-14 space-y-1">
                  <Skeleton className="h-3.5 w-10" />
                  <Skeleton className="h-2.5 w-6" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="size-2.5 rounded-full" />
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-3 w-10" />
                  </div>
                  <Skeleton className="h-2 w-24 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : !hasSessions ? (
          <div className="mt-20 flex flex-col items-center text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-ocean-700/8 mb-5">
              <WavesIcon size={24} className="text-ocean-700" />
            </div>
            <h2 className="text-lg font-medium text-foreground">
              No sessions found
            </h2>
            <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
              No sessions found in the selected date range.
            </p>
            <Button asChild className="mt-6 gap-2 bg-ocean-700 hover:bg-ocean-800">
              <Link to="/focus">
                Start focusing
                <ArrowRight size={14} />
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-0 divide-y divide-border">
              {sortedSessions.map((s) => {
                const start = new Date(s.startedAt);
                const duration =
                  differenceInMinutes(new Date(s.endedAt), start) ||
                  Math.round(s.elapsedSeconds / 60);
                const barWidth = Math.max(
                  Math.min((duration / 120) * 100, 100),
                  8
                );

                return (
                  <div
                    key={s.id}
                    className="group relative flex items-start gap-5 py-5 first:pt-2 last:pb-0"
                  >
                    <div className="w-14 shrink-0 pt-0.5">
                      <p className="text-xs font-medium tabular-nums text-muted-foreground">
                        {format(start, "MMM d")}
                      </p>
                      <p className="text-[11px] leading-tight text-muted-foreground/60 uppercase">
                        {format(start, "h:mm a")}
                      </p>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="size-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: s.category.color }}
                          />
                          <h3 className="text-sm font-medium text-foreground truncate">
                            {s.category.name}
                          </h3>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {duration}m
                          </span>
                          <span
                            className="shrink-0 text-muted-foreground/40"
                            title={
                              s.type === TimerType.TIMER
                                ? "Timer mode"
                                : "Stopwatch mode"
                            }
                          >
                            {s.type === TimerType.TIMER ? (
                              <TimerIcon size={12} />
                            ) : (
                              <Clock4Icon size={12} />
                            )}
                          </span>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(s.id)}
                          aria-label={`Delete session: ${s.category.name}`}
                          className="size-7 shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                        >
                          <TrashIcon size={14} />
                        </Button>
                      </div>

                      <div className="mt-2.5 flex items-center gap-3">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${barWidth}%`,
                            backgroundColor: s.category.color,
                            opacity: 0.5,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <footer className="mt-8 pt-6 border-t border-border">
              <div className="flex items-baseline justify-between">
                <p className="text-sm text-muted-foreground">Total focus time</p>
                <p className="font-original-surfer text-lg text-ocean-800 tabular-nums">
                  {getFocusTime(totalFocusTime)}
                </p>
              </div>
            </footer>
          </>
        )}
      </section>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this session?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The session will be permanently
              removed from your history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
