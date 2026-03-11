import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// ============================================================
// 🎯 CONFIGURAÇÃO & TIPAGEM
// ============================================================

const MAX_EMAILS_FIRST_MONTH = 5;
const MAX_EMAILS_PER_MONTH_ONGOING = 2;
const BATCH_SIZE = 10; // Processa 10 emails simultâneos para evitar Timeout
const CLERK_LIMIT = 499; // Limite de segurança por página

interface UserMetadata {
  emailHistory?: number[];
  subscriptionPlan?: string;
  cartAbandoned?: boolean;
  attemptedPlan?: string;
  lastCheckoutAttempt?: number;
  lastEmailSent?: number;
  totalEmailsReceived?: number;
  hasCustomUrl?: boolean;
  linksCreated?: number;
  totalClicks?: number;
  lastLogin?: number;
  [key: string]: unknown;
}

interface UserContext {
  userId: string;
  email: string;
  firstName: string;
  plan: 'free' | 'pro' | 'ultra';
  daysSinceSignup: number;
  monthsSinceSignup: number;
  cartAbandoned: boolean;
  attemptedPlan: string;
  hoursSinceAbandonment: number | null;
  lastEmailSent: number | null;
  emailsThisMonth: number;
  totalEmailsReceived: number;
  hasCustomUrl: boolean;
  hasProfilePhoto: boolean;
  linksCreated: number;
  totalClicks: number;
  lastLogin: number | null;
  isActive: boolean;
  meta: UserMetadata;
}

interface EmailTemplate {
  subject: string;
  preheader: string;
  html: string;
  priority: number;
  cooldownHours: number;
  countTowardsLimit: boolean;
}

// Adiciona rodapé obrigatório para evitar SPAM
function wrapHtml(content: string): string {

  const footer = `
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-family: sans-serif;">
      <p style="font-size: 12px; color: #94a3b8; margin-bottom: 8px;">
        Enviado com 💜 pela equipe Freelinnk
      </p>
      <p style="font-size: 11px; color: #cbd5e1; line-height: 1.5;">
        Você recebeu este e-mail porque se cadastrou na plataforma.<br>
        Para parar de receber estas dicas, acesse suas <a href="https://www.freelinnk.com/dashboard/settings" style="color: #94a3b8; text-decoration: underline;">configurações de notificação</a>.
      </p>
    </div>
  `;

  if (content.includes('</body>')) {
    return content.replace('</body>', `${footer}</body>`);
  }
  return content + footer;
}

// ============================================================
// 📅 CÁLCULO DE DATAS ESPECIAIS
// ============================================================

function getBlackFridayDate(year: number): Date {
  let firstFriday = 1;
  while (new Date(year, 10, firstFriday).getDay() !== 5) {
    firstFriday++;
  }
  return new Date(year, 10, firstFriday + 21);
}

function isBlackFridayWeekend(date: Date): boolean {
  const year = date.getFullYear();
  const blackFriday = getBlackFridayDate(year);
  const start = new Date(blackFriday);
  const end = new Date(blackFriday);
  end.setDate(end.getDate() + 2);
  return date >= start && date <= end;
}

function isEndOfYear(date: Date): boolean {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return month === 12 && day >= 28;
}

// ============================================================
// 📧 TEMPLATES - FOCADOS EM VENDAS E TRÁFEGO
// ============================================================

function getValueDay3Email(ctx: UserContext): EmailTemplate {
  const raw = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <p style="color: #64748b; font-size: 15px; margin: 0 0 24px 0;">${ctx.firstName},</p>
      <h1 style="color: #1e293b; font-size: 24px; font-weight: 600; margin: 0 0 24px 0; line-height: 1.4;">Seu link atual pode estar espantando clientes.</h1>
      <p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 16px 0;">Você já parou para pensar que uma vitrine amadora reduz sua taxa de conversão em até 40%?</p>
      <p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 24px 0;">E o pior: se você não rastreia quem clica, você não pode fazer campanhas de remarketing para eles.</p>
      <div style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); border-radius: 12px; padding: 28px; margin: 24px 0; color: white;">
        <p style="font-size: 12px; opacity: 0.7; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 1px;">💡 A SOLUÇÃO DEFINITIVA</p>
        <p style="font-size: 18px; font-weight: 500; line-height: 1.5; margin: 0 0 16px 0;">No Freelinnk, você injeta o Pixel do Facebook na sua vitrine com 1 clique.</p>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <span style="background: rgba(255,255,255,0.15); padding: 6px 12px; border-radius: 20px; font-size: 12px;">📈 Remarketing Automático</span>
          <span style="background: rgba(255,255,255,0.15); padding: 6px 12px; border-radius: 20px; font-size: 12px;">🎯 Dados Reais</span>
        </div>
      </div>
      <p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 32px 0;">Nos planos Pro e Ultra, a sua página trabalha a seu favor. Nunca mais perca um lead qualificado.</p>
      <div style="text-align: center;">
        <a href="https://www.freelinnk.com/dashboard/billing" style="display: inline-block; background: #1e293b; color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px;">Conhecer Planos Pro</a>
      </div>
    </div>
  </div>
