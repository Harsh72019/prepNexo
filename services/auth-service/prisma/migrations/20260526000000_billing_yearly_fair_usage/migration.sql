UPDATE "BillingPlan"
SET
  "description" = 'Serious interview practice with fair-usage AI rounds, company modes, and advanced analytics.',
  "amountPaise" = 39900,
  "currency" = 'INR',
  "intervalDays" = 30,
  "features" = '["AI interviews under fair usage","Company-specific modes","Advanced analytics","Interview history","Detailed AI feedback"]'::jsonb,
  "active" = true,
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "code" = 'PRO';

INSERT INTO "BillingPlan" (
  "id",
  "code",
  "name",
  "description",
  "amountPaise",
  "currency",
  "intervalDays",
  "features",
  "active",
  "createdAt",
  "updatedAt"
)
VALUES (
  'plan_pro_yearly',
  'PRO_YEARLY',
  'PrepNexo Pro Yearly',
  'Best value for serious prep with a full year of Pro access.',
  299900,
  'INR',
  365,
  '["Everything in Pro monthly","Lower effective monthly price","AI interviews under fair usage","Company-specific modes","Advanced analytics","Interview history","Detailed AI feedback"]'::jsonb,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("code") DO UPDATE
SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "amountPaise" = EXCLUDED."amountPaise",
  "currency" = EXCLUDED."currency",
  "intervalDays" = EXCLUDED."intervalDays",
  "features" = EXCLUDED."features",
  "active" = EXCLUDED."active",
  "updatedAt" = CURRENT_TIMESTAMP;
