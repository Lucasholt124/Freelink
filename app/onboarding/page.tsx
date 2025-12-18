"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence} from "framer-motion";
import confetti from "canvas-confetti";
import {
  Check,
  Link as LinkIcon,
  User,
  Palette,
  Loader2,
  Sparkles,
  Plus,
  Trash2,
  ArrowRight,
  Zap,
  Star,
  Heart,
  X,
  Smartphone,
  Eye,
  ChevronLeft,
  Rocket,
  PartyPopper,
  Camera,
  CheckCircle2,
  AlertCircle,
  Target,
  TrendingUp,
  Users,
  ShoppingBag,
  Briefcase,
  GraduationCap,
  Utensils,
  Dumbbell,
  Music,
  Code,

  Scissors,
  Stethoscope,
  MapPin,

  Mail,
  Phone,
  Calendar,
  Video,
  Gift,

  Shield,
  Globe,

  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  FaInstagram,
  FaWhatsapp,
  FaTiktok,
  FaYoutube,
  FaLinkedin,
  FaGithub,
  FaTwitter,
  FaGlobe,
  FaSpotify,
  FaTelegram,
  FaDiscord,
  FaTwitch,
  FaFacebook,
  FaGoogle,
  FaWaze,

} from "react-icons/fa6";

// ============================================================================
// TIPOS
// ============================================================================
type Step = "welcome" | "name" | "niche" | "username" | "links" | "template" | "launching";

interface LinkItem {
  id: string;
  title: string;
  url: string;
  iconFile?: File;
  iconPreview?: string;
}

interface NicheOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  emoji: string;
  description: string;
  suggestedLinks: { title: string; placeholder: string; icon: React.ReactNode }[];
  gradient: string;
}

interface TemplateOption {
  id: string;
  name: string;
  preview: {
    bg: string;
    cardBg: string;
    buttonBg: string;
    buttonText: string;
    textPrimary: string;
    textSecondary: string;
    accent: string;
  };
  category: "light" | "dark" | "colorful" | "gradient";
  popular?: boolean;
  new?: boolean;
}

// ============================================================================
// FRASES MOTIVACIONAIS - MENSAGENS QUE VENDEM
// ============================================================================
const HERO_PHRASES = [
  { text: "Crie sua presença digital", highlight: "em segundos" },
  { text: "Todos seus links", highlight: "em um só lugar" },
  { text: "Profissional, bonito e", highlight: "100% grátis" },
  { text: "Mais de 50.000 criadores", highlight: "já usam" },
];

const SOCIAL_PROOF = [
  { name: "Maria S.", role: "Influenciadora", text: "Dobrei meus seguidores em 2 meses!", avatar: "👩" },
  { name: "João P.", role: "Empreendedor", text: "Meus clientes adoram a praticidade!", avatar: "👨" },
  { name: "Ana C.", role: "Artista", text: "Finalmente um link que representa meu trabalho!", avatar: "👩‍🎤" },
];

// ============================================================================
// NICHOS OTIMIZADOS
// ============================================================================
const NICHES: NicheOption[] = [
  {
    id: "creator",
    name: "Criador de Conteúdo",
    icon: <Video className="w-5 h-5" />,
    emoji: "🎬",
    description: "YouTuber, Streamer, Podcaster",
    suggestedLinks: [
      { title: "YouTube", placeholder: "youtube.com/@seucanal", icon: <FaYoutube className="w-4 h-4 text-red-500" /> },
      { title: "Instagram", placeholder: "instagram.com/voce", icon: <FaInstagram className="w-4 h-4 text-pink-500" /> },
      { title: "TikTok", placeholder: "tiktok.com/@voce", icon: <FaTiktok className="w-4 h-4" /> },
    ],
    gradient: "from-red-500 to-pink-500",
  },
  {
    id: "influencer",
    name: "Influenciador",
    icon: <Users className="w-5 h-5" />,
    emoji: "✨",
    description: "Lifestyle, Moda, Beleza",
    suggestedLinks: [
      { title: "Instagram", placeholder: "instagram.com/voce", icon: <FaInstagram className="w-4 h-4 text-pink-500" /> },
      { title: "TikTok", placeholder: "tiktok.com/@voce", icon: <FaTiktok className="w-4 h-4" /> },
      { title: "Loja", placeholder: "minhaloja.com", icon: <ShoppingBag className="w-4 h-4 text-emerald-500" /> },
    ],
    gradient: "from-pink-500 to-purple-500",
  },
  {
    id: "entrepreneur",
    name: "Empreendedor",
    icon: <Briefcase className="w-5 h-5" />,
    emoji: "💼",
    description: "Startup, Negócio, Consultor",
    suggestedLinks: [
      { title: "WhatsApp", placeholder: "wa.me/5511999999999", icon: <FaWhatsapp className="w-4 h-4 text-green-500" /> },
      { title: "LinkedIn", placeholder: "linkedin.com/in/voce", icon: <FaLinkedin className="w-4 h-4 text-blue-600" /> },
      { title: "Site", placeholder: "seusite.com.br", icon: <FaGlobe className="w-4 h-4 text-indigo-500" /> },
    ],
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    id: "artist",
    name: "Artista / Músico",
    icon: <Music className="w-5 h-5" />,
    emoji: "🎵",
    description: "Cantor, Banda, DJ, Produtor",
    suggestedLinks: [
      { title: "Spotify", placeholder: "open.spotify.com/artist/...", icon: <FaSpotify className="w-4 h-4 text-green-500" /> },
      { title: "YouTube", placeholder: "youtube.com/@seucanal", icon: <FaYoutube className="w-4 h-4 text-red-500" /> },
      { title: "Instagram", placeholder: "instagram.com/voce", icon: <FaInstagram className="w-4 h-4 text-pink-500" /> },
    ],
    gradient: "from-green-500 to-emerald-500",
  },
  {
    id: "freelancer",
    name: "Freelancer",
    icon: <Code className="w-5 h-5" />,
    emoji: "💻",
    description: "Designer, Dev, Redator",
    suggestedLinks: [
      { title: "Portfólio", placeholder: "meuportfolio.com", icon: <Globe className="w-4 h-4 text-purple-500" /> },
      { title: "LinkedIn", placeholder: "linkedin.com/in/voce", icon: <FaLinkedin className="w-4 h-4 text-blue-600" /> },
      { title: "GitHub", placeholder: "github.com/voce", icon: <FaGithub className="w-4 h-4" /> },
    ],
    gradient: "from-violet-500 to-purple-500",
  },
  {
    id: "coach",
    name: "Coach / Mentor",
    icon: <Target className="w-5 h-5" />,
    emoji: "🎯",
    description: "Life Coach, Mentor, Terapeuta",
    suggestedLinks: [
      { title: "Agendar Sessão", placeholder: "calendly.com/voce", icon: <Calendar className="w-4 h-4 text-blue-500" /> },
      { title: "WhatsApp", placeholder: "wa.me/5511999999999", icon: <FaWhatsapp className="w-4 h-4 text-green-500" /> },
      { title: "Instagram", placeholder: "instagram.com/voce", icon: <FaInstagram className="w-4 h-4 text-pink-500" /> },
    ],
    gradient: "from-amber-500 to-orange-500",
  },
  {
    id: "restaurant",
    name: "Restaurante / Food",
    icon: <Utensils className="w-5 h-5" />,
    emoji: "🍔",
    description: "Restaurante, Delivery, Chef",
    suggestedLinks: [
      { title: "Cardápio", placeholder: "seucardapio.com", icon: <Utensils className="w-4 h-4 text-orange-500" /> },
      { title: "WhatsApp Pedidos", placeholder: "wa.me/5511999999999", icon: <FaWhatsapp className="w-4 h-4 text-green-500" /> },
      { title: "iFood", placeholder: "ifood.com.br/delivery/...", icon: <ShoppingBag className="w-4 h-4 text-red-500" /> },
    ],
    gradient: "from-orange-500 to-red-500",
  },
  {
    id: "fitness",
    name: "Personal / Fitness",
    icon: <Dumbbell className="w-5 h-5" />,
    emoji: "💪",
    description: "Personal Trainer, Academia",
    suggestedLinks: [
      { title: "WhatsApp", placeholder: "wa.me/5511999999999", icon: <FaWhatsapp className="w-4 h-4 text-green-500" /> },
      { title: "Instagram", placeholder: "instagram.com/voce", icon: <FaInstagram className="w-4 h-4 text-pink-500" /> },
      { title: "Planos", placeholder: "seusplanos.com", icon: <Target className="w-4 h-4 text-blue-500" /> },
    ],
    gradient: "from-rose-500 to-pink-500",
  },
  {
    id: "beauty",
    name: "Beleza / Estética",
    icon: <Scissors className="w-5 h-5" />,
    emoji: "💅",
    description: "Salão, Barbearia, Estética",
    suggestedLinks: [
      { title: "Agendar", placeholder: "agenda.com/voce", icon: <Calendar className="w-4 h-4 text-pink-500" /> },
      { title: "WhatsApp", placeholder: "wa.me/5511999999999", icon: <FaWhatsapp className="w-4 h-4 text-green-500" /> },
      { title: "Instagram", placeholder: "instagram.com/voce", icon: <FaInstagram className="w-4 h-4 text-pink-500" /> },
    ],
    gradient: "from-fuchsia-500 to-pink-500",
  },
  {
    id: "health",
    name: "Saúde / Medicina",
    icon: <Stethoscope className="w-5 h-5" />,
    emoji: "⚕️",
    description: "Médico, Dentista, Psicólogo",
    suggestedLinks: [
      { title: "Agendar Consulta", placeholder: "doctoralia.com.br/...", icon: <Calendar className="w-4 h-4 text-blue-500" /> },
      { title: "WhatsApp", placeholder: "wa.me/5511999999999", icon: <FaWhatsapp className="w-4 h-4 text-green-500" /> },
      { title: "Localização", placeholder: "maps.google.com/...", icon: <MapPin className="w-4 h-4 text-red-500" /> },
    ],
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    id: "education",
    name: "Professor / Cursos",
    icon: <GraduationCap className="w-5 h-5" />,
    emoji: "📚",
    description: "Professor, Infoprodutor",
    suggestedLinks: [
      { title: "Meu Curso", placeholder: "hotmart.com/...", icon: <GraduationCap className="w-4 h-4 text-indigo-500" /> },
      { title: "YouTube", placeholder: "youtube.com/@seucanal", icon: <FaYoutube className="w-4 h-4 text-red-500" /> },
      { title: "Instagram", placeholder: "instagram.com/voce", icon: <FaInstagram className="w-4 h-4 text-pink-500" /> },
    ],
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    id: "ecommerce",
    name: "Loja / E-commerce",
    icon: <ShoppingBag className="w-5 h-5" />,
    emoji: "🛍️",
    description: "Loja Online, Dropshipping",
    suggestedLinks: [
      { title: "Minha Loja", placeholder: "minhaloja.com.br", icon: <ShoppingBag className="w-4 h-4 text-emerald-500" /> },
      { title: "WhatsApp Vendas", placeholder: "wa.me/5511999999999", icon: <FaWhatsapp className="w-4 h-4 text-green-500" /> },
      { title: "Instagram", placeholder: "instagram.com/voce", icon: <FaInstagram className="w-4 h-4 text-pink-500" /> },
    ],
    gradient: "from-emerald-500 to-teal-500",
  },
];

