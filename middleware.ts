import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

// Lista de extensões de arquivo para ignorar
const STATIC_FILE_EXTENSIONS = [
  '.css', '.js', '.map', '.ico', '.png', '.jpg', '.jpeg', '.gif', '.svg',
  '.woff', '.woff2', '.ttf', '.eot', '.xml', '.txt', '.webp', '.avif'
];

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const pathname = req.nextUrl.pathname;

  // Ignora arquivos estáticos
  if (STATIC_FILE_EXTENSIONS.some(ext => pathname.toLowerCase().endsWith(ext))) {
    return NextResponse.next();
  }

  // Ignora rotas do sistema Next.js
  if (pathname.startsWith('/_next/') || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Protege rotas do dashboard
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};