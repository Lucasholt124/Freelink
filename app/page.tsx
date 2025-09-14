"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SignInButton, useAuth } from "@clerk/nextjs";
import {
  ArrowRight,
  CheckCircle,
  Star,
  BarChart3,
  Zap,
  CreditCard,
  Target,
  Handshake,
  BrainCircuit,
  Wand2,
  Users,
} from "lucide-react";

import WhatsappFloatingButton from "@/components/WhatsappFloatingButton";
import clsx from "clsx";
import { LandingHeader } from "@/components/LandingHeader";
import { Footer } from "@/components/Footer";

// Componente para contador animado
function AnimatedCounter({ value }: { value: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 50;
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
  }, [value]);

  return <span>{count.toLocaleString('pt-BR')}</span>;
}

const features = [
  {
    icon: <Wand2 className="w-10 h-10 text-purple-600" />,
    title: "Mentor IA",
    description:
      "Crie imagens profissionais com IA em segundos. Transforme qualquer ideia em arte visual impressionante para suas redes sociais.",
  },
  {
    icon: <BrainCircuit className="w-10 h-10 text-purple-600" />,
    title: "Freelinnk Brain™",
    description:
      "Nunca mais fique sem ideias. Gere títulos virais, roteiros para Reels e conteúdo para carrosséis em segundos.",
  },
  {
    icon: <BarChart3 className="w-10 h-10 text-purple-600" />,
    title: "Análises Detalhadas",
    description:
      "Descubra de onde vêm seus cliques, quais links performam melhor e entenda o que sua audiência realmente quer.",
  },
  {
    icon: <Zap className="w-10 h-10 text-purple-600" />,
    title: "Performance Imbatível",
    description:
      "Sua página carrega em um piscar de olhos. Nunca perca um clique por lentidão. A primeira impressão é a que fica.",
  },
  {
    icon: <Target className="w-10 h-10 text-purple-600" />,
    title: "Otimizado para Conversão",
    description:
      "Integre seus Pixels de rastreamento (Facebook, TikTok) e Google Analytics para transformar cliques em clientes.",
  },
  {
    icon: <Handshake className="w-10 h-10 text-purple-600" />,
    title: "Suporte em Português",
    description:
      "Fale com humanos de verdade via WhatsApp e e-mail. Estamos aqui para te ajudar a decolar no mercado brasileiro.",
  },
];

const faq = [
  {
    question: "O que torna o Freelinnk diferente?",
    answer:
      "Além de ser uma plataforma de link na bio, o Freelinnk é um co-piloto de marketing com IA. Geramos imagens profissionais, criamos conteúdo viral e te damos as ferramentas para crescer de verdade, tudo focado no mercado brasileiro.",
  },
  {
    question: "Posso cancelar quando quiser?",
    answer:
      "Sim! O cancelamento é fácil, sem burocracia e pode ser feito a qualquer momento no seu painel. Você mantém o acesso premium até o final do período pago.",
  },
  {
    question: "O pagamento é seguro?",
    answer:
      "Totalmente. Usamos a Stripe, uma das maiores e mais seguras plataformas de pagamento do mundo. Seus dados estão protegidos.",
  },
  {
    question: "Os preços são em Reais (BRL)?",
    answer:
      "Sim! Sem surpresas com a variação do dólar ou taxas de IOF. Você paga em Reais e tem suporte em português.",
  },
  {
    question: "As imagens geradas pela IA são realmente profissionais?",
    answer:
      "Sim! Nosso Mentor.IA usa os modelos mais avançados de geração de imagem, otimizados especificamente para marketing digital e redes sociais. Você pode criar desde posts para Instagram até capas para YouTube.",
  },
];

const comparison = [
  {
    name: "Freelinnk",
    ia: "Gerador de Imagens + Conteúdo com IA",
    analytics: "Avançado e Detalhado",
    suporte: "WhatsApp e E-mail",
    preço: "A partir de R$19,90/mês",
    moeda: "Reais (BRL)",
  },
  {
    name: "Linktree",
    ia: "Nenhum",
    analytics: "Básico no plano similar",
    suporte: "Apenas E-mail",
    preço: "A partir de US$5/mês",
    moeda: "Dólar (USD) + IOF",
  },
  {
    name: "Beacons",
    ia: "Básico (sugestões genéricas)",
    analytics: "Básico no plano similar",
    suporte: "Apenas E-mail",
    preço: "A partir de US$10/mês",
    moeda: "Dólar (USD) + IOF",
  },
];

