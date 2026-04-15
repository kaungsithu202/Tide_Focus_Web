import { useMutation } from "@tanstack/react-query";
import { loginService, twoFaLoginService } from "../services";

export const useLogin = () =>
  useMutation({
    mutationFn: loginService,
  });

export const useTwoFaLogin = () =>
  useMutation({
    mutationFn: twoFaLoginService,
  });
