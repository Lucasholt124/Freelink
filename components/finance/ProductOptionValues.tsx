"use client";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { normalizeSearch, readOptionValues } from "@/lib/retail";
import styles from "./retail.module.css";

export function ProductOptionValues({
  name,
  value,
  onChange,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const values = readOptionValues(value);
  function add() {
    const next = text.trim();
    if (!next) return setError("Digite uma opção antes de adicionar.");
    if (next.length > 60) return setError("Use até 60 caracteres por opção.");
    if (values.length >= 20)
      return setError("Use até 20 valores em cada grupo.");
    if (values.some((item) => normalizeSearch(item) === normalizeSearch(next)))
      return setError("Essa opção já está na lista.");
    onChange(JSON.stringify([...values, next]));
    setText("");
    setError("");
  }
  return (
    <div className={styles.optionValues}>
      <label className={styles.field}>
        Quais opções existem?
        <div className={styles.optionValueInput}>
          <input
            aria-label={`Nova opção de ${name || "produto"}`}
            value={text}
            maxLength={60}
            onChange={(event) => {
              setText(event.target.value);
              setError("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                add();
              }
            }}
            placeholder="Digite uma opção"
          />
          <button
            type="button"
            className={styles.secondary}
            aria-label={`Adicionar opção de ${name || "produto"}`}
            onClick={add}
          >
            <Plus size={15} />
            Adicionar
          </button>
        </div>
      </label>
      <small>Adicione uma de cada vez. Ex.: Azul, tamanho M ou 0,5 L.</small>
      {values.length > 0 && (
        <div className={styles.optionChips}>
          {values.map((item) => (
            <span key={item}>
              {item}
              <button
                type="button"
                aria-label={`Remover opção ${item}`}
                onClick={() =>
                  onChange(
                    JSON.stringify(
                      values.filter((current) => current !== item),
                    ),
                  )
                }
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
