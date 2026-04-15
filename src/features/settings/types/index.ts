export interface User {
  id: string;
  name: string;
  email: string;
  twoFaEnable: boolean;
}

export interface ValidateTwoFaPayload {
  totp: string;
}

export interface DisableTwoFaPayload {
  currentPassword: string;
  totp: string;
}

export interface MutationMessageResponse {
  message: string;
}
