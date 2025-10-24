import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { getBaseUrl } from "@/convex/lib/getBaseUrl";

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
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    const baseUrl = getBaseUrl();

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${baseUrl}/dashboard/billing`,
    });

    return NextResponse.json({ url: portalSession.url });

  } catch (error) {
    console.error("Erro ao criar sessão do portal:", error);
    return NextResponse.json(
      { error: "Erro ao acessar portal de assinaturas" },
      { status: 500 }
    );
  }
}