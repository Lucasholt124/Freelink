import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const clerk = await clerkClient();
  const users = await clerk.users.getUserList({ limit: 100, orderBy: '-created_at' });

  const emailLog = [];
  const today = new Date();
  const currentMonth = today.getMonth() + 1; // 1-12
  const currentDay = today.getDate(); // 1-31
  const dayOfWeek = today.getDay(); // 0 (Domingo) - 6 (Sábado)

  for (const user of users.data) {
    const email = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress;
    if (!email) continue;

    const firstName = user.firstName || "Criador";
    const meta = user.publicMetadata;
    const plan = (meta.subscriptionPlan as string) || "free";
    const cartAbandoned = meta.cartAbandoned === true;
    const attemptedPlan = (meta.attemptedPlan as string) || "pro";

    const createdAt = new Date(user.createdAt);
    const daysSinceSignup = Math.floor((today.getTime() - createdAt.getTime()) / (1000 * 3600 * 24));

    let subject = "";
    let htmlContent = "";
    let shouldSend = false;

    // =================================================================
    // PRIORIDADE 1: RECUPERAÇÃO DE CARRINHO (Imediato após abandono)
    // =================================================================
    if (cartAbandoned && plan === "free") {
      shouldSend = true;
      subject = `⚠️ ${firstName}, finaliza logo isso! (Vaga Reservada)`;
      htmlContent = `
        <div style="font-family: sans-serif; color: #333;">
          <h2>Opa, a internet caiu?</h2>
          <p>Vi que você ia assinar o plano <strong>${attemptedPlan.toUpperCase()}</strong> mas parou no meio.</p>
          <p>Seus concorrentes não param. O FreelinnkBrain já está pronto para gerar seus roteiros.</p>
          <p><a href="https://freelinnk.com/pricing">Clique aqui para finalizar e garantir o preço antigo.</a></p>
        </div>`;
    }

    // =================================================================
    // PRIORIDADE 2: ONBOARDING AGRESSIVO (Primeiros 30 dias)
    // =================================================================
    else if (daysSinceSignup <= 30 && plan === "free") {

      // Dia 2: Educativo (Não vende, gera valor)
      if (daysSinceSignup === 2) {
        shouldSend = true;
        subject = `💡 Dica rápida para seu perfil bombar`;
        htmlContent = `<p>Oi ${firstName}. Sabia que bios com foto de rosto convertem 30% mais? Atualize sua foto no Freelinnk hoje.</p>`;
      }

      // Dia 5: A Dor (Writer's Block) -> Venda Pro
      else if (daysSinceSignup === 5) {
        shouldSend = true;
        subject = `🧠 Sem ideias para postar hoje?`;
        htmlContent = `
          <p>O bloqueio criativo é o maior inimigo do crescimento.</p>
          <p>No plano <strong>Pro</strong>, você recebe 5 ideias virais TODO DIA.</p>
          <p>Pare de perder tempo pensando. Deixe a IA pensar por você.</p>
          <a href="https://freelinnk.com/pricing">Liberar Ideias Virais</a>
        `;
      }

      // Dia 14: Prova Social + Escassez
      else if (daysSinceSignup === 14) {
        shouldSend = true;
        subject = `🔥 O que 500 criadores descobriram...`;
        htmlContent = `
          <p>Metade do mês já foi. Como estão seus números?</p>
          <p>Usuários que usam nossos Analytics Avançados crescem 2x mais rápido porque sabem o que funciona.</p>
          <p>Teste o Pro por um mês. Cancele se não amar.</p>
          <a href="https://freelinnk.com/pricing">Ver Analytics Pro</a>
        `;
      }

      // Dia 29: Última chance do "Mês de Estreia"
      else if (daysSinceSignup === 29) {
        shouldSend = true;
        subject = `👋 ${firstName}, é agora ou nunca (Oferta de Estreia)`;
        htmlContent = `<p>Amanhã faz um mês que você chegou. Queremos te ver no topo. Última chance de pegar o desconto.</p>`;
      }
    }

    // =================================================================
    // PRIORIDADE 3: ENGAGEMENT DE LONGO PRAZO (O Ano Todo)
    // Estratégia: Vender funcionalidades específicas, não o plano todo.
    // Frequência: Baixa (a cada 15 ou 20 dias) ou Datas Especiais.
    // =================================================================
    else if (daysSinceSignup > 30) {

      // Lógica Rotativa: A cada 2 semanas, foca em UMA feature diferente
      // Usamos o resto da divisão (%) para criar um ciclo infinito

      // Se for Terça-feira (Dia 2) E cair no ciclo correto
      if (dayOfWeek === 2) {

        // Ciclo A: Vender Sorteios (Para usuários Pro e Free)
        if (daysSinceSignup % 60 === 0) { // A cada 2 meses
            shouldSend = true;
            subject = `🎁 O segredo para ganhar seguidores rápido`;
            htmlContent = `<p>Sorteios são a forma mais rápida de crescer. O Freelinnk tem a ferramenta de sorteio mais segura do mercado. Já testou?</p>`;
        }

        // Ciclo B: Vender IA de Imagem (Para Free e Pro) -> Foco no Ultra
        else if (daysSinceSignup % 45 === 0) {
            shouldSend = true;
            subject = `🎨 Suas capas parecem profissionais?`;
            htmlContent = `<p>A primeira impressão é a que fica. Com o Freelinnk Ultra, você gera imagens de estúdio com IA.</p>`;
        }
      }

      // DATAS ESPECIAIS (Hardcoded para o ano todo)
      // Black Friday
      if (currentMonth === 11 && currentDay === 24) {
         shouldSend = true;
         subject = "⚫ O desconto que você esperava o ano todo";
         htmlContent = "<p>Black Friday Freelinnk: Upgrade com 60% OFF.</p>";
      }
      // Fim de Ano
      if (currentMonth === 12 && currentDay === 28) {
         shouldSend = true;
         subject = "📈 Meta para 2026: Viver da internet";
         htmlContent = "<p>Comece o ano com as ferramentas certas. O plano Anual está com condição especial.</p>";
      }
    }

    // =================================================================
    // ENVIO FINAL
    // =================================================================
    if (shouldSend) {
      // Pequena proteção para não enviar e-mail se ele JÁ for Ultra (exceto renovação)
      if (plan === 'ultra' && !subject.includes('Renovação')) {
          // Se for Ultra, mandamos apenas dicas de uso, não vendas agressivas.
          // Você pode criar um IF específico para Ultra aqui se quiser.
          continue;
      }

      try {
        await resend.emails.send({
          from: 'Freelinnk <conteudo@freelinnk.com>',
          to: email,
          subject: subject,
          html: htmlContent, // Recomendo criar templates React bonitos para substituir essas strings simples
        });
        emailLog.push({ user: email, subject, status: 'sent' });
      } catch (error) {
        console.error(error);
      }
    }
  }

  return NextResponse.json({ success: true, log: emailLog });
}