import { create } from "zustand";

interface AuthState {
  accessToken: string | null;
  setAccessToken: (token: string) => void;
}

export const useAuth = create<AuthState>((set) => ({
  accessToken: null,
  setAccessToken: (token: string) => set(() => ({ accessToken: token })),
}));

export const authGetter = () => useAuth.getState().accessToken;

export const authSetter = (payload: string | null) =>
  useAuth.setState({ accessToken: payload });
