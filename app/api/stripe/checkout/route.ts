import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

const priceIds: Record<"pro" | "ultra", string> = {
  pro: process.env.STRIPE_PRICE_PRO!,
  ultra: process.env.STRIPE_PRICE_ULTRA!,
};

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { plan: "pro" | "ultra" };
  const { plan } = body;

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
  console.log("Base URL:", baseUrl);
  console.log("User ID:", userId);
console.log("Success URL:", `${baseUrl}/dashboard?subscribed=true`);
console.log("Cancel URL:", `${baseUrl}/dashboard/billing`);
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
      success_url: `${baseUrl}/dashboard?subscribed=true`,
      cancel_url: `${baseUrl}/dashboard/billing`,
      metadata: { userId },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Erro ao criar sessão Stripe:", err);
    return NextResponse.json({ error: "Erro no checkout" }, { status: 500 });
  }
}
