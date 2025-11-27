"use client";

import { useState, useEffect, JSX } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  BarChart2,
  Clock,
  Globe,
  Users,
  ExternalLink,
  LinkIcon,
  Download,
  Calendar,
  MousePointer,
  Smartphone,
  Laptop,
  Share2,
  Copy,
  Activity,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Zap,
  Twitter,
  Facebook,
  Linkedin,
  MessageCircle,
  Send,
  Check,
  X
} from "lucide-react";
import { toast } from "sonner";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type LinkData = { id: string; url: string; createdAt: number; };
type ClickData = {
  id: number;
  timestamp: number;
  country: string | null;
  visitorId: string;
  userAgent?: string;
  referrer?: string;
};
type PageData = { link: LinkData; clicks: ClickData[] };

// 🎨 Logo F Component - Marca Freelinnk
function FreelinnkLogo({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizes = {
    sm: "w-5 h-5 text-xs",
    md: "w-7 h-7 text-sm",
    lg: "w-10 h-10 text-base"
  };

  return (
    <div className={clsx(
      "bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600 rounded-lg flex items-center justify-center font-black text-white shadow-lg shadow-purple-500/30",
      sizes[size],
      className
    )}>
      F
    </div>
  );
}

// 🚀 Share Modal Component - Modal de Compartilhamento Empolgante
function ShareModal({
  isOpen,
  onClose,
  shortUrl,
  totalClicks
}: {
  isOpen: boolean;
  onClose: () => void;
  shortUrl: string;
  totalClicks: number;
}) {
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);

  const shareMessage = `🚀 Meu link já tem ${totalClicks} cliques! Acompanhe suas métricas com Freelinnk ✨`;
  const shareMessageEncoded = encodeURIComponent(shareMessage);
  const urlEncoded = encodeURIComponent(shortUrl);

  const shareOptions = [
    {
      name: "Twitter / X",
      icon: Twitter,
      color: "from-gray-800 to-black",
      hoverColor: "hover:shadow-gray-500/30",
      url: `https://twitter.com/intent/tweet?text=${shareMessageEncoded}&url=${urlEncoded}`,
      emoji: "𝕏"
    },
    {
      name: "Facebook",
      icon: Facebook,
      color: "from-blue-600 to-blue-700",
      hoverColor: "hover:shadow-blue-500/30",
      url: `https://www.facebook.com/sharer/sharer.php?u=${urlEncoded}&quote=${shareMessageEncoded}`,
      emoji: "📘"
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      color: "from-blue-700 to-blue-800",
      hoverColor: "hover:shadow-blue-600/30",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${urlEncoded}`,
      emoji: "💼"
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "from-green-500 to-green-600",
      hoverColor: "hover:shadow-green-500/30",
      url: `https://wa.me/?text=${shareMessageEncoded}%20${urlEncoded}`,
      emoji: "💬"
    },
    {
      name: "Telegram",
      icon: Send,
      color: "from-sky-500 to-sky-600",
      hoverColor: "hover:shadow-sky-500/30",
      url: `https://t.me/share/url?url=${urlEncoded}&text=${shareMessageEncoded}`,
      emoji: "✈️"
    }
  ];

  const handleCopyWithMessage = () => {
    const fullMessage = `${shareMessage}\n\n🔗 ${shortUrl}\n\n— Powered by Freelinnk`;
    navigator.clipboard.writeText(fullMessage);
    setCopiedPlatform("copy");
    toast.success("Mensagem copiada com sucesso! 🎉");
    setTimeout(() => setCopiedPlatform(null), 2000);
  };

  const handleShare = (platform: string, url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400');
    toast.success(`Compartilhando no ${platform}! 🚀`);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-[50%] -translate-y-1/2 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-md sm:w-full z-50"
          >
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
              {/* Header com Gradiente */}
              <div className="relative bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 p-6 pb-12">
                {/* Botão Fechar */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Decoração de fundo */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                </div>

                <div className="relative flex items-center gap-4">
                  <motion.div
                    initial={{ rotate: -10, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: "spring", delay: 0.1 }}
                  >
                    <FreelinnkLogo size="lg" className="shadow-xl" />
                  </motion.div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                      Compartilhe seu sucesso! 🎉
                    </h2>
                    <p className="text-white/80 text-sm mt-1">
                      Mostre ao mundo seus resultados
                    </p>
                  </div>
                </div>
              </div>

              {/* Card de Stats flutuante */}
              <div className="relative px-6 -mt-8">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-xl border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                        <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Total de cliques</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {totalClicks.toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-full text-xs font-bold">
                      <TrendingUp className="w-3 h-3" />
                      Sucesso!
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Opções de Compartilhamento */}
              <div className="p-6 pt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
                  Escolha onde compartilhar:
                </p>

                {/* Grid de Redes Sociais */}
                <div className="grid grid-cols-5 gap-3 mb-6">
                  {shareOptions.map((option, index) => {
                    const Icon = option.icon;
                    return (
                      <motion.button
                        key={option.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        onClick={() => handleShare(option.name, option.url)}
                        className={clsx(
                          "group relative flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-300",
                          "bg-gradient-to-br",
                          option.color,
                          "hover:scale-105 hover:shadow-xl",
                          option.hoverColor
                        )}
                      >
                        <Icon className="w-6 h-6 text-white" />
                        <span className="text-[10px] text-white/90 font-medium hidden sm:block">
                          {option.name.split(' ')[0]}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Copiar Mensagem Completa */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  onClick={handleCopyWithMessage}
                  className={clsx(
                    "w-full flex items-center justify-center gap-3 p-4 rounded-2xl font-semibold transition-all duration-300",
                    copiedPlatform === "copy"
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                  )}
                >
                  {copiedPlatform === "copy" ? (
                    <>
                      <Check className="w-5 h-5" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      Copiar mensagem completa
                    </>
                  )}
                </motion.button>

                {/* Preview da Mensagem */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700"
                >
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">
                    Preview da mensagem:
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    🚀 Meu link já tem <span className="font-bold text-purple-600">{totalClicks}</span> cliques!
                    Acompanhe suas métricas com <span className="font-bold">Freelinnk</span> ✨
                  </p>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <FreelinnkLogo size="sm" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Powered by <span className="font-semibold text-purple-600">Freelinnk</span>
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// 🎯 Share Button Floating - Botão Flutuante de Compartilhamento
function ShareFloatingButton({ onClick, totalClicks }: { onClick: () => void; totalClicks: number }) {
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring" }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-3 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl shadow-purple-500/40 hover:shadow-purple-500/60 transition-all duration-300 group"
    >
      <div className="relative">
        <Share2 className="w-5 h-5" />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full"
        />
      </div>
      <span className="font-semibold hidden sm:inline">Compartilhar</span>
      <div className="hidden sm:flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">
        <Zap className="w-3 h-3" />
        {totalClicks}
      </div>
    </motion.button>
  );
}

// 🎯 Share Stats Card - Card de Compartilhamento Inline
function ShareStatsCard({ shortUrl, totalClicks, onOpenModal }: { shortUrl: string; totalClicks: number; onOpenModal: () => void }) {
  const quickShare = (platform: string) => {
    const shareMessage = `🚀 Meu link já tem ${totalClicks} cliques! Acompanhe suas métricas com Freelinnk ✨`;
    const shareMessageEncoded = encodeURIComponent(shareMessage);
    const urlEncoded = encodeURIComponent(shortUrl);

    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${shareMessageEncoded}&url=${urlEncoded}`,
      whatsapp: `https://wa.me/?text=${shareMessageEncoded}%20${urlEncoded}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${urlEncoded}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'noopener,noreferrer,width=600,height=400');
      toast.success(`Compartilhando! 🚀`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-purple-900/20 dark:via-violet-900/20 dark:to-indigo-900/20 rounded-2xl border border-purple-200 dark:border-purple-800 p-5 sm:p-6"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left Side - Info */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <FreelinnkLogo size="lg" />
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-gray-900"
            />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Compartilhe seu sucesso!
              <Sparkles className="w-5 h-5 text-yellow-500" />
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Seu link já alcançou <span className="font-bold text-purple-600">{totalClicks}</span> cliques!
            </p>
          </div>
        </div>

        {/* Right Side - Quick Share Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => quickShare('twitter')}
            className="flex-1 sm:flex-none p-3 bg-gray-900 hover:bg-black text-white rounded-xl transition-colors"
            title="Compartilhar no Twitter"
          >
            <Twitter className="w-5 h-5 mx-auto" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => quickShare('whatsapp')}
            className="flex-1 sm:flex-none p-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors"
            title="Compartilhar no WhatsApp"
          >
            <MessageCircle className="w-5 h-5 mx-auto" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => quickShare('linkedin')}
            className="flex-1 sm:flex-none p-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl transition-colors"
            title="Compartilhar no LinkedIn"
          >
            <Linkedin className="w-5 h-5 mx-auto" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenModal}
            className="flex-1 sm:flex-none p-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
            title="Mais opções"
          >
            <Share2 className="w-5 h-5" />
            <span className="hidden sm:inline text-sm font-medium">Mais</span>
          </motion.button>
        </div>
      </div>

      {/* Branding Footer */}
      <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FreelinnkLogo size="sm" />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Powered by <span className="font-bold text-purple-600">Freelinnk</span>
          </span>
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          Encurtador de links inteligente
        </span>
      </div>
    </motion.div>
  );
}

// 🎯 Componente de Click Individual com Animação
function ClickRow({ click, index }: { click: ClickData; index: number }) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getDeviceIcon = (userAgent?: string) => {
    if (!userAgent) return <Globe className="w-4 h-4 text-gray-400" />;

    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('iphone') || ua.includes('android')) {
      return <Smartphone className="w-4 h-4 text-blue-500" />;
    }
    return <Laptop className="w-4 h-4 text-purple-500" />;
  };

  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      className="group hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20 transition-all duration-300 border-b border-gray-100 dark:border-gray-800"
    >
      <td className="p-4">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.03 + 0.1, type: "spring" }}
            className="w-2.5 h-2.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-lg shadow-green-500/50 group-hover:scale-125 transition-transform"
          />
          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
            #{click.id}
          </span>
        </div>
      </td>

      <td className="p-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <Calendar className="w-3.5 h-3.5 text-gray-500" />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-300">{formatDate(click.timestamp)}</span>
        </div>
      </td>

      <td className="p-4">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-violet-100 dark:from-purple-900/40 dark:to-violet-900/40 rounded-xl px-3 py-2">
          <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span className="text-sm font-mono font-bold text-purple-700 dark:text-purple-300">
            {formatTime(click.timestamp)}
          </span>
        </div>
      </td>

      <td className="p-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌍</span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{click.country || "Brasil"}</span>
        </div>
      </td>

      <td className="p-4">
        <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2">
          {getDeviceIcon(click.userAgent)}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {click.userAgent ? (
              click.userAgent.includes('Mobile') || click.userAgent.includes('iPhone') ? 'Mobile' : 'Desktop'
            ) : 'Desconhecido'}
          </span>
        </div>
      </td>

      <td className="p-4">
        <span className="text-xs text-gray-500 font-mono bg-gray-100 dark:bg-gray-800 px-2.5 py-1.5 rounded-lg">
          {click.visitorId.substring(0, 12)}...
        </span>
      </td>

      <td className="p-4">
        <span className="text-xs text-gray-500 truncate max-w-[150px] block">
          {click.referrer || "Acesso Direto"}
        </span>
      </td>
    </motion.tr>
  );
}

// 🎯 Tabela Grande de Clicks com Animações
function ClicksTable({ clicks }: { clicks: ClickData[] }) {
  const [timeFilter, setTimeFilter] = useState('all');
  const [filteredClicks, setFilteredClicks] = useState<ClickData[]>(clicks);

  useEffect(() => {
    let filtered = [...clicks];

    if (timeFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filtered = filtered.filter(click => new Date(click.timestamp) >= today);
    } else if (timeFilter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(click => new Date(click.timestamp) >= weekAgo);
    } else if (timeFilter === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(click => new Date(click.timestamp) >= monthAgo);
    }

    setFilteredClicks(filtered);
  }, [timeFilter, clicks]);

  if (!clicks.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 px-4"
      >
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-3xl flex items-center justify-center">
          <Activity className="w-12 h-12 text-purple-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          Nenhum click registrado ainda
        </h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          Compartilhe seu link nas redes sociais para começar a rastrear clicks em tempo real! 🚀
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Filtros e Exportação */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Select defaultValue="all" onValueChange={setTimeFilter}>
          <SelectTrigger className="w-full sm:w-[200px] h-11 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-medium">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">📊 Todos os clicks</SelectItem>
            <SelectItem value="today">📅 Hoje</SelectItem>
            <SelectItem value="week">📆 Últimos 7 dias</SelectItem>
            <SelectItem value="month">🗓️ Últimos 30 dias</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          className="h-11 gap-2 rounded-xl border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/30 font-medium"
          onClick={() => {
            try {
              const headers = ['ID', 'Data', 'Hora', 'País', 'Dispositivo', 'Visitor ID', 'Referrer'];
              const rows = filteredClicks.map(click => [
                click.id,
                new Date(click.timestamp).toLocaleDateString('pt-BR'),
                new Date(click.timestamp).toLocaleTimeString('pt-BR'),
                click.country || 'Brasil',
                click.userAgent || 'Desconhecido',
                click.visitorId,
                click.referrer || 'Direto',
              ]);

              const csvContent = [
                headers.join(','),
                ...rows.map(row => row.join(','))
              ].join('\n');

              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `clicks-${new Date().toISOString().split('T')[0]}.csv`;
              link.click();
              URL.revokeObjectURL(url);

              toast.success('Relatório exportado com sucesso! 📊');
            } catch  {
              toast.error('Erro ao exportar dados');
            }
          }}
        >
          <Download className="w-4 h-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Contador de Clicks - Hero Style */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 rounded-2xl p-6 text-white shadow-2xl shadow-purple-500/25"
      >

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
              <Zap className="w-7 h-7" />
            </div>
            <div>
              <p className="text-white/80 text-sm font-medium mb-1">Total de Clicks</p>
              <p className="text-4xl sm:text-5xl font-bold tracking-tight">
                {filteredClicks.length.toLocaleString('pt-BR')}
              </p>
            </div>
          </div>

          {timeFilter !== 'all' && (
            <div className="text-right bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3">
              <p className="text-xs text-white/70 mb-1">Do total de</p>
              <p className="text-2xl font-bold">{clicks.length}</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Tabela Desktop */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-xl shadow-gray-200/50 dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                <th className="text-left p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data</th>
                <th className="text-left p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">⏰ Horário</th>
                <th className="text-left p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">País</th>
                <th className="text-left p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dispositivo</th>
                <th className="text-left p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Visitor</th>
                <th className="text-left p-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Origem</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredClicks.map((click, index) => (
                  <ClickRow key={click.id} click={click} index={index} />
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards Mobile - Estilo Story */}
      <div className="md:hidden space-y-3">
        <AnimatePresence>
          {filteredClicks.map((click, index) => (
            <motion.div
              key={click.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-lg hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.05 + 0.1, type: "spring" }}
                    className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-lg shadow-green-500/50"
                  />
                  <span className="text-lg font-bold text-gray-900 dark:text-white">Click #{click.id}</span>
                </div>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-full">
                  {new Date(click.timestamp).toLocaleDateString('pt-BR')}
                </span>
              </div>

              {/* Horário em Destaque */}
              <div className="flex items-center gap-3 bg-gradient-to-r from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30 rounded-xl p-4 mb-4">
                <div className="p-2 bg-purple-200 dark:bg-purple-800 rounded-lg">
                  <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-0.5">Horário exato</p>
                  <p className="text-xl font-mono font-bold text-purple-700 dark:text-purple-300">
                    {new Date(click.timestamp).toLocaleTimeString('pt-BR')}
                  </p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                  <span className="text-xl">🌍</span>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">País</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{click.country || "Brasil"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                  {click.userAgent?.toLowerCase().includes('mobile') ? (
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Smartphone className="w-5 h-5 text-blue-500" />
                    </div>
                  ) : (
                    <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Laptop className="w-5 h-5 text-purple-500" />
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Dispositivo</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {click.userAgent?.includes('Mobile') ? 'Mobile' : 'Desktop'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer Info */}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-700 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Visitor ID</span>
                  <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                    {click.visitorId.substring(0, 16)}...
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Origem</span>
                  <span className="text-gray-700 dark:text-gray-300 truncate max-w-[150px]">
                    {click.referrer || "Acesso Direto"}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// 📊 Gráfico de Analytics (CORRIGIDO E MELHORADO)
function AnalyticsChart({ data, labels, title }: { data: number[], labels: string[], title: string }) {
  const maxValue = Math.max(...data, 1);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Fecha o tooltip se clicar fora (simples implementação)
  useEffect(() => {
    const handleClick = () => setHoveredIndex(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="mt-4" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-6">
         <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">{title}</h3>
      </div>

      {/* Container com scroll horizontal no mobile */}
      <div className="overflow-x-auto overflow-y-visible -mx-4 px-4 pb-4 select-none">
        <div className="h-56 flex items-end gap-3 min-w-[500px] sm:min-w-0 pt-8">
          {data.map((value, index) => {
            const isHovered = hoveredIndex === index;
            const heightPercentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
            // Altura visual mínima para barras com valor, para não ficarem invisíveis
            const visualHeight = value > 0 ? Math.max(heightPercentage, 8) : 4;

            return (
              <div
                key={index}
                className="group relative flex flex-col items-center flex-1 h-full justify-end"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                // Touch start para mobile, prevenindo propagação
                onTouchStart={(e) => {
                   e.stopPropagation();
                   setHoveredIndex(index === hoveredIndex ? null : index);
                }}
              >
                {/* Highlight vertical no hover/active */}
                <div
                    className={clsx(
                        "absolute bottom-0 w-full h-[110%] rounded-xl transition-all duration-300 pointer-events-none",
                        isHovered
                        ? "bg-gray-100/80 dark:bg-gray-700/50 opacity-100"
                        : "opacity-0"
                    )}
                />

                {/* Tooltip melhorado */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 5, scale: 0.9 }}
                      animate={{ opacity: 1, y: -5, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.9 }}
                      className="absolute bottom-full mb-1 z-20"
                    >
                        <div className="bg-gray-900 text-white text-xs rounded-xl px-3 py-2 shadow-xl whitespace-nowrap flex flex-col items-center gap-0.5">
                            <span className="font-bold text-sm">
                                {value} <span className="text-gray-400 font-normal">{value === 1 ? 'click' : 'clicks'}</span>
                            </span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wide">
                                {new Date(labels[index] + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' })}
                            </span>
                        </div>
                         {/* Seta do tooltip */}
                        <div className="w-2 h-2 bg-gray-900 rotate-45 mx-auto -mt-1"></div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Barra */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${visualHeight}%` }}
                  transition={{ delay: index * 0.05, duration: 0.5, type: "spring", stiffness: 100 }}
                  className={clsx(
                    "w-full max-w-[40px] rounded-t-xl rounded-b-lg relative z-10 transition-all duration-300 cursor-pointer",
                    isHovered
                      ? "bg-gradient-to-t from-purple-600 to-violet-500 shadow-lg shadow-purple-500/40"
                      : value > 0
                        ? "bg-gradient-to-t from-purple-400 to-purple-300/80 dark:from-purple-600 dark:to-purple-800"
                        : "bg-gray-100 dark:bg-gray-800/50"
                  )}
                />

                {/* Label */}
                <span className={clsx(
                  "text-[10px] sm:text-xs mt-3 whitespace-nowrap font-medium transition-colors relative z-10",
                  isHovered ? "text-purple-600 dark:text-purple-400 font-bold" : "text-gray-400 dark:text-gray-500"
                )}>
                  {new Date(labels[index] + 'T00:00:00').toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Indicador de scroll no mobile */}
      <p className="text-[10px] text-center text-gray-400 mt-4 sm:hidden flex items-center justify-center gap-1 opacity-60">
        <TrendingUp className="w-3 h-3"/> Toque nas barras para ver detalhes
      </p>
    </div>
  );
}

// 📱 Device Breakdown
function DeviceBreakdown({ clicks }: { clicks: ClickData[] }) {
  const validClicks = Array.isArray(clicks) ? clicks : [];

  const devices = validClicks.reduce((acc, click) => {
    const ua = click.userAgent?.toLowerCase() || '';
    if (ua.includes('mobile') || ua.includes('iphone') || ua.includes('android')) {
      acc['Mobile'] = (acc['Mobile'] || 0) + 1;
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      acc['Tablet'] = (acc['Tablet'] || 0) + 1;
    } else {
      acc['Desktop'] = (acc['Desktop'] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const total = validClicks.length;
  const deviceData = Object.entries(devices).map(([name, count]) => ({
    name,
    count,
    percentage: total ? Math.round((count / total) * 100) : 0
  })).sort((a, b) => b.count - a.count);

  const getDeviceInfo = (device: string) => {
    if (device.toLowerCase().includes('mobile'))
      return { icon: Smartphone, color: 'blue', emoji: '📱' };
    if (device.toLowerCase().includes('tablet'))
      return { icon: Smartphone, color: 'green', emoji: '📱' };
    return { icon: Laptop, color: 'purple', emoji: '💻' };
  };

  if (deviceData.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
          <Smartphone className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500">Nenhum dado de dispositivo disponível</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      {/* Visual Ring Chart */}
      <div className="flex items-center justify-center py-4">
        <div className="relative w-36 h-36">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {deviceData.reduce((acc, device, index) => {
              const previousTotal = acc.total;
              const strokeDasharray = (device.percentage / 100) * 283;
              const strokeDashoffset = -previousTotal * 2.83;
              const colors: Record<string, string> = { Mobile: '#3B82F6', Tablet: '#10B981', Desktop: '#8B5CF6' };

              acc.elements.push(
                <motion.circle
                  key={device.name}
                  initial={{ strokeDasharray: "0 283" }}
                  animate={{ strokeDasharray: `${strokeDasharray} 283` }}
                  transition={{ duration: 1, delay: index * 0.2, ease: "easeOut" }}
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={colors[device.name] || '#9CA3AF'}
                  strokeWidth="10"
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              );
              acc.total += device.percentage;
              return acc;
            }, { elements: [] as JSX.Element[], total: 0 }).elements}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{total}</span>
            <span className="text-xs text-gray-500">total</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      {deviceData.map((device, index) => {
        const info = getDeviceInfo(device.name);
        const Icon = info.icon;

        return (
          <motion.div
            key={device.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className={clsx(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              info.color === 'blue' && "bg-blue-100 dark:bg-blue-900/30",
              info.color === 'green' && "bg-green-100 dark:bg-green-900/30",
              info.color === 'purple' && "bg-purple-100 dark:bg-purple-900/30"
            )}>
              <Icon className={clsx(
                "w-6 h-6",
                info.color === 'blue' && "text-blue-500",
                info.color === 'green' && "text-green-500",
                info.color === 'purple' && "text-purple-500"
              )} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-900 dark:text-white">{device.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{device.count}</span>
                  <span className={clsx(
                    "text-sm font-bold px-2 py-0.5 rounded-full",
                    info.color === 'blue' && "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
                    info.color === 'green' && "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
                    info.color === 'purple' && "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                  )}>
                    {device.percentage}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${device.percentage}%` }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                  className={clsx(
                    "h-2.5 rounded-full",
                    info.color === 'blue' && "bg-gradient-to-r from-blue-400 to-blue-600",
                    info.color === 'green' && "bg-gradient-to-r from-green-400 to-green-600",
                    info.color === 'purple' && "bg-gradient-to-r from-purple-400 to-purple-600"
                  )}
                />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// 🌍 Country Map
function CountryMap({ clicks }: { clicks: ClickData[] }) {
  const validClicks = Array.isArray(clicks) ? clicks : [];

  const countries = validClicks.reduce((acc, click) => {
    const country = click.country || 'Brasil';
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const countryData = Object.entries(countries)
    .map(([name, count]) => ({ name, count, percentage: Math.round((count / validClicks.length) * 100) || 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const countryFlags: Record<string, string> = {
    'Brasil': '🇧🇷',
    'Portugal': '🇵🇹',
    'United States': '🇺🇸',
    'USA': '🇺🇸',
    'Spain': '🇪🇸',
    'Argentina': '🇦🇷',
    'Mexico': '🇲🇽',
    'Germany': '🇩🇪',
    'France': '🇫🇷',
    'Italy': '🇮🇹',
    'United Kingdom': '🇬🇧',
    'UK': '🇬🇧',
  };

  if (countryData.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
          <Globe className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500">Nenhum dado de país disponível</p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {countryData.map((country, index) => (
        <motion.div
          key={country.name}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative overflow-hidden group"
        >
          {/* Background progress */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${country.percentage}%` }}
            transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-100 to-transparent dark:from-purple-900/30 dark:to-transparent rounded-xl"
          />

          <div className="relative flex items-center justify-between p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-100 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{countryFlags[country.name] || '🌍'}</span>
              <span className="font-semibold text-gray-900 dark:text-white">{country.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{country.count} cliques</span>
              <span className="text-sm font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2.5 py-1 rounded-full">
                {country.percentage}%
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// 📊 Analytics Metrics
function AnalyticsMetrics({ clicks }: { clicks: ClickData[] }) {
  const validClicks = Array.isArray(clicks) ? clicks : [];
  const uniqueVisitors = new Set(validClicks.map((c) => c.visitorId)).size;

  const calculateTopCountry = () => {
    if (validClicks.length === 0) return "Brasil";
    const countryCounts = validClicks.reduce((acc, click) => {
      if (click.country) {
        acc[click.country] = (acc[click.country] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const topCountry = Object.entries(countryCounts).sort((a, b) => b[1] - a[1])[0];
    return topCountry ? topCountry[0] : "Brasil";
  };

  const topCountryName = calculateTopCountry();

  const calculateTrend = () => {
    if (validClicks.length < 2) return { value: 0, isPositive: true };

    const now = Date.now();
    const halfPeriod = 7 * 24 * 60 * 60 * 1000 / 2;

    const recentClicks = validClicks.filter(c => (now - c.timestamp) < halfPeriod).length;
    const olderClicks = validClicks.filter(c => (now - c.timestamp) >= halfPeriod && (now - c.timestamp) < halfPeriod * 2).length;

    if (olderClicks === 0) return { value: recentClicks > 0 ? 100 : 0, isPositive: true };

    const percentChange = ((recentClicks - olderClicks) / olderClicks) * 100;
    return {
      value: Math.abs(Math.round(percentChange)),
      isPositive: percentChange >= 0
    };
  };

  const trend = calculateTrend();

  // Cliques de hoje
  const todayClicks = validClicks.filter(c => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return c.timestamp >= today.getTime();
  }).length;

  const metrics = [
    {
      title: "Cliques Totais",
      value: validClicks.length,
      trend: trend,
      icon: BarChart2,
      color: "blue",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      title: "Visitantes Únicos",
      value: uniqueVisitors,
      subtitle: `${Math.round((uniqueVisitors / Math.max(validClicks.length, 1)) * 100)}% únicos`,
      icon: Users,
      color: "purple",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      title: "Cliques Hoje",
      value: todayClicks,
      icon: MousePointer,
      color: "emerald",
      gradient: "from-emerald-500 to-teal-500"
    },
    {
      title: "Principal País",
      value: topCountryName,
      icon: Globe,
      color: "amber",
      gradient: "from-amber-500 to-orange-500"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;

        return (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-none hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300"
          >
            {/* Top gradient line */}
            <div className={`h-1 bg-gradient-to-r ${metric.gradient}`}></div>

            <div className="p-4 sm:p-5">
              <div className="flex justify-between items-start mb-3">
                <div className={clsx(
                  "p-2.5 rounded-xl",
                  metric.color === 'blue' && "bg-blue-100 dark:bg-blue-900/30",
                  metric.color === 'purple' && "bg-purple-100 dark:bg-purple-900/30",
                  metric.color === 'emerald' && "bg-emerald-100 dark:bg-emerald-900/30",
                  metric.color === 'amber' && "bg-amber-100 dark:bg-amber-900/30"
                )}>
                  <Icon className={clsx(
                    "w-5 h-5",
                    metric.color === 'blue' && "text-blue-600 dark:text-blue-400",
                    metric.color === 'purple' && "text-purple-600 dark:text-purple-400",
                    metric.color === 'emerald' && "text-emerald-600 dark:text-emerald-400",
                    metric.color === 'amber' && "text-amber-600 dark:text-amber-400"
                  )} />
                </div>

                {metric.trend && (
                  <span className={clsx(
                    "inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-bold",
                    metric.trend.isPositive
                      ? "text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30"
                      : "text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30"
                  )}>
                    {metric.trend.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {metric.trend.value}%
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{metric.title}</h3>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {typeof metric.value === 'number' ? metric.value.toLocaleString('pt-BR') : metric.value}
                </p>
                {metric.subtitle && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{metric.subtitle}</p>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// 🔧 Generate Chart Data (CORRIGIDO PARA USO DE LOCAL TIME)
const generateChartData = (clicks: ClickData[]) => {
  // Gera os últimos 7 dias usando en-CA para garantir formato YYYY-MM-DD
  // mas baseando-se no horário LOCAL do cliente, não UTC.
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toLocaleDateString('en-CA'); // Retorna YYYY-MM-DD em Local Time
  }).reverse();

  const clicksByDay = clicks.reduce((acc, click) => {
    // Converte o timestamp do click também para o Local Time YYYY-MM-DD
    const date = new Date(click.timestamp).toLocaleDateString('en-CA');
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    labels: last7Days,
    data: last7Days.map(day => clicksByDay[day] || 0)
  };
};

// 🏠 PÁGINA PRINCIPAL
export default function ShortLinkDetailsPage() {
  const params = useParams();
  const linkId = params.linkId as string;
  const [data, setData] = useState<PageData | undefined | null>(undefined);
  const [currentTab, setCurrentTab] = useState("overview");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  useEffect(() => {
    if (linkId) {
      fetch(`/api/shortener/${linkId}`)
        .then((res) => {
          if (!res.ok) {
            return res.json().then((err) => {
              throw new Error(err.error || "Falha ao buscar dados");
            });
          }
          return res.json();
        })
        .then((data) => {
          setData(data);
        })
        .catch((err) => {
          console.error("Error fetching link data:", err);
          setErrorMessage(err.message || "Não foi possível carregar os detalhes do link.");
          setData(null);
        });
    }
  }, [linkId]);

  const chartData = data?.clicks && Array.isArray(data.clicks) ? generateChartData(data.clicks) : null;

  // Loading State
  if (data === undefined) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-full border-4 border-purple-200 border-t-purple-600"
        />
        <p className="text-gray-500 font-medium">Carregando analytics...</p>
      </div>
    );
  }

  // Error State
  if (errorMessage || data === null) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mt-12 px-4 max-w-md mx-auto"
      >
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 rounded-3xl flex items-center justify-center">
          <LinkIcon className="w-12 h-12 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Link não encontrado</h2>
        <p className="text-gray-500 mb-6">
          {errorMessage || "O link que você está procurando não existe ou você não tem permissão para vê-lo."}
        </p>
        <Button asChild className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
          <Link href="/dashboard/shortener" className="inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Voltar para a lista
          </Link>
        </Button>
      </motion.div>
    );
  }

  const { link } = data;
  const shortUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/r/${link.id}`;
  const clicks = Array.isArray(data.clicks) ? data.clicks : [];

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="max-w-6xl mx-auto w-full px-4 space-y-6 overflow-x-hidden pb-24">
      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        shortUrl={shortUrl}
        totalClicks={clicks.length}
      />

      {/* Floating Share Button */}
      <ShareFloatingButton
        onClick={() => setShareModalOpen(true)}
        totalClicks={clicks.length}
      />

      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Button asChild variant="ghost" className="text-gray-500 hover:text-gray-900 dark:hover:text-white w-fit -ml-2 rounded-xl">
          <Link href="/dashboard/shortener" className="inline-flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" /> Voltar
          </Link>
        </Button>
      </motion.div>

      {/* Header Card */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6 shadow-xl shadow-gray-200/50 dark:shadow-none"
      >
        <div className="flex flex-col lg:flex-row gap-5 justify-between items-start lg:items-center">
          {/* Link Info */}
          <div className="flex items-start gap-4 min-w-0 max-w-full">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
            >
              <FreelinnkLogo size="lg" className="shadow-lg shadow-purple-500/30" />
            </motion.div>

            <div className="min-w-0 max-w-full">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white break-all">
                  freelinnk.com/r/{link.id}
                </h1>
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full"
                >
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Ativo
                </motion.span>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>Criado em {new Date(link.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex items-center gap-1.5 max-w-full">
                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate max-w-[150px] sm:max-w-[250px] lg:max-w-sm hover:text-purple-600 hover:underline transition-colors"
                    title={link.url}
                  >
                    {link.url}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
                  {/* Action Buttons */}
          <div className="flex gap-2 w-full lg:w-auto">
            <Button
              onClick={handleCopy}
              className={clsx(
                "flex-1 lg:flex-none h-11 gap-2 rounded-xl font-semibold transition-all duration-300",
                copied
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                  : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
              )}
            >
              {copied ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">Copiado!</span>
                  <span className="sm:hidden">✓</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="hidden sm:inline">Copiar Link</span>
                  <span className="sm:hidden">Copiar</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              className="h-11 gap-2 rounded-xl border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setShareModalOpen(true)}
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Compartilhar</span>
            </Button>

            <Button
              variant="outline"
              className="h-11 gap-2 rounded-xl border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Visitar</span>
            </Button>
          </div>
        </div>
      </motion.header>

      {/* 🎉 Share Stats Card - NOVO! */}
      <ShareStatsCard
        shortUrl={shortUrl}
        totalClicks={clicks.length}
        onOpenModal={() => setShareModalOpen(true)}
      />

      {/* Metrics Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <AnalyticsMetrics clicks={clicks} />
      </motion.section>

      {/* Tabs Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden"
      >
        <Tabs defaultValue="overview" value={currentTab} onValueChange={setCurrentTab}>
          {/* Tab List - Horizontal scroll on mobile */}
          <div className="border-b border-gray-200 dark:border-gray-700 px-2 sm:px-4 overflow-x-auto scrollbar-hide">
            <TabsList className="border-0 p-0 h-14 bg-transparent w-full sm:w-auto inline-flex justify-start gap-1">
              <TabsTrigger
                value="overview"
                className="px-3 sm:px-5 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 data-[state=active]:bg-transparent h-full whitespace-nowrap font-medium transition-all text-sm sm:text-base"
              >
                📊 Visão Geral
              </TabsTrigger>
              <TabsTrigger
                value="clicks"
                className="px-3 sm:px-5 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 data-[state=active]:bg-transparent h-full whitespace-nowrap font-medium transition-all text-sm sm:text-base"
              >
                🖱️ Clicks
              </TabsTrigger>
              <TabsTrigger
                value="devices"
                className="px-3 sm:px-5 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 data-[state=active]:bg-transparent h-full whitespace-nowrap font-medium transition-all text-sm sm:text-base"
              >
                📱 Dispositivos
              </TabsTrigger>
              <TabsTrigger
                value="geo"
                className="px-3 sm:px-5 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 data-[state=active]:bg-transparent h-full whitespace-nowrap font-medium transition-all text-sm sm:text-base"
              >
                🌍 Geografia
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-4 sm:p-6">
            <AnimatePresence mode="wait">
              {/* Overview Tab */}
              <TabsContent value="overview" className="m-0 p-0">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {chartData && (
                    <Card className="rounded-2xl border-gray-200 dark:border-gray-700 overflow-hidden">
                      <CardHeader className="pb-2 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/50">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <BarChart2 className="w-5 h-5 text-purple-600" />
                          Desempenho nos últimos 7 dias
                        </CardTitle>
                        <CardDescription>
                          Total de <span className="font-bold text-purple-600">{clicks.length}</span> clique{clicks.length !== 1 ? 's' : ''} registrado{clicks.length !== 1 ? 's' : ''}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <AnalyticsChart
                          data={chartData.data}
                          labels={chartData.labels}
                          title="Cliques por dia"
                        />
                      </CardContent>
                    </Card>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="rounded-2xl border-gray-200 dark:border-gray-700">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Smartphone className="w-5 h-5 text-purple-600" />
                          Dispositivos
                        </CardTitle>
                        <CardDescription>
                          Distribuição de acessos por tipo de dispositivo
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <DeviceBreakdown clicks={clicks} />
                      </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-gray-200 dark:border-gray-700">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Globe className="w-5 h-5 text-purple-600" />
                          Localização
                        </CardTitle>
                        <CardDescription>
                          Distribuição geográfica dos cliques
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <CountryMap clicks={clicks} />
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              </TabsContent>

              {/* Clicks Tab */}
              <TabsContent value="clicks" className="m-0 p-0">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card className="rounded-2xl border-gray-200 dark:border-gray-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Activity className="w-5 h-5 text-purple-600" />
                        Histórico Completo de Clicks
                      </CardTitle>
                      <CardDescription>
                        Visualize todos os clicks com horário exato e detalhes completos
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ClicksTable clicks={clicks} />
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Devices Tab */}
              <TabsContent value="devices" className="m-0 p-0">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card className="rounded-2xl border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-purple-600" />
                        Análise de Dispositivos
                      </CardTitle>
                      <CardDescription>
                        Distribuição detalhada por dispositivos, navegadores e sistemas
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <DeviceBreakdown clicks={clicks} />
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Geo Tab */}
              <TabsContent value="geo" className="m-0 p-0">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card className="rounded-2xl border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Globe className="w-5 h-5 text-purple-600" />
                        Distribuição Geográfica
                      </CardTitle>
                      <CardDescription>
                        Distribuição detalhada por país e região
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <CountryMap clicks={clicks} />
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </div>
        </Tabs>
      </motion.section>

      {/* Footer Branding */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-center gap-3 py-6 text-sm text-gray-400"
      >
        <FreelinnkLogo size="sm" />
        <span>Powered by <span className="font-semibold text-purple-600">Freelinnk</span></span>
      </motion.footer>
    </main>
  );
}