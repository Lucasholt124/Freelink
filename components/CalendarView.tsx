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
   Zap , Instagram, Twitter, Linkedin, Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation } from "convex/react";
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
    creative_guidance: {
      type: string;
      description: string;
      prompt: string;
      tool_link: string;
    };
  };
};

export type PlanItem = PlanItemFromDB & { id: string; };

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

// Componente de compartilhamento
interface ShareAchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: {
    total: number;
    completed: number;
    percent: number;
  };
  streakDays: number;
}

// Componente de compartilhamento
function ShareAchievementModal({ isOpen, onClose, stats, streakDays }: ShareAchievementModalProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [shareCode, setShareCode] = useState("");

  const shareAchievement = useMutation(api.shareAchievements.shareAchievement);
  const updatePlatform = useMutation(api.shareAchievements.updateSharingPlatform);

  const handleShareAchievement = async () => {
    setIsSharing(true);
    try {
      // Compartilhar conquista sem necessidade de upload de imagem
      const result = await shareAchievement({
        streakDays,
        completedPosts: stats.completed,
        totalPosts: stats.total,
      });

      // Guardar informações para compartilhamento
      setShareUrl(result.shareUrl);
      setShareCode(result.shareCode);

      toast.success("Conquista pronta para compartilhar!");
    } catch (error) {
      console.error("Erro ao compartilhar conquista:", error);
      toast.error("Não foi possível compartilhar sua conquista");
    } finally {
      setIsSharing(false);
    }
  };

  // Definindo o tipo para o parâmetro platform
  const handleShare = async (platform: 'twitter' | 'linkedin' | 'instagram') => {
    // Verificar se já temos uma URL compartilhável
    if (!shareUrl) {
      // Tentar gerar novamente se não há URL
      await handleShareAchievement();
      // Se ainda não houver URL, retornar
      if (!shareUrl) {
        toast.error("Não foi possível gerar um link para compartilhar.");
        return;
      }
    }

    // Registrar a plataforma de compartilhamento
    if (shareCode) {
      updatePlatform({
         achievementId: shareCode as unknown as Id<"sharedAchievements">, // Na implementação real, este seria o ID correto
        platform,
      }).catch(console.error);
    }

    // Texto para compartilhamento
    const shareText = `🔥 Mantenho minha sequência de ${streakDays} dias criando conteúdo! Já concluí ${stats.completed} de ${stats.total} posts com o Mentor.IA da @freelink`;

    let url;
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(shareText)}`;
        break;
      case 'instagram':
        // Instagram não permite compartilhamento direto via URL
        toast.info("Copie o texto e compartilhe no Instagram!");
        navigator.clipboard.writeText(shareText);
        return;
    }

    if (url) window.open(url, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white dark:bg-slate-900 p-0 overflow-hidden rounded-xl">
        <div className="p-4 sm:p-6">
          <h2 className="text-xl font-bold text-center mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Compartilhe sua Conquista! 🏆
          </h2>

          {/* Visualização da conquista - sem geração de imagem real */}
          <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-blue-600 to-purple-700 p-6 text-white shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/20 p-2 rounded-full">
                  <Flame className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <div className="text-xs text-white/70">Minha sequência</div>
                  <div className="text-2xl font-bold">{streakDays} dias 🔥</div>
                </div>
              </div>

              <div className="mb-4 bg-white/10 rounded-lg p-3">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-1">{stats.completed}</div>
                  <div className="text-xs text-white/70">Posts concluídos</div>
                </div>

                <div className="mt-2 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-yellow-300"
                    style={{ width: `${stats.percent}%` }}
                  ></div>
                </div>
                <div className="text-xs text-white/70 text-center mt-1">
                  {stats.percent}% do plano
                </div>
              </div>

              <div className="text-sm text-center">
                Criado com <span className="font-bold">Mentor.IA</span> da @freelink
              </div>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="mt-4 space-y-3">
            {!shareUrl ? (
              <Button
                onClick={handleShareAchievement}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                disabled={isSharing}
              >
                {isSharing ? <LoadingDots /> : (
                  <>
                    <Share2 className="w-4 h-4 mr-2" />
                    Gerar link para compartilhar
                  </>
                )}
              </Button>
            ) : (
              <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">Link para compartilhar:</p>
                <div className="flex">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="text-xs p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-l-lg flex-1"
                  />
                  <Button
                    size="sm"
                    className="rounded-l-none"
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl);
                      toast.success("Link copiado!");
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-center gap-3 pt-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full h-10 w-10 bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                      onClick={() => handleShare('twitter')}
                    >
                      <Twitter className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Compartilhar no Twitter</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full h-10 w-10 bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100"
                      onClick={() => handleShare('linkedin')}
                    >
                      <Linkedin className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Compartilhar no LinkedIn</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full h-10 w-10 bg-gradient-to-br from-purple-100 to-amber-50 text-pink-600 border-pink-200 hover:from-purple-200 hover:to-amber-100"
                      onClick={() => handleShare('instagram')}
                    >
                      <Instagram className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Compartilhar no Instagram</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
    icon: <MessageSquare className="w-4 h-4 mr-2" />, // Mantido MessageSquare para Story, mas Eye (de Lucide) também seria uma boa opção!
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
  const [showShareModal, setShowShareModal] = useState(false);
  const [streakAchievement, setStreakAchievement] = useState(false);

  // Ref para o conteúdo scrollável do modal
  const contentScrollRef = useRef<HTMLDivElement>(null);

  const updatePlanMutation = useMutation(api.mentor.updateContentPlan);

  // Preparar dados para o calendário
  const planWithIds: PlanItem[] = useMemo(
    () => plan.map((p, index) => ({ ...p, id: `${p.title}-${index}` })),
    [plan]
  );

  // Criar eventos para o calendário
  const events = useMemo(() => {
     const startDate = startOfDay(new Date());
    return planWithIds.map((item) => {
      // Ajuste para garantir que a data seja sempre no futuro ou hoje, com base no "dia" do plano.
      // O `item.day` é uma string como "Dia 1", "Dia 2".
      // Precisamos mapear isso para uma data real no calendário.
      // Uma abordagem comum é basear no _primeiro_ dia do plano (se existir)
      // ou assumir que o "Dia 1" é sempre a data atual quando o plano é gerado.
      // Por enquanto, o código atual `addDays(today, dayNumber - 1)` funciona se o plano sempre começa do "Dia 1" hoje.
        const dayNumber = parseInt(item.day.replace(/\D/g, ""), 10) || 1;
        const eventDate = addDays(startDate, dayNumber - 1); // Isso pode fazer com que eventos de "Dia 1" a "Dia N" sempre apareçam a partir da data atual
                                                     // O ideal é que o `day` do item já venha do backend como uma data específica (timestamp ou string YYYY-MM-DD)
                                                     // ou que você tenha uma `startDate` no `analysisId`
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
  // Cálculos de progresso...
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
        .map((item) => startOfDay(new Date(item.completedAt!)).getTime()); // Get timestamps of start of day

    const uniqueCompletedDays = Array.from(new Set(completedPostsTimestamps))
        .map(ts => new Date(ts))
        .sort((a, b) => a.getTime() - b.getTime()); // Sort oldest to newest

    let calculatedStreak = 0;
    const todayStartOfDay = startOfDay(new Date());

    if (uniqueCompletedDays.length === 0) {
        calculatedStreak = 0;
    } else {
        let lastDayChecked = uniqueCompletedDays[uniqueCompletedDays.length - 1]; // Most recent completed day

        // Check if the most recent completed day is today or yesterday
        if (isSameDay(lastDayChecked, todayStartOfDay)) {
            calculatedStreak = 1;
        } else if (isSameDay(lastDayChecked, addDays(todayStartOfDay, -1))) {
            // If the last completed day was yesterday, and no post today yet, streak continues from yesterday
            calculatedStreak = 1;
        } else {
            // Last completed post was before yesterday, streak is 0
            calculatedStreak = 0;
        }

        // Count backwards for full streak
        if (calculatedStreak > 0) {
            for (let i = uniqueCompletedDays.length - 2; i >= 0; i--) {
                const prevDay = uniqueCompletedDays[i];
                if (isSameDay(prevDay, addDays(lastDayChecked, -1))) {
                    calculatedStreak++;
                    lastDayChecked = prevDay;
                } else {
                    break; // Streak broken
                }
            }
        }
    }

    // Only trigger achievement if the calculated streak is a new milestone AND greater than previous streakDays
    // This comparison uses the `streakDays` from the *previous* render
    if (calculatedStreak > streakDays) {
        if (
            (streakDays < 7 && calculatedStreak >= 7) ||
            (streakDays < 14 && calculatedStreak >= 14) ||
            (streakDays < 30 && calculatedStreak >= 30)
        ) {
            setStreakAchievement(true);
        }
    }

    setStreakDays(calculatedStreak); // Update the state
  }, [planWithIds, events, streakDays]); // Dependency array should cause re-run when plan changes

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
              setStreakAchievement(false); // Reset para não disparar múltiplas vezes
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

  // ✅ NOVO: useEffect para rolar para o topo quando o evento selecionado muda ou quando o modo de edição muda
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
            {/* Streak Counter - FUNCIONALIDADE VIRAL #1 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "rounded-full p-2.5 flex items-center justify-center",
                  streakDays >= 30 ? "bg-gradient-to-r from-amber-500 to-red-500" :
                  streakDays >= 14 ? "bg-gradient-to-r from-amber-400 to-orange-500" :
                  streakDays >= 7 ? "bg-gradient-to-r from-yellow-400 to-amber-500" :
                  "bg-slate-100 dark:bg-slate-700"
                )}>
                  <Flame  className={cn(
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

      {/* Modal de detalhes do evento - VERSÃO VIRAL */}
     {/* Modal de detalhes do evento - VERSÃO COM SCROLL OTIMIZADO */}
<Dialog open={!!selectedEvent} onOpenChange={() => { setSelectedEvent(null); setIsEditing(false); }}>
  <DialogContent className="max-w-3xl w-[95vw] sm:w-full max-h-[90vh] p-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 flex flex-col">
    <AnimatePresence mode="wait">
      {selectedEvent && (
        <motion.div
          className="flex flex-col h-full min-h-0" // min-h-0 é crucial para flexbox
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

                  {/* Conteúdo das Tabs - ÁREA DE SCROLL COM PADDING BOTTOM PARA BOTÕES (Ajustado) */}
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

                              <div className="prose prose-sm dark:prose-invert max-w-none bg-white dark:bg-slate-800/60 p-3 sm:p-4 rounded-md text-sm border border-green-100 dark:border-green-800/50 shadow-sm">
                                <ReactMarkdown>{selectedEvent.details.step_by_step?.replace(/\\n/g, '\n')}</ReactMarkdown>
                              </div>
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

      {/* Modal de compartilhamento - FUNCIONALIDADE VIRAL #2 */}
      <ShareAchievementModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        stats={progressStats}
        streakDays={streakDays}
      />
    </MotionConfig>
  );
}