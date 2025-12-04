import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { clerkClient } from "@clerk/nextjs/server";

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const resend = new Resend(process.env.RESEND_API_KEY);

// Define a type for the public metadata to avoid using 'any'
interface UserPublicMetadata {
  subscriptionPlan?: 'free' | string; // Be more specific if you have other plans
  cartAbandoned?: boolean;
  totalEmailsReceived?: number;
  linksCreated?: number;
  totalClicks?: number;
  [key: string]: unknown; // Allow other unknown properties
}

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

  // =====================================================
  // 1. USUÁRIO NOVO (Criação + Email de Boas-vindas)
  // =====================================================
  if (eventType === 'user.created') {
    const { id, email_addresses, first_name } = evt.data;

    // Pega o email principal corretamente
    const emailObj = email_addresses?.find(e => e.id === evt.data.primary_email_address_id) || email_addresses?.[0];
    const email = emailObj?.email_address;
    const name = first_name || "Criador";

    // 1.1 Injeta o Metadata Inicial
    try {
      const client = await clerkClient();
      await client.users.updateUser(id, {
        publicMetadata: {
          subscriptionPlan: 'free',
          cartAbandoned: false,
          totalEmailsReceived: 0,
          linksCreated: 0,
          totalClicks: 0
        }
      });
      console.log(`🆕 Metadata inicial configurada para: ${id}`);
    } catch (metaError) {
      console.error('❌ Erro ao definir metadata inicial:', metaError);
    }

    // 1.2 Envia o Email (Resend)
    if (email) {
      try {
        await resend.emails.send({
          from: 'Freelinnk <contato@send.freelinnk.com>',
          replyTo: 'contato@freelinnk.com',
          to: email,
          subject: `Bem-vindo ao Freelinnk, ${name}! 🎉`,
          html: getWelcomeEmailHTML(name)
        });
        console.log(`📧 Email de boas-vindas enviado: ${email}`);
      } catch (emailError) {
        console.error('❌ Erro ao enviar email:', emailError);
      }
    }
  }

  // =====================================================
  // 2. CORREÇÃO DE USUÁRIOS ANTIGOS (A Mágica para a Gresy)
  // =====================================================
  if (eventType === 'session.created' || eventType === 'user.updated') {
    // ✅ CORREÇÃO DO ERRO DE TYPESCRIPT AQUI:
    // Extraímos o ID com segurança baseada no tipo do evento
    let userId = "";

    if (eventType === 'session.created') {
      // O evento de sessão tem 'user_id'
      userId = evt.data.user_id;
    } else if (eventType === 'user.updated') {
      // O evento de usuário tem 'id'
      userId = evt.data.id;
    }

    if (userId) {
      try {
          const client = await clerkClient();
          const user = await client.users.getUser(userId);

          const currentMeta = user.publicMetadata as UserPublicMetadata;

          // SE NÃO TIVER PLANO DEFINIDO, A GENTE CORRIGE AGORA
          if (!currentMeta.subscriptionPlan) {
              await client.users.updateUser(userId, {
                  publicMetadata: {
                      ...(currentMeta || {}), // Mantém dados existentes se houver
                      subscriptionPlan: 'free', // Força o plano Free
                      cartAbandoned: false,
                  }
              });
              console.log(`🔧 Usuário antigo corrigido (Auto-fix): ${userId}`);
          }
      } catch (err) {
          console.error('❌ Falha na verificação de usuário antigo:', err);
      }
    }
  }

  if (eventType === 'user.deleted') {
    // TypeScript precisa saber que 'id' pode ser undefined no deleted
    console.log(`🗑️ Usuário deletado: ${evt.data.id}`);
  }

  return NextResponse.json({ success: true, event: eventType }, { status: 200 });
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Clerk webhook endpoint is active',
    timestamp: new Date().toISOString()
  }, { status: 200 });
}

function getWelcomeEmailHTML(name: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 16px; padding: 48px 40px; text-align: center; color: white;">
      <span style="font-size: 56px; display: block; margin-bottom: 20px;">🎉</span>
      <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 12px 0;">Bem-vindo ao Freelinnk!</h1>
      <p style="font-size: 17px; opacity: 0.95; margin: 0 0 32px 0; line-height: 1.6;">
        ${name}, sua conta foi criada com sucesso.<br>
        Estamos animados em ter você aqui!
      </p>
      <a href="https://www.freelinnk.com/dashboard" style="display: inline-block; background: white; color: #6366f1; padding: 16px 48px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(0,0,0,0.15);">
        Acessar meu painel
      </a>
    </div>
    <div style="background: white; border-radius: 16px; padding: 32px; margin-top: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <h2 style="color: #1e293b; font-size: 18px; margin: 0 0 20px 0;">Seus primeiros passos:</h2>
      <div style="margin-bottom: 16px;">
        <div style="display: inline-block; background: #f0f4ff; color: #6366f1; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; font-weight: 600; margin-right: 12px;">1</div>
        <span style="color: #1e293b; font-weight: 500;">Personalize sua URL</span>
        <p style="margin: 4px 0 0 40px; color: #64748b; font-size: 14px;">freelinnk.com/<strong>seu-nome</strong></p>
      </div>
      <div style="margin-bottom: 16px;">
        <div style="display: inline-block; background: #f0f4ff; color: #6366f1; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; font-weight: 600; margin-right: 12px;">2</div>
        <span style="color: #1e293b; font-weight: 500;">Adicione uma foto de perfil</span>
        <p style="margin: 4px 0 0 40px; color: #64748b; font-size: 14px;">Perfis com foto convertem 47% mais</p>
      </div>
      <div>
        <div style="display: inline-block; background: #f0f4ff; color: #6366f1; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; font-weight: 600; margin-right: 12px;">3</div>
        <span style="color: #1e293b; font-weight: 500;">Crie seus primeiros links</span>
        <p style="margin: 4px 0 0 40px; color: #64748b; font-size: 14px;">Conecte suas redes, produtos e conteúdos</p>
      </div>
    </div>
    <p style="color: #94a3b8; font-size: 13px; text-align: center; margin-top: 24px; line-height: 1.6;">Dúvidas? Responda este email. Estamos aqui pra ajudar! 💜</p>
  </div>
</body>
</html>`;
}