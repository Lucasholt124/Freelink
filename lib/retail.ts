export const retailUnits = [
  { value: "un", label: "Unidade", plural: "unidades", step: 1 },
  { value: "kg", label: "Quilo", plural: "kg", step: 0.001 },
  { value: "g", label: "Grama", plural: "g", step: 0.001 },
  { value: "m", label: "Metro", plural: "m", step: 0.001 },
  { value: "l", label: "Litro", plural: "l", step: 0.001 },
  { value: "par", label: "Par", plural: "pares", step: 1 },
  { value: "cx", label: "Caixa", plural: "caixas", step: 1 },
  { value: "pct", label: "Pacote", plural: "pacotes", step: 1 },
] as const;
export type RetailUnit = (typeof retailUnits)[number]["value"];
export function readOptionValues(value: string): string[] {
  if (!value.trim()) return [];
  if (value.trim().startsWith("[")) {
    try {
      const parsed: unknown = JSON.parse(value);
      if (
        Array.isArray(parsed) &&
        parsed.every((item) => typeof item === "string")
      )
        return parsed.map((item) => item.trim()).filter(Boolean);
    } catch {
      return [];
    }
  }
  // Accept drafts from the earlier text editor as well.
  return value
    .split(value.includes(";") ? ";" : ",")
    .map((item) => item.trim())
    .filter(Boolean);
}
export type ProductOption = { name: string; value: string };
export type CaptureVariant = {
  options: ProductOption[];
  stock: number;
  barcode?: string;
};
export type ProductCaptureInput = {
  name: string;
  category?: string;
  description?: string;
  costPrice: number;
  salePrice: number;
  unit: string;
  variants: CaptureVariant[];
};
export const retailMoney = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );
export const retailNumber = (value: number) =>
  new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 3 }).format(value);
