// Em /app/page.tsx
// (Substitua o arquivo inteiro)

"use client";

import React, { ReactNode, useEffect } from "react";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SignInButton, useAuth } from "@clerk/nextjs";
import {
  ArrowRight, CheckCircle, Star, BarChart3, Zap,  CreditCard,  Target, Handshake, BrainCircuit, Wand2
} from "lucide-react";

import WhatsappFloatingButton from "@/components/WhatsappFloatingButton";
import clsx from "clsx";
import { LandingHeader } from "@/components/LandingHeader";
import { Footer } from "@/components/Footer";

// --- CONTEÚDO ATUALIZADO ---

const features = [
  { icon: <Wand2 className="w-8 h-8" />, title: "Mentor IA", description: "Receba uma análise completa do seu perfil e um plano de ação estratégico para crescer no Instagram, tudo com o poder da IA." },
  { icon: <BrainCircuit className="w-8 h-8" />, title: "Freelinnk Brain™", description: "Nunca mais fique sem ideias. Gere títulos virais, roteiros para Reels e conteúdo para carrosséis em segundos." },
  { icon: <BarChart3 className="w-8 h-8" />, title: "Análises Detalhadas", description: "Descubra de onde vêm seus cliques, quais links performam melhor e entenda o que sua audiência realmente quer." },
  { icon: <Zap className="w-8 h-8" />, title: "Performance Imbatível", description: "Sua página carrega em um piscar de olhos. Nunca perca um clique por lentidão. A primeira impressão é a que fica." },
  { icon: <Target className="w-8 h-8" />, title: "Otimizado para Conversão", description: "Integre seus Pixels de rastreamento (Facebook, TikTok) e Google Analytics para transformar cliques em clientes." },
  { icon: <Handshake className="w-8 h-8" />, title: "Suporte em Português", description: "Fale com humanos de verdade via WhatsApp e e-mail. Estamos aqui para te ajudar a decolar no mercado brasileiro." },
];

const faq = [
  { question: "O que torna o Freelinnk diferente?", answer: "Além de ser uma plataforma de link na bio, o Freelinnk é um co-piloto de marketing com IA. Analisamos seu perfil, geramos ideias de conteúdo e te damos as ferramentas para crescer de verdade, tudo focado no mercado brasileiro." },
  { question: "Posso cancelar quando quiser?", answer: "Sim! O cancelamento é fácil, sem burocracia e pode ser feito a qualquer momento no seu painel. Você mantém o acesso premium até o final do período pago." },
  { question: "O pagamento é seguro?", answer: "Totalmente. Usamos a Stripe, uma das maiores e mais seguras plataformas de pagamento do mundo. Seus dados estão protegidos." },
  { question: "Os preços são em Reais (BRL)?", answer: "Sim! Sem surpresas com a variação do dólar ou taxas de IOF. Você paga em Reais e tem suporte em português." },
];

const comparison = [
  { name: "Freelink", ia: "Mentor de Perfil e Gerador de Conteúdo", analytics: "Avançado e Detalhado", suporte: "WhatsApp e E-mail", preço: "A partir de R$19,90/mês", moeda: "Reais (BRL)" },
  { name: "Linktree", ia: "Nenhum", analytics: "Básico no plano similar", suporte: "Apenas E-mail", preço: "A partir de US$5/mês", moeda: "Dólar (USD) + IOF" },
  { name: "Beacons", ia: "Básico (sugestões genéricas)", analytics: "Básico no plano similar", suporte: "Apenas E-mail", preço: "A partir de US$10/mês", moeda: "Dólar (USD) + IOF" },
];

// --- COMPONENTES AUXILIARES ---

const FadeInSection = ({ children }: { children: ReactNode }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, ease: "easeOut" }}>
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
  return null; // Este componente não renderiza nada
}

// --- PÁGINA PRINCIPAL ---

