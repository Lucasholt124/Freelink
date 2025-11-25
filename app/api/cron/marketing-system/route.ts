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
// 📧 TEMPLATES - COMPLETO
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
      <h1 style="color: #1e293b; font-size: 24px; font-weight: 600; margin: 0 0 24px 0; line-height: 1.4;">Quantas vezes você já ficou olhando a tela em branco?</h1>
      <p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 16px 0;">30 minutos pensando no que postar. 1 hora tentando escrever uma legenda. No final, desiste e não posta nada.</p>
      <p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 24px 0;">O bloqueio criativo é o maior inimigo da consistência.</p>
      <div style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); border-radius: 12px; padding: 28px; margin: 24px 0; color: white;">
        <p style="font-size: 12px; opacity: 0.7; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 1px;">💡 Ideia gerada pelo FreelinnkBrain hoje</p>
        <p style="font-size: 18px; font-weight: 500; line-height: 1.5; margin: 0 0 16px 0;">"5 erros que você comete na bio do Instagram sem perceber"</p>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <span style="background: rgba(255,255,255,0.15); padding: 6px 12px; border-radius: 20px; font-size: 12px;">📈 Alto potencial</span>
          <span style="background: rgba(255,255,255,0.15); padding: 6px 12px; border-radius: 20px; font-size: 12px;">📱 Carrossel</span>
        </div>
      </div>
      <p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 32px 0;">No plano Pro, você recebe <strong>5 ideias assim todo dia</strong>. Nunca mais olha pra tela em branco.</p>
      <div style="text-align: center;">
        <a href="https://www.freelinnk.com/dashboard/billing" style="display: inline-block; background: #1e293b; color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px;">Conhecer o FreelinnkBrain</a>
      </div>
    </div>
  </div>
