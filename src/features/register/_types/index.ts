export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  id: string;
  accessToken: string;
  refreshToken: string;
}
