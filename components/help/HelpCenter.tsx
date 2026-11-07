"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useClerk } from "@clerk/nextjs";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  CreditCard,
  Headphones,
  HelpCircle,
  Link2,
  Mail,
  MessageCircle,
  Palette,
  Search,
  SlidersHorizontal,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import {
  helpArticles,
  helpCategories,
  findHelpArticles,
  supportLinks,
  type HelpAction,
  type HelpCategory,
} from "@/lib/help-center";
import { usePageWorkspace } from "@/components/page-editor/WorkspaceProvider";
import styles from "./help.module.css";

const categoryIcons = {
  all: BookOpen,
  start: Sparkles,
  links: Link2,
  appearance: Palette,
  billing: CreditCard,
  tools: SlidersHorizontal,
  account: UserRound,
};
const guides = [
  {
    id: "help-comecar",
    label: "Sua página pronta",
    description: "Do nome ao primeiro link.",
    icon: Sparkles,
  },
  {
    id: "help-whatsapp",
    label: "Um contato mais fácil",
    description: "WhatsApp com mensagem pronta.",
    icon: MessageCircle,
  },
  {
    id: "help-cores",
    label: "A cara da sua marca",
    description: "Cores, fundo e personalidade.",
    icon: Palette,
  },
];

export default function HelpCenter() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<HelpCategory>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copyFailedId, setCopyFailedId] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const { openUserProfile } = useClerk();
  const { withPage } = usePageWorkspace();
  const articles = findHelpArticles(query, category);
  const contacts = supportLinks();
  useEffect(() => {
    function readHash() {
      const article = helpArticles.find(
        (item) => `#${item.id}` === window.location.hash,
      );
      if (article) {
        setQuery("");
        setCategory(article.category);
        setOpenId(article.id);
      }
    }
    readHash();
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, []);
  useEffect(() => {
    if (openId)
      document.getElementById(openId)?.scrollIntoView({ block: "nearest" });
  }, [openId]);
  useEffect(() => {
    if (!copiedId) return;
    const timer = setTimeout(() => setCopiedId(null), 2000);
    return () => clearTimeout(timer);
  }, [copiedId]);
  function openGuide(id: string) {
    const article = helpArticles.find((item) => item.id === id);
    if (!article) return;
    setQuery("");
    setCategory(article.category);
    setOpenId(id);
    window.history.replaceState(null, "", `#${id}`);
  }
  function actionButton(action: HelpAction) {
    return "account" in action ? (
      <button
        type="button"
        className={styles.answerAction}
        onClick={() => openUserProfile()}
      >
        {action.label}
        <ArrowUpRight size={15} />
      </button>
    ) : (
      <Link
        className={styles.answerAction}
        href={action.pageScoped ? withPage(action.href) : action.href}
      >
        {action.label}
        <ArrowUpRight size={15} />
      </Link>
    );
  }
  return (
    <div className={styles.help}>
      <header className={styles.hero}>
        <div className={styles.heroMain}>
          <p className={styles.eyebrow}>
            <span /> SUA CENTRAL DE AJUDA
          </p>
          <h1>
            Como podemos
            <br className={styles.desktopBreak} /> ajudar você?
          </h1>
          <p className={styles.intro}>
            Uma resposta, um passo a passo ou uma conversa.
            <br /> Encontre o caminho para continuar.
          </p>
          <div className={styles.searchBox} role="search">
            <Search size={21} aria-hidden="true" />
            <input
              ref={searchRef}
              type="search"
              aria-label="Buscar na Central de Ajuda"
              placeholder="Busque por assunto ou dúvida…"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setOpenId(null);
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setQuery("");
                  setCategory("all");
                }
              }}
            />
            {query ? (
              <button
                type="button"
                aria-label="Limpar busca"
                onClick={() => {
                  setQuery("");
                  searchRef.current?.focus();
                }}
              >
                <X size={18} />
              </button>
            ) : (
              <kbd>Buscar</kbd>
            )}
          </div>
          <div className={styles.suggestions}>
            <span>Mais procurados:</span>
            {[
              { label: "WhatsApp", query: "whatsapp" },
              { label: "Cores da marca", query: "cores" },
              { label: "Faturas", query: "faturas" },
            ].map((item) => (
              <button
                type="button"
                key={item.query}
                onClick={() => {
                  setQuery(item.query);
                  setCategory("all");
                  setOpenId(null);
                }}
              >
                {item.label}
                <ArrowUpRight size={11} />
              </button>
            ))}
          </div>
        </div>
        <aside className={styles.supportCard} aria-label="Canais de suporte">
          <div className={styles.supportIcon}>
            <Headphones size={25} />
          </div>
          <span className={styles.eyebrow}>GENTE PARA AJUDAR</span>
          <h2>Prefere conversar?</h2>
          <p>
            Conte o que você precisa. Se algo não saiu como esperado, estamos
            por aqui.
          </p>
          <a
            href={contacts.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.supportPrimary}
          >
            <MessageCircle size={17} /> Conversar no WhatsApp
            <ArrowUpRight size={16} />
          </a>
          <a href={contacts.email} className={styles.supportEmail}>
            <Mail size={15} /> Prefiro enviar um e-mail
            <ArrowUpRight size={14} />
          </a>
          <small>
            Para facilitar, informe o endereço da página e o que você tentou
            fazer.
          </small>
        </aside>
      </header>
      <div className={styles.mobileSupport}>
        <span>
          <Headphones size={17} />
          Prefere conversar?
        </span>
        <div>
          <a href={contacts.whatsapp} target="_blank" rel="noopener noreferrer">
            WhatsApp
            <ArrowUpRight size={12} />
          </a>
          <a href={contacts.email}>
            E-mail
            <ArrowUpRight size={12} />
          </a>
        </div>
      </div>

      <section
        aria-labelledby="quick-actions"
        className={styles.shortcutSection}
      >
        <div className={styles.sectionTitle}>
          <h2 id="quick-actions">Vá direto ao que precisa.</h2>
          <span>SEU PAINEL, SEM VOLTAS</span>
        </div>
        <div className={styles.shortcuts}>
          <Link href={withPage("/dashboard/links")}>
            <span className={styles.shortcutIcon}>
              <Link2 size={20} />
            </span>
            <span>
              <strong>Meus links</strong>
              <small>Adicionar e organizar</small>
            </span>
            <ArrowUpRight size={17} />
          </Link>
          <Link href={withPage("/dashboard/settings")}>
            <span className={styles.shortcutIcon}>
              <Palette size={20} />
            </span>
            <span>
              <strong>Aparência e perfil</strong>
              <small>Deixar com a sua cara</small>
            </span>
            <ArrowUpRight size={17} />
          </Link>
          <Link href="/dashboard/billing">
            <span className={styles.shortcutIcon}>
              <CreditCard size={20} />
            </span>
            <span>
              <strong>Plano e cobrança</strong>
              <small>Planos, cartão e faturas</small>
            </span>
            <ArrowUpRight size={17} />
          </Link>
          <button type="button" onClick={() => openUserProfile()}>
            <span className={styles.shortcutIcon}>
              <UserRound size={20} />
            </span>
            <span>
              <strong>Minha conta</strong>
              <small>Dados e acesso</small>
            </span>
            <ArrowUpRight size={17} />
          </button>
        </div>
      </section>

      <section className={styles.knowledge} aria-labelledby="answers-title">
        <nav
          className={styles.categories}
          aria-label="Assuntos da Central de Ajuda"
        >
          <p className={styles.eyebrow}>ENCONTRE SUA RESPOSTA</p>
          {helpCategories.map((item) => {
            const Icon = categoryIcons[item.id];
            return (
              <button
                type="button"
                key={item.id}
                aria-pressed={category === item.id}
                onClick={() => {
                  setCategory(item.id);
                  setOpenId(null);
                }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
                <small>{findHelpArticles(query, item.id).length}</small>
              </button>
            );
          })}
          <div className={styles.categoryNote}>
            <HelpCircle size={19} />
            <p>
              Não sabe por onde começar?
              <br />
              Os guias abaixo ajudam no primeiro passo.
            </p>
          </div>
        </nav>
        <div className={styles.answers}>
          <div className={styles.answersHeading}>
            <div>
              <h2 id="answers-title">
                {query
                  ? "Resultados da busca"
                  : category === "all"
                    ? "Perguntas que abrem caminhos."
                    : helpCategories.find((item) => item.id === category)
                        ?.label}
              </h2>
              <p aria-live="polite">
                {articles.length}{" "}
                {articles.length === 1 ? "resposta" : "respostas"}
                {query ? ` para “${query}”` : " para facilitar seu dia."}
              </p>
            </div>
            {(query || category !== "all") && (
              <button
                type="button"
                className={styles.reset}
                onClick={() => {
                  setQuery("");
                  setCategory("all");
                  setOpenId(null);
                }}
              >
                Ver tudo
              </button>
            )}
          </div>
          {articles.length ? (
            <div className={styles.faqList}>
              {articles.map((article) => {
                const expanded = openId === article.id;
                const topicLinks = supportLinks(article.question);
                return (
                  <article
                    key={article.id}
                    id={article.id}
                    className={`${styles.faq} ${expanded ? styles.openFaq : ""}`}
                  >
                    <h3>
                      <button
                        type="button"
                        aria-expanded={expanded}
                        aria-controls={`${article.id}-answer`}
                        onClick={() => setOpenId(expanded ? null : article.id)}
                      >
                        <span>
                          {article.question}
                          <small>
                            {
                              helpCategories.find(
                                (item) => item.id === article.category,
                              )?.label
                            }
                          </small>
                        </span>
                        <ChevronDown size={18} />
                      </button>
                    </h3>
                    {expanded && (
                      <div
                        id={`${article.id}-answer`}
                        className={styles.answer}
                        role="region"
                        aria-label={article.question}
                      >
                        <p>{article.description}</p>
                        <ol role="list">
                          {article.steps.map((step, index) => (
                            <li key={step}>
                              <span
                                aria-hidden="true"
                                className={styles.stepNumber}
                              >
                                {index + 1}
                              </span>
                              {step}
                            </li>
                          ))}
                        </ol>
                        <div className={styles.answerActions}>
                          {article.action && actionButton(article.action)}
                          <button
                            type="button"
                            className={styles.copyAnswer}
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(
                                  `${window.location.origin}/dashboard/help#${article.id}`,
                                );
                                setCopiedId(article.id);
                                setCopyFailedId(null);
                              } catch {
                                window.history.replaceState(
                                  null,
                                  "",
                                  `#${article.id}`,
                                );
                                setCopyFailedId(article.id);
                              }
                            }}
                          >
                            {copiedId === article.id ? (
                              <>
                                <Check size={13} /> Link copiado
                              </>
                            ) : (
                              "Copiar link da resposta"
                            )}
                          </button>
                        </div>
                        {copyFailedId === article.id && (
                          <p className={styles.copyNotice} role="status">
                            Não foi possível copiar automaticamente. Você pode
                            copiar o endereço desta resposta na barra do
                            navegador.
                          </p>
                        )}
                        <a
                          className={styles.stillNeedHelp}
                          href={topicLinks.whatsapp}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Ainda preciso de ajuda com isso
                          <ArrowUpRight size={12} />
                        </a>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className={styles.empty}>
              <Search size={30} />
              <h3>Vamos tentar outro caminho?</h3>
              <p>
                Não encontramos uma resposta com esses filtros. Experimente uma
                palavra como “WhatsApp”, “cores” ou “faturas”.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setCategory("all");
                  searchRef.current?.focus();
                }}
              >
                Limpar busca e filtros
                <ArrowRight size={15} />
              </button>
              <a
                href={contacts.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ou converse com a equipe
                <ArrowUpRight size={13} />
              </a>
            </div>
          )}
        </div>
      </section>

      <section className={styles.guides} aria-labelledby="guides-title">
        <div className={styles.sectionTitle}>
          <h2 id="guides-title">Um passo a passo faz diferença.</h2>
          <span>COMECE POR AQUI</span>
        </div>
        <div className={styles.guideGrid}>
          {guides.map((guide) => (
            <button
              type="button"
              key={guide.id}
              onClick={() => openGuide(guide.id)}
            >
              <guide.icon size={23} />
              <strong>{guide.label}</strong>
              <span>{guide.description}</span>
              <small>
                Abrir guia
                <ArrowRight size={14} />
              </small>
            </button>
          ))}
        </div>
      </section>
      <footer className={styles.footer}>
        <span>
          <Headphones size={16} /> Vamos encontrar seu próximo passo.
        </span>
        <a href={contacts.email}>
          Falar por e-mail
          <ArrowUpRight size={13} />
        </a>
      </footer>
    </div>
  );
}
