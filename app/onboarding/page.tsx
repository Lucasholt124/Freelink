"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
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
  Building2,
  Scissors,
  Stethoscope,
  MapPin,
  Upload,
  Mail,
  Phone,
  Calendar,

  Video,
  Gift,
  Wand2,
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
  FaPinterest,
  FaTwitch,
  FaFacebook,
  FaGoogle,
  FaWaze,
  FaSnapchat,
  FaReddit,
  FaSoundcloud,
  FaAmazon,
  FaPaypal,
  FaPatreon,
  FaBehance,
  FaDribbble,
  FaMedium,
  FaGooglePlay,
  FaAppStore,
} from "react-icons/fa6";

// ============================================================================
// TIPOS
// ============================================================================
type Step = "niche" | "username" | "profile" | "links" | "style";

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
  suggestedLinks: string[];
  colors: string[];
  welcomeMessage: string;
  bioPlaceholder: string;
}

// ============================================================================
// NICHOS - MENSAGENS QUE CONECTAM COM O SUBCONSCIENTE
// ============================================================================
const NICHES: NicheOption[] = [
  {
    id: "creator",
    name: "Criador de Conteúdo",
    icon: <Video className="w-5 h-5" />,
    emoji: "🎬",
    description: "YouTuber, Streamer, Podcaster",
    suggestedLinks: ["YouTube", "Instagram", "TikTok", "Twitch"],
    colors: ["#FF0000", "#E1306C", "#000000", "#9146FF"],
    welcomeMessage: "Criadores como você transformam ideias em impacto. Sua página vai ser o hub que seus fãs estavam esperando! 🚀",
    bioPlaceholder: "Criador de conteúdo apaixonado por conectar pessoas...",
  },
  {
    id: "influencer",
    name: "Influenciador",
    icon: <Users className="w-5 h-5" />,
    emoji: "✨",
    description: "Lifestyle, Moda, Beleza",
    suggestedLinks: ["Instagram", "TikTok", "YouTube", "Loja"],
    colors: ["#E1306C", "#833AB4", "#F77737", "#C13584"],
    welcomeMessage: "Influenciadores movem mercados. Sua página vai centralizar todo seu poder em um único link! 💫",
    bioPlaceholder: "Compartilhando lifestyle e inspiração todos os dias...",
  },
  {
    id: "entrepreneur",
    name: "Empreendedor",
    icon: <Briefcase className="w-5 h-5" />,
    emoji: "💼",
    description: "Startup, Negócio, Consultor",
    suggestedLinks: ["WhatsApp", "LinkedIn", "Site", "Calendly"],
    colors: ["#0077B5", "#25D366", "#4A90D9", "#2C3E50"],
    welcomeMessage: "Empreendedores precisam de velocidade. Em 2 minutos você terá uma página que transmite profissionalismo! 🎯",
    bioPlaceholder: "Ajudando empresas a crescerem com estratégia...",
  },
  {
    id: "artist",
    name: "Artista / Músico",
    icon: <Music className="w-5 h-5" />,
    emoji: "🎵",
    description: "Cantor, Banda, DJ, Produtor",
    suggestedLinks: ["Spotify", "YouTube", "Instagram", "Shows"],
    colors: ["#1DB954", "#FF0000", "#FF5500", "#191414"],
    welcomeMessage: "Artistas merecem um palco digital à altura. Sua música vai alcançar mais ouvidos! 🎶",
    bioPlaceholder: "Transformando emoções em melodias...",
  },
  {
    id: "freelancer",
    name: "Freelancer",
    icon: <Code className="w-5 h-5" />,
    emoji: "💻",
    description: "Designer, Dev, Redator",
    suggestedLinks: ["Portfólio", "LinkedIn", "GitHub", "WhatsApp"],
    colors: ["#6366F1", "#EC4899", "#0077B5", "#181717"],
    welcomeMessage: "Freelancers de sucesso têm presença digital forte. Sua página vai ser seu melhor cartão de visitas! 💼",
    bioPlaceholder: "Criando soluções digitais com paixão...",
  },
  {
    id: "coach",
    name: "Coach / Mentor",
    icon: <Target className="w-5 h-5" />,
    emoji: "🎯",
    description: "Life Coach, Mentor, Terapeuta",
    suggestedLinks: ["WhatsApp", "Calendly", "Instagram", "Curso"],
    colors: ["#10B981", "#F59E0B", "#6366F1", "#8B5CF6"],
    welcomeMessage: "Coaches transformam vidas. Sua página vai mostrar que você é a pessoa certa para guiar essa transformação! ✨",
    bioPlaceholder: "Guiando pessoas a alcançarem seu potencial máximo...",
  },
  {
    id: "restaurant",
    name: "Restaurante / Food",
    icon: <Utensils className="w-5 h-5" />,
    emoji: "🍔",
    description: "Restaurante, Delivery, Chef",
    suggestedLinks: ["Cardápio", "iFood", "WhatsApp", "Instagram"],
    colors: ["#EA1D2C", "#FF9900", "#25D366", "#E1306C"],
    welcomeMessage: "Restaurantes que facilitam o pedido vendem mais. Seus clientes vão adorar essa praticidade! 🍽️",
    bioPlaceholder: "Servindo sabor e felicidade em cada prato...",
  },
  {
    id: "fitness",
    name: "Personal / Fitness",
    icon: <Dumbbell className="w-5 h-5" />,
    emoji: "💪",
    description: "Personal Trainer, Academia",
    suggestedLinks: ["WhatsApp", "Instagram", "Planos", "YouTube"],
    colors: ["#EF4444", "#F97316", "#10B981", "#6366F1"],
    welcomeMessage: "Profissionais de fitness inspiram ação. Sua página vai motivar novos alunos a começarem hoje! 🏋️",
    bioPlaceholder: "Transformando corpos e mentes através do fitness...",
  },
  {
    id: "beauty",
    name: "Beleza / Estética",
    icon: <Scissors className="w-5 h-5" />,
    emoji: "💅",
    description: "Salão, Barbearia, Estética",
    suggestedLinks: ["WhatsApp", "Instagram", "Agendamento", "Preços"],
    colors: ["#EC4899", "#F472B6", "#A855F7", "#6366F1"],
    welcomeMessage: "Profissionais de beleza encantam. Sua página vai ser tão linda quanto seu trabalho! 💖",
    bioPlaceholder: "Realçando a beleza única de cada pessoa...",
  },
  {
    id: "health",
    name: "Saúde / Medicina",
    icon: <Stethoscope className="w-5 h-5" />,
    emoji: "⚕️",
    description: "Médico, Dentista, Psicólogo",
    suggestedLinks: ["WhatsApp", "Agendamento", "Localização", "Currículo"],
    colors: ["#0EA5E9", "#10B981", "#6366F1", "#8B5CF6"],
    welcomeMessage: "Profissionais de saúde salvam vidas. Sua página vai transmitir a confiança que seus pacientes precisam! 🏥",
    bioPlaceholder: "Cuidando da sua saúde com dedicação e carinho...",
  },
  {
    id: "education",
    name: "Professor / Cursos",
    icon: <GraduationCap className="w-5 h-5" />,
    emoji: "📚",
    description: "Professor, Infoprodutor",
    suggestedLinks: ["Curso", "YouTube", "Instagram", "WhatsApp"],
    colors: ["#6366F1", "#8B5CF6", "#EC4899", "#F59E0B"],
    welcomeMessage: "Educadores mudam o mundo. Sua página vai converter curiosos em alunos! 🎓",
    bioPlaceholder: "Ensinando e transformando através do conhecimento...",
  },
  {
    id: "ecommerce",
    name: "Loja / E-commerce",
    icon: <ShoppingBag className="w-5 h-5" />,
    emoji: "🛍️",
    description: "Loja Online, Dropshipping",
    suggestedLinks: ["Loja", "WhatsApp", "Instagram", "Promoções"],
    colors: ["#F59E0B", "#EF4444", "#10B981", "#6366F1"],
    welcomeMessage: "Lojas online precisam de acesso rápido. Sua página vai ser a vitrine que vende 24/7! 🛒",
    bioPlaceholder: "Os melhores produtos com os melhores preços...",
  },
  {
    id: "realestate",
    name: "Corretor / Imóveis",
    icon: <Building2 className="w-5 h-5" />,
    emoji: "🏠",
    description: "Corretor, Imobiliária",
    suggestedLinks: ["WhatsApp", "Imóveis", "Instagram", "LinkedIn"],
    colors: ["#0EA5E9", "#10B981", "#6366F1", "#F59E0B"],
    welcomeMessage: "Corretores de sucesso são encontrados facilmente. Sua página vai gerar leads qualificados! 🏡",
    bioPlaceholder: "Realizando o sonho da casa própria...",
  },
  {
    id: "events",
    name: "Eventos / Festas",
    icon: <PartyPopper className="w-5 h-5" />,
    emoji: "🎉",
    description: "DJ, Fotógrafo, Decorador",
    suggestedLinks: ["WhatsApp", "Portfólio", "Instagram", "Orçamento"],
    colors: ["#EC4899", "#F59E0B", "#8B5CF6", "#6366F1"],
    welcomeMessage: "Profissionais de eventos criam memórias. Sua página vai fazer clientes sonharem! 🎊",
    bioPlaceholder: "Criando momentos inesquecíveis...",
  },
  {
    id: "other",
    name: "Outro",
    icon: <Sparkles className="w-5 h-5" />,
    emoji: "🌟",
    description: "Minha área é diferente",
    suggestedLinks: ["WhatsApp", "Instagram", "Site", "Email"],
    colors: ["#6366F1", "#8B5CF6", "#EC4899", "#10B981"],
    welcomeMessage: "Não importa sua área, você merece uma presença digital incrível. Vamos criar algo único! ✨",
    bioPlaceholder: "Compartilhando meu trabalho com o mundo...",
  },
];

