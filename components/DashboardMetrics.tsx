"use client";

import { AnalyticsData } from "@/lib/analytics-server";
import { Users, MousePointer, Globe, MapPin } from "lucide-react";
import clsx from "clsx";
import { ElementType } from "react";

interface DashboardMetricsProps {
  analytics: AnalyticsData;
}

// O componente agora não precisa mais do 'plan', pois a página já faz essa verificação.
export default function DashboardMetrics({ analytics }: DashboardMetricsProps) {
  const formatReferrer = (referrer: string | null) => {
    if (!referrer || referrer === "direct") return "Direto";
    try {
      const url = new URL(referrer);
      return url.hostname.replace("www.", "");
    } catch {
      return referrer;
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 md:p-8 shadow-lg max-w-7xl mx-auto mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Visão Geral</h2>
        <p className="text-gray-600">Desempenho geral dos seus links.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          color="blue"
          title="Cliques Totais"
          icon={MousePointer}
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
          title="Países Alcançados"
          icon={Globe}
          value={analytics.countriesReached}
        />
        <Card
          color="orange"
          title="Principal Origem"
          icon={MapPin}
          value={formatReferrer(analytics.topReferrer)}
          isText
        />
      </div>
    </div>
  );
}

// --- Sub-componentes ---

interface CardProps {
  color: string;
  title: string;
  icon: ElementType;
  value: string | number;
  isText?: boolean;
}

function Card({ color, title, icon: Icon, value, isText = false }: CardProps) {
  return (
    <div className={clsx(`bg-gradient-to-br from-${color}-50 to-${color}-100 p-6 rounded-2xl border border-${color}-200`)}>
      <div className="flex items-center gap-4">
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
  );
}
