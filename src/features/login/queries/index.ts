import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { currentService, loginService } from "../services";

export const useLogin = () =>
  useMutation({
    mutationFn: loginService,
  });
