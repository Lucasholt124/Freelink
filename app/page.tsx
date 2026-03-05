"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import { useRouter } from "next/navigation";
import { SignInButton, useAuth } from "@clerk/nextjs";


import { ScrollReveal } from "@/components/Animaçoes/Animations";
import { Button } from "@/components/Animaçoes/Button";
import { AnimatedCounter } from "@/components/AnimatedCounter";


import WhatsAppFloatingButton from "@/components/landing/WhatsAppFloatingButton";
import HeroPhoneSimulator from "@/components/landing/HeroPhoneSimulator";
import VideoDemoSection from "@/components/landing/VideoDemoSection";
import PricingSection from "@/components/landing/PricingSection";
import RealPagesShowcase from "@/components/landing/RealPagesShowcase";
import SorteiosHighlightSection from "@/components/landing/SorteiosHighlightSection";


import { FaLinkedinIn, FaTiktok, FaYoutube } from "react-icons/fa6";
import {
  ArrowRight, BarChart3, Bot, Calculator, Check, CheckCircle, Cpu, Crown, Gift, Globe,
  Instagram, Layers, Link2, Lock, Menu, MessageCircleCode, Palette, Play, Rocket, Settings,
  Share2, Shield, Sparkles, Star, TrendingUp, Users, Wand2, X, Zap
} from "lucide-react";
import { BRAND, features, nichos, stats, testimonials } from "./constants/landing-data";

import {
  RotatingText, SocialProofToast, FAQItem, FeatureCard, TestimonialCard,
  HowItWorksStep, NichoCard, DifferentialCard, ComparisonCell
} from "@/components/landing/landing-components";

const howItWorks = [
  { icon: <Settings size={36} />, title: "Configure sua página", desc: "Personalize cada detalhe do seu jeito" },
  { icon: <Wand2 size={36} />, title: "Crie seus links", desc: "Organize seus links importantes" },
  { icon: <Share2 size={36} />, title: "Compartilhe", desc: "Coloque na bio e comece a rastrear" },
  { icon: <Rocket size={36} />, title: "Lucre mais", desc: "Veja seus resultados explodirem" },
];

const differentials = [
  { icon: <Gift size={28} />, title: "Grátis de verdade", desc: "Página, encurtador e analytics básico. Sem pegadinhas." },
  { icon: <Palette size={28} />, title: "100% customizável", desc: "Você escolhe cada cor, fonte e layout." },
  { icon: <Bot size={28} />, title: "IA que trabalha por você", desc: "Brain Roteirista, Chat IA e muito mais." },
  { icon: <BarChart3 size={28} />, title: "Analytics de verdade", desc: "Saiba cidade, dispositivo e horário de cada clique." },
  { icon: <Calculator size={28} />, title: "Gestão Financeira", desc: "Nenhum concorrente tem. Veja seu lucro real." },
  { icon: <Shield size={28} />, title: "Seguro e rápido", desc: "Criptografia, CDN global e 99.99% de uptime." },
];

const pillars = [
  { icon: <Link2 size={32} />, title: "Página de Links Profissional", desc: "Centralize todos os seus links em uma página linda, rápida e 100% personalizável. Cores, fontes, layout — tudo do seu jeito.", color: "from-indigo-500 to-blue-500", badge: "Core" },
  { icon: <BarChart3 size={32} />, title: "Encurtador com Analytics", desc: "Encurte seus links e saiba exatamente quem clicou, de onde, qual dispositivo e em que horário. Dados reais para decisões reais.", color: "from-purple-500 to-pink-500", badge: "Analytics" },
  { icon: <Bot size={32} />, title: "Ferramentas de IA Exclusivas", desc: "Chat com IA, roteirista inteligente, gestão financeira automatizada e sorteios integrados. Tudo que seu negócio precisa em um só lugar.", color: "from-amber-500 to-orange-500", badge: "IA" },
];

