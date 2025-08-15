"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Mail, Phone, HelpCircle, ThumbsUp, ThumbsDown } from "lucide-react";

// Tipos
interface FAQItem {
  id: string;
  question: string;
  answer: string;
  helpful?: number;
  icon?: React.ReactNode;
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
}

// Dados das FAQs
const faqData: FAQItem[] = [
  {
    id: "1",
    question: "O que é o Freelink?",
    answer: "O Freelink é a plataforma completa para criadores de conteúdo que combina link na bio, ferramentas de IA para crescimento e recursos de monetização.",
    icon: <HelpCircle className="w-4 h-4" />
  },
  {
    id: "2",
    question: "Como funciona o período de teste gratuito?",
    answer: "Você pode usar o plano Free para sempre! Ele inclui links ilimitados, URL personalizada e 1 análise mensal com o Mentor.IA.",
    icon: <HelpCircle className="w-4 h-4" />
  },
  {
    id: "3",
    question: "Qual a diferença entre os planos Free, Pro e Ultra?",
    answer: "Free: Links ilimitados e 1 análise IA/mês. Pro: Mentor.IA e FreelinkBrain ilimitados, analytics avançados. Ultra: Tudo do Pro + calendário automático, sorteios, rastreamento completo e suporte VIP.",
    icon: <HelpCircle className="w-4 h-4" />
  },
  {
    id: "4",
    question: "Posso cancelar minha assinatura a qualquer momento?",
    answer: "Sim! Você pode cancelar quando quiser direto no painel. Seu acesso aos recursos premium continua até o final do período pago.",
    icon: <HelpCircle className="w-4 h-4" />
  },
  {
    id: "5",
    question: "Como funciona a garantia de 7 dias?",
    answer: "Teste qualquer plano premium por 7 dias. Se não ficar satisfeito, solicite o reembolso total dentro desse período.",
    icon: <HelpCircle className="w-4 h-4" />
  }
];

// Opções de Contato
const contactOptions: ContactOption[] = [
  {
    id: "email",
    title: "Email de Suporte",
    description: "Lucasholt2021@gmail.com",
    icon: <Mail className="w-6 h-6" />,
    action: "email",
    available: true,
    responseTime: "Resposta em até 24h"
  },
  {
    id: "whatsapp",
    title: "WhatsApp VIP",
    description: "Suporte prioritário via WhatsApp",
    icon: <Phone className="w-6 h-6" />,
    action: "whatsapp",
    available: true,
    responseTime: "Resposta em minutos",
    badge: "Exclusivo Ultra"
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
      className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
    >
      <button
        onClick={onToggle}
        className="w-full px-4 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-3 text-left">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            {item.icon || <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
          </div>
          <span className="font-medium">{item.question}</span>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-slate-200 dark:border-slate-700"
          >
            <div className="p-4 space-y-4">
              <p className="text-slate-600 dark:text-slate-400">{item.answer}</p>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Esta resposta foi útil?</span>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant={helpful === true ? "default" : "ghost"}
                      onClick={() => handleHelpful(true)}
                      disabled={helpful !== null}
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={helpful === false ? "default" : "ghost"}
                      onClick={() => handleHelpful(false)}
                      disabled={helpful !== null}
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {helpfulCount > 0 && (
                  <span className="text-xs text-slate-500">
                    {helpfulCount} pessoa{helpfulCount > 1 ? "s" : ""} acharam útil
                  </span>
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
    const phoneNumber = "+5579999383543"; // Número oficial do WhatsApp
    const message = encodeURIComponent("Olá, preciso de suporte no Freelink!");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
    toast.success("Abrindo WhatsApp...");
  }
};

export default function HelpCenter() {
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);

  return (
    <div className="container mx-auto py-10 space-y-10">
      {/* Título */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <HelpCircle className="w-8 h-8 text-blue-500" /> Central de Ajuda
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Encontre respostas rápidas ou entre em contato conosco pelo Email ou WhatsApp.
        </p>
      </div>

      {/* Seção FAQ */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Perguntas Frequentes</h2>
        <div className="space-y-3">
          {faqData.map((item) => (
            <FAQItemComponent
              key={item.id}
              item={item}
              isOpen={openFAQ === item.id}
              onToggle={() => setOpenFAQ(openFAQ === item.id ? null : item.id)}
            />
          ))}
        </div>
      </section>

      {/* Seção Contato */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Fale Conosco</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {contactOptions.map((option) => (
            <Card key={option.id} className={cn(!option.available && "opacity-50")}>
              <CardHeader className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  {option.icon}
                </div>
                <div className="flex-1">
                  <CardTitle>{option.title}</CardTitle>
                  {option.badge && (
                    <Badge variant="secondary" className="ml-2">{option.badge}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400">{option.description}</p>
                {option.responseTime && (
                  <p className="mt-2 text-xs text-slate-500">{option.responseTime}</p>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  disabled={!option.available}
                  variant="default"
                  className="w-full"
                  onClick={() => handleContactAction(option)}
                >
                  {option.action === "email" && "Enviar Email"}
                  {option.action === "whatsapp" && "Abrir WhatsApp"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
