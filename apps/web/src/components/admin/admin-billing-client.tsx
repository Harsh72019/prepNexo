"use client";

import type { BillingPlanDto } from "@interview-battlefield/types";
import { Button } from "@interview-battlefield/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@interview-battlefield/ui/components/card";
import { Input } from "@interview-battlefield/ui/components/input";
import { Label } from "@interview-battlefield/ui/components/label";
import { CreditCard, Save, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import {
  useAdminBillingPlans,
  useSaveAdminBillingPlan,
} from "@/hooks/use-billing";
import { useAuthStore } from "@/stores/auth-store";

const fallbackPlan: Omit<BillingPlanDto, "id"> = {
  code: "PRO",
  name: "PrepNexo Pro",
  description:
    "Serious interview practice with fair-usage AI rounds, company modes, and advanced analytics.",
  amountPaise: 39900,
  currency: "INR",
  intervalDays: 30,
  features: [
    "AI interviews under fair usage",
    "Company-specific modes",
    "Advanced analytics",
    "Interview history",
    "Detailed AI feedback",
  ],
  active: true,
};

export function AdminBillingClient() {
  const user = useAuthStore((state) => state.user);
  const plans = useAdminBillingPlans();
  const savePlan = useSaveAdminBillingPlan();
  const [form, setForm] = useState<Omit<BillingPlanDto, "id">>(fallbackPlan);
  const [featuresText, setFeaturesText] = useState(
    fallbackPlan.features.join("\n"),
  );

  useEffect(() => {
    const pro = plans.data?.find((plan) => plan.code === "PRO");
    if (!pro) return;
    setForm({
      code: pro.code,
      name: pro.name,
      description: pro.description,
      amountPaise: pro.amountPaise,
      currency: pro.currency,
      intervalDays: pro.intervalDays,
      features: pro.features,
      active: pro.active,
    });
    setFeaturesText(pro.features.join("\n"));
  }, [plans.data]);

  function update<T extends keyof Omit<BillingPlanDto, "id">>(
    key: T,
    value: Omit<BillingPlanDto, "id">[T],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function loadPlan(plan: BillingPlanDto) {
    setForm({
      code: plan.code,
      name: plan.name,
      description: plan.description,
      amountPaise: plan.amountPaise,
      currency: plan.currency,
      intervalDays: plan.intervalDays,
      features: plan.features,
      active: plan.active,
    });
    setFeaturesText(plan.features.join("\n"));
  }

  async function submit() {
    await savePlan.mutateAsync({
      ...form,
      features: featuresText
        .split("\n")
        .map((feature) => feature.trim())
        .filter(Boolean),
    });
  }

  if (user?.role !== "ADMIN") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="size-5 text-primary" /> Admin access
            required
          </CardTitle>
          <CardDescription>Only admins can manage pricing.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="grid gap-5">
        <div>
          <p className="text-sm font-semibold text-primary">Plans</p>
          <h1 className="text-3xl font-black tracking-normal">
            Manage PrepNexo Pro
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Control launch pricing, billing interval, and the feature list shown
            to users.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="size-5 text-primary" /> Selected plan
            </CardTitle>
            <CardDescription>
              Amount is stored in paise. Rs 399 means 39900, Rs 2999 means
              299900.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <Label>Plan code</Label>
                <Input
                  value={form.code}
                  onChange={(event) =>
                    update("code", event.target.value.toUpperCase())
                  }
                />
              </label>
              <label className="grid gap-2">
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(event) => update("name", event.target.value)}
                />
              </label>
              <label className="grid gap-2">
                <Label>Amount paise</Label>
                <Input
                  type="number"
                  value={form.amountPaise}
                  onChange={(event) =>
                    update("amountPaise", Number(event.target.value))
                  }
                />
              </label>
              <label className="grid gap-2">
                <Label>Interval days</Label>
                <Input
                  type="number"
                  value={form.intervalDays}
                  onChange={(event) =>
                    update("intervalDays", Number(event.target.value))
                  }
                />
              </label>
            </div>

            <label className="grid gap-2">
              <Label>Description</Label>
              <textarea
                className="min-h-24 rounded-md border bg-background p-3 text-sm"
                value={form.description}
                onChange={(event) => update("description", event.target.value)}
              />
            </label>

            <label className="grid gap-2">
              <Label>Features</Label>
              <textarea
                className="min-h-44 rounded-md border bg-background p-3 text-sm"
                value={featuresText}
                onChange={(event) => setFeaturesText(event.target.value)}
              />
            </label>

            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) => update("active", event.target.checked)}
              />
              Active for checkout
            </label>

            <Button
              onClick={submit}
              loading={savePlan.isPending}
              className="w-fit"
            >
              <Save className="size-4" />
              Save plan
            </Button>
          </CardContent>
        </Card>
      </section>

      <aside className="grid content-start gap-4">
        {(plans.data ?? []).map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>
                {plan.code} · {plan.active ? "active" : "hidden"}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {(plan.amountPaise / 100).toLocaleString("en-IN", {
                style: "currency",
                currency: plan.currency,
                maximumFractionDigits: 0,
              })}{" "}
              / {plan.intervalDays} days
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full"
                onClick={() => loadPlan(plan)}
              >
                Edit this plan
              </Button>
            </CardContent>
          </Card>
        ))}
      </aside>
    </div>
  );
}
