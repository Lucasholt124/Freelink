import { Suspense } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { fetchAnalytics } from "@/lib/analytics-server";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { Lock } from "lucide-react";
import UsernameForm from "@/components/UsernameForm";
import CustomizationForm from "@/components/CustomizationForm";
import ManageLinks from "@/components/ManageLinks";
import DashboardMetrics from "@/components/DashboardMetrics";
import SkeletonDashboard from "@/components/SkeletonDashboard";
import DashboardToast from "@/components/DashboardToast";

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) {
    // Pode trocar por redirecionamento para login se desejar
    return null;
  }

  const [preloadedLinks, analytics, rawPlan] = await Promise.all([
    preloadQuery(api.lib.links.getLinksByUserId, { userId: user.id }),
    fetchAnalytics(user.id),
    getUserSubscriptionPlan(user.id),
  ]);

  const plan = user.id === "user_301NTkVsE3v48SXkoCEp0XOXifI" ? "ultra" : (rawPlan ?? "free");

  return (
    <div className="pb-16">
      {/* Toast para sucesso da assinatura */}
      <DashboardToast />

      {/* Métricas de Analytics */}
      {(plan === "pro" || plan === "ultra") ? (
        <Suspense fallback={<SkeletonDashboard />}>
          <DashboardMetrics analytics={analytics} plan={plan} />
        </Suspense>
      ) : (
        <div className="bg-gray-50 p-6 lg:p-10 rounded-2xl border border-gray-200 max-w-7xl mx-auto mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-400 rounded-xl">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Visão geral da análise</h2>
              <p className="text-gray-600">
                🔒 Atualize para Pro ou Ultra para desbloquear métricas
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Configuração do username */}
      <section className="bg-gray-50 py-6 px-4 lg:px-10 max-w-7xl mx-auto rounded-2xl mb-8 shadow-sm">
        <UsernameForm />
      </section>

      {/* Customização da página */}
      <section className="bg-gray-50 py-6 px-4 lg:px-10 max-w-7xl mx-auto rounded-2xl mb-8 shadow-sm">
        <CustomizationForm />
      </section>

      {/* Gerenciar links */}
      <section className="bg-gray-50 py-6 px-4 lg:px-10 max-w-7xl mx-auto rounded-2xl shadow-sm">
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-1/2 space-y-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                Gerencie seus links
              </h1>
              <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mt-3" />
            </div>
            <p className="text-gray-600 text-base">
              Organize e personalize sua página de links. Arraste, edite e remova com facilidade.
            </p>
            <ul className="space-y-3">
              <li className="text-gray-500 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full" /> Reordene por drag and drop
              </li>
              <li className="text-gray-500 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full" /> Atualizações em tempo real
              </li>
              <li className="text-gray-500 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" /> Análises avançadas (Pro/Ultra)
              </li>
            </ul>
          </aside>

          <div className="lg:w-1/2">
            <ManageLinks preloadedLinks={preloadedLinks} />
          </div>
        </div>
      </section>
    </div>
  );
}
