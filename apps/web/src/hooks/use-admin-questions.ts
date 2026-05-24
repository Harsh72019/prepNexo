"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { practiceApi, type QuestionAdminInput } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export function useAdminQuestions() {
  const accessToken = useAuthStore((state) => state.accessToken);
  return useQuery({
    queryKey: ["admin", "questions"],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      if (!accessToken) throw new Error("Sign in required");
      const response = await practiceApi.adminQuestions(accessToken);
      return response.data;
    }
  });
}

export function useSaveAdminQuestion() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: QuestionAdminInput) => {
      if (!accessToken) throw new Error("Sign in required");
      const response = await practiceApi.saveAdminQuestion(accessToken, body);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Question saved to the bank.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "questions"] });
      void queryClient.invalidateQueries({ queryKey: ["practice", "catalog"] });
    },
    onError: (error) => toast.error(error.message)
  });
}
