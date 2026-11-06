"use client";

import {
  ArrowUpRight,
  BarChart3,
  Calculator,
  Gift,
  Globe,
  Link2,
  Megaphone,
  Target,
} from "lucide-react";
import styles from "./hero-preview.module.css";

const tools = [
  {
    icon: Link2,
    name: "Página de links",
    detail: "Perfil, botões e WhatsApp",
    plan: "GRÁTIS",
  },
  {
    icon: Megaphone,
    name: "Hub de Anúncios",
    detail: "Campanhas na rede",
    plan: "PRO",
  },
  {
    icon: Target,
    name: "Meta Pixel",
    detail: "Rastreamento de acessos",
    plan: "PRO",
  },
  {
    icon: BarChart3,
    name: "Google Analytics",
    detail: "Dados da sua página",
    plan: "PRO",
  },
  {
    icon: Gift,
    name: "Sorteios Instagram",
    detail: "Seleção de comentários",
    plan: "PRO",
  },
  {
    icon: Calculator,
    name: "CRM e lucros",
    detail: "Clientes e calculadora",
    plan: "ULTRA",
  },
];

export default function HeroPhoneSimulator() {
  return (
    <div className={styles.preview}>
      <div className={styles.topline}>
        <span>
          <span /> O FREELINNK NA PRÁTICA
        </span>
        <Link2 size={17} />
      </div>
      <div className={styles.phone}>
        <div className={styles.camera} aria-hidden="true" />
        <div className={styles.address}>
          <Globe size={10} />
          <span>freelinnk.com/impulsioneweb</span>
        </div>
        <div className={styles.screen}>
          <img
            src="/ImpulsioneWeb.jpeg"
            alt="Página real da Impulsione Web no Freelinnk, com perfil personalizado e botões para WhatsApp, site oficial, plataforma e Instagram"
            width={818}
            height={1600}
            fetchPriority="high"
          />
        </div>
      </div>
      <div className={styles.resources}>
        <span className={styles.resourceHeading}>ALÉM DO LINK NA BIO</span>
        <p>
          Sua página na frente.
          <br />
          <strong>Seu painel por trás.</strong>
        </p>
        <ul>
          {tools.map(({ icon: Icon, name, detail, plan }) => (
            <li key={name}>
              <span className={styles.toolIcon}>
                <Icon size={16} />
              </span>
              <span className={styles.toolText}>
                <strong>{name}</strong>
                <small>{detail}</small>
              </span>
              <span className={styles.plan}>{plan}</span>
            </li>
          ))}
        </ul>
        <a href="#funcionalidades">
          Conhecer os recursos <ArrowUpRight size={13} />
        </a>
      </div>
      <div className={styles.bottomline}>
        <span>
          <Link2 size={12} /> PÁGINA DE LINKS PERSONALIZADA
        </span>
        <span>CAPTURA REAL</span>
      </div>
      <p className={styles.caption}>
        Página: @impulsioneweb · Recursos disponíveis conforme o plano.
      </p>
    </div>
  );
}
