// Em app/(admin)/dashboard/mentor-ia/page.tsx
// (Substitua o arquivo inteiro)

import { currentUser } from "@clerk/nextjs/server";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { Wand2, Info, CheckCircle, XCircle } from "lucide-react";
import MentorIaMvp from "@/components/MentorIaMvp";

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
// CORREÇÃO APLICADA AQUI
// =======================================================
// Em vez de `Promise<{}>`, usamos um tipo mais específico e recomendado.
// Isso satisfaz a regra do ESLint e mantém a compatibilidade com o build da Vercel.
interface MentorIaPageProps {
    params: Promise<Record<string, string>>; // 'Record<string, string>' é um objeto com chaves e valores de string.
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MentorIaPage({ searchParams }: MentorIaPageProps) {
    const user = await currentUser();
    if (!user) return null;

    // Resolvemos a Promise dos searchParams ANTES de tentar acessar suas propriedades.
    const resolvedSearchParams = await searchParams;
    const status = resolvedSearchParams.status as string | undefined;

    // O resto da sua lógica já está correto.
    const subscription = await getUserSubscriptionPlan(user.id);

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 rounded-xl">
                        <Wand2 className="w-7 h-7 text-purple-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Mentor IA</h1>
                        <p className="text-gray-600 mt-1">Sua central de inteligência para decolar no Instagram.</p>
                    </div>
                </div>
            </div>

            {status === 'connected' && <Alert type="success" title="Conectado com Sucesso!" message="Sua conta do Instagram foi vinculada. Agora você pode usar as ferramentas de IA!" />}
            {status === 'error' && <Alert type="error" title="Erro na Conexão" message="Não foi possível conectar sua conta. Por favor, tente novamente a partir das configurações." />}

            <MentorIaMvp
                planName={subscription.plan}
                usageCount={subscription.mentorIaUsageCount}
            />
        </div>
    );
}