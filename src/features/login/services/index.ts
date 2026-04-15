import axiosClient from "@/axiosClient";
import { LOGIN, LOGIN_2FA } from "@/constants/endpoints";
import type {
  Login,
  LoginResponse,
  LoginSuccessResponse,
  TwoFaLoginPayload,
} from "../types";

export const loginService = async (payload: Login): Promise<LoginResponse> => {
  const { data } = await axiosClient.post(LOGIN, payload, {
    skipAuthRefresh: true,
  });
  return data;
};

export const twoFaLoginService = async (
  payload: TwoFaLoginPayload
): Promise<LoginSuccessResponse> => {
  const { data } = await axiosClient.post(LOGIN_2FA, payload, {
    skipAuthRefresh: true,
  });
  return data;
};
