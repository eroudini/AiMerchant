"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/lib/types";

type AuthState = {
  accessToken: string | null;
  user: User | null;
  setToken: (t: string | null) => void;
  setUser: (u: User | null) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      setToken: (t) => set({ accessToken: t }),
      setUser: (u) => set({ user: u }),
      logout: () => set({ accessToken: null, user: null }),
    }),
    {
      name: "aim-auth",
      partialize: (state) => ({ accessToken: state.accessToken, user: state.user }),
    }
  )
);