</body>
</html>`;
  return {
    subject: `O segredo para parar de perder vendas`,
    preheader: 'Como o Pixel transforma cliques em clientes',
    priority: 70,
    cooldownHours: 72,
    countTowardsLimit: true,
    html: wrapHtml(raw)
  };
}

function getSocialProofDay7Email(ctx: UserContext): EmailTemplate {
  const raw = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <p style="color: #64748b; font-size: 15px; margin: 0 0 24px 0;">Oi ${ctx.firstName},</p>
      <p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 16px 0;">Queria compartilhar o que acontece quando você automatiza o tráfego:</p>
      <div style="background: #f8fafc; border-left: 4px solid #6366f1; padding: 24px; margin: 24px 0; border-radius: 0 12px 12px 0;">
        <p style="color: #1e293b; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0; font-style: italic;">"Eu estava dependendo apenas do tráfego orgânico do Insta. Ativei a Rede de Anúncios do Freelinnk e recebi mais de 4.000 visualizações na minha vitrine vindas de outras páginas do meu nicho. Minhas vendas duplicaram."</p>
        <div style="display: flex; align-items: center;">
          <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); border-radius: 50%; margin-right: 14px;"></div>
          <div>
            <p style="margin: 0; color: #1e293b; font-weight: 600;">Ricardo Sales</p>
            <p style="margin: 2px 0 0 0; color: #64748b; font-size: 14px;">Dono de E-commerce</p>
          </div>
        </div>
      </div>
      <div style="display: flex; gap: 12px; margin: 24px 0;">
        <div style="flex: 1; background: #f0fdf4; border-radius: 12px; padding: 20px; text-align: center;">
          <p style="color: #22c55e; font-size: 24px; font-weight: 700; margin: 0;">+4k</p>
          <p style="color: #64748b; font-size: 12px; margin: 6px 0 0 0;">visitas extras</p>
        </div>
        <div style="flex: 1; background: #fef3c7; border-radius: 12px; padding: 20px; text-align: center;">
          <p style="color: #f59e0b; font-size: 24px; font-weight: 700; margin: 0;">2x</p>
          <p style="color: #64748b; font-size: 12px; margin: 6px 0 0 0;">mais vendas</p>
        </div>
      </div>
      <div style="text-align: center;">
        <a href="https://www.freelinnk.com/dashboard/billing" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px;">Quero tráfego assim</a>
      </div>
    </div>
  </div>
</body>
</html>`;
  return {
    subject: `Como o Ricardo duplicou as vendas com nosso Hub`,
    preheader: 'Tráfego automático pra sua vitrine',
    priority: 65,
    cooldownHours: 96,
    countTowardsLimit: true,
    html: wrapHtml(raw)
  };
}

function getMidMonthDay14Email(ctx: UserContext): EmailTemplate {
  const raw = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <p style="color: #64748b; font-size: 15px; margin: 0 0 24px 0;">${ctx.firstName},</p>
      <h1 style="color: #1e293b; font-size: 24px; font-weight: 600; margin: 0 0 24px 0; line-height: 1.4;">2 semanas já se passaram.</h1>
      <p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 16px 0;">Pergunta honesta: você está gerando lucro real ou só volume de cliques?</p>
      ${ctx.totalClicks > 0 ? `<p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 24px 0;">Você já teve <strong style="color: #6366f1;">${ctx.totalClicks} cliques</strong>. Sabe exatamente quantos viraram dinheiro no bolso?</p>` : ''}
      <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <p style="color: #64748b; font-size: 13px; margin: 0 0 16px 0; text-transform: uppercase;">Média: Free vs Ultra</p>
        <div style="margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="color: #1e293b; font-size: 14px;">Tráfego Recebido</span>
            <span style="color: #22c55e; font-size: 14px; font-weight: 600;">15.000 visualizações</span>
          </div>
          <div style="background: #e2e8f0; height: 6px; border-radius: 3px; overflow: hidden;"><div style="background: #22c55e; height: 100%; width: 85%;"></div></div>
        </div>
        <div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="color: #1e293b; font-size: 14px;">Controle Financeiro</span>
            <span style="color: #6366f1; font-size: 14px; font-weight: 600;">CRM Completo</span>
          </div>
          <div style="background: #e2e8f0; height: 6px; border-radius: 3px; overflow: hidden;"><div style="background: #6366f1; height: 100%; width: 100%;"></div></div>
        </div>
      </div>
      <div style="text-align: center;">
        <a href="https://www.freelinnk.com/dashboard/billing" style="display: inline-block; background: #1e293b; color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px;">Assumir controle do negócio</a>
      </div>
    </div>
  </div>
</body>
</html>`;
  return {
    subject: `${ctx.firstName}, você sabe quanto lucrou essas semanas?`,
    preheader: 'A importância de um CRM integrado',
    priority: 60,
    cooldownHours: 168,
    countTowardsLimit: true,
    html: wrapHtml(raw)
  };
}

function getLastChanceDay25Email(ctx: UserContext): EmailTemplate {
  const raw = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); border-radius: 16px; padding: 48px 40px; text-align: center; color: white;">
      <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 16px 0;">${ctx.firstName}, seu primeiro mês está acabando</h1>
      <p style="font-size: 16px; opacity: 0.9; margin: 0 0 32px 0;">Não deixe sua vitrine sem tráfego e sem rastreamento.</p>
      <div style="background: rgba(251, 191, 36, 0.15); border: 2px solid rgba(251, 191, 36, 0.4); border-radius: 12px; padding: 28px; margin: 0 0 32px 0;">
        <p style="color: #fbbf24; font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase;">Oferta de primeiro mês</p>
        <p style="font-size: 48px; font-weight: 800; margin: 0; color: #fbbf24;">50% OFF</p>
        <p style="font-size: 16px; margin: 12px 0 0 0; opacity: 0.9;">Plano Pro por <strong>R$ 34,90</strong></p>
      </div>
      <a href="https://www.freelinnk.com/dashboard/billing" style="display: inline-block; background: #fbbf24; color: #1e1b4b; padding: 18px 48px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px;">Ativar desconto e crescer</a>
    </div>
  </div>
</body>
</html>`;
  return {
    subject: `${ctx.firstName}, seu desconto expira em breve`,
    preheader: 'Última chance de garantir as ferramentas de venda',
    priority: 80,
    cooldownHours: 168,
    countTowardsLimit: true,
    html: wrapHtml(raw)
  };
}

