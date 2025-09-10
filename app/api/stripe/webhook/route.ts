import { NextResponse } from "next/server";
import Stripe from "stripe";
import { users } from "@clerk/clerk-sdk-node";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil", // Use uma versão atual da API
});

// Interface para tipar os metadados do Clerk de forma segura
interface ClerkMetadata {
  publicMetadata?: {
    subscriptionPlan?: string;
    subscriptionStatus?: string;
  };
  privateMetadata?: {
    stripeCustomerId?: string;
  };
}
// Função auxiliar centralizada para atualizar os metadados do Clerk
async function updateUserClerkMetadata(userId: string, metadata: ClerkMetadata) {
  try {
    await users.updateUser(userId, metadata);
    console.log(`✅ Metadados do Clerk atualizados para o usuário: ${userId}`);
  } catch (error) {
    console.error(`❌ Erro ao atualizar metadados do Clerk para ${userId}:`, error);
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

  console.log(" Stripe Webhook Recebido:", event.type);

  // Mapeamento centralizado de Price IDs para Planos
  // Adicione TODOS os seus Price IDs aqui (mensais e anuais)
  const priceIdToPlan: Record<string, string> = {
    [process.env.STRIPE_PRICE_PRO_MONTHLY!]: "pro",
    [process.env.STRIPE_PRICE_PRO_YEARLY!]: "pro",
    [process.env.STRIPE_PRICE_ULTRA_MONTHLY!]: "ultra",
    [process.env.STRIPE_PRICE_ULTRA_YEARLY!]: "ultra",
  };

  switch (event.type) {
    // Evento 1: O usuário completou o checkout.
    // A única responsabilidade aqui é salvar o ID do cliente e marcar a assinatura com nosso userId.
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const subscriptionId = session.subscription;

      if (!userId || !subscriptionId) {
        console.warn("⚠️ checkout.session.completed sem userId ou subscriptionId na metadata.");
        break;
      }

      // Salva o ID do cliente no Clerk para futuras interações (como o portal do cliente)
      await updateUserClerkMetadata(userId, {
        privateMetadata: { stripeCustomerId: session.customer as string },
      });

      // **CRUCIAL:** Atualiza a assinatura no Stripe para incluir nosso userId.
      // Isso garante que todos os eventos futuros (updated, deleted) saibam a quem pertencem.
      await stripe.subscriptions.update(subscriptionId as string, {
        metadata: { userId: userId },
      });
      console.log(`📎 Assinatura ${subscriptionId} marcada com o userId: ${userId}`);
      break;
    }

    // Evento 2: O pagamento foi bem-sucedido.
    // ESTE é o evento que deve conceder o acesso e atualizar o plano do usuário.
    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      // Correção: O ID da assinatura está no item da fatura, não diretamente na fatura.
      const subscriptionId = invoice.lines.data[0]?.subscription;


      if (!subscriptionId) {
        console.log("➡️ Ignorando invoice.payment_succeeded sem subscriptionId (ex: pagamento único).");
        break;
      }

      const subscription = await stripe.subscriptions.retrieve(subscriptionId as string);
      const userId = subscription.metadata.userId;

      if (!userId) {
        console.warn(`⚠️ invoice.payment_succeeded para ${subscriptionId} sem userId na metadata.`);
        break;
      }

      const priceId = subscription.items.data[0]?.price.id;
      const plan = priceIdToPlan[priceId] || "free";
      const status = subscription.status; // ex: "active"

      // Atualiza o plano do usuário no Clerk
      await updateUserClerkMetadata(userId, {
        publicMetadata: {
          subscriptionPlan: plan,
          subscriptionStatus: status,
        },
      });
      break;
    }

    // Evento 3: A assinatura foi alterada (upgrade/downgrade) ou cancelada.
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata.userId;

      if (!userId) {
        console.warn(`⚠️ customer.subscription.updated/deleted sem userId na metadata.`);
        break;
      }

      const status = subscription.status; // "active", "canceled", etc.
      let plan = "free"; // Default para cancelado

      // Se a assinatura não foi permanentemente deletada, calcula o plano
      if (status !== 'canceled') {
        const priceId = subscription.items.data[0]?.price.id;
        plan = priceIdToPlan[priceId] || "free";
      }

      await updateUserClerkMetadata(userId, {
        publicMetadata: {
          subscriptionPlan: plan,
          subscriptionStatus: status,
        },
      });
      break;
    }

    default:
      console.log(`➡️ Ignorando evento não tratado: ${event.type}`);
  }

  return new NextResponse("Success", { status: 200 });
}