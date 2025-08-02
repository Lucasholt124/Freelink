"use client";

import React, { ReactNode, useEffect } from "react";
// CORREÇÃO TÉCNICA: O <Head> foi removido. Isso deve ser feito com `export const metadata` no arquivo page.tsx
import Image from "next/image";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { SignInButton, useAuth } from "@clerk/nextjs";
import {
  ArrowRight, CheckCircle, Star, Palette, BarChart3, Smartphone, Zap, Lock, CreditCard, ShieldCheck, Target, Handshake
} from "lucide-react";
import WhatsappFloatingButton from "@/components/WhatsappFloatingButton";
import clsx from "clsx";

// --- MUDANÇA: Textos focados em BENEFÍCIOS ---
const features = [
  { icon: <Palette className="w-8 h-8" />, title: "Sua Marca em Destaque", description: "Personalize cada detalhe, das cores aos layouts, para criar uma página que é 100% você." },
  { icon: <BarChart3 className="w-8 h-8" />, title: "Decisões Baseadas em Dados", description: "Com nossas análises avançadas, você descobre quais links performam melhor e entende o que sua audiência realmente quer." },
  { icon: <Smartphone className="w-8 h-8" />, title: "Perfeito em Qualquer Tela", description: "Sua página é totalmente responsiva, garantindo uma experiência incrível para seus seguidores, não importa o dispositivo." },
  { icon: <Zap className="w-8 h-8" />, title: "Performance Imbatível", description: "Carregamento ultra-rápido para que você nunca perca um clique por lentidão. A primeira impressão conta." },
  { icon: <Target className="w-8 h-8" />, title: "Otimizado para Conversão", description: "Recursos como rastreamento de Pixel e GA4 (plano Ultra) para transformar cliques em clientes." },
  { icon: <Handshake className="w-8 h-8" />, title: "Suporte que Resolve", description: "Fale com humanos de verdade via WhatsApp e e-mail. Estamos aqui para ajudar você a crescer." },
];

// --- MUDANÇA: Depoimentos precisam ser REAIS. Use estes como placeholders até ter os verdadeiros. ---
// É MELHOR NÃO TER DEPOIMENTOS DO QUE TER DEPOIMENTOS FALSOS.
const testimonials = [
  // { name: "Nome Real", role: "Profissão Real", content: "Depoimento real de um cliente satisfeito.", rating: 5 },
  // { name: "Outro Nome Real", role: "Outra Profissão", content: "Outro depoimento real que gera confiança.", rating: 5 },
  // { name: "Mais um Nome Real", role: "Cliente Satisfeito", content: "Depoimentos são a maior prova social que você pode ter.", rating: 5 },
];

const faq = [
  { question: "Posso cancelar quando quiser?", answer: "Sim! O cancelamento é fácil e sem burocracia. Você mantém o acesso aos recursos do seu plano até o final do período já pago." },
  { question: "O pagamento é seguro?", answer: "Totalmente. Usamos a Stripe, líder mundial em pagamentos online, para processar tudo com segurança e criptografia de ponta." },
  { question: "Os preços são em Reais?", answer: "Sim! Todos os nossos preços são em Reais (BRL), sem surpresas com a variação do dólar ou taxas de conversão." },
  { question: "O que acontece se eu fizer um upgrade?", answer: "A mudança é instantânea! Você paga apenas a diferença proporcional e já pode usar os novos recursos." },
];

// --- MUDANÇA: Tabela de comparação ATUALIZADA e HONESTA ---
const comparison = [
  { name: "Freelink", analytics: "Avançado e Detalhado", suporte: "WhatsApp e E-mail", preço: "A partir de R$14,90/mês", personalização: "Completa", moeda: "Reais (BRL)" },
  { name: "Linktree", analytics: "Básico no plano similar", suporte: "Apenas E-mail", preço: "A partir de US$5/mês", personalização: "Limitada", moeda: "Dólar (USD) + IOF" },
  { name: "Beacons", analytics: "Básico no plano similar", suporte: "Apenas E-mail", preço: "A partir de US$10/mês", personalização: "Limitada", moeda: "Dólar (USD) + IOF" },
];

const FadeInSection = ({ children }: { children: ReactNode }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
};

// --- MUDANÇA TÉCNICA: Lógica de cliente isolada em um componente menor ---
function AuthRedirectAndCTA() {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (isSignedIn) {
      router.push("/dashboard");
    }
  }, [isSignedIn, router]);

  return (
    <>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }}>
        <SignInButton mode="modal">
          <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 text-lg px-8 py-5 font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition duration-300">
            Comece gratuitamente <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </SignInButton>
      </motion.div>
      <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center sm:hidden pointer-events-none">
        <div className="pointer-events-auto">
          <SignInButton mode="modal">
            <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 text-lg px-8 py-4 font-semibold shadow-lg">
              Comece gratuitamente <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </SignInButton>
        </div>
      </div>
    </>
  );
}

