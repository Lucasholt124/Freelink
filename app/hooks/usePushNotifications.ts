// app/hooks/usePushNotifications.ts
import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

// COLOQUE AQUI SUA VAPID PUBLIC KEY (gerada com web-push)
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_KEY || "";

export function usePushNotifications() {
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

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error("Erro ao verificar subscription:", error);
    }
  };

  const requestPermission = async () => {
    if (!isSupported) {
      toast.error("Seu navegador não suporta notificações push");
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  };

  const subscribe = async () => {
    setIsLoading(true);

    try {
      // 1. Pedir permissão
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        toast.error("Você precisa permitir notificações");
        return false;
      }

      // 2. Registrar Service Worker
      let registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        registration = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;
      }

      // 3. Converter VAPID key para Uint8Array (CORRIGIDO - força tipo explícito)
      const convertedKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

      // 4. Criar Push Subscription (CORRIGIDO - cast explícito para BufferSource)
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey as BufferSource,
      });

      // 5. Salvar no banco de dados
      const subscriptionJSON = subscription.toJSON();

      await savePushSubscription({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscriptionJSON.keys!.p256dh,
          auth: subscriptionJSON.keys!.auth,
        },
        userAgent: navigator.userAgent,
      });

      setIsSubscribed(true);
      toast.success("Notificações ativadas! 🔔");
      return true;
    } catch (error: unknown) {
      console.error("Erro ao se inscrever:", error);
      toast.error("Erro ao ativar notificações: " + (error instanceof Error ? error.message : String(error)));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async () => {
    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        await removePushSubscription({ endpoint: subscription.endpoint });
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
  };

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