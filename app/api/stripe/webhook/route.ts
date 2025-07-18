import { NextResponse } from "next/server";
import Stripe from "stripe";
import { users } from "@clerk/clerk-sdk-node";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

async function updateUserSubscriptionClerk(userId: string, plan: string, status: string) {
  console.log(`🔁 Atualizando plano do usuário ${userId} para ${plan} (${status})`);
  await users.updateUserMetadata(userId, {
    publicMetadata: {
      subscriptionPlan: plan,
      subscriptionStatus: status,
    },
  });
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new NextResponse("Missing Stripe signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("❌ Erro na verificação do webhook:", err);
    return new NextResponse("Webhook Error", { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const subscriptionId = session.subscription as string | undefined;

      if (!userId || !subscriptionId) {
        console.warn("⚠️ Webhook: session.completed sem userId ou subscriptionId");
        break;
      }

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = subscription.items.data[0].price.id;

      const priceToPlan: Record<string, string> = {
        [process.env.STRIPE_PRICE_PRO!]: "pro",
        [process.env.STRIPE_PRICE_ULTRA!]: "ultra",
      };

      const plan = priceToPlan[priceId] || "free";
      const status = subscription.status;

      await updateUserSubscriptionClerk(userId, plan, status);

      if (session.customer) {
        await users.updateUserMetadata(userId, {
          privateMetadata: {
            stripeCustomerId: session.customer as string,
          },
        });
        console.log(`✅ stripeCustomerId salvo para ${userId}`);
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;

      if (!userId) {
        console.warn("⚠️ Subscription update/delete sem userId em metadata");
        break;
      }

      const priceId = subscription.items.data[0].price.id;
      const plan = {
        [process.env.STRIPE_PRICE_PRO!]: "pro",
        [process.env.STRIPE_PRICE_ULTRA!]: "ultra",
      }[priceId] || "free";

      const status = subscription.status;
      await updateUserSubscriptionClerk(userId, plan, status);
      break;
    }

    default:
      console.log(`➡️ Ignorando evento: ${event.type}`);
      break;
  }

  return new NextResponse("Success", { status: 200 });
}
