import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    // CORREÇÃO: Obter o cliente do Clerk
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const stripeCustomerId = user.privateMetadata?.stripeCustomerId as string;

    if (!stripeCustomerId) {
      return NextResponse.json(
        { error: "Usuário não possui assinatura" },
        { status: 400 }
      );
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma assinatura ativa encontrada" },
        { status: 404 }
      );
    }

    const subscription = subscriptions.data[0];

    await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true
    });

    await clerk.users.updateUser(userId, {
      publicMetadata: {
        ...user.publicMetadata,
        subscriptionStatus: "canceling"
      },
    });

    return NextResponse.json({
      success: true,
      message: "Assinatura será cancelada ao final do período"
    });

  } catch (error) {
    console.error("Erro ao cancelar assinatura:", error);
    return NextResponse.json(
      { error: "Erro ao cancelar assinatura" },
      { status: 500 }
    );
  }
}