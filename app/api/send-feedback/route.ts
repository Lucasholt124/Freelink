// app/api/send-feedback/route.ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// ❌ NÃO INICIALIZE AQUI FORA
// const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    // ✅ INICIALIZE AQUI DENTRO
    // Assim ele só pede a chave quando alguém realmente tentar enviar o email
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { email, feedback, reason, userId } = await req.json();

    await resend.emails.send({
      from: 'Freelinnk System <onboarding@resend.dev>', // Ou seu email verificado
      to: 'lucasholt2021@gmail.com',
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