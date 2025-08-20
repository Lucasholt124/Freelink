"use client";
import { useEffect, useState, useRef, JSX } from "react";
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
  BrainCircuit, Lock, ExternalLink,
  Flame
} from "lucide-react";
import MentorIaForm, { FormData } from "./MentorIaForm";
import CalendarView, { PlanItem } from "./CalendarView";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import confetti from 'canvas-confetti';
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Twitter, Linkedin, MessageCircle } from "lucide-react";

// Função para sanitizar os dados antes de enviar ao backend (remove step_progress)
const sanitizeForBackend = (items: PlanItem[]): PlanItem[] => {
  return items.map(item => {
    // Cria uma cópia profunda do item para evitar referências
    const sanitizedItem = JSON.parse(JSON.stringify(item)) as PlanItem;

    // Remove o campo step_progress se existir
    if (sanitizedItem.details && sanitizedItem.details.step_progress) {
      delete sanitizedItem.details.step_progress;
    }

    return sanitizedItem;
  });
};

// Animação de confete com cores mais vibrantes e efeito premium
const triggerSuccessConfetti = () => {
  const duration = 3 * 1000;
  const end = Date.now() + duration;

  // Cores mais vibrantes para um efeito mais premium
  const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  const myConfetti = confetti.create(canvas, { resize: true });

  (function confettiFrame() {
    myConfetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors,
      shapes: ['circle', 'square'],
      scalar: 1.2
    });

    myConfetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors,
      shapes: ['circle', 'square'],
      scalar: 1.2
    });

    if (Date.now() < end) {
      requestAnimationFrame(confettiFrame);
    } else {
      setTimeout(() => {
        document.body.removeChild(canvas);
      }, 1000);
    }
  })();
};

// Definição da classe Particle para animação de partículas
interface ParticleProps {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  update: () => void;
  draw: (ctx: CanvasRenderingContext2D) => void;
}

class Particle implements ParticleProps {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  canvasWidth: number;
  canvasHeight: number;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
    this.size = Math.random() * 5 + 1;
    this.speedX = Math.random() * 3 - 1.5;
    this.speedY = Math.random() * 3 - 1.5;
    this.color = `rgba(59, 130, 246, ${Math.random() * 0.3 + 0.1})`; // Azul com opacidade variável
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.size > 0.2) this.size -= 0.01;

    if (this.x < 0 || this.x > this.canvasWidth) this.speedX *= -1;
    if (this.y < 0 || this.y > this.canvasHeight) this.speedY *= -1;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Componente de carregamento aprimorado com animação de partículas
