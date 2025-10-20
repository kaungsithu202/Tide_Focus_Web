import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createCategoryService,
  createSessionService,
  deleteCategoryService,
  getAllCategoriesService,
  getAllSessionsService,
  sessionActionService,
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

export const useGetAllSessions = ({ startDate, endDate }: GetAllSessions) =>
  useQuery({
    queryKey: ["sessions", startDate, endDate],
    queryFn: () => getAllSessionsService({ startDate, endDate }),
  });

export const useCreateSession = () =>
  useMutation({
    mutationFn: createSessionService,
  });

export const useSessionAction = () =>
  useMutation({
    mutationFn: sessionActionService,
  });
