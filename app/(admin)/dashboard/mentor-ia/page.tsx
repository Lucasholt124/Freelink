// Em app/(admin)/dashboard/mentor-ia/page.tsx
// (Substitua o arquivo inteiro)

import { currentUser } from "@clerk/nextjs/server";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { Wand2, Info, CheckCircle, XCircle, Lock } from "lucide-react";
import MentorIaMvp from "@/components/MentorIaMvp";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Componente de Alerta genérico (sem alterações)
function Alert({ type, title, message }: { type: 'info' | 'success' | 'error', title: string, message: string }) {
    const styles = {
        info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: <Info className="w-5 h-5 text-blue-600" />, title: 'text-blue-800', message: 'text-blue-700' },
        success: { bg: 'bg-green-50', border: 'border-green-200', icon: <CheckCircle className="w-5 h-5 text-green-600" />, title: 'text-green-800', message: 'text-green-700' },
        error: { bg: 'bg-red-50', border: 'border-red-200', icon: <XCircle className="w-5 h-5 text-red-600" />, title: 'text-red-800', message: 'text-red-700' },
    };
    const style = styles[type];
    return ( <div className={`mb-6 p-4 ${style.bg} ${style.border} rounded-lg flex items-center gap-3`}> {style.icon} <div> <p className={`font-semibold ${style.title}`}>{title}</p> <p className={`text-sm ${style.message}`}>{message}</p> </div> </div> );
}

// =======================================================
// NOVO COMPONENTE DE PAYWALL ESPECÍFICO PARA ESTA PÁGINA
// =======================================================
function LockedMentorIaPage() {
    return (
        <div className="flex flex-col items-center justify-center text-center p-8 min-h-[60vh] bg-gray-50 rounded-2xl">
            <div className="p-4 bg-purple-100 rounded-full mb-4">
                <Lock className="w-10 h-10 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
                Mentor IA (Plano Ultra)
            </h2>
            <p className="text-gray-600 mt-2 max-w-xl mx-auto">
              Esta é uma funcionalidade premium. Faça upgrade para o plano Ultra para receber análises automáticas e completas do seu perfil, plano de conteúdo semanal e muito mais para decolar.
            </p>
            <Button asChild className="mt-8">
              <Link href="/dashboard/billing">
                Fazer Upgrade para o Ultra
              </Link>
            </Button>
        </div>
    );
}

// Tipagem para searchParams, necessária para o build da Vercel
interface MentorIaPageProps {
    params: Promise<Record<string, string>>;
    searchParams: Promise<{ [key:string]: string | string[] | undefined }>;
}

export default async function MentorIaPage({ searchParams }: MentorIaPageProps) {
    const user = await currentUser();
    if (!user) return null;

    const resolvedSearchParams = await searchParams;
    const status = resolvedSearchParams.status as string | undefined;

    // `subscription` é o objeto { plan: 'free' | 'pro' | 'ultra', ... }
    const subscription = await getUserSubscriptionPlan(user.id);

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 rounded-xl">
                        <Wand2 className="w-7 h-7 text-purple-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Mentor IA</h1>
                        <p className="text-gray-600 mt-1">Sua central de inteligência para o Instagram.</p>
                    </div>
                </div>
            </div>

            {status === 'connected' && <Alert type="success" title="Conectado com Sucesso!" message="Sua conta foi vinculada." />}
            {status === 'error' && <Alert type="error" title="Erro na Conexão" message="Não foi possível conectar sua conta." />}

            {/*
              =======================================================
              LÓGICA DE PAYWALL SIMPLES E DIRETA
              =======================================================
              Verificamos se o plano é 'ultra'. Se for, mostra a ferramenta.
              Se não for, mostra a página de bloqueio.
            */}
            {subscription.plan === "ultra" ? (
                <MentorIaMvp
                    planName={subscription.plan}
                    usageCount={subscription.mentorIaUsageCount}
                />
            ) : (
                <LockedMentorIaPage />
            )}
        </div>
    );
}