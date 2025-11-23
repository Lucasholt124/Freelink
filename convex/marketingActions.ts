"use node"; // ✅ Aqui SIM precisamos do Node.js para o Resend
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Resend } from "resend";

// 3. ACTION: O motor que envia os emails (Chamado pelo Cron)
export const sendDailyEmails = internalAction({
  handler: async (ctx) => {
    // Inicializa o Resend aqui dentro
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Chama a query do OUTRO arquivo (marketing.ts)
    const targets = await ctx.runQuery(internal.marketing.getTargets);

    if (targets.length > 0) {
      console.log(`📧 Marketing: Enviando para ${targets.length} usuários.`);
    }

    for (const { user, type } of targets) {
      let subject = "";
      let html = "";
      let newStage = 0;

      if (type === 'day3') {
        subject = "👀 Seus links estão meio solitários...";
        html = `<p>Oi ${user.username}, vi que você criou sua conta há 3 dias...</p>`;
        newStage = 1;
      } else if (type === 'day9') {
        subject = "🚀 Aumente seu engajamento hoje";
        html = `<p>Você está perdendo o potencial do plano Pro...</p>`;
        newStage = 2;
      } else if (type === 'day21') {
        subject = "🎁 Última chance do mês";
        html = `<p>Oferta exclusiva expirando...</p>`;
        newStage = 3;
      }

      try {
        if (user.email) {
            await resend.emails.send({
              from: 'Freelinnk <suporte@freelinnk.com>',
              to: user.email,
              subject: subject,
              html: html,
            });

            // Chama a mutation do OUTRO arquivo para atualizar
            await ctx.runMutation(internal.marketing.updateStats, {
              userId: user._id,
              newStage: newStage,
            });
        }
      } catch (error) {
        console.error(`Erro ao enviar para ${user.username}:`, error);
      }
    }
  },
});