// components/brain/SettingsModal.tsx - VERSÃO MOBILE-FIRST COMPLETA
"use client";

import { Bell, BellOff, Check, Loader2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePushNotifications } from "@/app/hooks/usePushNotifications";
import { cn } from "@/lib/utils";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 sm:p-6 border-b">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Settings className="w-5 h-5" />
            Configurações do FreelinkBrain
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Configure como você quer receber notificações
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-4 p-4 sm:p-6">
            {/* Notificações Push */}
            <Card className={cn(
              "p-4 sm:p-6 border-2 transition-all",
              isSubscribed ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20" : "border-gray-200 dark:border-gray-800"
            )}>
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={cn(
                      "p-2 sm:p-3 rounded-full transition-colors",
                      isSubscribed ? "bg-green-500" : "bg-purple-500"
                    )}>
                      <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base sm:text-lg">Notificações Push</h3>
                      {isSubscribed && (
                        <Badge className="bg-green-500 text-white mt-1 text-xs">
                          <Check className="w-3 h-3 mr-1" />
                          Ativo
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Descrição */}
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Receba um alerta no seu celular ou computador quando for
                  hora de postar seu conteúdo agendado.
                </p>

                {/* Status de Suporte */}
                {!isSupported && (
                  <Badge variant="destructive" className="text-xs w-full justify-center py-2">
                    ⚠️ Seu navegador não suporta notificações
                  </Badge>
                )}

                {/* Controles */}
                {isSupported && (
                  <div className="space-y-3 sm:space-y-4">
                    {isSubscribed ? (
                      <>
                        {/* Status Ativo */}
                        <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="flex items-start gap-2 sm:gap-3">
                            <Check className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-xs sm:text-sm font-semibold text-green-800 dark:text-green-200 mb-1">
                                Tudo pronto! 🎉
                              </p>
                              <p className="text-xs text-green-700 dark:text-green-300">
                                Você receberá notificações em tempo real quando for hora de postar
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Botão Desativar */}
                        <Button
                          variant="outline"
                          onClick={unsubscribe}
                          disabled={isLoading}
                          className="w-full h-11 sm:h-12 text-sm sm:text-base"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Desativando...
                            </>
                          ) : (
                            <>
                              <BellOff className="w-4 h-4 mr-2" />
                              Desativar Notificações
                            </>
                          )}
                        </Button>
                      </>
                    ) : (
                      <>
                        {/* Alerta de Ativação */}
                        <div className="p-3 sm:p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                          <div className="flex items-start gap-2 sm:gap-3">
                            <div className="text-2xl flex-shrink-0">⚠️</div>
                            <div className="flex-1">
                              <p className="text-xs sm:text-sm font-semibold text-amber-800 dark:text-amber-200 mb-1">
                                Não perca a hora de postar!
                              </p>
                              <p className="text-xs text-amber-700 dark:text-amber-300">
                                Ative as notificações para ser avisado no momento certo
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Botão Ativar */}
                        <Button
                          onClick={subscribe}
                          disabled={isLoading}
                          className="w-full h-12 sm:h-14 text-sm sm:text-base bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                              Ativando...
                            </>
                          ) : (
                            <>
                              <Bell className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                              Ativar Notificações
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Como Funciona */}
            <Card className="p-4 sm:p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-2 border-purple-200 dark:border-purple-800">
              <div className="space-y-3 sm:space-y-4">
                <h4 className="font-bold text-sm sm:text-base flex items-center gap-2">
                  <span className="text-xl">📱</span>
                  Como funciona?
                </h4>
                <ol className="text-xs sm:text-sm text-muted-foreground space-y-2 sm:space-y-2.5 list-decimal list-inside leading-relaxed">
                  <li>Você agenda um post no FreelinkBrain</li>
                  <li>Na hora marcada, recebe uma notificação</li>
                  <li>Clica na notificação e vai direto para a página do post</li>
                  <li>Baixa o vídeo, copia a legenda e posta manualmente</li>
                </ol>
                <div className="p-3 bg-white/50 dark:bg-black/20 rounded-lg border border-purple-300/50 dark:border-purple-700/50">
                  <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-300 font-medium flex items-start gap-2">
                    <span className="text-base">✨</span>
                    <span className="flex-1">
                      <strong>100% seguro</strong> - você controla quando e como postar!
                    </span>
                  </p>
                </div>
              </div>
            </Card>

            {/* Info Adicional para Mobile */}
            <div className="sm:hidden p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
                💡 <strong>Dica:</strong> Mantenha as notificações ativadas para não esquecer de postar
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}