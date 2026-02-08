export interface SignUpRequest {
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SignUpResponse {
  success: boolean;
  message: string;
  userId?: string;
  token?: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignInResponse {
  success: boolean;
  message: string;
  token?: string;
  userId?: string;
}
