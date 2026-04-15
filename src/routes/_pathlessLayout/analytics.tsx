import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAllCategories, useGetAllSessions } from "@/features/focus/queries";
import { getFocusTime } from "@/lib/datetime";
import { getTotalElapsedSeconds } from "@/lib/totalFousTime";
import { cn } from "@/lib/utils";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Calendar,
  Clock,
  Minus,
  Target,
  TrendingDown,
  TrendingUp,
  WavesIcon,
} from "lucide-react";
import {
  useEffect,
  useState,
  type CSSProperties,
  type ElementType,
} from "react";

export const Route = createFileRoute("/_pathlessLayout/analytics")({
  component: RouteComponent,
});

const ANALYTICS_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateMotionPreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    updateMotionPreference();

    mediaQuery.addEventListener("change", updateMotionPreference);

    return () => {
      mediaQuery.removeEventListener("change", updateMotionPreference);
    };
  }, []);

  return prefersReducedMotion;
}

function getRevealStyle(delay: number, reducedMotion: boolean): CSSProperties | undefined {
  if (reducedMotion) {
    return undefined;
  }

  return {
    animation: `analytics-fade-up 560ms ${ANALYTICS_EASE} both`,
    animationDelay: `${delay}ms`,
  };
}

function getScaleStyle(
  delay: number,
  reducedMotion: boolean,
  axis: "x" | "y"
): CSSProperties | undefined {
  if (reducedMotion) {
    return undefined;
  }

  return {
    animation: `${axis === "x" ? "analytics-grow-x" : "analytics-grow-y"} 720ms ${ANALYTICS_EASE} both`,
    animationDelay: `${delay}ms`,
    transformOrigin: axis === "x" ? "left center" : "center bottom",
    willChange: "transform, opacity",
  };
}

function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendValue,
  delay,
  reducedMotion,
  highlight = false,
}: {
  label: string;
  value: string | number;
  icon: ElementType;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  delay: number;
  reducedMotion: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-background p-4 md:p-5 transition-[transform,box-shadow,border-color,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:hover:-translate-y-1 motion-safe:hover:border-ocean-200/80 motion-safe:hover:shadow-lg",
        highlight && "bg-ocean-700/5",
        !reducedMotion && "opacity-0"
      )}
      style={getRevealStyle(delay, reducedMotion)}
      data-analytics-motion
    >
      {highlight ? (
        <div className="pointer-events-none absolute inset-x-6 top-0 h-16 rounded-full bg-ocean-300/10 blur-2xl motion-safe:animate-[gentle-breathe_5s_ease-in-out_infinite]" />
      ) : null}

      <div className="relative flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        <div className="flex size-8 items-center justify-center rounded-lg bg-ocean-700/8 text-ocean-700 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:scale-105">
          <Icon size={16} />
        </div>
      </div>

      <div className="relative text-[1.35rem] font-bold text-foreground tabular-nums transition-colors duration-300 motion-safe:group-hover:text-ocean-900 sm:text-2xl">
        {value}
      </div>

      {trend && trendValue ? (
        <div className="relative mt-2 flex items-center gap-1 text-xs">
          {trend === "up" ? (
            <TrendingUp size={14} className="text-emerald-600 transition-transform duration-300 motion-safe:group-hover:scale-110" />
          ) : trend === "down" ? (
            <TrendingDown size={14} className="text-red-600 transition-transform duration-300 motion-safe:group-hover:scale-110" />
          ) : (
            <Minus size={14} className="text-muted-foreground transition-transform duration-300 motion-safe:group-hover:scale-110" />
          )}
          <span
            className={cn(
              trend === "up"
                ? "text-emerald-600"
                : trend === "down"
                  ? "text-red-600"
                  : "text-muted-foreground"
            )}
          >
            {trendValue}
          </span>
        </div>
      ) : null}
    </div>
  );
}

