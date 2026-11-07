"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useConvexAuth, useQuery } from "convex/react";
import {
  ArrowRight,
  ArrowUpRight,
  Calculator,
  Check,
  CheckCircle2,
  Circle,
  Copy,
  ExternalLink,
  Gift,
  Link2,
  Megaphone,
  Palette,
  Sparkles,
  Star,
  Target,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { hasPlan, normalizePlan } from "@/lib/dashboard-navigation";
import {
  DASHBOARD_LOAD_TIMEOUT_MS,
  resolveDashboardLoadState,
} from "@/lib/dashboard-load-state";
import styles from "./dashboard.module.css";

interface DashboardOverviewProps {
  userPlan: string;
  firstName: string;
  userSlug: string | null;
}
const tools = [
  {
    href: "/dashboard/ads",
    title: "Hub de anúncios",
    description: "Leve sua página para novas pessoas.",
    icon: Megaphone,
    plan: "pro",
  },
  {
    href: "/dashboard/giveaway",
    title: "Sorteios",
    description: "Crie novas oportunidades de interação.",
    icon: Gift,
    plan: "pro",
  },
  {
    href: "/dashboard/profit-calculator",
    title: "Financeiro e CRM",
    description: "Cuide das vendas, despesas e clientes.",
    icon: Calculator,
    plan: "ultra",
  },
  {
    href: "/dashboard/tracking",
    title: "Pixel e Analytics",
    description: "Conecte seus identificadores de rastreamento.",
    icon: Target,
    plan: "ultra",
  },
];
function hostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Link cadastrado";
  }
}
const currency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );

