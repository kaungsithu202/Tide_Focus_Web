import IfElse from "@/components/common/IfElse";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Wave from "@/features/focus/components/Wave";
import WaveForm from "@/features/focus/components/WaveForm";
import {
  useCreateSession,
  useGetAllCategories,
  useGetAllSessions,
  useSessionAction,
} from "@/features/focus/queries";
import { createFileRoute } from "@tanstack/react-router";
import {
  Anchor,
  CircleAlertIcon,
  CircleCheckBig,
  FileWarningIcon,
  HourglassIcon,
  Sailboat,
  Settings,
  SettingsIcon,
  Ship,
  ShipWheel,
  Waves,
  WavesIcon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useRef, useState } from "react";
import { TimerType, type CreateSessionResponse } from "@/features/focus/types";
import useUnsavedChangesWarning from "@/hooks/useUnsavedWarn";
import { toast } from "sonner";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import If from "@/components/common/If";
import { getFocusTime } from "@/lib/datetime";
import CategoryDialog from "@/features/focus/components/CategoryDialog";

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
  const [currentSessionId, setCurrentSessionId] = useState(0);
  const [timerType, setTimerType] = useState("stopwatch");

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useUnsavedChangesWarning(isRunning);
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

  // console.log("sessions", sessions);

  const { data: categories } = useGetAllCategories();

  const { mutate: createSession } = useCreateSession();

  const { mutate: sessionAction } = useSessionAction();

  const currentCategory = categories?.find(
    (category) => category.id === Number(selectedCategoryId)
  );

  const start = () => {
    if (!currentCategory) {
      toast.error("Please select your wave first");
      return;
    }
    if (!isRunning) {
      setIsRunning(true);
      setHasStarted(true);
      createSession(
        {
          categoryId: currentCategory?.id ?? 0,
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
  };

  const resume = () => {
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
  };

  // Pause the timer
  const pause = () => {
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
      // intervalRef.current = null;
      setIsRunning(false);
    }
  };

  // Stop the timer and reset
  const stop = () => {
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
  };

  useEffect(() => {
    if (timerType === "timer" && time <= 0) {
      stop();
    }
  }, [timerType, time]);

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

  return (
    <div className="container w-full ">
      <div className="flex items-center gap-5 justify-end mt-3">
        <div className="flex items-center gap-1.5">
          <HourglassIcon size={18} />
          {getFocusTime(totalFocusTime ?? 0)}
        </div>
        <div className="flex items-center gap-1.5">
          <CircleCheckBig size={18} />
          {sessions?.length}
        </div>
      </div>
      <div className="flex items-center justify-center w-full mt-5">
        <div>
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
            <SelectTrigger className="w-[280px]">
              <Waves color={currentCategory?.color ?? "#000"} />
              <SelectValue placeholder="Add your wave">
                {currentCategory?.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  <Waves color={category?.color ?? "#000"} /> {category.name}
                </SelectItem>
              ))}
              <button
                onClick={() => {
                  setOpenCategoryDialog(true);
                  setIsOpenSelect(false);
                }}
                className="focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2"
              >
                <Settings /> Manage Waves
              </button>
            </SelectContent>
          </Select>
        </div>

        <CategoryDialog
          openCategoryDialog={openCategoryDialog}
          setOpenCategoryDialog={setOpenCategoryDialog}
          categories={categories}
        />
      </div>
      <div className="flex items-center justify-center mt-10">
        <div className=" size-80 rounded-full flex items-center justify-center bg-ocean-100/10">
          <div className="flex flex-col items-center gap-2">
            <p className=" font-medium text-ocean-700">Ride the Wave</p>
            <p className=" font-bold text-6xl  text-ocean-700">
              {formatTime(time)}
            </p>
            <p className=" font-normal text-xs  text-ocean-700">
              <IfElse
                isTrue={timerType === TimerType.STOPWATCH}
                ifBlock="Stopwatch Mode"
                elseBlock="Timer Mode"
              />
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center mt-6">
        <IfElse
          isTrue={!hasStarted}
          ifBlock={
            <Button
              onClick={start}
              className=" flex items-center justify-center rounded-full !px-8 py-6 bg-ocean-700"
            >
              <Ship /> Start Your Journey
            </Button>
          }
          elseBlock={
            <div className="flex items-center gap-3">
              <IfElse
                isTrue={isRunning} // if running, show Pause
                ifBlock={
                  <Button
                    onClick={pause}
                    className=" rounded-full flex items-center justify-center  !px-8 py-6 bg-ocean-700"
                  >
                    <ShipWheel />
                    Pause
                  </Button>
                }
                elseBlock={
                  <Button
                    onClick={resume}
                    className=" rounded-full !px-8 py-6 bg-ocean-700"
                  >
                    <Sailboat />
                    Resume
                  </Button>
                }
              />
              <Tooltip>
                <TooltipTrigger>
                  {" "}
                  <Button
                    className="rounded-full p-6 !px-4 bg-ocean-700"
                    onClick={stop}
                  >
                    <Anchor />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-[10px]">End the current journey</p>
                </TooltipContent>
              </Tooltip>
            </div>
          }
        />
      </div>

      <div className="flex items-center justify-center">
        <Drawer direction="right">
          <DrawerTrigger>
            <Button className="mt-3 bg-ocean-700">
              <SettingsIcon size={16} /> Configure
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Focus Settings</DrawerTitle>
              <DrawerDescription>
                <If
                  isTrue={isRunning}
                  ifBlock={
                    <Alert variant="default" className="flex items-center my-3">
                      <CircleAlertIcon />
                      <AlertDescription className="text-xs">
                        Finish or stop your session first to unlock the
                        settings.
                      </AlertDescription>
                    </Alert>
                  }
                />
              </DrawerDescription>
              <Tabs
                value={timerType}
                onValueChange={(value) => {
                  setTime(value === "stopwatch" ? 0 : 1 * 60);
                  setTimerType(value);
                }}
                defaultValue="timer"
                className="w-full"
              >
                <TabsList className="w-full py-6">
                  <TabsTrigger
                    disabled={isRunning}
                    value="timer"
                    className="p-5 rounded-full"
                  >
                    Timer
                  </TabsTrigger>
                  <TabsTrigger
                    disabled={isRunning}
                    value="stopwatch"
                    className="p-5 rounded-full"
                  >
                    Stopwatch
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="timer">
                  <Field orientation="horizontal" className="my-3">
                    <FieldLabel htmlFor="focusDuration" className="">
                      Focus Duration
                    </FieldLabel>
                    <div className="flex items-center gap-3 border px-3 rounded-md">
                      <button
                        disabled={isRunning}
                        onClick={() =>
                          setTime((prev) => Math.max(prev - 5 * 60, 60))
                        }
                      >
                        -
                      </button>
                      <Input
                        value={time === 0 ? 1 : time / 60}
                        defaultValue={1}
                        disabled={isRunning}
                        type="number"
                        onChange={(e) => {
                          const rawValue = e.target.value;

                          // If input is empty, set default to 1 minute
                          if (rawValue === "" || Number(rawValue) <= 0) {
                            setTime(60); // 1 minute = 60 seconds
                            return;
                          }

                          const value = Number(rawValue);
                          if (!isNaN(value) && value <= 600) {
                            setTime(value * 60); // convert minutes → seconds
                          } else {
                            setTime(600 * 60);
                          }
                        }}
                        className="outline-none border-none ring-0 shadow-none w-12 text-center focus-visible:ring-1 my-1"
                        id="focusDuration"
                        min={1}
                        max={600}
                      />
                      <button
                        disabled={isRunning}
                        onClick={() =>
                          setTime((prev) => Math.min(prev + 5 * 60, 600 * 60))
                        }
                      >
                        +
                      </button>
                    </div>
                  </Field>
                </TabsContent>
                <TabsContent value="stopwatch">
                  {/* <Field orientation="horizontal" className="my-3">
                    <FieldLabel htmlFor="focusDuration" className="">
                      Focus Duration
                    </FieldLabel>
                    <div className="flex items-center gap-3 border px-3 rounded-md">
                      <button>-</button>
                      <Input
                        className="outline-none border-none ring-0 shadow-none w-11 text-center focus-visible:ring-1 my-1"
                        id="focusDuration"
                        autoComplete="off"
                        placeholder="0"
                        max={600}
                      />
                      <button>+</button>
                    </div>
                  </Field> */}
                </TabsContent>
              </Tabs>
            </DrawerHeader>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}
