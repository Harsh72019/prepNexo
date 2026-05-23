"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { dashboardApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export function useDashboardSummary() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (!accessToken) router.replace("/login");
  }, [accessToken, router]);

  return useQuery({
    queryKey: ["dashboard", "summary"],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      if (!accessToken) {
        router.replace("/login");
        throw new Error("Sign in required");
      }

      const response = await dashboardApi.summary(accessToken);
      return response.data;
    }
  });
}
