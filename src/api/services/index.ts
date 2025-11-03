import axiosClient from "@/axiosClient";
import { LOGOUT, REFRESH_TOKEN } from "@/constants/endpoints";

export const getRefreshTokenService = async (): Promise<{
  accessToken: string;
  refreshToken: string;
}> => {
  return await axiosClient.post(REFRESH_TOKEN);
};

export const getLogoutService = async () => {
  return await axiosClient.post(LOGOUT);
};
