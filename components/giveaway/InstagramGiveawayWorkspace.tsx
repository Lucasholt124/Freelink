"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowUpRight,
  Check,
  Download,
  Gift,
  Instagram,
  Laptop,
  Loader2,
  Monitor,
  Pause,
  Play,
  Radio,
  Search,
  ShieldCheck,
  Trophy,
  Users,
  X,
} from "lucide-react";
import {
  commentCsv,
  commentEntries,
  defaultCommentRules,
  drawInstagramSession,
  exportInstagramAudit,
  instagramSource,
  mergeCommentBatch,
  type CommentRules,
  type InstagramDraw,
  type InstagramMode,
  type InstagramSession,
} from "@/lib/instagram-giveaway";
import {
  loadInstagramSessions,
  saveInstagramSession,
} from "@/lib/instagram-giveaway-store";
import { readerRequest } from "@/lib/instagram-reader";
import styles from "./instagram-giveaway.module.css";

const readerStates: Record<string, string> = {
  opening: "Abrindo o Instagram",
  collecting: "Leitor conectado",
  waiting: "Abra a lista de comentários no Instagram",
  idle: "Sem novos comentários carregados",
  limit: "Limite da captura atingido",
  paused: "Captura pausada",
  disconnected: "Captura desconectada",
  unrecognized: "Confira a página aberta no Instagram",
  buffer_full: "Volte ao Freelinnk para salvar a lista",
};
function download(contents: string, name: string, type = "application/json") {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function sha256(text: string) {
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text),
  );
  return Array.from(new Uint8Array(bytes), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}
