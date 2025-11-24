import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    console.error('❌ ERRO: CLERK_WEBHOOK_SECRET não encontrado nas variáveis.');
    return NextResponse.json({ error: 'Missing Secret' }, { status: 500 });
  }

  // CORREÇÃO 1: Await headers() corretamente
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('❌ Headers Svix ausentes');
    return NextResponse.json({ error: 'No svix headers' }, { status: 400 });
  }

  // CORREÇÃO 2: Ler body apenas UMA vez
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
    console.error('❌ Verificação falhou:', err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
  }

  const eventType = evt.type;
  console.log(`✅ Webhook recebido: ${eventType}`);

  // CASO 1: Usuário Criado
  if (eventType === 'user.created') {
    const { email_addresses, first_name } = evt.data;
    const email = email_addresses[0]?.email_address;
    const name = first_name || "Criador";

    if (email) {
      try {
        await resend.emails.send({
          from: 'Freelinnk <boasvindas@freelinnk.com>',
          to: email,
          subject: `🚀 Bem-vindo ao time, ${name}! Seu bio link mudou.`,
          html: `
            <div style="font-family: sans-serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <h1 style="color: #6366f1; margin-bottom: 24px;">Sua jornada começa agora.</h1>
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Olá, ${name}. Parabéns por criar sua conta no Freelinnk!</p>
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">Você agora tem acesso a:</p>
              <ul style="font-size: 15px; line-height: 1.8; margin-bottom: 32px;">
                <li>Links ilimitados</li>
                <li>Analytics básicos</li>
                <li>URL personalizada</li>
              </ul>
              <a href="https://freelinnk.com/dashboard" style="display: inline-block; background: #6366f1; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">Acessar Meu Painel</a>
              <p style="margin-top: 32px; font-size: 14px; color: #666;">Dica: Complete seu perfil hoje para começar a receber cliques!</p>
            </div>
          `
        });
        console.log(`📧 E-mail de boas-vindas enviado para ${email}`);
      } catch (emailError) {
        console.error('❌ Erro ao enviar e-mail:', emailError);
      }
    }
  }

  // CASO 2: Usuário Atualizado
  if (eventType === 'user.updated') {
    console.log('✅ User updated recebido - OK');
  }

  // CASO 3: Usuário Deletado
  if (eventType === 'user.deleted') {
    console.log('✅ User deleted recebido - OK');
  }

  // CORREÇÃO CRÍTICA: Retornar NextResponse, não Response
  return NextResponse.json({ success: true }, { status: 200 });
}