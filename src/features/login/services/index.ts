import axiosClient from "@/axiosClient";
import { LOGIN } from "@/constants/endpoints";
import type { Login, LoginResponse } from "../types";

export const loginService = async (payload: Login): Promise<LoginResponse> => {
  const { data } = await axiosClient.post(LOGIN, payload);
  return data;
};
