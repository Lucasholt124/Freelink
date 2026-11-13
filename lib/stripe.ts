import Stripe from "stripe";
let client: Stripe | undefined;
export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Pagamentos temporariamente indisponíveis.");
  return client ??= new Stripe(key, { apiVersion: "2025-10-29.clover", typescript: true });
}
