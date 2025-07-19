import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";
import { users } from "@clerk/clerk-sdk-node";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

const priceIds: Record<"pro" | "ultra", string> = {
  pro: process.env.STRIPE_PRICE_PRO!,
  ultra: process.env.STRIPE_PRICE_ULTRA!,
};

export async function POST(req: NextRequest) {
  const { plan } = await req.json() as { plan: "pro" | "ultra" };

  if (!["pro", "ultra"].includes(plan)) {
    return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
  if (!baseUrl) {
    return NextResponse.json({ error: "Base URL não configurada" }, { status: 500 });
  }

  // Busca o stripeCustomerId se já existir
  const user = await users.getUser(userId);
  const stripeCustomerId = user.privateMetadata?.stripeCustomerId as string | undefined;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceIds[plan],
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard/billing?success=true`,
      cancel_url: `${baseUrl}/dashboard/billing`,
      metadata: { userId },
      ...(stripeCustomerId && { customer: stripeCustomerId }),
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Erro ao criar sessão Stripe:", error);
    return NextResponse.json({ error: "Erro no checkout" }, { status: 500 });
  }
}