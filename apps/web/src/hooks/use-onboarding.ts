"use client";

import type { OnboardingInput } from "@interview-battlefield/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { onboardingApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export function useOnboardingStatus() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ["onboarding", "status"],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      if (!accessToken) throw new Error("Sign in required");
      const response = await onboardingApi.status(accessToken);
      return response.data;
    }
  });
}

export function useCompleteOnboarding() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (body: OnboardingInput) => {
      if (!accessToken) throw new Error("Sign in required");
      const response = await onboardingApi.complete(accessToken, body);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["onboarding"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      void queryClient.invalidateQueries({ queryKey: ["adaptive"] });
      toast.success("Your adaptive growth plan is ready.");
      router.push("/dashboard");
    },
    onError: (error) => toast.error(error.message)
  });
}