// ============================================================================
// TEMAS - TODOS 100% GRATUITOS
// ============================================================================
const THEMES = [
  {
    id: "clean",
    name: "Clean",
    emoji: "⚪",
    bg: "bg-slate-50",
    bgHex: "#f8fafc",
    btn: "bg-slate-900",
    btnHex: "#0f172a",
    text: "text-slate-900",
    textMuted: "text-slate-500",
    preview: "from-slate-100 to-slate-200",
    forNiches: ["entrepreneur", "freelancer", "health", "realestate"],
  },
  {
    id: "midnight",
    name: "Midnight",
    emoji: "🌙",
    bg: "bg-slate-950",
    bgHex: "#020617",
    btn: "bg-white",
    btnHex: "#ffffff",
    text: "text-white",
    textMuted: "text-slate-400",
    preview: "from-slate-900 to-slate-800",
    forNiches: ["creator", "artist", "freelancer", "events"],
  },
  {
    id: "purple",
    name: "Roxo",
    emoji: "💜",
    bg: "bg-purple-50",
    bgHex: "#faf5ff",
    btn: "bg-purple-600",
    btnHex: "#9333ea",
    text: "text-purple-900",
    textMuted: "text-purple-500",
    preview: "from-purple-100 to-purple-200",
    forNiches: ["influencer", "coach", "education", "events"],
  },
  {
    id: "sunset",
    name: "Sunset",
    emoji: "🌅",
    bg: "bg-gradient-to-br from-orange-50 to-pink-50",
    bgHex: "#fff7ed",
    btn: "bg-gradient-to-r from-orange-500 to-pink-500",
    btnHex: "#f97316",
    text: "text-orange-900",
    textMuted: "text-orange-500",
    preview: "from-orange-100 to-pink-100",
    forNiches: ["influencer", "beauty", "events"],
  },
  {
    id: "ocean",
    name: "Ocean",
    emoji: "🌊",
    bg: "bg-gradient-to-br from-cyan-50 to-blue-50",
    bgHex: "#ecfeff",
    btn: "bg-gradient-to-r from-cyan-500 to-blue-500",
    btnHex: "#06b6d4",
    text: "text-cyan-900",
    textMuted: "text-cyan-500",
    preview: "from-cyan-100 to-blue-100",
    forNiches: ["health", "coach", "education", "freelancer"],
  },
  {
    id: "forest",
    name: "Forest",
    emoji: "🌲",
    bg: "bg-gradient-to-br from-emerald-50 to-teal-50",
    bgHex: "#ecfdf5",
    btn: "bg-gradient-to-r from-emerald-500 to-teal-500",
    btnHex: "#10b981",
    text: "text-emerald-900",
    textMuted: "text-emerald-500",
    preview: "from-emerald-100 to-teal-100",
    forNiches: ["fitness", "health", "restaurant", "coach"],
  },
  {
    id: "neon",
    name: "Neon",
    emoji: "💖",
    bg: "bg-fuchsia-950",
    bgHex: "#4a044e",
    btn: "bg-gradient-to-r from-fuchsia-500 to-pink-500",
    btnHex: "#d946ef",
    text: "text-white",
    textMuted: "text-fuchsia-300",
    preview: "from-fuchsia-900 to-pink-900",
    forNiches: ["creator", "artist", "events", "influencer"],
  },
  {
    id: "gold",
    name: "Gold",
    emoji: "✨",
    bg: "bg-gradient-to-br from-amber-50 to-yellow-50",
    bgHex: "#fffbeb",
    btn: "bg-gradient-to-r from-amber-500 to-yellow-500",
    btnHex: "#f59e0b",
    text: "text-amber-900",
    textMuted: "text-amber-600",
    preview: "from-amber-100 to-yellow-100",
    forNiches: ["coach", "realestate", "ecommerce", "entrepreneur"],
  },
  {
    id: "rose",
    name: "Rose",
    emoji: "🌸",
    bg: "bg-gradient-to-br from-rose-50 to-pink-50",
    bgHex: "#fff1f2",
    btn: "bg-gradient-to-r from-rose-500 to-pink-500",
    btnHex: "#f43f5e",
    text: "text-rose-900",
    textMuted: "text-rose-500",
    preview: "from-rose-100 to-pink-100",
    forNiches: ["beauty", "influencer", "events"],
  },
  {
    id: "lavender",
    name: "Lavender",
    emoji: "💐",
    bg: "bg-gradient-to-br from-violet-50 to-purple-50",
    bgHex: "#f5f3ff",
    btn: "bg-gradient-to-r from-violet-500 to-purple-500",
    btnHex: "#8b5cf6",
    text: "text-violet-900",
    textMuted: "text-violet-500",
    preview: "from-violet-100 to-purple-100",
    forNiches: ["beauty", "education", "coach"],
  },
  {
    id: "coral",
    name: "Coral",
    emoji: "🪸",
    bg: "bg-gradient-to-br from-red-50 to-orange-50",
    bgHex: "#fef2f2",
    btn: "bg-gradient-to-r from-red-400 to-orange-400",
    btnHex: "#f87171",
    text: "text-red-900",
    textMuted: "text-red-500",
    preview: "from-red-100 to-orange-100",
    forNiches: ["restaurant", "fitness", "events"],
  },
  {
    id: "sky",
    name: "Sky",
    emoji: "☁️",
    bg: "bg-gradient-to-br from-sky-50 to-indigo-50",
    bgHex: "#f0f9ff",
    btn: "bg-gradient-to-r from-sky-500 to-indigo-500",
    btnHex: "#0ea5e9",
    text: "text-sky-900",
    textMuted: "text-sky-500",
    preview: "from-sky-100 to-indigo-100",
    forNiches: ["freelancer", "education", "health", "entrepreneur"],
  },
];