const FadeInSection = ({ children }: { children: ReactNode }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.15 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="will-change-transform"
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
  // Estados para prova social
  const [activeUsers, setActiveUsers] = useState(127);
  const [totalLinks, setTotalLinks] = useState(1843);
  const [totalImages, setTotalImages] = useState(3291);

  // Atualiza números a cada 30 segundos para parecer "vivo"
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers(prev => prev + Math.floor(Math.random() * 3));
      setTotalLinks(prev => prev + Math.floor(Math.random() * 7));
      setTotalImages(prev => prev + Math.floor(Math.random() * 12));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white text-gray-900 selection:bg-purple-500 selection:text-white">
      <AuthRedirector />
      <LandingHeader />

      <main className="relative overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative px-6 pt-28 pb-24 sm:pt-36 sm:pb-32 text-center overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-purple-50/60 via-white to-white" />
          <div className="max-w-5xl mx-auto space-y-10">
            <motion.h1
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight"
            >
              De{" "}
              <span className="text-purple-600">Link na Bio</span> a{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text text-transparent">
                Máquina de Conteúdo
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-xl sm:text-2xl max-w-3xl mx-auto text-gray-700"
            >
              O Freelinnk é a primeira plataforma do Brasil que não apenas
              organiza seus links, mas usa IA para criar imagens profissionais,
              gerar conteúdo viral e transformar seus seguidores em clientes.
            </motion.p>

            {/* PROVA SOCIAL ADICIONADA AQUI */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-8 mt-8 mb-6"
            >
              <div className="text-center">
                <h3 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  <AnimatedCounter value={activeUsers} />+
                </h3>
                <p className="text-sm text-gray-600">Criadores ativos</p>
              </div>
              <div className="hidden sm:block w-px h-12 bg-gray-300" />
              <div className="text-center">
                <h3 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  <AnimatedCounter value={totalLinks} />+
                </h3>
                <p className="text-sm text-gray-600">Links criados</p>
              </div>
              <div className="hidden sm:block w-px h-12 bg-gray-300" />
              <div className="text-center">
                <h3 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  <AnimatedCounter value={totalImages} />+
                </h3>
                <p className="text-sm text-gray-600">Imagens com IA</p>
              </div>
            </motion.div>

            {/* Avatares de usuários */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-8"
            >
              <p className="text-xs text-gray-500 text-center mb-4">Criadores que confiam no Freelink:</p>
              <div className="flex flex-wrap justify-center items-center gap-6 opacity-60">
                <div className="flex -space-x-2">
                  {[...Array(7)].map((_, i) => (
                    <img
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                      src={`https://i.pravatar.cc/100?img=${i + 1}`}
                      alt="User"
                    />
                  ))}
                  <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-600 shadow-md">
                    +{activeUsers - 7}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <SignInButton mode="modal">
                <Button
                  size="lg"
                  className="bg-purple-700 text-white px-10 py-6 font-extrabold text-lg rounded-xl shadow-xl hover:scale-105 hover:shadow-2xl transition-transform duration-300"
                >
                  Comece Grátis com IA <ArrowRight className="w-6 h-6 ml-3" />
                </Button>
              </SignInButton>
            </motion.div>
            <div className="flex flex-wrap justify-center items-center gap-8 mt-6 text-gray-500 text-sm select-none">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Comece grátis
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-green-500" />
                Não precisa de cartão
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-500" />
                Junte-se a {activeUsers}+ criadores
              </div>
            </div>
          </div>
        </section>

        {/* Demo Video */}
        <section className="px-6 pb-24 sm:pb-32">
          <FadeInSection>
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Veja o Freelinnk em ação
                </h2>
                <p className="text-lg text-gray-600">
                  Descubra como criadores estão transformando seus perfis em negócios
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-700 to-blue-700 p-2 rounded-3xl shadow-2xl">
                <video
                  src="/Explicaçao.mp4"
                  poster="/Painel.png"
                  controls
                  className="rounded-2xl w-full shadow-lg"
                  aria-label="Demonstração da plataforma Freelinnk"
                />
              </div>
            </div>
          </FadeInSection>
        </section>

        {/* Comparison Table */}
        <section className="px-6 py-24 bg-gray-50/80">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-extrabold text-center mb-6">
              Feito para Criador Brasileiro.
            </h2>
            <p className="text-lg text-gray-700 text-center max-w-4xl mx-auto mb-16">
              Preço em Reais, suporte em português e IA que entende nossa cultura.
            </p>
            <FadeInSection>
              <div className="overflow-x-auto rounded-3xl shadow-lg border border-gray-200 bg-white">
                <table className="min-w-full border-separate border-spacing-0 rounded-3xl overflow-hidden">
                  <thead className="bg-purple-100">
                    <tr>
                      <th className="p-6 text-left font-bold text-purple-700 rounded-tl-3xl">
                        Plataforma
                      </th>
                      <th className="p-6 text-left font-semibold text-purple-600">
                        Inteligência Artificial
                      </th>
                      <th className="p-6 text-left font-semibold text-purple-600">
                        Analytics
                      </th>
                      <th className="p-6 text-left font-semibold text-purple-600">
                        Suporte
                      </th>
                      <th className="p-6 text-left font-semibold text-purple-600 rounded-tr-3xl">
                        Moeda
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.map((row, i) => (
                      <tr
                        key={row.name}
                        className={clsx(
                          "bg-white",
                          i === 0 && "ring-2 ring-purple-500 shadow-md"
                        )}
                      >
                        <td
                          className={clsx(
                            "p-6 font-semibold text-gray-900",
                            i === comparison.length - 1 && "rounded-bl-3xl"
                          )}
                        >
                          {row.name}{" "}
                          {i === 0 && (
                            <Star className="w-5 h-5 inline-block ml-2 text-purple-600 fill-purple-600" />
                          )}
                        </td>
                        <td className="p-6 text-gray-700">{row.ia}</td>
                        <td className="p-6 text-gray-700">{row.analytics}</td>
                        <td className="p-6 text-gray-700">{row.suporte}</td>
                        <td
                          className={clsx(
                            "p-6 text-gray-700",
                            i === comparison.length - 1 && "rounded-br-3xl"
                          )}
                        >
                          {row.moeda}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </FadeInSection>
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="px-6 py-24 max-w-7xl mx-auto text-center space-y-16"
        >
          <FadeInSection>
            <h2 className="text-5xl font-extrabold tracking-tight">
              Uma plataforma, todas as ferramentas.
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto mt-4">
              Tudo o que você precisa para organizar seus links, entender sua
              audiência e criar conteúdo que converte.
            </p>
          </FadeInSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
            {features.map((feature) => (
              <FadeInSection key={feature.title}>
                <div className="bg-white border border-gray-200 rounded-3xl p-10 shadow-lg hover:shadow-2xl transition-shadow duration-300 cursor-default select-none">
                  <div className="mb-6">{feature.icon}</div>
                  <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-700 leading-relaxed">{feature.description}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </section>

        {/* Testimonials Section - NOVO */}
        <section className="px-6 py-24 bg-purple-50/50">
          <FadeInSection>
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl font-extrabold text-center mb-16">
                O que nossos criadores estão dizendo
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    name: "Maria Silva",
                    role: "Influencer de Moda",
                    avatar: "https://i.pravatar.cc/150?img=1",
                    content: "O Mentor.IA mudou completamente meu jogo no Instagram. Crio imagens profissionais em segundos!",
                    followers: "45K seguidores"
                  },
                  {
                    name: "João Santos",
                    role: "Coach de Negócios",
                    avatar: "https://i.pravatar.cc/150?img=3",
                    content: "Finalmente uma ferramenta brasileira que entende nosso mercado. Meus cliques triplicaram!",
                    followers: "28K seguidores"
                  },
                  {
                    name: "Ana Costa",
                    role: "Criadora de Conteúdo",
                    avatar: "https://i.pravatar.cc/150?img=5",
                    content: "O FreelinkBrain me salva todos os dias. Nunca mais fiquei sem ideias para posts!",
                    followers: "67K seguidores"
                  }
                ].map((testimonial, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
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
                    <p className="text-sm text-purple-600 font-medium">{testimonial.followers}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </FadeInSection>
        </section>

        {/* FAQ */}
        <section className="px-6 py-24 bg-gray-50/80">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-extrabold mb-12 text-center">
              Ainda tem dúvidas?
            </h2>
            <div className="space-y-6 max-w-3xl mx-auto">
              {faq.map((item, i) => (
                <FadeInSection key={i}>
                  <details className="bg-white border border-gray-200 rounded-3xl p-6 group cursor-pointer transition-shadow duration-300 hover:shadow-lg">
                    <summary className="font-semibold text-xl list-none flex justify-between items-center cursor-pointer">
                      {item.question}
                      <div className="text-purple-600 group-open:rotate-45 transition-transform duration-200 text-3xl font-light select-none">
                        +
                      </div>
                    </summary>
                    <p className="text-gray-700 mt-4 pt-4 border-t border-gray-200">
                      {item.answer}
                    </p>
                  </details>
                </FadeInSection>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-6 py-24">
          <FadeInSection>
            <div className="max-w-4xl mx-auto bg-gradient-to-r from-purple-700 to-blue-700 rounded-3xl p-12 text-center text-white relative overflow-hidden shadow-2xl">
              <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-600/30 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-600/30 rounded-full blur-3xl"></div>
              <h2 className="text-4xl sm:text-5xl font-extrabold mb-6 relative z-10">
                Transforme sua bio em um negócio.
              </h2>
              <p className="text-xl mb-10 opacity-90 relative z-10 max-w-xl mx-auto">
                Junte-se a {activeUsers}+ criadores que já estão usando IA para crescer.
              </p>
              <SignInButton mode="modal">
                <Button
                  size="lg"
                  className="bg-white text-gray-900 px-10 py-6 font-extrabold rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl transition-transform duration-300 relative z-10"
                >
                  Crie seu Freelinnk agora <ArrowRight className="w-6 h-6 ml-3" />
                </Button>
              </SignInButton>
              <p className="mt-6 text-sm opacity-80 relative z-10">
                Sem cartão de crédito • Cancele quando quiser
              </p>
            </div>
          </FadeInSection>
        </section>
      </main>

      <Footer />
      <WhatsappFloatingButton />
    </div>
  );
}