"use client";
import { api } from "@/convex/_generated/api";
import { Preloaded, useMutation, usePreloadedQuery, useQuery } from "convex/react";
import {
  User, Share2, Link as LinkIcon, Check, Heart, Sparkles, QrCode,
  Moon, Sun, Calendar, Download, ExternalLink, ChevronDown, Shield,
  Gem, Crown, Star, Zap, Cookie, MapPin, Mail, Phone, Video, Music,
  ShoppingBag, Cake
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { getBaseUrl } from "@/convex/lib/getBaseUrl";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { trackLinkClick } from "@/lib/analytics";
import confetti, { Shape } from 'canvas-confetti';
import {
  FaFacebook, FaGithub, FaGlobe, FaInstagram,
  FaLinkedin, FaTiktok, FaTwitter, FaYoutube,
  FaWhatsapp, FaWaze, FaTelegram, FaDiscord,
  FaPinterest, FaSnapchat, FaReddit, FaTwitch,
  FaSpotify, FaSoundcloud, FaAmazon, FaPaypal,
  FaPatreon, FaBehance, FaDribbble, FaMedium,
  FaGooglePlay, FaAppStore, FaUber
} from "react-icons/fa6";
import QRCode from 'qrcode';
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { SubscriptionPlanDetails } from "@/lib/subscription";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { usePerformanceMode } from "@/app/hooks/usePerformanceMode";

// ============================================================
// 🎊 SISTEMA DE DATAS COMEMORATIVAS INTELIGENTE
// ============================================================
interface HolidayConfig {
  name: string;
  emoji: string;
  colors: string[];
  particleShapes: Shape[];
  message: string;
  bgOverlay: string;
  floatingEmojis: string[];
  textAccent: string;
  confettiColors: string[];
  priority: number;
}

const HOLIDAYS: {
  month: number; day: number; range?: number;
  config: HolidayConfig;
}[] = [
  {
    month: 1, day: 1, range: 3,
    config: {
      name: "Ano Novo", emoji: "🎆", priority: 10,
      colors: ["#FFD700", "#FF6B00", "#FF0080"],
      particleShapes: ["circle", "square"],
      message: "✨ Feliz Ano Novo! Que {year} seja incrível!",
      bgOverlay: "radial-gradient(ellipse at top, rgba(255,215,0,0.15) 0%, transparent 70%)",
      floatingEmojis: ["🎆", "🎇", "🥂", "🎉", "⭐", "🌟", "✨"],
      textAccent: "#FFD700",
      confettiColors: ["#FFD700", "#FF6B00", "#FF0080", "#00FFFF", "#FFFFFF"],
    }
  },
  {
    month: 2, day: 14, range: 2,
    config: {
      name: "Dia dos Namorados BR / Valentine's Day", emoji: "💝", priority: 8,
      colors: ["#FF1493", "#FF69B4", "#FF0080"],
      particleShapes: ["circle"],
      message: "💕 Feliz Dia do Amor!",
      bgOverlay: "radial-gradient(ellipse at center, rgba(255,20,147,0.12) 0%, transparent 70%)",
      floatingEmojis: ["💝", "💖", "💗", "💓", "💘", "🌹", "💌"],
      textAccent: "#FF1493",
      confettiColors: ["#FF1493", "#FF69B4", "#FF0080", "#FFB6C1"],
    }
  },
  {
    month: 3, day: 8, range: 2,
    config: {
      name: "Dia Internacional da Mulher", emoji: "💜", priority: 9,
      colors: ["#9B59B6", "#E91E63", "#FF9800"],
      particleShapes: ["circle", "square"],
      message: "💜 Dia da Mulher — Força, amor e respeito!",
      bgOverlay: "radial-gradient(ellipse at top left, rgba(155,89,182,0.18) 0%, rgba(233,30,99,0.10) 50%, transparent 80%)",
      floatingEmojis: ["💜", "🌸", "✊", "🌺", "💐", "🦋", "⭐"],
      textAccent: "#9B59B6",
      confettiColors: ["#9B59B6", "#E91E63", "#FF9800", "#FFD700"],
    }
  },
  {
    month: 4, day: 1, range: 1,
    config: {
      name: "April Fools / Dia da Mentira", emoji: "🤡", priority: 4,
      colors: ["#FF6B35", "#FFD700", "#00E5FF"],
      particleShapes: ["circle", "square"],
      message: "🎪 Hoje é dia da mentira... ou não?",
      bgOverlay: "radial-gradient(ellipse at center, rgba(255,107,53,0.1) 0%, transparent 70%)",
      floatingEmojis: ["🤡", "🎭", "😂", "🎪", "🃏", "🎈", "❓"],
      textAccent: "#FF6B35",
      confettiColors: ["#FF6B35", "#FFD700", "#00E5FF", "#FF1493"],
    }
  },
  {
    month: 4, day: 22, range: 2,
    config: {
      name: "Dia da Terra", emoji: "🌍", priority: 6,
      colors: ["#2ECC71", "#27AE60", "#3498DB"],
      particleShapes: ["circle"],
      message: "🌱 Dia da Terra — Cuide do nosso lar!",
      bgOverlay: "radial-gradient(ellipse at center, rgba(46,204,113,0.12) 0%, transparent 70%)",
      floatingEmojis: ["🌍", "🌿", "🌱", "🍃", "♻️", "💚", "🌊"],
      textAccent: "#2ECC71",
      confettiColors: ["#2ECC71", "#27AE60", "#3498DB", "#00FF7F"],
    }
  },
  {
    month: 5, day: 12, range: 3,
    config: {
      name: "Dia das Mães", emoji: "🌷", priority: 9,
      colors: ["#FF6B9D", "#FF8E53", "#FFC0CB"],
      particleShapes: ["circle"],
      message: "🌷 Feliz Dia das Mães! Amor incondicional.",
      bgOverlay: "radial-gradient(ellipse at center, rgba(255,107,157,0.14) 0%, transparent 70%)",
      floatingEmojis: ["🌷", "💐", "💗", "🤱", "👩‍👦", "🌺", "💝"],
      textAccent: "#FF6B9D",
      confettiColors: ["#FF6B9D", "#FF8E53", "#FFC0CB", "#FFB6C1"],
    }
  },
  {
    month: 6, day: 12, range: 2,
    config: {
      name: "Dia dos Namorados", emoji: "💑", priority: 9,
      colors: ["#E91E63", "#FF5722", "#FF1744"],
      particleShapes: ["circle"],
      message: "💑 Feliz Dia dos Namorados! 💕",
      bgOverlay: "radial-gradient(ellipse at center, rgba(233,30,99,0.13) 0%, transparent 70%)",
      floatingEmojis: ["💑", "💕", "💋", "🌹", "💌", "💝", "🥂"],
      textAccent: "#E91E63",
      confettiColors: ["#E91E63", "#FF5722", "#FF1744", "#FF69B4"],
    }
  },
  {
    month: 6, day: 24, range: 4,
    config: {
      name: "Festa Junina", emoji: "🎪", priority: 7,
      colors: ["#FF6B00", "#FFD700", "#E91E63"],
      particleShapes: ["circle", "square"],
      message: "🎉 Arraiá! Feliz Festa Junina!",
      bgOverlay: "radial-gradient(ellipse at bottom, rgba(255,107,0,0.15) 0%, transparent 70%)",
      floatingEmojis: ["🎪", "🌽", "🎵", "🎆", "⭐", "🏮", "🎊"],
      textAccent: "#FF6B00",
      confettiColors: ["#FF6B00", "#FFD700", "#E91E63", "#228B22"],
    }
  },
  {
    month: 8, day: 12, range: 2,
    config: {
      name: "Dia dos Pais", emoji: "👨‍👦", priority: 9,
      colors: ["#1565C0", "#0D47A1", "#42A5F5"],
      particleShapes: ["circle"],
      message: "👨‍👦 Feliz Dia dos Pais! Orgulho e amor.",
      bgOverlay: "radial-gradient(ellipse at center, rgba(21,101,192,0.13) 0%, transparent 70%)",
      floatingEmojis: ["👨‍👦", "👔", "🏆", "💙", "⭐", "👑", "💪"],
      textAccent: "#42A5F5",
      confettiColors: ["#1565C0", "#42A5F5", "#FFD700", "#FFFFFF"],
    }
  },
  {
    month: 9, day: 7, range: 2,
    config: {
      name: "Independência do Brasil", emoji: "🇧🇷", priority: 7,
      colors: ["#009C3B", "#FFDF00", "#002776"],
      particleShapes: ["circle", "square"],
      message: "🇧🇷 Independência do Brasil!",
      bgOverlay: "radial-gradient(ellipse at center, rgba(0,156,59,0.12) 0%, transparent 70%)",
      floatingEmojis: ["🇧🇷", "🟢", "🟡", "⭐", "💚", "💛", "🔵"],
      textAccent: "#FFDF00",
      confettiColors: ["#009C3B", "#FFDF00", "#002776", "#FFFFFF"],
    }
  },
  {
    month: 10, day: 12, range: 2,
    config: {
      name: "Dia das Crianças", emoji: "🧸", priority: 8,
      colors: ["#FF6B35", "#FFD700", "#FF1493"],
      particleShapes: ["circle", "square"],
      message: "🧸 Feliz Dia das Crianças!",
      bgOverlay: "radial-gradient(ellipse at center, rgba(255,107,53,0.13) 0%, transparent 70%)",
      floatingEmojis: ["🧸", "🎈", "🍭", "🎠", "🌈", "🎪", "🎉"],
      textAccent: "#FF6B35",
      confettiColors: ["#FF6B35", "#FFD700", "#FF1493", "#00E5FF"],
    }
  },
  {
    month: 10, day: 31, range: 3,
    config: {
      name: "Halloween", emoji: "🎃", priority: 8,
      colors: ["#FF6B00", "#7B1FA2", "#1A1A2E"],
      particleShapes: ["circle", "square"],
      message: "🎃 Trick or Treat! Feliz Halloween!",
      bgOverlay: "radial-gradient(ellipse at top, rgba(255,107,0,0.18) 0%, rgba(123,31,162,0.12) 50%, transparent 80%)",
      floatingEmojis: ["🎃", "👻", "🦇", "🕷️", "🕸️", "🌙", "💀"],
      textAccent: "#FF6B00",
      confettiColors: ["#FF6B00", "#7B1FA2", "#FF1744", "#FFD700"],
    }
  },
  {
    month: 11, day: 15, range: 2,
    config: {
      name: "Proclamação da República", emoji: "🏛️", priority: 5,
      colors: ["#009C3B", "#FFDF00", "#002776"],
      particleShapes: ["circle"],
      message: "🏛️ Proclamação da República — 15 de Novembro",
      bgOverlay: "radial-gradient(ellipse at center, rgba(0,156,59,0.1) 0%, transparent 70%)",
      floatingEmojis: ["🇧🇷", "🏛️", "⭐", "🌟", "💚", "💛", "🔵"],
      textAccent: "#009C3B",
      confettiColors: ["#009C3B", "#FFDF00", "#002776"],
    }
  },
  {
    month: 11, day: 20, range: 2,
    config: {
      name: "Consciência Negra", emoji: "✊🏿", priority: 8,
      colors: ["#FFD700", "#CC0000", "#006400"],
      particleShapes: ["circle"],
      message: "✊🏿 Dia da Consciência Negra. Força, memória, luta.",
      bgOverlay: "radial-gradient(ellipse at center, rgba(255,215,0,0.13) 0%, transparent 70%)",
      floatingEmojis: ["✊🏿", "🌍", "⭐", "🔥", "💛", "❤️", "💚"],
      textAccent: "#FFD700",
      confettiColors: ["#FFD700", "#CC0000", "#006400", "#000000"],
    }
  },
  {
    month: 11, day: 29, range: 5,
    config: {
      name: "Black Friday", emoji: "🛍️", priority: 9,
      colors: ["#1A1A1A", "#FF1744", "#FFD700"],
      particleShapes: ["circle", "square"],
      message: "🛍️ BLACK FRIDAY — As melhores ofertas estão aqui!",
      bgOverlay: "radial-gradient(ellipse at center, rgba(255,23,68,0.15) 0%, transparent 70%)",
      floatingEmojis: ["🛍️", "💸", "🔥", "⚡", "💰", "🏷️", "🎁"],
      textAccent: "#FF1744",
      confettiColors: ["#FF1744", "#FFD700", "#FF6B00", "#FFFFFF"],
    }
  },
  {
    month: 12, day: 25, range: 7,
    config: {
      name: "Natal", emoji: "🎄", priority: 10,
      colors: ["#C62828", "#2E7D32", "#FFD700"],
      particleShapes: ["circle", "square"],
      message: "🎄 Feliz Natal! Paz, amor e alegria.",
      bgOverlay: "radial-gradient(ellipse at top, rgba(46,125,50,0.15) 0%, rgba(198,40,40,0.10) 50%, transparent 80%)",
      floatingEmojis: ["🎄", "⭐", "🎁", "🔔", "🦌", "🎅", "❄️"],
      textAccent: "#C62828",
      confettiColors: ["#C62828", "#2E7D32", "#FFD700", "#FFFFFF"],
    }
  },
  {
    month: 12, day: 31, range: 2,
    config: {
      name: "Réveillon", emoji: "🎆", priority: 10,
      colors: ["#FFD700", "#FF6B00", "#FF0080"],
      particleShapes: ["circle"],
      message: "🎆 Feliz Réveillon! Até ano que vem!",
      bgOverlay: "radial-gradient(ellipse at top, rgba(255,215,0,0.18) 0%, transparent 70%)",
      floatingEmojis: ["🎆", "🎇", "🥂", "🎉", "⭐", "🌟", "✨"],
      textAccent: "#FFD700",
      confettiColors: ["#FFD700", "#FF6B00", "#FF0080", "#00FFFF"],
    }
  },
];

function getCurrentHoliday(): HolidayConfig | null {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const year = now.getFullYear();

  let best: { config: HolidayConfig; distance: number } | null = null;

  for (const h of HOLIDAYS) {
    const hDate = new Date(year, h.month - 1, h.day);
    const todayDate = new Date(year, month - 1, day);
    const diffMs = hDate.getTime() - todayDate.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    const range = h.range || 2;

    // Dentro do range (antes ou no dia)
    if (diffDays >= -1 && diffDays <= range) {
      const distance = Math.abs(diffDays);
      if (!best || h.config.priority > best.config.priority || (h.config.priority === best.config.priority && distance < best.distance)) {
        const config = {
          ...h.config,
          message: h.config.message.replace("{year}", String(year + 1)),
        };
        best = { config, distance };
      }
    }
  }
  return best?.config || null;
}

// ============================================================
// 🎨 SISTEMA DE CORES INTELIGENTE
// ============================================================
function getSmartColors(username: string, accentColor: string) {
  // Converte hex para HSL para manipulação inteligente
  const hexToHsl = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})/i.exec(hex);
    if (!result) return [250, 80, 60];
    const r = parseInt(result[1], 16) / 255;
    const g = parseInt(result[2], 16) / 255;
    const b = parseInt(result[3], 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  };

  const hslToHex = (h: number, s: number, l: number): string => {
    s /= 100; l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * c).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const [h, s, l] = hexToHsl(accentColor);

  // Gera paleta harmônica que NUNCA conflita com o texto
  const bgL = l > 50 ? Math.min(l + 35, 96) : Math.max(l - 25, 8);
  const bgDarkL = l > 50 ? Math.max(l - 55, 5) : Math.max(l - 30, 5);

  // Determina se o fundo é claro ou escuro para ajustar texto automaticamente
  const bgColor = hslToHex(h, Math.max(s - 20, 10), bgL);
  const bgDarkColor = hslToHex(h, Math.max(s - 10, 15), bgDarkL);

  // Cor do texto oposta ao fundo
  const textOnLight = l > 60 ? hslToHex(h, Math.min(s + 10, 80), 15) : hslToHex(h, 10, 10);
  const textOnDark = l < 40 ? hslToHex(h, Math.max(s - 20, 10), 90) : "#f0f0f0";

  // Cor do nome que sempre é legível
  const nameLightBg = l > 70 ? hslToHex(h, Math.min(s + 15, 90), Math.max(l - 40, 20)) : accentColor;
  const nameDarkBg = l < 30 ? hslToHex(h, Math.max(s - 10, 40), Math.min(l + 50, 85)) : hslToHex(h, Math.max(s - 20, 30), Math.min(l + 40, 80));

  // Gradiente de fundo nunca conflita com accent
  const grad1 = hslToHex(h, Math.max(s - 25, 5), bgL);
  const grad2 = hslToHex((h + 30) % 360, Math.max(s - 30, 5), Math.min(bgL + 5, 97));

  return {
    bgLight: bgColor,
    bgDark: bgDarkColor,
    textOnLight,
    textOnDark,
    nameColorLight: nameLightBg,
    nameColorDark: nameDarkBg,
    gradLight1: grad1,
    gradLight2: grad2,
    gradDark1: hslToHex(h, Math.max(s - 10, 15), bgDarkL),
    gradDark2: hslToHex((h + 30) % 360, Math.max(s - 15, 10), Math.max(bgDarkL + 8, 8)),
  };
}