function getCartAbandonedEmail(ctx: UserContext): EmailTemplate {
  const planDetails: Record<string, { price: string; benefits: string[] }> = {
    pro: {
      price: 'R$ 34,90',
      benefits: ['Até 2.000 Views de Tráfego Automático', 'Pixel de Rastreamento', 'Analytics Profundo', 'Múltiplas Vitrines']
    },
    ultra: {
      price: 'R$ 77,90',
      benefits: ['Até 15.000 Views de Tráfego', 'Calculadora de Lucros e CRM', 'Sem Anúncios de Terceiros', 'Suporte VIP']
    }
  };
  const plan = planDetails[ctx.attemptedPlan] || planDetails.pro;

  const raw = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <h1 style="color: #1e293b; font-size: 24px; font-weight: 600; margin: 0 0 24px 0;">${ctx.firstName}, percebi que você não finalizou a compra</h1>
      <p style="color: #475569; font-size: 16px; line-height: 1.7; margin: 0 0 24px 0;">Acontece! Seu carrinho com o plano <strong style="color: #6366f1;">${ctx.attemptedPlan.toUpperCase()}</strong> ainda está salvo e a sua Máquina de Vendas está pronta pra rodar.</p>
      <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin: 0 0 24px 0;">
        ${plan.benefits.map(b => `<div style="display: flex; align-items: center; margin-bottom: 10px;"><span style="color: #22c55e; margin-right: 10px;">✓</span><span style="color: #1e293b; font-size: 15px;">${b}</span></div>`).join('')}
      </div>
      <div style="text-align: center;">
        <a href="https://www.freelinnk.com/dashboard/billing" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 18px 48px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">Continuar e Escalar Vendas</a>
      </div>
    </div>
  </div>
</body>
</html>`;
  return {
    subject: `${ctx.firstName}, você deixou suas vendas pra trás`,
    preheader: `Seu upgrade para ${ctx.attemptedPlan.toUpperCase()} está esperando`,
    priority: 100,
    cooldownHours: 48,
    countTowardsLimit: false,
    html: wrapHtml(raw)
  };
}

function getGiveawayFeatureEmail(ctx: UserContext): EmailTemplate {
  const raw = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <div style="text-align: center; margin-bottom: 24px;"><span style="font-size: 48px;">🎁</span></div>
      <h1 style="color: #1e293b; font-size: 24px; font-weight: 600; margin: 0 0 24px 0; text-align: center;">Transforme comentários em leads</h1>
      <p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 16px 0;">${ctx.firstName}, sabe qual é o jeito mais barato de levar tráfego pra sua vitrine?</p>
      <p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 24px 0;">Criando um <strong>Sorteio no Instagram</strong> pedindo para clicarem no seu link.</p>
      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%); border-radius: 12px; padding: 24px; margin: 24px 0;">
        <p style="color: #92400e; font-size: 14px; margin: 0 0 12px 0; font-weight: 600;">🎁 SORTEADOR NATIVO FREELINNK</p>
        <ul style="color: #78350f; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
          <li>Puxa todos os comentários do post automaticamente</li>
          <li>Filtro anti-bot rigoroso</li>
          <li>Certificado de sorteio limpo</li>
        </ul>
      </div>
      <p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 32px 0;">Leve tráfego orgânico pra sua vitrine sem pagar Ads.</p>
      <div style="text-align: center;">
        <a href="https://www.freelinnk.com/dashboard/giveaway" style="display: inline-block; background: #f59e0b; color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: 600;">Acessar o Sorteador</a>
      </div>
    </div>
  </div>
</body>
</html>`;
  return {
    subject: `${ctx.firstName}, o segredo para atrair clientes grátis no Instagram`,
    preheader: 'A estratégia dos sorteios conectada ao seu link',
    priority: 50,
    cooldownHours: 336,
    countTowardsLimit: true,
    html: wrapHtml(raw)
  };
}

