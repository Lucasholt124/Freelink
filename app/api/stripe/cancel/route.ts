import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { users } from "@clerk/clerk-sdk-node";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const user = await users.getUser(userId);
  const stripeCustomerId = user.privateMetadata?.stripeCustomerId as string;

  if (!stripeCustomerId) {
    return NextResponse.json({ error: "Usuário não possui assinatura" }, { status: 400 });
  }

  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: "all",
      limit: 10,
    });

    const subscription = subscriptions.data.find(
      (sub) => sub.status === "active" || sub.status === "trialing"
    );

    if (!subscription) {
      return NextResponse.json({ error: "Assinatura não encontrada" }, { status: 404 });
    }

    await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true
    });

    return NextResponse.json({
      success: true,
      message: "Assinatura será cancelada ao final do período"
    });

  } catch (error) {
    console.error("Erro:", error);
    return NextResponse.json({ error: "Erro ao cancelar" }, { status: 500 });
  }
}