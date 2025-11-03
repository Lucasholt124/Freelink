// components/brain/CalendarView.tsx - CALENDÁRIO VISUAL INSANO
"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
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
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";

// ============================================
// TIPOS
// ============================================

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
  draft: {
    icon: AlertCircle,
    label: "Rascunho",
    color: "text-gray-500",
  },
  scheduled: {
    icon: Calendar,
    label: "Agendado",
    color: "text-blue-500",
  },
  queued: {
    icon: Clock,
    label: "Na Fila",
    color: "text-yellow-500",
  },
  publishing: {
    icon: Loader2,
    label: "Publicando",
    color: "text-orange-500 animate-spin",
  },
  published: {
    icon: Check,
    label: "Publicado",
    color: "text-green-500",
  },
  failed: {
    icon: AlertCircle,
    label: "Falhou",
    color: "text-red-500",
  },
} as const;

interface CalendarViewProps {
  onPostClick?: (post: Doc<"scheduledPosts">) => void;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function CalendarView({ onPostClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Calcular range de datas do mês atual
  const { startDate, endDate } = useMemo(() => {
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    };
  }, [currentDate]);

  // Buscar posts do mês
  const posts = useQuery(api.scheduledPosts.getPostsByDateRange, {
    startDate,
    endDate,
  });

  // Gerar dias do calendário
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

    // Dias do mês anterior (padding)
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({
        date: "",
        day: 0,
        isCurrentMonth: false,
        isToday: false,
        posts: [],
      });
    }

    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
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

  // Handlers
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* CALENDÁRIO */}
      <Card className="lg:col-span-2 shadow-xl border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl capitalize">
              <Calendar className="w-5 h-5 text-blue-500" />
              {monthName}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleToday}>
                Hoje
              </Button>
              <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Grid do calendário */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => (
              <motion.div
                key={idx}
                whileHover={day.isCurrentMonth ? { scale: 1.05 } : {}}
                className={cn(
                  "min-h-[100px] p-2 border rounded-lg relative transition-all cursor-pointer",
                  day.isCurrentMonth
                    ? "bg-white dark:bg-gray-900 hover:shadow-md hover:border-primary/50"
                    : "bg-gray-50 dark:bg-gray-950 opacity-40",
                  day.isToday &&
                    "border-primary/80 bg-primary/5 ring-2 ring-primary/20",
                  selectedDate === day.date && "ring-2 ring-blue-500"
                )}
                onClick={() => day.isCurrentMonth && setSelectedDate(day.date)}
              >
                {day.isCurrentMonth && (
                  <>
                    <div className="text-sm font-semibold mb-1">{day.day}</div>
                    <ScrollArea className="h-[70px]">
                      <div className="space-y-1">
                        {day.posts.map((post) => {
                          const config = CONTENT_TYPE_CONFIG[post.contentType];
                          const Icon = config.icon;
                          const StatusIcon = STATUS_CONFIG[post.status].icon;

                          return (
                            <motion.div
                              key={post._id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                onPostClick?.(post);
                              }}
                              className={cn(
                                "text-[10px] px-1.5 py-1 rounded border cursor-pointer hover:scale-105 transition-transform",
                                config.color
                              )}
                            >
                              <div className="flex items-center gap-1 truncate">
                                <Icon className="w-3 h-3 flex-shrink-0" />
                                <span className="flex-1 truncate">{post.scheduledTime}</span>
                                <StatusIcon
                                  className={cn(
                                    "w-3 h-3 flex-shrink-0",
                                    STATUS_CONFIG[post.status].color
                                  )}
                                />
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SIDEBAR: POSTS DO DIA SELECIONADO */}
      <Card className="shadow-xl border-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            {selectedDate
              ? `Posts de ${new Date(selectedDate + "T00:00:00").toLocaleDateString(
                  "pt-BR",
                  { day: "2-digit", month: "long" }
                )}`
              : "Selecione um dia"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            {postsForSelectedDate.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-sm">
                  {selectedDate
                    ? "Nenhum post agendado para este dia"
                    : "Clique em um dia para ver os posts"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {postsForSelectedDate.map((post) => {
                  const config = CONTENT_TYPE_CONFIG[post.contentType];
                  const Icon = config.icon;
                  const StatusIcon = STATUS_CONFIG[post.status].icon;

                  return (
                    <motion.div
                      key={post._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ x: 5 }}
                      onClick={() => onPostClick?.(post)}
                      className="p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl border-2 hover:border-primary/50 cursor-pointer transition-all"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "p-2 rounded-lg",
                              config.color.split(" ")[0]
                            )}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <Badge variant="outline" className="text-xs">
                              {config.label}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs font-mono">{post.scheduledTime}</span>
                        </div>
                      </div>

                      <p className="text-sm line-clamp-2 mb-2">{post.caption}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="text-xs capitalize"
                          >
                            {post.platform}
                          </Badge>
                          {post.autoPublish && (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-yellow-500/10 text-yellow-600"
                            >
                              Auto
                            </Badge>
                          )}
                        </div>
                        <div
                          className={cn(
                            "flex items-center gap-1 text-xs",
                            STATUS_CONFIG[post.status].color
                          )}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {STATUS_CONFIG[post.status].label}
                        </div>
                      </div>
                    </motion.div>
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