export interface Login {
  email: string;
  password: string;
}

export interface TwoFaLoginPayload {
  tempToken: string;
  totp: string;
}

export interface LoginSuccessResponse {
  id: string;
  name: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  twoFaEnable: boolean;
}

export interface LoginChallengeResponse {
  tempToken: string;
  expiresInSeconds: number;
}

export type LoginResponse = LoginSuccessResponse | LoginChallengeResponse;
