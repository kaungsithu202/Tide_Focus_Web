import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createCategoryService,
  createSessionService,
  deleteCategoryService,
  deleteSessionService,
  getAllCategoriesService,
  getAllSessionsService,
  sessionActionService,
  updateCategoryService,
} from "../services";
import { categoryKeys } from "./query-keys";
import type { GetAllSessions } from "../types";

export const useGetAllCategories = () =>
  useQuery({
    queryFn: getAllCategoriesService,
    queryKey: [categoryKeys.all],
  });

export const useDeleteCategory = () =>
  useMutation({
    mutationFn: deleteCategoryService,
  });

export const useCreateCategory = () =>
  useMutation({
    mutationFn: createCategoryService,
  });

export const useUpdateCategory = () =>
  useMutation({
    mutationFn: updateCategoryService,
  });

export const useDeleteSession = () =>
  useMutation({
    mutationFn: deleteSessionService,
  });

export const useGetAllSessions = (payload?: GetAllSessions) =>
  useQuery({
    queryKey: ["sessions", payload?.startDate, payload?.endDate],
    queryFn: () => getAllSessionsService(payload),
  });

export const useCreateSession = () =>
  useMutation({
    mutationFn: createSessionService,
  });

export const useSessionAction = () =>
  useMutation({
    mutationFn: sessionActionService,
  });
