"use client";

import { useState } from "react";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { ArrowUpRight, Check, Sparkles } from "lucide-react";
import { pricingPlans } from "@/app/constants/landing-data";
import styles from "./landing.module.css";

const currency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );

export default function PricingSection() {
  const [yearly, setYearly] = useState(false);

  return (
    <section
      id="precos"
      className={`${styles.section} ${styles.pricingSection}`}
      aria-labelledby="pricing-title"
    >
      <div className={styles.container}>
        <div className={styles.centerHeading}>
          <span className={styles.kicker}>
            COMECE SIMPLES. CRESÇA NO SEU RITMO.
          </span>
          <h2 id="pricing-title">
            Um plano para o seu
            <br />
            próximo momento.
          </h2>
          <p>
            Sua vitrine pode começar grátis.
            <br />
            Pro e Ultra têm 7 dias de teste na assinatura.
          </p>
        </div>
        <div className={styles.billingControls}>
          <div
            className={styles.billingToggle}
            role="group"
            aria-label="Período de cobrança"
          >
            <button onClick={() => setYearly(false)} aria-pressed={!yearly}>
              Mensal
            </button>
            <button onClick={() => setYearly(true)} aria-pressed={yearly}>
              Anual <span>−17%</span>
            </button>
          </div>
          <span>Economize no plano anual.</span>
        </div>
        <div className={styles.priceGrid}>
          <article className={styles.priceCard}>
            <span className={styles.planEyebrow}>SEU PRIMEIRO PASSO</span>
            <h3>
              Gratuito<span>.</span>
            </h3>
            <p className={styles.planDescription}>
              Para tirar sua ideia do papel e dar um endereço à sua marca.
            </p>
            <div className={styles.price}>
              <strong>R$ 0</strong>
              <span>para começar</span>
            </div>
            <p className={styles.priceCaption}>Sem assinatura. Sem cartão.</p>
            <SignUpButton mode="modal" forceRedirectUrl="/onboarding">
              <button className={`${styles.button} ${styles.buttonOutline}`}>
                Criar vitrine grátis <ArrowUpRight size={16} />
              </button>
            </SignUpButton>
            <div className={styles.priceDivider} />
            <p className={styles.includesLabel}>O ESSENCIAL PARA COMEÇAR</p>
            <ul className={styles.planFeatures}>
              {[
                "Página com sua identidade",
                "Seus links em um só lugar",
                "Contato pelo WhatsApp",
                "Endereço para compartilhar na bio",
              ].map((text) => (
                <li key={text}>
                  <Check size={15} />
                  {text}
                </li>
              ))}
            </ul>
            <p className={styles.planFootnote}>
              Recursos avançados disponíveis nos planos pagos.
            </p>
          </article>
          {pricingPlans.map((plan) => (
            <article
              key={plan.id}
              className={`${styles.priceCard} ${plan.id === "pro" ? styles.priceFeatured : ""}`}
            >
              <span className={styles.planEyebrow}>
                {plan.id === "pro" ? (
                  <>
                    <Sparkles size={13} /> PARA PROFISSIONALIZAR
                  </>
                ) : (
                  "PARA EXPANDIR"
                )}
              </span>
              <h3>
                {plan.name}
                <span>.</span>
              </h3>
              <p className={styles.planDescription}>
                {plan.id === "pro"
                  ? "Mais alcance e rastreamento para dar o próximo passo nas vendas."
                  : "Gestão e mais possibilidades para quem tem um negócio em movimento."}
              </p>
              <div className={styles.price} aria-live="polite">
                <strong>
                  {currency(yearly ? plan.yearlyPrice / 12 : plan.monthlyPrice)}
                </strong>
                <span>/ mês</span>
              </div>
              <p className={styles.priceCaption}>
                {yearly
                  ? `${currency(plan.yearlyPrice)} cobrados anualmente após o teste.`
                  : "Cobrança mensal após os 7 dias de teste."}
              </p>
              <SignInButton mode="modal" forceRedirectUrl="/dashboard/billing">
                <button
                  className={`${styles.button} ${plan.id === "pro" ? "" : styles.buttonOutline}`}
                >
                  Conhecer o {plan.id === "pro" ? "Pro" : "Ultra"}{" "}
                  <ArrowUpRight size={16} />
                </button>
              </SignInButton>
              <div className={styles.priceDivider} />
              <p className={styles.includesLabel}>
                {plan.id === "ultra"
                  ? "TUDO DO PRO, MAIS"
                  : "MAIS FERRAMENTAS PARA CRESCER"}
              </p>
              <ul className={styles.planFeatures}>
                {plan.features.map((feature) => (
                  <li key={feature.text}>
                    <Check size={15} />
                    {feature.text
                      .replace("Views de Anúncio", "visualizações de anúncios")
                      .replace(" / Mês", "/mês")}
                  </li>
                ))}
              </ul>
              <p className={styles.planFootnote}>
                7 dias de teste. Cancele pelo painel.
              </p>
            </article>
          ))}
        </div>
        <p className={styles.pricingNote}>
          Os valores anuais são pagos em uma única cobrança. Recursos e limites
          variam por plano. Confira as condições ao assinar.
        </p>
      </div>
    </section>
  );
}