</body>
</html>`;
  return {
    subject: `O segredo para nunca mais travar na hora de criar`,
    preheader: 'Como acabar com o bloqueio criativo de vez',
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
      <p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 16px 0;">Queria compartilhar uma história:</p>
      <div style="background: #f8fafc; border-left: 4px solid #6366f1; padding: 24px; margin: 24px 0; border-radius: 0 12px 12px 0;">
        <p style="color: #1e293b; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0; font-style: italic;">"Eu estava travada há meses. Quando comecei a usar o FreelinnkBrain, virou rotina: abro de manhã, escolho a melhor ideia, e gravo. Em 4 meses saí de 3K para 47K seguidores."</p>
        <div style="display: flex; align-items: center;">
          <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); border-radius: 50%; margin-right: 14px;"></div>
          <div>
            <p style="margin: 0; color: #1e293b; font-weight: 600;">Ana Costa</p>
            <p style="margin: 2px 0 0 0; color: #64748b; font-size: 14px;">Criadora de lifestyle</p>
          </div>
        </div>
      </div>
      <div style="display: flex; gap: 12px; margin: 24px 0;">
        <div style="flex: 1; background: #f0fdf4; border-radius: 12px; padding: 20px; text-align: center;">
          <p style="color: #22c55e; font-size: 24px; font-weight: 700; margin: 0;">15x</p>
          <p style="color: #64748b; font-size: 12px; margin: 6px 0 0 0;">crescimento</p>
        </div>
        <div style="flex: 1; background: #fef3c7; border-radius: 12px; padding: 20px; text-align: center;">
          <p style="color: #f59e0b; font-size: 24px; font-weight: 700; margin: 0;">4</p>
          <p style="color: #64748b; font-size: 12px; margin: 6px 0 0 0;">meses</p>
        </div>
      </div>
      <div style="text-align: center;">
        <a href="https://www.freelinnk.com/dashboard/billing" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px;">Quero resultados assim</a>
      </div>
    </div>
  </div>
</body>
</html>`;
  return {
    subject: `Como a Ana cresceu 15x em 4 meses`,
    preheader: 'De 3K para 47K seguidores',
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
      <h1 style="color: #1e293b; font-size: 24px; font-weight: 600; margin: 0 0 24px 0; line-height: 1.4;">Já se passaram 2 semanas.</h1>
      <p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 16px 0;">Pergunta honesta: você está mais perto dos seus objetivos?</p>
      ${ctx.totalClicks > 0 ? `<p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 24px 0;">Você já teve <strong style="color: #6366f1;">${ctx.totalClicks} cliques</strong> no seu perfil. Imagina esse número 3x maior?</p>` : ''}
      <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <p style="color: #64748b; font-size: 13px; margin: 0 0 16px 0; text-transform: uppercase;">Média: Free vs Pro</p>
        <div style="margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="color: #1e293b; font-size: 14px;">Posts por semana</span>
            <span style="color: #22c55e; font-size: 14px; font-weight: 600;">+340%</span>
          </div>
          <div style="background: #e2e8f0; height: 6px; border-radius: 3px; overflow: hidden;"><div style="background: #22c55e; height: 100%; width: 85%;"></div></div>
        </div>
        <div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="color: #1e293b; font-size: 14px;">Crescimento</span>
            <span style="color: #6366f1; font-size: 14px; font-weight: 600;">+220%</span>
          </div>
          <div style="background: #e2e8f0; height: 6px; border-radius: 3px; overflow: hidden;"><div style="background: #6366f1; height: 100%; width: 75%;"></div></div>
        </div>
      </div>
      <div style="text-align: center;">
        <a href="https://www.freelinnk.com/dashboard/billing" style="display: inline-block; background: #1e293b; color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px;">Ver planos Pro</a>
      </div>
    </div>
  </div>
</body>
</html>`;
  return {
    subject: `${ctx.firstName}, 2 semanas já. Como está indo?`,
    preheader: 'Uma reflexão sobre seu crescimento',
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
      <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 16px 0;">Seu primeiro mês está acabando</h1>
      <p style="font-size: 16px; opacity: 0.9; margin: 0 0 32px 0;">E com ele, vai o desconto especial de novos usuários.</p>
      <div style="background: rgba(251, 191, 36, 0.15); border: 2px solid rgba(251, 191, 36, 0.4); border-radius: 12px; padding: 28px; margin: 0 0 32px 0;">
        <p style="color: #fbbf24; font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase;">Oferta de primeiro mês</p>
        <p style="font-size: 48px; font-weight: 800; margin: 0; color: #fbbf24;">50% OFF</p>
        <p style="font-size: 16px; margin: 12px 0 0 0; opacity: 0.9;">Pro por <strong>R$ 34,90</strong></p>
      </div>
      <a href="https://www.freelinnk.com/dashboard/billing" style="display: inline-block; background: #fbbf24; color: #1e1b4b; padding: 18px 48px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px;">Ativar desconto</a>
    </div>
  </div>
</body>
</html>`;
  return {
    subject: `${ctx.firstName}, seu desconto de estreia expira em breve`,
    preheader: 'Última chance de pegar 50% OFF',
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
      benefits: ['5 ideias virais por dia com FreelinnkBrain', '5 roteiros de vídeo prontos', 'Analytics avançados', 'Remover marca Freelinnk']
    },
    ultra: {
      price: 'R$ 77,90',
      benefits: ['FreelinnkBrain cinematográfico ILIMITADO', 'Vídeos virais ILIMITADOS', '7 imagens com IA por dia', 'Suporte VIP WhatsApp']
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
      <h1 style="color: #1e293b; font-size: 24px; font-weight: 600; margin: 0 0 24px 0;">Percebi que você não finalizou seu upgrade</h1>
      <p style="color: #475569; font-size: 16px; line-height: 1.7; margin: 0 0 24px 0;">Acontece! Seu carrinho com o plano <strong style="color: #6366f1;">${ctx.attemptedPlan.toUpperCase()}</strong> ainda está salvo.</p>
      <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin: 0 0 24px 0;">
        ${plan.benefits.map(b => `<div style="display: flex; align-items: center; margin-bottom: 10px;"><span style="color: #22c55e; margin-right: 10px;">✓</span><span style="color: #1e293b; font-size: 15px;">${b}</span></div>`).join('')}
      </div>
      <div style="text-align: center;">
        <a href="https://www.freelinnk.com/dashboard/billing" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 18px 48px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">Continuar de onde parei</a>
      </div>
    </div>
  </div>
</body>
</html>`;
  return {
    subject: `${ctx.firstName}, você deixou algo pra trás`,
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
      <h1 style="color: #1e293b; font-size: 24px; font-weight: 600; margin: 0 0 24px 0; text-align: center;">O truque que criadores de 100K+ usam</h1>
      <p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 16px 0;">${ctx.firstName}, já reparou como alguns perfis crescem "do nada"?</p>
      <p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 24px 0;">Na maioria das vezes, tem um <strong>sorteio bem feito</strong> por trás.</p>
      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%); border-radius: 12px; padding: 24px; margin: 24px 0;">
        <p style="color: #92400e; font-size: 14px; margin: 0 0 12px 0; font-weight: 600;">🎁 FERRAMENTA DE SORTEIOS FREELINNK</p>
        <ul style="color: #78350f; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
          <li>Sorteio automático via comentários</li>
          <li>Filtro anti-bot</li>
          <li>Certificado de transparência</li>
          <li>Relatório de alcance</li>
        </ul>
      </div>
      <p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 32px 0;">Criadores reportam <strong>+1.200 seguidores por sorteio</strong> em média.</p>
      <div style="text-align: center;">
        <a href="https://www.freelinnk.com/dashboard/billing" style="display: inline-block; background: #f59e0b; color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: 600;">Criar meu primeiro sorteio</a>
      </div>
    </div>
  </div>
</body>
</html>`;
  return {
    subject: `O truque para ganhar 1.000 seguidores em uma semana`,
    preheader: 'Como criadores grandes crescem rápido',
    priority: 50,
    cooldownHours: 336,
    countTowardsLimit: true,
    html: wrapHtml(raw)
  };
}

function getImageAIFeatureEmail(ctx: UserContext): EmailTemplate {
  console.log('getImageAIFeatureEmail');
  console.log(ctx);
  const raw = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <h1 style="color: #1e293b; font-size: 24px; font-weight: 600; margin: 0 0 24px 0;">A primeira impressão acontece em 0.3 segundos.</h1>
      <p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 24px 0;">É o tempo que seu seguidor leva pra decidir se para ou continua scrollando.</p>
      <div style="display: flex; gap: 16px; margin: 24px 0;">
        <div style="flex: 1; background: #fee2e2; border-radius: 12px; padding: 20px; text-align: center;">
          <span style="font-size: 32px;">📱</span>
          <p style="color: #991b1b; font-size: 14px; font-weight: 600; margin: 12px 0 4px 0;">Imagem genérica</p>
          <p style="color: #b91c1c; font-size: 24px; font-weight: 700; margin: 0;">127</p>
          <p style="color: #991b1b; font-size: 12px; margin: 0;">views</p>
        </div>
        <div style="flex: 1; background: #d1fae5; border-radius: 12px; padding: 20px; text-align: center;">
          <span style="font-size: 32px;">✨</span>
          <p style="color: #065f46; font-size: 14px; font-weight: 600; margin: 12px 0 4px 0;">Imagem com IA</p>
          <p style="color: #059669; font-size: 24px; font-weight: 700; margin: 0;">12.4K</p>
          <p style="color: #065f46; font-size: 12px; margin: 0;">views</p>
        </div>
      </div>
      <p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 16px 0;">No <strong style="color: #8b5cf6;">Freelinnk Ultra</strong>:</p>
      <ul style="color: #475569; font-size: 15px; line-height: 2; margin: 0 0 24px 0; padding-left: 20px;">
        <li><strong>7 imagens profissionais com IA</strong> por dia</li>
        <li><strong>Aprimoramentos ilimitados</strong></li>
        <li><strong>Templates prontos</strong> para Reels e carrosséis</li>
      </ul>
      <div style="text-align: center;">
        <a href="https://www.freelinnk.com/dashboard/billing" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: 600;">Testar geração de imagens</a>
      </div>
    </div>
  </div>
</body>
</html>`;
  return {
    subject: `Suas imagens estão te sabotando?`,
    preheader: 'A diferença entre 100 e 10.000 views',
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
      <h1 style="color: #1e293b; font-size: 24px; font-weight: 600; margin: 0 0 24px 0; text-align: center;">Criadores que entendem seus números crescem 2x mais rápido</h1>
      <p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 24px 0;">${ctx.firstName}, você sabe responder:</p>
      <ul style="color: #475569; font-size: 15px; line-height: 2.2; margin: 0 0 24px 0; padding-left: 20px;">
        <li>Qual horário seu público mais clica?</li>
        <li>De qual país/cidade vêm seus seguidores?</li>
        <li>Eles usam mais celular ou computador?</li>
        <li>Qual link tem melhor conversão?</li>
      </ul>
      <div style="background: #f0f4ff; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <p style="color: #6366f1; font-size: 14px; margin: 0 0 12px 0; font-weight: 600;">📈 ANALYTICS AVANÇADOS INCLUEM:</p>
        <p style="color: #475569; font-size: 14px; line-height: 1.8; margin: 0;">• Mapa de calor de cliques<br>• Localização dos visitantes<br>• Dispositivos e navegadores<br>• Horários de pico<br>• Comparativo semanal/mensal</p>
      </div>
      <p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 32px 0;">Disponível nos planos Pro e Ultra.</p>
      <div style="text-align: center;">
        <a href="https://www.freelinnk.com/dashboard/billing" style="display: inline-block; background: #1e293b; color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: 600;">Desbloquear Analytics</a>
      </div>
    </div>
  </div>
</body>
</html>`;
  return {
    subject: `Você sabe de onde vêm seus cliques?`,
    preheader: 'Dados que fazem você crescer mais rápido',
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
      <div style="text-align: center; margin-bottom: 24px;"><span style="font-size: 48px;">🎬</span></div>
      <h1 style="color: #1e293b; font-size: 24px; font-weight: 600; margin: 0 0 24px 0; text-align: center;">"O que eu gravo hoje?"</h1>
      <p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 24px 0;">${ctx.firstName}, essa pergunta consome horas da semana de todo criador.</p>
      <div style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); border-radius: 12px; padding: 24px; margin: 24px 0; color: white;">
        <p style="font-size: 12px; opacity: 0.7; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 1px;">🎬 EXEMPLO DE ROTEIRO GERADO HOJE</p>
        <p style="font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">"3 coisas que todo mundo erra no primeiro Reels"</p>
        <p style="font-size: 14px; opacity: 0.9; margin: 0 0 16px 0; line-height: 1.6;"><strong>Gancho:</strong> "Se você tá começando no Reels, para de fazer isso..."<br><strong>Desenvolvimento:</strong> 3 erros com solução<br><strong>CTA:</strong> "Salva pra não esquecer"</p>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <span style="background: rgba(255,255,255,0.15); padding: 4px 10px; border-radius: 12px; font-size: 11px;">⏱️ 30-60s</span>
          <span style="background: rgba(255,255,255,0.15); padding: 4px 10px; border-radius: 12px; font-size: 11px;">📈 Alto potencial</span>
        </div>
      </div>
      <p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 32px 0;">No Pro: <strong>5 roteiros assim por dia</strong>.<br>No Ultra: <strong>ILIMITADO</strong>.</p>
      <div style="text-align: center;">
        <a href="https://www.freelinnk.com/dashboard/billing" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: 600;">Gerar meus roteiros</a>
      </div>
    </div>
  </div>
</body>
</html>`;
  return {
    subject: `5 roteiros prontos pra você gravar hoje`,
    preheader: 'Ideias de vídeo que viralizam',
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
      <h1 style="color: #1e293b; font-size: 24px; font-weight: 600; margin: 0 0 24px 0;">Faz as contas, ${ctx.firstName}</h1>
      <p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 24px 0;">Se você usa ferramentas separadas pra criar conteúdo:</p>
      <div style="background: #fee2e2; border-radius: 12px; padding: 20px; margin: 0 0 16px 0;">
        <p style="color: #991b1b; font-size: 14px; margin: 0 0 12px 0; font-weight: 600;">❌ FERRAMENTAS SEPARADAS</p>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;"><span style="color: #7f1d1d; font-size: 14px;">Canva Pro</span><span style="color: #7f1d1d; font-size: 14px;">R$ 34/mês</span></div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;"><span style="color: #7f1d1d; font-size: 14px;">ChatGPT Plus</span><span style="color: #7f1d1d; font-size: 14px;">R$ 100/mês</span></div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;"><span style="color: #7f1d1d; font-size: 14px;">Midjourney</span><span style="color: #7f1d1d; font-size: 14px;">R$ 50/mês</span></div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;"><span style="color: #7f1d1d; font-size: 14px;">Linktree Pro</span><span style="color: #7f1d1d; font-size: 14px;">R$ 24/mês</span></div>
        <div style="border-top: 1px solid #fca5a5; padding-top: 12px; margin-top: 12px; display: flex; justify-content: space-between;"><span style="color: #7f1d1d; font-size: 16px; font-weight: 700;">TOTAL</span><span style="color: #7f1d1d; font-size: 16px; font-weight: 700;">R$ 208/mês</span></div>
      </div>
      <div style="background: #d1fae5; border-radius: 12px; padding: 20px; margin: 0 0 24px 0;">
        <p style="color: #065f46; font-size: 14px; margin: 0 0 12px 0; font-weight: 600;">✅ TUDO NO FREELINNK ULTRA</p>
        <div style="display: flex; justify-content: space-between;"><span style="color: #065f46; font-size: 16px; font-weight: 700;">Tudo incluído + bônus</span><span style="color: #065f46; font-size: 16px; font-weight: 700;">R$ 77,90/mês</span></div>
      </div>
      <div style="background: #fef3c7; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 32px 0;">
        <p style="color: #92400e; font-size: 14px; margin: 0 0 4px 0;">Economia anual</p>
        <p style="color: #78350f; font-size: 32px; font-weight: 700; margin: 0;">R$ 1.561</p>
      </div>
      <div style="text-align: center;">
        <a href="https://www.freelinnk.com/dashboard/billing" style="display: inline-block; background: #059669; color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: 600;">Economizar agora</a>
      </div>
    </div>
  </div>
</body>
</html>`;
  return {
    subject: `Você está pagando R$ 208/mês em ferramentas separadas?`,
    preheader: 'Como economizar mais de R$ 1.500/ano',
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
      <h1 style="color: #1e293b; font-size: 24px; font-weight: 600; margin: 0 0 24px 0; text-align: center;">Oi ${ctx.firstName}, tudo bem?</h1>
      <p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 16px 0;">Faz um tempinho que você não aparece no Freelinnk.</p>
      <p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 24px 0;">Enquanto isso, lançamos algumas novidades que talvez você goste:</p>
      <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 0 0 24px 0;">
        <div style="margin-bottom: 16px;"><span style="color: #6366f1; font-weight: 600;">🧠 FreelinnkBrain melhorado</span><p style="color: #64748b; font-size: 14px; margin: 4px 0 0 0;">Ideias ainda mais personalizadas pro seu nicho</p></div>
        <div style="margin-bottom: 16px;"><span style="color: #6366f1; font-weight: 600;">🎨 Novos templates</span><p style="color: #64748b; font-size: 14px; margin: 4px 0 0 0;">Mais opções de design para seu perfil</p></div>
        <div><span style="color: #6366f1; font-weight: 600;">📊 Analytics aprimorados</span><p style="color: #64748b; font-size: 14px; margin: 4px 0 0 0;">Novos insights sobre seu público</p></div>
      </div>
      <div style="text-align: center;">
        <a href="https://www.freelinnk.com/dashboard" style="display: inline-block; background: #6366f1; color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: 600;">Ver o que há de novo</a>
      </div>
      <p style="color: #94a3b8; font-size: 14px; text-align: center; margin: 24px 0 0 0;">Estamos torcendo pelo seu sucesso! 💜</p>
    </div>
  </div>
</body>
</html>`;
  return {
    subject: `${ctx.firstName}, sentimos sua falta`,
    preheader: 'Faz tempo que você não aparece',
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
      <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 16px 0;">${currentMonth} chegou!</h1>
      <p style="font-size: 17px; opacity: 0.95; margin: 0; line-height: 1.6;">Um novo mês, uma nova chance de crescer.</p>
    </div>
    <div style="background: white; border-radius: 16px; padding: 32px; margin-top: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 24px 0;">${ctx.firstName}, qual é sua meta para ${currentMonth.toLowerCase()}?</p>
      <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 0 0 24px 0;">
        <p style="color: #64748b; font-size: 14px; margin: 0 0 12px 0;">Metas populares dos nossos usuários:</p>
        <ul style="color: #1e293b; font-size: 15px; line-height: 2; margin: 0; padding-left: 20px;">
          <li>Postar 4x por semana</li>
          <li>Ganhar 1.000 novos seguidores</li>
          <li>Fazer minha primeira venda</li>
          <li>Criar um produto digital</li>
        </ul>
      </div>
      <p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 24px 0;">Independente da sua meta, o Freelinnk está aqui pra te ajudar a alcançar.</p>
      <div style="text-align: center;">
        <a href="https://www.freelinnk.com/dashboard" style="display: inline-block; background: #1e293b; color: white; padding: 14px 36px; text-decoration: none; border-radius: 12px; font-weight: 600;">Começar ${currentMonth.toLowerCase()} bem</a>
      </div>
    </div>
  </div>
</body>
</html>`;
  return {
    subject: `${currentMonth} chegou! Qual sua meta esse mês?`,
    preheader: 'Um novo mês, novas oportunidades',
    priority: 45,
    cooldownHours: 672,
    countTowardsLimit: true,
    html: wrapHtml(raw)
  };
}

function getBlackFridayEmail(ctx: UserContext): EmailTemplate {
  console.log('getBlackFridayEmail');
  console.log(ctx);
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
      <p style="color: #9ca3af; font-size: 18px; margin: 0 0 32px 0;">no plano Ultra</p>
      <div style="background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 12px; padding: 24px; margin: 0 0 32px 0;">
        <p style="color: #9ca3af; font-size: 16px; margin: 0 0 8px 0;"><span style="text-decoration: line-through;">R$ 77,90</span>/mês</p>
        <p style="color: #fbbf24; font-size: 40px; font-weight: 700; margin: 0;">R$ 31,16<span style="font-size: 16px; color: #9ca3af;">/mês</span></p>
      </div>
      <a href="https://www.freelinnk.com/dashboard/billing" style="display: block; background: #fbbf24; color: #000; padding: 20px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 18px;">GARANTIR OFERTA</a>
      <p style="color: #6b7280; font-size: 13px; margin: 24px 0 0 0;">⏰ Oferta expira em 24 horas</p>
    </div>
  </div>
</body>
</html>`;
  return {
    subject: `⚫ 60% OFF no Ultra – Só hoje`,
    preheader: 'A maior oferta do ano no Freelinnk',
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
      <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 16px 0;">E se ${nextYear} fosse o ano que você realmente cresce?</h1>
      <p style="font-size: 16px; opacity: 0.9; margin: 0 0 32px 0;">Comece com as ferramentas certas.</p>
      <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 24px; margin: 0 0 32px 0;">
        <p style="font-size: 14px; opacity: 0.7; margin: 0 0 8px 0; text-transform: uppercase;">Plano Anual</p>
        <p style="font-size: 28px; font-weight: 700; margin: 0;">2 meses <span style="color: #fbbf24;">GRÁTIS</span></p>
      </div>
      <a href="https://www.freelinnk.com/dashboard/billing" style="display: inline-block; background: white; color: #1e3a5f; padding: 18px 48px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px;">Começar ${nextYear} no Pro</a>
    </div>
  </div>
</body>
</html>`;
  return {
    subject: `${nextYear} pode ser diferente, ${ctx.firstName}`,
    preheader: 'Comece o ano com as ferramentas certas',
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
        // Enviar Email via Resend
        const { error } = await resend.emails.send({
          from: 'Freelinnk <contato@send.freelinnk.com>',
          replyTo: 'suporte@freelinnk.com',
          to: item.email,
          subject: item.template.subject,
          html: item.template.html,
          headers: {
            'List-Unsubscribe': '<https://www.freelinnk.com/dashboard/settings>'
          }
        });

        if (error) throw error;

        // Atualizar Metadados Clerk
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
        console.log(`✅ Enviado: ${item.email} | Assunto: ${item.template.subject}`);

      } catch (err) {
        console.error(`❌ Falha no envio para ${item.email}:`, err);
        emailLog.push({ email: item.email, subject: item.template.subject, status: 'failed', error: String(err) });
      }
    }));
  }

  const summary = {
    processed: users.length,
    qualified: contextsToProcess.length,
    sent: emailLog.filter(l => l.status === 'sent').length,
    failed: emailLog.filter(l => l.status === 'failed').length,
  };

  return NextResponse.json({ success: true, summary, log: emailLog });
}