function RouteComponent() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const now = new Date();
  const { data: allSessions, isLoading: isLoadingSessions, isError: isErrorSessions } =
    useGetAllSessions();
  const { data: categories, isLoading: isLoadingCategories } = useGetAllCategories();

  const sessions = allSessions ?? [];

  const thisWeekStart = startOfWeek(now);
  const thisWeekEnd = endOfWeek(now);
  const lastWeekStart = subWeeks(thisWeekStart, 1);
  const lastWeekEnd = subWeeks(thisWeekEnd, 1);

  const thisMonthStart = startOfMonth(now);
  const thisMonthEnd = endOfMonth(now);
  const lastMonthStart = subMonths(thisMonthStart, 1);
  const lastMonthEnd = subMonths(thisMonthEnd, 1);

  const thisWeekSessions = sessions.filter((session) => {
    const date = parseISO(session.startedAt);
    return date >= thisWeekStart && date <= thisWeekEnd;
  });

  const lastWeekSessions = sessions.filter((session) => {
    const date = parseISO(session.startedAt);
    return date >= lastWeekStart && date <= lastWeekEnd;
  });

  const thisMonthSessions = sessions.filter((session) => {
    const date = parseISO(session.startedAt);
    return date >= thisMonthStart && date <= thisMonthEnd;
  });

  const lastMonthSessions = sessions.filter((session) => {
    const date = parseISO(session.startedAt);
    return date >= lastMonthStart && date <= lastMonthEnd;
  });

  const thisWeekTime = getTotalElapsedSeconds(thisWeekSessions);
  const lastWeekTime = getTotalElapsedSeconds(lastWeekSessions);
  const thisMonthTime = getTotalElapsedSeconds(thisMonthSessions);
  const lastMonthTime = getTotalElapsedSeconds(lastMonthSessions);
  const totalTime = getTotalElapsedSeconds(sessions);
  const avgSessionTime = sessions.length > 0 ? Math.round(totalTime / sessions.length) : 0;
  const activeDays = new Set(
    sessions.map((session) => format(parseISO(session.startedAt), "yyyy-MM-dd"))
  ).size;

  const weekTrend =
    lastWeekTime === 0
      ? "neutral"
      : thisWeekTime > lastWeekTime
        ? "up"
        : "down";

  const weekTrendValue =
    lastWeekTime === 0
      ? "No prior week"
      : `${Math.abs(Math.round(((thisWeekTime - lastWeekTime) / lastWeekTime) * 100))}% vs last week`;

  const monthTrend =
    lastMonthTime === 0
      ? "neutral"
      : thisMonthTime > lastMonthTime
        ? "up"
        : "down";

  const monthTrendValue =
    lastMonthTime === 0
      ? "No prior month"
      : `${Math.abs(Math.round(((thisMonthTime - lastMonthTime) / lastMonthTime) * 100))}% vs last month`;

  const categoryBreakdown =
    categories
      ?.map((category) => {
        const categorySessions = sessions.filter((session) => session.category.id === category.id);
        const time = getTotalElapsedSeconds(categorySessions);

        return {
          category,
          sessions: categorySessions.length,
          time,
          share: totalTime > 0 ? Math.round((time / totalTime) * 100) : 0,
        };
      })
      .sort((a, b) => b.time - a.time) ?? [];

  const dayOfWeekData = Array.from({ length: 7 }, (_, index) => {
    const daySessions = sessions.filter((session) => getDay(parseISO(session.startedAt)) === index);

    return {
      day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][index],
      time: getTotalElapsedSeconds(daySessions),
      sessions: daySessions.length,
    };
  });

  const maxDayTime = Math.max(...dayOfWeekData.map((day) => day.time), 1);
  const isLoading = isLoadingSessions || isLoadingCategories;

  if (isErrorSessions) {
    return (
      <div className="container py-10 text-center md:container-md md:py-12 flex flex-col items-center gap-4">
        <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle size={24} className="text-destructive" />
        </div>
        <div>
          <p className="font-medium text-foreground">Failed to load analytics</p>
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
        className={cn("mb-6 md:mb-8", !prefersReducedMotion && "opacity-0")}
        style={getRevealStyle(40, prefersReducedMotion)}
        data-analytics-motion
      >
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 size={14} className="text-ocean-700" />
          <span className="text-xs font-medium text-ocean-700/80 uppercase tracking-widest">
            Insights
          </span>
        </div>
        <h1 className="font-original-surfer text-3xl text-ocean-900 md:text-4xl">Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Track your focus patterns and productivity trends.
        </p>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="h-32 rounded-xl motion-safe:animate-[gentle-breathe_3.5s_ease-in-out_infinite]" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center sm:p-10 md:p-12">
          <div className="flex size-14 items-center justify-center rounded-full bg-ocean-700/8 text-ocean-700 mx-auto mb-4 motion-safe:animate-[gentle-breathe_4s_ease-in-out_infinite]">
            <BarChart3 size={28} />
          </div>
          <p className="text-base font-medium text-foreground mb-2">No data yet.</p>
          <p className="text-sm text-muted-foreground mb-6">
            Complete some focus sessions to see your analytics.
          </p>
          <Button asChild className="group w-full bg-ocean-700 hover:bg-ocean-800 sm:w-auto">
            <Link to="/focus">
              Start focusing
              <ArrowRight size={14} className="transition-transform duration-300 motion-safe:group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <section className="mb-8 md:mb-10">
            <h2
              className={cn(
                "mb-3 flex items-center gap-2 text-sm font-semibold text-foreground md:mb-4",
                !prefersReducedMotion && "opacity-0"
              )}
              style={getRevealStyle(120, prefersReducedMotion)}
              data-analytics-motion
            >
              <Clock size={16} className="text-ocean-700" />
              This Week
            </h2>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-4">
              <StatCard
                label="Focus Time"
                value={getFocusTime(thisWeekTime)}
                icon={Clock}
                trend={weekTrend}
                trendValue={weekTrendValue}
                delay={170}
                reducedMotion={prefersReducedMotion}
                highlight
              />
              <StatCard
                label="Sessions"
                value={thisWeekSessions.length}
                icon={Target}
                delay={230}
                reducedMotion={prefersReducedMotion}
              />
              <StatCard
                label="This Month"
                value={getFocusTime(thisMonthTime)}
                icon={Calendar}
                trend={monthTrend}
                trendValue={monthTrendValue}
                delay={290}
                reducedMotion={prefersReducedMotion}
              />
              <StatCard
                label="Total Sessions"
                value={sessions.length}
                icon={BarChart3}
                delay={350}
                reducedMotion={prefersReducedMotion}
              />
            </div>
          </section>

          <section className="mb-8 md:mb-10">
            <h2
              className={cn(
                "mb-3 flex items-center gap-2 text-sm font-semibold text-foreground md:mb-4",
                !prefersReducedMotion && "opacity-0"
              )}
              style={getRevealStyle(410, prefersReducedMotion)}
              data-analytics-motion
            >
              <WavesIcon size={16} className="text-ocean-700" />
              Category Breakdown
            </h2>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
              {categoryBreakdown.map(({ category, sessions: count, time, share }, index) => (
                <div
                  key={category.id}
                  className={cn(
                    "group rounded-xl border border-border bg-background p-4 transition-[transform,box-shadow,border-color,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-ocean-200/80 motion-safe:hover:shadow-md",
                    !prefersReducedMotion && "opacity-0"
                  )}
                  style={getRevealStyle(470 + index * 55, prefersReducedMotion)}
                  data-analytics-motion
                >
                  <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
                    <div
                      className="flex size-10 items-center justify-center rounded-lg transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover:scale-105"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <div
                        className="size-4 rounded-full transition-transform duration-300 motion-safe:group-hover:scale-110"
                        style={{ backgroundColor: category.color }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{category.name}</p>
                      <p className="text-xs text-muted-foreground">{count} sessions</p>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-sm font-semibold tabular-nums">{getFocusTime(time)}</p>
                      <p className="text-xs text-muted-foreground">{share}%</p>
                    </div>
                  </div>

                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ocean-700/8">
                    <div
                      className={cn(
                        "h-full rounded-full transition-[opacity,filter] duration-300 motion-safe:group-hover:opacity-100 motion-safe:group-hover:saturate-125"
                      )}
                      style={{
                        width: `${Math.max(share, share > 0 ? 8 : 0)}%`,
                        backgroundColor: category.color,
                        opacity: 0.72,
                        ...getScaleStyle(520 + index * 55, prefersReducedMotion, "x"),
                      }}
                      data-analytics-motion
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-8 md:mb-10">
            <h2
              className={cn(
                "mb-3 flex items-center gap-2 text-sm font-semibold text-foreground md:mb-4",
                !prefersReducedMotion && "opacity-0"
              )}
              style={getRevealStyle(620, prefersReducedMotion)}
              data-analytics-motion
            >
              <Calendar size={16} className="text-ocean-700" />
              Weekly Pattern
            </h2>

            <div
              className={cn(
                "rounded-xl border border-border bg-background p-4 transition-shadow duration-300 motion-safe:hover:shadow-sm sm:p-6",
                !prefersReducedMotion && "opacity-0"
              )}
              style={getRevealStyle(670, prefersReducedMotion)}
              data-analytics-motion
            >
              <div className="flex h-40 items-end justify-between gap-1.5 sm:gap-2">
                {dayOfWeekData.map(({ day, time, sessions: sessionCount }) => {
                  const height = (time / maxDayTime) * 100;
                  const isActiveDay = sessionCount > 0;

                  return (
                    <div
                      key={day}
                      className="group flex h-full flex-1 flex-col items-center justify-end gap-2"
                    >
                      <div className="flex h-5 items-center justify-center text-[10px] font-medium sm:text-[11px]">
                        <span
                          className={cn(
                            "whitespace-nowrap transition-opacity duration-200",
                            isActiveDay
                              ? "text-ocean-800 opacity-100 sm:opacity-0 sm:motion-safe:group-hover:opacity-100"
                              : "text-transparent"
                          )}
                        >
                          {isActiveDay ? getFocusTime(time) : "0m"}
                        </span>
                      </div>

                      <div className="flex h-24 w-full flex-col items-center justify-end">
                        <div className="flex h-full w-full max-w-7 items-end overflow-hidden rounded-md bg-ocean-700/10 sm:max-w-8">
                          <div
                            className={cn(
                              "w-full rounded-md transition-colors duration-300",
                              isActiveDay
                                ? "bg-ocean-700 motion-safe:group-hover:bg-ocean-800"
                                : "bg-transparent"
                            )}
                            style={{
                              height: `${isActiveDay ? Math.max(height, 8) : 0}%`,
                            }}
                            data-analytics-motion
                          />
                        </div>
                      </div>

                      <div className="flex h-8 flex-col items-center justify-start text-center">
                        <span className="text-xs text-muted-foreground">{day}</span>
                        <p
                          className={cn(
                            "text-[10px] transition-opacity duration-200 sm:text-[11px]",
                            isActiveDay
                              ? "text-ocean-800/80 opacity-100 sm:opacity-0 sm:motion-safe:group-hover:opacity-100"
                              : "text-transparent"
                          )}
                        >
                          {isActiveDay ? `${sessionCount} sessions` : "0 sessions"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section>
            <h2
              className={cn(
                "mb-4 flex items-center gap-2 text-sm font-semibold text-foreground",
                !prefersReducedMotion && "opacity-0"
              )}
              style={getRevealStyle(860, prefersReducedMotion)}
              data-analytics-motion
            >
              <Target size={16} className="text-ocean-700" />
              Averages
            </h2>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
              {[
                { label: "Avg Session", value: getFocusTime(avgSessionTime) },
                { label: "Total Time", value: getFocusTime(totalTime) },
                { label: "Active Days", value: activeDays },
              ].map((item, index) => (
                <div
                  key={item.label}
                  className={cn(
                    "group rounded-xl border border-border bg-background p-4 md:p-5 transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:hover:-translate-y-1 motion-safe:hover:border-ocean-200/80 motion-safe:hover:shadow-md",
                    !prefersReducedMotion && "opacity-0"
                  )}
                  style={getRevealStyle(920 + index * 60, prefersReducedMotion)}
                  data-analytics-motion
                >
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="text-[1.35rem] font-bold text-foreground transition-colors duration-300 motion-safe:group-hover:text-ocean-900 sm:text-2xl">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
