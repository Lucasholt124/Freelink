"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import { useRouter } from "next/navigation";
import { SignInButton, useAuth } from "@clerk/nextjs";


import { AnimatedCounter } from "@/components/AnimatedCounter";

import WhatsAppFloatingButton from "@/components/landing/WhatsAppFloatingButton";
import HeroPhoneSimulator from "@/components/landing/HeroPhoneSimulator";
import VideoDemoSection from "@/components/landing/VideoDemoSection";
import PricingSection from "@/components/landing/PricingSection";
import RealPagesShowcase from "@/components/landing/RealPagesShowcase";
import SorteiosHighlightSection from "@/components/landing/SorteiosHighlightSection";

import { FaTiktok, FaYoutube } from "react-icons/fa6";
import {
  ArrowRight, BarChart3, Calculator, Check, CheckCircle, Cpu, Crown, Gift, Globe,
  Instagram, Link2, Lock, Menu, MessageCircleCode, Play, Rocket, Settings,
  Shield, Sparkles, TrendingUp, X, Zap, Target, Megaphone
} from "lucide-react";
import { BRAND, features, stats } from "./constants/landing-data";

import {
  RotatingText, SocialProofToast, FAQItem, FeatureCard,
  HowItWorksStep, DifferentialCard, ComparisonCell
} from "@/components/landing/landing-components";

import FeatureMockupShowcase from "@/components/landing/FeatureMockupShowcase";
import { Button } from "@/components/Animaçoes/Button";
import { ScrollReveal } from "@/components/Animaçoes/Animations";

const howItWorks = [
  { icon: <Settings size={22} />, title: "1. Crie sua Vitrine", desc: "Adicione seus produtos, redes e links de afiliados em 2 minutos." },
  { icon: <Target size={22} />, title: "2. Conecte seu Pixel", desc: "Instale Pixel do Facebook e Analytics com 1 clique (sem código)." },
  { icon: <Megaphone size={22} />, title: "3. Ative a Rede de Ads", desc: "Coloque seu produto para rodar em páginas de outros criadores." },
  { icon: <Rocket size={22} />, title: "4. Escale suas Vendas", desc: "Acompanhe os resultados no nosso CRM Inteligente de Lucros." },
];

const differentials = [
  { icon: <Megaphone size={20} />, title: "Hub de Tráfego Grátis", desc: "Membros Pro/Ultra recebem de 2.000 a 15.000 visitantes reais na vitrine por mês." },
  { icon: <Target size={20} />, title: "Pixel & Remarketing", desc: "O único que permite rastrear cada cliente para você fazer anúncios que convertem." },
  { icon: <Calculator size={20} />, title: "Calculadora de Lucro", desc: "Uma ferramenta integrada para você calcular a margem exata e otimizar preços." },
  { icon: <BarChart3 size={20} />, title: "Google Analytics 1-Click", desc: "Conecte seu GA4 copiando apenas o ID, sem precisar mexer em códigos." },
  { icon: <Gift size={20} />, title: "Máquina de Sorteios", desc: "Sistema integrado para puxar comentários do Instagram e bombar seu engajamento." },
  { icon: <Shield size={20} />, title: "Criptografia de Bancos", desc: "Hospedado na AWS/Vercel com proteção da Cloudflare. Não cai e não trava." },
];

const pillars = [
  { icon: <Link2 size={22} />, title: "Sua Vitrine de Alta Conversão", desc: "Pare de mandar seu cliente para um 'linktree' sem graça. Crie uma página rápida, que carrega as imagens do seu produto em milissegundos e transmite confiança.", color: "from-indigo-500 to-blue-500", badge: "Vitrine" },
  { icon: <Megaphone size={22} />, title: "Tráfego Automático (AdsHub)", desc: "Exclusividade Freelinnk: nós exibimos o seu produto em formato de anúncio nas vitrines de outros lojistas que não competem com você. Tráfego real entrando no seu funil.", color: "from-purple-500 to-pink-500", badge: "Tráfego" },
  { icon: <Calculator size={22} />, title: "Lucro e Rastreamento", desc: "Você sabe qual é sua taxa de conversão hoje? Conecte seu Pixel e use a calculadora para definir sua margem de lucro de forma automática.", color: "from-emerald-500 to-teal-500", badge: "Gestão" },
];

