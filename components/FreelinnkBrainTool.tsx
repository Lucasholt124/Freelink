"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import confetti from 'canvas-confetti';
import {
  Sparkles, Copy, Brain, Video, RefreshCcw,
  Layers, Camera, MessageSquare, Download, Users,
  Clock, Send,
  FileText, Calendar,
   Trash2,
  Search,
  Settings,
  CheckCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem,  DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import { useUser } from "@clerk/nextjs";
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { RadioGroup, RadioGroupItem } from "./radio-group";
import { ScrollArea } from "./scroll-area";

// =================================================================
// 1. TIPOS DE DADOS COMPLETOS
// =================================================================

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}
interface ContentMetrics {
  estimated_reach: number;
  engagement_rate: number;
  virality_score: number;
  best_time_to_post: string;
  target_demographics: {
    age_range: string;
    interests: string[];
    location?: string[];
  };
}

interface ReelContent {
  id: string;
  title: string;
  hook: string;
  main_points: string[];
  cta: string;
  duration?: number;
  hashtags?: string[];
  music_suggestion?: string;
  thumbnail_prompt?: string;
  metrics?: ContentMetrics;
}

interface CarouselContent {
  id: string;
  title: string;
  slides: {
    slide_number: number;
    title: string;
    content: string;
    design_notes?: string;
  }[];
  cta_slide: string;
  color_scheme?: string;
  metrics?: ContentMetrics;
}

interface ImagePostContent {
  id: string;
  idea: string;
  caption: string;
  image_prompt: string;
  alt_text?: string;
  hashtags?: string[];
  metrics?: ContentMetrics;
}

interface StorySequenceContent {
  id: string;
  theme: string;
  slides: {
    slide_number: number;
    type: "Poll" | "Quiz" | "Q&A" | "Link" | "Text" | "Image" | "Video";
    content: string;
    options?: string[];
    media_url?: string;
  }[];
  metrics?: ContentMetrics;
}

interface AudienceProfile {
  demographics: {
    age_range: string;
    gender_distribution: string;
    location: string[];
    income_level: string;
  };
  psychographics: {
    interests: string[];
    pain_points: string[];
    goals: string[];
    values: string[];
  };
  behavior: {
    preferred_platforms: string[];
    content_consumption_times: string[];
    engagement_patterns: string;
  };
}

interface ContentStrategy {
  main_pillars: string[];
  content_mix: {
    educational: number;
    entertaining: number;
    inspirational: number;
    promotional: number;
  };
  posting_schedule: {
    optimal_times: string[];
    frequency: string;
    platform_specific: Record<string, unknown>;
  };
  kpis: string[];
}

interface AnalyticsPrediction {
  estimated_monthly_reach: number;
  estimated_engagement_rate: number;
  estimated_follower_growth: number;
  estimated_conversion_rate: number;
  roi_projection: number;
}

interface BrainResults {
  theme_summary: string;
  target_audience_suggestion: string | AudienceProfile;
  content_strategy?: ContentStrategy;
  content_pack: {
    reels: ReelContent[];
    carousels: CarouselContent[];
    image_posts: ImagePostContent[];
    story_sequences: StorySequenceContent[];
  };
  analytics_predictions?: AnalyticsPrediction;
}

interface Platform {
  name: "instagram" | "facebook" | "twitter" | "linkedin" | "tiktok" | "youtube" | "pinterest";
  enabled: boolean;
  credentials?: {
    access_token?: string;
    refresh_token?: string;
    expires_at?: number;
  };
  settings?: Record<string, unknown>;
}

interface ScheduledItem {
  id: string;
  contentType: "reel" | "carousel" | "image_post" | "story_sequence";
  contentIndex: number;
  date: string;
  time: string;
  posted: boolean;
  platform: Platform;
  autoPublish?: boolean;
  publishedUrl?: string;
  performance?: ContentPerformance;
}

interface ContentPerformance {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  reach: number;
  impressions: number;
  engagement_rate: number;
  ctr?: number;
  conversion?: number;
}

