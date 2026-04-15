import { useMutation } from "@tanstack/react-query";
import {
  forgotPasswordService,
  resetPasswordService,
} from "../services";

export const useForgotPassword = () =>
  useMutation({
    mutationFn: forgotPasswordService,
  });

export const useResetPassword = () =>
  useMutation({
    mutationFn: resetPasswordService,
  });
