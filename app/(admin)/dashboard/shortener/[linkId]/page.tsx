// Em app/dashboard/shortener/[linkId]/page.tsx
// (Substitua o arquivo inteiro)

import { notFound } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import type { FunctionReturnType } from "convex/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart2, Clock, Globe } from "lucide-react";

type QueryOutput = FunctionReturnType<typeof api.shortLinks.getClicksForLink>;
type LinkData = NonNullable<QueryOutput>['link'];
type ClickData = NonNullable<QueryOutput>['clicks'][number];

function ClicksList({ clicks }: { clicks: ClickData[] }) {
    if (clicks.length === 0) {
        return (
            <div className="text-center text-gray-500 py-10">
                <p>Este link ainda não recebeu nenhum clique.</p>
                <p className="text-sm">Compartilhe-o para começar a ver as análises!</p>
            </div>
        );
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

interface ShortLinkDetailsPageProps {
  params: Promise<{ linkId: string }>;
}

export default async function ShortLinkDetailsPage({ params }: ShortLinkDetailsPageProps) {
    const user = await currentUser();
    if (!user) return notFound();

    const { linkId } = await params;

    const subscription = await getUserSubscriptionPlan(user.id);
    if (subscription.plan !== 'ultra') {
        return notFound();
    }

    const data = await fetchQuery(api.shortLinks.getClicksForLink, { shortLinkId: linkId });

    if (!data || !data.link) {
        return notFound();
    }

    const link: LinkData = data.link;
    const clicks: ClickData[] = data.clicks;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <Button asChild variant="ghost" className="-ml-4 text-gray-600">
                    <Link href="/dashboard/shortener"><ArrowLeft className="w-4 h-4 mr-2" /> Voltar</Link>
                </Button>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
                <div className="flex items-center gap-4 min-w-0">
                    <div className="p-3 bg-purple-100 rounded-xl"><BarChart2 className="w-7 h-7 text-purple-600" /></div>
                    <div className="min-w-0">
                        <h1 className="text-2xl sm:text-3xl font-bold truncate" title={link.id}>freelinnk.com/r/{link.id}</h1>
                        <p className="text-gray-500 truncate" title={link.url}>{link.url}</p>
                    </div>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg text-center w-full sm:w-auto flex-shrink-0">
                    <p className="text-3xl font-bold">{clicks.length}</p>
                    <p className="text-sm text-gray-600">Cliques Totais</p>
                </div>
            </div>
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border">
                <h2 className="text-xl font-semibold mb-4">Registro de Cliques Recentes</h2>
                <ClicksList clicks={clicks} />
            </div>
        </div>
    );
}