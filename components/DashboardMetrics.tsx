
"use client";

import type { AnalyticsData } from "@/lib/analytics-server";
import { Users, MousePointerClick, Globe, Link as LinkIcon, Clock, MapPin, Lock } from "lucide-react";
import clsx from "clsx";
import type { ElementType } from "react";
import NextLink from "next/link";

interface DashboardMetricsProps {
  analytics: AnalyticsData;
  plan: "free" | "pro" | "ultra";
}

// Seu componente Card, agora com um subtítulo opcional
function Card({ color, title, icon: Icon, value, subtitle, isText = false }: {
  color: string;
  title: string;
  icon: ElementType;
  value: string | number;
  subtitle?: string;
  isText?: boolean;
}) {
  return (
    <div className={clsx(`bg-gradient-to-br from-${color}-50 to-${color}-100 p-6 rounded-2xl border border-${color}-200 flex flex-col justify-between h-full`)}>
      <div>
        <div className="flex items-center gap-4 mb-2">
          <div className={clsx(`p-3 rounded-xl bg-${color}-500`)}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className={clsx(`text-sm font-medium text-${color}-700`)}>{title}</p>
            <p className={clsx("text-3xl font-bold truncate", `text-${color}-900`)}>
              {isText ? value : (typeof value === 'number' ? value.toLocaleString("pt-BR") : value)}
            </p>
          </div>
        </div>
      </div>
      {subtitle && <p className="text-sm text-gray-500 mt-1 truncate">{subtitle}</p>}
    </div>
  );
}

// Novo componente para card bloqueado
function LockedCard({ title, requiredPlan }: { title: string, requiredPlan: string }) {
  return (
    <div className="bg-gray-100 p-6 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-center h-full">
      <div className="p-3 bg-gray-300 rounded-xl mb-3">
        <Lock className="w-6 h-6 text-gray-600" />
      </div>
      <h3 className="font-bold text-gray-800">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">Disponível no plano {requiredPlan}.</p>
      <NextLink href="/dashboard/billing" className="px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg text-xs hover:opacity-90 transition-opacity">
        Fazer upgrade
      </NextLink>
    </div>
  );
}

export default function DashboardMetrics({ analytics, plan }: DashboardMetricsProps) {
  // Função para formatar o nome do referrer (como "google.com")
  const formatReferrer = (referrerSource: string | null | undefined) => {
    if (!referrerSource) return "Direto";
    try {
      const url = new URL(referrerSource);
      return url.hostname.replace("www.", "");
    } catch {
      return referrerSource;
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 md:p-8 shadow-lg max-w-7xl mx-auto mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Visão Geral</h2>
        <p className="text-gray-600">Desempenho geral dos seus links.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* --- Métricas do Plano PRO e ULTRA --- */}
        <Card
          color="blue"
          title="Cliques Totais"
          icon={MousePointerClick}
          value={analytics.totalClicks}
        />
        <Card
          color="purple"
          title="Visitantes Únicos"
          icon={Users}
          value={analytics.uniqueVisitors}
        />
        <Card
          color="green"
          title="Principal Origem"
          icon={Globe}
          value={formatReferrer(analytics.topReferrer?.source)}
          subtitle={`${analytics.topReferrer?.clicks || 0} cliques`}
          isText
        />
        <Card
          color="orange"
          title="Link Mais Popular"
          icon={LinkIcon}
          value={analytics.topLink?.title || 'N/A'}
          subtitle={`${analytics.topLink?.clicks || 0} cliques`}
          isText
        />

        {/* --- Métricas EXCLUSIVAS do Plano ULTRA --- */}
        {plan === 'ultra' ? (
          <>
            <Card
              color="red"
              title="Horário de Pico"
              icon={Clock}
              value={analytics.peakHour ? `${String(analytics.peakHour.hour).padStart(2, '0')}:00` : "N/A"}
              subtitle={`${analytics.peakHour?.clicks || 0} cliques`}
              isText
            />
            <Card
              color="indigo"
              title="Principal País"
              icon={MapPin}
              value={analytics.topCountry?.name || 'N/A'}
              subtitle={`${analytics.topCountry?.clicks || 0} cliques`}
              isText
            />
          </>
        ) : (
          <>
            {/* Cards bloqueados para o plano PRO, incentivando o upgrade para Ultra */}
            <LockedCard title="Análise de Horário de Pico" requiredPlan="Ultra" />
            <LockedCard title="Análise Geográfica Avançada" requiredPlan="Ultra" />
          </>
        )}
      </div>
    </div>
  );
}