// ============================================================================
// TEMPLATES - 20+ OPÇÕES GRATUITAS
// ============================================================================
const TEMPLATES: TemplateOption[] = [
  // LIGHT THEMES
  {
    id: "minimal",
    name: "Minimal",
    category: "light",
    popular: true,
    preview: {
      bg: "#ffffff",
      cardBg: "#f8fafc",
      buttonBg: "#0f172a",
      buttonText: "#ffffff",
      textPrimary: "#0f172a",
      textSecondary: "#64748b",
      accent: "#0f172a",
    },
  },
  {
    id: "soft",
    name: "Soft",
    category: "light",
    preview: {
      bg: "#faf5ff",
      cardBg: "#ffffff",
      buttonBg: "#9333ea",
      buttonText: "#ffffff",
      textPrimary: "#581c87",
      textSecondary: "#a855f7",
      accent: "#9333ea",
    },
  },
  {
    id: "cream",
    name: "Cream",
    category: "light",
    preview: {
      bg: "#fefce8",
      cardBg: "#ffffff",
      buttonBg: "#ca8a04",
      buttonText: "#ffffff",
      textPrimary: "#713f12",
      textSecondary: "#a16207",
      accent: "#eab308",
    },
  },
  {
    id: "mint",
    name: "Mint",
    category: "light",
    new: true,
    preview: {
      bg: "#ecfdf5",
      cardBg: "#ffffff",
      buttonBg: "#059669",
      buttonText: "#ffffff",
      textPrimary: "#064e3b",
      textSecondary: "#10b981",
      accent: "#10b981",
    },
  },
  {
    id: "rose",
    name: "Rose",
    category: "light",
    preview: {
      bg: "#fff1f2",
      cardBg: "#ffffff",
      buttonBg: "#e11d48",
      buttonText: "#ffffff",
      textPrimary: "#881337",
      textSecondary: "#f43f5e",
      accent: "#f43f5e",
    },
  },
  {
    id: "sky",
    name: "Sky",
    category: "light",
    preview: {
      bg: "#f0f9ff",
      cardBg: "#ffffff",
      buttonBg: "#0284c7",
      buttonText: "#ffffff",
      textPrimary: "#0c4a6e",
      textSecondary: "#0ea5e9",
      accent: "#0ea5e9",
    },
  },
  // DARK THEMES
  {
    id: "midnight",
    name: "Midnight",
    category: "dark",
    popular: true,
    preview: {
      bg: "#0f172a",
      cardBg: "#1e293b",
      buttonBg: "#ffffff",
      buttonText: "#0f172a",
      textPrimary: "#f8fafc",
      textSecondary: "#94a3b8",
      accent: "#ffffff",
    },
  },
  {
    id: "charcoal",
    name: "Charcoal",
    category: "dark",
    preview: {
      bg: "#18181b",
      cardBg: "#27272a",
      buttonBg: "#fafafa",
      buttonText: "#18181b",
      textPrimary: "#fafafa",
      textSecondary: "#a1a1aa",
      accent: "#fafafa",
    },
  },
  {
    id: "obsidian",
    name: "Obsidian",
    category: "dark",
    new: true,
    preview: {
      bg: "#09090b",
      cardBg: "#18181b",
      buttonBg: "#a855f7",
      buttonText: "#ffffff",
      textPrimary: "#fafafa",
      textSecondary: "#71717a",
      accent: "#a855f7",
    },
  },
  {
    id: "navy",
    name: "Navy",
    category: "dark",
    preview: {
      bg: "#0c1222",
      cardBg: "#1a2744",
      buttonBg: "#3b82f6",
      buttonText: "#ffffff",
      textPrimary: "#f1f5f9",
      textSecondary: "#64748b",
      accent: "#3b82f6",
    },
  },
  // COLORFUL THEMES
  {
    id: "neon-pink",
    name: "Neon Pink",
    category: "colorful",
    popular: true,
    preview: {
      bg: "#500724",
      cardBg: "#831843",
      buttonBg: "#f472b6",
      buttonText: "#500724",
      textPrimary: "#fdf2f8",
      textSecondary: "#f9a8d4",
      accent: "#ec4899",
    },
  },
  {
    id: "electric-blue",
    name: "Electric Blue",
    category: "colorful",
    preview: {
      bg: "#0c1929",
      cardBg: "#0f2744",
      buttonBg: "#38bdf8",
      buttonText: "#0c1929",
      textPrimary: "#f0f9ff",
      textSecondary: "#7dd3fc",
      accent: "#0ea5e9",
    },
  },
  {
    id: "forest",
    name: "Forest",
    category: "colorful",
    preview: {
      bg: "#052e16",
      cardBg: "#14532d",
      buttonBg: "#4ade80",
      buttonText: "#052e16",
      textPrimary: "#f0fdf4",
      textSecondary: "#86efac",
      accent: "#22c55e",
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    category: "colorful",
    new: true,
    preview: {
      bg: "#431407",
      cardBg: "#7c2d12",
      buttonBg: "#fb923c",
      buttonText: "#431407",
      textPrimary: "#fff7ed",
      textSecondary: "#fdba74",
      accent: "#f97316",
    },
  },
  {
    id: "lavender",
    name: "Lavender",
    category: "colorful",
    preview: {
      bg: "#2e1065",
      cardBg: "#4c1d95",
      buttonBg: "#c4b5fd",
      buttonText: "#2e1065",
      textPrimary: "#f5f3ff",
      textSecondary: "#ddd6fe",
      accent: "#a78bfa",
    },
  },
  // GRADIENT THEMES
  {
    id: "aurora",
    name: "Aurora",
    category: "gradient",
    popular: true,
    preview: {
      bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      cardBg: "rgba(255,255,255,0.15)",
      buttonBg: "#ffffff",
      buttonText: "#667eea",
      textPrimary: "#ffffff",
      textSecondary: "rgba(255,255,255,0.8)",
      accent: "#ffffff",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    category: "gradient",
    preview: {
      bg: "linear-gradient(135deg, #0093E9 0%, #80D0C7 100%)",
      cardBg: "rgba(255,255,255,0.15)",
      buttonBg: "#ffffff",
      buttonText: "#0093E9",
      textPrimary: "#ffffff",
      textSecondary: "rgba(255,255,255,0.8)",
      accent: "#ffffff",
    },
  },
  {
    id: "candy",
    name: "Candy",
    category: "gradient",
    new: true,
    preview: {
      bg: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      cardBg: "rgba(255,255,255,0.15)",
      buttonBg: "#ffffff",
      buttonText: "#f5576c",
      textPrimary: "#ffffff",
      textSecondary: "rgba(255,255,255,0.8)",
      accent: "#ffffff",
    },
  },
  {
    id: "northern",
    name: "Northern",
    category: "gradient",
    preview: {
      bg: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      cardBg: "rgba(0,0,0,0.1)",
      buttonBg: "#0f172a",
      buttonText: "#43e97b",
      textPrimary: "#0f172a",
      textSecondary: "rgba(0,0,0,0.6)",
      accent: "#0f172a",
    },
  },
  {
    id: "twilight",
    name: "Twilight",
    category: "gradient",
    preview: {
      bg: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
      cardBg: "rgba(255,255,255,0.1)",
      buttonBg: "#a78bfa",
      buttonText: "#0f0c29",
      textPrimary: "#ffffff",
      textSecondary: "rgba(255,255,255,0.7)",
      accent: "#a78bfa",
    },
  },
];

// ============================================================================
// MAPA DE ÍCONES INTELIGENTES
// ============================================================================
const ICON_MAP: { match: string[]; icon: React.ReactNode }[] = [
  { match: ['google.com/maps', 'goo.gl/maps', 'maps.google', 'maps.app.goo.gl'], icon: <FaGoogle className="w-4 h-4 text-[#4285F4]" /> },
  { match: ['waze.com', 'waze.to'], icon: <FaWaze className="w-4 h-4 text-[#33CCFF]" /> },
  { match: ['whatsapp', 'wa.me', 'api.whatsapp'], icon: <FaWhatsapp className="w-4 h-4 text-[#25D366]" /> },
  { match: ['t.me', 'telegram'], icon: <FaTelegram className="w-4 h-4 text-[#0088cc]" /> },
  { match: ['discord.com', 'discord.gg'], icon: <FaDiscord className="w-4 h-4 text-[#5865F2]" /> },
  { match: ['mailto:'], icon: <Mail className="w-4 h-4 text-[#EA4335]" /> },
  { match: ['tel:'], icon: <Phone className="w-4 h-4 text-[#34A853]" /> },
  { match: ['instagram.com'], icon: <FaInstagram className="w-4 h-4 text-[#E1306C]" /> },
  { match: ['facebook.com', 'fb.com'], icon: <FaFacebook className="w-4 h-4 text-[#1877F3]" /> },
  { match: ['twitter.com', 'x.com'], icon: <FaTwitter className="w-4 h-4 text-[#1DA1F2]" /> },
  { match: ['linkedin.com'], icon: <FaLinkedin className="w-4 h-4 text-[#0077B5]" /> },
  { match: ['tiktok.com'], icon: <FaTiktok className="w-4 h-4 text-[#000000]" /> },
  { match: ['youtube.com', 'youtu.be'], icon: <FaYoutube className="w-4 h-4 text-[#FF0000]" /> },
  { match: ['twitch.tv'], icon: <FaTwitch className="w-4 h-4 text-[#9146FF]" /> },
  { match: ['spotify.com'], icon: <FaSpotify className="w-4 h-4 text-[#1DB954]" /> },
  { match: ['github.com'], icon: <FaGithub className="w-4 h-4 text-[#181717]" /> },
  { match: ['calendly.com', 'cal.com'], icon: <Calendar className="w-4 h-4 text-[#006BFF]" /> },
  { match: ['hotmart', 'kiwify', 'eduzz'], icon: <GraduationCap className="w-4 h-4 text-[#F04E23]" /> },
];

function getLinkIcon(url: string, title: string = ""): React.ReactNode {
  if (!url) return <FaGlobe className="w-4 h-4" />;
  const u = url.toLowerCase();
  const t = title.toLowerCase();

  for (const item of ICON_MAP) {
    if (item.match.some(match => u.includes(match))) {
      return item.icon;
    }
  }

  if (t.includes('whatsapp') || t.includes('zap')) return <FaWhatsapp className="w-4 h-4 text-[#25D366]" />;
  if (t.includes('instagram') || t.includes('insta')) return <FaInstagram className="w-4 h-4 text-[#E1306C]" />;
  if (t.includes('youtube')) return <FaYoutube className="w-4 h-4 text-[#FF0000]" />;
  if (t.includes('tiktok')) return <FaTiktok className="w-4 h-4" />;
  if (t.includes('spotify')) return <FaSpotify className="w-4 h-4 text-[#1DB954]" />;
  if (t.includes('linkedin')) return <FaLinkedin className="w-4 h-4 text-[#0077B5]" />;
  if (t.includes('portfolio') || t.includes('trabalhos')) return <Briefcase className="w-4 h-4 text-purple-500" />;
  if (t.includes('loja') || t.includes('comprar') || t.includes('shop')) return <ShoppingBag className="w-4 h-4 text-green-500" />;
  if (t.includes('curso') || t.includes('aula')) return <GraduationCap className="w-4 h-4 text-indigo-500" />;
  if (t.includes('agenda') || t.includes('agendar')) return <Calendar className="w-4 h-4 text-blue-500" />;
  if (t.includes('cardápio') || t.includes('menu')) return <Utensils className="w-4 h-4 text-orange-500" />;

  return <FaGlobe className="w-4 h-4 text-[#6366f1]" />;
}

// ============================================================================
// HOOKS
// ============================================================================
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// ============================================================================
// CELEBRAÇÃO
// ============================================================================
function celebrate(intensity: 'small' | 'medium' | 'epic' = 'medium') {
  const configs = {
    small: { particleCount: 30, spread: 50 },
    medium: { particleCount: 80, spread: 70 },
    epic: { particleCount: 200, spread: 120 },
  };

  const config = configs[intensity];

  confetti({
    ...config,
    origin: { y: 0.7 },
    colors: ['#8b5cf6', '#6366f1', '#ec4899', '#f59e0b', '#10b981'],
  });

  if (intensity === 'epic') {
    setTimeout(() => {
      confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#8b5cf6', '#ec4899'] });
      confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#6366f1', '#10b981'] });
    }, 200);
    setTimeout(() => {
      confetti({ particleCount: 100, spread: 100, origin: { y: 0.6 }, colors: ['#8b5cf6', '#6366f1', '#ec4899'] });
    }, 400);
  }
}

// ============================================================================
// LOGO FREELINNK
// ============================================================================
function FreelinnkLogo({ size = "default" }: { size?: "small" | "default" | "large" }) {
  const sizes = {
    small: { container: "w-8 h-8", text: "text-base", letter: "text-sm" },
    default: { container: "w-10 h-10", text: "text-lg", letter: "text-base" },
    large: { container: "w-14 h-14", text: "text-2xl", letter: "text-xl" },
  };

  const s = sizes[size];

  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        s.container,
        "rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/30"
      )}>
        <span className={cn("font-black text-white", s.letter)}>F</span>
      </div>
      <span className={cn("font-bold text-slate-900", s.text)}>Freelinnk</span>
    </div>
  );
}

