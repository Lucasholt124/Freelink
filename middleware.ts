import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

// Lista de extensões de arquivo para ignorar
const STATIC_FILE_EXTENSIONS = [
  '.css', '.js', '.map', '.ico', '.png', '.jpg', '.jpeg', '.gif', '.svg',
  '.woff', '.woff2', '.ttf', '.eot', '.xml', '.txt', '.webp', '.avif'
];

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { pathname } = req.nextUrl;

  // 1. Verificar se é um arquivo estático explicitamente
  if (STATIC_FILE_EXTENSIONS.some(ext => pathname.endsWith(ext))) {
    console.log(`Middleware: detectado arquivo estático ${pathname}`);
    return NextResponse.next();
  }

  // 2. Verificar caminhos do Next.js
  if (pathname.startsWith('/_next/') ||
      pathname.startsWith('/api/') ||
      pathname.startsWith('/static/')) {
    return NextResponse.next();
  }

  // 3. Verificar rotas de dashboard protegidas
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:css|js|map)).*)',
  ],
};