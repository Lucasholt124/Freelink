"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseClipboardOptions {
  /** Tempo em ms para resetar o estado "copied" (padrão: 2500) */
  resetDelay?: number;
}

interface UseClipboardReturn {
  /** Se o último copy() foi bem-sucedido (reseta automaticamente) */
  copied: boolean;
  /** Função para copiar texto. Retorna true se funcionou. */
  copy: (text: string) => Promise<boolean>;
}

/**
 * Hook reutilizável para copiar texto para o clipboard.
 *
 * Usa a Clipboard API moderna como primeira opção
 * e um fallback compatível com iOS Safari como segunda.
 *
 * @example
 * const { copied, copy } = useClipboard();
 * const handleCopy = async () => {
 *   const ok = await copy("https://freelinnk.com/meu-link");
 *   if (ok) toast.success("Copiado!");
 * };
 */
export function useClipboard(
  options: UseClipboardOptions = {}
): UseClipboardReturn {
  const { resetDelay = 2500 } = options;
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      // Limpa timeout anterior se existir
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      const markAsCopied = () => {
        setCopied(true);
        timeoutRef.current = setTimeout(() => setCopied(false), resetDelay);
      };

      // ─── MÉTODO 1: Clipboard API moderna (HTTPS) ───
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(text);
          markAsCopied();
          return true;
        } catch (err) {
          console.warn("[useClipboard] Clipboard API falhou:", err);
        }
      }

      // ─── MÉTODO 2: Fallback com <input> (iOS Safari) ───
      try {
        const input = document.createElement("input");
        input.setAttribute("value", text);
        input.setAttribute("readonly", "");
        input.style.cssText =
          "position:fixed;top:-9999px;left:-9999px;opacity:0;font-size:16px;";
        document.body.appendChild(input);

        input.focus();
        input.select();
        input.setSelectionRange(0, text.length);

        const success = document.execCommand("copy");
        document.body.removeChild(input);

        if (success) {
          markAsCopied();
          return true;
        }

        console.warn("[useClipboard] execCommand retornou false");
        return false;
      } catch (err) {
        console.warn("[useClipboard] Fallback falhou:", err);
        return false;
      }
    },
    [resetDelay]
  );

  // Cleanup do timeout ao desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { copied, copy };
}