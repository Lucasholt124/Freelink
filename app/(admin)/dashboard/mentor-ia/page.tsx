// Em app/dashboard/mentor-ia/page.tsx
// (Substitua o arquivo inteiro)

import { currentUser } from "@clerk/nextjs/server";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import Link from "next/link";
import { Instagram, Wand2, Info, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import MentorIaMvp from "@/components/MentorIaMvp";
import UpgradePaywall from "@/components/UpgradePaywall";

// Componente de Alerta genérico
function Alert({ type, title, message }: { type: 'info' | 'success' | 'error', title: string, message: string }) {
    const styles = {
        info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: <Info className="w-5 h-5 text-blue-600" />, title: 'text-blue-800', message: 'text-blue-700' },
        success: { bg: 'bg-green-50', border: 'border-green-200', icon: <CheckCircle className="w-5 h-5 text-green-600" />, title: 'text-green-800', message: 'text-green-700' },
        error: { bg: 'bg-red-50', border: 'border-red-200', icon: <XCircle className="w-5 h-5 text-red-600" />, title: 'text-red-800', message: 'text-red-700' },
    };
    const style = styles[type];

    return (
        <div className={`mb-6 p-4 ${style.bg} ${style.border} rounded-lg flex items-center gap-3`}>
            {style.icon}
            <div>
                <p className={`font-semibold ${style.title}`}>{title}</p>
                <p className={`text-sm ${style.message}`}>{message}</p>
            </div>
        </div>
    );
}

export default async function MentorIaPage({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
    const user = await currentUser();
    if (!user) return null;

    const planName = await getUserSubscriptionPlan(user.id);
    const isPaidUser = planName === 'pro' || planName === 'ultra';
    const status = searchParams.status;

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3"><Wand2 className="w-8 h-8 text-purple-600" /> Mentor IA</h1>
                    <p className="text-gray-600 mt-1">Sua central de inteligência para decolar no Instagram.</p>
                </div>
                <Button asChild className="mt-4 sm:mt-0">
                    <Link href="/api/connect/instagram">
                        <Instagram className="w-4 h-4 mr-2" /> Conectar com Instagram
                    </Link>
                </Button>
            </div>

            {status === 'connected' && <Alert type="success" title="Conectado com Sucesso!" message="Sua conta do Instagram foi vinculada. Em breve, a análise automática será ativada." />}
            {status === 'error' && <Alert type="error" title="Erro na Conexão" message="Não foi possível conectar sua conta. Por favor, tente novamente." />}
            {status === 'coming_soon' && <Alert type="info" title="Funcionalidade em Breve" message="A integração real com o Instagram está em desenvolvimento." />}

            {isPaidUser ? (
                <MentorIaMvp />
            ) : (
                <UpgradePaywall
                    title="Desbloqueie seu Mentor com IA"
                    description="Este é um recurso premium. Faça upgrade para o plano Pro ou Ultra e receba análises completas, plano de conteúdo semanal e muito mais para decolar seu perfil."
                />
            )}
        </div>
    );
}