import axiosClient from "@/axiosClient";
import { FORGOT_PASSWORD, RESET_PASSWORD } from "@/constants/endpoints";
import type {
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
} from "../types";

export const forgotPasswordService = async (
  payload: ForgotPasswordPayload
): Promise<ForgotPasswordResponse> => {
  const { data } = await axiosClient.post(FORGOT_PASSWORD, payload, {
    skipAuthRefresh: true,
  });

  return data;
};

export const resetPasswordService = async (
  payload: ResetPasswordPayload
): Promise<ResetPasswordResponse> => {
  const { data } = await axiosClient.post(RESET_PASSWORD, payload, {
    skipAuthRefresh: true,
  });

  return data;
};