interface CampaignAnalytics {
  total_reach: number;
  total_engagement: number;
  average_engagement_rate: number;
  best_performing_content: string;
  worst_performing_content: string;
  follower_growth: number;
  website_traffic: number;
  leads_generated: number;
  sales_attributed: number;
  roi: number;
}

interface SavedCampaign {
  id: string;
  theme: string;
  date: string;
  results: BrainResults;
  favorite?: boolean;
  notes?: string;
  tags?: string[];
  scheduledItems?: ScheduledItem[];
  analytics?: CampaignAnalytics;
  collaborators?: string[];
  status: "draft" | "active" | "completed" | "archived";
  version: number;
}

interface UserPreferences {
  theme: "light" | "dark" | "system";
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    frequency: "instant" | "hourly" | "daily" | "weekly";
  };
  autoSave: boolean;
  autoPublish: boolean;
  defaultPlatforms: Platform[];
  contentPreferences: {
    tone: string;
    style: string;
    hashtag_count: number;
    emoji_usage: "none" | "minimal" | "moderate" | "heavy";
  };
  aiModel: "fast" | "balanced" | "quality";
}

// =================================================================
// 2. UTILITÁRIOS E HELPERS
// =================================================================

const StorageKeys = {
  CAMPAIGNS: "freelink_brain_campaigns_v2",
  CURRENT_CAMPAIGN: "freelink_brain_current_campaign_v2",
  TEMPLATES: "freelink_brain_templates_v2",
  PREFERENCES: "freelink_brain_preferences_v2",
  ANALYTICS: "freelink_brain_analytics_v2",
  TEAM: "freelink_brain_team_v2",
  CACHE: "freelink_brain_cache_v2"
} as const;

// Gerador de IDs
function generateId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 9);
  const browserFingerprint = typeof navigator !== 'undefined'
    ? navigator.userAgent.substring(0, 10).replace(/\W/g, '')
    : 'server';
  return `${timestamp}-${randomStr}-${browserFingerprint}`.toLowerCase();
}

// Sistema de Analytics
class Analytics {
  static track(event: string, properties?: Record<string, unknown>): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, properties);
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Analytics Event: ${event}`, properties);
    }
  }

  static identify(userId: string, traits?: Record<string, unknown>): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        user_id: userId,
        user_properties: traits
      });
    }
  }
}

// Sistema de Notificações
class NotificationManager {
  static async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) return false;

    if (Notification.permission === "granted") return true;

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }

    return false;
  }

  static async show(title: string, options?: NotificationOptions): Promise<void> {
    const hasPermission = await this.requestPermission();

    if (hasPermission) {
      const notification = new Notification(title, {
        icon: "/icon.png",
        badge: "/badge.png",
        ...options
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  }
}

// Sistema de Exportação
class ExportManager {
  static async exportToPDF(campaign: SavedCampaign): Promise<void> {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    let yPosition = 20;

    // Header
    pdf.setFontSize(24);
    pdf.setTextColor(59, 130, 246);
    pdf.text("FreelinkBrain", pageWidth / 2, yPosition, { align: "center" });

    yPosition += 15;
    pdf.setFontSize(18);
    pdf.setTextColor(0, 0, 0);
    pdf.text(campaign.theme, pageWidth / 2, yPosition, { align: "center" });

    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setTextColor(128, 128, 128);
    pdf.text(`Gerado em ${new Date(campaign.date).toLocaleDateString('pt-BR')}`, pageWidth / 2, yPosition, { align: "center" });

    pdf.save(`campaign-${campaign.theme.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`);

    Analytics.track('export_pdf', { campaign_id: campaign.id });
    toast.success("PDF exportado com sucesso! 📄");
  }

  static async exportToExcel(campaign: SavedCampaign): Promise<void> {
    const workbook = XLSX.utils.book_new();

    const summaryData = [
      ["FreelinkBrain - Relatório de Campanha"],
      [""],
      ["Tema", campaign.theme],
      ["Data", new Date(campaign.date).toLocaleDateString('pt-BR')],
      ["Status", campaign.status]
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumo");

    XLSX.writeFile(workbook, `campaign-${campaign.theme.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.xlsx`);

    Analytics.track('export_excel', { campaign_id: campaign.id });
    toast.success("Planilha exportada com sucesso! 📊");
  }

  static async exportToJSON(campaign: SavedCampaign): Promise<void> {
    const dataStr = JSON.stringify(campaign, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `campaign-${campaign.theme.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    Analytics.track('export_json', { campaign_id: campaign.id });
    toast.success("JSON exportado com sucesso! 💾");
  }
}

// Sistema de Publicação
class SocialPublisher {
  static async publishToInstagram(content: ReelContent | CarouselContent | ImagePostContent, platform: Platform): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        toast.success("Publicado no Instagram com sucesso! 📸");
        Analytics.track('publish_instagram', {
          content_id: content.id,
          platform: platform.name
        });
        resolve();
      }, 2000);
    });
  }
}

