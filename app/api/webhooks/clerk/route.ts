import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  // Você precisa pegar esse segredo no Dashboard do Clerk > Webhooks
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', { status: 400 })
  }

  // Get the body
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
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', { status: 400 })
  }

  const eventType = evt.type
  // --- A MÁGICA ACONTECE AQUI ---
  // Assim que o usuário cria a conta:
  if (eventType === 'user.created') {
    const {  email_addresses, first_name } = evt.data;
    const email = email_addresses[0]?.email_address;
    const name = first_name || "Criador";

    if (email) {
      await resend.emails.send({
        from: 'Freelinnk <boasvindas@freelinnk.com>',
        to: email,
        subject: `🚀 Bem-vindo ao time, ${name}! Seu bio link mudou.`,
        html: `
          <div style="font-family: sans-serif; color: #1a1a1a;">
            <h1>Sua jornada para viralizar começa agora.</h1>
            <p>Oi, ${name}.</p>
            <p>Você acabou de dar o primeiro passo para profissionalizar sua presença digital com o <strong>Freelinnk</strong>.</p>
            <p>Não somos apenas um agregador de links. Somos seu estúdio de criação com IA.</p>
            <h3>O que você deve fazer agora (leva 2 minutos):</h3>
            <ol>
              <li>Personalize a aparência da sua página.</li>
              <li>Adicione seus links principais.</li>
              <li><strong>Teste o FreelinnkBrain:</strong> Gere sua primeira ideia viral.</li>
            </ol>
            <br/>
            <a href="https://freelinnk.com/admin" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px;">ACESSAR MEU PAINEL</a>
            <p style="color: #666; font-size: 12px; margin-top: 30px;">Estamos juntos nessa,<br/>Time Freelinnk.</p>
          </div>
        `
      });
      console.log(`📧 E-mail de boas-vindas enviado para ${email}`);
    }
  }

  return new Response('', { status: 200 })
}