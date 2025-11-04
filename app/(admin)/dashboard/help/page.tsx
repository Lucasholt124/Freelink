"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Mail,
  Phone,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Clock,
  Sparkles,

  Star,
  Users,

  Search,
  BookOpen,
  HeadphonesIcon,
  Shield,

} from "lucide-react";

// Tipos
interface FAQItem {
  id: string;
  question: string;
  answer: string;
  helpful?: number;
  icon?: React.ReactNode;
  category?: string;
}

interface ContactOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: string;
  available: boolean;
  responseTime?: string;
  badge?: string;
  color?: string;
}

// Dados das FAQs
const faqData: FAQItem[] = [
  {
    id: "1",
    question: "O que é o Freelinnk?",
    answer: "O Freelinnk é a plataforma completa para criadores de conteúdo que combina link na bio, ferramentas de IA para crescimento e recursos de monetização.",
    helpful: 127,
    category: "Geral"
  },
  {
    id: "2",
    question: "Como funciona o período de teste gratuito?",
    answer: "Você pode usar o plano Free para sempre! Ele inclui links ilimitados, URL personalizada e 1 análise mensal com o Mentor.IA.",
    helpful: 89,
    category: "Planos"
  },
  {
    id: "3",
    question: "Qual a diferença entre os planos Free, Pro e Ultra?",
    answer: "Free: Links ilimitados e 1 análise IA/mês. Pro: Mentor.IA e FreelinnkBrain ilimitados, analytics avançados. Ultra: Tudo do Pro + calendário automático, sorteios, rastreamento completo e suporte VIP.",
    helpful: 156,
    category: "Planos"
  },
  {
    id: "4",
    question: "Posso cancelar minha assinatura a qualquer momento?",
    answer: "Sim! Você pode cancelar quando quiser direto no painel. Seu acesso aos recursos premium continua até o final do período pago.",
    helpful: 203,
    category: "Assinatura"
  },
  {
    id: "5",
    question: "Como funciona a garantia de 7 dias?",
    answer: "Teste qualquer plano premium por 7 dias. Se não ficar satisfeito, solicite o reembolso total dentro desse período.",
    helpful: 91,
    category: "Garantias"
  }
];

// Opções de Contato
const contactOptions: ContactOption[] = [
  {
    id: "email",
    title: "Email de Suporte",
    description: "Lucasholt2021@gmail.com",
    icon: <Mail className="w-5 h-5" />,
    action: "email",
    available: true,
    responseTime: "Resposta em até 24h",
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: "whatsapp",
    title: "WhatsApp VIP",
    description: "Suporte prioritário via WhatsApp",
    icon: <Phone className="w-5 h-5" />,
    action: "whatsapp",
    available: true,
    responseTime: "Resposta em minutos",
    badge: "Exclusivo Ultra",
    color: "from-green-500 to-emerald-500"
  }
];

