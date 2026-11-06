"use client";

import { useState } from "react";
import { ArrowUpRight, Play } from "lucide-react";
import { SignUpButton } from "@clerk/nextjs";
import styles from "./landing.module.css";

export default function VideoDemoSection() {
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div id="demonstracao" className={styles.videoSection}>
      <div className={styles.videoCopy}>
        <span className={styles.kicker}>VEJA POR DENTRO</span>
        <h3>
          Melhor do que contar,
          <br />é mostrar.
        </h3>
        <p>
          Conheça o Freelinnk em ação e veja como sua próxima vitrine pode
          ganhar vida.
        </p>
        <SignUpButton mode="modal" forceRedirectUrl="/onboarding">
          <button className={styles.understatedLink}>
            Quero criar a minha <ArrowUpRight size={16} />
          </button>
        </SignUpButton>
      </div>
      <div className={styles.videoFrame}>
        {playing ? (
          <>
            <video
              src="/demo-freelinnk.mp4"
              controls
              autoPlay
              playsInline
              aria-label="Tour demonstrativo do Freelinnk"
              onEnded={() => setPlaying(false)}
              onError={() => {
                setFailed(true);
                setPlaying(false);
              }}
            />
            <button
              className={styles.videoClose}
              onClick={() => setPlaying(false)}
            >
              Fechar vídeo
            </button>
          </>
        ) : (
          <button
            className={styles.videoPoster}
            onClick={() => {
              setFailed(false);
              setPlaying(true);
            }}
            aria-label="Reproduzir demonstração do Freelinnk"
          >
            <div className={styles.videoMockup} aria-hidden="true">
              <div className={styles.videoSidebar}>
                <span>F.</span>
                <i />
                <i />
                <i />
              </div>
              <div className={styles.videoDashboard}>
                <span>Seu negócio, em um só lugar.</span>
                <div>
                  <i />
                  <i />
                  <i />
                </div>
                <div className={styles.videoBars}>
                  {[23, 38, 31, 52, 45, 65, 60, 79].map((height, i) => (
                    <i key={i} style={{ height }} />
                  ))}
                </div>
              </div>
            </div>
            <span className={styles.playIcon}>
              <Play size={24} fill="currentColor" />
            </span>
            <span className={styles.playLabel}>
              {failed
                ? "Não foi possível carregar. Tentar novamente"
                : "Dê o play. Conheça as possibilidades."}
              <span>TOUR DO PRODUTO</span>
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
