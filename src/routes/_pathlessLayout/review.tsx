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
import { useIsMobile } from "@/hooks/use-mobile";
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
import { useEffect, useState } from "react";
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
  const isMobile = useIsMobile();

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
            "h-9 w-full justify-start px-2.5 text-left font-normal sm:w-auto",
            !dateRange && "text-muted-foreground"
          )}
        >
          <CalendarIcon size={14} className="mr-2" />
          <span className="min-w-0 truncate">
            {dateRange.from ? (
              <>
              {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d, yyyy")}
              </>
            ) : (
              "Pick a date range"
            )}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[min(calc(100vw-1rem),600px)] p-0"
        align={isMobile ? "center" : "start"}
      >
        <Calendar
          mode="range"
          defaultMonth={dateRange.from}
          selected={{ from: dateRange.from, to: dateRange.to }}
          onSelect={handleSelect}
          numberOfMonths={isMobile ? 1 : 2}
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
  const [revealedCount, setRevealedCount] = useState(0);

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

  useEffect(() => {
    if (!hasSessions || isLoading) return;
    setRevealedCount(0);
    let count = 0;
    const batchSize = 4;
    const interval = setInterval(() => {
      count += batchSize;
      setRevealedCount(Math.min(count, sortedSessions.length));
      if (count >= sortedSessions.length) clearInterval(interval);
    }, 60);
    return () => clearInterval(interval);
  }, [sortedSessions.length, hasSessions, isLoading, dateRange, sort]);

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
      <header
        className={cn(
          "mb-8 motion-safe:animate-[review-row-in_500ms_cubic-bezier(0.22,1,0.36,1)_both] motion-safe:opacity-0"
        )}
      >
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

      <div
        className={cn(
          "mb-8 flex flex-col gap-4 rounded-xl border border-border/50 bg-muted/30 p-4 md:flex-row md:flex-wrap md:items-end",
          "motion-safe:animate-[review-row-in_500ms_80ms_cubic-bezier(0.22,1,0.36,1)_both] motion-safe:opacity-0"
        )}
      >
        <div className="flex w-full flex-col gap-1.5 sm:w-auto">
          <label className="text-xs font-medium text-muted-foreground">
            Date Range
          </label>
          <DateRangePickerTrigger
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        </div>
        <div className="flex w-full flex-col gap-1.5 sm:w-auto">
          <label className="text-xs font-medium text-muted-foreground">
            Sort
          </label>
          <div className="relative inline-grid w-full max-w-xs grid-cols-2 items-center rounded-md border border-border/70 bg-background p-0.5 sm:w-auto sm:min-w-[13rem]">
            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute inset-y-0.5 left-0.5 w-[calc(50%-0.25rem)] rounded-sm bg-ocean-700 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                sort === "oldest" && "translate-x-full"
              )}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSort("newest")}
              className={cn(
                "relative z-10 rounded-sm border-0 shadow-none text-xs transition-[color,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] px-3 motion-safe:hover:-translate-y-px motion-reduce:transition-none",
                sort === "newest" ? "text-white hover:text-white" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ArrowDown size={12} className="mr-1" />
              Newest
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSort("oldest")}
              className={cn(
                "relative z-10 rounded-sm border-0 shadow-none text-xs transition-[color,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] px-3 motion-safe:hover:-translate-y-px motion-reduce:transition-none",
                sort === "oldest" ? "text-white hover:text-white" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ArrowUp size={12} className="mr-1" />
              Oldest
            </Button>
          </div>
        </div>
        <div className="hidden flex-1 md:block" />
        <div className="flex w-full flex-wrap items-center gap-4 text-sm sm:gap-6 md:w-auto">
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
              <div key={i} className="flex flex-col gap-3 py-5 sm:flex-row sm:items-start sm:gap-5">
                <div className="flex items-center gap-2 sm:block sm:w-14 sm:space-y-1">
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
              {sortedSessions.map((s, index) => {
                const start = new Date(s.startedAt);
                const duration =
                  differenceInMinutes(new Date(s.endedAt), start) ||
                  Math.round(s.elapsedSeconds / 60);
                const barWidth = Math.max(
                  Math.min((duration / 120) * 100, 100),
                  8
                );
                const isRevealed = index < revealedCount;

                return (
                  <div
                    key={s.id}
                    className={cn(
                      "group relative flex flex-col gap-3 py-5 first:pt-2 last:pb-0 transition-opacity duration-300 sm:flex-row sm:items-start sm:gap-5",
                      !isRevealed && "opacity-0",
                      isRevealed && "opacity-100 motion-safe:animate-[review-row-in_360ms_cubic-bezier(0.22,1,0.36,1)_both]"
                    )}
                    style={isRevealed ? { animationDelay: `${(index % 4) * 40}ms` } : undefined}
                  >
                    <div className="flex items-baseline gap-2 text-left sm:block sm:w-14 sm:shrink-0 sm:pt-0.5">
                      <p className="text-xs font-medium tabular-nums text-muted-foreground">
                        {format(start, "MMM d")}
                      </p>
                      <p className="text-[11px] leading-tight uppercase text-muted-foreground/60 sm:mt-1">
                        {format(start, "h:mm a")}
                      </p>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
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
                          className="size-7 shrink-0 self-end text-muted-foreground transition-opacity hover:text-destructive sm:self-auto lg:opacity-0 lg:group-hover:opacity-100"
                        >
                          <TrashIcon size={14} />
                        </Button>
                      </div>

                      <div className="mt-2 flex items-center gap-3 sm:mt-2.5">
                        <div
                          className="h-2 rounded-full origin-left motion-safe:animate-[review-bar-grow_480ms_cubic-bezier(0.22,1,0.36,1)_both]"
                          style={{
                            width: `${barWidth}%`,
                            backgroundColor: s.category.color,
                            opacity: 0.5,
                            animationDelay: `${(index % 4) * 40 + 120}ms`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <footer
              className={cn(
                "mt-8 pt-6 border-t border-border",
                "motion-safe:animate-[review-row-in_500ms_200ms_cubic-bezier(0.22,1,0.36,1)_both] motion-safe:opacity-0"
              )}
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
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
