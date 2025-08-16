"use client";

import { useState, useEffect, useRef } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Loader2,
  RefreshCw,
  Instagram,
  List,
  Users,
  ExternalLink,
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
  Search
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";


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
  const duration = 5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    // since particles fall down, start a bit higher than random
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ['#ffd700', '#ff8c00', '#ff4500', '#9932cc', '#4169e1'],
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ['#ffd700', '#ff8c00', '#ff4500', '#9932cc', '#4169e1'],
    });
  }, 250);
}

// Animated counter for statistics
function AnimatedCounter({ value, duration = 1000 }: { value: number, duration?: number }) {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);
  countRef.current = count;

useEffect(() => {
  const start = 0;
  const step = 20;
  const valueIncrement = (value - start) / (duration / step);

  const interval = setInterval(() => {
    if (countRef.current >= value) {
      setCount(value);
      clearInterval(interval);
      return;
    }

      setCount(Math.min(countRef.current + valueIncrement, value));
    }, step);

    return () => clearInterval(interval);
  }, [value, duration]);

  return <span>{Math.round(count)}</span>;
}

// Screenshot functionality
function captureScreenshot(elementId: string, filename: string = 'sorteio-resultado') {
  // Dynamically import html2canvas only when needed
  import('html2canvas').then(({ default: html2canvas }) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    toast.loading('Capturando screenshot...');

   html2canvas(element, {
 background: undefined,
  logging: false,
  allowTaint: true,
  useCORS: true
}).then(canvas => {
      // Create download link
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      toast.success('Screenshot salvo!');
    }).catch(err => {
      console.error('Screenshot error:', err);
      toast.error('Erro ao capturar imagem');
    });
  }).catch(err => {
    console.error('Error loading html2canvas:', err);
    toast.error('Não foi possível carregar o módulo de captura');
  });
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
  const [speed, setSpeed] = useState(50);
  const [completed, setCompleted] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
   const startTime = Date.now();
    let elapsed = 0;

    const updateIndex = () => {
      elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Exponential slowdown
      const newSpeed = 50 + 450 * Math.pow(progress, 2);
      setSpeed(newSpeed);

      // Increase chance of landing on the selected index as we get closer to the end
      const targetProbability = Math.pow(progress, 3); // Starts tiny, ends at 1
      const random = Math.random();

      if (progress > 0.8 && random < targetProbability) {
        setCurrentIndex(selectedIndex);
      } else {
        setCurrentIndex(Math.floor(Math.random() * items.length));
      }

      if (progress < 1) {
        timeoutRef.current = setTimeout(updateIndex, newSpeed);
      } else {
        setCurrentIndex(selectedIndex);
        setCompleted(true);
        setTimeout(onComplete, 500);
      }
    };

    timeoutRef.current = setTimeout(updateIndex, speed);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [duration, items.length, onComplete, selectedIndex]);

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
              completed && "text-amber-300 drop-shadow-glow"
            )}>
              {items[currentIndex]}
            </h3>
          </motion.div>
        </AnimatePresence>

        <div className="mt-4">
          <Progress
            value={(Date.now() - (timeoutRef.current ? Date.now() - speed : 0)) / duration * 100}
            className="h-2 bg-purple-950"
          />
        </div>
      </div>
    </div>
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
    return "Vencedor";
  })();

  // Get items for dramatic selection
  const selectionItems = (() => {
    if (giveawayType === "number") {
      // Generate random numbers between min and max
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
  })();

  useEffect(() => {
    if (!showSelectionAnimation) {
      launchConfetti();

      // Add to history
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

  if (showSelectionAnimation) {
    return (
      <div className="mt-8 max-w-2xl mx-auto w-full">
        <DramaticSelection
          items={selectionItems}
          duration={3000}
          selectedIndex={selectionItems.length - 1}
          onComplete={() => setShowSelectionAnimation(false)}
        />
      </div>
    );
  }

  return (
    <div className="mt-8 max-w-2xl mx-auto w-full">
      <motion.div
        ref={winnerRef}
        id="winner-card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/30 p-8 rounded-3xl border-4 border-amber-400 dark:border-amber-500/70 text-center shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/confetti-bg.svg')] opacity-10"></div>

        <div className="relative">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg mb-4"
          >
            <Trophy className="w-10 h-10 text-white" />
          </motion.div>

          <motion.h3
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg font-extrabold uppercase tracking-widest text-amber-700 dark:text-amber-500 drop-shadow-sm"
          >
            🎉 E o vencedor é... 🎉
          </motion.h3>

          <div className="mt-6 flex flex-col items-center gap-5 max-w-full">
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
                  width={120}
                  height={120}
                  className="rounded-full border-8 border-white dark:border-gray-800 shadow-xl relative"
                  priority
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: "spring" }}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center shadow-lg"
              >
                <User2 className="w-12 h-12 text-white" />
              </motion.div>
            )}

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-4xl font-extrabold text-gray-900 dark:text-white truncate max-w-full px-4"
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
                <p className="relative text-gray-700 dark:text-gray-200 bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm px-5 py-3 rounded-xl text-lg font-medium shadow-sm max-w-md break-words">
                  {winner.commentText}
                </p>
              </motion.div>
            )}
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="mt-8 flex flex-wrap justify-center gap-3"
          >
            <Button
              onClick={onRedraw}
              variant="outline"
              className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 border-amber-400 hover:border-amber-600 dark:border-amber-700 dark:hover:border-amber-500 transition-colors"
              aria-label="Sortear novamente"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Novo Sorteio
            </Button>

            <Button
              onClick={() => setShowStats(!showStats)}
              variant="outline"
              className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 border-purple-400 hover:border-purple-600 dark:border-purple-700 dark:hover:border-purple-500 transition-colors"
            >
              <Info className="w-4 h-4 mr-2" />
              {showStats ? "Ocultar Detalhes" : "Ver Detalhes"}
            </Button>

            <Button
              onClick={() => captureScreenshot('winner-card', `sorteio-${Date.now()}`)}
              variant="outline"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 border-blue-400 hover:border-blue-600 dark:border-blue-700 dark:hover:border-blue-500 transition-colors"
            >
              <Camera className="w-4 h-4 mr-2" /> Capturar
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
                <div className="mt-6 p-4 bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-amber-200 dark:border-amber-900/50">
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Estatísticas do Sorteio</h4>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                      <p className="text-amber-700 dark:text-amber-400 font-medium">Total de Participantes</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        <AnimatedCounter value={totalParticipants} />
                      </p>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                      <p className="text-purple-700 dark:text-purple-400 font-medium">Chance de Vitória</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{winChance}%</p>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      <p className="text-blue-700 dark:text-blue-400 font-medium">Data e Hora</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {new Date().toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      <p className="text-green-700 dark:text-green-400 font-medium">Verificado</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white flex items-center mt-1">
                        <ShieldCheck className="w-5 h-5 mr-1.5 text-green-600 dark:text-green-400" />
                        Sorteio Auditável
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

function GiveawayHistory({ history }: { history: GiveawayHistory[] }) {
  if (history.length === 0) {
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

function InstagramGiveaway({
  setWinner,
  setTotalParticipants
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
        ...filters,

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
          <div className="p-5 bg-blue-50 dark:bg-blue-950/50 border-l-4 border-blue-500 rounded-r-xl shadow-sm">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-lg flex items-center">
              <HelpCircle className="w-5 h-5 mr-2 text-blue-500" />
              Como funciona?
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200 mt-1 leading-relaxed">
              Use uma ferramenta gratuita para exportar os comentários do seu post e cole a lista abaixo para sortear.
            </p>
            <a
              href="https://commentpicker.com/instagram.php"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-blue-900 dark:text-blue-300 mt-3 inline-flex items-center hover:underline"
            >
              Usar o Comment Picker <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </div>

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
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center">
              <Info className="w-4 h-4 mr-1" />
              {comments.split("\n").filter(Boolean).length} comentários encontrados
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

  const updatePreview = () => {
    let list = participants.split("\n").map((p) => p.trim()).filter(Boolean);

    // Apply filters
    if (filters.excludePattern) {
      const pattern = new RegExp(filters.excludePattern, 'i');
      list = list.filter(p => !pattern.test(p));
    }

    if (filters.minLength > 0) {
      list = list.filter(p => p.length >= filters.minLength);
    }

    if (unique) {
      list = Array.from(new Set(list));
    }

    setParticipantsPreview(list.slice(0, 100));
    setTotalParticipants(list.length);
  };

  useEffect(() => {
    if (participants) {
      updatePreview();
    }
  }, [participants, unique, filters]);

  const handleRun = () => {
    const list = participants.split("\n").map((p) => p.trim()).filter(Boolean);
    if (list.length === 0) return toast.error("A lista está vazia.");

    setIsLoading(true);
    setWinner(null);
    toast.promise(
  runGiveaway({
    participants: list,
    unique,
    ...filters,
    winnersCount
  } as Parameters<typeof runGiveaway>[0]),
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
            <Label htmlFor="participants" className="font-semibold">
              Lista de Participantes (um por linha)
            </Label>
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
    toast.promise(
  runGiveaway({ min, max, exclude: excludedArray } as { min: number; max: number; exclude: number[] }),
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
  const runGiveaway = useAction(api.giveaways.runWeightedListGiveaway);

  const parseParticipants = () => {
    const lines = participants
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const parsed = lines.map((line) => {
      const [username, weightStr] = line.split(",");
      const weight = Number(weightStr);
      if (!username || isNaN(weight) || weight <= 0) {
        return null;
      }
      return { username: username.trim(), weight };
    }).filter(Boolean) as {username: string, weight: number}[];

    return parsed;
  };

  useEffect(() => {
    if (participants) {
      const parsed = parseParticipants();
      if (parsed.length === 0) {
        setVisualWeights([]);
        setTotalParticipants(0);
        return;
      }

      // Calculate total participants (sum of weights)
      const totalWeight = parsed.reduce((sum, p) => sum + p.weight, 0);
      setTotalParticipants(totalWeight);
    } else {
      setVisualWeights([]);
      setTotalParticipants(0);
    }
  }, [participants, setTotalParticipants]);

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
        error: (err) => (err instanceof Error ? err.message : "Tente novamente."),
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
                          style={{ width: `${(participant.weight / Math.max(...visualWeights.map(p => p.weight))) * 100}%` }}
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
                      const weight = parseInt(prompt("Peso (número):", "1") || "1");

                      if (name && !isNaN(weight) && weight > 0) {
                        const newList = [...visualWeights, { name, weight }];
                        setVisualWeights(newList);
                        setParticipants(newList.map(p => `${p.name},${p.weight}`).join('\n'));
                      }
                    }}
                    className="w-full mt-2"
                  >
                    + Adicionar Participante
                  </Button>
                </div>
              </div>
            ) : (
              <Textarea
                id="weighted-participants"
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
                placeholder={`Lucas,5\nMaria,3\nJoão,1`}
                rows={8}
                disabled={isLoading}
                className="resize-none font-mono"
              />
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

  const saveToHistory = () => {
    if (!winner) return;

    const displayName = (() => {
      if ("username" in winner && typeof winner.username === "string") {
        return `@${winner.username}`;
      }
      if ("number" in winner && typeof winner.number === "number") {
        return winner.number.toString();
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

    setGiveawayHistory([newHistoryItem, ...giveawayHistory]);
  };

  return (
    <div className="mx-auto p-4 overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero section */}
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 dark:from-purple-900 dark:to-indigo-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

          <div className="relative">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl">
                <Trophy className="w-12 h-12 text-amber-300" />
              </div>

              <div>
                <h1 className="text-3xl md:text-4xl font-bold">
                  Sorteios Profissionais
                </h1>
                <p className="mt-2 text-purple-100 max-w-xl">
                  Realize sorteios transparentes e profissionais para suas campanhas e promoções. Compatível com Instagram, listas, números e muito mais.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[200px]">
                <Tabs
                  defaultValue={activeTab}
                  value={activeTab}
                onValueChange={(v) => {
  setActiveTab(v as "instagram" | "list" | "number" | "weighted");
  setWinner(null);
}}
                >
                  <TabsList className="w-full grid grid-cols-4 bg-white/10">
                    <TabsTrigger
                      value="instagram"
                      className="data-[state=active]:bg-white/15 text-white data-[state=active]:text-white"
                    >
                      <Instagram className="w-4 h-4 mr-2" /> Instagram
                    </TabsTrigger>
                    <TabsTrigger
                      value="list"
                      className="data-[state=active]:bg-white/15 text-white data-[state=active]:text-white"
                    >
                      <List className="w-4 h-4 mr-2" /> Lista
                    </TabsTrigger>
                    <TabsTrigger
                      value="number"
                      className="data-[state=active]:bg-white/15 text-white data-[state=active]:text-white"
                    >
                      <Hash className="w-4 h-4 mr-2" /> Número
                    </TabsTrigger>
                    <TabsTrigger
                      value="weighted"
                      className="data-[state=active]:bg-white/15 text-white data-[state=active]:text-white"
                    >
                      <Percent className="w-4 h-4 mr-2" /> Ponderado
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="flex gap-2">
                <Dialog open={showSettings} onOpenChange={setShowSettings}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Configurações
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
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

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
                    >
                      <History className="w-4 h-4 mr-2" />
                      Histórico
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4" align="end">
                    <div className="space-y-2">
                      <h3 className="font-semibold">Histórico de Sorteios</h3>
                      <div className="max-h-80 overflow-y-auto">
                        <GiveawayHistory history={giveawayHistory} />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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

          <div className="lg:row-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BrainCircuit className="w-5 h-5 text-purple-500 mr-2" />
                  Recursos Inteligentes
                </CardTitle>
                <CardDescription>
                  Nossos sorteios oferecem recursos avançados para garantir resultados justos e transparentes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                    <Crown className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Sorteios Transparentes</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Algoritmo verificável que garante resultados justos em todos os sorteios
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                    <Star className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Múltiplos Formatos</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Compatível com Instagram, listas personalizadas, números e sorteios ponderados
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg">
                    <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Filtros Avançados</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Defina critérios específicos como menções, palavras-chave e participantes únicos
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                    <Stars className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Experiência Visual</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Animações e efeitos visuais que tornam o momento do sorteio mais emocionante
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    window.open('/help/giveaways', '_blank');
                  }}
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Ver Tutorial Completo
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Winner card */}
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
      </div>
    </div>
  );
}