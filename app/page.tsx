"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  Star,
  Clock,
  Shield,

  MousePointer,
  Gift,

  Eye,

  Instagram,

  Users,
  Sparkles,
  TrendingUp,
  Play,
  ChevronRight,
  Target,
  BrainCircuit,
  Wand2,
  CreditCard,
  Zap,

  X,
  Check,
  BarChart3,
  Rocket,

} from "lucide-react";

// Define a interface para as props do AnimatedCounter
interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
}

// Componente de Contador Animado
function AnimatedCounter({ value, prefix = "", suffix = "" }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isVisible) return;
    const duration = 2000;
    const steps = 60;
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
  }, [value, isVisible]);

  return (
    <motion.span
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      onViewportEnter={() => setIsVisible(true)}
      viewport={{ once: true }}
    >
      {prefix}{count.toLocaleString('pt-BR')}{suffix}
    </motion.span>
  );
}

// Componente de Badge Flutuante
interface FloatingBadgeProps {
  children: React.ReactNode;
  delay?: number;
}

function FloatingBadge({ children, delay = 0 }: FloatingBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: "easeOut" }}
      className="inline-block"
    >
      {children}
    </motion.div>
  );
}

export default function FreelinnkLanding() {
  const [showVideo, setShowVideo] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 47, seconds: 32 });
  const [isScrolled, setIsScrolled] = useState(false);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Scroll listener para header sticky
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Analytics Completo",
      description: "Veja de onde vem cada clique, dispositivo, cidade e horário de pico",
      badge: "NOVO"
    },
    {
      icon: <Gift className="w-6 h-6" />,
      title: "Sorteios Virais",
      description: "Crie sorteios que explodem seu engajamento em minutos",
      badge: "HOT"
    },
    {
      icon: <BrainCircuit className="w-6 h-6" />,
      title: "IA Criadora de Conteúdo",
      description: "Gere roteiros, legendas e imagens profissionais com IA",
      badge: "IA"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Pixels & Rastreamento",
      description: "Meta Pixel, Google Analytics e TikTok integrados"
    },
    {
      icon: <Wand2 className="w-6 h-6" />,
      title: "Imagens Profissionais",
      description: "Crie artes incríveis com IA em segundos"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Relatórios Avançados",
      description: "Dashboards que mostram o que realmente importa"
    }
  ];

  const stats = [
    { value: 5847, label: "Criadores Ativos", icon: <Users className="w-5 h-5" /> },
    { value: 1234567, label: "Cliques Rastreados", icon: <MousePointer className="w-5 h-5" /> },
    { value: 4.9, label: "Avaliação", icon: <Star className="w-5 h-5" />, suffix: "/5" }
  ];

  const comparison = [
    { feature: "Preço/mês", freelinnk: "R$ 34,90", linktree: "R$ 85+", beacons: "R$ 60+" },
    { feature: "Analytics Detalhado", freelinnk: true, linktree: false, beacons: false },
    { feature: "Gerador IA", freelinnk: true, linktree: false, beacons: false },
    { feature: "Sorteios", freelinnk: true, linktree: false, beacons: false },
    { feature: "Pixels Ilimitados", freelinnk: true, linktree: false, beacons: false },
    { feature: "Suporte em PT-BR", freelinnk: true, linktree: false, beacons: false }
  ];

  const testimonials = [
    {
      name: "Júlia Mendes",
      role: "Fashion Influencer • 89K seguidores",
      content: "Tripliquei minhas vendas em 30 dias! O analytics mostrou exatamente de onde vinham meus clientes.",
      metric: "+R$ 12K/mês",
      avatar: "https://i.pravatar.cc/150?img=1",
      stars: 5
    },
    {
      name: "Carlos Eduardo",
      role: "Personal Trainer • 45K seguidores",
      content: "Os sorteios me deram 10K seguidores em 1 semana. Melhor investimento que já fiz!",
      metric: "+15K seguidores",
      avatar: "https://i.pravatar.cc/150?img=3",
      stars: 5
    },
    {
      name: "Amanda Silva",
      role: "Produtora de Conteúdo • 120K seguidores",
      content: "A IA me economiza 5 horas por dia criando conteúdo. Não consigo mais trabalhar sem!",
      metric: "+300% engajamento",
      avatar: "https://i.pravatar.cc/150?img=5",
      stars: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header Sticky */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/95 backdrop-blur-lg shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Freelinnk
              </span>
            </div>

            <button className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-bold text-sm sm:text-base hover:shadow-lg transform hover:scale-105 transition-all">
              Começar Grátis
              <ArrowRight className="inline-block ml-2 w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Hero Section - Otimizado para Conversão */}
      <section className="relative pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background com gradiente suave */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-white -z-10" />
        <div className="absolute top-20 left-0 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-6 sm:space-y-8">
            {/* Badge com urgência */}
            <FloatingBadge delay={0.1}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full text-xs sm:text-sm font-bold shadow-lg">
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">+5.847 criadores faturando agora</span>
                <span className="sm:hidden">+5.8K criadores ativos</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </FloatingBadge>

            {/* Título principal - mais impactante */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="space-y-4"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight">
                Transforme seus
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600">
                  seguidores em R$
                </span>
              </h1>

              <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                A única plataforma com <strong className="text-purple-600">IA + Analytics + Sorteios</strong> que realmente vende por você
              </p>
            </motion.div>

            {/* Stats em destaque */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-4"
            >
              {stats.map((stat, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-md">
                  <div className="text-purple-600">{stat.icon}</div>
                  <div className="text-left">
                    <div className="text-lg sm:text-xl font-black">
                      <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="text-xs text-gray-600 hidden sm:block">{stat.label}</div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* CTAs principais - mais visíveis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6"
            >
              <button className="group relative w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-bold text-base sm:text-lg shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 transition-all duration-300">
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Começar Grátis Agora
                  <Rocket className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                onClick={() => setShowVideo(true)}
                className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-gray-300 text-gray-900 rounded-2xl font-semibold text-base sm:text-lg hover:border-purple-600 hover:text-purple-600 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Play className="w-5 h-5" />
                Ver Demonstração (2 min)
              </button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-600 pt-4"
            >
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                <strong>Grátis</strong> para sempre
              </span>
              <span className="hidden sm:inline text-gray-300">|</span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                Setup em <strong>30 segundos</strong>
              </span>
              <span className="hidden sm:inline text-gray-300">|</span>
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                <strong>Sem</strong> cartão de crédito
              </span>
            </motion.div>

            {/* Urgência Timer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="inline-block bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-4 sm:p-6 mt-8"
            >
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-red-600" />
                <span className="text-red-600 font-bold text-sm sm:text-base">Oferta especial termina em:</span>
              </div>
              <div className="flex items-center justify-center gap-2 sm:gap-4">
                {[
                  { value: timeLeft.hours, label: 'Horas' },
                  { value: timeLeft.minutes, label: 'Min' },
                  { value: timeLeft.seconds, label: 'Seg' }
                ].map((time, i) => (
                  <React.Fragment key={i}>
                    <div className="text-center">
                      <div className="text-2xl sm:text-4xl font-black text-red-600 bg-white rounded-lg px-3 sm:px-4 py-2 shadow-lg min-w-[60px] sm:min-w-[80px]">
                        {String(time.value).padStart(2, '0')}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{time.label}</div>
                    </div>
                    {i < 2 && <span className="text-2xl sm:text-4xl font-bold text-red-600">:</span>}
                  </React.Fragment>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid - Mais visual */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
              Tudo que você precisa para <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">vender mais</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Recursos profissionais que seus concorrentes não têm
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-purple-200"
              >
                {feature.badge && (
                  <span className="absolute -top-3 -right-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg">
                    {feature.badge}
                  </span>
                )}

                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center text-purple-600 mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                  {feature.icon}
                </div>

                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof - Depoimentos */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
              Criadores que <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">já faturam</span> com Freelinnk
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-gradient-to-br from-gray-50 to-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-200"
              >
                <div className="flex items-center gap-4 mb-4 sm:mb-6">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-purple-200"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-base sm:text-lg">{testimonial.name}</h4>
                    <p className="text-xs sm:text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>

                <div className="flex gap-1 mb-3 sm:mb-4">
                  {[...Array(testimonial.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 leading-relaxed">&quot;{testimonial.content}&quot;</p>

                <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="text-base sm:text-lg font-bold text-green-600">{testimonial.metric}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table - Mobile Optimized */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
              Por que somos <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">melhores e mais baratos</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">
              Compare e veja a diferença
            </p>
          </div>

          {/* Mobile: Cards */}
          <div className="lg:hidden space-y-4">
            {comparison.map((row, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-lg border-2 border-gray-100">
                <div className="font-bold text-gray-900 mb-3">{row.feature}</div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <div className="text-xs text-gray-600 mb-1">Freelinnk</div>
                    <div className="font-bold text-green-600">
                      {typeof row.freelinnk === 'boolean' ? (
                        row.freelinnk ? <Check className="w-6 h-6 mx-auto" /> : <X className="w-6 h-6 mx-auto text-red-500" />
                      ) : (
                        row.freelinnk
                      )}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-600 mb-1">Linktree</div>
                    <div className="font-bold text-gray-600">
                      {typeof row.linktree === 'boolean' ? (
                        row.linktree ? <Check className="w-6 h-6 mx-auto" /> : <X className="w-6 h-6 mx-auto" />
                      ) : (
                        row.linktree
                      )}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-600 mb-1">Beacons</div>
                    <div className="font-bold text-gray-600">
                      {typeof row.beacons === 'boolean' ? (
                        row.beacons ? <Check className="w-6 h-6 mx-auto" /> : <X className="w-6 h-6 mx-auto" />
                      ) : (
                        row.beacons
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: Table */}
          <div className="hidden lg:block bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-100">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                  <th className="px-8 py-6 text-left text-lg font-bold">Recurso</th>
                  <th className="px-8 py-6 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xl font-black">Freelinnk</span>
                      <span className="text-xs opacity-90">Você está aqui ⭐</span>
                    </div>
                  </th>
                  <th className="px-8 py-6 text-center text-lg">Linktree</th>
                  <th className="px-8 py-6 text-center text-lg">Beacons</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={i} className={`${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-purple-50 transition-colors`}>
                    <td className="px-8 py-6 font-semibold text-gray-900">{row.feature}</td>
                    <td className="px-8 py-6 text-center">
                      {typeof row.freelinnk === 'boolean' ? (
                        row.freelinnk ? (
                          <Check className="w-7 h-7 mx-auto text-green-500" />
                        ) : (
                          <X className="w-7 h-7 mx-auto text-red-500" />
                        )
                      ) : (
                        <span className="font-bold text-green-600 text-lg">{row.freelinnk}</span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-center">
                      {typeof row.linktree === 'boolean' ? (
                        row.linktree ? (
                          <Check className="w-7 h-7 mx-auto text-gray-400" />
                        ) : (
                          <X className="w-7 h-7 mx-auto text-gray-400" />
                        )
                      ) : (
                        <span className="font-semibold text-gray-600">{row.linktree}</span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-center">
                      {typeof row.beacons === 'boolean' ? (
                        row.beacons ? (
                          <Check className="w-7 h-7 mx-auto text-gray-400" />
                        ) : (
                          <X className="w-7 h-7 mx-auto text-gray-400" />
                        )
                      ) : (
                        <span className="font-semibold text-gray-600">{row.beacons}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center mt-8 sm:mt-12">
            <div className="inline-block bg-green-50 border-2 border-green-200 rounded-2xl px-6 sm:px-8 py-4 sm:py-6">
              <div className="text-2xl sm:text-3xl font-black text-green-600 mb-2">
                Economize até <span className="text-4xl sm:text-5xl">R$ 600+</span> por ano
              </div>
              <p className="text-sm sm:text-base text-gray-600">vs. comprar ferramentas separadas</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-purple-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
              Comece <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">grátis</span> hoje mesmo
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">
              Sem cartão de crédito. Sem truques. Só resultado.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {/* Plano Pro */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-gray-200 hover:shadow-2xl transition-all"
            >
              <div className="mb-6">
                <h3 className="text-2xl sm:text-3xl font-black mb-2">Pro</h3>
                <p className="text-gray-600 mb-4">Para começar a vender com IA</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl sm:text-6xl font-black text-gray-900">R$ 34</span>
                  <span className="text-2xl">,90</span>
                  <span className="text-gray-600">/mês</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  "Links ilimitados",
                  "Analytics avançado completo",
                  "5 roteiros virais IA/dia",
                  "Sorteios básicos",
                  "Pixels de rastreamento",
                  "Sem marca d'água",
                  "Suporte por email"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">{feature}</span>
                  </li>
                ))}
              </ul>

              <button className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-all">
                Começar Grátis
              </button>
            </motion.div>

            {/* Plano Ultra */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl p-6 sm:p-8 shadow-2xl transform md:scale-105"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-black shadow-lg">
                  ⭐ MAIS POPULAR
                </span>
              </div>

              <div className="mb-6 text-white">
                <h3 className="text-2xl sm:text-3xl font-black mb-2">Ultra</h3>
                <p className="text-white/90 mb-4">Para vender profissionalmente</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl sm:text-6xl font-black">R$ 77</span>
                  <span className="text-2xl">,90</span>
                  <span className="text-white/90">/mês</span>
                </div>
                <p className="text-sm text-white/80 mt-2">Economize R$ 80/mês vs ferramentas separadas</p>
              </div>

              <ul className="space-y-4 mb-8 text-white">
                {[
                  "Tudo do Pro +",
                  "7 imagens IA/dia + aprimoramentos",
                  "FreelinnkBrain ILIMITADO",
                  "Roteiros virais ILIMITADOS",
                  "Sorteios avançados",
                  "Todos os pixels (Meta, Google, TikTok)",
                  "Analytics com IA",
                  "API para integrações",
                  "Suporte VIP WhatsApp",
                  "Gestão financeira completa"

                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">{feature}</span>
                  </li>
                ))}
              </ul>

              <button className="w-full py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-lg">
                Teste 7 Dias Grátis
              </button>
            </motion.div>
          </div>

          <div className="text-center mt-8 sm:mt-12">
            <p className="text-gray-600 flex flex-wrap items-center justify-center gap-4 text-sm sm:text-base">
              <span className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" />
                Garantia de 7 dias
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-green-500" />
                Cancele quando quiser
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Suporte em português
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* CTA Final - Super Otimizado */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-blue-700 rounded-3xl sm:rounded-[2.5rem] p-8 sm:p-12 lg:p-16 overflow-hidden">
            {/* Elementos decorativos */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />

            <div className="relative z-10 text-center space-y-6 sm:space-y-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur text-white rounded-full text-sm font-bold"
              >
                <Clock className="w-4 h-4" />
                Oferta especial por tempo limitado
              </motion.div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-white leading-tight">
                Pronto para transformar
                <br />
                seus links em vendas?
              </h2>

              <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
                Junte-se a <strong>+5.847 criadores</strong> que já estão faturando com seus seguidores usando Freelinnk
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button className="group w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 bg-white text-purple-700 rounded-2xl font-black text-lg sm:text-xl hover:bg-gray-100 transition-all shadow-2xl transform hover:scale-105">
                  <span className="flex items-center justify-center gap-2">
                    Começar Grátis Agora
                    <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  </span>
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 text-white/90 text-sm pt-4">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  100% Grátis para começar
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Setup em 30 segundos
                </span>
                <span className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Sem compromisso
                </span>
              </div>

              {/* Stats finais */}
              <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-8 border-t border-white/20">
                <div>
                  <div className="text-3xl sm:text-4xl font-black text-white mb-1">
                    <AnimatedCounter value={5847} />+
                  </div>
                  <div className="text-xs sm:text-sm text-white/80">Criadores ativos</div>
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-black text-white mb-1">
                    <AnimatedCounter value={1234} />K+
                  </div>
                  <div className="text-xs sm:text-sm text-white/80">Cliques/mês</div>
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-black text-white mb-1">4.9</div>
                  <div className="text-xs sm:text-sm text-white/80">Avaliação</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-black">Freelinnk</span>
              </div>
              <p className="text-gray-400 text-sm">
                A plataforma completa para transformar seus seguidores em clientes.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Recursos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Exemplos</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Suporte</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-white transition-colors">WhatsApp</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2025 Freelinnk. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      <AnimatePresence>
        {showVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
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
                className="absolute -top-12 right-0 text-white hover:text-gray-300 flex items-center gap-2 text-lg font-semibold"
              >
                Fechar <X className="w-6 h-6" />
              </button>
              <div className="relative pt-[56.25%] bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-white text-lg">Vídeo de demonstração aqui</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WhatsApp Floating Button */}
      <motion.a
        href="https://wa.me/5579999383543"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2 }}
        className="fixed bottom-6 right-6 w-14 h-14 sm:w-16 sm:h-16 bg-green-500 rounded-full flex items-center justify-center shadow-2xl hover:bg-green-600 transition-all z-40 hover:scale-110"
      >
        <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </motion.a>
    </div>
  );
}