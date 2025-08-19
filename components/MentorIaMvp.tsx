"use client";
import { useEffect, useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  RefreshCw, Sparkles, Copy, AlertCircle,
  Calendar, Target, Lightbulb, Trophy,
  Award, Zap, ArrowRight, CheckCircle, Star,
  TrendingUp, Download, Heart, Share2,
  BrainCircuit
} from "lucide-react";
// ReactMarkdown e MentorIaForm permanecem para a página inicial/formulário
// ReactMarkdown, GridIcon não são mais necessários para as tabs removidas, mas o ReactMarkdown pode ser usado para a descrição da estratégia no futuro se for mantida fora das tabs
import MentorIaForm, { FormData } from "./MentorIaForm";
import CalendarView, { PlanItem } from "./CalendarView";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import confetti from 'canvas-confetti';
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Animação de confete quando o plano é gerado
const triggerSuccessConfetti = () => {
  const duration = 3 * 1000;
  const end = Date.now() + duration;

  const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981'];

  (function confettiFrame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors
    });

    if (Date.now() < end) {
      requestAnimationFrame(confettiFrame);
    }
  })();
};

// Componente de loading com animação profissional
const MentorLoadingState = () => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Inicializando IA...");
  const [quote, setQuote] = useState("Grande estratégia é quando você antecipa o que vai acontecer, não quando você reage ao que já aconteceu.");
  const [quoteAuthor, setQuoteAuthor] = useState("Sun Tzu, A Arte da Guerra");

  const quotes = [
    { text: "Grande estratégia é quando você antecipa o que vai acontecer, não quando você reage ao que já aconteceu.", author: "Sun Tzu, A Arte da Guerra" },
    { text: "O conteúdo é o rei, mas o engajamento é a rainha, e ela governa a casa.", author: "Mari Smith" },
    { text: "Não construa links. Construa relacionamentos.", author: "Rand Fishkin" },
    { text: "Marketing é contar histórias tão bem que as pessoas vivenciam o valor do que você oferece.", author: "Seth Godin" },
    { text: "O melhor marketing não parece marketing.", author: "Tom Fishburne" }
  ];

  useEffect(() => {
    const texts = [
      "Analisando perfil...",
      "Mapeando público-alvo...",
      "Pesquisando tendências de mercado...",
      "Calibrando estratégia...",
      "Otimizando plano de conteúdo...",
      "Gerando calendário de posts...",
      "Finalizando..."
    ];

    // Mudar citação a cada 5 segundos
    const quoteInterval = setInterval(() => {
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      setQuote(randomQuote.text);
      setQuoteAuthor(randomQuote.author);
    }, 5000);

    let interval: NodeJS.Timeout;

    if (progress < 100) {
      interval = setInterval(() => {
        setProgress(prev => {
          const increment = Math.floor(Math.random() * 5) + 1;
          const newProgress = Math.min(prev + increment, 100);

          // Atualizar texto baseado no progresso
          const textIndex = Math.floor((newProgress / 100) * texts.length);
          if (textIndex < texts.length) {
            setStatusText(texts[textIndex]);
          }

          return newProgress;
        });
      }, 300);
    }

    return () => {
      clearInterval(interval);
      clearInterval(quoteInterval);
    };
  }, [progress]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center text-center p-8 min-h-[60vh] bg-gradient-to-b from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950 rounded-2xl border border-blue-100 dark:border-blue-900 shadow-xl"
    >
      <div className="relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.05, 1]
            }}
            transition={{
              rotate: { duration: 10, ease: "linear", repeat: Infinity },
              scale: { duration: 2, repeat: Infinity }
            }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 opacity-20 blur-xl"
          />
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, ease: "linear", repeat: Infinity }}
          className="relative z-10"
        >
          <BrainCircuit className="w-20 h-20 text-blue-500" />
        </motion.div>
      </div>

      <motion.h2
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-bold mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text"
      >
        Athena está trabalhando
      </motion.h2>

      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-3 text-muted-foreground max-w-md text-lg flex items-center justify-center gap-2"
      >
        <span className="inline-block w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
        {statusText}
      </motion.p>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="w-full max-w-md mt-8"
      >
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-muted-foreground">Executando IA avançada</span>
          <p className="text-sm text-muted-foreground font-semibold">{progress}%</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="mt-8 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg max-w-md shadow-inner"
      >
        <p className="text-sm italic text-muted-foreground">
          {quote}
        </p>
        <p className="text-sm font-medium mt-2 text-right">— {quoteAuthor}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-6 flex gap-2"
      >
        {Array(3).fill(0).map((_, i) => (
          <span
            key={i}
            className="inline-block w-2 h-2 rounded-full bg-blue-400 dark:bg-blue-600 opacity-70"
            style={{
              animationName: "pulse",
              animationDuration: "1.5s",
              animationIterationCount: "infinite",
              animationDelay: `${i * 0.3}s`
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};

// Estatísticas de impacto para adicionar valor percebido
const ImpactStats = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105">
      <CardContent className="pt-6 text-center">
        <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
        <h3 className="text-2xl font-bold">+327%</h3>
        <p className="text-sm text-muted-foreground">Crescimento médio</p>
      </CardContent>
    </Card>

    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800 shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105">
      <CardContent className="pt-6 text-center">
        <Target className="w-8 h-8 text-purple-500 mx-auto mb-2" />
        <h3 className="text-2xl font-bold">98.3%</h3>
        <p className="text-sm text-muted-foreground">Precisão de nicho</p>
      </CardContent>
    </Card>

    <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800 shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105">
      <CardContent className="pt-6 text-center">
        <Calendar className="w-8 h-8 text-green-500 mx-auto mb-2" />
        <h3 className="text-2xl font-bold">2.4x</h3>
        <p className="text-sm text-muted-foreground">Mais eficiente</p>
      </CardContent>
    </Card>

    <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800 shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105">
      <CardContent className="pt-6 text-center">
        <Lightbulb className="w-8 h-8 text-amber-500 mx-auto mb-2" />
        <h3 className="text-2xl font-bold">10x</h3>
        <p className="text-sm text-muted-foreground">Mais ideias</p>
      </CardContent>
    </Card>
  </div>
);

// Componente para mostrar testemunhos
const Testimonials = () => (
  <div className="mt-16 grid gap-6 md:grid-cols-3">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700"
    >
      <div className="flex items-center gap-2 mb-4">
        {Array(5).fill(0).map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className="italic text-gray-600 dark:text-gray-300 mb-4">
        O Mentor.IA revolucionou minha estratégia de conteúdo. Em 30 dias, ganhei mais de 1k seguidores e tripliquei minhas conversões. Vale cada centavo!
      </p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold">
          M
        </div>
        <div>
          <p className="font-medium">Wislla Souza</p>
          <p className="text-xs text-muted-foreground">@glamfit.online</p>
        </div>
      </div>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700"
    >
      <div className="flex items-center gap-2 mb-4">
        {Array(5).fill(0).map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className="italic text-gray-600 dark:text-gray-300 mb-4">
        A estratégia gerada pela IA me deu ideias que eu jamais teria pensado. Minha taxa de engajamento subiu 215% em apenas duas semanas. Incrível!
      </p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-teal-500 flex items-center justify-center text-white font-bold">
          C
        </div>
        <div>
          <p className="font-medium">Camila Ferreira</p>
          <p className="text-xs text-muted-foreground">@camilaempreende</p>
        </div>
      </div>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700"
    >
      <div className="flex items-center gap-2 mb-4">
        {Array(5).fill(0).map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className="italic text-gray-600 dark:text-gray-300 mb-4">
        Economizei mais de 20 horas por mês no planejamento de conteúdo. O calendário automático e as sugestões de bio são simplesmente fantásticos!
      </p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-red-500 flex items-center justify-center text-white font-bold">
          R
        </div>
        <div>
          <p className="font-medium">Rafael Costa</p>
          <p className="text-xs text-muted-foreground">@rafaelvendasb2b</p>
        </div>
      </div>
    </motion.div>
  </div>
);


// Componente principal aprimorado
export default function MentorIaMvp() {
  const savedAnalysis = useQuery(api.mentor.getSavedAnalysis);
  const generateAnalysis = useAction(api.mentor.generateAnalysis);

  const [view, setView] = useState<"loading" | "form" | "dashboard">("loading");
  const [isGenerating, setIsGenerating] = useState(false);
  const [formDefaults, setFormDefaults] = useState<Partial<FormData> | undefined>(undefined);
  // O calendário será a única aba visível, então podemos remover o estado `activeTab`
  // e as referências a outras abas. Para simplificar, vou manter uma string, mas ela
  // sempre será 'calendar'. Ou simplesmente renderizar o CalendarView direto.
  const [activeTab, setActiveTab] = useState("calendar"); // Manter para a estrutura de Tabs, mesmo que seja a única

  const [showShareOptions, setShowShareOptions] = useState(false);
  const [hasShownConfetti, setHasShownConfetti] = useState(false);

  // Refs para elementos de animação não são mais necessários para as tabs removidas.

  useEffect(() => {
    if (savedAnalysis === undefined) {
      setView("loading");
    } else if (savedAnalysis) {
      // Se acabou de gerar e não mostrou o confetti ainda
      if (Date.now() - (savedAnalysis.updatedAt || savedAnalysis._creationTime) < 10000 && !hasShownConfetti) {
        triggerSuccessConfetti();
        setHasShownConfetti(true);
      }

      setView("dashboard");
      setFormDefaults({
        username: savedAnalysis.username,
        bio: savedAnalysis.bio,
        offer: savedAnalysis.offer,
        audience: savedAnalysis.audience,
        planDuration: savedAnalysis.planDuration,
      });
    } else {
      setView("form");
    }
  }, [savedAnalysis, hasShownConfetti]);

  // Log de debug para verificar os dados recebidos
  useEffect(() => {
    if (savedAnalysis) {
      console.log("Dados recebidos do backend:", {
        contentPlanLength: savedAnalysis.content_plan?.length || 0
      });
    }
  }, [savedAnalysis]);

  const handleGenerate = (data: FormData) => {
    setIsGenerating(true);
    setHasShownConfetti(false);
    toast.promise(generateAnalysis(data), {
      loading: "Athena foi convocada. Forjando sua estratégia de elite...",
      success: () => {
        setIsGenerating(false);
        // Dispara o confete ao completar com sucesso
        triggerSuccessConfetti();
        setHasShownConfetti(true);
        return "Sua estratégia de dominação está pronta!";
      },
      error: (err: Error) => {
        setIsGenerating(false);
        return err.message || "Encontramos um obstáculo. Tente novamente.";
      },
    });
  };

  // Funções de cópia e fallback não são mais diretamente exibidas para Estratégia, Bios e Grid,
  // mas o handleDownloadPlan ainda pode usá-las para gerar o arquivo completo.
  // const handleCopyToClipboard = (text: string, label: string) => {
  //   navigator.clipboard.writeText(text);
  //   toast.success(`${label} copiada para a área de transferência!`, {
  //     icon: <Copy className="w-4 h-4 text-green-500" />
  //   });
  // };

  const handleSharePlan = () => {
    if (savedAnalysis) {
      const shareText = `Acabei de criar um plano de conteúdo poderoso com o Mentor.IA do @freelink! Transformando meu perfil em uma máquina de crescimento orgânico. 🚀 #FreelinkMentorIA`;

      if (navigator.share) {
        navigator.share({
          title: 'Meu Plano Estratégico - Mentor.IA',
          text: shareText,
          url: 'https://freelinnk.com/mentor-ia'
        })
          .then(() => toast.success('Plano compartilhado com sucesso!', {
            icon: <Share2 className="w-4 h-4 text-green-500" />
          }))
          .catch(() => setShowShareOptions(true));
      } else {
        setShowShareOptions(true);
        navigator.clipboard.writeText(shareText);
        toast.success('Texto copiado! Compartilhe nas suas redes.', {
          icon: <Copy className="w-4 h-4 text-green-500" />
        });
      }
    }
  };

   const handleDownloadPlan = () => {
    if (!savedAnalysis) return;

    // A função foi reescrita para usar a NOVA estrutura de dados,
    // que é muito mais rica e estratégica.
    const content = `
# PLANO ESTRATÉGICO DE CONTEÚDO - MENTOR.IA

## Perfil: @${savedAnalysis.username}
Data de geração: ${new Date(savedAnalysis.updatedAt ?? savedAnalysis._creationTime).toLocaleString("pt-BR")}

---

## 🧠 ESTRATÉGIA CENTRAL

### Pilares de Conteúdo:
${savedAnalysis.content_pillars.map((pillar, i) =>
`  ${i + 1}. **${pillar.pillar}**: ${pillar.description}`
).join('\n')}

### Persona da Audiência:
- **Nome:** ${savedAnalysis.audience_persona.name}
- **Descrição:** ${savedAnalysis.audience_persona.description}
- **Principais Dores:**\n${savedAnalysis.audience_persona.pain_points.map(pain => `    - ${pain}`).join('\n')}

### Voz da Marca:
- ${savedAnalysis.brand_voice}

---

## ✨ BIO OTIMIZADA PARA INSTAGRAM
${savedAnalysis.optimized_bio.replace(/\\n/g, '\n')}

---

## 🗓️ PLANO DE CONTEÚDO DETALHADO
${savedAnalysis.content_plan.map((item) => `
===================================================
**${item.day.toUpperCase()} (${item.time}) - FORMATO: ${item.format.toUpperCase()}**

**Título:** ${item.title}
**Ideia Central:** ${item.content_idea}
**Funil:** ${item.funnel_stage}
**Métrica de Foco:** ${item.focus_metric}

${item.details ? `
  **Roteiro/Legenda:**
  ${item.details.script_or_copy.replace(/\\n/g, '\n  ')}

  **Passo a Passo:** ${item.details.step_by_step}
  **Ferramenta Sugerida:** ${item.details.tool_suggestion}
  **Hashtags:** ${item.details.hashtags}
` : ''}
`).join('\n')}
---
Gerado por Mentor.IA - Freelink
A arma secreta dos criadores de conteúdo de elite
https://freelinnk.com
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plano-estrategico-${savedAnalysis.username}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Plano de conteúdo baixado com sucesso!', {
      icon: <Download className="w-4 h-4 text-green-500" />
    });
  };

  if (view === "loading" || (isGenerating && view !== 'dashboard')) {
    return <MentorLoadingState />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-6xl mx-auto space-y-8 pb-20"
    >
      <AnimatePresence mode="wait">
        {view === "form" && !isGenerating && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-12 mt-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Badge variant="outline" className="mb-4 px-3 py-1 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 font-medium">
                  VERSÃO PREMIUM
                </Badge>
                <h1 className="text-5xl font-extrabold tracking-tight lg:text-6xl mb-3">
                  <span className="inline-block relative">
                    Mentor
                    <motion.span
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                      className="absolute bottom-0 left-0 h-3 bg-blue-500/20"
                    />
                  </span>
                  <span className="text-blue-600">.IA</span>
                </h1>
                <p className="text-2xl font-medium text-muted-foreground">
                  Sua arma secreta para <span className="text-blue-600 font-semibold">dominar o algoritmo</span>
                </p>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto"
              >
                Entre com seu perfil abaixo e Athena criará seu calendário de conteúdo completo.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <MentorIaForm onSubmit={handleGenerate} defaults={formDefaults} isLoading={isGenerating} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <ImpactStats />

              <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center text-center p-6 bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-950/50 dark:to-transparent rounded-xl border border-blue-100/50 dark:border-blue-800/30 shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="bg-blue-100 dark:bg-blue-900/50 p-4 rounded-full mb-4 shadow-inner">
                    <Award className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Plano de Elite</h3>
                  <p className="text-muted-foreground">Análise profunda do seu nicho para conteúdo otimizado.</p>
                </div>

                <div className="flex flex-col items-center text-center p-6 bg-gradient-to-b from-purple-50 to-transparent dark:from-purple-950/50 dark:to-transparent rounded-xl border border-purple-100/50 dark:border-purple-800/30 shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="bg-purple-100 dark:bg-purple-900/50 p-4 rounded-full mb-4 shadow-inner">
                    <Calendar className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Calendário Completo</h3>
                  <p className="text-muted-foreground">Plano de 7 ou 30 dias com todos os detalhes e ideias.</p>
                </div>

                <div className="flex flex-col items-center text-center p-6 bg-gradient-to-b from-indigo-50 to-transparent dark:from-indigo-950/50 dark:to-transparent rounded-xl border border-indigo-100/50 dark:border-indigo-800/30 shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="bg-indigo-100 dark:bg-indigo-900/50 p-4 rounded-full mb-4 shadow-inner">
                    <Zap className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Impulsione o Engajamento</h3>
                  <p className="text-muted-foreground">Fórmulas testadas para maximizar seu alcance e interação.</p>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="mt-12 p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl text-white shadow-xl"
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                      <Trophy className="w-6 h-6 text-yellow-300" />
                      Resultados Comprovados
                    </h2>
                    <p>Nossos usuários relatam em média 300% mais engajamento e 2x mais conversões.</p>
                  </div>
                  <Button
                    variant="secondary"
                    size="lg"
                    className="bg-white text-blue-700 hover:bg-blue-50 font-medium"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  >
                    Experimente Agora
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </motion.div>

              <Testimonials />

              <div className="mt-16 text-center">
                <p className="text-sm text-muted-foreground">
                  Usado por mais de 10.000 criadores de conteúdo de elite em todo o mundo
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {view === "dashboard" && savedAnalysis && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pt-4"
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-8 bg-gradient-to-br from-blue-900 to-purple-900 text-white rounded-2xl shadow-2xl shadow-blue-500/20"
            >
              <div>
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ rotate: -5, scale: 0.9 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Sparkles className="w-8 h-8 text-yellow-400" />
                  </motion.div>
                  <h2 className="text-3xl font-bold">
                    Seu Calendário de Conteúdo
                  </h2>
                </div>
                <p className="opacity-90 mt-1 text-lg">
                  Para <span className="font-bold">@{savedAnalysis.username}</span> | {savedAnalysis.planDuration === "week" ? "7 dias" : "30 dias"}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant="outline" className="text-blue-200 border-blue-400/30 px-2 py-0.5 flex items-center gap-1">
                    <BrainCircuit className="w-3 h-3" />
                    {savedAnalysis.aiModel?.includes("fallback")
                      ? "IA Avançada"
                      : savedAnalysis.aiModel?.includes("gemini")
                        ? "Gemini IA"
                        : "LLaMA 3"}
                  </Badge>
                  <p className="opacity-70 text-sm">
                    Atualizado: {new Date(savedAnalysis.updatedAt ?? savedAnalysis._creationTime).toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={handleSharePlan}
                        className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Compartilhar
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-40">Compartilhe seu calendário nas redes sociais</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={handleDownloadPlan}
                        className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Baixar Plano Completo
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-40">Baixe seu plano completo em formato texto</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Button
                  variant="secondary"
                  onClick={() => setView("form")}
                  className="bg-white text-blue-900 hover:bg-blue-50"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Gerar Novo Plano
                </Button>
              </div>
            </motion.div>

            {/* Ações rápidas - Simplificado para apenas o calendário */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 p-4 rounded-xl border bg-card shadow-sm flex flex-wrap gap-2 items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Plano Gerado
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Seu calendário de conteúdo está pronto para impulsionar seu perfil!
                </span>
              </div>
            </motion.div>

            {showShareOptions && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-card rounded-xl border shadow-md"
              >
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-blue-500" />
                  Compartilhar nas redes sociais
                </h3>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Acabei de criar um calendário de conteúdo poderoso com o Mentor.IA do @freelink! Transformando meu perfil em uma máquina de crescimento orgânico. 🚀 #FreelinkMentorIA`)}&url=${encodeURIComponent('https://freelink.io/mentor-ia')}`, '_blank')}>
                    <svg xmlns="http://www.w3.org/20com/24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
                    Twitter
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://freelink.io/mentor-ia')}`, '_blank')}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
                    LinkedIn
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Acabei de criar um calendário de conteúdo poderoso com o Mentor.IA do @freelink! Transformando meu perfil em uma máquina de crescimento orgânico. 🚀 Confira: https://freelink.io/mentor-ia`)}`, '_blank')}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
                    WhatsApp
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowShareOptions(false)}>
                    Fechar
                  </Button>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <Heart className="w-3 h-3 text-red-400" />
                  <span>Compartilhe e ajude outros criadores a potencializarem seus resultados!</span>
                </div>
              </motion.div>
            )}

            {/* Apenas a aba de Calendário */}
            <Tabs
              value={activeTab} // Mantemos o valor para a estrutura da aba
              onValueChange={setActiveTab} // Manter para conformidade, mas não haverá mudança real
              className="w-full mt-8"
            >
              <TabsList className="grid w-full grid-cols-1 h-auto"> {/* Apenas 1 coluna agora */}
                <TabsTrigger value="calendar" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900/30">
                  <Calendar className="w-4 h-4 mr-2" />
                  Calendário
                </TabsTrigger>
                {/* As TabsTrigger para Estratégia, Bios e Grid foram removidas */}
              </TabsList>

              <TabsContent value="calendar" className="mt-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-blue-500" />
                        <span>Calendário Estratégico</span>
                      </h3>
                      <p className="text-muted-foreground mt-1">
                        {savedAnalysis.planDuration === "week"
                          ? "Sprint de 7 dias para maximizar seu alcance"
                          : "Campanha de 30 dias para dominação do feed"}
                      </p>
                    </div>

                    <Badge variant="outline" className={cn(
                      "px-3 py-1 text-sm",
                      savedAnalysis.content_plan.some(item => item.status === "concluido")
                        ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
                        : "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                    )}>
                      {savedAnalysis.content_plan.filter(item => item.status === "concluido").length} de {savedAnalysis.content_plan.length} concluídos
                    </Badge>
                  </div>

                  <div className="bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-950/20 dark:to-transparent p-6 rounded-2xl shadow-lg border border-blue-200 dark:border-blue-800/50">
                    <CalendarView plan={savedAnalysis.content_plan as PlanItem[]} analysisId={savedAnalysis._id} />
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800/30 shadow-sm">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Dica de produtividade</p>
                        <p className="text-sm text-muted-foreground">Marque os itens como concluídos para acompanhar seu progresso. Reserve um tempo fixo semanalmente para produzir seu conteúdo em lotes.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>

              {/* As TabsContent para Estratégia, Bios e Grid foram removidas */}
            </Tabs>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-12 pt-8 border-t"
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <h3 className="text-xl font-bold">Revolucione seu Instagram com o Mentor.IA</h3>
                  <p className="text-muted-foreground mt-1">Compartilhe sua experiência e inspire outros criadores</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleSharePlan}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartilhar
                  </Button>

                  <Button
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    onClick={() => window.open('https://freelinnk.com/dashboard/billing', '_blank')}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Upgrade Premium
                  </Button>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-8 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-lg border border-indigo-200 dark:border-indigo-800/30 shadow-sm"
              >
                <div className="flex items-center gap-3 text-sm text-center justify-center">
                  <span className="font-medium text-indigo-700 dark:text-indigo-300">
                    O Mentor.IA é atualizado constantemente com novas estratégias e recursos.
                  </span>
                  <span className="text-muted-foreground">
                    Visite novamente para gerar novos planos otimizados.
                  </span>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}