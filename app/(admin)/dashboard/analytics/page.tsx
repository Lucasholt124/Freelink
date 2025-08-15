"use client";

import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, Globe } from "lucide-react";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type AnalyticsData = {
  totalClicks: number;
  uniqueVisitors: number;
  topCountry: { name: string; clicks: number };
};

function Card({
  color,
  title,
  value,
  icon: Icon,
}: {
  color: "blue" | "purple" | "green";
  title: string;
  value: string | number;
  icon: React.ElementType;
}) {
  const borderColor = {
    blue: "border-blue-500",
    purple: "border-purple-500",
    green: "border-green-500",
  }[color];

  const iconColor = {
    blue: "text-blue-400",
    purple: "text-purple-400",
    green: "text-green-400",
  }[color];

  return (
    <div
      className={clsx(
        "bg-white p-6 rounded-xl border-l-4 shadow-sm",
        borderColor
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <Icon className={clsx("w-5 h-5", iconColor)} />
      </div>
      <p className="text-4xl font-bold mt-2 truncate">{value}</p>
    </div>
  );
}

function LockedCard({
  title,
  requiredPlan,
  icon: Icon,
}: {
  title: string;
  requiredPlan: string;
  icon: React.ElementType;
}) {
  return (
    <div className="bg-gray-50 p-6 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center h-full">
      <Icon className="w-6 h-6 text-gray-400 mb-3" />
      <p className="font-semibold text-gray-700">{title}</p>
      <p className="text-xs text-gray-500 mb-3">Disponível no plano {requiredPlan}</p>
      <Button
        asChild
        size="sm"
        className="focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1"
      >
        <Link href="/dashboard/billing">Fazer Upgrade</Link>
      </Button>
    </div>
  );
}

function AnalyticsMetrics({
  data,
  plan,
}: {
  data: AnalyticsData | null;
  plan: string;
}) {
  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-28 bg-gray-200 rounded-xl" />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card
        color="blue"
        title="Cliques Totais (Todos os Links)"
        icon={BarChart3}
        value={data.totalClicks}
      />
      {plan === "pro" || plan === "ultra" ? (
        <Card
          color="purple"
          title="Visitantes Únicos"
          icon={Users}
          value={data.uniqueVisitors}
        />
      ) : (
        <LockedCard title="Visitantes Únicos" requiredPlan="Pro" icon={Users} />
      )}
      {plan === "ultra" ? (
        <Card
          color="green"
          title="Principal País"
          icon={Globe}
          value={data.topCountry.name}
        />
      ) : (
        <LockedCard title="Principal País" requiredPlan="Ultra" icon={Globe} />
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  const { user, isLoaded } = useUser();
  const getAnalytics = useAction(api.analytics.getDashboardAnalytics);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    if (isLoaded) {
      getAnalytics({})
        .then(setAnalyticsData)
        .catch((err) => toast.error(err.message));
    }
  }, [isLoaded, getAnalytics]);

  const isAdmin = user?.id === "user_301NTkVsE3v48SXkoCEp0XOXifI";
  const userPlan = (user?.publicMetadata?.subscriptionPlan as string) ?? "free";
  const plan = isAdmin ? "ultra" : userPlan;

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <header className="flex items-center gap-4">
        <div className="p-3 bg-blue-100 rounded-xl">
          <BarChart3 className="w-7 h-7 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Análises Gerais</h1>
          <p className="text-gray-600 mt-1">
            A visão completa do desempenho de todos os seus links.
          </p>
        </div>
      </header>

      <AnalyticsMetrics data={analyticsData} plan={plan} />

      <section className="bg-white p-6 rounded-xl border shadow-sm min-h-[300px] flex items-center justify-center">
        <p className="text-gray-400 text-center">
          Gráficos detalhados de desempenho aparecerão aqui em breve.
        </p>
      </section>
    </div>
  );
}