"use client";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
} from "lucide-react";
import { adHost, type AdMedia } from "@/lib/ads";
import styles from "./ads.module.css";

export default function AdPreview({
  title,
  text,
  link,
  media,
}: {
  title: string;
  text: string;
  link: string;
  media: AdMedia[];
}) {
  const [index, setIndex] = useState(0);
  const mediaKey = media.map((item) => item.url).join("\u0001");
  useEffect(() => setIndex(0), [mediaKey]);
  const active = media[index] ?? media[0];
  return (
    <figure className={styles.preview} aria-label="Prévia do anúncio">
      <figcaption>PUBLICIDADE · REDE FREELINNK</figcaption>
      <div className={styles.previewCard}>
        <div className={styles.previewMedia}>
          {active ? (
            active.type === "video" ? (
              <video
                key={active.url}
                src={active.url}
                controls
                playsInline
                muted
                preload="metadata"
                aria-label="Vídeo do anúncio"
              />
            ) : (
              <img src={active.url} alt={title || "Imagem do anúncio"} />
            )
          ) : (
            <div className={styles.mediaPlaceholder}>
              <ImageIcon size={31} aria-hidden="true" />
              <strong>A imagem da sua campanha</strong>
              <span>Adicione uma imagem ou um vídeo.</span>
            </div>
          )}
          {media.length > 1 && (
            <div className={styles.mediaNav}>
              <button
                type="button"
                aria-label="Mídia anterior da prévia"
                onClick={() =>
                  setIndex((value) => (value + media.length - 1) % media.length)
                }
              >
                <ChevronLeft size={15} aria-hidden="true" />
              </button>
              <span aria-live="polite">
                {index + 1} / {media.length}
              </span>
              <button
                type="button"
                aria-label="Próxima mídia da prévia"
                onClick={() => setIndex((value) => (value + 1) % media.length)}
              >
                <ChevronRight size={15} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
        <div className={styles.previewCopy}>
          <span className={styles.previewHost}>{adHost(link)}</span>
          <h3>{title.trim() || "O título do seu anúncio"}</h3>
          <p>
            {text.trim() ||
              "A mensagem da sua marca aparece aqui. Conte o que torna seu produto ou serviço especial."}
          </p>
          <span className={styles.previewCta}>
            Conhecer anunciante
            <ArrowUpRight size={15} aria-hidden="true" />
          </span>
        </div>
      </div>
      <p className={styles.previewNote}>
        Prévia ilustrativa. A apresentação se adapta à página em que o anúncio
        aparece.
      </p>
    </figure>
  );
}
