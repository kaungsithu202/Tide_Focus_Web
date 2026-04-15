import IfElse from "@/components/common/IfElse";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
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
  Play,
  Pause,
  Plus,
  Square,
  Settings,
  Waves,
} from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";

import CategoryDialog from "@/features/focus/components/CategoryDialog";
import { getFocusTime } from "@/lib/datetime";
import { toast } from "sonner";

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

  const timerActive = isRunning || hasStarted;

  const blocker = useBlocker({
    shouldBlockFn: () => timerActive,
    enableBeforeUnload: timerActive,
    withResolver: true,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

  const start = useCallback(() => {
    if (!currentCategory) {
      toast.error("Please select your wave first");
      return;
    }
    if (!isRunning) {
      setIsRunning(true);
      setHasStarted(true);
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
  }, [currentCategory, isRunning, timerType, time, createSession]);

  const resume = useCallback(() => {
    if (!isRunning && hasStarted && currentCategory) {
      setIsRunning(true);
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
  }, [isRunning, hasStarted, currentCategory, currentSessionId, timerType, time, sessionAction]);

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
      setIsRunning(false);
    }
  }, [currentCategory, currentSessionId, timerType, time, sessionAction]);

  const stop = useCallback(() => {
    if (intervalRef.current && currentCategory) {
      clearInterval(intervalRef.current);
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
  }, [currentCategory, currentSessionId, timerType, time, sessionAction]);

  useEffect(() => {
    if (timerType === "timer" && time <= 0 && hasStarted) {
      stop();
    }
  }, [timerType, time, hasStarted, stop]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

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

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full flex flex-col items-center justify-center px-4 relative">
      <div className="absolute top-4 right-4 flex items-center gap-4 rounded-full bg-muted/80 backdrop-blur-sm px-5 py-2 text-sm">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <HourglassIcon size={14} />
          <span className="tabular-nums">{getFocusTime(totalFocusTime ?? 0)}</span>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <CircleCheckBig size={14} />
          <span className="tabular-nums">{sessions?.length ?? 0}</span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-8 w-full max-w-md">
        <div className="flex flex-col items-center gap-2 w-full">
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground/70">
            Current Wave
          </span>
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
            <SelectTrigger className="w-[260px] h-10">
              <Waves color={currentCategory?.color ?? "var(--color-ocean-700)"} size={16} />
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
        </div>

        <CategoryDialog
          openCategoryDialog={openCategoryDialog}
          setOpenCategoryDialog={setOpenCategoryDialog}
          categories={categories}
        />

        <div className="relative flex items-center justify-center">
          <div
            className={`size-72 md:size-80 rounded-full flex items-center justify-center border-[3px] transition-all duration-700 ease-out ${
              isRunning
                ? "border-ocean-500 bg-ocean-500/5 shadow-[0_0_48px_-8px_rgba(4,150,199,0.25)]"
                : hasStarted
                  ? "border-ocean-300 bg-ocean-100/10 opacity-80"
                  : "border-ocean-300/60 bg-gradient-to-b from-ocean-100/8 to-ocean-100/3"
            }`}
            style={!hasStarted ? { animation: "soft-glow 4s ease-in-out infinite" } : undefined}
          >
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs font-medium uppercase tracking-widest text-ocean-700/60 font-original-surfer">
                {statusLabel}
              </p>
              <p className="font-bold text-5xl md:text-6xl tabular-nums text-ocean-700 tracking-tight">
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
          {isRunning && (
            <div className="absolute inset-0 rounded-full border-[3px] border-ocean-500/30 animate-ping [animation-duration:2s] pointer-events-none" />
          )}
        </div>

        <div className="flex items-center justify-center">
          <IfElse
            isTrue={!hasStarted}
            ifBlock={
              <Button
                onClick={start}
                className="flex items-center justify-center rounded-full px-8 h-12 bg-ocean-700 hover:bg-ocean-800 text-sm font-medium gap-2"
              >
                <Play size={16} className="fill-current" />
                Start Your Journey
              </Button>
            }
            elseBlock={
              <div className="flex items-center gap-3">
                <IfElse
                  isTrue={isRunning}
                  ifBlock={
                    <Button
                      onClick={pause}
                      className="rounded-full flex items-center justify-center px-8 h-12 bg-ocean-700 hover:bg-ocean-800 gap-2 text-sm font-medium"
                    >
                      <Pause size={16} />
                      Pause
                    </Button>
                  }
                  elseBlock={
                    <Button
                      onClick={resume}
                      className="rounded-full px-8 h-12 bg-ocean-700 hover:bg-ocean-800 gap-2 text-sm font-medium"
                    >
                      <Play size={16} className="fill-current" />
                      Resume
                    </Button>
                  }
                />
                <Button
                  className="rounded-full h-12 w-12 bg-ocean-700 hover:bg-ocean-800"
                  onClick={stop}
                  size="icon"
                >
                  <Square size={16} className="fill-current" />
                </Button>
              </div>
            }
          />
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="inline-flex items-center rounded-full bg-muted/80 backdrop-blur-sm p-1">
            <button
              onClick={() => switchTimerType(TimerType.TIMER)}
              disabled={isRunning || hasStarted}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200 ${
                timerType === "timer"
                  ? "bg-ocean-700 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Timer
            </button>
            <button
              onClick={() => switchTimerType(TimerType.STOPWATCH)}
              disabled={isRunning || hasStarted}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200 ${
                timerType === "stopwatch"
                  ? "bg-ocean-700 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Stopwatch
            </button>
          </div>

          <div
            className={`flex items-center gap-2 rounded-full bg-muted/60 px-3 py-1.5 transition-opacity duration-200 ${
              timerType === "timer" && !hasStarted
                ? "opacity-100"
                : "invisible"
            }`}
          >
            <span className="text-xs text-muted-foreground mr-1">Duration</span>
            <button
              disabled={isRunning || hasStarted}
              onClick={() => setTime((prev) => Math.max(prev - 5 * 60, 60))}
              className="size-6 rounded-full bg-background flex items-center justify-center hover:bg-ocean-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minus size={12} />
            </button>
            <span className="text-sm font-medium tabular-nums w-10 text-center">
              {time === 0 ? 1 : Math.round(time / 60)}m
            </span>
            <button
              disabled={isRunning || hasStarted}
              onClick={() => setTime((prev) => Math.min(prev + 5 * 60, 600 * 60))}
              className="size-6 rounded-full bg-background flex items-center justify-center hover:bg-ocean-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={12} />
            </button>
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
