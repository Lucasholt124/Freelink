import React from "react";
import confetti from "canvas-confetti";
import {
  Briefcase,
  ShoppingBag,
  GraduationCap,
  Calendar,
  Utensils,
  Mail,
  Phone,
  MapPin
} from "lucide-react";
import {
  FaWhatsapp,
  FaInstagram,
  FaYoutube,
  FaTiktok,
  FaSpotify,
  FaLinkedin,
  FaGlobe
} from "react-icons/fa6";
import { ICON_MAP, PREVIEW_ICON_MAP } from "./onboarding-data";

export function getLinkIcon(url: string, title: string = ""): React.ReactNode {
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

export function getPreviewLinkIcon(url: string, title: string = "") {
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

export function celebrate(intensity: 'small' | 'medium' | 'epic' = 'medium') {
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