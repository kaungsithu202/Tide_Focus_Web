import axiosClient from "@/axiosClient";
import { LOGOUT, REFRESH_TOKEN } from "@/constants/endpoints";

export const getRefreshTokenService = async (): Promise<{
  accessToken: string;
  refreshToken: string;
}> => {
  const { data } = await axiosClient.post(REFRESH_TOKEN, undefined, {
    skipAuthRefresh: true,
  });

  return data;
};

export const getLogoutService = async () => {
  return await axiosClient.post(LOGOUT);
};
