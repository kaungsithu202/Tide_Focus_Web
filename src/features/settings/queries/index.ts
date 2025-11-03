import { useQuery } from "@tanstack/react-query";
import { currentService } from "../services";

export const useGetUser = () =>
  useQuery({
    queryFn: currentService,
    queryKey: ["user"],
  });
