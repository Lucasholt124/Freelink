"use client";

import React, { ReactNode } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/nextjs";
import {
  ArrowRight,
  CheckCircle,
  Star,
  Palette,
  BarChart3,
  Smartphone,
  Zap,
  Shield,
  Users,
} from "lucide-react";

const features = [
  {
    icon: <Palette className="w-8 h-8" />,
    title: "Totalmente personalizável",
    description:
      "Personalize sua página de links com temas, cores e layouts que combinam com sua marca.",
  },
  {
    icon: <BarChart3 className="w-8 h-8" />,
    title: "Análise Avançada",
    description:
      "Monitore cliques, entenda seu público e otimize seu conteúdo com insights e relatórios detalhados.",
  },
  {
    icon: <Smartphone className="w-8 h-8" />,
    title: "Otimizado para dispositivos móveis",
    description:
      "Sua página fica perfeita em todos os dispositivos, de computadores a celulares.",
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: "Rápido como um raio",
    description:
      "Tempos de carregamento instantâneos e uma experiência de usuário suave.",
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Seguro e confiável",
    description:
      "Segurança de nível empresarial com 99,9% de disponibilidade garantida.",
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Colaboração em equipe",
    description:
      "Gerencie e otimize suas páginas em conjunto com sua equipe.",
  },
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Criadora de conteúdo",
    content:
      "O Freelink transformou a forma como compartilho meu conteúdo. As análises me ajudam a entender o que meu público mais gosta!",
    rating: 5,
  },
  {
    name: "Mike Chen",
    role: "Proprietário de pequena empresa",
    content:
      "Perfeito para o meu negócio. Limpo, profissional e meus clientes conseguem encontrar facilmente todos os meus links importantes.",
    rating: 5,
  },
  {
    name: "Anna Alves",
    role: "Artista",
    content:
      "As opções de personalização são incríveis. Minha página de links combina perfeitamente com minha marca e estilo artístico.",
    rating: 5,
  },
];

const FadeInSection = ({ children }: { children: ReactNode }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

export default function HomeClient() {
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 scroll-smooth"
      style={{ scrollBehavior: "smooth" }}
    >
      <Header isFixed />

      {/* Hero Section */}
      <section className="relative px-4 py-20 lg:px-8 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/hero-bg.jpg"
            alt="Fundo hero"
            fill
            style={{ objectFit: "cover" }}
            priority
            className="opacity-20"
            quality={75}
          />
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl lg:text-7xl font-extrabold leading-tight"
          >
            Um Link{" "}
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Infinitas Possibilidades
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            Crie uma página de links na bio linda e personalizável, ideal para
            criadores, empresas e qualquer pessoa que queira compartilhar
            vários links com facilidade.
          </motion.p>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="inline-flex"
          >
            <SignInButton mode="modal" >
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-lg px-8 py-5 font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition duration-300"
              >
                Comece gratuitamente <ArrowRight className="w-5 h-5" />
              </Button>
            </SignInButton>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-4 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto text-center mb-16 space-y-4">
          <FadeInSection>
            <h2 className="text-4xl lg:text-5xl font-bold">
              Tudo o que você precisa
            </h2>
          </FadeInSection>

          <FadeInSection>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Recursos poderosos para você compartilhar seu conteúdo e crescer seu
              público.
            </p>
          </FadeInSection>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FadeInSection key={index}>
              <div className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 cursor-default select-none">
                <div className="text-purple-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-4 lg:px-8 py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <FadeInSection>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Amado pelos criadores
            </h2>
          </FadeInSection>
          <FadeInSection>
            <p className="text-xl text-gray-600">
              Veja o que nossos usuários estão dizendo sobre o Freelink
            </p>
          </FadeInSection>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <FadeInSection key={index}>
              <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-xl shadow-gray-200/50 cursor-default select-none">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            </FadeInSection>
          ))}
        </div>
      </section>

    {/* CTA Final Section */}
<section className="px-4 lg:px-8 py-20">
  <FadeInSection>
    <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-12 lg:p-16 text-center text-white shadow-2xl">
      <h2 className="text-4xl lg:text-5xl font-bold mb-6">Pronto para começar?</h2>
      <p className="text-xl mb-8 opacity-90">
        Crie sua página em minutos e junte-se a milhares de criadores que
        confiam no Freelink.
      </p>

      <SignInButton mode="modal">
        <Button
          size="lg"
          className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-6 font-semibold shadow-sm hover:scale-105 transition duration-300"
        >
          Crie seu Freelink <ArrowRight className="w-5 h-5" />
        </Button>
      </SignInButton>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm opacity-80">
        {[
          "Comece grátis",
          "Não precisa de cartão",
          "Configuração em 15 segundos",
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2 select-none cursor-default">
            <CheckCircle className="w-4 h-4" />
            {item}
          </div>
        ))}
      </div>
    </div>
  </FadeInSection>
</section>

    {/* Footer */}
<footer className="bg-white/90 backdrop-blur-md border-t border-gray-200 px-6 sm:px-12 lg:px-16 py-12">
  <div className="max-w-7xl mx-auto space-y-12">
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
      {/* Branding */}
      <div className="space-y-4">
        <h3 className="text-3xl font-extrabold tracking-tight text-gray-900">Freelink</h3>
        <p className="text-gray-600 text-base max-w-xs">
          A forma mais fácil de reunir e compartilhar todos os seus links em uma página incrível.
        </p>
      </div>

      {/* Produto */}
      <nav aria-label="Produto" className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900">Produto</h4>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>
            <a href="#features" className="hover:text-purple-600 transition-colors">
              Características
            </a>
          </li>
          <li>
            <a href="#pricing" className="hover:text-purple-600 transition-colors">
              Preços
            </a>
          </li>
          <li>
            <a href="#analytics" className="hover:text-purple-600 transition-colors">
              Análise
            </a>
          </li>
          <li>
            <a href="#integrations" className="hover:text-purple-600 transition-colors">
              Integrações
            </a>
          </li>
        </ul>
      </nav>

      {/* Empresa */}
      <nav aria-label="Empresa" className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900">Empresa</h4>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>
            <a href="/about" className="hover:text-purple-600 transition-colors">
              Sobre
            </a>
          </li>
          <li>
            <a href="/blog" className="hover:text-purple-600 transition-colors">
              Blog
            </a>
          </li>
          <li>
            <a href="/careers" className="hover:text-purple-600 transition-colors">
              Carreiras
            </a>
          </li>
          <li>
            <a href="/contact" className="hover:text-purple-600 transition-colors">
              Contato
            </a>
          </li>
        </ul>
      </nav>

      {/* Suporte */}
      <nav aria-label="Suporte" className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900">Suporte</h4>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>
            <a href="/help-center" className="hover:text-purple-600 transition-colors">
              Central de Ajuda
            </a>
          </li>
          <li>
            <a href="/docs" className="hover:text-purple-600 transition-colors">
              Documentação
            </a>
          </li>
          <li>
            <a href="/community" className="hover:text-purple-600 transition-colors">
              Comunidade
            </a>
          </li>
          <li>
            <a href="/status" className="hover:text-purple-600 transition-colors">
              Status
            </a>
          </li>
        </ul>
      </nav>
    </div>

    <div className="border-t border-gray-200 pt-6 text-center text-sm text-gray-500 select-none">
      &copy; 2025{" "}
      <a
        href="https://mysite-eog7.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-purple-600 transition-colors"
      >
        Impulsioneweb
      </a>
      . Todos os direitos reservados.
    </div>
  </div>
</footer>
    </div>
  );
}