// ============================================================================
// MAPA DE ÍCONES INTELIGENTES (50+)
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
  { match: ['pinterest.com'], icon: <FaPinterest className="w-4 h-4 text-[#E60023]" /> },
  { match: ['snapchat.com'], icon: <FaSnapchat className="w-4 h-4 text-[#FFFC00]" /> },
  { match: ['reddit.com'], icon: <FaReddit className="w-4 h-4 text-[#FF4500]" /> },
  { match: ['youtube.com', 'youtu.be'], icon: <FaYoutube className="w-4 h-4 text-[#FF0000]" /> },
  { match: ['twitch.tv'], icon: <FaTwitch className="w-4 h-4 text-[#9146FF]" /> },
  { match: ['spotify.com'], icon: <FaSpotify className="w-4 h-4 text-[#1DB954]" /> },
  { match: ['soundcloud.com'], icon: <FaSoundcloud className="w-4 h-4 text-[#FF5500]" /> },
  { match: ['amazon.'], icon: <FaAmazon className="w-4 h-4 text-[#FF9900]" /> },
  { match: ['shopee.'], icon: <ShoppingBag className="w-4 h-4 text-[#EE4D2D]" /> },
  { match: ['paypal.com', 'paypal.me'], icon: <FaPaypal className="w-4 h-4 text-[#003087]" /> },
  { match: ['patreon.com'], icon: <FaPatreon className="w-4 h-4 text-[#F96854]" /> },
  { match: ['github.com'], icon: <FaGithub className="w-4 h-4 text-[#181717]" /> },
  { match: ['behance.net'], icon: <FaBehance className="w-4 h-4 text-[#1769FF]" /> },
  { match: ['dribbble.com'], icon: <FaDribbble className="w-4 h-4 text-[#EA4C89]" /> },
  { match: ['medium.com'], icon: <FaMedium className="w-4 h-4 text-[#000000]" /> },
  { match: ['play.google.com'], icon: <FaGooglePlay className="w-4 h-4 text-[#3BCCFF]" /> },
  { match: ['apps.apple.com'], icon: <FaAppStore className="w-4 h-4 text-[#0D96F6]" /> },
  { match: ['calendly.com', 'cal.com'], icon: <Calendar className="w-4 h-4 text-[#006BFF]" /> },
  { match: ['ifood'], icon: <Utensils className="w-4 h-4 text-[#EA1D2C]" /> },
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

  // Ícones por título
  if (t.includes('whatsapp') || t.includes('zap')) return <FaWhatsapp className="w-4 h-4 text-[#25D366]" />;
  if (t.includes('instagram') || t.includes('insta')) return <FaInstagram className="w-4 h-4 text-[#E1306C]" />;
  if (t.includes('youtube')) return <FaYoutube className="w-4 h-4 text-[#FF0000]" />;
  if (t.includes('tiktok')) return <FaTiktok className="w-4 h-4" />;
  if (t.includes('spotify')) return <FaSpotify className="w-4 h-4 text-[#1DB954]" />;
  if (t.includes('linkedin')) return <FaLinkedin className="w-4 h-4 text-[#0077B5]" />;
  if (t.includes('portfolio') || t.includes('trabalhos')) return <Briefcase className="w-4 h-4 text-purple-500" />;
  if (t.includes('loja') || t.includes('comprar') || t.includes('shop')) return <ShoppingBag className="w-4 h-4 text-green-500" />;
  if (t.includes('curso') || t.includes('aula')) return <GraduationCap className="w-4 h-4 text-indigo-500" />;
  if (t.includes('agenda') || t.includes('horário') || t.includes('agendar')) return <Calendar className="w-4 h-4 text-blue-500" />;
  if (t.includes('cardápio') || t.includes('menu')) return <Utensils className="w-4 h-4 text-orange-500" />;
  if (t.includes('contato') || t.includes('fale')) return <Phone className="w-4 h-4 text-green-500" />;
  if (t.includes('email')) return <Mail className="w-4 h-4 text-red-500" />;
  if (t.includes('localização') || t.includes('endereço') || t.includes('maps')) return <MapPin className="w-4 h-4 text-red-500" />;

  return <FaGlobe className="w-4 h-4 text-[#6366f1]" />;
}

// ============================================================================
// DEBOUNCE HOOK
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
// CELEBRAÇÃO ÉPICA
// ============================================================================
function celebrate(intensity: 'small' | 'medium' | 'epic' = 'medium') {
  const configs = {
    small: { particleCount: 30, spread: 50 },
    medium: { particleCount: 60, spread: 70 },
    epic: { particleCount: 150, spread: 100 },
  };

  const config = configs[intensity];

  confetti({
    ...config,
    origin: { y: 0.7 },
    colors: ['#9333ea', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'],
  });

  if (intensity === 'epic') {
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#9333ea', '#ec4899'],
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#f59e0b', '#10b981'],
      });
    }, 200);
  }
}

