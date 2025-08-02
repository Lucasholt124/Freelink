// Em app/api/stripe/portal/route.ts

import { NextResponse } from "next/server"; // Removido NextRequest
import { stripe } from "@/lib/stripe";
import { auth } from "@clerk/nextjs/server";
import { getBaseUrl } from "@/convex/lib/getBaseUrl";
import { users } from "@clerk/clerk-sdk-node";
// --- CORREÇÃO APLICADA AQUI ---
export async function POST() { // Parâmetros removidos
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await users.getUser(userId);
    const stripeCustomerId = user.privateMetadata?.stripeCustomerId as string | undefined;

    if (!stripeCustomerId) {
      return NextResponse.json({ error: "Cliente Stripe não encontrado." }, { status: 404 });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${getBaseUrl()}/dashboard/billing`,
    });

    return NextResponse.json({ url: portalSession.url });

  } catch (error) {
    console.error("[STRIPE_PORTAL_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}