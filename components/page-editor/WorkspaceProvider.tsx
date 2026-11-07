"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useUser } from "@clerk/nextjs";
import { useAction, useConvexAuth, useQuery } from "convex/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowRight, Check, Layers, Plus, X } from "lucide-react";
import { api } from "@/convex/_generated/api";
import {
  extraPageLimit,
  pagePalettes,
  editorError,
  type AppearanceValues,
} from "@/lib/page-editor";
import { usernameError } from "@/convex/lib/onboarding_utils";
import styles from "./editor.module.css";

export interface WorkspacePage {
  userId: string;
  isMain: boolean;
  username: string;
  displayName: string;
  accentColor: string;
  avatar: string | null;
  subAccountId: string | null;
  createdAt: number;
}
type Draft = { base: AppearanceValues; values: AppearanceValues };
type DraftUpdate = Draft | ((current?: Draft) => Draft);
interface WorkspaceContext {
  pages: WorkspacePage[];
  selected: WorkspacePage | undefined;
  plan: string;
  limit: number;
  status: "loading" | "ready" | "invalid" | "auth-error" | "timeout";
  selectPage: (id: string, destination?: string) => void;
  withPage: (path: string) => string;
  openCreate: () => void;
  drafts: Record<string, Draft>;
  setDraft: (id: string, value: DraftUpdate) => void;
  clearDraft: (id: string) => void;
}
const Workspace = createContext<WorkspaceContext | null>(null);
export function usePageWorkspace() {
  const ctx = useContext(Workspace);
  if (!ctx) throw new Error("Page workspace is missing");
  return ctx;
}

export function PageWorkspaceProvider({
  initialPlan,
  children,
}: {
  initialPlan: string;
  children: ReactNode;
}) {
  const { user, isLoaded } = useUser();
  const auth = useConvexAuth();
  const catalog = useQuery(
    api.pageWorkspaces.getMyPages,
    auth.isAuthenticated ? {} : "skip",
  );
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pendingSelection, setPendingSelection] = useState<string | null>(null);
  const [preferred, setPreferred] = useState<string | null>(null);
  const [storageReady, setStorageReady] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const pages = catalog || [];
  const requested =
    params.get("page") ||
    params.get("subUserId") ||
    params.get("subAccount") ||
    preferred ||
    user?.id;
  const selected = pages.find((page) => page.userId === requested);
  const waiting =
    (pendingSelection === requested && !selected) ||
    !isLoaded ||
    auth.isLoading ||
    !storageReady ||
    (auth.isAuthenticated && catalog === undefined);
  useEffect(() => {
    if (
      pendingSelection &&
      pages.some((page) => page.userId === pendingSelection)
    )
      setPendingSelection(null);
  }, [catalog, pendingSelection]);
  const normalizedPlan = initialPlan.toLowerCase();
  const plan =
    normalizedPlan === "ultra" || normalizedPlan === "pro"
      ? normalizedPlan
      : "free";
  const limit = extraPageLimit(
    plan,
    user?.id === "user_301NTkVsE3v48SXkoCEp0XOXifI",
  );
  const status = waiting
    ? timedOut
      ? "timeout"
      : "loading"
    : !auth.isAuthenticated
      ? "auth-error"
      : selected
        ? "ready"
        : "invalid";
  useEffect(() => {
    if (!user?.id) {
      setStorageReady(isLoaded);
      return;
    }
    let value: string | null = null;
    try {
      value = localStorage.getItem(`freelinnk-selected-page:${user.id}`);
      if (!value) {
        const legacy = JSON.parse(
          localStorage.getItem("freelinnk_active_subaccount") || "null",
        );
        value = legacy?.subUserId || null;
      }
    } catch {
      /* Optional preference. */
    }
    setPreferred(value);
    setDrafts({});
    setStorageReady(true);
  }, [user?.id, isLoaded]);
  useEffect(() => {
    if (!waiting) {
      setTimedOut(false);
      return;
    }
    const timer = setTimeout(() => setTimedOut(true), 15000);
    return () => clearTimeout(timer);
  }, [waiting]);
  const hasDraft = Object.values(drafts).some(
    (draft) => JSON.stringify(draft.base) !== JSON.stringify(draft.values),
  );
  useEffect(() => {
    if (!hasDraft) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [hasDraft]);
  const setDraft = useCallback(
    (id: string, value: DraftUpdate) =>
      setDrafts((current) => ({
        ...current,
        [id]: typeof value === "function" ? value(current[id]) : value,
      })),
    [],
  );
  const clearDraft = useCallback(
    (id: string) =>
      setDrafts((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      }),
    [],
  );
  function selectPage(id: string, destination = pathname) {
    if (!pages.some((page) => page.userId === id)) return;
    setPreferred(id);
    try {
      localStorage.setItem(`freelinnk-selected-page:${user?.id}`, id);
      localStorage.removeItem("freelinnk_active_subaccount");
    } catch {
      /* State still updates. */
    }
    const query = new URLSearchParams(
      destination === pathname ? params.toString() : "",
    );
    query.delete("subUserId");
    query.delete("subAccount");
    query.delete("username");
    if (id === user?.id) query.delete("page");
    else query.set("page", id);
    router.push(`${destination}${query.size ? `?${query}` : ""}`, {
      scroll: false,
    });
  }
  const withPage = (path: string) =>
    selected && !selected.isMain
      ? `${path}?page=${encodeURIComponent(selected.userId)}`
      : path;
  return (
    <Workspace.Provider
      value={{
        pages,
        selected,
        plan,
        limit,
        status,
        selectPage,
        withPage,
        openCreate: () => setCreateOpen(true),
        drafts,
        setDraft,
        clearDraft,
      }}
    >
      {children}
      <CreatePageDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(id) => {
          setPendingSelection(id);
          setPreferred(id);
          try {
            localStorage.setItem(`freelinnk-selected-page:${user?.id}`, id);
          } catch {}
          router.push(`/dashboard/settings?page=${encodeURIComponent(id)}`);
        }}
      />
    </Workspace.Provider>
  );
}