const painPoints = [
  { problem: "Usa Linktree genérico que não combina com sua marca", solution: "Página 100% personalizada com sua identidade visual" },
  { problem: "Não sabe quais links geram vendas de verdade", solution: "Analytics detalhado com cidade, dispositivo e horário de cada clique" },
  { problem: "Gasta horas criando conteúdo sem ideias", solution: "IA Roteirista gera roteiros, legendas e ideias em segundos" },
  { problem: "Não controla quanto entra e quanto sai do negócio", solution: "Gestão financeira integrada para ver seu lucro real de verdade" },
];

const comparisonData = [
  { name: "Página de Links", freelinnk: true as const, linktree: true as const, beacons: true as const },
  { name: "Encurtador de Links", freelinnk: true as const, linktree: false as const, beacons: false as const },
  { name: "Analytics Avançado", freelinnk: true as const, linktree: "paid" as const, beacons: "paid" as const },
  { name: "Chat com IA", freelinnk: true as const, linktree: false as const, beacons: false as const },
  { name: "IA Roteirista", freelinnk: true as const, linktree: false as const, beacons: false as const },
  { name: "Gestão Financeira", freelinnk: true as const, linktree: false as const, beacons: false as const },
  { name: "Sorteios Integrados", freelinnk: true as const, linktree: false as const, beacons: false as const },
  { name: "100% Customizável", freelinnk: true as const, linktree: "partial" as const, beacons: "partial" as const },
  { name: "Suporte em Português", freelinnk: true as const, linktree: false as const, beacons: false as const },
  { name: "Plano Grátis Completo", freelinnk: true as const, linktree: "partial" as const, beacons: "partial" as const },
];

