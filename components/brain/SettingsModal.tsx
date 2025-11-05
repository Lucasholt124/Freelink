// components/brain/SettingsModal.tsx - COM ALTERNATIVA EMAIL
"use client";

import {
  Bell, BellOff, Check, Loader2, Settings, Smartphone,
  Download, Mail, AlertTriangle, ExternalLink, Info
} from "lucide-react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
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
    isIOS,
    isPWA,
    browserName,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[550px] max-h-[90vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 sm:p-6 border-b">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Settings className="w-5 h-5" />
            Configurações de Notificações
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {isIOS && (
              <span className="flex items-center gap-1 text-amber-600 font-medium">
                <Smartphone className="w-3.5 h-3.5" />
                Você está usando {browserName} no iOS
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-4 p-4 sm:p-6">
            {/* ✅ ALERTA PARA iOS - MAIS DIRETO */}
            {isIOS && !isPWA && (
              <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <AlertDescription className="text-xs sm:text-sm space-y-2">
                  <p className="font-semibold text-amber-900 dark:text-amber-100">
                    🚫 Notificações Push não funcionam no {browserName}
                  </p>
                  <p className="text-amber-800 dark:text-amber-200">
                    A Apple bloqueia notificações push em todos os navegadores do iOS
                    (Chrome, Firefox, Safari) <strong>exceto quando instalado como app</strong>.
                  </p>
                  <div className="pt-2 space-y-2">
                    <p className="font-medium text-amber-900 dark:text-amber-100 text-xs">
                      ✅ Solução recomendada:
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                      asChild
                    >
                      <a
                        href="https://support.apple.com/pt-br/guide/iphone/iph42ab2f3a7/ios"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Como instalar o app no iPhone</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* MÉTODO PRINCIPAL: Push Notifications */}
            <Card className={cn(
              "p-4 sm:p-6 border-2 transition-all",
              isSubscribed
                ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20"
                : isIOS && !isPWA
                  ? "border-gray-300 dark:border-gray-700 opacity-60"
                  : "border-purple-200 dark:border-purple-800"
            )}>
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={cn(
                      "p-2 sm:p-3 rounded-full transition-colors",
                      isSubscribed ? "bg-green-500" : "bg-purple-500"
                    )}>
                      <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                        Notificações Push
                        {isSubscribed && (
                          <Badge className="bg-green-500 text-white text-xs">
                            <Check className="w-3 h-3 mr-1" />
                            Ativo
                          </Badge>
                        )}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {isIOS && !isPWA
                          ? "Não disponível no seu navegador"
                          : "Alertas instantâneos no navegador"
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {!isSupported && !isIOS && (
                  <Badge variant="destructive" className="text-xs w-full justify-center py-2">
                    ⚠️ Seu navegador não suporta notificações push
                  </Badge>
                )}

                {(isSupported || (isIOS && isPWA)) && (
                  <div className="space-y-3">
                    {isSubscribed ? (
                      <>
                        <Alert className="border-green-500/50 bg-green-50 dark:bg-green-950/30">
                          <Check className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-xs sm:text-sm text-green-800 dark:text-green-200">
                            Você receberá alertas instantâneos quando for hora de postar!
                          </AlertDescription>
                        </Alert>

                        <Button
                          variant="outline"
                          onClick={unsubscribe}
                          disabled={isLoading}
                          className="w-full h-11 sm:h-12"
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
                      <Button
                        onClick={subscribe}
                        disabled={isLoading || (isIOS && !isPWA)}
                        className="w-full h-12 sm:h-14 text-sm sm:text-base bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                            Ativando...
                          </>
                        ) : (
                          <>
                            <Bell className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                            {isIOS && !isPWA ? "Instale o app primeiro" : "Ativar Notificações Push"}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* ✅ ALTERNATIVA: Lembrete Manual */}
            {isIOS && !isPWA && (
              <Card className="p-4 sm:p-6 border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-base">Enquanto isso...</h3>
                  </div>
                  <Alert className="border-blue-300 dark:border-blue-700">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-xs sm:text-sm space-y-2">
                      <p className="font-medium text-blue-900 dark:text-blue-100">
                        Use o calendário para ver seus posts agendados
                      </p>
                      <p className="text-blue-800 dark:text-blue-200">
                        • Acesse a aba <strong>Calendário</strong> no FreelinkBrain<br/>
                        • Clique na data do post agendado<br/>
                        • Configure um alarme no seu celular para o horário
                      </p>
                    </AlertDescription>
                  </Alert>
                </div>
              </Card>
            )}

            {/* Como Funciona */}
            <Card className="p-4 sm:p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-2 border-purple-200 dark:border-purple-800">
              <div className="space-y-3">
                <h4 className="font-bold text-sm sm:text-base flex items-center gap-2">
                  <span className="text-xl">💡</span>
                  Como funciona?
                </h4>
                <ol className="text-xs sm:text-sm text-muted-foreground space-y-2 list-decimal list-inside leading-relaxed">
                  <li>Agende um post no FreelinkBrain</li>
                  <li>Na hora marcada, receba uma notificação</li>
                  <li>Clique e vá direto para a página do post</li>
                  <li>Baixe o vídeo, copie a legenda e poste</li>
                </ol>
              </div>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}