// ============================================================
// 🎭 FLOATING EMOJIS COMPONENT
// ============================================================
function FloatingEmojis({ emojis, count = 12 }: { emojis: string[]; count?: number }) {
  const items = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      emoji: emojis[i % emojis.length],
      x: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 6 + Math.random() * 8,
      size: 16 + Math.random() * 20,
      rotation: Math.random() * 360,
    }));
  }, [emojis, count]);

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {items.map((item) => (
        <motion.div
          key={item.id}
          className="absolute select-none"
          style={{
            left: `${item.x}%`,
            bottom: "-60px",
            fontSize: `${item.size}px`,
            rotate: item.rotation,
          }}
          animate={{
            y: [0, -(window?.innerHeight || 800) - 80],
            rotate: [item.rotation, item.rotation + 180, item.rotation + 360],
            opacity: [0, 0.8, 0.8, 0],
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {item.emoji}
        </motion.div>
      ))}
    </div>
  );
}

// ============================================================
// 🎊 HOLIDAY BANNER
// ============================================================
function HolidayBanner({ holiday, accentColor }: { holiday: HolidayConfig; accentColor: string }) {
  const [visible, setVisible] = useState(true);
  const [popped, setPopped] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!popped) {
        confetti({
          particleCount: 120,
          spread: 100,
          origin: { y: 0.3 },
          colors: holiday.confettiColors,
          shapes: holiday.particleShapes,
          gravity: 0.8,
        });
        setPopped(true);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [holiday, popped]);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20, delay: 1.5 }}
      className="fixed top-0 left-0 right-0 z-[100] overflow-hidden"
      style={{ maxHeight: "60px" }}
    >
      <div
        className="relative flex items-center justify-center gap-2 py-2.5 px-4 text-white text-xs sm:text-sm font-bold"
        style={{
          background: `linear-gradient(90deg, ${holiday.colors[0]}, ${holiday.colors[1] || holiday.colors[0]}, ${holiday.colors[2] || holiday.colors[0]})`,
          backgroundSize: "200% 100%",
          borderBottom: `2px solid ${accentColor}`,
        }}
      >
        {/* Shimmer */}
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)" }}
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
        />
        <motion.span
          animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-lg relative z-10"
        >
          {holiday.emoji}
        </motion.span>
        <span className="relative z-10 text-center">{holiday.message}</span>
        <button
          onClick={() => setVisible(false)}
          className="relative z-10 ml-2 opacity-70 hover:opacity-100 transition-opacity text-white font-bold"
        >
          ×
        </button>
      </div>
    </motion.div>
  );
}

