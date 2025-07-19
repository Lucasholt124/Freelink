import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { users } from "@clerk/clerk-sdk-node";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const user = await users.getUser(userId);
  const stripeCustomerId = user.privateMetadata?.stripeCustomerId as string | undefined;
  if (!stripeCustomerId) return NextResponse.json({ error: "Usuário não possui assinatura" }, { status: 400 });

  // Busca a assinatura ativa
  const subscriptions = await stripe.subscriptions.list({
    customer: stripeCustomerId,
    status: "all",
    limit: 10,
  });

  const subscription = subscriptions.data.find(
    (sub) => sub.status === "active" || sub.status === "trialing"
  );

  if (!subscription) return NextResponse.json({ error: "Assinatura não encontrada" }, { status: 404 });

  // Cancela ao fim do período
  await stripe.subscriptions.update(subscription.id, { cancel_at_period_end: true });

  return NextResponse.json({ success: true });
}