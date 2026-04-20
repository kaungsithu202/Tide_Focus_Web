import IfElse from "@/components/common/IfElse";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateSession,
  useGetAllCategories,
  useGetAllSessions,
  useSessionAction,
} from "@/features/focus/queries";
import { TimerType, type CreateSessionResponse } from "@/features/focus/types";
import { createFileRoute, useBlocker } from "@tanstack/react-router";
import {
  CircleCheckBig,
  HourglassIcon,
  Minus,
  Pause,
  Play,
  Plus,
  Settings,
  Square,
  Volume2,
  VolumeX,
  Waves,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import CategoryDialog from "@/features/focus/components/CategoryDialog";
import { getFocusTime } from "@/lib/datetime";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { CSSProperties } from "react";

const FOCUS_REVEAL_CLASS =
  "motion-safe:animate-[focus-fade-up_560ms_cubic-bezier(0.22,1,0.36,1)_both] motion-safe:opacity-0";

const FOCUS_INTERACTIVE_CLASS =
  "transition-[transform,background-color,border-color,box-shadow,color,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-[0.98] motion-reduce:transition-none";

const FOCUS_PANEL_CLASS =
  "rounded-[1.75rem] border border-border/70 bg-[color-mix(in_oklab,var(--color-background)_94%,var(--color-ocean-50)_6%)] shadow-[0_18px_50px_-32px_rgba(2,54,123,0.28)] backdrop-blur-sm";

const getRevealDelayStyle = (delay: number): CSSProperties => ({
  animationDelay: `${delay}ms`,
});

export const Route = createFileRoute("/_pathlessLayout/focus")({
  component: RouteComponent,
});

function RouteComponent() {
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [openSelect, setIsOpenSelect] = useState(false);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState("");
  const [timerType, setTimerType] = useState<TimerType>(TimerType.STOPWATCH);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  const timerActive = isRunning || hasStarted;
  const timerTypeLocked = isRunning || hasStarted;
  const showDurationControls = timerType === TimerType.TIMER && !hasStarted;

  const blocker = useBlocker({
    shouldBlockFn: () => timerActive,
    enableBeforeUnload: timerActive,
    withResolver: true,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  const defaultTitleRef = useRef("");

  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  const { data: sessions } = useGetAllSessions({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  });

  const totalFocusTime = sessions?.reduce(
    (acc, curr) => acc + curr.elapsedSeconds,
    0
  );

  const { data: categories } = useGetAllCategories();

  const { mutate: createSession } = useCreateSession();

  const { mutate: sessionAction } = useSessionAction();

  const currentCategory = categories?.find(
    (category) => category.id === selectedCategoryId
  );

  const getAmbientAudio = useCallback(() => {
    if (typeof Audio === "undefined") return null;

    if (!ambientAudioRef.current) {
      const audio = new Audio("/audio/waves.mp3");
      audio.loop = true;
      audio.preload = "auto";
      audio.volume = 0.45;
      ambientAudioRef.current = audio;
    }

    return ambientAudioRef.current;
  }, []);

  const playAmbientAudio = useCallback(() => {
    const audio = getAmbientAudio();
    if (!audio) return;

    void audio.play().catch(() => undefined);
  }, [getAmbientAudio]);

  const pauseAmbientAudio = useCallback((reset = false) => {
    const audio = ambientAudioRef.current;
    if (!audio) return;

    audio.pause();

    if (reset) {
      audio.currentTime = 0;
    }
  }, []);

  const start = useCallback(() => {
    if (!currentCategory) {
      toast.error("Please select your wave first");
      return;
    }
    if (!isRunning) {
      setIsRunning(true);
      setHasStarted(true);
      if (isSoundEnabled) {
        playAmbientAudio();
      }
      createSession(
        {
          categoryId: currentCategory.id,
          type: timerType,
          durationSeconds: time,
        },
        {
          onSuccess: (res: CreateSessionResponse) => {
            setCurrentSessionId(res.id);
          },
        }
      );
      intervalRef.current = setInterval(() => {
        setTime((prev) => (timerType === "stopwatch" ? prev + 1 : prev - 1));
      }, 1000);
    }
  }, [
    currentCategory,
    isRunning,
    timerType,
    time,
    createSession,
    isSoundEnabled,
    playAmbientAudio,
  ]);

  const resume = useCallback(() => {
    if (!isRunning && hasStarted && currentCategory) {
      setIsRunning(true);
      if (isSoundEnabled) {
        playAmbientAudio();
      }
      sessionAction({
        action: "resume",
        sessionId: currentSessionId,
        payload: {
          categoryId: currentCategory.id,
          type: timerType,
          durationSeconds: time,
        },
      });
      intervalRef.current = setInterval(() => {
        setTime((prev) => (timerType === "stopwatch" ? prev + 1 : prev - 1));
      }, 1000);
    }
  }, [
    isRunning,
    hasStarted,
    currentCategory,
    currentSessionId,
    timerType,
    time,
    sessionAction,
    isSoundEnabled,
    playAmbientAudio,
  ]);

  const pause = useCallback(() => {
    if (intervalRef.current && currentCategory) {
      sessionAction({
        action: "pause",
        sessionId: currentSessionId,
        payload: {
          categoryId: currentCategory.id,
          type: timerType,
          durationSeconds: time,
        },
      });
      clearInterval(intervalRef.current);
      pauseAmbientAudio();
      setIsRunning(false);
    }
  }, [
    currentCategory,
    currentSessionId,
    timerType,
    time,
    sessionAction,
    pauseAmbientAudio,
  ]);

  const stop = useCallback(() => {
    if (intervalRef.current && currentCategory) {
      clearInterval(intervalRef.current);
      pauseAmbientAudio(true);
      sessionAction(
        {
          action: "complete",
          sessionId: currentSessionId,
          payload: {
            categoryId: currentCategory.id,
            type: timerType,
            durationSeconds: time,
          },
        },
        {
          onSuccess: () => {
            if (timerType === "timer" && time <= 0) {
              const audio = new Audio("/audio/complete.mp3");
              audio.play();
              setTime(1 * 60);
            }
          },
        }
      );
      intervalRef.current = null;
    }
    setIsRunning(false);
    setHasStarted(false);
    setTime(0);
  }, [
    currentCategory,
    currentSessionId,
    timerType,
    time,
    sessionAction,
    pauseAmbientAudio,
  ]);

  const toggleSound = useCallback(() => {
    const nextSoundEnabled = !isSoundEnabled;

    setIsSoundEnabled(nextSoundEnabled);

    if (nextSoundEnabled && isRunning) {
      playAmbientAudio();
      return;
    }

    pauseAmbientAudio();
  }, [isRunning, isSoundEnabled, pauseAmbientAudio, playAmbientAudio]);

  useEffect(() => {
    defaultTitleRef.current = document.title;

    return () => {
      document.title = defaultTitleRef.current;
    };
  }, []);

  useEffect(() => {
    if (isRunning) {
      document.title = `${formatTime(time)} | Tide Focus`;
      return;
    }

    document.title = defaultTitleRef.current || "Tide Focus";
  }, [isRunning, time]);

  useEffect(() => {
    if (timerType === "timer" && time <= 0 && hasStarted) {
      stop();
    }
  }, [timerType, time, hasStarted, stop]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      pauseAmbientAudio(true);
    };
  }, [pauseAmbientAudio]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins}:${secs}`;
    } else {
      return `${mins}:${secs}`;
    }
  };

  const switchTimerType = (type: TimerType) => {
    if (isRunning || hasStarted) return;
    setTime(type === TimerType.STOPWATCH ? 0 : 1 * 60);
    setTimerType(type);
  };

  const statusLabel = isRunning
    ? "In Flow"
    : hasStarted
      ? "Paused"
      : "Ride the Wave";

  const totalFocusLabel = getFocusTime(totalFocusTime ?? 0);
  const totalSessionsLabel = sessions?.length ?? 0;

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] w-full flex-col items-center overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[minmax(16rem,18rem)_minmax(20rem,30rem)_minmax(16rem,18rem)] lg:items-center lg:gap-x-10 xl:gap-x-16">
        <div className="order-2 flex w-full flex-col gap-6 pt-2 lg:order-1 lg:col-start-1 lg:row-start-1 lg:max-w-[18rem] lg:justify-self-end lg:pt-0">
          <div className={cn(FOCUS_REVEAL_CLASS, "space-y-4 px-1")}
            style={getRevealDelayStyle(0)}
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-ocean-700/65">
              Today
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:gap-x-8 lg:grid-cols-1 lg:gap-y-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-ocean-700/65">
                  <HourglassIcon size={14} /> Focused
                </div>
                <p className="text-2xl font-semibold tracking-tight text-ocean-900 tabular-nums sm:text-3xl lg:text-[2rem]">
                  {totalFocusLabel}
                </p>
                <p className="text-xs text-muted-foreground">Time held in focus today</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-ocean-700/65">
                  <CircleCheckBig size={14} /> Sessions
                </div>
                <p className="text-2xl font-semibold tracking-tight text-ocean-900 tabular-nums sm:text-3xl lg:text-[2rem]">
                  {totalSessionsLabel}
                </p>
                <p className="text-xs text-muted-foreground">Completed or active blocks</p>
              </div>
            </div>
          </div>
        </div>

        <CategoryDialog
          openCategoryDialog={openCategoryDialog}
          setOpenCategoryDialog={setOpenCategoryDialog}
          categories={categories}
        />

        <div className="order-1 flex min-w-0 flex-col items-center gap-6 lg:order-2 lg:col-start-2 lg:row-start-1 lg:gap-8">
          <div
            className={cn(FOCUS_REVEAL_CLASS, FOCUS_PANEL_CLASS, "w-full max-w-xl p-4 sm:p-5")}
            style={getRevealDelayStyle(80)}
          >
            <div className="flex flex-col gap-4 lg:gap-5">
              <div className="space-y-1 text-center">
                <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-ocean-700/65">
                  Current Wave
                </span>
                <p className="text-sm text-muted-foreground">
                  Pick the stream of work you want this session to belong to.
                </p>
              </div>
              <Select
                value={selectedCategoryId}
                onValueChange={setSelectedCategoryId}
                open={openSelect}
                onOpenChange={(open) => {
                  if (open && (!categories || categories.length === 0)) {
                    setOpenCategoryDialog(true);
                    return;
                  }
                  setIsOpenSelect(open);
                }}
              >
                <SelectTrigger
                  className={cn(
                    "h-12 w-full rounded-full border-ocean-200/80 bg-background/95 px-4 shadow-sm",
                    "transition-[transform,border-color,box-shadow,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-ocean-300 motion-safe:hover:shadow-md motion-reduce:transition-none"
                  )}
                >
                  <Waves
                    color={currentCategory?.color ?? "var(--color-ocean-700)"}
                    size={16}
                    className={cn(
                      "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                      openSelect && "motion-safe:-rotate-6 motion-safe:scale-110"
                    )}
                  />
                  <SelectValue placeholder="Select a wave">
                    {currentCategory?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <Waves color={category?.color ?? "var(--color-ocean-700)"} size={14} />{" "}
                      {category.name}
                    </SelectItem>
                  ))}
                  <button
                    onClick={() => {
                      setOpenCategoryDialog(true);
                      setIsOpenSelect(false);
                    }}
                    className="focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2"
                  >
                    <Settings size={14} /> Manage Waves
                  </button>
                </SelectContent>
              </Select>
              <p className="text-center text-sm text-ocean-800/80">
                {currentCategory
                  ? `Session will be tracked under ${currentCategory.name}.`
                  : "Choose a wave before you start so the session is filed correctly."}
              </p>
            </div>
          </div>

          <div
            className={cn(FOCUS_REVEAL_CLASS, "relative flex items-center justify-center")}
            style={getRevealDelayStyle(160)}
          >
            {!hasStarted ? (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-5 rounded-full bg-ocean-100/12 motion-safe:animate-[gentle-breathe_4.8s_ease-in-out_infinite] motion-reduce:hidden"
              />
            ) : null}
            <div
              className={cn(
                "relative flex size-[clamp(16rem,78vw,24rem)] items-center justify-center rounded-full border-[3px]",
                "transition-[transform,border-color,background-color,box-shadow,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                isRunning
                  ? "scale-[1.01] border-ocean-500 bg-[color-mix(in_oklab,var(--color-background)_96%,var(--color-ocean-100)_4%)] shadow-[0_20px_60px_-26px_rgba(4,150,199,0.42)]"
                  : hasStarted
                    ? "scale-[0.985] border-ocean-300 bg-[color-mix(in_oklab,var(--color-background)_94%,var(--color-ocean-100)_6%)] opacity-90"
                    : "border-ocean-300/70 bg-[color-mix(in_oklab,var(--color-background)_97%,var(--color-ocean-100)_3%)]"
              )}
            >
              <div className="flex flex-col items-center gap-2 px-4 text-center">
                <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.3em] text-ocean-700/65 font-original-surfer">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "size-1.5 rounded-full bg-current transition-opacity duration-300 motion-reduce:transition-none",
                      isRunning
                        ? "motion-safe:animate-[gentle-breathe_2.4s_ease-in-out_infinite]"
                        : hasStarted
                          ? "opacity-70"
                          : "opacity-40"
                    )}
                  />
                  <span>{statusLabel}</span>
                </div>
                <p className="font-bold text-[clamp(2.75rem,12vw,4.5rem)] tracking-tight tabular-nums text-ocean-700 transition-colors duration-300 motion-reduce:transition-none">
                  {formatTime(time)}
                </p>
                <p className="text-xs text-ocean-700/40">
                  <IfElse
                    isTrue={timerType === TimerType.STOPWATCH}
                    ifBlock="Stopwatch"
                    elseBlock="Timer"
                  />
                </p>
              </div>
            </div>
            {isRunning ? (
              <>
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-4 rounded-full border-2 border-ocean-500/36 motion-safe:animate-[focus-ring-pulse_2.8s_cubic-bezier(0.22,1,0.36,1)_infinite] motion-reduce:hidden"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-8 rounded-full border border-ocean-500/22 motion-safe:animate-[focus-ring-pulse_2.8s_cubic-bezier(0.22,1,0.36,1)_infinite] motion-reduce:hidden"
                  style={getRevealDelayStyle(900)}
                />
              </>
            ) : null}
          </div>

          <div
            className={cn(FOCUS_REVEAL_CLASS, "flex w-full max-w-xl items-center justify-center")}
            style={getRevealDelayStyle(240)}
          >
            <IfElse
              isTrue={!hasStarted}
              ifBlock={
                <Button
                  onClick={start}
                  variant="ocean"
                  className={cn(
                    FOCUS_INTERACTIVE_CLASS,
                    "group flex h-12 w-full max-w-sm items-center justify-center gap-2 rounded-full px-8 text-sm font-medium shadow-[0_18px_30px_-18px_rgba(2,54,123,0.55)]"
                  )}
                >
                  <Play
                    size={16}
                    className="fill-current transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover:translate-x-0.5 motion-reduce:transition-none"
                  />
                  Start Your Journey
                </Button>
              }
              elseBlock={
                <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
                  <IfElse
                    isTrue={isRunning}
                    ifBlock={
                      <Button
                        onClick={pause}
                        variant="ocean"
                        className={cn(
                          FOCUS_INTERACTIVE_CLASS,
                          "group flex h-12 min-w-36 items-center justify-center gap-2 rounded-full px-8 text-sm font-medium shadow-[0_18px_30px_-18px_rgba(2,54,123,0.55)]"
                        )}
                      >
                        <Pause
                          size={16}
                          className="transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover:-translate-y-0.5 motion-reduce:transition-none"
                        />
                        Pause
                      </Button>
                    }
                    elseBlock={
                      <Button
                        onClick={resume}
                        variant="ocean"
                        className={cn(
                          FOCUS_INTERACTIVE_CLASS,
                          "group flex h-12 min-w-36 items-center justify-center gap-2 rounded-full px-8 text-sm font-medium shadow-[0_18px_30px_-18px_rgba(2,54,123,0.55)]"
                        )}
                      >
                        <Play
                          size={16}
                          className="fill-current transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover:translate-x-0.5 motion-reduce:transition-none"
                        />
                        Resume
                      </Button>
                    }
                  />
                  <Button
                    variant="ocean"
                    className={cn(
                      FOCUS_INTERACTIVE_CLASS,
                      "group h-12 w-full rounded-full px-6 shadow-[0_18px_30px_-18px_rgba(2,54,123,0.45)] sm:w-12 sm:px-0"
                    )}
                    onClick={stop}
                    size="icon"
                  >
                    <Square
                      size={16}
                      className="fill-current transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover:scale-110 motion-reduce:transition-none"
                    />
                    <span className="ml-2 text-sm sm:hidden">Stop session</span>
                  </Button>
                </div>
              }
            />
          </div>

          <div
            className={cn(FOCUS_REVEAL_CLASS, "flex w-full max-w-xl justify-center")}
            style={getRevealDelayStyle(280)}
          >
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-pressed={isSoundEnabled}
              aria-label={isSoundEnabled ? "Turn ambient sound off" : "Turn ambient sound on"}
              onClick={toggleSound}
              className={cn(
                FOCUS_INTERACTIVE_CLASS,
                "h-10 rounded-full border-ocean-200/80 bg-background/95 px-4 text-ocean-800 shadow-sm hover:border-ocean-300 hover:bg-ocean-50/70"
              )}
            >
              {isSoundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              {isSoundEnabled ? "Sound On" : "Sound Off"}
            </Button>
          </div>

          <div
            className={cn(FOCUS_REVEAL_CLASS, FOCUS_PANEL_CLASS, "w-full max-w-xl p-4 sm:p-5")}
            style={getRevealDelayStyle(320)}
          >
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-ocean-700/65">
                    Session Type
                  </p>
                  <p className="max-w-[30ch] text-sm text-muted-foreground">
                    Choose a free-running stopwatch or a timed block before you begin.
                  </p>
                </div>
                <div className="relative inline-grid w-full max-w-xs grid-cols-2 items-center rounded-full border border-border/70 bg-background/95 p-1 shadow-sm md:w-auto md:min-w-[15rem]">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-ocean-700 shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                      timerType === TimerType.STOPWATCH && "translate-x-full"
                    )}
                  />
                  <button
                    onClick={() => switchTimerType(TimerType.TIMER)}
                    disabled={timerTypeLocked}
                    className={cn(
                      "relative z-10 rounded-full px-5 py-2 text-sm font-medium whitespace-nowrap transition-[color,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:hover:-translate-y-px motion-reduce:transition-none",
                      timerType === TimerType.TIMER
                        ? "text-white"
                        : "text-muted-foreground hover:text-foreground",
                      "disabled:cursor-not-allowed disabled:opacity-50"
                    )}
                  >
                    Timer
                  </button>
                  <button
                    onClick={() => switchTimerType(TimerType.STOPWATCH)}
                    disabled={timerTypeLocked}
                    className={cn(
                      "relative z-10 rounded-full px-5 py-2 text-sm font-medium whitespace-nowrap transition-[color,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:hover:-translate-y-px motion-reduce:transition-none",
                      timerType === TimerType.STOPWATCH
                        ? "text-white"
                        : "text-muted-foreground hover:text-foreground",
                      "disabled:cursor-not-allowed disabled:opacity-50"
                    )}
                  >
                    Stopwatch
                  </button>
                </div>
              </div>

              <div className="min-h-[7.75rem] border-t border-border/70 pt-5 sm:min-h-[6.5rem]">
                {showDurationControls ? (
                  <div className="flex h-full flex-col gap-3 rounded-[1.25rem] bg-background/80 p-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                    <div>
                      <p className="text-sm font-medium text-ocean-900">Duration</p>
                      <p className="text-xs text-muted-foreground">Adjust in five-minute steps before the session starts.</p>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      <button
                        disabled={timerTypeLocked}
                        onClick={() => setTime((prev) => Math.max(prev - 5 * 60, 60))}
                        className={cn(
                          "flex size-11 items-center justify-center rounded-full bg-background text-foreground",
                          "transition-[transform,background-color,color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:hover:-translate-y-px motion-safe:hover:bg-ocean-100 motion-safe:hover:text-ocean-800 motion-safe:active:scale-95 motion-reduce:transition-none",
                          "disabled:cursor-not-allowed disabled:opacity-50"
                        )}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="min-w-16 text-center text-lg font-semibold tabular-nums text-ocean-900">
                        {time === 0 ? 1 : Math.round(time / 60)}m
                      </span>
                      <button
                        disabled={timerTypeLocked}
                        onClick={() => setTime((prev) => Math.min(prev + 5 * 60, 600 * 60))}
                        className={cn(
                          "flex size-11 items-center justify-center rounded-full bg-background text-foreground",
                          "transition-[transform,background-color,color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:hover:-translate-y-px motion-safe:hover:bg-ocean-100 motion-safe:hover:text-ocean-800 motion-safe:active:scale-95 motion-reduce:transition-none",
                          "disabled:cursor-not-allowed disabled:opacity-50"
                        )}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full flex-col justify-center gap-1 px-1">
                    <p className="text-sm font-medium text-ocean-900">Open session</p>
                    <p className="text-xs text-muted-foreground">
                      Stopwatch runs until you pause or stop it, with no preset duration to adjust.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={blocker.status === "blocked"}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Timer is still running</AlertDialogTitle>
            <AlertDialogDescription>
              You have an active session. Leaving now will not stop or save your progress. Are you sure you want to leave?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={blocker.reset}>Stay</AlertDialogCancel>
            <AlertDialogAction onClick={blocker.proceed}>Leave</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