function getImageAIFeatureEmail(ctx: UserContext): EmailTemplate {
  const raw = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <h1 style="color: #1e293b; font-size: 24px; font-weight: 600; margin: 0 0 24px 0;">${ctx.firstName}, já ouviu falar de Tráfego Cruzado?</h1>
      <p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 24px 0;">Essa é a ferramenta mais poderosa que os assinantes Premium do Freelinnk usam.</p>
      <div style="display: flex; gap: 16px; margin: 24px 0;">
        <div style="flex: 1; background: #fee2e2; border-radius: 12px; padding: 20px; text-align: center;">
          <span style="font-size: 32px;">📱</span>
          <p style="color: #991b1b; font-size: 14px; font-weight: 600; margin: 12px 0 4px 0;">Apenas na sua bio</p>
          <p style="color: #b91c1c; font-size: 24px; font-weight: 700; margin: 0;">Baixo</p>
          <p style="color: #991b1b; font-size: 12px; margin: 0;">alcance</p>
        </div>
        <div style="flex: 1; background: #d1fae5; border-radius: 12px; padding: 20px; text-align: center;">
          <span style="font-size: 32px;">✨</span>
          <p style="color: #065f46; font-size: 14px; font-weight: 600; margin: 12px 0 4px 0;">No Ads Hub</p>
          <p style="color: #059669; font-size: 24px; font-weight: 700; margin: 0;">Alto</p>
          <p style="color: #065f46; font-size: 12px; margin: 0;">Tráfego Automático</p>
        </div>
      </div>
      <p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 16px 0;">No <strong style="color: #8b5cf6;">Freelinnk Pro/Ultra</strong>:</p>
      <ul style="color: #475569; font-size: 15px; line-height: 2; margin: 0 0 24px 0; padding-left: 20px;">
        <li>Você cadastra uma foto ou vídeo do seu produto.</li>
        <li>Nós rodamos ele em carrosséis nas páginas da nossa rede de usuários.</li>
        <li>Você ganha clientes de pessoas que nunca te seguiram no Instagram.</li>
      </ul>
      <div style="text-align: center;">
        <a href="https://www.freelinnk.com/dashboard/ads" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: 600;">Ativar Hub de Tráfego</a>
      </div>
    </div>
  </div>
</body>
</html>`;
  return {
    subject: `${ctx.firstName}, como conseguir tráfego sem pagar o Facebook`,
    preheader: 'O segredo do Tráfego Cruzado do Freelinnk',
    priority: 50,
    cooldownHours: 336,
    countTowardsLimit: true,
    html: wrapHtml(raw)
  };
}

function getAnalyticsFeatureEmail(ctx: UserContext): EmailTemplate {
  const raw = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <div style="text-align: center; margin-bottom: 24px;"><span style="font-size: 48px;">📊</span></div>
      <h1 style="color: #1e293b; font-size: 24px; font-weight: 600; margin: 0 0 24px 0; text-align: center;">De qual cidade os seus clientes compram?</h1>
      <p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 24px 0;">${ctx.firstName}, aposto que você não sabe qual o horário de maior tráfego da sua loja hoje.</p>
      <ul style="color: #475569; font-size: 15px; line-height: 2.2; margin: 0 0 24px 0; padding-left: 20px;">
        <li>De qual link sai mais vendas?</li>
        <li>Quanto tempo o cliente fica na página?</li>
        <li>É hora de ativar o Pixel de rastreio?</li>
      </ul>
      <div style="background: #f0f4ff; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <p style="color: #6366f1; font-size: 14px; margin: 0 0 12px 0; font-weight: 600;">📈 NOSSAS ANÁLISES PROFUNDAS:</p>
        <p style="color: #475569; font-size: 14px; line-height: 1.8; margin: 0;">• Mapa de calor de cliques<br>• Localização precisa dos visitantes<br>• Dispositivos e Taxa de Conversão<br>• Integração com o Pixel Meta</p>
      </div>
      <p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 32px 0;">Lojista cego não escala. Desbloqueie seus dados reais.</p>
      <div style="text-align: center;">
        <a href="https://www.freelinnk.com/dashboard/billing" style="display: inline-block; background: #1e293b; color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: 600;">Desbloquear Analytics</a>
      </div>
    </div>
  </div>
</body>
</html>`;
  return {
    subject: `${ctx.firstName}, a sua loja está vendendo às cegas?`,
    preheader: 'Dados que geram vendas reais',
    priority: 50,
    cooldownHours: 336,
    countTowardsLimit: true,
    html: wrapHtml(raw)
  };
}

