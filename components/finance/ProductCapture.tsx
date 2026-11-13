"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useAction, useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import type { FunctionArgs } from "convex/server";
import { z } from "zod";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Camera,
  ImagePlus,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Loader2,
  Package,
  Plus,
  ScanLine,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  expandOptions,
  optionLabel,
  readOptionValues,
  parseRetailNumber,
  retailMoney,
  retailNumber,
  retailUnits,
  validateCapture,
  type ProductCaptureInput,
} from "@/lib/retail";
import { prepareProductPhoto } from "@/lib/retail-photo";
import { BarcodeScanner } from "./BarcodeScanner";
import { ProductLabels, type LabelProduct } from "./ProductLabels";
import { ProductOptionValues } from "./ProductOptionValues";
import styles from "./retail.module.css";

const rowSchema = z.object({
  options: z
    .array(z.object({ name: z.string().max(40), value: z.string().max(60) }))
    .max(2),
  quantity: z.string().max(30),
  barcode: z.string().max(128),
});
const draftSchema = z.object({
  name: z.string().max(100),
  category: z.string().max(80),
  description: z.string().max(1500),
  cost: z.string().max(30),
  price: z.string().max(30),
  quantity: z.string().max(30),
  unit: z.string().max(10),
  barcode: z.string().max(128),
  photo: z.string().max(650000),
  hasOptions: z.boolean(),
  axes: z
    .array(z.object({ name: z.string().max(40), values: z.string().max(1500) }))
    .max(2),
  rows: z.array(rowSchema).max(60),
});
type Draft = z.infer<typeof draftSchema>;
type Payload = FunctionArgs<typeof api.retail.createProducts>;
const pendingSchema = z.object({
  requestId: z.string().min(12).max(100),
  businessId: z.string().optional(),
  name: z.string(),
  category: z.string().optional(),
  description: z.string().optional(),
  costPrice: z.number(),
  salePrice: z.number(),
  unit: z.string(),
  photoId: z.string().optional(),
  variants: z.array(
    z.object({
      options: z.array(z.object({ name: z.string(), value: z.string() })),
      stock: z.number(),
      barcode: z.string().optional(),
    }),
  ),
});
const freshDraft = (): Draft => ({
  name: "",
  category: "",
  description: "",
  cost: "",
  price: "",
  quantity: "",
  unit: "un",
  barcode: "",
  photo: "",
  hasOptions: false,
  axes: [{ name: "", values: "" }],
  rows: [],
});
const keyFor = (options: { name: string; value: string }[]) =>
  JSON.stringify(options);
function loadDraft(key: string) {
  try {
    const value = sessionStorage.getItem(key);
    if (!value || value.length > 900000) return null;
    const parsed = JSON.parse(value);
    const draft = draftSchema.safeParse(parsed.draft);
    const pending = pendingSchema.safeParse(parsed.pending);
    if (!draft.success) return null;
    return {
      draft: draft.data,
      pending: pending.success ? (pending.data as Payload) : null,
    };
  } catch {
    return null;
  }
}

