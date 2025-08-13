// Em /app/(admin)/dashboard/mentor-ia/page.tsx
// (Substitua o arquivo inteiro)

import { currentUser } from "@clerk/nextjs/server";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { Wand2, Lock } from "lucide-react";
import MentorIaMvp from "@/components/MentorIaMvp";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
              Esta é uma funcionalidade premium. Faça upgrade para o plano Ultra para receber análises automáticas e completas do seu perfil e planos de conteúdo estratégicos.
            </p>
            <Button asChild className="mt-8">
              <Link href="/dashboard/billing">
                Fazer Upgrade para o Ultra
              </Link>
            </Button>
        </div>
    );
}

// A tipagem de props foi removida pois não usamos mais searchParams aqui
export default async function MentorIaPage() {
    const user = await currentUser();
    if (!user) return null;

    const subscription = await getUserSubscriptionPlan(user.id);
    const isAdmin = user.id === "user_301NTkVsE3v48SXkoCEp0XOXifI";
    const plan = isAdmin ? "ultra" : subscription.plan;

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-xl">
                    <Wand2 className="w-7 h-7 text-purple-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Mentor IA</h1>
                    <p className="text-gray-600 mt-1">Seu centro de comando para o crescimento orgânico.</p>
                </div>
            </div>
            {plan === "ultra" ? (
                <MentorIaMvp />
            ) : (
                <LockedMentorIaPage />
            )}
        </div>
    );
}