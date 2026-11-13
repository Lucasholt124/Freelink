"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Eye,
  HelpCircle,
  ImageIcon,
  Loader2,
  Megaphone,
  MousePointerClick,
  Pause,
  Play,
  Plus,
  Search,
  Trash2,
  Video,
  X,
} from "lucide-react";
import { toast } from "sonner";
import CampaignComposer from "./CampaignComposer";
import AdPreview from "./AdPreview";
import {
  adCategory,
  adCategories,
  adDate,
  adDestination,
  adHost,
  adNumber,
  adPlanLimits,
  adProgress,
  adTotals,
  adViews,
  campaignState,
  filterCampaigns,
  type AdCampaign,
  type AdPlan,
  type CreateAdInput,
  type UploadProgress,
} from "@/lib/ads";
import styles from "./ads.module.css";

export type AdsWorkspaceProps = {
  plan: AdPlan;
  pages?: { username: string; niche: string }[];
  onPageCategory?: (username: string, niche: string) => Promise<void>;
  onCampaignCategory?: (id: string, niche: string) => Promise<void>;
  campaigns: AdCampaign[];
  loading: boolean;
  connectionError?: boolean;
  onCreate: (
    input: CreateAdInput,
    onProgress: (progress: UploadProgress) => void,
  ) => Promise<void>;
  onResetDraft?: () => void;
  onToggle: (id: string, status: "active" | "paused") => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};
const states = {
  active: "Ativa",
  paused: "Pausada",
  limit: "Limite do mês atingido",
  ready: "Pode reativar",
  completed: "Encerrada",
};

