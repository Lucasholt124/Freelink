import { ReactNode } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import DashboardShell from "./DashboardShell";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await currentUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Busca o slug do usuário
  const userSlug = await fetchQuery(api.lib.usernames.getUserSlug, {
    userId: user.id,
  });

  // Se não tem slug, redireciona para onboarding
  if (!userSlug) {
    return redirect("/onboarding");
  }

  // Busca o plano
  const planDetails = await getUserSubscriptionPlan(user.id);
  const userPlan = planDetails.plan || "free";

  return (
    <DashboardShell initialPlan={userPlan}>
      {children}
    </DashboardShell>
  );
}