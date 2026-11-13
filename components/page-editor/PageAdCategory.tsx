"use client";
import { useRef, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { networkCategories } from "@/lib/ad-policy";
import styles from "./editor.module.css";

export default function PageAdCategory({ username }: { username: string }) {
  const { isAuthenticated } = useConvexAuth();
  const pages = useQuery(
    api.ads.getMyPageCategories,
    isAuthenticated ? {} : "skip",
  );
  const save = useMutation(api.ads.saveUserNiche);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const busy = useRef(false);
  const page = pages?.find((page) => page.username === username);
  const id = `page-business-${username}`;
  return (
    <div className={styles.field}>
      <label htmlFor={id}>Segmento do seu negócio</label>
      <select
        id={id}
        value={page?.niche || "geral"}
        disabled={!page || saving}
        aria-describedby={`${id}-hint`}
        aria-busy={saving}
        onChange={async (event) => {
          if (busy.current) return;
          busy.current = true;
          setSaving(true);
          setError("");
          setMessage("");
          try {
            await save({
              username,
              niche: event.target.value,
              confirmed: true,
            });
            setMessage("Segmento salvo.");
          } catch {
            setError("Não foi possível salvar o segmento. Tente novamente.");
          } finally {
            busy.current = false;
            setSaving(false);
          }
        }}
      >
        {networkCategories.map(([value, label]) => (
          <option key={value} value={value} disabled={value === "geral"}>
            {label}
          </option>
        ))}
      </select>
      <span id={`${id}-hint`} className={styles.fieldHint}>
        Ajuda a evitar anúncios de segmentos concorrentes nesta página. Salvo
        automaticamente ao selecionar.
      </span>
      {saving && (
        <span role="status" className={styles.fieldHint}>
          Salvando segmento…
        </span>
      )}
      {message && (
        <span role="status" className={styles.fieldHint}>
          {message}
        </span>
      )}
      {error && <span role="alert">{error}</span>}
    </div>
  );
}
