import { ReactNode } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import DashboardShell from "./DashboardShell";


export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await currentUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // AQUI ACONTECE A MÁGICA REAL
  // Buscamos o plano no banco de dados ANTES de renderizar a tela
  const planDetails = await getUserSubscriptionPlan(user.id);
  const userPlan = planDetails.plan || "free";

  return (
    // Passamos o plano real para o componente visual
    <DashboardShell initialPlan={userPlan}>
      {children}
    </DashboardShell>
  );
}