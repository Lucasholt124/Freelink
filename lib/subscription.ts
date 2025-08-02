


import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { users } from "@clerk/clerk-sdk-node";

export type SubscriptionPlan = "free" | "pro" | "ultra";

// Esta função continua a mesma, pois é a fonte da verdade para buscar o plano no Clerk
export async function getUserSubscriptionPlan(userId: string): Promise<SubscriptionPlan> {
  if (userId === "user_301NTkVsE3v48SXkoCEp0XOXifI") {
    return "ultra";
  }

  try {
    const user = await users.getUser(userId);
    const plan = user.publicMetadata.subscriptionPlan as SubscriptionPlan | undefined;

    if (plan === "free" || plan === "pro" || plan === "ultra") {
      return plan;
    }
    return "free";
  } catch (error) {
    console.error(`Erro ao buscar plano do Clerk para userId ${userId}:`, error);
    return "free";
  }
}

// Esta função agora usa nossa nova query centralizada para encontrar o usuário
export async function getUserSubscriptionPlanByUsername(username: string): Promise<SubscriptionPlan> {
    try {
        // 1. Fazemos UMA chamada ao Convex para buscar os dados do usuário
        const userObject = await fetchQuery(api.users.getUserByUsername, { username });

        // Se o Convex não encontrou um usuário com esse username, é 'free'
        if (!userObject?.userId) {
            return "free";
        }

        // 2. Se encontrou, usamos o userId para buscar o plano no Clerk
        return await getUserSubscriptionPlan(userObject.userId);
    } catch (error) {
        console.error(`Erro ao orquestrar busca de plano por username "${username}":`, error);
        return "free";
    }
}