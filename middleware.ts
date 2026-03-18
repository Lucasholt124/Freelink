import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)"
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // APENAS rotas que precisam do Clerk — páginas públicas NÃO passam pelo middleware
    "/dashboard/:path*",
    "/onboarding",
    "/sign-in(.*)",
    "/sign-up(.*)",
    // APIs que precisam de auth (exclui webhooks, crons e assets estáticos)
    "/api/((?!webhooks|cron).*)",
  ],
};