const faqs = [
  { q: "O Freelinnk é realmente grátis?", a: "Sim! Página de links, encurtador e analytics básico são 100% grátis para sempre. As ferramentas de IA avançadas, gestão financeira e sorteios são para assinantes Pro ou Ultra." },
  { q: "Como funciona o teste grátis de 7 dias?", a: "Você tem acesso completo a todas as funcionalidades do plano escolhido por 7 dias. Se não gostar, cancele antes do período acabar e não será cobrado nenhum centavo." },
  { q: "Posso usar meu domínio personalizado?", a: "Sim! No plano Pro e Ultra você pode conectar seu próprio domínio para ter uma URL totalmente profissional e alinhada com sua marca." },
  { q: "O Freelinnk funciona para qual tipo de negócio?", a: "Para qualquer criador de conteúdo, empreendedor, freelancer, coach, loja virtual, restaurante, salão de beleza — qualquer pessoa que queira transformar seu perfil em uma máquina de vendas." },
  { q: "Qual a diferença entre o Freelinnk e o Linktree?", a: "O Freelinnk vai muito além de links na bio. Oferecemos encurtador com analytics, IA roteirista, chat com IA, gestão financeira, sorteios e personalização total — funcionalidades que nenhum concorrente oferece juntas." },
  { q: "Meus dados estão seguros?", a: "Absolutamente. Usamos criptografia de ponta a ponta, CDN global para velocidade máxima e seguimos todas as normas da LGPD. Seus dados são seus e de mais ninguém." },
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
      {/* Barra de progresso de scroll */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 z-[100] origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      <WhatsAppFloatingButton />
      <SocialProofToast />

      {/* Footer Mobile Fixo */}
      <AnimatePresence>
        {showStickyFooter && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-[90] p-3 bg-white/95 backdrop-blur-md border-t border-gray-200 md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
          >
            <SignInButton mode="modal" forceRedirectUrl="/onboarding">
              <Button className="w-full relative z-50 pointer-events-auto shadow-lg" size="lg">
                Começar Grátis <ArrowRight size={18} />
              </Button>
            </SignInButton>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NAVBAR */}
      <nav className={`fixed top-0 w-full z-[80] transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-sm shadow-sm" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer relative z-50" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xl ${BRAND.gradient} shadow-md`}>F</div>
            <span className="text-xl font-bold tracking-tight">Freelinnk</span>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            {[
              { label: "Funcionalidades", href: "#funcionalidades" },
              { label: "Como Funciona", href: "#como-funciona" },
              { label: "Preços", href: "#precos" },
              { label: "Comparativo", href: "#comparativo" },
              { label: "Depoimentos", href: "#depoimentos" },
            ].map((item) => (
              <a key={item.label} href={item.href} className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3 relative z-50">
            <div className="hidden lg:block">
              <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                <button className="text-sm font-bold text-gray-600 hover:text-indigo-600 transition-colors px-4 py-2 cursor-pointer">
                  Entrar
                </button>
              </SignInButton>
            </div>
            <div className="hidden md:block">
              <SignInButton mode="modal" forceRedirectUrl="/onboarding">
                <Button size="sm" className="cursor-pointer relative z-50">Começar Grátis</Button>
              </SignInButton>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-gray-600 relative z-50">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="lg:hidden bg-white border-b border-gray-100 overflow-hidden">
              <div className="px-4 py-4 space-y-1">
                {[
                  { label: "Funcionalidades", href: "#funcionalidades" },
                  { label: "Como Funciona", href: "#como-funciona" },
                  { label: "Preços", href: "#precos" },
                  { label: "Comparativo", href: "#comparativo" },
                  { label: "Depoimentos", href: "#depoimentos" },
                ].map((item) => (
                  <a key={item.label} href={item.href} onClick={() => setMobileMenuOpen(false)} className="block py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-xl font-medium">
                    {item.label}
                  </a>
                ))}
                <div className="pt-2">
                  <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                    <button className="block w-full py-3 px-4 text-center bg-gray-50 text-indigo-600 font-bold rounded-xl cursor-pointer">
                      Entrar na Plataforma
                    </button>
                  </SignInButton>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-24 pb-12 md:pt-32 lg:pt-40 lg:pb-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-100 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 opacity-50" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-100 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3 opacity-50" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(circle, #6366f1 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <div className="text-center lg:text-left">
              <ScrollReveal>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full text-sm font-bold text-green-700 mb-6">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                  </span>
                  +2.000 criadores já usam — Teste 7 dias grátis
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-[1.1] mb-6">
                  Seu Link na Bio gerando mais <RotatingText />
                </h1>

                <p className="text-lg sm:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0 mb-4 leading-relaxed">
                  <strong className="text-gray-900">Freelinnk é a plataforma all-in-one</strong> para criadores e empreendedores: página de links personalizável, encurtador com analytics, ferramentas de <strong className="text-indigo-600">IA</strong> e gestão financeira.
                </p>

                <div className="flex items-center justify-center lg:justify-start gap-3 mb-8">
                  <span className="text-xs text-gray-400 font-medium">Funciona com:</span>
                  <div className="flex items-center gap-2">
                    {[
                      { icon: <Instagram size={18} />, label: "Instagram", color: "text-pink-500" },
                      { icon: <FaTiktok size={16} />, label: "TikTok", color: "text-gray-900" },
                      { icon: <FaYoutube size={18} />, label: "YouTube", color: "text-red-500" },
                      { icon: <Globe size={18} />, label: "Qualquer bio", color: "text-blue-500" },
                    ].map((platform, i) => (
                      <div key={i} className={`w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center ${platform.color} hover:scale-110 transition-transform cursor-default`} title={platform.label}>
                        {platform.icon}
                      </div>
                    ))}
                  </div>
                </div>


                <div className="hidden sm:flex max-w-md mx-auto lg:mx-0 bg-white p-2 rounded-2xl shadow-sm border border-gray-200 flex-col sm:flex-row gap-2 mb-6 relative z-30">
                  <div className="flex-1 bg-gray-50 rounded-xl px-4 flex items-center h-12 sm:h-auto border border-transparent focus-within:border-indigo-500 focus-within:bg-white transition-all">
                    <span className="text-gray-400 font-bold text-sm mr-1">freelinnk.com/</span>
                    <input
                      type="text"
                      placeholder="seunome"
                      value={heroUsername}
                      onChange={(e) => setHeroUsername(e.target.value)}
                      className="bg-transparent border-none outline-none font-bold text-gray-900 w-full placeholder:text-gray-300"
                    />
                  </div>
                  <SignInButton mode="modal" forceRedirectUrl={heroUsername ? `/onboarding?username=${heroUsername}` : "/onboarding"}>
                    <Button className="w-full sm:w-auto whitespace-nowrap shadow-md cursor-pointer pointer-events-auto">
                      Criar Grátis
                    </Button>
                  </SignInButton>
                </div>

                <div className="flex sm:hidden flex-col gap-4 justify-center mb-8 relative z-30">
                  <SignInButton mode="modal" forceRedirectUrl="/onboarding">
                    <Button size="xl" className="w-full group cursor-pointer pointer-events-auto shadow-xl">
                      Criar Minha Página Grátis <ArrowRight size={20} className="ml-1" />
                    </Button>
                  </SignInButton>
                  <p className="text-xs text-gray-500 font-medium">7 dias grátis • Sem cartão de crédito</p>
                </div>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-[10px] sm:text-xs text-gray-500 font-medium mb-8 relative z-20">
                  <span className="flex items-center gap-1"><CheckCircle size={12} className="text-green-500" /> 7 dias grátis</span>
                  <span className="hidden sm:inline">·</span>
                  <span className="flex items-center gap-1"><Lock size={12} className="text-blue-500" /> Sem cartão</span>
                  <span className="hidden sm:inline">·</span>
                  <span className="flex items-center gap-1"><Zap size={12} className="text-purple-500" /> Pronto em 2 min</span>
                  <span className="hidden sm:inline">·</span>
                  <span className="flex items-center gap-1"><Shield size={12} className="text-indigo-500" /> LGPD Compliant</span>
                </div>
              </ScrollReveal>
            </div>

            <div className="flex justify-center lg:justify-end relative z-10">
              <ScrollReveal><HeroPhoneSimulator /></ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* DEMAIS SEÇÕES */}
      <section className="py-10 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`, backgroundSize: "30px 30px" }} />
        </div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl md:text-5xl font-black mb-1"><AnimatedCounter {...stat} value={Number(stat.value)} /></p>
                <p className="text-sm text-white/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold mb-4">
                <Layers size={16} /> Plataforma All-in-One
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-4">
                Mais que um link na bio. <span className={BRAND.textGradient}>Seu sistema de vendas completo.</span>
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                O Freelinnk reúne tudo que você precisa para profissionalizar sua presença online e transformar seguidores em clientes.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {pillars.map((pillar, i) => (
              <ScrollReveal key={i} className="h-full">
                <motion.div whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 300 }} className="relative bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300 h-full overflow-hidden group">
                  <div className={`absolute inset-0 bg-gradient-to-br ${pillar.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className={`w-16 h-16 bg-gradient-to-br ${pillar.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>{pillar.icon}</div>
                      <span className="text-xs font-bold px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full">{pillar.badge}</span>
                    </div>
                    <h3 className="font-black text-xl text-gray-900 mb-3">{pillar.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{pillar.desc}</p>
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <VideoDemoSection />

      <section className="py-20 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold mb-4">
                <Crown size={16} /> Páginas Reais
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-4">
                Veja o que nossos usuários <span className={BRAND.textGradient}>criaram</span>
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                100% customizável. Você escolhe cores, fontes, layout e muito mais.
              </p>
            </div>
          </ScrollReveal>
          <RealPagesShowcase />
          <div className="text-center mt-12 relative z-30">
            <SignInButton mode="modal" forceRedirectUrl="/onboarding">
              <Button size="lg" className="group cursor-pointer pointer-events-auto">
                Criar Minha Página <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </SignInButton>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-full text-sm font-bold mb-4">
                <TrendingUp size={16} /> Pare de Perder Vendas
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-4">
                Seus seguidores querem comprar. <span className="text-red-500">Você está facilitando ou dificultando?</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="space-y-4">
            {painPoints.map((point, i) => (
              <ScrollReveal key={i}>
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="grid md:grid-cols-2">
                    <div className="p-6 flex items-start gap-4 bg-red-50/50 border-b md:border-b-0 md:border-r border-red-100/50">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"><X size={16} className="text-red-500" /></div>
                      <div>
                        <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Sem Freelinnk</p>
                        <p className="text-gray-700 font-medium text-sm">{point.problem}</p>
                      </div>
                    </div>
                    <div className="p-6 flex items-start gap-4 bg-green-50/50">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"><Check size={16} className="text-green-600" /></div>
                      <div>
                        <p className="text-xs font-bold text-green-500 uppercase tracking-wider mb-1">Com Freelinnk</p>
                        <p className="text-gray-700 font-medium text-sm">{point.solution}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <div className="text-center mt-12 relative z-30">
            <SignInButton mode="modal" forceRedirectUrl="/onboarding">
              <Button size="lg" className="group cursor-pointer pointer-events-auto shadow-lg">
                Resolver Isso Agora <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </SignInButton>
          </div>
        </div>
      </section>

      <section id="funcionalidades" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-bold mb-4">
                <Cpu size={16} /> Funcionalidades
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-4">
                Tudo que você precisa para <span className={BRAND.textGradient}>vender mais</span>
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Página de links, encurtador, IA, analytics, gestão financeira e sorteios — tudo em uma plataforma.
              </p>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature, i) => (
              <FeatureCard key={i} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      <SorteiosHighlightSection />

      <section id="como-funciona" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-bold mb-4">
                <Play size={16} /> Como Funciona
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-4">
                Pronto em menos de <span className={BRAND.textGradient}>2 minutos</span>
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Sem complicação. Configure, personalize e comece a converter.
              </p>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            {howItWorks.map((step, i) => (
              <HowItWorksStep key={i} step={step} index={i} total={howItWorks.length} />
            ))}
          </div>
        </div>
      </section>

      <PricingSection />

      <section id="comparativo" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold mb-4">
                <Sparkles size={16} /> Comparativo
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-4">
                Freelinnk vs <span className="text-gray-400 line-through decoration-red-400">concorrentes</span>
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Veja por que o Freelinnk é a escolha mais inteligente para quem leva o digital a sério.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="grid grid-cols-4 gap-0 border-b border-gray-100">
                <div className="p-4 md:p-6"><p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recurso</p></div>
                <div className="p-4 md:p-6 text-center bg-indigo-50/50 border-x border-indigo-100">
                  <div className="flex items-center justify-center gap-1.5">
                    <div className={`w-6 h-6 rounded-md ${BRAND.gradient} flex items-center justify-center text-white text-xs font-black`}>F</div>
                    <span className="font-black text-sm text-indigo-700">Freelinnk</span>
                  </div>
                </div>
                <div className="p-4 md:p-6 text-center"><span className="font-bold text-sm text-gray-500">Linktree</span></div>
                <div className="p-4 md:p-6 text-center"><span className="font-bold text-sm text-gray-500">Beacons</span></div>
              </div>

              {comparisonData.map((row, i) => (
                <div key={i} className={`grid grid-cols-4 gap-0 ${i < comparisonData.length - 1 ? "border-b border-gray-50" : ""} hover:bg-gray-50/50 transition-colors`}>
                  <div className="p-4 md:p-5 flex items-center"><span className="text-sm font-medium text-gray-700">{row.name}</span></div>
                  <div className="p-4 md:p-5 flex items-center justify-center bg-indigo-50/30 border-x border-indigo-50"><ComparisonCell value={row.freelinnk} /></div>
                  <div className="p-4 md:p-5 flex items-center justify-center"><ComparisonCell value={row.linktree} /></div>
                  <div className="p-4 md:p-5 flex items-center justify-center"><ComparisonCell value={row.beacons} /></div>
                </div>
              ))}

              <div className="grid grid-cols-4 gap-0 bg-gray-50 border-t border-gray-100">
                <div className="p-4 md:p-5 flex items-center"><span className="text-sm font-black text-gray-900">Preço Pro</span></div>
                <div className="p-4 md:p-5 text-center bg-indigo-50/50 border-x border-indigo-100"><p className="text-lg font-black text-indigo-600">34,90 <span className="text-xs font-medium text-gray-500">/mês</span></p></div>
                <div className="p-4 md:p-5 text-center"><p className="text-lg font-black text-gray-400">~R$50 <span className="text-xs font-medium text-gray-400">/mês</span></p></div>
                <div className="p-4 md:p-5 text-center"><p className="text-lg font-black text-gray-400">~R$55 <span className="text-xs font-medium text-gray-400">/mês</span></p></div>
              </div>
            </div>
          </ScrollReveal>

          <div className="text-center mt-10 relative z-30">
            <SignInButton mode="modal" forceRedirectUrl="/onboarding">
              <Button size="lg" className="group cursor-pointer pointer-events-auto shadow-lg">
                Escolher o Freelinnk <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </SignInButton>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-bold mb-4">
                <Users size={16} /> Para Todos
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-4">
                Serve pra você? <span className={BRAND.textGradient}>Com certeza.</span>
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Criadores, empreendedores, freelancers, marcas — qualquer pessoa que tenha um perfil e queira vender mais.
              </p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {nichos.map((nicho, i) => (
              <NichoCard key={i} nicho={nicho} />
            ))}
          </div>
        </div>
      </section>

      <section id="depoimentos" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-bold mb-4">
                <Star size={16} /> Depoimentos
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-4">
                Quem usa, recomenda
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Veja os resultados reais de quem já transformou seu perfil com o Freelinnk.
              </p>
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <TestimonialCard key={i} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </section>

      <section id="diferenciais" className="py-24 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20 bg-gradient-to-br from-indigo-900 to-gray-900" />
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`, backgroundSize: "30px 30px" }} />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4">
                Por que <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Freelinnk</span>?
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                6 motivos para você fazer a escolha certa hoje.
              </p>
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {differentials.map((item, i) => (
              <DifferentialCard key={i} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <ScrollReveal>
            <motion.div whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }} className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg border-4 border-white relative">
              <Shield className="w-12 h-12 text-green-600" />
              <motion.div className="absolute -top-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center" animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                <Check className="w-5 h-5 text-white" />
              </motion.div>
            </motion.div>
            <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Garantia Blindada de 7 Dias</h3>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              Use tudo. Teste todas as funcionalidades. Se em 7 dias você não sentir que o valor entregue é <strong className="text-indigo-600">10x maior</strong> que o preço, devolvemos 100% do seu dinheiro. <strong>Sem perguntas, sem burocracia.</strong>
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500 mt-6">
              <span className="flex items-center gap-2"><Lock size={14} className="text-green-500" /> Pagamento seguro</span>
              <span className="flex items-center gap-2"><Shield size={14} className="text-green-500" /> Cancele a qualquer momento</span>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-bold mb-4">
                <MessageCircleCode size={16} /> FAQ
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Perguntas Frequentes</h2>
              <p className="text-gray-600 max-w-xl mx-auto">Tem alguma dúvida? Provavelmente a resposta está aqui.</p>
            </div>
          </ScrollReveal>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              Ainda tem dúvidas?{" "}
              <a href="https://wa.me/5579999383543" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold hover:underline">
                Fale conosco no WhatsApp →
              </a>
            </p>
          </div>
        </div>
      </section>

      <section className="py-28 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div className="absolute -top-20 -right-20 w-72 h-72 bg-white/5 rounded-full blur-xl" animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }} transition={{ repeat: Infinity, duration: 20 }} />
          <motion.div className="absolute -bottom-20 -left-20 w-96 h-96 bg-white/5 rounded-full blur-xl" animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }} transition={{ repeat: Infinity, duration: 25 }} />
        </div>

        <div className="max-w-4xl mx-auto px-4 text-center relative z-20">
          <ScrollReveal>
            <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 200 }} className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-8 border border-white/20">
              <Rocket size={36} className="text-yellow-300" />
            </motion.div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 leading-tight">
              Pronto para transformar seu perfil em um <span className="text-yellow-300">negócio de verdade?</span>
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto mb-10">
              Junte-se a milhares de criadores que já estão lucrando mais com o Freelinnk. Comece grátis, sem cartão de crédito.
            </p>
            <SignInButton mode="modal" forceRedirectUrl="/onboarding">
              <Button size="xl" variant="white" className="shadow-2xl text-lg px-14 py-6 group cursor-pointer pointer-events-auto">
                Começar Meu Teste Grátis <ArrowRight size={24} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </SignInButton>
            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-white/50">
              <span className="flex items-center gap-1.5"><CheckCircle size={14} /> 7 dias grátis</span>
              <span className="flex items-center gap-1.5"><CheckCircle size={14} /> Sem cartão</span>
              <span className="flex items-center gap-1.5"><CheckCircle size={14} /> Cancele quando quiser</span>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <footer className="bg-gray-900 text-white pt-20 pb-28 md:pb-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-2xl ${BRAND.gradient} shadow-lg`}>F</div>
                <span className="text-2xl font-bold">Freelinnk</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
                A plataforma all-in-one para transformar seu Link na Bio em uma Máquina de Vendas. Página de links, encurtador, IA e gestão financeira. Feito com 💜 no Brasil.
              </p>
              <div className="flex gap-4">
                {[
                  { url: "https://www.instagram.com/freelinnk_oficial", icon: <Instagram size={20} />, color: "hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500" },
                  { url: "https://linkedin.com/in/lucasaragao-dev", icon: <FaLinkedinIn size={20} />, color: "hover:bg-blue-600" },
                  { url: "https://wa.me/5579999383543", icon: <MessageCircleCode size={20} />, color: "hover:bg-green-500" },
                ].map((social, i) => (
                  <a key={i} href={social.url} target="_blank" rel="noopener noreferrer" className={`w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-gray-400 hover:text-white ${social.color} transition-all duration-300 hover:-translate-y-1`}>
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6">Produto</h4>
              <ul className="space-y-4 text-gray-400">
                {[
                  { href: "#funcionalidades", text: "Funcionalidades" },
                  { href: "#como-funciona", text: "Como Funciona" },
                  { href: "#precos", text: "Preços" },
                  { href: "#comparativo", text: "Comparativo" },
                  { href: "#depoimentos", text: "Depoimentos" },
                ].map((link, i) => (
                  <li key={i}>
                    <a href={link.href} className="hover:text-white transition-colors inline-flex items-center gap-2 group">
                      <span className="h-0.5 bg-indigo-500 w-0 group-hover:w-2 transition-all" /> {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6">Legal</h4>
              <ul className="space-y-4 text-gray-400">
                {[
                  { href: "/terms-of-service", text: "Termos de Uso" },
                  { href: "/privacy-policy", text: "Privacidade" },
                  { href: "/privacy-policy", text: "LGPD" },
                ].map((link, i) => (
                  <li key={i}>
                    <a href={link.href} className="hover:text-white transition-colors inline-flex items-center gap-2 group">
                      <span className="h-0.5 bg-indigo-500 w-0 group-hover:w-2 transition-all" /> {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">© 2026 Freelinnk. Todos os direitos reservados.</p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-gray-500 text-sm"><Lock size={16} className="text-green-500" /> Conexão Segura</div>
              <div className="flex items-center gap-2 text-gray-500 text-sm"><Shield size={16} className="text-green-500" /> LGPD</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}