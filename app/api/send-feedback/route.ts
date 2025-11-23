// app/api/send-feedback/route.ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, feedback, reason, userId } = await req.json();

    await resend.emails.send({
      // ⚠️ IMPORTANTE: O 'from' deve ser um email, não um site.
      // Enquanto não verificar seu domínio, use este email padrão do Resend:
      from: 'Freelinnk System <onboarding@resend.dev>',

      // Se já verificou o domínio 'freelinnk.com' no painel do Resend, use:
      // from: 'Freelinnk System <nao-responda@freelinnk.com>',

      to: 'lucasholt2021@gmail.com', // ✅ Aqui chega pra você
      subject: `⚠️ Cancelamento de Assinatura: ${email}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h1>Novo Feedback de Cancelamento</h1>
          <p><strong>Usuário:</strong> ${email}</p>
          <p><strong>ID:</strong> ${userId}</p>
          <hr />
          <p><strong>Motivo Principal:</strong> ${reason}</p>
          <p><strong>Detalhes/Feedback:</strong><br/> ${feedback}</p>
        </div>
      `
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error); // Bom para ver o erro no terminal se der ruim
    return NextResponse.json({ error: 'Erro ao enviar email' }, { status: 500 });
  }
}