export default function Home() {
  // O componente principal agora é mais "limpo", sem a lógica de cliente.
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900">
      <Header isFixed />
      <main>
        {/* Hero Section */}
        <section className="relative px-4 py-24 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 -z-10"><Image src="/hero-bg.jpg" alt="Fundo abstrato" fill style={{ objectFit: "cover" }} priority className="opacity-20" quality={75} /></div>
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight tracking-tighter">
              Sua audiência, em um só lugar. <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Com inteligência.</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-lg lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Transforme sua bio do Instagram em um hub de conversão. Crie uma página de links elegante e descubra o que seu público realmente ama com nossas análises avançadas.
            </motion.p>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.3 }}>
              <video src="/Explicaçao.mp4" poster="/Painel.png" controls className="rounded-xl border shadow-2xl w-full max-w-2xl mx-auto" aria-label="Demonstração do painel Freelink" />
            </motion.div>
            <AuthRedirectAndCTA />
            <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 mt-6 text-gray-500 text-sm">
              <div className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> Pagamento seguro via Stripe</div>
              <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Login seguro com Clerk</div>
              <div className="flex items-center gap-2"><Lock className="w-4 h-4" /> Dados 100% criptografados</div>
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="px-4 lg:px-8 py-20">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-center mb-4">Feito para o mercado brasileiro.</h2>
            <p className="text-lg text-gray-600 text-center mb-10">Preço em Reais, suporte em português e recursos que você realmente precisa.</p>
            <FadeInSection>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-xl bg-white shadow-lg text-sm sm:text-base">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-4 text-left font-bold text-gray-800">Plataforma</th>
                      <th className="p-4 text-left font-semibold text-gray-600">Analytics</th>
                      <th className="p-4 text-left font-semibold text-gray-600">Suporte</th>
                      <th className="p-4 text-left font-semibold text-gray-600">Preço</th>
                      <th className="p-4 text-left font-semibold text-gray-600">Moeda</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.map((row, index) => (
                      <tr key={row.name} className={clsx("border-t", index === 0 && "bg-blue-50 font-semibold")}>
                        <td className="p-4 text-gray-900">{row.name} {index === 0 && <Star className="w-4 h-4 inline-block ml-1 text-blue-500 fill-blue-500"/>}</td>
                        <td className="p-4">{row.analytics}</td>
                        <td className="p-4">{row.suporte}</td>
                        <td className="p-4">{row.preço}</td>
                        <td className="p-4">{row.moeda}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </FadeInSection>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="px-4 lg:px-8 py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto text-center mb-16">
            <FadeInSection><h2 className="text-4xl lg:text-5xl font-bold tracking-tight">Ferramentas para o seu sucesso</h2></FadeInSection>
            <FadeInSection><p className="text-xl text-gray-600 max-w-2xl mx-auto mt-4">Tudo o que você precisa para centralizar seus links e transformar seguidores em clientes.</p></FadeInSection>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {features.map((feature) => (
              <FadeInSection key={feature.title}>
                <div className="bg-white border border-gray-200/80 rounded-2xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                  <div className="text-blue-600 mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </section>

        {/* Testimonials Section (só renderiza se houver depoimentos reais) */}
        {testimonials.length > 0 && (
          <section className="px-4 lg:px-8 py-20">
            <div className="max-w-7xl mx-auto text-center mb-16">
              <FadeInSection><h2 className="text-4xl lg:text-5xl font-bold">Amado por criadores como você</h2></FadeInSection>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {/* ... map dos testimonials ... */}
            </div>
          </section>
        )}

        {/* FAQ */}
        <section className="px-4 lg:px-8 py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold mb-10 text-center">Respostas rápidas para suas dúvidas</h2>
            <div className="space-y-4">
              {faq.map((item, i) => (
                <FadeInSection key={i}>
                  <details className="bg-white border border-gray-200 rounded-xl p-6 group cursor-pointer">
                    <summary className="font-semibold text-lg list-none flex justify-between items-center">
                      {item.question}
                      <div className="group-open:rotate-45 transition-transform duration-200">+</div>
                    </summary>
                    <p className="text-gray-600 mt-4">{item.answer}</p>
                  </details>
                </FadeInSection>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final Section */}
        <section className="px-4 lg:px-8 py-20">
          <FadeInSection>
            <div className="max-w-4xl mx-auto bg-gradient-to-r from-gray-900 to-black rounded-3xl p-8 sm:p-12 lg:p-16 text-center text-white shadow-2xl">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">Pronto para centralizar sua audiência?</h2>
              <p className="text-lg sm:text-xl mb-8 opacity-80">Crie sua página em menos de 60 segundos. Gratuito para começar.</p>
              <SignInButton mode="modal">
                <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-200 text-lg px-8 py-6 font-bold shadow-sm hover:scale-105 transition duration-300">
                  Crie seu Freelinnk agora <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </SignInButton>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-x-8 gap-y-2 text-sm opacity-70">
                <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Comece grátis</div>
                <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Não precisa de cartão</div>
              </div>
            </div>
          </FadeInSection>
        </section>

        {/* Footer (simplificado para ser mais direto) */}
        <footer className="border-t border-gray-200 px-6 py-8">
          <div className="max-w-7xl mx-auto text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Freelinnk (um produto Impulsioneweb). Todos os direitos reservados.
            <nav className="flex justify-center gap-4 mt-4">
              <a href="/termos" className="hover:text-gray-900">Termos de Serviço</a>
              <a href="/privacidade" className="hover:text-gray-900">Política de Privacidade</a>
            </nav>
          </div>
        </footer>

        <WhatsappFloatingButton />
      </main>
    </div>
  );
}