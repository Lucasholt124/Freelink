"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { realPages } from "@/app/constants/landing-data";
import styles from "./landing.module.css";

export default function RealPagesShowcase() {
  const [selected, setSelected] = useState<(typeof realPages)[number] | null>(
    null,
  );
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (selected && !dialog.current?.open) dialog.current?.showModal();
    if (!selected && dialog.current?.open) dialog.current.close();
  }, [selected]);

  return (
    <>
      <div className={styles.gallery}>
        {realPages.map((page, index) => (
          <button
            key={page.id}
            className={styles.galleryCard}
            onClick={() => setSelected(page)}
            aria-label={`Ampliar vitrine ${page.name}`}
          >
            <div
              className={`${styles.galleryImage} ${styles[`galleryTone${index}`]}`}
            >
              <span className={styles.galleryNumber}>0{index + 1}</span>
              <div className={styles.galleryPhone}>
                <div />
                <img
                  src={page.image}
                  alt={`Página ${page.name} criada no Freelinnk`}
                  loading="lazy"
                  width={260}
                  height={510}
                />
              </div>
              <span className={styles.galleryExpand}>
                <ArrowUpRight size={20} />
              </span>
            </div>
            <span className={styles.galleryCaption}>
              <span>
                <strong>{page.name}</strong>
                <small>{page.type}</small>
              </span>
              <ArrowUpRight size={17} />
            </span>
          </button>
        ))}
      </div>
      <p className={styles.galleryHint}>
        Cada negócio tem uma identidade. Toque em uma vitrine para explorar.
      </p>
      <dialog
        ref={dialog}
        className={styles.galleryDialog}
        onCancel={() => setSelected(null)}
        onClose={() => setSelected(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setSelected(null);
        }}
        aria-label={selected ? `Vitrine ${selected.name}` : "Prévia da vitrine"}
      >
        <div className={styles.dialogHeader}>
          <div>
            <strong>{selected?.name}</strong>
            <span>{selected?.type}</span>
          </div>
          <button onClick={() => setSelected(null)} aria-label="Fechar prévia">
            <X size={21} />
          </button>
        </div>
        {selected && (
          <div className={styles.dialogImage}>
            <img
              src={selected.image}
              alt={`Vitrine completa de ${selected.name}`}
            />
          </div>
        )}
      </dialog>
    </>
  );
}
