// Em app/dashboard/page.tsx

import { Suspense } from "react";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { fetchAnalytics } from "@/lib/analytics-server";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { Eye } from "lucide-react";
import UsernameForm from "@/components/UsernameForm";
import CustomizationForm from "@/components/CustomizationForm";
import ManageLinks from "@/components/ManageLinks";
import DashboardMetrics from "@/components/DashboardMetrics";
import SkeletonDashboard from "@/components/SkeletonDashboard";
import DashboardToast from "@/components/DashboardToast";
import WhatsappFloatingButton from "@/components/WhatsappFloatingButton";

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) {
    return null;
  }

  // --- CORREÇÃO PRINCIPAL AQUI ---
  // A busca do `userSlug` agora é feita pela `userId`, que é sempre confiável.
  const [analytics, rawPlan, userSlug] = await Promise.all([
    fetchAnalytics(user.id),
    getUserSubscriptionPlan(user.id),
    // Usamos a query `getUserSlug` que busca pelo ID, não pelo username.
    fetchQuery(api.lib.usernames.getUserSlug, { userId: user.id }),
  ]);

  const isAdmin = user.id === "user_301NTkVsE3v48SXkoCEp0XOXifI";
  const determinedPlan = rawPlan ?? "free";
  const plan = isAdmin ? "ultra" : determinedPlan;

  return (
    <div className="pb-16">
      <DashboardToast />

      <div className="max-w-7xl mx-auto mb-8 px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-sm text-gray-600">
            Seu plano atual:{" "}
            <span className={`font-bold capitalize ${plan === "ultra" ? "text-purple-600" : plan === "pro" ? "text-blue-600" : "text-gray-900"}`}>
              {plan}
            </span>
          </span>
          <Link
            href="/dashboard/billing"
            className="inline-block px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg text-sm hover:opacity-90 transition-opacity"
          >
            Ver planos e preços
          </Link>
        </div>
      </div>

      <Suspense fallback={<SkeletonDashboard />}>
        <DashboardMetrics analytics={analytics} plan={plan} />
      </Suspense>

      <section className="bg-gray-50 py-6 px-4 lg:px-10 max-w-7xl mx-auto rounded-2xl my-8 shadow-sm">
        <UsernameForm />
      </section>

      <section className="bg-gray-50 py-6 px-4 lg:px-10 max-w-7xl mx-auto rounded-2xl mb-8 shadow-sm">
        <CustomizationForm />
      </section>

      <section className="bg-gray-50 py-6 px-4 lg:px-10 max-w-7xl mx-auto rounded-2xl shadow-sm">
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-1/2 space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                Gerencie seus links
              </h1>
              <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mt-3" />
            </div>
            <p className="text-gray-600 text-base">
              Organize e personalize sua página de links.
            </p>
            <ul className="space-y-3">
              <li className="text-gray-500 flex items-center gap-2"><span className="w-2 h-2 bg-blue-500 rounded-full" /> Reordene por drag and drop</li>
              <li className="text-gray-500 flex items-center gap-2"><span className="w-2 h-2 bg-purple-500 rounded-full" /> Atualizações em tempo real</li>
              <li className="text-gray-500 flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full" /> Análises avançadas (Pro/Ultra)</li>
            </ul>
            <div className="mt-6">
              {/* O link agora verifica se 'userSlug' existe antes de montar a URL */}
              {userSlug && (
                <Link
                  href={`/u/${userSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg text-sm transition"
                >
                  <Eye className="w-4 h-4" /> Ver minha página pública
                </Link>
              )}
            </div>
          </aside>
          <div className="lg:w-1/2">
            <ManageLinks />
          </div>
        </div>
      </section>

      <WhatsappFloatingButton />
    </div>
  );
}