import axiosClient from "@/axiosClient";
import { CURRENT_USER, LOGIN } from "@/constants/endpoints";
import type { Login, LoginResponse } from "../types";

export const loginService = async (payload: Login): Promise<LoginResponse> => {
  const { data } = await axiosClient.post(LOGIN, payload);
  return data;
};

export const currentService = async () => {
  const { data } = await axiosClient.get(CURRENT_USER);
  return data;
};
