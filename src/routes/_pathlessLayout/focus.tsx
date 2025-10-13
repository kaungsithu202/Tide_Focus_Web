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
  useSessionAction,
} from "@/features/focus/queries";
import { createFileRoute } from "@tanstack/react-router";
import {
  Anchor,
  Sailboat,
  Settings,
  Ship,
  ShipWheel,
  Waves,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useRef, useState } from "react";
import type { CreateSessionResponse } from "@/features/focus/types";
import useUnsavedChangesWarning from "@/hooks/useUnsavedWarn";
import { toast } from "sonner";

export const Route = createFileRoute("/_pathlessLayout/focus")({
  component: RouteComponent,
});

function RouteComponent() {
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [openSelect, setIsOpenSelect] = useState(false);
  const [time, setTime] = useState(0); // time in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useUnsavedChangesWarning(true);

  // const { data } = useGetCurrentUser();

  const { data: categories } = useGetAllCategories();

  const { mutate: createSession } = useCreateSession();

  const { mutate: sessionAction } = useSessionAction();

  const currentCategory = categories?.find(
    (category) => category.id === Number(selectedCategoryId)
  );

  const start = () => {
    if (!currentCategory) {
      toast.error("Please select your wave first.");
      return;
    }
    if (!isRunning) {
      setIsRunning(true);
      setHasStarted(true);
      createSession(
        { categoryId: currentCategory.id, type: "stopwatch" },
        {
          onSuccess: (res: CreateSessionResponse) => {
            setCurrentSessionId(res.id);
          },
        }
      );
      intervalRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
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
          type: "stopwatch",
          durationSeconds: time,
        },
      });
      intervalRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
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
          type: "stopwatch",
          durationSeconds: time,
        },
      });
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsRunning(false);
    }
  };

  // Stop the timer and reset
  const stop = () => {
    if (intervalRef.current && currentCategory) {
      clearInterval(intervalRef.current);
      sessionAction({
        action: "complete",
        sessionId: currentSessionId,
        payload: {
          categoryId: currentCategory.id,
          type: "stopwatch",
          durationSeconds: time,
        },
      });
      intervalRef.current = null;
    }
    setIsRunning(false);
    setHasStarted(false);
    setTime(0);
  };

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
    <div className="container w-full">
      <div className="flex items-center justify-center w-full">
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

        <Dialog open={openCategoryDialog} onOpenChange={setOpenCategoryDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Waves size={18} />
                Manage Waves
              </DialogTitle>
              <DialogDescription className="my-2 text-sm">
                Waves help you organize focus sessions by topic or project and
                track time by each wave in Analytics.
              </DialogDescription>
            </DialogHeader>

            <div className="flex gap-3">
              <div className="w-[60%] text-xs bg-gray-50 p-2 rounded-md h-80">
                <h2 className="font-medium mb-3">Current Waves</h2>
                <IfElse
                  isTrue={!!categories?.length}
                  ifBlock={
                    <div className="grid gap-1">
                      {categories?.map((category) => (
                        <Wave key={category.id} {...category} />
                      ))}
                    </div>
                  }
                  elseBlock={
                    <div className="flex items-center justify-center py-10 px-3 border border-dotted rounded-lg bg-white text-gray-400">
                      <p>No waves yet.</p>
                    </div>
                  }
                />
              </div>
              <div className="w-full">
                <Tabs defaultValue="add">
                  <TabsList>
                    <TabsTrigger value="add" className="text-xs">
                      Add Wave
                    </TabsTrigger>
                    <TabsTrigger value="edit" className="text-xs">
                      Edit Wave
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="add">
                    <WaveForm />
                  </TabsContent>
                  <TabsContent value="edit">
                    Change your password here.
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex items-center justify-center mt-10">
        <div
          className=" size-80 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: currentCategory?.color
              ? `${currentCategory?.color}1A`
              : "#0000001A",
          }}
        >
          <div className="flex flex-col items-center gap-2">
            <p
              className=" font-medium"
              style={{ color: currentCategory?.color }}
            >
              Ride the Wave
            </p>
            <p
              className=" font-bold text-6xl"
              style={{ color: currentCategory?.color }}
            >
              {formatTime(time)}
            </p>
            <p
              className=" font-normal text-xs"
              style={{ color: currentCategory?.color }}
            >
              Stopwatch Mode
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
              className=" flex items-center justify-center rounded-full !px-8 py-6"
              style={{ backgroundColor: currentCategory?.color }}
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
                    className=" rounded-full flex items-center justify-center  !px-8 py-6"
                    style={{ backgroundColor: currentCategory?.color }}
                  >
                    <ShipWheel />
                    Pause
                  </Button>
                }
                elseBlock={
                  <Button
                    onClick={resume}
                    className=" rounded-full !px-8 py-6"
                    style={{ backgroundColor: currentCategory?.color }}
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
                    className="rounded-full p-6 !px-4"
                    style={{ backgroundColor: currentCategory?.color }}
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
    </div>
  );
}
