"use client";

import { JSX, useMemo, useState, useEffect, useRef } from "react";
import { Calendar, dateFnsLocalizer, Views, Event, View } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay, addDays, startOfDay, isSameDay, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Video, Newspaper, MessageSquare, Mic, Sparkles,
  Copy, Link as LinkIcon, ImageIcon, CheckCircle,
  Clock, Calendar as CalendarIcon, X, Edit, Share2,
  TrendingUp, Camera, Award, Trophy,
  Zap, Instagram, Twitter, Linkedin, Flame,
  Shield, Gift, Crown, Medal, BookOpen,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import ReactMarkdown from 'react-markdown';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import confetti from 'canvas-confetti';


// Tipos
type PlanItemFromDB = {
  day: string;
  time: string;
  format: string;
  title: string;
  funnel_stage: string;
  focus_metric: string;
  content_idea: string;
  status: "planejado" | "concluido";
  completedAt?: number;
  details?: {
    tool_suggestion: string;
    step_by_step: string;
    script_or_copy: string;
    hashtags: string;
    step_progress?: { [key: string]: boolean }; // Para checklist interativa
    creative_guidance: {
      type: string;
      description: string;
      prompt: string;
      tool_link: string;
    };
  };
};

export type PlanItem = PlanItemFromDB & { id: string; };

// Tipos para medalhas e rankings
type Medal = {
  id: string;
  name: string;
  description: string;
  icon: JSX.Element;
  threshold: number;
  bgColor: string;
  textColor: string;
};

type RankingUser = {
  id: string;
  name: string;
  avatar: string;
  streak: number;
  completed: number;
  badges: string[];
};

interface EditPostFormProps {
  item: PlanItem;
  onSave: (updatedItem: PlanItem) => void;
  onCancel: () => void;
}

// Componente para gerar confetes
const generateConfetti = () => {
  const end = Date.now() + 1000;
  const colors = ['#FF5733', '#33FF57', '#3357FF', '#F033FF', '#33FFF5'];

  const confettiCanvas = document.createElement('canvas');
  confettiCanvas.style.position = 'fixed';
  confettiCanvas.style.top = '0';
  confettiCanvas.style.left = '0';
  confettiCanvas.style.width = '100%';
  confettiCanvas.style.height = '100%';
  confettiCanvas.style.pointerEvents = 'none';
  confettiCanvas.style.zIndex = '9999';
  document.body.appendChild(confettiCanvas);

  const myConfetti = confetti.create(confettiCanvas, { resize: true });

  const frame = () => {
    myConfetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors,
    });
    myConfetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    } else {
      setTimeout(() => {
        document.body.removeChild(confettiCanvas);
      }, 2000);
    }
  };

  frame();
};

// Componente de Carregamento
const LoadingDots = () => (
  <div className="flex space-x-1 items-center justify-center">
    <motion.div
      animate={{ scale: [0.8, 1.2, 0.8] }}
      transition={{ repeat: Infinity, duration: 1 }}
      className="bg-blue-500 dark:bg-blue-400 h-1.5 w-1.5 rounded-full"
    />
    <motion.div
      animate={{ scale: [0.8, 1.2, 0.8] }}
      transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
      className="bg-purple-500 dark:bg-purple-400 h-1.5 w-1.5 rounded-full"
    />
    <motion.div
      animate={{ scale: [0.8, 1.2, 0.8] }}
      transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
      className="bg-pink-500 dark:bg-pink-400 h-1.5 w-1.5 rounded-full"
    />
  </div>
);

// Definição das medalhas
const MEDALS: Medal[] = [
  {
    id: "consistent",
    name: "Consistente",
    description: "Manteve uma sequência de 7 dias",
    icon: <Shield className="w-5 h-5" />,
    threshold: 7,
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    textColor: "text-amber-800 dark:text-amber-300"
  },
  {
    id: "focused",
    name: "Focado",
    description: "Manteve uma sequência de 14 dias",
    icon: <Gift className="w-5 h-5" />,
    threshold: 14,
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
    textColor: "text-orange-800 dark:text-orange-300"
  },
  {
    id: "relentless",
    name: "Implacável",
    description: "Manteve uma sequência de 30 dias",
    icon: <Crown className="w-5 h-5" />,
    threshold: 30,
    bgColor: "bg-red-100 dark:bg-red-900/30",
    textColor: "text-red-800 dark:text-red-300"
  },
  {
    id: "strategist",
    name: "Mestre Estrategista",
    description: "Gerou 5 planos com o Mentor.IA",
    icon: <BookOpen className="w-5 h-5" />,
    threshold: 5,
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    textColor: "text-purple-800 dark:text-purple-300"
  }
];

// Componente de perfil público com medalhas
interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: {
    total: number;
    completed: number;
    percent: number;
  };
  streakDays: number;
  plansGenerated?: number;
}

