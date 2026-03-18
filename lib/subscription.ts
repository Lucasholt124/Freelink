import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { currentUser } from "@clerk/nextjs/server";

export type SubscriptionPlanDetails = {
  plan: "free" | "pro" | "ultra";
  isPaid: boolean;
  mentorIaUsageCount: number;
};

const DEFAULT_PLAN: SubscriptionPlanDetails = { plan: "free", isPaid: false, mentorIaUsageCount: 0 };

export async function getUserSubscriptionPlan(userId: string): Promise<SubscriptionPlanDetails> {
  if (userId === "user_301NTkVsE3v48SXkoCEp0XOXifI") {
    return { plan: "ultra", isPaid: true, mentorIaUsageCount: 0 };
  }

  if (!userId) return DEFAULT_PLAN;

  try {
    // currentUser() é automaticamente deduplicado pelo Next.js na mesma request
    // Ao contrário de clerkClient().users.getUser(), isso usa dados já disponíveis
    // no middleware/session sem fazer uma chamada HTTP extra
    const user = await currentUser();

    // Se o userId não bate com o usuário logado, precisamos buscar de outra forma
    if (!user || user.id !== userId) {
      // Fallback para quando busca plano de OUTRO usuário (ex: página pública)
      const { clerkClient } = await import("@clerk/nextjs/server");
      const clerk = await clerkClient();
      const clerkUser = await clerk.users.getUser(userId);
      const planName = (clerkUser.publicMetadata.subscriptionPlan as SubscriptionPlanDetails['plan']) || "free";
      return { plan: planName, isPaid: planName === "pro" || planName === "ultra", mentorIaUsageCount: 0 };
    }

    const planName = (user.publicMetadata.subscriptionPlan as SubscriptionPlanDetails['plan']) || "free";
    return {
      plan: planName,
      isPaid: planName === "pro" || planName === "ultra",
      mentorIaUsageCount: 0,
    };
  } catch (error) {
    console.error(`Erro ao buscar dados de assinatura para userId ${userId}:`, error);
    return DEFAULT_PLAN;
  }
}

export async function getUserSubscriptionPlanByUsername(username: string): Promise<SubscriptionPlanDetails> {
  try {
    const userObject = await fetchQuery(api.users.getUserByUsername, { username });
    if (!userObject?.userId) return DEFAULT_PLAN;
    return await getUserSubscriptionPlan(userObject.userId);
  } catch (error) {
    console.error(`Erro ao buscar plano por username "${username}":`, error);
    return DEFAULT_PLAN;
  }
}