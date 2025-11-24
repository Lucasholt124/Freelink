import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: Request) {
  // CORREÇÃO 1: Validação mais robusta
  const authHeader = req.headers.get('authorization');
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

  if (!authHeader || authHeader !== expectedAuth) {
    console.error('❌ Unauthorized: Auth header inválido ou ausente');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY não configurado');
    return NextResponse.json({ error: 'Missing Resend API Key' }, { status: 500 });
  }

  const clerk = await clerkClient();
  const users = await clerk.users.getUserList({ limit: 500, orderBy: '-created_at' });

  const emailLog: Array<{ user: string; subject: string; status: string }> = [];
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();
  const dayOfWeek = today.getDay();

  console.log(`🚀 Iniciando envio de emails - ${users.data.length} usuários`);

  for (const user of users.data) {
    const email = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress;
    if (!email) continue;

    const firstName = user.firstName || "Criador";
    const meta = user.publicMetadata;
    const plan = (meta.subscriptionPlan as string) || "free";
    const cartAbandoned = meta.cartAbandoned === true;
    const attemptedPlan = (meta.attemptedPlan as string) || "pro";
    const lastCheckoutAttempt = meta.lastCheckoutAttempt as number | undefined;

    const createdAt = new Date(user.createdAt);
    const daysSinceSignup = Math.floor((today.getTime() - createdAt.getTime()) / (1000 * 3600 * 24));

    let subject = "";
    let htmlContent = "";
    let shouldSend = false;

    // =================================================================
    // PRIORIDADE 1: RECUPERAÇÃO DE CARRINHO (24h após abandono)
    // =================================================================
    if (cartAbandoned && plan === "free" && lastCheckoutAttempt) {
      const hoursSinceAbandonment = (Date.now() - lastCheckoutAttempt) / (1000 * 3600);

      // Enviar apenas se passou entre 2-26 horas (dá tempo de completar naturalmente)
      if (hoursSinceAbandonment >= 2 && hoursSinceAbandonment <= 26) {
        shouldSend = true;
        subject = `⚠️ ${firstName}, sua vaga no ${attemptedPlan.toUpperCase()} está reservada`;
        htmlContent = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px;">
            <h2 style="margin-bottom: 20px;">⏰ Opa! Percebemos que você parou no meio...</h2>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
              ${firstName}, vi que você estava a poucos cliques de desbloquear o plano <strong>${attemptedPlan.toUpperCase()}</strong>.
            </p>
            <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; margin: 24px 0;">
              <p style="margin: 0; font-size: 14px;">⚡ A internet caiu? O café acabou?</p>
              <p style="margin: 8px 0 0 0; font-size: 14px;">Seus concorrentes não param. O FreelinnkBrain já está pronto.</p>
            </div>
            <p style="margin-bottom: 24px;">
              Sua vaga está reservada por mais <strong>24 horas</strong> com o preço promocional.
            </p>
            <a href="https://freelinnk.com/dashboard/billing" style="display: inline-block; background: white; color: #667eea; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px;">
              FINALIZAR AGORA
            </a>
            <p style="margin-top: 32px; font-size: 12px; opacity: 0.8;">
              Após 24h, o desconto expira e as vagas podem esgotar.
            </p>
          </div>
        `;
      }
    }

    // =================================================================
    // PRIORIDADE 2: ONBOARDING AGRESSIVO (Primeiros 30 dias)
    // =================================================================
    else if (daysSinceSignup <= 30 && plan === "free") {

      // Dia 1: Educativo (Não vende)
      if (daysSinceSignup === 1) {
        shouldSend = true;
        subject = `👋 ${firstName}, seu próximo passo no Freelinnk`;
        htmlContent = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <h2 style="color: #6366f1;">Bem-vindo de volta!</h2>
            <p>Olá ${firstName},</p>
            <p>Para você aproveitar ao máximo o Freelinnk, recomendo:</p>
            <ul style="line-height: 1.8;">
              <li><strong>Personalize sua URL:</strong> freelinnk.com/seu-nome</li>
              <li><strong>Adicione uma foto de perfil:</strong> Perfis com foto convertem 30% mais</li>
              <li><strong>Crie seus primeiros 3 links:</strong> Quanto mais links, mais cliques</li>
            </ul>
            <a href="https://freelinnk.com/dashboard" style="display: inline-block; background: #6366f1; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; margin-top: 16px;">Configurar Agora</a>
          </div>
        `;
      }

      // Dia 4: Apresentar a dor do bloqueio criativo
      else if (daysSinceSignup === 4) {
        shouldSend = true;
        subject = `🧠 ${firstName}, acabaram as ideias para hoje?`;
        htmlContent = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <h2 style="color: #1a1a1a;">O bloqueio criativo é o maior inimigo do crescimento</h2>
            <p>Quantas vezes você já ficou 30min olhando para a tela em branco?</p>
            <p>No plano <strong>Pro</strong>, você recebe <strong>5 ideias virais TODO DIA</strong>.</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 24px 0;">
              <p style="margin: 0;"><strong>🎯 5 ideias de posts</strong></p>
              <p style="margin: 8px 0 0 0;"><strong>🎬 5 roteiros de vídeos</strong></p>
              <p style="margin: 8px 0 0 0;"><strong>📊 Analytics que mostram o que funciona</strong></p>
            </div>
            <p>Pare de perder tempo pensando. Deixe a IA pensar por você.</p>
            <a href="https://freelinnk.com/pricing" style="display: inline-block; background: #6366f1; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px;">Liberar Ideias Virais</a>
          </div>
        `;
      }

      // Dia 10: Prova social
      else if (daysSinceSignup === 10) {
        shouldSend = true;
        subject = `📈 Como 500+ criadores estão crescendo 2x mais rápido`;
        htmlContent = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <h2>O segredo está nos dados</h2>
            <p>${firstName}, você já percebeu quais posts funcionam melhor para você?</p>
            <p>Usuários que usam nossos <strong>Analytics Avançados</strong> crescem 2x mais rápido porque:</p>
            <ul style="line-height: 1.8;">
              <li>Sabem quais horários geram mais cliques</li>
              <li>Entendem de onde vem seu público</li>
              <li>Descobrem quais dispositivos seus seguidores usam</li>
            </ul>
            <p style="background: #fef3c7; padding: 16px; border-radius: 8px; border-left: 4px solid #f59e0b;">
              💡 <strong>Teste o Pro por 7 dias.</strong> Se não amar, cancele e receba reembolso total.
            </p>
            <a href="https://freelinnk.com/pricing" style="display: inline-block; background: #6366f1; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; margin-top: 16px;">Ver Analytics Pro</a>
          </div>
        `;
      }

      // Dia 20: Urgência + Escassez
      else if (daysSinceSignup === 20) {
        shouldSend = true;
        subject = `⚡ ${firstName}, apenas 47 vagas restantes no Pro`;
        htmlContent = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
              <p style="margin: 0; color: #991b1b; font-weight: 600;">⚠️ ÚLTIMAS VAGAS COM DESCONTO</p>
            </div>
            <h2>20 dias já passaram...</h2>
            <p>Como estão seus números, ${firstName}?</p>
            <p>Enquanto você pensa, seus concorrentes estão usando IA para:</p>
            <ul style="line-height: 1.8;">
              <li>Gerar 5 ideias virais por dia</li>
              <li>Criar roteiros profissionais em segundos</li>
              <li>Entender exatamente o que funciona com Analytics</li>
            </ul>
            <p style="font-size: 18px; font-weight: 600; color: #ef4444;">
              Apenas 47 vagas restantes com 50% OFF
            </p>
            <a href="https://freelinnk.com/pricing" style="display: inline-block; background: #ef4444; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 700;">GARANTIR MINHA VAGA</a>
          </div>
        `;
      }

      // Dia 29: Última chance do "Mês de Estreia"
      else if (daysSinceSignup === 29) {
        shouldSend = true;
        subject = `👋 ${firstName}, é agora ou nunca (Última chance)`;
        htmlContent = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #1a1a1a; color: white; border-radius: 12px;">
            <h2 style="color: #fbbf24;">⏰ Amanhã faz um mês</h2>
            <p>Queremos te ver no topo, ${firstName}.</p>
            <p>Esta é sua <strong style="color: #fbbf24;">última chance</strong> de pegar o desconto de estreia.</p>
            <div style="border: 2px dashed #fbbf24; padding: 20px; border-radius: 8px; margin: 24px 0; text-align: center;">
              <p style="margin: 0; font-size: 24px; font-weight: 700; color: #fbbf24;">50% OFF</p>
              <p style="margin: 8px 0 0 0;">Expira em 24 horas</p>
            </div>
            <p>Depois disso, volta ao preço cheio.</p>
            <a href="https://freelinnk.com/pricing" style="display: inline-block; background: #fbbf24; color: #1a1a1a; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 700; width: 100%; text-align: center; box-sizing: border-box;">ATIVAR DESCONTO AGORA</a>
          </div>
        `;
      }
    }

    // =================================================================
    // PRIORIDADE 3: ENGAGEMENT DE LONGO PRAZO (Após 30 dias)
    // =================================================================
    else if (daysSinceSignup > 30 && plan === "free") {

      // Terça-feira: Vender funcionalidades específicas
      if (dayOfWeek === 2) {

        // Ciclo de 60 dias: Sorteios
        if (daysSinceSignup % 60 === 0) {
          shouldSend = true;
          subject = `🎁 ${firstName}, o segredo para ganhar 1.000 seguidores em 7 dias`;
          htmlContent = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <h2>Sorteios = Crescimento Exponencial</h2>
              <p>Já viu perfis pequenos ganhando milhares de seguidores com sorteios?</p>
              <p>O Freelinnk tem a <strong>ferramenta de sorteio mais segura do mercado</strong>:</p>
              <ul style="line-height: 1.8;">
                <li>✅ Sorteio automático via comentários</li>
                <li>✅ Validação de participantes</li>
                <li>✅ Certificado oficial de transparência</li>
              </ul>
              <a href="https://freelinnk.com/pricing" style="display: inline-block; background: #6366f1; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; margin-top: 16px;">Criar Meu Sorteio</a>
            </div>
          `;
        }

        // Ciclo de 45 dias: IA de Imagem
        else if (daysSinceSignup % 45 === 0) {
          shouldSend = true;
          subject = `🎨 ${firstName}, suas capas parecem amadoras?`;
          htmlContent = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <h2>A primeira impressão é a que fica</h2>
              <p>Posts com imagens profissionais recebem 3x mais engajamento.</p>
              <p>Com o <strong>Freelinnk Ultra</strong>, você gera:</p>
              <ul style="line-height: 1.8;">
                <li>🎨 7 imagens de estúdio com IA por dia</li>
                <li>✨ Aprimoramentos ilimitados</li>
                <li>🚀 Templates prontos para viralizar</li>
              </ul>
              <a href="https://freelinnk.com/pricing" style="display: inline-block; background: #6366f1; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; margin-top: 16px;">Upgrade para Ultra</a>
            </div>
          `;
        }
      }
    }

    // =================================================================
    // DATAS ESPECIAIS
    // =================================================================

    // Black Friday
    if (currentMonth === 11 && currentDay === 24 && plan !== 'ultra') {
      shouldSend = true;
      subject = "⚫ BLACK FRIDAY: 60% OFF no Freelinnk Ultra";
      htmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #000; color: white; border-radius: 12px;">
          <h1 style="color: #fbbf24; text-align: center;">⚫ BLACK FRIDAY</h1>
          <p style="text-align: center; font-size: 32px; font-weight: 700; color: #fbbf24;">60% OFF</p>
          <p style="text-align: center;">No plano Ultra (R$ 77,90 → R$ 31,16/mês)</p>
          <a href="https://freelinnk.com/pricing" style="display: block; background: #fbbf24; color: #000; padding: 20px; text-decoration: none; border-radius: 8px; text-align: center; font-weight: 700; margin: 24px 0;">APROVEITAR OFERTA</a>
          <p style="text-align: center; font-size: 12px; opacity: 0.7;">Válido apenas hoje</p>
        </div>
      `;
    }

    // Fim de Ano
    if (currentMonth === 12 && currentDay === 28 && plan !== 'ultra') {
      shouldSend = true;
      subject = "📈 Meta 2026: Viver da internet";
      htmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h2>Comece 2026 com as ferramentas certas</h2>
          <p>${firstName}, qual sua meta para o próximo ano?</p>
          <p>O plano <strong>Anual</strong> está com condição especial:</p>
          <ul style="line-height: 1.8;">
            <li>💰 2 meses grátis</li>
            <li>🎁 Bônus exclusivos</li>
            <li>🚀 Suporte VIP</li>
          </ul>
          <a href="https://freelinnk.com/pricing" style="display: inline-block; background: #6366f1; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; margin-top: 16px;">Ver Planos Anuais</a>
        </div>
      `;
    }

    // =================================================================
    // ENVIO FINAL
    // =================================================================
    if (shouldSend) {
      // Não enviar para usuários Ultra (exceto datas especiais)
      if (plan === 'ultra' && !subject.includes('BLACK') && !subject.includes('2026')) {
        continue;
      }

      try {
        await resend.emails.send({
          from: 'Freelinnk <conteudo@freelinnk.com>',
          to: email,
          subject: subject,
          html: htmlContent,
        });
        emailLog.push({ user: email, subject, status: 'sent' });
        console.log(`✅ Email enviado: ${email} - ${subject}`);
      } catch (error) {
        console.error(`❌ Erro ao enviar para ${email}:`, error);
        emailLog.push({ user: email, subject, status: 'failed' });
      }
    }
  }

  console.log(`🎉 Envio concluído - ${emailLog.length} emails processados`);
  return NextResponse.json({ success: true, sent: emailLog.length, log: emailLog });
}