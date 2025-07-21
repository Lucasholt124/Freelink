import { NextResponse } from "next/server";
import Stripe from "stripe";
import { users } from "@clerk/clerk-sdk-node";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

async function updateUserSubscriptionClerk(userId: string, plan: string, status: string) {
  try {
    await users.updateUser(userId, {
      publicMetadata: {
        subscriptionPlan: plan,
        subscriptionStatus: status,
      },
    });
    console.log(`Plano atualizado no Clerk para ${userId}: ${plan} (${status})`);
  } catch (error) {
    console.error("Erro ao atualizar plano no Clerk:", error);
  }
}

export async function POST(req: Request) {
  console.log("=== INÍCIO DO WEBHOOK ===");

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    console.error("Faltando assinatura do Stripe!");
    return new NextResponse("Missing Stripe signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("❌ Erro na verificação do webhook:", error);
    return new NextResponse("Webhook Error", { status: 400 });
  }

  console.log("Evento Stripe:", event.type);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const subscriptionId = session.subscription as string | undefined;

      console.log("Session metadata:", session.metadata);
      console.log("userId:", userId);
      console.log("subscriptionId:", subscriptionId);

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

      // Se a assinatura já estiver cancelada, salva como free
      const finalPlan = status === "canceled" ? "free" : plan;
      await updateUserSubscriptionClerk(userId, finalPlan, status);

      // Salva o stripeCustomerId
      if (session.customer) {
        await users.updateUser(userId, {
          privateMetadata: {
            stripeCustomerId: session.customer as string,
          },
        });
        console.log(`✅ stripeCustomerId salvo para ${userId}`);
      }

      // Delay para garantir que a assinatura já foi criada
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Atualiza a assinatura com o userId na metadata
      try {
        const updateResult = await stripe.subscriptions.update(subscriptionId, {
          metadata: { userId },
        });
        console.log("Assinatura atualizada:", updateResult.metadata);
      } catch (err) {
        console.error("Erro ao atualizar metadata da assinatura:", err);
      }

      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;

      console.log("Subscription metadata:", subscription.metadata);
      console.log("userId:", userId);

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
      // Se a assinatura foi cancelada, salva como free
      const finalPlan = status === "canceled" ? "free" : plan;
      await updateUserSubscriptionClerk(userId, finalPlan, status);
      break;
    }

    default:
      console.log(`➡️ Ignorando evento: ${event.type}`);
      break;
  }

  console.log("=== FIM DO WEBHOOK ===");
  return new NextResponse("Success", { status: 200 });
}