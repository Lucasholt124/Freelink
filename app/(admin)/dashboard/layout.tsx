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

  // Redireciona para o Onboarding se o usuário ainda não escolheu um username (userSlug === userId)
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