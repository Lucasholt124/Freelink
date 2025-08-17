"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import type { LinkAnalyticsData } from "@/convex/lib/fetchLinkAnalytics";
import { UpgradeCallToAction } from "@/components/UpgradeCallToAction";


export default function LinkAnalytics({ analytics }: { analytics: LinkAnalyticsData }) {
  const { user, isLoaded } = useUser();
  const [plan, setPlan] = useState<"free" | "pro" | "ultra">("free");
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      try {
        const userPlan = (user.publicMetadata.subscriptionPlan as "free" | "pro" | "ultra") || "free";
        setPlan(userPlan);
        setIsAdmin(user.id === "user_301NTkVsE3v48SXkoCEp0XOXifI");
      } catch (error) {
        console.error("Error setting user plan:", error);
      }
    }
  }, [isLoaded, user]);

  const hasAnalyticsAccess = plan === "pro" || plan === "ultra" || isAdmin;

  if (!isLoaded) {
    return <div>Carregando...</div>;
  }

  if (!hasAnalyticsAccess) {
    return <UpgradeCallToAction />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-md shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>

        <h1 className="text-3xl font-bold">{analytics.linkTitle}</h1>
        <p>{analytics.linkUrl}</p>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold mb-4">Estatísticas Básicas</h2>
          <p>Total de Cliques: {analytics.totalClicks}</p>
          <p>Visitantes Únicos: {analytics.uniqueUsers}</p>
          <p>Países Alcançados: {analytics.countriesReached}</p>
        </div>
      </div>
    </div>
  );
}