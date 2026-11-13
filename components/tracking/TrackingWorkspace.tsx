"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowUpRight,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Globe,
  HelpCircle,
  Info,
  Loader2,
  Save,
  Target,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  removedTracking,
  sameTracking,
  syncTrackingDraft,
  trackingChanged,
  trackingErrors,
  trackingFieldStatus,
  trackingPlatforms,
  trackingValues,
  type TrackingDraft,
  type TrackingField,
  type TrackingPage,
  type TrackingValues,
} from "@/lib/tracking";
import styles from "./tracking.module.css";
import { accentText } from "@/lib/public-profile";

export type TrackingWorkspaceProps = {
  pages: TrackingPage[];
  selectedId: string;
  onSelect: (id: string) => void;
  settings: Partial<TrackingValues> | null | undefined;
  loading: boolean;
  loadError?: boolean;
  onSave: (id: string, values: TrackingValues) => Promise<void>;
};
const fields = ["facebookPixelId", "googleAnalyticsId"] as const;
const statusLabels = {
  saved: "ID salvo",
  pending: "Alteração pendente",
  remove: "Remoção pendente",
  invalid: "Revise o formato",
  empty: "Não configurado",
};

export default function TrackingWorkspace({
  pages,
  selectedId,
  onSelect,
  settings,
  loading,
  loadError,
  onSave,
}: TrackingWorkspaceProps) {
  const page = pages.find((item) => item.id === selectedId);
  const [drafts, setDrafts] = useState<Record<string, TrackingDraft>>({});
  const [touched, setTouched] = useState<
    Record<string, Partial<Record<TrackingField, boolean>>>
  >({});
  const [attempted, setAttempted] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [saveErrors, setSaveErrors] = useState<Record<string, string>>({});
  const [confirmation, setConfirmation] = useState<{
    id: string;
    name: string;
    values: TrackingValues;
    fields: TrackingField[];
  } | null>(null);
  const busy = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const savedValues = trackingValues(settings);
  const signature = JSON.stringify(savedValues);
  useEffect(() => {
    if (settings === undefined || !selectedId) return;
    setDrafts((current) => {
      const incoming = trackingValues(settings),
        previous = current[selectedId];
      const next = syncTrackingDraft(previous, incoming);
      if (
        previous &&
        sameTracking(previous.base, next.base) &&
        sameTracking(previous.values, next.values) &&
        JSON.stringify(previous.remote) === JSON.stringify(next.remote)
      )
        return current;
      return { ...current, [selectedId]: next };
    });
  }, [selectedId, signature, settings === undefined]);
  const draft = drafts[selectedId] ?? {
    base: savedValues,
    values: savedValues,
  };
  const values = draft.values,
    errors = trackingErrors(values),
    dirty = trackingChanged(draft);
  const savedCount = fields.filter((field) => draft.base[field]).length;
  const pendingPages = Object.values(drafts).filter(trackingChanged).length;
  function setField(field: TrackingField, value: string) {
    setDrafts((current) => ({
      ...current,
      [selectedId]: {
        ...(current[selectedId] ?? { base: savedValues, values: savedValues }),
        values: {
          ...(current[selectedId]?.values ?? savedValues),
          [field]: value,
        },
      },
    }));
  }
  function blur(field: TrackingField) {
    setTouched((current) => ({
      ...current,
      [selectedId]: { ...current[selectedId], [field]: true },
    }));
    setField(field, trackingValues(values)[field]);
  }
  function revert() {
    setDrafts((current) => ({
      ...current,
      [selectedId]: { base: draft.base, values: draft.base },
    }));
    setTouched((current) => ({ ...current, [selectedId]: {} }));
    setAttempted((current) => ({ ...current, [selectedId]: false }));
    setSaveErrors((current) => ({ ...current, [selectedId]: "" }));
  }
  async function persist(id: string, name: string, nextValues: TrackingValues) {
    if (busy.current) return;
    busy.current = true;
    setSaving(true);
    setSaveErrors((current) => ({ ...current, [id]: "" }));
    try {
      const clean = trackingValues(nextValues);
      await onSave(id, clean);
      setDrafts((current) => ({
        ...current,
        [id]: { base: clean, values: clean },
      }));
      setAttempted((current) => ({ ...current, [id]: false }));
      setConfirmation(null);
      toast.success(
        `Configurações salvas em ${name}. Confira os eventos na plataforma conectada.`,
      );
    } catch {
      setSaveErrors((current) => ({
        ...current,
        [id]: "Não foi possível salvar. Suas alterações foram mantidas. Tente novamente.",
      }));
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }
  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!page || busy.current || !dirty || draft.remote) return;
    setAttempted((current) => ({ ...current, [selectedId]: true }));
    if (Object.keys(errors).length) {
      requestAnimationFrame(() =>
        formRef.current
          ?.querySelector<HTMLInputElement>('[aria-invalid="true"]')
          ?.focus(),
      );
      return;
    }
    const removed = removedTracking(draft.base, values),
      clean = trackingValues(values);
    if (removed.length) {
      setConfirmation({
        id: page.id,
        name: page.name,
        values: clean,
        fields: removed,
      });
      return;
    }
    void persist(page.id, page.name, clean);
  }
  function resolveConflict(useSaved: boolean) {
    if (!draft.remote) return;
    const incoming = draft.remote;
    setDrafts((current) => ({
      ...current,
      [selectedId]: {
        base: incoming,
        values: useSaved ? incoming : draft.values,
      },
    }));
  }

  return (
    <div className={styles.workspace}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <span className={styles.headerIcon}>
            <Target size={21} aria-hidden="true" />
          </span>
          <div>
            <div className={styles.titleLine}>
              <h1>Pixel e Analytics</h1>
              <span className={styles.plan}>Ultra</span>
            </div>
            <p>Conecte os acessos à sua próxima decisão.</p>
          </div>
        </div>
        <Link className={styles.help} href="/dashboard/help#help-ferramentas">
          <HelpCircle size={16} aria-hidden="true" />
          Ajuda
        </Link>
      </header>
      {page && (
        <section
          className={styles.pageSelector}
          aria-label="Página que recebe as integrações"
        >
          <span
            className={styles.monogram}
            style={{ background: page.color, color: accentText(page.color) }}
          >
            {page.name.trim().slice(0, 1).toLocaleUpperCase("pt-BR") || "F"}
          </span>
          <div>
            <label htmlFor="tracking-page">Configurando a página</label>
            <select
              id="tracking-page"
              aria-label="Página de rastreamento"
              value={selectedId}
              disabled={saving}
              onChange={(event) => {
                setConfirmation(null);
                onSelect(event.target.value);
              }}
            >
              {pages.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                  {item.isMain ? " · Principal" : ""}
                  {drafts[item.id] && trackingChanged(drafts[item.id])
                    ? " · Alterações pendentes"
                    : ""}
                </option>
              ))}
            </select>
            <span>/{page.username}</span>
          </div>
          <a
            className={styles.secondary}
            href={`/${encodeURIComponent(page.username)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver página
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </section>
      )}
      {loading ? (
        <div className={styles.loading} role="status">
          <Loader2 size={25} className={styles.spinner} aria-hidden="true" />
          <h2>Preparando suas integrações</h2>
          <p>Carregando os IDs desta página.</p>
        </div>
      ) : loadError || !page ? (
        <div className={styles.loading} role="alert">
          <HelpCircle size={28} aria-hidden="true" />
          <h2>Vamos tentar conectar novamente</h2>
          <p>Não foi possível carregar as configurações desta página.</p>
          <button
            className={styles.primary}
            onClick={() => window.location.reload()}
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <>
          <section className={styles.intro}>
            <div>
              <span className={styles.eyebrow}>
                SUA PÁGINA + SUAS FERRAMENTAS
              </span>
              <h2>
                Conecte sua página.
                <br />
                Entenda melhor seus acessos.
              </h2>
              <p>
                Informe os IDs da sua marca para conectar a página ao Meta Pixel
                e ao Google Analytics 4.
              </p>
            </div>
            <div className={styles.savedSummary}>
              <span>
                <CheckCircle2 size={20} aria-hidden="true" />
              </span>
              <strong>{savedCount} de 2</strong>
              <p>integrações com ID salvo</p>
              <small>Você pode usar uma ou as duas.</small>
            </div>
          </section>
          <form ref={formRef} onSubmit={submit} noValidate>
            {draft.remote && (
              <div className={styles.conflict} role="alert">
                <strong>
                  Os IDs salvos desta página foram alterados em outra sessão.
                </strong>
                <p>
                  Suas edições foram mantidas. Escolha a versão que quer usar
                  antes de salvar.
                </p>
                <div>
                  <button
                    type="button"
                    className={styles.secondary}
                    disabled={saving}
                    onClick={() => resolveConflict(true)}
                  >
                    Carregar versão salva
                  </button>
                  <button
                    type="button"
                    className={styles.secondary}
                    disabled={saving}
                    onClick={() => resolveConflict(false)}
                  >
                    Manter minhas alterações
                  </button>
                </div>
              </div>
            )}
            <div className={styles.integrations}>
              {fields.map((field) => {
                const platform = trackingPlatforms[field],
                  state = trackingFieldStatus(draft, field);
                const showError =
                  !!errors[field] &&
                  (attempted[selectedId] ||
                    touched[selectedId]?.[field] ||
                    (!dirty && !!draft.base[field]));
                return (
                  <section
                    className={styles.integration}
                    key={field}
                    aria-labelledby={`${field}-heading`}
                  >
                    <div className={styles.integrationHeader}>
                      <span
                        className={`${styles.platformIcon} ${field === "facebookPixelId" ? styles.meta : styles.google}`}
                      >
                        {field === "facebookPixelId" ? (
                          <span aria-hidden="true">M</span>
                        ) : (
                          <BarChart3 size={22} aria-hidden="true" />
                        )}
                      </span>
                      <div>
                        <span className={styles.platformEyebrow}>
                          {field === "facebookPixelId"
                            ? "FACEBOOK E INSTAGRAM"
                            : "TRÁFEGO DA SUA PÁGINA"}
                        </span>
                        <h3 id={`${field}-heading`}>{platform.name}</h3>
                      </div>
                      <span className={`${styles.status} ${styles[state]}`}>
                        {statusLabels[state]}
                      </span>
                    </div>
                    <p className={styles.description}>{platform.description}</p>
                    <div className={styles.field}>
                      <label htmlFor={field}>{platform.label}</label>
                      <input
                        id={field}
                        value={values[field]}
                        onChange={(event) =>
                          setField(field, event.target.value)
                        }
                        onBlur={() => blur(field)}
                        inputMode={
                          field === "facebookPixelId" ? "numeric" : "text"
                        }
                        autoCapitalize={
                          field === "googleAnalyticsId" ? "characters" : "none"
                        }
                        autoCorrect="off"
                        spellCheck={false}
                        autoComplete="off"
                        maxLength={field === "facebookPixelId" ? 32 : 40}
                        placeholder={platform.placeholder}
                        disabled={saving}
                        aria-invalid={showError}
                        aria-describedby={
                          showError ? `${field}-error` : `${field}-hint`
                        }
                      />
                      {showError ? (
                        <p className={styles.fieldError} id={`${field}-error`}>
                          {errors[field]}
                        </p>
                      ) : (
                        <p className={styles.hint} id={`${field}-hint`}>
                          {field === "facebookPixelId"
                            ? "Cole o ID numérico, sem o código de instalação."
                            : "Use o ID do fluxo da Web do GA4 que começa com G-."}
                        </p>
                      )}
                      <div className={styles.fieldActions}>
                        <span className={styles.format}>
                          {values[field].trim() && !errors[field] ? (
                            <>
                              <Check size={12} aria-hidden="true" />
                              Formato reconhecido
                            </>
                          ) : (
                            "Cada página usa os próprios identificadores."
                          )}
                        </span>
                        {values[field] && (
                          <button
                            type="button"
                            className={styles.textButton}
                            disabled={saving}
                            onClick={() => setField(field, "")}
                          >
                            <Trash2 size={12} aria-hidden="true" />
                            Remover ID
                          </button>
                        )}
                      </div>
                    </div>
                    <details className={styles.guide}>
                      <summary>
                        Onde encontro este ID?
                        <ChevronDown size={14} aria-hidden="true" />
                      </summary>
                      {field === "facebookPixelId" ? (
                        <ol>
                          <li>Abra o Gerenciador de Eventos da Meta.</li>
                          <li>
                            Selecione o Pixel ou conjunto de dados da sua marca.
                          </li>
                          <li>Copie o ID numérico e cole no campo acima.</li>
                        </ol>
                      ) : (
                        <ol>
                          <li>
                            Abra o Google Analytics e escolha a propriedade da
                            marca.
                          </li>
                          <li>
                            Em Administrador, abra Fluxos de dados e selecione o
                            fluxo da Web.
                          </li>
                          <li>Copie o ID de medição que começa com G-.</li>
                        </ol>
                      )}
                      {field === "googleAnalyticsId" && (
                        <a
                          href="https://support.google.com/analytics/answer/9539598?hl=pt-BR"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Consultar o guia oficial do Google
                          <ArrowUpRight size={12} aria-hidden="true" />
                        </a>
                      )}
                    </details>
                    <a
                      className={styles.platformLink}
                      href={platform.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {platform.destination}
                      <ArrowUpRight size={14} aria-hidden="true" />
                    </a>
                  </section>
                );
              })}
            </div>
            {saveErrors[selectedId] && (
              <p className={styles.saveError} role="alert">
                {saveErrors[selectedId]}
              </p>
            )}
            <div className={styles.saveBar}>
              <div>
                <span
                  className={`${styles.saveDot} ${dirty ? styles.dirtyDot : ""}`}
                />
                <p>
                  {saving
                    ? "Salvando os IDs desta página…"
                    : dirty
                      ? `Alterações pendentes em ${page.name}.`
                      : "Os campos mostram a configuração salva desta página."}
                  <small>
                    {pendingPages > 1
                      ? `${pendingPages} páginas têm alterações pendentes nesta tela.`
                      : "Salvar o ID não confirma o recebimento de eventos."}
                  </small>
                </p>
              </div>
              <div className={styles.saveActions}>
                {dirty && (
                  <button
                    className={styles.secondary}
                    type="button"
                    disabled={saving || !!draft.remote}
                    onClick={revert}
                  >
                    Desfazer alterações
                  </button>
                )}
                <button
                  className={styles.primary}
                  type="submit"
                  disabled={saving || !dirty || !!draft.remote}
                >
                  {saving ? (
                    <Loader2
                      size={15}
                      className={styles.spinner}
                      aria-hidden="true"
                    />
                  ) : (
                    <Save size={15} aria-hidden="true" />
                  )}
                  {saving ? "Salvando…" : "Salvar configurações"}
                </button>
              </div>
            </div>
          </form>
          <section
            className={styles.verify}
            aria-labelledby="tracking-verify-title"
          >
            <div className={styles.verifyHeading}>
              <span>
                <Globe size={20} aria-hidden="true" />
              </span>
              <div>
                <span className={styles.eyebrow}>DEPOIS DE SALVAR</span>
                <h2 id="tracking-verify-title">
                  Confira se os acessos estão chegando.
                </h2>
              </div>
            </div>
            <ol className={styles.steps}>
              <li>
                <span>01</span>
                <div>
                  <h3>Abra sua página</h3>
                  <p>
                    Visite a página selecionada e permita o rastreamento no
                    aviso exibido ao visitante.
                  </p>
                  <a
                    href={`/${encodeURIComponent(page.username)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Abrir página
                    <ExternalLink size={12} aria-hidden="true" />
                  </a>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <h3>Confira na plataforma</h3>
                  <p>
                    Na Meta, veja os eventos da fonte de dados. No GA4, consulte
                    o relatório em tempo real.
                  </p>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <h3>Use os dados na análise</h3>
                  <p>
                    Os relatórios ficam na Meta e no Google Analytics, nas
                    contas que possuem esses IDs.
                  </p>
                </div>
              </li>
            </ol>
            <p className={styles.consent}>
              <Info size={14} aria-hidden="true" />
              As integrações da página são carregadas após o consentimento do
              visitante. O Freelinnk não valida aqui a chegada dos eventos à
              Meta ou ao Google.
            </p>
          </section>
        </>
      )}
      <Dialog.Root
        open={!!confirmation}
        onOpenChange={(open) => {
          if (!open && !saving) setConfirmation(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className={styles.overlay} />
          <Dialog.Content className={styles.dialog}>
            <Dialog.Close
              className={styles.close}
              disabled={saving}
              aria-label="Fechar confirmação de remoção"
            >
              <X size={18} aria-hidden="true" />
            </Dialog.Close>
            <span className={styles.dialogIcon}>
              <Trash2 size={23} aria-hidden="true" />
            </span>
            <Dialog.Title className={styles.dialogTitle}>
              Remover{" "}
              {confirmation?.fields.length === 1
                ? "esta integração"
                : "estas integrações"}{" "}
              da página?
            </Dialog.Title>
            <Dialog.Description className={styles.dialogDescription}>
              Os IDs abaixo deixarão de ser usados em {confirmation?.name}. As
              demais páginas da sua conta não serão alteradas.
            </Dialog.Description>
            <ul className={styles.removalList}>
              {confirmation?.fields.map((field) => (
                <li key={field}>{trackingPlatforms[field].name}</li>
              ))}
            </ul>
            <div className={styles.dialogActions}>
              <Dialog.Close className={styles.secondary} disabled={saving}>
                Voltar à edição
              </Dialog.Close>
              <button
                type="button"
                className={styles.danger}
                disabled={saving}
                onClick={() => {
                  if (confirmation)
                    void persist(
                      confirmation.id,
                      confirmation.name,
                      confirmation.values,
                    );
                }}
              >
                {saving ? (
                  <Loader2
                    size={15}
                    className={styles.spinner}
                    aria-hidden="true"
                  />
                ) : (
                  <Trash2 size={15} aria-hidden="true" />
                )}
                {saving ? "Salvando…" : "Confirmar remoção"}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