function ProfileModal({ isOpen, onClose, streakDays, plansGenerated = 0 }: ProfileModalProps) {
  // Determinar medalhas ganhas
  const earnedMedals = MEDALS.filter(medal => {
    if (medal.id === "strategist") {
      return plansGenerated >= medal.threshold;
    }
    return streakDays >= medal.threshold;
  });

// 1. Usa a query CORRETA que acabamos de criar no backend
const currentUserData = useQuery(api.users.getMyUsername);

// 2. Pega o username dos dados retornados (com um fallback para segurança)
const username = currentUserData?.username || "seu_usuario";

// 3. Monta a URL real e dinâmica, que agora funciona perfeitamente
const profileUrl = `https://freelink.com/${encodeURIComponent(username)}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-white dark:bg-slate-900 p-0 overflow-hidden rounded-xl">
        <div className="p-5 sm:p-6">
          <h2 className="text-xl font-bold text-center mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Seu Perfil Público
          </h2>

          <div className="mb-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  YU
                </div>
                <div>
                  <h3 className="text-lg font-bold">Seu Usuário</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    <span className="text-blue-600 dark:text-blue-400">@seu_usuario</span>
                  </p>
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{streakDays}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">dias de streak</div>
              </div>
            </div>

            <div className="mt-5 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                <Medal className="w-4 h-4 text-amber-500" />
                Suas Conquistas
              </h4>

              {earnedMedals.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {earnedMedals.map((medal) => (
                    <div
                      key={medal.id}
                      className={`${medal.bgColor} ${medal.textColor} p-3 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-2`}
                    >
                      <div className="rounded-full bg-white/80 dark:bg-slate-700/80 p-1.5">
                        {medal.icon}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{medal.name}</div>
                        <div className="text-xs opacity-80">{medal.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-sm text-slate-500 dark:text-slate-400 py-3">
                  Continue engajado para ganhar suas primeiras medalhas!
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">Link do seu perfil público:</p>
                <div className="flex">
                  <input
                    type="text"
                    value={profileUrl}
                    readOnly
                    className="text-xs p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-l-lg flex-1"
                  />
                  <Button
                    size="sm"
                    className="rounded-l-none"
                    onClick={() => {
                      navigator.clipboard.writeText(profileUrl);
                      toast.success("Link do perfil copiado!");
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar Perfil
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Componente de ranking
interface RankingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStreak: number;
}

function RankingModal({ isOpen, onClose, currentStreak }: RankingModalProps) {
  // Simular dados de leaderboard (na implementação real, viria da API)
  const leaderboardData: RankingUser[] = [
    { id: "1", name: "Ana Silva", avatar: "", streak: 45, completed: 67, badges: ["consistent", "focused", "relentless"] },
    { id: "2", name: "Carlos Mendes", avatar: "", streak: 32, completed: 54, badges: ["consistent", "focused", "relentless"] },
    { id: "3", name: "Você", avatar: "", streak: currentStreak, completed: 23, badges: currentStreak >= 30 ? ["consistent", "focused", "relentless"] : currentStreak >= 14 ? ["consistent", "focused"] : currentStreak >= 7 ? ["consistent"] : [] },
    { id: "4", name: "Juliana Costa", avatar: "", streak: 18, completed: 32, badges: ["consistent", "focused"] },
    { id: "5", name: "Ricardo Alves", avatar: "", streak: 12, completed: 29, badges: ["consistent"] },
    { id: "6", name: "Marina Gomes", avatar: "", streak: 8, completed: 15, badges: ["consistent"] },
    { id: "7", name: "Bruno Santos", avatar: "", streak: 5, completed: 11, badges: [] },
  ].sort((a, b) => b.streak - a.streak);

  // Encontrar posição do usuário atual
  const userRank = leaderboardData.findIndex(user => user.name === "Você") + 1;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-white dark:bg-slate-900 p-0 overflow-hidden rounded-xl">
        <div className="p-5 sm:p-6">
          <h2 className="text-xl font-bold text-center mb-4 bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
            <Trophy className="w-5 h-5 inline-block mr-2" />
            Ranking de Consistência
          </h2>

          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 mb-4 border border-amber-200 dark:border-amber-800/50">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-amber-800 dark:text-amber-300">Sua posição atual</div>
              <div className="text-lg font-bold text-amber-900 dark:text-amber-200">#{userRank}</div>
            </div>
          </div>

          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 pb-2">
            {leaderboardData.map((user, index) => (
              <div
                key={user.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border",
                  user.name === "Você"
                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                )}
              >
                <div className="font-bold text-lg w-7 text-center">
                  {index + 1}
                </div>
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold",
                  index === 0 ? "bg-gradient-to-br from-amber-400 to-yellow-600" :
                  index === 1 ? "bg-gradient-to-br from-slate-300 to-slate-500" :
                  index === 2 ? "bg-gradient-to-br from-amber-700 to-amber-900" :
                  "bg-gradient-to-br from-blue-500 to-purple-600"
                )}>
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm flex items-center">
                    {user.name}
                    {user.name === "Você" && (
                      <Badge className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                        Você
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {user.badges.map((badgeId) => {
                      const medal = MEDALS.find(m => m.id === badgeId);
                      return medal ? (
                        <Tooltip key={badgeId}>
                          <TooltipTrigger asChild>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${medal.bgColor}`}>
                              {medal.icon}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">{medal.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : null;
                    })}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">{user.streak}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">dias</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-center">
            <Button
              className="bg-gradient-to-r from-amber-500 to-orange-600 text-white"
              onClick={() => {
                onClose();
                // Aqui poderia abrir um modal para compartilhar conquista
                toast.success("Compartilhe seu ranking nas redes sociais!");
                toast.dismiss();

              }}
            >
              <Flame className="w-4 h-4 mr-2" />
              Superar minha posição
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ShareAchievementModalProps {
  isOpen: boolean; onClose: () => void;
  stats: { total: number; completed: number; percent: number; };
  streakDays: number;
}

