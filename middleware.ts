import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

// Melhorar detecção de arquivos estáticos
function isStaticAsset(pathname: string): boolean {
  // Verificar extensões comuns de arquivos estáticos
  const staticExtensions = [
    '.css', '.js', '.map', '.ico', '.png', '.jpg', '.jpeg', '.gif', '.svg',
    '.woff', '.woff2', '.ttf', '.eot', '.xml', '.txt', '.webp', '.avif'
  ];

  return (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') && staticExtensions.some(ext => pathname.endsWith(ext))
  );
}

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const pathname = req.nextUrl.pathname;

  // Ignorar completamente arquivos estáticos
  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  // Proteger rotas do dashboard
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};