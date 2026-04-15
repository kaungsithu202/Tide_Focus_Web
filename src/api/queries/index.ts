import { useMutation, useQuery } from "@tanstack/react-query";
import { getLogoutService, getRefreshTokenService } from "../services";
import { toast } from "sonner";
import { authSetter } from "@/store";

export const useGetRefreshToken = () => {
  return useQuery({
    queryKey: ["refresh-token"],
    queryFn: getRefreshTokenService,
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: getLogoutService,
    onSuccess: () => {
      authSetter(null);
      window.location.href = "/";
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
};