// ============================================================================
// PHONE PREVIEW - REAL IFRAME
// ============================================================================
const PREVIEW_ICON_MAP = [
  { match: ['whatsapp', 'wa.me'], icon: <FaWhatsapp className="w-5 h-5 text-[#25D366]" /> },
  { match: ['instagram'], icon: <FaInstagram className="w-5 h-5 text-[#E1306C]" /> },
  { match: ['tiktok'], icon: <FaTiktok className="w-5 h-5" /> },
  { match: ['youtube', 'youtu.be'], icon: <FaYoutube className="w-5 h-5 text-[#FF0000]" /> },
  { match: ['linkedin'], icon: <FaLinkedin className="w-5 h-5 text-[#0077B5]" /> },
  { match: ['github'], icon: <FaGithub className="w-5 h-5" /> },
  { match: ['twitter', 'x.com'], icon: <FaTwitter className="w-5 h-5 text-[#1DA1F2]" /> },
  { match: ['spotify'], icon: <FaSpotify className="w-5 h-5 text-[#1DB954]" /> },
  { match: ['twitch'], icon: <FaTwitch className="w-5 h-5 text-[#9146FF]" /> },
  { match: ['facebook'], icon: <FaFacebook className="w-5 h-5 text-[#1877F3]" /> },
  { match: ['telegram', 't.me'], icon: <FaTelegram className="w-5 h-5 text-[#0088cc]" /> },
  { match: ['discord'], icon: <FaDiscord className="w-5 h-5 text-[#5865F2]" /> },
  { match: ['waze'], icon: <FaWaze className="w-5 h-5 text-[#33CCFF]" /> },
  { match: ['google.com/maps', 'goo.gl/maps'], icon: <FaGoogle className="w-5 h-5 text-[#4285F4]" /> },
];

