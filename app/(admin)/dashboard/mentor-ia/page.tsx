import { currentUser } from "@clerk/nextjs/server";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { Wand2, Lock, Sparkles, Crown } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ImageGenerator } from "@/components/ImageGenerator";

// Componente para exibir quando a funcionalidade está bloqueada
function LockedPremiumFeature() {
    return (
        <div className="flex flex-col items-center justify-center text-center p-8 min-h-[60vh] bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-100">
            <div className="relative">
                <div className="p-5 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full mb-4 ring-4 ring-purple-50/50">
                    <Lock className="w-12 h-12 text-purple-600" />
                </div>
                <div className="absolute -top-2 -right-2 p-2 bg-yellow-100 rounded-full">
                    <Crown className="w-5 h-5 text-yellow-600" />
                </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mt-4">
                <Sparkles className="w-6 h-6 text-yellow-500" />
                Estúdio IA é exclusivo do Plano Ultra
                <Sparkles className="w-6 h-6 text-yellow-500" />
            </h2>

            <p className="text-gray-600 mt-3 max-w-xl mx-auto leading-relaxed">
                Esta poderosa ferramenta de geração de imagens com IA está disponível apenas para assinantes Ultra.
                Crie visuais profissionais ilimitados para suas redes sociais!
            </p>

            <div className="mt-8 space-y-3 text-center">
                <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                    <Link href="/dashboard/billing" className="flex items-center gap-2">
                        <Crown className="w-5 h-5" />
                        Fazer Upgrade para Ultra
                    </Link>
                </Button>

                <p className="text-sm text-gray-500">
                    Cancele a qualquer momento • Sem compromisso
                </p>
            </div>
        </div>
    );
}

// Página principal que verifica a assinatura
export default async function ImageStudioPage() {
    const user = await currentUser();

    // Se não houver usuário, não renderiza nada
    if (!user) return null;

    // Busca o plano de assinatura do usuário
    const subscription = await getUserSubscriptionPlan(user.id);

    // Verifica se é admin
    const isAdmin = user.id === "user_301NTkVsE3v48SXkoCEp0XOXifI";

    // Acesso liberado APENAS para plano Ultra ou Admin
    const hasAccess = subscription.plan === 'ultra' || isAdmin;

    return (
        <div className="space-y-8">
            {/* Cabeçalho da Página */}
            <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl">
                    <Wand2 className="w-7 h-7 text-purple-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Estúdio IA
                        {hasAccess && (
                            <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                <Crown className="w-3 h-3 mr-1" />
                                {isAdmin ? 'Admin' : 'Ultra'}
                            </span>
                        )}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Crie imagens profissionais, remova fundos, gere vídeos virais com legendas e muito mais!
                Tudo com IA de última geração.
                    </p>
                </div>
            </div>

            {/* Lógica de Acesso */}
            {hasAccess ? (
                <ImageGenerator />
            ) : (
                <LockedPremiumFeature />
            )}
        </div>
    );
}