"use client";
import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ImagePlus,
  Loader2,
  Megaphone,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "sonner";
import AdPreview from "./AdPreview";
import {
  adCategories,
  adCategory,
  adDestination,
  adNumber,
  adPlanLimits,
  emptyAdDraft,
  selectAdFiles,
  suggestedAdText,
  validateAdDraft,
  type AdMedia,
  type AdPlan,
  type CampaignDraft,
  type CreateAdInput,
  type UploadProgress,
} from "@/lib/ads";
import styles from "./ads.module.css";

export type CampaignComposerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: AdPlan;
  onCreate: (
    input: CreateAdInput,
    onProgress: (progress: UploadProgress) => void,
  ) => Promise<void>;
  onResetDraft?: () => void;
  onDraftChange: (dirty: boolean) => void;
  atLimit: boolean;
};
export default function CampaignComposer({
  open,
  onOpenChange,
  plan,
  onCreate,
  onResetDraft,
  onDraftChange,
  atLimit,
}: CampaignComposerProps) {
  const [draft, setDraft] = useState<CampaignDraft>({ ...emptyAdDraft });
  const [files, setFiles] = useState<File[]>([]);
  const [media, setMedia] = useState<AdMedia[]>([]);
  const [errors, setErrors] = useState<ReturnType<typeof validateAdDraft>>({});
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [step, setStep] = useState<1 | 2>(1);
  const [suggestion, setSuggestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [discard, setDiscard] = useState(false);
  const submitRef = useRef(false);
  const urls = useRef(new Set<string>());
  const formRef = useRef<HTMLFormElement>(null);
  const limit = adPlanLimits[plan];
  const dirty = Boolean(
    draft.title ||
    draft.productLink ||
    draft.adText ||
    files.length ||
    draft.niche !== "geral",
  );
  useEffect(() => onDraftChange(dirty), [dirty, onDraftChange]);
  useEffect(
    () => () => {
      for (const url of urls.current) URL.revokeObjectURL(url);
    },
    [],
  );
  function update(field: keyof CampaignDraft, value: string) {
    setDraft((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
    if (field === "title") setSuggestion("");
  }
  function reset() {
    for (const url of urls.current) URL.revokeObjectURL(url);
    urls.current.clear();
    setDraft({ ...emptyAdDraft });
    setFiles([]);
    setMedia([]);
    setErrors({});
    setFileErrors([]);
    setSuggestion("");
    setDiscard(false);
    setStep(1);
    setProgress(null);
    onResetDraft?.();
  }
  function appendFiles(incoming: File[]) {
    if (submitRef.current) return;
    const selection = selectAdFiles(incoming, files.length, limit.media);
    setFileErrors(selection.errors);
    const accepted = selection.accepted.map((index) => incoming[index]);
    const previews = accepted.map((file) => {
      const url = URL.createObjectURL(file);
      urls.current.add(url);
      return {
        url,
        type: file.type.startsWith("video/")
          ? ("video" as const)
          : ("image" as const),
      };
    });
    setFiles((previous) => [...previous, ...accepted]);
    setMedia((previous) => [...previous, ...previews]);
    if (accepted.length)
      setErrors((previous) => ({ ...previous, media: undefined }));
  }
  function remove(index: number) {
    const url = media[index].url;
    URL.revokeObjectURL(url);
    urls.current.delete(url);
    setFiles((previous) => previous.filter((_, i) => i !== index));
    setMedia((previous) => previous.filter((_, i) => i !== index));
    setFileErrors([]);
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (submitRef.current) return;
    const nextErrors = validateAdDraft(draft, files.length, limit.media);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setStep(1);
      requestAnimationFrame(() =>
        formRef.current
          ?.querySelector<HTMLElement>('[aria-invalid="true"]')
          ?.focus(),
      );
      return;
    }
    if (step === 1) {
      setStep(2);
      return;
    }
    if (atLimit) {
      toast.error(
        "O limite de campanhas foi atingido. Gerencie as campanhas existentes antes de publicar.",
      );
      return;
    }
    submitRef.current = true;
    setSubmitting(true);
    setProgress(null);
    try {
      await onCreate({ ...draft, files }, setProgress);
      reset();
      onOpenChange(false);
      toast.success("Campanha publicada na rede Freelinnk.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível publicar. Tente novamente.",
      );
    } finally {
      submitRef.current = false;
      setSubmitting(false);
      setProgress(null);
    }
  }
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(value) => {
        if (!submitRef.current) onOpenChange(value);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content
          className={`${styles.dialog} ${styles.composer}`}
          onOpenAutoFocus={(event) => {
            const titleInput =
              formRef.current?.querySelector<HTMLInputElement>("#ad-title");
            if (titleInput) {
              event.preventDefault();
              requestAnimationFrame(() => titleInput.focus());
            }
          }}
        >
          <div className={styles.composerHeader}>
            <div>
              <span className={styles.eyebrow}>
                SUA MARCA NA REDE FREELINNK
              </span>
              <Dialog.Title className={styles.dialogTitle}>
                Vamos criar sua próxima campanha?
              </Dialog.Title>
              <Dialog.Description className={styles.dialogDescription}>
                Prepare o convite, veja a prévia e revise antes de publicar.
              </Dialog.Description>
            </div>
            <Dialog.Close
              disabled={submitting}
              className={styles.close}
              aria-label="Fechar criação de campanha"
            >
              <X size={18} aria-hidden="true" />
            </Dialog.Close>
          </div>
          <div className={styles.wizardSteps} aria-label={`Etapa ${step} de 2`}>
            <span className={step === 1 ? styles.currentStep : ""}>
              <i>{step === 2 ? <Check size={12} aria-hidden="true" /> : "1"}</i>
              Conteúdo do anúncio
            </span>
            <span className={step === 2 ? styles.currentStep : ""}>
              <i>2</i>Revisão e publicação
            </span>
          </div>
          <form ref={formRef} onSubmit={submit} noValidate>
            <div className={styles.composerBody}>
              <div className={styles.formColumn}>
                {step === 1 ? (
                  <fieldset className={styles.fields} disabled={submitting}>
                    <div className={styles.formField}>
                      <label htmlFor="ad-title">
                        Título do anúncio <span>Obrigatório</span>
                      </label>
                      <input
                        id="ad-title"
                        value={draft.title}
                        maxLength={100}
                        placeholder="Ex.: Nova coleção da minha loja"
                        onChange={(event) =>
                          update("title", event.target.value)
                        }
                        aria-invalid={!!errors.title}
                        aria-describedby={
                          errors.title ? "ad-title-error" : "ad-title-hint"
                        }
                      />
                      {errors.title ? (
                        <p className={styles.fieldError} id="ad-title-error">
                          {errors.title}
                        </p>
                      ) : (
                        <p className={styles.hint} id="ad-title-hint">
                          Um nome curto para despertar interesse.
                        </p>
                      )}
                    </div>
                    <div className={styles.formField}>
                      <label htmlFor="ad-destination">
                        Destino do anúncio <span>Obrigatório</span>
                      </label>
                      <input
                        id="ad-destination"
                        type="url"
                        inputMode="url"
                        value={draft.productLink}
                        placeholder="https://sualoja.com/produto"
                        onChange={(event) =>
                          update("productLink", event.target.value)
                        }
                        aria-invalid={!!errors.productLink}
                        aria-describedby={
                          errors.productLink
                            ? "ad-destination-error"
                            : "ad-destination-hint"
                        }
                      />
                      {errors.productLink ? (
                        <p
                          className={styles.fieldError}
                          id="ad-destination-error"
                        >
                          {errors.productLink}
                        </p>
                      ) : (
                        <p className={styles.hint} id="ad-destination-hint">
                          Pode ser seu site, produto ou link de atendimento.
                        </p>
                      )}
                    </div>
                    <div className={styles.formField}>
                      <label htmlFor="ad-category">Categoria</label>
                      <select
                        id="ad-category"
                        value={draft.niche}
                        onChange={(event) =>
                          update("niche", event.target.value)
                        }
                      >
                        {adCategories.map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                      <p className={styles.hint}>
                        Escolha o que você vende. Seu anúncio não será
                        distribuído em páginas do mesmo segmento ou de segmentos
                        relacionados.
                      </p>
                    </div>
                    <div className={styles.formField}>
                      <div className={styles.labelRow}>
                        <label htmlFor="ad-text">
                          Mensagem do anúncio <span>Obrigatório</span>
                        </label>
                        <button
                          type="button"
                          className={styles.textButton}
                          onClick={() => {
                            if (!draft.title.trim()) {
                              setErrors((previous) => ({
                                ...previous,
                                title:
                                  "Dê um título antes de pedir uma sugestão.",
                              }));
                              document.getElementById("ad-title")?.focus();
                              return;
                            }
                            setSuggestion(suggestedAdText(draft.title));
                          }}
                        >
                          Ver sugestão
                        </button>
                      </div>
                      <textarea
                        id="ad-text"
                        value={draft.adText}
                        rows={4}
                        maxLength={1000}
                        placeholder="Conte o que você oferece e convide a pessoa a conhecer sua marca."
                        onChange={(event) =>
                          update("adText", event.target.value)
                        }
                        aria-invalid={!!errors.adText}
                        aria-describedby={
                          errors.adText ? "ad-text-error" : undefined
                        }
                      />
                      {errors.adText && (
                        <p className={styles.fieldError} id="ad-text-error">
                          {errors.adText}
                        </p>
                      )}
                      <span className={styles.characterCount}>
                        {draft.adText.length} / 1.000
                      </span>
                      {suggestion && (
                        <div className={styles.suggestion}>
                          <strong>Modelo de texto para você adaptar</strong>
                          <p>{suggestion}</p>
                          <div>
                            <button
                              type="button"
                              className={styles.textButton}
                              onClick={() => {
                                update("adText", suggestion);
                                setSuggestion("");
                              }}
                            >
                              Usar este texto
                            </button>
                            <button
                              type="button"
                              className={styles.textButton}
                              onClick={() => setSuggestion("")}
                            >
                              Fechar sugestão
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className={styles.formField}>
                      <label htmlFor="ad-files">
                        Imagens e vídeos{" "}
                        <span>
                          {files.length} de {limit.media} mídias
                        </span>
                      </label>
                      <div
                        className={styles.uploadArea}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                          event.preventDefault();
                          appendFiles(Array.from(event.dataTransfer.files));
                        }}
                      >
                        <label
                          className={styles.uploadLabel}
                          htmlFor="ad-files"
                        >
                          <UploadCloud size={25} aria-hidden="true" />
                          <strong>Escolha as mídias da campanha</strong>
                          <span>Selecione arquivos ou arraste para cá.</span>
                        </label>
                        <input
                          id="ad-files"
                          className={styles.srOnly}
                          type="file"
                          multiple
                          accept="image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4,video/quicktime,video/webm"
                          onChange={(event) => {
                            appendFiles(Array.from(event.target.files ?? []));
                            event.target.value = "";
                          }}
                          aria-invalid={!!errors.media}
                          aria-describedby="ad-media-help"
                        />
                      </div>
                      <p className={styles.hint} id="ad-media-help">
                        Imagens de até 10 MB · Vídeos de até 50 MB. JPG, PNG,
                        WebP, GIF, AVIF, MP4, MOV ou WebM.
                      </p>
                      {errors.media && (
                        <p className={styles.fieldError}>{errors.media}</p>
                      )}
                      {fileErrors.length > 0 && (
                        <ul className={styles.fileErrors} role="alert">
                          {fileErrors.map((error) => (
                            <li key={error}>{error}</li>
                          ))}
                        </ul>
                      )}
                      {files.length > 0 && (
                        <ul className={styles.fileList}>
                          {files.map((file, index) => (
                            <li key={media[index].url}>
                              <span className={styles.fileThumb}>
                                {media[index].type === "video" ? (
                                  <Megaphone size={17} aria-hidden="true" />
                                ) : (
                                  <img src={media[index].url} alt="" />
                                )}
                              </span>
                              <span>
                                <strong>{file.name}</strong>
                                <small>
                                  {(file.size / 1024 / 1024).toFixed(1)} MB ·{" "}
                                  {media[index].type === "video"
                                    ? "Vídeo"
                                    : "Imagem"}
                                </small>
                              </span>
                              <button
                                type="button"
                                onClick={() => remove(index)}
                                aria-label={`Remover ${file.name}`}
                              >
                                <X size={15} aria-hidden="true" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </fieldset>
                ) : (
                  <div className={styles.review}>
                    <span className={styles.reviewIcon}>
                      <Check size={22} aria-hidden="true" />
                    </span>
                    <h3>Um último olhar antes de ir para a rede.</h3>
                    <p>
                      Confira a mensagem, as mídias e o destino. Ao publicar, a
                      campanha começa ativa.
                    </p>
                    <dl>
                      <div>
                        <dt>Campanha</dt>
                        <dd>{draft.title}</dd>
                      </div>
                      <div>
                        <dt>Categoria</dt>
                        <dd>{adCategory(draft.niche)}</dd>
                      </div>
                      <div>
                        <dt>Mídias</dt>
                        <dd>
                          {files.length}{" "}
                          {files.length === 1 ? "arquivo" : "arquivos"}
                        </dd>
                      </div>
                      <div>
                        <dt>Exibições por mês</dt>
                        <dd>
                          Até {adNumber(limit.viewsPerCampaign)} nesta campanha
                        </dd>
                      </div>
                      <div>
                        <dt>Destino</dt>
                        <dd>
                          <a
                            href={adDestination(draft.productLink) ?? undefined}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {draft.productLink}
                          </a>
                        </dd>
                      </div>
                    </dl>
                    <p className={styles.notice}>
                      A veiculação segue a disponibilidade da rede e o limite da
                      campanha. Exibições não garantem cliques ou vendas.
                    </p>
                    {atLimit && (
                      <p className={styles.fieldError} role="alert">
                        O limite de campanhas do plano foi atingido.
                      </p>
                    )}
                  </div>
                )}
              </div>
              <aside className={styles.previewColumn}>
                <span className={styles.previewHeading}>
                  <ImagePlus size={14} aria-hidden="true" />
                  ASSIM O SEU ANÚNCIO PODE APARECER
                </span>
                <AdPreview
                  title={draft.title}
                  text={draft.adText}
                  link={draft.productLink}
                  media={media}
                />
              </aside>
            </div>
            <div className={styles.composerFooter}>
              <div>
                {submitting ? (
                  <p className={styles.sending} role="status">
                    <Loader2
                      size={15}
                      className={styles.spinner}
                      aria-hidden="true"
                    />
                    {progress?.phase === "uploading"
                      ? `Enviando mídia ${progress.current} de ${progress.total}…`
                      : "Publicando campanha…"}
                  </p>
                ) : discard ? (
                  <div className={styles.discard}>
                    <span>Limpar os dados do rascunho?</span>
                    <button
                      type="button"
                      className={styles.textButton}
                      onClick={reset}
                    >
                      Sim, limpar
                    </button>
                    <button
                      type="button"
                      className={styles.textButton}
                      onClick={() => setDiscard(false)}
                    >
                      Manter rascunho
                    </button>
                  </div>
                ) : (
                  <>
                    <span className={styles.draftNote}>
                      Rascunho mantido enquanto você estiver nesta página.
                    </span>
                    {dirty && (
                      <button
                        type="button"
                        className={styles.textButton}
                        onClick={() => setDiscard(true)}
                      >
                        Limpar rascunho
                      </button>
                    )}
                  </>
                )}
              </div>
              <div className={styles.footerActions}>
                {step === 2 && (
                  <button
                    type="button"
                    className={styles.secondary}
                    disabled={submitting}
                    onClick={() => setStep(1)}
                  >
                    <ArrowLeft size={14} aria-hidden="true" />
                    Editar
                  </button>
                )}
                <button
                  type="submit"
                  className={styles.primary}
                  disabled={submitting || (step === 2 && atLimit)}
                >
                  {submitting ? (
                    <Loader2
                      size={15}
                      className={styles.spinner}
                      aria-hidden="true"
                    />
                  ) : (
                    <ArrowRight size={15} aria-hidden="true" />
                  )}
                  {submitting
                    ? "Publicando…"
                    : step === 1
                      ? "Revisar anúncio"
                      : "Publicar campanha"}
                </button>
              </div>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