function getPreviewLinkIcon(url: string, title: string = "") {
  if (!url) return <FaGlobe className="w-5 h-5 opacity-50" />;
  const u = url.toLowerCase();
  const t = title.toLowerCase();

  // 1. Tenta por URL
  for (const item of PREVIEW_ICON_MAP) {
    if (item.match.some(match => u.includes(match))) return item.icon;
  }

  // 2. Tenta por Título
  if (t.includes('email') || t.includes('contato')) return <Mail className="w-5 h-5 text-red-500" />;
  if (t.includes('telefone') || t.includes('ligar')) return <Phone className="w-5 h-5 text-green-500" />;
  if (t.includes('agenda') || t.includes('marcar')) return <Calendar className="w-5 h-5 text-blue-500" />;
  if (t.includes('local') || t.includes('mapa')) return <MapPin className="w-5 h-5 text-red-500" />;
  if (t.includes('loja') || t.includes('comprar')) return <ShoppingBag className="w-5 h-5 text-purple-500" />;
  if (t.includes('portifolio') || t.includes('site')) return <Briefcase className="w-5 h-5 text-orange-500" />;
  if (t.includes('curso') || t.includes('aula')) return <GraduationCap className="w-5 h-5 text-indigo-500" />;
  if (t.includes('cardapio') || t.includes('menu')) return <Utensils className="w-5 h-5 text-yellow-500" />;

  return <FaGlobe className="w-5 h-5 opacity-70" />;
}

