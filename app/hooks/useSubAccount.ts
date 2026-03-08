"use client";

/**
 * useSubAccount
 *
 * Hook que detecta se o painel está sendo acessado
 * no contexto de uma sub-conta (via ?subAccount=subUserId&username=xxx).
 *
 * Como usar no dashboard:
 *
 *   const { isSubAccount, subUserId, username, ownerUserId } = useSubAccount();
 *
 *   // Se isSubAccount for true, use subUserId como userId em todas as queries
 *   // Em vez de user.id do Clerk
 *
 * Exemplo de uso em qualquer componente do dashboard:
 *
 *   const { user } = useUser();
 *   const { isSubAccount, subUserId } = useSubAccount();
 *   const effectiveUserId = isSubAccount ? subUserId : user?.id;
 *
 *   const links = useQuery(
 *     api.lib.links.getLinks,
 *     effectiveUserId ? { userId: effectiveUserId } : "skip"
 *   );
 */

import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface UseSubAccountReturn {
  isSubAccount: boolean;
  subUserId: string | null;
  username: string | null;
  ownerUserId: string | null;
  isLoading: boolean;
}

export function useSubAccount(): UseSubAccountReturn {
  const searchParams = useSearchParams();

  const subAccountParam = searchParams.get("subAccount");
  const usernameParam = searchParams.get("username");

  const isSubAccount = !!subAccountParam;

  // Busca o ownerUserId para validar que a sub-conta existe
  const subAccountData = useQuery(
    api.lib.subAccounts.getSubAccountBySubUserId,
    isSubAccount && subAccountParam
      ? { subUserId: subAccountParam }
      : "skip"
  );

  return {
    isSubAccount,
    subUserId: subAccountParam,
    username: usernameParam,
    ownerUserId: subAccountData?.ownerUserId ?? null,
    isLoading: isSubAccount && subAccountData === undefined,
  };
}