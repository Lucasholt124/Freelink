import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Calculator,
  Check,
  Gift,
  HelpCircle,
  Link2,
  LockKeyhole,
  Megaphone,
  QrCode,
  Target,
  Users,
} from "lucide-react";
import { billingPrices, money, type BillingPlan } from "@/lib/billing-options";
import { toolAccess, type LockedTool } from "@/lib/tool-access";
import styles from "./tool-access.module.css";

const icons = {
  ads: Megaphone,
  giveaway: Gift,
  finance: Calculator,
  tracking: Target,
};

function ToolPreview({ tool }: { tool: LockedTool }) {
  if (tool === "ads")
    return (
      <>
        <div className={styles.adArtwork}>
          <Megaphone size={32} aria-hidden="true" />
          <span>ESPAÇO PARA A SUA MARCA</span>
          <strong>
            Seu próximo
            <br />
            produto favorito.
          </strong>
        </div>
        <div className={styles.adCopy}>
          <div>
            <small>ANÚNCIO NA REDE FREELINNK</small>
            <strong>Seu produto em destaque</strong>
            <span>Imagem, mensagem e destino definidos por você.</span>
          </div>
          <ArrowUpRight size={20} aria-hidden="true" />
        </div>
        <div className={styles.metrics}>
          <span>
            <BarChart3 size={15} aria-hidden="true" /> Exibições
          </span>
          <span>
            <ArrowUpRight size={15} aria-hidden="true" /> Cliques
          </span>
        </div>
      </>
    );
  if (tool === "giveaway")
    return (
      <>
        <div className={styles.giveawayArtwork}>
          <Gift size={36} aria-hidden="true" />
          <small>UMA EXPERIÊNCIA PARA O SEU PÚBLICO</small>
          <strong>Sorteio da sua marca</strong>
          <span>Um convite. Muitas possibilidades.</span>
        </div>
        <div className={styles.entryMethods}>
          <span>
            <Link2 size={21} aria-hidden="true" />
            <strong>Link de inscrição</strong>
            <small>Para compartilhar</small>
          </span>
          <span>
            <QrCode size={21} aria-hidden="true" />
            <strong>QR Code</strong>
            <small>Para o presencial</small>
          </span>
        </div>
        <div className={styles.previewFoot}>
          <Users size={16} aria-hidden="true" /> Inscrições → participantes →
          sorteio
        </div>
      </>
    );
  if (tool === "finance")
    return (
      <>
        <div className={styles.financeHead}>
          <span>
            <Calculator size={22} aria-hidden="true" />
          </span>
          <div>
            <small>EXEMPLO DE CÁLCULO</small>
            <strong>Uma venda de R$ 120,00</strong>
          </div>
        </div>
        <dl className={styles.calculation}>
          <div>
            <dt>Valor da venda</dt>
            <dd>R$ 120,00</dd>
          </div>
          <div>
            <dt>Custo do produto</dt>
            <dd>− R$ 70,00</dd>
          </div>
          <div>
            <dt>Taxas e outros custos</dt>
            <dd>− R$ 10,00</dd>
          </div>
          <div className={styles.profit}>
            <dt>Lucro estimado</dt>
            <dd>R$ 40,00</dd>
          </div>
        </dl>
        <div className={styles.previewFoot}>
          Vendas, gastos e clientes em um só lugar.
        </div>
      </>
    );
  return (
    <>
      <div className={styles.trackingIntro}>
        <Target size={28} aria-hidden="true" />
        <strong>Sua página + suas ferramentas</strong>
        <span>Conecte os identificadores pelo painel.</span>
      </div>
      <div className={styles.integration}>
        <span className={styles.meta}>M</span>
        <div>
          <strong>Meta Pixel</strong>
          <span>ID do seu Pixel</span>
        </div>
        <span className={styles.setup}>Configurar</span>
      </div>
      <div className={styles.integration}>
        <BarChart3 size={23} aria-hidden="true" />
        <div>
          <strong>Google Analytics 4</strong>
          <span>ID de medição · G-XXXXXXXXXX</span>
        </div>
        <span className={styles.setup}>Configurar</span>
      </div>
      <div className={styles.previewFoot}>
        Os relatórios ficam nas plataformas conectadas.
      </div>
    </>
  );
}

export default function ToolAccessGate({
  tool,
  currentPlan,
}: {
  tool: LockedTool;
  currentPlan: BillingPlan;
}) {
  const content = toolAccess[tool];
  const Icon = icons[tool];
  const titleId = `tool-access-${tool}`;
  return (
    <section
      className={`${styles.page} ${styles[tool]}`}
      aria-labelledby={titleId}
    >
      <header className={styles.header}>
        <div className={styles.toolName}>
          <span>
            <Icon size={20} aria-hidden="true" />
          </span>
          <div>
            <h1>{content.name}</h1>
            <p>Mais possibilidades para a sua página</p>
          </div>
        </div>
        <span className={styles.planBadge}>
          <LockKeyhole size={13} aria-hidden="true" />
          {content.plan === "pro" ? "Pro e Ultra" : "Plano Ultra"}
        </span>
      </header>
      <div className={styles.hero}>
        <div className={styles.copy}>
          <span className={styles.eyebrow}>{content.eyebrow}</span>
          <h2 id={titleId}>{content.title}</h2>
          <p className={styles.description}>{content.description}</p>
          <div className={styles.offer}>
            <span>Disponível no plano {content.planName}</span>
            <p>
              <strong>{money(billingPrices[content.plan].monthly)}</strong>
              <span>/ mês na assinatura mensal</span>
            </p>
          </div>
          <div className={styles.actions}>
            <Link href="/dashboard/billing" className={styles.primary}>
              Conhecer o {content.planName}
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link
              href={`/dashboard/help#${content.helpId}`}
              className={styles.secondary}
            >
              <HelpCircle size={16} aria-hidden="true" />
              Tirar uma dúvida
            </Link>
          </div>
          <p className={styles.purchaseNote}>
            Compare os planos e confira as condições antes de assinar.
          </p>
        </div>
        <figure
          className={styles.preview}
          aria-label={`Prévia ilustrativa de ${content.name}`}
        >
          <div className={styles.previewTop}>
            <span>
              <i />
              <i />
              <i />
            </span>
            <span>{content.previewTitle}</span>
            <LockKeyhole size={13} aria-hidden="true" />
          </div>
          <div className={styles.previewContent}>
            <ToolPreview tool={tool} />
          </div>
          <figcaption>
            Prévia ilustrativa · não são dados da sua conta
          </figcaption>
        </figure>
      </div>
      <section
        className={styles.benefits}
        aria-label={`O que você pode fazer com ${content.name}`}
      >
        <div className={styles.benefitsHeader}>
          <h2>O que muda na sua rotina</h2>
          <span>
            Seu plano atual:{" "}
            {currentPlan === "pro"
              ? "Pro"
              : currentPlan === "ultra"
                ? "Ultra"
                : "Gratuito"}
          </span>
        </div>
        <ul>
          {content.benefits.map(([title, description]) => (
            <li key={title}>
              <span className={styles.check}>
                <Check size={16} aria-hidden="true" />
              </span>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <p className={styles.detail}>{content.note}</p>
    </section>
  );
}
