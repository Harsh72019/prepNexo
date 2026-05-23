"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { aiApi } from "@/lib/api";

function reportError(error: Error) {
  toast.error(error.message);
}

export function useInterviewerReply() {
  return useMutation({
    mutationFn: aiApi.interviewer,
    onError: reportError
  });
}

export function useCodeFeedback() {
  return useMutation({
    mutationFn: aiApi.codeFeedback,
    onError: reportError
  });
}

export function useSystemDesignFeedback() {
  return useMutation({
    mutationFn: aiApi.systemDesignFeedback,
    onError: reportError
  });
}

export function useRoadmapGeneration() {
  return useMutation({
    mutationFn: aiApi.roadmap,
    onError: reportError
  });
}
