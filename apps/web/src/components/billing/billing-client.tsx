"use client";

import type { RazorpayCheckoutOrder } from "@interview-battlefield/types";
import { Button } from "@interview-battlefield/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@interview-battlefield/ui/components/card";
import { cn } from "@interview-battlefield/ui/lib/utils";
import { Check, Crown, Loader2, Sparkles, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useBillingPlans,
  useBillingStatus,
  useCreateCheckoutOrder,
  useVerifyPayment,
} from "@/hooks/use-billing";

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
  };
  theme: {
    color: string;
  };
  handler: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  modal: {
    ondismiss: () => void;
  };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

function formatAmount(amountPaise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amountPaise / 100);
}

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function BillingClient() {
  const plans = useBillingPlans();
  const status = useBillingStatus();
  const createOrder = useCreateCheckoutOrder();
  const verifyPayment = useVerifyPayment();
  const [activePlanCode, setActivePlanCode] = useState<string | null>(null);
  const proPlan = plans.data?.find((plan) => plan.amountPaise > 0);

  async function startCheckout(planCode: string) {
    setActivePlanCode(planCode);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay)
        throw new Error(
          "Razorpay checkout could not load. Try again in a moment.",
        );

      const order: RazorpayCheckoutOrder =
        await createOrder.mutateAsync(planCode);
      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amountPaise,
        currency: order.currency,
        name: "PrepNexo",
        description: order.name,
        order_id: order.orderId,
        prefill: order.prefill,
        theme: { color: "#e11d48" },
        handler: (response) => void verifyPayment.mutateAsync(response),
        modal: {
          ondismiss: () => setActivePlanCode(null),
        },
      });
      checkout.open();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Payment could not be started",
      );
    } finally {
      setActivePlanCode(null);
    }
  }

  return (
    <div className="grid gap-5">
      <section className="overflow-hidden rounded-lg border bg-card/86 shadow-[0_18px_60px_rgb(0_0_0/0.18)]">
        <div className="grid gap-6 p-5 md:grid-cols-[1fr_340px] md:p-7">
          <div className="grid content-center gap-4">
            <div className="flex w-fit items-center gap-2 rounded-md border bg-background/70 px-3 py-2 text-sm font-semibold text-primary">
              <Sparkles className="size-4" />
              Simple founder-friendly monetization
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-normal md:text-5xl">
                Upgrade the daily grind into PrepNexo Pro.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                Free keeps the loop alive. Pro unlocks the serious prep layer:
                fair-usage AI interviews, company modes, richer feedback, and
                advanced analytics.
              </p>
            </div>
          </div>
          <div className="rounded-lg border bg-background/72 p-5">
            <p className="text-sm font-semibold text-muted-foreground">
              Current plan
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Crown className="size-6" />
              </div>
              <div>
                <p className="text-2xl font-black">
                  {status.data?.planCode ?? "FREE"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {status.data?.expiresAt
                    ? `Active until ${new Date(status.data.expiresAt).toLocaleDateString("en-IN")}`
                    : "Daily starter limits enabled"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {(plans.data ?? []).map((plan) => {
          const isPro = plan.amountPaise > 0;
          const current =
            status.data?.planCode === plan.code ||
            (!status.data?.active && plan.code === "FREE");
          return (
            <Card
              key={plan.id}
              className={cn(
                isPro &&
                  "border-primary/50 shadow-[0_18px_60px_hsl(var(--primary)/0.18)]",
              )}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      {isPro ? (
                        <Crown className="size-5 text-primary" />
                      ) : (
                        <Zap className="size-5 text-primary" />
                      )}
                      {plan.name}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {plan.description}
                    </CardDescription>
                  </div>
                  {current ? (
                    <span className="rounded-md border bg-muted px-2 py-1 text-xs font-semibold">
                      Current
                    </span>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="grid gap-5">
                <div>
                  <span className="text-4xl font-black">
                    {plan.amountPaise === 0
                      ? "Free"
                      : formatAmount(plan.amountPaise)}
                  </span>
                  {plan.amountPaise > 0 ? (
                    <span className="text-sm font-semibold text-muted-foreground">
                      {" "}
                      / {plan.intervalDays} days
                    </span>
                  ) : null}
                </div>
                <div className="grid gap-3">
                  {plan.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-start gap-2 text-sm"
                    >
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                {plan.amountPaise > 0 ? (
                  <Button
                    onClick={() => startCheckout(plan.code)}
                    loading={
                      createOrder.isPending && activePlanCode === plan.code
                    }
                    disabled={Boolean(status.data?.active)}
                  >
                    <Crown className="size-4" />
                    {status.data?.active
                      ? "Pro active"
                      : "Upgrade with Razorpay"}
                  </Button>
                ) : (
                  <Button variant="outline" disabled>
                    Free plan active
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
        {plans.isLoading ? (
          <Card className="lg:col-span-2">
            <CardContent className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading plans
            </CardContent>
          </Card>
        ) : null}
      </section>

      {proPlan ? (
        <p className="text-center text-xs text-muted-foreground">
          Payments are processed by Razorpay. Pro access starts after payment
          signature verification succeeds. AI interviews are subject to fair
          usage so quality stays fast for everyone.
        </p>
      ) : null}
    </div>
  );
}
