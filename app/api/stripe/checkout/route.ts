import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { getBaseUrl } from "@/convex/lib/getBaseUrl";

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

type PlanIdentifier = keyof typeof priceMap;
type BillingCycle = "monthly" | "yearly";

export async function POST(req: NextRequest) {
  try {
    const { plan, cycle } = (await req.json()) as {
      plan: PlanIdentifier;
      cycle: BillingCycle
    };

    if (!plan || !cycle || !priceMap[plan] || !priceMap[plan][cycle]) {
      return NextResponse.json(
        { error: "Plano ou ciclo de faturamento inválido." },
        { status: 400 }
      );
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Usuário não autenticado." },
        { status: 401 }
      );
    }

    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);

    const userEmail = user.emailAddresses.find(
      (email) => email.id === user.primaryEmailAddressId
    )?.emailAddress;

    if (!userEmail) {
      return NextResponse.json(
        { error: "Email do usuário não encontrado." },
        { status: 400 }
      );
    }

    // --- LÓGICA DE MARKETING INTELIGENTE ---
    // Antes de enviar para o Stripe, marcamos que ele iniciou o checkout.
    // Se ele não completar, o sistema de e-mail saberá.
    await clerk.users.updateUser(userId, {
      publicMetadata: {
        ...user.publicMetadata,
        cartAbandoned: true, // Marca como abandonado até que o webhook diga o contrário
        lastCheckoutAttempt: Date.now(), // Data da tentativa
        attemptedPlan: plan, // Qual plano ele tentou comprar
      },
    });
    // ---------------------------------------

    let stripeCustomerId = user.privateMetadata?.stripeCustomerId as string | undefined;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || userEmail,
        metadata: {
          clerkUserId: userId
        },
      });

      stripeCustomerId = customer.id;

      await clerk.users.updateUser(userId, {
        privateMetadata: {
          ...user.privateMetadata,
          stripeCustomerId
        },
      });
    }

    const priceId = priceMap[plan][cycle];
    const baseUrl = getBaseUrl();

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      billing_address_collection: "auto",
      line_items: [{
        price: priceId,
        quantity: 1
      }],
      success_url: `${baseUrl}/dashboard/billing?success=true`,
      cancel_url: `${baseUrl}/dashboard/billing?canceled=true`,
      metadata: {
        clerkUserId: userId,
        userId: userId
      },
    });

    return NextResponse.json({ url: checkoutSession.url });

  } catch (error) {
    console.error("[STRIPE_CHECKOUT_ERROR]", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno. Tente novamente." },
      { status: 500 }
    );
  }
}