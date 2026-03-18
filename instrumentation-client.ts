// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://b6e20af2256d6d2636f24d9f3df4ea38@o4511061720956928.ingest.us.sentry.io/4511061722398720",

  // Amostragem: 1 = 100% dos traces. Em produção, reduza para economizar cota.
  tracesSampleRate: 0.3,

  enableLogs: true,
  sendDefaultPii: true,

  // Ignora erros de terceiros que poluem o Sentry
  ignoreErrors: [
    // AdSense no Firefox
    "NS_ERROR_NOT_INITIALIZED",
    // Erros genéricos de rede/browser que não são bugs nossos
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed with undelivered notifications",
    "Non-Error promise rejection captured",
    "Load failed",
    "Failed to fetch",
    "NetworkError when attempting to fetch resource",
    // Erros de extensões de navegador
    "chrome-extension://",
    "moz-extension://",
  ],

  // Ignora erros vindos de scripts de terceiros (AdSense, Facebook Pixel, etc.)
  denyUrls: [
    /pagead\/managed/i,
    /googlesyndication\.com/i,
    /googletagmanager\.com/i,
    /connect\.facebook\.net/i,
    /graph\.facebook\.com/i,
    /extensions\//i,
    /^chrome:\/\//i,
    /^moz-extension:\/\//i,
  ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;