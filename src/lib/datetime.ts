import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import advancedFormat from "dayjs/plugin/advancedFormat";

dayjs.extend(advancedFormat);
dayjs.extend(duration);

export function getFocusTime(elapsedSeconds: number) {
  const dur = dayjs.duration(elapsedSeconds, "seconds");

  const parts: string[] = [];

  const hours = Math.floor(dur.asHours());
  const minutes = dur.minutes();
  const seconds = dur.seconds();

  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

  return parts.join(" ");
}

export function formatTimeHMMA(time: string) {
  return dayjs(time).format("h:mm A");
}
