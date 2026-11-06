"use client";

import { FaWhatsapp } from "react-icons/fa6";
import styles from "./landing.module.css";

export default function WhatsAppFloatingButton() {
  // Fall back to the existing support contact used by components/WhatsappFloatingButton.tsx.
  const configured = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(
    /\D/g,
    "",
  );
  const number =
    configured && /^\d{10,15}$/.test(configured) ? configured : "5579999383543";
  const message = encodeURIComponent(
    "Olá! Gostaria de conhecer o Freelinnk e criar minha vitrine.",
  );

  return (
    <a
      className={styles.whatsapp}
      href={`https://wa.me/${number}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Conversar com o suporte do Freelinnk no WhatsApp"
    >
      <FaWhatsapp size={23} />
      <span>Vamos conversar?</span>
    </a>
  );
}
