import { NextResponse } from 'next/server';

// Redirect route for short links
// Note: Short link storage (Prisma) was removed. This route is kept for backwards compatibility
// but will return 404 for all slugs until a new storage backend is configured.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    return new NextResponse('Slug não fornecido.', { status: 400 });
  }

  // Short link DB was removed. Redirect to home.
  return NextResponse.redirect(new URL('/', request.url));
}