// components/brain/SettingsModal.tsx - MODAL DE CONFIGURAÇÕES
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurações do FreelinkBrain
          </DialogTitle>
          <DialogDescription>
            Configure como você quer receber notificações
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Notificações Push */}
          <Card className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold">Notificações Push</h3>
                  {isSubscribed && (
                    <Badge className="bg-green-500">
                      <Check className="w-3 h-3 mr-1" />
                      Ativo
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mb-3">
                  Receba um alerta no seu celular ou computador quando for
                  hora de postar seu conteúdo agendado.
                </p>

                {!isSupported && (
                  <Badge variant="destructive" className="text-xs">
                    Seu navegador não suporta notificações
                  </Badge>
                )}

                {isSupported && (
                  <div className="flex flex-col gap-2">
                    {isSubscribed ? (
                      <>
                        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                          <Check className="w-4 h-4" />
                          <span>Você receberá notificações em tempo real</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={unsubscribe}
                          disabled={isLoading}
                          className="w-fit"
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
                        <p className="text-sm text-amber-600 dark:text-amber-400">
                          ⚠️ Ative as notificações para não perder a hora de postar
                        </p>
                        <Button
                          onClick={subscribe}
                          disabled={isLoading}
                          className="w-fit bg-gradient-to-r from-purple-600 to-pink-600"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Ativando...
                            </>
                          ) : (
                            <>
                              <Bell className="w-4 h-4 mr-2" />
                              Ativar Notificações
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Como Funciona */}
          <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
            <h4 className="font-bold text-sm mb-2">📱 Como funciona?</h4>
            <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
              <li>Você agenda um post no FreelinkBrain</li>
              <li>Na hora marcada, recebe uma notificação</li>
              <li>Clica na notificação e vai direto para a página do post</li>
              <li>Baixa o vídeo, copia a legenda e posta manualmente</li>
            </ol>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-2 font-medium">
              ✨ 100% seguro - você controla quando e como postar!
            </p>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}