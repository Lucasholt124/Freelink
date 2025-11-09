 "use client";

import React, { ReactNode, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SignInButton, useAuth } from "@clerk/nextjs";
import {
ArrowRight,
CheckCircle,
Star,

CreditCard,
Target,

BrainCircuit,
Wand2,
Users,
Sparkles,
TrendingUp,
Play,
ChevronRight,
Clock,
Shield,

Smartphone,
MousePointer,

Gift,
Video,
Eye,
MapPin,
Share2,
Instagram,

Crown,
} from "lucide-react";

import WhatsappFloatingButton from "@/components/WhatsappFloatingButton";
import clsx from "clsx";
import { LandingHeader } from "@/components/LandingHeader";
import { Footer } from "@/components/Footer";

// Componente para contador animado
function AnimatedCounter({ value }: { value: number }) {
const [count, setCount] = useState(0);
const [ref, inView] = useInView({ triggerOnce: true });

useEffect(() => {
if (!inView) return;
const duration = 1500;
const steps = 40;
const increment = value / steps;
let current = 0;



const timer = setInterval(() => {
  current += increment;
  if (current >= value) {
    setCount(value);
    clearInterval(timer);
  } else {
    setCount(Math.floor(current));
  }
}, duration / steps);

return () => clearInterval(timer);

}, [value, inView]);

return <span ref={ref}>{count.toLocaleString('pt-BR')}</span>;
}

// Como funciona
const howItWorks = [
{
step: "01",
title: "Crie sua conta",
description: "30 segundos para começar",
icon: <MousePointer className="w-6 h-6" />,
},
{
step: "02",
title: "Configure tudo",
description: "Links, pixels e sorteios",
icon: <Smartphone className="w-6 h-6" />,
},
{
step: "03",
title: "IA trabalha por você",
description: "Crie conteúdo viral em segundos",
icon: <Sparkles className="w-6 h-6" />,
},
{
step: "04",
title: "Analise e venda",
description: "Veja de onde vem cada venda",
icon: <TrendingUp className="w-6 h-6" />,
},
];

// Features principais
const mainFeatures = [
{
icon: <Eye className="w-8 h-8" />,
title: "Analytics Completo",
description: "Veja quem clicou, de onde veio, qual dispositivo, cidade e muito mais",
highlight: "NOVO",
},
{
icon: <Gift className="w-8 h-8" />,
title: "Sorteios Virais",
description: "Crie sorteios para Instagram e TikTok que explodem seu engajamento",
highlight: "HOT",
},
{
icon: <Target className="w-8 h-8" />,
title: "Pixels & Analytics",
description: "Meta Pixel, TikTok, Google Analytics integrados e rastreando tudo",
highlight: null,
},
{
icon: <Video className="w-8 h-8" />,
title: "Roteiros Virais IA",
description: "Gere roteiros completos para Reels, Shorts e TikToks que viralizam",
highlight: "IA",
},
{
icon: <Wand2 className="w-8 h-8" />,
title: "Imagens com IA",
description: "Crie artes profissionais para posts em segundos, sem designer",
highlight: null,
},
{
icon: <BrainCircuit className="w-8 h-8" />,
title: "Ideias Infinitas",
description: "Nunca mais fique sem conteúdo. IA gera títulos e legendas virais",
highlight: null,
},
];

// Analytics features detalhadas
const analyticsFeatures = [
{ icon: <MousePointer />, label: "Cliques em tempo real" },
{ icon: <MapPin />, label: "Localização dos cliques" },
{ icon: <Smartphone />, label: "Dispositivo usado" },
{ icon: <Share2 />, label: "Origem do tráfego" },
{ icon: <Clock />, label: "Horário de pico" },
{ icon: <TrendingUp />, label: "Taxa de conversão" },
];