// ============================================================================
// COMPONENTE DO CELULAR PREVIEW (ULTRA REALISTA)
// ============================================================================
function PhonePreview({
  preview,
  niche,
  className = "",
}: {
  preview: {
    username: string;
    links: LinkItem[];
    bio: string;
    imagePreview: string | null;
    selectedTheme: typeof THEMES[0];
  };
  niche?: NicheOption | null;
  className?: string;
}) {
  const isDark = preview.selectedTheme.bg.includes('950') ||
                 preview.selectedTheme.bg.includes('900') ||
                 preview.selectedTheme.id === 'midnight' ||
                 preview.selectedTheme.id === 'neon';

  return (
    <div className={cn("relative", className)}>
      {/* Sombra */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[80%] h-[20px] bg-black/10 blur-xl rounded-full" />

      {/* Celular */}
      <div className="relative w-[240px] h-[480px] sm:w-[280px] sm:h-[560px] bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border-[6px] sm:border-[8px] border-slate-800 overflow-hidden">

        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 sm:w-20 h-5 sm:h-6 bg-slate-900 rounded-b-xl z-20">
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-700" />
        </div>

        {/* Status Bar */}
        <div className="absolute top-1 left-4 right-4 flex justify-between items-center z-20">
          <span className={cn("text-[9px] font-medium", isDark ? "text-white/60" : "text-slate-500")}>9:41</span>
          <div className={cn("w-4 h-1.5 rounded-sm", isDark ? "bg-white/60" : "bg-slate-400")} />
        </div>

        {/* Tela */}
        <div className={cn("absolute inset-0 overflow-y-auto no-scrollbar", preview.selectedTheme.bg)}>
          <div className="pt-10 sm:pt-12 pb-4 px-3 sm:px-4 flex flex-col items-center min-h-full">

            {/* Avatar */}
            <motion.div
              layout
              className={cn(
                "w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden mb-2 shadow-lg border-2",
                isDark ? "border-white/20 bg-white/10" : "border-white bg-white"
              )}
              style={{ boxShadow: `0 0 20px ${preview.selectedTheme.btnHex}30` }}
            >
              {preview.imagePreview ? (
                <img src={preview.imagePreview} className="w-full h-full object-cover" alt="" />
              ) : (
                <div className={cn("w-full h-full flex items-center justify-center", preview.selectedTheme.textMuted)}>
                  <User className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
              )}
            </motion.div>

            {/* Badge Nicho */}
            {niche && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-medium mb-1",
                  isDark ? "bg-white/10 text-white/70" : "bg-slate-100 text-slate-500"
                )}
              >
                <span>{niche.emoji}</span>
                <span>{niche.name}</span>
              </motion.div>
            )}

            {/* Username */}
            <h2 className={cn("font-bold text-sm sm:text-base mb-0.5", preview.selectedTheme.text)}>
              @{preview.username || "seu-nome"}
            </h2>

            {/* Bio */}
            <p className={cn("text-[9px] sm:text-[10px] text-center mb-3 sm:mb-4 px-2 line-clamp-2", preview.selectedTheme.textMuted)}>
              {preview.bio || "Sua bio aqui..."}
            </p>

            {/* Links */}
            <div className="w-full space-y-1.5 sm:space-y-2">
              <AnimatePresence mode="popLayout">
                {preview.links.length > 0 ? (
                  preview.links.slice(0, 4).map((link, i) => (
                    <motion.div
                      key={link.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={cn(
                        "w-full py-2 sm:py-2.5 px-3 rounded-lg sm:rounded-xl shadow flex items-center gap-2",
                        preview.selectedTheme.btn
                      )}
                    >
                      <span className={cn(
                        "w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center flex-shrink-0 overflow-hidden",
                        preview.selectedTheme.id === 'midnight' ? "bg-slate-200" : "bg-white/20"
                      )}>
                        {link.iconPreview ? (
                          <img src={link.iconPreview} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <span className={preview.selectedTheme.id === 'midnight' ? "text-slate-900" : "text-white"}>
                            {getLinkIcon(link.url, link.title)}
                          </span>
                        )}
                      </span>
                      <span className={cn(
                        "text-[10px] sm:text-xs font-medium truncate flex-1",
                        preview.selectedTheme.id === 'midnight' ? "text-slate-900" : "text-white"
                      )}>
                        {link.title}
                      </span>
                    </motion.div>
                  ))
                ) : (
                  [...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-full h-8 sm:h-10 rounded-lg border-2 border-dashed",
                        isDark ? "border-white/20" : "border-slate-200"
                      )}
                    />
                  ))
                )}
              </AnimatePresence>

              {preview.links.length > 4 && (
                <p className={cn("text-center text-[9px]", preview.selectedTheme.textMuted)}>
                  +{preview.links.length - 4} links
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="mt-auto pt-4">
              <div className={cn("flex items-center gap-1 text-[7px] sm:text-[8px] font-medium uppercase tracking-wider", preview.selectedTheme.textMuted)}>
                <Zap className="w-2 h-2" />
                freelinnk
              </div>
            </div>
          </div>
        </div>

        {/* Home Indicator */}
        <div className={cn(
          "absolute bottom-1 left-1/2 -translate-x-1/2 w-20 sm:w-24 h-1 rounded-full",
          isDark ? "bg-white/30" : "bg-slate-900/20"
        )} />
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL - ONBOARDING
// ============================================================================
export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("niche");
  const [loading, setLoading] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  // --- DADOS DO USUÁRIO ---
  const [selectedNiche, setSelectedNiche] = useState<NicheOption | null>(null);

  // --- DADOS DO PREVIEW ---
  const [preview, setPreview] = useState({
    username: "",
    links: [] as LinkItem[],
    bio: "",
    imagePreview: null as string | null,
    imageFile: null as File | null,
    selectedTheme: THEMES[0],
  });

  // --- LINK TEMPORÁRIO ---
  const [newLink, setNewLink] = useState({ title: "", url: "" });
  const [newLinkIconPreview, setNewLinkIconPreview] = useState<string | null>(null);
  const [newLinkIconFile, setNewLinkIconFile] = useState<File | null>(null);
  const linkIconInputRef = useRef<HTMLInputElement>(null);

  // --- DEBOUNCE PARA USERNAME ---
  const debouncedUsername = useDebounce(preview.username, 500);

  // --- CONVEX QUERIES & MUTATIONS ---
  const checkAvailability = useQuery(
    api.lib.usernames.checkUsernameAvailability,
    debouncedUsername.length >= 3 ? { username: debouncedUsername } : "skip"
  );

  const setUsernameMutation = useMutation(api.lib.usernames.setUsername);
  const updateCustomizations = useMutation(api.lib.customizations.updateCustomizations);
  const generateUploadUrl = useMutation(api.lib.customizations.generateUploadUrl);
  const createLink = useMutation(api.lib.links.createLink);

  // --- TEMAS RECOMENDADOS BASEADOS NO NICHO ---
  const recommendedThemes = useMemo(() => {
    if (!selectedNiche) return THEMES;
    return [...THEMES].sort((a, b) => {
      const aMatch = a.forNiches?.includes(selectedNiche.id) ? 1 : 0;
      const bMatch = b.forNiches?.includes(selectedNiche.id) ? 1 : 0;
      return bMatch - aMatch;
    });
  }, [selectedNiche]);

  // --- VALIDAÇÕES ---
  const isUsernameValid = preview.username.length >= 3 && checkAvailability?.available;
  const isLinksValid = preview.links.length >= 1;

  // ============================================================================
  // HANDLERS
  // ============================================================================

  // Step 1: Selecionar Nicho
  const handleNicheSelect = (niche: NicheOption) => {
    setSelectedNiche(niche);
    celebrate('medium');

    toast.success(`${niche.emoji} Perfeito!`, {
      description: "Vamos criar uma página incrível pra você!",
      duration: 2500,
    });

    setTimeout(() => setStep("username"), 600);
  };

  // Step 2: Salvar Username
  const handleUsernameSubmit = async () => {
    if (!isUsernameValid) return;
    setLoading(true);

    try {
      await setUsernameMutation({ username: preview.username });
      celebrate('medium');

      toast.success("Nome reservado! 🎉", {
        description: `freelinnk.com/${preview.username} é seu!`,
      });

      setStep("profile");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar. Tente outro nome.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Foto e Bio
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Imagem muito grande. Máximo 5MB.");
        return;
      }
      setPreview(prev => ({
        ...prev,
        imageFile: file,
        imagePreview: URL.createObjectURL(file)
      }));
      celebrate('small');
      toast.success("Foto perfeita! 📸");
    }
  };

  const handleProfileSubmit = () => {
    celebrate('small');
    setStep("links");
  };

  // Step 4: Links
  const handleLinkIconSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Imagem muito grande. Máximo 5MB.");
        return;
      }
      setNewLinkIconFile(file);
      setNewLinkIconPreview(URL.createObjectURL(file));
    }
  };

  const addLink = () => {
    if (newLink.title.length < 3) {
      toast.error("Título precisa ter pelo menos 3 caracteres");
      return;
    }
    if (newLink.url.length < 5) {
      toast.error("URL precisa ter pelo menos 5 caracteres");
      return;
    }

    const url = newLink.url.startsWith("http") ? newLink.url : `https://${newLink.url}`;

    setPreview(prev => ({
      ...prev,
      links: [...prev.links, {
        id: Date.now().toString(),
        title: newLink.title,
        url,
        iconFile: newLinkIconFile || undefined,
        iconPreview: newLinkIconPreview || undefined,
      }]
    }));

    setNewLink({ title: "", url: "" });
    setNewLinkIconFile(null);
    setNewLinkIconPreview(null);

    celebrate('small');
    toast.success("Link adicionado! 🔗");
  };

  const removeLink = (id: string) => {
    setPreview(prev => ({
      ...prev,
      links: prev.links.filter(l => l.id !== id)
    }));
  };

  const handleLinksSubmit = () => {
    if (!isLinksValid) {
      toast.error("Adicione pelo menos 1 link");
      return;
    }
    celebrate('medium');
    setStep("style");
  };

  // Step 5: Finalizar
  const handleFinish = async () => {
    setLoading(true);

    try {
      let profileStorageId = undefined;

      // Upload foto de perfil
      if (preview.imageFile) {
        const uploadUrl = await generateUploadUrl({});
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": preview.imageFile.type },
          body: preview.imageFile,
        });
        const json = await res.json();
        profileStorageId = json.storageId;
      }

      // Salvar customizações
      await updateCustomizations({
        description: preview.bio,
        profilePictureStorageId: profileStorageId,
        accentColor: preview.selectedTheme.btnHex,
        backgroundType: "color",
        backgroundColor1: preview.selectedTheme.bgHex,
      });

      // Criar links
      for (const link of preview.links) {
        let thumbnailStorageId = undefined;

        // Upload ícone do link se existir
        if (link.iconFile) {
          const uploadUrl = await generateUploadUrl({});
          const res = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": link.iconFile.type },
            body: link.iconFile,
          });
          const json = await res.json();
          thumbnailStorageId = json.storageId;
        }

        await createLink({
          title: link.title,
          url: link.url,
          isFeatured: false,
          badgeType: "new",
          thumbnailStorageId,
        });
      }

      // Celebração épica
      celebrate('epic');

      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#9333ea', '#ec4899', '#f59e0b'],
        });
      }, 300);

      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 600);

      toast.success("Sua página está no ar! 🚀", {
        description: "Redirecionando para o dashboard...",
        duration: 3000,
      });

      setTimeout(() => {
        router.push("/dashboard?welcome=true");
      }, 2000);

    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Erro ao criar página. Tente novamente.");
      setLoading(false);
    }
  };

  // Voltar step
  const goBack = () => {
    const stepOrder: Step[] = ["niche", "username", "profile", "links", "style"];
    const currentIndex = stepOrder.indexOf(step);
    if (currentIndex > 0) {
      setStep(stepOrder[currentIndex - 1]);
    }
  };

  // Step info
  const stepInfo: Record<Step, { num: number; total: number; color: string; gradient: string }> = {
    niche: { num: 1, total: 5, color: "amber", gradient: "from-amber-500 to-orange-500" },
    username: { num: 2, total: 5, color: "blue", gradient: "from-blue-500 to-cyan-500" },
    profile: { num: 3, total: 5, color: "orange", gradient: "from-orange-500 to-red-500" },
    links: { num: 4, total: 5, color: "purple", gradient: "from-purple-500 to-pink-500" },
    style: { num: 5, total: 5, color: "emerald", gradient: "from-emerald-500 to-teal-500" },
  };

  const currentStepInfo = stepInfo[step];

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <>
      <div className="min-h-screen bg-white flex flex-col lg:flex-row overflow-hidden">

        {/* ================================================================
            PAINEL ESQUERDO - WIZARD
        ================================================================ */}
        <div className="w-full lg:w-[55%] xl:w-[50%] min-h-screen flex flex-col relative z-10 bg-white">

          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#f8f8f8_1px,transparent_1px),linear-gradient(to_bottom,#f8f8f8_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-60" />
          <div className="absolute top-0 right-0 w-72 h-72 sm:w-96 sm:h-96 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full blur-3xl opacity-40 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-72 h-72 sm:w-96 sm:h-96 bg-gradient-to-tr from-blue-100 to-cyan-100 rounded-full blur-3xl opacity-40 translate-y-1/2 -translate-x-1/2" />

          {/* Header */}
          <div className="relative p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">

              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 sm:gap-3"
              >
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <span className="text-slate-900 font-bold text-base sm:text-lg">Freelinnk</span>
                  {selectedNiche && (
                    <p className="text-slate-400 text-[10px] sm:text-xs flex items-center gap-1">
                      <span>{selectedNiche.emoji}</span>
                      <span className="hidden sm:inline">{selectedNiche.name}</span>
                    </p>
                  )}
                </div>
              </motion.div>

              {/* Progress Dots */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-1.5 sm:gap-2"
              >
                {[1, 2, 3, 4, 5].map((num) => {
                  const isActive = currentStepInfo.num === num;
                  const isPast = currentStepInfo.num > num;

                  return (
                    <div
                      key={num}
                      className={cn(
                        "h-2 rounded-full transition-all duration-300",
                        isActive
                          ? "w-6 sm:w-8 bg-gradient-to-r " + currentStepInfo.gradient
                          : isPast
                            ? "w-2 bg-emerald-500"
                            : "w-2 bg-slate-200"
                      )}
                    />
                  );
                })}
              </motion.div>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className={cn("h-full rounded-full bg-gradient-to-r", currentStepInfo.gradient)}
                initial={{ width: "0%" }}
                animate={{ width: `${(currentStepInfo.num / currentStepInfo.total) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="relative flex-1 flex items-start sm:items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className="w-full max-w-md">
              <AnimatePresence mode="wait">

                {/* ========================================
                    STEP 1: NICHO
                ======================================== */}
                {step === "niche" && (
                  <motion.div
                    key="niche"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5"
                  >
                    {/* Welcome Card */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                      className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 border border-purple-100"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg flex-shrink-0">
                          <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-1">
                            Ei, bem-vindo! 👋
                          </h3>
                          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                            Em <span className="font-semibold text-purple-600">2 minutinhos</span> você vai ter sua página de links pronta.
                            <span className="hidden sm:inline"> Vamos começar?</span>
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Título */}
                    <div className="space-y-2">
                      <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight"
                      >
                        O que você{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
                          faz?
                        </span>
                      </motion.h1>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-slate-500 text-sm sm:text-base"
                      >
                        Escolha sua área para personalizarmos tudo pra você ✨
                      </motion.p>
                    </div>

                    {/* Grid de Nichos */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 max-h-[50vh] sm:max-h-[55vh] overflow-y-auto pr-1 custom-scrollbar pb-2"
                    >
                      {NICHES.map((niche, index) => (
                        <motion.button
                          key={niche.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.4 + index * 0.02 }}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleNicheSelect(niche)}
                          className="relative p-3 sm:p-4 rounded-xl border-2 border-slate-100 hover:border-amber-300 hover:shadow-lg bg-white text-left group transition-all duration-200"
                        >
                          {/* Emoji + Icon */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl sm:text-2xl">{niche.emoji}</span>
                            <div className="p-1.5 rounded-lg bg-slate-50 group-hover:bg-amber-50 transition-colors text-slate-500 group-hover:text-amber-600">
                              {niche.icon}
                            </div>
                          </div>

                          {/* Nome e Descrição */}
                          <p className="text-slate-900 font-bold text-xs sm:text-sm mb-0.5 line-clamp-1">
                            {niche.name}
                          </p>
                          <p className="text-slate-400 text-[10px] sm:text-xs line-clamp-1">
                            {niche.description}
                          </p>

                          {/* Hover glow */}
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-500/0 to-orange-500/0 group-hover:from-amber-500/5 group-hover:to-orange-500/5 transition-all pointer-events-none" />
                        </motion.button>
                      ))}
                    </motion.div>
                  </motion.div>
                )}

                {/* ========================================
                    STEP 2: USERNAME
                ======================================== */}
                {step === "username" && (
                  <motion.div
                    key="username"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5"
                  >
                    {/* Mensagem Personalizada do Nicho */}
                    {selectedNiche && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100"
                      >
                        <div className="flex gap-3">
                          <span className="text-2xl flex-shrink-0">{selectedNiche.emoji}</span>
                          <p className="text-blue-800 text-xs sm:text-sm leading-relaxed">
                            {selectedNiche.welcomeMessage}
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* Badge */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.1 }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100"
                    >
                      <div className={cn("w-5 h-5 rounded-full bg-gradient-to-r flex items-center justify-center", currentStepInfo.gradient)}>
                        <LinkIcon className="w-2.5 h-2.5 text-white" />
                      </div>
                      <span className="text-blue-600 text-xs font-semibold">Passo 2 de 5</span>
                    </motion.div>

                    {/* Título */}
                    <div className="space-y-2">
                      <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight"
                      >
                        Escolha seu{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                          link
                        </span>
                      </motion.h1>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-slate-500 text-sm sm:text-base"
                      >
                        Este será o endereço da sua página 🔗
                      </motion.p>
                    </div>

                    {/* Input */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="space-y-3"
                    >
                      <div className="relative">
                        <div className="bg-slate-50 rounded-xl sm:rounded-2xl border-2 border-slate-200 focus-within:border-blue-500 transition-colors overflow-hidden">
                          <div className="flex items-center">
                            <span className="px-3 sm:px-4 py-3 sm:py-4 text-slate-400 font-medium text-xs sm:text-sm whitespace-nowrap border-r border-slate-200 bg-slate-100/50">
                              freelinnk.com/
                            </span>
                            <Input
                              className="flex-1 h-12 sm:h-14 bg-transparent border-0 text-slate-900 text-base sm:text-lg font-bold placeholder:text-slate-300 focus-visible:ring-0 px-3 sm:px-4"
                              placeholder="seu-nome"
                              value={preview.username}
                              onChange={(e) => setPreview({
                                ...preview,
                                username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 30)
                              })}
                              autoFocus
                            />
                            <div className="pr-3 sm:pr-4">
                              <AnimatePresence mode="wait">
                                {preview.username.length >= 3 && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    className={cn(
                                      "w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center",
                                      debouncedUsername !== preview.username
                                        ? "bg-slate-200"
                                        : checkAvailability?.available
                                          ? "bg-emerald-500"
                                          : checkAvailability === undefined
                                            ? "bg-slate-200"
                                            : "bg-red-500"
                                    )}
                                  >
                                    {debouncedUsername !== preview.username || checkAvailability === undefined ? (
                                      <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />
                                    ) : checkAvailability?.available ? (
                                      <Check className="w-4 h-4 text-white" />
                                    ) : (
                                      <X className="w-4 h-4 text-white" />
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
                        {preview.username.length >= 3 && debouncedUsername === preview.username && checkAvailability && (
                          <motion.div
                            initial={{ opacity: 0, y: -10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className={cn(
                              "flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm",
                              checkAvailability.available
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            )}
                          >
                            {checkAvailability.available ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                                <span className="font-medium text-xs sm:text-sm">Perfeito! Nome disponível 🎉</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span className="font-medium text-xs sm:text-sm">Nome já em uso. Tente outro!</span>
                              </>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    {/* Botão */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Button
                        onClick={handleUsernameSubmit}
                        disabled={!isUsernameValid || loading}
                        className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 border-0 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed group transition-all"
                      >
                        {loading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            Reservar nome
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
                      <span className="text-xs font-medium">Ver preview</span>
                    </button>
                  </motion.div>
                )}

                {/* ========================================
                    STEP 3: PROFILE (Foto + Bio)
                ======================================== */}
                {step === "profile" && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5"
                  >
                    {/* Tip */}
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100"
                    >
                      <div className="flex gap-2 sm:gap-3 items-center">
                        <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
                          <TrendingUp className="w-4 h-4 text-orange-600" />
                        </div>
                        <p className="text-orange-800 text-xs sm:text-sm font-medium">
                          💡 Páginas com foto têm <span className="font-bold">3x mais cliques!</span>
                        </p>
                      </div>
                    </motion.div>

                    {/* Badge */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.1 }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-100"
                    >
                      <div className={cn("w-5 h-5 rounded-full bg-gradient-to-r flex items-center justify-center", currentStepInfo.gradient)}>
                        <User className="w-2.5 h-2.5 text-white" />
                      </div>
                      <span className="text-orange-600 text-xs font-semibold">Passo 3 de 5</span>
                    </motion.div>

                    {/* Título */}
                    <div className="space-y-2">
                      <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight"
                      >
                        Quem é{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
                          você?
                        </span>
                      </motion.h1>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-slate-500 text-sm sm:text-base"
                      >
                        Foto e bio para personalizar sua página 📸
                      </motion.p>
                    </div>

                    {/* Upload Foto */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-200"
                    >
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => document.getElementById("photo-upload")?.click()}
                        className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-orange-100 to-red-100 border-2 border-dashed border-orange-300 flex items-center justify-center cursor-pointer hover:border-orange-500 transition-colors overflow-hidden group flex-shrink-0"
                      >
                        {preview.imagePreview ? (
                          <>
                            <img src={preview.imagePreview} className="w-full h-full object-cover" alt="" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Camera className="w-5 h-5 text-white" />
                            </div>
                          </>
                        ) : (
                          <Camera className="w-6 h-6 sm:w-7 sm:h-7 text-orange-400 group-hover:scale-110 transition-transform" />
                        )}
                        <input
                          id="photo-upload"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageSelect}
                        />
                      </motion.div>

                      <div className="flex-1 min-w-0">
                        <p className="text-slate-900 font-semibold text-sm sm:text-base mb-0.5">Foto de Perfil</p>
                        <p className="text-slate-500 text-xs sm:text-sm">
                          {preview.imagePreview ? "Toque para trocar" : "Toque para adicionar"}
                        </p>
                        <p className="text-orange-500 text-[10px] sm:text-xs mt-1 font-medium">
                          Opcional, mas recomendado ⚡
                        </p>
                      </div>
                    </motion.div>

                    {/* Bio */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <Label className="text-slate-700 font-semibold text-sm">Sua Bio</Label>
                        <span className={cn(
                          "text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full",
                          preview.bio.length === 0 ? "bg-slate-100 text-slate-400" :
                          preview.bio.length < 10 ? "bg-amber-100 text-amber-600" :
                          "bg-emerald-100 text-emerald-600"
                        )}>
                          {preview.bio.length}/160
                        </span>
                      </div>
                      <textarea
                        className="w-full h-20 sm:h-24 p-3 sm:p-4 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 placeholder:text-slate-400 resize-none focus:outline-none focus:border-orange-500 transition-colors text-sm"
                        placeholder={selectedNiche?.bioPlaceholder || "Conte um pouco sobre você..."}
                        value={preview.bio}
                        onChange={(e) => setPreview({ ...preview, bio: e.target.value.slice(0, 160) })}
                        maxLength={160}
                      />
                    </motion.div>

                    {/* Botão */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Button
                        onClick={handleProfileSubmit}
                        className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold rounded-xl sm:rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 border-0 shadow-lg shadow-orange-500/25 group transition-all"
                      >
                        {!preview.imagePreview && !preview.bio ? "Pular por agora" : "Continuar"}
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </motion.div>

                    {/* Preview Mobile */}
                    <button
                      onClick={() => setShowMobilePreview(true)}
                      className="lg:hidden w-full flex items-center justify-center gap-2 py-2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-xs font-medium">Ver preview</span>
                    </button>
                  </motion.div>
                )}

                {/* ========================================
                    STEP 4: LINKS
                ======================================== */}
                {step === "links" && (
                  <motion.div
                    key="links"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {/* Dica Contextual */}
                    {selectedNiche && preview.links.length === 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100"
                      >
                        <div className="flex gap-2 sm:gap-3 items-start">
                          <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg flex-shrink-0">
                            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-purple-800 text-xs sm:text-sm font-medium mb-1.5">
                              💡 Links populares para {selectedNiche.name}:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {selectedNiche.suggestedLinks.map((link) => (
                                <span key={link} className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] sm:text-xs rounded-full font-medium">
                                  {link}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Badge */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.1 }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-100"
                    >
                      <div className={cn("w-5 h-5 rounded-full bg-gradient-to-r flex items-center justify-center", currentStepInfo.gradient)}>
                        <LinkIcon className="w-2.5 h-2.5 text-white" />
                      </div>
                      <span className="text-purple-600 text-xs font-semibold">Passo 4 de 5</span>
                    </motion.div>

                    {/* Título */}
                    <div className="space-y-1.5">
                      <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight"
                      >
                        Seus{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
                          links
                        </span>
                      </motion.h1>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-slate-500 text-sm"
                      >
                        Adicione os links que vão aparecer na sua página 🔗
                      </motion.p>
                    </div>

                    {/* Lista de Links */}
                    {preview.links.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-2 max-h-[140px] sm:max-h-[160px] overflow-y-auto pr-1 custom-scrollbar"
                      >
                        <AnimatePresence>
                          {preview.links.map((link, index) => (
                            <motion.div
                              key={link.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ delay: index * 0.05 }}
                              className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200 group hover:border-purple-300 transition-colors"
                            >
                              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white flex-shrink-0 shadow overflow-hidden">
                                {link.iconPreview ? (
                                  <img src={link.iconPreview} className="w-full h-full object-cover" alt="" />
                                ) : (
                                  getLinkIcon(link.url, link.title)
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-slate-900 font-semibold truncate text-xs sm:text-sm">{link.title}</p>
                                <p className="text-slate-400 text-[10px] sm:text-xs truncate">{link.url}</p>
                              </div>
                              <button
                                onClick={() => removeLink(link.id)}
                                className="p-1.5 sm:p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                              >
                                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </motion.div>
                    )}

                    {/* Formulário Novo Link */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="space-y-2.5 p-3 sm:p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Plus className="w-3.5 h-3.5 text-purple-500" />
                          <span className="text-xs sm:text-sm font-semibold text-purple-700">Novo link</span>
                        </div>

                        {/* Botão Ícone Personalizado */}
                        <button
                          type="button"
                          onClick={() => linkIconInputRef.current?.click()}
                          className={cn(
                            "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] sm:text-xs font-medium transition-all",
                            newLinkIconPreview
                              ? "bg-purple-100 text-purple-700 border border-purple-300"
                              : "bg-white text-slate-500 hover:text-purple-600 border border-slate-200"
                          )}
                        >
                          {newLinkIconPreview ? (
                            <>
                              <img src={newLinkIconPreview} className="w-3.5 h-3.5 rounded object-cover" alt="" />
                              <span>Ícone</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setNewLinkIconFile(null);
                                  setNewLinkIconPreview(null);
                                }}
                                className="ml-0.5 hover:text-red-500"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3 h-3" />
                              <span>Ícone</span>
                            </>
                          )}
                        </button>
                        <input
                          ref={linkIconInputRef}
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleLinkIconSelect}
                        />
                      </div>

                      <Input
                        placeholder="Título (ex: Meu Instagram)"
                        className="h-10 sm:h-11 bg-white border-slate-200 rounded-lg sm:rounded-xl text-slate-900 placeholder:text-slate-400 focus-visible:ring-purple-500 text-sm"
                        value={newLink.title}
                        onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                      />
                      <Input
                        type="url"
                        inputMode="url"
                        placeholder="URL (ex: instagram.com/voce)"
                        className="h-10 sm:h-11 bg-white border-slate-200 rounded-lg sm:rounded-xl text-slate-900 placeholder:text-slate-400 focus-visible:ring-purple-500 text-sm"
                        value={newLink.url}
                        onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && addLink()}
                      />

                      {/* Preview do Link */}
                      {(newLink.title || newLink.url) && (
                        <div className="p-2 bg-white rounded-lg border border-purple-200">
                          <p className="text-[9px] text-slate-400 mb-1">Preview:</p>
                          <div className="flex items-center gap-2 p-2 bg-purple-600 rounded-lg">
                            <div className="w-5 h-5 rounded bg-white/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                              {newLinkIconPreview ? (
                                <img src={newLinkIconPreview} className="w-full h-full object-cover" alt="" />
                              ) : (
                                <span className="text-white">{getLinkIcon(newLink.url, newLink.title)}</span>
                              )}
                            </div>
                            <span className="text-white text-[10px] sm:text-xs font-medium truncate">
                              {newLink.title || "Título do link"}
                            </span>
                          </div>
                        </div>
                      )}

                      <Button
                        onClick={addLink}
                        disabled={newLink.title.length < 3 || newLink.url.length < 5}
                        className="w-full h-10 sm:h-11 rounded-lg sm:rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow disabled:opacity-50 text-sm"
                      >
                        <Plus className="w-4 h-4 mr-1.5" />
                        Adicionar
                      </Button>
                    </motion.div>

                    {/* Contador */}
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <LinkIcon className="w-3.5 h-3.5" />
                        <span>{preview.links.length} link{preview.links.length !== 1 && 's'}</span>
                      </div>
                      {preview.links.length === 0 && (
                        <span className="text-amber-600 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Mínimo 1 link
                        </span>
                      )}
                    </div>

                    {/* Botão Continuar */}
                    <Button
                      onClick={handleLinksSubmit}
                      disabled={!isLinksValid}
                      className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 border-0 shadow-lg shadow-purple-500/25 disabled:opacity-50 group transition-all"
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
                      <span className="text-xs font-medium">Ver preview</span>
                    </button>
                  </motion.div>
                )}

                {/* ========================================
                    STEP 5: STYLE (Temas)
                ======================================== */}
                {step === "style" && (
                  <motion.div
                    key="style"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {/* AI Recommendation */}
                    {selectedNiche && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100"
                      >
                        <div className="flex gap-2 sm:gap-3 items-center">
                          <div className="p-1.5 sm:p-2 bg-emerald-100 rounded-lg flex-shrink-0">
                            <Wand2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                          </div>
                          <p className="text-emerald-800 text-xs sm:text-sm font-medium">
                            🤖 Para <span className="font-bold">{selectedNiche.name}</span>, recomendo os temas com ⭐
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* Badge */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.1 }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100"
                    >
                      <div className={cn("w-5 h-5 rounded-full bg-gradient-to-r flex items-center justify-center", currentStepInfo.gradient)}>
                        <Palette className="w-2.5 h-2.5 text-white" />
                      </div>
                      <span className="text-emerald-600 text-xs font-semibold">Último passo! 🎉</span>
                    </motion.div>

                    {/* Título */}
                    <div className="space-y-1.5">
                      <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight"
                      >
                        Seu{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">
                          estilo
                        </span>
                      </motion.h1>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-slate-500 text-sm"
                      >
                        Escolha o visual da sua página ✨
                      </motion.p>
                    </div>

                    {/* Grid de Temas */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-2.5 max-h-[240px] sm:max-h-[280px] overflow-y-auto pr-1 custom-scrollbar pb-1"
                    >
                      {recommendedThemes.map((theme, index) => {
                        const isRecommended = selectedNiche && theme.forNiches?.includes(selectedNiche.id);
                        const isSelected = preview.selectedTheme.id === theme.id;

                        return (
                          <motion.button
                            key={theme.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 + index * 0.02 }}
                            whileHover={{ scale: 1.03, y: -1 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => {
                              setPreview({ ...preview, selectedTheme: theme });
                              celebrate('small');
                            }}
                            className={cn(
                              "relative p-2 sm:p-2.5 rounded-lg sm:rounded-xl border-2 transition-all",
                              isSelected
                                ? "border-slate-900 shadow-lg bg-slate-50"
                                : isRecommended
                                  ? "border-emerald-300 bg-emerald-50/50"
                                  : "border-slate-100 hover:border-slate-200 bg-white"
                            )}
                          >
                            {/* Badges */}
                            {isRecommended && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center z-10">
                                <Star className="w-2.5 h-2.5 text-white fill-white" />
                              </div>
                            )}

                            {/* Preview Box */}
                            <div className={cn("w-full h-8 sm:h-10 rounded-md bg-gradient-to-br mb-1.5", theme.preview)} />

                            {/* Button Preview */}
                            <div className={cn("w-full h-3.5 sm:h-4 rounded", theme.btn)} />

                            {/* Nome */}
                            <div className="flex items-center justify-center gap-0.5 mt-1.5">
                              <span className="text-sm">{theme.emoji}</span>
                              <span className="text-slate-700 text-[9px] sm:text-[10px] font-semibold truncate">
                                {theme.name}
                              </span>
                            </div>

                            {/* Selected Check */}
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-1 left-1 w-4 h-4 rounded-full bg-slate-900 flex items-center justify-center"
                              >
                                <Check className="w-2.5 h-2.5 text-white" />
                              </motion.div>
                            )}
                          </motion.button>
                        );
                      })}
                    </motion.div>

                    {/* Tema Selecionado */}
                    <div className="flex items-center justify-center gap-2 py-1 text-xs sm:text-sm text-slate-500">
                      <Palette className="w-3.5 h-3.5" />
                      <span>Tema: <strong className="text-slate-700">{preview.selectedTheme.emoji} {preview.selectedTheme.name}</strong></span>
                    </div>

                    {/* Botão Final */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Button
                        onClick={handleFinish}
                        disabled={loading}
                        className="w-full h-14 sm:h-16 text-lg sm:text-xl font-black rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 border-0 shadow-xl shadow-emerald-500/30 disabled:opacity-50 group relative overflow-hidden transition-all"
                      >
                        {loading ? (
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                            <span className="text-base sm:text-lg">Criando...</span>
                          </div>
                        ) : (
                          <>
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                              animate={{ x: ['-100%', '100%'] }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            />
                            <span className="relative flex items-center gap-2">
                              <Rocket className="w-5 h-5 sm:w-6 sm:h-6" />
                              Lançar Página!
                              <PartyPopper className="w-4 h-4 sm:w-5 sm:h-5" />
                            </span>
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
                      <span className="text-xs font-medium">Ver preview final</span>
                    </button>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>

          {/* Botão Voltar */}
          {step !== "niche" && (
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
                <span className="text-xs sm:text-sm font-medium">Voltar</span>
              </button>
            </motion.div>
          )}
        </div>

        {/* ================================================================
            PAINEL DIREITO - PREVIEW (Desktop)
        ================================================================ */}
        <div className="hidden lg:flex flex-1 items-center justify-center relative bg-slate-100 overflow-hidden">

          {/* Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:2rem_2rem]" />

          {/* Glow */}
          <motion.div
            className="absolute w-[400px] h-[400px] rounded-full blur-[120px] opacity-30"
            style={{ background: preview.selectedTheme.btnHex }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.35, 0.2]
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />

          {/* Celular */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            <PhonePreview preview={preview} niche={selectedNiche} />
          </motion.div>

          {/* Floating Elements */}
          <motion.div
            animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-16 right-16 p-2.5 rounded-xl bg-white shadow-lg border border-slate-200"
          >
            <Heart className="w-5 h-5 text-pink-500" />
          </motion.div>

          <motion.div
            animate={{ y: [0, 8, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
            className="absolute bottom-24 left-16 p-2.5 rounded-xl bg-white shadow-lg border border-slate-200"
          >
            <Star className="w-5 h-5 text-amber-500" />
          </motion.div>

          <motion.div
            animate={{ y: [0, -6, 0], rotate: [0, 8, 0] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
            className="absolute top-32 left-24 p-2.5 rounded-xl bg-white shadow-lg border border-slate-200"
          >
            <Sparkles className="w-5 h-5 text-purple-500" />
          </motion.div>

          <motion.div
            animate={{ y: [0, 6, 0], rotate: [0, -6, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, delay: 0.8 }}
            className="absolute bottom-32 right-24 p-2.5 rounded-xl bg-white shadow-lg border border-slate-200"
          >
            <Zap className="w-5 h-5 text-cyan-500" />
          </motion.div>

          {/* Nicho Badge */}
          {selectedNiche && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute top-6 right-6 p-3 rounded-xl bg-white/90 backdrop-blur-sm shadow-lg border border-slate-200"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{selectedNiche.emoji}</span>
                <div>
                  <p className="text-xs font-bold text-slate-900">{selectedNiche.name}</p>
                  <p className="text-[10px] text-slate-500">{selectedNiche.description}</p>
                </div>
              </div>
            </motion.div>
          )}
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
                className="absolute -top-10 right-0 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Title */}
              <div className="absolute -top-10 left-0 flex items-center gap-2 text-white">
                <Smartphone className="w-4 h-4" />
                <span className="text-sm font-medium">Preview</span>
              </div>

              {/* Phone */}
              <PhonePreview preview={preview} niche={selectedNiche} />

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