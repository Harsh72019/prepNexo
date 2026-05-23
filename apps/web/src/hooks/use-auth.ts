"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export function useCurrentUser() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const setSession = useAuthStore((state) => state.setSession);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const clearSession = useAuthStore((state) => state.clearSession);

  return useQuery({
    queryKey: ["auth", "me"],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      try {
        const response = await authApi.me(accessToken!);
        return response.data;
      } catch (error) {
        if (!refreshToken) throw error;
        const refreshed = await authApi.refresh(refreshToken);
        setSession(refreshed.data);
        return refreshed.data.user;
      }
    },
    throwOnError: () => {
      clearSession();
      return false;
    }
  });
}

export function useLogin() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ data }) => {
      setSession(data);
      toast.success("Welcome back. Your arena is ready.");
      router.push("/dashboard");
    },
    onError: (error) => toast.error(error.message)
  });
}

export function useRegister() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: ({ data }) => {
      setSession(data);
      toast.success("Account created. Check your email when you have a moment.");
      router.push("/onboarding");
    },
    onError: (error) => toast.error(error.message)
  });
}
