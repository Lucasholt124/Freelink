import { ReactNode } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardShell from "./DashboardShell";
import { getCachedSubscriptionPlan, getCachedUserSlug } from "@/lib/cached-queries";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await currentUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const [userSlug, planDetails] = await Promise.all([
    getCachedUserSlug(user.id),
    getCachedSubscriptionPlan(user.id),
  ]);
  // Busca o slug do usuário no Convex (Backend)


  // LÓGICA DE PROTEÇÃO:
  // A função getUserSlug retorna o "username" SE existir.
  // SE NÃO existir, ela retorna o "userId" como fallback.
  // Então, se userSlug for igual ao user.id, o usuário NÃO tem username configurado.
  // Forçamos ele para o Onboarding.
  if (userSlug === user.id) {
    return redirect("/onboarding");
  }


  const userPlan = planDetails.plan || "free";

  return (
    <DashboardShell initialPlan={userPlan}>
      {children}
    </DashboardShell>
  );
}