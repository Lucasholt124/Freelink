"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Flame, Share, Copy, Globe } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface ShareClientProps {
  code: string;
}

export default function ShareClient({ code }: ShareClientProps) {
  const [isRegistered, setIsRegistered] = useState(false);

  const achievementData = useQuery(api.shareAchievements.getSharedAchievement, {
    shareCode: code,
  });

  const registerView = useMutation(api.shareAchievements.registerAchievementView);

  useEffect(() => {
    if (achievementData && !isRegistered) {
      registerView({ shareCode: code }).catch((err) =>
        console.error("Erro ao registrar visualização:", err)
      );
      setIsRegistered(true);
    }
  }, [achievementData, isRegistered, code, registerView]);

  if (!achievementData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-blue-900">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-blue-200 dark:bg-blue-700 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-3"></div>
          <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (achievementData?.expired) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-blue-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 text-center">
          <h1 className="text-xl font-bold mb-3 text-slate-800 dark:text-white">
            Link Expirado
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Este compartilhamento não está mais disponível.
          </p>
          <Link href="/">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              Conhecer o Mentor.IA
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const streakDays = achievementData?.streakDays ?? 0;
  const completedPosts = achievementData?.completedPosts ?? 0;
  const totalPosts = achievementData?.totalPosts ?? 1;
  const views = achievementData?.views ?? 0;

  const percentComplete = Math.round((completedPosts / totalPosts) * 100);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-blue-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-xl shadow-xl overflow-hidden">
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Conquista Desbloqueada! 🏆
          </h1>

          <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-blue-600 to-purple-700 p-6 text-white shadow-xl mb-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/20 p-2 rounded-full">
                  <Flame className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <div className="text-xs text-white/70">Sequência</div>
                  <div className="text-2xl font-bold">{streakDays} dias 🔥</div>
                </div>
              </div>

              <div className="mb-4 bg-white/10 rounded-lg p-3">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-1">{completedPosts}</div>
                  <div className="text-xs text-white/70">Posts concluídos</div>
                </div>

                <div className="mt-2 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-yellow-300"
                    style={{ width: `${percentComplete}%` }}
                  ></div>
                </div>
                <div className="text-xs text-white/70 text-center mt-1">
                  {percentComplete}% concluído
                </div>
              </div>

              <div className="text-sm text-center">
                Criado com <span className="font-bold">Mentor.IA</span> da @freelink
              </div>
            </div>

            <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full text-xs flex items-center text-slate-800">
              <Globe className="w-3 h-3 mr-1" />
              {views} visualizações
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <Share className="w-4 h-4 mr-2" />
                Criar minha sequência
              </Button>
            </Link>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                const shareText = `🔥 Sequência de ${streakDays} dias criando conteúdo! Já concluí ${completedPosts} posts com o Mentor.IA da @freelink`;
                navigator.clipboard.writeText(shareText);
                toast.success("Texto copiado para compartilhamento!");
              }}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copiar texto
            </Button>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-700/30 px-6 py-3 text-center text-xs text-slate-500 dark:text-slate-400">
          Criado com <span className="font-bold">Mentor.IA</span> da @freelink
        </div>
      </div>
    </div>
  );
}
