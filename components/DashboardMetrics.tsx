// Em /components/DashboardMetrics.tsx
// (Substitua o arquivo inteiro)

"use client";

import type { AnalyticsData } from "@/lib/analytics-server";
import { Users, MousePointerClick, Globe, Link as LinkIcon, Clock, MapPin, Lock, Activity } from "lucide-react";
import clsx from "clsx";
import type { ElementType } from "react";
import NextLink from "next/link";

interface DashboardMetricsProps {
  analytics: AnalyticsData;
  plan: "free" | "pro" | "ultra";
}

function Card({ color, title, icon: Icon, value, subtitle, isText = false }: { color: string; title: string; icon: ElementType; value: string | number; subtitle?: string; isText?: boolean; }) {
  return (
    <div className={clsx(`bg-gradient-to-br from-${color}-50 to-${color}-100 p-6 rounded-2xl border border-${color}-200 flex flex-col justify-between h-full`)}>
      <div>
        <div className="flex items-start gap-4 mb-2">
          <div className={clsx(`p-3 rounded-xl bg-${color}-500 flex-shrink-0`)}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <p className={clsx(`text-sm font-medium text-${color}-700`)}>{title}</p>
            <p className={clsx(
              "font-bold",
              `text-${color}-900`,
              isText ? "text-2xl whitespace-normal break-words" : "text-3xl",
              "truncate"
            )}>
              {isText ? value : (typeof value === 'number' ? value.toLocaleString("pt-BR") : value)}
            </p>
          </div>
        </div>
      </div>
      {subtitle && <p className="text-sm text-gray-500 mt-2 truncate">{subtitle}</p>}
    </div>
  );
}

function LockedCard({ title, requiredPlan }: { title: string, requiredPlan: string }) {
  return (
    <div className="bg-gray-100 p-6 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-center h-full min-h-[150px]">
      <div className="p-3 bg-gray-300 rounded-xl mb-3"><Lock className="w-6 h-6 text-gray-600" /></div>
      <h3 className="font-bold text-gray-800">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">Disponível no plano {requiredPlan}.</p>
      <NextLink href="/dashboard/billing" className="px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg text-xs hover:opacity-90 transition-opacity">
        Fazer upgrade
      </NextLink>
    </div>
  );
}

export default function DashboardMetrics({ analytics, plan }: DashboardMetricsProps) {

  const formatReferrer = (referrerSource: string | null | undefined): string => {
    if (!referrerSource || referrerSource.toLowerCase() === "direto") {
      return "Direto";
    }
    let hostname: string;
    try {
      hostname = new URL(referrerSource).hostname;
    } catch {
      hostname = referrerSource;
    }
    hostname = hostname.replace(/^(www\.|m\.|l\.|mobile\.|out\.|web\.)/, "");
    const friendlyNames: Record<string, string> = {
      "t.co": "Twitter (X)", "twitter.com": "Twitter (X)", "instagram.com": "Instagram", "facebook.com": "Facebook", "youtube.com": "YouTube",
      "linkedin.com": "LinkedIn", "pinterest.com": "Pinterest", "tiktok.com": "TikTok", "reddit.com": "Reddit", "whatsapp.com": "WhatsApp",
      "wa.me": "WhatsApp", "t.me": "Telegram", "discord.com": "Discord", "google.com": "Google", "bing.com": "Bing", "duckduckgo.com": "DuckDuckGo",
      "yahoo.com": "Yahoo!", "github.com": "GitHub", "substack.com": "Substack", "medium.com": "Medium", "behance.net": "Behance",
      "dribbble.com": "Dribbble", "twitch.tv": "Twitch", "notion.so": "Notion",
    };
    return friendlyNames[hostname] || (hostname.charAt(0).toUpperCase() + hostname.slice(1));
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 md:p-8 shadow-lg max-w-7xl mx-auto mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Visão Geral</h2>
        <p className="text-gray-600">
          {plan === 'free'
            ? 'Veja o total de cliques nos seus links e libere mais análises com um upgrade.'
            : 'Desempenho geral dos seus links.'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

        {/* --- Card disponível para TODOS os planos --- */}
        <Card
          color="blue"
          title="Cliques Totais"
          icon={MousePointerClick}
          value={analytics.totalClicks}
        />

        {/* --- Cards disponíveis para PRO e ULTRA --- */}
        {plan === 'pro' || plan === 'ultra' ? (
          <>
            <Card color="teal" title="Última Atividade" icon={Activity} value={analytics.lastActivity || "Nenhuma"} subtitle="Último clique registrado" isText />
            <Card color="purple" title="Visitantes Únicos" icon={Users} value={analytics.uniqueVisitors} />
            <Card color="green" title="Principal Origem" icon={Globe} value={formatReferrer(analytics.topReferrer?.source)} subtitle={`${analytics.topReferrer?.clicks || 0} cliques`} isText />
          </>
        ) : (
          <>
            {/* Cards bloqueados para o plano FREE */}
            <LockedCard title="Última Atividade" requiredPlan="Pro" />
            <LockedCard title="Visitantes Únicos" requiredPlan="Pro" />
            <LockedCard title="Principal Origem" requiredPlan="Pro" />
          </>
        )}

        {/* --- Cards exclusivos para o plano ULTRA --- */}
        {plan === 'ultra' ? (
          <>
            <Card color="orange" title="Link Mais Popular" icon={LinkIcon} value={analytics.topLink?.title || 'N/A'} subtitle={`${analytics.topLink?.clicks || 0} cliques`} isText />
            <Card color="red" title="Horário de Pico" icon={Clock} value={analytics.peakHour ? `${String(analytics.peakHour.hour).padStart(2, '0')}:00` : "N/A"} subtitle={`${analytics.peakHour?.clicks || 0} cliques`} isText />
            <Card color="indigo" title="Principal País" icon={MapPin} value={analytics.topCountry?.name || 'N/A'} subtitle={`${analytics.topCountry?.clicks || 0} cliques`} isText />
          </>
        ) : (
          <>
            {/* Cards bloqueados se NÃO for Ultra (isso vale para o Free e para o Pro) */}
            <LockedCard title="Link Mais Popular" requiredPlan="Ultra" />
            <LockedCard title="Horário de Pico" requiredPlan="Ultra" />
            <LockedCard title="Principal País" requiredPlan="Ultra" />
          </>
        )}
      </div>
    </div>
  );
}