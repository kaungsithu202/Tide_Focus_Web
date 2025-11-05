import axiosClient from "@/axiosClient";
import { REGISTER } from "@/constants/endpoints";
import type { RegisterPayload } from "../../_types";

export const registerService = async (
  payload: RegisterPayload
): Promise<any> => {
  const { data } = await axiosClient.post(REGISTER, payload);
  return data;
};
