import React from "react";
import {
  Video,
  Users,
  Briefcase,
  Music,
  Code,
  Target,
  Utensils,
  Dumbbell,
  Scissors,
  Stethoscope,
  GraduationCap,
  ShoppingBag,
  Globe,
  Mail,
  Phone,
  Calendar,
  MapPin
} from "lucide-react";
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

export type Step = "welcome" | "name" | "niche" | "username" | "links" | "template" | "launching";

export interface LinkItem {
  id: string;
  title: string;
  url: string;
  iconFile?: File;
  iconPreview?: string;
}

export interface NicheOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  emoji: string;
  description: string;
  suggestedLinks: { title: string; placeholder: string; icon: React.ReactNode }[];
  gradient: string;
}

export interface TemplateOption {
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

export const HERO_PHRASES = [
  { text: "Crie sua presença digital", highlight: "em segundos" },
  { text: "Todos seus links", highlight: "em um só lugar" },
  { text: "Profissional, bonito e", highlight: "100% grátis" },
  { text: "Mais de 50.000 criadores", highlight: "já usam" },
];

export const SOCIAL_PROOF = [
  { name: "Maria S.", role: "Influenciadora", text: "Dobrei meus seguidores em 2 meses!", avatar: "👩" },
  { name: "João P.", role: "Empreendedor", text: "Meus clientes adoram a praticidade!", avatar: "👨" },
  { name: "Ana C.", role: "Artista", text: "Finalmente um link que representa meu trabalho!", avatar: "👩‍🎤" },
];

export const NICHES: NicheOption[] = [
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

export const TEMPLATES: TemplateOption[] = [
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

export const ICON_MAP: { match: string[]; icon: React.ReactNode }[] = [
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

export const PREVIEW_ICON_MAP = [
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