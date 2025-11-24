import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server';

// Força execução dinâmica (sem cache)
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    console.error('❌ CLERK_WEBHOOK_SECRET não encontrado');
    return NextResponse.json({ error: 'Missing Secret' }, { status: 500 });
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('❌ Headers Svix ausentes');
    return NextResponse.json({ error: 'No svix headers' }, { status: 400 });
  }

  const payload = await req.json()
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('❌ Verificação Svix falhou:', err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
  }

  const eventType = evt.type;
  console.log(`✅ Clerk Webhook: ${eventType}`);

  // EVENTOS
  switch (eventType) {
    case 'user.created':
      const { email_addresses, first_name, id } = evt.data;
      const email = email_addresses?.[0]?.email_address;
      console.log(`📧 Novo usuário criado: ${first_name || 'Sem nome'} (${email || id})`);
      // O email de boas-vindas será enviado pelo sistema de cron
      break;

    case 'user.updated':
      console.log(`✏️ Usuário atualizado: ${evt.data.id}`);
      break;

    case 'user.deleted':
      console.log(`🗑️ Usuário deletado: ${evt.data.id}`);
      // Aqui você pode limpar dados do Convex/Prisma se necessário
      break;

    default:
      console.log(`➡️ Evento não tratado: ${eventType}`);
  }

  return NextResponse.json({ success: true, event: eventType }, { status: 200 });
}

// GET para testar se o endpoint está funcionando
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Clerk webhook endpoint is active',
    timestamp: new Date().toISOString()
  }, { status: 200 });
}