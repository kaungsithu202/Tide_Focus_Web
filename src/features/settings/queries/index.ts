import { useMutation, useQuery } from "@tanstack/react-query";
import {
  currentService,
  disableTwoFaService,
  generateTwoFaService,
  validateTwoFaService,
} from "../services";

export const useGetUser = () =>
  useQuery({
    queryFn: currentService,
    queryKey: ["user"],
  });

export const useGenerateTwoFa = () =>
  useMutation({
    mutationFn: generateTwoFaService,
  });

export const useValidateTwoFa = () =>
  useMutation({
    mutationFn: validateTwoFaService,
  });

export const useDisableTwoFa = () =>
  useMutation({
    mutationFn: disableTwoFaService,
  });
