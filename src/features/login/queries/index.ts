import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { currentService, loginService } from "../services";

export const useLogin = () =>
  useMutation({
    mutationFn: loginService,
  });

export const useGetCurrentUser = () =>
  useQuery({
    queryFn: currentService,
    queryKey: ["current"],
  });
