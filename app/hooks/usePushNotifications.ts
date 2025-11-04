// app/hooks/usePushNotifications.ts
import { useEffect, useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";

// COLOQUE AQUI SUA VAPID PUBLIC KEY (gerada com web-push)
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_KEY || "";

export function usePushNotifications() {
  const { isLoaded, isSignedIn } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const savePushSubscription = useMutation(api.push.savePushSubscription);
  const removePushSubscription = useMutation(api.push.removePushSubscription);

  // Verificar suporte no navegador
  useEffect(() => {
    setIsSupported(
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }, []);

  // Verificar se já está inscrito
  useEffect(() => {
    if (!isSupported) return;
    checkSubscription();
  }, [isSupported]);

  const checkSubscription = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error("Erro ao verificar subscription:", error);
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) {
      toast.error("Seu navegador não suporta notificações push");
      return false;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      toast.error("Você precisa permitir notificações no seu navegador");
      return false;
    }
    return true;
  };

  const subscribe = useCallback(async () => {
    // VERIFICAÇÃO DE AUTENTICAÇÃO
    if (!isLoaded || !isSignedIn) {
      toast.error("Você precisa estar logado para ativar notificações");
      return false;
    }

    setIsLoading(true);

    // VERIFICAÇÃO DE SEGURANÇA
    if (!VAPID_PUBLIC_KEY) {
      console.error("VAPID_PUBLIC_KEY não está definida em .env.local");
      toast.error("Erro de configuração: Chave de notificação não encontrada.");
      setIsLoading(false);
      return false;
    }

    try {
      // 1. Pedir permissão
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        setIsLoading(false);
        return false;
      }

      // 2. Aguardar um momento para garantir que a autenticação está pronta
      await new Promise(resolve => setTimeout(resolve, 500));

      // 3. Registrar Service Worker
      let registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        registration = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;
      }

      // 4. Converter VAPID key para Uint8Array
      const convertedKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

      // 5. Criar Push Subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey as BufferSource,
      });

      // 6. Salvar no banco de dados
      const subscriptionJSON = subscription.toJSON();

      if (!subscriptionJSON.keys?.p256dh || !subscriptionJSON.keys?.auth) {
        console.error("Inscrição incompleta", subscriptionJSON);
        throw new Error("Falha ao obter chaves da inscrição");
      }

      await savePushSubscription({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscriptionJSON.keys.p256dh,
          auth: subscriptionJSON.keys.auth,
        },
        userAgent: navigator.userAgent,
      });

      setIsSubscribed(true);
      toast.success("Notificações ativadas! 🔔");
      return true;
    } catch (error: unknown) {
      console.error("Erro ao se inscrever:", error);

      // Se o erro for de autenticação, mostrar mensagem específica
      if (error instanceof Error && error.message.includes("autenticado")) {
        toast.error("Faça login para ativar as notificações");
      } else {
        toast.error("Erro ao ativar notificações: " + (error instanceof Error ? error.message : String(error)));
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, isSignedIn, savePushSubscription, isSupported]);

  const unsubscribe = useCallback(async () => {
    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        // Só remove do banco se estiver autenticado
        if (isLoaded && isSignedIn) {
          await removePushSubscription({ endpoint: subscription.endpoint });
        }
      }

      setIsSubscribed(false);
      toast.success("Notificações desativadas");
      return true;
    } catch (error: unknown) {
      console.error("Erro ao cancelar inscrição:", error);
      toast.error("Erro ao desativar notificações: " + (error instanceof Error ? error.message : String(error)));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, isSignedIn, removePushSubscription]);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
    checkSubscription,
  };
}

// ============================================
// HELPER: Converter VAPID Key (CORRIGIDO)
// ============================================
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}