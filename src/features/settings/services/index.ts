import axiosClient from "@/axiosClient";
import { USER } from "@/constants/endpoints";
import type { User } from "../types";

export const currentService = async (): Promise<User> => {
  const { data } = await axiosClient.get(USER);
  return data;
};
