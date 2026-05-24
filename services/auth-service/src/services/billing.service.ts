import { createHmac, timingSafeEqual } from "node:crypto";
import { Prisma } from "@prisma/client";
import type {
  BillingPlanDto,
  BillingStatusDto,
  RazorpayCheckoutOrder,
} from "@interview-battlefield/types";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { HttpError } from "../lib/http-error.js";

type RazorpayOrderResponse = {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
};

type PlanInput = Omit<BillingPlanDto, "id">;

const defaultPlans: PlanInput[] = [
  {
    code: "FREE",
    name: "Free",
    description: "Start daily with the core PrepNexo loop.",
    amountPaise: 0,
    currency: "INR",
    intervalDays: 30,
    active: true,
    features: [
      "1 AI interview daily",
      "1 ranked arena daily",
      "Basic readiness dashboard",
    ],
  },
  {
    code: "PRO",
    name: "PrepNexo Pro",
    description:
      "Unlimited interview practice with deeper feedback and analytics.",
    amountPaise: 39900,
    currency: "INR",
    intervalDays: 30,
    active: true,
    features: [
      "Unlimited AI interviews",
      "Company-specific modes",
      "Advanced analytics",
      "Interview history",
      "Detailed AI feedback",
    ],
  },
];

function featuresFromJson(
  value: Prisma.JsonValue | null | undefined,
): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function toDto(plan: {
  id: string;
  code: string;
  name: string;
  description: string;
  amountPaise: number;
  currency: string;
  intervalDays: number;
  features: Prisma.JsonValue | null;
  active: boolean;
}): BillingPlanDto {
  return {
    id: plan.id,
    code: plan.code,
    name: plan.name,
    description: plan.description,
    amountPaise: plan.amountPaise,
    currency: plan.currency,
    intervalDays: plan.intervalDays,
    features: featuresFromJson(plan.features),
    active: plan.active,
  };
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export class BillingService {
  async ensureDefaultPlans() {
    await Promise.all(
      defaultPlans.map((plan) =>
        prisma.billingPlan.upsert({
          where: { code: plan.code },
          create: { ...plan, features: plan.features },
          update: {},
        }),
      ),
    );
  }

  async plans() {
    await this.ensureDefaultPlans();
    const plans = await prisma.billingPlan.findMany({
      where: { active: true },
      orderBy: { amountPaise: "asc" },
    });
    return plans.map(toDto);
  }

  async adminPlans() {
    await this.ensureDefaultPlans();
    const plans = await prisma.billingPlan.findMany({
      orderBy: [{ amountPaise: "asc" }, { createdAt: "asc" }],
    });
    return plans.map(toDto);
  }

  async upsertPlan(input: PlanInput) {
    const plan = await prisma.billingPlan.upsert({
      where: { code: input.code },
      create: { ...input, features: input.features },
      update: { ...input, features: input.features },
    });
    return toDto(plan);
  }

  async status(userId: string): Promise<BillingStatusDto> {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = addDays(startOfDay, 1);
    const [subscription, aiInterviews, rankedArenas] = await Promise.all([
      prisma.userSubscription.findFirst({
        where: {
          userId,
          status: "ACTIVE",
          planCode: "PRO",
          expiresAt: { gt: now },
        },
        orderBy: { expiresAt: "desc" },
      }),
      prisma.interviewAttempt.count({
        where: {
          userId,
          kind: "LIVE_CODING",
          completedAt: { gte: startOfDay, lt: endOfDay },
        },
      }),
      prisma.arenaEntry.count({
        where: {
          userId,
          mode: "ranked",
          arenaDate: { gte: startOfDay, lt: endOfDay },
        },
      }),
    ]);

    if (!subscription) {
      return {
        planCode: "FREE",
        active: false,
        expiresAt: null,
        dailyLimits: { aiInterviews: 1, rankedArenas: 1 },
        dailyUsage: { aiInterviews, rankedArenas },
      };
    }

    return {
      planCode: "PRO",
      active: true,
      expiresAt: subscription.expiresAt.toISOString(),
      dailyLimits: { aiInterviews: "UNLIMITED", rankedArenas: 1 },
      dailyUsage: { aiInterviews, rankedArenas },
    };
  }

  async hasActivePro(userId: string) {
    const now = new Date();
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId,
        status: "ACTIVE",
        planCode: "PRO",
        expiresAt: { gt: now },
      },
      select: { id: true },
    });
    return Boolean(subscription);
  }

  async assertAiInterviewAvailable(userId: string) {
    if (await this.hasActivePro(userId)) return;
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = addDays(startOfDay, 1);
    const usedToday = await prisma.interviewAttempt.count({
      where: {
        userId,
        kind: "LIVE_CODING",
        completedAt: { gte: startOfDay, lt: endOfDay },
      },
    });
    if (usedToday >= 1) {
      throw new HttpError(
        402,
        "Free plan includes 1 AI interview per day. Upgrade to Pro for unlimited rounds.",
        "FREE_AI_INTERVIEW_LIMIT_REACHED",
      );
    }
  }

  async assertRankedArenaAvailable(userId: string) {
    if (await this.hasActivePro(userId)) return;
    const arenaDate = new Date();
    arenaDate.setHours(0, 0, 0, 0);
    const usedToday = await prisma.arenaEntry.findUnique({
      where: { userId_arenaDate_mode: { userId, arenaDate, mode: "ranked" } },
      select: { id: true },
    });
    if (usedToday) {
      throw new HttpError(
        402,
        "Free plan includes 1 ranked arena per day. Upgrade to Pro for more rooms.",
        "FREE_RANKED_ARENA_LIMIT_REACHED",
      );
    }
  }

  async createCheckoutOrder(
    userId: string,
    planCode: string,
  ): Promise<RazorpayCheckoutOrder> {
    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
      throw new HttpError(
        503,
        "Razorpay is not configured yet",
        "RAZORPAY_NOT_CONFIGURED",
      );
    }

    await this.ensureDefaultPlans();
    const [user, plan] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.billingPlan.findFirst({ where: { code: planCode, active: true } }),
    ]);

    if (!user) throw new HttpError(404, "User not found", "USER_NOT_FOUND");
    if (!plan || plan.amountPaise <= 0)
      throw new HttpError(404, "Paid plan not found", "PLAN_NOT_FOUND");

    const receipt = `prepnexo_${Date.now()}_${userId.slice(0, 8)}`;
    const order = await this.createRazorpayOrder({
      amount: plan.amountPaise,
      currency: plan.currency,
      receipt,
      notes: {
        userId,
        planCode: plan.code,
      },
    });

    await prisma.paymentOrder.create({
      data: {
        userId,
        planId: plan.id,
        razorpayOrderId: order.id,
        amountPaise: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status.toUpperCase(),
        metadata: { planCode: plan.code },
      },
    });

    return {
      keyId: env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amountPaise: order.amount,
      currency: order.currency,
      planCode: plan.code,
      name: plan.name,
      description: plan.description,
      prefill: {
        name: user.name,
        email: user.email,
      },
    };
  }

  async verifyPayment(
    userId: string,
    payload: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    },
  ) {
    if (!env.RAZORPAY_KEY_SECRET) {
      throw new HttpError(
        503,
        "Razorpay is not configured yet",
        "RAZORPAY_NOT_CONFIGURED",
      );
    }

    const order = await prisma.paymentOrder.findUnique({
      where: { razorpayOrderId: payload.razorpay_order_id },
      include: { plan: true },
    });

    if (!order || order.userId !== userId)
      throw new HttpError(404, "Payment order not found", "ORDER_NOT_FOUND");
    if (order.status === "PAID") return this.status(userId);

    const expected = createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(`${payload.razorpay_order_id}|${payload.razorpay_payment_id}`)
      .digest("hex");

    const expectedBuffer = Buffer.from(expected);
    const receivedBuffer = Buffer.from(payload.razorpay_signature);
    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      await prisma.paymentOrder.update({
        where: { id: order.id },
        data: {
          status: "FAILED",
          razorpayPaymentId: payload.razorpay_payment_id,
        },
      });
      throw new HttpError(
        400,
        "Payment verification failed",
        "PAYMENT_SIGNATURE_INVALID",
      );
    }

    const now = new Date();
    const currentSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId,
        planCode: order.plan.code,
        status: "ACTIVE",
        expiresAt: { gt: now },
      },
      orderBy: { expiresAt: "desc" },
    });
    const startsFrom =
      currentSubscription?.expiresAt && currentSubscription.expiresAt > now
        ? currentSubscription.expiresAt
        : now;

    await prisma.$transaction([
      prisma.paymentOrder.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          razorpayPaymentId: payload.razorpay_payment_id,
        },
      }),
      prisma.userSubscription.create({
        data: {
          userId,
          planCode: order.plan.code,
          status: "ACTIVE",
          startedAt: now,
          expiresAt: addDays(startsFrom, order.plan.intervalDays),
          sourceOrderId: order.id,
        },
      }),
    ]);

    return this.status(userId);
  }

  private async createRazorpayOrder(
    body: Record<string, unknown>,
  ): Promise<RazorpayOrderResponse> {
    const credentials = Buffer.from(
      `${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`,
    ).toString("base64");
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const payload = (await response.json().catch(() => null)) as
      | RazorpayOrderResponse
      | { error?: { description?: string } }
      | null;
    if (!response.ok || !payload || !("id" in payload)) {
      const message =
        payload && "error" in payload ? payload.error?.description : undefined;
      throw new HttpError(
        502,
        message ?? "Could not create Razorpay order",
        "RAZORPAY_ORDER_FAILED",
      );
    }

    return payload;
  }
}