export default function InstagramGiveawayWorkspace({
  userId,
}: {
  userId: string;
}) {
  const [sessions, setSessions] = useState<InstagramSession[]>([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [readerState, setReaderState] = useState("disconnected");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [mode, setMode] = useState<InstagramMode>("post");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [rules, setRules] = useState<CommentRules>({ ...defaultCommentRules });
  const [reviewed, setReviewed] = useState(false);
  const [search, setSearch] = useState("");
  const [presenting, setPresenting] = useState(false);
  const [drawPendingSave, setDrawPendingSave] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const session = sessions.find((item) => item.id === selected);
  const current = useRef(session);
  current.current = session;
  const owner = useRef(userId);
  owner.current = userId;
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const pendingDraw = useRef<{ sessionId: string; draw: InstagramDraw } | null>(
    null,
  );
  const busyRef = useRef(false);
  const alive = useRef(true);
  const phaseTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  function enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const task = queue.current.then(() => {
      if (owner.current !== userId)
        throw new Error("Sua sessão mudou. Recarregue a página.");
      return operation();
    });
    queue.current = task.catch(() => {});
    return task;
  }
  function apply(next: InstagramSession) {
    current.current = next;
    setSessions((list) =>
      [next, ...list.filter((item) => item.id !== next.id)].sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt),
      ),
    );
    setSelected(next.id);
  }
  async function persist(next: InstagramSession) {
    await saveInstagramSession(userId, next);
    if (alive.current && owner.current === userId) apply(next);
  }
  async function consumeBatch(expectedId: string) {
    const reply = await readerRequest("POLL", { sessionId: expectedId });
    if (!reply.ok)
      throw new Error(reply.error || "Não foi possível ler os comentários.");
    if (current.current?.id !== expectedId) return false;
    setReaderState(reply.status || "disconnected");
    if (
      !reply.batch ||
      !Number.isSafeInteger(reply.batch.seq) ||
      !Array.isArray(reply.batch.comments)
    )
      return false;
    const latest = current.current;
    if (latest.closedAt) return false;
    const merged = mergeCommentBatch(latest.comments, reply.batch.comments);
    // Acknowledge only after durable local storage; replaying a batch is harmless.
    if (merged.added) {
      await persist({ ...latest, comments: merged.comments });
      setReviewed(false);
    }
    const acknowledged = await readerRequest("ACK", {
      sessionId: expectedId,
      seq: reply.batch.seq,
    });
    if (!acknowledged.ok)
      throw new Error(
        "Os comentários foram salvos; o leitor precisa se reconectar.",
      );
    return true;
  }
  useEffect(() => {
    alive.current = true;
    setLoading(true);
    setSessions([]);
    setSelected("");
    let active = true;
    void loadInstagramSessions(userId)
      .then((list) => {
        if (active) {
          setSessions(list);
          setSelected(list[0]?.id || "");
        }
      })
      .catch(() => {
        if (active)
          setError(
            "Não foi possível recuperar os sorteios deste navegador. Tente recarregar a página.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    async function detect() {
      try {
        const reply = await readerRequest("HELLO");
        if (active) setConnected(reply.ok);
      } catch {
        if (active) setConnected(false);
      }
    }
    void detect();
    const detection = setInterval(() => void detect(), 10000);
    return () => {
      active = false;
      alive.current = false;
      clearInterval(detection);
      if (phaseTimer.current) clearInterval(phaseTimer.current);
      if (current.current)
        void readerRequest("STOP", { sessionId: current.current.id }).catch(
          () => {},
        );
    };
  }, [userId]);
  useEffect(() => {
    setReviewed(false);
    setSearch("");
    pendingDraw.current = null;
    setDrawPendingSave(false);
    const existing = sessions.find((item) => item.id === selected);
    setRules(existing?.draws[0]?.rules || { ...defaultCommentRules });
    // Session selection, not arriving batches, resets the rules.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);
  useEffect(() => {
    if (!session || session.closedAt || !connected) return;
    const id = session.id;
    let pending = false;
    const timer = setInterval(() => {
      if (busyRef.current || pending) return;
      pending = true;
      void enqueue(async () => {
        if (
          current.current?.id === id &&
          !current.current.closedAt &&
          !busyRef.current
        )
          await consumeBatch(id);
      })
        .catch((error) => {
          if (alive.current) {
            setReaderState("disconnected");
            setError(
              error instanceof Error
                ? error.message
                : "Não foi possível salvar os comentários.",
            );
          }
        })
        .finally(() => {
          pending = false;
        });
    }, 2000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id, session?.closedAt, connected]);
  async function operation(task: () => Promise<void>) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      await enqueue(task);
    } catch (error) {
      if (alive.current)
        setError(
          error instanceof Error
            ? error.message
            : "Não foi possível concluir. Tente novamente.",
        );
    } finally {
      busyRef.current = false;
      if (alive.current) setBusy(false);
    }
  }
  async function stopAndDrain(id: string) {
    if (!connected) return;
    const reply = await readerRequest("STOP", { sessionId: id });
    if (!reply.ok)
      throw new Error(reply.error || "Não foi possível pausar o leitor.");
    for (let attempt = 0; attempt < 8; attempt++)
      if (!(await consumeBatch(id))) break;
    setReaderState("paused");
  }
  async function create(event: React.FormEvent) {
    event.preventDefault();
    const source = instagramSource(url, mode);
    if (!source || !title.trim()) {
      setError(
        "Preencha o título e um link válido para a modalidade escolhida.",
      );
      return;
    }
    await operation(async () => {
      if (current.current && !current.current.closedAt)
        await stopAndDrain(current.current.id);
      const next: InstagramSession = {
        id: crypto.randomUUID(),
        title: title.trim().slice(0, 80),
        url: source,
        mode,
        createdAt: new Date().toISOString(),
        comments: [],
        draws: [],
      };
      await persist(next);
      setCreateOpen(false);
      setTitle("");
      setUrl("");
      setReviewed(false);
      if (connected) {
        const reply = await readerRequest("START", {
          sessionId: next.id,
          url: next.url,
          mode: next.mode,
        });
        if (!reply.ok)
          throw new Error(reply.error || "Não foi possível abrir o Instagram.");
        setReaderState(reply.status || "opening");
      }
    });
  }
  async function restart() {
    await operation(async () => {
      const latest = current.current;
      if (!latest || latest.draws.length) return;
      if (latest.closedAt) {
        const next = { ...latest, closedAt: undefined };
        await persist(next);
        setReviewed(false);
      }
      await stopAndDrain(latest.id);
      const reply = await readerRequest("START", {
        sessionId: latest.id,
        url: latest.url,
        mode: latest.mode,
      });
      if (!reply.ok)
        throw new Error(reply.error || "Não foi possível abrir o Instagram.");
      setReaderState(reply.status || "opening");
    });
  }
  async function closeCollection() {
    await operation(async () => {
      const latest = current.current;
      if (!latest || latest.closedAt) return;
      if (connected) await stopAndDrain(latest.id);
      const closed = current.current;
      if (closed?.id !== latest.id) return;
      await persist({ ...closed, closedAt: new Date().toISOString() });
      setReviewed(false);
    });
  }
  async function draw() {
    if (!reviewed || countdown !== null) return;
    await operation(async () => {
      const latest = current.current;
      if (!latest?.closedAt)
        throw new Error("Encerre a captura antes de sortear.");
      const applicableRules = latest.draws[0]?.rules || rules;
      const existing =
        pendingDraw.current?.sessionId === latest.id
          ? pendingDraw.current.draw
          : null;
      const next =
        existing ||
        (await drawInstagramSession(
          latest,
          applicableRules,
          () => crypto.getRandomValues(new Uint32Array(1))[0],
          crypto.randomUUID(),
          new Date().toISOString(),
          sha256,
        ));
      pendingDraw.current = { sessionId: latest.id, draw: next };
      setDrawPendingSave(true);
      await persist({ ...latest, draws: [...latest.draws, next] });
      pendingDraw.current = null;
      setDrawPendingSave(false);
      setPresenting(true);
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setCountdown(3);
        let remaining = 3;
        phaseTimer.current = setInterval(() => {
          remaining--;
          if (remaining <= 0) {
            clearInterval(phaseTimer.current!);
            phaseTimer.current = null;
            setCountdown(null);
          } else setCountdown(remaining);
        }, 1000);
      }
    });
  }
  const entries = useMemo(
    () =>
      commentEntries(
        session?.comments || [],
        session?.draws[0]?.rules || rules,
        session?.draws.map((draw) => draw.winner.username) || [],
      ),
    [session, rules],
  );
  const people = new Set(entries.map((comment) => comment.username)).size;
  const filtered = (session?.comments || []).filter((comment) =>
    `${comment.username} ${comment.text}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const latestDraw = session?.draws[session.draws.length - 1];
  const rulesLocked = !!session?.draws.length || busy || drawPendingSave;
  return (
    <div className={styles.workspace}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <span className={styles.brandIcon}>
            <Instagram size={24} />
          </span>
          <div>
            <div className={styles.titleLine}>
              <h1>Sorteios do Instagram</h1>
              <span className={styles.beta}>Leitor experimental</span>
            </div>
            <p>Dos comentários ao próximo nome da sua live.</p>
          </div>
        </div>
        <button
          className={styles.primary}
          onClick={() => {
            setError("");
            setCreateOpen(true);
          }}
          disabled={busy || loading || countdown !== null}
        >
          <Gift size={16} />
          Novo sorteio
        </button>
      </header>
      {error && (
        <div role="alert" className={styles.error}>
          {error}
        </div>
      )}
      <section className={styles.setup} aria-label="Leitor de comentários">
        <div className={styles.setupTitle}>
          <Laptop size={20} />
          <div>
            <strong>
              {connected
                ? "Complemento conectado a este navegador"
                : "Uma conexão simples, feita no seu computador"}
            </strong>
            <p>
              Sem fornecedor de comentários. Sem conectar uma conta Meta à
              plataforma.
            </p>
          </div>
          <span className={connected ? styles.connected : styles.disconnected}>
            {connected ? "Conectado" : "Instalação necessária"}
          </span>
        </div>
        {!connected && (
          <>
            <ol className={styles.steps}>
              <li>
                <span>1</span>
                <div>
                  <strong>Instale o leitor</strong>
                  <p>
                    Use Chrome ou Edge no computador e mantenha o Instagram
                    acessível.
                  </p>
                </div>
              </li>
              <li>
                <span>2</span>
                <div>
                  <strong>Cole o link</strong>
                  <p>Escolha uma publicação, um Reel ou o endereço da live.</p>
                </div>
              </li>
              <li>
                <span>3</span>
                <div>
                  <strong>Confira e apresente</strong>
                  <p>
                    Revise os comentários coletados e faça o sorteio ao vivo.
                  </p>
                </div>
              </li>
            </ol>
            <div className={styles.setupActions}>
              <a
                className={styles.secondary}
                href="/downloads/freelinnk-instagram-reader.zip"
                download
              >
                <Download size={15} />
                Baixar complemento
              </a>
              <button
                className={styles.textButton}
                onClick={() =>
                  void operation(async () => {
                    const reply = await readerRequest("HELLO");
                    setConnected(reply.ok);
                    if (!reply.ok)
                      throw new Error(
                        "Recarregue a página após instalar o leitor.",
                      );
                  })
                }
              >
                Já instalei · verificar conexão
              </button>
            </div>
            <details className={styles.details}>
              <summary>Como instalar esta versão de teste</summary>
              <ol>
                <li>Baixe e extraia o arquivo ZIP em uma pasta.</li>
                <li>
                  Abra <strong>chrome://extensions</strong> no Chrome ou{" "}
                  <strong>edge://extensions</strong> no Edge.
                </li>
                <li>
                  Ative o modo de desenvolvedor e escolha{" "}
                  <strong>Carregar sem compactação</strong>.
                </li>
                <li>Selecione a pasta extraída e recarregue esta página.</li>
              </ol>
              <p>
                A distribuição pela loja de extensões ainda não está disponível.
                O leitor não pede acesso a senhas ou cookies; lê os comentários
                exibidos nas páginas do Instagram.
              </p>
            </details>
          </>
        )}
        <p className={styles.collectionNote}>
          <ShieldCheck size={15} />A lista pode ser parcial. Comentários ocultos
          ou que o Instagram não carregar ficam de fora. Confira a quantidade e
          as regras antes de sortear.
        </p>
      </section>
      {loading ? (
        <p className={styles.empty} role="status">
          <Loader2 className={styles.spinner} size={20} />
          Recuperando seus sorteios deste navegador…
        </p>
      ) : !session ? (
        <section className={styles.welcome}>
          <span className={styles.bigIcon}>
            <Gift size={34} />
          </span>
          <span className={styles.eyebrow}>UM NOVO JEITO DE PARTICIPAR</span>
          <h2>
            Os comentários viram
            <br />o começo da surpresa.
          </h2>
          <p>
            Prepare o sorteio, abra os comentários e acompanhe a lista chegando.
            A apresentação ao vivo fica por conta do Freelinnk.
          </p>
          <button
            className={styles.primary}
            onClick={() => setCreateOpen(true)}
          >
            Preparar meu primeiro sorteio
          </button>
          <small>
            Até 5.000 comentários por captura. Os dados e resultados ficam neste
            navegador; exporte o registro para guardar uma cópia.
          </small>
        </section>
      ) : (
        <>
          <div className={styles.sessionBar}>
            <label>
              Sorteio selecionado
              <select
                value={selected}
                disabled={busy || countdown !== null}
                onChange={(event) => {
                  const nextId = event.target.value;
                  void operation(async () => {
                    if (current.current && !current.current.closedAt)
                      await stopAndDrain(current.current.id);
                    setSelected(nextId);
                    setReaderState("disconnected");
                  });
                }}
              >
                {sessions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </label>
            <div className={styles.localHint}>
              Salvo neste navegador.
              <br />
              Exporte o registro para guardar sua cópia.
            </div>
          </div>
          <section className={styles.sessionHeader}>
            <div>
              <span className={styles.eyebrow}>
                {session.mode === "live"
                  ? "COMENTÁRIOS DA LIVE"
                  : "PUBLICAÇÃO OU REEL"}
              </span>
              <h2>{session.title}</h2>
              <a href={session.url} target="_blank" rel="noopener noreferrer">
                Abrir no Instagram <ArrowUpRight size={14} />
              </a>
            </div>
            <span className={styles.state}>
              {session.closedAt
                ? "Lista encerrada"
                : readerStates[readerState] || "Confira o leitor"}
            </span>
          </section>
          <section className={styles.stats} aria-label="Resumo da captura">
            <div>
              <span>Comentários coletados</span>
              <strong>{session.comments.length.toLocaleString("pt-BR")}</strong>
              <small>Lista carregada pelo navegador</small>
            </div>
            <div>
              <span>Pessoas elegíveis</span>
              <strong>{people.toLocaleString("pt-BR")}</strong>
              <small>
                {entries.length.toLocaleString("pt-BR")} chances pelas regras
                atuais
              </small>
            </div>
            <div>
              <span>Pessoas sorteadas</span>
              <strong>{session.draws.length}</strong>
              <small>Vencedores anteriores ficam de fora</small>
            </div>
          </section>
          <div className={styles.captureActions}>
            {!session.closedAt ? (
              <>
                <button
                  className={styles.secondary}
                  disabled={!connected || busy}
                  onClick={() => void restart()}
                >
                  <Play size={15} />
                  {readerState === "disconnected" || readerState === "paused"
                    ? "Iniciar / retomar leitura"
                    : "Reabrir página da captura"}
                </button>
                <button
                  className={styles.secondary}
                  disabled={busy}
                  onClick={() => void closeCollection()}
                >
                  <Pause size={15} />
                  Encerrar captura e conferir
                </button>
              </>
            ) : (
              !session.draws.length && (
                <button
                  className={styles.secondary}
                  disabled={!connected || busy}
                  onClick={() => void restart()}
                >
                  <Play size={15} />
                  Coletar mais comentários
                </button>
              )
            )}
            <button
              className={styles.secondary}
              onClick={() => setPresenting(true)}
            >
              <Monitor size={15} />
              Modo apresentação
            </button>
          </div>
          {!session.closedAt && (
            <p className={styles.hint}>
              {session.mode === "live"
                ? "Deixe a live aberta no computador. Os comentários entram quando forem carregados pelo leitor."
                : "Abra os comentários no Instagram. Se a leitura não começar, use “Indicar um comentário” no painel do leitor."}{" "}
              Ao terminar, volte aqui e encerre a captura.
            </p>
          )}
          <div className={styles.bodyGrid}>
            <section className={styles.panel}>
              <div className={styles.sectionTitle}>
                <span className={styles.step}>01</span>
                <div>
                  <h3>Confira quem está na lista</h3>
                  <p>Revise antes de abrir o sorteio.</p>
                </div>
                <button
                  className={styles.iconButton}
                  aria-label="Exportar comentários em CSV"
                  disabled={!session.comments.length}
                  onClick={() =>
                    download(
                      commentCsv(session.comments),
                      `comentarios-${session.id}.csv`,
                      "text/csv;charset=utf-8",
                    )
                  }
                >
                  <Download size={17} />
                </button>
              </div>
              <label className={styles.search}>
                <Search size={15} />
                <input
                  aria-label="Buscar comentário ou perfil"
                  placeholder="Buscar @perfil ou comentário"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
              <div className={styles.commentList}>
                {filtered.length ? (
                  filtered.slice(0, 100).map((comment) => (
                    <article key={comment.id}>
                      <strong>@{comment.username}</strong>
                      <p>{comment.text}</p>
                    </article>
                  ))
                ) : (
                  <p className={styles.empty}>
                    {session.comments.length
                      ? "Nenhum comentário com essa busca."
                      : "Os comentários aparecerão aqui assim que o leitor identificar a lista."}
                  </p>
                )}
              </div>
              {filtered.length > 100 && (
                <p className={styles.hint}>
                  Mostrando os primeiros 100 de {filtered.length}. Use a busca
                  ou exporte a lista completa.
                </p>
              )}
            </section>
            <section className={styles.panel}>
              <div className={styles.sectionTitle}>
                <span className={styles.step}>02</span>
                <div>
                  <h3>Defina as regras</h3>
                  <p>As mesmas regras valem para toda a sequência.</p>
                </div>
              </div>
              <fieldset disabled={rulesLocked} className={styles.rules}>
                <label className={styles.check}>
                  <input
                    type="checkbox"
                    checked={rules.uniqueUsers}
                    onChange={(event) => {
                      setRules({ ...rules, uniqueUsers: event.target.checked });
                      setReviewed(false);
                    }}
                  />
                  <span>
                    <strong>Uma chance por pessoa</strong>
                    <small>
                      Desative para dar uma chance por comentário coletado.
                    </small>
                  </span>
                </label>
                <label className={styles.field}>
                  O comentário precisa conter
                  <input
                    maxLength={80}
                    value={rules.keyword}
                    placeholder="Palavra ou hashtag · opcional"
                    onChange={(event) => {
                      setRules({ ...rules, keyword: event.target.value });
                      setReviewed(false);
                    }}
                  />
                </label>
                <label className={styles.field}>
                  Mínimo de perfis diferentes marcados
                  <select
                    value={rules.mentions}
                    onChange={(event) => {
                      setRules({
                        ...rules,
                        mentions: Number(event.target.value),
                      });
                      setReviewed(false);
                    }}
                  >
                    {[0, 1, 2, 3, 4, 5].map((number) => (
                      <option key={number} value={number}>
                        {number
                          ? `${number} ${number === 1 ? "perfil" : "perfis"}`
                          : "Sem exigência"}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={styles.field}>
                  Excluir perfis
                  <input
                    maxLength={1000}
                    placeholder="@sualoja, @outroperfil · opcional"
                    value={rules.excludedUsers}
                    onChange={(event) => {
                      setRules({ ...rules, excludedUsers: event.target.value });
                      setReviewed(false);
                    }}
                  />
                </label>
              </fieldset>
              <p className={styles.hint}>
                As marcações são contadas pelo texto, sem confirmar se os perfis
                existem. Curtidas, seguidores e outras ações fora dos
                comentários não são verificadas. Comentários idênticos sem ID
                nativo contam uma vez.
              </p>
              <div className={styles.drawBox}>
                <label className={styles.check}>
                  <input
                    type="checkbox"
                    checked={reviewed}
                    disabled={!session.closedAt || busy}
                    onChange={(event) => setReviewed(event.target.checked)}
                  />
                  <span>
                    Conferi a lista coletada e as regras. Entendo que a captura
                    pode ser parcial.
                  </span>
                </label>
                <button
                  className={styles.primary}
                  disabled={
                    busy ||
                    countdown !== null ||
                    !session.closedAt ||
                    !reviewed ||
                    entries.length < 2
                  }
                  onClick={() => void draw()}
                >
                  {busy ? (
                    <Loader2 size={17} className={styles.spinner} />
                  ) : (
                    <Trophy size={17} />
                  )}
                  {session.draws.length
                    ? "Sortear próximo nome"
                    : "Realizar sorteio"}
                </button>
                <small>
                  {!session.closedAt
                    ? "Encerre a captura para liberar o sorteio."
                    : entries.length < 2
                      ? "São necessárias pelo menos duas chances elegíveis."
                      : "O resultado é salvo antes da apresentação."}
                </small>
              </div>
            </section>
          </div>
          {!!session.draws.length && (
            <section className={styles.history}>
              <div className={styles.sectionTitle}>
                <Trophy size={20} />
                <div>
                  <h3>Resultados registrados</h3>
                  <p>Lista e regras ficam guardadas com cada resultado.</p>
                </div>
                <button
                  className={styles.secondary}
                  onClick={() =>
                    download(
                      exportInstagramAudit(session),
                      `registro-sorteio-${session.id}.json`,
                    )
                  }
                >
                  <Download size={15} />
                  Exportar registro
                </button>
              </div>
              {session.draws.map((result, index) => (
                <div key={result.id} className={styles.historyRow}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>@{result.winner.username}</strong>
                  <small>
                    {new Date(result.drawnAt).toLocaleString("pt-BR")} ·{" "}
                    {result.eligibleCount} chances
                  </small>
                </div>
              ))}
            </section>
          )}
        </>
      )}
      <Dialog.Root
        open={createOpen}
        onOpenChange={(value) => {
          if (!busy) setCreateOpen(value);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className={styles.overlay} />
          <Dialog.Content className={styles.dialog}>
            <Dialog.Title>Prepare seu sorteio</Dialog.Title>
            <Dialog.Description>
              Escolha de onde vêm os comentários. O leitor vai abrir o Instagram
              no computador.
            </Dialog.Description>
            <Dialog.Close
              className={styles.close}
              aria-label="Fechar criação de sorteio"
              disabled={busy}
            >
              <X size={19} />
            </Dialog.Close>
            <form onSubmit={(event) => void create(event)}>
              <fieldset className={styles.modes} disabled={busy}>
                <legend>Origem dos comentários</legend>
                <label className={mode === "post" ? styles.modeSelected : ""}>
                  <input
                    type="radio"
                    name="instagram-source"
                    value="post"
                    checked={mode === "post"}
                    onChange={() => {
                      setMode("post");
                      setUrl("");
                    }}
                  />
                  <Instagram size={21} />
                  <strong>Publicação ou Reel</strong>
                  <span>
                    Prepare a lista de um post e apresente onde quiser.
                  </span>
                </label>
                <label className={mode === "live" ? styles.modeSelected : ""}>
                  <input
                    type="radio"
                    name="instagram-source"
                    value="live"
                    checked={mode === "live"}
                    onChange={() => {
                      setMode("live");
                      setUrl("");
                    }}
                  />
                  <Radio size={21} />
                  <strong>Comentários da live</strong>
                  <span>
                    Capture os comentários enquanto a transmissão acontece.
                  </span>
                </label>
              </fieldset>
              <label className={styles.field}>
                Nome do sorteio
                <input
                  value={title}
                  maxLength={80}
                  required
                  disabled={busy}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Ex.: Presente da nossa live"
                />
              </label>
              <label className={styles.field}>
                {mode === "post"
                  ? "Link da publicação ou Reel"
                  : "Link da live"}
                <input
                  value={url}
                  maxLength={300}
                  type="url"
                  required
                  disabled={busy}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder={
                    mode === "post"
                      ? "https://www.instagram.com/p/.../"
                      : "https://www.instagram.com/seuperfil/live/"
                  }
                />
              </label>
              {!connected && (
                <p className={styles.hint}>
                  Você pode preparar o sorteio agora. Instale o leitor para
                  iniciar a captura automática.
                </p>
              )}
              {error && (
                <p role="alert" className={styles.error}>
                  {error}
                </p>
              )}
              <button className={styles.primary} disabled={busy}>
                {busy
                  ? "Preparando…"
                  : connected
                    ? "Preparar e abrir Instagram"
                    : "Preparar sorteio"}
              </button>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <Dialog.Root open={presenting} onOpenChange={setPresenting}>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.stageOverlay} />
          <Dialog.Content className={styles.stage}>
            <Dialog.Title className={styles.stageTitle}>
              {session?.title || "Seu sorteio"}
            </Dialog.Title>
            <Dialog.Description className={styles.stageDescription}>
              Sorteio entre os comentários coletados no navegador.
            </Dialog.Description>
            <Dialog.Close
              className={styles.stageClose}
              aria-label="Fechar apresentação"
            >
              <X size={22} />
            </Dialog.Close>
            <span className={styles.stageLogo}>freelinnk.</span>
            <div className={styles.stageContent}>
              {countdown !== null ? (
                <div
                  className={styles.countdown}
                  role="status"
                  aria-live="polite"
                >
                  {countdown}
                </div>
              ) : latestDraw ? (
                <>
                  <span className={styles.stageEyebrow}>O NOME DA VEZ É</span>
                  <Trophy className={styles.trophy} size={45} />
                  <h2 className={styles.winner}>
                    @{latestDraw.winner.username}
                  </h2>
                  <blockquote>{latestDraw.winner.text}</blockquote>
                  <p>
                    {latestDraw.eligibleCount.toLocaleString("pt-BR")} chances
                    consideradas · resultado registrado
                  </p>
                </>
              ) : (
                <>
                  <span className={styles.stageEyebrow}>
                    {session?.closedAt
                      ? "TUDO PRONTO PARA O PRÓXIMO NOME"
                      : "A SURPRESA ESTÁ CHEGANDO"}
                  </span>
                  <Gift size={70} className={styles.trophy} />
                  <h2>
                    {session?.comments.length || 0}
                    <small>comentários coletados</small>
                  </h2>
                  <p>
                    {session?.closedAt
                      ? "Confira a lista e confirme as regras para liberar o sorteio."
                      : "Acompanhe a captura e encerre a lista antes de sortear."}
                  </p>
                </>
              )}
            </div>
            <div className={styles.stageActions}>
              <button
                className={styles.primary}
                disabled={
                  busy ||
                  countdown !== null ||
                  !session?.closedAt ||
                  !reviewed ||
                  entries.length < 2
                }
                onClick={() => void draw()}
              >
                <Trophy size={18} />
                {latestDraw ? "Sortear próximo nome" : "Revelar nome sorteado"}
              </button>
              <Dialog.Close className={styles.secondary}>
                Voltar à lista
              </Dialog.Close>
            </div>
            <p className={styles.stageFoot}>
              {!session?.closedAt
                ? "Encerre a captura e confira a lista antes de sortear."
                : !reviewed
                  ? "Volte à lista e confirme a revisão para liberar o próximo sorteio."
                  : entries.length < 2
                    ? "Não restam duas chances elegíveis para um novo sorteio."
                    : "Participam somente os comentários coletados e elegíveis pelas regras definidas."}
            </p>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
