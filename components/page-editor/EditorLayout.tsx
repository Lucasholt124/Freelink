"use client";
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { useQuery, useMutation } from "convex/react";
import {
  ArrowUpRight,
  Copy,
  Eye,
  Layers,
  Link2,
  Palette,
  Plus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { FunctionReturnType } from "convex/server";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import ProfileView from "@/components/public-profile/ProfileView";
import type { AppearanceValues } from "@/lib/page-editor";
import { appearanceDescription, editorError } from "@/lib/page-editor";
import { accentText } from "@/lib/public-profile";
import {
  usePageWorkspace,
  WorkspaceBoundary,
  type WorkspacePage,
} from "./WorkspaceProvider";
import styles from "./editor.module.css";

export type PageData = FunctionReturnType<
  typeof api.pageWorkspaces.getEditorData
>;
export function EditorLayout({
  section,
  children,
}: {
  section: "appearance" | "links";
  children: (data: PageData) => ReactNode;
}) {
  return (
    <WorkspaceBoundary>
      <EditorContent section={section}>{children}</EditorContent>
    </WorkspaceBoundary>
  );
}
function EditorContent({
  section,
  children,
}: {
  section: "appearance" | "links";
  children: (data: PageData) => ReactNode;
}) {
  const { selected, pages, selectPage, withPage, openCreate, drafts } =
    usePageWorkspace();
  const data = useQuery(
    api.pageWorkspaces.getEditorData,
    selected ? { userId: selected.userId } : "skip",
  );
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    setTimedOut(false);
    if (data !== undefined) return;
    const timer = setTimeout(() => setTimedOut(true), 15000);
    return () => clearTimeout(timer);
  }, [selected?.userId, data === undefined]);
  if (!selected) return null;
  return (
    <div className={styles.editor}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>SEU ESPAÇO, SUA IDENTIDADE</p>
          <h1>
            {section === "appearance" ? "Aparência e perfil" : "Meus links"}
          </h1>
          <p>
            {section === "appearance"
              ? "Deixe sua página com a personalidade da sua marca."
              : "Organize os caminhos que conectam as pessoas ao seu negócio."}
          </p>
        </div>
        <a
          href={`/${encodeURIComponent(selected.username)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.secondaryButton}
        >
          Ver página
          <ArrowUpRight size={16} />
        </a>
      </header>
      <section className={styles.pageSelector} aria-label="Página em edição">
        <span
          className={styles.pageMonogram}
          style={{
            background: selected.accentColor,
            color: accentText(selected.accentColor),
          }}
        >
          {selected.displayName.slice(0, 1).toUpperCase()}
        </span>
        <label>
          <span>Editando a página</span>
          <select
            aria-label="Página em edição"
            value={selected.userId}
            onChange={(event) => selectPage(event.target.value)}
          >
            {pages.map((page) => (
              <option key={page.userId} value={page.userId}>
                {page.displayName}
                {page.isMain ? " · Principal" : ""}
                {drafts[page.userId] &&
                JSON.stringify(drafts[page.userId].values) !==
                  JSON.stringify(drafts[page.userId].base)
                  ? " · Rascunho"
                  : ""}
              </option>
            ))}
          </select>
          <small>/{selected.username}</small>
        </label>
        <button
          type="button"
          className={styles.iconButton}
          aria-label="Copiar endereço desta página"
          onClick={() => {
            void navigator.clipboard
              .writeText(
                `${window.location.origin}/${encodeURIComponent(selected.username)}`,
              )
              .then(() => toast.success("Endereço da página copiado."))
              .catch(() => toast.error("Não foi possível copiar o endereço."));
          }}
        >
          <Copy size={17} />
        </button>
        <button
          type="button"
          onClick={openCreate}
          aria-label="Nova página"
          className={styles.secondaryButton}
        >
          <Plus size={16} />
          <span>Nova página</span>
        </button>
      </section>
      <nav className={styles.editorTabs} aria-label="Editar esta página">
        <Link
          href={withPage("/dashboard/settings")}
          aria-current={section === "appearance" ? "page" : undefined}
        >
          <Palette size={16} />
          Identidade e aparência
        </Link>
        <Link
          href={withPage("/dashboard/links")}
          aria-current={section === "links" ? "page" : undefined}
        >
          <Link2 size={16} />
          Links da página
        </Link>
      </nav>
      {data ? (
        children(data)
      ) : timedOut ? (
        <div className={styles.errorPanel} role="alert">
          <p>Os dados demoraram para carregar.</p>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => window.location.reload()}
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <div className={styles.loading} role="status">
          Carregando esta página…
        </div>
      )}
    </div>
  );
}

export function LivePreview({
  data,
  values,
  mobileOpen,
  onMobileOpenChange,
}: {
  data: PageData;
  values?: AppearanceValues;
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
}) {
  const { selected, plan } = usePageWorkspace();
  const [dark, setDark] = useState(false);
  const [localOpen, setLocalOpen] = useState(false);
  const open = mobileOpen ?? localOpen;
  const setOpen = onMobileOpenChange || setLocalOpen;
  if (!selected) return null;
  const profile = values
    ? {
        ...data.profile,
        displayName: values.displayName,
        description: appearanceDescription(values),
        accentColor: values.accentColor,
        backgroundType: values.backgroundType,
        backgroundStyle: values.backgroundStyle,
        backgroundColor1: values.backgroundColor1,
        backgroundColor2: values.backgroundColor2,
        backgroundImageUrl: values.backgroundUrl,
        profilePictureUrl: values.photoUrl,
        backgroundImageBlur: values.backgroundImageBlur,
        backgroundImageOpacity: values.backgroundImageOpacity,
      }
    : data.profile;
  const themeButtons = (
    <div>
      <button type="button" onClick={() => setDark(false)} aria-pressed={!dark}>
        Claro
      </button>
      <button type="button" onClick={() => setDark(true)} aria-pressed={dark}>
        Escuro
      </button>
    </div>
  );
  const renderProfile = () => (
    <div className={styles.previewFrame} inert>
      <ProfileView
        embedded
        username={selected.username}
        profile={profile}
        links={data.links}
        plan={plan === "ultra" || plan === "pro" ? plan : "free"}
        dark={dark}
        feedback=""
        onTheme={() => {}}
        onQr={() => {}}
        onShare={() => {}}
        onLink={() => {}}
      />
    </div>
  );
  return (
    <div className={styles.previewHost}>
      {!values && (
        <button
          type="button"
          className={`${styles.secondaryButton} ${styles.mobilePreview}`}
          onClick={() => setOpen(true)}
        >
          <Eye size={16} />
          Ver prévia da página
        </button>
      )}
      <aside className={styles.preview} aria-label="Prévia da página">
        <div className={styles.previewHeader}>
          <span>PRÉVIA DA SUA PÁGINA</span>
          {themeButtons}
        </div>
        <div className={styles.previewAddress}>/{selected.username}</div>
        {!open && renderProfile()}
        <p className={styles.previewHint}>
          {values
            ? "Veja suas alterações antes de salvar na página."
            : "Esta é a aparência dos links publicados."}
        </p>
      </aside>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.overlay} />
          <Dialog.Content className={styles.previewDialog}>
            <Dialog.Close asChild>
              <button
                type="button"
                className={styles.dialogClose}
                aria-label="Fechar prévia"
              >
                <X size={20} />
              </button>
            </Dialog.Close>
            <Dialog.Title>Prévia da página</Dialog.Title>
            <Dialog.Description>
              {values
                ? "Estas alterações aparecem na sua página depois de salvar."
                : "Esta é a aparência dos links publicados."}
            </Dialog.Description>
            <div className={styles.previewHeader}>
              <span>/{selected.username}</span>
              {themeButtons}
            </div>
            {renderProfile()}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

export function PageCollection() {
  const { pages, selected, limit, selectPage, openCreate, drafts, clearDraft } =
    usePageWorkspace();
  const remove = useMutation(api.lib.subAccounts.deleteSubAccount);
  const [deleting, setDeleting] = useState<WorkspacePage | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function deletePage(event: React.FormEvent) {
    event.preventDefault();
    if (!deleting?.subAccountId || confirmation !== deleting.username || busy)
      return;
    setBusy(true);
    setError("");
    try {
      // Change selection before the catalog invalidates this page.
      const main = pages.find((page) => page.isMain);
      if (main && selected?.userId === deleting.userId)
        selectPage(main.userId, "/dashboard/settings");
      await remove({
        subAccountId: deleting.subAccountId as Id<"subAccounts">,
      });
      clearDraft(deleting.userId);
      setDeleting(null);
      toast.success("Página adicional excluída.");
    } catch (err) {
      setError(editorError(err));
      toast.error(editorError(err));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className={styles.collection} aria-labelledby="pages-title">
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.eyebrow}>CADA MARCA, UM ESPAÇO</p>
          <h2 id="pages-title">Suas páginas</h2>
          <p>Identidades independentes, organizadas na mesma conta.</p>
        </div>
        <span className={styles.count}>
          {pages.filter((page) => !page.isMain).length} adicionais · limite do
          plano: {limit}
        </span>
      </div>
      <div className={styles.pageCards}>
        {pages.map((page) => (
          <div
            key={page.userId}
            className={`${styles.pageCard} ${selected?.userId === page.userId ? styles.currentPageCard : ""}`}
          >
            <div
              className={styles.pageCardCover}
              style={{ background: page.accentColor }}
            />
            <div className={styles.pageCardBody}>
              <span className={styles.pageCardType}>
                {page.isMain ? "Página principal" : "Página adicional"}
              </span>
              <h3>{page.displayName}</h3>
              <p>/{page.username}</p>
              {drafts[page.userId] &&
                JSON.stringify(drafts[page.userId].values) !==
                  JSON.stringify(drafts[page.userId].base) && (
                  <small>Rascunho não salvo</small>
                )}
              <div>
                <button
                  type="button"
                  onClick={() => selectPage(page.userId, "/dashboard/settings")}
                >
                  Personalizar
                </button>
                <button
                  type="button"
                  onClick={() => selectPage(page.userId, "/dashboard/links")}
                >
                  Editar links
                </button>
              </div>
              {!page.isMain && (
                <details className={styles.pageOptions}>
                  <summary>Mais opções</summary>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleting(page);
                      setConfirmation("");
                      setError("");
                    }}
                  >
                    Excluir esta página
                  </button>
                </details>
              )}
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={openCreate}
          className={styles.newPageCard}
        >
          <span>
            <Plus size={23} />
          </span>
          <strong>Outra marca? Outro espaço.</strong>
          <p>Crie uma página com suas próprias cores e links.</p>
          <span className={styles.textLink}>
            {limit ? "Criar nova página" : "Conhecer páginas adicionais"}
            <ArrowUpRight size={14} />
          </span>
        </button>
      </div>
      <Dialog.Root
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open && !busy) setDeleting(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className={styles.overlay} />
          <Dialog.Content className={styles.smallDialog}>
            <Dialog.Title>Excluir {deleting?.displayName}?</Dialog.Title>
            <Dialog.Description>
              A página adicional e seus links serão removidos. Essa ação não
              pode ser desfeita. As outras páginas da conta continuam
              disponíveis.
            </Dialog.Description>
            <form onSubmit={deletePage} className={styles.formStack}>
              <label className={styles.field}>
                Digite {deleting?.username} para confirmar
                <input
                  autoFocus
                  value={confirmation}
                  disabled={busy}
                  onChange={(event) => setConfirmation(event.target.value)}
                  autoComplete="off"
                />
              </label>
              {error && (
                <p role="alert" className={styles.error}>
                  {error}
                </p>
              )}
              <div className={styles.dialogActions}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  disabled={busy}
                  onClick={() => setDeleting(null)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.dangerButton}
                  disabled={busy || confirmation !== deleting?.username}
                >
                  {busy ? "Excluindo…" : "Excluir página e links"}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}
