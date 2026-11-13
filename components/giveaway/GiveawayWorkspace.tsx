"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  Gift,
  HelpCircle,
  Instagram,
  Link2,
  Loader2,
  MessageCircle,
  Plus,
  QrCode,
  Search,
  Share2,
  Square,
  Trash2,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  drawGiveaway,
  filterGiveaways,
  filterParticipants,
  giveawayDate,
  giveawayResultText,
  parseGiveawayResult,
  participantContact,
  resultStorageKey,
  type Giveaway,
  type GiveawayMethod,
  type GiveawayResult,
} from "@/lib/giveaway";
import styles from "./giveaway.module.css";

export type GiveawayWorkspaceProps = {
  userId: string;
  planLabel: "Pro" | "Ultra";
  loading: boolean;
  connectionError?: boolean;
  giveaways: Giveaway[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: (input: { title: string; method: GiveawayMethod }) => Promise<void>;
  onEnd: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};
type Modal = "create" | "close" | "delete" | "redraw" | null;

function downloadFile(contents: string, name: string) {
  const url = URL.createObjectURL(
    new Blob([contents], { type: "text/plain;charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function GiveawayWorkspace(props: GiveawayWorkspaceProps) {
  const { userId, giveaways, selectedId, onSelect, onCreate, onEnd, onDelete } =
    props;
  const current =
    giveaways.find((giveaway) => giveaway.id === selectedId) ?? null;
  const [filter, setFilter] = useState<"all" | "active" | "closed">("all");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<Modal>(null);
  const [title, setTitle] = useState("");
  const [method, setMethod] = useState<GiveawayMethod>("link");
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [origin, setOrigin] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [qrError, setQrError] = useState(false);
  const [qrAttempt, setQrAttempt] = useState(0);
  const [shareTab, setShareTab] = useState<"link" | "qrcode">("link");
  const [result, setResult] = useState<GiveawayResult | null>(null);
  const [resultSaved, setResultSaved] = useState(true);
  const [drawing, setDrawing] = useState(false);
  const [drawCount, setDrawCount] = useState(0);
  const drawRef = useRef(false);
  const drawTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedRef = useRef(selectedId);
  selectedRef.current = selectedId;
  const visibleGiveaways = filterGiveaways(giveaways, filter);
  const participants = current?.participants ?? [];
  const visibleParticipants = filterParticipants(participants, search);
  const shareUrl =
    current && origin
      ? `${origin}/giveaway/${encodeURIComponent(current.id)}`
      : "";

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);
  useEffect(() => {
    setSearch("");
    setShareTab(current?.method === "qrcode" ? "qrcode" : "link");
    setDrawing(false);
    drawRef.current = false;
    setResultSaved(true);
    if (drawTimer.current) clearTimeout(drawTimer.current);
    let saved: GiveawayResult | null = null;
    if (selectedId && userId) {
      try {
        saved = parseGiveawayResult(
          localStorage.getItem(resultStorageKey(userId, selectedId)),
          selectedId,
        );
      } catch {
        /* Storage may be unavailable. */
      }
    }
    setResult(saved);
    return () => {
      if (drawTimer.current) clearTimeout(drawTimer.current);
    };
  }, [selectedId, userId]); // Selection, not participant updates, defines the result being displayed.

  useEffect(() => {
    let cancelled = false;
    setQrCode("");
    setQrError(false);
    if (shareTab !== "qrcode" || !shareUrl) return;
    import("qrcode")
      .then((module) =>
        module.toDataURL(shareUrl, {
          width: 360,
          margin: 2,
          errorCorrectionLevel: "M",
          color: { dark: "#302537", light: "#ffffff" },
        }),
      )
      .then((data) => {
        if (!cancelled) setQrCode(data);
      })
      .catch(() => {
        if (!cancelled) setQrError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [shareUrl, shareTab, qrAttempt]);

  function newGiveaway() {
    setTitle("");
    setMethod("link");
    setModal("create");
  }
  async function copy(text: string, success: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(success);
    } catch {
      toast.error(
        "Não foi possível copiar. Você pode selecionar o link ou baixar o resultado.",
      );
    }
  }
  async function share() {
    if (!current || !shareUrl) return;
    if (!navigator.share)
      return copy(shareUrl, "Link copiado. Agora é só compartilhar!");
    try {
      await navigator.share({
        title: current.title,
        text: `Participe do sorteio: ${current.title}`,
        url: shareUrl,
      });
    } catch (error) {
      if (!(error instanceof Error && error.name === "AbortError"))
        toast.error("Não foi possível compartilhar. Tente copiar o link.");
    }
  }
  async function confirmAction(event?: React.FormEvent) {
    event?.preventDefault();
    if (busyRef.current || drawRef.current) return;
    if (modal === "create" && !title.trim()) return;
    busyRef.current = true;
    setBusy(true);
    try {
      if (modal === "create") {
        await onCreate({ title: title.trim(), method });
        setFilter("all");
        toast.success(
          "Sorteio criado. Compartilhe o convite para receber inscrições.",
        );
      }
      if (modal === "close" && current) {
        await onEnd(current.id);
        toast.success(
          "Inscrições encerradas. Você ainda pode realizar o sorteio.",
        );
      }
      if (modal === "delete" && current) {
        await onDelete(current.id);
        try {
          localStorage.removeItem(resultStorageKey(userId, current.id));
        } catch {
          /* Optional local cache. */
        }
        toast.success("Sorteio excluído.");
      }
      setModal(null);
    } catch {
      toast.error("Não foi possível concluir. Tente novamente.");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  function runDraw() {
    if (
      !current ||
      participants.length < 2 ||
      drawRef.current ||
      busyRef.current
    )
      return;
    let next: GiveawayResult;
    try {
      next = drawGiveaway(
        current,
        () => crypto.getRandomValues(new Uint32Array(1))[0],
      );
    } catch {
      toast.error(
        "Não foi possível iniciar o sorteio neste navegador. Tente novamente.",
      );
      return;
    }
    setModal(null);
    drawRef.current = true;
    setDrawing(true);
    setDrawCount(next.total);
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    drawTimer.current = setTimeout(
      () => {
        if (selectedRef.current !== next.giveawayId) return;
        setResult(next);
        let saved = true;
        try {
          localStorage.setItem(
            resultStorageKey(userId, next.giveawayId),
            JSON.stringify(next),
          );
        } catch {
          saved = false;
        }
        setResultSaved(saved);
        setDrawing(false);
        drawRef.current = false;
        toast.success("Resultado pronto!");
      },
      reducedMotion ? 0 : 1600,
    );
  }
  const pending = busy || drawing;

  return (
    <div className={styles.workspace}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <span className={styles.headerIcon}>
            <Gift size={21} aria-hidden="true" />
          </span>
          <div>
            <div className={styles.titleLine}>
              <h1>Sorteios</h1>
              <span className={styles.plan}>{props.planLabel}</span>
            </div>
            <p>Um convite para aproximar seu público.</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <Link href="/dashboard/help#help-ferramentas" className={styles.help}>
            <HelpCircle size={16} aria-hidden="true" />
            Ajuda
          </Link>
          <button
            className={styles.primary}
            onClick={newGiveaway}
            disabled={pending || props.loading || props.connectionError}
          >
            <Plus size={16} aria-hidden="true" />
            Novo sorteio
          </button>
        </div>
      </header>
      {props.loading ? (
        <div className={styles.loading} role="status">
          <Loader2 size={25} className={styles.spinner} aria-hidden="true" />
          <h2>Preparando seus sorteios</h2>
          <p>Carregando o histórico e as inscrições.</p>
        </div>
      ) : props.connectionError ? (
        <div className={styles.empty}>
          <HelpCircle size={32} aria-hidden="true" />
          <h2>Vamos reconectar seu painel</h2>
          <p>
            Não foi possível conectar à sua conta. Recarregue a página para
            tentar novamente.
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
          <div className={styles.summary}>
            <div>
              <span className={styles.summaryIcon}>
                <Gift size={18} aria-hidden="true" />
              </span>
              <div>
                <strong>{giveaways.length}</strong>
                <span>Sorteios no histórico</span>
              </div>
            </div>
            <div>
              <span className={styles.summaryIcon}>
                <Link2 size={18} aria-hidden="true" />
              </span>
              <div>
                <strong>
                  {giveaways.filter((giveaway) => giveaway.isActive).length}
                </strong>
                <span>Recebendo inscrições</span>
              </div>
            </div>
            <p>
              <CheckCircle2 size={17} aria-hidden="true" />
              Link e QR Code no mesmo sorteio.
            </p>
          </div>
          {giveaways.length === 0 ? (
            <section className={styles.welcome}>
              <div className={styles.welcomeIcon}>
                <Gift size={39} aria-hidden="true" />
              </div>
              <span className={styles.eyebrow}>
                SEU PRÓXIMO ENCONTRO COM O PÚBLICO
              </span>
              <h2>
                Uma boa surpresa
                <br />
                começa com um convite.
              </h2>
              <p>
                Crie um sorteio, divulgue a inscrição e acompanhe os
                participantes pelo painel.
              </p>
              <button onClick={newGiveaway} className={styles.primary}>
                <Plus size={16} aria-hidden="true" />
                Criar meu primeiro sorteio
              </button>
              <ol className={styles.steps}>
                <li>
                  <span>01</span>
                  <strong>Crie</strong>
                  <p>Dê um nome ao sorteio.</p>
                </li>
                <li>
                  <span>02</span>
                  <strong>Compartilhe</strong>
                  <p>Envie o link ou o QR Code.</p>
                </li>
                <li>
                  <span>03</span>
                  <strong>Sorteie</strong>
                  <p>Acompanhe e revele o resultado.</p>
                </li>
              </ol>
            </section>
          ) : (
            <div className={styles.layout}>
              <aside
                className={styles.history}
                aria-label="Histórico de sorteios"
              >
                <div className={styles.historyTitle}>
                  <h2>Seus sorteios</h2>
                  <span>{giveaways.length}</span>
                </div>
                <select
                  className={styles.mobilePicker}
                  aria-label="Selecionar sorteio"
                  value={selectedId ?? ""}
                  onChange={(event) => onSelect(event.target.value)}
                  disabled={pending}
                >
                  {giveaways.map((giveaway) => (
                    <option key={giveaway.id} value={giveaway.id}>
                      {giveaway.title} ·{" "}
                      {giveaway.isActive ? "Aberto" : "Encerrado"}
                    </option>
                  ))}
                </select>
                <label className={styles.filterLabel} htmlFor="giveaway-status">
                  Mostrar
                </label>
                <select
                  id="giveaway-status"
                  value={filter}
                  onChange={(event) =>
                    setFilter(event.target.value as typeof filter)
                  }
                >
                  <option value="all">Todos os sorteios</option>
                  <option value="active">Inscrições abertas</option>
                  <option value="closed">Inscrições encerradas</option>
                </select>
                <div className={styles.historyList}>
                  {visibleGiveaways.length === 0 ? (
                    <p className={styles.noHistory}>
                      Nenhum sorteio neste filtro.
                    </p>
                  ) : (
                    visibleGiveaways.map((giveaway) => (
                      <button
                        key={giveaway.id}
                        className={`${styles.historyItem} ${giveaway.id === selectedId ? styles.selected : ""}`}
                        onClick={() => onSelect(giveaway.id)}
                        disabled={pending}
                        aria-current={
                          giveaway.id === selectedId ? "true" : undefined
                        }
                      >
                        <span className={styles.historyRow}>
                          <strong>{giveaway.title}</strong>
                          <ChevronRight size={15} aria-hidden="true" />
                        </span>
                        <span className={styles.historyDate}>
                          {giveawayDate(giveaway.createdAt)}
                        </span>
                        <span className={styles.historyRow}>
                          <span>
                            <Users size={12} aria-hidden="true" />
                            {giveaway.participants.length}
                          </span>
                          <span
                            className={
                              giveaway.isActive
                                ? styles.openDot
                                : styles.closedDot
                            }
                          >
                            {giveaway.isActive ? "Aberto" : "Encerrado"}
                          </span>
                        </span>
                      </button>
                    ))
                  )}
                </div>
                <p className={styles.historyHint}>
                  Seu histórico mostra até 50 sorteios recentes.
                </p>
              </aside>
              {current ? (
                <div className={styles.detail}>
                  <section className={styles.eventHeader}>
                    <div>
                      <span
                        className={`${styles.status} ${current.isActive ? styles.activeStatus : ""}`}
                      >
                        <i />
                        {current.isActive
                          ? "Inscrições abertas"
                          : "Inscrições encerradas"}
                      </span>
                      <h2>{current.title}</h2>
                      <p>Criado em {giveawayDate(current.createdAt)}</p>
                    </div>
                    <div className={styles.participantCount}>
                      <Users size={18} aria-hidden="true" />
                      <strong>{participants.length}</strong>
                      <span>
                        {participants.length === 1
                          ? "participante"
                          : "participantes"}
                      </span>
                    </div>
                  </section>
                  <section
                    className={styles.shareCard}
                    aria-labelledby="giveaway-share-title"
                  >
                    <div className={styles.cardTitle}>
                      <div>
                        <span className={styles.stepLabel}>01 · CONVIDAR</span>
                        <h3 id="giveaway-share-title">
                          Leve o convite até o seu público
                        </h3>
                      </div>
                      <div
                        className={styles.shareTabs}
                        role="group"
                        aria-label="Formato de compartilhamento"
                      >
                        <button
                          aria-pressed={shareTab === "link"}
                          onClick={() => setShareTab("link")}
                        >
                          <Link2 size={14} aria-hidden="true" />
                          Link
                        </button>
                        <button
                          aria-pressed={shareTab === "qrcode"}
                          onClick={() => setShareTab("qrcode")}
                        >
                          <QrCode size={14} aria-hidden="true" />
                          QR Code
                        </button>
                      </div>
                    </div>
                    {!current.isActive && (
                      <p className={styles.notice}>
                        As inscrições estão encerradas. Este convite não recebe
                        novos participantes.
                      </p>
                    )}
                    {shareTab === "link" ? (
                      <>
                        <label
                          className={styles.fieldLabel}
                          htmlFor="giveaway-share-url"
                        >
                          Link de inscrição
                        </label>
                        <div className={styles.linkField}>
                          <input
                            id="giveaway-share-url"
                            value={shareUrl}
                            readOnly
                            onFocus={(event) => event.target.select()}
                          />
                          <button
                            disabled={!shareUrl}
                            onClick={() => copy(shareUrl, "Link copiado!")}
                            aria-label="Copiar link de inscrição"
                          >
                            <Copy size={16} aria-hidden="true" />
                          </button>
                        </div>
                        <p className={styles.hint}>
                          Compartilhe nas redes sociais, no WhatsApp ou onde seu
                          público estiver.
                        </p>
                      </>
                    ) : (
                      <div className={styles.qrArea}>
                        {qrCode ? (
                          <img
                            src={qrCode}
                            width={150}
                            height={150}
                            alt={`QR Code para participar de ${current.title}`}
                          />
                        ) : qrError ? (
                          <div className={styles.qrState}>
                            <p>Não foi possível gerar o QR Code.</p>
                            <button
                              className={styles.secondary}
                              onClick={() => setQrAttempt((value) => value + 1)}
                            >
                              Tentar novamente
                            </button>
                          </div>
                        ) : (
                          <div className={styles.qrState} role="status">
                            <Loader2
                              className={styles.spinner}
                              aria-hidden="true"
                            />
                            Gerando QR Code…
                          </div>
                        )}
                        <div>
                          <strong>Do presencial para o seu sorteio.</strong>
                          <p>
                            Mostre o QR Code no balcão, no evento ou em um
                            material impresso.
                          </p>
                          {qrCode && (
                            <a
                              className={styles.secondary}
                              href={qrCode}
                              download={`qr-sorteio-${current.id}.png`}
                            >
                              <Download size={14} aria-hidden="true" />
                              Baixar QR Code
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                    <div className={styles.shareActions}>
                      <a
                        className={styles.textLink}
                        href={shareUrl || undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink size={14} aria-hidden="true" />
                        Ver página de inscrição
                      </a>
                      <button
                        className={styles.secondary}
                        onClick={share}
                        disabled={!shareUrl}
                      >
                        <Share2 size={14} aria-hidden="true" />
                        Compartilhar convite
                      </button>
                    </div>
                  </section>
                  <section
                    className={`${styles.drawCard} ${result && !drawing ? styles.hasResult : ""}`}
                    aria-labelledby="giveaway-draw-title"
                  >
                    <div className={styles.drawTop}>
                      <span className={styles.stepLabel}>02 · SORTEAR</span>
                      <span className={styles.drawBadge}>
                        {drawing
                          ? "Em andamento"
                          : result
                            ? "Resultado disponível"
                            : "Pronto quando você estiver"}
                      </span>
                    </div>
                    {drawing ? (
                      <div className={styles.drawBody} role="status">
                        <span className={styles.trophy}>
                          <Loader2
                            size={29}
                            className={styles.spinner}
                            aria-hidden="true"
                          />
                        </span>
                        <h3 id="giveaway-draw-title">Preparando a surpresa…</h3>
                        <p>
                          Considerando {drawCount} participantes presentes ao
                          iniciar.
                        </p>
                      </div>
                    ) : result ? (
                      <div className={styles.drawBody}>
                        <span className={styles.trophy}>
                          <Trophy size={29} aria-hidden="true" />
                        </span>
                        <span className={styles.winnerLabel}>
                          PESSOA SORTEADA
                        </span>
                        <h3
                          id="giveaway-draw-title"
                          className={styles.winnerName}
                        >
                          {result.winner.name}
                        </h3>
                        <p className={styles.winnerContact}>
                          {participantContact(result.winner.identifier)}
                        </p>
                        <p className={styles.resultMeta}>
                          {result.total} participantes ·{" "}
                          {new Date(result.drawnAt).toLocaleString("pt-BR")}
                        </p>
                        <div className={styles.resultActions}>
                          <button
                            className={styles.primary}
                            onClick={() =>
                              copy(
                                giveawayResultText(result),
                                "Resultado copiado!",
                              )
                            }
                          >
                            <Copy size={14} aria-hidden="true" />
                            Copiar resultado
                          </button>
                          <button
                            className={styles.secondary}
                            onClick={() =>
                              downloadFile(
                                giveawayResultText(result),
                                `resultado-${current.id}.txt`,
                              )
                            }
                          >
                            <Download size={14} aria-hidden="true" />
                            Baixar resultado
                          </button>
                        </div>
                        <p className={styles.localNote}>
                          {resultSaved
                            ? "Resultado guardado neste navegador. Baixe uma cópia para conservar."
                            : "Não foi possível guardar neste navegador. Baixe uma cópia do resultado."}
                        </p>
                        <button
                          className={styles.redraw}
                          onClick={() => setModal("redraw")}
                          disabled={pending || participants.length < 2}
                        >
                          Realizar outro sorteio
                        </button>
                      </div>
                    ) : (
                      <div className={styles.drawBody}>
                        <span className={styles.trophy}>
                          <Trophy size={29} aria-hidden="true" />
                        </span>
                        <h3 id="giveaway-draw-title">
                          O próximo nome pode surpreender.
                        </h3>
                        <p>
                          {participants.length < 2
                            ? "Compartilhe o convite e reúna pelo menos 2 participantes para começar."
                            : "Tudo pronto. Você pode encerrar as inscrições antes de revelar a pessoa sorteada."}
                        </p>
                        <button
                          className={styles.primary}
                          onClick={runDraw}
                          disabled={pending || participants.length < 2}
                        >
                          <Trophy size={16} aria-hidden="true" />
                          Sortear participante
                        </button>
                        <span className={styles.drawNote}>
                          {participants.length < 2
                            ? `${participants.length} de 2 participantes necessários`
                            : "Todas as inscrições presentes ao iniciar participam do sorteio."}
                        </span>
                      </div>
                    )}
                  </section>
                  <section
                    className={styles.participants}
                    aria-labelledby="participants-title"
                  >
                    <div className={styles.cardTitle}>
                      <div>
                        <span className={styles.stepLabel}>
                          03 · ACOMPANHAR
                        </span>
                        <h3 id="participants-title">
                          Quem está participando{" "}
                          <span>{participants.length}</span>
                        </h3>
                      </div>
                      {current.isActive && (
                        <button
                          className={styles.secondary}
                          onClick={() => setModal("close")}
                          disabled={pending}
                        >
                          <Square size={12} aria-hidden="true" />
                          Encerrar inscrições
                        </button>
                      )}
                    </div>
                    {participants.length > 0 && (
                      <div className={styles.participantSearch}>
                        <Search size={15} aria-hidden="true" />
                        <input
                          aria-label="Buscar participantes"
                          placeholder="Buscar nome ou contato"
                          value={search}
                          onChange={(event) => setSearch(event.target.value)}
                        />
                        {search && (
                          <button
                            aria-label="Limpar busca de participantes"
                            onClick={() => setSearch("")}
                          >
                            <X size={14} aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    )}
                    {participants.length === 0 ? (
                      <div className={styles.noParticipants}>
                        <Users size={26} aria-hidden="true" />
                        <strong>
                          Os primeiros convidados chegam por aqui.
                        </strong>
                        <p>
                          Compartilhe o link ou o QR Code para receber
                          inscrições.
                        </p>
                      </div>
                    ) : visibleParticipants.length === 0 ? (
                      <div className={styles.noParticipants}>
                        <strong>Nenhum participante encontrado.</strong>
                        <button
                          className={styles.textLink}
                          onClick={() => setSearch("")}
                        >
                          Limpar busca
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className={styles.listCount}>
                          {search
                            ? `${visibleParticipants.length} de ${participants.length} participantes`
                            : "Inscrições recebidas neste sorteio"}
                        </p>
                        <ul className={styles.participantList}>
                          {visibleParticipants.map((participant) => (
                            <li key={participant.id}>
                              <span className={styles.avatar}>
                                {participant.name
                                  .trim()
                                  .slice(0, 1)
                                  .toLocaleUpperCase("pt-BR") || "?"}
                              </span>
                              <div>
                                <strong>{participant.name}</strong>
                                <span>
                                  {/^Instagram:/i.test(
                                    participant.identifier,
                                  ) ? (
                                    <Instagram size={12} aria-hidden="true" />
                                  ) : (
                                    <MessageCircle
                                      size={12}
                                      aria-hidden="true"
                                    />
                                  )}
                                  {participantContact(participant.identifier)}
                                </span>
                              </div>
                              {result?.winner.id === participant.id && (
                                <span className={styles.winnerTag}>
                                  <Trophy size={12} aria-hidden="true" />
                                  Sorteado
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </section>
                  <footer className={styles.eventFooter}>
                    <p>
                      Escolha outro sorteio pelo histórico ou crie um novo
                      convite.
                    </p>
                    <button
                      className={styles.delete}
                      onClick={() => setModal("delete")}
                      disabled={pending}
                    >
                      <Trash2 size={13} aria-hidden="true" />
                      Excluir sorteio
                    </button>
                  </footer>
                </div>
              ) : (
                <div className={styles.loading} role="status">
                  <Loader2
                    size={25}
                    className={styles.spinner}
                    aria-hidden="true"
                  />
                  <p>Carregando o sorteio selecionado…</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
      <Dialog.Root
        open={modal !== null}
        onOpenChange={(open) => {
          if (!open && !busy) setModal(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className={styles.overlay} />
          <Dialog.Content className={styles.dialog}>
            <Dialog.Close
              className={styles.close}
              disabled={busy}
              aria-label="Fechar janela"
            >
              <X size={18} aria-hidden="true" />
            </Dialog.Close>
            <span className={styles.dialogIcon}>
              {modal === "delete" ? (
                <Trash2 size={23} aria-hidden="true" />
              ) : modal === "close" ? (
                <Square size={23} aria-hidden="true" />
              ) : (
                <Gift size={23} aria-hidden="true" />
              )}
            </span>
            <Dialog.Title className={styles.dialogTitle}>
              {modal === "create"
                ? "Vamos criar seu próximo sorteio?"
                : modal === "close"
                  ? "Encerrar as inscrições?"
                  : modal === "delete"
                    ? "Excluir este sorteio?"
                    : "Realizar outro sorteio?"}
            </Dialog.Title>
            <Dialog.Description className={styles.dialogDescription}>
              {modal === "create"
                ? "Dê um nome ao convite. Você terá link e QR Code para compartilhar."
                : modal === "close"
                  ? "Novas inscrições serão bloqueadas. Os participantes atuais continuam disponíveis para o sorteio."
                  : modal === "delete"
                    ? `“${current?.title ?? "Este sorteio"}” e suas inscrições serão excluídos. Esta ação não pode ser desfeita.`
                    : "Um novo resultado substituirá o resultado guardado neste navegador. Baixe uma cópia do anterior antes de continuar."}
            </Dialog.Description>
            {modal === "create" ? (
              <form onSubmit={confirmAction}>
                <label className={styles.fieldLabel} htmlFor="giveaway-title">
                  Nome do sorteio
                </label>
                <input
                  id="giveaway-title"
                  className={styles.titleInput}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Ex.: Kit especial da minha loja"
                  maxLength={100}
                  required
                  disabled={busy}
                />
                <p className={styles.hint}>
                  Use um nome que seu público reconheça.
                </p>
                <fieldset className={styles.methodOptions}>
                  <legend>Como você quer começar a divulgar?</legend>
                  {(
                    [
                      ["link", "Pelas redes sociais", "Começar pelo link"],
                      [
                        "qrcode",
                        "Em um evento ou loja",
                        "Começar pelo QR Code",
                      ],
                    ] as const
                  ).map(([value, label, description]) => (
                    <label
                      key={value}
                      className={method === value ? styles.methodSelected : ""}
                    >
                      <input
                        type="radio"
                        name="giveaway-method"
                        value={value}
                        checked={method === value}
                        onChange={() => setMethod(value)}
                        disabled={busy}
                      />
                      {value === "link" ? (
                        <Link2 size={19} aria-hidden="true" />
                      ) : (
                        <QrCode size={19} aria-hidden="true" />
                      )}
                      <strong>{label}</strong>
                      <span>{description}</span>
                      {method === value && (
                        <Check
                          size={14}
                          className={styles.methodCheck}
                          aria-hidden="true"
                        />
                      )}
                    </label>
                  ))}
                </fieldset>
                <div className={styles.dialogActions}>
                  <Dialog.Close className={styles.secondary} disabled={busy}>
                    Cancelar
                  </Dialog.Close>
                  <button
                    className={styles.primary}
                    type="submit"
                    disabled={busy || !title.trim()}
                  >
                    {busy ? (
                      <Loader2
                        size={16}
                        className={styles.spinner}
                        aria-hidden="true"
                      />
                    ) : (
                      <ArrowRight size={16} aria-hidden="true" />
                    )}
                    {busy ? "Criando…" : "Criar sorteio"}
                  </button>
                </div>
              </form>
            ) : (
              <div className={styles.dialogActions}>
                <Dialog.Close className={styles.secondary} disabled={busy}>
                  Cancelar
                </Dialog.Close>
                <button
                  className={
                    modal === "delete" ? styles.danger : styles.primary
                  }
                  disabled={busy}
                  onClick={modal === "redraw" ? runDraw : () => confirmAction()}
                >
                  {busy && (
                    <Loader2
                      size={16}
                      className={styles.spinner}
                      aria-hidden="true"
                    />
                  )}
                  {busy
                    ? "Aguarde…"
                    : modal === "delete"
                      ? "Excluir sorteio"
                      : modal === "close"
                        ? "Encerrar inscrições"
                        : "Sortear novamente"}
                </button>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
