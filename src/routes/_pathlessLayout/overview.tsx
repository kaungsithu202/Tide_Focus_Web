import IconBg from "@/components/common/IconBg";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useGetAllSessions } from "@/features/focus/queries";
import { getFocusTime } from "@/lib/datetime";
import { createFileRoute } from "@tanstack/react-router";
import {
  endOfDay,
  endOfMonth,
  format,
  parseISO,
  startOfDay,
  startOfMonth,
} from "date-fns";
import { CalendarIcon, CheckCircle, HourglassIcon } from "lucide-react";
import { useState } from "react";
import { getTotalElapsedSeconds } from "@/lib/totalFousTime";
export const Route = createFileRoute("/_pathlessLayout/overview")({
  component: RouteComponent,
});

function RouteComponent() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const currentDate = new Date();
  const formattedDate = format(currentDate, "EEEE, MMMM d");

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const formattedMonth = format(currentMonth, "MMMM");

  const startDate = startOfDay(currentDate).toISOString();
  const endDate = endOfDay(currentDate).toISOString();

  const { data: sessions } = useGetAllSessions({ startDate, endDate });

  const { data: sessionsByMonth } = useGetAllSessions({
    startDate: monthStart.toISOString(),
    endDate: monthEnd.toISOString(),
  });

  const { data: sessionsByUser } = useGetAllSessions();

  const totalFocusedDays = new Set(
    sessionsByUser?.map((s) => format(parseISO(s.startedAt), "yyyy-MM-dd"))
  ).size;

  return (
    <div className="container md:container-md my-5 grid grid-cols-1 md:grid-cols-[40%_60%] gap-5">
      <Card>
        <CardHeader>
          <CardTitle className="font-bold">Today Focus</CardTitle>
          <CardDescription className="text-xs">{formattedDate}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-2">
          <Card className="w-1/2 py-4 !gap-1 bg-sky-50 ">
            <CardHeader>
              <CardTitle className="flex flex-col items-center justify-center text-xs gap-2 text-sky-800">
                <IconBg className="bg-sky-100">
                  <HourglassIcon size={14} />
                </IconBg>
                Focus Time
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center font-bold text-sky-700">
              {getFocusTime(getTotalElapsedSeconds(sessions ?? []))}
            </CardContent>
          </Card>
          <Card className="w-1/2 py-4 !gap-1 bg-sky-50 ">
            <CardHeader>
              <CardTitle className="flex flex-col items-center justify-center gap-2 text-xs text-sky-800">
                <IconBg className="bg-sky-100">
                  <CheckCircle size={14} />
                </IconBg>
                Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center font-bold text-sky-700">
              {sessions?.length}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
      <Calendar
        sessions={sessionsByMonth ?? []}
        mode="single"
        selected={new Date()}
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        className="rounded-lg border w-full h-full row-span-2"
      />
      <Card>
        <CardHeader>
          <CardTitle className="font-bold">{formattedMonth}'s Focus</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-2">
          <Card className="w-1/2 py-4 !gap-1 bg-sky-50 ">
            <CardHeader>
              <CardTitle className="flex flex-col items-center justify-center text-xs gap-2 text-sky-800">
                <IconBg className="bg-sky-100">
                  <HourglassIcon size={14} />
                </IconBg>
                Focus Time
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center font-bold text-sky-700">
              {getFocusTime(getTotalElapsedSeconds(sessionsByMonth ?? []))}
            </CardContent>
          </Card>
          <Card className="w-1/2 py-4 !gap-1 bg-sky-50 ">
            <CardHeader>
              <CardTitle className="flex flex-col items-center justify-center gap-2 text-xs text-sky-800">
                <IconBg className="bg-sky-100">
                  <CheckCircle size={14} />
                </IconBg>
                Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center font-bold text-sky-700">
              {sessionsByMonth?.length}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="font-bold">Lifetime Focus</CardTitle>
          <CardDescription className="text-xs">{formattedDate}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center gap-2 px-3 md:px-6">
          <Card className="w-full md:w-1/2 !gap-1 py-4 bg-sky-50">
            <CardHeader>
              <CardTitle className="flex flex-col items-center justify-center text-xs gap-2 text-sky-800">
                <IconBg className="bg-sky-100">
                  <HourglassIcon size={14} />
                </IconBg>
                Total Focus Time
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center font-bold text-sky-700">
              {getFocusTime(getTotalElapsedSeconds(sessionsByUser ?? []))}
            </CardContent>
          </Card>
          <Card className="w-full md:w-1/2 !gap-1 py-4 bg-violet-50">
            <CardHeader>
              <CardTitle className="flex flex-col items-center justify-center gap-2 text-xs text-sky-800">
                <IconBg className="bg-violet-100">
                  <CheckCircle size={14} />
                </IconBg>
                Total Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center font-bold text-sky-700">
              {sessionsByUser?.length}
            </CardContent>
          </Card>
          <Card className="w-full md:w-1/2 !gap-1 py-4 bg-indigo-50">
            <CardHeader>
              <CardTitle className="flex flex-col items-center justify-center gap-2 text-xs text-sky-800">
                <IconBg className="bg-indigo-100">
                  <CalendarIcon size={14} />
                </IconBg>
                Total Focus Days
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center font-bold text-sky-700">
              {totalFocusedDays}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
