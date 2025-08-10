// Em app/dashboard/page.tsx
// (Substitua o arquivo inteiro)

import { Suspense } from "react";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { Wand2, BrainCircuit } from "lucide-react";

import { fetchAnalytics } from "@/lib/analytics-server";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import DashboardMetrics from "@/components/DashboardMetrics";
import SkeletonDashboard from "@/components/SkeletonDashboard";
import DashboardToast from "@/components/DashboardToast";
import WhatsappFloatingButton from "@/components/WhatsappFloatingButton";

function MentorIaWidget() {
  return (
    <div className="bg-gradient-to-tr from-purple-600 to-blue-500 p-8 rounded-2xl shadow-lg text-white transition-all hover:shadow-2xl hover:-translate-y-1 flex flex-col">
      <div className="flex-grow">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-full"><Wand2 className="w-7 h-7" /></div>
          <div><h2 className="text-2xl font-bold">Mentor IA</h2><p className="opacity-80 max-w-sm">Seu estrategista particular para decolar no Instagram.</p></div>
        </div>
      </div>
      <Link href="/dashboard/mentor-ia" className="mt-6 self-start px-6 py-3 bg-white text-purple-700 font-bold rounded-lg text-sm transition-transform hover:scale-105">Começar Análise</Link>
    </div>
  );
}

function FreelinnkBrainWidget() {
  // CORREÇÃO: O widget do Brain agora leva para a página correta.
  return (
    <div className="bg-white border border-gray-200/80 p-8 rounded-2xl shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col">
      <div className="flex-grow">
        <div className="flex items-center gap-4">
          <div className="bg-gray-100 p-3 rounded-full"><BrainCircuit className="w-7 h-7 text-gray-700" /></div>
          <div><h2 className="text-2xl font-bold text-gray-900">Freelinnk Brain™</h2><p className="text-gray-600 max-w-sm">Gere ideias, roteiros e títulos virais em segundos.</p></div>
        </div>
      </div>
      {/* Agora é um link real para a página do Brain */}
      <Link href="/dashboard/brain" className="mt-6 self-start px-6 py-3 bg-gray-900 text-white font-bold rounded-lg text-sm transition-transform hover:scale-105">Acessar Brain™</Link>
    </div>
  );
}

export default async function DashboardOverviewPage() {
  const user = await currentUser();
  if (!user) return null;

  const [analytics, planDetails] = await Promise.all([
    fetchAnalytics(user.id),
    getUserSubscriptionPlan(user.id),
  ]);

  return (
    <div className="space-y-10">
      <DashboardToast />
      <div>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Olá, {user.firstName || user.username}! 👋</h1>
        <p className="text-lg text-gray-500 mt-2">Vamos construir seu império hoje.</p>
      </div>
      <Suspense fallback={<SkeletonDashboard />}>
        {/*
          =======================================================
          A CORREÇÃO ESTÁ AQUI
          =======================================================
          Passamos `planDetails.plan` (a string) em vez do objeto `planDetails` inteiro.
        */}
        <DashboardMetrics analytics={analytics} plan={planDetails.plan} />
      </Suspense>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <MentorIaWidget />
        <FreelinnkBrainWidget />
      </div>
      <WhatsappFloatingButton />
    </div>
  );
}