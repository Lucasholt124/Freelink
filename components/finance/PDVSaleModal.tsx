"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import type { FunctionArgs } from "convex/server";
import { z } from "zod";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  Loader2,
  Minus,
  Package,
  Plus,
  ScanLine,
  Search,
  ShoppingBag,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import {
  allowsFraction,
  cartTotals,
  findScannedProducts,
  parseRetailNumber,
  retailMoney,
  retailNumber,
  roundMoney,
  roundQuantity,
  searchRetailProducts,
  validQuantity,
  validateSaleDate,
} from "@/lib/retail";
import { BarcodeScanner } from "./BarcodeScanner";
import styles from "./retail.module.css";

type Payload = FunctionArgs<typeof api.profitCalculator.addPDVSale>;
type CartRow = { productId: string; quantity: string };
const cartSchema = z
  .array(z.object({ productId: z.string(), quantity: z.string().max(30) }))
  .max(100);
const payloadSchema = z.object({
  requestId: z.string().min(12).max(100),
  businessId: z.string().optional(),
  customerId: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        productName: z.string(),
        quantity: z.number(),
        costPrice: z.number(),
        salePrice: z.number(),
      }),
    )
    .min(1)
    .max(100),
  discount: z.number().optional(),
  date: z.string(),
  paymentMethod: z.string().optional(),
  paymentStatus: z.string().optional(),
  notes: z.string().optional(),
});
const brazilToday = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
const paymentMethods = [
  { id: "pix", label: "PIX" },
  { id: "cash", label: "Dinheiro" },
  { id: "credit_card", label: "Cartão de crédito" },
  { id: "debit_card", label: "Cartão de débito" },
  { id: "bank_transfer", label: "Transferência" },
  { id: "other", label: "Outra forma" },
];

