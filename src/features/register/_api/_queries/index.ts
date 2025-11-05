import { useMutation } from "@tanstack/react-query";
import { registerService } from "../_services";

export const useRegister = () =>
  useMutation({
    mutationFn: registerService,
  });
