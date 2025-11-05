// app/hooks/usePushNotifications.ts - VERSÃO COM ALTERNATIVAS
import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_KEY;

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const [browserName, setBrowserName] = useState("");

  const savePushSubscription = useMutation(api.push.savePushSubscription);
  const removePushSubscription = useMutation(api.push.removePushSubscription);

  // ✅ DETECTAR iOS E NAVEGADOR
  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iOS = /iphone|ipad|ipod/.test(userAgent);
    const standalone = window.matchMedia('(display-mode: standalone)').matches;

    // Detectar navegador
    let browser = "unknown";
    if (userAgent.includes("crios")) browser = "Chrome iOS";
    else if (userAgent.includes("fxios")) browser = "Firefox iOS";
    else if (userAgent.includes("edgios")) browser = "Edge iOS";
    else if (userAgent.includes("safari")) browser = "Safari";
    else if (userAgent.includes("chrome")) browser = "Chrome";
    else if (userAgent.includes("firefox")) browser = "Firefox";

    setIsIOS(iOS);
    setIsPWA(standalone);
    setBrowserName(browser);

    const hasServiceWorker = 'serviceWorker' in navigator;
    const hasPushManager = 'PushManager' in window;
    const hasNotification = 'Notification' in window;

    // iOS precisa estar no modo PWA
    if (iOS) {
      setIsSupported(hasServiceWorker && hasPushManager && hasNotification && standalone);
    } else {
      setIsSupported(hasServiceWorker && hasPushManager && hasNotification);
    }
  }, []);

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
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  };

  const subscribe = async () => {
    if (!VAPID_PUBLIC_KEY) {
      console.error("❌ VAPID_PUBLIC_KEY não encontrada");
      toast.error("Erro de configuração: Chave de notificação não encontrada");
      return false;
    }

    setIsLoading(true);

    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        toast.error("Você precisa permitir notificações");
        return false;
      }

      let registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        registration = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;
      }

      const convertedKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey as BufferSource,
      });

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
      toast.error("Erro ao desativar notificações");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isSupported,
    isSubscribed,
    isLoading,
    isIOS,
    isPWA,
    browserName,
    subscribe,
    unsubscribe,
    checkSubscription,
  };
}

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