export default function LandingPage() {
  return (
    <div className="bg-white text-gray-800">
      <AuthRedirector />
      <LandingHeader />

      <main>
        {/* Hero Section */}
        <section className="relative px-4 pt-24 pb-20 sm:pt-32 sm:pb-28 text-center overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-purple-50/50 via-white to-white" />
          <div className="max-w-4xl mx-auto space-y-8">
            <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tighter text-gray-900">
              De <span className="text-purple-600">Link na Bio</span> a <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Máquina de Conteúdo</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              O Freelinnk é a primeira plataforma do Brasil que não apenas organiza seus links, mas usa IA para analisar seu perfil, criar conteúdo viral e transformar seus seguidores em clientes.
            </motion.p>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }}>
                <SignInButton mode="modal">
                  <Button size="lg" className="bg-gray-900 text-white text-base sm:text-lg px-8 py-6 font-bold shadow-lg hover:bg-gray-800 hover:scale-105 transition-transform duration-300">
                    Comece Grátis com IA <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </SignInButton>
            </motion.div>
            <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 mt-4 text-gray-500 text-sm">
              <div className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" /> Comece grátis</div>
              <div className="flex items-center gap-1.5"><CreditCard className="w-4 h-4 text-green-500" /> Não precisa de cartão</div>
            </div>
          </div>
        </section>

        {/* Vídeo de Demonstração */}
        <section className="px-4 pb-20 sm:pb-28">
            <FadeInSection>
                <div className="max-w-4xl mx-auto">
                    <div className="bg-gray-900 p-2 sm:p-3 rounded-2xl shadow-2xl shadow-purple-200">
                        <video src="/Explicaçao.mp4" poster="/Painel.png" controls className="rounded-xl w-full" aria-label="Demonstração da plataforma Freelinnk" />
                    </div>
                </div>
            </FadeInSection>
        </section>

        {/* Comparison Section */}
        <section className="px-4 py-20 sm:py-28 bg-gray-50/70">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-center mb-4">Feito para o Criador Brasileiro.</h2>
            <p className="text-lg text-gray-600 text-center mb-12">Preço em Reais, suporte em português e IA que entende nossa cultura.</p>
            <FadeInSection>
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-0">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-4 text-left font-bold text-gray-800 rounded-tl-xl">Plataforma</th>
                      <th className="p-4 text-left font-semibold text-gray-600">Inteligência Artificial</th>
                      <th className="p-4 text-left font-semibold text-gray-600">Analytics</th>
                      <th className="p-4 text-left font-semibold text-gray-600">Suporte</th>
                      <th className="p-4 text-left font-semibold text-gray-600 rounded-tr-xl">Moeda</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.map((row, index) => (
                      <tr key={row.name} className={clsx("bg-white", index === 0 && "ring-2 ring-purple-500")}>
                        <td className={clsx("p-4 font-semibold text-gray-900", index === comparison.length - 1 && "rounded-bl-xl")}>
                          {row.name} {index === 0 && <Star className="w-4 h-4 inline-block ml-1 text-purple-500 fill-purple-500"/>}
                        </td>
                        <td className="p-4 text-gray-700">{row.ia}</td>
                        <td className="p-4 text-gray-700">{row.analytics}</td>
                        <td className="p-4 text-gray-700">{row.suporte}</td>
                        <td className={clsx("p-4 text-gray-700", index === comparison.length - 1 && "rounded-br-xl")}>{row.moeda}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </FadeInSection>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="px-4 py-20 sm:py-28">
          <div className="max-w-5xl mx-auto text-center mb-16">
            <FadeInSection><h2 className="text-4xl lg:text-5xl font-bold tracking-tight">Uma plataforma, todas as ferramentas.</h2></FadeInSection>
            <FadeInSection><p className="text-xl text-gray-600 max-w-3xl mx-auto mt-4">Tudo o que você precisa para organizar seus links, entender sua audiência e criar conteúdo que converte.</p></FadeInSection>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {features.map((feature) => (
              <FadeInSection key={feature.title}>
                <div className="bg-gray-50/50 border border-gray-200/80 rounded-2xl p-8 hover:-translate-y-2 transition-transform duration-300">
                  <div className="text-purple-600 mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="px-4 py-20 sm:py-28 bg-gray-50/70">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold mb-10 text-center">Ainda tem dúvidas?</h2>
            <div className="space-y-4">
              {faq.map((item, i) => (
                <FadeInSection key={i}>
                  <details className="bg-white border rounded-xl p-6 group cursor-pointer">
                    <summary className="font-semibold text-lg list-none flex justify-between items-center">
                      {item.question}
                      <div className="text-purple-500 group-open:rotate-45 transition-transform duration-200 text-2xl font-light">+</div>
                    </summary>
                    <p className="text-gray-600 mt-4 pt-4 border-t">{item.answer}</p>
                  </details>
                </FadeInSection>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final Section */}
        <section className="px-4 py-20 sm:py-28">
          <FadeInSection>
            <div className="max-w-4xl mx-auto bg-gray-900 rounded-3xl p-8 sm:p-12 lg:p-16 text-center text-white relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-purple-600/30 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-600/30 rounded-full blur-3xl"></div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 relative z-10">Transforme sua bio em um negócio.</h2>
              <p className="text-lg sm:text-xl mb-8 opacity-80 relative z-10">Crie sua página em 60 segundos. Grátis para sempre.</p>
              <SignInButton mode="modal">
                <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-200 text-lg px-8 py-6 font-bold shadow-sm hover:scale-105 transition duration-300 relative z-10">
                  Crie seu Freelinnk agora <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </SignInButton>
            </div>
          </FadeInSection>
        </section>
      </main>

      {/* Você pode ter um componente Footer separado para reutilizar */}
      <Footer />
      <WhatsappFloatingButton />
    </div>
  );
}