const MentorLoadingState = () => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Inicializando IA...");
  const [quote, setQuote] = useState("Grande estratégia é quando você antecipa o que vai acontecer, não quando você reage ao que já aconteceu.");
  const [quoteAuthor, setQuoteAuthor] = useState("Sun Tzu, A Arte da Guerra");
  const particlesRef = useRef<HTMLCanvasElement>(null);

  // Citações inspiradoras mais relevantes para marketing digital
  const quotes = [
    { text: "Grande estratégia é quando você antecipa o que vai acontecer, não quando você reage ao que já aconteceu.", author: "Sun Tzu, A Arte da Guerra" },
    { text: "O conteúdo é o rei, mas o engajamento é a rainha, e ela governa a casa.", author: "Mari Smith" },
    { text: "Não construa links. Construa relacionamentos.", author: "Rand Fishkin" },
    { text: "Marketing é contar histórias tão bem que as pessoas vivenciam o valor do que você oferece.", author: "Seth Godin" },
    { text: "O melhor marketing não parece marketing.", author: "Tom Fishburne" },
    { text: "A qualidade do seu conteúdo determina a qualidade do seu público.", author: "Gary Vaynerchuk" },
    { text: "Os algoritmos favorecem a consistência acima de tudo.", author: "Neil Patel" },
    { text: "Boas ideias são comuns. O que é incomum são pessoas que põem essas ideias em prática.", author: "Robert Kiyosaki" }
  ];

  useEffect(() => {
    // Fases mais detalhadas para feedback visual mais rico
    const texts = [
      "Inicializando núcleo de IA...",
      "Acessando base de conhecimento...",
      "Analisando perfil...",
      "Identificando nichos de mercado...",
      "Mapeando público-alvo...",
      "Analisando comportamento da audiência...",
      "Pesquisando tendências de mercado...",
      "Calibrando estratégia de conteúdo...",
      "Otimizando plano de distribuição...",
      "Estruturando funil de conversão...",
      "Gerando calendário de posts...",
      "Aprimorando sugestões...",
      "Verificando qualidade...",
      "Ajustando detalhes finais...",
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
          // Incremento mais suave com aceleração no meio
          let increment;

          if (prev < 30) {
            increment = Math.floor(Math.random() * 2) + 1; // Início lento
          } else if (prev < 70) {
            increment = Math.floor(Math.random() * 4) + 2; // Meio mais rápido
          } else {
            increment = Math.floor(Math.random() * 2) + 0.5; // Final mais lento para suspense
          }

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

  // Animação de partículas de fundo
  useEffect(() => {
    if (!particlesRef.current) return;

    const canvas = particlesRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles: Particle[] = [];

    const resize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    const init = () => {
      for (let i = 0; i < 80; i++) {
        if (canvas) {
          particles.push(new Particle(canvas.width, canvas.height));
        }
      }
    };

    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        particle.update();
        particle.draw(ctx);

        if (particle.size <= 0.2) {
          particles.splice(i, 1);
          if (canvas) {
            particles.push(new Particle(canvas.width, canvas.height));
          }
          i--;
        }
      }

      requestAnimationFrame(animate);
    };

    init();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center text-center p-8 min-h-[60vh] bg-gradient-to-b from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950 rounded-2xl border border-blue-100 dark:border-blue-900 shadow-xl relative overflow-hidden"
    >
      {/* Canvas para partículas */}
      <canvas
        ref={particlesRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      />

      <div className="relative z-10">
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
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
          {statusText}
        </motion.p>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="w-full max-w-md mt-8"
        >
          <Progress value={progress} className="h-2 bg-blue-100 dark:bg-blue-900/30">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full" />
          </Progress>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-muted-foreground">Executando IA avançada</span>
            <p className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">{progress}%</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-8 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg max-w-md shadow-inner border border-slate-200 dark:border-slate-700"
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
                animation: `pulse 1.5s infinite ${i * 0.3}s`
              }}
            />
          ))}
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(0.8); opacity: 0.3; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(0.8); opacity: 0.3; }
        }
      `}</style>
    </motion.div>
  );
};

// Estatísticas de impacto com hover e animações aprimoradas
const ImpactStats = () => {
  const stats = [
    {
      icon: <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />,
      value: "+327%",
      label: "Crescimento médio",
      gradient: "from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900",
      border: "border-blue-200 dark:border-blue-800",
      iconColor: "text-blue-500"
    },
    {
      icon: <Target className="w-8 h-8 text-purple-500 mx-auto mb-2" />,
      value: "98.3%",
      label: "Precisão de nicho",
      gradient: "from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900",
      border: "border-purple-200 dark:border-purple-800",
      iconColor: "text-purple-500"
    },
    {
      icon: <Calendar className="w-8 h-8 text-green-500 mx-auto mb-2" />,
      value: "2.4x",
      label: "Mais eficiente",
      gradient: "from-green-50 to-green-100 dark:from-green-950 dark:to-green-900",
      border: "border-green-200 dark:border-green-800",
      iconColor: "text-green-500"
    },
    {
      icon: <Lightbulb className="w-8 h-8 text-amber-500 mx-auto mb-2" />,
      value: "10x",
      label: "Mais ideias",
      gradient: "from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900",
      border: "border-amber-200 dark:border-amber-800",
      iconColor: "text-amber-500"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * index, duration: 0.4 }}
          whileHover={{
            y: -5,
            boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.1), 0 8px 10px -6px rgba(59, 130, 246, 0.1)"
          }}
        >
          <Card className={`bg-gradient-to-br ${stat.gradient} ${stat.border} shadow-md transition-all duration-300`}>
            <CardContent className="pt-6 text-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 + 0.1 * index, type: "spring", stiffness: 300 }}
                className={stat.iconColor}
              >
                {stat.icon}
              </motion.div>
              <motion.h3
                className="text-2xl font-bold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + 0.1 * index }}
              >
                {stat.value}
              </motion.h3>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

// Componente para mostrar testemunhos com animações suaves
const Testimonials = () => {
  const testimonials = [
    {
      text: "O Mentor.IA revolucionou minha estratégia de conteúdo. Em 30 dias, ganhei mais de 1k seguidores e tripliquei minhas conversões. Vale cada centavo!",
      name: "Wislla Souza",
      handle: "@glamfit.online",
      initials: "W",
      gradient: "from-purple-400 to-pink-500"
    },
    {
      text: "A estratégia gerada pela IA me deu ideias que eu jamais teria pensado. Minha taxa de engajamento subiu 215% em apenas duas semanas. Incrível!",
      name: "Camila Ferreira",
      handle: "@camilaempreende",
      initials: "C",
      gradient: "from-blue-400 to-teal-500"
    },
    {
      text: "Economizei mais de 20 horas por mês no planejamento de conteúdo. O calendário automático e as sugestões de bio são simplesmente fantásticos!",
      name: "Rafael Costa",
      handle: "@rafaelvendasb2b",
      initials: "R",
      gradient: "from-amber-400 to-red-500"
    }
  ];

  return (
    <div className="mt-16 grid gap-6 md:grid-cols-3">
      {testimonials.map((testimonial, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 * index, duration: 0.4 }}
          whileHover={{ y: -5 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 relative overflow-hidden"
        >
          {/* Gradiente decorativo no canto */}
          <div className="absolute -top-10 -right-10 w-20 h-20 rounded-full bg-gradient-to-br opacity-20 blur-xl"
            style={{
              backgroundImage: `linear-gradient(to bottom right, var(--${testimonial.gradient.split(' ')[0].slice(5)}-500), var(--${testimonial.gradient.split(' ')[2].slice(3)}-500))`
            }}
          />

          <div className="flex items-center gap-2 mb-4">
            {Array(5).fill(0).map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            ))}
          </div>

          <p className="italic text-gray-600 dark:text-gray-300 mb-4 relative z-10">
            {testimonial.text}
          </p>

          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-white font-bold shadow-md`}>
              {testimonial.initials}
            </div>
            <div>
              <p className="font-medium">{testimonial.name}</p>
              <p className="text-xs text-muted-foreground">{testimonial.handle}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Interface para as props do modal de compartilhamento
interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  username?: string;
}

// Componente de modal de compartilhamento
const ShareModal = ({ isOpen, onClose, username = "seu_perfil" }: ShareModalProps) => {
  const shareText = `Acabei de criar um plano de conteúdo poderoso com o Mentor.IA da @freelink! Transformando meu perfil em uma máquina de crescimento orgânico. 🚀 #FreelinkMentorIA`;
  const shareUrl = 'https://freelink.io/mentor-ia';

  // Copiar texto para a área de transferência
  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
    toast.success('Texto copiado para a área de transferência!', {
      icon: <Copy className="w-4 h-4 text-green-500" />,
      position: 'bottom-center'
    });
  };

  // Opções de compartilhamento
  const shareOptions = [
    {
      name: 'Twitter',
      icon: <Twitter className="w-5 h-5" />,
      color: 'bg-[#1DA1F2] hover:bg-[#1a94da]',
      action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank')
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin className="w-5 h-5" />,
      color: 'bg-[#0077B5] hover:bg-[#006da7]',
      action: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(shareText)}`, '_blank')
    },
    {
      name: 'WhatsApp',
      icon: <MessageCircle className="w-5 h-5" />,
      color: 'bg-[#25D366] hover:bg-[#22c35e]',
      action: () => window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, '_blank')
    }
  ];

  // Gerar uma imagem de prévia para compartilhamento (mockup)
  const previewImageUrl = `https://via.placeholder.com/600x315/3B82F6/FFFFFF?text=Plano+de+Conteúdo+de+@${username}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-500" />
            Compartilhe sua conquista
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
            <img
              src={previewImageUrl}
              alt="Preview de compartilhamento"
              className="w-full h-auto aspect-[1.91/1] object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <p className="text-white text-sm font-medium">Plano de Conteúdo gerado com Mentor.IA</p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-700 dark:text-slate-300">{shareText}</p>
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-muted-foreground">freelink.io/mentor-ia</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className="h-8 px-2"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <p className="text-sm font-medium">Compartilhar via:</p>
            <div className="flex flex-wrap gap-2">
              {shareOptions.map((option) => (
                <Button
                  key={option.name}
                  className={`${option.color} text-white`}
                  onClick={option.action}
                >
                  {option.icon}
                  <span className="ml-2">{option.name}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-4 flex flex-row items-center justify-between sm:justify-between">
          <p className="text-xs text-muted-foreground flex items-center">
            <Heart className="w-3 h-3 text-red-400 mr-1" />
            Obrigado por compartilhar!
          </p>
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Interface para o tipo de medalha
interface BadgeType {
  title: string;
  icon: JSX.Element;
  color: string;
}

// Tipos para as props de AchievementBadge
interface AchievementBadgeProps {
  type: 'streak' | 'completed' | 'engagement'; // Tipos de medalhas suportados
  value: string | number;
  onClick: () => void;
}

// Componente de medalha para mostrar conquistas
const AchievementBadge = ({ type, value, onClick }: AchievementBadgeProps) => {
  const badges: Record<'streak' | 'completed' | 'engagement', BadgeType> = {
    streak: {
      title: "Sequência",
      icon: <Flame className="w-4 h-4" />,
      color: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800"
    },
    completed: {
      title: "Concluídos",
      icon: <CheckCircle className="w-4 h-4" />,
      color: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
    },
    engagement: {
      title: "Engajamento",
      icon: <TrendingUp className="w-4 h-4" />,
      color: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
    }
  };

  const badge = badges[type];

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`${badge.color} flex items-center gap-1.5 px-3 py-1.5 rounded-full border cursor-pointer transition-all`}
    >
      {badge.icon}
      <div className="flex items-center gap-1">
        <span className="text-xs font-medium">{badge.title}:</span>
        <span className="font-bold">{value}</span>
      </div>
    </motion.div>
  );
};

// Interface para as estatísticas do usuário
interface UserStats {
  streak: number;
  completed: number;
  engagement: number;
}

// Componente principal aprimorado
export default function MentorIaMvp() {
  const savedAnalysis = useQuery(api.mentor.getSavedAnalysis);
  const generateAnalysis = useAction(api.mentor.generateAnalysis);

  const [view, setView] = useState<"loading" | "form" | "dashboard">("loading");
  const [isGenerating, setIsGenerating] = useState(false);
  const [formDefaults, setFormDefaults] = useState<Partial<FormData> | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("calendar");
  const [showShareModal, setShowShareModal] = useState(false);
  const [hasShownConfetti, setHasShownConfetti] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showCompletionToast, setShowCompletionToast] = useState(false);

  // Estatísticas do usuário
  const [userStats, setUserStats] = useState<UserStats>({
    streak: 0,
    completed: 0,
    engagement: 0
  });

  // Rastrear o progresso de rolagem
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const progress = height > 0 ? (scrollY / height) * 100 : 0;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Carregar os dados
  useEffect(() => {
    if (savedAnalysis === undefined) {
      setView("loading");
    } else if (savedAnalysis) {
      // Se acabou de gerar e não mostrou o confetti ainda
      if (Date.now() - (savedAnalysis.updatedAt || savedAnalysis._creationTime) < 10000 && !hasShownConfetti) {
        triggerSuccessConfetti();
        setHasShownConfetti(true);

        // Mostrar toast de conclusão após um pequeno delay
        setTimeout(() => {
          setShowCompletionToast(true);
        }, 1500);
      }

      setView("dashboard");
      setFormDefaults({
        username: savedAnalysis.username,
        bio: savedAnalysis.bio,
        offer: savedAnalysis.offer,
        audience: savedAnalysis.audience,
        planDuration: savedAnalysis.planDuration,
      });

      // Calcular estatísticas do usuário
      if (savedAnalysis.content_plan) {
        const completed = savedAnalysis.content_plan.filter(item => item.status === "concluido").length;
        const total = savedAnalysis.content_plan.length;

        setUserStats({
          streak: Math.min(completed, 7), // Simplificado para demo
          completed: completed,
          engagement: Math.floor((completed / total) * 100) || 0
        });
      }
    } else {
      setView("form");
    }
  }, [savedAnalysis, hasShownConfetti]);

  // Mostrar toast de conclusão
  useEffect(() => {
    if (showCompletionToast) {
      toast.success(
        <div className="flex flex-col items-center">
          <p className="font-semibold">Seu plano está pronto! 🎉</p>
          <p className="text-sm">Explore seu calendário e comece a implementar!</p>
        </div>,
        {
          duration: 5000,
          position: "top-center",
          icon: <Sparkles className="w-5 h-5 text-yellow-400" />
        }
      );
      setShowCompletionToast(false);
    }
  }, [showCompletionToast]);

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
        // Confete será acionado após o carregamento dos dados
        return "Sua estratégia de dominação está pronta!";
      },
      error: (err: Error) => {
        setIsGenerating(false);
        return err.message || "Encontramos um obstáculo. Tente novamente.";
      },
    });
  };

  const handleSharePlan = () => {
    setShowShareModal(true);
  };

  const handleDownloadPlan = () => {
    if (!savedAnalysis) return;

    // Função para baixar o plano completo
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
https://freelink.io
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
      icon: <Download className="w-4 h-4 text-green-500" />,
      position: 'bottom-center'
    });
  };

  if (view === "loading" || (isGenerating && view !== 'dashboard')) {
    return <MentorLoadingState />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-6xl mx-auto space-y-8 pb-20 relative"
    >
      {/* Indicador de progresso fixo no topo */}
      {view === "dashboard" && (
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-blue-500 z-50"
          style={{ width: `${scrollProgress}%` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        />
      )}

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
                {[
                  {
                    icon: <Award className="w-8 h-8 text-blue-600" />,
                    title: "Plano de Elite",
                    description: "Análise profunda do seu nicho para conteúdo otimizado.",
                    gradient: "from-blue-50 to-transparent dark:from-blue-950/50 dark:to-transparent",
                    border: "border-blue-100/50 dark:border-blue-800/30"
                  },
                  {
                    icon: <Calendar className="w-8 h-8 text-purple-600" />,
                    title: "Calendário Completo",
                    description: "Plano de 7 ou 30 dias com todos os detalhes e ideias.",
                    gradient: "from-purple-50 to-transparent dark:from-purple-950/50 dark:to-transparent",
                    border: "border-purple-100/50 dark:border-purple-800/30"
                  },
                  {
                    icon: <Zap className="w-8 h-8 text-indigo-600" />,
                    title: "Impulsione o Engajamento",
                    description: "Fórmulas testadas para maximizar seu alcance e interação.",
                    gradient: "from-indigo-50 to-transparent dark:from-indigo-950/50 dark:to-transparent",
                    border: "border-indigo-100/50 dark:border-indigo-800/30"
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + (index * 0.2) }}
                    whileHover={{ y: -5 }}
                    className={`flex flex-col items-center text-center p-6 bg-gradient-to-b ${feature.gradient} rounded-xl border ${feature.border} shadow-md transition-all duration-300`}
                  >
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-full mb-4 shadow-md relative overflow-hidden group">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        animate={{
                          rotate: [0, 360],
                        }}
                        transition={{
                          duration: 10,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      />
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="mt-12 p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl text-white shadow-xl overflow-hidden relative"
              >
                {/* Partículas decorativas */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                  {Array(6).fill(0).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-12 h-12 rounded-full bg-white opacity-10"
                      initial={{
                        x: Math.random() * 100,
                        y: Math.random() * 100,
                      }}
                      animate={{
                        x: [
                          Math.random() * 100,
                          Math.random() * 100 + 50,
                          Math.random() * 100
                        ],
                        y: [
                          Math.random() * 100,
                          Math.random() * 100 - 50,
                          Math.random() * 100
                        ],
                      }}
                      transition={{
                        duration: 10 + Math.random() * 10,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                  ))}
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
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
                    className="bg-white text-blue-700 hover:bg-blue-50 font-medium shadow-lg transition-all hover:shadow-xl"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  >
                    Experimente Agora
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </motion.div>

              <Testimonials />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 }}
                className="mt-16 text-center"
              >
                <div className="mb-4 flex flex-wrap justify-center gap-2">
                  {['Insta360', 'CreativeMinds', 'GrowthGuru', 'ContentKing', 'SocialPro', 'BrandMaster'].map((brand, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="py-1 px-3 text-xs font-medium text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                    >
                      {brand}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Usado por mais de 10.000 criadores de conteúdo de elite em todo o mundo
                </p>
              </motion.div>
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
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-8 bg-gradient-to-br from-blue-900 to-purple-900 text-white rounded-2xl shadow-2xl shadow-blue-500/20 relative overflow-hidden"
            >
              {/* Efeito de partículas no background */}
              <div className="absolute inset-0 overflow-hidden">
                {Array(20).fill(0).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute bg-white/10 rounded-full"
                    style={{
                      width: Math.random() * 8 + 2,
                      height: Math.random() * 8 + 2,
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      y: [0, -20, 0],
                      opacity: [0.4, 0.8, 0.4],
                    }}
                    transition={{
                      duration: Math.random() * 3 + 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: Math.random() * 2,
                    }}
                  />
                ))}
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ rotate: -5, scale: 0.9 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-md"></div>
                    <Sparkles className="w-8 h-8 text-yellow-400 relative z-10" />
                  </motion.div>
                  <h2 className="text-3xl font-bold">
                    Seu Calendário de Conteúdo
                  </h2>
                </div>
                <p className="opacity-90 mt-1 text-lg">
                  Para <span className="font-bold">@{savedAnalysis.username}</span> | {savedAnalysis.planDuration === "week" ? "7 dias" : "30 dias"}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-2">
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

              <div className="flex flex-wrap gap-2 relative z-10">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={handleSharePlan}
                        className="bg-white/10 border-white/20 hover:bg-white/20 text-white transition-all"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Compartilhar
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
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
                        className="bg-white/10 border-white/20 hover:bg-white/20 text-white transition-all"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Baixar Plano Completo
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p className="w-40">Baixe seu plano completo em formato texto</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Button
                  variant="secondary"
                  onClick={() => setView("form")}
                  className="bg-white text-blue-900 hover:bg-blue-50 shadow-sm hover:shadow transition-all"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Gerar Novo Plano
                </Button>
              </div>
            </motion.div>

            {/* Estatísticas e Progresso */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 p-4 rounded-xl border bg-card shadow-sm"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  <AchievementBadge
                    type="streak"
                    value={userStats.streak}
                    onClick={() => toast.info(`Você tem uma sequência de ${userStats.streak} dias!`)}
                  />
                  <AchievementBadge
                    type="completed"
                    value={userStats.completed}
                    onClick={() => toast.info(`Você concluiu ${userStats.completed} posts!`)}
                  />
                  <AchievementBadge
                    type="engagement"
                    value={`${userStats.engagement}%`}
                    onClick={() => toast.info(`Seu engajamento está em ${userStats.engagement}%!`)}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/50">
                    <Trophy className="w-3 h-3" />
                    <span className="font-medium">Nível Pro</span>
                  </Badge>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1 text-xs text-muted-foreground"
                        >
                          <Lock className="w-3 h-3" />
                          <span>Desbloqueie mais recursos</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Faça upgrade para o plano Ultra</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </motion.div>

            {/* Modal de compartilhamento */}
            <ShareModal
              isOpen={showShareModal}
              onClose={() => setShowShareModal(false)}
              username={savedAnalysis.username}
            />

            {/* Apenas a aba de Calendário */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full mt-8"
            >
              <TabsList className="grid w-full grid-cols-1 h-auto">
                <TabsTrigger
                  value="calendar"
                  className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900/30 transition-all"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Calendário
                </TabsTrigger>
              </TabsList>

              <TabsContent value="calendar" className="mt-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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

                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "px-3 py-1 text-sm",
                          savedAnalysis.content_plan.some(item => item.status === "concluido")
                            ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
                            : "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                        )}
                      >
                        {savedAnalysis.content_plan.filter(item => item.status === "concluido").length} de {savedAnalysis.content_plan.length} concluídos
                      </Badge>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8"
                              onClick={() => {
                                toast.success(
                                  <div className="space-y-2">
                                    <p className="font-medium">Dica do Mentor</p>
                                    <p className="text-sm">Poste conteúdo em horários de pico para maximizar o alcance: 12h, 18h e 21h.</p>
                                  </div>
                                );
                              }}
                            >
                              <Lightbulb className="w-4 h-4 text-amber-500" />
                              <span className="ml-2 sr-only sm:not-sr-only">Dicas</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Obtenha dicas estratégicas de postagem</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-950/20 dark:to-transparent p-6 rounded-2xl shadow-lg border border-blue-200 dark:border-blue-800/50"
                  >
                    {savedAnalysis.content_plan && (
                      <CalendarView
                        plan={savedAnalysis.content_plan as PlanItem[]}
                        analysisId={savedAnalysis._id}
                        sanitizePlan={sanitizeForBackend}
                      />
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800/30 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 dark:bg-blue-900/50 p-1.5 rounded-full text-blue-600 dark:text-blue-400 mt-0.5">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Dica de produtividade</p>
                        <p className="text-sm text-muted-foreground">Marque os itens como concluídos para acompanhar seu progresso. Reserve um tempo fixo semanalmente para produzir seu conteúdo em lotes.</p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </TabsContent>
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
                    className="transition-all"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartilhar
                  </Button>

                  <Button
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all"
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

                <div className="mt-4 flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://freelinnk.com/whats-new', '_blank')}
                    className="text-xs flex items-center gap-1.5 h-7 bg-white dark:bg-transparent"
                  >
                    <span>Ver novidades</span>
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </motion.div>

              {/* Selo de qualidade no rodapé */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-10 flex justify-center"
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground opacity-70">
                  <BrainCircuit className="w-3.5 h-3.5" />
                  <span>Potencializado por tecnologia de IA avançada • {new Date().getFullYear()} © Freelink</span>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}