export function getBaseUrl() {
  // Verifique se estamos em um ambiente de navegador
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

 // Verifique se estamos em um ambiente de produção
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
   // Ordem de prioridade para URLs de produção
// 1. Domínio personalizado (recomendado para produção)
    if (process.env.NEXT_PUBLIC_APP_URL) {
      return process.env.NEXT_PUBLIC_APP_URL;
    }

    // 2. URL Vercel (gerada automaticamente)
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }

    // 3. URL do projeto Vercel (mais confiável)
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
      return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
    }

    // 4. Fallback - você deve definir isso na produção
    throw new Error(
      "Nenhuma URL de produção configurada. Defina a variável de ambiente NEXT_PUBLIC_APP_URL.",
    );
  }

  // Padrão para localhost:3000 para desenvolvimento
  return "http://localhost:3000";
}