export function WorkspaceBoundary({ children }: { children: ReactNode }) {
  const { status, pages, selectPage } = usePageWorkspace();
  if (status === "ready") return children;
  if (status === "loading")
    return (
      <div className={styles.loading} role="status">
        Carregando suas páginas…
      </div>
    );
  return (
    <section className={`${styles.editor} ${styles.errorPanel}`} role="alert">
      <h1>
        {status === "invalid"
          ? "Vamos escolher uma página da sua conta."
          : "Não foi possível conectar ao editor."}
      </h1>
      <p>
        {status === "invalid"
          ? "A página selecionada não está disponível nesta conta. Escolha sua página principal para continuar."
          : "Tente carregar novamente para acessar suas páginas e seus links."}
      </p>
      {status === "invalid" && pages[0] ? (
        <button
          className={styles.primaryButton}
          onClick={() => selectPage(pages[0].userId)}
        >
          Abrir minha página principal
        </button>
      ) : (
        <button
          className={styles.primaryButton}
          onClick={() => window.location.reload()}
        >
          Tentar novamente
        </button>
      )}
    </section>
  );
}

function CreatePageDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (id: string) => void;
}) {
  const { pages, limit, plan } = usePageWorkspace();
  const create = useAction(api.pageWorkspaces.createPage);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [touched, setTouched] = useState(false);
  const [color, setColor] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    if (open) {
      setName("");
      setUsername("");
      setTouched(false);
      setColor(0);
      setError("");
    }
  }, [open]);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(username), 300);
    return () => clearTimeout(timer);
  }, [username]);
  const availability = useQuery(
    api.pageWorkspaces.checkAddress,
    open && debounced && !usernameError(debounced)
      ? { username: debounced }
      : "skip",
  );
  const atLimit = pages.filter((page) => !page.isMain).length >= limit;
  const allowed = limit > 0 && !atLimit;
  const palette = pagePalettes[color];
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy || !allowed) return;
    setBusy(true);
    setError("");
    try {
      const page = await create({
        displayName: name,
        username,
        accentColor: palette.accent,
        backgroundColor1: palette.background,
        backgroundColor2: palette.second,
      });
      onOpenChange(false);
      onCreated(page.userId);
    } catch (err) {
      setError(
        editorError(err, "Não foi possível criar a página. Tente novamente."),
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(value) => {
        if (!busy) onOpenChange(value);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.dialog}>
          <Dialog.Close asChild>
            <button
              className={styles.dialogClose}
              disabled={busy}
              aria-label="Fechar criação de página"
            >
              <X size={20} />
            </button>
          </Dialog.Close>
          <span className={styles.dialogIcon}>
            <Layers size={22} />
          </span>
          <Dialog.Title>Uma página para cada marca.</Dialog.Title>
          <Dialog.Description>
            Nome, endereço, cores e links independentes. Você gerencia tudo pela
            mesma conta.
          </Dialog.Description>
          {!allowed ? (
            <div className={styles.planNotice}>
              <p>
                {limit
                  ? "Você atingiu o limite de páginas adicionais do seu plano."
                  : "Sua página principal está incluída no Free. Pro e Ultra permitem criar páginas adicionais."}
              </p>
              <Link
                href="/dashboard/billing"
                onClick={() => onOpenChange(false)}
                className={styles.primaryButton}
              >
                Conhecer planos
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className={styles.formStack}>
              <label className={styles.field}>
                Nome da marca
                <input
                  autoFocus
                  value={name}
                  maxLength={80}
                  disabled={busy}
                  placeholder="Ex.: Nome do seu comércio"
                  onChange={(event) => {
                    setName(event.target.value);
                    if (!touched)
                      setUsername(
                        event.target.value
                          .normalize("NFD")
                          .replace(/[\u0300-\u036f]/g, "")
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/^-|-$/g, "")
                          .slice(0, 30),
                      );
                  }}
                  required
                />
              </label>
              <label className={styles.field}>
                Endereço da página
                <div className={styles.addressInput}>
                  <span>/</span>
                  <input
                    value={username}
                    onChange={(event) => {
                      setTouched(true);
                      setUsername(event.target.value.toLowerCase());
                    }}
                    maxLength={30}
                    disabled={busy}
                    placeholder="nome-da-marca"
                    required
                  />
                </div>
                <span className={styles.fieldHint}>
                  {usernameError(username) && username
                    ? usernameError(username)
                    : username &&
                        (debounced !== username || availability === undefined)
                      ? "Conferindo endereço…"
                      : availability
                        ? availability.available
                          ? "Endereço disponível."
                          : availability.error
                        : "Use de 3 a 30 letras, números, hífen ou underline."}
                </span>
              </label>
              <fieldset className={styles.paletteFieldset}>
                <legend>Comece com uma paleta</legend>
                <div className={styles.paletteGrid}>
                  {pagePalettes.map((preset, index) => (
                    <button
                      type="button"
                      key={preset.name}
                      onClick={() => setColor(index)}
                      aria-pressed={color === index}
                      className={`${styles.palette} ${color === index ? styles.paletteSelected : ""}`}
                      disabled={busy}
                    >
                      <span style={{ background: preset.background }}>
                        <i style={{ background: preset.accent }} />
                        {color === index && <Check size={13} />}
                      </span>
                      {preset.name}
                    </button>
                  ))}
                </div>
              </fieldset>
              <p className={styles.fieldHint}>
                Você poderá trocar todas as cores e adicionar seus links depois.
              </p>
              {error && (
                <p className={styles.formError} role="alert">
                  {error}
                </p>
              )}
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={
                  busy ||
                  !name.trim() ||
                  !!usernameError(username) ||
                  debounced !== username ||
                  !availability?.available
                }
              >
                {busy ? "Criando página…" : "Criar e personalizar"}
                <ArrowRight size={16} />
              </button>
              <p className={styles.fieldHint}>
                Plano {plan} · {pages.filter((page) => !page.isMain).length} de{" "}
                {limit} páginas adicionais
              </p>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
