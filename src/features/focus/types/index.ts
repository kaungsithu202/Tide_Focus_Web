export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export enum TimerType {
  TIMER = "timer",
  STOPWATCH = "stopwatch",
}
export interface CreateCategory {
  name: string;
  color: string;
}

export interface UpdateCategory extends CreateCategory {
  id: string;
}

export interface SessionPayload {
  categoryId: string;
  type: TimerType;
  durationSeconds?: number;
}

export interface SessionAction {
  sessionId: string;
  payload: SessionPayload;
  action: "pause" | "start" | "complete" | "resume";
}

export interface CreateSessionResponse {
  id: string;
  userId: string;
  categoryId: string;
  type: TimerType;
  durationSeconds: number | null;
  elapsedSeconds: number;
  totalPausedSeconds: number;
  startedAt: string;
  endedAt: null | string;
  pausedAt: null | string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetAllSessions {
  startDate?: string;
  endDate?: string;
}

interface SessionCategory {
  name: string;
  id: string;
  color: string;
}

export interface Session {
  id: string;
  startedAt: string;
  endedAt: string;
  elapsedSeconds: number;
  isCompleted: boolean;
  type: TimerType;
  category: SessionCategory;
}
