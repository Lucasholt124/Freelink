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
  Clock,
  CalendarClock
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
      <DialogContent className="w-[95vw] max-w-lg p-0 gap-0 overflow-hidden rounded-2xl sm:rounded-2xl h-[85dvh] sm:h-auto sm:max-h-[85vh] flex flex-col bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">

        {/* HEADER FIXO */}
        <DialogHeader className="p-5 border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 shrink-0">
          <DialogTitle className="flex items-center gap-3 text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
            <div className="p-2 bg-purple-600 rounded-xl shadow-sm shadow-purple-500/20 shrink-0">
              <Bell className="w-5 h-5 text-white" />
            </div>
            Central de Notificações
          </DialogTitle>
          <DialogDescription className="text-zinc-500 text-sm sm:text-base hidden sm:block">
            Configure alertas para nunca perder o horário de postar
          </DialogDescription>
        </DialogHeader>

        {/* TABS E CONTEÚDO COM SCROLL INTELIGENTE */}
        <Tabs defaultValue="push" className="flex flex-col flex-1 min-h-0">
          <TabsList className="w-full justify-start rounded-none border-b border-zinc-100 dark:border-zinc-800 h-auto p-0 bg-transparent shrink-0">
            <TabsTrigger
              value="push"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-400 data-[state=active]:bg-transparent py-3 sm:py-4 transition-all"
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Configurar Push
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-400 data-[state=active]:bg-transparent py-3 sm:py-4 transition-all"
            >
              <Clock className="w-4 h-4 mr-2" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 overflow-y-auto bg-white dark:bg-zinc-950">

            {/* CONTEÚDO PUSH */}
            <TabsContent value="push" className="p-4 sm:p-6 space-y-5 m-0 outline-none">

              {/* Aviso iOS Mobile */}
              {isIOS && !isPWA && (
                <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                  <AlertDescription className="text-sm ml-2">
                    <p className="font-semibold mb-1 text-amber-800 dark:text-amber-200">⚠️ Ativar no iPhone</p>
                    <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                      Para receber notificações, toque em <strong>Compartilhar</strong> no Safari e selecione <strong>Adicionar à Tela de Início</strong>.
                    </p>
                  </AlertDescription>
                </Alert>
              )}

              {/* Card Principal de Status */}
              <Card className={cn(
                "p-4 sm:p-5 border transition-all shadow-sm",
                isPushActive
                  ? "border-green-200 bg-gradient-to-br from-green-50/50 to-white dark:from-green-950/20 dark:to-zinc-950 dark:border-green-900"
                  : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
              )}>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <motion.div
                      animate={isPushActive ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={cn(
                        "p-3 rounded-xl shrink-0 transition-colors",
                        isPushActive
                          ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                      )}
                    >
                      {isPushActive ? <CheckCircle2 className="w-6 h-6" /> : <BellOff className="w-6 h-6" />}
                    </motion.div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <h3 className="font-bold text-base sm:text-lg text-zinc-900 dark:text-white">Notificações Push</h3>
                        {isPushActive ? (
                          <Badge className="w-fit bg-green-100 text-green-700 hover:bg-green-100 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800 shadow-none px-2 py-0.5 h-6">
                            Ativo
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="w-fit text-zinc-500 border-zinc-200 dark:border-zinc-700 px-2 py-0.5 h-6">
                            Inativo
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-zinc-500 mt-1 leading-snug">
                        {isPushActive
                          ? "Seu dispositivo está pronto para receber alertas."
                          : "Ative para receber lembretes de postagem."}
                      </p>
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="pt-2">
                    {isPushActive ? (
                      <Button
                        variant="outline"
                        onClick={unsubscribePush}
                        disabled={isPushLoading}
                        className="w-full h-11 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/50"
                      >
                        {isPushLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <BellOff className="w-4 h-4 mr-2" />}
                        Desativar Notificações
                      </Button>
                    ) : (
                      <Button
                        onClick={subscribePush}
                        disabled={!isPushSupported || isPushLoading || (isIOS && !isPWA)}
                        className="w-full h-11 font-semibold bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-lg"
                      >
                        {isPushLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Ativando...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 mr-2 fill-current" />
                            {isIOS && !isPWA ? "Instale o App para Ativar" : "Ativar Notificações"}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>

              {/* Card Dica */}
              <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/50">
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                      Como funciona?
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-400 mt-1 leading-relaxed">
                      O sistema agendará automaticamente os alertas para os horários definidos na sua estratégia viral. Funciona mesmo com o site fechado.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* CONTEÚDO HISTÓRICO */}
            <TabsContent value="history" className="p-4 sm:p-6 m-0 space-y-4 outline-none">
              {stats?.logs && stats.logs.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                     <h4 className="font-semibold text-xs text-zinc-400 uppercase tracking-wider">
                       Registro de Envios
                     </h4>
                     <Badge variant="secondary" className="text-[10px] h-5">
                       {stats.logs.length} Total
                     </Badge>
                  </div>

                  {stats.logs.slice(0, 20).map((log: Doc<"notificationLogs">) => (
                    <motion.div
                      key={log._id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group flex items-start gap-3 p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-sm"
                    >
                      <div className="mt-1 shrink-0">
                        {log.status === "sent" || log.status === "delivered" ? (
                          <div className="p-1 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                             <Check className="w-3 h-3" />
                          </div>
                        ) : (
                          <div className="p-1 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                             <AlertTriangle className="w-3 h-3" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
                             {log.status === 'sent' ? 'Enviado com sucesso' : 'Falha no envio'}
                          </span>
                          <span className="text-[10px] text-zinc-400 whitespace-nowrap">
                            {new Date(log.sentAt).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })} • {new Date(log.sentAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                          {log.message}
                        </p>

                        {log.error && (
                          <div className="mt-1.5 p-1.5 bg-red-50 dark:bg-red-950/30 rounded text-[10px] text-red-600 dark:text-red-400 font-mono break-all">
                            {log.error}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  <div className="h-4"></div> {/* Spacer for scroll */}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                    <CalendarClock className="w-8 h-8 text-zinc-300" />
                  </div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">Sem histórico recente</p>
                  <p className="text-sm text-zinc-500 mt-1 max-w-[200px]">
                    Assim que as notificações forem enviadas, elas aparecerão aqui.
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