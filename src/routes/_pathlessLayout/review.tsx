import IfElse from "@/components/common/IfElse";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useGetAllSessions } from "@/features/focus/queries";
import { TimerType } from "@/features/focus/types";
import { formatTimeHMMA, getFocusTime } from "@/lib/datetime";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  startOfDay,
  endOfDay,
  addDays,
  subDays,
  isSameDay,
  format,
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
    <div className="container-md">
      <div className="flex items-center justify-between my-5">
        <div className="flex items-center gap-5">
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
        <div className="flex items-center gap-6">
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
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <WavesIcon />
              </EmptyMedia>
              <EmptyTitle>No Sessions Yet</EmptyTitle>
              <EmptyDescription>Time to Get Started</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild variant="default">
                <Link to="/focus">Start Focusing</Link>
              </Button>
            </EmptyContent>
          </Empty>
        }
        elseBlock={
          <div className=" grid gap-3">
            {sessions?.map((s) => (
              <Card className="drop-shadow-sm drop-shadow-sky-100">
                <CardContent className="flex items-center justify-between  gap-3">
                  <div className="flex items-center gap-20">
                    <div className="grid place-items-center gap-2">
                      <p className="text-gray-500 text-sm">
                        {getFocusTime(s.elapsedSeconds)}
                      </p>
                      <Badge className="bg-blue-100 text-blue-800">
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

                    <div>
                      <p className="text-lg font-medium">Focused Work</p>
                      <p className="flex items-center gap-3 text-xs text-gray-600">
                        {formatTimeHMMA(s?.startedAt)} -{" "}
                        {formatTimeHMMA(s?.endedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
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
                    <div>
                      <Button variant="ghost" size="icon">
                        <PenIcon size={14} color="#6c757d" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <TrashIcon size={14} color="#6c757d" />
                      </Button>
                    </div>
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
