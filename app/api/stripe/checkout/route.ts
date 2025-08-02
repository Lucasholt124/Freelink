// Em api/stripe/checkout/route.ts

import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe"; // Centralize a instância do Stripe
import { auth } from "@clerk/nextjs/server";
import { users } from "@clerk/clerk-sdk-node";
import { getBaseUrl } from "@/convex/lib/getBaseUrl";


// --- LÓGICA DE PREÇOS SEGURA NO BACKEND ---
// Mapeia os nomes dos planos para os IDs mensais e anuais do seu .env
const priceMap = {
  pro: {
    monthly: process.env.STRIPE_PRICE_PRO!,
    yearly: process.env.STRIPE_PRO_PLAN_YEARLY_PRICE_ID!,
  },
  ultra: {
    monthly: process.env.STRIPE_PRICE_ULTRA!,
    yearly: process.env.STRIPE_ULTRA_PLAN_YEARLY_PRICE_ID!,
  },
};

type PlanIdentifier = keyof typeof priceMap; // "pro" | "ultra"
type BillingCycle = "monthly" | "yearly";

export async function POST(req: NextRequest) {
  try {
    // 1. Recebemos o nome do plano e o ciclo do frontend
    const { plan, cycle } = (await req.json()) as { plan: PlanIdentifier; cycle: BillingCycle };

    // Validação de segurança
    if (!plan || !cycle || !priceMap[plan] || !priceMap[plan][cycle]) {
      return NextResponse.json({ error: "Plano ou ciclo de faturamento inválido." }, { status: 400 });
    }

    // 2. CORREÇÃO: Usamos `await` para obter o userId
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Usuário não autenticado." }, { status: 401 });
    }

    const user = await users.getUser(userId);
    const userEmail = user.emailAddresses.find(email => email.id === user.primaryEmailAddressId)?.emailAddress;
    if (!userEmail) {
      return NextResponse.json({ error: "Email do usuário não encontrado." }, { status: 400 });
    }

    // Lógica para criar ou buscar o cliente Stripe (como antes)
    let stripeCustomerId = user.privateMetadata?.stripeCustomerId as string | undefined;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        name: `${user.firstName} ${user.lastName}`,
        metadata: { clerkUserId: userId },
      });
      stripeCustomerId = customer.id;
      await users.updateUser(userId, {
        privateMetadata: { ...user.privateMetadata, stripeCustomerId },
      });
    }

    // 3. Selecionamos o priceId correto e seguro do nosso mapa
    const priceId = priceMap[plan][cycle];

    const baseUrl = getBaseUrl();

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      billing_address_collection: "auto",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/dashboard/billing?success=true`,
      cancel_url: `${baseUrl}/dashboard/billing?canceled=true`,
      metadata: { clerkUserId: userId },
    });

    return NextResponse.json({ url: checkoutSession.url });

  } catch (error) {
    console.error("[STRIPE_CHECKOUT_ERROR]", error);
    return NextResponse.json({ error: "Ocorreu um erro interno. Tente novamente." }, { status: 500 });
  }
}