function ShareAchievementModal({ isOpen, onClose, stats, streakDays }: ShareAchievementModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState("");

  // Busca o username do usuário logado para usar na imagem
  const currentUser = useQuery(api.users.getMyUsername);
  const shareAchievement = useMutation(api.shareAchievements.shareAchievement);


  // Reseta o estado da imagem quando o modal é fechado
  useEffect(() => { if (!isOpen) setGeneratedImageUrl(""); }, [isOpen]);

  const generateShareImage = async () => {
    if (!currentUser?.username) {
        toast.error("Nome de usuário não encontrado para gerar a imagem.");
        return null;
    }
    setIsGenerating(true);
    try {
      // 1. Constrói a URL da nossa API de imagem com os dados da conquista
      const params = new URLSearchParams({
        username: currentUser.username,
        streak: String(streakDays),
        completed: String(stats.completed),
        total: String(stats.total),
      });
      const imageUrl = `/api/og/share?${params.toString()}`;

      // 2. A "geração" é apenas a construção da URL. O navegador fará o resto.
      setGeneratedImageUrl(imageUrl);
      toast.success("Sua imagem de conquista está pronta!");

      // 3. Registra a conquista no backend
      const result = await shareAchievement({
        streakDays,
        completedPosts: stats.completed,
        totalPosts: stats.total,
      });

      return { imageUrl, shareCode: result.shareCode };
    } catch (error) {
      console.error("Erro ao gerar ou registrar a imagem:", error);
      toast.error("Não foi possível gerar a imagem de conquista.");
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async (platform: 'twitter' | 'linkedin' | 'instagram' | 'download') => {
    let finalShareUrl = generatedImageUrl;
    let shareCode: string | null = null;

    if (!finalShareUrl) {
      const result = await generateShareImage();
      if (!result) return;
      finalShareUrl = result.imageUrl;
      shareCode = result.shareCode;
    }

    if (platform === 'download' && !shareCode) {
      toast.error("Não foi possível baixar a imagem. Tente novamente.");
      return;
    }


    const shareText = `🔥 Minha sequência de ${streakDays} dias continua! Concluí ${stats.completed}/${stats.total} posts com o Mentor.IA da @freelink. #MentorIA #Freelinnk`;
    let url;
    switch (platform) {
      case 'twitter': url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(window.location.origin)}`; break;
      case 'linkedin': url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}`; break;
      case 'instagram': navigator.clipboard.writeText(shareText); toast.info("Texto copiado! Baixe a imagem e cole a legenda no seu post."); return;
      case 'download': const link = document.createElement('a'); link.href = finalShareUrl; link.download = `conquista-freelink-${currentUser?.username}.png`; link.click(); return;
    }
    if (url) window.open(url, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl p-0 overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Compartilhe sua Conquista! 🏆</h2>
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border relative overflow-hidden">
            {isGenerating && <Loader2 className="w-8 h-8 text-primary animate-spin" />}
            {generatedImageUrl ? (<img src={generatedImageUrl} alt="Imagem de conquista gerada" className="object-cover w-full h-full" />) :
            (!isGenerating && <div className="text-center text-muted-foreground p-4"><ImageIcon className="w-10 h-10 mx-auto mb-2" /><p className="text-sm font-medium">Sua imagem personalizada aparecerá aqui.</p></div>)}
          </div>
          <div className="mt-6 space-y-4">
            {!generatedImageUrl ? (
              <Button onClick={generateShareImage} className="w-full" disabled={isGenerating}>
                {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Gerar Imagem de Conquista
              </Button>
            ) : (
                <div className="text-center">
                    <p className="text-sm font-medium mb-3">Pronto! Agora compartilhe seu progresso:</p>
                    <div className="flex justify-center gap-3">
                        <TooltipProvider>
                            <Tooltip><TooltipTrigger asChild><Button variant="outline" size="icon" onClick={() => handleShare('twitter')}><Twitter className="w-5 h-5" /></Button></TooltipTrigger><TooltipContent>Compartilhar no Twitter</TooltipContent></Tooltip>
                            <Tooltip><TooltipTrigger asChild><Button variant="outline" size="icon" onClick={() => handleShare('linkedin')}><Linkedin className="w-5 h-5" /></Button></TooltipTrigger><TooltipContent>Compartilhar no LinkedIn</TooltipContent></Tooltip>
                            <Tooltip><TooltipTrigger asChild><Button variant="outline" size="icon" onClick={() => handleShare('instagram')}><Instagram className="w-5 h-5" /></Button></TooltipTrigger><TooltipContent>Copiar para Instagram</TooltipContent></Tooltip>
                            <Tooltip><TooltipTrigger asChild><Button variant="outline" size="icon" onClick={() => handleShare('download')}><Download className="w-5 h-5" /></Button></TooltipTrigger><TooltipContent>Baixar Imagem</TooltipContent></Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Adicionar o ícone de Download que está faltando
function Download(props: JSX.IntrinsicElements['svg']) {
  // Ícone de download SVG  ) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

// Componente de edição aprimorado
const EditPostForm = ({ item, onSave, onCancel }: EditPostFormProps) => {
  const [editedItem, setEditedItem] = useState(item);
  const [activeTab, setActiveTab] = useState("content");
  const [isSaving, setIsSaving] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Função para inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedItem(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Função para textareas
  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedItem(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Função para campos de detalhes em textareas
  const handleDetailsTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedItem(prev => ({
      ...prev,
      details: prev.details
        ? { ...prev.details, [name]: value }
        : undefined
    }));
  };

  // Função para campos de detalhes em inputs
  const handleDetailsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedItem(prev => ({
      ...prev,
      details: prev.details
        ? { ...prev.details, [name]: value }
        : undefined
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Simular um pequeno delay para feedback visual
    await new Promise(resolve => setTimeout(resolve, 600));

    onSave(editedItem);
    setIsSaving(false);
  };

  return (
    <form ref={formRef} onSubmit={handleSave} className="space-y-4 pt-2">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-2 mb-2">
          <TabsTrigger value="content" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/30 dark:data-[state=active]:text-blue-300">
            <MessageSquare className="w-4 h-4 mr-2" />
            Conteúdo
          </TabsTrigger>
          <TabsTrigger value="details" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 dark:data-[state=active]:bg-purple-900/30 dark:data-[state=active]:text-purple-300">
            <Sparkles className="w-4 h-4 mr-2" />
            Detalhes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4 pt-2">
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <label className="text-sm font-medium flex items-center gap-2">
              <Edit className="w-4 h-4 text-blue-500" />
              Título do Post
            </label>
            <Input
              name="title"
              value={editedItem.title}
              onChange={handleInputChange}
              className="w-full mt-1 border-blue-200 focus-visible:ring-blue-500 dark:border-blue-800"
              placeholder="Ex: Como aumentar seus resultados com..."
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            <label className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-500" />
              Ideia de Conteúdo
            </label>
            <Textarea
              name="content_idea"
              value={editedItem.content_idea}
              onChange={handleTextAreaChange}
              rows={4}
              className="w-full mt-1 resize-none border-blue-200 focus-visible:ring-blue-500 dark:border-blue-800"
              placeholder="Descreva a ideia principal do seu conteúdo..."
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.2 }}
          >
            <label className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              Horário Ideal
            </label>
            <Input
              name="time"
              value={editedItem.time}
              onChange={handleInputChange}
              className="w-full mt-1 border-blue-200 focus-visible:ring-blue-500 dark:border-blue-800"
              placeholder="Ex: 19:30"
            />
          </motion.div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4 pt-2">
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <label className="text-sm font-medium flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-purple-500" />
              Roteiro / Legenda
            </label>
            <Textarea
              name="script_or_copy"
              value={editedItem.details?.script_or_copy ?? ""}
              onChange={handleDetailsTextAreaChange}
              rows={6}
              className="w-full mt-1 resize-none border-purple-200 focus-visible:ring-purple-500 dark:border-purple-800"
              placeholder="Escreva o texto da sua legenda ou roteiro do vídeo..."
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            <label className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              Hashtags
            </label>
            <Input
              name="hashtags"
              value={editedItem.details?.hashtags ?? ""}
              onChange={handleDetailsInputChange}
              className="w-full mt-1 border-purple-200 focus-visible:ring-purple-500 dark:border-purple-800"
              placeholder="#marketing #instagram #conteudodigital"
            />
          </motion.div>
        </TabsContent>
      </Tabs>

      <div className="pt-4 sticky bottom-0 flex flex-col sm:flex-row justify-end gap-2 border-t mt-6 bg-white dark:bg-slate-900 pb-1">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="w-full sm:w-auto border-slate-300"
          disabled={isSaving}
        >
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
        <Button
          type="submit"
          className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          disabled={isSaving}
        >
          {isSaving ? (
            <LoadingDots />
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Salvar Alterações
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

// Configuração do calendário
const locales = { "pt-BR": ptBR };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// Mapeamento de formatos para ícones e cores
const formatConfig: Record<string, { icon: JSX.Element; color: string, gradient: string }> = {
  reels: {
    icon: <Video className="w-4 h-4 mr-2" />,
    color: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800",
    gradient: "from-red-500 to-pink-500"
  },
  carrossel: {
    icon: <Newspaper className="w-4 h-4 mr-2" />,
    color: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800",
    gradient: "from-blue-500 to-indigo-500"
  },
  story: {
    icon: <MessageSquare className="w-4 h-4 mr-2" />,
    color: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800",
    gradient: "from-yellow-500 to-amber-500"
  },
  live: {
    icon: <Mic className="w-4 h-4 mr-2" />,
    color: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-800",
    gradient: "from-purple-500 to-fuchsia-500"
  },
  foto: {
    icon: <ImageIcon className="w-4 h-4 mr-2" />,
    color: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800",
    gradient: "from-green-500 to-emerald-500"
  },
  default: {
    icon: <MessageSquare className="w-4 h-4 mr-2" />,
    color: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700",
    gradient: "from-gray-500 to-slate-500"
  },
};

// Helper para determinar configuração baseada no formato
const getConfig = (fmt: string) => {
  const key = Object.keys(formatConfig).find(k => fmt.toLowerCase().includes(k));
  return formatConfig[key || 'default'];
};

// Componente de checklist interativa para plano de execução
interface ExecutionChecklistProps {
  steps: string;
  planItem: PlanItem;
  onStepToggle: (index: number, checked: boolean) => void;
}

const ExecutionChecklist = ({ steps, planItem, onStepToggle }: ExecutionChecklistProps) => {
  // Parser para extrair steps do texto
  const parseSteps = (stepsText: string): string[] => {
    // Dividir o texto em linhas e filtrar linhas vazias
    const lines = stepsText.replace(/\\n/g, '\n').split('\n').filter(line => line.trim().length > 0);

    // Identificar padrões de listas numeradas ou com marcadores
    const stepLines = lines.filter(line => {
      return /^(\d+[\.KATEX_INLINE_CLOSE:]|[-*•]|\b(PASSO|ETAPA|CENA|PARTE)\s*\d+[\.KATEX_INLINE_CLOSE:])/.test(line.trim());
    });

    return stepLines.length > 0 ? stepLines : lines;
  };

  const stepsList = parseSteps(steps);

  // Obter progresso dos steps do planItem
  const stepProgress = planItem.details?.step_progress || {};

  return (
    <div className="space-y-2 mt-2">
      {stepsList.map((step, index) => {
        // Gerar um ID estável para cada step
        const stepId = `step-${planItem.id}-${index}`;
        const isChecked = stepProgress[stepId] || false;

        // Determinar ícone baseado no conteúdo do step
        const getStepIcon = (text: string) => {
          const lowerText = text.toLowerCase();
          if (lowerText.includes('cena') || lowerText.includes('gravar')) {
            return <Camera className="w-4 h-4 text-red-600 dark:text-red-400" />;
          } else if (lowerText.includes('editar') || lowerText.includes('edição')) {
            return <Edit className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
          } else if (lowerText.includes('post') || lowerText.includes('publicar')) {
            return <Share2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
          } else if (lowerText.includes('hashtag')) {
            return <MessageSquare className="w-4 h-4 text-green-600 dark:text-green-400" />;
          } else {
            return <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
          }
        };

        return (
          <div
            key={stepId}
            className={cn(
              "flex items-start gap-2 p-2.5 rounded-lg transition-colors border",
              isChecked
                ? "bg-green-50/50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50"
                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50"
            )}
          >
            <div className="flex-shrink-0 mt-0.5">
              <Checkbox
                id={stepId}
                checked={isChecked}
                onCheckedChange={(checked) => {
                  onStepToggle(index, checked === true);
                }}
                className={cn(
                  "transition-colors",
                  isChecked ? "border-green-500 bg-green-500 text-white" : ""
                )}
              />
            </div>
            <div className="flex-1">
              <label
                htmlFor={stepId}
                className={cn(
                  "text-sm cursor-pointer flex items-start gap-2",
                  isChecked ? "text-slate-500 dark:text-slate-400" : "text-slate-700 dark:text-slate-300"
                )}
              >
                <span className="mt-0.5 flex-shrink-0">
                  {getStepIcon(step)}
                </span>
                <span className={isChecked ? "line-through" : ""}>
                  {step}
                </span>
              </label>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Componente principal do calendário
export default function CalendarView({
  plan,
  analysisId,
}: {
  plan: PlanItemFromDB[];
  analysisId: Id<"analyses">;
}) {
  const [selectedEvent, setSelectedEvent] = useState<PlanItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentView, setCurrentView] = useState<View>(Views.MONTH);
  const [progressStats, setProgressStats] = useState({
    total: 0,
    completed: 0,
    percent: 0,
  });
  const [todaysEvents, setTodaysEvents] = useState<PlanItem[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [streakDays, setStreakDays] = useState(0);
  const [plansGenerated, setPlansGenerated] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showRankingModal, setShowRankingModal] = useState(false);
  const [streakAchievement, setStreakAchievement] = useState(false);

  // Ref para o conteúdo scrollável do modal
  const contentScrollRef = useRef<HTMLDivElement>(null);

  const updatePlanMutation = useMutation(api.mentor.updateContentPlan);

  // Query para buscar número de planos gerados (simulada)
  useEffect(() => {
    // Simular busca de dados
    setPlansGenerated(5);
  }, []);

  // Preparar dados para o calendário
  const planWithIds: PlanItem[] = useMemo(
    () => plan.map((p, index) => ({ ...p, id: `${p.title}-${index}` })),
    [plan]
  );

  // Criar eventos para o calendário
  const events = useMemo(() => {
    const startDate = startOfDay(new Date());
    return planWithIds.map((item) => {
      const dayNumber = parseInt(item.day.replace(/\D/g, ""), 10) || 1;
      const eventDate = addDays(startDate, dayNumber - 1);
      const [h, m] = (item.time ?? "09:00").split(":");
      eventDate.setHours(Number(h ?? 9), Number(m ?? 0), 0, 0);
      return {
        title: item.title,
        start: eventDate,
        end: eventDate,
        allDay: false,
        resource: item,
      };
    });
  }, [planWithIds]);

  // Atualizar estatísticas de progresso e streak
  useEffect(() => {
    const total = planWithIds.length;
    const completed = planWithIds.filter(
      (item) => item.status === "concluido"
    ).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    setProgressStats({ total, completed, percent });

    const today = startOfDay(new Date());
    const todaysItems = events
      .filter((event) => isSameDay(event.start, today))
      .map((event) => event.resource as PlanItem);

    setTodaysEvents(todaysItems);

    const completedPostsTimestamps = planWithIds
      .filter((item) => item.status === "concluido" && item.completedAt)
      .map((item) => startOfDay(new Date(item.completedAt!)).getTime());

    const uniqueCompletedDays = Array.from(new Set(completedPostsTimestamps))
      .map(ts => new Date(ts))
      .sort((a, b) => a.getTime() - b.getTime());

    let calculatedStreak = 0;
    const todayStartOfDay = startOfDay(new Date());

    if (uniqueCompletedDays.length === 0) {
      calculatedStreak = 0;
    } else {
      let lastDayChecked = uniqueCompletedDays[uniqueCompletedDays.length - 1];

      if (isSameDay(lastDayChecked, todayStartOfDay)) {
        calculatedStreak = 1;
      } else if (isSameDay(lastDayChecked, addDays(todayStartOfDay, -1))) {
        calculatedStreak = 1;
      } else {
        calculatedStreak = 0;
      }

      if (calculatedStreak > 0) {
        for (let i = uniqueCompletedDays.length - 2; i >= 0; i--) {
          const prevDay = uniqueCompletedDays[i];
          if (isSameDay(prevDay, addDays(lastDayChecked, -1))) {
            calculatedStreak++;
            lastDayChecked = prevDay;
          } else {
            break;
          }
        }
      }
    }

    if (calculatedStreak > streakDays) {
      if (
        (streakDays < 7 && calculatedStreak >= 7) ||
        (streakDays < 14 && calculatedStreak >= 14) ||
        (streakDays < 30 && calculatedStreak >= 30)
      ) {
        setStreakAchievement(true);
      }
    }

    setStreakDays(calculatedStreak);
  }, [planWithIds, events, streakDays]);

  // Effect para mostrar parabéns quando atinge marco de streak
  useEffect(() => {
    if (streakAchievement) {
      toast.success(
        <div className="flex flex-col items-center">
          <div className="text-lg font-bold mb-1">
            🔥 Sequência: {streakDays} dias!
          </div>
          <div className="text-sm">
            Você manteve sua consistência! Compartilhe essa conquista!
          </div>
          <Button
            className="mt-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white"
            size="sm"
            onClick={() => {
              setShowShareModal(true);
              setStreakAchievement(false);
            }}
          >
            <Trophy className="w-4 h-4 mr-2" />
            Compartilhar
          </Button>
        </div>,
        {
          duration: 8000,
          position: "top-center",
          icon: <Flame className="w-6 h-6 text-amber-500" />,
        }
      );
    }
  }, [streakAchievement, streakDays]);

  const handleUpdatePlan = async (updatedPlan: PlanItem[]) => {
    setIsUpdating(true);
    const planToSave = updatedPlan.map((item) => ({
      day: item.day,
      time: item.time,
      format: item.format as "reels" | "carrossel" | "stories" | "imagem" | "atividade",
      title: item.title,
      content_idea: item.content_idea,
      status: item.status,
      completedAt: item.completedAt,
      details: item.details,
      funnel_stage: item.funnel_stage as "atrair" | "nutrir" | "converter",
      focus_metric: item.focus_metric,
    }));
    try {
      await updatePlanMutation({ analysisId, newPlan: planToSave });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1500);
      toast.success("Plano atualizado com sucesso!");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Falha ao sincronizar. Tente novamente."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkCompleted = async (item: PlanItem) => {
    setIsUpdating(true);

    const updatedPlan = planWithIds.map((p) =>
      p.id === item.id
        ? { ...p, status: "concluido" as const, completedAt: Date.now() }
        : p
    );

    await handleUpdatePlan(updatedPlan);
    generateConfetti();
    setSelectedEvent(null);
  };

  const handleSaveEdit = async (editedItem: PlanItem) => {
    const updatedPlan = planWithIds.map((p) =>
      p.id === editedItem.id ? editedItem : p
    );

    await handleUpdatePlan(updatedPlan);
    setSelectedEvent(null);
    setIsEditing(false);
  };

  const handleShareItem = () => {
    if (!selectedEvent) return;

    const shareText = `📅 ${selectedEvent.day} - ${selectedEvent.format}: ${selectedEvent.title}\n\n${selectedEvent.content_idea}\n\nGerado com Mentor.IA do @freelink 🚀`;

    navigator.clipboard.writeText(shareText);
    toast.success("Conteúdo copiado para compartilhamento!", {
      icon: <Share2 className="w-4 h-4 text-blue-500" />,
      position: "top-center",
      duration: 3000,
    });
  };

  // Nova função para lidar com o toggle das etapas da checklist
  const handleStepToggle = async (item: PlanItem, stepIndex: number, checked: boolean) => {
    // Clone o item atual
    const updatedItem = { ...item };

    // Garantir que step_progress existe
    if (!updatedItem.details) {
      updatedItem.details = {
        tool_suggestion: "",
        step_by_step: "",
        script_or_copy: "",
        hashtags: "",
        step_progress: {},
        creative_guidance: { type: "", description: "", prompt: "", tool_link: "" }
      };
    } else if (!updatedItem.details.step_progress) {
      updatedItem.details.step_progress = {};
    }

    // Atualizar o status do step
    const stepId = `step-${item.id}-${stepIndex}`;
    updatedItem.details.step_progress ??= {};
    updatedItem.details.step_progress[stepId] = checked;

    // Atualizar o plano
    const updatedPlan = planWithIds.map((p) =>
      p.id === updatedItem.id ? updatedItem : p
    );

    // Salvar
    await handleUpdatePlan(updatedPlan);

    // Atualizar o evento selecionado
    setSelectedEvent(updatedItem);
  };

  // useEffect para rolar para o topo quando o evento selecionado muda ou quando o modo de edição muda
  useEffect(() => {
    if (contentScrollRef.current) {
      contentScrollRef.current.scrollTop = 0;
    }
  }, [selectedEvent, isEditing]);

  return (
    <MotionConfig transition={{ duration: 0.2 }}>
      <div className="mb-6 space-y-6">
        {/* Sistema de Streak e Progresso */}
        <motion.div
          className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="p-4 sm:p-6">
            {/* Streak Counter com Medalhas - FUNCIONALIDADE VIRAL #1 */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "rounded-full p-2.5 flex items-center justify-center",
                  streakDays >= 30 ? "bg-gradient-to-r from-amber-500 to-red-500" :
                  streakDays >= 14 ? "bg-gradient-to-r from-amber-400 to-orange-500" :
                  streakDays >= 7 ? "bg-gradient-to-r from-yellow-400 to-amber-500" :
                  "bg-slate-100 dark:bg-slate-700"
                )}>
                  <Flame className={cn(
                    "w-5 h-5",
                    streakDays >= 7 ? "text-white" : "text-slate-400 dark:text-slate-500"
                  )} />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Sequência atual</div>
                  <div className="flex items-center gap-1.5">
                    <span className={cn(
                      "font-bold text-lg",
                      streakDays >= 30 ? "text-red-600 dark:text-red-400" :
                      streakDays >= 14 ? "text-orange-600 dark:text-orange-400" :
                      streakDays >= 7 ? "text-amber-600 dark:text-amber-400" :
                      "text-slate-700 dark:text-slate-300"
                    )}>
                      {streakDays} {streakDays === 1 ? 'dia' : 'dias'}
                    </span>
                    {streakDays >= 7 && (
                      <Badge className={cn(
                        "text-[10px] py-0.5",
                        streakDays >= 30 ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" :
                        streakDays >= 14 ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" :
                        "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                      )}>
                        {streakDays >= 30 ? 'EXPERT' : streakDays >= 14 ? 'AVANÇADO' : 'CONSISTENTE'}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {streakDays > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs border-slate-200 dark:border-slate-700 h-8"
                    onClick={() => setShowShareModal(true)}
                  >
                    <Award className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                    Compartilhar
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-slate-200 dark:border-slate-700 h-8"
                  onClick={() => setShowProfileModal(true)}
                >
                  <Medal className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                  Meu Perfil
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-slate-200 dark:border-slate-700 h-8"
                  onClick={() => setShowRankingModal(true)}
                >
                  <Trophy className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                  Ranking
                </Button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <span className="bg-blue-100 dark:bg-blue-900/40 p-1.5 rounded-full">
                    <CalendarIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </span>
                  Progresso do Plano
                </h4>
                <div className="mt-2">
                  <div className="h-2 w-full sm:w-48 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressStats.percent}%` }}
                      transition={{ delay: 0.3, duration: 0.8 }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-muted-foreground">
                      {progressStats.completed}/{progressStats.total} posts
                    </span>
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {progressStats.percent}% concluído
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 self-end md:self-auto">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 px-3 border-slate-300 dark:border-slate-600">
                      <CalendarIcon className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                      <span>Visualização</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-2" align="end">
                    <div className="grid grid-cols-1 gap-1">
                      {[
                        { label: "Mês", value: Views.MONTH, icon: CalendarIcon },
                        { label: "Semana", value: Views.WEEK, icon: CalendarIcon },
                        { label: "Agenda", value: Views.AGENDA, icon: Trophy }
                      ].map((view) => (
                        <Button
                          key={view.value}
                          variant={currentView === view.value ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setCurrentView(view.value)}
                          className={cn(
                            "justify-start",
                            currentView === view.value
                              ? "bg-blue-600 hover:bg-blue-700 text-white"
                              : "text-slate-700 dark:text-slate-300"
                          )}
                        >
                          <view.icon className="w-4 h-4 mr-2" />
                          {view.label}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Posts de hoje */}
          <AnimatePresence>
            {todaysEvents.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20"
              >
                <div className="p-4 sm:p-6 pt-3 sm:pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-amber-500 text-white hover:bg-amber-600 px-2 py-1">
                      <Zap className="w-3.5 h-3.5 mr-1" />
                      Posts de Hoje
                    </Badge>
                    <div className="text-xs text-muted-foreground">{format(new Date(), "dd 'de' MMMM, yyyy", { locale: ptBR })}</div>
                  </div>

                  <div className="flex gap-3 overflow-x-auto pb-2 snap-x scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
                    {todaysEvents.map((event, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -3 }}
                      >
                        <Card
                          className={cn(
                            "min-w-[240px] max-w-[240px] snap-start transition-shadow cursor-pointer",
                            "hover:shadow-lg border-slate-200 dark:border-slate-700",
                            "relative overflow-hidden",
                            event.status === "concluido" && "opacity-75"
                          )}
                          onClick={() => setSelectedEvent(event)}
                        >
                          {/* Indicador visual de status no canto superior direito */}
                          <div className={cn(
                            "absolute top-0 right-0 w-10 h-10 overflow-hidden",
                          )}>
                            <div className={cn(
                              "absolute transform rotate-45 translate-x-[40%] -translate-y-[30%] w-16 h-6",
                              event.status === "concluido"
                                ? "bg-green-500"
                                : "bg-blue-500"
                            )}/>
                            {event.status === "concluido" && (
                              <CheckCircle className="absolute top-1 right-1 w-3.5 h-3.5 text-white" />
                            )}
                          </div>

                          <CardContent className="p-3 sm:p-4">
                            <div className="flex items-start mb-2">
                              <div className={cn(
                                "bg-gradient-to-r p-2 rounded-full mr-3",
                                `from-${getConfig(event.format).gradient}`
                              )}>
                                {getConfig(event.format).icon}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <Badge className={cn(
                                    "px-2 py-0.5 text-xs",
                                    getConfig(event.format).color
                                  )}>
                                    <span className="flex items-center">
                                      {event.format}
                                    </span>
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">{event.time}</span>
                                </div>
                                <h5 className="font-medium text-sm mt-1.5 line-clamp-2">{event.title}</h5>
                              </div>
                            </div>

                            <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">
                              {event.content_idea.substring(0, 100)}
                              {event.content_idea.length > 100 && "..."}
                            </div>

                            <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                              <span className="text-xs text-muted-foreground flex items-center">
                                <Clock className="w-3 h-3 mr-1 text-slate-400" />
                                {event.day}
                              </span>
                              {event.status === "concluido" ? (
                                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Concluído
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Pendente
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Dica estratégica */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-200 dark:border-blue-900/50 p-3 sm:p-4"
        >
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-blue-100 dark:bg-blue-900/50 p-2 text-blue-700 dark:text-blue-300 mt-0.5">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-medium text-sm text-blue-800 dark:text-blue-300">Dica do Mentor.IA</h4>
              <p className="text-xs text-blue-700/80 dark:text-blue-400/80 mt-1">
                Mantenha sua sequência de postagens diárias para crescer mais rápido no Instagram! Compartilhe suas conquistas e inspire outros criadores.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Calendário */}
      <motion.div
        className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 h-[65vh] min-h-[500px] overflow-hidden relative"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <TooltipProvider>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            culture="pt-BR"
            views={[Views.MONTH, Views.WEEK, Views.AGENDA]}
            defaultView={Views.MONTH}
            view={currentView}
            onView={(view: View) => setCurrentView(view)}
            onSelectEvent={(ev: Event & { resource: PlanItem }) => setSelectedEvent(ev.resource)}
            eventPropGetter={(ev: Event & { resource: PlanItem }) => ({
              className: `${getConfig(ev.resource.format).color} p-1 border rounded-md text-xs font-semibold cursor-pointer hover:scale-105 transition-transform shadow-sm ${ev.resource.status === "concluido" ? "opacity-60 line-through" : ""}`
            })}
            dayPropGetter={date => {
              if (isToday(date)) {
                return {
                  className: 'bg-blue-50 dark:bg-blue-900/20 font-bold'
                };
              }
              return {};
            }}
            components={{
              event: ({ event }: { event: Event & { resource: PlanItem } }) => {
                const res = event.resource;
                return (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center overflow-hidden">
                        {res.status === "concluido" && (
                          <CheckCircle className="w-3.5 h-3.5 mr-1 text-green-600 dark:text-green-400 flex-shrink-0" />
                        )}
                        {getConfig(res.format).icon}
                        <span className="truncate">{event.title}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      <div className="text-xs">
                        <div className="font-bold mb-1">{event.title}</div>
                        <div className="text-slate-500 dark:text-slate-400 mb-1">
                          {res.format} • {res.day} • {res.time}
                        </div>
                        <div className="line-clamp-2">{res.content_idea.substring(0, 100)}</div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              }
            }}
            messages={{
              next: "Próximo",
              previous: "Anterior",
              today: "Hoje",
              month: "Mês",
              week: "Semana",
              day: "Dia",
              agenda: "Agenda",
              noEventsInRange: "Nenhum post planejado neste período."
            }}
          />
        </TooltipProvider>

        {/* Animação de Sucesso */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              className="absolute inset-0 bg-green-500/10 backdrop-blur-sm flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white dark:bg-slate-800 rounded-full p-6 shadow-xl"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Modal de detalhes do evento - VERSÃO COM CHECKLIST INTERATIVA */}
      <Dialog open={!!selectedEvent} onOpenChange={() => { setSelectedEvent(null); setIsEditing(false); }}>
        <DialogContent className="max-w-3xl w-[95vw] sm:w-full max-h-[90vh] p-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 flex flex-col">
          <AnimatePresence mode="wait">
            {selectedEvent && (
              <motion.div
                className="flex flex-col h-full min-h-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Header do Modal - FIXO */}
                <DialogHeader className="p-4 sm:p-6 pb-0 sm:pb-0 flex-shrink-0 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3">
                    <div className="pr-8 sm:pr-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Badge className={cn(
                          "px-2 py-0.5 font-medium",
                          getConfig(selectedEvent.format).color
                        )}>
                          <span className="flex items-center">
                            {getConfig(selectedEvent.format).icon}
                            {selectedEvent.format}
                          </span>
                        </Badge>

                        <Badge className={cn(
                          "px-2 py-0.5",
                          selectedEvent.status === "concluido"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                        )}>
                          {selectedEvent.status === "concluido" ? (
                            <span className="flex items-center">
                              <CheckCircle className="w-3.5 h-3.5 mr-1" />
                              Concluído
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <Clock className="w-3.5 h-3.5 mr-1" />
                              Pendente
                            </span>
                          )}
                        </Badge>
                      </div>

                      <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                        {selectedEvent.title}
                      </DialogTitle>
                    </div>

                    <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 shrink-0">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        <span>{selectedEvent.day}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{selectedEvent.time}</span>
                      </div>
                    </div>
                  </div>
                </DialogHeader>

                {/* Conteúdo Principal - ÁREA DE SCROLL */}
                <div className="flex-1 overflow-y-auto relative">
                  {isEditing ? (
                    <motion.div
                      key="edit-form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-4 sm:p-6 pb-20"
                    >
                      <EditPostForm
                        item={selectedEvent}
                        onSave={handleSaveEdit}
                        onCancel={() => setIsEditing(false)}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="content-view"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col h-full"
                    >
                      <Tabs defaultValue="content" className="flex flex-col h-full">
                        {/* Tabs Header - FIXO */}
                        <div className="px-4 sm:px-6 pt-4 flex-shrink-0">
                          <TabsList className="w-full grid grid-cols-2 mb-1">
                            <TabsTrigger value="content" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/30 dark:data-[state=active]:text-blue-300">
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Conteúdo
                            </TabsTrigger>
                            <TabsTrigger value="execution" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700 dark:data-[state=active]:bg-green-900/30 dark:data-[state=active]:text-green-300">
                              <Trophy className="w-4 h-4 mr-2" />
                              Execução
                            </TabsTrigger>
                          </TabsList>
                        </div>

                        {/* Conteúdo das Tabs - ÁREA DE SCROLL COM PADDING BOTTOM PARA BOTÕES */}
                        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
                          <TabsContent
                            value="content"
                            className="data-[state=active]:block mt-0"
                          >
                            <div
                              ref={contentScrollRef}
                              className="pt-4 pb-24 px-4 sm:px-6 space-y-5 sm:space-y-6"
                            >
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-blue-50/50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800/50"
                              >
                                <h3 className="font-bold text-base sm:text-lg flex items-center gap-2 text-blue-800 dark:text-blue-300 mb-2">
                                  <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                                  Ideia de Conteúdo
                                </h3>
                                <div className="prose prose-sm dark:prose-invert max-w-none bg-white dark:bg-slate-800/60 p-3 sm:p-4 rounded-md whitespace-pre-line text-sm border border-blue-100 dark:border-blue-800/50 shadow-sm">
                                  <ReactMarkdown>{selectedEvent.content_idea?.replace(/\\n/g, '\n')}</ReactMarkdown>
                                </div>
                              </motion.div>

                              {selectedEvent.details && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.2 }}
                                >
                                  <h3 className="font-bold text-base sm:text-lg flex items-center gap-2 mb-2">
                                    <Newspaper className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-pink-400">
                                      Roteiro e Legenda
                                    </span>
                                  </h3>
                                  <div className="prose prose-sm dark:prose-invert max-w-none bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-md whitespace-pre-line text-sm border border-purple-100 dark:border-purple-900/30 shadow-sm">
                                    <ReactMarkdown>{selectedEvent.details.script_or_copy?.replace(/\\n/g, '\n')}</ReactMarkdown>
                                  </div>

                                  <div className="mt-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                                    <p className="text-xs sm:text-sm flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                                      <span className="font-semibold text-slate-500 dark:text-slate-400">Hashtags:</span>
                                      <span className="text-blue-600 dark:text-blue-400 break-words font-medium">{selectedEvent.details.hashtags}</span>
                                    </p>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="mt-3 w-full sm:w-auto border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/30"
                                      onClick={() => {
                                        navigator.clipboard.writeText(selectedEvent.details?.script_or_copy + "\n\n" + selectedEvent.details?.hashtags);
                                        toast.success("Legenda com hashtags copiada!", {
                                          icon: <Copy className="w-4 h-4 text-blue-500" />
                                        });
                                      }}
                                    >
                                      <Copy className="w-4 h-4 mr-2" />
                                      Copiar Legenda Completa
                                    </Button>
                                  </div>
                                </motion.div>
                              )}
                              {selectedEvent.details?.creative_guidance && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.3 }}
                                >
                                  <h3 className="font-bold text-base sm:text-lg flex items-center gap-2 mb-3">
                                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
                                      Guia Criativo
                                    </span>
                                  </h3>

                                  <div className="border p-4 sm:p-5 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-blue-200 dark:border-blue-800/50 shadow-sm">
                                    <div className="flex gap-3 items-start mb-4">
                                      <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full">
                                        <Camera className="w-4 h-4 text-blue-700 dark:text-blue-300" />
                                      </div>
                                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">{selectedEvent.details.creative_guidance.description}</p>
                                    </div>

                                    {selectedEvent.details.creative_guidance.type === 'image' && (
                                      <div className="bg-blue-900/5 dark:bg-blue-500/10 p-4 rounded-md font-mono text-xs sm:text-sm text-blue-800 dark:text-blue-300 relative mb-4 border border-blue-200 dark:border-blue-800/60 shadow-inner">
                                        <div className="flex justify-between items-center mb-2">
                                          <p className="font-semibold flex items-center gap-1">
                                            <Sparkles className="w-3.5 h-3.5" />
                                            Prompt Sugerido:
                                          </p>
                                          <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-7 w-7 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                                            onClick={() => {
                                              navigator.clipboard.writeText(selectedEvent.details?.creative_guidance.prompt ?? "");
                                              toast.success("Prompt copiado!", {
                                                icon: <Copy className="w-4 h-4 text-blue-500" />
                                              });
                                            }}
                                          >
                                            <Copy className="w-4 h-4" />
                                          </Button>
                                        </div>
                                        <p className="whitespace-pre-line break-words">{selectedEvent.details.creative_guidance.prompt}</p>
                                      </div>
                                    )}

                                    <a
                                      href={selectedEvent.details.creative_guidance.tool_link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block"
                                    >
                                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-sm">
                                        <LinkIcon className="w-4 h-4 mr-2" />
                                        Abrir Ferramenta Recomendada
                                      </Button>
                                    </a>
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          </TabsContent>

                          <TabsContent
                            value="execution"
                            className="data-[state=active]:block mt-0"
                          >
                            <div
                              className="pt-4 pb-24 px-4 sm:px-6 space-y-5 sm:space-y-6"
                            >
                              {selectedEvent.details && (
                                <>
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-green-50/50 dark:bg-green-900/20 rounded-xl p-4 border border-green-100 dark:border-green-800/50"
                                  >
                                    <h3 className="font-bold text-base sm:text-lg flex items-center gap-2 text-green-800 dark:text-green-300 mb-2">
                                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                                      Plano de Execução
                                    </h3>

                                    <div className="bg-white dark:bg-slate-800/60 rounded-lg p-3 border border-green-100 dark:border-green-800/50 mb-3 shadow-sm">
                                      <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                        <span className="font-semibold text-green-700 dark:text-green-400">Ferramenta Recomendada:</span>
                                        <span className="font-medium">{selectedEvent.details.tool_suggestion}</span>
                                      </p>
                                    </div>

                                    {/* NOVA CHECKLIST INTERATIVA */}
                                    <ExecutionChecklist
                                      steps={selectedEvent.details.step_by_step}
                                      planItem={selectedEvent}
                                      onStepToggle={(index, checked) =>
                                        handleStepToggle(selectedEvent, index, checked)
                                      }
                                    />
                                  </motion.div>

                                  {selectedEvent.details.creative_guidance && (
                                    <motion.div
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: 0.2 }}
                                    >
                                      <h3 className="font-bold text-base sm:text-lg flex items-center gap-2 mb-3">
                                        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
                                          Guia Criativo
                                        </span>
                                      </h3>

                                      <div className="border p-4 sm:p-5 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-blue-200 dark:border-blue-800/50 shadow-sm">
                                        <div className="flex gap-3 items-start mb-4">
                                          <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full">
                                            <Camera className="w-4 h-4 text-blue-700 dark:text-blue-300" />
                                          </div>
                                          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">{selectedEvent.details.creative_guidance.description}</p>
                                        </div>

                                        {selectedEvent.details.creative_guidance.type === 'image' && (
                                          <div className="bg-blue-900/5 dark:bg-blue-500/10 p-4 rounded-md font-mono text-xs sm:text-sm text-blue-800 dark:text-blue-300 relative mb-4 border border-blue-200 dark:border-blue-800/60 shadow-inner">
                                            <div className="flex justify-between items-center mb-2">
                                              <p className="font-semibold flex items-center gap-1">
                                                <Sparkles className="w-3.5 h-3.5" />
                                                Prompt Sugerido:
                                              </p>
                                              <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-7 w-7 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                                                onClick={() => {
                                                  navigator.clipboard.writeText(selectedEvent.details?.creative_guidance.prompt ?? "");
                                                  toast.success("Prompt copiado!", {
                                                    icon: <Copy className="w-4 h-4 text-blue-500" />
                                                  });
                                                }}
                                              >
                                                <Copy className="w-4 h-4" />
                                              </Button>
                                            </div>
                                            <p className="whitespace-pre-line break-words">{selectedEvent.details.creative_guidance.prompt}</p>
                                          </div>
                                        )}

                                        <a
                                          href={selectedEvent.details.creative_guidance.tool_link}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="block"
                                        >
                                          <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-sm">
                                            <LinkIcon className="w-4 h-4 mr-2" />
                                            Abrir Ferramenta Recomendada
                                          </Button>
                                        </a>
                                      </div>
                                    </motion.div>
                                  )}
                                </>
                              )}
                            </div>
                          </TabsContent>
                        </div>
                      </Tabs>
                    </motion.div>
                  )}
                </div>

                {/* Barra de ações fixa na parte inferior - SEMPRE VISÍVEL */}
                <div className="absolute bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm pt-4 pb-4 px-4 sm:px-6 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-end gap-2 shadow-lg z-20">
                  <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      onClick={handleShareItem}
                      className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 w-full"
                      disabled={isUpdating}
                    >
                      <Share2 className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                      Compartilhar
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 w-full"
                      disabled={isUpdating}
                    >
                      <Edit className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
                      Editar
                    </Button>
                  </div>

                  <div className="mt-2 sm:mt-0 w-full sm:w-auto">
                    {selectedEvent.status !== "concluido" ? (
                      <Button
                        onClick={() => handleMarkCompleted(selectedEvent)}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white w-full relative overflow-hidden shadow-sm"
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <LoadingDots />
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Marcar como Concluído
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                              initial={{ x: -200 }}
                              animate={{ x: 400 }}
                              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            />
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 hover:text-amber-900 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800/40 dark:hover:bg-amber-900/30 w-full"
                        onClick={() => {
                          if (isUpdating) return;

                          const updatedPlan = planWithIds.map((p) => (
                            p.id === selectedEvent.id
                              ? { ...p, status: "planejado" as const, completedAt: undefined }
                              : p
                          ));
                          handleUpdatePlan(updatedPlan);
                          setSelectedEvent(null);
                        }}
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <LoadingDots />
                        ) : (
                          <>
                            <Clock className="w-4 h-4 mr-2" />
                            Marcar como Pendente
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* Modal de compartilhamento com imagem dinâmica */}
      <ShareAchievementModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        stats={progressStats}
        streakDays={streakDays}
      />

      {/* Modal de perfil público com medalhas */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        stats={progressStats}
        streakDays={streakDays}
        plansGenerated={plansGenerated}
      />

      {/* Modal de ranking */}
      <RankingModal
        isOpen={showRankingModal}
        onClose={() => setShowRankingModal(false)}
        currentStreak={streakDays}
      />
    </MotionConfig>
  );
}