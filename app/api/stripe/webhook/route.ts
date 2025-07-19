import { NextResponse } from "next/server";
import Stripe from "stripe";
import { users } from "@clerk/clerk-sdk-node";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});
async function testUpdate() {
  const subscriptionId = "sub_1RmcchQDWcFcDipFTOa3Bzzp"; // coloque o ID da assinatura
  try {
    const result = await stripe.subscriptions.update(subscriptionId, {
      metadata: { userId: "user_301YTPGkisd671QSSP8sWtynlyq" },
    });
    console.log("Metadata atualizada:", result.metadata);
  } catch (err) {
    console.error("Erro ao atualizar assinatura:", err);
  }
}
testUpdate();

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

      await updateUserSubscriptionClerk(userId, plan, status);

      // Salva o stripeCustomerId
      if (session.customer) {
        await users.updateUser(userId, {
          privateMetadata: {
            stripeCustomerId: session.customer as string,
          },
        });
        console.log(`✅ stripeCustomerId salvo para ${userId}`);
      }

      // Garante que o userId estará presente em eventos futuros
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
      await updateUserSubscriptionClerk(userId, plan, status);
      break;
    }

    default:
      console.log(`➡️ Ignorando evento: ${event.type}`);
      break;
  }

  return new NextResponse("Success", { status: 200 });
}