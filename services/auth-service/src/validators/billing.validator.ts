import { z } from "zod";

const planCodeSchema = z.string().trim().min(2).max(32).transform((value) => value.toUpperCase());

export const checkoutOrderSchema = z.object({
  body: z.object({
    planCode: planCodeSchema.default("PRO")
  })
});

export const verifyPaymentSchema = z.object({
  body: z.object({
    razorpay_order_id: z.string().min(1),
    razorpay_payment_id: z.string().min(1),
    razorpay_signature: z.string().min(1)
  })
});

export const billingPlanSchema = z.object({
  body: z.object({
    code: planCodeSchema,
    name: z.string().trim().min(2).max(80),
    description: z.string().trim().min(2).max(240),
    amountPaise: z.coerce.number().int().min(0).max(500_000),
    currency: z.string().trim().length(3).default("INR"),
    intervalDays: z.coerce.number().int().min(1).max(366).default(30),
    features: z.array(z.string().trim().min(1).max(160)).min(1).max(12),
    active: z.boolean().default(true)
  })
});
