"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Search,
  BookOpen,
  HeadphonesIcon,
  Shield,
  Key,
  CreditCard,
  UserCog,
  FileText,
  Lock,
  ArrowRight,
  ChevronDown
} from "lucide-react";

// =================================================================
// TIPOS E DADOS
// =================================================================

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  helpful?: number;
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
  color?: string; // Classe de cor para gradientes
}

interface QuickAccessItem {
  icon: React.ReactNode;
  label: string;
  action: string;
}

const quickAccessData: QuickAccessItem[] = [
  { icon: <Key className="w-5 h-5" />, label: "Alterar Senha", action: "password" },
  { icon: <CreditCard className="w-5 h-5" />, label: "Minhas Faturas", action: "billing" },
  { icon: <UserCog className="w-5 h-5" />, label: "Dados da Conta", action: "account" },
  { icon: <FileText className="w-5 h-5" />, label: "Mudar Plano", action: "plan" },
];

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

const contactOptions: ContactOption[] = [
  {
    id: "email",
    title: "Email de Suporte",
    description: "Lucasholt2021@gmail.com",
    icon: <Mail className="w-5 h-5 text-white" />,
    action: "email",
    available: true,
    responseTime: "Resposta em até 24h",
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: "whatsapp",
    title: "WhatsApp VIP",
    description: "Suporte prioritário via WhatsApp",
    icon: <Phone className="w-5 h-5 text-white" />,
    action: "whatsapp",
    available: true,
    responseTime: "Resposta em minutos",
    badge: "Recomendado",
    color: "from-green-500 to-emerald-500"
  }
];

// =================================================================
// SUB-COMPONENTES
// =================================================================

function FAQItemComponent({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  const [helpful, setHelpful] = useState<boolean | null>(null);

  const handleHelpful = (isHelpful: boolean) => {
    if (helpful === null) {
      setHelpful(isHelpful);
      if (isHelpful) toast.success("Obrigado pelo feedback!");
      else toast.info("Vamos melhorar esta resposta!");
    }
  };

  return (
    <motion.div
      initial={false}
      className={cn(
        "group border rounded-xl overflow-hidden transition-all duration-300 bg-white dark:bg-slate-900",
        isOpen ? "border-purple-200 dark:border-purple-800 shadow-md" : "border-gray-200 dark:border-slate-800 hover:border-purple-100 dark:hover:border-slate-700"
      )}
    >
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center justify-between text-left focus:outline-none"
      >
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
            isOpen ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" : "bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-400 group-hover:bg-purple-50 dark:group-hover:bg-slate-700"
          )}>
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <span className={cn(
              "font-semibold text-sm sm:text-base block transition-colors",
              isOpen ? "text-purple-900 dark:text-purple-100" : "text-gray-900 dark:text-gray-100"
            )}>
              {item.question}
            </span>
            {item.category && (
              <span className="text-xs text-gray-500 dark:text-slate-500 font-medium mt-0.5 block">
                {item.category}
              </span>
            )}
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-gray-400 ml-4 flex-shrink-0"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="border-t border-gray-100 dark:border-slate-800 px-5 py-5 sm:pl-[4.5rem]">
              <p className="text-sm sm:text-base text-gray-600 dark:text-slate-300 leading-relaxed">
                {item.answer}
              </p>

              <div className="mt-4 pt-4 border-t border-dashed border-gray-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium">Isso foi útil?</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleHelpful(true)}
                    disabled={helpful !== null}
                    className={cn(
                      "p-1.5 rounded-md transition-colors",
                      helpful === true ? "bg-green-100 text-green-700" : "hover:bg-gray-100 text-gray-400 hover:text-green-600"
                    )}
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleHelpful(false)}
                    disabled={helpful !== null}
                    className={cn(
                      "p-1.5 rounded-md transition-colors",
                      helpful === false ? "bg-red-100 text-red-700" : "hover:bg-gray-100 text-gray-400 hover:text-red-600"
                    )}
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Função para abrir Email ou WhatsApp (Simulação de ação)
const handleAction = (type: string, payload?: string) => {
  if (type === "email" && payload) {
    window.location.href = `mailto:${payload}`;
    toast.success("Abrindo seu cliente de email...");
  } else if (type === "whatsapp") {
    const phoneNumber = "+5579999383543";
    const message = encodeURIComponent("Olá, preciso de suporte no Freelinnk!");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
    toast.success("Abrindo WhatsApp...");
  } else {
    // Ações de "Acesso Rápido"
    toast.success("Redirecionando para o painel...", {
      description: "Funcionalidade demonstrativa ativa."
    });
  }
};