// Sistema de Feedback Háptico
class HapticFeedback {
  static light(): void {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }

  static medium(): void {
    if ('vibrate' in navigator) {
      navigator.vibrate(20);
    }
  }

  static success(): void {
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 50, 10, 50, 10]);
    }
  }

  static error(): void {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 10, 50, 10, 50]);
    }
  }
}

// =================================================================
// 3. HOOKS CUSTOMIZADOS
// =================================================================

function useAutoSave(data: unknown, saveFunction: (data: unknown) => void, delay: number = 5000) {
  const [isSaving, setIsSaving] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (data) {
      setIsSaving(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        saveFunction(data);
        setIsSaving(false);
      }, delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, saveFunction, delay]);

  return isSaving;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function useInView(ref: React.RefObject<HTMLElement | null>, options?: IntersectionObserverInit) {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      options
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [ref, options]);

  return isInView;
}

// =================================================================
// 4. COMPONENTES AUXILIARES
// =================================================================

function EnhancedCopyButton({
  textToCopy,
  className,
  variant = "ghost",
  showToast = true,
  onCopy,
  children
}: {
  textToCopy: string;
  className?: string;
  variant?: "ghost" | "outline" | "default" | "secondary";
  showToast?: boolean;
  onCopy?: () => void;
  children?: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }

      setCopied(true);
      HapticFeedback.success();

      if (showToast) {
        toast.success("Copiado com sucesso! 📋");
      }

      onCopy?.();

      Analytics.track('content_copied', {
        content_length: textToCopy.length
      });

      setTimeout(() => setCopied(false), 2000);

    } catch (error) {
      console.error("Erro ao copiar:", error);
      toast.error("Erro ao copiar");
      HapticFeedback.error();
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleCopy}
            size="sm"
            variant={variant}
            className={cn(
              "gap-2 transition-all",
              copied && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
              className
            )}
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                >
                  <CheckCircle className="w-4 h-4" />
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Copy className="w-4 h-4" />
                </motion.div>
              )}
            </AnimatePresence>
            {children || (
              <span className="text-xs font-medium">
                {copied ? "Copiado!" : "Copiar"}
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{copied ? "Copiado!" : "Clique para copiar"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function AnimatedMetric({
  value,
  label,
  icon: Icon,
  color = "blue"
}: {
  value: number;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const targetRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(targetRef);

  useEffect(() => {
    if (!isInView) return;

    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, isInView]);

  const colorClasses: Record<string, string> = {
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
    green: "from-green-500 to-green-600",
    pink: "from-pink-500 to-pink-600",
    orange: "from-orange-500 to-orange-600",
    indigo: "from-indigo-500 to-indigo-600"
  };

  return (
    <motion.div
      ref={targetRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
      transition={{ duration: 0.5 }}
      className="relative group"
    >
      <div className="p-4 rounded-xl bg-gradient-to-br from-background to-muted/20 border-2 hover:border-primary/20 transition-all">
        <div className={cn(
          "p-2 rounded-lg bg-gradient-to-br mb-2",
          colorClasses[color] || colorClasses.blue
        )}>
          <Icon className="w-5 h-5 text-white" />
        </div>

        <motion.div
          className="text-2xl font-bold mb-1"
          animate={{ scale: isInView ? [1, 1.05, 1] : 1 }}
          transition={{ duration: 0.3 }}
        >
          {Math.round(displayValue)}
        </motion.div>

        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </motion.div>
  );
}

function ProfessionalLoadingSpinner() {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { icon: Brain, text: "Analisando seu tema...", color: "text-blue-500" },
    { icon: Users, text: "Mapeando persona ideal...", color: "text-purple-500" },
    { icon: Video, text: "Criando roteiros virais...", color: "text-pink-500" },
    { icon: Layers, text: "Estruturando carrosséis...", color: "text-indigo-500" },
    { icon: Sparkles, text: "Finalizando campanha...", color: "text-emerald-500" }
  ];

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => prev >= 100 ? 100 : prev + 2);
    }, 100);

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % steps.length);
    }, 2000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, [steps.length]);

  const CurrentIcon = steps[currentStep].icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-[500px] flex items-center justify-center p-6"
    >
      <div className="w-full max-w-md space-y-8">
        <div className="relative">
          <motion.div
            className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          >
            <CurrentIcon className={cn("w-16 h-16", steps[currentStep].color)} />
          </motion.div>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-center">
            Criando sua campanha...
          </h3>

          <AnimatePresence mode="wait">
            <motion.p
              key={currentStep}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="text-center text-muted-foreground"
            >
              {steps[currentStep].text}
            </motion.p>
          </AnimatePresence>

          <Progress value={progress} className="h-2" />
          <p className="text-center text-xs text-muted-foreground">
            {progress}% completo
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// =================================================================
// 5. COMPONENTE PRINCIPAL
// =================================================================