export const roundMoney = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;
export const roundQuantity = (value: number) => Math.round(value * 1000) / 1000;
export const normalizeSearch = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
export function parseRetailNumber(value: string): number {
  const clean = value.trim().replace(/\s|R\$/g, "");
  if (!clean) return NaN;
  if (!/^-?[\d.,]+$/.test(clean)) return NaN;
  const normalized = clean.includes(",")
    ? clean.replace(/\./g, "").replace(",", ".")
    : clean;
  return Number(normalized);
}
export function allowsFraction(unit?: string) {
  return ["kg", "g", "m", "l", "ml", "cm", "metro", "litro"].includes(
    (unit || "un").toLowerCase(),
  );
}
export function validQuantity(value: number, unit: string, allowZero = false) {
  return (
    Number.isFinite(value) &&
    value >= (allowZero ? 0 : 0.001) &&
    value <= 1_000_000 &&
    (allowsFraction(unit)
      ? Math.abs(value * 1000 - Math.round(value * 1000)) < 0.00001
      : Number.isInteger(value))
  );
}
export function normalizeBarcode(value?: string) {
  return (value || "").trim();
}
export function optionLabel(options: ProductOption[]) {
  return options
    .map((option) => option.value.trim())
    .filter(Boolean)
    .join(" · ");
}
export function expandOptions(
  axes: { name: string; values: string[] }[],
): ProductOption[][] {
  const active = axes.filter(
    (axis) => axis.name.trim() && axis.values.some((value) => value.trim()),
  );
  if (active.length > 2)
    throw new Error("Use até dois tipos de opção por produto.");
  let rows: ProductOption[][] = [[]];
  for (const axis of active) {
    const values = [
      ...new Map(
        axis.values.map((value) => [normalizeSearch(value), value.trim()]),
      ).values(),
    ].filter(Boolean);
    if (values.length > 20 || rows.length * values.length > 60)
      throw new Error("Cadastre até 60 combinações de uma vez.");
    rows = rows.flatMap((row) =>
      values.map((value) => [...row, { name: axis.name.trim(), value }]),
    );
  }
  return rows;
}
export function validateCapture(input: ProductCaptureInput): string[] {
  const errors: string[] = [];
  if (!input.name.trim() || input.name.trim().length > 100)
    errors.push("Dê um nome ao produto, com até 100 caracteres.");
  if (
    (input.category || "").length > 80 ||
    (input.description || "").length > 1500
  )
    errors.push("Encurte a categoria ou a descrição do produto.");
  if (
    !Number.isFinite(input.costPrice) ||
    input.costPrice < 0 ||
    input.costPrice > 1_000_000
  )
    errors.push(
      "Informe quanto você pagou. Use zero apenas se não houve custo.",
    );
  if (
    !Number.isFinite(input.salePrice) ||
    input.salePrice <= 0 ||
    input.salePrice > 1_000_000
  )
    errors.push("Informe um preço de venda maior que zero.");
  if (
    (Number.isFinite(input.costPrice) &&
      roundMoney(input.costPrice) !== input.costPrice) ||
    (Number.isFinite(input.salePrice) &&
      roundMoney(input.salePrice) !== input.salePrice)
  )
    errors.push("Use até duas casas decimais nos valores em reais.");
  if (
    ![...retailUnits.map((unit) => unit.value)].includes(
      input.unit as RetailUnit,
    )
  )
    errors.push("Escolha como você vende este produto.");
  if (!input.variants.length || input.variants.length > 60)
    errors.push("Cadastre entre 1 e 60 opções de uma vez.");
  const seenOptions = new Set<string>(),
    seenCodes = new Set<string>();
  for (const row of input.variants) {
    if (!validQuantity(row.stock, input.unit, true))
      errors.push(
        `Confira a quantidade de ${optionLabel(row.options) || input.name}.`,
      );
    if (
      row.options.length > 2 ||
      row.options.some(
        (option) =>
          !option.name.trim() ||
          !option.value.trim() ||
          option.name.length > 40 ||
          option.value.length > 60,
      )
    )
      errors.push("Preencha o nome e o valor de cada opção.");
    if (
      (
        input.name.trim() +
        (row.options.length ? ` — ${optionLabel(row.options)}` : "")
      ).length > 100
    )
      errors.push(
        "Encurte o nome ou as opções para que cada produto tenha até 100 caracteres.",
      );
    const key = JSON.stringify(
      row.options
        .map((option) => [
          normalizeSearch(option.name),
          normalizeSearch(option.value),
        ])
        .sort((a, b) => a[0].localeCompare(b[0])),
    );
    if (seenOptions.has(key))
      errors.push("Há opções repetidas na lista. Confira as combinações.");
    seenOptions.add(key);
    const barcode = normalizeBarcode(row.barcode);
    if (
      barcode &&
      (!/^[\x21-\x7e]{1,128}$/.test(barcode) ||
        barcode.toLowerCase().startsWith("flnk:"))
    )
      errors.push(
        "O código da etiqueta não é válido. Leia novamente ou deixe em branco.",
      );
    if (barcode && seenCodes.has(barcode.toLowerCase()))
      errors.push(
        "Cada opção precisa de uma etiqueta diferente. Deixe em branco para gerar uma própria.",
      );
    if (barcode) seenCodes.add(barcode.toLowerCase());
  }
  return [...new Set(errors)];
}
export const productScanCode = (id: string) => `flnk:product:${id}`;
type Scannable = {
  _id: string;
  name: string;
  active: boolean;
  sku?: string;
  barcode?: string;
  category?: string;
};
export function findScannedProducts<T extends Scannable>(
  products: T[],
  code: string,
): T[] {
  const value = code.trim();
  if (!value || value.length > 256) return [];
  if (value.startsWith("flnk:product:"))
    return products.filter(
      (product) => product.active && productScanCode(product._id) === value,
    );
  return products.filter(
    (product) =>
      product.active &&
      [product.barcode, product.sku].some(
        (candidate) => candidate?.trim().toLowerCase() === value.toLowerCase(),
      ),
  );
}
export function searchRetailProducts<T extends Scannable>(
  products: T[],
  term: string,
): T[] {
  const needle = normalizeSearch(term);
  return products.filter(
    (product) =>
      product.active &&
      (!needle ||
        [product.name, product.category, product.sku, product.barcode].some(
          (value) => normalizeSearch(value || "").includes(needle),
        )),
  );
}
export function validateSaleDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return (
    Number.isFinite(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}
export function cartTotals(
  items: { quantity: number; salePrice: number; costPrice: number }[],
  discount: number,
) {
  const subtotal =
    items.reduce(
      (sum, item) => sum + Math.round(item.salePrice * 100 * item.quantity),
      0,
    ) / 100;
  const cost =
    items.reduce(
      (sum, item) => sum + Math.round(item.costPrice * 100 * item.quantity),
      0,
    ) / 100;
  const total = roundMoney(subtotal - discount);
  return { subtotal, cost, total, profit: roundMoney(total - cost) };
}
