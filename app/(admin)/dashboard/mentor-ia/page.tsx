// Em /app/(admin)/dashboard/mentor-ia/page.tsx
// (Substitua o arquivo inteiro)

import { currentUser } from "@clerk/nextjs/server";
import { getUserSubscriptionPlan } from "@/lib/subscription"; // Verifique se o caminho está correto
import { Wand2, Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ImageGenerator } from "@/components/ImageGenerator"; // Verifique se o caminho está correto

// Componente para exibir quando a funcionalidade está bloqueada
function LockedPremiumFeature() {
    return (
        <div className="flex flex-col items-center justify-center text-center p-8 min-h-[60vh] bg-gray-50 rounded-2xl border">
            <div className="p-4 bg-purple-100 rounded-full mb-4 ring-4 ring-purple-50">
                <Lock className="w-10 h-10 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-yellow-500" />
                Estúdio IA é uma ferramenta Premium
            </h2>
            <p className="text-gray-600 mt-2 max-w-xl mx-auto">
                Para criar visuais incríveis com inteligência artificial, faça o upgrade para um de nossos planos pagos. Libere sua criatividade e impulsione seu conteúdo.
            </p>
            <Button asChild className="mt-8">
                <Link href="/dashboard/billing">
                    Fazer Upgrade Agora
                </Link>
            </Button>
        </div>
    );
}

// Página principal que verifica a assinatura
export default async function ImageStudioPage() {
    const user = await currentUser();
    // Se não houver usuário, a página não renderiza nada (ou pode redirecionar)
    if (!user) return null;

    // Busca o plano de assinatura do usuário
    const subscription = await getUserSubscriptionPlan(user.id);

    // Lógica para permitir acesso a 'pro' e 'ultra'
    const hasAccess = subscription.plan === 'pro' || subscription.plan === 'ultra';

    // Lógica especial para admin (se necessário, mantenha ou remova)
    const isAdmin = user.id === "user_301NTkVsE3v48SXkoCEp0XOXifI";
    if (isAdmin) {
      // Se for admin, concede acesso total
    }

    return (
        <div className="space-y-8">
            {/* Cabeçalho da Página */}
            <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-xl">
                    <Wand2 className="w-7 h-7 text-purple-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Estúdio IA</h1>
                    <p className="text-gray-600 mt-1">
                        Crie visuais incríveis para o seu conteúdo com o poder da Inteligência Artificial.
                    </p>
                </div>
            </div>

            {/* Lógica de Acesso */}
            {hasAccess || isAdmin ? (
                <ImageGenerator />
            ) : (
                <LockedPremiumFeature />
            )}
        </div>
    );
}