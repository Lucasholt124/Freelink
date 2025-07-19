import { auth } from "@clerk/nextjs/server";
import { users } from "@clerk/clerk-sdk-node";
import { NextResponse } from "next/server";

export type SubscriptionPlan = "free" | "pro" | "ultra";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ plan: "free" }, { status: 401 });
  }

  try {
    const user = await users.getUser(userId);
    const plan = user.publicMetadata.subscriptionPlan as SubscriptionPlan | undefined;
    if (plan === "pro" || plan === "ultra") {
      return NextResponse.json({ plan });
    }
    return NextResponse.json({ plan: "free" });
  } catch (error) {
    console.error("Erro ao buscar plano:", error);
    return NextResponse.json({ plan: "free" });
  }
}