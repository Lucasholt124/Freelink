"use client";

import { type ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useClerk, useUser } from "@clerk/nextjs";
import { useConvexAuth, useQuery } from "convex/react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowUpRight,
  Calculator,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Gift,
  HelpCircle,
  Home,
  Link2,
  LogOut,
  Menu,
  Megaphone,
  Palette,
  Plus,
  Search,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";
import {
  activeDashboardHref,
  dashboardNavigation,
  dashboardTitle,
  hasPlan,
  normalizePlan,
  searchDashboard,
} from "@/lib/dashboard-navigation";
import styles from "./dashboard.module.css";

const icons = {
  home: Home,
  links: Link2,
  palette: Palette,
  ads: Megaphone,
  gift: Gift,
  calculator: Calculator,
  tracking: Target,
  billing: CreditCard,
  help: HelpCircle,
};
const groups = ["Seu espaço", "Crescimento", "Gestão", "Sua conta"];

export default function DashboardShell({
  children,
  initialPlan,
}: {
  children: ReactNode;
  initialPlan: string;
}) {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { isAuthenticated } = useConvexAuth();
  const overview = useQuery(
    api.dashboard.getOverview,
    isAuthenticated ? {} : "skip",
  );
  const plan = normalizePlan(initialPlan);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [shortcutLabel, setShortcutLabel] = useState("Ctrl K");
  const active = activeDashboardHref(pathname);
  const name = overview?.displayName || user?.firstName || "Sua conta";
  const publicPath = overview?.username
    ? `/${encodeURIComponent(overview.username)}`
    : null;

  useEffect(() => {
    if (/Mac|iPhone|iPad/.test(navigator.platform)) setShortcutLabel("⌘ K");
    try {
      setCollapsed(
        localStorage.getItem("freelinnk-sidebar-collapsed") === "true",
      );
    } catch {
      /* Storage can be disabled. */
    }
    const media = window.matchMedia("(min-width: 1024px)");
    const resize = () => {
      if (media.matches) setMobileOpen(false);
    };
    media.addEventListener("change", resize);
    const shortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => {
      media.removeEventListener("change", resize);
      window.removeEventListener("keydown", shortcut);
    };
  }, []);
  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  function toggleCollapsed() {
    setCollapsed((value) => {
      try {
        localStorage.setItem("freelinnk-sidebar-collapsed", String(!value));
      } catch {
        /* Optional preference. */
      }
      return !value;
    });
  }

  function navigation(compact = false) {
    return (
      <>
        <div className={styles.sidebarBrand}>
          <Link
            href="/dashboard"
            className={styles.brand}
            aria-label="Freelinnk — início"
            onClick={() => setMobileOpen(false)}
          >
            <span className={styles.brandMark}>
              <Link2 size={21} aria-hidden="true" />
            </span>
            {!compact && (
              <span>
                freelinnk<span className={styles.brandDot}>.</span>
              </span>
            )}
          </Link>
          {!compact && <span className={styles.workspaceLabel}>WORKSPACE</span>}
        </div>
        <nav aria-label="Menu principal" className={styles.navigation}>
          {groups.map((group) => (
            <div className={styles.navGroup} key={group}>
              {!compact && <p className={styles.groupLabel}>{group}</p>}
              {dashboardNavigation
                .filter((item) => item.group === group)
                .map((item) => {
                  const Icon = icons[item.icon];
                  const required = "plan" in item ? item.plan : null;
                  const locked = required && !hasPlan(plan, required);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`${styles.navLink} ${active === item.href ? styles.navActive : ""}`}
                      aria-current={active === item.href ? "page" : undefined}
                      title={
                        compact
                          ? `${item.label}${locked ? ` · ${required.toUpperCase()}` : ""}`
                          : undefined
                      }
                      aria-label={compact ? item.label : undefined}
                      onClick={() => setMobileOpen(false)}
                    >
                      <Icon size={19} aria-hidden="true" />
                      {!compact && (
                        <>
                          <span>{item.label}</span>
                          {locked && (
                            <span className={styles.planTag}>
                              {required.toUpperCase()}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  );
                })}
            </div>
          ))}
        </nav>
        {!compact && (
          <div className={styles.planCard}>
            <div>
              <Sparkles size={16} aria-hidden="true" />
              <strong>
                Seu plano{" "}
                {plan === "free" ? "Free" : plan === "pro" ? "Pro" : "Ultra"}
              </strong>
            </div>
            <p>
              {plan === "ultra"
                ? "Todas as ferramentas à sua disposição."
                : "Um espaço para cada fase do seu negócio."}
            </p>
            <Link
              href="/dashboard/billing"
              onClick={() => setMobileOpen(false)}
            >
              {plan === "free" ? "Conhecer planos" : "Gerenciar plano"}
              <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          </div>
        )}
        <div className={styles.sidebarAccount}>
          {!compact && (
            <div className={styles.accountText}>
              <strong title={name}>{name}</strong>
              <span>Minha conta</span>
            </div>
          )}
          <button
            type="button"
            className={styles.iconButton}
            aria-label="Sair da conta"
            title="Sair da conta"
            onClick={() => signOut({ redirectUrl: "/" })}
          >
            <LogOut size={18} aria-hidden="true" />
          </button>
        </div>
      </>
    );
  }

  const results = searchDashboard(search);
  return (
    <div className={`${styles.shell} ${collapsed ? styles.collapsed : ""}`}>
      <a className={styles.skipLink} href="#dashboard-content">
        Ir para o conteúdo
      </a>
      <aside className={styles.sidebar} aria-label="Navegação lateral">
        {navigation(collapsed)}
        <button
          type="button"
          className={styles.collapseButton}
          onClick={toggleCollapsed}
          aria-label={
            collapsed ? "Expandir menu lateral" : "Recolher menu lateral"
          }
          title={collapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>
      <div className={styles.mainColumn}>
        <header className={styles.topbar}>
          <div className={styles.topbarTitle}>
            <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
              <Dialog.Trigger asChild>
                <button
                  type="button"
                  className={`${styles.iconButton} ${styles.mobileMenu}`}
                  aria-label="Abrir menu lateral"
                >
                  <Menu size={21} />
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className={styles.overlay} />
                <Dialog.Content
                  className={`${styles.mobileDrawer} ${styles.dialogTheme}`}
                >
                  <Dialog.Title className={styles.srOnly}>
                    Menu do painel
                  </Dialog.Title>
                  <Dialog.Description className={styles.srOnly}>
                    Navegue pelas ferramentas e configurações da sua conta.
                  </Dialog.Description>
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className={styles.drawerClose}
                      aria-label="Fechar menu lateral"
                    >
                      <X size={20} />
                    </button>
                  </Dialog.Close>
                  {navigation()}
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
            <span className={styles.breadcrumb}>
              Seu painel <ChevronRight size={13} aria-hidden="true" />
            </span>
            <span className={styles.currentPage}>
              {dashboardTitle(pathname)}
            </span>
          </div>
          <div className={styles.topbarActions}>
            <button
              type="button"
              className={styles.searchTrigger}
              aria-label="Buscar ferramentas"
              onClick={() => {
                setSearch("");
                setSearchOpen(true);
              }}
            >
              <Search size={17} />
              <span>Buscar</span>
              <kbd>{shortcutLabel}</kbd>
            </button>
            {publicPath && (
              <Link
                href={publicPath}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.publicShortcut}
              >
                Ver página <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            )}
            <Link href="/dashboard/new-link" className={styles.newLink}>
              <Plus size={17} aria-hidden="true" />
              <span>Novo link</span>
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>
        <main
          id="dashboard-content"
          className={styles.mainContent}
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
      <Dialog.Root open={searchOpen} onOpenChange={setSearchOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.overlay} />
          <Dialog.Content
            className={`${styles.searchDialog} ${styles.dialogTheme}`}
          >
            <Dialog.Title className={styles.srOnly}>
              Buscar ferramentas
            </Dialog.Title>
            <Dialog.Description className={styles.srOnly}>
              Digite para encontrar páginas e ferramentas do seu painel. Use Tab
              para escolher um resultado e Enter para abrir.
            </Dialog.Description>
            <div className={styles.searchInputRow}>
              <Search size={20} aria-hidden="true" />
              <input
                aria-label="Buscar no painel"
                placeholder="O que você quer fazer?"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <Dialog.Close asChild>
                <button
                  type="button"
                  className={styles.iconButton}
                  aria-label="Fechar busca"
                >
                  <X size={18} />
                </button>
              </Dialog.Close>
            </div>
            <p className={styles.searchHint}>
              {search.trim()
                ? `${results.length} resultado${results.length === 1 ? "" : "s"}`
                : "Navegue pelo seu espaço"}
            </p>
            <div className={styles.searchResults}>
              {results.length ? (
                results.map((item) => {
                  const Icon = icons[item.icon];
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSearchOpen(false)}
                      className={styles.searchResult}
                    >
                      <Icon size={19} aria-hidden="true" />
                      <div>
                        <strong>{item.label}</strong>
                        <span>{item.description}</span>
                      </div>
                      {"plan" in item && !hasPlan(plan, item.plan) ? (
                        <span className={styles.planTag}>
                          {item.plan.toUpperCase()}
                        </span>
                      ) : (
                        <ChevronRight size={16} aria-hidden="true" />
                      )}
                    </Link>
                  );
                })
              ) : (
                <div className={styles.searchEmpty}>
                  Nenhuma ferramenta encontrada. Tente “links”, “perfil” ou
                  “sorteios”.
                </div>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <WelcomeModal />
    </div>
  );
}
