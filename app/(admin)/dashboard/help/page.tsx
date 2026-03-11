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
  Key,
  CreditCard,
  UserCog,
  FileText,
  Lock,
  ArrowRight,
  ChevronDown,
  TrendingUp
} from "lucide-react";

// =================================================================
// TIPOS E DADOS (COPY ATUALIZADO PARA VENDAS E NEGÓCIOS)
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
  color?: string;
}

interface QuickAccessItem {
  icon: React.ReactNode;
  label: string;
  action: string;
}

const quickAccessData: QuickAccessItem[] = [
  { icon: <CreditCard className="w-5 h-5" />, label: "Minhas Faturas", action: "billing" },
  { icon: <FileText className="w-5 h-5" />, label: "Fazer Upgrade", action: "plan" },
  { icon: <UserCog className="w-5 h-5" />, label: "Dados da Conta", action: "account" },
  { icon: <Key className="w-5 h-5" />, label: "Alterar Senha", action: "password" },
];

const faqData: FAQItem[] = [
  {
    id: "1",
    question: "O que é o Freelinnk?",
    answer: "O Freelinnk é a plataforma definitiva para lojistas e criadores de conteúdo. Nós combinamos uma vitrine de links de alta conversão com um Hub de Anúncios nativo, CRM Financeiro e ferramentas para multiplicar seu tráfego e vendas.",
    helpful: 342,
    category: "Geral"
  },
  {
    id: "2",
    question: "O que o plano Free inclui?",
    answer: "No plano Free você tem sua vitrine de links ilimitada e personalizada para começar. Porém, dados detalhados de visitantes, origens de tráfego, CRM e acesso à nossa rede do Hub de Anúncios são recursos exclusivos dos planos Pro e Ultra.",
    helpful: 215,
    category: "Planos"
  },
  {
    id: "3",
    question: "Qual a diferença entre os planos Pro e Ultra?",
    answer: "O Pro é ideal para começar a tracionar: 2 campanhas de anúncios (1.000 views cada), Sorteios e Pixel do Facebook/Google. O Ultra é sua máquina completa: 3 campanhas simultâneas (5.000 views cada), CRM de Vendas, Calculadora de Lucros, Analytics Profundo e até 30 sub-páginas.",
    helpful: 512,
    category: "Planos"
  },
  {
    id: "4",
    question: "Como funciona a rede de anúncios (Hub de Ads)?",
    answer: "Nós criamos uma rede inteligente onde seu produto aparece em formato de card nas páginas de links de outras pessoas, segmentado por nicho. Você recebe tráfego de pessoas reais de forma automática, de acordo com as visualizações do seu plano.",
    helpful: 428,
    category: "Recursos"
  },
  {
    id: "5",
    question: "Como funciona a garantia de 7 dias?",
    answer: "Assine sem medo. Ative suas campanhas de tráfego, conecte seu Pixel e veja os cliques chegarem. Se em 7 dias você achar que a ferramenta não pagou o próprio valor em resultados, nós devolvemos 100% do seu dinheiro. Sem burocracia.",
    helpful: 189,
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
    color: "from-blue-600 to-indigo-600"
  },
  {
    id: "whatsapp",
    title: "WhatsApp VIP",
    description: "Atendimento direto e focado no seu negócio",
    icon: <Phone className="w-5 h-5 text-white" />,
    action: "whatsapp",
    available: true,
    responseTime: "Resposta em minutos",
    badge: "Para Membros Premium",
    color: "from-emerald-500 to-teal-500"
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
      if (isHelpful) toast.success("Que ótimo! O foco é sempre ajudar a escalar seu negócio.");
      else toast.info("Obrigado pelo feedback, vamos melhorar essa documentação!");
    }
  };

  return (
    <motion.div
      initial={false}
      className={cn(
        "group border rounded-xl overflow-hidden transition-all duration-300 bg-white dark:bg-slate-900",
        isOpen ? "border-indigo-200 dark:border-indigo-800 shadow-md" : "border-gray-200 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-slate-700"
      )}
    >
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center justify-between text-left focus:outline-none"
      >
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
            isOpen ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" : "bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-slate-700"
          )}>
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <span className={cn(
              "font-semibold text-sm sm:text-base block transition-colors",
              isOpen ? "text-indigo-900 dark:text-indigo-100" : "text-gray-900 dark:text-gray-100"
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
                <span className="text-xs text-gray-400 font-medium">Essa resposta ajudou?</span>
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
    const message = encodeURIComponent("Olá, sou lojista/usuário do Freelinnk e preciso de suporte com minha conta!");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
    toast.success("Abrindo WhatsApp da Equipe Freelinnk...");
  } else {
    // Ações de "Acesso Rápido"
    toast.success("Acessando área de negócios...", {
      description: "Redirecionando pelo painel."
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-100 selection:text-indigo-900">

      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-indigo-50/80 to-transparent dark:from-indigo-900/10 dark:to-transparent opacity-70 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-8 sm:py-16 relative z-10 max-w-5xl">

        {/* --- HERO SECTION --- */}
        <section className="text-center space-y-6 mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-full mb-6 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide">
                Suporte Especializado Online
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4 text-slate-900 dark:text-white">
              Central de Negócios
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Tire dúvidas, gerencie sua assinatura e entenda como extrair o máximo de vendas da sua vitrine.
            </p>
          </motion.div>

          {/* Search Bar - "Command Center Style" */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="max-w-xl mx-auto relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl opacity-10 group-focus-within:opacity-30 blur transition-opacity duration-300" />
            <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-xl flex items-center p-2 border border-slate-200 dark:border-slate-800 group-focus-within:border-indigo-500 transition-colors">
              <div className="pl-3 pr-2 text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Busque por 'anúncios', 'planos', 'faturas'..."
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
          <div className="grid grid-cols-3 gap-2 sm:gap-8 max-w-2xl mx-auto pt-6 border-t border-slate-200 dark:border-slate-800 mt-8">
             <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 text-yellow-500 mb-1">
                   <Star className="w-4 h-4 fill-current" />
                   <span className="font-bold text-lg text-slate-800 dark:text-slate-200">4.9/5</span>
                </div>
                <span className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wide">Avaliação</span>
             </div>
             <div className="flex flex-col items-center border-l border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1 text-emerald-500 mb-1">
                   <Clock className="w-4 h-4" />
                   <span className="font-bold text-lg text-slate-800 dark:text-slate-200">&lt; 2h</span>
                </div>
                <span className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wide">Tempo Médio</span>
             </div>
             <div className="flex flex-col items-center border-l border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1 text-blue-500 mb-1">
                   <TrendingUp className="w-4 h-4" />
                   <span className="font-bold text-lg text-slate-800 dark:text-slate-200">100%</span>
                </div>
                <span className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wide">Foco em ROI</span>
             </div>
          </div>
        </section>

        {/* --- ACESSO RÁPIDO (Quick Access) --- */}
        <section className="mb-12 sm:mb-16">
           <div className="flex items-center gap-2 mb-4 px-1">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Ações da Conta</h3>
           </div>
           <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {quickAccessData.map((item, idx) => (
                 <motion.button
                   key={idx}
                   whileHover={{ y: -2 }}
                   whileTap={{ scale: 0.98 }}
                   onClick={() => handleAction(item.action)}
                   className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg transition-all group"
                 >
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 group-hover:text-indigo-600 transition-colors mb-2">
                       {item.icon}
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-700 dark:group-hover:text-indigo-400">
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
               <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Perguntas Frequentes</h2>
               <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 font-medium">
                 Tudo que você precisa saber para operar nossa máquina de vendas.
               </p>
               <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-start gap-3">
                     <BookOpen className="w-5 h-5 text-indigo-600 mt-0.5" />
                     <div>
                        <p className="font-bold text-sm text-slate-900 dark:text-slate-100">Guias de Tráfego</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-3">
                           Aprenda estratégias avançadas de como converter mais cliques em vendas reais.
                        </p>
                        <Button size="sm" variant="outline" className="w-full font-bold border-indigo-200 dark:border-slate-700 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50">
                           Acessar Tutoriais
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
               <div className="text-center py-12 px-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900">
                 <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                 <p className="font-bold text-slate-900 dark:text-white">Nenhum resultado encontrado</p>
                 <p className="text-sm text-slate-500 font-medium">Tente buscar termos como anúncios ou planos.</p>
               </div>
             )}
          </div>
        </section>

        {/* --- CONTACT & TRUST --- */}
        <section className="mb-16">
           <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Fale com o Suporte</h2>
              <p className="text-slate-500 mt-2 font-medium">A nossa equipe técnica está a postos para garantir o seu resultado.</p>
           </div>

           <div className="grid md:grid-cols-2 gap-4">
              {contactOptions.map((option) => (
                 <motion.div
                   key={option.id}
                   whileHover={{ y: -4 }}
                   className="relative group"
                 >
                    <Card className="h-full border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-900/50 hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-900 overflow-hidden">
                       <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity bg-gradient-to-r", option.color)} />
                       <CardHeader>
                          <div className="flex items-center justify-between mb-2">
                             <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br shadow-sm", option.color)}>
                                {option.icon}
                             </div>
                             {option.badge && (
                                <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-0 font-bold px-2 py-0.5">
                                   {option.badge}
                                </Badge>
                             )}
                          </div>
                          <CardTitle className="text-lg font-black text-slate-800 dark:text-slate-100">{option.title}</CardTitle>
                       </CardHeader>
                       <CardContent className="space-y-4">
                          <div>
                             <p className="text-slate-500 text-sm mb-2 font-medium">{option.description}</p>
                             <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                <Clock className="w-3.5 h-3.5" />
                                {option.responseTime}
                             </div>
                          </div>
                          <Button
                             onClick={() => handleAction(option.action, option.description)}
                             className={cn("w-full font-bold shadow-md", option.action === 'whatsapp' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white')}
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
           <div className="mt-8 flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-400 font-medium">
              <Lock className="w-3.5 h-3.5" />
              <span>Plataforma 100% segura. Seus dados e métricas são criptografados.</span>
           </div>
        </section>

        {/* --- ULTIMATE CTA --- */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden p-8 sm:p-12 text-center shadow-2xl"
        >
           <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-black" />
           <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 mix-blend-overlay" />
           <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

           <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-md rounded-2xl mb-2 border border-white/10">
                 <HeadphonesIcon className="w-8 h-8 text-indigo-400" />
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white max-w-2xl mx-auto">
                 Dificuldades para escalar?
              </h2>
              <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto font-medium">
                 Nossa equipe técnica pode te ajudar a configurar seu Pixel, ativar o Hub de Anúncios e entender o Analytics.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                 <Button
                    size="lg"
                    className="w-full sm:w-auto bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 font-bold h-14 px-8 text-base"
                    onClick={() => handleAction("whatsapp")}
                 >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Chamar Suporte Premium
                 </Button>
              </div>
              <p className="text-slate-500 text-xs mt-4 font-bold uppercase tracking-wider">
                 Aviso: Prioridade para Lojistas Pro / Ultra
              </p>
           </div>
        </motion.div>

      </div>
    </div>
  );
}