export default function AdsWorkspace({
  plan,
  pages,
  onPageCategory,
  onCampaignCategory,
  campaigns,
  loading,
  connectionError,
  onCreate,
  onResetDraft,
  onToggle,
  onDelete,
}: AdsWorkspaceProps) {
  const [composerOpen, setComposerOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "paused" | "limit">(
    "all",
  );
  const [modal, setModal] = useState<{
    type: "preview" | "delete";
    id: string;
  } | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const busy = useRef(false);
  const totals = adTotals(campaigns);
  const limits = adPlanLimits[plan];
  const atLimit = campaigns.length >= limits.campaigns;
  const visible = filterCampaigns(campaigns, search, filter);
  const selected = campaigns.find((campaign) => campaign._id === modal?.id);
  async function toggle(campaign: AdCampaign) {
    if (busy.current) return;
    busy.current = true;
    setPending(campaign._id);
    const status = campaignState(campaign) === "active" ? "paused" : "active";
    try {
      await onToggle(campaign._id, status);
      toast.success(
        status === "paused" ? "Campanha pausada." : "Campanha ativada.",
      );
    } catch {
      toast.error("Não foi possível alterar a campanha. Tente novamente.");
    } finally {
      busy.current = false;
      setPending(null);
    }
  }
  async function remove() {
    if (!selected || busy.current) return;
    busy.current = true;
    setPending(selected._id);
    try {
      await onDelete(selected._id);
      setModal(null);
      toast.success("Campanha excluída.");
    } catch {
      toast.error("Não foi possível excluir a campanha. Tente novamente.");
    } finally {
      busy.current = false;
      setPending(null);
    }
  }
  return (
    <div className={styles.workspace}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <span className={styles.headerIcon}>
            <Megaphone size={21} aria-hidden="true" />
          </span>
          <div>
            <div className={styles.titleLine}>
              <h1>Hub de anúncios</h1>
              <span className={styles.plan}>
                {plan === "ultra" ? "Ultra" : "Pro"}
              </span>
            </div>
            <p>Sua marca em novos caminhos.</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <Link href="/dashboard/help#help-anuncios" className={styles.help}>
            <HelpCircle size={16} aria-hidden="true" />
            Ajuda
          </Link>
          <button
            className={styles.primary}
            disabled={loading || connectionError || pending !== null || atLimit}
            onClick={() => setComposerOpen(true)}
          >
            <Plus size={16} aria-hidden="true" />
            {dirty ? "Continuar rascunho" : "Nova campanha"}
          </button>
        </div>
      </header>
      {loading ? (
        <div className={styles.loading} role="status">
          <Loader2 size={25} className={styles.spinner} aria-hidden="true" />
          <h2>Preparando suas campanhas</h2>
          <p>Carregando anúncios e resultados.</p>
        </div>
      ) : connectionError ? (
        <div className={styles.loading}>
          <HelpCircle size={28} aria-hidden="true" />
          <h2>Vamos reconectar seu painel</h2>
          <p>
            Não foi possível conectar à sua conta. Recarregue para tentar
            novamente.
          </p>
          <button
            className={styles.primary}
            onClick={() => window.location.reload()}
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <>
          {campaigns.length > 0 && (
            <section
              className={styles.stats}
              aria-label="Resultados das campanhas"
            >
              <div>
                <span>
                  <Eye size={19} aria-hidden="true" />
                </span>
                <div>
                  <p>Exibições do mês</p>
                  <strong>{adNumber(totals.views)}</strong>
                  <small>Novas exibições verificadas na tela</small>
                </div>
              </div>
              <div>
                <span>
                  <MousePointerClick size={19} aria-hidden="true" />
                </span>
                <div>
                  <p>Cliques acumulados</p>
                  <strong>{adNumber(totals.clicks)}</strong>
                  <small>Desde a criação das campanhas</small>
                </div>
              </div>
              <div>
                <span>
                  <Megaphone size={19} aria-hidden="true" />
                </span>
                <div>
                  <p>Campanhas ativas</p>
                  <strong>
                    {totals.active}
                    <em> / {limits.campaigns}</em>
                  </strong>
                  <small>A entrega depende de páginas elegíveis</small>
                </div>
              </div>
            </section>
          )}
          <section
            className={styles.planCard}
            aria-label="Limites do seu plano"
          >
            <div>
              <span className={styles.planDot} />
              <div>
                <strong>
                  Seu espaço no {plan === "ultra" ? "Ultra" : "Pro"}
                </strong>
                <p>
                  {campaigns.length} de {limits.campaigns} campanhas cadastradas
                  · Até {limits.media} mídias por campanha
                </p>
              </div>
            </div>
            <span>
              Até {adNumber(limits.viewsPerCampaign)} exibições / mês por
              campanha
            </span>
          </section>
          <section
            className={styles.protection}
            aria-label="Proteção entre negócios"
          >
            <div className={styles.protectionHeader}>
              <span className={styles.protectionIcon}>
                <CheckCircle2 size={21} aria-hidden="true" />
              </span>
              <div>
                <span className={styles.eyebrow}>DISTRIBUIÇÃO COM CUIDADO</span>
                <h2>Mais alcance. Respeito à sua marca.</h2>
              </div>
              <span className={styles.protectionBadge}>
                Proteção automática
              </span>
            </div>
            <p>
              Bloqueamos anúncios do mesmo segmento, de segmentos relacionados e
              da própria conta. Você confirma o que vende; a rede cuida da
              distribuição.
            </p>
            <div className={styles.protectionFacts}>
              <div>
                <strong>Sem segmento, sem anúncio</strong>
                <span>
                  Se não houver uma combinação segura, o espaço fica livre.
                </span>
              </div>
              <div>
                <strong>Exibição com critério</strong>
                <span>
                  Novas exibições contam após 1 segundo com pelo menos metade do
                  anúncio na tela.
                </span>
              </div>
              <div>
                <strong>Menos repetição</strong>
                <span>
                  Uma oportunidade de anúncio por página e sessão a cada 30
                  minutos.
                </span>
              </div>
            </div>
            {((pages?.length || 0) > 0 || campaigns.length > 0) && (
              <details className={styles.segmentDetails}>
                <summary>
                  Conferir segmentos das minhas páginas e campanhas
                </summary>
                <p>
                  Use o segmento principal. O texto do perfil e do anúncio
                  também ajuda a identificar atividades relacionadas. Estas
                  regras reduzem conflitos; não identificam todos os
                  concorrentes.
                </p>
                {pages?.map((page) => (
                  <CategorySetting
                    key={page.username}
                    label={`Página /${page.username}`}
                    value={page.niche}
                    onChange={
                      onPageCategory
                        ? (niche) => onPageCategory(page.username, niche)
                        : undefined
                    }
                  />
                ))}
                {campaigns.map((campaign) => (
                  <CategorySetting
                    key={campaign._id}
                    label={`Campanha: ${campaign.title}`}
                    value={campaign.niche || "geral"}
                    onChange={
                      onCampaignCategory
                        ? (niche) => onCampaignCategory(campaign._id, niche)
                        : undefined
                    }
                  />
                ))}
              </details>
            )}
          </section>
          {atLimit && (
            <div className={styles.limitNotice} role="note">
              <div>
                <strong>Seu espaço de campanhas está completo.</strong>
                <p>
                  Campanhas pausadas também ocupam espaço. Para criar outra,
                  exclua uma campanha que não quer mais manter.
                </p>
              </div>
              {plan === "pro" && (
                <Link href="/dashboard/billing">
                  Conhecer o Ultra
                  <ArrowUpRight size={14} aria-hidden="true" />
                </Link>
              )}
            </div>
          )}
          {campaigns.length === 0 ? (
            <section className={styles.welcome}>
              <span className={styles.welcomeIcon}>
                <Megaphone size={37} aria-hidden="true" />
              </span>
              <span className={styles.eyebrow}>
                MAIS PESSOAS PODEM CONHECER SUA MARCA
              </span>
              <h2>
                Um novo lugar
                <br />
                para o seu próximo anúncio.
              </h2>
              <p>
                Apresente seu produto ou serviço em outras páginas da rede
                Freelinnk. Você prepara a campanha e acompanha as exibições e os
                cliques por aqui.
              </p>
              <button
                className={styles.primary}
                onClick={() => setComposerOpen(true)}
              >
                <Plus size={16} aria-hidden="true" />
                Criar minha primeira campanha
              </button>
              <ol className={styles.steps}>
                <li>
                  <span>01</span>
                  <strong>Prepare</strong>
                  <p>Adicione a mensagem, o destino e as mídias.</p>
                </li>
                <li>
                  <span>02</span>
                  <strong>Revise</strong>
                  <p>Veja a prévia antes de publicar.</p>
                </li>
                <li>
                  <span>03</span>
                  <strong>Acompanhe</strong>
                  <p>Consulte resultados e controle a campanha.</p>
                </li>
              </ol>
            </section>
          ) : (
            <section
              className={styles.campaignSection}
              aria-labelledby="campaigns-title"
            >
              <div className={styles.sectionTitle}>
                <div>
                  <h2 id="campaigns-title">Suas campanhas</h2>
                  <p>Veja o desempenho e decida o próximo passo.</p>
                </div>
                <span>
                  {campaigns.length}{" "}
                  {campaigns.length === 1 ? "campanha" : "campanhas"}
                </span>
              </div>
              <div className={styles.filters}>
                <div className={styles.search}>
                  <Search size={16} aria-hidden="true" />
                  <input
                    aria-label="Buscar campanhas"
                    placeholder="Buscar por nome ou categoria"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                  {search && (
                    <button
                      aria-label="Limpar busca de campanhas"
                      onClick={() => setSearch("")}
                    >
                      <X size={14} aria-hidden="true" />
                    </button>
                  )}
                </div>
                <div
                  className={styles.filterTabs}
                  role="group"
                  aria-label="Filtrar campanhas por status"
                >
                  {(
                    [
                      ["all", "Todas"],
                      ["active", "Ativas"],
                      ["paused", "Pausadas"],
                      ["limit", "Limite atingido"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      aria-pressed={filter === value}
                      onClick={() => setFilter(value)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {visible.length === 0 ? (
                <div className={styles.noResults}>
                  <Search size={25} aria-hidden="true" />
                  <h3>Nenhuma campanha encontrada.</h3>
                  <p>Tente outro nome, categoria ou status.</p>
                  <button
                    className={styles.secondary}
                    onClick={() => {
                      setSearch("");
                      setFilter("all");
                    }}
                  >
                    Limpar filtros
                  </button>
                </div>
              ) : (
                <div className={styles.campaignGrid}>
                  {visible.map((campaign) => {
                    const state = campaignState(campaign),
                      progress = adProgress(campaign);
                    return (
                      <article
                        key={campaign._id}
                        className={styles.campaignCard}
                        aria-label={`Campanha ${campaign.title}`}
                      >
                        <button
                          className={styles.cardMedia}
                          onClick={() =>
                            setModal({ type: "preview", id: campaign._id })
                          }
                          aria-label={`Ver prévia de ${campaign.title}`}
                        >
                          {campaign.mediaUrls[0] &&
                          campaign.mediaTypes?.[0] !== "video" ? (
                            <img
                              src={campaign.mediaUrls[0]}
                              alt=""
                              loading="lazy"
                            />
                          ) : (
                            <span>
                              {campaign.mediaTypes?.[0] === "video" ? (
                                <Video size={27} aria-hidden="true" />
                              ) : (
                                <ImageIcon size={27} aria-hidden="true" />
                              )}
                              <small>
                                {campaign.mediaTypes?.[0] === "video"
                                  ? "Vídeo da campanha"
                                  : "Prévia da campanha"}
                              </small>
                            </span>
                          )}
                          <span className={styles.mediaCount}>
                            <Eye size={12} aria-hidden="true" />
                            {campaign.mediaUrls.length}{" "}
                            {campaign.mediaUrls.length === 1
                              ? "mídia"
                              : "mídias"}
                          </span>
                        </button>
                        <div className={styles.cardBody}>
                          <div className={styles.cardBadges}>
                            <span
                              className={`${styles.status} ${styles[state]}`}
                            >
                              <i />
                              {state === "active" &&
                              (!campaign.niche || campaign.niche === "geral")
                                ? "Confirme o segmento"
                                : states[state]}
                            </span>
                            <span className={styles.category}>
                              {adCategory(campaign.niche)}
                            </span>
                          </div>
                          <h3>{campaign.title}</h3>
                          <p className={styles.created}>
                            Criada em {adDate(campaign.createdAt)}
                          </p>
                          <p className={styles.adText}>{campaign.adText}</p>
                          <span className={styles.destination}>
                            {adHost(campaign.productLink)}
                          </span>
                          <dl className={styles.cardStats}>
                            <div>
                              <dt>Exibições do mês</dt>
                              <dd>{adNumber(adViews(campaign))}</dd>
                            </div>
                            <div>
                              <dt>Cliques acumulados</dt>
                              <dd>{adNumber(campaign.clicks)}</dd>
                            </div>
                          </dl>
                          <div className={styles.progressLabel}>
                            <span>
                              {adNumber(adViews(campaign))} de{" "}
                              {adNumber(campaign.maxViewsLimit)} exibições
                            </span>
                            <span>{Math.round(progress)}%</span>
                          </div>
                          <div
                            className={styles.progressTrack}
                            role="progressbar"
                            aria-label={`Uso mensal de ${campaign.title}`}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={Math.round(progress)}
                          >
                            <span style={{ width: `${progress}%` }} />
                          </div>
                          {state === "ready" && (
                            <p className={styles.renewed}>
                              Um novo mês começou. Você pode reativar esta
                              campanha.
                            </p>
                          )}
                          {state === "limit" && (
                            <p className={styles.renewed}>
                              O limite desta campanha foi atingido neste mês.
                            </p>
                          )}
                          <div className={styles.cardActions}>
                            <button
                              className={styles.secondary}
                              onClick={() => toggle(campaign)}
                              disabled={pending !== null || state === "limit"}
                              aria-label={`${state === "active" ? "Pausar" : "Ativar"} campanha ${campaign.title}`}
                            >
                              {pending === campaign._id ? (
                                <Loader2
                                  size={14}
                                  className={styles.spinner}
                                  aria-hidden="true"
                                />
                              ) : state === "active" ? (
                                <Pause size={14} aria-hidden="true" />
                              ) : (
                                <Play size={14} aria-hidden="true" />
                              )}
                              {state === "active"
                                ? "Pausar"
                                : state === "ready"
                                  ? "Reativar"
                                  : "Ativar"}
                            </button>
                            <button
                              className={styles.secondary}
                              onClick={() =>
                                setModal({ type: "preview", id: campaign._id })
                              }
                            >
                              <Eye size={14} aria-hidden="true" />
                              Ver anúncio
                            </button>
                            <button
                              className={styles.deleteIcon}
                              aria-label={`Excluir campanha ${campaign.title}`}
                              onClick={() =>
                                setModal({ type: "delete", id: campaign._id })
                              }
                              disabled={pending !== null}
                            >
                              <Trash2 size={15} aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
              <p className={styles.metricsNote}>
                Exibições são mensais; cliques são acumulados desde a criação. O
                histórico anterior à atualização mantém a contagem original. Os
                dois indicadores têm períodos diferentes.
              </p>
            </section>
          )}
        </>
      )}
      <CampaignComposer
        open={composerOpen}
        onOpenChange={setComposerOpen}
        plan={plan}
        onCreate={onCreate}
        onResetDraft={onResetDraft}
        onDraftChange={setDirty}
        atLimit={atLimit}
      />
      <Dialog.Root
        open={modal !== null && !!selected}
        onOpenChange={(open) => {
          if (!open && !pending) setModal(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className={styles.overlay} />
          <Dialog.Content
            className={`${styles.dialog} ${modal?.type === "preview" ? styles.previewDialog : styles.confirmDialog}`}
          >
            <Dialog.Close
              disabled={!!pending}
              className={styles.close}
              aria-label="Fechar janela de campanha"
            >
              <X size={18} aria-hidden="true" />
            </Dialog.Close>
            {modal?.type === "preview" && selected ? (
              <>
                <Dialog.Title className={styles.dialogTitle}>
                  Seu anúncio, de perto
                </Dialog.Title>
                <Dialog.Description className={styles.dialogDescription}>
                  Confira as mídias, a mensagem e o destino desta campanha.
                </Dialog.Description>
                <AdPreview
                  title={selected.title}
                  text={selected.adText}
                  link={selected.productLink}
                  media={selected.mediaUrls.map((url, index) => ({
                    url,
                    type:
                      selected.mediaTypes?.[index] === "video"
                        ? "video"
                        : "image",
                  }))}
                />
                {adDestination(selected.productLink) && (
                  <a
                    className={styles.secondary}
                    href={adDestination(selected.productLink)!}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Abrir destino
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                )}
              </>
            ) : (
              <>
                <span className={styles.confirmIcon}>
                  <Trash2 size={24} aria-hidden="true" />
                </span>
                <Dialog.Title className={styles.dialogTitle}>
                  Excluir esta campanha?
                </Dialog.Title>
                <Dialog.Description className={styles.dialogDescription}>
                  “{selected?.title}” e o histórico de resultados desta campanha
                  serão removidos. Esta ação não pode ser desfeita.
                </Dialog.Description>
                <div className={styles.confirmActions}>
                  <Dialog.Close
                    className={styles.secondary}
                    disabled={!!pending}
                  >
                    Manter campanha
                  </Dialog.Close>
                  <button
                    className={styles.danger}
                    disabled={!!pending}
                    onClick={remove}
                  >
                    {pending ? (
                      <Loader2
                        size={15}
                        className={styles.spinner}
                        aria-hidden="true"
                      />
                    ) : (
                      <Trash2 size={15} aria-hidden="true" />
                    )}
                    {pending ? "Excluindo…" : "Excluir campanha"}
                  </button>
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

function CategorySetting({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange?: (niche: string) => Promise<void>;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const busy = useRef(false);
  const id = `segment-${label}`;
  return (
    <div className={styles.segmentRow}>
      <label htmlFor={id}>
        {label}
        <small>
          {value === "geral"
            ? "Confirme para liberar a distribuição."
            : "Segmento usado na proteção da rede."}
        </small>
      </label>
      <div>
        <select
          id={id}
          value={value}
          disabled={!onChange || pending}
          aria-busy={pending}
          onChange={async (event) => {
            if (!onChange || busy.current) return;
            busy.current = true;
            setPending(true);
            setError("");
            try {
              await onChange(event.target.value);
              toast.success("Segmento atualizado.");
            } catch {
              setError("Não foi possível salvar. Tente novamente.");
            } finally {
              busy.current = false;
              setPending(false);
            }
          }}
        >
          {adCategories.map(([id, title]) => (
            <option key={id} value={id} disabled={id === "geral"}>
              {title}
            </option>
          ))}
        </select>
        {pending && <small role="status">Salvando segmento…</small>}
        {error && <small role="alert">{error}</small>}
      </div>
    </div>
  );
}
