import { create } from "zustand";
import { AuthState } from "../types/auth.types";

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  setAuth: (data) => set({ token: data.token, user: data.user }),
  clearAuth: () => set({ token: null, user: null }),
}));
