// components/brain/CalendarView.tsx - VERSÃO COMPLETA CORRIGIDA
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Video,
  Layers,
  Camera,
  MessageSquare,
  Clock,
  Check,
  AlertCircle,
  Bell,
  Loader2,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";

const CONTENT_TYPE_CONFIG = {
  reel: {
    icon: Video,
    label: "Reel",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  carousel: {
    icon: Layers,
    label: "Carrossel",
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  },
  image_post: {
    icon: Camera,
    label: "Post",
    color: "bg-pink-500/10 text-pink-600 border-pink-500/20",
  },
  story_sequence: {
    icon: MessageSquare,
    label: "Story",
    color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  },
} as const;

const STATUS_CONFIG = {
  draft: { icon: AlertCircle, label: "Rascunho", color: "text-gray-500" },
  scheduled: { icon: Calendar, label: "Agendado", color: "text-blue-500" },
  queued: { icon: Clock, label: "Na Fila", color: "text-yellow-500" },
  publishing: { icon: Loader2, label: "Publicando", color: "text-orange-500 animate-spin" },
  published: { icon: Check, label: "Publicado", color: "text-green-500" },
  failed: { icon: AlertCircle, label: "Falhou", color: "text-red-500" },
  notified: { icon: Bell, label: "Notificado", color: "text-cyan-500" },
  completed: { icon: Check, label: "Concluído", color: "text-green-500" },
  cancelled: { icon: AlertCircle, label: "Cancelado", color: "text-gray-500" },
} as const;

interface CalendarViewProps {
  onPostClick?: (post: Doc<"scheduledPosts">) => void;
}

export default function CalendarView({ onPostClick }: CalendarViewProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { startDate, endDate } = useMemo(() => {
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    };
  }, [currentDate]);

  const posts = useQuery(api.scheduledPosts.getPostsByDateRange, {
    startDate,
    endDate,
  });

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Array<{
      date: string;
      day: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      posts: Doc<"scheduledPosts">[];
    }> = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({
        date: "",
        day: 0,
        isCurrentMonth: false,
        isToday: false,
        posts: [],
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayPosts = posts?.filter((p) => p.scheduledDate === dateStr) || [];
      const today = new Date();
      const isToday =
        today.getDate() === day &&
        today.getMonth() === month &&
        today.getFullYear() === year;

      days.push({
        date: dateStr,
        day,
        isCurrentMonth: true,
        isToday,
        posts: dayPosts,
      });
    }

    return days;
  }, [currentDate, posts]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const monthName = currentDate.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  const postsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return posts?.filter((p) => p.scheduledDate === selectedDate) || [];
  }, [selectedDate, posts]);

  const handlePostClick = (post: Doc<"scheduledPosts">) => {
    if (onPostClick) {
      onPostClick(post);
      return;
    }
    router.push(`/dashboard/brain/post/${post._id}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* ========== CALENDÁRIO ========== */}
      <Card className="lg:col-span-2 shadow-xl border-2">
        <CardHeader className="pb-3 px-3 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl capitalize">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
              {monthName}
            </CardTitle>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToday}
                className="flex-1 sm:flex-none text-xs sm:text-sm"
              >
                Hoje
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevMonth}
                className="h-8 w-8 sm:h-9 sm:w-9"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextMonth}
                className="h-8 w-8 sm:h-9 sm:w-9"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-2 sm:px-6 pb-4">
          {/* Cabeçalho dos dias */}
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2">
            {["D", "S", "T", "Q", "Q", "S", "S"].map((day, i) => (
              <div
                key={i}
                className="text-center text-[10px] sm:text-xs font-semibold text-muted-foreground py-1 sm:py-2"
              >
                <span className="hidden sm:inline">
                  {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][i]}
                </span>
                <span className="sm:hidden">{day}</span>
              </div>
            ))}
          </div>

          {/* Grid do calendário */}
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
            {calendarDays.map((day, idx) => {
              const isSelected = selectedDate === day.date;

              return (
                <motion.button
                  key={idx}
                  type="button"
                  whileHover={day.isCurrentMonth ? { scale: 1.02 } : {}}
                  whileTap={day.isCurrentMonth ? { scale: 0.98 } : {}}
                  disabled={!day.isCurrentMonth}
                  className={cn(
                    "min-h-[60px] sm:min-h-[100px] p-1 sm:p-2 border rounded-md sm:rounded-lg relative transition-all",
                    "focus:outline-none focus:ring-2 focus:ring-primary/50",
                    day.isCurrentMonth
                      ? "bg-white dark:bg-gray-900 hover:shadow-lg hover:border-primary/60 cursor-pointer active:bg-primary/5"
                      : "bg-gray-50 dark:bg-gray-950 opacity-40 cursor-not-allowed",
                    day.isToday && "border-primary/80 bg-primary/5 ring-2 ring-primary/30",
                    // ✅ MELHOR FEEDBACK VISUAL DE SELEÇÃO
                    isSelected && "ring-2 ring-blue-600 bg-blue-50 dark:bg-blue-950/50 border-blue-600 shadow-lg scale-105"
                  )}
                  onClick={() => {
                    if (day.isCurrentMonth) {
                      setSelectedDate(day.date);
                    }
                  }}
                >
                  {day.isCurrentMonth && (
                    <>
                      {/* Número do dia */}
                      <div className={cn(
                        "text-xs sm:text-sm font-semibold mb-0.5 sm:mb-1 transition-colors",
                        isSelected && "text-blue-600 dark:text-blue-400 scale-110"
                      )}>
                        {day.day}
                      </div>

                      {/* Posts do dia */}
                      <ScrollArea className="h-[40px] sm:h-[70px]">
                        <div className="space-y-0.5 sm:space-y-1">
                          {day.posts.slice(0, 3).map((post) => {
                            const config = CONTENT_TYPE_CONFIG[post.contentType];
                            const Icon = config.icon;

                            return (
                              <div
                                key={post._id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePostClick(post);
                                }}
                                className={cn(
                                  "text-[8px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 sm:py-1 rounded border cursor-pointer",
                                  "hover:scale-105 active:scale-95 transition-transform",
                                  config.color
                                )}
                              >
                                <div className="flex items-center gap-0.5 sm:gap-1 truncate">
                                  <Icon className="w-2 h-2 sm:w-3 sm:h-3 flex-shrink-0" />
                                  <span className="hidden sm:inline truncate">{post.scheduledTime}</span>
                                </div>
                              </div>
                            );
                          })}
                          {day.posts.length > 3 && (
                            <div className="text-[8px] text-muted-foreground text-center">
                              +{day.posts.length - 3}
                            </div>
                          )}
                        </div>
                      </ScrollArea>

                      {/* ✅ INDICADOR DE SELEÇÃO */}
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-blue-600 rounded-full border-2 border-white dark:border-gray-900"
                          >
                            <Check className="w-full h-full text-white p-0.5" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </motion.button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ========== SIDEBAR: POSTS DO DIA ========== */}
      <Card className="shadow-xl border-2">
        <CardHeader className="pb-3 px-3 sm:px-6">
          <CardTitle className="text-base sm:text-lg">
            {selectedDate
              ? `📅 ${new Date(selectedDate + "T00:00:00").toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                })}`
              : "Selecione um dia"}
          </CardTitle>
        </CardHeader>

        <CardContent className="px-2 sm:px-6">
          <ScrollArea className="h-[300px] sm:h-[500px]">
            {postsForSelectedDate.length === 0 ? (
              <div className="text-center py-8 sm:py-12 text-muted-foreground">
                <Calendar className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-20" />
                <p className="text-xs sm:text-sm px-4">
                  {selectedDate
                    ? "Nenhum post agendado"
                    : "👆 Clique em um dia"}
                </p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3 px-1">
                {postsForSelectedDate.map((post) => {
                  const config = CONTENT_TYPE_CONFIG[post.contentType];
                  const Icon = config.icon;
                  const StatusIcon = STATUS_CONFIG[post.status].icon;

                  return (
                    <motion.button
                      key={post._id}
                      type="button"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ x: 5, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePostClick(post)}
                      className="w-full p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-lg sm:rounded-xl border-2 hover:border-primary/50 hover:shadow-lg cursor-pointer transition-all text-left"
                    >
                      {/* Header */}
                       <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className={cn("p-1.5 sm:p-2 rounded-md sm:rounded-lg", config.color.split(" ")[0])}>
                            <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                          </div>
                          <Badge variant="outline" className="text-[10px] sm:text-xs">
                            {config.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          {/* Content */}
                        </div>
                      </div>

                      {/* Caption */}
                      <p className="text-xs sm:text-sm line-clamp-2 mb-2">{post.caption}</p>

                      {/* Footer */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-[10px] sm:text-xs capitalize">
                            {post.platform}
                          </Badge>
                          {post.autoPublish && (
                            <Badge variant="secondary" className="text-[10px] bg-yellow-500/10 text-yellow-600">
                              Auto
                            </Badge>
                          )}
                        </div>
                        <div className={cn("flex items-center gap-1 text-[10px] sm:text-xs", STATUS_CONFIG[post.status].color)}>
                          <StatusIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          <span className="hidden sm:inline">{STATUS_CONFIG[post.status].label}</span>
                        </div>
                      </div>

                      {/* Botão de Edição */}
                      <div className="mt-2 pt-2 border-t flex items-center justify-center gap-2">
                        <Edit className="w-3 h-3 text-primary" />
                        <span className="text-xs text-primary font-medium">Clique para editar</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}