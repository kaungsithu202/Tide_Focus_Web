import IfElse from "@/components/common/IfElse";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGetAllSessions } from "@/features/focus/queries";
import { TimerType } from "@/features/focus/types";
import { formatTimeHMMA, getFocusTime } from "@/lib/datetime";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  addDays,
  endOfDay,
  format,
  isSameDay,
  startOfDay,
  subDays,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  CircleCheckBigIcon,
  Clock4Icon,
  HourglassIcon,
  PenIcon,
  TimerIcon,
  TrashIcon,
  WavesIcon,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_pathlessLayout/review")({
  component: RouteComponent,
});

function RouteComponent() {
  const [date, setDate] = useState(new Date()); // use native Date instead of dayjs

  const startDate = startOfDay(date).toISOString();
  const endDate = endOfDay(date).toISOString();

  const { data: sessions } = useGetAllSessions({ startDate, endDate });

  const handleNext = () => setDate((prev) => addDays(prev, 1));
  const handlePrev = () => setDate((prev) => subDays(prev, 1));

  const today = new Date();
  const isYesterday = isSameDay(date, subDays(today, 1));
  const isToday = isSameDay(date, today);

  const totalFocusTime = sessions?.reduce(
    (acc, curr) => acc + curr.elapsedSeconds,
    0
  );

  return (
    <div className="container md:container-md">
      <div className="flex flex-col gap-5 md:gap-0 md:flex-row items-start md:items-center justify-between my-0 md:my-3">
        <div className="flex items-center gap-2 md:gap-5">
          <Button variant="ghost" size="icon" onClick={handlePrev}>
            <ChevronLeft strokeWidth={2} />
          </Button>
          <span className="font-semibold text-xl">
            {format(date, "MMM d, yyyy")}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            disabled={isToday}
          >
            <ChevronRight strokeWidth={2} />
          </Button>

          <IfElse
            isTrue={!isToday && !isYesterday}
            ifBlock={null}
            elseBlock={
              <Badge
                variant="secondary"
                className="bg-blue-100 text-[10px] text-blue-800"
              >
                <IfElse
                  isTrue={isToday}
                  ifBlock="Today"
                  elseBlock="Yesterday"
                />
              </Badge>
            }
          />
        </div>
        <div className="flex items-center  pl-3 md:pl-0 gap-8 md:gap-6">
          <div className="flex items-center gap-3">
            <HourglassIcon size={18} />
            <div>
              <p className="text-[11px] text-gray-500">Focus Time</p>
              <p className="text-xs font-medium">
                {getFocusTime(totalFocusTime ?? 0)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CircleCheckBigIcon size={18} />
            <div>
              <p className="text-[11px] text-gray-500">Sessions</p>
              <p className="text-xs font-medium">{sessions?.length}</p>
            </div>
          </div>
        </div>
      </div>

      <IfElse
        isTrue={sessions?.length === 0}
        ifBlock={
          <Empty className="my-10 md:my-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <WavesIcon />
              </EmptyMedia>
              <EmptyTitle className="text-base md:text-lg">
                No Sessions Yet
              </EmptyTitle>
              <EmptyDescription className="text-xs md:text-sm">
                Time to Get Started
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild variant="default" className="text-xs md:text-sm">
                <Link to="/focus">Start Focusing</Link>
              </Button>
            </EmptyContent>
          </Empty>
        }
        elseBlock={
          <div className=" grid gap-3 my-10 md:my-5">
            {sessions?.map((s) => (
              <Card className="drop-shadow-sm w-full drop-shadow-sky-100">
                <CardContent className="flex items-center justify-between  gap-3 px-1 md:px-6">
                  <div className="flex items-start md:items-center gap-5 md:gap-20">
                    <div className="grid place-items-center gap-2">
                      <p className="text-gray-500 text-xs md:text-sm">
                        {getFocusTime(s.elapsedSeconds)}
                      </p>
                      <Badge className="bg-blue-100 text-blue-800 text-xs md:text-sm">
                        <span>Focus</span>
                      </Badge>
                      <IfElse
                        isTrue={s.type === TimerType.TIMER}
                        ifBlock={
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <TimerIcon size={14} color="#6c757d" />
                            </TooltipTrigger>
                            <TooltipContent className="text-[10px]">
                              <p>Timer Mode</p>
                            </TooltipContent>
                          </Tooltip>
                        }
                        elseBlock={
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Clock4Icon size={14} color="#6c757d" />
                            </TooltipTrigger>
                            <TooltipContent className="text-[10px]">
                              <p>Stopwatch Mode</p>
                            </TooltipContent>
                          </Tooltip>
                        }
                      />
                    </div>

                    <div className="grid gap-2">
                      <p className="text-xs md:text-lg font-medium">
                        Focused Work
                      </p>
                      <p className="flex items-center gap-3 text-xs text-gray-600">
                        {formatTimeHMMA(s?.startedAt)} -{" "}
                        {formatTimeHMMA(s?.endedAt)}
                      </p>
                      <Badge
                        style={{
                          backgroundColor: `${s.category.color}1A`,
                          color: s.category.color,
                        }}
                      >
                        <div
                          className="size-2 rounded-full"
                          style={{ backgroundColor: s.category.color }}
                        />
                        <span>{s.category.name}</span>
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row items-center gap-3">
                    <Button
                      variant="ghost"
                      className="size-8 md:size-10 !p-1 md:p-3"
                    >
                      <PenIcon color="#6c757d" size={5} />
                    </Button>
                    <Button
                      variant="ghost"
                      className="size-8 md:size-10 !p-1 md:p-3"
                    >
                      <TrashIcon color="#6c757d" size={5} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        }
      />
    </div>
  );
}
