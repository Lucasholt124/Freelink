// components/brain/SettingsModalUltra.tsx - COM WHATSAPP + SMS
"use client";

import { useState } from "react";
import {
  Bell, BellOff, Check, Loader2, Settings,
  MessageSquare,  AlertTriangle,  Info,
  Phone, Zap,  Shield, CheckCircle2, Send,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePushNotifications } from "@/app/hooks/usePushNotifications";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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

  // WhatsApp
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [whatsappCode, setWhatsappCode] = useState("");
  const [whatsappStep, setWhatsappStep] = useState<"phone" | "code" | "verified">("phone");
  const [tempWhatsappId, setTempWhatsappId] = useState<string>("");

  // SMS
  const [smsPhone, setSmsPhone] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [smsStep, setSmsStep] = useState<"phone" | "code" | "verified">("phone");
  const [tempSmsId, setTempSmsId] = useState<string>("");

  const whatsappData = useQuery(api.notifications.getWhatsAppIntegration);
  const smsData = useQuery(api.notifications.getSmsIntegration);
  const stats = useQuery(api.notifications.getNotificationStats);

  const addWhatsApp = useMutation(api.notifications.addWhatsAppIntegration);
  const verifyWhatsApp = useMutation(api.notifications.verifyWhatsApp);
  const toggleWhatsApp = useMutation(api.notifications.toggleWhatsApp);

  const addSms = useMutation(api.notifications.addSmsIntegration);
  const verifySms = useMutation(api.notifications.verifySms);
  const toggleSms = useMutation(api.notifications.toggleSms);

  const handleWhatsAppSubmit = async () => {
    if (!whatsappPhone.match(/^\+55\d{11}$/)) {
      toast.error("Use formato: +5579999999999");
      return;
    }

    const loading = toast.loading("Enviando código...");
    try {
      const result = await addWhatsApp({
        phoneNumber: whatsappPhone,
        provider: "wppconnect",
      });

      setTempWhatsappId(result.integrationId);
      setWhatsappStep("code");
      toast.dismiss(loading);
      toast.success(`Código enviado! (Teste: ${result.verificationCode})`);
    } catch (error) {
      toast.dismiss(loading);
      toast.error(error instanceof Error ? error.message : "Erro");
    }
  };

  const handleWhatsAppVerify = async () => {
    if (whatsappCode.length !== 6) {
      toast.error("Código deve ter 6 dígitos");
      return;
    }

    const loading = toast.loading("Verificando...");
    try {
      await verifyWhatsApp({
        integrationId: tempWhatsappId as Id<"whatsappIntegrations">,
        code: whatsappCode,
      });

      setWhatsappStep("verified");
      toast.dismiss(loading);
      toast.success("✅ WhatsApp conectado!");
    } catch (error) {
      toast.dismiss(loading);
      toast.error(error instanceof Error ? error.message : "Código inválido");
    }
  };

  const handleSmsSubmit = async () => {
    if (!smsPhone.match(/^\+55\d{11}$/)) {
      toast.error("Use formato: +5579999999999");
      return;
    }

    const loading = toast.loading("Enviando código...");
    try {
      const result = await addSms({
        phoneNumber: smsPhone,
        provider: "twilio",
      });

      setTempSmsId(result.integrationId);
      setSmsStep("code");
      toast.dismiss(loading);
      toast.success(`Código enviado! (Teste: ${result.verificationCode})`);
    } catch (error) {
      toast.dismiss(loading);
      toast.error(error instanceof Error ? error.message : "Erro");
    }
  };

  const handleSmsVerify = async () => {
    if (smsCode.length !== 6) {
      toast.error("Código deve ter 6 dígitos");
      return;
    }

    const loading = toast.loading("Verificando...");
    try {
      await verifySms({
        integrationId: tempSmsId as Id<"smsIntegrations">,
        code: smsCode,
      });

      setSmsStep("verified");
      toast.dismiss(loading);
      toast.success("✅ SMS conectado!");
    } catch (error) {
      toast.dismiss(loading);
      toast.error(error instanceof Error ? error.message : "Código inválido");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Settings className="w-5 h-5" />
            Central de Notificações
          </DialogTitle>
          <DialogDescription>
            Escolha como quer receber lembretes dos seus posts
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="push" className="flex-1">
          <TabsList className="w-full justify-start rounded-none border-b h-auto p-0">
            <TabsTrigger value="push" className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
              <Bell className="w-4 h-4 mr-2" />
              Push
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
              <MessageSquare className="w-4 h-4 mr-2" />
              WhatsApp
            </TabsTrigger>
            <TabsTrigger value="sms" className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
              <Phone className="w-4 h-4 mr-2" />
              SMS
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
              <Info className="w-4 h-4 mr-2" />
              Stats
            </TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* PUSH NOTIFICATIONS */}
            <TabsContent value="push" className="p-6 space-y-4 m-0">
              {isIOS && !isPWA && (
                <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <AlertDescription className="text-sm space-y-2">
                    <p className="font-semibold">🚫 Push não funciona no {browserName}</p>
                    <p>Use WhatsApp ou SMS como alternativa, ou instale o app.</p>
                  </AlertDescription>
                </Alert>
              )}

              <Card className={cn(
                "p-6 border-2",
                isPushActive
                  ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20"
                  : "border-gray-300"
              )}>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-3 rounded-full",
                        isPushActive ? "bg-green-500" : "bg-gray-500"
                      )}>
                        <Bell className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg flex items-center gap-2">
                          Notificações Push
                          {isPushActive && (
                            <Badge className="bg-green-500 text-white">
                              <Check className="w-3 h-3 mr-1" />
                              Ativo
                            </Badge>
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Alertas instantâneos no navegador
                        </p>
                      </div>
                    </div>
                  </div>

                  {isPushActive ? (
                    <>
                      <Alert className="border-green-500/50 bg-green-50 dark:bg-green-950/30">
                        <Check className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-sm">
                          Você receberá alertas quando for hora de postar!
                        </AlertDescription>
                      </Alert>

                      <Button
                        variant="outline"
                        onClick={unsubscribePush}
                        disabled={isPushLoading}
                        className="w-full"
                      >
                        {isPushLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Desativando...
                          </>
                        ) : (
                          <>
                            <BellOff className="w-4 h-4 mr-2" />
                            Desativar
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={subscribePush}
                      disabled={!isPushSupported || isPushLoading || (isIOS && !isPWA)}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      {isPushLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Ativando...
                        </>
                      ) : (
                        <>
                          <Bell className="w-4 h-4 mr-2" />
                          {isIOS && !isPWA ? "Instale o app primeiro" : "Ativar Push"}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </Card>
            </TabsContent>

            {/* WHATSAPP */}
            <TabsContent value="whatsapp" className="p-6 space-y-4 m-0">
              <Card className={cn(
                "p-6 border-2",
                whatsappData?.active
                  ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20"
                  : "border-gray-300"
              )}>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-green-500">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">WhatsApp Business</h3>
                      <p className="text-sm text-muted-foreground">
                        Receba lembretes direto no WhatsApp
                      </p>
                    </div>
                  </div>

                  {whatsappData?.verified ? (
                    <>
                      <Alert className="border-green-500/50 bg-green-50 dark:bg-green-950/30">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-sm space-y-1">
                          <p className="font-medium">✅ WhatsApp conectado</p>
                          <p className="text-xs">{whatsappData.phoneNumber}</p>
                          <p className="text-xs text-muted-foreground">
                            {stats?.whatsapp.messagesCount || 0} mensagens enviadas
                          </p>
                        </AlertDescription>
                      </Alert>

                      <Button
                        variant="outline"
                        onClick={() => toggleWhatsApp({ active: !whatsappData.active })}
                        className="w-full"
                      >
                        {whatsappData.active ? "Desativar" : "Ativar"} WhatsApp
                      </Button>
                    </>
                  ) : whatsappStep === "phone" ? (
                    <>
                      <div className="space-y-2">
                        <Label>Número do WhatsApp</Label>
                        <Input
                          type="tel"
                          placeholder="+5579999999999"
                          value={whatsappPhone}
                          onChange={(e) => setWhatsappPhone(e.target.value)}
                          maxLength={14}
                        />
                        <p className="text-xs text-muted-foreground">
                          Use o formato internacional com +55
                        </p>
                      </div>

                      <Button
                        onClick={handleWhatsAppSubmit}
                        disabled={!whatsappPhone}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Código
                      </Button>

                      <Alert>
                        <Shield className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          Enviaremos um código de 6 dígitos via WhatsApp para confirmar
                        </AlertDescription>
                      </Alert>
                    </>
                  ) : whatsappStep === "code" ? (
                    <>
                      <div className="space-y-2">
                        <Label>Código de Verificação</Label>
                        <Input
                          type="text"
                          placeholder="000000"
                          value={whatsappCode}
                          onChange={(e) => setWhatsappCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          maxLength={6}
                          className="text-center text-2xl tracking-widest"
                        />
                      </div>

                      <Button
                        onClick={handleWhatsAppVerify}
                        disabled={whatsappCode.length !== 6}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Verificar
                      </Button>

                      <Button
                        variant="ghost"
                        onClick={() => setWhatsappStep("phone")}
                        className="w-full"
                      >
                        Voltar
                      </Button>
                    </>
                  ) : null}
                </div>
              </Card>

              <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-600" />
                    Como funciona?
                  </h4>
                  <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Conecte seu WhatsApp com código de verificação</li>
                    <li>Receba mensagem automática no horário do post</li>
                    <li>Clique no link e vá direto para o post</li>
                  </ol>
                </div>
              </Card>
            </TabsContent>

            {/* SMS */}
            <TabsContent value="sms" className="p-6 space-y-4 m-0">
              <Card className={cn(
                "p-6 border-2",
                smsData?.active
                  ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20"
                  : "border-gray-300"
              )}>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-blue-500">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">SMS</h3>
                      <p className="text-sm text-muted-foreground">
                        Lembrete por mensagem de texto
                      </p>
                    </div>
                  </div>

                  {smsData?.verified ? (
                    <>
                      <Alert className="border-green-500/50 bg-green-50 dark:bg-green-950/30">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-sm space-y-1">
                          <p className="font-medium">✅ SMS conectado</p>
                          <p className="text-xs">{smsData.phoneNumber}</p>
                          <p className="text-xs text-muted-foreground">
                            Créditos restantes: {smsData.creditsRemaining || 0}
                          </p>
                        </AlertDescription>
                      </Alert>

                      <Button
                        variant="outline"
                        onClick={() => toggleSms({ active: !smsData.active })}
                        className="w-full"
                      >
                        {smsData.active ? "Desativar" : "Ativar"} SMS
                      </Button>
                    </>
                  ) : smsStep === "phone" ? (
                    <>
                      <div className="space-y-2">
                        <Label>Número do Celular</Label>
                        <Input
                          type="tel"
                          placeholder="+5579999999999"
                          value={smsPhone}
                          onChange={(e) => setSmsPhone(e.target.value)}
                          maxLength={14}
                        />
                      </div>

                      <Button
                        onClick={handleSmsSubmit}
                        disabled={!smsPhone}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Código
                      </Button>

                      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                        <Info className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-xs">
                          🎁 Você ganha 10 SMS grátis ao conectar!
                        </AlertDescription>
                      </Alert>
                    </>
                  ) : smsStep === "code" ? (
                    <>
                      <div className="space-y-2">
                        <Label>Código SMS</Label>
                        <Input
                          type="text"
                          placeholder="000000"
                          value={smsCode}
                          onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          maxLength={6}
                          className="text-center text-2xl tracking-widest"
                        />
                      </div>

                      <Button
                        onClick={handleSmsVerify}
                        disabled={smsCode.length !== 6}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Verificar
                      </Button>

                      <Button
                        variant="ghost"
                        onClick={() => setSmsStep("phone")}
                        className="w-full"
                      >
                        Voltar
                      </Button>
                    </>
                  ) : null}
                </div>
              </Card>
            </TabsContent>

            {/* STATS */}
            <TabsContent value="stats" className="p-6 space-y-4 m-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 text-center">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                  <p className="text-2xl font-bold">{stats?.whatsapp.messagesCount || 0}</p>
                  <p className="text-xs text-muted-foreground">WhatsApp enviados</p>
                </Card>

                <Card className="p-4 text-center">
                  <Phone className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <p className="text-2xl font-bold">{stats?.sms.smsCount || 0}</p>
                  <p className="text-xs text-muted-foreground">SMS enviados</p>
                </Card>

                <Card className="p-4 text-center">
                  <Zap className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                  <p className="text-2xl font-bold">{stats?.sms.creditsRemaining || 0}</p>
                  <p className="text-xs text-muted-foreground">Créditos SMS</p>
                </Card>
              </div>

              {stats?.logs && stats.logs.length > 0 && (
                <Card className="p-4">
                  <h4 className="font-semibold mb-3">Últimas Notificações</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {stats.logs.slice(0, 10).map((log: Doc<"notificationLogs">) => (
                      <div key={log._id} className="flex items-start gap-2 text-sm border-b pb-2">
                        <Badge variant="outline" className="text-xs">
                          {log.method}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs truncate">{log.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(log.sentAt).toLocaleString("pt-BR")}
                          </p>
                        </div>
                        <Badge className={cn(
                          "text-xs",
                          log.status === "sent" && "bg-green-500",
                          log.status === "failed" && "bg-red-500"
                        )}>
                          {log.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}