// app/api/redirect/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { headers } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Parser de User-Agent para detectar dispositivo, navegador e OS
function parseUserAgent(userAgent: string) {
  const ua = userAgent.toLowerCase();

  // Detectar dispositivo
  let device = 'Desktop';
  if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua)) {
    device = 'Mobile';
  } else if (/tablet|ipad|playbook|silk/i.test(ua)) {
    device = 'Tablet';
  }

  // Detectar navegador
  let browser = 'Unknown';
  if (ua.includes('edg/')) {
    browser = 'Edge';
  } else if (ua.includes('opr/') || ua.includes('opera')) {
    browser = 'Opera';
  } else if (ua.includes('chrome')) {
    browser = 'Chrome';
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browser = 'Safari';
  } else if (ua.includes('firefox')) {
    browser = 'Firefox';
  }

  // Detectar OS
  let os = 'Unknown';
  if (ua.includes('windows nt 10')) {
    os = 'Windows 10';
  } else if (ua.includes('windows nt 6.3')) {
    os = 'Windows 8.1';
  } else if (ua.includes('windows nt 6.2')) {
    os = 'Windows 8';
  } else if (ua.includes('windows')) {
    os = 'Windows';
  } else if (ua.includes('android')) {
    os = 'Android';
  } else if (/iphone|ipad|ipod/.test(ua) && /os \d+/.test(ua)) {
    const match = ua.match(/os (\d+)/);
    os = `iOS ${match ? match[1] : ''}`;
  } else if (ua.includes('mac os x')) {
    os = 'macOS';
  } else if (ua.includes('linux')) {
    os = 'Linux';
  }

  return { device, browser, os };
}

// Função para obter informações de geolocalização
async function getGeoInfo(ip: string) {
  // Se for IP local, retornar dados padrão
  if (ip === 'unknown' || ip.startsWith('127.') || ip.startsWith('192.168.') || ip === '::1') {
    return { country: 'Local Development', city: null, region: null };
  }

  try {
    // Usando ipapi.co (gratuito até 30k requisições/mês)
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: {
        'User-Agent': 'freelink/1.0',
      },
    });

    if (response.ok) {
      const data = await response.json();

      // Verificar se não é erro
      if (!data.error) {
        return {
          country: data.country_name || 'Unknown',
          city: data.city || null,
          region: data.region || null,
        };
      }
    }
  } catch (error) {
    console.error('Erro ao buscar geolocalização:', error);
  }

  // Fallback
  return { country: 'Unknown', city: null, region: null };
}

// Extrair IP real considerando proxies
function getRealIp(request: NextRequest, headersList: Headers): string {
  // Tentar diferentes headers em ordem de prioridade
  const forwardedFor = headersList.get('x-forwarded-for');
  const realIp = headersList.get('x-real-ip');
  const cfConnectingIp = headersList.get('cf-connecting-ip'); // Cloudflare

  if (forwardedFor) {
    // x-forwarded-for pode conter múltiplos IPs, pegar o primeiro
    return forwardedFor.split(',')[0].trim();
  }

  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  if (realIp) {
    return realIp;
  }

  // Fallback
  return 'unknown';
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    return new NextResponse("Slug não fornecido.", { status: 400 });
  }

  try {
    const link = await prisma.link.findUnique({ where: { id: slug } });

    if (!link) {
      return NextResponse.redirect(new URL('/404', request.url));
    }

    // Coletar informações do visitante
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || 'Unknown';
    const referer = headersList.get('referer');

    // Obter IP real
    const ip = getRealIp(request, headersList);

    // Parsear User-Agent
    const { device, browser, os } = parseUserAgent(userAgent);

    // Obter geolocalização
    const geoInfo = await getGeoInfo(ip);

    // Gerar ou recuperar visitor ID do cookie
    const cookieStore = request.cookies;
    let visitorId = cookieStore.get('visitor_id')?.value;

    if (!visitorId) {
      visitorId = uuidv4();
    }

    // Registrar o clique com todas as informações
    try {
      await prisma.click.create({
        data: {
          linkId: slug,
          visitorId,
          country: geoInfo.country,
          city: geoInfo.city,
          region: geoInfo.region,
          device,
          browser,
          os,
          referrer: referer,
          userAgent,
          ip,
        },
      });
    } catch (clickError) {
      // Log do erro mas não falhar o redirect
      console.error('[REGISTER_CLICK_ERROR]', clickError);
    }

    // Criar resposta com redirect
    const response = NextResponse.redirect(link.url);

    // Setar cookie do visitor ID se não existir
    if (!cookieStore.get('visitor_id')) {
      response.cookies.set('visitor_id', visitorId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 365 * 24 * 60 * 60, // 1 ano
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error(`[REDIRECT_API_ERROR] Slug: ${slug}`, error);
    return new NextResponse("Erro interno do servidor.", { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}