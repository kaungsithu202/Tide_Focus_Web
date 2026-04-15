import axiosClient from "@/axiosClient";
import { REGISTER } from "@/constants/endpoints";
import type { RegisterPayload, RegisterResponse } from "../../_types";

export const registerService = async (
  payload: RegisterPayload
): Promise<RegisterResponse> => {
  const { data } = await axiosClient.post(REGISTER, payload);
  return data;
};
