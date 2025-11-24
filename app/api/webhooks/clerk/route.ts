import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    console.error('❌ ERRO: CLERK_WEBHOOK_SECRET não encontrado nas variáveis.');
    return new Response('Error: Missing Secret', { status: 500 })
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // Se não tiver cabeçalho, rejeita
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: No svix headers', { status: 400 })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent

  // Verifica a assinatura
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('❌ ERRO de Verificação:', err);
    return new Response('Error: Verification failed', { status: 400 })
  }

  const eventType = evt.type;
  console.log(`✅ Webhook recebido: ${eventType}`);

  // CASO 1: Usuário Criado (Manda Boas-Vindas)
  if (eventType === 'user.created') {
    const {  email_addresses, first_name } = evt.data;
    const email = email_addresses[0]?.email_address;
    const name = first_name || "Criador";

    if (email) {
      try {
        await resend.emails.send({
          from: 'Freelinnk <boasvindas@freelinnk.com>',
          to: email,
          subject: `🚀 Bem-vindo ao time, ${name}! Seu bio link mudou.`,
          html: `
            <div style="font-family: sans-serif; color: #1a1a1a;">
               <h1>Sua jornada começa agora.</h1>
               <p>Olá, ${name}. Parabéns por criar sua conta.</p>
               <p>Acesse agora para configurar seu perfil.</p>
               <a href="https://freelinnk.com">Acessar Painel</a>
            </div>
          `
        });
        console.log(`📧 E-mail enviado para ${email}`);
      } catch (emailError) {
        console.error('❌ Erro ao enviar e-mail:', emailError);
        // Não retorna erro 500 para o Clerk não ficar tentando reenviar infinitamente se for erro de e-mail
      }
    }
  }

  // CASO 2: Usuário Atualizado (Apenas confirma recebimento)
  // Isso resolve o erro "Failed" nos seus logs de user.updated
  if (eventType === 'user.updated') {
      console.log('User updated - Nenhuma ação necessária por enquanto.');
  }

  // Retorna 200 OK para o Clerk ficar feliz (Verde)
  return new Response('Webhook received', { status: 200 })
}