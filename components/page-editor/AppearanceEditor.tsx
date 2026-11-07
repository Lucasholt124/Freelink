"use client";
import { useEffect, useState } from "react";
import { useConvex, useMutation, useQuery } from "convex/react";
import {
  ArrowRight,
  Check,
  Copy,
  Eye,
  ImagePlus,
  Palette,
  Save,
  Undo2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  appearanceValues,
  appearanceError,
  editorError,
  pagePalettes,
  validColor,
  type AppearanceValues,
} from "@/lib/page-editor";
import { profileAccent } from "@/lib/public-profile";
import { usernameError } from "@/convex/lib/onboarding_utils";
import { compressImageBeforeUpload } from "@/lib/imageCompression";
import { usePageWorkspace } from "./WorkspaceProvider";
import {
  EditorLayout,
  LivePreview,
  PageCollection,
  type PageData,
} from "./EditorLayout";
import styles from "./editor.module.css";

export default function WorkspaceAppearance() {
  const { selected } = usePageWorkspace();
  return (
    <EditorLayout section="appearance">
      {(data) => <AppearancePanel key={selected?.userId} data={data} />}
    </EditorLayout>
  );
}
function AppearancePanel({ data }: { data: PageData }) {
  const { selected, drafts, setDraft, clearDraft } = usePageWorkspace();
  const save = useMutation(api.pageWorkspaces.saveAppearance);
  const uploadUrl = useMutation(api.pageWorkspaces.uploadUrl);
  const client = useConvex();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"photo" | "background" | null>(
    null,
  );
  const [error, setError] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const pageId = selected!.userId;
  const serverValues = appearanceValues(data.profile);
  const record = drafts[pageId];
  const values = record?.values || serverValues;
  const dirty =
    !!record && JSON.stringify(record.values) !== JSON.stringify(record.base);
  const fingerprint = JSON.stringify(serverValues);
  useEffect(() => {
    if (record && !dirty)
      setDraft(pageId, { base: serverValues, values: serverValues });
  }, [fingerprint]);
  function edit(patch: Partial<AppearanceValues>) {
    setError("");
    setDraft(pageId, (current) => ({
      base: current?.base || serverValues,
      values: { ...(current?.values || serverValues), ...patch },
    }));
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const validation = appearanceError(values);
    if (validation) {
      setError(validation);
      return;
    }
    setSaving(true);
    setError("");
    try {
      const profile = await save({
        userId: pageId,
        displayName: values.displayName,
        bio: values.bio,
        status: values.status,
        accentColor: values.accentColor,
        backgroundType: values.backgroundType,
        backgroundStyle: values.backgroundStyle,
        backgroundColor1: values.backgroundColor1,
        backgroundColor2: values.backgroundColor2,
        backgroundImageBlur: values.backgroundImageBlur,
        backgroundImageOpacity: values.backgroundImageOpacity,
        photoId: values.photoId as Id<"_storage"> | undefined,
        clearPhoto: values.clearPhoto,
        backgroundId: values.backgroundId as Id<"_storage"> | undefined,
        clearBackground: values.clearBackground,
      });
      const saved = appearanceValues(profile);
      setDraft(pageId, { values: saved, base: saved });
      toast.success(`Alterações salvas em ${values.displayName}.`);
    } catch (err) {
      setError(editorError(err));
    } finally {
      setSaving(false);
    }
  }
  async function upload(
    event: React.ChangeEvent<HTMLInputElement>,
    kind: "photo" | "background",
  ) {
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
    setUploading(kind);
    setError("");
    try {
      const packed =
        file.type === "image/gif"
          ? file
          : (
              await compressImageBeforeUpload(
                file,
                kind === "photo" ? "profile" : "background",
              )
            ).file;
      const url = await uploadUrl({ userId: pageId });
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": packed.type },
        body: packed,
      });
      if (!response.ok) throw new Error();
      const { storageId } = await response.json();
      const image = await client.query(api.pageWorkspaces.assetUrl, {
        userId: pageId,
        storageId,
      });
      if (!image) throw new Error();
      edit(
        kind === "photo"
          ? { photoId: storageId, photoUrl: image, clearPhoto: false }
          : {
              backgroundId: storageId,
              backgroundUrl: image,
              backgroundType: "image",
              clearBackground: false,
            },
      );
    } catch {
      setError("Não foi possível enviar a imagem. Tente novamente.");
    } finally {
      setUploading(null);
    }
  }
  return (
    <>
      <div className={styles.editorGrid}>
        <div className={styles.formColumn}>
          <form onSubmit={submit} className={styles.formStack}>
            <fieldset
              disabled={saving || uploading !== null}
              className={styles.editorFieldset}
            >
              <section className={styles.panel}>
                <div className={styles.sectionHeading}>
                  <div>
                    <span className={styles.stepLabel}>01 · IDENTIDADE</span>
                    <h2>Quem está por trás da página?</h2>
                    <p>Mostre o nome e o rosto que seus clientes reconhecem.</p>
                  </div>
                </div>
                <div className={styles.photoField}>
                  <span
                    className={styles.photoPreview}
                    style={{ background: profileAccent(values.accentColor) }}
                  >
                    {values.photoUrl ? (
                      <img
                        src={values.photoUrl}
                        alt="Foto escolhida para o perfil"
                      />
                    ) : (
                      <span>
                        {(values.displayName || selected!.displayName)
                          .slice(0, 1)
                          .toUpperCase()}
                      </span>
                    )}
                  </span>
                  <div>
                    <label className={styles.secondaryButton}>
                      <Upload size={15} />
                      {uploading === "photo"
                        ? "Enviando…"
                        : values.photoUrl
                          ? "Trocar foto ou logo"
                          : "Enviar foto ou logo"}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        onChange={(event) => void upload(event, "photo")}
                        className={styles.fileInput}
                      />
                    </label>
                    <p className={styles.fieldHint}>
                      JPG, PNG, WebP ou GIF · até 5 MB
                    </p>
                    {values.photoUrl && (
                      <button
                        type="button"
                        className={styles.quietButton}
                        onClick={() =>
                          edit({
                            photoId: undefined,
                            photoUrl: "",
                            clearPhoto: true,
                          })
                        }
                      >
                        Remover foto
                      </button>
                    )}
                  </div>
                </div>
                <label className={styles.field}>
                  Nome da marca ou perfil
                  <input
                    value={values.displayName}
                    onChange={(event) =>
                      edit({ displayName: event.target.value })
                    }
                    placeholder="Como as pessoas conhecem sua marca?"
                    maxLength={80}
                    required
                  />
                  <span className={styles.fieldHint}>
                    Este nome aparece no topo da sua página pública.
                  </span>
                </label>
                <label className={styles.field}>
                  Bio
                  <textarea
                    value={values.bio}
                    onChange={(event) => edit({ bio: event.target.value })}
                    rows={3}
                    maxLength={160}
                    placeholder="Conte em poucas palavras o que você faz e como pode ajudar."
                  />
                  <span className={styles.fieldCounter}>
                    {values.bio.length}/160
                  </span>
                </label>
                <details className={styles.disclosure}>
                  <summary>
                    Adicionar um aviso à página <span>Opcional</span>
                  </summary>
                  <label className={styles.field}>
                    Aviso curto
                    <input
                      value={values.status}
                      onChange={(event) => edit({ status: event.target.value })}
                      maxLength={80}
                      placeholder="Ex.: Atendimento de segunda a sexta"
                    />
                    <span className={styles.fieldHint}>
                      Aparece separado da bio. Deixe vazio para não exibir.
                    </span>
                  </label>
                </details>
              </section>
              <section className={styles.panel}>
                <div className={styles.sectionHeading}>
                  <div>
                    <span className={styles.stepLabel}>
                      02 · CORES DA MARCA
                    </span>
                    <h2>Uma identidade que combina com você.</h2>
                    <p>
                      A cor principal aparece no cabeçalho e nos links em
                      destaque.
                    </p>
                  </div>
                </div>
                <div className={styles.paletteGrid}>
                  {pagePalettes.map((palette) => (
                    <button
                      key={palette.name}
                      type="button"
                      className={`${styles.palette} ${values.accentColor.toLowerCase() === palette.accent ? styles.paletteSelected : ""}`}
                      aria-pressed={
                        values.accentColor.toLowerCase() === palette.accent
                      }
                      onClick={() =>
                        edit({
                          accentColor: palette.accent,
                          backgroundType: "color",
                          backgroundColor1: palette.background,
                          backgroundColor2: palette.second,
                        })
                      }
                    >
                      <span style={{ background: palette.background }}>
                        <i style={{ background: palette.accent }} />
                        {values.accentColor.toLowerCase() ===
                          palette.accent && <Check size={13} />}
                      </span>
                      {palette.name}
                    </button>
                  ))}
                </div>
                <ColorField
                  label="Cor principal da sua marca"
                  value={values.accentColor}
                  onChange={(accentColor) => edit({ accentColor })}
                />
                <p className={styles.fieldHint}>
                  Já tem uma cor da marca? Cole o código hexadecimal ou escolha
                  no seletor.
                </p>
              </section>
              <section className={styles.panel}>
                <div className={styles.sectionHeading}>
                  <div>
                    <span className={styles.stepLabel}>
                      03 · FUNDO DA PÁGINA
                    </span>
                    <h2>Escolha o cenário da sua marca.</h2>
                    <p>Experimente na prévia antes de salvar.</p>
                  </div>
                </div>
                <div
                  className={styles.segmented}
                  role="group"
                  aria-label="Tipo de fundo"
                >
                  {[
                    { value: "color", label: "Cor lisa" },
                    { value: "gradient", label: "Gradiente" },
                    { value: "image", label: "Imagem" },
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.value}
                      aria-pressed={values.backgroundType === item.value}
                      onClick={() =>
                        edit({
                          backgroundType:
                            item.value as AppearanceValues["backgroundType"],
                        })
                      }
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                {values.backgroundType !== "image" ? (
                  <div className={styles.colorGrid}>
                    <ColorField
                      label={
                        values.backgroundType === "gradient"
                          ? "Primeira cor"
                          : "Cor do fundo"
                      }
                      value={values.backgroundColor1}
                      onChange={(backgroundColor1) =>
                        edit({ backgroundColor1 })
                      }
                    />
                    {values.backgroundType === "gradient" && (
                      <ColorField
                        label="Segunda cor"
                        value={values.backgroundColor2}
                        onChange={(backgroundColor2) =>
                          edit({ backgroundColor2 })
                        }
                      />
                    )}
                  </div>
                ) : (
                  <div className={styles.formStack}>
                    <label className={styles.imageUpload}>
                      {values.backgroundUrl ? (
                        <img
                          src={values.backgroundUrl}
                          alt="Imagem escolhida para o fundo"
                        />
                      ) : (
                        <ImagePlus size={27} />
                      )}
                      <span>
                        {uploading === "background"
                          ? "Enviando imagem…"
                          : values.backgroundUrl
                            ? "Trocar imagem de fundo"
                            : "Escolher imagem de fundo"}
                      </span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        onChange={(event) => void upload(event, "background")}
                        className={styles.fileInput}
                      />
                    </label>
                    {values.backgroundUrl && (
                      <button
                        type="button"
                        className={styles.quietButton}
                        onClick={() =>
                          edit({
                            backgroundId: undefined,
                            backgroundUrl: "",
                            clearBackground: true,
                            backgroundType: "color",
                          })
                        }
                      >
                        Remover imagem
                      </button>
                    )}
                    <div
                      className={styles.segmented}
                      role="group"
                      aria-label="Onde mostrar a imagem"
                    >
                      <button
                        type="button"
                        aria-pressed={values.backgroundStyle === "header"}
                        onClick={() => edit({ backgroundStyle: "header" })}
                      >
                        Só no cabeçalho
                      </button>
                      <button
                        type="button"
                        aria-pressed={values.backgroundStyle === "full"}
                        onClick={() => edit({ backgroundStyle: "full" })}
                      >
                        Fundo inteiro
                      </button>
                    </div>
                    <details className={styles.disclosure}>
                      <summary>Ajustar a imagem</summary>
                      <label className={styles.rangeField}>
                        Desfoque <span>{values.backgroundImageBlur}</span>
                        <input
                          type="range"
                          min={0}
                          max={20}
                          value={values.backgroundImageBlur}
                          onChange={(event) =>
                            edit({
                              backgroundImageBlur: Number(event.target.value),
                            })
                          }
                        />
                      </label>
                      <label className={styles.rangeField}>
                        Visibilidade{" "}
                        <span>{values.backgroundImageOpacity}%</span>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={values.backgroundImageOpacity}
                          onChange={(event) =>
                            edit({
                              backgroundImageOpacity: Number(
                                event.target.value,
                              ),
                            })
                          }
                        />
                      </label>
                    </details>
                  </div>
                )}
              </section>
            </fieldset>
            <div className={styles.saveBar}>
              <div role="status">
                <span className={dirty ? styles.unsavedDot : styles.savedDot} />
                {saving
                  ? "Salvando…"
                  : uploading
                    ? "Enviando imagem…"
                    : dirty
                      ? "Alterações ainda não publicadas"
                      : "Tudo salvo nesta página"}
              </div>
              <div>
                <button
                  type="button"
                  className={`${styles.quietButton} ${styles.mobilePreviewAction}`}
                  onClick={() => setPreviewOpen(true)}
                >
                  <Eye size={15} />
                  Prévia
                </button>
                <button
                  type="button"
                  className={styles.quietButton}
                  disabled={!dirty || saving || !!uploading}
                  onClick={() => {
                    clearDraft(pageId);
                    setError("");
                  }}
                >
                  <Undo2 size={15} />
                  Desfazer
                </button>
                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={!dirty || saving || !!uploading}
                >
                  <Save size={15} />
                  {saving ? "Salvando…" : "Salvar alterações"}
                </button>
              </div>
            </div>
            {error && (
              <p className={styles.formError} role="alert">
                {error}
              </p>
            )}
          </form>
          <AddressEditor />
        </div>
        <LivePreview
          data={data}
          values={values}
          mobileOpen={previewOpen}
          onMobileOpenChange={setPreviewOpen}
        />
      </div>
      <PageCollection />
    </>
  );
}
function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className={styles.field}>
      {label}
      <div className={styles.colorInput}>
        <input
          type="color"
          aria-label={`${label}: seletor de cor`}
          value={profileAccent(value)}
          onChange={(event) => onChange(event.target.value)}
        />
        <input
          type="text"
          aria-label={`${label}: código hexadecimal`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          maxLength={7}
          spellCheck={false}
          aria-invalid={!validColor(value)}
        />
      </div>
      {!validColor(value) && (
        <span className={styles.fieldError}>Use um código como #17724A.</span>
      )}
    </label>
  );
}
function AddressEditor() {
  const { selected } = usePageWorkspace();
  const rename = useMutation(api.pageWorkspaces.renamePage);
  const [username, setUsername] = useState(selected!.username);
  const [debounced, setDebounced] = useState(username);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(false);
  useEffect(() => {
    setUsername(selected!.username);
  }, [selected!.username]);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(username), 300);
    return () => clearTimeout(timer);
  }, [username]);
  const changed = username !== selected!.username;
  const result = useQuery(
    api.pageWorkspaces.checkAddress,
    changed && debounced === username && !usernameError(username)
      ? { username, excludeUserId: selected!.userId }
      : "skip",
  );
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!confirm) {
      setConfirm(true);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await rename({ userId: selected!.userId, username });
      setConfirm(false);
      toast.success("Endereço atualizado.");
    } catch (err) {
      setError(editorError(err));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className={styles.panel}>
      <details className={styles.disclosure}>
        <summary>
          Endereço da página <span>/{selected!.username}</span>
        </summary>
        <form onSubmit={submit} className={styles.formStack}>
          <label className={styles.field}>
            Novo endereço
            <input
              value={username}
              maxLength={30}
              disabled={busy}
              onChange={(event) => {
                setUsername(event.target.value.toLowerCase());
                setConfirm(false);
                setError("");
              }}
            />
            <span className={styles.fieldHint}>
              {usernameError(username) ||
                (changed
                  ? result
                    ? result.available
                      ? "Endereço disponível."
                      : result.error
                    : "Conferindo endereço…"
                  : "Este é o endereço atual da sua página.")}
            </span>
          </label>
          {confirm && (
            <p className={styles.warning}>
              Ao confirmar, o endereço /{selected!.username} deixa de abrir esta
              página. Atualize o link nas suas redes sociais.
            </p>
          )}
          {error && (
            <p className={styles.formError} role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            className={styles.secondaryButton}
            disabled={!changed || !result?.available || busy}
          >
            {busy
              ? "Alterando…"
              : confirm
                ? "Confirmar novo endereço"
                : "Alterar endereço"}
            <ArrowRight size={15} />
          </button>
        </form>
      </details>
    </section>
  );
}
