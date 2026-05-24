"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { arenaApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export function useTodayArena(mode: "ranked" | "practice") {
  const accessToken = useAuthStore((state) => state.accessToken);
  return useQuery({
    queryKey: ["arena", "today", mode],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      if (!accessToken) throw new Error("Sign in required");
      const response = await arenaApi.today(accessToken, mode);
      return response.data;
    },
  });
}

export function useOverallLeaderboard() {
  const accessToken = useAuthStore((state) => state.accessToken);
  return useQuery({
    queryKey: ["arena", "overall"],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      if (!accessToken) throw new Error("Sign in required");
      const response = await arenaApi.overall(accessToken);
      return response.data;
    },
  });
}

export function useSubmitArenaScore() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      mode: "ranked" | "practice";
      score: number;
      solved: number;
      penalty: number;
    }) => {
      if (!accessToken) throw new Error("Sign in required");
      const response = await arenaApi.submit(accessToken, body);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["arena"] });
      void queryClient.invalidateQueries({ queryKey: ["adaptive"] });
    },
  });
}

export function useJoinArena() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (mode: "ranked" | "practice") => {
      if (!accessToken) throw new Error("Sign in required");
      const response = await arenaApi.join(accessToken, mode);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["arena"] });
      void queryClient.invalidateQueries({ queryKey: ["billing", "status"] });
    },
  });
}