// ============================================================
// 🌟 ICON MAP (inalterado, apenas organizando)
// ============================================================
const ICON_MAP = [
  { match: ['google.com/maps', 'goo.gl/maps', 'maps.google', 'maps.app.goo.gl'], icon: <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#EA4335]" /> },
  { match: ['waze.com', 'waze.to'], icon: <FaWaze className="w-4 h-4 sm:w-5 sm:h-5 text-[#33CCFF]" /> },
  { match: ['maps.apple.com'], icon: <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#8E8E93]" /> },
  { match: ['uber.com'], icon: <FaUber className="w-4 h-4 sm:w-5 sm:h-5 text-black" /> },
  { match: ['99app', '99taxi'], icon: <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFCC00]" /> },
  { match: ['whatsapp', 'wa.me', 'api.whatsapp'], icon: <FaWhatsapp className="w-4 h-4 sm:w-5 sm:h-5 text-[#25D366]" /> },
  { match: ['t.me', 'telegram'], icon: <FaTelegram className="w-4 h-4 sm:w-5 sm:h-5 text-[#0088cc]" /> },
  { match: ['discord.com', 'discord.gg'], icon: <FaDiscord className="w-4 h-4 sm:w-5 sm:h-5 text-[#5865F2]" /> },
  { match: ['mailto:'], icon: <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-[#EA4335]" /> },
  { match: ['tel:', 'callto:'], icon: <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-[#34A853]" /> },
  { match: ['skype.com', 'skype:'], icon: <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-[#00AFF0]" /> },
  { match: ['zoom.us', 'zoom.com'], icon: <Video className="w-4 h-4 sm:w-5 sm:h-5 text-[#2D8CFF]" /> },
  { match: ['meet.google', 'hangouts'], icon: <Video className="w-4 h-4 sm:w-5 sm:h-5 text-[#00897B]" /> },
  { match: ['teams.microsoft', 'teams.live'], icon: <Video className="w-4 h-4 sm:w-5 sm:h-5 text-[#6264A7]" /> },
  { match: ['instagram.com', 'instagr.am'], icon: <FaInstagram className="w-4 h-4 sm:w-5 sm:h-5 text-[#E1306C]" /> },
  { match: ['facebook.com', 'fb.com', 'fb.me'], icon: <FaFacebook className="w-4 h-4 sm:w-5 sm:h-5 text-[#1877F3]" /> },
  { match: ['twitter.com', 'x.com', 't.co'], icon: <FaTwitter className="w-4 h-4 sm:w-5 sm:h-5 text-[#1DA1F2]" /> },
  { match: ['linkedin.com', 'lnkd.in'], icon: <FaLinkedin className="w-4 h-4 sm:w-5 sm:h-5 text-[#0077B5]" /> },
  { match: ['tiktok.com', 'vm.tiktok'], icon: <FaTiktok className="w-4 h-4 sm:w-5 sm:h-5 text-[#000000] dark:text-white" /> },
  { match: ['pinterest.com', 'pin.it'], icon: <FaPinterest className="w-4 h-4 sm:w-5 sm:h-5 text-[#E60023]" /> },
  { match: ['snapchat.com'], icon: <FaSnapchat className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFFC00]" /> },
  { match: ['reddit.com', 'redd.it'], icon: <FaReddit className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF4500]" /> },
  { match: ['threads.net'], icon: <FaInstagram className="w-4 h-4 sm:w-5 sm:h-5 text-[#000000] dark:text-white" /> },
  { match: ['bsky.app', 'bluesky'], icon: <FaTwitter className="w-4 h-4 sm:w-5 sm:h-5 text-[#0085FF]" /> },
  { match: ['youtube.com', 'youtu.be', 'youtube.com/@'], icon: <FaYoutube className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF0000]" /> },
  { match: ['twitch.tv'], icon: <FaTwitch className="w-4 h-4 sm:w-5 sm:h-5 text-[#9146FF]" /> },
  { match: ['netflix.com'], icon: <Video className="w-4 h-4 sm:w-5 sm:h-5 text-[#E50914]" /> },
  { match: ['primevideo', 'amazon.com/prime'], icon: <Video className="w-4 h-4 sm:w-5 sm:h-5 text-[#00A8E1]" /> },
  { match: ['disneyplus', 'disney.com'], icon: <Video className="w-4 h-4 sm:w-5 sm:h-5 text-[#113CCF]" /> },
  { match: ['hbomax', 'max.com'], icon: <Video className="w-4 h-4 sm:w-5 sm:h-5 text-[#B535F6]" /> },
  { match: ['vimeo.com'], icon: <Video className="w-4 h-4 sm:w-5 sm:h-5 text-[#1AB7EA]" /> },
  { match: ['spotify.com', 'open.spotify'], icon: <FaSpotify className="w-4 h-4 sm:w-5 sm:h-5 text-[#1DB954]" /> },
  { match: ['soundcloud.com'], icon: <FaSoundcloud className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF5500]" /> },
  { match: ['music.apple.com', 'itunes.apple'], icon: <Music className="w-4 h-4 sm:w-5 sm:h-5 text-[#FA243C]" /> },
  { match: ['deezer.com'], icon: <Music className="w-4 h-4 sm:w-5 sm:h-5 text-[#FEAA2D]" /> },
  { match: ['tidal.com'], icon: <Music className="w-4 h-4 sm:w-5 sm:h-5 text-[#000000] dark:text-white" /> },
  { match: ['music.youtube', 'youtubemusic'], icon: <Music className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF0000]" /> },
  { match: ['podcasts.apple', 'podcasts.google', 'anchor.fm', 'spreaker', 'podbean'], icon: <Music className="w-4 h-4 sm:w-5 sm:h-5 text-[#8940FA]" /> },
  { match: ['amazon.', 'amzn.to'], icon: <FaAmazon className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF9900]" /> },
  { match: ['shopee.'], icon: <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-[#EE4D2D]" /> },
  { match: ['shein.'], icon: <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-[#000000] dark:text-white" /> },
  { match: ['mercadolivre.', 'mercadopago.', 'mercadolibre'], icon: <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFE600]" /> },
  { match: ['paypal.com', 'paypal.me'], icon: <FaPaypal className="w-4 h-4 sm:w-5 sm:h-5 text-[#003087]" /> },
  { match: ['patreon.com'], icon: <FaPatreon className="w-4 h-4 sm:w-5 sm:h-5 text-[#F96854]" /> },
  { match: ['pix', 'nubank', 'picpay', 'pagseguro'], icon: <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-[#32BCAD]" /> },
  { match: ['ifood'], icon: <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-[#EA1D2C]" /> },
  { match: ['rappi'], icon: <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF441F]" /> },
  { match: ['magalu', 'magazineluiza'], icon: <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-[#0086FF]" /> },
  { match: ['aliexpress'], icon: <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-[#E62E04]" /> },
  { match: ['etsy.com'], icon: <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-[#F56400]" /> },
  { match: ['ebay.com'], icon: <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-[#E53238]" /> },
  { match: ['hotmart', 'eduzz', 'monetizze', 'kiwify', 'braip'], icon: <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-[#F04E23]" /> },
  { match: ['gumroad'], icon: <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF90E8]" /> },
  { match: ['ko-fi', 'buymeacoffee', 'apoia.se'], icon: <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF5E5B]" /> },
  { match: ['github.com', 'github.io'], icon: <FaGithub className="w-4 h-4 sm:w-5 sm:h-5 text-[#181717] dark:text-white" /> },
  { match: ['gitlab.com'], icon: <FaGithub className="w-4 h-4 sm:w-5 sm:h-5 text-[#FC6D26]" /> },
  { match: ['behance.net'], icon: <FaBehance className="w-4 h-4 sm:w-5 sm:h-5 text-[#1769FF]" /> },
  { match: ['dribbble.com'], icon: <FaDribbble className="w-4 h-4 sm:w-5 sm:h-5 text-[#EA4C89]" /> },
  { match: ['figma.com'], icon: <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#F24E1E]" /> },
  { match: ['medium.com'], icon: <FaMedium className="w-4 h-4 sm:w-5 sm:h-5 text-[#000000] dark:text-white" /> },
  { match: ['substack.com'], icon: <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF6719]" /> },
  { match: ['notion.so', 'notion.site'], icon: <FaGithub className="w-4 h-4 sm:w-5 sm:h-5 text-[#000000] dark:text-white" /> },
  { match: ['canva.com'], icon: <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#00C4CC]" /> },
  { match: ['play.google.com'], icon: <FaGooglePlay className="w-4 h-4 sm:w-5 sm:h-5 text-[#3BCCFF]" /> },
  { match: ['apps.apple.com'], icon: <FaAppStore className="w-4 h-4 sm:w-5 sm:h-5 text-[#0D96F6]" /> },
  { match: ['calendly.com'], icon: <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#006BFF]" /> },
  { match: ['cal.com'], icon: <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#292929] dark:text-white" /> },
  { match: ['eventbrite.com'], icon: <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#F05537]" /> },
  { match: ['sympla.com.br'], icon: <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#52BE80]" /> },
  { match: ['udemy.com'], icon: <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#A435F0]" /> },
  { match: ['coursera.org'], icon: <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#0056D2]" /> },
  { match: ['alura.com.br'], icon: <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#0066CC]" /> },
  { match: ['drive.google', 'docs.google', 'sheets.google', 'slides.google'], icon: <FaGlobe className="w-4 h-4 sm:w-5 sm:h-5 text-[#4285F4]" /> },
  { match: ['dropbox.com'], icon: <FaGlobe className="w-4 h-4 sm:w-5 sm:h-5 text-[#0061FF]" /> },
  { match: ['bit.ly', 'tinyurl', 'short.io'], icon: <LinkIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#EE6123]" /> },
  { match: ['bday', 'birthday', 'aniversario', 'festa'], icon: <Cake className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF0080]" /> },
];

function getLinkIcon(url: string, title: string): React.ReactNode {
  if (!url) return <LinkIcon className="w-4 h-4 sm:w-5 sm:h-5" />;
  const u = url.toLowerCase();
  const t = (title || "").toLowerCase();

  for (const item of ICON_MAP) {
    if (item.match.some(match => u.includes(match))) return item.icon;
  }

  const titleKeywords: Record<string, React.ReactNode> = {
    'ceo': <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />,
    'fundador': <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />,
    'founder': <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />,
    'diretor': <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />,
    'gerente': <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />,
    'comprar': <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />,
    'compre': <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />,
    'loja': <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />,
    'store': <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />,
    'cardápio': <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />,
    'menu': <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />,
    'delivery': <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />,
    'doar': <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />,
    'apoie': <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />,
    'pix': <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-teal-500" />,
    'endereço': <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />,
    'localização': <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />,
    'mapa': <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />,
    'agendar': <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />,
    'agenda': <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />,
    'podcast': <Music className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />,
    'música': <Music className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />,
    'vídeo': <Video className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />,
    'live': <Video className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />,
    'currículo': <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />,
    'portfolio': <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />,
    'portfólio': <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />,
    'curso': <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />,
    'download': <Download className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />,
    'newsletter': <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />,
    'promoção': <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />,
    'oferta': <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />,
    'black friday': <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900 dark:text-white" />,
    'aniversário': <Cake className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />,
    'birthday': <Cake className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />,
    'casamento': <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />,
    'festa': <Cake className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />,
  };

  for (const [keyword, icon] of Object.entries(titleKeywords)) {
    if (t.includes(keyword)) return icon;
  }

  if (u.includes('map') || u.includes('rua') || u.includes('avenida') || u.includes('local'))
    return <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#EA4335]" />;
  if (u.includes('contato') || u.includes('fale') || u.includes('contact'))
    return <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-[#EA4335]" />;
  if (u.includes('agenda') || u.includes('booking') || u.includes('schedule'))
    return <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#3b82f6]" />;

  return <FaGlobe className="w-4 h-4 sm:w-5 sm:h-5 text-[#6366f1]" />;
}

// ============================================================
// 🔥 PARTICLE FIELD
// ============================================================
interface Particle {
  x: number; y: number; vx: number; vy: number;
  size: number; opacity: number; color: string;
}

interface ConfettiOptions {
  spread?: number; startVelocity?: number; decay?: number;
  scalar?: number; particleCount?: number;
  origin?: { y: number; x?: number };
  colors?: string[]; shapes?: Shape[];
  gravity?: number;
}

function ParticleField({ color = "rgba(147, 51, 234, 0.4)" }: { color?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;
    const isLowEnd = navigator.hardwareConcurrency ? navigator.hardwareConcurrency < 4 : false;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = [];
    const particleCount = isMobile ? (isLowEnd ? 15 : 25) : (isLowEnd ? 50 : 80);
    const colors = [color, color.replace('0.4', '0.6'), color.replace('0.4', '0.3')];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * (isMobile ? 1.5 : 2.5) + 0.5,
        opacity: Math.random() * 0.4 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    let mouseX = -100, mouseY = -100, isMouseActive = false;
    const handleMouseMove = (e: MouseEvent) => { mouseX = e.clientX; mouseY = e.clientY; isMouseActive = true; };
    const handleTouchMove = (e: TouchEvent) => { if (e.touches[0]) { mouseX = e.touches[0].clientX; mouseY = e.touches[0].clientY; isMouseActive = true; } };
    const handleMouseLeave = () => { isMouseActive = false; };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTimeRef.current;
      if (deltaTime < 16.67) { frameRef.current = requestAnimationFrame(animate); return; }
      lastTimeRef.current = currentTime;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, i) => {
        particle.x += particle.vx; particle.y += particle.vy;
        if (isMouseActive) {
          const dx = mouseX - particle.x, dy = mouseY - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 150) {
            const force = (150 - distance) / 150;
            particle.vx += (dx / distance) * force * 0.03;
            particle.vy += (dy / distance) * force * 0.03;
          }
        }
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        particle.vx *= 0.98; particle.vy *= 0.98;
        ctx.shadowBlur = 15; ctx.shadowColor = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color.replace(/[\d.]+\)$/g, `${particle.opacity})`);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (!isMobile) {
          for (let j = i + 1; j < particles.length; j++) {
            const other = particles[j];
            const dx = other.x - particle.x, dy = other.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 100) {
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(other.x, other.y);
              ctx.strokeStyle = particle.color.replace(/[\d.]+\)$/g, `${(1 - distance / 100) * 0.15})`);
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      });
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);

    const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [color]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" style={{ opacity: 0.5 }} />;
}

// ============================================================
// 🏅 VERIFIED BADGE
// ============================================================
function VerifiedBadge({ size = "default", plan = "free" }: { size?: "default" | "large"; plan?: string }) {
  const sizeClasses = size === "large" ? "w-7 h-7 sm:w-8 sm:h-8" : "w-5 h-5 sm:w-6 sm:h-6";

  const getBadgeConfig = () => {
    switch (plan) {
      case 'ultra': return { gradient: 'from-[#0095F6] to-[#0095F6]', icon: <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white stroke-[3]" />, glow: 'shadow-[0_0_20px_rgba(0,149,246,0.8)]', isUltra: true };
      case 'premium': return { gradient: 'from-purple-500 via-pink-500 to-purple-600', icon: <Star className="w-3 h-3 sm:w-4 sm:h-4 text-white" />, glow: 'shadow-[0_0_20px_rgba(168,85,247,0.6)]', isUltra: false };
      case 'pro': return { gradient: 'from-blue-500 via-cyan-500 to-blue-600', icon: <Gem className="w-3 h-3 sm:w-4 sm:h-4 text-white" />, glow: 'shadow-[0_0_20px_rgba(59,130,246,0.6)]', isUltra: false };
      case 'business': return { gradient: 'from-yellow-500 via-orange-500 to-yellow-600', icon: <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-white" />, glow: 'shadow-[0_0_20px_rgba(234,179,8,0.6)]', isUltra: false };
      case 'enterprise': return { gradient: 'from-red-500 via-pink-500 to-red-600', icon: <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-white" />, glow: 'shadow-[0_0_20px_rgba(239,68,68,0.6)]', isUltra: false };
      default: return { gradient: 'from-gray-400 to-gray-600', icon: <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />, glow: '', isUltra: false };
    }
  };

  const config = getBadgeConfig();

  if (config.isUltra) {
    return (
      <motion.span
        className={`inline-flex items-center justify-center ${sizeClasses} rounded-full bg-[#0095F6] ${config.glow} transition-all duration-300 flex-shrink-0 relative`}
        title="Conta Verificada Ultra"
        whileHover={{ scale: 1.15 }}
        transition={{ duration: 0.2 }}
      >
        <motion.span className="absolute inset-0 rounded-full bg-[#0095F6]" animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />
        <span className="relative z-10 flex items-center justify-center"><Check className="w-4 h-4 sm:w-5 sm:h-5 text-white stroke-[3]" /></span>
      </motion.span>
    );
  }

  return (
    <motion.span
      className={`inline-flex items-center justify-center ${sizeClasses} rounded-full bg-gradient-to-r ${config.gradient} ${config.glow} transition-all duration-300 flex-shrink-0 relative overflow-hidden`}
      title={`Plano ${plan.charAt(0).toUpperCase() + plan.slice(1)}`}
      whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.2 }}
      transition={{ duration: 0.5 }}
    >
      <motion.span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" animate={{ x: ['-200%', '200%'] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
      <span className={`absolute inset-0 rounded-full bg-gradient-to-r ${config.gradient} blur-md opacity-50 animate-pulse`} />
      <span className="relative z-10">{config.icon}</span>
    </motion.span>
  );
}

// ============================================================
// 🎨 UNIQUE BRAND SIGNATURE — marca única por username
// ============================================================
function generateUserBrand(username: string): {
  initials: string;
  pattern: string;
  uniqueGlyph: string;
} {
  const clean = username.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const initials = clean.length >= 2 ? clean[0] + clean[clean.length - 1] : clean[0] || "?";

  // Padrão único baseado no nome
  const hash = username.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const patterns = [
    "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 60%)",
    "linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.1) 75%)",
    "radial-gradient(ellipse at 70% 70%, rgba(255,255,255,0.12) 0%, transparent 70%)",
    "repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 2px, transparent 2px, transparent 10px)",
    "conic-gradient(from 0deg at 50% 50%, rgba(255,255,255,0.1), transparent, rgba(255,255,255,0.1))",
  ];

  const glyphs = ["◆", "✦", "⬡", "◈", "✺", "⬢", "◉", "✷", "⌬", "◍"];

  return {
    initials,
    pattern: patterns[hash % patterns.length],
    uniqueGlyph: glyphs[hash % glyphs.length],
  };
}

// ============================================================
// 📋 INTERFACES
// ============================================================
interface BackgroundConfig {
  type: "color" | "gradient" | "image";
  style: "full" | "header";
  color1: string;
  color2: string;
  imageUrl: string;
  imageBlur: number;
  imageOpacity: number;
}

interface PublicPageContentProps {
  username: string;
  preloadedLinks: Preloaded<typeof api.lib.links.getLinksBySlug>;
  preloadedCustomizations: Preloaded<typeof api.lib.customizations.getCustomizationsBySlug>;
  plan: SubscriptionPlanDetails['plan'];
}

type LinkType = Doc<"links"> & { thumbnailUrl?: string };

// ============================================================
// 🚀 MAIN COMPONENT
// ============================================================
export default function PublicPageContent({
  username,
  preloadedLinks,
  preloadedCustomizations,
  plan,
}: PublicPageContentProps) {
  const customizations = usePreloadedQuery(preloadedCustomizations);
  const trackingSettings = useQuery(api.tracking.getIdsBySlug, { slug: username });
  const profileUrl = `${getBaseUrl()}/${username}`;
  const userAccentColor = customizations?.accentColor || '#6366f1';
  const performanceConfig = usePerformanceMode();

  // 🎊 Holiday detection
  const currentHoliday = useMemo(() => getCurrentHoliday(), []);

  // 🎨 Smart colors
  const smartColors = useMemo(() => getSmartColors(username, userAccentColor), [username, userAccentColor]);

  // 🏷️ User brand
  const userBrand = useMemo(() => generateUserBrand(username), [username]);

  const fullDescription = customizations?.description || "";
  let statusMessage = "";
  let displayBio = fullDescription;
  if (fullDescription.startsWith("AVISO:") || fullDescription.startsWith("STATUS:")) {
    const parts = fullDescription.split("\n");
    statusMessage = parts[0].replace(/^(AVISO:|STATUS:)\s*/i, "").trim();
    displayBio = parts.slice(1).join("\n").trim();
  }

  const [shared, setShared] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [linkReactions, setLinkReactions] = useState<Record<string, number>>({});
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [clickCounts, setClickCounts] = useState<Record<string, number>>({});
  const [joinDate] = useState<string>(customizations?._creationTime ? new Date(customizations._creationTime).getFullYear().toString() : "2026");
  const [backgroundConfig, setBackgroundConfig] = useState<BackgroundConfig>({
    type: "color", style: "full", color1: "#f3f4f6", color2: "#e5e7eb",
    imageUrl: "", imageBlur: 0, imageOpacity: 100,
  });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [cookieConsent, setCookieConsent] = useState<"granted" | "denied" | null>(null);
  const [holidayFired, setHolidayFired] = useState(false);
  const [publicAd, setPublicAd] = useState<{
    id: Id<"adCampaigns">;
    title: string;
    text: string;
    mediaUrls: string[];
    link: string;
  } | null>(null);
  const [adImageIndex, setAdImageIndex] = useState(0);
  const fetchAd = useMutation(api.ads.getAdForPublicPage);
  const registerAdClick = useMutation(api.ads.registerAdClick);

  const links = usePreloadedQuery(preloadedLinks);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const hexToRgba = useCallback((hex: string, alpha: number) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})/i.exec(hex);
    return result
      ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`
      : `rgba(99, 102, 241, ${alpha})`;
  }, []);

  const hasBackgroundImage = backgroundConfig.type === "image" && backgroundConfig.imageUrl;
  const isFullBackgroundImage = hasBackgroundImage && backgroundConfig.style === "full";
  const isHeaderBackgroundImage = hasBackgroundImage && backgroundConfig.style === "header";

  // Adaptive gradients — usam smartColors quando não há customização
  const adaptiveGrad1 = isDarkMode ? smartColors.gradDark1 : smartColors.gradLight1;
  const adaptiveGrad2 = isDarkMode ? smartColors.gradDark2 : smartColors.gradLight2;

  useEffect(() => {
    const handleScroll = () => setShowStickyCTA(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const savedConsent = localStorage.getItem('freelinnk_cookie_consent');
    if (savedConsent === 'granted' || savedConsent === 'denied') {
      setCookieConsent(savedConsent as "granted" | "denied");
    }
  }, []);

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);

    if (customizations) {
      setBackgroundConfig({
        type: customizations.backgroundType || "color",
        style: customizations.backgroundStyle || "full",
        color1: customizations.backgroundColor1 || "#f3f4f6",
        color2: customizations.backgroundColor2 || "#e5e7eb",
        imageUrl: customizations.backgroundImageUrl || "",
        imageBlur: customizations.backgroundImageBlur || 0,
        imageOpacity: customizations.backgroundImageOpacity || 100,
      });
    }

    const savedReactions = localStorage.getItem(`reactions_${username}`);
    if (savedReactions) setLinkReactions(JSON.parse(savedReactions));

    const savedClicks = localStorage.getItem(`clicks_${username}`);
    if (savedClicks) setClickCounts(JSON.parse(savedClicks));

    const stats = JSON.parse(localStorage.getItem(`stats_${username}`) || '{}');
    stats.views = (stats.views || 0) + 1;
    localStorage.setItem(`stats_${username}`, JSON.stringify(stats));

    QRCode.toDataURL(profileUrl, {
      width: 256, margin: 2,
      color: { dark: userAccentColor, light: '#FFFFFF' },
    }).then(setQrCodeDataUrl);

    setTimeout(() => setIsLoading(false), 1200);
  }, [profileUrl, username, userAccentColor, customizations]);

  // 🎰 Gira a Roleta de Anúncios
  useEffect(() => {
    const loadAd = async () => {
      if (plan === "ultra") return; // Ultra não tem anúncio na página

      // Pega o nicho dessa página para a IA barrar concorrentes
      // Como não salvamos o nicho na tabela de customização antes, mandamos a bio pra IA decidir
      let pageNiche = "geral";
      if (displayBio) {
        try {
          const res = await fetch('/api/analyze-niche', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: username, text: displayBio })
          });
          if (res.ok) {
            const data = await res.json();
            pageNiche = data.niche;
          }
        } catch  {} // Falha silenciosa, segue como geral
      }

      // Chama a mutação do banco para buscar 1 anúncio válido
      try {
        const ad = await fetchAd({
          pageOwnerNiche: pageNiche,
          pageOwnerPlan: plan
        });
        if (ad) setPublicAd(ad);
      } catch (e) { console.error("Erro ao buscar anúncio", e); }
    };

    loadAd();
  }, [plan, username, displayBio]);

  // Carrossel do Anúncio (Gira imagens a cada 3 segundos)
  useEffect(() => {
    if (!publicAd || !publicAd.mediaUrls || publicAd.mediaUrls.length <= 1) return;
    const interval = setInterval(() => {
      setAdImageIndex((prev) => (prev + 1) % publicAd.mediaUrls.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [publicAd]);

  const handleAdClick = () => {
    if (publicAd) {
      registerAdClick({ id: publicAd.id });
    }
  };

  const handleShare = async () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      colors: currentHoliday?.confettiColors || [userAccentColor, '#ff00ff', '#00ffff', '#ffff00', '#ff0080']
    };
    function fire(particleRatio: number, opts: ConfettiOptions) {
      confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) });
    }
    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });

    if (navigator.share) {
      try {
        await navigator.share({ title: `@${username} | Freelinnk`, text: `Confira o perfil de @${username}!`, url: profileUrl });
        setShared(true);
        const stats = JSON.parse(localStorage.getItem(`stats_${username}`) || '{}');
        stats.shares = (stats.shares || 0) + 1;
        localStorage.setItem(`stats_${username}`, JSON.stringify(stats));
        setTimeout(() => setShared(false), 2000);
      } catch { copyToClipboard(); }
    } else { copyToClipboard(); }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(profileUrl);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const handleReaction = (linkId: string) => {
    const newReactions = { ...linkReactions, [linkId]: (linkReactions[linkId] || 0) + 1 };
    setLinkReactions(newReactions);
    localStorage.setItem(`reactions_${username}`, JSON.stringify(newReactions));

    const stats = JSON.parse(localStorage.getItem(`stats_${username}`) || '{}');
    stats.likes = (stats.likes || 0) + 1;
    localStorage.setItem(`stats_${username}`, JSON.stringify(stats));

    const colors = currentHoliday?.confettiColors || ['#ff0000', '#ff69b4', '#ff1493', '#ff0080'];
    confetti({
      particleCount: 50, spread: 70, origin: { y: 0.6 },
      colors, shapes: ['circle'], scalar: 1.2, gravity: 0.5,
    });
  };

  const handleTrack = (link: LinkType) => {
    let visitorId = localStorage.getItem("visitorId");
    if (!visitorId) { visitorId = crypto.randomUUID(); localStorage.setItem("visitorId", visitorId); }
    trackLinkClick({ profileUsername: username, linkId: link._id, linkTitle: link.title, linkUrl: link.url, visitorId });
    const newClicks = { ...clickCounts, [link._id]: (clickCounts[link._id] || 0) + 1 };
    setClickCounts(newClicks);
    localStorage.setItem(`clicks_${username}`, JSON.stringify(newClicks));
    const stats = JSON.parse(localStorage.getItem(`stats_${username}`) || '{}');
    stats.clicks = (stats.clicks || 0) + 1;
    localStorage.setItem(`stats_${username}`, JSON.stringify(stats));
  };

  const handleAcceptCookies = () => { setCookieConsent('granted'); localStorage.setItem('freelinnk_cookie_consent', 'granted'); };
  const handleDeclineCookies = () => { setCookieConsent('denied'); localStorage.setItem('freelinnk_cookie_consent', 'denied'); };

  // 🎊 Holiday auto-confetti
  useEffect(() => {
    if (!isLoading && currentHoliday && !holidayFired && performanceConfig.canUseParticles) {
      const timer = setTimeout(() => {
        confetti({
          particleCount: 80, spread: 90, origin: { y: 0.4 },
          colors: currentHoliday.confettiColors,
          shapes: currentHoliday.particleShapes,
        });
        setHolidayFired(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, currentHoliday, holidayFired, performanceConfig.canUseParticles]);

  // ============================================================
  // STYLE HELPERS
  // ============================================================
  const getBaseBackgroundStyle = () => {
    if (backgroundConfig.type === "image") return { background: 'transparent' };
    if (backgroundConfig.type === "gradient") {
      return { background: `linear-gradient(135deg, ${backgroundConfig.color1}, ${backgroundConfig.color2})` };
    }
    // Cor sólida → usa cor harmônica com accent
    if (backgroundConfig.color1 === "#f3f4f6" || backgroundConfig.color1 === "#ffffff") {
      return { background: isDarkMode ? `linear-gradient(135deg, ${adaptiveGrad1}, ${adaptiveGrad2})` : `linear-gradient(135deg, ${adaptiveGrad1}, ${adaptiveGrad2})` };
    }
    return { background: backgroundConfig.color1 };
  };

  const getAdaptiveBlur = (originalBlur: number) => {
    if (!performanceConfig.canUseBlur) return 0;
    return Math.min(originalBlur, performanceConfig.recommendedBlur);
  };

  const getCardBackground = () => {
    if (performanceConfig.isLowPower) {
      return isDarkMode ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)';
    }
    if (hasBackgroundImage) {
      return isDarkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.85)';
    }
    return isDarkMode ? 'rgba(17, 24, 39, 0.7)' : 'rgba(255, 255, 255, 0.7)';
  };

  const getLinkBackground = (isHovered: boolean, isCta: boolean) => {
    if (isCta) return `linear-gradient(135deg, ${hexToRgba(userAccentColor, 0.25)}, ${hexToRgba(userAccentColor, 0.15)})`;
    if (hasBackgroundImage) {
      return isDarkMode
        ? isHovered ? 'rgba(31, 41, 55, 0.85)' : 'rgba(31, 41, 55, 0.7)'
        : isHovered ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.75)';
    }
    return isDarkMode
      ? isHovered ? 'rgba(31, 41, 55, 0.7)' : 'rgba(31, 41, 55, 0.5)'
      : isHovered ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.5)';
  };

  const getTextColor = (variant: 'primary' | 'secondary' | 'muted' = 'primary') => {
    if (variant === 'primary') {
      return hasBackgroundImage
        ? (isDarkMode ? '#ffffff' : '#1f2937')
        : (isDarkMode ? '#f3f4f6' : '#1f2937');
    }
    if (variant === 'secondary') {
      return hasBackgroundImage
        ? (isDarkMode ? '#e5e7eb' : '#374151')
        : (isDarkMode ? '#d1d5db' : '#4b5563');
    }
    return hasBackgroundImage
      ? (isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(75,85,99,0.8)')
      : (isDarkMode ? '#9ca3af' : '#6b7280');
  };

  // Cor do @username que SEMPRE contrasta com o fundo
  const getNameColor = () => {
    if (isDarkMode) return smartColors.nameColorDark;
    return smartColors.nameColorLight;
  };

  const isCtaLink = (url: string, title: string): boolean => {
    const ctaKeywords = [
      'comprar', 'compre', 'buy', 'shop', 'loja', 'store',
      'agendar', 'agenda', 'marcar', 'reservar', 'booking',
      'whatsapp', 'wa.me', 'chamar', 'contato', 'falar',
      'inscrever', 'cadastrar', 'register', 'signup',
      'baixar', 'download', 'grátis', 'free',
      'oferta', 'promoção', 'desconto', 'cupom'
    ];
    return ctaKeywords.some(keyword => `${url} ${title}`.toLowerCase().includes(keyword));
  };

  const isNewLink = (creationTime: number): boolean => {
    return creationTime > Date.now() - 7 * 24 * 60 * 60 * 1000;
  };

  // ============================================================
  // LOADING SCREEN
  // ============================================================
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${userAccentColor}, ${userAccentColor}dd)` }} />
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              `radial-gradient(circle at 0% 0%, ${userAccentColor}80 0%, transparent 50%)`,
              `radial-gradient(circle at 100% 100%, ${userAccentColor}80 0%, transparent 50%)`,
              `radial-gradient(circle at 0% 100%, ${userAccentColor}80 0%, transparent 50%)`,
              `radial-gradient(circle at 100% 0%, ${userAccentColor}80 0%, transparent 50%)`,
              `radial-gradient(circle at 0% 0%, ${userAccentColor}80 0%, transparent 50%)`,
            ]
          }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="relative z-10"
        >
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <motion.div
                className="w-20 h-20 sm:w-28 sm:h-28 border-4 border-transparent border-t-white border-r-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-2 sm:inset-3 border-4 border-transparent border-b-white/50 border-l-white/50 rounded-full"
                animate={{ rotate: -360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              {/* Brand glyph no centro */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center text-white font-black text-xl sm:text-2xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {userBrand.initials}
              </motion.div>
            </div>
            <motion.div
              className="flex flex-col items-center gap-2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white px-4 text-center">
                @{username}
              </h2>
              <p className="text-white/70 text-sm">Carregando sua experiência...</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ============================================================
  // RENDER PRINCIPAL
  // ============================================================
  return (
    <div className={`min-h-screen w-full overflow-x-hidden transition-colors duration-500 ${isDarkMode ? 'dark' : ''}`}>

      {/* 🎊 HOLIDAY BANNER */}
      <AnimatePresence>
        {currentHoliday && (
          <HolidayBanner holiday={currentHoliday} accentColor={userAccentColor} />
        )}
      </AnimatePresence>

      {/* 🎊 FLOATING EMOJIS DE DATAS COMEMORATIVAS */}
      {currentHoliday && performanceConfig.canUseParticles && (
        <FloatingEmojis emojis={currentHoliday.floatingEmojis} count={8} />
      )}

      {/* 🔥 TRACKING SCRIPTS */}
      {cookieConsent === 'granted' && trackingSettings && (
        <>
          {trackingSettings.googleAnalyticsId && (
            <>
              <Script src={`https://www.googletagmanager.com/gtag/js?id=${trackingSettings.googleAnalyticsId}`} strategy="afterInteractive" />
              <Script id="google-analytics" strategy="afterInteractive">{`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${trackingSettings.googleAnalyticsId}');
              `}</Script>
            </>
          )}
          {trackingSettings.facebookPixelId && (
            <Script id="facebook-pixel" strategy="afterInteractive">{`
              !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${trackingSettings.facebookPixelId}');
              fbq('track', 'PageView');
            `}</Script>
          )}
        </>
      )}

      {/* PARTÍCULAS */}
      {!isFullBackgroundImage && performanceConfig.canUseParticles && (
        <ParticleField color={hexToRgba(userAccentColor, 0.4)} />
      )}

      {/* BARRA DE PROGRESSO */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 origin-left z-[90]"
        style={{
          scaleX,
          background: currentHoliday
            ? `linear-gradient(90deg, ${currentHoliday.colors[0]}, ${currentHoliday.colors[1] || userAccentColor})`
            : `linear-gradient(90deg, ${userAccentColor}, ${hexToRgba(userAccentColor, 0.5)})`
        }}
      />

      {/* BG IMAGEM FULL */}
      {isFullBackgroundImage && (
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              backgroundImage: `url(${backgroundConfig.imageUrl})`,
              backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
              filter: backgroundConfig.imageBlur > 0 ? `blur(${getAdaptiveBlur(backgroundConfig.imageBlur)}px)` : 'none',
              opacity: backgroundConfig.imageOpacity / 100,
              transform: backgroundConfig.imageBlur > 0 ? 'scale(1.1)' : 'scale(1)',
            }}
          />
          {/* Holiday overlay */}
          {currentHoliday && (
            <div
              className="absolute inset-0"
              style={{ background: currentHoliday.bgOverlay }}
            />
          )}
          <div
            className="absolute inset-0"
            style={{
              background: isDarkMode
                ? 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 100%)'
                : 'linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.3) 100%)',
            }}
          />
        </div>
      )}

      {/* BG NORMAL */}
      {!isFullBackgroundImage && (
        <div className="fixed inset-0 -z-10" style={getBaseBackgroundStyle()}>
          {/* Holiday background overlay */}
          {currentHoliday && (
            <motion.div
              className="absolute inset-0"
              style={{ background: currentHoliday.bgOverlay }}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
          {backgroundConfig.type !== 'image' && performanceConfig.canUseHeavyAnimations && (
            <motion.div
              className="absolute inset-0 opacity-20"
              animate={{
                background: [
                  `linear-gradient(135deg, ${userAccentColor}33, transparent)`,
                  `linear-gradient(225deg, ${userAccentColor}33, transparent)`,
                  `linear-gradient(135deg, ${userAccentColor}33, transparent)`,
                ]
              }}
              transition={{ duration: 10, repeat: Infinity }}
            />
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* HEADER                                                        */}
      {/* ============================================================ */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: performanceConfig.animationDuration }}
        className={`relative overflow-hidden ${
          isHeaderBackgroundImage
            ? 'min-h-[300px] sm:min-h-[400px] md:min-h-[450px] lg:min-h-[500px]'
            : 'h-48 sm:h-64 md:h-80'
        } ${currentHoliday ? 'pt-10' : ''}`}
      >
        {/* IMAGEM HEADER */}
        {isHeaderBackgroundImage && (
          <>
            <div className="absolute inset-0 w-full h-full">
              <div
                className="absolute inset-0 w-full h-full"
                style={{
                  backgroundImage: `url(${backgroundConfig.imageUrl})`,
                  backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
                  filter: backgroundConfig.imageBlur > 0 ? `blur(${getAdaptiveBlur(backgroundConfig.imageBlur)}px)` : 'none',
                  opacity: backgroundConfig.imageOpacity / 100,
                }}
              />
              {currentHoliday && (
                <div className="absolute inset-0" style={{ background: currentHoliday.bgOverlay }} />
              )}
              <div
                className="absolute inset-0"
                style={{
                  background: isDarkMode
                    ? 'linear-gradient(to bottom, transparent 30%, rgba(17, 24, 39, 0.9) 100%)'
                    : 'linear-gradient(to bottom, transparent 30%, rgba(243, 244, 246, 0.9) 100%)',
                }}
              />
            </div>
          </>
        )}

        {/* HEADER GRADIENTE/COR */}
        {!isHeaderBackgroundImage && !isFullBackgroundImage && (
          <motion.div
            className="absolute inset-0"
            style={{
              background: backgroundConfig.type === 'gradient'
                ? `linear-gradient(135deg, ${backgroundConfig.color1}, ${backgroundConfig.color2})`
                : backgroundConfig.type === 'color' && backgroundConfig.color1 !== "#f3f4f6"
                  ? backgroundConfig.color1
                  : `linear-gradient(135deg, ${adaptiveGrad1}, ${adaptiveGrad2})`,
              clipPath: "polygon(0 0, 100% 0, 100% 85%, 0 100%)",
            }}
          >
            {/* Holiday tint no header */}
            {currentHoliday && (
              <motion.div
                className="absolute inset-0"
                style={{ background: currentHoliday.bgOverlay }}
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            )}
            <div className="absolute inset-0 bg-black/10" />
            {performanceConfig.canUseHeavyAnimations && (
              <motion.div
                className="absolute inset-0 opacity-30"
                style={{ background: `linear-gradient(45deg, transparent 30%, ${hexToRgba(userAccentColor, 0.3)} 50%, transparent 70%)` }}
                animate={{ x: ['-200%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
            )}
            {/* 🎨 Brand pattern único no header */}
            <div className="absolute inset-0" style={{ background: userBrand.pattern, opacity: 0.5 }} />
          </motion.div>
        )}

        {/* HEADER TRANSPARENTE (full bg image) */}
        {isFullBackgroundImage && (
          <div className="absolute inset-0" style={{ background: 'transparent', clipPath: "polygon(0 0, 100% 0, 100% 85%, 0 100%)" }} />
        )}

        {/* BOTÕES */}
        <div className={`absolute left-3 sm:left-4 right-3 sm:right-4 flex justify-between items-center z-20 transition-all duration-300 ${statusMessage ? 'top-14 sm:top-16' : currentHoliday ? 'top-14 sm:top-16' : 'top-3 sm:top-4'}`}>
          <motion.button
            whileHover={performanceConfig.canUseHeavyAnimations ? { scale: 1.1, rotate: 180 } : {}}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-xl text-white border border-white/30 hover:bg-white/30 transition-all duration-300 shadow-lg"
            style={{ boxShadow: `0 4px 20px ${hexToRgba(userAccentColor, 0.3)}` }}
          >
            <AnimatePresence mode="wait">
              {isDarkMode ? (
                <motion.div key="sun" initial={{ rotate: -180, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 180, opacity: 0 }} transition={{ duration: 0.3 }}>
                  <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.div>
              ) : (
                <motion.div key="moon" initial={{ rotate: 180, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -180, opacity: 0 }} transition={{ duration: 0.3 }}>
                  <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <div className="flex gap-2">
            {/* Holiday indicator button */}
            {currentHoliday && (
              <motion.button
                onClick={() => {
                  confetti({
                    particleCount: 150, spread: 100, origin: { y: 0.5 },
                    colors: currentHoliday.confettiColors,
                    shapes: currentHoliday.particleShapes,
                  });
                }}
                className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-xl text-white border border-white/30 hover:bg-white/30 transition-all duration-300 shadow-lg text-sm sm:text-base"
                style={{ boxShadow: `0 4px 20px ${hexToRgba(currentHoliday.colors[0], 0.4)}` }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title={currentHoliday.name}
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                {currentHoliday.emoji}
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }}
              onClick={() => setShowQRCode(!showQRCode)}
              className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-xl text-white border border-white/30 hover:bg-white/30 transition-all duration-300 shadow-lg"
              style={{ boxShadow: `0 4px 20px ${hexToRgba(userAccentColor, 0.3)}` }}
              title="Ver QR Code"
            >
              <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl backdrop-blur-xl text-white border border-white/30 transition-all duration-300 shadow-lg"
              style={{
                background: shared ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.4), rgba(5, 150, 105, 0.4))' : 'rgba(255, 255, 255, 0.2)',
                boxShadow: `0 4px 20px ${hexToRgba(userAccentColor, 0.3)}`
              }}
              title={shared ? "Link copiado!" : "Compartilhar"}
            >
              <AnimatePresence mode="wait">
                {shared ? (
                  <motion.div key="check" initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 180 }}>
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.div>
                ) : (
                  <motion.div key="share" initial={{ scale: 0, rotate: 180 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: -180 }}>
                    <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* STATUS */}
        {statusMessage && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute top-0 left-0 right-0 py-2.5 px-4 text-center text-xs sm:text-sm font-bold text-white z-[60] shadow-md"
            style={{ background: userAccentColor, top: currentHoliday ? '40px' : '0' }}
          >
            <div className="flex items-center justify-center gap-2">
              <motion.span
                className="w-2 h-2 rounded-full bg-white"
                animate={performanceConfig.canUseHeavyAnimations ? { opacity: [1, 0.3, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span>{statusMessage}</span>
            </div>
          </motion.div>
        )}

        {/* QR CODE MODAL */}
        <AnimatePresence>
          {showQRCode && qrCodeDataUrl && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="fixed top-20 right-4 sm:right-8 z-50 rounded-xl sm:rounded-2xl border border-white/20 shadow-2xl p-3 sm:p-4 w-auto max-w-[calc(100vw-2rem)]"
              style={{
                background: isDarkMode ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: performanceConfig.canUseBlur ? 'blur(20px)' : 'none',
                boxShadow: `0 8px 32px ${hexToRgba(userAccentColor, 0.3)}`
              }}
            >
              <div className="flex flex-col items-center gap-2 sm:gap-3">
                <motion.div className="relative" whileHover={{ scale: 1.05 }}>
                  <div className="absolute inset-0 rounded-lg blur-xl opacity-50" style={{ background: userAccentColor }} />
                  <img src={qrCodeDataUrl} alt="QR Code" className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-lg relative z-10" />
                </motion.div>
                <p className="text-xs font-bold" style={{ color: getTextColor('secondary') }}>@{username}</p>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const link = document.createElement('a');
                    link.download = `${username}-qrcode.png`;
                    link.href = qrCodeDataUrl;
                    link.click();
                    if (performanceConfig.canUseParticles) confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                  }}
                  className="flex items-center gap-2 px-3 py-2 sm:px-4 text-xs sm:text-sm text-white rounded-lg sm:rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                  style={{ background: `linear-gradient(135deg, ${userAccentColor}, ${hexToRgba(userAccentColor, 0.8)})` }}
                >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                  Baixar QR Code
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ============================================================ */}
      {/* CONTEÚDO PRINCIPAL                                            */}
      {/* ============================================================ */}
      <div className={`relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-8 sm:pb-12 md:pb-16 w-full ${isHeaderBackgroundImage ? '-mt-20 sm:-mt-28 md:-mt-32' : '-mt-24 sm:-mt-32 md:-mt-40'}`}>
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">

          {/* ============================================================ */}
          {/* SIDEBAR — PERFIL                                              */}
          {/* ============================================================ */}
          <motion.aside
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="lg:sticky lg:top-8 space-y-3 sm:space-y-4">
              <motion.div
                className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-5 md:p-6 shadow-2xl border border-white/20 dark:border-white/10"
                style={{
                  background: getCardBackground(),
                  backdropFilter: performanceConfig.canUseBlur ? 'blur(20px)' : 'none',
                  WebkitBackdropFilter: performanceConfig.canUseBlur ? 'blur(20px)' : 'none',
                  boxShadow: `0 8px 32px ${hexToRgba(userAccentColor, 0.2)}, inset 0 0 0 1px rgba(255,255,255,0.1)`
                }}
                whileHover={{ y: -5, boxShadow: `0 12px 40px ${hexToRgba(userAccentColor, 0.3)}` }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Holiday tint no card */}
                {currentHoliday && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl sm:rounded-3xl pointer-events-none"
                    style={{ background: currentHoliday.bgOverlay }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none rounded-2xl sm:rounded-3xl" />
                {/* Brand pattern overlay */}
                <div className="absolute inset-0 rounded-2xl sm:rounded-3xl pointer-events-none" style={{ background: userBrand.pattern, opacity: 0.3 }} />
                <motion.div
                  className="absolute inset-0 rounded-2xl sm:rounded-3xl"
                  style={{ background: `linear-gradient(135deg, ${userAccentColor}15, transparent)` }}
                  animate={performanceConfig.canUseHeavyAnimations ? { opacity: [0.3, 0.5, 0.3] } : {}}
                  transition={{ duration: 3, repeat: Infinity }}
                />

                <div className="relative z-10">
                  {/* Avatar */}
                  <div className="flex justify-center mb-4 sm:mb-5 md:mb-6">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative group cursor-pointer"
                    >
                      <motion.div
                        className="absolute inset-0 rounded-full blur-2xl opacity-0 group-hover:opacity-75 transition-opacity duration-500"
                        style={{ background: currentHoliday ? currentHoliday.colors[0] : userAccentColor }}
                        animate={performanceConfig.canUseHeavyAnimations ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <motion.div
                        className="absolute inset-0 rounded-full border-4 opacity-0 group-hover:opacity-100"
                        style={{ borderColor: currentHoliday ? currentHoliday.colors[0] : userAccentColor }}
                        animate={performanceConfig.canUseHeavyAnimations ? { scale: [1, 1.3], opacity: [1, 0] } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      {customizations?.profilePictureUrl ? (
                        <div
                          className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full overflow-hidden shadow-2xl bg-white p-1 border-4 relative z-10"
                          style={{
                            borderColor: currentHoliday ? currentHoliday.colors[0] : userAccentColor,
                            boxShadow: `0 0 30px ${hexToRgba(currentHoliday ? currentHoliday.colors[0] : userAccentColor, 0.5)}`
                          }}
                        >
                          <Image
                            src={customizations.profilePictureUrl}
                            alt={`${username}'s profile`}
                            width={160} height={160}
                            className="w-full h-full object-cover rounded-full"
                            priority loading="eager"
                          />
                        </div>
                      ) : (
                        <motion.div
                          className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full flex items-center justify-center shadow-2xl border-4 border-white dark:border-gray-800 relative z-10 overflow-hidden"
                          style={{
                            background: `linear-gradient(135deg, ${userAccentColor}, ${userAccentColor}dd)`,
                            boxShadow: `0 0 30px ${hexToRgba(userAccentColor, 0.5)}`
                          }}
                          animate={performanceConfig.canUseHeavyAnimations ? {
                            boxShadow: [
                              `0 0 30px ${hexToRgba(userAccentColor, 0.5)}`,
                              `0 0 40px ${hexToRgba(userAccentColor, 0.7)}`,
                              `0 0 30px ${hexToRgba(userAccentColor, 0.5)}`,
                            ]
                          } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {/* Brand pattern no avatar */}
                          <div className="absolute inset-0" style={{ background: userBrand.pattern }} />
                          <div className="relative z-10 flex flex-col items-center">
                            <span className="text-white/40 text-3xl font-black leading-none mb-0.5">{userBrand.uniqueGlyph}</span>
                            <span className="text-white text-2xl sm:text-3xl font-black leading-none">{userBrand.initials}</span>
                          </div>
                        </motion.div>
                      )}

                      {/* Holiday badge no avatar */}
                      {currentHoliday && (
                        <motion.div
                          className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full flex items-center justify-center text-lg z-20 shadow-lg"
                          style={{ background: `linear-gradient(135deg, ${currentHoliday.colors[0]}, ${currentHoliday.colors[1] || currentHoliday.colors[0]})` }}
                          animate={{ scale: [1, 1.2, 1], rotate: [0, 15, -15, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {currentHoliday.emoji}
                        </motion.div>
                      )}
                    </motion.div>
                  </div>

                  {/* Nome e Badge */}
                  <div className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
                      <motion.h1
                        className={`text-2xl sm:text-3xl font-black break-all ${hasBackgroundImage ? 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]' : ''}`}
                        style={{ color: getNameColor() }}
                        animate={currentHoliday && performanceConfig.canUseHeavyAnimations ? {
                          textShadow: [
                            `0 0 10px ${hexToRgba(currentHoliday.colors[0], 0.5)}`,
                            `0 0 20px ${hexToRgba(currentHoliday.colors[0], 0.8)}`,
                            `0 0 10px ${hexToRgba(currentHoliday.colors[0], 0.5)}`,
                          ]
                        } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        @{username}
                      </motion.h1>
                      {plan !== 'free' && <VerifiedBadge size="large" plan={plan} />}
                    </div>

                    {plan === 'free' && (
                      <Link href={getBaseUrl() + "/"} className="group inline-block">
                        <motion.div
                          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-sm border border-white/30 dark:border-white/20"
                          whileHover={{ scale: 1.05 }}
                        >
                          <Sparkles className="w-3 h-3 text-purple-500" />
                          <p className="text-[11px] font-medium" style={{ color: getTextColor('secondary') }}>
                            Crie seu perfil grátis no <span className="font-bold text-purple-600 dark:text-purple-400">Freelinnk</span>
                          </p>
                        </motion.div>
                      </Link>
                    )}

                    {/* Bio */}
                    {displayBio && (
                      <motion.p
                        className={`text-base sm:text-lg leading-relaxed px-4 ${hasBackgroundImage ? 'drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]' : ''}`}
                        style={{ color: getTextColor('secondary') }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        {displayBio}
                      </motion.p>
                    )}

                    {/* Data + holiday info */}
                    <div className="flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm flex-wrap pt-2" style={{ color: getTextColor('muted') }}>
                      <motion.div className="flex items-center gap-1" whileHover={{ scale: 1.05 }}>
                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>Desde {joinDate}</span>
                      </motion.div>
                      {currentHoliday && (
                        <motion.div
                          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-white text-[10px] font-bold"
                          style={{ background: `linear-gradient(90deg, ${currentHoliday.colors[0]}, ${currentHoliday.colors[1] || currentHoliday.colors[0]})` }}
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <span>{currentHoliday.emoji}</span>
                          <span>{currentHoliday.name}</span>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.aside>

          {/* ============================================================ */}
          {/* SEÇÃO DE LINKS                                                */}
          {/* ============================================================ */}
          <motion.main
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-2 w-full max-w-full"
          >
            <div className="space-y-3 sm:space-y-4">
              <motion.div
                className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl border border-white/20 dark:border-white/10"
                style={{
                  background: getCardBackground(),
                  backdropFilter: performanceConfig.canUseBlur ? 'blur(20px)' : 'none',
                  WebkitBackdropFilter: performanceConfig.canUseBlur ? 'blur(20px)' : 'none',
                  boxShadow: `0 8px 32px ${hexToRgba(userAccentColor, 0.2)}, inset 0 0 0 1px rgba(255,255,255,0.1)`
                }}
                whileHover={{ y: -2 }}
              >
                {/* Holiday tint */}
                {currentHoliday && (
                  <div className="absolute inset-0 rounded-2xl sm:rounded-3xl pointer-events-none" style={{ background: currentHoliday.bgOverlay, opacity: 0.6 }} />
                )}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none rounded-2xl sm:rounded-3xl" />

                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <motion.h2
                      className={`text-lg sm:text-xl md:text-2xl font-black flex items-center gap-1.5 sm:gap-2 ${hasBackgroundImage ? 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]' : ''}`}
                      style={{ color: getNameColor() }}
                    >
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      >
                        {currentHoliday
                          ? <span className="text-xl">{currentHoliday.emoji}</span>
                          : <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: userAccentColor }} />
                        }
                      </motion.div>
                      Links
                      {currentHoliday && (
                        <span className="text-xs font-normal opacity-60 ml-1">• {currentHoliday.name}</span>
                      )}
                    </motion.h2>
                  </div>

                  {/* Lista de Links */}
                  <div className="space-y-2 sm:space-y-2.5">
                    {links && links.length > 0 ? (
                      links.map((link, index) => {
                        const isCta = isCtaLink(link.url, link.title);
                        const isNew = isNewLink(link._creationTime);
                        const isHovered = hoveredLink === link._id;

                        return (
                          <motion.div
                            key={link._id}
                            initial={{ opacity: 0, x: -50, rotateY: -15 }}
                            animate={{ opacity: 1, x: 0, rotateY: 0 }}
                            transition={{ delay: index * 0.08, type: performanceConfig.canUseHeavyAnimations ? "spring" : "tween", stiffness: 120, damping: 14 }}
                            whileHover={{ scale: isCta ? 1.05 : 1.03, x: 8, transition: { type: "spring", stiffness: 400 } }}
                            whileTap={{ scale: 0.98 }}
                            onHoverStart={() => setHoveredLink(link._id)}
                            onHoverEnd={() => setHoveredLink(null)}
                            className="w-full max-w-full perspective-1000"
                          >
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`group relative flex items-center gap-2.5 sm:gap-3 w-full rounded-xl sm:rounded-2xl p-3 sm:p-3.5 md:p-4 font-bold text-sm sm:text-base transition-all duration-300 overflow-hidden ${isCta ? 'ring-2 ring-offset-2' : ''}`}
                              style={{
                                background: getLinkBackground(isHovered, isCta),
                                backdropFilter: performanceConfig.canUseBlur ? 'blur(12px)' : 'none',
                                WebkitBackdropFilter: performanceConfig.canUseBlur ? 'blur(12px)' : 'none',
                                borderWidth: '2px', borderStyle: 'solid',
                                borderColor: isCta
                                  ? (currentHoliday ? currentHoliday.colors[0] : userAccentColor)
                                  : isHovered
                                    ? userAccentColor
                                    : hasBackgroundImage ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)',
                                boxShadow: isCta
                                  ? `0 0 25px ${hexToRgba(currentHoliday ? currentHoliday.colors[0] : userAccentColor, 0.3)}, 0 4px 15px rgba(0,0,0,0.1)`
                                  : isHovered
                                    ? `0 0 30px ${hexToRgba(userAccentColor, 0.4)}`
                                    : '0 2px 8px rgba(0,0,0,0.1)',
                                '--ring-color': isCta ? userAccentColor : 'transparent',
                                '--ring-offset-color': isDarkMode ? '#111827' : '#ffffff',
                              } as React.CSSProperties}
                              onClick={() => handleTrack(link)}
                            >
                              {/* Pulso CTA */}
                              {isCta && performanceConfig.canUseHeavyAnimations && (
                                <motion.div
                                  className="absolute inset-0 rounded-xl sm:rounded-2xl"
                                  style={{ border: `2px solid ${currentHoliday ? currentHoliday.colors[0] : userAccentColor}` }}
                                  animate={{ scale: [1, 1.02, 1], opacity: [0.5, 0.2, 0.5] }}
                                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                />
                              )}
                              {/* Hover gradiente */}
                              <motion.div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100"
                                initial={false}
                                animate={{ background: isHovered ? `linear-gradient(135deg, ${hexToRgba(userAccentColor, 0.15)}, transparent)` : 'transparent' }}
                                transition={{ duration: 0.3 }}
                              />
                              {/* Shimmer */}
                              <motion.div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100"
                                style={{ background: `linear-gradient(90deg, transparent, ${hexToRgba(userAccentColor, 0.2)}, transparent)` }}
                                animate={isHovered && performanceConfig.canUseHeavyAnimations ? { x: ['-100%', '200%'] } : {}}
                                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                              />

                              {/* Ícone */}
                              <motion.span
                                animate={isHovered && performanceConfig.canUseHeavyAnimations ? { rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] } : {}}
                                transition={{ duration: 0.5 }}
                                className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg flex-shrink-0 overflow-hidden"
                                style={{
                                  background: link.thumbnailUrl
                                    ? 'transparent'
                                    : isCta
                                      ? `linear-gradient(135deg, ${currentHoliday ? currentHoliday.colors[0] : userAccentColor}, ${hexToRgba(currentHoliday ? currentHoliday.colors[0] : userAccentColor, 0.8)})`
                                      : isHovered
                                        ? `linear-gradient(135deg, ${userAccentColor}30, ${userAccentColor}50)`
                                        : hasBackgroundImage
                                          ? 'rgba(255, 255, 255, 0.3)'
                                          : isDarkMode
                                            ? 'linear-gradient(135deg, rgba(55, 65, 81, 0.8), rgba(75, 85, 99, 0.8))'
                                            : 'linear-gradient(135deg, rgba(249, 250, 251, 0.9), rgba(243, 244, 246, 0.9))',
                                  boxShadow: isCta
                                    ? `0 0 20px ${hexToRgba(currentHoliday ? currentHoliday.colors[0] : userAccentColor, 0.5)}`
                                    : isHovered
                                      ? `0 0 15px ${hexToRgba(userAccentColor, 0.4)}`
                                      : '0 2px 8px rgba(0,0,0,0.1)',
                                }}
                              >
                                {link.thumbnailUrl ? (
                                  <Image src={link.thumbnailUrl} alt={link.title} width={40} height={40} className="w-full h-full object-cover" />
                                ) : (
                                  <span className={isCta ? 'text-white' : ''}>{getLinkIcon(link.url, link.title)}</span>
                                )}
                              </motion.span>

                              {/* Título */}
                              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span
                                    className={`break-words whitespace-normal text-sm sm:text-base font-bold leading-tight transition-all duration-300 ${hasBackgroundImage ? 'drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]' : ''}`}
                                    style={{
                                      color: isCta
                                        ? getTextColor('primary')
                                        : isHovered ? userAccentColor : getTextColor('primary'),
                                    }}
                                  >
                                    {link.title}
                                  </span>
                                  {isNew && (
                                    <motion.span
                                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                                      className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                                      style={{ boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)' }}
                                    >
                                      Novo
                                    </motion.span>
                                  )}
                                  {isCta && (
                                    <motion.span
                                      animate={performanceConfig.canUseHeavyAnimations ? { scale: [1, 1.1, 1] } : {}}
                                      transition={{ duration: 1.5, repeat: Infinity }}
                                      className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded-full text-white shadow-lg"
                                      style={{
                                        background: `linear-gradient(135deg, ${currentHoliday ? currentHoliday.colors[0] : userAccentColor}, ${hexToRgba(currentHoliday ? currentHoliday.colors[0] : userAccentColor, 0.8)})`,
                                        boxShadow: `0 0 10px ${hexToRgba(currentHoliday ? currentHoliday.colors[0] : userAccentColor, 0.5)}`
                                      }}
                                    >
                                      ⚡
                                    </motion.span>
                                  )}
                                </div>
                              </div>

                              {/* Ações */}
                              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 relative z-10 ml-1">
                                <motion.button
                                  whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.85 }}
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleReaction(link._id); }}
                                  className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full transition-all duration-300"
                                  style={{
                                    background: linkReactions[link._id] ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(220, 38, 38, 0.25))' : 'transparent',
                                    boxShadow: linkReactions[link._id] ? '0 0 20px rgba(239, 68, 68, 0.4)' : 'none'
                                  }}
                                >
                                  <motion.div animate={linkReactions[link._id] && performanceConfig.canUseHeavyAnimations ? { scale: [1, 1.4, 1], rotate: [0, -15, 15, 0] } : {}} transition={{ duration: 0.4 }}>
                                    <Heart className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-all duration-300 ${linkReactions[link._id] ? 'text-red-500 fill-current drop-shadow-[0_0_10px_rgba(239,68,68,0.9)]' : 'text-gray-400 hover:text-red-400'}`} />
                                  </motion.div>
                                  <span className="text-[10px] sm:text-xs font-bold" style={{ color: getTextColor('secondary') }}>
                                    {linkReactions[link._id] || 0}
                                  </span>
                                </motion.button>
                                <motion.div
                                  animate={isHovered && performanceConfig.canUseHeavyAnimations ? { x: [0, 4, 0], y: [0, -4, 0] } : {}}
                                  transition={{ duration: 0.6, repeat: isHovered ? Infinity : 0, ease: "easeInOut" }}
                                >
                                  <ExternalLink
                                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all duration-300 hidden sm:block"
                                    style={{ color: isHovered ? userAccentColor : getTextColor('muted') }}
                                  />
                                </motion.div>
                              </div>
                            </a>
                          </motion.div>
                        );
                      })
                    ) : (
                      <motion.div
                        className="text-center py-8 sm:py-10 md:py-12"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <motion.div
                          className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full mb-4"
                          style={{
                            background: `linear-gradient(135deg, ${hexToRgba(userAccentColor, 0.1)}, ${hexToRgba(userAccentColor, 0.2)})`,
                            boxShadow: `0 0 30px ${hexToRgba(userAccentColor, 0.2)}`
                          }}
                          animate={performanceConfig.canUseHeavyAnimations ? { scale: [1, 1.05, 1] } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <LinkIcon className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: userAccentColor }} />
                        </motion.div>
                        <p className="text-base sm:text-lg font-bold mb-2" style={{ color: getTextColor('secondary') }}>
                          Nenhum link cadastrado ainda
                        </p>
                        <p className="text-xs sm:text-sm" style={{ color: getTextColor('muted') }}>
                          Os links aparecerão aqui quando forem adicionados
                        </p>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* 📢 ESPAÇO PUBLICITÁRIO (AD NETWORK FREELINNK) */}
              {publicAd && plan !== "ultra" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-1 mt-6 shadow-xl group"
                  style={{
                    background: `linear-gradient(135deg, ${userAccentColor}40, transparent)`,
                  }}
                >
                  <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-md" />

                  <div className="relative z-10 bg-white dark:bg-slate-900 rounded-xl sm:rounded-[22px] overflow-hidden flex flex-col md:flex-row">
                    {/* Imagem do Anúncio */}
                    {publicAd.mediaUrls && publicAd.mediaUrls.length > 0 && publicAd.mediaUrls[0] !== "" && (
                      <div className="w-full md:w-2/5 aspect-video md:aspect-square relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <AnimatePresence mode="wait">
                          <motion.img
                            key={adImageIndex}
                            src={publicAd.mediaUrls[adImageIndex]}
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 w-full h-full object-cover"
                            alt="Ad visual"
                          />
                        </AnimatePresence>
                        {/* Badge de Patrocinado */}
                        <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[9px] font-bold text-white uppercase tracking-wider border border-white/10">
                          Patrocinado
                        </div>
                      </div>
                    )}

                    {/* Conteúdo do Anúncio */}
                    <div className="p-4 md:p-5 flex-1 flex flex-col justify-center">
                      <h4 className="font-black text-lg md:text-xl text-slate-900 dark:text-white leading-tight mb-2">
                        {publicAd.title}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
                        {publicAd.text}
                      </p>
                      <a
                        href={publicAd.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleAdClick}
                        className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl font-bold text-white text-sm transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5"
                        style={{ background: userAccentColor }}
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Ver Oferta
                      </a>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* CTA FREE */}
              {plan === 'free' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="relative rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 shadow-2xl text-white overflow-hidden"
                  style={{
                    background: currentHoliday
                      ? `linear-gradient(135deg, ${currentHoliday.colors[0]}, ${currentHoliday.colors[1] || userAccentColor})`
                      : `linear-gradient(135deg, ${userAccentColor}, ${hexToRgba(userAccentColor, 0.8)})`,
                    boxShadow: `0 8px 32px ${hexToRgba(currentHoliday ? currentHoliday.colors[0] : userAccentColor, 0.4)}`
                  }}
                  whileHover={{ scale: 1.02, boxShadow: `0 12px 40px ${hexToRgba(userAccentColor, 0.5)}` }}
                >
                  <motion.div
                    className="absolute inset-0 opacity-20"
                    style={{ background: 'radial-gradient(circle at 50% 50%, white, transparent)' }}
                    animate={performanceConfig.canUseHeavyAnimations ? { scale: [1, 1.5, 1], opacity: [0.2, 0.3, 0.2] } : {}}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }}
                    animate={performanceConfig.canUseHeavyAnimations ? { x: ['-100%', '200%'] } : {}}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                  <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                    <div className="text-center sm:text-left">
                      <motion.h3
                        className="text-base sm:text-lg md:text-xl font-black mb-1 sm:mb-2 flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2"
                        animate={performanceConfig.canUseHeavyAnimations ? { textShadow: ['0 0 10px rgba(255,255,255,0.5)', '0 0 20px rgba(255,255,255,0.8)', '0 0 10px rgba(255,255,255,0.5)'] } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <motion.div animate={performanceConfig.canUseHeavyAnimations ? { rotate: [0, 360] } : {}} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                          <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                        </motion.div>
                        {currentHoliday ? `${currentHoliday.emoji} Quer um perfil assim?` : "Quer um perfil assim?"}
                      </motion.h3>
                      <p className="text-white/90 text-xs sm:text-sm font-semibold">Crie sua página com recursos exclusivos!</p>
                    </div>
                    <Link href="/">
                      <motion.button
                        whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }}
                        className="relative px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 bg-white rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm shadow-xl hover:shadow-2xl transition-all whitespace-nowrap overflow-hidden"
                        style={{ color: currentHoliday ? currentHoliday.colors[0] : userAccentColor }}
                      >
                        <motion.div
                          className="absolute inset-0"
                          style={{ background: `linear-gradient(90deg, transparent, ${hexToRgba(userAccentColor, 0.2)}, transparent)` }}
                          animate={performanceConfig.canUseHeavyAnimations ? { x: ['-100%', '200%'] } : {}}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        />
                        <span className="relative z-10 flex items-center gap-2">
                          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                          Começar Grátis
                        </span>
                      </motion.button>
                    </Link>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.main>
        </div>

        {/* FOOTER */}
        {plan === 'free' && (
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 sm:mt-12 md:mt-16 pt-4 sm:pt-6 border-t border-white/10 text-center"
          >
            <p
              className="text-[10px] sm:text-xs flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap px-4"
              style={{ color: getTextColor('muted') }}
            >
              Feito com
              <motion.span animate={performanceConfig.canUseHeavyAnimations ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 1, repeat: Infinity }}>
                <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500 fill-current flex-shrink-0" />
              </motion.span>
              por{" "}
              <Link href={getBaseUrl() + "/"} className="hover:underline font-bold transition-all" style={{ color: userAccentColor }}>
                Freelinnk
              </Link>
            </p>
          </motion.footer>
        )}
      </div>

      {/* STICKY CTA */}
      <AnimatePresence>
        {plan === 'free' && showStickyCTA && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-auto"
          >
            <Link href={getBaseUrl() + "/"}>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-3 rounded-full shadow-2xl font-bold text-white text-sm backdrop-blur-md"
                style={{
                  background: currentHoliday
                    ? `linear-gradient(90deg, ${currentHoliday.colors[0]}, ${currentHoliday.colors[1] || userAccentColor})`
                    : `linear-gradient(90deg, ${userAccentColor}, ${hexToRgba(userAccentColor, 0.8)})`,
                  boxShadow: `0 8px 32px ${hexToRgba(userAccentColor, 0.4)}`,
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
              >
                <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                <span>Crie seu perfil Grátis</span>
              </motion.button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* COOKIE CONSENT */}
      <AnimatePresence>
        {cookieConsent === null && trackingSettings && (trackingSettings.facebookPixelId || trackingSettings.googleAnalyticsId) && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 z-50 flex justify-center"
          >
            <div
              className="max-w-2xl w-full p-4 rounded-2xl shadow-2xl border border-white/10 flex flex-col sm:flex-row items-center gap-4"
              style={{
                background: isDarkMode ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/30 shrink-0">
                <Cookie className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">🍪 Cookies e Privacidade</h3>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Usamos cookies e rastreadores para analisar o tráfego e melhorar sua experiência no perfil de @{username}. Você aceita?
                </p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button onClick={handleDeclineCookies} className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  Recusar
                </button>
                <button
                  onClick={handleAcceptCookies}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-transform hover:scale-105"
                  style={{ background: `linear-gradient(135deg, ${userAccentColor}, ${hexToRgba(userAccentColor, 0.8)})` }}
                >
                  Aceitar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SCROLL TO TOP */}
      <AnimatePresence>
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ delay: 1 }}
          whileHover={{ scale: 1.15, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            if (performanceConfig.canUseParticles) {
              confetti({
                particleCount: 50, spread: 60, origin: { y: 0.8 },
                colors: currentHoliday?.confettiColors || [userAccentColor],
              });
            }
          }}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-2xl flex items-center justify-center text-white z-40 border-2 border-white/20"
          style={{
            background: currentHoliday
              ? `linear-gradient(135deg, ${currentHoliday.colors[0]}, ${currentHoliday.colors[1] || userAccentColor})`
              : `linear-gradient(135deg, ${userAccentColor}, ${hexToRgba(userAccentColor, 0.8)})`,
            boxShadow: `0 4px 20px ${hexToRgba(userAccentColor, 0.5)}`
          }}
        >
          <motion.div animate={performanceConfig.canUseHeavyAnimations ? { y: [-2, 2, -2] } : {}} transition={{ duration: 1.5, repeat: Infinity }}>
            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 rotate-180" />
          </motion.div>
        </motion.button>
      </AnimatePresence>

      {/* ESTILOS GLOBAIS */}
      <style jsx global>{`
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: ${isDarkMode ? 'rgba(17, 24, 39, 0.5)' : 'rgba(243, 244, 246, 0.5)'}; }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, ${userAccentColor}, ${hexToRgba(userAccentColor, 0.7)});
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover { background: ${userAccentColor}; }
        @media (max-width: 640px) { ::-webkit-scrollbar { width: 4px; } }
        * {
          -webkit-tap-highlight-color: transparent;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        html { scroll-behavior: smooth; }
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
        .perspective-1000 { perspective: 1000px; }
        ${currentHoliday ? `
          @keyframes holidayPulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }
          .holiday-glow {
            animation: holidayPulse 2s ease-in-out infinite;
          }
        ` : ''}
      `}</style>
    </div>
  );
}