function getVideoScriptsEmail(ctx: UserContext): EmailTemplate {
  const raw = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <div style="text-align: center; margin-bottom: 24px;"><span style="font-size: 48px;">💰</span></div>
      <h1 style="color: #1e293b; font-size: 24px; font-weight: 600; margin: 0 0 24px 0; text-align: center;">E o seu caixa, como está?</h1>
      <p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 24px 0;">${ctx.firstName}, faturamento não é lucro.</p>
      <div style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); border-radius: 12px; padding: 24px; margin: 24px 0; color: white;">
        <p style="font-size: 12px; opacity: 0.7; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 1px;">💳 CONHEÇA A CALCULADORA INTELIGENTE</p>
        <p style="font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">Seu negócio precisa de um CRM interno</p>
        <p style="font-size: 14px; opacity: 0.9; margin: 0 0 16px 0; line-height: 1.6;">Use a aba Financeira do Freelinnk Ultra para registrar custos fixos, taxa de cartão, frete e custo de anúncios. O sistema te entrega exatamente qual a sua margem de lucro por produto.</p>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <span style="background: rgba(255,255,255,0.15); padding: 4px 10px; border-radius: 12px; font-size: 11px;">📊 Gestão Financeira</span>
          <span style="background: rgba(255,255,255,0.15); padding: 4px 10px; border-radius: 12px; font-size: 11px;">💵 Margem Real</span>
        </div>
      </div>
      <p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 32px 0;">Esse recurso transformou perfis comuns em empresas lucrativas.</p>
      <div style="text-align: center;">
        <a href="https://www.freelinnk.com/dashboard/profit-calculator" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: 600;">Calcular Meus Lucros</a>
      </div>
    </div>
  </div>
</body>
</html>`;
  return {
    subject: `${ctx.firstName}, faturamento não é lucro. Entenda seu caixa.`,
    preheader: 'Como usar a Calculadora Inteligente',
    priority: 50,
    cooldownHours: 336,
    countTowardsLimit: true,
    html: wrapHtml(raw)
  };
}

function getSavingsComparisonEmail(ctx: UserContext): EmailTemplate {
  const raw = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <h1 style="color: #1e293b; font-size: 24px; font-weight: 600; margin: 0 0 24px 0;">Faz as contas do seu negócio, ${ctx.firstName}</h1>
      <p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 24px 0;">Se você assinar serviços gringos separadamente:</p>
      <div style="background: #fee2e2; border-radius: 12px; padding: 20px; margin: 0 0 16px 0;">
        <p style="color: #991b1b; font-size: 14px; margin: 0 0 12px 0; font-weight: 600;">❌ ASSINATURAS SEPARADAS</p>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;"><span style="color: #7f1d1d; font-size: 14px;">Linktree Pro (Só pra colocar Pixel)</span><span style="color: #7f1d1d; font-size: 14px;">US$ 10 (R$ 55/mês)</span></div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;"><span style="color: #7f1d1d; font-size: 14px;">Software de Sorteios</span><span style="color: #7f1d1d; font-size: 14px;">R$ 30/mês</span></div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;"><span style="color: #7f1d1d; font-size: 14px;">CRM / Gestão Financeira</span><span style="color: #7f1d1d; font-size: 14px;">R$ 69/mês</span></div>
        <div style="border-top: 1px solid #fca5a5; padding-top: 12px; margin-top: 12px; display: flex; justify-content: space-between;"><span style="color: #7f1d1d; font-size: 16px; font-weight: 700;">TOTAL</span><span style="color: #7f1d1d; font-size: 16px; font-weight: 700;">R$ 154/mês</span></div>
      </div>
      <div style="background: #d1fae5; border-radius: 12px; padding: 20px; margin: 0 0 24px 0;">
        <p style="color: #065f46; font-size: 14px; margin: 0 0 12px 0; font-weight: 600;">✅ A MÁQUINA FREELINNK ULTRA</p>
        <div style="display: flex; justify-content: space-between;"><span style="color: #065f46; font-size: 16px; font-weight: 700;">Vitrine, Hub de Ads, CRM e Pixel</span><span style="color: #065f46; font-size: 16px; font-weight: 700;">R$ 77,90/mês</span></div>
      </div>
      <div style="text-align: center;">
        <a href="https://www.freelinnk.com/dashboard/billing" style="display: inline-block; background: #059669; color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: 600;">Cortar Custos Agora</a>
      </div>
    </div>
  </div>
</body>
</html>`;
  return {
    subject: `${ctx.firstName}, pare de pagar em Dólar por ferramentas caras`,
    preheader: 'Como economizar dinheiro centralizando o negócio',
    priority: 50,
    cooldownHours: 336,
    countTowardsLimit: true,
    html: wrapHtml(raw)
  };
}