// Pricing cards atualizados
const pricingPlans = [
{
name: "Pro",
price: "34.90",
cents: "00",
period: "/mês",
description: "Perfeito para começar",
features: [
"1 página Freelinnk",
"Links ilimitados",
"Analytics avançados (dispositivos, localizações)",
"10 roteiros virais/mês",
"Sorteios básicos",
"Tudo do plano Free",
"Suporte por email",
"🚫 Sem marca d'água Freelinnk",
],
cta: "Começar agora",
popular: false,
},
{
name: "Ultra",
price: "77",
cents: "90",
period: "/mês",
description: "Para criadores sérios",
features: [
"páginas Freelinnk",
"Tudo do Pro +",
"250 imagens IA/mês",
"Roteiros virais ilimitados",
"Sorteios avançados",
"Todos os pixels de rastreamento",
"Analytics avançado com IA",
"Remover marca d'água",
"Domínio personalizado",
"Suporte prioritário WhatsApp",

],
cta: "Teste 7 dias grátis",
popular: true,
savings: "Economize R$240/ano",
},
];

// Comparação com concorrentes
const competitors = [
{
feature: "Preço mensal",
freelinnk: "R34,90",linktree:"US14,90", linktreee:"US 5 + IOF",
beacons: "US$ 10 + IOF",
},
{
feature: "Analytics de cliques detalhado",
freelinnk: "✅ Completo",
linktree: "⚠️ Básico",
beacons: "⚠️ Básico",
},
{
feature: "Gerador de imagens IA",
freelinnk: "✅ Incluído",
linktree: "❌ Não tem",
beacons: "❌ Não tem",
},
{
feature: "Roteiros para vídeos virais",
freelinnk: "✅ Com IA",
linktree: "❌ Não tem",
beacons: "❌ Não tem",
},
{
feature: "Sorteios para redes sociais",
freelinnk: "✅ Nativo",
linktree: "❌ Não tem",
beacons: "⚠️ Limitado",
},
{
feature: "Pixels de rastreamento",
freelinnk: "✅ Meta, Google, TikTok",
linktree: "⚠️ Só Meta",
beacons: "⚠️ Básico",
},
{
feature: "Suporte em português",
freelinnk: "✅ WhatsApp",
linktree: "❌ Inglês",
beacons: "❌ Inglês",
},
];

const FadeInSection = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
return (
<motion.div
ref={ref}
initial={{ opacity: 0, y: 20 }}
animate={inView ? { opacity: 1, y: 0 } : {}}
transition={{ duration: 0.5, ease: "easeOut" }}
className={className}
>
{children}
</motion.div>
);
};

function AuthRedirector() {
const { isSignedIn, isLoaded } = useAuth();
const router = useRouter();
useEffect(() => {
if (isLoaded && isSignedIn) {
router.push("/dashboard");
}
}, [isLoaded, isSignedIn, router]);
return null;
}

