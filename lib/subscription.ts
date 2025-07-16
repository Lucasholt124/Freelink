import Stripe from "stripe";
import { users } from "@clerk/clerk-sdk-node";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

export type SubscriptionPlan = "free" | "pro" | "ultra";

export async function getUserSubscriptionPlan(userId: string): Promise<SubscriptionPlan> {
  // Usuário admin fixo — sempre ultra sem pagar
  if (userId === "user_2zuoF42kpYWl095WqnSiP9eUcu3") return "ultra";

  try {
    const user = await users.getUser(userId);
    const stripeCustomerId = user.privateMetadata.stripeCustomerId as string | undefined;

    if (!stripeCustomerId) return "free";

    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: "all",
    });

    const activeSub = subscriptions.data.find(
      (sub) => sub.status === "active" || sub.status === "trialing"
    );

    if (!activeSub) return "free";

    const priceId = activeSub.items.data[0]?.price.id;
    if (!priceId) return "free";

    const priceIdToPlan: Record<string, SubscriptionPlan> = {
      [process.env.STRIPE_PRO_PRICE_ID!]: "pro",
      [process.env.STRIPE_ULTRA_PRICE_ID!]: "ultra",
    };

    return priceIdToPlan[priceId] || "free";
  } catch (err) {
    console.error("Erro ao buscar assinatura:", err);
    return "free";
  }
}

export async function getStripeCustomerId(userId: string): Promise<string | null> {
  const user = await users.getUser(userId);
  const existingCustomerId = user.privateMetadata.stripeCustomerId as string | undefined;
  if (existingCustomerId) return existingCustomerId;

  const customer = await stripe.customers.create({
    email: user.emailAddresses[0]?.emailAddress,
    metadata: { userId },
  });

  await users.updateUserMetadata(userId, {
    privateMetadata: {
      stripeCustomerId: customer.id,
    },
  });

  return customer.id;
}
