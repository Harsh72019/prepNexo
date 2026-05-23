"use client";

import type { AuthUser } from "@interview-battlefield/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  setSession: (session: { user: AuthUser; accessToken: string; refreshToken: string }) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setSession: (session) => set(session),
      clearSession: () => set({ user: null, accessToken: null, refreshToken: null })
    }),
    {
      name: "prepnexo-session",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken
      })
    }
  )
);