const painPoints = [
  { problem: "Usa um agregador de links grátis, feio e amador que espanta clientes", solution: "Uma vitrine Premium que transmite confiança de uma marca gigante" },
  { problem: "Perde clientes quentes porque não pode colocar o Pixel do Facebook no link", solution: "Integração nativa com Meta Pixel e Google Analytics em 1 clique" },
  { problem: "Sofre para conseguir tráfego e visualizações nos seus produtos", solution: "Rede de anúncios interna que joga tráfego qualificado na sua página" },
  { problem: "Não sabe qual produto dá lucro real ou margem de comissão", solution: "Calculadora Inteligente que ajuda a precificar corretamente" },
];

const comparisonData = [
  { name: "Páginas Customizáveis", freelinnk: true as const, linktree: true as const, beacons: true as const },
  { name: "Pixel FB / Analytics", freelinnk: true as const, linktree: "paid" as const, beacons: "paid" as const },
  { name: "Hub de Anúncios Nativo", freelinnk: true as const, linktree: false as const, beacons: false as const },
  { name: "Calculadora de Lucro", freelinnk: true as const, linktree: false as const, beacons: false as const },
  { name: "Sorteador Instagram", freelinnk: true as const, linktree: false as const, beacons: false as const },
  { name: "Google Analytics 1-Click", freelinnk: true as const, linktree: "paid" as const, beacons: "paid" as const },
  { name: "Bloqueador de Anúncios", freelinnk: true as const, linktree: false as const, beacons: false as const },
  { name: "Múltiplas Páginas", freelinnk: true as const, linktree: "partial" as const, beacons: "partial" as const },
  { name: "Suporte VIP WhatsApp", freelinnk: true as const, linktree: false as const, beacons: false as const },
  { name: "Garantia 7 Dias", freelinnk: true as const, linktree: false as const, beacons: false as const },
];

const faqs = [
  { q: "O Freelinnk é seguro? Corre o risco de cair?", a: "Absolutamente. Usamos a mesma infraestrutura dos gigantes (Vercel e Cloudflare) com criptografia ponta a ponta. Seu link nunca fica fora do ar." },
  { q: "Qual a vantagem de usar o Hub de Anúncios?", a: "Se você não pagar anúncios no Facebook, ninguém vê seus produtos. Com nosso Hub, os planos Pro e Ultra ganham milhares de visualizações distribuindo seus produtos nas páginas da nossa rede (sempre para nichos compatíveis)." },
  { q: "Como instalo o Pixel do Facebook?", a: "Se você é Pro ou Ultra, basta colar o ID do seu Pixel nas configurações. O Freelinnk injeta automaticamente o código, permitindo campanhas de remarketing perfeitas sem precisar de programador." },
  { q: "Como funciona a Garantia de 7 dias?", a: "Comece o teste. Se em 7 dias a ferramenta não te ajudar a vender mais, captar tráfego ou profissionalizar sua marca, basta pedir o cancelamento. Devolvemos 100% sem dor de cabeça." },
  { q: "Por que sair do Linktree para o Freelinnk?", a: "O Linktree é um agrupador de botões. O Freelinnk é um funil com Tráfego, Calculadora Financeira, Pixel e Sorteador integrados." },
];

