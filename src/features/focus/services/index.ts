import axiosClient from "@/axiosClient";
import { CATEGORIES, SESSIONS } from "@/constants/endpoints";
import type {
  Category,
  CreateCategory,
  CreateSessionResponse,
  GetAllSessions,
  Session,
  SessionAction,
  SessionPayload,
} from "../types";

export const getAllCategoriesService = async (): Promise<Category[]> => {
  const { data } = await axiosClient.get(CATEGORIES);
  return data;
};

export const deleteCategoryService = async (id: number): Promise<any> => {
  const { data } = await axiosClient.delete(`${CATEGORIES}/${id}`);
  return data;
};

export const createCategoryService = async (
  payload: CreateCategory
): Promise<any> => {
  const { data } = await axiosClient.post(CATEGORIES, payload);
  return data;
};

export const createSessionService = async (
  payload: SessionPayload
): Promise<CreateSessionResponse> => {
  const { data } = await axiosClient.post(SESSIONS, payload);
  return data;
};

export const getAllSessionsService = async ({
  startDate,
  endDate,
}: GetAllSessions): Promise<Session[]> => {
  const { data } = await axiosClient.get(SESSIONS, {
    params: {
      startDate,
      endDate,
    },
  });
  return data;
};

export const sessionActionService = async ({
  sessionId,
  payload,
  action,
}: SessionAction): Promise<any> => {
  const { data } = await axiosClient.post(
    `${SESSIONS}/${sessionId}/${action}`,
    payload
  );
  return data;
};