export function ProductCapture(props: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialCode?: string;
  seed?: Doc<"products"> | null;
}) {
  const { user } = useUser();
  return user ? (
    <CaptureForm key={user.id} {...props} userId={user.id} />
  ) : null;
}
function CaptureForm({
  open,
  onClose,
  onSaved,
  userId,
  initialCode,
  seed,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  userId: string;
  initialCode?: string;
  seed?: Doc<"products"> | null;
}) {
  const storageKey = `freelinnk:product-capture:v1:${userId}`;
  const [draft, setDraft] = useState<Draft>(freshDraft);
  const [hydrated, setHydrated] = useState(false);
  const [pending, setPending] = useState<Payload | null>(null);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [error, setError] = useState("");
  const [available, setAvailable] = useState(false);
  const [suggestion, setSuggestion] = useState<{
    name: string;
    category: string;
    description: string;
  } | null>(null);
  const [suggesting, setSuggesting] = useState(false);
  const [scanTarget, setScanTarget] = useState<number | null>(null);
  const [saved, setSaved] = useState<LabelProduct[]>([]);
  const [labels, setLabels] = useState(false);
  const [incomingCode, setIncomingCode] = useState<string | null>(null);
  const handledCode = useRef<string | undefined>(undefined),
    handledSeed = useRef<string | undefined>(undefined);
  const saveLock = useRef(false);
  const photoVersion = useRef(0);
  const photoInput = useRef<HTMLInputElement>(null),
    fileInput = useRef<HTMLInputElement>(null);
  const formId = useId();
  const createProducts = useMutation(api.retail.createProducts);
  const storePhoto = useAction(api.retail.storeProductPhoto);
  useEffect(() => {
    const cached = loadDraft(storageKey);
    if (cached) {
      setDraft(cached.draft);
      setPending(cached.pending);
      if (cached.pending) setStep(2);
    }
    setHydrated(true);
  }, [storageKey]);
  useEffect(() => {
    if (!hydrated || saved.length) return;
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({ draft, pending }));
    } catch {
      /* keep the in-memory draft */
    }
  }, [draft, pending, hydrated, storageKey, saved.length]);
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void fetch("/api/retail/describe", { cache: "no-store" })
      .then((result) => result.json())
      .then((value) => {
        if (!cancelled) setAvailable(value.available === true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [open]);
  useEffect(() => {
    if (!initialCode) {
      handledCode.current = undefined;
      return;
    }
    if (!open || !hydrated || handledCode.current === initialCode) return;
    handledCode.current = initialCode;
    if (pending || draft.name || draft.photo || draft.cost)
      setIncomingCode(initialCode);
    else setDraft((value) => ({ ...value, barcode: initialCode }));
  }, [
    initialCode,
    open,
    hydrated,
    pending,
    draft.name,
    draft.photo,
    draft.cost,
  ]);
  useEffect(() => {
    if (!seed) {
      handledSeed.current = undefined;
      return;
    }
    if (!open || !hydrated || handledSeed.current === seed._id) return;
    handledSeed.current = seed._id;
    if (pending) {
      setError("Confirme o cadastro pendente antes de duplicar outro produto.");
      return;
    }
    setDraft({
      ...freshDraft(),
      name: `${seed.name} (cópia)`.slice(0, 100),
      category: seed.category || "",
      description: seed.description || "",
      cost: String(seed.costPrice),
      price: String(seed.salePrice),
      unit: seed.unit || "un",
    });
    setStep(0);
    setSaved([]);
    setSuggestion(null);
  }, [seed, open, hydrated, pending]);
  const update = <K extends keyof Draft>(field: K, value: Draft[K]) => {
    setError("");
    setDraft((current) => ({ ...current, [field]: value }));
  };
  const input: ProductCaptureInput = {
    name: draft.name,
    category: draft.category || undefined,
    description: draft.description || undefined,
    costPrice: parseRetailNumber(draft.cost),
    salePrice: parseRetailNumber(draft.price),
    unit: draft.unit,
    variants: draft.hasOptions
      ? draft.rows.map((row) => ({
          options: row.options,
          stock: parseRetailNumber(row.quantity),
          barcode: row.barcode || undefined,
        }))
      : [
          {
            options: [],
            stock: parseRetailNumber(draft.quantity),
            barcode: draft.barcode || undefined,
          },
        ],
  };
  const locked = busy || Boolean(pending);
  const changeRow = (
    index: number,
    field: "quantity" | "barcode",
    value: string,
  ) =>
    update(
      "rows",
      draft.rows.map((row, i) =>
        i === index ? { ...row, [field]: value } : row,
      ),
    );
  function makeRows() {
    setError("");
    try {
      if (
        draft.axes.some(
          (axis) => !axis.name.trim() || !readOptionValues(axis.values).length,
        )
      )
        throw new Error("Dê um nome ao grupo e adicione pelo menos uma opção.");
      const options = expandOptions(
        draft.axes.map((axis) => ({
          name: axis.name,
          values: readOptionValues(axis.values),
        })),
      );
      const existing = new Map(
        draft.rows.map((row) => [keyFor(row.options), row]),
      );
      update(
        "rows",
        options.map(
          (row) =>
            existing.get(keyFor(row)) || {
              options: row,
              quantity: "",
              barcode: "",
            },
        ),
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Confira as opções do produto.",
      );
    }
  }
  async function photo(file?: File) {
    if (!file || locked) return;
    photoVersion.current++;
    setPhotoBusy(true);
    setError("");
    setSuggestion(null);
    try {
      update("photo", await prepareProductPhoto(file));
    } catch (error) {
      setError(error instanceof Error ? error.message : "Escolha outra foto.");
    } finally {
      setPhotoBusy(false);
      if (photoInput.current) photoInput.current.value = "";
      if (fileInput.current) fileInput.current.value = "";
    }
  }
  async function suggest() {
    if (!draft.photo || suggesting) return;
    const version = photoVersion.current;
    setSuggesting(true);
    setError("");
    try {
      const result = await fetch("/api/retail/describe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl: draft.photo }),
        signal: AbortSignal.timeout(25000),
      });
      const data = await result.json();
      if (version !== photoVersion.current) return;
      if (!result.ok)
        throw new Error(
          data.error || "Não foi possível sugerir os dados agora.",
        );
      if (
        typeof data.name !== "string" ||
        typeof data.category !== "string" ||
        typeof data.description !== "string"
      )
        throw new Error("Confira o nome do produto e continue sem a sugestão.");
      setSuggestion(data);
    } catch (error) {
      if (version === photoVersion.current)
        setError(
          error instanceof Error
            ? error.message
            : "Preencha o nome para continuar.",
        );
    } finally {
      setSuggesting(false);
    }
  }
  function next() {
    setError("");
    if (step === 0 && !draft.name.trim())
      return setError(
        "Como você chama este produto? Preencha o nome para continuar.",
      );
    if (step === 1) {
      const errors = validateCapture(input);
      if (errors.length) return setError(errors[0]);
      if (draft.hasOptions) {
        try {
          const expected = expandOptions(
            draft.axes.map((axis) => ({
              name: axis.name,
              values: readOptionValues(axis.values),
            })),
          );
          if (
            JSON.stringify(expected) !==
            JSON.stringify(draft.rows.map((row) => row.options))
          )
            return setError(
              "Clique em Montar lista de opções para atualizar as combinações antes de continuar.",
            );
        } catch (error) {
          return setError(
            error instanceof Error ? error.message : "Confira as opções.",
          );
        }
      }
    }
    setStep((value) => Math.min(2, value + 1));
  }
  async function save() {
    if (saveLock.current || photoBusy || !hydrated) return;
    const errors = validateCapture(input);
    if (!pending && errors.length) {
      setError(errors[0]);
      return;
    }
    saveLock.current = true;
    setBusy(true);
    setError("");
    let payload = pending;
    try {
      if (!payload) {
        const uploaded = draft.photo
          ? await storePhoto({ dataUrl: draft.photo })
          : undefined;
        payload = {
          ...input,
          requestId: crypto.randomUUID(),
          photoId: uploaded?.storageId,
        };
        setPending(payload);
        // Write synchronously before sending, so a reload can retry the exact same request.
        sessionStorage.setItem(
          storageKey,
          JSON.stringify({ draft, pending: payload }),
        );
      }
      const ids = await createProducts(payload);
      setSaved(
        ids.map((id, index) => ({
          _id: id,
          name:
            payload!.name.trim() +
            (optionLabel(payload!.variants[index].options)
              ? ` — ${optionLabel(payload!.variants[index].options)}`
              : ""),
          salePrice: payload!.salePrice,
          unit: payload!.unit,
        })),
      );
      setPending(null);
      try {
        sessionStorage.removeItem(storageKey);
      } catch {}
      onSaved();
    } catch (error) {
      if (error instanceof ConvexError) {
        setPending(null);
        setError(
          typeof error.data === "string"
            ? error.data
            : "Confira os dados do produto e tente novamente.",
        );
      } else
        setError(
          payload
            ? "Não foi possível confirmar o cadastro. Toque em Tentar novamente para conferir o mesmo envio, sem duplicar produtos."
            : error instanceof Error
              ? error.message
              : "Não consegui salvar agora. Seu cadastro foi mantido.",
        );
    } finally {
      saveLock.current = false;
      setBusy(false);
    }
  }
  function another() {
    const next = {
      ...draft,
      name: "",
      quantity: "",
      barcode: "",
      hasOptions: false,
      axes: [{ name: "", values: "" }],
      rows: [],
      photo: "",
    };
    setSaved([]);
    setDraft(next);
    setStep(0);
    setSuggestion(null);
    setError("");
  }
  function close() {
    if (!busy) {
      setError("");
      onClose();
    }
  }
  const totalQuantity = input.variants.reduce(
    (sum, row) => sum + (Number.isFinite(row.stock) ? row.stock : 0),
    0,
  );
  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!value) close();
        }}
      >
        <DialogContent
          className={`${styles.modal} ${styles.captureModal}`}
          onInteractOutside={(event) => {
            if (busy) event.preventDefault();
          }}
          onEscapeKeyDown={(event) => {
            if (busy) event.preventDefault();
          }}
        >
          {saved.length ? (
            <>
              <div className={styles.success}>
                <span>
                  <CheckCircle2 size={32} />
                </span>
                <p className={styles.eyebrow}>Pronto para vender</p>
                <DialogTitle>Produto cadastrado!</DialogTitle>
                <DialogDescription>
                  {saved.length === 1
                    ? "Você já pode encontrar este produto pela foto no catálogo."
                    : `As ${saved.length} opções foram cadastradas com estoques separados.`}
                </DialogDescription>
              </div>
              <div className={styles.successTip}>
                <ScanLine size={23} />
                <div>
                  <strong>Quer vender apontando a câmera?</strong>
                  <p>
                    Imprima as etiquetas e fixe nos produtos. Se já associou uma
                    etiqueta existente, ela também funciona.
                  </p>
                </div>
              </div>
              <div className={styles.successActions}>
                <button
                  type="button"
                  className={styles.primary}
                  onClick={() => setLabels(true)}
                >
                  Preparar etiquetas
                </button>
                <button
                  type="button"
                  className={styles.secondary}
                  onClick={another}
                >
                  Cadastrar outro parecido
                </button>
                <button
                  type="button"
                  className={styles.textButton}
                  onClick={() => {
                    setDraft(freshDraft());
                    setSaved([]);
                    setStep(0);
                    close();
                  }}
                >
                  Ver meus produtos
                </button>
              </div>
            </>
          ) : (
            <>
              <div className={styles.modalHeading}>
                <span className={styles.iconTile}>
                  <Package size={23} />
                </span>
                <div>
                  <p className={styles.eyebrow}>Um produto, poucos passos</p>
                  <DialogTitle>Cadastrar produto</DialogTitle>
                </div>
              </div>
              <DialogDescription>
                Comece pelo básico. A gente organiza o restante com você.
              </DialogDescription>
              {incomingCode && (
                <div className={styles.notice}>
                  <strong>Você já tem um cadastro em andamento.</strong>
                  <p>
                    {pending
                      ? "Confirme o envio pendente antes de cadastrar o produto desta etiqueta."
                      : "Quer continuar seu rascunho ou substituí-lo por um novo cadastro para a etiqueta que acabou de ler?"}
                  </p>
                  <div className={styles.inlineActions}>
                    <button
                      type="button"
                      className={styles.secondary}
                      onClick={() => setIncomingCode(null)}
                    >
                      Continuar meu rascunho
                    </button>
                    {!pending && (
                      <button
                        type="button"
                        className={styles.secondary}
                        onClick={() => {
                          setDraft({ ...freshDraft(), barcode: incomingCode });
                          setIncomingCode(null);
                          setStep(0);
                          setSaved([]);
                          setSuggestion(null);
                        }}
                      >
                        Novo produto desta etiqueta
                      </button>
                    )}
                  </div>
                </div>
              )}
              <ol className={styles.steps} aria-label="Etapas do cadastro">
                {["Seu produto", "Valores e estoque", "Conferir e salvar"].map(
                  (label, index) => (
                    <li
                      key={label}
                      data-active={index === step}
                      data-complete={index < step}
                    >
                      <span>
                        {index < step ? <Check size={13} /> : index + 1}
                      </span>
                      {label}
                    </li>
                  ),
                )}
              </ol>
              <div className={styles.captureBody}>
                {step === 0 && (
                  <fieldset
                    disabled={locked || !hydrated}
                    className={styles.fields}
                  >
                    <div className={styles.photoPicker}>
                      <div className={styles.photoFrame}>
                        {draft.photo ? (
                          <img
                            src={draft.photo}
                            alt="Foto do produto em cadastro"
                          />
                        ) : (
                          <ImagePlus size={36} />
                        )}
                      </div>
                      <div>
                        <h3>Vamos conhecer seu produto</h3>
                        <p>
                          Uma foto ajuda você a encontrá-lo depois. Pode
                          continuar sem foto também.
                        </p>
                        <div className={styles.inlineActions}>
                          <button
                            type="button"
                            className={styles.secondary}
                            onClick={() => photoInput.current?.click()}
                            disabled={photoBusy}
                          >
                            <Camera size={16} />
                            Tirar foto
                          </button>
                          <button
                            type="button"
                            className={styles.textButton}
                            onClick={() => fileInput.current?.click()}
                            disabled={photoBusy}
                          >
                            Escolher foto
                          </button>
                          {draft.photo && (
                            <button
                              type="button"
                              className={styles.textButton}
                              onClick={() => {
                                photoVersion.current++;
                                update("photo", "");
                                setSuggestion(null);
                              }}
                            >
                              Remover foto
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <input
                      ref={photoInput}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      hidden
                      onChange={(event) => void photo(event.target.files?.[0])}
                    />
                    <input
                      ref={fileInput}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(event) => void photo(event.target.files?.[0])}
                    />
                    {photoBusy && (
                      <p role="status" className={styles.hint}>
                        Preparando a foto…
                      </p>
                    )}
                    {draft.photo && available && (
                      <div className={styles.assist}>
                        <div>
                          <Sparkles size={18} />
                          <span>
                            A foto pode ajudar a preencher o nome e a descrição.
                            Você confere antes de usar.
                          </span>
                        </div>
                        <button
                          type="button"
                          className={styles.secondary}
                          onClick={suggest}
                          disabled={suggesting}
                        >
                          {suggesting ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Sparkles size={16} />
                          )}
                          Sugerir dados pela foto
                        </button>
                      </div>
                    )}
                    {suggestion && (
                      <div className={styles.suggestion}>
                        <span className={styles.eyebrow}>
                          Sugestão para conferir
                        </span>
                        <strong>{suggestion.name}</strong>
                        <p>{suggestion.description}</p>
                        <button
                          type="button"
                          className={styles.secondary}
                          onClick={() => {
                            setDraft((value) => ({
                              ...value,
                              name: suggestion.name,
                              category: suggestion.category,
                              description: suggestion.description,
                            }));
                            setSuggestion(null);
                          }}
                        >
                          Usar esta sugestão
                        </button>
                      </div>
                    )}
                    <label className={styles.field} htmlFor={`${formId}-name`}>
                      Como você chama este produto?
                      <input
                        id={`${formId}-name`}
                        autoComplete="off"
                        value={draft.name}
                        onChange={(event) => update("name", event.target.value)}
                        maxLength={100}
                        placeholder="Ex.: Café especial, caderno, camiseta…"
                      />
                      <small>
                        Escolha um nome que fique fácil de encontrar na hora de
                        vender.
                      </small>
                    </label>
                    <details className={styles.optional}>
                      <summary>
                        Adicionar categoria e descrição <span>Opcional</span>
                      </summary>
                      <label className={styles.field}>
                        Categoria
                        <input
                          value={draft.category}
                          onChange={(event) =>
                            update("category", event.target.value)
                          }
                          maxLength={80}
                          placeholder="Ex.: Alimentos, papelaria, acessórios"
                        />
                      </label>
                      <label className={styles.field}>
                        Descrição
                        <textarea
                          value={draft.description}
                          onChange={(event) =>
                            update("description", event.target.value)
                          }
                          rows={3}
                          maxLength={1500}
                          placeholder="Detalhes que ajudam a reconhecer o produto"
                        />
                      </label>
                    </details>
                  </fieldset>
                )}
                {step === 1 && (
                  <fieldset disabled={locked} className={styles.fields}>
                    <div className={styles.sectionIntro}>
                      <h3>Quanto custa e quantos você tem?</h3>
                      <p>
                        Informe os valores por{" "}
                        <strong>
                          {retailUnits
                            .find((unit) => unit.value === draft.unit)
                            ?.label.toLowerCase()}
                        </strong>{" "}
                        do produto.
                      </p>
                    </div>
                    <label className={styles.field}>
                      Como você vende?
                      <select
                        value={draft.unit}
                        onChange={(event) => update("unit", event.target.value)}
                      >
                        {retailUnits.map((unit) => (
                          <option key={unit.value} value={unit.value}>
                            {unit.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className={styles.twoColumns}>
                      <label className={styles.field}>
                        Quanto você pagou? <span>R$ por {draft.unit}</span>
                        <input
                          inputMode="decimal"
                          value={draft.cost}
                          onChange={(event) =>
                            update("cost", event.target.value)
                          }
                          placeholder="Ex.: 25,00"
                        />
                        <small>Se não houve custo, informe 0.</small>
                      </label>
                      <label className={styles.field}>
                        Por quanto vai vender? <span>R$ por {draft.unit}</span>
                        <input
                          inputMode="decimal"
                          value={draft.price}
                          onChange={(event) =>
                            update("price", event.target.value)
                          }
                          placeholder="Ex.: 49,90"
                        />
                      </label>
                    </div>
                    {Number.isFinite(input.costPrice) &&
                      Number.isFinite(input.salePrice) &&
                      input.salePrice > 0 && (
                        <p
                          className={
                            input.salePrice < input.costPrice
                              ? styles.notice
                              : styles.hint
                          }
                        >
                          Diferença entre venda e custo:{" "}
                          <strong>
                            {retailMoney(input.salePrice - input.costPrice)}
                          </strong>{" "}
                          por {draft.unit}, antes de outros gastos.
                          {input.salePrice < input.costPrice &&
                            " Você está vendendo abaixo do custo. Confira se é isso mesmo."}
                        </p>
                      )}
                    <label className={styles.optionToggle}>
                      <input
                        type="checkbox"
                        checked={draft.hasOptions}
                        onChange={(event) =>
                          update("hasOptions", event.target.checked)
                        }
                      />
                      <div>
                        <strong>Tem tamanhos, cores ou outras opções?</strong>
                        <span>
                          Ative para controlar a quantidade de cada opção
                          separadamente.
                        </span>
                      </div>
                    </label>
                    {!draft.hasOptions ? (
                      <>
                        <label className={styles.field}>
                          Quanto você tem no estoque?{" "}
                          <span>
                            {
                              retailUnits.find(
                                (unit) => unit.value === draft.unit,
                              )?.plural
                            }
                          </span>
                          <input
                            inputMode={
                              draft.unit === "un" ? "numeric" : "decimal"
                            }
                            value={draft.quantity}
                            onChange={(event) =>
                              update("quantity", event.target.value)
                            }
                            placeholder="Ex.: 10"
                          />
                          <small>
                            Informe 0 se ainda não recebeu o produto.
                          </small>
                        </label>
                        <details className={styles.optional}>
                          <summary>
                            Já tem código de barras na etiqueta?{" "}
                            <span>Opcional</span>
                          </summary>
                          <p>
                            Associe a etiqueta ao produto. Se não tiver, vamos
                            gerar uma própria depois.
                          </p>
                          <div className={styles.codeField}>
                            <label className={styles.field}>
                              Código da etiqueta
                              <input
                                value={draft.barcode}
                                onChange={(event) =>
                                  update("barcode", event.target.value)
                                }
                                placeholder="Leia ou digite o código"
                                maxLength={128}
                              />
                            </label>
                            <button
                              type="button"
                              className={styles.secondary}
                              onClick={() => setScanTarget(-1)}
                            >
                              <ScanLine size={17} />
                              Ler etiqueta
                            </button>
                          </div>
                        </details>
                      </>
                    ) : (
                      <div className={styles.optionBuilder}>
                        <p>
                          Quais são as opções? Por exemplo:{" "}
                          <strong>Cor → Azul, Verde</strong> ou{" "}
                          <strong>Volume → 100 ml, 200 ml</strong>.
                        </p>
                        {draft.axes.map((axis, index) => (
                          <div key={index} className={styles.axisRow}>
                            <label className={styles.field}>
                              Nome da opção
                              <input
                                value={axis.name}
                                maxLength={40}
                                onChange={(event) =>
                                  update(
                                    "axes",
                                    draft.axes.map((value, i) =>
                                      i === index
                                        ? { ...value, name: event.target.value }
                                        : value,
                                    ),
                                  )
                                }
                                placeholder="Ex.: Tamanho"
                              />
                            </label>
                            <ProductOptionValues
                              name={axis.name}
                              value={axis.values}
                              onChange={(items) =>
                                update(
                                  "axes",
                                  draft.axes.map((value, i) =>
                                    i === index
                                      ? { ...value, values: items }
                                      : value,
                                  ),
                                )
                              }
                            />
                            {index > 0 && (
                              <button
                                type="button"
                                aria-label="Remover segunda opção"
                                className={styles.textButton}
                                onClick={() =>
                                  update(
                                    "axes",
                                    draft.axes.filter((_, i) => i !== index),
                                  )
                                }
                              >
                                <Trash2 size={17} />
                              </button>
                            )}
                          </div>
                        ))}
                        <div className={styles.inlineActions}>
                          {draft.axes.length < 2 && (
                            <button
                              type="button"
                              className={styles.textButton}
                              onClick={() =>
                                update("axes", [
                                  ...draft.axes,
                                  { name: "", values: "" },
                                ])
                              }
                            >
                              <Plus size={15} />
                              Adicionar outra opção
                            </button>
                          )}
                          <button
                            type="button"
                            className={styles.secondary}
                            onClick={makeRows}
                          >
                            Montar lista de opções
                          </button>
                        </div>
                        {draft.rows.length > 0 && (
                          <div className={styles.variantRows}>
                            <p>
                              <strong>{draft.rows.length} opções.</strong>{" "}
                              Informe quanto tem de cada uma. Etiquetas
                              existentes são opcionais.
                            </p>
                            {draft.rows.map((row, index) => (
                              <div
                                className={styles.variantRow}
                                key={keyFor(row.options)}
                              >
                                <strong>{optionLabel(row.options)}</strong>
                                <label className={styles.field}>
                                  Estoque ({draft.unit})
                                  <input
                                    inputMode="decimal"
                                    aria-label={`Estoque de ${optionLabel(row.options)}`}
                                    value={row.quantity}
                                    onChange={(event) =>
                                      changeRow(
                                        index,
                                        "quantity",
                                        event.target.value,
                                      )
                                    }
                                    placeholder="0"
                                  />
                                </label>
                                <div className={styles.variantCode}>
                                  <input
                                    aria-label={`Código de ${optionLabel(row.options)}`}
                                    value={row.barcode}
                                    onChange={(event) =>
                                      changeRow(
                                        index,
                                        "barcode",
                                        event.target.value,
                                      )
                                    }
                                    placeholder="Código existente (opcional)"
                                    maxLength={128}
                                  />
                                  <button
                                    type="button"
                                    aria-label={`Ler etiqueta de ${optionLabel(row.options)}`}
                                    className={styles.secondary}
                                    onClick={() => setScanTarget(index)}
                                  >
                                    <ScanLine size={17} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </fieldset>
                )}
                {step === 2 && (
                  <div className={styles.fields}>
                    <div className={styles.sectionIntro}>
                      <h3>Está tudo certo?</h3>
                      <p>
                        Confira o nome, os valores e as quantidades. Nada é
                        cadastrado até você salvar.
                      </p>
                    </div>
                    <div className={styles.reviewProduct}>
                      {draft.photo ? (
                        <img src={draft.photo} alt="Produto para conferir" />
                      ) : (
                        <span className={styles.reviewPlaceholder}>
                          <Package size={27} />
                        </span>
                      )}
                      <div>
                        <h3>{draft.name}</h3>
                        <p>{draft.category || "Produto da sua loja"}</p>
                      </div>
                    </div>
                    <div className={styles.reviewStats}>
                      <div>
                        <span>Custo por {draft.unit}</span>
                        <strong>{retailMoney(input.costPrice)}</strong>
                      </div>
                      <div>
                        <span>Venda por {draft.unit}</span>
                        <strong>{retailMoney(input.salePrice)}</strong>
                      </div>
                      <div>
                        <span>Estoque total</span>
                        <strong>
                          {retailNumber(totalQuantity)} {draft.unit}
                        </strong>
                      </div>
                    </div>
                    <div className={styles.reviewRows}>
                      {input.variants.map((row, index) => (
                        <div key={index}>
                          <span>
                            {optionLabel(row.options) || "Produto sem opções"}
                          </span>
                          <strong>
                            {retailNumber(row.stock)} {draft.unit}
                          </strong>
                          <small>
                            {row.barcode
                              ? `Etiqueta: ${row.barcode}`
                              : "Etiqueta própria disponível após salvar"}
                          </small>
                        </div>
                      ))}
                    </div>
                    <p className={styles.hint}>
                      <CheckCircle2 size={16} />
                      Você também poderá vender tocando na foto, sem precisar
                      imprimir etiquetas.
                    </p>
                    {pending && (
                      <p role="status" className={styles.notice}>
                        Este envio está aguardando confirmação. Tente novamente
                        com os mesmos dados para evitar cadastros duplicados.
                      </p>
                    )}
                  </div>
                )}
              </div>
              {error && (
                <p role="alert" className={styles.error}>
                  {error}
                </p>
              )}
              <div className={styles.footer}>
                <button
                  type="button"
                  className={styles.secondary}
                  disabled={locked}
                  onClick={() => {
                    setError("");
                    if (step > 0) setStep(step - 1);
                    else close();
                  }}
                >
                  <ArrowLeft size={16} />
                  {step ? "Voltar" : "Continuar depois"}
                </button>
                {step < 2 ? (
                  <button
                    type="button"
                    className={styles.primary}
                    disabled={photoBusy || !hydrated}
                    onClick={next}
                  >
                    Continuar
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    className={styles.primary}
                    disabled={busy}
                    onClick={save}
                  >
                    {busy ? (
                      <Loader2 className="animate-spin" size={17} />
                    ) : (
                      <Check size={17} />
                    )}{" "}
                    {pending && !busy ? "Tentar novamente" : "Salvar produto"}
                  </button>
                )}
              </div>
              <p className={styles.draftNote}>
                Seu rascunho fica neste navegador durante esta sessão.
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={scanTarget !== null}
        onOpenChange={(value) => {
          if (!value) setScanTarget(null);
        }}
      >
        <DialogContent className={`${styles.modal} ${styles.scanModal}`}>
          <DialogTitle>Ler etiqueta do produto</DialogTitle>
          <DialogDescription>
            Posicione o código dentro da câmera. O código será preenchido no
            cadastro.
          </DialogDescription>
          {scanTarget !== null && (
            <BarcodeScanner
              onScan={(code) => {
                if (scanTarget === -1) update("barcode", code);
                else changeRow(scanTarget, "barcode", code);
                setScanTarget(null);
              }}
            />
          )}
          <button
            type="button"
            className={styles.secondary}
            onClick={() => setScanTarget(null)}
          >
            Voltar ao cadastro
          </button>
        </DialogContent>
      </Dialog>
      <ProductLabels
        open={labels}
        onClose={() => setLabels(false)}
        products={saved}
      />
    </>
  );
}
