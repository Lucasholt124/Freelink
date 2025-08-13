// Em /app/dashboard/shortener/[linkId]/page.tsx
// (Substitua o arquivo inteiro)

"use client";

import { useState, useEffect } from 'react';
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart2, Clock, Globe, Users } from "lucide-react";
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import clsx from 'clsx';

// --- Tipos ---
type LinkData = { id: string; url: string; };
type ClickData = { id: number; timestamp: number; country: string | null; visitorId: string; };
type PageData = { link: LinkData; clicks: ClickData[]; };

// --- Componentes Filhos ---
function ClicksList({ clicks }: { clicks: ClickData[] }) {
    if (clicks.length === 0) {
        return <div className="text-center text-gray-500 py-10">Este link ainda não recebeu cliques.</div>;
    }
    return (
        <div className="space-y-3">
            {clicks.map(click => (
                <div key={click.id} className="bg-gray-50 p-3 rounded-md border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                        <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <p className="text-sm text-gray-800">Clique de <span className="font-semibold">{click.country || "local desconhecido"}</span></p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(click.timestamp).toLocaleString('pt-BR')}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}

function AnalyticsMetrics({ clicks, plan }: { clicks: ClickData[]; plan: string }) {
    const uniqueVisitors = new Set(clicks.map(c => c.visitorId)).size;

    const calculateTopCountry = () => {
        if (clicks.length === 0) return "N/A";
        const countryCounts = clicks.reduce((acc, click) => {
            if (click.country) {
                acc[click.country] = (acc[click.country] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        const topCountry = Object.entries(countryCounts).sort((a, b) => b[1] - a[1])[0];
        return topCountry ? topCountry[0] : "N/A";
    };
    const topCountryName = calculateTopCountry();

    const Card = ({ title, value, color, icon: Icon }: { title: string; value: string | number; color: string; icon: React.ElementType }) => (
        <div className={clsx("bg-white p-4 rounded-lg border-l-4", `border-${color}-500`, `shadow-sm`)}>
            <div className="flex items-center gap-3">
                <Icon className={clsx("w-6 h-6", `text-${color}-500`)} />
                <div><p className="text-sm text-gray-500">{title}</p><p className="text-2xl font-bold">{value}</p></div>
            </div>
        </div>
    );
    const LockedCard = ({ title, requiredPlan, icon: Icon }: { title: string; requiredPlan: string; icon: React.ElementType }) => (
        <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-center h-full">
            <Icon className="w-5 h-5 text-gray-400 mb-2" /><p className="text-sm font-semibold">{title}</p><p className="text-xs text-gray-500">Plano {requiredPlan}</p>
            <Button asChild size="sm" variant="link" className="h-auto p-0 mt-1 text-xs"><Link href="/dashboard/billing">Fazer Upgrade</Link></Button>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card color="blue" title="Cliques Totais" icon={BarChart2} value={clicks.length} />
            {plan === 'pro' || plan === 'ultra' ? (
                <Card color="purple" title="Visitantes Únicos" icon={Users} value={uniqueVisitors} />
            ) : (<LockedCard title="Visitantes Únicos" requiredPlan="Pro" icon={Users} />)}
            {plan === 'ultra' ? (
                <Card color="green" title="Principal País" icon={Globe} value={topCountryName} />
            ) : (<LockedCard title="Principal País" requiredPlan="Ultra" icon={Globe} />)}
        </div>
    );
}

export default function ShortLinkDetailsPage() {
    const params = useParams();
    const linkId = params.linkId as string;
    const { user } = useUser();
    const [data, setData] = useState<PageData | undefined | null>(undefined);

    useEffect(() => {
        if (linkId) {
            fetch(`/api/shortener/${linkId}`)
                .then(res => {
                    if (!res.ok) throw new Error("Falha ao buscar dados");
                    return res.json();
                })
                .then(setData)
                .catch(() => {
                    toast.error("Não foi possível carregar os detalhes do link.");
                    setData(null);
                });
        }
    }, [linkId]);

    const isAdmin = user?.id === "user_301NTkVsE3v48SXkoCEp0XOXifI";
    const userPlan = (user?.publicMetadata?.subscriptionPlan as string) ?? "free";
    const plan = isAdmin ? "ultra" : userPlan;

    if (plan !== 'ultra') { return notFound(); }
    if (data === undefined) { return <div>Carregando...</div>; }
    if (data === null) { return <div>Link não encontrado ou acesso negado.</div>; }

    const { link, clicks } = data;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div><Button asChild variant="ghost" className="-ml-4 text-gray-600"><Link href="/dashboard/shortener"><ArrowLeft className="w-4 h-4 mr-2" /> Voltar</Link></Button></div>
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
                <div className="flex items-center gap-4 min-w-0">
                    <div className="p-3 bg-purple-100 rounded-xl"><BarChart2 className="w-7 h-7 text-purple-600" /></div>
                    <div className="min-w-0">
                        <h1 className="text-2xl sm:text-3xl font-bold truncate" title={link.id}>freelinnk.com/r/{link.id}</h1>
                        <p className="text-gray-500 truncate" title={link.url}>{link.url}</p>
                    </div>
                </div>
            </div>

            <section>
                <AnalyticsMetrics clicks={clicks} plan={plan} />
            </section>

            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border">
                <h2 className="text-xl font-semibold mb-4">Registro de Cliques Recentes</h2>
                <ClicksList clicks={clicks} />
            </div>
        </div>
    );
}