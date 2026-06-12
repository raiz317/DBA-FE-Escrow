import { create } from "zustand";
import { User, LoginInput, RegisterInput } from "@/types";
import { authAPI, setAuthToken, clearAuthToken, setAuthUser, getAuthUser } from "@/lib/auth";

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isInitialized: false,

  login: async (data: LoginInput) => {
    set({ isLoading: true, error: null });
    try {
      const response: any = await authAPI.login(data);

      // Ambil isi 'data' dari response Laravel: { success: true, data: { token, user } }
      const actualData = response.data;

      if (!actualData?.token) {
        throw new Error("Token tidak ditemukan");
      }

      // Ini sekarang akan menyimpan ke LocalStorage DAN Cookie
      setAuthToken(actualData.token);
      setAuthUser(actualData.user);

      set({
        user: actualData.user,
        token: actualData.token,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Email atau password salah",
        isLoading: false
      });
      throw error;
    }
  },

  register: async (data: RegisterInput) => {
    set({ isLoading: true, error: null });
    try {
      const response: any = await authAPI.register(data);

      const tokenData = response?.data?.token || response?.token || response?.data?.access_token;
      const userData = response?.data?.user || response?.user;

      setAuthToken(tokenData);
      setAuthUser(userData);

      set({
        user: userData,
        token: tokenData,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Registration failed";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authAPI.logout().catch(() => { }); // Tetap lanjut meski API logout gagal
    } finally {
      clearAuthToken(); // Hapus localStorage
      set({
        user: null,
        token: null,
        isLoading: false,
      });
      if (typeof window !== "undefined") window.location.href = "/login";
    }
  },

  initialize: async () => {
    if (typeof window === "undefined") {
      set({ isInitialized: true });
      return;
    }

    try {
      const user = getAuthUser();
      const token = localStorage.getItem("auth_token");

      if (user && token) {
        set({ user, token, isInitialized: true });
      } else {
        set({ isInitialized: true });
      }
    } catch (error) {
      set({ isInitialized: true });
    }
  },

  clearError: () => set({ error: null }),
}));
