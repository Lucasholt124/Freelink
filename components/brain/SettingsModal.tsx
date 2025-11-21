"use client";

import {
  Bell,
  BellOff,
  Check,
  Loader2,
  Settings,
  AlertTriangle,
  Info,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePushNotifications } from "@/app/hooks/usePushNotifications";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const {
    isSupported: isPushSupported,
    isSubscribed: isPushActive,
    isLoading: isPushLoading,
    isIOS,
    isPWA,
    browserName,
    subscribe: subscribePush,
    unsubscribe: unsubscribePush,
  } = usePushNotifications();

  // Busca logs apenas para a aba de Stats (filtrando logs de push se existirem)
  const stats = useQuery(api.notifications.getNotificationStats);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Settings className="w-5 h-5" />
            Central de Notificações
          </DialogTitle>
          <DialogDescription>
            Configure seus alertas para nunca perder o horário de postar
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="push" className="flex-1">
          <TabsList className="w-full justify-start rounded-none border-b h-auto p-0">
            <TabsTrigger
              value="push"
              className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-3"
            >
              <Bell className="w-4 h-4 mr-2" />
              Navegador (Push)
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-3"
            >
              <Info className="w-4 h-4 mr-2" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* PUSH NOTIFICATIONS */}
            <TabsContent value="push" className="p-6 space-y-4 m-0">
              {isIOS && !isPWA && (
                <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <AlertDescription className="text-sm space-y-2">
                    <p className="font-semibold">
                      ⚠️ Push no iPhone requer instalação
                    </p>
                    <p>
                      Para receber notificações no iOS ({browserName}), adicione
                      este app à tela de início (Compartilhar {">"} Adicionar à
                      Tela de Início).
                    </p>
                  </AlertDescription>
                </Alert>
              )}

              <Card
                className={cn(
                  "p-6 border-2 transition-all",
                  isPushActive
                    ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20"
                    : "border-gray-200 dark:border-gray-800"
                )}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "p-4 rounded-full shadow-sm transition-colors",
                          isPushActive
                            ? "bg-green-500 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                        )}
                      >
                        <Bell className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg flex items-center gap-2">
                          Notificações do Navegador
                          {isPushActive && (
                            <Badge className="bg-green-500 hover:bg-green-600 text-white border-0">
                              <Check className="w-3 h-3 mr-1" />
                              Ativo
                            </Badge>
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Receba alertas gratuitos no seu PC ou celular quando
                          for a hora de postar.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    {isPushActive ? (
                      <div className="space-y-4">
                        <Alert className="border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-900">
                          <Check className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-sm text-green-800 dark:text-green-200">
                            Tudo pronto! Você receberá notificações neste
                            dispositivo.
                          </AlertDescription>
                        </Alert>

                        <Button
                          variant="outline"
                          onClick={unsubscribePush}
                          disabled={isPushLoading}
                          className="w-full border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-900 dark:hover:bg-red-950/30"
                        >
                          {isPushLoading ? (
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
                      </div>
                    ) : (
                      <Button
                        onClick={subscribePush}
                        disabled={
                          !isPushSupported ||
                          isPushLoading ||
                          (isIOS && !isPWA)
                        }
                        size="lg"
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg transition-all hover:scale-[1.02]"
                      >
                        {isPushLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Ativando...
                          </>
                        ) : (
                          <>
                            <Bell className="w-5 h-5 mr-2" />
                            {isIOS && !isPWA
                              ? "Instale o App para Ativar"
                              : "Ativar Notificações Agora"}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* HISTÓRICO / STATS */}
            <TabsContent value="stats" className="p-6 space-y-4 m-0">
              {stats?.logs && stats.logs.length > 0 ? (
                <Card className="overflow-hidden border shadow-sm">
                  <div className="p-4 border-b bg-muted/30">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      Últimos Envios
                    </h4>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto divide-y">
                    {stats.logs.slice(0, 20).map((log: Doc<"notificationLogs">) => (
                      <div
                        key={log._id}
                        className="flex items-start gap-3 p-3 text-sm hover:bg-muted/20 transition-colors"
                      >
                        <div className="mt-0.5">
                          {log.status === "sent" ||
                          log.status === "delivered" ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <Badge
                              variant="outline"
                              className="text-[10px] uppercase h-5"
                            >
                              {log.method}
                            </Badge>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {new Date(log.sentAt).toLocaleString("pt-BR", {
                                day: "2-digit",
                                month: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-gray-600 dark:text-gray-300 truncate">
                            {log.message}
                          </p>
                          {log.error && (
                            <p className="text-xs text-red-500 mt-0.5 truncate">
                              Erro: {log.error}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ) : (
                <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-xl border border-dashed">
                  <BellOff className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Nenhuma notificação enviada ainda.</p>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}