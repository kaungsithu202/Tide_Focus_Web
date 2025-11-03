import type { Session } from "@/features/focus/types";

export const getTotalElapsedSeconds = (sessions: Session[]) => {
  return sessions.reduce((acc, curr) => acc + curr.elapsedSeconds, 0);
};
