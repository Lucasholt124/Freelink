import { users } from "@clerk/clerk-sdk-node";

export type SubscriptionPlan = "free" | "pro" | "ultra";

export async function getUserSubscriptionPlan(userId: string): Promise<SubscriptionPlan> {
  // Admin fixo que sempre tem Ultra (não paga)
  if (userId === "user_301NTkVsE3v48SXkoCEp0XOXifI") return "ultra";

  try {
    const user = await users.getUser(userId);
    const plan = user.publicMetadata.subscriptionPlan as SubscriptionPlan | undefined;

    if (plan === "free" || plan === "pro" || plan === "ultra") {
      return plan;
    }

    // Caso não tenha metadata, assume "free"
    return "free";
  } catch (error) {
    console.error("Erro ao buscar plano de assinatura no Clerk:", error);
    return "free";
  }
}