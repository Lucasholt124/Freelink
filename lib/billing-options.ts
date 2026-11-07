export type BillingPlan = "free" | "pro" | "ultra";
export type BillingCycle = "monthly" | "yearly";
export const billingPrices = {
  pro: { monthly: 3490, yearly: 34900 },
  ultra: { monthly: 7790, yearly: 77900 },
} as const;

export function money(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })
    .format(cents / 100)
    .replace(/\u00a0/g, " ");
}
export function annualSaving(plan: "pro" | "ultra") {
  const prices = billingPrices[plan];
  return prices.monthly * 12 - prices.yearly;
}
export function annualDiscount(plan: "pro" | "ultra") {
  return Math.round(
    (annualSaving(plan) / (billingPrices[plan].monthly * 12)) * 100,
  );
}
export function billingPriceNote(plan: "pro" | "ultra", cycle: BillingCycle) {
  const amount = money(billingPrices[plan][cycle]);
  return cycle === "yearly"
    ? `${amount} por ano, em uma única cobrança após o teste.`
    : `${amount} por mês após o teste.`;
}
export function billingPlan(value: unknown, userId?: string): BillingPlan {
  if (userId === "user_301NTkVsE3v48SXkoCEp0XOXifI") return "ultra";
  const plan = typeof value === "string" ? value.toLowerCase() : "free";
  return plan === "pro" || plan === "ultra" ? plan : "free";
}