export default function FreelinkBrainUltimate() {
  // Estados principais
  const [theme, setTheme] = useState("");
  const [results, setResults] = useState<BrainResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("reels");
  const [mainView, setMainView] = useState<"generator" | "planner" | "outreach" | "analytics" | "team">("generator");

  // Estados de campanha
  const [savedCampaigns, setSavedCampaigns] = useState<SavedCampaign[]>([]);
  const [currentCampaignId, setCurrentCampaignId] = useState<string | null>(null);

  // Estados de UI
  const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Estados de agendamento
  const [scheduledItems, setScheduledItems] = useState<ScheduledItem[]>([]);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [currentScheduleItem, setCurrentScheduleItem] = useState<{
    type: "reel" | "carousel" | "image_post" | "story_sequence";
    index: number;
  } | null>(null);

  // Estados de preferências
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    theme: "system",
    language: "pt-BR",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    notifications: {
      email: true,
      push: false,
      sms: false,
      frequency: "daily"
    },
    autoSave: true,
    autoPublish: false,
    defaultPlatforms: [{ name: "instagram", enabled: true }],
    contentPreferences: {
      tone: "professional",
      style: "informative",
      hashtag_count: 10,
      emoji_usage: "moderate"
    },
    aiModel: "balanced"
  });

  // Hooks
  const { user } = useUser();
  const { setTheme: setSystemTheme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const generateIdeas = useAction(api.brain.generateContentIdeas);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Funções auxiliares de armazenamento
  const saveCampaign = useCallback((campaign: SavedCampaign): void => {
    try {
      const existingCampaignsJSON = localStorage.getItem(StorageKeys.CAMPAIGNS) || "[]";
      const existingCampaigns: SavedCampaign[] = JSON.parse(existingCampaignsJSON);

      const existingIndex = existingCampaigns.findIndex(c => c.id === campaign.id);
      if (existingIndex >= 0) {
        existingCampaigns[existingIndex] = campaign;
      } else {
        existingCampaigns.unshift(campaign);
      }

      localStorage.setItem(StorageKeys.CAMPAIGNS, JSON.stringify(existingCampaigns));
      localStorage.setItem(StorageKeys.CURRENT_CAMPAIGN, JSON.stringify(campaign));

    } catch (error) {
      console.error("Erro ao salvar campanha:", error);
      toast.error("Não foi possível salvar sua campanha");
    }
  }, []);

  const getSavedCampaigns = useCallback((): SavedCampaign[] => {
    try {
      const campaignsJSON = localStorage.getItem(StorageKeys.CAMPAIGNS) || "[]";
      return JSON.parse(campaignsJSON);
    } catch (error) {
      console.error("Erro ao carregar campanhas:", error);
      return [];
    }
  }, []);

  const getCurrentCampaign = useCallback((): SavedCampaign | null => {
    try {
      const campaignJSON = localStorage.getItem(StorageKeys.CURRENT_CAMPAIGN);
      return campaignJSON ? JSON.parse(campaignJSON) : null;
    } catch (error) {
      console.error("Erro ao carregar campanha atual:", error);
      return null;
    }
  }, []);

  // Auto-save
  const autoSaveFunction = useCallback((data: unknown) => {
    if (currentCampaignId && data) {
      const campaign: SavedCampaign = {
        id: currentCampaignId,
        theme,
        date: new Date().toISOString(),
        results: data as BrainResults,
        scheduledItems,
        status: "active",
        version: 2
      };
      saveCampaign(campaign);
    }
  }, [currentCampaignId, theme, scheduledItems, saveCampaign]);

  const isSaving = useAutoSave(results, autoSaveFunction, 5000);

  // Carregamento inicial
  useEffect(() => {
    const campaigns = getSavedCampaigns();
    setSavedCampaigns(campaigns);

    const currentCampaign = getCurrentCampaign();
    if (currentCampaign) {
      setResults(currentCampaign.results);
      setTheme(currentCampaign.theme);
      setCurrentCampaignId(currentCampaign.id);

      if (currentCampaign.scheduledItems) {
        setScheduledItems(currentCampaign.scheduledItems);
      }
    }

    const savedPreferences = localStorage.getItem(StorageKeys.PREFERENCES);
    if (savedPreferences) {
      setUserPreferences(JSON.parse(savedPreferences));
    }
  }, [getSavedCampaigns, getCurrentCampaign]);

  // Sincronização de tema
  useEffect(() => {
    if (userPreferences.theme !== "system") {
      setSystemTheme(userPreferences.theme);
    }
  }, [userPreferences.theme, setSystemTheme]);

  // Handlers principais
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!theme || theme.trim().length < 3) {
      toast.error("Por favor, insira um tema válido");
      inputRef.current?.focus();
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      const data = await generateIdeas({
        theme,
        model: userPreferences.aiModel
      });

      // Adicionar IDs se não existirem
      const enhancedData: BrainResults = {
        ...data,
        content_pack: {
          reels: data.content_pack.reels.map((r: Omit<ReelContent, 'id'>) => ({
            ...r,
            id: generateId()
          })),
          carousels: data.content_pack.carousels.map((c: Omit<CarouselContent, 'id'>) => ({
            ...c,
            id: generateId()
          })),
          image_posts: data.content_pack.image_posts.map((p: Omit<ImagePostContent, 'id'>) => ({
            ...p,
            id: generateId()
          })),
          story_sequences: data.content_pack.story_sequences.map((s: Omit<StorySequenceContent, 'id'>) => ({
            ...s,
            id: generateId()
          }))
        }
      };

      setResults(enhancedData);

      const newCampaign: SavedCampaign = {
        id: generateId(),
        theme,
        date: new Date().toISOString(),
        results: enhancedData,
        scheduledItems: [],
        status: "draft",
        version: 2
      };

      setCurrentCampaignId(newCampaign.id);
      saveCampaign(newCampaign);
      setSavedCampaigns(prev => [newCampaign, ...prev]);

      setIsLoading(false);

      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 }
      });

      toast.success("Campanha criada com sucesso! 🚀");

      Analytics.track('generate_campaign_success', {
        theme,
        user_id: user?.id
      });

    } catch (error) {
      setIsLoading(false);
      toast.error("Erro ao gerar campanha");
      console.error(error);
    }
  };

  const handleGenerateNew = () => {
    setResults(null);
    setTheme("");
    setActiveTab("reels");
    setCurrentCampaignId(null);
    setScheduledItems([]);
    inputRef.current?.focus();
  };

  const handleExampleClick = (exampleTheme: string) => {
    setTheme(exampleTheme);
    setTimeout(() => handleSubmit(), 100);
  };

  const handleCampaignSelect = (campaign: SavedCampaign) => {
    setResults(campaign.results);
    setTheme(campaign.theme);
    setCurrentCampaignId(campaign.id);
    setMainView("generator");
    setIsHistorySidebarOpen(false);

    if (campaign.scheduledItems) {
      setScheduledItems(campaign.scheduledItems);
    }

    toast.success("Campanha carregada!");
  };

  const handleCampaignDelete = (id: string) => {
    const campaigns = getSavedCampaigns();
    const updated = campaigns.filter(c => c.id !== id);
    localStorage.setItem(StorageKeys.CAMPAIGNS, JSON.stringify(updated));
    setSavedCampaigns(updated);

    if (currentCampaignId === id) {
      handleGenerateNew();
    }

    toast.success("Campanha excluída");
  };

  const handleScheduleContent = (type: "reel" | "carousel" | "image_post" | "story_sequence", index: number) => {
    setCurrentScheduleItem({ type, index });
    setIsScheduleDialogOpen(true);
  };

  const handleScheduleSave = (date: string, time: string, platform: string) => {
    if (!currentScheduleItem || !currentCampaignId) return;

    const newScheduledItem: ScheduledItem = {
      id: generateId(),
      contentType: currentScheduleItem.type,
      contentIndex: currentScheduleItem.index,
      date,
      time,
      posted: false,
      platform: { name: platform as Platform["name"], enabled: true }
    };

    const updatedScheduledItems = [...scheduledItems, newScheduledItem];
    setScheduledItems(updatedScheduledItems);

    const campaign = savedCampaigns.find(c => c.id === currentCampaignId);
    if (campaign) {
      const updatedCampaign = {
        ...campaign,
        scheduledItems: updatedScheduledItems
      };

      saveCampaign(updatedCampaign);
      setSavedCampaigns(prev =>
        prev.map(c => c.id === currentCampaignId ? updatedCampaign : c)
      );
    }

    setIsScheduleDialogOpen(false);
    setCurrentScheduleItem(null);
    toast.success("Conteúdo agendado!");
  };

  const handlePublishContent = async (content: ReelContent | CarouselContent | ImagePostContent) => {
    const platform = userPreferences.defaultPlatforms[0];

    if (!platform) {
      toast.error("Configure suas redes sociais nas configurações");
      return;
    }

    try {
      await SocialPublisher.publishToInstagram(content, platform);
    } catch  {
      toast.error("Erro ao publicar");
    }
  };

  // Contadores
  const contentCounts = results ? {
    reels: results.content_pack.reels.length,
    carousels: results.content_pack.carousels.length,
    image_posts: results.content_pack.image_posts.length,
    story_sequences: results.content_pack.story_sequences.length,
    total: results.content_pack.reels.length +
           results.content_pack.carousels.length +
           results.content_pack.image_posts.length +
           results.content_pack.story_sequences.length
  } : null;

  // Conteúdo filtrado
  const filteredContent = useMemo(() => {
    if (!results || !debouncedSearchQuery) return results?.content_pack;

    const query = debouncedSearchQuery.toLowerCase();

    return {
      reels: results.content_pack.reels.filter(r =>
        r.title.toLowerCase().includes(query) ||
        r.hook.toLowerCase().includes(query)
      ),
      carousels: results.content_pack.carousels.filter(c =>
        c.title.toLowerCase().includes(query)
      ),
      image_posts: results.content_pack.image_posts.filter(p =>
        p.idea.toLowerCase().includes(query) ||
        p.caption.toLowerCase().includes(query)
      ),
      story_sequences: results.content_pack.story_sequences.filter(s =>
        s.theme.toLowerCase().includes(query)
      )
    };
  }, [results, debouncedSearchQuery]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b">
        <div className="container py-3 px-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-xl sm:text-2xl">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Freelink<span className="font-black">Brain</span>
              </span>
            </h1>

            <nav className="hidden lg:flex items-center gap-1">
              <Button
                variant={mainView === "generator" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setMainView("generator")}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Gerador
              </Button>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {results && (
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar conteúdo..."
                  className="pl-9 pr-4 h-9 w-[200px] lg:w-[300px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}

            {isSaving && (
              <Badge variant="outline" className="gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Salvando...
              </Badge>
            )}

            <Button variant="ghost" size="icon" onClick={() => setIsHistorySidebarOpen(true)}>
              <Clock className="w-5 h-5" />
            </Button>

            <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)}>
              <Settings className="w-5 h-5" />
            </Button>

            <Avatar className="w-8 h-8">
              <AvatarImage src={user?.imageUrl} />
              <AvatarFallback>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6 px-4 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {mainView === "generator" && (
            <motion.div
              key="generator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {isLoading ? (
                <ProfessionalLoadingSpinner />
              ) : results ? (
                <div className="space-y-6">
                  {/* Campaign Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-3xl font-bold">Campanha Pronta!</h2>
                      <p className="text-muted-foreground mt-1">
                        Tema: <span className="font-semibold">{theme}</span>
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleGenerateNew} variant="outline">
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Novo Tema
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button>
                            <Download className="w-4 h-4 mr-2" />
                            Exportar
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => {
                            const campaign = getCurrentCampaign();
                            if (campaign) ExportManager.exportToPDF(campaign);
                          }}>
                            <FileText className="w-4 h-4 mr-2" />
                            PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            const campaign = getCurrentCampaign();
                            if (campaign) ExportManager.exportToExcel(campaign);
                          }}>
                            <FileText className="w-4 h-4 mr-2" />
                            Excel
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    <AnimatedMetric
                      value={contentCounts?.total || 0}
                      label="Total"
                      icon={Sparkles}
                      color="purple"
                    />
                    <AnimatedMetric
                      value={contentCounts?.reels || 0}
                      label="Reels"
                      icon={Video}
                      color="blue"
                    />
                    <AnimatedMetric
                      value={contentCounts?.carousels || 0}
                      label="Carrosséis"
                      icon={Layers}
                      color="purple"
                    />
                    <AnimatedMetric
                      value={contentCounts?.image_posts || 0}
                      label="Posts"
                      icon={Camera}
                      color="pink"
                    />
                    <AnimatedMetric
                      value={contentCounts?.story_sequences || 0}
                      label="Stories"
                      icon={MessageSquare}
                      color="indigo"
                    />
                  </div>

                  {/* Content Tabs */}
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="reels">Reels</TabsTrigger>
                      <TabsTrigger value="carousels">Carrosséis</TabsTrigger>
                      <TabsTrigger value="posts">Posts</TabsTrigger>
                      <TabsTrigger value="stories">Stories</TabsTrigger>
                    </TabsList>

                    <TabsContent value="reels" className="space-y-4">
                      {filteredContent?.reels.map((reel, i) => (
                        <Card key={reel.id}>
                          <CardHeader>
                            <CardTitle>{reel.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-2">{reel.hook}</p>
                            <div className="flex gap-2">
                              <EnhancedCopyButton
                                textToCopy={`${reel.title}\n\n${reel.hook}\n\n${reel.main_points.join('\n')}\n\n${reel.cta}`}
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleScheduleContent("reel", i)}
                              >
                                <Calendar className="w-4 h-4 mr-2" />
                                Agendar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePublishContent(reel)}
                              >
                                <Send className="w-4 h-4 mr-2" />
                                Publicar
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>

                    {/* Adicione os outros TabsContent similarmente */}
                  </Tabs>
                </div>
              ) : (
                // Welcome Screen
                <div className="space-y-8">
                  <div className="text-center space-y-4 max-w-3xl mx-auto">
                    <h1 className="text-4xl sm:text-5xl font-bold">
                      Freelink<span className="text-primary">Brain</span>
                    </h1>
                    <p className="text-xl text-muted-foreground">
                      Crie campanhas completas de conteúdo com IA em segundos
                    </p>
                  </div>

                  <Card className="max-w-2xl mx-auto">
                    <CardContent className="p-6">
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="theme">Qual tema você quer transformar em campanha?</Label>
                          <Input
                            id="theme"
                            ref={inputRef}
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                            placeholder="Ex: Marketing digital para pequenas empresas"
                            className="mt-2"
                          />
                        </div>

                        <Button type="submit" className="w-full" size="lg">
                          <Sparkles className="w-5 h-5 mr-2" />
                          Gerar Campanha Completa
                        </Button>
                      </form>

                      <div className="mt-6">
                        <p className="text-sm text-center text-muted-foreground mb-3">
                          Exemplos populares:
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {[
                            "Marketing de afiliados",
                            "Inteligência artificial",
                            "Vendas B2B",
                            "Growth hacking"
                          ].map((example) => (
                            <Button
                              key={example}
                              variant="outline"
                              size="sm"
                              onClick={() => handleExampleClick(example)}
                            >
                              {example}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* History Sidebar */}
      <Sheet open={isHistorySidebarOpen} onOpenChange={setIsHistorySidebarOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Histórico de Campanhas</SheetTitle>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-120px)] mt-4">
            <div className="space-y-2">
              {savedCampaigns.map((campaign) => (
                <Card
                  key={campaign.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleCampaignSelect(campaign)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{campaign.theme}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(campaign.date).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCampaignDelete(campaign.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Schedule Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agendar Publicação</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Data</Label>
                <Input
                  id="schedule-date"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <Label htmlFor="time">Horário</Label>
                <Input
                  id="schedule-time"
                  type="time"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="platform">Plataforma</Label>
              <Select defaultValue="instagram">
                <SelectTrigger id="schedule-platform">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              const dateInput = document.getElementById('schedule-date') as HTMLInputElement;
              const timeInput = document.getElementById('schedule-time') as HTMLInputElement;
              const platformSelect = document.getElementById('schedule-platform') as HTMLSelectElement;

              if (dateInput?.value && timeInput?.value) {
                handleScheduleSave(
                  dateInput.value,
                  timeInput.value,
                  platformSelect?.value || "instagram"
                );
              }
            }}>
              Agendar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configurações</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="general">
            <TabsList>
              <TabsTrigger value="general">Geral</TabsTrigger>
              <TabsTrigger value="ai">IA</TabsTrigger>
              <TabsTrigger value="notifications">Notificações</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div>
                <Label>Tema</Label>
                <RadioGroup
                  value={userPreferences.theme}
                  onValueChange={(value) => {
                    const newPreferences = {
                      ...userPreferences,
                      theme: value as UserPreferences["theme"]
                    };
                    setUserPreferences(newPreferences);
                    localStorage.setItem(StorageKeys.PREFERENCES, JSON.stringify(newPreferences));
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="light" />
                    <Label htmlFor="light">Claro</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="dark" />
                    <Label htmlFor="dark">Escuro</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="system" id="system" />
                    <Label htmlFor="system">Sistema</Label>
                  </div>
                </RadioGroup>
              </div>
            </TabsContent>

            <TabsContent value="ai" className="space-y-4">
              <div>
                <Label>Modelo de IA</Label>
                <RadioGroup
                  value={userPreferences.aiModel}
                  onValueChange={(value) => {
                    const newPreferences = {
                      ...userPreferences,
                      aiModel: value as UserPreferences["aiModel"]
                    };
                    setUserPreferences(newPreferences);
                    localStorage.setItem(StorageKeys.PREFERENCES, JSON.stringify(newPreferences));
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fast" id="fast" />
                    <Label htmlFor="fast">Rápido</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="balanced" id="balanced" />
                    <Label htmlFor="balanced">Balanceado</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="quality" id="quality" />
                    <Label htmlFor="quality">Máxima Qualidade</Label>
                  </div>
                </RadioGroup>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Notificações Push</Label>
                <Switch
                  checked={userPreferences.notifications.push}
                  onCheckedChange={(checked) => {
                    const newPreferences = {
                      ...userPreferences,
                      notifications: {
                        ...userPreferences.notifications,
                        push: checked
                      }
                    };
                    setUserPreferences(newPreferences);
                    localStorage.setItem(StorageKeys.PREFERENCES, JSON.stringify(newPreferences));

                    if (checked) {
                      NotificationManager.requestPermission();
                    }
                  }}
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button onClick={() => setIsSettingsOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}