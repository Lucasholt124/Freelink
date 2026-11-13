"use client";

import { useEffect, useState } from "react";
import { Download, Loader2, Printer, QrCode } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { productScanCode, retailMoney } from "@/lib/retail";
import styles from "./retail.module.css";

export type LabelProduct = {
  _id: string;
  name: string;
  salePrice: number;
  unit?: string;
};
export function ProductLabels({
  open,
  onClose,
  products,
}: {
  open: boolean;
  onClose: () => void;
  products: LabelProduct[];
}) {
  const [counts, setCounts] = useState<Record<string, string>>({});
  const [showPrice, setShowPrice] = useState(true);
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setError("");
    void import("qrcode")
      .then(async (QR) => {
        const result = await Promise.all(
          products
            .slice(0, 100)
            .map(
              async (product) =>
                [
                  product._id,
                  await QR.toDataURL(productScanCode(product._id), {
                    width: 240,
                    margin: 3,
                    errorCorrectionLevel: "M",
                  }),
                ] as const,
            ),
        );
        if (!cancelled) setCodes(Object.fromEntries(result));
      })
      .catch(() => {
        if (!cancelled)
          setError(
            "Não consegui preparar as etiquetas. Feche esta janela e tente novamente.",
          );
      });
    return () => {
      cancelled = true;
    };
  }, [open, products]);
  const selected = products.slice(0, 100).flatMap((product) => {
    const count = Number(counts[product._id] ?? "1");
    return Number.isInteger(count) && count > 0 && count <= 100
      ? Array.from({ length: count }, () => product)
      : [];
  });
  const invalid = products.some((product) => {
    const count = Number(counts[product._id] ?? "1");
    return !Number.isInteger(count) || count < 0 || count > 100;
  });
  async function download() {
    if (busy || invalid || !selected.length || selected.length > 300) return;
    setBusy(true);
    setError("");
    try {
      const [{ default: jsPDF }, QR] = await Promise.all([
        import("jspdf"),
        import("qrcode"),
      ]);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      for (let i = 0; i < selected.length; i++) {
        if (i > 0 && i % 21 === 0) pdf.addPage();
        const product = selected[i],
          cell = i % 21,
          x = 7.5 + (cell % 3) * 65,
          y = 9 + Math.floor(cell / 3) * 39;
        pdf.setDrawColor(220, 220, 220);
        pdf.roundedRect(x, y, 63, 37, 1, 1, "S");
        const code =
          codes[product._id] ||
          (await QR.toDataURL(productScanCode(product._id), {
            width: 240,
            margin: 3,
            errorCorrectionLevel: "M",
          }));
        pdf.addImage(code, "PNG", x + 1, y + 5, 25, 25);
        pdf.setTextColor(35, 35, 40);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8);
        // Standard PDF fonts cover Latin-1; replace only unsupported glyphs in printed labels.
        const name = product.name.replace(/[^\u0020-\u00ff]/g, " ");
        const lines = pdf.splitTextToSize(name, 33).slice(0, 3);
        pdf.text(lines, x + 28, y + 8);
        if (showPrice) {
          pdf.setFontSize(10);
          pdf.text(
            retailMoney(product.salePrice).replace(/\u00a0/g, " "),
            x + 28,
            y + 25,
          );
        }
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7);
        pdf.setTextColor(100, 100, 110);
        pdf.text(`Por ${product.unit || "un"}`, x + 28, y + 31);
      }
      pdf.save("etiquetas-freelinnk.pdf");
    } catch {
      setError(
        "Não consegui gerar o arquivo. Tente novamente; suas etiquetas continuam aqui.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value && !busy) onClose();
      }}
    >
      <DialogContent className={`${styles.modal} ${styles.labelsModal}`}>
        <div className={styles.modalHeading}>
          <span className={styles.iconTile}>
            <Printer size={22} />
          </span>
          <div>
            <p className={styles.eyebrow}>Do cadastro para a prateleira</p>
            <DialogTitle>Suas etiquetas, prontas para imprimir</DialogTitle>
          </div>
        </div>
        <DialogDescription>
          Baixe a folha A4, imprima em tamanho real (100%), recorte e fixe no
          produto. Depois, leia o QR Code na hora de vender.
        </DialogDescription>
        <div className={styles.labelOptions}>
          <label>
            <input
              type="checkbox"
              checked={showPrice}
              onChange={(event) => setShowPrice(event.target.checked)}
            />
            Mostrar preço na etiqueta
          </label>
          <span>Use 0 para não imprimir um produto.</span>
        </div>
        <div className={styles.labelList}>
          {products.slice(0, 100).map((product) => (
            <div className={styles.labelRow} key={product._id}>
              <div className={styles.labelPreview}>
                {codes[product._id] ? (
                  <img
                    src={codes[product._id]}
                    alt={`QR Code de ${product.name}`}
                  />
                ) : (
                  <QrCode size={30} />
                )}
                <div>
                  <strong>{product.name}</strong>
                  {showPrice && <span>{retailMoney(product.salePrice)}</span>}
                </div>
              </div>
              <label>
                Quantidade
                <input
                  aria-label={`Etiquetas de ${product.name}`}
                  inputMode="numeric"
                  value={counts[product._id] ?? "1"}
                  onChange={(event) =>
                    setCounts({ ...counts, [product._id]: event.target.value })
                  }
                />
              </label>
            </div>
          ))}
        </div>
        {products.length > 100 && (
          <p className={styles.notice}>
            Mostrando os primeiros 100 produtos. Use a busca do catálogo para
            imprimir outro grupo.
          </p>
        )}
        {(invalid || selected.length > 300) && (
          <p role="alert" className={styles.error}>
            Use de 0 a 100 etiquetas por produto, com no máximo 300 por arquivo.
          </p>
        )}
        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
        <div className={styles.footer}>
          <button
            type="button"
            className={styles.secondary}
            onClick={onClose}
            disabled={busy}
          >
            Voltar
          </button>
          <button
            type="button"
            className={styles.primary}
            disabled={
              busy || invalid || !selected.length || selected.length > 300
            }
            onClick={download}
          >
            {busy ? (
              <Loader2 className="animate-spin" size={17} />
            ) : (
              <Download size={17} />
            )}
            Baixar {selected.length} etiqueta{selected.length !== 1 ? "s" : ""}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