export default function DashboardOverview({
  userPlan,
  firstName,
  userSlug,
}: DashboardOverviewProps) {
  const { isAuthenticated, isLoading: convexLoading } = useConvexAuth();
  const { isLoaded: clerkLoaded, isSignedIn } = useUser();
  const data = useQuery(
    api.dashboard.getOverview,
    isAuthenticated ? {} : "skip",
  );
  const [loadTimedOut, setLoadTimedOut] = useState(false);
  const waitingForData =
    !clerkLoaded || convexLoading || (isAuthenticated && data === undefined);
  useEffect(() => {
    if (!waitingForData) {
      setLoadTimedOut(false);
      return;
    }
    const timer = setTimeout(
      () => setLoadTimedOut(true),
      DASHBOARD_LOAD_TIMEOUT_MS,
    );
    return () => clearTimeout(timer);
  }, [waitingForData]);
  const loadState = resolveDashboardLoadState({
    clerkLoaded,
    clerkSignedIn: !!isSignedIn,
    convexLoading,
    convexAuthenticated: isAuthenticated,
    overview:
      data === undefined ? "pending" : data === null ? "empty" : "ready",
    timedOut: loadTimedOut,
  });
  const plan = normalizePlan(userPlan);
  const daily = useQuery(
    api.profitCalculator.getDailySummary,
    isAuthenticated && plan === "ultra" ? {} : "skip",
  );
  const slug = data?.username || userSlug;
  const [origin, setOrigin] = useState("");
  const [addressCopied, setAddressCopied] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const publicPath = slug ? `/${encodeURIComponent(slug)}` : null;
  const publicUrl = origin && publicPath ? `${origin}${publicPath}` : "";
  useEffect(() => {
    setOrigin(window.location.origin);
    try {
      setAddressCopied(
        !!slug &&
          localStorage.getItem(`freelinnk-address-copied:${slug}`) === "true",
      );
    } catch {
      /* Optional checklist persistence. */
    }
  }, [slug]);
  useEffect(() => {
    if (copyState !== "success") return;
    const timer = setTimeout(() => setCopyState("idle"), 3000);
    return () => clearTimeout(timer);
  }, [copyState]);
  async function copyAddress() {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopyState("success");
      setAddressCopied(true);
      try {
        localStorage.setItem(`freelinnk-address-copied:${slug}`, "true");
      } catch {
        /* Copy still succeeded. */
      }
    } catch {
      setCopyState("error");
    }
  }

  if (loadState !== "ready" || !data) {
    if (loadState !== "loading") {
      const signedOut = loadState === "signed-out";
      return (
        <section
          className={`${styles.overview} ${styles.connectionPanel}`}
          role="alert"
          aria-labelledby="dashboard-connection-title"
        >
          <span className={styles.checklistIcon}>
            <Link2 size={22} aria-hidden="true" />
          </span>
          <h1 id="dashboard-connection-title">
            {signedOut
              ? "Sua sessão precisa ser renovada"
              : loadState === "timeout"
                ? "Os dados demoraram para carregar"
                : "Não foi possível conectar sua conta"}
          </h1>
          <p>
            {signedOut
              ? "Entre novamente para acessar sua página e seus links."
              : loadState === "timeout"
                ? "A conexão está demorando mais que o esperado. Você pode tentar carregar o painel novamente."
                : "Sua sessão está aberta, mas não conseguimos validar o acesso aos dados do painel. Tente novamente ou fale com o suporte."}
          </p>
          <div>
            {signedOut ? (
              <Link href="/sign-in" className={styles.primaryButton}>
                Entrar novamente
              </Link>
            ) : (
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => window.location.reload()}
              >
                Tentar novamente
              </button>
            )}
            <Link href="/dashboard/help" className={styles.textLink}>
              Central de ajuda
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </section>
      );
    }
    return (
      <div
        className={styles.overview}
        aria-busy="true"
        aria-label="Carregando seu painel"
      >
        <div className={`${styles.skeleton} ${styles.loadingHeading}`} />
        <div className={styles.statsGrid}>
          {[1, 2, 3].map((key) => (
            <div
              className={`${styles.skeleton} ${styles.loadingStat}`}
              key={key}
            />
          ))}
        </div>
        <div className={`${styles.skeleton} ${styles.loadingPanel}`} />
        <span className={styles.srOnly}>
          Carregando sua página e seus links.
        </span>
      </div>
    );
  }

  const name =
    data.displayName || (firstName === "Creator" ? "por aqui" : firstName);
  const checklist = [
    {
      label: "Apresente sua marca",
      detail: "Foto ou nome e uma bio para se apresentar.",
      done: data.setup.profile,
      href: "/dashboard/settings",
    },
    {
      label: "Adicione seu primeiro link",
      detail: "Dê um destino para quem chega até você.",
      done: data.setup.firstLink,
      href: "/dashboard/new-link",
    },
    {
      label: "Deixe a página com a sua cara",
      detail: "Escolha as cores e o fundo do seu espaço.",
      done: data.setup.appearance,
      href: "/dashboard/settings",
    },
    {
      label: "Copie seu endereço",
      detail: "Depois, adicione o link à bio das suas redes.",
      done: addressCopied,
      action: copyAddress,
    },
  ];
  const completed = checklist.filter((item) => item.done).length;
  const canUseAds = hasPlan(plan, "pro");

  return (
    <div className={styles.overview}>
      <section className={styles.intro}>
        <div>
          <p className={styles.eyebrow}>
            <span /> SEU ESPAÇO, SUAS POSSIBILIDADES
          </p>
          <h1>
            Olá, {name}
            <span className={styles.headingDot}>.</span>
          </h1>
          <p className={styles.introDescription}>
            Sua presença começa aqui. Vamos cuidar do seu próximo passo?
          </p>
        </div>
        <Link href="/dashboard/settings" className={styles.secondaryButton}>
          <Palette size={16} aria-hidden="true" />
          Personalizar página
        </Link>
      </section>

      <section className={styles.statsGrid} aria-label="Resumo da sua conta">
        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.purpleIcon}`}>
            <Link2 size={20} aria-hidden="true" />
          </span>
          <div>
            <p>Links publicados</p>
            <strong>{data.linkCount.toLocaleString("pt-BR")}</strong>
          </div>
          <Link href="/dashboard/links" aria-label="Gerenciar links publicados">
            <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.amberIcon}`}>
            <Star size={20} aria-hidden="true" />
          </span>
          <div>
            <p>Links em destaque</p>
            <strong>{data.featuredCount.toLocaleString("pt-BR")}</strong>
          </div>
          <Link
            href="/dashboard/links"
            aria-label="Gerenciar links em destaque"
          >
            <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.greenIcon}`}>
            <Megaphone size={20} aria-hidden="true" />
          </span>
          <div>
            <p>Campanhas ativas</p>
            <strong>
              {canUseAds ? (
                data.activeCampaignCount.toLocaleString("pt-BR")
              ) : (
                <span className={styles.statPlan}>Disponível no Pro</span>
              )}
            </strong>
          </div>
          <Link href="/dashboard/ads" aria-label="Abrir Hub de anúncios">
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>

      <div className={styles.overviewColumns}>
        <div className={styles.primaryColumn}>
          <section
            className={styles.pageCard}
            aria-labelledby="public-page-title"
          >
            <div className={styles.pageCardTop}>
              <span className={styles.eyebrow}>SEU LINK NA BIO</span>
              {publicPath && (
                <span className={styles.liveBadge}>
                  <span />
                  Página publicada
                </span>
              )}
            </div>
            <div className={styles.profileRow}>
              <div className={styles.profileAvatar}>
                {data.avatar ? (
                  <img src={data.avatar} alt="" width={60} height={60} />
                ) : (
                  <span>
                    {(data.displayName || firstName).slice(0, 1).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h2 id="public-page-title">{data.displayName || firstName}</h2>
                <p>
                  {data.description ||
                    "Sua próxima conexão começa com uma boa apresentação."}
                </p>
              </div>
            </div>
            <div className={styles.addressBox}>
              <Link2 size={17} aria-hidden="true" />
              <span title={publicUrl}>
                {publicUrl
                  ? publicUrl.replace(/^https?:\/\//, "")
                  : "Carregando seu endereço…"}
              </span>
              <button
                type="button"
                className={styles.copyButton}
                onClick={copyAddress}
                disabled={!publicUrl}
                aria-label="Copiar endereço da página"
              >
                {copyState === "success" ? (
                  <Check size={17} />
                ) : (
                  <Copy size={17} />
                )}
              </button>
            </div>
            <div className={styles.pageCardActions}>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={copyAddress}
                disabled={!publicUrl}
              >
                {copyState === "success" ? (
                  <Check size={16} />
                ) : (
                  <Copy size={16} />
                )}
                {copyState === "success"
                  ? "Link copiado"
                  : "Copiar link da página"}
              </button>
              {publicPath && (
                <Link
                  href={publicPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.pageVisit}
                >
                  Visitar página
                  <ExternalLink size={15} aria-hidden="true" />
                </Link>
              )}
            </div>
            <p
              className={
                copyState === "error" ? styles.copyError : styles.pageHint
              }
              role="status"
            >
              {copyState === "error"
                ? "Não foi possível copiar. Selecione e copie o endereço acima."
                : copyState === "success"
                  ? "Endereço copiado. Agora é só colar na sua bio."
                  : "Um endereço para conectar tudo o que você faz."}
            </p>
          </section>

          <section className={styles.panel} aria-labelledby="links-title">
            <div className={styles.sectionHeader}>
              <div>
                <h2 id="links-title">Seus links</h2>
                <p>Na ordem em que aparecem na sua página.</p>
              </div>
              <Link href="/dashboard/links" className={styles.textLink}>
                Gerenciar
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
            {data.links.length ? (
              <div className={styles.linkList}>
                {data.links.map((link, index) => (
                  <Link
                    href="/dashboard/links"
                    key={link.id}
                    className={styles.linkRow}
                  >
                    <span className={styles.linkNumber}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <strong>{link.title}</strong>
                      <span>{hostname(link.url)}</span>
                    </div>
                    {link.featured && (
                      <Star
                        size={15}
                        className={styles.featuredStar}
                        aria-label="Em destaque"
                      />
                    )}
                    <ChevronArrow />
                  </Link>
                ))}
              </div>
            ) : (
              <div className={styles.emptyLinks}>
                <Link2 size={27} aria-hidden="true" />
                <h3>Um link abre muitas possibilidades.</h3>
                <p>Adicione seu site, WhatsApp ou rede social para começar.</p>
                <Link
                  href="/dashboard/new-link"
                  className={styles.primaryButton}
                >
                  Adicionar primeiro link
                  <ArrowRight size={16} />
                </Link>
              </div>
            )}
            {data.linkCount > data.links.length && (
              <Link href="/dashboard/links" className={styles.allLinks}>
                Ver todos os {data.linkCount} links
                <ArrowRight size={15} />
              </Link>
            )}
          </section>
        </div>

        <aside className={styles.checklist} aria-labelledby="checklist-title">
          <div className={styles.checklistHeader}>
            <span className={styles.checklistIcon}>
              <Sparkles size={19} aria-hidden="true" />
            </span>
            <span className={styles.progressCount}>
              {completed} de {checklist.length}
            </span>
          </div>
          <h2 id="checklist-title">Seu espaço, pronto para ir além.</h2>
          <p>Pequenos ajustes fazem sua página contar a sua história.</p>
          <div
            className={styles.progressTrack}
            role="progressbar"
            aria-label="Configuração da página"
            aria-valuemin={0}
            aria-valuemax={checklist.length}
            aria-valuenow={completed}
          >
            <span
              style={{ width: `${(completed / checklist.length) * 100}%` }}
            />
          </div>
          <ol className={styles.checklistItems}>
            {checklist.map((item) => (
              <li
                key={item.label}
                className={item.done ? styles.checklistDone : ""}
              >
                {item.done ? (
                  <CheckCircle2 size={19} aria-hidden="true" />
                ) : (
                  <Circle size={19} aria-hidden="true" />
                )}
                <div>
                  {item.action ? (
                    <button
                      type="button"
                      onClick={item.action}
                      disabled={!publicUrl}
                    >
                      {item.label}
                    </button>
                  ) : (
                    <Link href={item.href!}>{item.label}</Link>
                  )}
                  <span className={styles.srOnly}>
                    {item.done ? " — Concluído" : " — Pendente"}
                  </span>
                  <p>{item.detail}</p>
                </div>
              </li>
            ))}
          </ol>
          {completed === checklist.length && (
            <p className={styles.checklistSuccess}>
              <Check size={15} aria-hidden="true" />
              Tudo pronto para compartilhar sua página.
            </p>
          )}
        </aside>
      </div>

      {plan === "ultra" && (
        <section className={styles.panel} aria-labelledby="finance-title">
          <div className={styles.sectionHeader}>
            <div>
              <h2 id="finance-title">Seu financeiro hoje</h2>
              <p>Resumo dos lançamentos registrados no dia.</p>
            </div>
            <Link
              href="/dashboard/profit-calculator"
              className={styles.textLink}
            >
              Abrir financeiro
              <ArrowRight size={15} />
            </Link>
          </div>
          <div className={styles.financeGrid}>
            {[
              { label: "Receita", value: daily?.totalRevenue },
              { label: "Despesas", value: daily?.totalExpenses },
              { label: "Lucro líquido", value: daily?.netProfit },
            ].map((stat) => (
              <div key={stat.label}>
                <span>{stat.label}</span>
                <strong>
                  {stat.value === undefined ? "—" : currency(stat.value)}
                </strong>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className={styles.toolsSection} aria-labelledby="tools-title">
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>MAIS POSSIBILIDADES</p>
            <h2 id="tools-title">Ferramentas para o seu próximo passo</h2>
          </div>
          <span className={styles.currentPlan}>
            Seu plano:{" "}
            {plan === "free" ? "Free" : plan === "pro" ? "Pro" : "Ultra"}
          </span>
        </div>
        <div className={styles.toolsGrid}>
          {tools.map((tool) => (
            <Link href={tool.href} key={tool.href} className={styles.toolCard}>
              <div className={styles.toolCardTop}>
                <span className={styles.toolIcon}>
                  <tool.icon size={20} aria-hidden="true" />
                </span>
                {!hasPlan(plan, tool.plan) && (
                  <span className={styles.planTag}>
                    {tool.plan.toUpperCase()}
                  </span>
                )}
                <ArrowUpRight
                  size={16}
                  className={styles.toolArrow}
                  aria-hidden="true"
                />
              </div>
              <h3>{tool.title}</h3>
              <p>
                {tool.href === "/dashboard/ads" && canUseAds
                  ? `${data.campaignCount} campanha${data.campaignCount === 1 ? " cadastrada" : "s cadastradas"}. Gerencie seus anúncios.`
                  : tool.href === "/dashboard/tracking" && plan === "ultra"
                    ? `${data.trackingCount} de 2 identificadores configurados.`
                    : tool.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
      <footer className={styles.overviewFooter}>
        <span>
          <Link2 size={14} aria-hidden="true" />
          Feito por você. Conectado pelo Freelinnk.
        </span>
        <Link href="/dashboard/help">
          Precisa de uma mão?
          <ArrowUpRight size={14} />
        </Link>
      </footer>
    </div>
  );
}

function ChevronArrow() {
  return (
    <ArrowUpRight size={17} className={styles.linkArrow} aria-hidden="true" />
  );
}