function getReEngagementEmail(ctx: UserContext): EmailTemplate {
  const raw = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <div style="text-align: center; margin-bottom: 24px;"><span style="font-size: 48px;">👋</span></div>
      <h1 style="color: #1e293b; font-size: 24px; font-weight: 600; margin: 0 0 24px 0; text-align: center;">Oi ${ctx.firstName}, você parou de vender?</h1>
      <p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 16px 0;">Faz um tempinho que você não acessa o painel do seu negócio.</p>
      <p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 24px 0;">Enquanto isso, liberamos novidades incríveis pra atrair tráfego:</p>
      <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 0 0 24px 0;">
        <div style="margin-bottom: 16px;"><span style="color: #6366f1; font-weight: 600;">📣 Hub de Anúncios</span><p style="color: #64748b; font-size: 14px; margin: 4px 0 0 0;">Crie campanhas para mostrar seu produto para milhares de pessoas de graça.</p></div>
        <div style="margin-bottom: 16px;"><span style="color: #6366f1; font-weight: 600;">💰 CRM de Lucros</span><p style="color: #64748b; font-size: 14px; margin: 4px 0 0 0;">Controle suas despesas financeiras dentro do próprio painel.</p></div>
        <div><span style="color: #6366f1; font-weight: 600;">🎯 Integração com Pixel</span><p style="color: #64748b; font-size: 14px; margin: 4px 0 0 0;">A base sólida para você fazer remarketing.</p></div>
      </div>
      <div style="text-align: center;">
        <a href="https://www.freelinnk.com/dashboard" style="display: inline-block; background: #6366f1; color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: 600;">Voltar a Crescer</a>
      </div>
    </div>
  </div>
</body>
</html>`;
  return {
    subject: `${ctx.firstName}, você parou de faturar?`,
    preheader: 'A máquina de vendas tá pronta pra rodar de novo',
    priority: 55,
    cooldownHours: 720,
    countTowardsLimit: true,
    html: wrapHtml(raw)
  };
}

function getNewMonthEmail(ctx: UserContext): EmailTemplate {
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const currentMonth = monthNames[new Date().getMonth()];
  const raw = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 16px; padding: 48px 40px; text-align: center; color: white;">
      <span style="font-size: 48px; display: block; margin-bottom: 16px;">🚀</span>
      <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 16px 0;">${currentMonth} é o mês de bater a meta!</h1>
    </div>
    <div style="background: white; border-radius: 16px; padding: 32px; margin-top: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 24px 0;">${ctx.firstName}, sua vitrine está pronta para receber tráfego pesado.</p>
      <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 0 0 24px 0;">
        <p style="color: #64748b; font-size: 14px; margin: 0 0 12px 0;">Dicas para multiplicar as vendas este mês:</p>
        <ul style="color: #1e293b; font-size: 15px; line-height: 2; margin: 0; padding-left: 20px;">
          <li>Ligue a campanha do Hub de Anúncios.</li>
          <li>Analise quais links tiveram cliques e remova os links fracos.</li>
          <li>Cadastre os seus custos fixos na Calculadora.</li>
        </ul>
      </div>
      <div style="text-align: center;">
        <a href="https://www.freelinnk.com/dashboard" style="display: inline-block; background: #1e293b; color: white; padding: 14px 36px; text-decoration: none; border-radius: 12px; font-weight: 600;">Abrir Meu Painel</a>
      </div>
    </div>
  </div>
</body>
</html>`;
  return {
    subject: `${ctx.firstName}, chegou a hora de bater a meta em ${currentMonth}`,
    preheader: 'Estratégias de vendas para virar o mês no lucro',
    priority: 45,
    cooldownHours: 672,
    countTowardsLimit: true,
    html: wrapHtml(raw)
  };
}

function getBlackFridayEmail(ctx: UserContext): EmailTemplate {
  const year = new Date().getFullYear();
  const raw = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #000;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%); border: 1px solid #333; border-radius: 16px; padding: 48px 40px; text-align: center;">
      <p style="color: #fbbf24; font-size: 14px; font-weight: 600; letter-spacing: 2px; margin: 0 0 16px 0;">BLACK FRIDAY ${year}</p>
      <h1 style="color: white; font-size: 64px; font-weight: 800; margin: 0 0 8px 0;">60<span style="color: #fbbf24;">%</span> OFF</h1>
      <p style="color: #9ca3af; font-size: 18px; margin: 0 0 32px 0;">no Plano Ultra Anual, ${ctx.firstName}</p>
      <div style="background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 12px; padding: 24px; margin: 0 0 32px 0;">
        <p style="color: #fbbf24; font-size: 40px; font-weight: 700; margin: 0;">Tráfego Máximo</p>
        <p style="font-size: 16px; color: #9ca3af; margin-top:10px;">Até 15k visualizações no seu anúncio</p>
      </div>
      <a href="https://www.freelinnk.com/dashboard/billing" style="display: block; background: #fbbf24; color: #000; padding: 20px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 18px;">GARANTIR A MÁQUINA DE VENDAS</a>
      <p style="color: #6b7280; font-size: 13px; margin: 24px 0 0 0;">⏰ Oferta expira em 24 horas</p>
    </div>
  </div>
</body>
</html>`;
  return {
    subject: `⚫ ${ctx.firstName}, A Máquina de Vendas por 60% a menos`,
    preheader: 'Maior desconto do ano no Freelinnk',
    priority: 100,
    cooldownHours: 0,
    countTowardsLimit: false,
    html: wrapHtml(raw)
  };
}

function getEndOfYearEmail(ctx: UserContext): EmailTemplate {
  const nextYear = new Date().getFullYear() + 1;
  const raw = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%); border-radius: 16px; padding: 48px 40px; color: white; text-align: center;">
      <span style="font-size: 48px; display: block; margin-bottom: 20px;">🎆</span>
      <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 16px 0;">${ctx.firstName}, construa sua base para ${nextYear}</h1>
      <p style="font-size: 16px; opacity: 0.9; margin: 0 0 32px 0;">Quem escala vendas, começa o ano rastreando tráfego.</p>
      <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 24px; margin: 0 0 32px 0;">
        <p style="font-size: 14px; opacity: 0.7; margin: 0 0 8px 0; text-transform: uppercase;">Plano Anual</p>
        <p style="font-size: 28px; font-weight: 700; margin: 0;">2 meses <span style="color: #fbbf24;">GRÁTIS</span></p>
      </div>
      <a href="https://www.freelinnk.com/dashboard/billing" style="display: inline-block; background: white; color: #1e3a5f; padding: 18px 48px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px;">Vender mais em ${nextYear}</a>
    </div>
  </div>
</body>
</html>`;
  return {
    subject: `${ctx.firstName}, o que te impede de faturar mais em ${nextYear}?`,
    preheader: 'Sua loja merece as ferramentas certas',
    priority: 80,
    cooldownHours: 0,
    countTowardsLimit: false,
    html: wrapHtml(raw)
  };
}

