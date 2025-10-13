import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createCategoryService,
  createSessionService,
  deleteCategoryService,
  getAllCategoriesService,
  sessionActionService,
} from "../services";
import { categoryKeys } from "./query-keys";

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

export const useCreateSession = () =>
  useMutation({
    mutationFn: createSessionService,
  });

export const useSessionAction = () =>
  useMutation({
    mutationFn: sessionActionService,
  });
