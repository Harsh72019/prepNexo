"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { practiceApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export function usePracticeCatalog() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ["practice", "catalog"],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const response = await practiceApi.catalog(accessToken!);
      return response.data;
    },
  });
}

export function useQuestionLibrary(params: {
  page?: number;
  pageSize?: number;
  q?: string;
  type?: string;
  difficulty?: string;
  topic?: string;
  company?: string;
  companyTag?: string;
  progress?: string;
}) {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ["practice", "questions", params],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const response = await practiceApi.questions(accessToken!, params);
      return response.data;
    },
  });
}

export function usePracticeQuestion(id?: string) {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ["practice", "question", id],
    enabled: Boolean(accessToken && id),
    queryFn: async () => {
      const response = await practiceApi.question(accessToken!, id!);
      return response.data;
    },
  });
}

export function useSubmitAttempt() {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);

  return useMutation({
    mutationFn: async (
      body: Parameters<typeof practiceApi.submitAttempt>[1],
    ) => {
      if (!accessToken) throw new Error("Sign in required");
      return practiceApi.submitAttempt(accessToken, body);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      void queryClient.invalidateQueries({ queryKey: ["practice"] });
      void queryClient.invalidateQueries({ queryKey: ["adaptive"] });
      toast.success("Attempt saved. Dashboard and analytics updated.");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useRunCode() {
  return useMutation({
    mutationFn: practiceApi.runCode,
    onError: (error) => toast.error(error.message),
  });
}
