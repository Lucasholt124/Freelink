"use client";
import { useRef, useState } from "react";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, Loader2 } from "lucide-react";
import { retailMoney, validateSaleDate } from "@/lib/retail";
import { toast } from "sonner";
import styles from "./retail.module.css";
const today = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

export function ReceiveSaleDialog({
  sale,
  onClose,
}: {
  sale: Doc<"sales">;
  onClose: () => void;
}) {
  const [date, setDate] = useState(today);
  const [method, setMethod] = useState(sale.paymentMethod || "pix");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  const receive = useMutation(api.retail.receiveSale);
  async function confirm() {
    if (lock.current) return;
    if (!validateSaleDate(date) || date > today() || date < sale.date)
      return setError(
        "Confira a data em que recebeu: ela não pode ser anterior à venda nem estar no futuro.",
      );
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await receive({
        saleId: sale._id,
        date,
        paymentMethod: method,
      });
      toast.success(
        result.alreadyPaid
          ? "Esse pagamento já constava como recebido. Nenhuma entrada foi duplicada."
          : "Pagamento registrado no caixa recebido.",
      );
      onClose();
    } catch (error) {
      setError(
        error instanceof ConvexError && typeof error.data === "string"
          ? error.data
          : "Não foi possível confirmar o recebimento. Tente novamente; a mesma venda não gera duas entradas no caixa.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(value) => {
        if (!value && !busy) onClose();
      }}
    >
      <DialogContent className={`${styles.modal} ${styles.scanModal}`}>
        <DialogTitle>Esse pagamento já entrou?</DialogTitle>
        <DialogDescription>
          Confirme apenas depois de receber fora da plataforma. O estoque já foi
          baixado na venda e continuará igual.
        </DialogDescription>
        <div className={styles.reviewStats}>
          <div style={{ gridColumn: "1/-1" }}>
            <span>Valor da venda a receber</span>
            <strong>{retailMoney(sale.totalRevenue)}</strong>
          </div>
        </div>
        <fieldset disabled={busy} className={styles.fields}>
          <label className={styles.field}>
            Como recebeu?
            <select
              value={method}
              onChange={(event) =>
                setMethod(event.target.value as typeof method)
              }
            >
              <option value="pix">PIX</option>
              <option value="cash">Dinheiro</option>
              <option value="credit_card">Cartão de crédito</option>
              <option value="debit_card">Cartão de débito</option>
              <option value="bank_transfer">Transferência</option>
              <option value="other">Outra forma</option>
            </select>
          </label>
          <label className={styles.field}>
            Quando recebeu?
            <input
              type="date"
              min={sale.date}
              max={today()}
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </label>
        </fieldset>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <div className={styles.footer}>
          <button
            type="button"
            className={styles.secondary}
            disabled={busy}
            onClick={onClose}
          >
            Voltar
          </button>
          <button
            type="button"
            className={styles.primary}
            disabled={busy}
            onClick={confirm}
          >
            {busy ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Check size={16} />
            )}
            Confirmar recebimento
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
