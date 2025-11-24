import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Rotas que PRECISAM de autenticação
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)"
]);

// Rotas que NUNCA devem passar pelo Clerk (webhooks, crons)
const isWebhookRoute = createRouteMatcher([
  "/api/webhooks/(.*)",
  "/api/cron/(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Ignora completamente webhooks e crons
  if (isWebhookRoute(req)) {
    return; // Não faz nada, deixa passar
  }

  // Protege rotas do dashboard
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Protege dashboard
    "/dashboard/:path*",

    // IMPORTANTE: Exclui webhooks e crons do matcher
    "/((?!_next|api/webhooks|api/cron|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",

    // APIs que NÃO são webhooks
    "/(api(?!/webhooks|/cron))(.*)",
  ],
};