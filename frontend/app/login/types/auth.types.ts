export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface AuthState {
  token: string | null;
  user: LoginResponse["user"] | null;
  setAuth: (data: LoginResponse) => void;
  clearAuth: () => void;
}