// Componente de FAQ Item
function FAQItemComponent({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [helpfulCount, setHelpfulCount] = useState(item.helpful || 0);

  const handleHelpful = (isHelpful: boolean) => {
    if (helpful === null) {
      setHelpful(isHelpful);
      if (isHelpful) {
        setHelpfulCount(prev => prev + 1);
        toast.success("Obrigado pelo feedback!");
      } else {
        toast.info("Vamos melhorar esta resposta!");
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group border border-gray-200 hover:border-purple-200 dark:border-slate-700 dark:hover:border-purple-700 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg bg-white dark:bg-slate-900"
    >
      <button
        onClick={onToggle}
        className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-blue-50/50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20 transition-all duration-300"
      >
        <div className="flex items-center gap-2 sm:gap-3 text-left flex-1 min-w-0">
          <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg group-hover:scale-110 transition-transform">
            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white line-clamp-2">{item.question}</span>
            {item.category && (
              <Badge variant="secondary" className="mt-1 text-xs hidden sm:inline-flex">
                {item.category}
              </Badge>
            )}
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex-shrink-0 ml-2"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="border-t border-gray-100 dark:border-slate-700"
          >
            <div className="p-4 sm:p-6 space-y-4 bg-gradient-to-br from-gray-50/50 to-purple-50/30 dark:from-slate-800/50 dark:to-purple-900/10">
              <p className="text-sm sm:text-base text-gray-700 dark:text-slate-300 leading-relaxed">{item.answer}</p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">Esta resposta foi útil?</span>
                  <div className="flex gap-1.5">
                    <Button
                      size="sm"
                      variant={helpful === true ? "default" : "outline"}
                      className={cn(
                        "h-8 px-3",
                        helpful === true && "bg-green-500 hover:bg-green-600"
                      )}
                      onClick={() => handleHelpful(true)}
                      disabled={helpful !== null}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant={helpful === false ? "default" : "outline"}
                      className={cn(
                        "h-8 px-3",
                        helpful === false && "bg-red-500 hover:bg-red-600"
                      )}
                      onClick={() => handleHelpful(false)}
                      disabled={helpful !== null}
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {helpfulCount > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>{helpfulCount} pessoas acharam útil</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Função para abrir Email ou WhatsApp
const handleContactAction = (option: typeof contactOptions[0]) => {
  if (option.action === "email") {
    window.location.href = `mailto:${option.description}`;
    toast.success("Abrindo seu cliente de email...");
  } else if (option.action === "whatsapp") {
    const phoneNumber = "+5579999383543";
    const message = encodeURIComponent("Olá, preciso de suporte no Freelinnk!");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
    toast.success("Abrindo WhatsApp...");
  }
};

export default function HelpCenter() {
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFAQs = faqData.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/30 dark:from-slate-900 dark:via-purple-900/10 dark:to-blue-900/10">
      <div className="container mx-auto px-4 py-6 sm:py-10 space-y-8 sm:space-y-12 max-w-7xl">

        {/* Hero Section */}
        <div className="relative text-center space-y-4 sm:space-y-6 py-6 sm:py-10">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-blue-400/10 rounded-3xl blur-3xl" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 border border-purple-200 dark:border-purple-700 rounded-full mb-4 sm:mb-6">
              <HeadphonesIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400 animate-pulse" />
              <span className="text-xs sm:text-sm font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                SUPORTE PREMIUM
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4">
              <span className="block text-gray-900 dark:text-white mb-2">Como podemos</span>
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  ajudar você?
                </span>
                <Sparkles className="absolute -top-2 sm:-top-3 -right-2 sm:-right-3 w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 animate-sparkle" />
              </span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed px-4">
              <span className="font-semibold text-gray-900 dark:text-white">+5.000 criadores</span> já encontraram respostas rápidas aqui
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl mx-auto relative"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por perguntas, respostas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all shadow-lg"
            />
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-3xl mx-auto pt-4 sm:pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
                <p className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">4.9</p>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">Avaliação</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                <p className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">2h</p>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">Resposta Média</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                <p className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">99%</p>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">Satisfação</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="space-y-4 sm:space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-xl">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Perguntas Frequentes
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
                {filteredFAQs.length} {filteredFAQs.length === 1 ? 'pergunta encontrada' : 'perguntas encontradas'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((item) => (
                <FAQItemComponent
                  key={item.id}
                  item={item}
                  isOpen={openFAQ === item.id}
                  onToggle={() => setOpenFAQ(openFAQ === item.id ? null : item.id)}
                />
              ))
            ) : (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700">
                <Search className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-slate-400">Nenhuma pergunta encontrada</p>
              </div>
            )}
          </div>
        </section>

        {/* Contact Section */}
        <section className="space-y-4 sm:space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl">
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Fale Conosco
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
                Escolha o melhor canal para você
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            {contactOptions.map((option) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={cn(
                  "group relative overflow-hidden border-2 transition-all duration-300",
                  !option.available && "opacity-50",
                  "hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-2xl"
                )}>
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity",
                    option.color
                  )} />

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2.5 sm:p-3 rounded-xl bg-gradient-to-br text-white",
                          option.color
                        )}>
                          {option.icon}
                        </div>
                        <div>
                          <CardTitle className="text-base sm:text-lg">{option.title}</CardTitle>
                          {option.badge && (
                            <Badge className="mt-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                              {option.badge}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pb-3">
                    <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">{option.description}</p>
                    {option.responseTime && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{option.responseTime}</span>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter>
                    <Button
                      disabled={!option.available}
                      className={cn(
                        "w-full group-hover:scale-105 transition-transform bg-gradient-to-r",
                        option.color,
                        "hover:shadow-lg"
                      )}
                      onClick={() => handleContactAction(option)}
                    >
                      {option.action === "email" && (
                        <>
                          <Mail className="w-4 h-4 mr-2" />
                          Enviar Email
                        </>
                      )}
                      {option.action === "whatsapp" && (
                        <>
                          <Phone className="w-4 h-4 mr-2" />
                          Abrir WhatsApp
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 sm:p-8 text-center text-white relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="relative">
            <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-xl sm:text-2xl font-bold mb-2">Ainda tem dúvidas?</h3>
            <p className="text-sm sm:text-base text-white/90 mb-4 sm:mb-6 max-w-2xl mx-auto">
              Nossa equipe está pronta para ajudar você a aproveitar ao máximo o Freelinnk
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-purple-600 hover:bg-gray-100"
                onClick={() => handleContactAction(contactOptions[0])}
              >
                <Mail className="w-4 h-4 mr-2" />
                Enviar Email
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                onClick={() => handleContactAction(contactOptions[1])}
              >
                <Phone className="w-4 h-4 mr-2" />
                WhatsApp VIP
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}