"use client";

import type { BillingPlanDto } from "@interview-battlefield/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { billingApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export function useBillingPlans() {
  return useQuery({
    queryKey: ["billing", "plans"],
    queryFn: async () => {
      const response = await billingApi.plans();
      return response.data;
    }
  });
}

export function useBillingStatus() {
  const accessToken = useAuthStore((state) => state.accessToken);
  return useQuery({
    queryKey: ["billing", "status"],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      if (!accessToken) throw new Error("Sign in required");
      const response = await billingApi.status(accessToken);
      return response.data;
    }
  });
}

export function useCreateCheckoutOrder() {
  const accessToken = useAuthStore((state) => state.accessToken);
  return useMutation({
    mutationFn: async (planCode: string) => {
      if (!accessToken) throw new Error("Sign in required");
      const response = await billingApi.checkoutOrder(accessToken, planCode);
      return response.data;
    },
    onError: (error) => toast.error(error.message)
  });
}

export function useVerifyPayment() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
      if (!accessToken) throw new Error("Sign in required");
      const response = await billingApi.verify(accessToken, body);
      return response.data;
    },
    onSuccess: () => {
      toast.success("PrepNexo Pro is active.");
      void queryClient.invalidateQueries({ queryKey: ["billing", "status"] });
    },
    onError: (error) => toast.error(error.message)
  });
}

export function useAdminBillingPlans() {
  const accessToken = useAuthStore((state) => state.accessToken);
  return useQuery({
    queryKey: ["admin", "billing", "plans"],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      if (!accessToken) throw new Error("Sign in required");
      const response = await billingApi.adminPlans(accessToken);
      return response.data;
    }
  });
}

export function useSaveAdminBillingPlan() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: Omit<BillingPlanDto, "id">) => {
      if (!accessToken) throw new Error("Sign in required");
      const response = await billingApi.saveAdminPlan(accessToken, body);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Plan updated.");
      void queryClient.invalidateQueries({ queryKey: ["billing", "plans"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "billing", "plans"] });
    },
    onError: (error) => toast.error(error.message)
  });
}