// ============================================================
// 🧠 SELETOR INTELIGENTE DE EMAILS
// ============================================================

function selectEmailForUser(ctx: UserContext): EmailTemplate | null {
  const today = new Date();
  const dayOfMonth = today.getDate();

  // =================================================================
  // USUÁRIOS PAGANTES (Pro/Ultra)
  // =================================================================

  if (ctx.plan === 'ultra' || ctx.plan === 'pro') {
    if (isBlackFridayWeekend(today)) return getBlackFridayEmail(ctx);
    if (isEndOfYear(today)) return getEndOfYearEmail(ctx);
    return null;
  }

  // =================================================================
  // USUÁRIOS FREE
  // =================================================================

  // PRIORIDADE 1: Datas especiais (não contam no limite)
  if (isBlackFridayWeekend(today)) return getBlackFridayEmail(ctx);
  if (isEndOfYear(today)) return getEndOfYearEmail(ctx);

  // PRIORIDADE 2: Carrinho abandonado (não conta no limite)
  if (ctx.cartAbandoned && ctx.hoursSinceAbandonment !== null) {
    if (ctx.hoursSinceAbandonment >= 2 && ctx.hoursSinceAbandonment <= 48) {
      if (!ctx.lastEmailSent || (Date.now() - ctx.lastEmailSent) > 48 * 3600 * 1000) {
        return getCartAbandonedEmail(ctx);
      }
    }
  }

  // PRIORIDADE 3: Primeiro mês (máximo 5 emails)
  if (ctx.daysSinceSignup <= 30) {
    if (ctx.emailsThisMonth >= MAX_EMAILS_FIRST_MONTH) return null;

    if (ctx.daysSinceSignup >= 3 && ctx.daysSinceSignup <= 4) return getValueDay3Email(ctx);
    if (ctx.daysSinceSignup >= 7 && ctx.daysSinceSignup <= 9) return getSocialProofDay7Email(ctx);
    if (ctx.daysSinceSignup >= 14 && ctx.daysSinceSignup <= 16) return getMidMonthDay14Email(ctx);
    if (ctx.daysSinceSignup >= 25 && ctx.daysSinceSignup <= 30) return getLastChanceDay25Email(ctx);
    return null;
  }

  // PRIORIDADE 4: NURTURING CONTÍNUO (Após primeiro mês)
  if (ctx.emailsThisMonth >= MAX_EMAILS_PER_MONTH_ONGOING) return null;

  // Verificar cooldown mínimo de 14 dias entre emails de nurturing
  if (ctx.lastEmailSent && (Date.now() - ctx.lastEmailSent) < 14 * 24 * 3600 * 1000) {
    return null;
  }

  // RE-ENGAJAMENTO: Se usuário está inativo há mais de 30 dias
  if (!ctx.isActive && ctx.monthsSinceSignup >= 2) {
    return getReEngagementEmail(ctx);
  }

  // INÍCIO DO MÊS (dias 1-3): Email motivacional de novo mês
  if (dayOfMonth >= 1 && dayOfMonth <= 3 && ctx.emailsThisMonth === 0) {
    return getNewMonthEmail(ctx);
  }

  // CICLO DE FUNCIONALIDADES (rotação baseada no mês desde signup)
  if (dayOfMonth >= 10 && dayOfMonth <= 15) {
    const featureCycle = ctx.monthsSinceSignup % 6;

    switch (featureCycle) {
      case 1: return getGiveawayFeatureEmail(ctx);
      case 2: return getImageAIFeatureEmail(ctx);
      case 3: return getAnalyticsFeatureEmail(ctx);
      case 4: return getVideoScriptsEmail(ctx);
      case 5: return getSavingsComparisonEmail(ctx);
      case 0: if (ctx.monthsSinceSignup >= 6) return getGiveawayFeatureEmail(ctx); break;
    }
  }

  return null;
}