// ============================================================================
// 📱 COMPONENTE PHONE PREVIEW (COPIE E SUBSTITUA O ANTIGO)
// ============================================================================
function PhonePreview({
  username,
  template,
  links,
  profileImage,
  displayName,
  bio,
  className = "",
}: {
  username: string;
  template: TemplateOption;
  links: LinkItem[];
  profileImage: { preview: string | null };
  displayName: string;
  bio: string;
  // Props legados mantidos para não quebrar TypeScript na chamada
  iframeKey?: number;
  onRefresh?: () => void;
  isLoading?: boolean;
  className?: string;
}) {
  // Detecta se é dark mode baseado no template escolhido

  // Lógica de Background compatível com Convex (Gradient ou Solid)
  const bgStyle = template.preview.bg.includes('gradient')
    ? { background: template.preview.bg }
    : { backgroundColor: template.preview.bg };

  return (
    <div className={cn("relative z-10", className)}>
      {/* Sombra realista do aparelho */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[80%] h-10 bg-black/30 blur-2xl rounded-full pointer-events-none" />

      {/* Carcaça do iPhone 15 Pro */}
      <motion.div
        className="relative w-[280px] h-[580px] sm:w-[300px] sm:h-[620px] bg-[#1a1a1a] rounded-[3rem] p-3 shadow-2xl ring-1 ring-white/10 border-[6px] border-[#2a2a2a]"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
      >
        {/* Botões Físicos Laterais */}
        <div className="absolute top-28 -left-[9px] w-[3px] h-10 bg-[#2a2a2a] rounded-l-md" />
        <div className="absolute top-44 -left-[9px] w-[3px] h-16 bg-[#2a2a2a] rounded-l-md" />
        <div className="absolute top-36 -right-[9px] w-[3px] h-20 bg-[#2a2a2a] rounded-r-md" />

        {/* Dynamic Island / Notch */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[30%] h-7 bg-black rounded-full z-30 flex items-center justify-center gap-2 pointer-events-none">
           <div className="w-1.5 h-1.5 rounded-full bg-[#111] blur-[0.5px]" />
        </div>

        {/* ----------------------------------------------------------
           TELA DO USUÁRIO (SIMULAÇÃO INSTANTÂNEA)
           ---------------------------------------------------------- */}
        <div
          className="w-full h-full rounded-[2.2rem] overflow-hidden relative flex flex-col no-scrollbar overflow-y-auto"
          style={bgStyle}
        >
          {/* Header (Avatar + Texto) */}
          <div className="pt-16 pb-6 px-5 flex flex-col items-center text-center shrink-0">
            {/* Foto de Perfil */}
            <motion.div
              layoutId="preview-avatar"
              className="w-24 h-24 rounded-full mb-4 p-1 shadow-lg overflow-hidden flex-shrink-0 bg-white/20 backdrop-blur-sm border-2 border-white/30"
            >
              {profileImage.preview ? (
                <img src={profileImage.preview} className="w-full h-full object-cover rounded-full" alt="Perfil" />
              ) : (
                <div className="w-full h-full bg-white/10 flex items-center justify-center rounded-full">
                  <User className="w-10 h-10 opacity-60" style={{ color: template.preview.textPrimary }} />
                </div>
              )}
            </motion.div>

            {/* Nome */}
            <motion.h2
              className="font-bold text-xl leading-tight mb-2 tracking-tight"
              style={{ color: template.preview.textPrimary }}
            >
              {displayName || "@" + (username || "seu-nome")}
            </motion.h2>

            {/* Bio */}
            {bio && (
              <p className="text-xs font-medium opacity-85 max-w-[90%] leading-relaxed line-clamp-3" style={{ color: template.preview.textSecondary }}>
                {bio}
              </p>
            )}
          </div>

          {/* Lista de Links */}
          <div className="w-full px-4 space-y-3 pb-20 flex-1">
            <AnimatePresence mode="popLayout">
              {links.filter(l => l.title).length > 0 ? (
                links.filter(l => l.title).map((link, i) => (
                  <motion.div
                    key={link.id || i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.05 }}
                    className="w-full py-3.5 px-4 rounded-xl flex items-center justify-between shadow-sm transition-all relative overflow-hidden group cursor-default"
                    style={{
                      backgroundColor: template.preview.buttonBg,
                      color: template.preview.buttonText,
                      backdropFilter: 'blur(10px)', // Efeito Glass
                    }}
                  >
                    {/* Efeito Hover Simulado */}
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="flex items-center gap-3.5 min-w-0 relative z-10 w-full justify-center">
                      {/* Ícone */}
                      <div className="absolute left-0 text-xl opacity-90">
                        {link.iconPreview ? (
                           <img src={link.iconPreview} className="w-6 h-6 object-cover rounded-md" alt="" />
                        ) : (
                           getPreviewLinkIcon(link.url, link.title)
                        )}
                      </div>

                      {/* Título */}
                      <span className="text-sm font-bold truncate text-center w-full px-6">
                        {link.title}
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                /* Skeleton State (Estado Vazio) */
                <>
                  <div className="w-full h-14 rounded-xl opacity-20 animate-pulse" style={{ backgroundColor: template.preview.buttonBg }} />
                  <div className="w-full h-14 rounded-xl opacity-10 animate-pulse" style={{ backgroundColor: template.preview.buttonBg }} />
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Branding */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center opacity-70 pointer-events-none">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: template.preview.textPrimary }}>
              <Zap className="w-3 h-3 fill-current" />
              Freelinnk
            </div>
          </div>
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-36 h-1.5 rounded-full z-30 bg-white/20 backdrop-blur-md" />
      </motion.div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [loading, setLoading] = useState(false);

  // User Data
  const [displayName, setDisplayName] = useState("");
  const [selectedNiche, setSelectedNiche] = useState<NicheOption | null>(null);
  const [username, setUsername] = useState("");
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateOption>(TEMPLATES[0]);
  const [profileImage, setProfileImage] = useState<{ file: File | null; preview: string | null }>({ file: null, preview: null });
  const [bio, setBio] = useState("");

  // UI State
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [templateFilter, setTemplateFilter] = useState<"all" | "light" | "dark" | "colorful" | "gradient">("all");
  const [launchProgress, setLaunchProgress] = useState(0);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debounced username for availability check
  const debouncedUsername = useDebounce(username, 500);

  // Convex
  const checkAvailability = useQuery(
    api.lib.usernames.checkUsernameAvailability,
    debouncedUsername.length >= 3 ? { username: debouncedUsername } : "skip"
  );
  const setUsernameMutation = useMutation(api.lib.usernames.setUsername);
  const updateCustomizations = useMutation(api.lib.customizations.updateCustomizations);
  const generateUploadUrl = useMutation(api.lib.customizations.generateUploadUrl);
  const createLink = useMutation(api.lib.links.createLink);

  // Computed
  const isUsernameValid = username.length >= 3 && checkAvailability?.available;
  const filteredTemplates = useMemo(() => {
    if (templateFilter === "all") return TEMPLATES;
    return TEMPLATES.filter(t => t.category === templateFilter);
  }, [templateFilter]);

  // Phrase rotation for welcome
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  useEffect(() => {
    if (step !== "welcome") return;
    const interval = setInterval(() => {
      setCurrentPhraseIndex(prev => (prev + 1) % HERO_PHRASES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [step]);


  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Imagem muito grande. Máximo 5MB.");
        return;
      }
      setProfileImage({
        file,
        preview: URL.createObjectURL(file)
      });
      celebrate('small');
    }
  };

  const handleNicheSelect = (niche: NicheOption) => {
    setSelectedNiche(niche);
    // Pre-populate suggested links
    const suggestedLinks = niche.suggestedLinks.map((link, i) => ({
      id: `suggested-${i}`,
      title: link.title,
      url: "",
    }));
    setLinks(suggestedLinks);
    celebrate('medium');
    toast.success(`${niche.emoji} Perfeito!`, { description: "Área selecionada com sucesso!" });
    setTimeout(() => setStep("username"), 500);
  };

  const handleUsernameSubmit = async () => {
    if (!isUsernameValid) return;
    setLoading(true);

    try {
      await setUsernameMutation({ username });
      celebrate('medium');
      toast.success("Nome reservado! 🎉", { description: `freelinnk.com/${username} é seu!` });
      setStep("links");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar. Tente outro nome.");
    } finally {
      setLoading(false);
    }
  };

  const updateLinkUrl = (id: string, url: string) => {
    setLinks(prev => prev.map(link =>
      link.id === id ? { ...link, url: url.startsWith('http') ? url : url ? `https://${url}` : "" } : link
    ));
  };

  const addCustomLink = () => {
    setLinks(prev => [...prev, { id: `custom-${Date.now()}`, title: "", url: "" }]);
  };

  const updateLinkTitle = (id: string, title: string) => {
    setLinks(prev => prev.map(link =>
      link.id === id ? { ...link, title } : link
    ));
  };

  const removeLink = (id: string) => {
    setLinks(prev => prev.filter(link => link.id !== id));
  };

  const handleLinksSubmit = () => {
    const validLinks = links.filter(l => l.title && l.url);
    if (validLinks.length === 0) {
      toast.error("Adicione pelo menos 1 link com título e URL");
      return;
    }
    celebrate('medium');
    setStep("template");
  };

  const handleTemplateSelect = (template: TemplateOption) => {
    setSelectedTemplate(template);
    celebrate('small');
  };

  const handleLaunch = async () => {
    setStep("launching");
    setLaunchProgress(0);

    try {
      // Progress: 10%
      setLaunchProgress(10);
      await new Promise(r => setTimeout(r, 300));

      let profileStorageId = undefined;

      // Upload profile image if exists
      if (profileImage.file) {
        setLaunchProgress(20);
        const uploadUrl = await generateUploadUrl({});
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": profileImage.file.type },
          body: profileImage.file,
        });
        const json = await res.json();
        profileStorageId = json.storageId;
        setLaunchProgress(40);
      } else {
        setLaunchProgress(40);
      }

      // Save customizations
      await updateCustomizations({
        description: bio || `${selectedNiche?.emoji || ''} ${displayName || username}`,
        profilePictureStorageId: profileStorageId,
        accentColor: selectedTemplate.preview.accent,
        backgroundType: selectedTemplate.preview.bg.includes('gradient') ? "gradient" : "color",
        backgroundColor1: selectedTemplate.preview.bg.includes('gradient')
          ? selectedTemplate.preview.bg.match(/#[a-fA-F0-9]{6}/g)?.[0] || "#667eea"
          : selectedTemplate.preview.bg,
        backgroundColor2: selectedTemplate.preview.bg.includes('gradient')
          ? selectedTemplate.preview.bg.match(/#[a-fA-F0-9]{6}/g)?.[1] || "#764ba2"
          : undefined,
      });
      setLaunchProgress(60);

      // Create links
      const validLinks = links.filter(l => l.title && l.url);
      for (let i = 0; i < validLinks.length; i++) {
        const link = validLinks[i];
        await createLink({
          title: link.title,
          url: link.url,
          isFeatured: false,
          badgeType: "new",
        });
        setLaunchProgress(60 + ((i + 1) / validLinks.length) * 30);
      }

      setLaunchProgress(100);

      // Epic celebration
      await new Promise(r => setTimeout(r, 500));
      celebrate('epic');

      setTimeout(() => {
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors: ['#8b5cf6', '#6366f1', '#ec4899'] });
      }, 300);

      toast.success("Sua página está no ar! 🚀", { description: "Redirecionando para o dashboard..." });

      setTimeout(() => {
        router.push("/dashboard?welcome=true");
      }, 2500);

    } catch (e) {
      console.error(e);
      toast.error("Erro ao criar página. Tente novamente.");
      setStep("template");
    }
  };

  const goBack = () => {
    const order: Step[] = ["welcome", "name", "niche", "username", "links", "template"];
    const idx = order.indexOf(step);
    if (idx > 0) setStep(order[idx - 1]);
  };

  // Step progress
  const stepProgress: Record<Step, { num: number; total: number }> = {
    welcome: { num: 0, total: 5 },
    name: { num: 1, total: 5 },
    niche: { num: 2, total: 5 },
    username: { num: 3, total: 5 },
    links: { num: 4, total: 5 },
    template: { num: 5, total: 5 },
    launching: { num: 5, total: 5 },
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <>
      <div className="min-h-screen bg-white flex flex-col lg:flex-row overflow-hidden">

        {/* ================================================================
            LEFT PANEL - WIZARD
        ================================================================ */}
        <div className="w-full lg:w-[55%] xl:w-[50%] min-h-screen flex flex-col relative z-10 bg-white">

          {/* Background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-50 via-white to-white opacity-70" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-violet-100/50 to-blue-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-indigo-100/50 to-purple-100/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          {/* Header */}
          {step !== "welcome" && step !== "launching" && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative p-4 sm:p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <FreelinnkLogo />

                {/* Progress Dots */}
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <div
                      key={num}
                      className={cn(
                        "h-2 rounded-full transition-all duration-500",
                        stepProgress[step].num >= num
                          ? "w-6 bg-gradient-to-r from-violet-600 to-indigo-600"
                          : "w-2 bg-slate-200"
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${(stepProgress[step].num / stepProgress[step].total) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>
          )}

          {/* Main Content */}
          <div className="relative flex-1 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className="w-full max-w-lg">
              <AnimatePresence mode="wait">

                {/* ========================================
                    STEP: WELCOME (Landing Page Style)
                ======================================== */}
                {step === "welcome" && (
                  <motion.div
                    key="welcome"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-8"
                  >
                    {/* Logo */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <FreelinnkLogo size="large" />
                    </motion.div>

                    {/* Hero Text */}
                    <div className="space-y-4">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative h-24 sm:h-28"
                      >
                        <AnimatePresence mode="wait">
                          <motion.h1
                            key={currentPhraseIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight"
                          >
                            {HERO_PHRASES[currentPhraseIndex].text}{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
                              {HERO_PHRASES[currentPhraseIndex].highlight}
                            </span>
                          </motion.h1>
                        </AnimatePresence>
                      </motion.div>

                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-slate-500 text-base sm:text-lg max-w-md"
                      >
                        Reúna seus links, redes sociais e conteúdo em uma página bonita e profissional. Grátis para sempre.
                      </motion.p>
                    </div>

                    {/* Features */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="grid grid-cols-3 gap-3"
                    >
                      {[
                        { icon: <Zap className="w-5 h-5" />, text: "Rápido", subtext: "2 min" },
                        { icon: <Shield className="w-5 h-5" />, text: "Gratuito", subtext: "100%" },
                        { icon: <Sparkles className="w-5 h-5" />, text: "Bonito", subtext: "20+ temas" },
                      ].map((feature, i) => (
                        <div
                          key={i}
                          className="p-3 sm:p-4 rounded-xl bg-white border border-slate-100 shadow-sm text-center"
                        >
                          <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-violet-600">
                            {feature.icon}
                          </div>
                          <p className="text-slate-900 font-semibold text-sm">{feature.text}</p>
                          <p className="text-slate-400 text-xs">{feature.subtext}</p>
                        </div>
                      ))}
                    </motion.div>

                    {/* CTA Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Button
                        onClick={() => setStep("name")}
                        className="w-full h-14 sm:h-16 text-lg sm:text-xl font-bold rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-700 hover:via-indigo-700 hover:to-blue-700 border-0 shadow-xl shadow-violet-500/30 group relative overflow-hidden"
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          animate={{ x: ['-200%', '200%'] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                        />
                        <span className="relative flex items-center gap-2">
                          Criar minha página grátis
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </Button>

                      <p className="text-center text-slate-400 text-xs mt-3">
                        Sem cartão de crédito • Sem spam • Cancele quando quiser
                      </p>
                    </motion.div>

                    {/* Social Proof */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="pt-4 border-t border-slate-100"
                    >
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <div className="flex -space-x-2">
                          {SOCIAL_PROOF.map((person, i) => (
                            <div
                              key={i}
                              className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 border-2 border-white flex items-center justify-center text-sm"
                            >
                              {person.avatar}
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          ))}
                        </div>
                        <span className="text-slate-500 text-sm font-medium">4.9/5</span>
                      </div>

                      <div className="flex overflow-hidden">
                        <motion.div
                          className="flex gap-4"
                          animate={{ x: [0, -400] }}
                          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        >
                          {[...SOCIAL_PROOF, ...SOCIAL_PROOF].map((person, i) => (
                            <div
                              key={i}
                              className="flex-shrink-0 p-3 rounded-xl bg-slate-50 border border-slate-100 w-56"
                            >
                              <p className="text-slate-600 text-xs italic mb-2">{person.text}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{person.avatar}</span>
                                <div>
                                  <p className="text-slate-900 text-xs font-semibold">{person.name}</p>
                                  <p className="text-slate-400 text-[10px]">{person.role}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {/* ========================================
                    STEP: NAME (Your Name + Photo)
                ======================================== */}
                {step === "name" && (
                  <motion.div
                    key="name"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    {/* Welcome Message */}
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-2xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-lg">
                          <Gift className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-slate-900 font-bold">Bem-vindo! 👋</p>
                          <p className="text-slate-500 text-sm">Vamos criar algo incrível juntos</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Title */}
                    <div className="space-y-2">
                      <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900"
                      >
                        Como você se{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
                          chama?
                        </span>
                      </motion.h1>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-500"
                      >
                        Este nome aparecerá na sua página
                      </motion.p>
                    </div>

                    {/* Photo + Name */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-4"
                    >
                      {/* Photo Upload */}
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => fileInputRef.current?.click()}
                          className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 border-2 border-dashed border-violet-300 flex items-center justify-center overflow-hidden group"
                        >
                          {profileImage.preview ? (
                            <>
                              <img src={profileImage.preview} className="w-full h-full object-cover" alt="" />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Camera className="w-6 h-6 text-white" />
                              </div>
                            </>
                          ) : (
                            <Camera className="w-8 h-8 text-violet-400" />
                          )}
                        </motion.button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageSelect}
                        />

                        <div className="flex-1">
                          <p className="text-slate-900 font-semibold mb-1">Foto de Perfil</p>
                          <p className="text-slate-400 text-sm">
                            {profileImage.preview ? "Clique para trocar" : "Adicionar foto (opcional)"}
                          </p>
                          <div className="flex items-center gap-1 mt-1 text-violet-600 text-xs font-medium">
                            <TrendingUp className="w-3 h-3" />
                            <span>+300% mais cliques com foto</span>
                          </div>
                        </div>
                      </div>

                      {/* Name Input */}
                      <div className="space-y-2">
                        <Label className="text-slate-700 font-medium">Seu nome ou marca</Label>
                        <Input
                          className="h-14 rounded-xl border-slate-200 text-lg font-medium placeholder:text-slate-300 focus-visible:ring-violet-500"
                          placeholder="Ex: João Silva"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          autoFocus
                        />
                      </div>

                      {/* Bio (optional) */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-slate-700 font-medium">Bio curta (opcional)</Label>
                          <span className="text-slate-400 text-xs">{bio.length}/80</span>
                        </div>
                        <Input
                          className="h-12 rounded-xl border-slate-200 placeholder:text-slate-300 focus-visible:ring-violet-500"
                          placeholder="Ex: Criador de conteúdo | Empreendedor"
                          value={bio}
                          onChange={(e) => setBio(e.target.value.slice(0, 80))}
                          maxLength={80}
                        />
                      </div>
                    </motion.div>

                    {/* Continue Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Button
                        onClick={() => {
                          if (!displayName.trim()) {
                            toast.error("Digite seu nome para continuar");
                            return;
                          }
                          celebrate('small');
                          setStep("niche");
                        }}
                        className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 group"
                      >
                        Continuar
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </motion.div>
                  </motion.div>
                )}

                {/* ========================================
                    STEP: NICHE
                ======================================== */}
                {step === "niche" && (
                  <motion.div
                    key="niche"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-5"
                  >
                    {/* Title */}
                    <div className="space-y-2">
                      <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900"
                      >
                        O que você{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
                          faz?
                        </span>
                      </motion.h1>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-500"
                      >
                        Vamos personalizar sua página para sua área 🎯
                      </motion.p>
                    </div>

                    {/* Niches Grid */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[55vh] overflow-y-auto pr-1 custom-scrollbar pb-2"
                    >
                      {NICHES.map((niche, i) => (
                        <motion.button
                          key={niche.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2 + i * 0.02 }}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleNicheSelect(niche)}
                          className="relative p-4 rounded-xl bg-white border-2 border-slate-100 hover:border-violet-300 hover:shadow-lg text-left group transition-all"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{niche.emoji}</span>
                            <div className={cn(
                              "p-1.5 rounded-lg bg-gradient-to-br text-white",
                              niche.gradient
                            )}>
                              {niche.icon}
                            </div>
                          </div>
                          <p className="text-slate-900 font-bold text-sm mb-0.5">{niche.name}</p>
                          <p className="text-slate-400 text-xs line-clamp-1">{niche.description}</p>

                          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500/0 to-indigo-500/0 group-hover:from-violet-500/5 group-hover:to-indigo-500/5 transition-all pointer-events-none" />
                        </motion.button>
                      ))}
                    </motion.div>
                  </motion.div>
                )}

                {/* ========================================
                    STEP: USERNAME
                ======================================== */}
                {step === "username" && (
                  <motion.div
                    key="username"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    {/* Niche Confirmation */}
                    {selectedNiche && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "p-4 rounded-2xl border bg-gradient-to-r",
                          selectedNiche.gradient.replace('from-', 'from-').replace('to-', 'to-') + '/10'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{selectedNiche.emoji}</span>
                          <div>
                            <p className="text-slate-900 font-bold">{selectedNiche.name}</p>
                            <p className="text-slate-500 text-sm">Ótima escolha! Vamos continuar</p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Title */}
                    <div className="space-y-2">
                      <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900"
                      >
                        Escolha seu{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
                          link único
                        </span>
                      </motion.h1>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-500"
                      >
                        Este será o endereço da sua página para sempre 🔗
                      </motion.p>
                    </div>

                    {/* Username Input */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-3"
                    >
                      <div className="relative">
                        <div className="bg-white rounded-2xl border-2 border-slate-200 focus-within:border-violet-500 transition-colors overflow-hidden shadow-sm">
                          <div className="flex items-center">
                            <span className="px-4 py-4 text-slate-400 font-medium text-sm whitespace-nowrap border-r border-slate-200 bg-slate-50">
                              freelinnk.com/
                            </span>
                            <Input
                              className="flex-1 h-14 bg-transparent border-0 text-slate-900 text-lg font-bold placeholder:text-slate-300 focus-visible:ring-0 px-4"
                              placeholder="seu-nome"
                              value={username}
                              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 30))}
                              autoFocus
                            />
                            <div className="pr-4">
                              <AnimatePresence mode="wait">
                                {username.length >= 3 && (
                                  <motion.div
                                                                      initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    className={cn(
                                      "w-10 h-10 rounded-xl flex items-center justify-center",
                                      debouncedUsername !== username
                                        ? "bg-slate-100"
                                        : checkAvailability?.available
                                          ? "bg-emerald-500"
                                          : checkAvailability === undefined
                                            ? "bg-slate-100"
                                            : "bg-red-500"
                                    )}
                                  >
                                    {debouncedUsername !== username || checkAvailability === undefined ? (
                                      <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                                    ) : checkAvailability?.available ? (
                                      <Check className="w-5 h-5 text-white" />
                                    ) : (
                                      <X className="w-5 h-5 text-white" />
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Feedback */}
                      <AnimatePresence>
                        {username.length >= 3 && debouncedUsername === username && checkAvailability && (
                          <motion.div
                            initial={{ opacity: 0, y: -10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className={cn(
                              "flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium",
                              checkAvailability.available
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            )}
                          >
                            {checkAvailability.available ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                                <span>Perfeito! Este nome está disponível 🎉</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>Este nome já está em uso. Tente outro!</span>
                              </>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Suggestions */}
                      {username.length < 3 && displayName && (
                        <div className="space-y-2">
                          <p className="text-slate-500 text-xs font-medium">Sugestões para você:</p>
                          <div className="flex flex-wrap gap-2">
                            {[
                              displayName.toLowerCase().replace(/\s+/g, ''),
                              displayName.toLowerCase().replace(/\s+/g, '.'),
                              displayName.toLowerCase().replace(/\s+/g, '_'),
                              `${displayName.toLowerCase().replace(/\s+/g, '')}oficial`,
                            ].slice(0, 3).map((suggestion) => (
                              <button
                                key={suggestion}
                                onClick={() => setUsername(suggestion.slice(0, 30))}
                                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-sm font-medium hover:bg-violet-100 hover:text-violet-700 transition-colors"
                              >
                                {suggestion.slice(0, 20)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>

                    {/* Continue Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Button
                        onClick={handleUsernameSubmit}
                        disabled={!isUsernameValid || loading}
                        className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 disabled:opacity-50 group"
                      >
                        {loading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            Reservar meu link
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </Button>
                    </motion.div>

                    {/* Preview Mobile */}
                    <button
                      onClick={() => setShowMobilePreview(true)}
                      className="lg:hidden w-full flex items-center justify-center gap-2 py-2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-medium">Ver preview</span>
                    </button>
                  </motion.div>
                )}

                {/* ========================================
                    STEP: LINKS
                ======================================== */}
                {step === "links" && (
                  <motion.div
                    key="links"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-5"
                  >
                    {/* Success Badge */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700 text-sm font-semibold">
                        freelinnk.com/{username} é seu!
                      </span>
                    </motion.div>

                    {/* Title */}
                    <div className="space-y-2">
                      <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900"
                      >
                        Adicione seus{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
                          links
                        </span>
                      </motion.h1>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-500"
                      >
                        Preencha os links que aparecem no seu perfil
                      </motion.p>
                    </div>

                    {/* Suggested Links from Niche */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-3 max-h-[45vh] overflow-y-auto pr-1 custom-scrollbar"
                    >
                      <AnimatePresence mode="popLayout">
                        {links.map((link, index) => {
                          const suggestedLink = selectedNiche?.suggestedLinks[index];

                          return (
                            <motion.div
                              key={link.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ delay: index * 0.05 }}
                              className="p-4 rounded-xl bg-white border-2 border-slate-100 hover:border-violet-200 transition-colors shadow-sm"
                            >
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center">
                                  {suggestedLink?.icon || getLinkIcon(link.url, link.title)}
                                </div>
                                <div className="flex-1">
                                  {link.id.startsWith('suggested-') ? (
                                    <p className="text-slate-900 font-semibold">{link.title}</p>
                                  ) : (
                                    <Input
                                      value={link.title}
                                      onChange={(e) => updateLinkTitle(link.id, e.target.value)}
                                      placeholder="Título do link"
                                      className="h-8 border-0 p-0 text-slate-900 font-semibold placeholder:text-slate-300 focus-visible:ring-0"
                                    />
                                  )}
                                  <p className="text-slate-400 text-xs">
                                    {suggestedLink ? 'Cole seu link abaixo' : 'Link personalizado'}
                                  </p>
                                </div>
                                <button
                                  onClick={() => removeLink(link.id)}
                                  className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              <Input
                                value={link.url.replace('https://', '')}
                                onChange={(e) => updateLinkUrl(link.id, e.target.value)}
                                placeholder={suggestedLink?.placeholder || "https://seulink.com"}
                                className="h-11 rounded-lg border-slate-200 placeholder:text-slate-300 focus-visible:ring-violet-500"
                              />

                              {link.url && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  className="mt-2 flex items-center gap-2 text-emerald-600"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span className="text-xs font-medium">Link adicionado</span>
                                </motion.div>
                              )}
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>

                      {/* Add Custom Link Button */}
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={addCustomLink}
                        className="w-full p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-violet-400 hover:bg-violet-50/50 transition-all flex items-center justify-center gap-2 text-slate-500 hover:text-violet-600"
                      >
                        <Plus className="w-5 h-5" />
                        <span className="font-medium">Adicionar outro link</span>
                      </motion.button>
                    </motion.div>

                    {/* Counter */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-slate-500">
                        <LinkIcon className="w-4 h-4" />
                        <span>{links.filter(l => l.url).length} link{links.filter(l => l.url).length !== 1 && 's'} preenchido{links.filter(l => l.url).length !== 1 && 's'}</span>
                      </div>
                      {links.filter(l => l.title && l.url).length === 0 && (
                        <span className="text-amber-600 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-4 h-4" />
                          Mínimo 1 link
                        </span>
                      )}
                    </div>

                    {/* Continue Button */}
                    <Button
                      onClick={handleLinksSubmit}
                      disabled={links.filter(l => l.title && l.url).length === 0}
                      className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 disabled:opacity-50 group"
                    >
                      Continuar
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>

                    {/* Preview Mobile */}
                    <button
                      onClick={() => setShowMobilePreview(true)}
                      className="lg:hidden w-full flex items-center justify-center gap-2 py-2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-medium">Ver preview</span>
                    </button>
                  </motion.div>
                )}

                {/* ========================================
                    STEP: TEMPLATE
                ======================================== */}
                {step === "template" && (
                  <motion.div
                    key="template"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-5"
                  >
                    {/* Almost Done Badge */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 border border-violet-200"
                    >
                      <Sparkles className="w-4 h-4 text-violet-600" />
                      <span className="text-violet-700 text-sm font-semibold">Último passo! 🎉</span>
                    </motion.div>

                    {/* Title */}
                    <div className="space-y-2">
                      <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900"
                      >
                        Escolha seu{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
                          estilo
                        </span>
                      </motion.h1>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-500"
                      >
                        Mais de 20 templates gratuitos para você escolher ✨
                      </motion.p>
                    </div>

                    {/* Filter Tabs */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="flex gap-2 overflow-x-auto pb-2 no-scrollbar"
                    >
                      {[
                        { id: "all", label: "Todos", count: TEMPLATES.length },
                        { id: "light", label: "Claros", count: TEMPLATES.filter(t => t.category === "light").length },
                        { id: "dark", label: "Escuros", count: TEMPLATES.filter(t => t.category === "dark").length },
                        { id: "colorful", label: "Coloridos", count: TEMPLATES.filter(t => t.category === "colorful").length },
                        { id: "gradient", label: "Gradientes", count: TEMPLATES.filter(t => t.category === "gradient").length },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setTemplateFilter(tab.id as typeof templateFilter)}
                          className={cn(
                            "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all",
                            templateFilter === tab.id
                              ? "bg-violet-600 text-white shadow-lg"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          )}
                        >
                          {tab.label}
                          <span className={cn(
                            "ml-1.5 text-xs",
                            templateFilter === tab.id ? "text-white/70" : "text-slate-400"
                          )}>
                            {tab.count}
                          </span>
                        </button>
                      ))}
                    </motion.div>

                    {/* Templates Grid */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-[40vh] overflow-y-auto pr-1 custom-scrollbar pb-2"
                    >
                      <AnimatePresence mode="popLayout">
                        {filteredTemplates.map((template, index) => {
                          const isSelected = selectedTemplate.id === template.id;

                          return (
                            <motion.button
                              key={template.id}
                              layout
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ delay: index * 0.02 }}
                              whileHover={{ scale: 1.03, y: -2 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => handleTemplateSelect(template)}
                              className={cn(
                                "relative p-2 rounded-xl border-2 transition-all overflow-hidden",
                                isSelected
                                  ? "border-violet-500 shadow-lg ring-2 ring-violet-500/20"
                                  : "border-slate-100 hover:border-slate-200 bg-white"
                              )}
                            >
                              {/* Badges */}
                              {template.popular && (
                                <div className="absolute top-1 right-1 z-10">
                                  <div className="w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
                                    <Star className="w-2.5 h-2.5 text-white fill-white" />
                                  </div>
                                </div>
                              )}
                              {template.new && (
                                <div className="absolute top-1 right-1 z-10">
                                  <div className="px-1.5 py-0.5 bg-emerald-500 rounded text-[8px] text-white font-bold">
                                    NEW
                                  </div>
                                </div>
                              )}

                              {/* Preview */}
                              <div
                                className="w-full h-16 sm:h-20 rounded-lg mb-2 overflow-hidden"
                                style={{ background: template.preview.bg }}
                              >
                                <div className="w-full h-full flex flex-col items-center justify-center p-2">
                                  {/* Mini avatar */}
                                  <div
                                    className="w-4 h-4 rounded-full mb-1"
                                    style={{ background: template.preview.cardBg }}
                                  />
                                  {/* Mini buttons */}
                                  <div className="w-full space-y-1">
                                    {[1, 2].map((i) => (
                                      <div
                                        key={i}
                                        className="w-full h-2 rounded"
                                        style={{ background: template.preview.buttonBg }}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Name */}
                              <p className="text-slate-700 text-[10px] sm:text-xs font-semibold text-center truncate">
                                {template.name}
                              </p>

                              {/* Selected Check */}
                              {isSelected && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="absolute top-1 left-1 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center"
                                >
                                  <Check className="w-3 h-3 text-white" />
                                </motion.div>
                              )}
                            </motion.button>
                          );
                        })}
                      </AnimatePresence>
                    </motion.div>

                    {/* Selected Template Info */}
                    <div className="flex items-center justify-center gap-2 py-1 text-sm text-slate-500">
                      <Palette className="w-4 h-4" />
                      <span>Template selecionado: <strong className="text-slate-700">{selectedTemplate.name}</strong></span>
                    </div>

                    {/* Launch Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Button
                        onClick={handleLaunch}
                        disabled={loading}
                        className="w-full h-16 text-xl font-black rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-700 hover:via-indigo-700 hover:to-blue-700 shadow-xl shadow-violet-500/30 group relative overflow-hidden"
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          animate={{ x: ['-200%', '200%'] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                        <motion.span className="relative flex items-center gap-3">
                          <Rocket className="w-6 h-6" />
                          Lançar minha página!
                          <PartyPopper className="w-5 h-5" />
                        </motion.span>
                      </Button>
                    </motion.div>

                    {/* Preview Mobile */}
                    <button
                      onClick={() => setShowMobilePreview(true)}
                      className="lg:hidden w-full flex items-center justify-center gap-2 py-2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-medium">Ver preview final</span>
                    </button>
                  </motion.div>
                )}

                {/* ========================================
                    STEP: LAUNCHING
                ======================================== */}
                {step === "launching" && (
                  <motion.div
                    key="launching"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-8 py-8"
                  >
                    {/* Rocket Animation */}
                    <motion.div
                      animate={{
                        y: [0, -20, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="relative mx-auto w-32 h-32"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-full blur-2xl opacity-30 animate-pulse" />
                      <div className="relative w-full h-full bg-gradient-to-br from-violet-100 to-indigo-100 rounded-full flex items-center justify-center">
                        <Rocket className="w-16 h-16 text-violet-600" />
                      </div>

                      {/* Particles */}
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-2 h-2 bg-violet-400 rounded-full"
                          style={{
                            left: '50%',
                            bottom: 0,
                          }}
                          animate={{
                            y: [0, 60],
                            x: [(i - 2.5) * 15, (i - 2.5) * 30],
                            opacity: [1, 0],
                            scale: [1, 0.5],
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.1,
                            ease: "easeOut"
                          }}
                        />
                      ))}
                    </motion.div>

                    {/* Text */}
                    <div className="space-y-2">
                      <motion.h2
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-2xl sm:text-3xl font-black text-slate-900"
                      >
                        {launchProgress < 100 ? "Criando sua página..." : "Página criada! 🎉"}
                      </motion.h2>
                      <p className="text-slate-500">
                        {launchProgress < 40 && "Preparando tudo para você..."}
                        {launchProgress >= 40 && launchProgress < 60 && "Salvando suas configurações..."}
                        {launchProgress >= 60 && launchProgress < 90 && "Adicionando seus links..."}
                        {launchProgress >= 90 && launchProgress < 100 && "Quase lá..."}
                        {launchProgress >= 100 && "Redirecionando para o dashboard..."}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="max-w-xs mx-auto">
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full"
                          initial={{ width: "0%" }}
                          animate={{ width: `${launchProgress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <p className="text-slate-400 text-sm mt-2 font-medium">{launchProgress}%</p>
                    </div>

                    {/* URL Preview */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: launchProgress >= 100 ? 1 : 0.5, y: 0 }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200"
                    >
                      <Globe className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700 font-medium">freelinnk.com/{username}</span>
                      <ExternalLink className="w-4 h-4 text-emerald-400" />
                    </motion.div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>

          {/* Back Button */}
          {step !== "welcome" && step !== "launching" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative p-4 sm:p-6 pt-0"
            >
              <button
                onClick={goBack}
                className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Voltar</span>
              </button>
            </motion.div>
          )}
        </div>

        {/* ================================================================
            RIGHT PANEL - PREVIEW (Desktop)
        ================================================================ */}
        <div className="hidden lg:flex flex-1 items-center justify-center relative bg-slate-100 overflow-hidden">

          {/* Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:2rem_2rem]" />

          {/* Glow */}
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full blur-[150px] opacity-30"
            style={{ background: selectedTemplate.preview.accent }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.35, 0.2]
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />

          {/* Phone Preview */}
          {step !== "welcome" && step !== "launching" && (
           <PhonePreview
  username={username}
  template={selectedTemplate}
  links={links}               // <--- ADICIONE ISSO
  profileImage={profileImage} // <--- ADICIONE ISSO
  displayName={displayName}   // <--- ADICIONE ISSO
  bio={bio}                   // <--- ADICIONE ISSO
/>
          )}

          {/* Welcome Screen Art */}
          {step === "welcome" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-64 h-64 rounded-full border-4 border-dashed border-violet-200"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-violet-500/30">
                    <span className="text-7xl font-black text-white">F</span>
                  </div>
                </div>
              </div>
              <p className="text-slate-400 font-medium">Crie sua página em 2 minutos</p>
            </motion.div>
          )}

          {/* Floating Elements */}
          <motion.div
            animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-20 right-20 p-3 rounded-xl bg-white shadow-lg border border-slate-200"
          >
            <Heart className="w-6 h-6 text-pink-500" />
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
            className="absolute bottom-28 left-20 p-3 rounded-xl bg-white shadow-lg border border-slate-200"
          >
            <Star className="w-6 h-6 text-amber-500" />
          </motion.div>

          <motion.div
            animate={{ y: [0, -8, 0], rotate: [0, 8, 0] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
            className="absolute top-36 left-28 p-3 rounded-xl bg-white shadow-lg border border-slate-200"
          >
            <Sparkles className="w-6 h-6 text-violet-500" />
          </motion.div>

          <motion.div
            animate={{ y: [0, 8, 0], rotate: [0, -6, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, delay: 0.8 }}
            className="absolute bottom-36 right-28 p-3 rounded-xl bg-white shadow-lg border border-slate-200"
          >
            <Zap className="w-6 h-6 text-cyan-500" />
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute top-8 right-8 p-4 rounded-2xl bg-white/90 backdrop-blur-sm shadow-lg border border-slate-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">50k+</p>
                <p className="text-slate-500 text-xs">Criadores ativos</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="absolute bottom-8 left-8 p-4 rounded-2xl bg-white/90 backdrop-blur-sm shadow-lg border border-slate-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center">
                <Globe className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">2M+</p>
                <p className="text-slate-500 text-xs">Cliques por mês</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ================================================================
          MODAL PREVIEW MOBILE
      ================================================================ */}
      <AnimatePresence>
        {showMobilePreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-4 lg:hidden"
            onClick={() => setShowMobilePreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative"
            >
              {/* Close */}
              <button
                onClick={() => setShowMobilePreview(false)}
                className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Title */}
              <div className="absolute -top-12 left-0 flex items-center gap-2 text-white">
                <Smartphone className="w-4 h-4" />
                <span className="text-sm font-medium">Preview</span>
              </div>

              {/* Phone */}
             <PhonePreview
  username={username}
  template={selectedTemplate}
  links={links}               // <--- ADICIONE ISSO
  profileImage={profileImage} // <--- ADICIONE ISSO
  displayName={displayName}   // <--- ADICIONE ISSO
  bio={bio}                   // <--- ADICIONE ISSO
/>

              {/* Hint */}
              <p className="text-center text-white/40 text-xs mt-4">
                Toque fora para fechar
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================================
          STYLES
      ================================================================ */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}