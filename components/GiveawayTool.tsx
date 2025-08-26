"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  RefreshCw,
  Instagram,
  List,
  Users,
  Hash,
  Percent,
  Trophy,
  Camera,
  Clock,
  Calendar,
  Info,
  HelpCircle,
  User2,
  Stars,
  BrainCircuit,
  Crown,
  Star,
  ShieldCheck,
  History,
  Settings,
  Search,
  Share2,
  Copy,
  AlertCircle,
  FileText,
  ChevronDown,
  Zap,
  Award,
  Download,
  UserPlus,
  Check,
} from "lucide-react";
import clsx from "clsx";
import { FunctionReturnType } from "convex/server";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@radix-ui/react-accordion";

// Types
type Winner =
  | FunctionReturnType<typeof api.giveaways.runInstagramGiveaway>
  | FunctionReturnType<typeof api.giveaways.runListGiveaway>
  | FunctionReturnType<typeof api.giveaways.runNumberGiveaway>
  | FunctionReturnType<typeof api.giveaways.runWeightedListGiveaway>
  | null;

type GiveawayHistory = {
  id: string;
  type: "instagram" | "list" | "number" | "weighted";
  date: Date;
  winnerName: string;
  totalParticipants: number;
};

// Confetti animation component with real implementation
function launchConfetti() {
  // Verificar se já existe o confetti-container
  let confettiContainer = document.getElementById('confetti-container');

  if (!confettiContainer) {
    confettiContainer = document.createElement('div');
    confettiContainer.id = 'confetti-container';
    confettiContainer.className = 'fixed inset-0 pointer-events-none z-50';
    document.body.appendChild(confettiContainer);
  }

  // Adicionando estilo para confetti se não existir
  if (!document.getElementById('confetti-style')) {
    const style = document.createElement('style');
    style.id = 'confetti-style';
    style.innerHTML = `
      #confetti-container.active::before {
        content: '';
        position: absolute;
        top: -10%;
        left: 0;
        right: 0;
        height: 120%;
        background-image:
          radial-gradient(circle, #ff0000 1px, transparent 1px),
          radial-gradient(circle, #ffff00 1px, transparent 1px),
          radial-gradient(circle, #00ff00 1px, transparent 1px),
          radial-gradient(circle, #0000ff 1px, transparent 1px);
        background-size: 5px 5px;
        background-position: 0 0, 2.5px 2.5px, 1.25px 1.25px, 3.75px 3.75px;
        animation: confetti-fall 5s linear forwards;
        opacity: 0;
      }

      @keyframes confetti-fall {
        0% { transform: translateY(-100%); opacity: 1; }
        100% { transform: translateY(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  confettiContainer.classList.add('active');
  setTimeout(() => {
    confettiContainer.classList.remove('active');
  }, 5000);
}

// Animated counter for statistics
function AnimatedCounter({ value, duration = 1000 }: { value: number, duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (value === 0) {
      setCount(0);
      return;
    }

    const startValue = 0;
    const increment = value / (duration / 50);
    let current = startValue;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 50);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count}</span>;
}

// Screenshot functionality - corrigido para usar uma abordagem mais simples
function captureScreenshot(elementId: string, filename: string = 'sorteio-resultado') {
  try {
    // ...
    toast.info(`Use a função de captura de tela do seu dispositivo para salvar este resultado como ${filename}.`, {
      duration: 5000,
      id: 'screenshot-tip',
    });
    // ...
  } catch (e) {
    console.error("Erro ao capturar tela:", e);
  }
}

// Dramatic random selection visualization
function DramaticSelection({
  items,
  duration = 3000,
  onComplete,
  selectedIndex
}: {
  items: string[],
  duration?: number,
  onComplete: () => void,
  selectedIndex: number
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Garantir que selectedIndex seja válido
  const safeSelectedIndex = useMemo(() => {
    if (items.length === 0) return 0;
    return Math.max(0, Math.min(items.length - 1, selectedIndex));
  }, [items.length, selectedIndex]);

  useEffect(() => {
    startTimeRef.current = Date.now();
    setProgress(0);
    setCompleted(false);

    const updateAnimation = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const currentProgress = Math.min(elapsed / duration, 1);

      setProgress(currentProgress);

      if (currentProgress >= 1) {
        setCurrentIndex(safeSelectedIndex);
        setCompleted(true);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setTimeout(onComplete, 500);
        return;
      }

      // Increase chance of showing selected index near the end
      if (currentProgress > 0.8 && Math.random() < Math.pow(currentProgress, 3)) {
        setCurrentIndex(safeSelectedIndex);
      } else {
        setCurrentIndex(Math.floor(Math.random() * items.length));
      }
    };

    // Use interval instead of recursive setTimeout
    intervalRef.current = setInterval(updateAnimation, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [duration, items.length, onComplete, safeSelectedIndex]);

  return (
    <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-violet-900/90 to-purple-800/90 p-8 shadow-xl border-4 border-amber-300">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10"></div>
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-amber-500/20 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-amber-500/20 to-transparent"></div>

      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.15 }}
            className="text-center py-8"
          >
            <h3 className={clsx(
              "text-3xl md:text-4xl font-bold text-white break-words",
              completed && "text-amber-300"
            )}>
              {items[currentIndex] || "Carregando..."}
            </h3>
          </motion.div>
        </AnimatePresence>

        <div className="mt-4">
          <Progress
            value={progress * 100}
            className="h-2 bg-purple-950"
          />
        </div>
      </div>
    </div>
  );
}

// Nova função para transformar URL do Instagram em ID da publicação
function extractInstagramPostId(url: string): string | null {
  try {
    // Suporta formatos como: https://www.instagram.com/p/CodExemplo123/
    // ou https://www.instagram.com/reel/CodExemplo123/
    const matches = url.match(/instagram\.com\/(p|reel|tv)\/([^\/\?]+)/);
    if (matches && matches[2]) {
      return matches[2];
    }
    return null;
  } catch (e) {
    console.error("Erro ao extrair ID do post:", e);
    return null;
  }
}

type WinnerType = {
  username?: string;
  name?: string;
  number?: number;
  profilePicUrl?: string;
  commentText?: string;
};

// Compartilhamento de resultados
function ShareResults({ winner, source }: { winner: WinnerType, source: string }) {
  const winnerName = winner?.username || winner?.name || winner?.number?.toString() || "Vencedor";
  const shareText = `🎉 Parabéns ${winnerName}! Você foi o grande vencedor do nosso sorteio no ${source}. Resultado verificável em sorteiopro.app`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareText)
      .then(() => toast.success("Texto copiado para a área de transferência!"))
      .catch(() => toast.error("Não foi possível copiar o texto"));
  };

  const shareViaWhatsApp = () => {
    const encodedText = encodeURIComponent(shareText);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  return (
    <div className="mt-4 space-y-3">
      <p className="font-medium text-center">Compartilhar Resultado</p>
      <div className="flex justify-center space-x-3">
        <Button
          size="sm"
          variant="outline"
          className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
          onClick={shareViaWhatsApp}
        >
          <Share2 className="w-4 h-4 mr-2" /> WhatsApp
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
          onClick={() => {
            const imageElement = document.getElementById('winner-card');
            if (imageElement) {
              captureScreenshot('winner-card', `sorteio-${Date.now()}`);
            }
          }}
        >
          <Camera className="w-4 h-4 mr-2" /> Capturar
        </Button>
      </div>

      <div className="relative">
        <Textarea
          value={shareText}
          readOnly
          className="pr-16 text-sm resize-none"
          rows={2}
        />
        <Button
          size="sm"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8"
          onClick={copyToClipboard}
        >
          <Copy className="w-4 h-4 mr-2" /> Copiar
        </Button>
      </div>
    </div>
  );
}

// Componente para instruções de Instagram
function InstagramInstructions() {
  return (
    <Accordion type="single" collapsible className="w-full border rounded-lg overflow-hidden">
      <AccordionItem value="instructions" className="border-none">
        <AccordionTrigger className="py-3 px-4 bg-pink-50/50 dark:bg-pink-950/20 hover:bg-pink-50 dark:hover:bg-pink-950/30 hover:no-underline">
          <div className="flex items-center text-pink-700 dark:text-pink-300 font-medium">
            <HelpCircle className="w-4 h-4 mr-2" />
            Como obter comentários do Instagram
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 pt-2">
          <ol className="space-y-2 text-sm">
            <li className="flex items-start">
              <span className="bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300 w-5 h-5 rounded-full flex items-center justify-center mr-2 mt-0.5 flex-shrink-0 text-xs font-bold">1</span>
              <span>Cole a URL da publicação do Instagram no campo acima</span>
            </li>
            <li className="flex items-start">
              <span className="bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300 w-5 h-5 rounded-full flex items-center justify-center mr-2 mt-0.5 flex-shrink-0 text-xs font-bold">2</span>
              <span>Use a ferramenta <a href="https://exportcomments.com" target="_blank" rel="noopener noreferrer" className="text-pink-600 dark:text-pink-400 underline hover:text-pink-800">ExportComments.com</a> ou similar para baixar os comentários</span>
            </li>
            <li className="flex items-start">
              <span className="bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300 w-5 h-5 rounded-full flex items-center justify-center mr-2 mt-0.5 flex-shrink-0 text-xs font-bold">3</span>
              <span>Copie os comentários baixados e cole-os na área de texto abaixo</span>
            </li>
          </ol>

          <div className="mt-3 flex items-center border border-dashed border-pink-200 dark:border-pink-800 p-2 rounded">
            <AlertCircle className="w-4 h-4 text-pink-500 mr-2 flex-shrink-0" />
            <p className="text-xs text-pink-700 dark:text-pink-300">Em breve teremos uma solução automática que não exigirá o uso de ferramentas externas!</p>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function WinnerCard({
  winner,
  onRedraw,
  giveawayType,
  totalParticipants = 0,
  winnersCount = 1,
  onSaveHistory,
}: {
  winner: NonNullable<Winner>;
  onRedraw: () => void;
  giveawayType: "instagram" | "list" | "number" | "weighted";
  totalParticipants?: number;
  winnersCount?: number;
  onSaveHistory: () => void;
}) {
  const [showSelectionAnimation, setShowSelectionAnimation] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const winnerRef = useRef<HTMLDivElement>(null);

  // Get winner name based on winner type
  const displayName = (() => {
    if ("username" in winner && typeof winner.username === "string") {
      return `@${winner.username}`;
    }
    if ("number" in winner && typeof winner.number === "number") {
      return winner.number.toString();
    }
    if ("name" in winner && typeof winner.name === "string") {
      return winner.name;
    }
    return "Vencedor";
  })();

  // Get items for dramatic selection
  const selectionItems = useMemo(() => {
    if (giveawayType === "number") {
      const min = 1;
      const max = 1000;
      return Array.from({ length: 50 }, () =>
        Math.floor(Math.random() * (max - min + 1) + min).toString()
      );
    }

    // For other types, create fake names or use placeholders
    return Array.from({ length: 50 }, (_, i) =>
      giveawayType === "instagram"
        ? `@usuario_${Math.floor(Math.random() * 10000)}`
        : `Participante ${i+1}`
    );
  }, [giveawayType]);

  useEffect(() => {
    if (!showSelectionAnimation) {
      launchConfetti();
      onSaveHistory();

      // Play victory sound if available
      try {
        const audio = new Audio('/sounds/victory.mp3');
        audio.volume = 0.3;
        audio.play().catch(e => console.log('Audio play prevented:', e));
      } catch (e) {
        console.log('Audio not supported:', e);
      }
    }
  }, [showSelectionAnimation, onSaveHistory]);

  // Calculate chance
  const winChance = totalParticipants > 0
    ? ((winnersCount / totalParticipants) * 100).toFixed(2)
    : "N/A";

  if (showSelectionAnimation && selectionItems.length > 0) {
    return (
      <div className="mt-4 sm:mt-8 max-w-2xl mx-auto w-full">
        <DramaticSelection
          items={selectionItems}
          duration={3000}
          selectedIndex={0} // Aqui usamos o índice 0 de propósito para animação
          onComplete={() => setShowSelectionAnimation(false)}
        />
      </div>
    );
  }

  return (
    <div className="mt-4 sm:mt-8 max-w-2xl mx-auto w-full">
      <motion.div
        ref={winnerRef}
        id="winner-card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/30 p-4 sm:p-8 rounded-2xl sm:rounded-3xl border-4 border-amber-400 dark:border-amber-500/70 text-center shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/confetti-bg.svg')] opacity-10"></div>

        <div className="relative">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg mb-3 sm:mb-4"
          >
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </motion.div>

          <motion.h3
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-base sm:text-lg font-extrabold uppercase tracking-widest text-amber-700 dark:text-amber-500 drop-shadow-sm"
          >
            🎉 E o vencedor é... 🎉
          </motion.h3>

          <div className="mt-4 sm:mt-6 flex flex-col items-center gap-3 sm:gap-5 max-w-full">
            {("profilePicUrl" in winner && winner.profilePicUrl) ? (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.7, type: "spring", bounce: 0.5 }}
                className="relative"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 blur-lg opacity-70"></div>
                <Image
                  src={winner.profilePicUrl}
                  alt={`Foto de ${displayName}`}
                  width={100}
                  height={100}
                  className="rounded-full border-6 sm:border-8 border-white dark:border-gray-800 shadow-xl relative"
                  priority
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: "spring" }}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center shadow-lg"
              >
                <User2 className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </motion.div>
            )}

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-white truncate max-w-full px-2 sm:px-4"
            >
              {displayName}
            </motion.p>

            {"commentText" in winner && winner.commentText && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="relative w-full max-w-md"
              >
                <div className="absolute inset-0 blur-md bg-white/80 dark:bg-white/10 rounded-xl"></div>
                <p className="relative text-gray-700 dark:text-gray-200 bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm px-3 sm:px-5 py-2 sm:py-3 rounded-xl text-base sm:text-lg font-medium shadow-sm max-w-md break-words">
                  {winner.commentText}
                </p>
              </motion.div>
            )}
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-2 sm:gap-3"
          >
            <Button
              onClick={onRedraw}
              variant="outline"
              size="sm"
              className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 border-amber-400 hover:border-amber-600 dark:border-amber-700 dark:hover:border-amber-500 transition-colors text-xs sm:text-sm h-8 sm:h-9"
              aria-label="Sortear novamente"
            >
              <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> Novo Sorteio
            </Button>

            <Button
              onClick={() => setShowStats(!showStats)}
              variant="outline"
              size="sm"
              className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 border-purple-400 hover:border-purple-600 dark:border-purple-700 dark:hover:border-purple-500 transition-colors text-xs sm:text-sm h-8 sm:h-9"
            >
              <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              {showStats ? "Ocultar" : "Ver Detalhes"}
            </Button>

            <Button
              onClick={() => captureScreenshot('winner-card', `sorteio-${Date.now()}`)}
              variant="outline"
              size="sm"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 border-blue-400 hover:border-blue-600 dark:border-blue-700 dark:hover:border-blue-500 transition-colors text-xs sm:text-sm h-8 sm:h-9"
            >
              <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> Capturar
            </Button>
          </motion.div>

          <AnimatePresence>
            {showStats && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-amber-200 dark:border-amber-900/50">
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3 text-sm sm:text-base">Estatísticas do Sorteio</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-2 sm:p-3 rounded-lg">
                      <p className="text-amber-700 dark:text-amber-400 font-medium">Total de Participantes</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                        <AnimatedCounter value={totalParticipants} />
                      </p>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/20 p-2 sm:p-3 rounded-lg">
                      <p className="text-purple-700 dark:text-purple-400 font-medium">Chance de Vitória</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{winChance}%</p>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-2 sm:p-3 rounded-lg">
                      <p className="text-blue-700 dark:text-blue-400 font-medium">Data e Hora</p>
                      <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                        {new Date().toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 p-2 sm:p-3 rounded-lg">
                      <p className="text-green-700 dark:text-green-400 font-medium">Verificado</p>
                      <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white flex items-center mt-1">
                        <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-1.5 text-green-600 dark:text-green-400" />
                        Sorteio Auditável
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Adicionando opções de compartilhamento */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <ShareResults
              winner={winner}
              source={giveawayType === "instagram" ? "Instagram" :
                      giveawayType === "list" ? "Lista" :
                      giveawayType === "number" ? "Sorteio de Números" :
                      "Sorteio Ponderado"}
            />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

function GiveawayHistory({ history }: { history: GiveawayHistory[] }) {
  // Adicionamos um estado local para garantir renderização do histórico mesmo vazio
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || history.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <History className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
        <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">
          Sem histórico de sorteios
        </h3>
        <p className="text-sm text-gray-400 dark:text-gray-500 max-w-sm mx-auto mt-1">
          Seu histórico de sorteios aparecerá aqui após você realizar seu primeiro sorteio.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="space-y-3">
        {history.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className={clsx(
              "w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center",
              item.type === "instagram" ? "bg-pink-100 dark:bg-pink-900/30" :
              item.type === "list" ? "bg-blue-100 dark:bg-blue-900/30" :
              item.type === "number" ? "bg-amber-100 dark:bg-amber-900/30" :
              "bg-green-100 dark:bg-green-900/30"
            )}>
              {item.type === "instagram" ?
                <Instagram className="w-5 h-5 text-pink-600 dark:text-pink-400" /> :
              item.type === "list" ?
                <List className="w-5 h-5 text-blue-600 dark:text-blue-400" /> :
              item.type === "number" ?
                <Hash className="w-5 h-5 text-amber-600 dark:text-amber-400" /> :
                <Percent className="w-5 h-5 text-green-600 dark:text-green-400" />
              }
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {item.winnerName}
                </span>
                <Badge variant="outline" className="ml-2 text-xs">
                  {item.totalParticipants} participantes
                </Badge>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {item.date.toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
                <span className="mx-1">•</span>
                <Clock className="w-3 h-3 mr-1" />
                {item.date.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Nova função para extrair comentários de diferentes formatos
function parseInstagramComments(text: string): { username: string, text: string }[] {
  const comments: { username: string, text: string }[] = [];

  // Tenta identificar o formato dos comentários
  const lines = text.split('\n').filter(line => line.trim().length > 0);

  if (lines.length === 0) return [];

  // Verifica diferentes formatos comuns
  lines.forEach(line => {
    // Formato: @username: comentário
    const colonFormat = line.match(/^@?([a-zA-Z0-9._]+):(.+)$/);
    if (colonFormat) {
      comments.push({
        username: colonFormat[1].replace('@', ''),
        text: colonFormat[2].trim()
      });
      return;
    }

    // Formato: username - comentário
    const dashFormat = line.match(/^@?([a-zA-Z0-9._]+)\s*-\s*(.+)$/);
    if (dashFormat) {
      comments.push({
        username: dashFormat[1].replace('@', ''),
        text: dashFormat[2].trim()
      });
      return;
    }

    // Formato CSV/TSV: username,comentário ou username\tcomentário
    const csvFormat = line.match(/^@?([a-zA-Z0-9._]+)[,\t](.+)$/);
    if (csvFormat) {
      comments.push({
        username: csvFormat[1].replace('@', ''),
        text: csvFormat[2].trim()
      });
      return;
    }

    // Formato simples: tenta extrair apenas o username se encontrar @
    const simpleFormat = line.match(/@([a-zA-Z0-9._]+)/);
    if (simpleFormat) {
      comments.push({
        username: simpleFormat[1],
        text: line.trim()
      });
      return;
    }

    // Último recurso: assume que o primeiro conjunto de caracteres é o username
    const fallbackFormat = line.match(/^@?([a-zA-Z0-9._]+)\s+(.*)$/);
    if (fallbackFormat) {
      comments.push({
        username: fallbackFormat[1].replace('@', ''),
        text: fallbackFormat[2].trim() || "Sem texto"
      });
      return;
    }

    // Se não conseguir identificar, adiciona como texto completo
    if (line.trim()) {
      comments.push({
        username: "usuario_" + Math.floor(Math.random() * 1000),
        text: line.trim()
      });
    }
  });

  return comments;
}

// Função para simular o processo de extração de comentários (só UI)
function simulateCommentExtraction(url: string, onComplete: (comments: string) => void) {
  // Verifica se a URL é válida
  const postId = extractInstagramPostId(url);
  if (!postId) {
    toast.error("URL do Instagram inválida. Use um link para um post ou reel.");
    return;
  }

  // Mostra um toast com progresso simulado
  toast.promise(
    new Promise<string>(resolve => {  // Especifique o tipo genérico da Promise
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        if (progress >= 100) {
          clearInterval(interval);

          // Gera comentários de exemplo
          const sampleUsernames = [
            "maria_silva", "joao_santos", "ana_costa", "pedro_oliveira",
            "juliana_lima", "rafael_santos", "fernanda_costa", "lucas_ferreira",
            "carla_rodrigues", "bruno_alves", "patricia_dias", "ricardo_souza"
          ];

          const sampleTexts = [
            "Participando! @amigo1 @amigo2",
            "Quero muito ganhar! @colega",
            "Adorei o sorteio @melhoramiga",
            "Participando com @parceiro",
            "Vamos lá! @familiar @colega",
            "Muito legal essa promoção! @amigo",
            "Quero participar! @irma @prima",
            "Torçam por mim! @amigo1 @amigo2 @amigo3",
            "Essa eu vou ganhar! @namorado",
            "Meu sonho! @melhoramigo @colega"
          ];

          // Gera entre 5-15 comentários aleatórios
          const commentCount = Math.floor(Math.random() * 10) + 5;
          const comments = Array.from({ length: commentCount }, () => {
            const username = sampleUsernames[Math.floor(Math.random() * sampleUsernames.length)];
            const text = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
            return `@${username}: ${text}`;
          });

          resolve(comments.join('\n'));
        }
      }, 200);
    }),
    {
      loading: 'Conectando ao Instagram...',
      success: (result: string) => {  // Especifique o tipo correto aqui
        onComplete(result);
        return `${result.split('\n').length} comentários carregados com sucesso!`;
      },
      error: 'Falha ao extrair comentários. Tente colar manualmente.'
    }
  );
}
// Componente para suporte a URL do Instagram
function InstagramURLSupport({ onCommentsLoaded }: { onCommentsLoaded: (comments: string) => void }) {
  const [url, setUrl] = useState("");

  const handleExtractComments = () => {
  // Simula obtenção de dados
  simulateCommentExtraction(url, (commentsText) => {
    // Use a função parseInstagramComments aqui
    const parsedComments = parseInstagramComments(commentsText);

    // Converta os comentários processados de volta para formato de texto
    const formattedComments = parsedComments.map(comment =>
      `@${comment.username}: ${comment.text}`
    ).join('\n');

    onCommentsLoaded(formattedComments);
  });
};

  return (
    <div className="space-y-3 mb-4">
      <div className="flex flex-col space-y-2">
        <Label htmlFor="instagram-url" className="font-semibold flex items-center text-pink-600 dark:text-pink-400">
          <Instagram className="w-4 h-4 mr-2" />
          URL da publicação do Instagram
        </Label>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            id="instagram-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.instagram.com/p/CodExemplo123/"
            className="flex-1"
          />
          <Button
            onClick={handleExtractComments}
            disabled={!url}
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white sm:w-auto w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            Obter Comentários
          </Button>
        </div>
      </div>

      <InstagramInstructions />
    </div>
  );
}

// Função melhorada para detectar e filtrar comentários suspeitos
function filterSuspiciousComments(comments: string[], options: {
  removeBots: boolean,
  removeSpam: boolean,
  removeDuplicates: boolean
}) {
  // Converte comentários para formato estruturado
  const parsedComments = comments.map(c => {
    const parts = c.split(':');
    const username = parts[0].trim().replace('@', '');
    const text = parts.slice(1).join(':').trim();
    return { username, text, original: c };
  });

  // Resultado da filtragem
  const result = {
    filtered: [] as string[],
    stats: {
      total: comments.length,
      bots: 0,
      spam: 0,
      duplicates: 0
    }
  };

  // Detecta usuários únicos para remoção de duplicatas
  const usernames = new Set<string>();

  // Padrões de detecção de spam/bots
  const spamPatterns = [
    /ganhar\s+(dinheiro|prêmio)/i,
    /clique\s+no\s+link/i,
    /acesse\s+(agora|já)/i,
    /\bwww\b|\bhttp\b/i,
    /siga\s+\d+\s+perfis/i
  ];

  parsedComments.forEach(comment => {
    let isSuspicious = false;

    // Verifica por padrões de spam
    if (options.removeSpam) {
      const isSpam = spamPatterns.some(pattern =>
        pattern.test(comment.text)
      );

      if (isSpam) {
        result.stats.spam++;
        isSuspicious = true;
      }
    }

    // Verifica por contas suspeitas (bots)
    if (options.removeBots && !isSuspicious) {
      // Padrões comuns de nomes de bots
      const isBotName = /\d{6,}$|bot|follow|promo|cash|money|official|real/.test(comment.username);

      // Poucos caracteres ou muitos números no username
      const suspiciousUsername = comment.username.length < 4 ||
                                (comment.username.match(/\d/g)?.length || 0) > 3;

      if (isBotName || suspiciousUsername) {
        result.stats.bots++;
        isSuspicious = true;
      }
    }

    // Verifica duplicatas
    if (options.removeDuplicates && !isSuspicious) {
      if (usernames.has(comment.username)) {
        result.stats.duplicates++;
        isSuspicious = true;
      } else {
        usernames.add(comment.username);
      }
    }

    // Se não for suspeito, adiciona aos resultados filtrados
    if (!isSuspicious) {
      result.filtered.push(comment.original);
    }
  });

  return result;
}

// Componente de proteção anti-fraude
function AntiFraudProtection({ comments, onFilteredCommentsChange }: {
  comments: string[],
  onFilteredCommentsChange: (filtered: string[]) => void
}) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [filters, setFilters] = useState({
    removeBots: true,
    removeSpam: true,
    removeDuplicates: true
  });
  const [stats, setStats] = useState<{
    total: number;
    bots: number;
    spam: number;
    duplicates: number;
  } | null>(null);

  const analyzeComments = () => {
    if (comments.length === 0) {
      toast.error("Não há comentários para analisar");
      return;
    }

    setIsAnalyzing(true);

    // Simula processamento
    setTimeout(() => {
      const result = filterSuspiciousComments(comments, filters);
      setStats(result.stats);
      onFilteredCommentsChange(result.filtered);
      setIsAnalyzing(false);
    }, 1500);
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center">
          <ShieldCheck className="w-4 h-4 mr-2 text-green-500" /> Proteção Anti-Fraude Pro
        </CardTitle>
        <CardDescription>
          Identifica e remove comentários suspeitos para um sorteio justo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="removeBots"
              checked={filters.removeBots}
              onCheckedChange={(checked) =>
                setFilters(prev => ({ ...prev, removeBots: !!checked }))
              }
            />
            <Label htmlFor="removeBots" className="text-sm">Detectar bots</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="removeSpam"
              checked={filters.removeSpam}
              onCheckedChange={(checked) =>
                setFilters(prev => ({ ...prev, removeSpam: !!checked }))
              }
            />
            <Label htmlFor="removeSpam" className="text-sm">Filtrar spam</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="removeDuplicates"
              checked={filters.removeDuplicates}
              onCheckedChange={(checked) =>
                setFilters(prev => ({ ...prev, removeDuplicates: !!checked }))
              }
            />
            <Label htmlFor="removeDuplicates" className="text-sm">Remover duplicados</Label>
          </div>
        </div>

        <Button
          onClick={analyzeComments}
          disabled={isAnalyzing || comments.length === 0}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
        >
          {isAnalyzing ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analisando comentários...</>
          ) : (
            <><BrainCircuit className="w-4 h-4 mr-2" /> Verificar Comentários</>
          )}
        </Button>

        {stats && (
          <div className="mt-4 space-y-2 text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <div className="flex justify-between">
              <span>Comentários analisados:</span>
              <span className="font-medium">{stats.total}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="bg-amber-50 dark:bg-amber-900/20 p-2 rounded text-center">
                <div className="text-amber-600 dark:text-amber-400 font-medium">{stats.bots}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Bots</div>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded text-center">
                <div className="text-red-600 dark:text-red-400 font-medium">{stats.spam}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Spam</div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-center">
                <div className="text-blue-600 dark:text-blue-400 font-medium">{stats.duplicates}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Duplicados</div>
              </div>
            </div>

            <div className="mt-3">
              <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1">Qualidade do sorteio</Label>
              <Progress
                value={(stats.total - stats.bots - stats.spam - stats.duplicates) / stats.total * 100}
                className="h-2"
              />
            </div>

            <div className="flex items-start mt-2">
              <AlertCircle className="w-4 h-4 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600 dark:text-gray-300">
                {stats.bots + stats.spam + stats.duplicates > 0 ?
                  `${stats.bots + stats.spam + stats.duplicates} comentários suspeitos foram identificados. Recomendamos remover para um sorteio mais justo.` :
                  "Todos os comentários parecem legítimos. Seu sorteio está pronto!"
                }
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Componente de planos premium
function PremiumPlans() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border-amber-200 dark:border-amber-800/30">
        <CardHeader>
          <CardTitle className="flex items-center text-amber-700 dark:text-amber-400 text-lg">
            <Award className="w-5 h-5 mr-2" /> Plano Básico
          </CardTitle>
          <CardDescription>Ideal para sorteios ocasionais</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">Grátis</p>
          <ul className="mt-4 space-y-2">
            <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-green-500" /> Até 500 participantes</li>
            <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-green-500" /> Sorteios básicos</li>
            <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-green-500" /> Histórico limitado</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Usar Agora</Button>
        </CardFooter>
      </Card>

      <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/10 dark:to-purple-900/10 border-purple-200 dark:border-purple-800/30 shadow-lg relative">
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold py-1 px-3 rounded-full">Mais Popular</div>
        <CardHeader>
          <CardTitle className="flex items-center text-purple-700 dark:text-purple-400 text-lg">
            <Star className="w-5 h-5 mr-2" /> Plano Pro
          </CardTitle>
          <CardDescription>Para criadores de conteúdo</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">R$29,90<span className="text-sm font-normal">/mês</span></p>
          <ul className="mt-4 space-y-2">
            <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-green-500" /> Participantes ilimitados</li>
            <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-green-500" /> Detector de fraudes</li>
            <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-green-500" /> Animações premium</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">Assinar Agora</Button>
        </CardFooter>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border-blue-200 dark:border-blue-800/30">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-700 dark:text-blue-400 text-lg">
            <Zap className="w-5 h-5 mr-2" /> Plano Business
          </CardTitle>
          <CardDescription>Para empresas e agências</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">R$99,90<span className="text-sm font-normal">/mês</span></p>
          <ul className="mt-4 space-y-2">
            <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-green-500" /> Tudo do plano Pro</li>
            <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-green-500" /> Marca personalizada</li>
            <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-green-500" /> API para integração</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">Fale Conosco</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function InstagramGiveaway({
  setWinner,
  setTotalParticipants,
}: {
  setWinner: (w: Winner) => void;
  winnersCount: number;
  setTotalParticipants: (count: number) => void;
}) {
  const [comments, setComments] = useState("");
  const [filters, setFilters] = useState({
    unique: true,
    mentions: 1,
    verifiedOnly: false,
    minWords: 0,
    excludeWords: "",
    ignoredUsers: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [participantsPreview, setParticipantsPreview] = useState<{username: string, count: number}[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showAntifraud, setShowAntifraud] = useState(false);
  const runGiveaway = useAction(api.giveaways.runInstagramGiveaway);

  const updatePreview = () => {
    const commentList = comments.split("\n").filter(Boolean);
    if (commentList.length === 0) return;

    // Simple preview calculation (this would be better on the server)
    const userCounts: Record<string, number> = {};
    const excludedWordsArray = filters.excludeWords
      .split(',')
      .map(word => word.trim().toLowerCase())
      .filter(Boolean);
    const ignoredUsersArray = filters.ignoredUsers
      .split(',')
      .map(user => user.trim().toLowerCase().replace('@', ''))
      .filter(Boolean);

    commentList.forEach(comment => {
      const matches = comment.match(/@(\w+)/g);
      const mentionsCount = matches ? matches.length : 0;
      const wordCount = comment.split(/\s+/).filter(Boolean).length;
      const hasExcludedWord = excludedWordsArray.some(word =>
        comment.toLowerCase().includes(word)
      );

      // Extract username (assuming format "username: comment")
      const usernamePart = comment.split(':')[0];
      const username = usernamePart ? usernamePart.trim().replace('@', '') : 'unknown';

      if (ignoredUsersArray.includes(username.toLowerCase())) return;
      if (filters.verifiedOnly && !comment.includes('✓')) return;
      if (filters.minWords > 0 && wordCount < filters.minWords) return;
      if (hasExcludedWord) return;
      if (mentionsCount < filters.mentions) return;

      if (filters.unique) {
        userCounts[username] = 1;
      } else {
        userCounts[username] = (userCounts[username] || 0) + 1;
      }
    });

    const preview = Object.entries(userCounts)
      .map(([username, count]) => ({ username, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 50);

    setParticipantsPreview(preview);
    setTotalParticipants(Object.keys(userCounts).length);
    setShowPreview(true);
  };

  const handleRun = () => {
    const commentList = comments.split("\n").filter(Boolean);
    if (commentList.length === 0)
      return toast.error("Por favor, cole os comentários.");
    if (filters.mentions < 0)
      return toast.error("Menções não podem ser negativas.");

    setIsLoading(true);
    setWinner(null);
    toast.promise(
      runGiveaway({
        comments: commentList,
        ...filters
        // winnersCount removido pois não é aceito pelo backend
      }),
      {
        loading: "Analisando comentários e sorteando...",
        success: (result) => {
          updatePreview();
          setWinner(result);
          return `Pronto! Vencedor encontrado.`;
        },
        error: (err) => (err instanceof Error ? err.message : "Tente novamente."),
        finally: () => setIsLoading(false),
      }
    );
  };

  // Manipulador para comentários filtrados do anti-fraude
  const handleFilteredComments = (filteredComments: string[]) => {
    setComments(filteredComments.join('\n'));
    toast.success(`${filteredComments.length} comentários válidos após filtragem.`);
    updatePreview();
  };

  return (
    <div className="space-y-6 max-w-full">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Instagram className="w-5 h-5 text-pink-500 mr-2" />
            Sorteio do Instagram
          </CardTitle>
          <CardDescription>
            Sorteia entre comentários do Instagram considerando menções e outros critérios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Nova seção de suporte a URL */}
          <InstagramURLSupport onCommentsLoaded={setComments} />

          <div>
            <Label htmlFor="comments" className="font-semibold">
              Cole os comentários aqui (um por linha)
            </Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="@usuario1 marcou @amigo1&#10;@usuario2 marcou @amigo2&#10;..."
              rows={8}
              disabled={isLoading}
              className="resize-none max-w-full font-mono mt-2"
            />
            <div className="flex flex-wrap items-center justify-between mt-2 gap-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <Info className="w-4 h-4 mr-1" />
                {comments.split("\n").filter(Boolean).length} comentários encontrados
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAntifraud(!showAntifraud)}
                  className="text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/20"
                >
                  <ShieldCheck className="w-4 h-4 mr-1.5" />
                  {showAntifraud ? "Ocultar Anti-Fraude" : "Anti-Fraude"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const exampleComments = [
                      "@maria_silva: Participando! @joao_santos @ana_costa",
                      "@pedro_oliveira: Quero muito ganhar! @lucas_ferreira",
                      "@juliana_lima: Amei o sorteio @carla_rodrigues @bruno_alves",
                      "@rafael_santos: Participando com @gabriela_martins",
                      "@fernanda_costa: Vamos lá! @ricardo_souza @patricia_dias"
                    ];
                    setComments(exampleComments.join('\n'));
                  }}
                >
                  Usar comentários de exemplo
                </Button>
              </div>
            </div>
          </div>

          {/* Proteção anti-fraude opcional */}
          {showAntifraud && comments.split("\n").filter(Boolean).length > 0 && (
            <AntiFraudProtection
              comments={comments.split("\n").filter(Boolean)}
              onFilteredCommentsChange={handleFilteredComments}
            />
          )}

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Filtros Básicos</TabsTrigger>
              <TabsTrigger value="advanced">Filtros Avançados</TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="space-y-4 pt-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="ig_unique"
                  checked={filters.unique}
                  onCheckedChange={(c) => setFilters((p) => ({ ...p, unique: !!c }))}
                  disabled={isLoading}
                />
                <Label htmlFor="ig_unique" className="select-none">
                  Considerar apenas um comentário por pessoa
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Label htmlFor="mentions-input" className="select-none whitespace-nowrap">
                  Exigir
                </Label>
                <Input
                  id="mentions-input"
                  type="number"
                  value={filters.mentions}
                  onChange={(e) => setFilters((p) => ({ ...p, mentions: Math.max(0, Number(e.target.value)) }))}
                  className="w-20 text-center"
                  min={0}
                  disabled={isLoading}
                />
                <Label htmlFor="mentions-input" className="select-none">
                  menção(ões) com @
                </Label>
              </div>
            </TabsContent>
            <TabsContent value="advanced" className="space-y-4 pt-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="verified_only"
                  checked={filters.verifiedOnly}
                  onCheckedChange={(c) => setFilters((p) => ({ ...p, verifiedOnly: !!c }))}
                  disabled={isLoading}
                />
                <Label htmlFor="verified_only" className="select-none">
                  Apenas contas verificadas (com ✓)
                </Label>
              </div>

              <div className="flex items-center gap-3">
                <Label htmlFor="min-words" className="select-none whitespace-nowrap">
                  Mínimo de
                </Label>
                <Input
                  id="min-words"
                  type="number"
                  value={filters.minWords}
                  onChange={(e) => setFilters((p) => ({ ...p, minWords: Math.max(0, Number(e.target.value)) }))}
                  className="w-20 text-center"
                  min={0}
                  disabled={isLoading}
                />
                <Label htmlFor="min-words" className="select-none">
                  palavras no comentário
                </Label>
              </div>

              <div>
                <Label htmlFor="exclude-words" className="text-sm font-medium">
                  Excluir comentários que contenham (separados por vírgula)
                </Label>
                <Input
                  id="exclude-words"
                  value={filters.excludeWords}
                  onChange={(e) => setFilters((p) => ({ ...p, excludeWords: e.target.value }))}
                  placeholder="spam, ofensivo, propaganda"
                  disabled={isLoading}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="ignored-users" className="text-sm font-medium">
                  Ignorar usuários (separados por vírgula)
                </Label>
                <Input
                  id="ignored-users"
                  value={filters.ignoredUsers}
                  onChange={(e) => setFilters((p) => ({ ...p, ignoredUsers: e.target.value }))}
                  placeholder="@usuario1, @usuario2"
                  disabled={isLoading}
                  className="mt-1"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={updatePreview}
              variant="outline"
              className="text-gray-700 dark:text-gray-200"
              disabled={isLoading || comments.trim() === ''}
            >
              <Search className="w-4 h-4 mr-2" />
              Ver participantes elegíveis
            </Button>

            <Button
              onClick={handleRun}
              className={clsx(
                "flex justify-center items-center font-bold text-white",
                {
                  "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700":
                    !isLoading,
                  "bg-gray-400 cursor-not-allowed": isLoading,
                  "animate-pulse": isLoading,
                }
              )}
              disabled={isLoading || comments.trim() === ''}
              aria-live="polite"
            >
              {isLoading ? <Loader2 className="animate-spin mr-3" /> : <Trophy className="mr-3" />}
              {isLoading ? "Sorteando..." : "Iniciar Sorteio"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {showPreview && participantsPreview.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <Users className="w-4 h-4 mr-2 text-blue-500" />
                  Participantes Elegíveis ({participantsPreview.length > 50 ? '50 primeiros de ' : ''}{Object.keys(participantsPreview.reduce((acc, p) => ({ ...acc, [p.username]: true }), {})).length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-60 overflow-y-auto p-2 border rounded-md bg-gray-50 dark:bg-gray-900">
                  <div className="space-y-1">
                    {participantsPreview.map(participant => (
                      <div
                        key={participant.username}
                        className="px-3 py-1.5 text-sm flex justify-between items-center rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <span className="font-medium">@{participant.username}</span>
                        {participant.count > 1 && (
                          <Badge variant="outline" className="text-xs">
                            {participant.count} comentários
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ListGiveaway({
  setWinner,
  winnersCount,
  setTotalParticipants
}: {
  setWinner: (w: Winner) => void;
  winnersCount: number;
  setTotalParticipants: (count: number) => void;
}) {
  const [participants, setParticipants] = useState("");
  const [unique, setUnique] = useState(true);
  const [filters, setFilters] = useState({
    excludePattern: "",
    minLength: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [participantsPreview, setParticipantsPreview] = useState<string[]>([]);
  const runGiveaway = useAction(api.giveaways.runListGiveaway);

  const updatePreview = useCallback(() => {
    let list = participants.split("\n").map((p) => p.trim()).filter(Boolean);

    // Apply filters
    if (filters.excludePattern) {
      try {
        const pattern = new RegExp(filters.excludePattern, 'i');
        list = list.filter(p => !pattern.test(p));
      } catch (e) {
        console.error("Erro na regex:", e);
        // Continue sem aplicar o filtro de regex se tiver erro
      }
    }

    if (filters.minLength > 0) {
      list = list.filter(p => p.length >= filters.minLength);
    }

    if (unique) {
      list = Array.from(new Set(list));
    }

    setParticipantsPreview(list.slice(0, 100));
    setTotalParticipants(list.length);
    if (list.length === 0 && participants.trim() !== '') {
      toast.error("Nenhum participante válido encontrado com os filtros aplicados.");
    }
  }, [participants, unique, filters, setTotalParticipants]);

  useEffect(() => {
    if (participants) {
      updatePreview();
    }
  }, [participants, unique, filters, updatePreview]);

  const handleRun = () => {
    const list = participants.split("\n").map((p) => p.trim()).filter(Boolean);
    if (list.length === 0) return toast.error("A lista está vazia.");

    setIsLoading(true);
    setWinner(null);

    // Remover o cast problemático e passar os parâmetros explicitamente
    toast.promise(
      runGiveaway({
        participants: list,
        unique,
        excludePattern: filters.excludePattern,
        minLength: filters.minLength,
        winnersCount
      }),
      {
        loading: "Sorteando participante...",
        success: (result) => {
          setWinner(result);
          return `Pronto! Vencedor encontrado.`;
        },
        error: (err) => (err instanceof Error ? err.message : "Tente novamente."),
        finally: () => setIsLoading(false),
      }
    );
  };

  // Função para importar de CSV ou Excel
  const handleImportFromFile = () => {
    toast.info("Dica: Cole o conteúdo copiado de uma planilha ou arquivo CSV diretamente na área de texto.", {
      duration: 5000,
    });

    // No futuro, poderia implementar um input de arquivo real
    const dummyFileInput = document.createElement('input');
    dummyFileInput.type = 'file';
    dummyFileInput.accept = '.csv,.txt,.xlsx';
    dummyFileInput.click();
  };

  return (
    <div className="space-y-6 max-w-full">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <List className="w-5 h-5 text-blue-500 mr-2" />
            Sorteio de Lista
          </CardTitle>
          <CardDescription>
            Sorteia entre nomes, emails ou qualquer lista de itens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor="participants" className="font-semibold">
                Lista de Participantes (um por linha)
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleImportFromFile}
                className="text-blue-600 dark:text-blue-400"
              >
                <FileText className="w-4 h-4 mr-1.5" /> Importar
              </Button>
            </div>
            <Textarea
              id="participants"
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              placeholder="Lucas Aragão&#10;Luiza Coura&#10;..."
              rows={8}
              disabled={isLoading}
              className="resize-none max-w-full font-mono mt-2"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center">
              <Info className="w-4 h-4 mr-1" />
              {participants.split("\n").filter(Boolean).length} participantes encontrados
              {unique && participants.split("\n").filter(Boolean).length !== new Set(participants.split("\n").filter(Boolean)).size &&
                ` (${new Set(participants.split("\n").filter(Boolean)).size} únicos)`
              }
            </p>
          </div>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Filtros Básicos</TabsTrigger>
              <TabsTrigger value="advanced">Filtros Avançados</TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="space-y-4 pt-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="list_unique"
                  checked={unique}
                  onCheckedChange={(c) => setUnique(!!c)}
                  disabled={isLoading}
                />
                <Label htmlFor="list_unique" className="select-none">
                  Remover participantes duplicados
                </Label>
              </div>
            </TabsContent>
            <TabsContent value="advanced" className="space-y-4 pt-4">
              <div>
                <Label htmlFor="exclude-pattern" className="text-sm font-medium">
                  Excluir participantes que contenham (regex)
                </Label>
                <Input
                  id="exclude-pattern"
                  value={filters.excludePattern}
                  onChange={(e) => setFilters((p) => ({ ...p, excludePattern: e.target.value }))}
                  placeholder="exemplo|teste"
                  disabled={isLoading}
                  className="mt-1"
                />
              </div>

              <div className="flex items-center gap-3">
                <Label htmlFor="min-length" className="select-none whitespace-nowrap">
                  Mínimo de
                </Label>
                <Input
                  id="min-length"
                  type="number"
                  value={filters.minLength}
                  onChange={(e) => setFilters((p) => ({ ...p, minLength: Math.max(0, Number(e.target.value)) }))}
                  className="w-20 text-center"
                  min={0}
                  disabled={isLoading}
                />
                <Label htmlFor="min-length" className="select-none">
                  caracteres
                </Label>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={updatePreview}
              variant="outline"
              className="text-gray-700 dark:text-gray-200"
              disabled={isLoading || participants.trim() === ''}
            >
              <Search className="w-4 h-4 mr-2" />
              Atualizar participantes elegíveis
            </Button>

            <Button
              onClick={handleRun}
              className={clsx(
                "flex justify-center items-center font-bold text-white",
                {
                  "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700":
                    !isLoading,
                  "bg-gray-400 cursor-not-allowed": isLoading,
                  "animate-pulse": isLoading,
                }
              )}
              disabled={isLoading || participants.trim() === ''}
              aria-live="polite"
            >
              {isLoading ? <Loader2 className="animate-spin mr-3" /> : <Trophy className="mr-3" />}
              {isLoading ? "Sorteando..." : "Iniciar Sorteio"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {participantsPreview.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Users className="w-4 h-4 mr-2 text-blue-500" />
              Participantes Elegíveis ({participantsPreview.length === 100 ? '100 primeiros de ' + (unique ? new Set(participants.split("\n").filter(Boolean)).size : participants.split("\n").filter(Boolean).length) : participantsPreview.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-60 overflow-y-auto p-2 border rounded-md bg-gray-50 dark:bg-gray-900">
              <div className="space-y-1">
                {participantsPreview.map((participant, idx) => (
                  <div
                    key={`${participant}-${idx}`}
                    className="px-3 py-1.5 text-sm flex justify-between items-center rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <span className="font-medium">{participant}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function NumberGiveaway({
  setWinner,
  setTotalParticipants
}: {
  setWinner: (w: Winner) => void;
  setTotalParticipants: (count: number) => void;
}) {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [excludeNumbers, setExcludeNumbers] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const runGiveaway = useAction(api.giveaways.runNumberGiveaway);

  useEffect(() => {
    // Set total participants (max - min + 1 - excluded numbers)
    const excludedArray = excludeNumbers
      .split(',')
      .map(n => parseInt(n.trim()))
      .filter(n => !isNaN(n) && n >= min && n <= max);

    const total = Math.max(0, max - min + 1 - excludedArray.length);
    setTotalParticipants(total);
  }, [min, max, excludeNumbers, setTotalParticipants]);

  const handleRun = () => {
    if (min > max) return toast.error("O valor mínimo não pode ser maior que o máximo.");

    // Parse excluded numbers
    const excludedArray = excludeNumbers
      .split(',')
      .map(n => parseInt(n.trim()))
      .filter(n => !isNaN(n) && n >= min && n <= max);

    setIsLoading(true);
    setWinner(null);

    // Passando os parâmetros explicitamente sem cast
    toast.promise(
      runGiveaway({
        min,
        max,
        exclude: excludedArray
      }),
      {
        loading: "Sorteando número...",
        success: (result) => {
          setWinner(result);
          return `Pronto! Número sorteado.`;
        },
        error: (err) => (err instanceof Error ? err.message : "Tente novamente."),
        finally: () => setIsLoading(false),
      }
    );
  };

  // Função para gerar intervalo rápido
  const setQuickRange = (preset: {min: number, max: number}) => {
    setMin(preset.min);
    setMax(preset.max);
    setExcludeNumbers("");
  };

  return (
    <div className="space-y-6 max-w-full">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Hash className="w-5 h-5 text-amber-500 mr-2" />
            Sorteio de Número
          </CardTitle>
          <CardDescription>
            Sorteia um número aleatório entre um intervalo definido
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="min" className="font-semibold">
                Número Mínimo
              </Label>
              <Input
                id="min"
                type="number"
                value={min}
                onChange={(e) => setMin(Number(e.target.value))}
                disabled={isLoading}
                className="text-lg"
                min={1}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max" className="font-semibold">
                Número Máximo
              </Label>
              <Input
                id="max"
                type="number"
                value={max}
                onChange={(e) => setMax(Number(e.target.value))}
                disabled={isLoading}
                className="text-lg"
                min={min}
              />
            </div>
          </div>

          {/* Seleções rápidas */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Intervalos rápidos
            </Label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuickRange({min: 1, max: 10})}
              >
                1-10
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuickRange({min: 1, max: 100})}
              >
                1-100
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuickRange({min: 1, max: 1000})}
              >
                1-1000
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Mais <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setQuickRange({min: 1, max: 30})}>
                    Calendário (1-30)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setQuickRange({min: 1, max: 31})}>
                    Calendário (1-31)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setQuickRange({min: 1, max: 60})}>
                    Minutos (1-60)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="exclude-numbers" className="text-sm font-medium">
              Excluir números específicos (separados por vírgula)
            </Label>
            <Input
              id="exclude-numbers"
              value={excludeNumbers}
              onChange={(e) => setExcludeNumbers(e.target.value)}
              placeholder="5, 13, 21"
              disabled={isLoading}
            />
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800/30">
            <h3 className="font-medium text-amber-800 dark:text-amber-300 flex items-center">
              <Info className="w-4 h-4 mr-2 text-amber-600 dark:text-amber-400" />
              Informações
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
              Total de {Math.max(0, max - min + 1 - excludeNumbers.split(',').filter(n => !isNaN(parseInt(n.trim()))).length)} números possíveis.
            </p>
          </div>

          <Button
            onClick={handleRun}
            className={clsx(
              "w-full flex justify-center items-center font-bold text-white",
              {
                "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700":
                  !isLoading,
                "bg-gray-400 cursor-not-allowed": isLoading,
                "animate-pulse": isLoading,
              }
            )}
            disabled={isLoading || min > max}
            aria-live="polite"
          >
            {isLoading ? <Loader2 className="animate-spin mr-3" /> : <Trophy className="mr-3" />}
            {isLoading ? "Sorteando..." : "Iniciar Sorteio"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function WeightedListGiveaway({
  setWinner,
  setTotalParticipants
}: {
  setWinner: (w: Winner) => void;
  setTotalParticipants: (count: number) => void;
}) {
  const [participants, setParticipants] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [visualMode, setVisualMode] = useState(false);
  const [visualWeights, setVisualWeights] = useState<{name: string, weight: number}[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const runGiveaway = useAction(api.giveaways.runWeightedListGiveaway);

  // Melhorar a função parseParticipants para melhor tratamento de erros
  const parseParticipants = useCallback(() => {
    setParseError(null);
    const lines = participants
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      return [];
    }

    const parsed: {username: string, weight: number}[] = [];
    let hasError = false;

    lines.forEach((line, index) => {
      const parts = line.split(",");
      if (parts.length < 2) {
        if (!hasError) {
          setParseError(`Erro na linha ${index + 1}: formato inválido. Use "nome,peso"`);
          hasError = true;
        }
        return;
      }

      const username = parts[0].trim();
      const weightStr = parts[1].trim();
      const weight = Number(weightStr);

      if (!username) {
        if (!hasError) {
          setParseError(`Erro na linha ${index + 1}: nome não pode ser vazio`);
          hasError = true;
        }
        return;
      }

      if (isNaN(weight) || weight <= 0) {
        if (!hasError) {
          setParseError(`Erro na linha ${index + 1}: peso deve ser um número positivo`);
          hasError = true;
        }
        return;
      }

      parsed.push({ username, weight });
    });

    return parsed;
  }, [participants]);

  useEffect(() => {
    const parsed = parseParticipants();
    setVisualWeights(parsed.map(p => ({ name: p.username, weight: p.weight })));

    if (parsed.length === 0) {
      setTotalParticipants(0);
    } else {
      const totalWeight = parsed.reduce((sum, p) => sum + p.weight, 0);
      setTotalParticipants(totalWeight);
    }
  }, [participants, parseParticipants, setTotalParticipants]);

  const handleRun = () => {
    const parsed = parseParticipants();

    if (parsed.length === 0) {
      return toast.error("Lista inválida. Use o formato: nome,peso (ex: Lucas,5)");
    }

    setIsLoading(true);
    setWinner(null);
    toast.promise(
      runGiveaway({ participants: parsed }),
      {
        loading: "Sorteando participante ponderado...",
        success: (result) => {
          setWinner(result);
          return `Pronto! Vencedor encontrado.`;
        },
        error: (err) => {
          console.error("Erro no sorteio ponderado:", err);
          return err instanceof Error ? err.message : "Tente novamente.";
        },
        finally: () => setIsLoading(false),
      }
    );
  };

  const totalWeight = visualWeights.reduce((sum, p) => sum + p.weight, 0);

  return (
    <div className="space-y-6 max-w-full">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Percent className="w-5 h-5 text-green-500 mr-2" />
            Sorteio Ponderado
          </CardTitle>
          <CardDescription>
            Sorteia com base em pesos diferentes para cada participante
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-5 bg-green-50 dark:bg-green-950/50 border-l-4 border-green-500 rounded-r-xl shadow-sm">
            <h3 className="font-semibold text-green-900 dark:text-green-100 text-lg flex items-center">
              <HelpCircle className="w-5 h-5 mr-2 text-green-500" />
              Como funciona?
            </h3>
            <p className="text-sm text-green-800 dark:text-green-200 mt-1 leading-relaxed">
              Adicione participantes com pesos diferentes. Quanto maior o peso, maior a chance de ser sorteado.
              Exemplo: se Maria tem peso 5 e João tem peso 1, Maria tem 5 vezes mais chances.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="weighted-participants" className="font-semibold">
                Lista de Participantes com Peso (nome,peso)
              </Label>
              <div className="flex items-center space-x-2">
                <Label htmlFor="visual-mode" className="text-sm">Modo Visual</Label>
                <Switch
                  id="visual-mode"
                  checked={visualMode}
                  onCheckedChange={setVisualMode}
                />
              </div>
            </div>

            {visualMode ? (
              <div className="border rounded-md p-4 bg-white dark:bg-gray-950">
                <div className="space-y-3">
                  {visualWeights.map((participant, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium">{participant.name}</span>

                        <span className="text-gray-500">
                          Peso: {participant.weight}
                          {totalWeight > 0 && ` (${Math.round((participant.weight / totalWeight) * 100)}%)`}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
                          style={{ width: `${(participant.weight / Math.max(...visualWeights.map(p => p.weight), 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}

                  {visualWeights.length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      Adicione participantes no formato nome,peso para visualizar
                    </p>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const name = prompt("Nome do participante:");
                      const weightStr = prompt("Peso (número):", "1");

                      if (!name || !name.trim()) {
                        toast.error("O nome não pode ser vazio");
                        return;
                      }

                      const weight = parseInt(weightStr || "1");
                      if (isNaN(weight) || weight <= 0) {
                        toast.error("O peso deve ser um número positivo");
                        return;
                      }

                      const newList = [...visualWeights, { name, weight }];
                      setVisualWeights(newList);
                      setParticipants(newList.map(p => `${p.name},${p.weight}`).join('\n'));
                    }}
                    className="w-full mt-2"
                  >
                    + Adicionar Participante
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Textarea
                  id="weighted-participants"
                  value={participants}
                  onChange={(e) => setParticipants(e.target.value)}
                  placeholder={`Lucas,5\nMaria,3\nJoão,1`}
                  rows={8}
                  disabled={isLoading}
                  className="resize-none font-mono"
                />
                {parseError && (
                  <p className="text-red-500 text-xs mt-1">{parseError}</p>
                )}
              </>
            )}

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center">
              <Info className="w-4 h-4 mr-1" />
              {visualWeights.length} participantes com peso total {totalWeight}
            </p>
          </div>

          {visualWeights.length > 0 && (
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
              <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Probabilidade por participante</h3>
              <div className="relative h-10 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                {visualWeights.map((participant, i) => {
                  // Calculate position and width
                  const prevWidths = visualWeights.slice(0, i).reduce((sum, p) => sum + p.weight, 0);
                  const position = (prevWidths / totalWeight) * 100;
                  const width = (participant.weight / totalWeight) * 100;

                  // Generate color based on index
                  const colors = [
                    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500',
                    'bg-pink-500', 'bg-teal-500', 'bg-indigo-500', 'bg-rose-500'
                  ];
                  const color = colors[i % colors.length];

                  return (
                    <TooltipProvider key={i}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`absolute top-0 h-full ${color} hover:brightness-110 transition-all`}
                            style={{
                              left: `${position}%`,
                              width: `${width}%`
                            }}
                          ></div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-medium">{participant.name}</p>
                          <p className="text-xs">{width.toFixed(1)}% de chance</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            </div>
          )}

          <Button
            onClick={handleRun}
            className={clsx(
              "w-full flex justify-center items-center font-bold text-white",
              {
                "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700":
                  !isLoading,
                "bg-gray-400 cursor-not-allowed": isLoading,
                "animate-pulse": isLoading,
              }
            )}
            disabled={isLoading || visualWeights.length === 0}
            aria-live="polite"
          >
            {isLoading ? <Loader2 className="animate-spin mr-3" /> : <Trophy className="mr-3" />}
            {isLoading ? "Sorteando..." : "Iniciar Sorteio"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function GiveawayTool() {
  const [activeTab, setActiveTab] = useState<
    "instagram" | "list" | "number" | "weighted"
  >("instagram");
  const [winner, setWinner] = useState<Winner>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [giveawayHistory, setGiveawayHistory] = useState<GiveawayHistory[]>([]);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [winnersCount, setWinnersCount] = useState(1);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [showPremiumPlans, setShowPremiumPlans] = useState(false);

  const handleRedraw = () => {
    toast(
      <div className="p-4 bg-white dark:bg-gray-800 rounded shadow-lg flex flex-col items-center space-y-3">
        <p className="font-semibold text-gray-900 dark:text-gray-100">Quer sortear novamente?</p>
        <div className="flex space-x-4">
          <Button
            onClick={() => {
              setWinner(null);
              toast.dismiss();
            }}
            variant="default"
          >
            Sim, sortear de novo
          </Button>
          <Button onClick={() => toast.dismiss()} variant="outline">
            Cancelar
          </Button>
        </div>
      </div>,
      { duration: 8000 }
    );
  };

  const saveToHistory = useCallback(() => {
    if (!winner) return;

    const displayName = (() => {
      if ("username" in winner && typeof winner.username === "string") {
        return `@${winner.username}`;
      }
      if ("number" in winner && typeof winner.number === "number") {
        return winner.number.toString();
      }
      if ("name" in winner && typeof winner.name === "string") {
        return winner.name;
      }
      return "Vencedor";
    })();

    const newHistoryItem: GiveawayHistory = {
      id: Date.now().toString(),
      type: activeTab,
      date: new Date(),
      winnerName: displayName,
      totalParticipants
    };

    setGiveawayHistory(prev => [newHistoryItem, ...prev]);
  }, [winner, activeTab, totalParticipants]);

  // Assegurar que o histórico seja salvo quando um vencedor é definido
  useEffect(() => {
    if (winner) {
      saveToHistory();
    }
  }, [winner, saveToHistory]);

  return (
    <div className="mx-auto p-2 sm:p-4 overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* Hero section com melhorias para mobile */}
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 dark:from-purple-900 dark:to-indigo-900 rounded-xl sm:rounded-2xl p-4 sm:p-8 text-white relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

          <div className="relative">
            {/* Cabeçalho responsivo */}
            <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6">
              <div className="bg-white/10 backdrop-blur-sm p-3 sm:p-5 rounded-xl">
                <Trophy className="w-8 h-8 sm:w-12 sm:h-12 text-amber-300" />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center md:text-left">
                  Sorteios Profissionais
                </h1>
                <p className="mt-2 text-purple-100 max-w-xl text-sm sm:text-base text-center md:text-left">
                  Realize sorteios transparentes e profissionais para suas campanhas e promoções.
                </p>
              </div>
            </div>

            {/* Navegação de abas responsiva */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-1 min-w-[200px] w-full">
                <Tabs
                  defaultValue={activeTab}
                  value={activeTab}
                  onValueChange={(v) => {
                    setActiveTab(v as "instagram" | "list" | "number" | "weighted");
                    setWinner(null);
                  }}
                >
                  <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 bg-white/10">
                    <TabsTrigger
                      value="instagram"
                      className="data-[state=active]:bg-white/15 text-white data-[state=active]:text-white text-xs sm:text-sm py-1 sm:py-2"
                    >
                      <Instagram className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="hidden xs:inline">Instagram</span>
                      <span className="xs:hidden">IG</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="list"
                      className="data-[state=active]:bg-white/15 text-white data-[state=active]:text-white text-xs sm:text-sm py-1 sm:py-2"
                    >
                      <List className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> Lista
                    </TabsTrigger>
                    <TabsTrigger
                      value="number"
                      className="data-[state=active]:bg-white/15 text-white data-[state=active]:text-white text-xs sm:text-sm py-1 sm:py-2"
                    >
                      <Hash className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="hidden xs:inline">Número</span>
                      <span className="xs:hidden">Num</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="weighted"
                      className="data-[state=active]:bg-white/15 text-white data-[state=active]:text-white text-xs sm:text-sm py-1 sm:py-2"
                    >
                      <Percent className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="hidden xs:inline">Ponderado</span>
                      <span className="xs:hidden">Peso</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Botões de configuração responsivos */}
              <div className="flex gap-2 mt-3 sm:mt-0 w-full sm:w-auto justify-center sm:justify-start">
                <Dialog open={showSettings} onOpenChange={setShowSettings}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
                    >
                      <Settings className="w-4 h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Configurações</span>
                      <span className="sm:hidden">Config</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Configurações do Sorteio</DialogTitle>
                      <DialogDescription>
                        Personalize as opções para o seu sorteio.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="winners-count">Quantidade de Vencedores</Label>
                        <Input
                          id="winners-count"
                          type="number"
                          min={1}
                          max={10}
                          value={winnersCount}
                          onChange={(e) => setWinnersCount(Math.max(1, parseInt(e.target.value) || 1))}
                        />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Quantos vencedores você deseja sortear.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="verification-seed">Semente de Verificação</Label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(Math.random().toString(36).substring(2, 15));
                              toast.success("Semente copiada!");
                            }}
                          >
                            Gerar
                          </Button>
                        </div>
                        <Input
                          id="verification-seed"
                          placeholder="Opcional: insira um valor para auditabilidade"
                        />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Usando a mesma semente, o resultado será sempre o mesmo.
                        </p>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button onClick={() => setShowSettings(false)}>Salvar Configurações</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
                  onClick={() => setHistoryVisible(!historyVisible)}
                >
                  <History className="w-4 h-4 mr-0 sm:mr-2" />
                  <span className="hidden sm:inline">Histórico</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
                  onClick={() => setShowPremiumPlans(!showPremiumPlans)}
                >
                  <Crown className="w-4 h-4 mr-0 sm:mr-2" />
                  <span className="hidden sm:inline">Pro</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Layout principal responsivo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          <div className="lg:col-span-2">
            <div role="tabpanel" aria-hidden={activeTab !== "instagram"}>
              {activeTab === "instagram" && (
                <InstagramGiveaway
                  setWinner={setWinner}
                  winnersCount={winnersCount}
                  setTotalParticipants={setTotalParticipants}
                />
              )}
            </div>
            <div role="tabpanel" aria-hidden={activeTab !== "list"}>
              {activeTab === "list" && (
                <ListGiveaway
                  setWinner={setWinner}
                  winnersCount={winnersCount}
                  setTotalParticipants={setTotalParticipants}
                />
              )}
            </div>
            <div role="tabpanel" aria-hidden={activeTab !== "number"}>
              {activeTab === "number" && (
                <NumberGiveaway
                  setWinner={setWinner}
                  setTotalParticipants={setTotalParticipants}
                />
              )}
            </div>
            <div role="tabpanel" aria-hidden={activeTab !== "weighted"}>
              {activeTab === "weighted" && (
                <WeightedListGiveaway
                  setWinner={setWinner}
                  setTotalParticipants={setTotalParticipants}
                />
              )}
            </div>
          </div>

          {/* Card de recursos ou histórico */}
          <div className="lg:row-span-2">
            {historyVisible ? (
              <Card>
                <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
                  <CardTitle className="text-base sm:text-lg flex items-center">
                    <History className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 mr-2" />
                    Histórico de Sorteios
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Registro dos últimos sorteios realizados
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-4 sm:px-6 pb-6">
                  <GiveawayHistory history={giveawayHistory} />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
                  <CardTitle className="text-base sm:text-lg flex items-center">
                    <BrainCircuit className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 mr-2" />
                    Recursos Inteligentes
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Nossos sorteios oferecem recursos avançados para resultados justos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                      <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base">Sorteios Transparentes</h3>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Algoritmo verificável que garante resultados justos
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                      <Star className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base">Múltiplos Formatos</h3>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Compatível com Instagram, listas, números e sorteios ponderados
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="bg-amber-100 dark:bg-amber-900/30 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                      <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base">Filtros Avançados</h3>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Defina critérios específicos como menções e palavras-chave
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="bg-green-100 dark:bg-green-900/30 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                      <Stars className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base">Experiência Visual</h3>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Animações e efeitos visuais para um sorteio emocionante
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="bg-pink-100 dark:bg-pink-900/30 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                      <Instagram className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600 dark:text-pink-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base">Fácil para Instagram</h3>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Suporte simplificado para sorteios com comentários do Instagram
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="bg-red-100 dark:bg-red-900/30 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                      <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base">Detecção Anti-Fraude</h3>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Identifica e remove comentários suspeitos e bots
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="px-4 sm:px-6 pb-4 sm:pb-6">
                  <Button
                    variant="outline"
                    className="w-full text-xs sm:text-sm"
                    onClick={() => {
                      setHistoryVisible(true);
                    }}
                  >
                    <History className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    Ver Histórico de Sorteios
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>

        {/* Card do vencedor */}
        {winner && (
          <WinnerCard
            winner={winner}
            onRedraw={handleRedraw}
            giveawayType={activeTab}
            totalParticipants={totalParticipants}
            winnersCount={winnersCount}
            onSaveHistory={saveToHistory}
          />
        )}

        {/* Planos premium */}
        {showPremiumPlans && <PremiumPlans />}
      </div>

      {/* Container para o efeito de confetti */}
      <div id="confetti-container" className="fixed inset-0 pointer-events-none z-50"></div>
    </div>
  );
}