// =================================================================
// COMPONENTE PRINCIPAL
// =================================================================

export default function HelpCenter() {
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFAQs = faqData.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-purple-100 selection:text-purple-900">

      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-purple-50/80 to-transparent dark:from-purple-900/10 dark:to-transparent opacity-70 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-8 sm:py-16 relative z-10 max-w-5xl">

        {/* --- HERO SECTION --- */}
        <section className="text-center space-y-6 mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-full mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide">
                Suporte Online Agora
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4 text-slate-900 dark:text-white">
              Central de Ajuda
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Tire suas dúvidas, gerencie sua conta e resolva problemas em segundos.
            </p>
          </motion.div>

          {/* Search Bar - "Command Center Style" */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="max-w-xl mx-auto relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl opacity-20 group-focus-within:opacity-40 blur transition-opacity duration-300" />
            <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-xl flex items-center p-2 border border-slate-200 dark:border-slate-800 group-focus-within:border-purple-500 transition-colors">
              <div className="pl-3 pr-2 text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Busque por 'faturas', 'senha', 'planos'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 text-base py-2 placeholder:text-slate-400 text-slate-900 dark:text-white"
              />
              <div className="hidden sm:flex pr-2">
                <kbd className="hidden sm:inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-500 font-sans">
                  ESC
                </kbd>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-8 max-w-2xl mx-auto pt-6 border-t border-slate-100 dark:border-slate-800 mt-8">
             <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 text-yellow-500 mb-1">
                   <Star className="w-4 h-4 fill-current" />
                   <span className="font-bold text-lg">4.9/5</span>
                </div>
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Avaliação</span>
             </div>
             <div className="flex flex-col items-center border-l border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1 text-green-500 mb-1">
                   <Clock className="w-4 h-4" />
                   <span className="font-bold text-lg">&lt; 2h</span>
                </div>
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Tempo Médio</span>
             </div>
             <div className="flex flex-col items-center border-l border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1 text-purple-500 mb-1">
                   <Shield className="w-4 h-4" />
                   <span className="font-bold text-lg">100%</span>
                </div>
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Seguro</span>
             </div>
          </div>
        </section>

        {/* --- ACESSO RÁPIDO (Quick Access) --- */}
        <section className="mb-12 sm:mb-16">
           <div className="flex items-center gap-2 mb-4 px-1">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Acesso Rápido</h3>
           </div>
           <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {quickAccessData.map((item, idx) => (
                 <motion.button
                   key={idx}
                   whileHover={{ y: -2 }}
                   whileTap={{ scale: 0.98 }}
                   onClick={() => handleAction(item.action)}
                   className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-lg transition-all group"
                 >
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20 group-hover:text-purple-600 transition-colors mb-2">
                       {item.icon}
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-purple-700 dark:group-hover:text-purple-300">
                       {item.label}
                    </span>
                 </motion.button>
              ))}
           </div>
        </section>

        {/* --- FAQ SECTION --- */}
        <section className="grid lg:grid-cols-3 gap-8 lg:gap-12 mb-16">
          <div className="lg:col-span-1 space-y-4">
             <div className="sticky top-24">
               <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Perguntas Frequentes</h2>
               <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                 Encontre respostas rápidas para as dúvidas mais comuns da nossa comunidade.
               </p>
               <div className="p-4 bg-purple-50 dark:bg-slate-900 rounded-xl border border-purple-100 dark:border-slate-800">
                  <div className="flex items-start gap-3">
                     <BookOpen className="w-5 h-5 text-purple-600 mt-0.5" />
                     <div>
                        <p className="font-semibold text-sm text-purple-900 dark:text-purple-100">Documentação</p>
                        <p className="text-xs text-purple-700 dark:text-slate-400 mt-1 mb-3">
                           Prefere ler tutoriais detalhados? Acesse nossa base de conhecimento completa.
                        </p>
                        <Button size="sm" variant="outline" className="w-full bg-white dark:bg-slate-800 border-purple-200 dark:border-slate-700 text-purple-700 dark:text-slate-200 hover:bg-purple-50">
                           Ver Tutoriais
                        </Button>
                     </div>
                  </div>
               </div>
             </div>
          </div>

          <div className="lg:col-span-2 space-y-3">
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
               <div className="text-center py-12 px-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                 <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                 <p className="font-medium text-slate-900 dark:text-white">Nenhum resultado encontrado</p>
                 <p className="text-sm text-slate-500">Tente buscar por termos mais genéricos.</p>
               </div>
             )}
          </div>
        </section>

        {/* --- CONTACT & TRUST --- */}
        <section className="mb-16">
           <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Precisa de mais ajuda?</h2>
              <p className="text-slate-500 mt-2">Nossa equipe de especialistas está pronta para atender você.</p>
           </div>

           <div className="grid md:grid-cols-2 gap-4">
              {contactOptions.map((option) => (
                 <motion.div
                   key={option.id}
                   whileHover={{ y: -4 }}
                   className="relative group"
                 >
                    <Card className="h-full border-2 border-slate-100 dark:border-slate-800 hover:border-purple-200 dark:hover:border-purple-900/50 hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-900 overflow-hidden">
                       <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity bg-gradient-to-r", option.color)} />
                       <CardHeader>
                          <div className="flex items-center justify-between mb-2">
                             <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br shadow-sm", option.color)}>
                                {option.icon}
                             </div>
                             {option.badge && (
                                <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-0">
                                   {option.badge}
                                </Badge>
                             )}
                          </div>
                          <CardTitle className="text-lg">{option.title}</CardTitle>
                       </CardHeader>
                       <CardContent className="space-y-4">
                          <div>
                             <p className="text-slate-500 text-sm mb-1">{option.description}</p>
                             <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400">
                                <Clock className="w-3.5 h-3.5" />
                                {option.responseTime}
                             </div>
                          </div>
                          <Button
                             onClick={() => handleAction(option.action, option.description)}
                             className={cn("w-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200")}
                          >
                             {option.action === 'email' ? 'Enviar Email' : 'Iniciar Conversa'}
                             <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                       </CardContent>
                    </Card>
                 </motion.div>
              ))}
           </div>

           {/* Security Badge */}
           <div className="mt-8 flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-400">
              <Lock className="w-3.5 h-3.5" />
              <span>Seus dados estão protegidos por criptografia de ponta a ponta.</span>
           </div>
        </section>

        {/* --- ULTIMATE CTA --- */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden p-8 sm:p-12 text-center"
        >
           <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600" />
           <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
           <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

           <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-md rounded-2xl mb-2">
                 <HeadphonesIcon className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-2xl sm:text-4xl font-bold text-white max-w-2xl mx-auto">
                 Não encontrou o que precisava?
              </h2>
              <p className="text-purple-100 text-lg max-w-xl mx-auto">
                 Nossa equipe de suporte premium está disponível agora para resolver seu problema em tempo real.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                 <Button
                    size="lg"
                    className="w-full sm:w-auto bg-white text-purple-600 hover:bg-purple-50 hover:scale-105 transition-all shadow-xl font-bold h-14 px-8 text-base"
                    onClick={() => handleAction("whatsapp")}
                 >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Falar com Especialista Agora
                 </Button>
              </div>
              <p className="text-white/60 text-xs mt-4">
                 Tempo médio de espera: <strong>Menos de 2 minutos</strong>
              </p>
           </div>
        </motion.div>

      </div>
    </div>
  );
}