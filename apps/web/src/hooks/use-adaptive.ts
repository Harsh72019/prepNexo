"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { adaptiveApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export function useGrowthProfile() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (!accessToken) router.replace("/login");
  }, [accessToken, router]);

  return useQuery({
    queryKey: ["adaptive", "growth-profile"],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      if (!accessToken) throw new Error("Sign in required");
      const response = await adaptiveApi.growthProfile(accessToken);
      return response.data;
    }
  });
}

export function usePressurePrompt() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useMutation({
    mutationFn: async (body: { sessionId?: string; surface?: string; topic?: string }) => {
      if (!accessToken) throw new Error("Sign in required");
      const response = await adaptiveApi.pressure(accessToken, body);
      return response.data;
    }
  });
}
