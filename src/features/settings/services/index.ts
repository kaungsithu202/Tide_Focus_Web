import axiosClient from "@/axiosClient";
import {
  DISABLE_2FA,
  GENERATE_2FA,
  USER,
  VALIDATE_2FA,
} from "@/constants/endpoints";
import type {
  DisableTwoFaPayload,
  MutationMessageResponse,
  User,
  ValidateTwoFaPayload,
} from "../types";

export const currentService = async (): Promise<User> => {
  const { data } = await axiosClient.get(USER);
  return data;
};

export const generateTwoFaService = async (): Promise<Blob> => {
  const { data } = await axiosClient.post(GENERATE_2FA, undefined, {
    responseType: "blob",
  });

  return data;
};

export const validateTwoFaService = async (
  payload: ValidateTwoFaPayload
): Promise<MutationMessageResponse> => {
  const { data } = await axiosClient.post(VALIDATE_2FA, payload);
  return data;
};

export const disableTwoFaService = async (
  payload: DisableTwoFaPayload
): Promise<MutationMessageResponse> => {
  const { data } = await axiosClient.post(DISABLE_2FA, payload);
  return data;
};
