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

  // Busca o slug do usuário no Convex (Backend)
  const userSlug = await fetchQuery(api.lib.usernames.getUserSlug, {
    userId: user.id,
  });

  // LÓGICA DE PROTEÇÃO:
  // A função getUserSlug retorna o "username" SE existir.
  // SE NÃO existir, ela retorna o "userId" como fallback.
  // Então, se userSlug for igual ao user.id, o usuário NÃO tem username configurado.
  // Forçamos ele para o Onboarding.
  if (userSlug === user.id) {
    return redirect("/onboarding");
  }

  // Busca o plano (Free, Pro, Ultra)
  const planDetails = await getUserSubscriptionPlan(user.id);
  const userPlan = planDetails.plan || "free";

  return (
    <DashboardShell initialPlan={userPlan}>
      {children}
    </DashboardShell>
  );
}