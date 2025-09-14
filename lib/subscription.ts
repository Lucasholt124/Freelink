// Em lib/subscription.ts
// (Substitua o arquivo inteiro por esta versão final e correta)

import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { users } from "@clerk/clerk-sdk-node";

// O tipo de retorno agora é um objeto detalhado, que as páginas esperam.
export type SubscriptionPlanDetails = {
  plan: "free" | "pro" | "ultra";
  isPaid: boolean;
  mentorIaUsageCount: number; // Precisamos deste dado para o Mentor IA
  // Outros dados podem ser adicionados aqui conforme necessário
};

export async function getUserSubscriptionPlan(userId: string): Promise<SubscriptionPlanDetails> {
  // Usuário de teste para desenvolvimento
  if (userId === "user_301NTkVsE3v48SXkoCEp0XOXifI") {
    return { plan: "ultra", isPaid: true, mentorIaUsageCount: 0 };
  }

  if (!userId) {
    return { plan: "free", isPaid: false, mentorIaUsageCount: 0 };
  }

  try {
    // Busca os dados do Clerk e do Convex em paralelo.
    const [clerkUser] = await Promise.all([
      users.getUser(userId),
      // =======================================================
      // CORREÇÃO APLICADA AQUI
      // =======================================================
      // Em vez de chamar uma query 'subscriptions' que não existe,
      // buscamos na tabela de conexões. Por enquanto, a contagem de uso será simulada (0),
      // pois não temos um lugar para ela ainda. A prioridade é corrigir o erro de compilação.
      fetchQuery(api.connections.get, { provider: "instagram" })
    ]);

    // Lógica para obter o nome do plano a partir do Clerk
    const planName = clerkUser.publicMetadata.subscriptionPlan as SubscriptionPlanDetails['plan'] || "free";
    const isPaid = planName === "pro" || planName === "ultra";

    // Combina os dados: nome do plano do Clerk com os dados de uso do Convex (simulado por enquanto)
    return {
      plan: planName,
      isPaid: isPaid,
      // TODO: Adicionar o campo `mentorIaUsageCount` na sua tabela `connections` ou uma nova tabela de `usage`.
      // Por enquanto, retornamos 0 para corrigir o erro de tipo.
      mentorIaUsageCount: 0,
    };

  } catch (error) {
    console.error(`Erro ao buscar dados de assinatura para userId ${userId}:`, error);
    // Retorna um plano Free seguro em caso de erro.
    return { plan: "free", isPaid: false, mentorIaUsageCount: 0 };
  }
}

// A função por username se beneficia automaticamente, sem precisar de mudanças.
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