"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useConvex, useMutation } from "convex/react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Check,
  GripVertical,
  ImagePlus,
  Link2,
  Mail,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
  Search,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  buildLinkDestination,
  destinationFields,
  editorError,
  type DestinationKind,
} from "@/lib/page-editor";
import {
  accentText,
  linkDestination,
  profileBadges,
} from "@/lib/public-profile";
import { compressImageBeforeUpload } from "@/lib/imageCompression";
import { usePageWorkspace } from "./WorkspaceProvider";
import { EditorLayout, LivePreview, type PageData } from "./EditorLayout";
import styles from "./editor.module.css";

type EditorLink = PageData["links"][number];
export default function WorkspaceLinks({
  addOnOpen = false,
}: {
  addOnOpen?: boolean;
}) {
  const { selected } = usePageWorkspace();
  return (
    <EditorLayout section="links">
      {(data) => (
        <LinksPanel key={selected?.userId} data={data} addOnOpen={addOnOpen} />
      )}
    </EditorLayout>
  );
}
function LinksPanel({
  data,
  addOnOpen,
}: {
  data: PageData;
  addOnOpen: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const createRequested = params.get("new") === "1";
  const { selected } = usePageWorkspace();
  const save = useMutation(api.pageWorkspaces.saveLink);
  const reorder = useMutation(api.pageWorkspaces.reorderLinks);
  const remove = useMutation(api.pageWorkspaces.deleteLink);
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(addOnOpen);
  const [editing, setEditing] = useState<EditorLink | null>(null);
  const [deleting, setDeleting] = useState<EditorLink | null>(null);
  const [busy, setBusy] = useState(false);
  const [order, setOrder] = useState(data.links);
  useEffect(() => {
    if (!createRequested) return;
    setEditing(null);
    setDialogOpen(true);
    const next = new URLSearchParams(params.toString());
    next.delete("new");
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`, {
      scroll: false,
    });
  }, [createRequested]);
  const fingerprint = data.links
    .map((link) => `${link._id}:${link.order}`)
    .join("|");
  useEffect(() => {
    setOrder(data.links);
  }, [fingerprint]);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const visible = order
    .map(
      (link) => data.links.find((current) => current._id === link._id) || link,
    )
    .filter((link) =>
      `${link.title} ${link.url}`
        .toLocaleLowerCase("pt-BR")
        .includes(query.toLocaleLowerCase("pt-BR").trim()),
    );
  async function changeOrder(next: EditorLink[]) {
    if (busy || query.trim()) return;
    const previous = order;
    setOrder(next);
    setBusy(true);
    try {
      await reorder({
        userId: selected!.userId,
        linkIds: next.map((link) => link._id),
      });
      toast.success("Ordem dos links salva.");
    } catch (err) {
      setOrder(previous);
      toast.error(editorError(err));
    } finally {
      setBusy(false);
    }
  }
  function onDragEnd(event: DragEndEvent) {
    if (!event.over || event.active.id === event.over.id) return;
    const from = order.findIndex((link) => link._id === event.active.id);
    const to = order.findIndex((link) => link._id === event.over!.id);
    if (from >= 0 && to >= 0) void changeOrder(arrayMove(order, from, to));
  }
  async function feature(link: EditorLink) {
    setBusy(true);
    try {
      await save({
        userId: selected!.userId,
        linkId: link._id,
        title: link.title,
        url: link.url,
        isFeatured: !link.isFeatured,
        badgeType: link.badgeType || null,
        clearThumbnail: false,
      });
      toast.success(
        link.isFeatured
          ? "Destaque removido."
          : "Link em destaque na cor da sua marca.",
      );
    } catch (err) {
      toast.error(editorError(err));
    } finally {
      setBusy(false);
    }
  }
  async function deleteLink() {
    if (!deleting) return;
    setBusy(true);
    try {
      await remove({ userId: selected!.userId, linkId: deleting._id });
      setDeleting(null);
      toast.success("Link excluído desta página.");
    } catch (err) {
      toast.error(editorError(err));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className={styles.editorGrid}>
      <section
        className={`${styles.panel} ${styles.linksPanel}`}
        aria-labelledby="links-list-title"
      >
        <div className={styles.sectionHeading}>
          <div>
            <h2 id="links-list-title">Links de {selected!.displayName}</h2>
            <p>
              {data.links.length}{" "}
              {data.links.length === 1 ? "link publicado" : "links publicados"}{" "}
              · alterações de ordem e destaque são salvas na hora.
            </p>
          </div>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus size={16} />
            Adicionar link
          </button>
        </div>
        {data.links.length > 0 && (
          <label className={styles.searchField}>
            <Search size={17} />
            <input
              aria-label="Buscar links desta página"
              value={query}
              placeholder="Encontrar um link pelo título ou endereço"
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        )}
        {data.links.length > 1 && (
          <p className={styles.reorderHint}>
            {query.trim()
              ? "Limpe a busca para reorganizar todos os links."
              : "Arraste pelo ícone à esquerda ou use as setas para mudar a ordem."}
          </p>
        )}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={order.map((link) => link._id)}
            strategy={verticalListSortingStrategy}
          >
            <ol className={styles.manageList}>
              {visible.map((link) => (
                <SortableLink
                  key={link._id}
                  link={link}
                  index={order.findIndex((item) => item._id === link._id)}
                  count={order.length}
                  disabled={busy}
                  sortable={!query.trim() && !busy}
                  onEdit={() => {
                    setEditing(link);
                    setDialogOpen(true);
                  }}
                  onFeature={() => void feature(link)}
                  onDelete={() => setDeleting(link)}
                  onMove={(direction) => {
                    const index = order.findIndex(
                      (item) => item._id === link._id,
                    );
                    void changeOrder(
                      arrayMove(order, index, index + direction),
                    );
                  }}
                />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
        {!visible.length && (
          <div className={styles.emptyState}>
            <Link2 size={28} />
            <h3>
              {query
                ? "Nenhum link encontrado."
                : "Seu próximo contato começa com um link."}
            </h3>
            <p>
              {query
                ? "Tente outro título ou endereço."
                : "Adicione WhatsApp, Instagram, seu site ou outro destino importante."}
            </p>
            {!query && (
              <button
                className={styles.primaryButton}
                type="button"
                onClick={() => {
                  setEditing(null);
                  setDialogOpen(true);
                }}
              >
                Adicionar primeiro link
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        )}
        <LinkDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          link={editing}
        />
        <Dialog.Root
          open={!!deleting}
          onOpenChange={(open) => {
            if (!open && !busy) setDeleting(null);
          }}
        >
          <Dialog.Portal>
            <Dialog.Overlay className={styles.overlay} />
            <Dialog.Content className={styles.smallDialog}>
              <Dialog.Title>Excluir este link?</Dialog.Title>
              <Dialog.Description>
                “{deleting?.title}” será removido de {selected!.displayName}. Os
                outros links e páginas continuam disponíveis.
              </Dialog.Description>
              <div className={styles.dialogActions}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  disabled={busy}
                  onClick={() => setDeleting(null)}
                >
                  Manter link
                </button>
                <button
                  type="button"
                  className={styles.dangerButton}
                  disabled={busy}
                  onClick={() => void deleteLink()}
                >
                  {busy ? "Excluindo…" : "Excluir link"}
                </button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </section>
      <LivePreview data={data} />
    </div>
  );
}
function SortableLink({
  link,
  index,
  count,
  disabled,
  sortable,
  onEdit,
  onFeature,
  onDelete,
  onMove,
}: {
  link: EditorLink;
  index: number;
  count: number;
  disabled: boolean;
  sortable: boolean;
  onEdit: () => void;
  onFeature: () => void;
  onDelete: () => void;
  onMove: (direction: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link._id, disabled: !sortable });
  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 3 : undefined,
      }}
      className={`${styles.manageRow} ${isDragging ? styles.dragging : ""}`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        disabled={!sortable}
        className={styles.dragHandle}
        aria-label={`Reordenar ${link.title}`}
      >
        <GripVertical size={19} />
      </button>
      <span className={styles.rowImage}>
        {link.thumbnailUrl ? (
          <img src={link.thumbnailUrl} alt="" />
        ) : (
          <Link2 size={19} />
        )}
      </span>
      <div className={styles.rowText}>
        <strong>{link.title}</strong>
        <span>{linkDestination(link.url)}</span>
        <div>
          {link.isFeatured && <small>Em destaque</small>}
          {link.badgeType && <small>{profileBadges[link.badgeType]}</small>}
        </div>
      </div>
      <div className={styles.rowActions}>
        <button
          type="button"
          className={styles.iconButton}
          disabled={disabled || !sortable || index === 0}
          aria-label={`Mover ${link.title} para cima`}
          onClick={() => onMove(-1)}
        >
          <ArrowUp size={15} />
        </button>
        <button
          type="button"
          className={styles.iconButton}
          disabled={disabled || !sortable || index === count - 1}
          aria-label={`Mover ${link.title} para baixo`}
          onClick={() => onMove(1)}
        >
          <ArrowDown size={15} />
        </button>
        <button
          type="button"
          className={`${styles.iconButton} ${link.isFeatured ? styles.starActive : ""}`}
          disabled={disabled}
          aria-pressed={!!link.isFeatured}
          aria-label={`${link.isFeatured ? "Remover destaque de" : "Destacar"} ${link.title}`}
          onClick={onFeature}
        >
          <Star size={16} />
        </button>
        <button
          type="button"
          className={styles.editButton}
          disabled={disabled}
          onClick={onEdit}
        >
          <Pencil size={14} />
          <span>Editar</span>
        </button>
        <button
          type="button"
          className={`${styles.iconButton} ${styles.deleteButton}`}
          disabled={disabled}
          aria-label={`Excluir ${link.title}`}
          onClick={onDelete}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </li>
  );
}

const destinations: {
  kind: DestinationKind;
  label: string;
  title: string;
  icon: typeof Link2;
  placeholder: string;
}[] = [
  {
    kind: "site",
    label: "Site ou link",
    title: "",
    icon: Link2,
    placeholder: "seusite.com ou https://…",
  },
  {
    kind: "whatsapp",
    label: "WhatsApp",
    title: "Fale comigo no WhatsApp",
    icon: MessageCircle,
    placeholder: "+55 11 99999-9999",
  },
  {
    kind: "instagram",
    label: "Instagram",
    title: "Meu Instagram",
    icon: ImagePlus,
    placeholder: "@seuperfil",
  },
  {
    kind: "email",
    label: "E-mail",
    title: "Entre em contato",
    icon: Mail,
    placeholder: "contato@suamarca.com",
  },
  {
    kind: "phone",
    label: "Telefone",
    title: "Ligue para nós",
    icon: Phone,
    placeholder: "+55 11 99999-9999",
  },
];
function LinkDialog({
  open,
  onOpenChange,
  link,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  link: EditorLink | null;
}) {
  const { selected } = usePageWorkspace();
  const save = useMutation(api.pageWorkspaces.saveLink);
  const getUpload = useMutation(api.pageWorkspaces.uploadUrl);
  const client = useConvex();
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [kind, setKind] = useState<DestinationKind>("site");
  const [message, setMessage] = useState("");
  const [featured, setFeatured] = useState(false);
  const [badge, setBadge] = useState<keyof typeof profileBadges | "">("");
  const [thumbnail, setThumbnail] = useState<{
    id?: Id<"_storage">;
    url: string;
    clear: boolean;
  }>({ url: "", clear: false });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [discard, setDiscard] = useState(false);
  const [baseline, setBaseline] = useState("");
  const snapshot = JSON.stringify({
    title,
    address,
    kind,
    message,
    featured,
    badge,
    thumbnail,
  });
  useEffect(() => {
    if (!open) return;
    const parsed = destinationFields(link?.url || "");
    const initial = {
      title: link?.title || "",
      address: parsed.address,
      kind: parsed.kind,
      message: parsed.message,
      featured: !!link?.isFeatured,
      badge: link?.badgeType || "",
      thumbnail: {
        id: link?.thumbnailStorageId,
        url: link?.thumbnailUrl || "",
        clear: false,
      },
    };
    setTitle(initial.title);
    setAddress(initial.address);
    setKind(initial.kind);
    setMessage(initial.message);
    setFeatured(initial.featured);
    setBadge(initial.badge as typeof badge);
    setThumbnail(initial.thumbnail);
    setBaseline(JSON.stringify(initial));
    setError("");
    setDiscard(false);
  }, [open, link?._id]);
  const url = buildLinkDestination(kind, address, message);
  const destination = destinations.find((item) => item.kind === kind)!;
  function close() {
    if (busy || uploading) return;
    if (snapshot !== baseline) {
      setDiscard(true);
      return;
    }
    onOpenChange(false);
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!url) {
      setError("Informe um endereço válido para este botão.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await save({
        userId: selected!.userId,
        linkId: link?._id,
        title,
        url,
        isFeatured: featured,
        badgeType: badge || null,
        thumbnailId: thumbnail.id,
        clearThumbnail: thumbnail.clear,
      });
      toast.success(
        link
          ? "Link atualizado."
          : `Link adicionado a ${selected!.displayName}.`,
      );
      onOpenChange(false);
    } catch (err) {
      setError(editorError(err));
    } finally {
      setBusy(false);
    }
  }
  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (
      !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
        file.type,
      ) ||
      file.size > 5 * 1024 * 1024
    ) {
      setError("Escolha uma imagem JPG, PNG, WebP ou GIF com até 5 MB.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const packed =
        file.type === "image/gif"
          ? file
          : (await compressImageBeforeUpload(file, "profile")).file;
      const target = await getUpload({ userId: selected!.userId });
      const response = await fetch(target, {
        method: "POST",
        headers: { "Content-Type": packed.type },
        body: packed,
      });
      if (!response.ok) throw new Error();
      const { storageId } = await response.json();
      const image = await client.query(api.pageWorkspaces.assetUrl, {
        userId: selected!.userId,
        storageId,
      });
      if (!image) throw new Error();
      setThumbnail({ id: storageId, url: image, clear: false });
    } catch {
      setError("Não foi possível enviar a imagem.");
    } finally {
      setUploading(false);
    }
  }
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(value) => {
        if (!value) close();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.dialog}>
          <button
            className={styles.dialogClose}
            type="button"
            onClick={close}
            disabled={busy || uploading}
            aria-label="Fechar edição do link"
          >
            <X size={20} />
          </button>
          <Dialog.Title>
            {link ? "Editar link" : "Um novo caminho para sua página."}
          </Dialog.Title>
          <Dialog.Description>
            Este botão será publicado em {selected!.displayName} · /
            {selected!.username}.
          </Dialog.Description>
          <form onSubmit={submit} className={styles.formStack}>
            <fieldset
              disabled={busy || uploading}
              className={styles.editorFieldset}
            >
              <div
                className={styles.destinationTypes}
                role="group"
                aria-label="Tipo de link"
              >
                {destinations.map((item) => (
                  <button
                    type="button"
                    key={item.kind}
                    aria-pressed={kind === item.kind}
                    onClick={() => {
                      setKind(item.kind);
                      if (
                        !title ||
                        destinations.some((type) => type.title === title)
                      )
                        setTitle(item.title);
                      setAddress("");
                      setMessage("");
                    }}
                  >
                    <item.icon size={17} />
                    {item.label}
                  </button>
                ))}
              </div>
              <label className={styles.field}>
                Título do botão
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={100}
                  minLength={3}
                  required
                  placeholder="Ex.: Conheça meu trabalho"
                />
                <span className={styles.fieldHint}>
                  Use um título que deixe claro o que a pessoa vai encontrar.
                </span>
              </label>
              <label className={styles.field}>
                {kind === "whatsapp" || kind === "phone"
                  ? "Número com código do país e DDD"
                  : kind === "instagram"
                    ? "Seu perfil ou link do Instagram"
                    : kind === "email"
                      ? "Endereço de e-mail"
                      : "Endereço do link"}
                <input
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder={destination.placeholder}
                  required
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  type={kind === "email" ? "email" : "text"}
                  inputMode={
                    kind === "phone" || kind === "whatsapp" ? "tel" : undefined
                  }
                />
                <span className={styles.fieldHint}>
                  {kind === "site"
                    ? "Pode colar sem https://. Ajustamos o formato para você."
                    : kind === "whatsapp" || kind === "phone"
                      ? "Exemplo para o Brasil: +55, DDD e número."
                      : "Confira o destino na prévia abaixo."}
                </span>
              </label>
              {kind === "whatsapp" && (
                <label className={styles.field}>
                  Mensagem inicial{" "}
                  <span className={styles.optional}>Opcional</span>
                  <textarea
                    rows={2}
                    value={message}
                    maxLength={500}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Olá! Gostaria de saber mais."
                  />
                </label>
              )}
              <label className={styles.checkField}>
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(event) => setFeatured(event.target.checked)}
                />
                <span>
                  <strong>Destacar este link</strong>
                  <small>O botão ganha a cor principal da marca.</small>
                </span>
              </label>
              <details className={styles.disclosure}>
                <summary>
                  Imagem e etiqueta <span>Opcional</span>
                </summary>
                <div className={styles.formStack}>
                  <div className={styles.thumbnailField}>
                    {thumbnail.url && (
                      <img
                        src={thumbnail.url}
                        alt="Imagem escolhida para o link"
                      />
                    )}
                    <label className={styles.secondaryButton}>
                      <Upload size={15} />
                      {uploading ? "Enviando…" : "Escolher imagem"}
                      <input
                        className={styles.fileInput}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        onChange={(event) => void upload(event)}
                      />
                    </label>
                    {thumbnail.url && (
                      <button
                        type="button"
                        className={styles.quietButton}
                        onClick={() => setThumbnail({ url: "", clear: true })}
                      >
                        Remover
                      </button>
                    )}
                  </div>
                  <label className={styles.field}>
                    Etiqueta
                    <select
                      value={badge}
                      onChange={(event) =>
                        setBadge(event.target.value as typeof badge)
                      }
                    >
                      <option value="">Sem etiqueta</option>
                      {Object.entries(profileBadges).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </details>
            </fieldset>
            <div className={styles.linkPreview}>
              <span className={styles.stepLabel}>PRÉVIA DO BOTÃO</span>
              <div
                style={{
                  background: featured ? selected!.accentColor : undefined,
                  color: featured
                    ? accentText(selected!.accentColor)
                    : undefined,
                }}
              >
                <span>
                  {thumbnail.url ? (
                    <img src={thumbnail.url} alt="" />
                  ) : (
                    <destination.icon size={20} />
                  )}
                </span>
                <div>
                  <strong>{title || "Título do seu link"}</strong>
                  <small>
                    {url ? linkDestination(url) : "Destino do link"}
                  </small>
                </div>
                <ArrowUpRight size={18} />
              </div>
            </div>
            {error && (
              <p className={styles.formError} role="alert">
                {error}
              </p>
            )}
            {discard && (
              <div className={styles.warning} role="alert">
                <p>
                  Você tem alterações neste link que ainda não foram salvas.
                </p>
                <div className={styles.dialogActions}>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => setDiscard(false)}
                  >
                    Continuar editando
                  </button>
                  <button
                    type="button"
                    className={styles.quietButton}
                    onClick={() => onOpenChange(false)}
                  >
                    Descartar e fechar
                  </button>
                </div>
              </div>
            )}
            <div className={styles.dialogActions}>
              <button
                type="button"
                className={styles.secondaryButton}
                disabled={busy || uploading}
                onClick={close}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={busy || uploading || !url || title.trim().length < 3}
              >
                <Check size={16} />
                {busy
                  ? "Salvando…"
                  : link
                    ? "Salvar link"
                    : "Adicionar à página"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
