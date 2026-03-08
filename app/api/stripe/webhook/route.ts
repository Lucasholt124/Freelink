import { NextResponse } from "next/server";
import Stripe from "stripe";
import { clerkClient } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

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

  console.log("📨 Stripe Webhook Recebido:", event.type);

  const priceIdToPlan: Record<string, string> = {
    [process.env.STRIPE_PRICE_PRO!]: "pro",
    [process.env.STRIPE_PRO_PLAN_YEARLY_PRICE_ID!]: "pro",
    [process.env.STRIPE_PRICE_ULTRA!]: "ultra",
    [process.env.STRIPE_ULTRA_PLAN_YEARLY_PRICE_ID!]: "ultra",
  };

  const clerk = await clerkClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      const userId = session.metadata?.clerkUserId || session.metadata?.userId;
      const subscriptionId = session.subscription;

      if (!userId) {
        console.error("⚠️ checkout.session.completed sem userId no metadata:", session.metadata);
        return new NextResponse("Missing userId", { status: 400 });
      }

      if (!subscriptionId) {
        console.error("⚠️ checkout.session.completed sem subscriptionId");
        return new NextResponse("Missing subscriptionId", { status: 400 });
      }

      try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId as string);
        const priceId = subscription.items.data[0]?.price.id;
        const plan = priceIdToPlan[priceId] || "free";

        // ATUALIZAÇÃO DO CLERK - Mantive sua lógica original
        await clerk.users.updateUser(userId, {
          publicMetadata: {
            subscriptionPlan: plan,
            subscriptionStatus: "active",
            cartAbandoned: false, // Remove a flag de abandono
            lastPurchaseDate: Date.now(),
          },
          privateMetadata: {
            stripeCustomerId: session.customer as string,
          },
        });

        await stripe.subscriptions.update(subscriptionId as string, {
          metadata: { userId: userId },
        });

        console.log(`✅ Checkout completo - Usuário ${userId} agora tem plano ${plan}`);
      } catch (error) {
        console.error("❌ Erro ao processar checkout.session.completed:", error);
        return new NextResponse("Processing Error", { status: 500 });
      }
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = (invoice as unknown as { subscription: string | null }).subscription as string | null;

      if (!subscriptionId) {
        console.log("➡️ Ignorando invoice.payment_succeeded sem subscriptionId");
        break;
      }

      try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const userId = subscription.metadata.userId;

        if (!userId) {
          const customerId = invoice.customer as string;
          if (customerId) {
            const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
            const clerkUserId = customer.metadata?.clerkUserId;

            if (clerkUserId) {
              await stripe.subscriptions.update(subscriptionId, {
                metadata: { userId: clerkUserId },
              });

              const priceId = subscription.items.data[0]?.price.id;
              const plan = priceIdToPlan[priceId] || "free";

              await clerk.users.updateUser(clerkUserId, {
                publicMetadata: {
                  subscriptionPlan: plan,
                  subscriptionStatus: subscription.status,
                  cartAbandoned: false,
                },
              });

              console.log(`✅ Pagamento processado (via customer) - Usuário ${clerkUserId} plano ${plan}`);
              break;
            }
          }
          console.warn(`⚠️ invoice.payment_succeeded sem userId identificável`);
          break;
        }

        const priceId = subscription.items.data[0]?.price.id;
        const plan = priceIdToPlan[priceId] || "free";

        await clerk.users.updateUser(userId, {
          publicMetadata: {
            subscriptionPlan: plan,
            subscriptionStatus: subscription.status,
            cartAbandoned: false,
          },
        });

        console.log(`✅ Pagamento processado - Usuário ${userId} plano ${plan} status ${subscription.status}`);
      } catch (error) {
        console.error("❌ Erro ao processar invoice.payment_succeeded:", error);
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata.userId;

      if (!userId) {
        console.warn(`⚠️ subscription.updated sem userId no metadata`);
        break;
      }

      try {
        const priceId = subscription.items.data[0]?.price.id;
        const plan = priceIdToPlan[priceId] || "free";

        await clerk.users.updateUser(userId, {
          publicMetadata: {
            subscriptionPlan: plan,
            subscriptionStatus: subscription.status,
          },
        });

        console.log(`✅ Assinatura atualizada - Usuário ${userId} plano ${plan} status ${subscription.status}`);
      } catch (error) {
        console.error("❌ Erro ao processar subscription.updated:", error);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata.userId;

      if (!userId) {
        console.warn(`⚠️ subscription.deleted sem userId no metadata`);
        break;
      }

      try {
        await clerk.users.updateUser(userId, {
          publicMetadata: {
            subscriptionPlan: "free",
            subscriptionStatus: "canceled",
            cartAbandoned: false,
          },
        });

        console.log(`✅ Assinatura cancelada - Usuário ${userId} voltou para plano free`);
      } catch (error) {
        console.error("❌ Erro ao processar subscription.deleted:", error);
      }
      break;
    }

    default:
      console.log(`➡️ Evento não tratado: ${event.type}`);
  }

  return new NextResponse("Success", { status: 200 });
}