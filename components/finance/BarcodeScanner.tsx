"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Html5Qrcode } from "html5-qrcode";
import { Camera, Loader2, RefreshCw } from "lucide-react";
import styles from "./retail.module.css";

export function BarcodeScanner({ onScan }: { onScan: (code: string) => void }) {
  const id = `retail-reader-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const callback = useRef(onScan);
  callback.current = onScan;
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<"starting" | "ready" | "error">(
    "starting",
  );
  const [message, setMessage] = useState("");
  useEffect(() => {
    let cancelled = false,
      scanned = false;
    let reader: Html5Qrcode | undefined;
    const release = async () => {
      if (!reader) return;
      try {
        if (reader.isScanning) await reader.stop();
      } catch {
        /* already stopped */
      }
      try {
        reader.clear();
      } catch {
        /* view already removed */
      }
    };
    setStatus("starting");
    void (async () => {
      try {
        const { Html5Qrcode, Html5QrcodeSupportedFormats: F } =
          await import("html5-qrcode");
        if (cancelled) return;
        reader = new Html5Qrcode(id, {
          verbose: false,
          formatsToSupport: [
            F.QR_CODE,
            F.EAN_13,
            F.EAN_8,
            F.CODE_128,
            F.CODE_39,
            F.CODE_93,
            F.UPC_A,
            F.UPC_E,
            F.ITF,
            F.CODABAR,
            F.DATA_MATRIX,
          ],
        });
        await reader.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: (width, height) => ({
              width: Math.min(280, Math.floor(width * 0.85)),
              height: Math.min(190, Math.floor(height * 0.7)),
            }),
          },
          (code) => {
            if (cancelled || scanned) return;
            scanned = true;
            void release().then(() => {
              if (!cancelled) callback.current(code);
            });
          },
          () => {},
        );
        if (cancelled) {
          await release();
          return;
        }
        setStatus("ready");
      } catch (error) {
        if (cancelled) return;
        const name = error instanceof Error ? error.name : String(error);
        setMessage(
          /NotAllowed|Permission|denied/i.test(name)
            ? "Permita o uso da câmera nas configurações do navegador e tente novamente."
            : "Não consegui abrir a câmera. Feche outros aplicativos que a estejam usando e tente novamente.",
        );
        setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
      void release();
    };
  }, [id, attempt]);
  return (
    <div className={styles.scanner}>
      <div id={id} className={styles.scannerVideo} />
      {status === "starting" && (
        <p role="status">
          <Loader2 className="animate-spin" size={18} />
          Abrindo a câmera…
        </p>
      )}
      {status === "ready" && (
        <p>
          <Camera size={16} />
          Aponte para o código de barras ou QR Code da etiqueta.
        </p>
      )}
      {status === "error" && (
        <div role="alert">
          <p>{message}</p>
          <button
            type="button"
            onClick={() => setAttempt((value) => value + 1)}
          >
            <RefreshCw size={16} />
            Tentar novamente
          </button>
        </div>
      )}
      <small>
        A câmera lê a etiqueta. Para identificar o produto pela foto, use o
        catálogo.
      </small>
    </div>
  );
}
