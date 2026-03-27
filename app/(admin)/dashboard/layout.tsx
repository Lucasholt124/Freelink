import { ReactNode } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardShell from "./DashboardShell";
import { 
  getCachedSubscriptionPlan, 
  getCachedUserSlug, 
  getCachedOnboardingStatus 
} from "@/lib/cached-queries";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await currentUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const [userSlug, planDetails, onboarding] = await Promise.all([
    getCachedUserSlug(user.id),
    getCachedSubscriptionPlan(user.id),
    getCachedOnboardingStatus(user.id),
  ]);

  // LÓGICA DE PROTEÇÃO:
  // Redireciona para o Onboarding se:
  // 1. Não tiver username (userSlug === userId)
  // 2. Não tiver completado os 4 passos do wizard
  if (userSlug === user.id || !onboarding?.completed) {
    return redirect("/onboarding");
  }

  const userPlan = planDetails.plan || "free";

  return (
    <DashboardShell initialPlan={userPlan}>
      {children}
    </DashboardShell>
  );
}