// components/brain/SettingsModal.tsx - VERSÃO MELHORADA
"use client";

import { motion } from "framer-motion";
import {
  Bell,
  BellOff,
  Check,
  Loader2,
  AlertTriangle,
  Info,
  Smartphone,
  CheckCircle2,
  Zap,
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
import { ScrollArea } from "@/components/ui/scroll-area";
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
    subscribe: subscribePush,
    unsubscribe: unsubscribePush,
  } = usePushNotifications();

  const stats = useQuery(api.notifications.getNotificationStats);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-5 sm:p-6 border-b bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-purple-600 rounded-xl">
              <Bell className="w-5 h-5 text-white" />
            </div>
            Central de Notificações
          </DialogTitle>
          <DialogDescription>
            Configure alertas para nunca perder o horário de postar
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="push" className="flex-1">
          <TabsList className="w-full justify-start rounded-none border-b h-auto p-0 bg-transparent">
            <TabsTrigger
              value="push"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent py-3"
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Push
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent py-3"
            >
              <Info className="w-4 h-4 mr-2" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="max-h-[calc(90vh-200px)]">
            {/* PUSH NOTIFICATIONS */}
            <TabsContent value="push" className="p-5 sm:p-6 space-y-4 m-0">
              {/* Aviso iOS */}
              {isIOS && !isPWA && (
                <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/30">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <AlertDescription className="text-sm">
                    <p className="font-semibold mb-1">⚠️ Push no iPhone</p>
                    <p className="text-xs">
                      Adicione este app à tela de início para receber notificações no iOS.
                      <br />
                      <span className="text-amber-700">Safari → Compartilhar → Adicionar à Tela de Início</span>
                    </p>
                  </AlertDescription>
                </Alert>
              )}

              <Card className={cn(
                "p-5 border-2 transition-all",
                isPushActive
                  ? "border-green-500/50 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30"
                  : "border-gray-200 dark:border-gray-800"
              )}>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <motion.div
                      animate={isPushActive ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={cn(
                        "p-3 rounded-xl shadow-md transition-colors",
                        isPushActive
                          ? "bg-green-500 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                      )}
                    >
                      <Bell className="w-6 h-6" />
                    </motion.div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-lg">Notificações Push</h3>
                        {isPushActive && (
                          <Badge className="bg-green-500 text-white border-0">
                            <Check className="w-3 h-3 mr-1" />
                            Ativo
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Receba alertas gratuitos neste dispositivo quando for hora de postar.
                      </p>
                    </div>
                  </div>

                  {isPushActive ? (
                    <div className="space-y-3">
                      <Alert className="border-green-200 bg-green-50/50 dark:bg-green-950/30 dark:border-green-900">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-sm text-green-800 dark:text-green-200">
                          Tudo pronto! Você receberá notificações neste dispositivo.
                        </AlertDescription>
                      </Alert>

                      <Button
                        variant="outline"
                        onClick={unsubscribePush}
                        disabled={isPushLoading}
                        className="w-full border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-900"
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
                      disabled={!isPushSupported || isPushLoading || (isIOS && !isPWA)}
                      size="lg"
                      className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
                    >
                      {isPushLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Ativando...
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5 mr-2" />
                          {isIOS && !isPWA ? "Instale o App Primeiro" : "Ativar Notificações"}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </Card>

              {/* Dica */}
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Como funciona?
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      Quando você agenda um post, recebe uma notificação no horário exato para lembrar de publicar. Funciona mesmo com o navegador fechado!
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* HISTÓRICO */}
            <TabsContent value="history" className="p-5 sm:p-6 space-y-4 m-0">
              {stats?.logs && stats.logs.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Últimos Envios
                  </h4>
                  {stats.logs.slice(0, 15).map((log: Doc<"notificationLogs">) => (
                    <motion.div
                      key={log._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border"
                    >
                      <div className="mt-0.5">
                        {log.status === "sent" || log.status === "delivered" ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <Badge variant="outline" className="text-[10px] uppercase h-5">
                            {log.method}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(log.sentAt).toLocaleString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                          {log.message}
                        </p>
                        {log.error && (
                          <p className="text-xs text-red-500 mt-0.5 truncate">
                            Erro: {log.error}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BellOff className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium text-gray-500">Nenhuma notificação enviada ainda</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Agende posts para ver o histórico aqui
                  </p>
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}