export function PDVSaleModal({
  isOpen,
  onClose,
  products,
  customers,
  businessId,
  onCreateProduct,
}: {
  isOpen: boolean;
  onClose: () => void;
  products: Doc<"products">[];
  customers: Doc<"customers">[];
  businessId?: Id<"businesses">;
  onCreateProduct?: (code?: string) => void;
}) {
  const { user } = useUser();
  const [cart, setCart] = useState<CartRow[]>([]);
  const [term, setTerm] = useState("");
  const [page, setPage] = useState(1);
  const [matches, setMatches] = useState<string[] | null>(null);
  const [scanner, setScanner] = useState(false);
  const [code, setCode] = useState("");
  const [unknown, setUnknown] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [discount, setDiscount] = useState("");
  const [customerId, setCustomerId] = useState("none");
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [paymentStatus, setPaymentStatus] = useState<"paid" | "pending">(
    "paid",
  );
  const [date, setDate] = useState(brazilToday);
  const [review, setReview] = useState<Payload | null>(null);
  const [pending, setPending] = useState<Payload | null>(null);
  const [busy, setBusy] = useState(false);
  const [complete, setComplete] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [measured, setMeasured] = useState<Doc<"products"> | null>(null);
  const [measure, setMeasure] = useState("");
  const [measureError, setMeasureError] = useState("");
  const lock = useRef(false);
  const cartRef = useRef<HTMLDivElement>(null),
    catalogRef = useRef<HTMLDivElement>(null);
  const checkout = useMutation(api.profitCalculator.addPDVSale);
  const storageKey = user
    ? `freelinnk:retail-sale:v1:${user.id}:${businessId || "default"}`
    : null;
  useEffect(() => {
    if (!storageKey || !isOpen) return;
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw && raw.length < 100000) {
        const cache = JSON.parse(raw),
          rows = cartSchema.safeParse(cache.cart),
          sent = payloadSchema.safeParse(cache.pending);
        if (rows.success) setCart(rows.data);
        if (typeof cache.discount === "string")
          setDiscount(cache.discount.slice(0, 30));
        if (typeof cache.customerId === "string")
          setCustomerId(cache.customerId);
        if (paymentMethods.some((method) => method.id === cache.paymentMethod))
          setPaymentMethod(cache.paymentMethod);
        if (cache.paymentStatus === "paid" || cache.paymentStatus === "pending")
          setPaymentStatus(cache.paymentStatus);
        if (typeof cache.date === "string" && validateSaleDate(cache.date))
          setDate(cache.date);
        if (sent.success) {
          setPending(sent.data as Payload);
          setReview(sent.data as Payload);
        }
      }
    } catch {
      /* ignore an unreadable local draft */
    }
    setHydrated(true);
  }, [storageKey, isOpen]);
  useEffect(() => {
    if (!hydrated || !storageKey || complete) return;
    try {
      sessionStorage.setItem(
        storageKey,
        JSON.stringify({
          cart,
          discount,
          customerId,
          paymentMethod,
          paymentStatus,
          date,
          pending,
        }),
      );
    } catch {}
  }, [
    cart,
    discount,
    customerId,
    paymentMethod,
    paymentStatus,
    date,
    pending,
    hydrated,
    storageKey,
    complete,
  ]);
  useEffect(() => {
    setPage(1);
  }, [term, matches]);
  const productMap = useMemo(
    () => new Map(products.map((product) => [product._id as string, product])),
    [products],
  );
  const cartItems = cart.flatMap((row) => {
    const product = productMap.get(row.productId);
    return product
      ? [
          {
            product,
            quantity: parseRetailNumber(row.quantity),
            text: row.quantity,
          },
        ]
      : [];
  });
  const missing = cartItems.length !== cart.length;
  const quantityError = cartItems.find(
    (item) =>
      !item.product.active ||
      !validQuantity(item.quantity, item.product.unit || "un") ||
      (item.product.stock !== undefined && item.quantity > item.product.stock),
  );
  const discountValue = discount.trim() ? parseRetailNumber(discount) : 0;
  const totals = cartTotals(
    cartItems
      .filter((item) => Number.isFinite(item.quantity))
      .map((item) => ({
        quantity: item.quantity,
        salePrice: item.product.salePrice,
        costPrice: item.product.costPrice,
      })),
    Number.isFinite(discountValue) ? discountValue : 0,
  );
  const catalog = useMemo(
    () =>
      matches
        ? products.filter(
            (product) => product.active && matches.includes(product._id),
          )
        : searchRetailProducts(products, term),
    [products, term, matches],
  );
  const totalPages = Math.max(1, Math.ceil(catalog.length / 9));
  const visible = catalog.slice(
    (Math.min(page, totalPages) - 1) * 9,
    Math.min(page, totalPages) * 9,
  );
  const locked = busy || Boolean(pending);
  function add(product: Doc<"products">, quantity = 1) {
    if (locked) return;
    const existing = cart.find((row) => row.productId === product._id);
    const amount = roundQuantity(
      (existing ? parseRetailNumber(existing.quantity) : 0) + quantity,
    );
    if (
      !product.active ||
      !validQuantity(amount, product.unit || "un") ||
      (product.stock !== undefined && amount > product.stock)
    ) {
      setError(
        `Confira o estoque de ${product.name}. Disponível: ${retailNumber(product.stock ?? 0)} ${product.unit || "un"}.`,
      );
      return;
    }
    setCart((current) =>
      existing
        ? current.map((row) =>
            row.productId === product._id
              ? { ...row, quantity: String(amount) }
              : row,
          )
        : [...current, { productId: product._id, quantity: String(quantity) }],
    );
    setError("");
    setMessage(`${product.name} adicionado à sacola.`);
    setUnknown("");
  }
  function choose(product: Doc<"products">) {
    if (allowsFraction(product.unit)) {
      setMeasured(product);
      setMeasure("");
      setMeasureError("");
    } else add(product);
  }
  function scan(value: string) {
    setScanner(false);
    setCode(value);
    setError("");
    setMessage("");
    const found = findScannedProducts(products, value);
    if (found.length === 1) {
      setMatches(null);
      choose(found[0]);
    } else if (found.length > 1) {
      setMatches(found.map((product) => product._id));
      setUnknown("");
      setMessage(
        "Essa etiqueta está em mais de um cadastro. Escolha o produto correto abaixo.",
      );
    } else {
      setUnknown(value.trim());
      setMatches(null);
    }
  }
  function updateQuantity(product: Doc<"products">, value: string) {
    setError("");
    setCart((rows) =>
      rows.map((row) =>
        row.productId === product._id ? { ...row, quantity: value } : row,
      ),
    );
  }
  function reviewSale() {
    setError("");
    if (!cart.length)
      return setError("Adicione um produto à sacola para continuar.");
    if (missing)
      return setError(
        "Um produto não está mais disponível. Remova-o da sacola antes de continuar.",
      );
    if (quantityError)
      return setError(
        `Confira a quantidade e o estoque de ${quantityError.product.name}.`,
      );
    if (
      !Number.isFinite(discountValue) ||
      discountValue < 0 ||
      discountValue > totals.subtotal ||
      roundMoney(discountValue) !== discountValue
    )
      return setError(
        "Confira o desconto: use um valor entre zero e o subtotal, com até duas casas decimais.",
      );
    if (!validateSaleDate(date) || date > brazilToday())
      return setError("Confira a data. Ela não pode estar no futuro.");
    if (
      customerId !== "none" &&
      !customers.some((customer) => customer._id === customerId)
    )
      return setError(
        "Escolha um cliente disponível ou selecione Sem cliente.",
      );
    setReview({
      requestId: crypto.randomUUID(),
      businessId,
      customerId:
        customerId === "none" ? undefined : (customerId as Id<"customers">),
      items: cartItems.map((item) => ({
        productId: item.product._id,
        productName: item.product.name,
        quantity: item.quantity,
        costPrice: item.product.costPrice,
        salePrice: item.product.salePrice,
      })),
      discount: discountValue || undefined,
      date,
      paymentMethod,
      paymentStatus,
      notes: "Venda pela câmera ou catálogo",
    });
  }
  async function confirm() {
    if (!review || lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    const payload = pending || review;
    setPending(payload);
    try {
      if (storageKey)
        sessionStorage.setItem(
          storageKey,
          JSON.stringify({
            cart,
            discount,
            customerId,
            paymentMethod,
            paymentStatus,
            date,
            pending: payload,
          }),
        );
      await checkout(payload);
      setComplete(true);
      setPending(null);
      try {
        if (storageKey) sessionStorage.removeItem(storageKey);
      } catch {}
    } catch (error) {
      if (error instanceof ConvexError) {
        setPending(null);
        setReview(null);
        setError(
          typeof error.data === "string"
            ? error.data
            : "Confira os dados da venda e tente novamente.",
        );
      } else
        setError(
          "Não foi possível confirmar a venda. Toque em Tentar novamente para verificar o mesmo envio, sem registrar duas vezes.",
        );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  const reviewTotals = review
    ? cartTotals(review.items, review.discount || 0)
    : totals;
  const selectedCustomer = customers.find(
    (customer) => customer._id === (review?.customerId || customerId),
  );
  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(value) => {
          if (!value && !busy) onClose();
        }}
      >
        <DialogContent
          className={`${styles.modal} ${styles.posModal}`}
          onEscapeKeyDown={(event) => {
            if (busy) event.preventDefault();
          }}
          onInteractOutside={(event) => {
            if (busy) event.preventDefault();
          }}
        >
          <header className={styles.posHeader}>
            <div className={styles.modalHeading}>
              <span className={styles.iconTile}>
                <ShoppingCart size={22} />
              </span>
              <div>
                <p className={styles.eyebrow}>Sua loja na palma da mão</p>
                <DialogTitle>
                  {complete
                    ? "Venda registrada"
                    : review
                      ? "Confira sua venda"
                      : "Vamos vender?"}
                </DialogTitle>
              </div>
            </div>
            <DialogDescription>
              {complete
                ? "Estoque e registros do negócio foram atualizados."
                : review
                  ? "Confira os produtos e o pagamento. O estoque só muda quando você confirmar."
                  : "Aponte para a etiqueta ou toque na foto do produto. Depois, confira e confirme a venda."}
            </DialogDescription>
          </header>
          {complete ? (
            <div className={styles.receipt}>
              <CheckCircle2 size={46} />
              <h3>{retailMoney(reviewTotals.total)}</h3>
              <p>
                {review?.paymentStatus === "paid"
                  ? "Venda registrada como recebida."
                  : "Venda registrada como a receber. Esse valor não entrou no caixa recebido."}
                <br />
                As quantidades vendidas foram retiradas do estoque.
              </p>
              <button
                type="button"
                className={styles.primary}
                onClick={onClose}
              >
                Concluir
              </button>
            </div>
          ) : review ? (
            <div className={styles.catalogPane}>
              <div className={styles.checkoutReview}>
                {review.items.map((item) => (
                  <div key={item.productId}>
                    <span>
                      <strong>{item.productName}</strong>
                      <small>
                        {retailNumber(item.quantity)} ×{" "}
                        {retailMoney(item.salePrice)}
                      </small>
                    </span>
                    <strong>
                      {retailMoney(item.quantity * item.salePrice)}
                    </strong>
                  </div>
                ))}
                <div>
                  <span>Cliente</span>
                  <strong>{selectedCustomer?.name || "Sem cliente"}</strong>
                </div>
                <div>
                  <span>Pagamento</span>
                  <strong>
                    {review.paymentStatus === "paid"
                      ? "Já recebido"
                      : "A receber"}{" "}
                    ·{" "}
                    {
                      paymentMethods.find(
                        (method) => method.id === review.paymentMethod,
                      )?.label
                    }
                  </strong>
                </div>
                <div>
                  <span>Desconto</span>
                  <strong>{retailMoney(review.discount || 0)}</strong>
                </div>
                <div className={styles.checkoutTotal}>
                  <span>Total</span>
                  <strong>{retailMoney(reviewTotals.total)}</strong>
                </div>
              </div>
              {pending && (
                <p role="status" className={styles.notice}>
                  Esta venda está aguardando confirmação. Tente novamente com os
                  mesmos dados para evitar uma venda duplicada.
                </p>
              )}
              {error && (
                <p className={styles.error} role="alert">
                  {error}
                </p>
              )}
              <div className={styles.footer}>
                <button
                  type="button"
                  className={styles.secondary}
                  disabled={locked}
                  onClick={() => {
                    setReview(null);
                    setError("");
                  }}
                >
                  <ArrowLeft size={16} />
                  Corrigir
                </button>
                <button
                  type="button"
                  className={styles.primary}
                  disabled={busy}
                  onClick={confirm}
                >
                  {busy ? (
                    <Loader2 className="animate-spin" size={17} />
                  ) : (
                    <Check size={17} />
                  )}{" "}
                  {pending && !busy ? "Tentar novamente" : "Confirmar venda"}
                </button>
              </div>
              <p className={styles.draftNote}>
                Aqui você registra a venda. O pagamento é recebido fora da
                plataforma.
              </p>
            </div>
          ) : (
            <div className={styles.posBody}>
              <div className={styles.catalogPane} ref={catalogRef}>
                <div className={styles.catalogControls}>
                  <div className={styles.searchBox}>
                    <Search size={17} />
                    <input
                      aria-label="Buscar produto para vender"
                      value={term}
                      onChange={(event) => {
                        setTerm(event.target.value);
                        setMatches(null);
                        setUnknown("");
                      }}
                      placeholder="Nome ou código do produto"
                    />
                  </div>
                  <button
                    type="button"
                    className={styles.secondary}
                    onClick={() => {
                      setCode("");
                      setScanner(true);
                    }}
                    aria-label="Ler etiqueta com a câmera"
                  >
                    <Camera size={18} />
                    Ler etiqueta
                  </button>
                </div>
                <button
                  type="button"
                  className={`${styles.secondary} ${styles.mobileBag}`}
                  onClick={() =>
                    cartRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    })
                  }
                >
                  <ShoppingBag size={17} />
                  Ver sacola ({cart.length}) · {retailMoney(totals.total)}
                  <ArrowRight size={15} />
                </button>
                {message && (
                  <p role="status" className={styles.foundNotice}>
                    <CheckCircle2 size={16} />
                    {message}
                  </p>
                )}
                {unknown && (
                  <div className={styles.emptyCatalog} role="status">
                    <strong>Ainda não encontrei essa etiqueta</strong>
                    <p>
                      Associe o código a um produto no cadastro ou escolha o
                      produto pela foto.
                    </p>
                    {onCreateProduct && (
                      <button
                        type="button"
                        className={styles.secondary}
                        onClick={() => onCreateProduct(unknown)}
                      >
                        <Plus size={15} />
                        Cadastrar este produto
                      </button>
                    )}
                  </div>
                )}
                <div className={styles.catalogTitle}>
                  <h3>
                    {matches
                      ? "Qual destes é o produto?"
                      : term
                        ? "Resultado da busca"
                        : "Seu catálogo"}
                  </h3>
                  <span>
                    {catalog.length} produto{catalog.length !== 1 ? "s" : ""}
                  </span>
                </div>
                {catalog.length ? (
                  <>
                    <div className={styles.productGrid}>
                      {visible.map((product) => {
                        const amount = cart.find(
                          (row) => row.productId === product._id,
                        )?.quantity;
                        return (
                          <button
                            type="button"
                            key={product._id}
                            className={styles.productTile}
                            disabled={
                              product.stock !== undefined && product.stock <= 0
                            }
                            aria-label={`Adicionar ${product.name}`}
                            onClick={() => choose(product)}
                          >
                            {product.imageUrl ? (
                              <img
                                className={styles.productImage}
                                src={product.imageUrl}
                                alt=""
                                loading="lazy"
                                onError={(event) => {
                                  event.currentTarget.style.visibility =
                                    "hidden";
                                }}
                              />
                            ) : (
                              <span
                                className={`${styles.productImage} ${styles.productPlaceholder}`}
                              >
                                <Package size={25} />
                              </span>
                            )}
                            {amount && (
                              <span className={styles.tileAdded}>
                                {amount} na sacola
                              </span>
                            )}
                            <strong>{product.name}</strong>
                            <small>
                              {product.stock === undefined
                                ? "Estoque não informado"
                                : product.stock === 0
                                  ? "Sem estoque"
                                  : `${retailNumber(product.stock)} ${product.unit || "un"} em estoque`}
                            </small>
                            <span>
                              {retailMoney(product.salePrice)} /{" "}
                              {product.unit || "un"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {totalPages > 1 && (
                      <div className={styles.catalogPager}>
                        <button
                          type="button"
                          className={styles.secondary}
                          disabled={page <= 1}
                          onClick={() => setPage((value) => value - 1)}
                        >
                          Anterior
                        </button>
                        <span>
                          {Math.min(page, totalPages)} de {totalPages}
                        </span>
                        <button
                          type="button"
                          className={styles.secondary}
                          disabled={page >= totalPages}
                          onClick={() => setPage((value) => value + 1)}
                        >
                          Próxima
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className={styles.emptyCatalog}>
                    <strong>
                      {term
                        ? "Nenhum produto com esse nome"
                        : "Seu catálogo começa aqui"}
                    </strong>
                    <p>
                      {term
                        ? "Tente outra palavra ou leia a etiqueta."
                        : "Cadastre seu primeiro produto para vender pela foto ou pela etiqueta."}
                    </p>
                    {onCreateProduct && !term && (
                      <button
                        type="button"
                        className={styles.primary}
                        onClick={() => onCreateProduct()}
                      >
                        Cadastrar produto
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className={styles.cartPane} ref={cartRef}>
                <div className={styles.cartHeading}>
                  <h3>Sua sacola</h3>
                  <span>
                    {cart.length} produto{cart.length !== 1 ? "s" : ""}
                  </span>
                </div>
                {!cart.length ? (
                  <div className={styles.cartEmpty}>
                    <ShoppingBag size={33} />
                    <strong>Vamos adicionar o primeiro?</strong>
                    <p>Toque em um produto ou leia a etiqueta com a câmera.</p>
                  </div>
                ) : (
                  <div className={styles.cartItems}>
                    {cart.map((row) => {
                      const product = productMap.get(row.productId);
                      if (!product)
                        return (
                          <div className={styles.error} key={row.productId}>
                            Produto indisponível.
                            <button
                              type="button"
                              onClick={() =>
                                setCart((rows) =>
                                  rows.filter(
                                    (value) =>
                                      value.productId !== row.productId,
                                  ),
                                )
                              }
                            >
                              Remover da sacola
                            </button>
                          </div>
                        );
                      const quantity = parseRetailNumber(row.quantity),
                        step = allowsFraction(product.unit) ? 0.1 : 1;
                      return (
                        <div className={styles.cartItem} key={row.productId}>
                          <div className={styles.cartItemName}>
                            <strong>{product.name}</strong>
                            <button
                              type="button"
                              aria-label={`Remover ${product.name}`}
                              onClick={() =>
                                setCart((rows) =>
                                  rows.filter(
                                    (value) =>
                                      value.productId !== row.productId,
                                  ),
                                )
                              }
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                          <div className={styles.quantityRow}>
                            <div className={styles.quantityControl}>
                              <button
                                type="button"
                                aria-label={`Diminuir ${product.name}`}
                                onClick={() =>
                                  updateQuantity(
                                    product,
                                    String(
                                      Math.max(
                                        allowsFraction(product.unit)
                                          ? 0.001
                                          : 1,
                                        roundQuantity(
                                          (Number.isFinite(quantity)
                                            ? quantity
                                            : 0) - step,
                                        ),
                                      ),
                                    ),
                                  )
                                }
                              >
                                <Minus size={12} />
                              </button>
                              <input
                                aria-label={`Quantidade de ${product.name}`}
                                inputMode={
                                  allowsFraction(product.unit)
                                    ? "decimal"
                                    : "numeric"
                                }
                                value={row.quantity}
                                onChange={(event) =>
                                  updateQuantity(product, event.target.value)
                                }
                              />
                              <button
                                type="button"
                                aria-label={`Aumentar ${product.name}`}
                                onClick={() =>
                                  updateQuantity(
                                    product,
                                    String(
                                      roundQuantity(
                                        (Number.isFinite(quantity)
                                          ? quantity
                                          : 0) + step,
                                      ),
                                    ),
                                  )
                                }
                              >
                                <Plus size={12} />
                              </button>
                              <small>{product.unit || "un"}</small>
                            </div>
                            <strong>
                              {retailMoney(
                                Number.isFinite(quantity)
                                  ? product.salePrice * quantity
                                  : 0,
                              )}
                            </strong>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className={styles.checkoutFields}>
                  <label className={styles.field}>
                    Quem está comprando? <span>Opcional</span>
                    <select
                      value={customerId}
                      onChange={(event) => setCustomerId(event.target.value)}
                    >
                      <option value="none">Sem cliente</option>
                      {customers.map((customer) => (
                        <option key={customer._id} value={customer._id}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className={styles.field}>
                    <span>Você já recebeu o pagamento?</span>
                    <div className={styles.paymentChoice}>
                      <button
                        type="button"
                        aria-pressed={paymentStatus === "paid"}
                        onClick={() => setPaymentStatus("paid")}
                      >
                        Já recebi
                      </button>
                      <button
                        type="button"
                        aria-pressed={paymentStatus === "pending"}
                        onClick={() => setPaymentStatus("pending")}
                      >
                        Vou receber depois
                      </button>
                    </div>
                  </div>
                  <label className={styles.field}>
                    {paymentStatus === "paid"
                      ? "Como recebeu?"
                      : "Como vai receber?"}
                    <select
                      value={paymentMethod}
                      onChange={(event) => setPaymentMethod(event.target.value)}
                    >
                      {paymentMethods.map((method) => (
                        <option key={method.id} value={method.id}>
                          {method.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <details className={styles.optional}>
                    <summary>
                      Desconto e data <span>Opcional</span>
                    </summary>
                    <label className={styles.field}>
                      Desconto no total (R$)
                      <input
                        inputMode="decimal"
                        value={discount}
                        onChange={(event) => setDiscount(event.target.value)}
                        placeholder="0,00"
                      />
                    </label>
                    <label className={styles.field}>
                      Data da venda
                      <input
                        type="date"
                        value={date}
                        max={brazilToday()}
                        onChange={(event) => setDate(event.target.value)}
                      />
                    </label>
                  </details>
                </div>
                <div className={styles.totalRows}>
                  <div>
                    <span>Produtos</span>
                    <strong>{retailMoney(totals.subtotal)}</strong>
                  </div>
                  <div>
                    <span>Desconto</span>
                    <strong>
                      {retailMoney(
                        Number.isFinite(discountValue) ? discountValue : 0,
                      )}
                    </strong>
                  </div>
                  <div>
                    <span>Total</span>
                    <strong>{retailMoney(totals.total)}</strong>
                  </div>
                </div>
                {error && (
                  <p className={styles.error} role="alert">
                    {error}
                  </p>
                )}
                <div className={styles.cartFooter}>
                  <button
                    type="button"
                    className={`${styles.primary} ${styles.checkoutButton}`}
                    disabled={!cart.length || !hydrated}
                    onClick={reviewSale}
                  >
                    Conferir venda
                    <ArrowRight size={16} />
                  </button>
                  <p>
                    Confira antes de confirmar. Seu estoque continua igual até
                    lá.
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={scanner} onOpenChange={setScanner}>
        <DialogContent className={`${styles.modal} ${styles.scanModal}`}>
          <DialogTitle>Ler etiqueta</DialogTitle>
          <DialogDescription>
            Uma leitura adiciona o produto à sacola. Você confirma a venda no
            final.
          </DialogDescription>
          {scanner && <BarcodeScanner onScan={scan} />}
          <form
            className={styles.manualCode}
            onSubmit={(event) => {
              event.preventDefault();
              scan(code);
            }}
          >
            <label className={styles.field}>
              Também pode digitar o código
              <input
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="Código da etiqueta"
                maxLength={256}
              />
            </label>
            <button
              type="submit"
              className={styles.secondary}
              disabled={!code.trim()}
            >
              Buscar código
            </button>
          </form>
          <button
            type="button"
            className={styles.textButton}
            onClick={() => setScanner(false)}
          >
            Voltar ao catálogo
          </button>
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(measured)}
        onOpenChange={(value) => {
          if (!value) setMeasured(null);
        }}
      >
        <DialogContent className={`${styles.modal} ${styles.scanModal}`}>
          <DialogTitle>Quanto foi vendido?</DialogTitle>
          <DialogDescription>
            {measured?.name} · {retailMoney(measured?.salePrice || 0)} por{" "}
            {measured?.unit}
          </DialogDescription>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!measured) return;
              const value = parseRetailNumber(measure);
              if (!validQuantity(value, measured.unit || "un"))
                return setMeasureError(
                  "Informe uma quantidade maior que zero, com até três casas decimais.",
                );
              if (measured.stock !== undefined && value > measured.stock)
                return setMeasureError(
                  "A quantidade é maior que o estoque disponível.",
                );
              add(measured, value);
              setMeasured(null);
            }}
          >
            <label className={styles.field}>
              Quantidade em {measured?.unit}
              <input
                autoFocus
                inputMode="decimal"
                value={measure}
                onChange={(event) => setMeasure(event.target.value)}
                placeholder="Ex.: 0,500"
              />
            </label>
            {measureError && (
              <p role="alert" className={styles.error}>
                {measureError}
              </p>
            )}
            <div className={styles.footer}>
              <button
                type="button"
                className={styles.secondary}
                onClick={() => setMeasured(null)}
              >
                Voltar
              </button>
              <button type="submit" className={styles.primary}>
                Adicionar à sacola
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