export default function LandingPage() {
const [activeUsers] = useState(2847);
const [totalClicks] = useState(892341);
const [showVideo, setShowVideo] = useState(false);

return (
<div className="bg-white text-gray-900 selection:bg-purple-500 selection:text-white">
<AuthRedirector />
<LandingHeader />



  <main className="relative overflow-x-hidden">
    {/* Hero Section */}
    <section className="relative px-4 sm:px-6 lg:px-8 pt-24 pb-16 sm:pt-32 sm:pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 -z-10" />

      {/* Elementos decorativos */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl -z-10" />

      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-6">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-full text-sm font-medium"
          >
            <Sparkles className="w-4 h-4" />
            IA + Analytics + Sorteios + Pixels = Vendas
            <ChevronRight className="w-4 h-4" />
          </motion.div>

          {/* Título principal */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight"
          >
            Link na bio que
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
              vende sozinho
            </span>
          </motion.h1>

          {/* Subtítulo */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Crie conteúdo com IA, faça sorteios virais, rastreie tudo com pixels e veja exatamente de onde vem cada venda.
          </motion.p>

          {/* Prova social */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-4"
          >
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              <span className="text-sm sm:text-base font-semibold">
                <AnimatedCounter value={activeUsers} />+ criadores
              </span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-gray-300" />
            <div className="flex items-center gap-2">
              <MousePointer className="w-5 h-5 text-purple-600" />
              <span className="text-sm sm:text-base font-semibold">
                <AnimatedCounter value={totalClicks} />+ cliques rastreados
              </span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-gray-300" />
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-sm font-semibold ml-1">4.9</span>
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6"
          >
            <SignInButton mode="modal">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-6 text-lg font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
              >
                Criar minha página grátis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </SignInButton>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setShowVideo(true)}
              className="w-full sm:w-auto px-8 py-6 text-lg font-semibold rounded-2xl border-2"
            >
              <Play className="mr-2 w-5 h-5" />
              Ver tudo funcionando (2 min)
            </Button>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-gray-500 pt-4"
          >
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Sem cartão
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-green-500" />
              Setup em 30s
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-4 h-4 text-green-500" />
              100% seguro
            </span>
          </motion.div>
        </div>
      </div>
    </section>

    {/* Como Funciona */}
    <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 bg-gradient-to-b from-gray-50 to-white">
      <FadeInSection>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Como multiplicar suas vendas
            </h2>
            <p className="text-gray-600 text-lg">
              4 passos simples, resultados extraordinários
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {howItWorks.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl font-black text-gray-200">
                      {step.step}
                    </span>
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                      {step.icon}
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </div>
                {i < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ChevronRight className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </FadeInSection>
    </section>

    {/* Features Principais */}
    <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <FadeInSection>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Tudo que você precisa para vender
            </h2>
            <p className="text-gray-600 text-lg">
              Ferramentas profissionais que ninguém mais tem
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mainFeatures.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="group bg-white rounded-2xl p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 relative"
              >
                {feature.highlight && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs px-3 py-1 rounded-full font-bold">
                    {feature.highlight}
                  </span>
                )}
                <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </FadeInSection>
    </section>

    {/* Analytics Spotlight */}
    <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 bg-gradient-to-b from-purple-50 to-white">
      <FadeInSection>
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Saiba <span className="text-purple-600">exatamente</span> de onde vem cada venda
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Analytics profissional que mostra tudo sobre seus visitantes. Descubra o que funciona e multiplique seus resultados.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {analyticsFeatures.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                      {item.icon}
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                ))}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-sm">
                  <strong>💡 Dica:</strong> Com nosso analytics, você descobre qual horário seus seguidores mais clicam e pode postar no momento perfeito!
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Dashboard em tempo real</h3>
                <div className="space-y-4">
                  <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Visitantes agora</span>
                      <span className="text-2xl font-bold">47</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div className="bg-white rounded-full h-2 w-3/4"></div>
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Taxa de cliques hoje</span>
                      <span className="text-2xl font-bold">12.4%</span>
                    </div>
                    <span className="text-xs text-green-300">↑ 3.2% vs ontem</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                    <span className="text-sm">Top origem de tráfego</span>
                    <div className="flex items-center gap-2 mt-2">
                      <Instagram className="w-5 h-5" />
                      <span className="font-bold">Instagram Stories (68%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeInSection>
    </section>

    {/* Sorteios Feature */}
    <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <FadeInSection>
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 rounded-full text-sm font-medium mb-6">
            <Gift className="w-4 h-4" />
            Funcionalidade exclusiva
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Crie sorteios que <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">viralizam</span>
          </h2>

          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            Sistema completo de sorteios para Instagram e TikTok. Aumente seu engajamento e ganhe milhares de seguidores no automático.
          </p>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: <Users />, title: "Validação automática", desc: "Verifica menções e seguidores" },
              { icon: <Share2 />, title: "Compartilhamento viral", desc: "Participantes divulgam sozinhos" },
              { icon: <Crown />, title: "Escolha do vencedor", desc: "Transparente e auditável" },
            ].map((item, i) => (
              <div key={i} className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 border border-purple-200">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-purple-600 mx-auto mb-4">
                  {item.icon}
                </div>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </FadeInSection>
    </section>

    {/* Comparação */}
    <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 bg-gray-50">
      <FadeInSection>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Por que somos melhores (e mais baratos)
            </h2>
            <p className="text-gray-600 text-lg">
              Compare e entenda a diferença
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                    <th className="px-6 py-4 text-left">Recurso</th>
                    <th className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span>Freelinnk</span>
                        <span className="text-xs opacity-80">Você está aqui</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center">Linktree</th>
                    <th className="px-6 py-4 text-center">Beacons</th>
                  </tr>
                </thead>
                <tbody>
                  {competitors.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                      <td className="px-6 py-4 font-medium">{row.feature}</td>
                      <td className="px-6 py-4 text-center font-semibold text-green-600">{row.freelinnk}</td>
                      <td className="px-6 py-4 text-center text-gray-600">{row.linktree}</td>
                      <td className="px-6 py-4 text-center text-gray-600">{row.beacons}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </FadeInSection>
    </section>

    {/* Video Modal */}
    <AnimatePresence>
      {showVideo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowVideo(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="relative w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowVideo(false)}
              className="absolute -top-12 right-0 text-white text-lg font-semibold hover:text-gray-300"
            >
              Fechar ✕
            </button>
            <video
              src="/GravaçãodeTela.mp4"
              autoPlay
              controls
              className="w-full rounded-2xl shadow-2xl"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Pricing Section */}
    <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 bg-gradient-to-b from-white to-purple-50">
      <FadeInSection>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Investimento que se paga no primeiro mês
            </h2>
            <p className="text-gray-600 text-lg">
              Escolha o plano ideal para seu momento
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={clsx(
                  "relative bg-white rounded-3xl p-8 transition-all duration-300",
                  plan.popular
                    ? "shadow-2xl scale-105 border-2 border-purple-500"
                    : "shadow-lg border border-gray-200 hover:shadow-xl"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Mais escolhido
                    </span>
                  </div>
                )}

                {plan.savings && (
                  <div className="absolute -top-4 right-4">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {plan.savings}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-black">R${plan.price}</span>
                    <span className="text-xl">,{plan.cents}</span>
                    <span className="text-gray-600 ml-2">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <SignInButton mode="modal">
                  <Button
                    className={clsx(
                      "w-full py-3 rounded-xl font-bold transition-all",
                      plan.popular
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg transform hover:scale-105"
                        : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                    )}
                  >
                    {plan.cta}
                  </Button>
                </SignInButton>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600">
              🔒 Pagamento seguro via Stripe • 💳 Parcelamos em até 12x • ❌ Cancele quando quiser
            </p>
          </div>
        </div>
      </FadeInSection>
    </section>

    {/* Testimonials */}
    <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 bg-gray-50">
      <FadeInSection>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Criadores que já faturam com Freelinnk
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Júlia Mendes",
                role: "Fashion Influencer",
                content: "O analytics me mostrou que 70% dos cliques vinham do Stories. Mudei minha estratégia e tripliquei as vendas!",
                metric: "+R$ 12.000/mês",
                avatar: "https://i.pravatar.cc/150?img=1"
              },
              {
                name: "Carlos Eduardo",
                role: "Personal Trainer",
                content: "Os sorteios virais me fizeram ganhar 10K seguidores em 1 semana. Nunca vi nada igual!",
                metric: "+15K seguidores",
                avatar: "https://i.pravatar.cc/150?img=3"
              },
              {
                name: "Amanda Silva",
                role: "Criadora de Conteúdo",
                content: "Gero 5 roteiros virais por dia com a IA. Meu engajamento nunca foi tão alto. É surreal!",
                metric: "+300% engajamento",
                avatar: "https://i.pravatar.cc/150?img=5"
              }
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">{testimonial.content}</p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-bold text-green-600">{testimonial.metric}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </FadeInSection>
    </section>

    {/* CTA Final */}
    <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
      <FadeInSection>
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-blue-700 rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden">
            {/* Elementos decorativos */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur text-white rounded-full text-sm font-medium mb-6">
                <Clock className="w-4 h-4" />
                Oferta por tempo limitado
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-6">
                Comece hoje e ganhe 30% OFF no primeiro mês
              </h2>

              <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Entre agora para o grupo de criadores que estão transformando seguidores em clientes todos os dias
              </p>

              <SignInButton mode="modal">
                <Button
                  size="lg"
                  className="bg-white text-purple-700 px-8 sm:px-10 py-6 text-lg font-bold rounded-2xl shadow-2xl hover:scale-105 transition-all duration-200"
                >
                  Quero meu desconto agora
                  <Sparkles className="ml-2 w-5 h-5" />
                </Button>
              </SignInButton>

              <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-white/80 text-sm">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Teste grátis
                </span>
                <span className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Sem cartão
                </span>
                <span className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  +{activeUsers} criadores ativos
                </span>
              </div>
            </div>
          </div>
        </div>
      </FadeInSection>
    </section>
  </main>

  <Footer />
  <WhatsappFloatingButton />
</div>

);
}