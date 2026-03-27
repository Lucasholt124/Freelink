import { cache } from "react";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

// cache() do React garante que na mesma request do servidor,
// se esta função for chamada 5 vezes, ela executa apenas 1 vez
export const getCachedSubscriptionPlan = cache(async (userId: string) => {
  return getUserSubscriptionPlan(userId);
});

export const getCachedUserSlug = cache(async (userId: string) => {
  return fetchQuery(api.lib.usernames.getUserSlug, { userId });
});

export const getCachedOnboardingStatus = cache(async (userId: string) => {
  return fetchQuery(api.onboarding.getOnboardingStatus, { userId });
});