// ============================================================
// 📤 PROCESSADOR EM LOTE (BATCH HANDLER)
// ============================================================

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

  if (!authHeader || authHeader !== expectedAuth) {
    console.error('❌ Unauthorized');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY não configurado');
    return NextResponse.json({ error: 'Missing Resend API Key' }, { status: 500 });
  }

  const clerk = await clerkClient();

  // Buscar usuários (com limite de segurança para paginação)
  const usersResponse = await clerk.users.getUserList({ limit: CLERK_LIMIT, orderBy: '-created_at' });
  const users = usersResponse.data;

  const emailLog: Array<{ email: string; subject: string; status: string; error?: string }> = [];
  const today = new Date();
  const thirtyDaysAgo = Date.now() - (30 * 24 * 3600 * 1000);

  console.log(`🚀 Marketing System - Processando ${users.length} usuários | ${today.toISOString()}`);

  // 1. Pré-cálculo e Filtragem (Síncrono e rápido)
  const contextsToProcess: Array<UserContext & { template: EmailTemplate }> = [];

  for (const user of users) {
    const email = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress;
    if (!email) continue;

    const meta = user.publicMetadata as UserMetadata;
    const createdAt = new Date(user.createdAt);
    const daysSinceSignup = Math.floor((today.getTime() - createdAt.getTime()) / (1000 * 3600 * 24));

    const emailHistory = (meta.emailHistory as number[]) || [];
    const emailsThisMonth = emailHistory.filter(ts => ts > thirtyDaysAgo).length;

    const lastLogin = meta.lastLogin || null;
    const isActive = lastLogin ? (Date.now() - lastLogin) < 30 * 24 * 3600 * 1000 : false;

    const ctx: UserContext = {
      userId: user.id,
      email,
      firstName: user.firstName || "Criador",
      plan: (meta.subscriptionPlan as 'free' | 'pro' | 'ultra') || 'free',
      daysSinceSignup,
      monthsSinceSignup: Math.floor(daysSinceSignup / 30),
      cartAbandoned: meta.cartAbandoned === true,
      attemptedPlan: meta.attemptedPlan || 'pro',
      hoursSinceAbandonment: meta.lastCheckoutAttempt
        ? (Date.now() - meta.lastCheckoutAttempt) / (1000 * 3600)
        : null,
      lastEmailSent: meta.lastEmailSent || null,
      emailsThisMonth,
      totalEmailsReceived: meta.totalEmailsReceived || 0,
      hasCustomUrl: meta.hasCustomUrl === true,
      hasProfilePhoto: !!user.imageUrl && !user.imageUrl.includes('default'),
      linksCreated: meta.linksCreated || 0,
      totalClicks: meta.totalClicks || 0,
      lastLogin,
      isActive,
      meta,
    };

    const template = selectEmailForUser(ctx);

    if (template) {
      // Validação de cooldown específica
      if (ctx.lastEmailSent && template.cooldownHours > 0) {
        const hoursSinceLastEmail = (Date.now() - ctx.lastEmailSent) / (1000 * 3600);
        if (hoursSinceLastEmail < template.cooldownHours) continue;
      }
      contextsToProcess.push({ ...ctx, template });
    }
  }

  // 2. Processamento em Lotes Assíncronos (Evita Timeout)
  console.log(`📨 Encontrados ${contextsToProcess.length} emails qualificados para envio.`);

for (let i = 0; i < contextsToProcess.length; i += BATCH_SIZE) {
    const batch = contextsToProcess.slice(i, i + BATCH_SIZE);

    await Promise.allSettled(batch.map(async (item) => {
      try {
        const { error } = await resend.emails.send({
          // ✅ CORRIGIDO: Nome humanizado + Domínio verificado
          from: 'Lucas do Freelinnk <contato@send.freelinnk.com>',

          // ✅ CORRIGIDO: E-mail profissional para resposta
          replyTo: 'contato@freelinnk.com',

          to: item.email,
          subject: item.template.subject,
          html: item.template.html,

          // ✅ CORRIGIDO: Headers Anti-Spam do Gmail
          headers: {
            'List-Unsubscribe': '<https://www.freelinnk.com/dashboard/settings>, <mailto:contato@freelinnk.com?subject=unsubscribe>',
            'X-Entity-ID': 'Freelinnk-System'
          }
        });

        if (error) throw error;

        // Atualiza Clerk
        const newEmailHistory = [...(item.meta.emailHistory || []), Date.now()].slice(-50);
        await clerk.users.updateUser(item.userId, {
          publicMetadata: {
            ...item.meta,
            lastEmailSent: Date.now(),
            totalEmailsReceived: item.totalEmailsReceived + 1,
            emailHistory: newEmailHistory,
            lastEmailSubject: item.template.subject,
            ...(item.template.subject.includes('deixou algo') && { cartAbandoned: false }),
          },
        });

        emailLog.push({ email: item.email, subject: item.template.subject, status: 'sent' });

      } catch (err) {
        console.error(`❌ Falha no envio para ${item.email}:`, err);
        emailLog.push({ email: item.email, subject: item.template.subject, status: 'failed', error: String(err) });
      }
    }));
  }

  return NextResponse.json({ success: true, log: emailLog });
}