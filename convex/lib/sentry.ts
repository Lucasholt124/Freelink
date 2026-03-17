
const SENTRY_DSN = process.env.SENTRY_DSN;

interface SentryEvent {
  exception: {
    values: Array<{
      type: string;
      value: string;
      stacktrace?: {
        frames: Array<{
          filename: string;
          function: string;
          lineno?: number;
        }>;
      };
    }>;
  };
  level: "error" | "warning" | "info";
  timestamp: number;
  platform: string;
  environment: string;
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  user?: {
    id?: string;
    email?: string;
    username?: string;
  };
}

function parseDSN(dsn: string): { publicKey: string; projectId: string; host: string } | null {
  try {
    // Formato: https://publickey@host/projectId
    const url = new URL(dsn);
    const publicKey = url.username;
    const projectId = url.pathname.replace("/", "");
    const host = url.hostname;
    return { publicKey, projectId, host };
  } catch {
    console.error("DSN do Sentry inválido");
    return null;
  }
}

export async function captureException(
  error: unknown,
  context?: {
    userId?: string;
    action?: string;
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
  }
): Promise<void> {
  if (!SENTRY_DSN) {
    console.error("[Sentry] DSN não configurado. Erro:", error);
    return;
  }

  const parsed = parseDSN(SENTRY_DSN);
  if (!parsed) return;

  const { publicKey, projectId, host } = parsed;

  // Extrair informações do erro
  let errorMessage = "Erro desconhecido";
  let errorType = "Error";
  let errorStack = "";

  if (error instanceof Error) {
    errorMessage = error.message;
    errorType = error.constructor.name || "Error";
    errorStack = error.stack || "";
  } else if (typeof error === "string") {
    errorMessage = error;
  } else {
    errorMessage = JSON.stringify(error);
  }

  // Parsear stack trace
  const frames = errorStack
    .split("\n")
    .slice(1)
    .map(line => {
      const match = line.match(/at (.+?) \((.+?):(\d+):\d+\)/);
      if (match) {
        return {
          function: match[1],
          filename: match[2],
          lineno: parseInt(match[3]),
        };
      }
      return {
        function: "unknown",
        filename: line.trim(),
      };
    })
    .filter(f => f.filename !== "unknown");

  const event: SentryEvent = {
    exception: {
      values: [
        {
          type: errorType,
          value: errorMessage,
          stacktrace: frames.length > 0 ? { frames } : undefined,
        },
      ],
    },
    level: "error",
    timestamp: Date.now() / 1000,
    platform: "node",
    environment: process.env.NODE_ENV || "production",
    tags: {
      runtime: "convex",
      ...(context?.action && { action: context.action }),
      ...context?.tags,
    },
    extra: {
      ...context?.extra,
    },
    ...(context?.userId && {
      user: {
        id: context.userId,
      },
    }),
  };

  try {
    const sentryUrl = `https://${host}/api/${projectId}/store/`;

    const response = await fetch(sentryUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Sentry-Auth": `Sentry sentry_version=7, sentry_key=${publicKey}, sentry_client=convex-sentry/1.0`,
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      console.error("[Sentry] Falha ao enviar evento:", response.status);
    }
  } catch (sendError) {
    console.error("[Sentry] Erro ao enviar para Sentry:", sendError);
  }
}

export async function captureMessage(
  message: string,
  level: "error" | "warning" | "info" = "info",
  context?: {
    userId?: string;
    action?: string;
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
  }
): Promise<void> {
  if (!SENTRY_DSN) {
    console.log(`[Sentry] ${level}: ${message}`);
    return;
  }

  const parsed = parseDSN(SENTRY_DSN);
  if (!parsed) return;

  const { publicKey, projectId, host } = parsed;

  const event = {
    message: message,
    level: level,
    timestamp: Date.now() / 1000,
    platform: "node",
    environment: process.env.NODE_ENV || "production",
    tags: {
      runtime: "convex",
      ...(context?.action && { action: context.action }),
      ...context?.tags,
    },
    extra: context?.extra,
    ...(context?.userId && {
      user: {
        id: context.userId,
      },
    }),
  };

  try {
    const sentryUrl = `https://${host}/api/${projectId}/store/`;

    await fetch(sentryUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Sentry-Auth": `Sentry sentry_version=7, sentry_key=${publicKey}, sentry_client=convex-sentry/1.0`,
      },
      body: JSON.stringify(event),
    });
  } catch (sendError) {
    console.error("[Sentry] Erro ao enviar mensagem:", sendError);
  }
}