export default function LandingPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showStickyFooter, setShowStickyFooter] = useState(false);
  const [heroUsername, setHeroUsername] = useState("");

  const { scrollYProgress } = useScroll();

  useEffect(() => {
    if (isLoaded && isSignedIn) router.push("/dashboard");
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      setShowStickyFooter(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-white text-gray-900 font-sans selection:bg-indigo-500 selection:text-white w-full">

      {/* Scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 z-[100] origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      <WhatsAppFloatingButton />
      <SocialProofToast />

      {/* Sticky CTA - mobile only */}
      <AnimatePresence>
        {showStickyFooter && (
          <motion.div
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-0 left-0 right-0 z-[90] p-3 bg-white/95 backdrop-blur-md border-t border-gray-100 md:hidden shadow-lg"
          >
            <SignInButton mode="modal" forceRedirectUrl="/onboarding">
              <Button className="w-full relative z-50 pointer-events-auto" size="lg">
                Começar Grátis <ArrowRight size={16} />
              </Button>
            </SignInButton>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── NAV ── */}
      <nav
        className={`fixed top-0 w-full z-[80] transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100" : "bg-transparent"
          }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 md:h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer relative z-50"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm ${BRAND.gradient} shadow`}>F</div>
            <span className="text-base font-bold tracking-tight">Freelinnk</span>
          </div>

          <div className="hidden lg:flex items-center gap-6">
            {[
              { label: "Funcionalidades", href: "#funcionalidades" },
              { label: "Como Funciona", href: "#como-funciona" },
              { label: "Preços", href: "#precos" },
              { label: "Comparativo", href: "#comparativo" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 relative z-50">
            <div className="hidden lg:block">
              <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                <button className="text-sm text-gray-500 hover:text-indigo-600 transition-colors px-3 py-1.5 cursor-pointer">
                  Entrar
                </button>
              </SignInButton>
            </div>
            <div className="hidden md:block">
              <SignInButton mode="modal" forceRedirectUrl="/onboarding">
                <Button size="sm" className="cursor-pointer relative z-50">Criar Conta Grátis</Button>
              </SignInButton>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 relative z-50"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden bg-white border-b border-gray-100 overflow-hidden"
            >
              <div className="px-4 py-3 space-y-1">
                {[
                  { label: "Funcionalidades", href: "#funcionalidades" },
                  { label: "Como Funciona", href: "#como-funciona" },
                  { label: "Preços", href: "#precos" },
                  { label: "Comparativo", href: "#comparativo" },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2.5 px-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    {item.label}
                  </a>
                ))}
                <div className="pt-2">
                  <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                    <button className="block w-full py-2.5 px-3 text-center bg-indigo-50 text-indigo-600 font-semibold rounded-lg text-sm cursor-pointer">
                      Acessar Meu Painel
                    </button>
                  </SignInButton>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-20 pb-10 md:pt-28 lg:pt-32 lg:pb-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-100 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 opacity-40" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-100 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3 opacity-40" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-8 items-center">
            <div className="text-center lg:text-left">
              <ScrollReveal>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-xs font-semibold text-green-700 mb-5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  A primeira Bio-Store com Anúncios Integrados
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.15] mb-4 text-gray-900">
                  Muito mais que links: Um funil completo de Tráfego, Vendas e Gestão.
                </h1>

                <p className="text-base text-gray-500 max-w-xl mx-auto lg:mx-0 mb-5 leading-relaxed">
                  <strong className="text-gray-800">Deixe as ferramentas amadoras para trás.</strong> O Freelinnk une vitrine premium, rede de anúncios integrada, máquina de sorteios virais, Pixel de rastreamento e calculadora financeira em um só lugar.
                </p>

                <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                  <span className="text-xs text-gray-400">Traga tráfego de:</span>
                  <div className="flex items-center gap-1.5">
                    {[
                      { icon: <Instagram size={15} />, label: "Instagram", color: "text-pink-500" },
                      { icon: <FaTiktok size={13} />, label: "TikTok", color: "text-gray-900" },
                      { icon: <FaYoutube size={15} />, label: "YouTube", color: "text-red-500" },
                      { icon: <Globe size={15} />, label: "Web", color: "text-blue-500" },
                    ].map((platform, i) => (
                      <div
                        key={i}
                        className={`w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center ${platform.color}`}
                        title={platform.label}
                      >
                        {platform.icon}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Desktop CTA input */}
                <div className="hidden sm:flex max-w-md mx-auto lg:mx-0 bg-white p-1.5 rounded-xl shadow-sm border border-gray-200 flex-col sm:flex-row gap-2 mb-5 relative z-30">
                  <div className="flex-1 bg-gray-50 rounded-lg px-3 flex items-center h-10 border border-transparent focus-within:border-indigo-400 focus-within:bg-white transition-all">
                    <span className="text-gray-400 text-xs font-medium mr-1">freelinnk.com/</span>
                    <input
                      type="text"
                      placeholder="minhaloja"
                      value={heroUsername}
                      onChange={(e) => setHeroUsername(e.target.value)}
                      className="bg-transparent border-none outline-none font-semibold text-sm text-gray-900 w-full placeholder:text-gray-300 focus:ring-0"
                    />
                  </div>
                  <SignInButton
                    mode="modal"
                    forceRedirectUrl={heroUsername ? `/onboarding?username=${heroUsername}` : "/onboarding"}
                  >
                    <Button className="w-full sm:w-auto whitespace-nowrap cursor-pointer pointer-events-auto" size="md">
                      Garantir Meu Nome
                    </Button>
                  </SignInButton>
                </div>

                {/* Mobile CTA */}
                <div className="flex sm:hidden flex-col gap-3 justify-center mb-6 relative z-30">
                  <SignInButton mode="modal" forceRedirectUrl="/onboarding">
                    <Button size="lg" className="w-full group cursor-pointer pointer-events-auto">
                      Montar Minha Vitrine <ArrowRight size={16} />
                    </Button>
                  </SignInButton>
                  <p className="text-xs text-gray-400 text-center">7 dias grátis · Sem cartão necessário</p>
                </div>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><CheckCircle size={11} className="text-green-500" /> Sem limite de links</span>
                  <span className="hidden sm:inline text-gray-200">·</span>
                  <span className="flex items-center gap-1"><Lock size={11} className="text-blue-500" /> Aceita Pixel do FB</span>
                  <span className="hidden sm:inline text-gray-200">·</span>
                  <span className="flex items-center gap-1"><Zap size={11} className="text-purple-500" /> Pronto em 2 min</span>
                </div>
              </ScrollReveal>
            </div>

            <div className="flex justify-center lg:justify-end relative z-10">
              <ScrollReveal>
                <HeroPhoneSimulator />
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-8 bg-indigo-900 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl md:text-4xl font-bold mb-0.5">
                  <AnimatedCounter {...stat} value={Number(stat.value)} />
                </p>
                <p className="text-xs text-indigo-300 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PILLARS ── */}
      <section className="py-14 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold mb-3">
                <Target size={13} /> A Máquina de Vendas
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                Lojista de verdade precisa de{" "}
                <span className={BRAND.textGradient}>dados e tráfego.</span>
              </h2>
              <p className="text-gray-500 text-sm max-w-xl mx-auto">
                Não somos apenas botões empilhados. O Freelinnk foi construído para te dar as mesmas ferramentas das grandes lojas.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-5">
            {pillars.map((pillar, i) => (
              <ScrollReveal key={i} className="h-full">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${pillar.color} rounded-xl flex items-center justify-center text-white`}>
                      {pillar.icon}
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full">{pillar.badge}</span>
                  </div>
                  <h3 className="font-semibold text-base text-gray-900 mb-2">{pillar.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{pillar.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <VideoDemoSection />

      {/* ── SHOWCASE ── */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold mb-3">
                <Crown size={13} /> Alta Conversão
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                Lindo para eles.{" "}
                <span className={BRAND.textGradient}>Lucrativo para você.</span>
              </h2>
              <p className="text-gray-500 text-sm max-w-xl mx-auto">
                Vitrines reais construídas na nossa plataforma.
              </p>
            </div>
          </ScrollReveal>
          <RealPagesShowcase />
          <div className="text-center mt-8 relative z-30">
            <SignInButton mode="modal" forceRedirectUrl="/onboarding">
              <Button size="lg" className="cursor-pointer pointer-events-auto">
                Montar Minha Vitrine <ArrowRight size={16} />
              </Button>
            </SignInButton>
          </div>
        </div>
      </section>

      {/* ── PAIN POINTS ── */}
      <section className="py-14 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-xs font-semibold mb-3">
                <TrendingUp size={13} /> Pare de Queimar Dinheiro
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                Seu agrupador de links antigo está{" "}
                <span className="text-red-500">roubando seus clientes.</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="space-y-3">
            {painPoints.map((point, i) => (
              <ScrollReveal key={i}>
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-sm transition-shadow">
                  <div className="grid md:grid-cols-2">
                    <div className="p-5 flex items-start gap-3 bg-red-50/40 border-b md:border-b-0 md:border-r border-red-100/50">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <X size={12} className="text-red-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wide mb-1">Linktree / Outros</p>
                        <p className="text-gray-700 text-sm leading-snug">{point.problem}</p>
                      </div>
                    </div>
                    <div className="p-5 flex items-start gap-3 bg-emerald-50/40">
                      <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={12} className="text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide mb-1">No Freelinnk</p>
                        <p className="text-gray-700 text-sm leading-snug">{point.solution}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <div className="text-center mt-8 relative z-30">
            <SignInButton mode="modal" forceRedirectUrl="/onboarding">
              <Button size="lg" className="cursor-pointer pointer-events-auto bg-emerald-600 hover:bg-emerald-700 from-emerald-600 to-emerald-600">
                Parar de Perder Vendas <ArrowRight size={16} />
              </Button>
            </SignInButton>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="funcionalidades" className="py-14 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold mb-3">
                <Cpu size={13} /> Arsenal Completo
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                A tecnologia por trás das{" "}
                <span className={BRAND.textGradient}>suas vendas.</span>
              </h2>
            </div>
          </ScrollReveal>

          <FeatureMockupShowcase />
        </div>
      </section>

      <SorteiosHighlightSection />

      {/* ── HOW IT WORKS ── */}
      <section id="como-funciona" className="py-14 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold mb-3">
                <Play size={13} /> Como Começar
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                Sua vitrine pronta hoje,{" "}
                <span className={BRAND.textGradient}>em 4 passos.</span>
              </h2>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {howItWorks.map((step, i) => (
              <HowItWorksStep key={i} step={step} index={i} total={howItWorks.length} />
            ))}
          </div>
        </div>
      </section>

      <PricingSection />

      {/* ── COMPARISON ── */}
      <section id="comparativo" className="py-14 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold mb-3">
                <Sparkles size={13} /> Comparativo
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                Por que lojistas estão{" "}
                <span className="text-gray-400 line-through decoration-red-400">abandonando os velhos</span>?
              </h2>
              <p className="text-gray-500 text-sm max-w-xl mx-auto">
                Não pague ferramentas gringas em Dólar que não oferecem suporte no Brasil.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="grid grid-cols-4 border-b border-gray-100">
                <div className="p-4"><p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Recurso</p></div>
                <div className="p-4 text-center bg-indigo-50/40 border-x border-indigo-100">
                  <div className="flex items-center justify-center gap-1">
                    <div className={`w-5 h-5 rounded-md ${BRAND.gradient} flex items-center justify-center text-white text-xs font-bold`}>F</div>
                    <span className="font-bold text-sm text-indigo-700">Freelinnk</span>
                  </div>
                </div>
                <div className="p-4 text-center"><span className="text-sm text-gray-400 font-medium">Linktree</span></div>
                <div className="p-4 text-center"><span className="text-sm text-gray-400 font-medium">Beacons</span></div>
              </div>

              {comparisonData.map((row, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-4 ${i < comparisonData.length - 1 ? "border-b border-gray-50" : ""} hover:bg-gray-50/50 transition-colors`}
                >
                  <div className="p-3.5 md:p-4 flex items-center">
                    <span className="text-sm text-gray-700">{row.name}</span>
                  </div>
                  <div className="p-3.5 md:p-4 flex items-center justify-center bg-indigo-50/20 border-x border-indigo-50">
                    <ComparisonCell value={row.freelinnk} />
                  </div>
                  <div className="p-3.5 md:p-4 flex items-center justify-center">
                    <ComparisonCell value={row.linktree} />
                  </div>
                  <div className="p-3.5 md:p-4 flex items-center justify-center">
                    <ComparisonCell value={row.beacons} />
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-4 bg-gray-50 border-t border-gray-100">
                <div className="p-4 flex items-center">
                  <span className="text-sm font-semibold text-gray-900">Preço Pro/mês</span>
                </div>
                <div className="p-4 text-center bg-indigo-50/40 border-x border-indigo-100">
                  <p className="text-base font-bold text-indigo-600">R$ 34,90</p>
                </div>
                <div className="p-4 text-center">
                  <p className="text-base font-bold text-gray-400">R$ 55<span className="text-xs"> (US$ 10)</span></p>
                </div>
                <div className="p-4 text-center">
                  <p className="text-base font-bold text-gray-400">R$ 55<span className="text-xs"> (US$ 10)</span></p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <div className="text-center mt-8 relative z-30">
            <SignInButton mode="modal" forceRedirectUrl="/onboarding">
              <Button size="lg" className="cursor-pointer pointer-events-auto">
                Garantir o Melhor Preço <ArrowRight size={16} />
              </Button>
            </SignInButton>
          </div>
        </div>
      </section>

      {/* ── DIFFERENTIALS ── */}
      <section id="diferenciais" className="py-14 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                O que ninguém te conta sobre{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Links</span>
              </h2>
              <p className="text-gray-400 text-sm max-w-xl mx-auto">
                Não adianta ser bonito se não for feito para converter. Veja como nós resolvemos isso.
              </p>
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {differentials.map((item, i) => (
              <DifferentialCard key={i} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* ── GUARANTEE ── */}
      <section className="py-14 bg-white">
        <div className="max-w-xl mx-auto px-4 text-center">
          <ScrollReveal>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-md">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">Garantia Blindada de 7 Dias</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Assine, instale seu Pixel, ative a Rede de Tráfego e analise seus cliques. Se em 7 dias a ferramenta não se pagar sozinha com os resultados, devolvemos 100% do seu dinheiro no mesmo dia.{" "}
              <strong className="text-gray-700">Zero burocracia.</strong>
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-14 bg-gray-50 border-t border-gray-100">
        <div className="max-w-2xl mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold mb-3">
                <MessageCircleCode size={13} /> FAQ
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Perguntas Frequentes</h2>
            </div>
          </ScrollReveal>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <ScrollReveal>
            <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/20">
              <Rocket size={26} className="text-yellow-300" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">
              Pare de empilhar botões.<br />
              Comece a <span className="text-yellow-300">fechar negócios.</span>
            </h2>
            <p className="text-white/70 text-sm max-w-lg mx-auto mb-8">
              Transforme a sua Bio no Instagram num funil automático. Tráfego, Pixel e Lucro em um só lugar.
            </p>
            <SignInButton mode="modal" forceRedirectUrl="/onboarding">
              <Button
                size="xl"
                variant="white"
                className="shadow-xl cursor-pointer pointer-events-auto text-indigo-700 hover:text-indigo-900"
              >
                Criar Minha Vitrine Grátis <ArrowRight size={18} />
              </Button>
            </SignInButton>
          </ScrollReveal>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-white pt-14 pb-24 md:pb-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-base ${BRAND.gradient} shadow`}>F</div>
                <span className="text-lg font-bold">Freelinnk</span>
              </div>
              <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
                O único Bio Link focado em Vendas. Ferramentas, Pixel de Rastreamento e Rede de Tráfego Automática para lojistas e criadores profissionais.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">Produto</h4>
              <ul className="space-y-3 text-gray-400">
                {[
                  { href: "#funcionalidades", text: "Funcionalidades" },
                  { href: "#como-funciona", text: "Como Funciona" },
                  { href: "#precos", text: "Preços" },
                  { href: "#comparativo", text: "Comparativo" },
                ].map((link, i) => (
                  <li key={i}>
                    <a href={link.href} className="text-sm hover:text-white transition-colors">{link.text}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4">Legal</h4>
              <ul className="space-y-3 text-gray-400">
                {[
                  { href: "/terms-of-service", text: "Termos de Uso" },
                  { href: "/privacy-policy", text: "Política de Privacidade" },
                  { href: "/help", text: "Central de Ajuda" },
                ].map((link, i) => (
                  <li key={i}>
                    <a href={link.href} className="text-sm hover:text-white transition-colors">{link.text}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="pt-6 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-xs text-gray-500">© 2026 Freelinnk. Lojistas Profissionais.</p>
            <div className="flex items-center gap-5">
              <span className="flex items-center gap-1.5 text-gray-500 text-xs"><Lock size={12} className="text-green-500" /> Criptografia 256-bit</span>
              <span className="flex items-center gap-1.5 text-gray-500 text-xs"><Shield size={12} className="text-green-500" /> LGPD Compliant</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
