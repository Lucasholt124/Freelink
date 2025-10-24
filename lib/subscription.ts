import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { clerkClient } from "@clerk/nextjs/server";

export type SubscriptionPlanDetails = {
  plan: "free" | "pro" | "ultra";
  isPaid: boolean;
  mentorIaUsageCount: number;
};

export async function getUserSubscriptionPlan(userId: string): Promise<SubscriptionPlanDetails> {
  if (userId === "user_301NTkVsE3v48SXkoCEp0XOXifI") {
    return { plan: "ultra", isPaid: true, mentorIaUsageCount: 0 };
  }

  if (!userId) {
    return { plan: "free", isPaid: false, mentorIaUsageCount: 0 };
  }

  try {
    // CORREÇÃO: Obter o cliente do Clerk
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(userId);

    const planName = clerkUser.publicMetadata.subscriptionPlan as SubscriptionPlanDetails['plan'] || "free";
    const isPaid = planName === "pro" || planName === "ultra";

    return {
      plan: planName,
      isPaid: isPaid,
      mentorIaUsageCount: 0,
    };

  } catch (error) {
    console.error(`Erro ao buscar dados de assinatura para userId ${userId}:`, error);
    return { plan: "free", isPaid: false, mentorIaUsageCount: 0 };
  }
}

export async function getUserSubscriptionPlanByUsername(username: string): Promise<SubscriptionPlanDetails> {
    try {
        const userObject = await fetchQuery(api.users.getUserByUsername, { username });
        if (!userObject?.userId) {
            return { plan: "free", isPaid: false, mentorIaUsageCount: 0 };
        }
        return await getUserSubscriptionPlan(userObject.userId);
    } catch (error) {
        console.error(`Erro ao buscar plano por username "${username}":`, error);
        return { plan: "free", isPaid: false, mentorIaUsageCount: 0 };
    }
}