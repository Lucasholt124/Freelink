// lib/stripe.ts
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // Não especifica versão da API para evitar problemas de tipo
  typescript: true,
  maxNetworkRetries: 2,
});