"use client";

import { AnalyticsData } from "@/lib/analytics-server";
import { SubscriptionPlan } from "@/lib/subscription";
import {
  Users,
  MousePointer,
  Globe,
  TrendingUp,
  ExternalLink,
  Calendar,
  Link,
  Clock,
  MapPin,
  Lock,
} from "lucide-react";
import clsx from "clsx";
import { ElementType } from "react";

interface DashboardMetricsProps {
  analytics: AnalyticsData;
  plan: SubscriptionPlan;
}

function DashboardMetrics({ analytics, plan }: DashboardMetricsProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

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
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-8 mb-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-xl shadow-gray-200/50">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Visão Geral</h2>
            <p className="text-gray-600">Desempenho dos últimos 30 dias</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card
              color="blue"
              title="Cliques Totais"
              icon={MousePointer}
              trendIcon={TrendingUp}
              value={analytics.totalClicks}
            />
            <Card
              color="purple"
              title="Visitantes Únicos"
              icon={Users}
              trendIcon={TrendingUp}
              value={analytics.uniqueVisitors}
            />
            {plan === "ultra" ? (
              <Card
                color="green"
                title="Países"
                icon={Globe}
                trendIcon={MapPin}
                value={analytics.countriesReached}
              />
            ) : (
              <CardLocked
                color="green"
                title="Países"
                icon={Globe}
                lockIcon={Lock}
                message="Faça upgrade para o plano Ultra"
              />
            )}
            <Card
              color="indigo"
              title="Links Clicados"
              icon={Link}
              trendIcon={ExternalLink}
              value={analytics.totalLinksClicked}
            />
            <Card
              color="orange"
              title="Última Atividade"
              icon={Calendar}
              trendIcon={Clock}
              value={formatDate(analytics.lastClick)}
              isText
            />
          </div>

          {(analytics.topLinkTitle || analytics.topReferrer) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {analytics.topLinkTitle && (
                <InsightCard
                  title="Link Mais Clicado"
                  icon={ExternalLink}
                  value={analytics.topLinkTitle}
                />
              )}
              {analytics.topReferrer && (
                <InsightCard
                  title="Maior Fonte de Tráfego"
                  icon={Globe}
                  value={formatReferrer(analytics.topReferrer)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface CardProps {
  color: string;
  title: string;
  icon: ElementType;
  trendIcon: ElementType;
  value: string | number;
  isText?: boolean;
}

function Card({
  color,
  title,
  icon: Icon,
  trendIcon: Trend,
  value,
  isText = false,
}: CardProps) {
  return (
    <div
      className={clsx(
        `bg-gradient-to-br from-${color}-50 to-${color}-100`,
        `p-6 rounded-2xl border border-${color}-200`
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={clsx(`p-3 rounded-xl`, `bg-${color}-500`)}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className={clsx(`text-${color}-600`)}>
          <Trend className="w-5 h-5" />
        </div>
      </div>
      <div>
        <p className={clsx(`text-sm font-medium mb-1`, `text-${color}-600`)}>
          {title}
        </p>
        <p
          className={clsx(
            isText ? "text-lg" : "text-3xl",
            `font-bold truncate`,
            `text-${color}-900`
          )}
        >
          {isText ? value : Number(value).toLocaleString("pt-BR")}
        </p>
      </div>
    </div>
  );
}

interface CardLockedProps {
  color: string;
  title: string;
  icon: ElementType;
  lockIcon: ElementType;
  message: string;
}

function CardLocked({
  color,
  title,
  icon: Icon,
  lockIcon: LockIcon,
  message,
}: CardLockedProps) {
  return (
    <div
      className={clsx(
        `bg-gradient-to-br from-${color}-50 to-${color}-100`,
        `p-6 rounded-2xl border border-${color}-200 opacity-75`
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={clsx(`p-3 bg-${color}-500/50 rounded-xl`)}>
          <Icon className="w-6 h-6 text-white/75" />
        </div>
        <div className={clsx(`text-${color}-600/75`)}>
          <LockIcon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <p className={clsx(`text-sm font-medium mb-1`, `text-${color}-600/75`)}>
          {title}
        </p>
        <p className={clsx(`text-xl font-bold`, `text-${color}-900/75`)}>
          {message}
        </p>
      </div>
    </div>
  );
}

interface InsightCardProps {
  title: string;
  icon: ElementType;
  value: string;
}

function InsightCard({ title, icon: Icon, value }: InsightCardProps) {
  return (
    <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 rounded-2xl border border-slate-200">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-slate-500 rounded-lg">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <h3 className="font-semibold text-slate-900">{title}</h3>
      </div>
      <p className="text-slate-700 font-medium truncate">{value}</p>
    </div>
  );
}

export default DashboardMetrics;
