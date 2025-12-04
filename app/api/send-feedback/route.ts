import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(req: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { email, feedback, reason, userId } = await req.json();

    await resend.emails.send({
      // ✅ CORRIGIDO: Usa o domínio verificado no Resend
      from: 'Freelinnk System <contato@send.freelinnk.com>',
      to: 'lucasholt2021@gmail.com', // Envia para você (Admin)
      replyTo: email, // Se você clicar em responder, responde para o usuário
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
    console.error(error);
    return NextResponse.json({ error: 'Erro ao enviar email' }, { status: 500 });
  }
}