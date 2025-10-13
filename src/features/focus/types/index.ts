export interface Category {
  id: number;
  userId: number;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategory {
  name: string;
  color: string;
}

export interface SessionPayload {
  categoryId: number;
  type: string;
  durationSeconds?: number;
}

export interface SessionAction {
  sessionId: number;
  payload: SessionPayload;
  action: "pause" | "start" | "complete" | "resume";
}

export interface CreateSessionResponse {
  id: number;
  userId: number;
  categoryId: number;
  type: string;
  durationSeconds: null;
  elapsedSeconds: number;
  totalPausedSeconds: number;
  startedAt: string;
  endedAt: null | string;
  pausedAt: null | string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}
