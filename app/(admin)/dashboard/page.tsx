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
// O WhatsappFloatingButton pode ser adicionado no layout se for global

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
  return (
    <div className="bg-white border border-gray-200/80 p-8 rounded-2xl shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col">
      <div className="flex-grow">
        <div className="flex items-center gap-4">
          <div className="bg-gray-100 p-3 rounded-full"><BrainCircuit className="w-7 h-7 text-gray-700" /></div>
          <div><h2 className="text-2xl font-bold text-gray-900">Freelinnk Brain™</h2><p className="text-gray-600 max-w-sm">Gere ideias, roteiros e títulos virais em segundos.</p></div>
        </div>
      </div>
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
    <div className="space-y-8">
      <DashboardToast />
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Olá, {user.firstName || user.username}! 👋</h1>
        <p className="text-lg text-gray-600 mt-1">Bem-vindo(a) ao seu centro de comando.</p>
      </div>
      <Suspense fallback={<SkeletonDashboard />}>
        <DashboardMetrics analytics={analytics} plan={planDetails.plan} />
      </Suspense>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MentorIaWidget />
        <FreelinnkBrainWidget />
      </div>
    </div>
  );
}