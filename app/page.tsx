"use client";

import { useEffect, useState } from "react";
import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Check,
  ChevronDown,
  Gift,
  Globe,
  Instagram,
  Link2,
  Menu,
  MessageCircle,
  Megaphone,
  Palette,
  Plus,
  ShieldCheck,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { FaTiktok, FaYoutube, FaWhatsapp } from "react-icons/fa6";
import HeroPhoneSimulator from "@/components/landing/HeroPhoneSimulator";
import PricingSection from "@/components/landing/PricingSection";
import RealPagesShowcase from "@/components/landing/RealPagesShowcase";
import VideoDemoSection from "@/components/landing/VideoDemoSection";
import WhatsAppFloatingButton from "@/components/landing/WhatsAppFloatingButton";
import styles from "@/components/landing/landing.module.css";

const navigation = [
  { label: "O produto", href: "#funcionalidades" },
  { label: "Inspirações", href: "#inspiracoes" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Planos", href: "#precos" },
];

const questions = [
  {
    question: "Posso começar sem pagar?",
    answer:
      "Sim. Você pode criar sua conta e começar com o plano gratuito, sem cartão. Quando precisar de recursos como Pixel, rede de anúncios ou gestão financeira, pode escolher um dos planos pagos no painel.",
  },
  {
    question: "Preciso saber programar ou ter um site?",
    answer:
      "Não. Você personaliza sua página, adiciona seus links e compartilha o endereço do Freelinnk na bio. Tudo é feito pelo painel, sem precisar escrever código.",
  },
  {
    question: "Como funciona o teste de 7 dias?",
    answer:
      "Os planos Pro e Ultra oferecem 7 dias de teste na assinatura. A cobrança do plano escolhido começa ao final desse período. Você pode cancelar antes da cobrança pelo painel de assinatura. O plano gratuito continua sendo uma opção para começar.",
  },
  {
    question: "O que é o Hub de Anúncios?",
    answer:
      "É a rede de divulgação do Freelinnk. Nos planos pagos, você pode criar campanhas para apresentar seus produtos em outras páginas da rede. Os limites de campanhas e visualizações variam por plano; visualizações de anúncios não são uma garantia de cliques ou vendas.",
  },
  {
    question: "Posso usar Pixel e Google Analytics?",
    answer:
      "Sim. Nos planos Pro e Ultra, você conecta as ferramentas de rastreamento informando seus IDs nas configurações. Assim, pode acompanhar os acessos e criar públicos para suas campanhas.",
  },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) router.replace("/dashboard");
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  return (
    <div className={styles.landing}>
      <a href="#conteudo" className={styles.skipLink}>
        Pular para o conteúdo
      </a>
      <header className={styles.header}>
        <div className={`${styles.container} ${styles.nav}`}>
          <a href="#" className={styles.logo} aria-label="Freelinnk, início">
            <span className={styles.logoMark}>
              F<span />
            </span>
            Freelinnk<span className={styles.logoDot}>.</span>
          </a>
          <nav className={styles.desktopNav} aria-label="Menu principal">
            {navigation.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
          <div className={styles.navActions}>
            <SignInButton mode="modal" forceRedirectUrl="/dashboard">
              <button className={styles.loginButton}>
                Entrar <ArrowUpRight size={14} />
              </button>
            </SignInButton>
            <SignUpButton mode="modal" forceRedirectUrl="/onboarding">
              <button className={`${styles.button} ${styles.navCta}`}>
                Começar grátis <ArrowRight size={15} />
              </button>
            </SignUpButton>
            <button
              className={styles.menuButton}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
              aria-controls="menu-mobile"
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav
            id="menu-mobile"
            className={styles.mobileNav}
            aria-label="Menu principal móvel"
          >
            {navigation.map((item) => (
              <a
                href={item.href}
                key={item.href}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
                <ArrowUpRight size={16} />
              </a>
            ))}
            <SignUpButton mode="modal" forceRedirectUrl="/onboarding">
              <button
                className={styles.button}
                onClick={() => setMenuOpen(false)}
              >
                Criar minha página grátis <ArrowRight size={16} />
              </button>
            </SignUpButton>
          </nav>
        )}
      </header>

      <main id="conteudo">
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div className={styles.heroCopy}>
              <span className={styles.eyebrow}>
                <span className={styles.statusDot} /> MUITO MAIS QUE UM LINK NA
                BIO
              </span>
              <h1 id="hero-title">
                Seus links.
                <br />
                Seu tráfego.
                <br />
                <span className={styles.heroAccent}>
                  Sua gestão
                  <svg viewBox="0 0 310 18" aria-hidden="true">
                    <path d="M3 12C77 1 183 1 306 9" />
                  </svg>
                  .
                </span>
              </h1>
              <p className={styles.heroDescription}>
                Crie sua página de links com WhatsApp e redes sociais. Vá além
                com Hub de Anúncios, Pixel, Analytics, sorteios e gestão no
                mesmo painel, conforme o seu plano.
              </p>
              <div className={styles.heroActions}>
                <SignUpButton mode="modal" forceRedirectUrl="/onboarding">
                  <button className={`${styles.button} ${styles.buttonLarge}`}>
                    Criar minha página grátis <ArrowUpRight size={19} />
                  </button>
                </SignUpButton>
                <a href="#demonstracao" className={styles.textLink}>
                  Conhecer o Freelinnk <ArrowDown size={16} />
                </a>
              </div>
              <p className={styles.ctaNote}>
                <Check size={14} /> Plano gratuito de verdade. Sem cartão.
              </p>
              <div className={styles.platforms}>
                <span>Um link para todas as suas redes</span>
                <div>
                  <Instagram size={18} aria-label="Instagram" />
                  <FaTiktok size={17} aria-label="TikTok" />
                  <FaYoutube size={20} aria-label="YouTube" />
                  <FaWhatsapp size={20} aria-label="WhatsApp" />
                </div>
              </div>
            </div>
            <HeroPhoneSimulator />
          </div>
          <div className={`${styles.container} ${styles.promiseStrip}`}>
            <div>
              <Palette size={19} />
              <span>Sua marca. Seu estilo.</span>
            </div>
            <div>
              <Link2 size={19} />
              <span>Links, contatos e redes sociais.</span>
            </div>
            <div>
              <MessageCircle size={19} />
              <span>Mais perto do seu cliente.</span>
            </div>
            <a href="#funcionalidades">
              Conheça as possibilidades <ArrowDown size={15} />
            </a>
          </div>
        </section>

        <section
          id="funcionalidades"
          className={`${styles.section} ${styles.features}`}
          aria-labelledby="features-title"
        >
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <div>
                <span className={styles.kicker}>
                  BONITO POR FORA. INTELIGENTE POR DENTRO.
                </span>
                <h2 id="features-title">
                  O próximo passo do
                  <br />
                  seu negócio começa aqui.
                </h2>
              </div>
              <p>
                Uma boa primeira impressão abre portas.
                <br />
                As ferramentas certas ajudam você a ir além.
              </p>
            </div>
            <div className={styles.bentoGrid}>
              <article className={`${styles.brandCard} ${styles.featureCard}`}>
                <div className={styles.cardLabel}>
                  <Palette size={17} /> SUA IDENTIDADE, EM DESTAQUE
                </div>
                <h3>
                  Uma página que
                  <br />
                  só poderia ser sua.
                </h3>
                <p>
                  Cores, imagens e links organizados para sua marca ser
                  reconhecida no primeiro clique.
                </p>
                <div
                  className={styles.customizationPreview}
                  aria-label="Exemplo ilustrativo de personalização"
                >
                  <div className={styles.stylePanel}>
                    <span>Seu estilo</span>
                    <div className={styles.swatches}>
                      <i />
                      <i />
                      <i />
                      <i />
                    </div>
                    <div className={styles.fontSample}>
                      Aa{" "}
                      <span>
                        Sua personalidade
                        <br />
                        em cada detalhe.
                      </span>
                    </div>
                    <div className={styles.panelLine} />
                    <span className={styles.panelSaved}>
                      <Check size={12} /> A sua cara.
                    </span>
                  </div>
                  <div className={styles.miniPage}>
                    <div className={styles.miniAvatar}>F</div>
                    <strong>@suaempresa</strong>
                    <span>Seus contatos e links em um só lugar.</span>
                    <div>
                      Visite nosso site <ArrowUpRight size={11} />
                    </div>
                    <div>
                      Fale no WhatsApp <MessageCircle size={11} />
                    </div>
                    <div>
                      Nosso Instagram <Instagram size={11} />
                    </div>
                    <small>Exemplo de personalização</small>
                  </div>
                </div>
              </article>
              <article
                className={`${styles.trackingCard} ${styles.featureCard}`}
              >
                <div className={styles.cardLabel}>
                  <Target size={17} /> DADOS PARA DECIDIR MELHOR{" "}
                  <span>PRO</span>
                </div>
                <h3>
                  Entenda o que
                  <br />
                  faz seu cliente clicar.
                </h3>
                <p>
                  Conecte Meta Pixel e Google Analytics para conhecer seus
                  acessos e planejar suas próximas campanhas.
                </p>
                <div className={styles.analyticsPreview}>
                  <div>
                    <span>Visão geral dos acessos</span>
                    <BarChart3 size={17} />
                  </div>
                  <div className={styles.chart} aria-hidden="true">
                    {[28, 43, 36, 57, 48, 67, 59, 82, 74, 94, 87, 110].map(
                      (height, i) => (
                        <i key={i} style={{ height }} />
                      ),
                    )}
                  </div>
                  <div className={styles.chartCaption}>
                    <span>
                      Meta Pixel <Check size={12} />
                    </span>
                    <span>
                      Google Analytics <Check size={12} />
                    </span>
                  </div>
                  <small>Prévia ilustrativa do recurso</small>
                </div>
              </article>
              {[
                {
                  icon: Megaphone,
                  title: "Sua loja pode ir mais longe.",
                  description:
                    "Apresente seus produtos em outras páginas com o Hub de Anúncios da rede.",
                  badge: "PRO",
                },
                {
                  icon: Gift,
                  title: "Engaje quem acompanha você.",
                  description:
                    "Organize sorteios do Instagram com filtros e seleção de comentários em um só lugar.",
                  badge: "PRO",
                },
                {
                  icon: BarChart3,
                  title: "Saiba o que fica no seu bolso.",
                  description:
                    "Organize clientes e acompanhe suas margens com CRM e calculadora de lucro.",
                  badge: "ULTRA",
                },
              ].map((feature) => (
                <article key={feature.title} className={styles.smallFeature}>
                  <div className={styles.smallFeatureTop}>
                    <span>
                      <feature.icon size={22} />
                    </span>
                    <small>{feature.badge}</small>
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </article>
              ))}
            </div>
            <a href="#precos" className={styles.understatedLink}>
              Encontre os recursos certos para você <ArrowRight size={16} />
            </a>
          </div>
        </section>

        <section
          id="inspiracoes"
          className={`${styles.section} ${styles.showcaseSection}`}
          aria-labelledby="showcase-title"
        >
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <div>
                <span className={styles.kicker}>
                  NEGÓCIOS DIFERENTES. A MESMA POSSIBILIDADE.
                </span>
                <h2 id="showcase-title">
                  Seu estilo já tem
                  <br />
                  um lugar por aqui.
                </h2>
              </div>
              <p>
                Da primeira ideia à loja em movimento.
                <br />
                Veja páginas criadas com o Freelinnk.
              </p>
            </div>
            <RealPagesShowcase />
          </div>
        </section>

        <section
          id="como-funciona"
          className={`${styles.section} ${styles.howSection}`}
          aria-labelledby="how-title"
        >
          <div className={styles.container}>
            <div className={styles.centerHeading}>
              <span className={styles.kicker}>
                MENOS COMPLICAÇÃO. MAIS POSSIBILIDADES.
              </span>
              <h2 id="how-title">
                Da ideia à bio.
                <br className={styles.mobileBreak} /> Em poucos passos.
              </h2>
              <p>Você cuida do seu negócio. A gente simplifica o caminho.</p>
            </div>
            <div className={styles.steps}>
              {[
                {
                  number: "01",
                  icon: Palette,
                  title: "Deixe com a sua cara",
                  text: "Crie sua conta e escolha as cores, a foto e a identidade da sua página.",
                },
                {
                  number: "02",
                  icon: Plus,
                  title: "Reúna o que importa",
                  text: "Adicione seus links, redes sociais e seu contato no WhatsApp.",
                },
                {
                  number: "03",
                  icon: ArrowUpRight,
                  title: "Compartilhe seu novo link",
                  text: "Coloque o endereço na bio e facilite o próximo passo do seu cliente.",
                },
              ].map((step) => (
                <article key={step.number}>
                  <div className={styles.stepTop}>
                    <span>{step.number}</span>
                    <step.icon size={22} />
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
            <VideoDemoSection />
          </div>
        </section>

        <PricingSection />

        <section
          className={`${styles.section} ${styles.faqSection}`}
          aria-labelledby="faq-title"
        >
          <div className={`${styles.container} ${styles.faqGrid}`}>
            <div>
              <span className={styles.kicker}>VAMOS TIRAR AS DÚVIDAS?</span>
              <h2 id="faq-title">
                Tudo claro.
                <br />
                Antes de começar.
              </h2>
              <p>
                O essencial para dar o primeiro passo
                <br />
                com tranquilidade.
              </p>
              <a href="/dashboard/help" className={styles.textLink}>
                Conheça a central de ajuda <ArrowUpRight size={16} />
              </a>
            </div>
            <div className={styles.faqList}>
              {questions.map((item) => (
                <details key={item.question}>
                  <summary>
                    {item.question}
                    <ChevronDown size={18} />
                  </summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.finalSection}>
          <div className={`${styles.container} ${styles.finalCard}`}>
            <div className={styles.finalDecor} aria-hidden="true">
              <Link2 />
            </div>
            <span className={styles.kicker}>
              SEU PRÓXIMO CAPÍTULO TEM UM LINK.
            </span>
            <h2>
              Sua marca merece
              <br />
              ser vista assim.
            </h2>
            <p>Transforme o primeiro clique em uma boa primeira impressão.</p>
            <SignUpButton mode="modal" forceRedirectUrl="/onboarding">
              <button className={`${styles.button} ${styles.buttonLight}`}>
                Criar minha página grátis <ArrowUpRight size={19} />
              </button>
            </SignUpButton>
            <span className={styles.finalNote}>
              <Check size={14} /> Comece no plano gratuito. Evolua no seu ritmo.
            </span>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerTop}>
            <div>
              <a href="#" className={styles.logo}>
                <span className={styles.logoMark}>
                  F<span />
                </span>
                Freelinnk<span className={styles.logoDot}>.</span>
              </a>
              <p>
                Seu negócio merece mais
                <br />
                que um link na bio.
              </p>
              <span className={styles.madeInBrazil}>
                <Globe size={13} /> Feito para negócios brasileiros.
              </span>
            </div>
            <div>
              <h3>Explore</h3>
              {navigation.map((item) => (
                <a key={item.href} href={item.href}>
                  {item.label}
                </a>
              ))}
            </div>
            <div>
              <h3>Precisa de ajuda?</h3>
              <a href="/dashboard/help">
                Central de ajuda <ArrowUpRight size={13} />
              </a>
              <a href="/terms-of-service">Termos de uso</a>
              <a href="/privacy-policy">Privacidade</a>
            </div>
            <div className={styles.footerInvite}>
              <Sparkles size={22} />
              <h3>
                Uma boa ideia.
                <br />
                Um novo endereço.
              </h3>
              <SignUpButton mode="modal" forceRedirectUrl="/onboarding">
                <button className={styles.understatedLink}>
                  Comece a sua <ArrowRight size={16} />
                </button>
              </SignUpButton>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <span>
              © {new Date().getFullYear()} Freelinnk. Todos os direitos
              reservados.
            </span>
            <span>
              <ShieldCheck size={14} /> Sua marca em boas mãos.
            </span>
          </div>
        </div>
      </footer>
      <WhatsAppFloatingButton />
    </div>
  );
}
