"use client";

import { api } from "@/convex/_generated/api";
import { Preloaded, usePreloadedQuery, useQuery } from "convex/react";
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
import { useState, useEffect, useRef, useCallback } from "react";
import { trackLinkClick } from "@/lib/analytics";
import confetti, { Shape } from 'canvas-confetti';
import {
  FaFacebook, FaGithub, FaGlobe, FaInstagram,
  FaLinkedin, FaTiktok, FaTwitter, FaYoutube,
  FaWhatsapp,
  FaWaze,
  FaTelegram,
  FaDiscord,
  FaPinterest,
  FaSnapchat,
  FaReddit,
  FaTwitch,
  FaSpotify,
  FaSoundcloud,
  FaAmazon,
  FaPaypal,
  FaPatreon,
  FaBehance,
  FaDribbble,
  FaMedium,
  FaGooglePlay,
  FaAppStore,
  FaUber
} from "react-icons/fa6";
import QRCode from 'qrcode';
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { SubscriptionPlanDetails } from "@/lib/subscription";
import { Doc } from "@/convex/_generated/dataModel";

// --- MAPA DE ÍCONES INTELIGENTE ---
// --- MAPA DE ÍCONES ULTRA INTELIGENTE ---
const ICON_MAP = [
  // 📍 Localização & Mapas
  { match: ['google.com/maps', 'goo.gl/maps', 'maps.google', 'maps.app.goo.gl'], icon: <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#EA4335]" /> },
  { match: ['waze.com', 'waze.to'], icon: <FaWaze className="w-4 h-4 sm:w-5 sm:h-5 text-[#33CCFF]" /> },
  { match: ['maps.apple.com'], icon: <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#8E8E93]" /> },
  { match: ['uber.com'], icon: <FaUber className="w-4 h-4 sm:w-5 sm:h-5 text-black" /> },
  { match: ['99app', '99taxi'], icon: <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFCC00]" /> },

  // 💬 Mensagens & Contato
  { match: ['whatsapp', 'wa.me', 'api.whatsapp'], icon: <FaWhatsapp className="w-4 h-4 sm:w-5 sm:h-5 text-[#25D366]" /> },
  { match: ['t.me', 'telegram'], icon: <FaTelegram className="w-4 h-4 sm:w-5 sm:h-5 text-[#0088cc]" /> },
  { match: ['discord.com', 'discord.gg'], icon: <FaDiscord className="w-4 h-4 sm:w-5 sm:h-5 text-[#5865F2]" /> },
  { match: ['mailto:'], icon: <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-[#EA4335]" /> },
  { match: ['tel:', 'callto:'], icon: <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-[#34A853]" /> },
  { match: ['skype.com', 'skype:'], icon: <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-[#00AFF0]" /> },
  { match: ['zoom.us', 'zoom.com'], icon: <Video className="w-4 h-4 sm:w-5 sm:h-5 text-[#2D8CFF]" /> },
  { match: ['meet.google', 'hangouts'], icon: <Video className="w-4 h-4 sm:w-5 sm:h-5 text-[#00897B]" /> },
  { match: ['teams.microsoft', 'teams.live'], icon: <Video className="w-4 h-4 sm:w-5 sm:h-5 text-[#6264A7]" /> },

  // 📸 Redes Sociais
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

  // 🎥 Vídeo & Streaming
  { match: ['youtube.com', 'youtu.be', 'youtube.com/@'], icon: <FaYoutube className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF0000]" /> },
  { match: ['twitch.tv'], icon: <FaTwitch className="w-4 h-4 sm:w-5 sm:h-5 text-[#9146FF]" /> },
  { match: ['netflix.com'], icon: <Video className="w-4 h-4 sm:w-5 sm:h-5 text-[#E50914]" /> },
  { match: ['primevideo', 'amazon.com/prime'], icon: <Video className="w-4 h-4 sm:w-5 sm:h-5 text-[#00A8E1]" /> },
  { match: ['disneyplus', 'disney.com'], icon: <Video className="w-4 h-4 sm:w-5 sm:h-5 text-[#113CCF]" /> },
  { match: ['hbomax', 'max.com'], icon: <Video className="w-4 h-4 sm:w-5 sm:h-5 text-[#B535F6]" /> },
  { match: ['vimeo.com'], icon: <Video className="w-4 h-4 sm:w-5 sm:h-5 text-[#1AB7EA]" /> },
  { match: ['dailymotion'], icon: <Video className="w-4 h-4 sm:w-5 sm:h-5 text-[#0066DC]" /> },
  { match: ['kick.com'], icon: <Video className="w-4 h-4 sm:w-5 sm:h-5 text-[#53FC18]" /> },
  { match: ['rumble.com'], icon: <Video className="w-4 h-4 sm:w-5 sm:h-5 text-[#85C742]" /> },

  // 🎵 Música & Podcast
  { match: ['spotify.com', 'open.spotify'], icon: <FaSpotify className="w-4 h-4 sm:w-5 sm:h-5 text-[#1DB954]" /> },
  { match: ['soundcloud.com'], icon: <FaSoundcloud className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF5500]" /> },
  { match: ['music.apple.com', 'itunes.apple'], icon: <Music className="w-4 h-4 sm:w-5 sm:h-5 text-[#FA243C]" /> },
  { match: ['deezer.com'], icon: <Music className="w-4 h-4 sm:w-5 sm:h-5 text-[#FEAA2D]" /> },
  { match: ['tidal.com'], icon: <Music className="w-4 h-4 sm:w-5 sm:h-5 text-[#000000] dark:text-white" /> },
  { match: ['music.youtube', 'youtubemusic'], icon: <Music className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF0000]" /> },
  { match: ['podcasts.apple', 'podcasts.google', 'anchor.fm', 'spreaker', 'podbean'], icon: <Music className="w-4 h-4 sm:w-5 sm:h-5 text-[#8940FA]" /> },

  // 🛍️ E-commerce & Pagamentos
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

  // 💻 Dev & Design
  { match: ['github.com', 'github.io'], icon: <FaGithub className="w-4 h-4 sm:w-5 sm:h-5 text-[#181717] dark:text-white" /> },
  { match: ['gitlab.com'], icon: <FaGithub className="w-4 h-4 sm:w-5 sm:h-5 text-[#FC6D26]" /> },
  { match: ['bitbucket.org'], icon: <FaGithub className="w-4 h-4 sm:w-5 sm:h-5 text-[#0052CC]" /> },
  { match: ['behance.net'], icon: <FaBehance className="w-4 h-4 sm:w-5 sm:h-5 text-[#1769FF]" /> },
  { match: ['dribbble.com'], icon: <FaDribbble className="w-4 h-4 sm:w-5 sm:h-5 text-[#EA4C89]" /> },
  { match: ['figma.com'], icon: <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#F24E1E]" /> },
  { match: ['codepen.io'], icon: <FaGithub className="w-4 h-4 sm:w-5 sm:h-5 text-[#000000] dark:text-white" /> },
  { match: ['stackoverflow.com'], icon: <FaGithub className="w-4 h-4 sm:w-5 sm:h-5 text-[#F58025]" /> },
  { match: ['dev.to'], icon: <FaGithub className="w-4 h-4 sm:w-5 sm:h-5 text-[#0A0A0A] dark:text-white" /> },
  { match: ['notion.so', 'notion.site'], icon: <FaGithub className="w-4 h-4 sm:w-5 sm:h-5 text-[#000000] dark:text-white" /> },
  { match: ['canva.com'], icon: <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#00C4CC]" /> },

  // 📰 Blog & Conteúdo
  { match: ['medium.com'], icon: <FaMedium className="w-4 h-4 sm:w-5 sm:h-5 text-[#000000] dark:text-white" /> },
  { match: ['substack.com'], icon: <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF6719]" /> },
  { match: ['wordpress.com', 'wp.com'], icon: <FaGlobe className="w-4 h-4 sm:w-5 sm:h-5 text-[#21759B]" /> },
  { match: ['blogger.com', 'blogspot'], icon: <FaGlobe className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF5722]" /> },
  { match: ['tumblr.com'], icon: <FaGlobe className="w-4 h-4 sm:w-5 sm:h-5 text-[#36465D]" /> },

  // 📱 Apps & Stores
  { match: ['play.google.com', 'market://'], icon: <FaGooglePlay className="w-4 h-4 sm:w-5 sm:h-5 text-[#3BCCFF]" /> },
  { match: ['apps.apple.com', 'itunes.apple.com/app'], icon: <FaAppStore className="w-4 h-4 sm:w-5 sm:h-5 text-[#0D96F6]" /> },

  // 🎮 Games
  { match: ['store.steampowered', 'steamcommunity'], icon: <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#1B2838]" /> },
  { match: ['epicgames.com'], icon: <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#000000] dark:text-white" /> },
  { match: ['playstation.com', 'store.playstation'], icon: <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#003791]" /> },
  { match: ['xbox.com'], icon: <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#107C10]" /> },
  { match: ['nintendo.com'], icon: <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#E60012]" /> },
  { match: ['roblox.com'], icon: <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#E2231A]" /> },

  // 📅 Agendamento & Eventos
  { match: ['calendly.com'], icon: <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#006BFF]" /> },
  { match: ['cal.com'], icon: <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#292929] dark:text-white" /> },
  { match: ['eventbrite.com'], icon: <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#F05537]" /> },
  { match: ['sympla.com.br'], icon: <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#52BE80]" /> },
  { match: ['meetup.com'], icon: <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#ED1C40]" /> },

  // 📚 Educação
  { match: ['udemy.com'], icon: <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#A435F0]" /> },
  { match: ['coursera.org'], icon: <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#0056D2]" /> },
  { match: ['alura.com.br'], icon: <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#0066CC]" /> },
  { match: ['rocketseat.com.br'], icon: <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#8257E5]" /> },

  // 🎉 Aniversários & Celebrações
  { match: ['bday', 'birthday', 'aniversario', 'festa'], icon: <Cake className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF0080]" /> },

  // 📄 Documentos & Arquivos
  { match: ['drive.google', 'docs.google', 'sheets.google', 'slides.google'], icon: <FaGlobe className="w-4 h-4 sm:w-5 sm:h-5 text-[#4285F4]" /> },
  { match: ['dropbox.com'], icon: <FaGlobe className="w-4 h-4 sm:w-5 sm:h-5 text-[#0061FF]" /> },
  { match: ['onedrive.live', 'sharepoint'], icon: <FaGlobe className="w-4 h-4 sm:w-5 sm:h-5 text-[#0078D4]" /> },
  { match: ['.pdf'], icon: <FaGlobe className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF0000]" /> },

  // 🔒 Segurança & Auth
  { match: ['bit.ly', 'tinyurl', 'short.io', 'rebrand.ly', 'ow.ly'], icon: <LinkIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#EE6123]" /> },
];

// 🔥 FUNÇÃO ULTRA INTELIGENTE PARA DETECTAR ÍCONES
function getLinkIcon(url: string, title: string): React.ReactNode {
  if (!url) return <LinkIcon className="w-4 h-4 sm:w-5 sm:h-5" />;

  const u = url.toLowerCase();
  const t = title?.toLowerCase() || "";


  // 1. Verifica no Mapa de Ícones Específicos (prioridade máxima)
  for (const item of ICON_MAP) {
    if (item.match.some(match => u.includes(match))) {
      return item.icon;
    }
  }

  // 2. Detecção inteligente por palavras-chave no TÍTULO
  const titleKeywords: Record<string, React.ReactNode> = {
    // Pessoas & Cargos
    'ceo': <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />,
    'fundador': <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />,
    'founder': <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />,
    'diretor': <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />,
    'gerente': <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />,
    'vendedor': <User className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />,
    'suporte': <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />,
    'atendimento': <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />,
    'contato': <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />,

    // Ações
    'comprar': <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />,
    'compre': <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />,
    'loja': <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />,
    'store': <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />,
    'shop': <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />,
    'catálogo': <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />,
    'cardápio': <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />,
    'menu': <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />,
    'pedido': <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />,
    'delivery': <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />,
    'entrega': <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />,

    // Doações
    'doar': <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />,
    'donate': <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />,
    'apoie': <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />,
    'apoiar': <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />,
    'contribua': <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />,
    'pix': <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-teal-500" />,

    // Localização
    'endereço': <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />,
    'localização': <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />,
    'location': <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />,
    'como chegar': <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />,
    'mapa': <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />,
    'rota': <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />,

    // Agenda
    'agendar': <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />,
    'agenda': <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />,
    'marcar': <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />,
    'consulta': <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />,
    'horário': <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />,
    'reserva': <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />,
    'evento': <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />,

    // Conteúdo
    'blog': <FaMedium className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300" />,
    'artigo': <FaMedium className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300" />,
    'post': <FaMedium className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300" />,
    'podcast': <Music className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />,
    'música': <Music className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />,
    'music': <Music className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />,
    'vídeo': <Video className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />,
    'video': <Video className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />,
    'live': <Video className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />,
    'ao vivo': <Video className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />,

    // Profissional
    'currículo': <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />,
    'cv': <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />,
    'resume': <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />,
    'portfolio': <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />,
    'portfólio': <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />,
    'trabalhos': <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />,
    'projetos': <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />,

    // Cursos & Educação
    'curso': <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />,
    'aula': <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />,
    'mentoria': <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />,
    'ebook': <FaGlobe className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />,
    'e-book': <FaGlobe className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />,
    'material': <FaGlobe className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />,
    'download': <Download className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />,
    'baixar': <Download className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />,

    // Comunidade
    'grupo': <FaDiscord className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />,
    'comunidade': <FaDiscord className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />,
    'community': <FaDiscord className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />,
    'newsletter': <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />,
    'inscreva': <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />,

    // Promoções
    'promoção': <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />,
    'oferta': <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />,
    'desconto': <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />,
    'cupom': <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />,
    'black friday': <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900 dark:text-white" />,

    // Celebração
    'aniversário': <Cake className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />,
    'birthday': <Cake className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />,
    'casamento': <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />,
    'wedding': <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />,
    'festa': <Cake className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />,
    'party': <Cake className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />,
  };

  // Verifica palavras-chave no título
  for (const [keyword, icon] of Object.entries(titleKeywords)) {
    if (t.includes(keyword)) {
      return icon;
    }
  }

  // 3. Detecção por padrões na URL
  if (u.includes('map') || u.includes('rua') || u.includes('avenida') || u.includes('local') || u.includes('endereco'))
    return <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#EA4335]" />;

  if (u.includes('contato') || u.includes('fale') || u.includes('contact'))
    return <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-[#EA4335]" />;

  if (u.includes('agenda') || u.includes('cal') || u.includes('booking') || u.includes('schedule'))
    return <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#3b82f6]" />;

  if (u.includes('form') || u.includes('typeform') || u.includes('jotform') || u.includes('google.com/forms'))
    return <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-[#673AB7]" />;

  if (u.includes('survey') || u.includes('pesquisa') || u.includes('enquete'))
    return <Star className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFC107]" />;

  // 4. Fallback Padrão
  return <FaGlobe className="w-4 h-4 sm:w-5 sm:h-5 text-[#6366f1]" />;
}

interface BackgroundConfig {
  type: "color" | "gradient" | "image";
  style: "full" | "header";
  color1: string;
  color2: string;
  imageUrl: string;
  imageBlur: number;
  imageOpacity: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
}

interface ConfettiOptions {
  spread?: number;
  startVelocity?: number;
  decay?: number;
  scalar?: number;
  particleCount?: number;
  origin?: { y: number; x?: number };
  colors?: string[];
  shapes?: Shape[];
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

    const colors = [
      color,
      color.replace('0.4', '0.6'),
      color.replace('0.4', '0.3'),
    ];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * (isMobile ? 1.5 : 2.5) + 0.5,
        opacity: Math.random() * 0.4 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    let mouseX = -100;
    let mouseY = -100;
    let isMouseActive = false;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      isMouseActive = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
        isMouseActive = true;
      }
    };

    const handleMouseLeave = () => {
      isMouseActive = false;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTimeRef.current;

      if (deltaTime < 16.67) {
        frameRef.current = requestAnimationFrame(animate);
        return;
      }

      lastTimeRef.current = currentTime;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, i) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (isMouseActive) {
          const dx = mouseX - particle.x;
          const dy = mouseY - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            const force = (150 - distance) / 150;
            particle.vx += (dx / distance) * force * 0.03;
            particle.vy += (dy / distance) * force * 0.03;
          }
        }

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        particle.vx *= 0.98;
        particle.vy *= 0.98;

        ctx.shadowBlur = 15;
        ctx.shadowColor = particle.color;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color.replace(/[\d.]+\)$/g, `${particle.opacity})`);
        ctx.fill();

        ctx.shadowBlur = 0;

        if (!isMobile) {
          for (let j = i + 1; j < particles.length; j++) {
            const other = particles[j];
            const dx = other.x - particle.x;
            const dy = other.y - particle.y;
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

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.5 }}
    />
  );
}

// 🔥 NOVO BADGE ULTRA - ESTILO INSTAGRAM VERIFICADO
function VerifiedBadge({ size = "default", plan = "free" }: { size?: "default" | "large"; plan?: string }) {
  const sizeClasses = size === "large" ? "w-7 h-7 sm:w-8 sm:h-8" : "w-5 h-5 sm:w-6 sm:h-6";

  const getBadgeConfig = () => {
    switch(plan) {
      case 'ultra':
        // 🔥 BADGE ULTRA ESTILO INSTAGRAM - Azul vibrante com check branco
        return {
          gradient: 'from-[#0095F6] to-[#0095F6]', // Azul Instagram
          icon: <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white stroke-[3]" />,
          glow: 'shadow-[0_0_20px_rgba(0,149,246,0.8)]',
          isUltra: true
        };
      case 'premium':
        return {
          gradient: 'from-purple-500 via-pink-500 to-purple-600',
          icon: <Star className="w-3 h-3 sm:w-4 sm:h-4 text-white" />,
          glow: 'shadow-[0_0_20px_rgba(168,85,247,0.6)]',
          isUltra: false
        };
      case 'pro':
        return {
          gradient: 'from-blue-500 via-cyan-500 to-blue-600',
          icon: <Gem className="w-3 h-3 sm:w-4 sm:h-4 text-white" />,
          glow: 'shadow-[0_0_20px_rgba(59,130,246,0.6)]',
          isUltra: false
        };
      case 'business':
        return {
          gradient: 'from-yellow-500 via-orange-500 to-yellow-600',
          icon: <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-white" />,
          glow: 'shadow-[0_0_20px_rgba(234,179,8,0.6)]',
          isUltra: false
        };
      case 'enterprise':
        return {
          gradient: 'from-red-500 via-pink-500 to-red-600',
          icon: <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-white" />,
          glow: 'shadow-[0_0_20px_rgba(239,68,68,0.6)]',
          isUltra: false
        };
      default:
        return {
          gradient: 'from-gray-400 to-gray-600',
          icon: <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />,
          glow: '',
          isUltra: false
        };
    }
  };

  const config = getBadgeConfig();

  // 🔥 BADGE ULTRA ESPECIAL - Idêntico ao Instagram
  if (config.isUltra) {
    return (
      <motion.span
        className={`inline-flex items-center justify-center ${sizeClasses} rounded-full bg-[#0095F6] ${config.glow} transition-all duration-300 flex-shrink-0 relative`}
        title="Conta Verificada Ultra"
        whileHover={{
          scale: 1.15,
        }}
        transition={{ duration: 0.2 }}
      >
        {/* Glow pulsante */}
        <motion.span
          className="absolute inset-0 rounded-full bg-[#0095F6]"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        {/* Check branco centralizado */}
        <span className="relative z-10 flex items-center justify-center">
          <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white stroke-[3]" />
        </span>
      </motion.span>
    );
  }

  // Badges para outros planos
  return (
    <motion.span
      className={`inline-flex items-center justify-center ${sizeClasses} rounded-full bg-gradient-to-r ${config.gradient} ${config.glow} transition-all duration-300 flex-shrink-0 relative overflow-hidden`}
      title={`Plano ${plan.charAt(0).toUpperCase() + plan.slice(1)}`}
      whileHover={{
        rotate: [0, -10, 10, -10, 0],
        scale: 1.2,
      }}
      transition={{ duration: 0.5 }}
    >
      <motion.span
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
        animate={{
          x: ['-200%', '200%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      <span className={`absolute inset-0 rounded-full bg-gradient-to-r ${config.gradient} blur-md opacity-50 animate-pulse`} />
      <span className="relative z-10">
        {config.icon}
      </span>
    </motion.span>
  );
}

interface PublicPageContentProps {
  username: string;
  preloadedLinks: Preloaded<typeof api.lib.links.getLinksBySlug>;
  preloadedCustomizations: Preloaded<typeof api.lib.customizations.getCustomizationsBySlug>;
  plan: SubscriptionPlanDetails['plan'];
}

type LinkType = Doc<"links"> & { thumbnailUrl?: string };

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

  const [shared, setShared] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [linkReactions, setLinkReactions] = useState<Record<string, number>>({});
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [clickCounts, setClickCounts] = useState<Record<string, number>>({});
  const [joinDate] = useState<string>(customizations?._creationTime ? new Date(customizations._creationTime).getFullYear().toString() : "2024");
  const [backgroundConfig, setBackgroundConfig] = useState<BackgroundConfig>({
    type: "color",
    style: "full",
    color1: "#f3f4f6",
    color2: "#e5e7eb",
    imageUrl: "",
    imageBlur: 0,
    imageOpacity: 100,
  });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [cookieConsent, setCookieConsent] = useState<"granted" | "denied" | null>(null);

  const links = usePreloadedQuery(preloadedLinks);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const hexToRgba = useCallback((hex: string, alpha: number) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})/i.exec(hex);
    return result
      ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`
      : `rgba(99, 102, 241, ${alpha})`;
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowStickyCTA(true);
      } else {
        setShowStickyCTA(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const savedConsent = localStorage.getItem('freelinnk_cookie_consent');
    if (savedConsent === 'granted' || savedConsent === 'denied') {
      setCookieConsent(savedConsent);
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
    if (savedReactions) {
      setLinkReactions(JSON.parse(savedReactions));
    }

    const savedClicks = localStorage.getItem(`clicks_${username}`);
    if (savedClicks) {
      setClickCounts(JSON.parse(savedClicks));
    }

    const stats = JSON.parse(localStorage.getItem(`stats_${username}`) || '{}');
    stats.views = (stats.views || 0) + 1;
    localStorage.setItem(`stats_${username}`, JSON.stringify(stats));

    QRCode.toDataURL(profileUrl, {
      width: 256,
      margin: 2,
      color: {
        dark: userAccentColor,
        light: '#FFFFFF',
      },
    }).then(setQrCodeDataUrl);

    setTimeout(() => setIsLoading(false), 1200);
  }, [profileUrl, username, userAccentColor, customizations]);

  const handleShare = async () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      colors: [userAccentColor, '#ff00ff', '#00ffff', '#ffff00', '#ff0080']
    };

    function fire(particleRatio: number, opts: ConfettiOptions) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });

    if (navigator.share) {
      try {
        await navigator.share({
          title: `@${username} | Freelinnk`,
          text: `Confira o perfil de @${username}!`,
          url: profileUrl,
        });
        setShared(true);

        const stats = JSON.parse(localStorage.getItem(`stats_${username}`) || '{}');
        stats.shares = (stats.shares || 0) + 1;
        localStorage.setItem(`stats_${username}`, JSON.stringify(stats));

        setTimeout(() => setShared(false), 2000);
      } catch {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(profileUrl);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const handleReaction = (linkId: string) => {
    const newReactions = {
      ...linkReactions,
      [linkId]: (linkReactions[linkId] || 0) + 1
    };
    setLinkReactions(newReactions);
    localStorage.setItem(`reactions_${username}`, JSON.stringify(newReactions));

    const stats = JSON.parse(localStorage.getItem(`stats_${username}`) || '{}');
    stats.likes = (stats.likes || 0) + 1;
    localStorage.setItem(`stats_${username}`, JSON.stringify(stats));

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff0000', '#ff69b4', '#ff1493', '#ff0080'],
      shapes: ['circle'],
      scalar: 1.2,
      gravity: 0.5,
    });
  };

  const handleTrack = (link: LinkType) => {
    let visitorId = localStorage.getItem("visitorId");
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem("visitorId", visitorId);
    }

    trackLinkClick({
      profileUsername: username,
      linkId: link._id,
      linkTitle: link.title,
      linkUrl: link.url,
      visitorId,
    });

    const newClicks = {
      ...clickCounts,
      [link._id]: (clickCounts[link._id] || 0) + 1
    };
    setClickCounts(newClicks);
    localStorage.setItem(`clicks_${username}`, JSON.stringify(newClicks));

    const stats = JSON.parse(localStorage.getItem(`stats_${username}`) || '{}');
    stats.clicks = (stats.clicks || 0) + 1;
    localStorage.setItem(`stats_${username}`, JSON.stringify(stats));
  };

  const handleAcceptCookies = () => {
    setCookieConsent('granted');
    localStorage.setItem('freelinnk_cookie_consent', 'granted');
  };

  const handleDeclineCookies = () => {
    setCookieConsent('denied');
    localStorage.setItem('freelinnk_cookie_consent', 'denied');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${userAccentColor}, ${userAccentColor}dd)`
          }}
        />
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
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
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
              <motion.div
                className="absolute inset-0 m-auto w-8 h-8 sm:w-12 sm:h-12 bg-white rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
            <motion.div
              className="flex flex-col items-center gap-2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white px-4 text-center">
                Carregando Experiência
              </h2>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  const getBackgroundStyle = () => {
    if (backgroundConfig.type === "color") {
      return { background: backgroundConfig.color1 };
    } else if (backgroundConfig.type === "gradient") {
      return {
        background: `linear-gradient(135deg, ${backgroundConfig.color1}, ${backgroundConfig.color2})`
      };
    }
    return {};
  };

  // 🔥 FUNÇÃO PARA PROTEGER TEXTOS - Retorna classes CSS para texto visível em qualquer fundo
 const getProtectedTextClasses = () => {
  return ""; // Removido completamente - texto limpo
};
// 🔥 DETECTA SE É LINK DE CTA (Call-to-Action)
const isCtaLink = (url: string, title: string): boolean => {
  const ctaKeywords = [
    'comprar', 'compre', 'buy', 'shop', 'loja', 'store',
    'agendar', 'agenda', 'marcar', 'reservar', 'booking',
    'whatsapp', 'wa.me', 'chamar', 'contato', 'falar',
    'inscrever', 'cadastrar', 'register', 'signup',
    'baixar', 'download', 'grátis', 'free',
    'oferta', 'promoção', 'desconto', 'cupom'
  ];
  const combined = `${url} ${title}`.toLowerCase();
  return ctaKeywords.some(keyword => combined.includes(keyword));
};

// ✨ DETECTA SE LINK É NOVO (menos de 7 dias)
const isNewLink = (creationTime: number): boolean => {
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  return creationTime > sevenDaysAgo;
};



  return (
    <div className={`min-h-screen w-full overflow-x-hidden transition-colors duration-500 ${isDarkMode ? 'dark' : ''}`}>

      {cookieConsent === 'granted' && trackingSettings && (
        <>
          {trackingSettings.googleAnalyticsId && (
            <>
              <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${trackingSettings.googleAnalyticsId}`}
                strategy="afterInteractive"
              />
              <Script id="google-analytics" strategy="afterInteractive">
                {`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${trackingSettings.googleAnalyticsId}');
                `}
              </Script>
            </>
          )}

          {trackingSettings.facebookPixelId && (
            <Script id="facebook-pixel" strategy="afterInteractive">
              {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${trackingSettings.facebookPixelId}');
                fbq('track', 'PageView');
              `}
            </Script>
          )}
        </>
      )}

      {backgroundConfig.type !== "image" && (
        <ParticleField color={hexToRgba(userAccentColor, 0.4)} />
      )}

      <motion.div
        className="fixed top-0 left-0 right-0 h-1 transform-origin-0 z-50"
        style={{
          scaleX,
          background: `linear-gradient(90deg, ${userAccentColor}, ${hexToRgba(userAccentColor, 0.5)})`
        }}
      />

      <div className="fixed inset-0" style={getBackgroundStyle()}>
        {backgroundConfig.type === "image" && backgroundConfig.imageUrl && backgroundConfig.style === "full" && (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${backgroundConfig.imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: `blur(${backgroundConfig.imageBlur}px)`,
              opacity: backgroundConfig.imageOpacity / 100,
            }}
          />
        )}
        {backgroundConfig.type === "image" && (
          <div className="absolute inset-0 bg-black/20 dark:bg-black/40" />
        )}
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
      </div>

      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative h-48 sm:h-64 md:h-80 overflow-hidden"
      >
        {backgroundConfig.type === "image" && backgroundConfig.imageUrl && backgroundConfig.style === "header" ? (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${backgroundConfig.imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: `blur(${backgroundConfig.imageBlur}px)`,
              opacity: backgroundConfig.imageOpacity / 100,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
          </div>
        ) : (
          <motion.div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${userAccentColor}, ${userAccentColor}dd)`,
              clipPath: "polygon(0 0, 100% 0, 100% 85%, 0 100%)",
            }}
            animate={{
              background: [
                `linear-gradient(135deg, ${userAccentColor}, ${userAccentColor}dd)`,
                `linear-gradient(135deg, ${userAccentColor}dd, ${userAccentColor})`,
                `linear-gradient(135deg, ${userAccentColor}, ${userAccentColor}dd)`,
              ]
            }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            <div className="absolute inset-0 bg-black/10" />
            <motion.div
              className="absolute inset-0 opacity-30"
              style={{
                background: `linear-gradient(45deg, transparent 30%, ${hexToRgba(userAccentColor, 0.3)} 50%, transparent 70%)`
              }}
              animate={{
                x: ['-200%', '200%']
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </motion.div>
        )}

        <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 flex justify-between items-center z-20">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-2xl text-white border border-white/20 hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
            style={{
              boxShadow: `0 4px 20px ${hexToRgba(userAccentColor, 0.3)}`
            }}
          >
            <AnimatePresence mode="wait">
              {isDarkMode ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -180, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 180, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 180, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -180, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowQRCode(!showQRCode)}
              className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-2xl text-white border border-white/20 hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
              style={{
                boxShadow: `0 4px 20px ${hexToRgba(userAccentColor, 0.3)}`
              }}
              title="Ver QR Code"
            >
              <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl backdrop-blur-2xl text-white border border-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
              style={{
                background: shared
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.4), rgba(5, 150, 105, 0.4))'
                  : 'rgba(255, 255, 255, 0.1)',
                boxShadow: `0 4px 20px ${hexToRgba(userAccentColor, 0.3)}`
              }}
              title={shared ? "Link copiado!" : "Compartilhar"}
            >
              <AnimatePresence mode="wait">
                {shared ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                  >
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="share"
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: -180 }}
                  >
                    <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {showQRCode && qrCodeDataUrl && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="fixed top-20 right-4 sm:right-8 z-50 rounded-xl sm:rounded-2xl border border-white/20 shadow-2xl p-3 sm:p-4 w-auto max-w-[calc(100vw-2rem)]"
              style={{
                background: isDarkMode
                  ? 'rgba(17, 24, 39, 0.95)'
                  : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                boxShadow: `0 8px 32px ${hexToRgba(userAccentColor, 0.3)}`
              }}
            >
              <div className="flex flex-col items-center gap-2 sm:gap-3">
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                >
                  <div
                    className="absolute inset-0 rounded-lg blur-xl opacity-50"
                    style={{ background: userAccentColor }}
                  />
                  <img
                    src={qrCodeDataUrl}
                    alt="QR Code"
                    className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-lg relative z-10"
                  />
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const link = document.createElement('a');
                    link.download = `${username}-qrcode.png`;
                    link.href = qrCodeDataUrl;
                    link.click();
                    confetti({
                      particleCount: 100,
                      spread: 70,
                      origin: { y: 0.6 }
                    });
                  }}
                  className="flex items-center gap-2 px-3 py-2 sm:px-4 text-xs sm:text-sm text-white rounded-lg sm:rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                  style={{
                    background: `linear-gradient(135deg, ${userAccentColor}, ${hexToRgba(userAccentColor, 0.8)})`,
                  }}
                >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                  Baixar QR Code
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="relative -mt-24 sm:-mt-32 md:-mt-40 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-8 sm:pb-12 md:pb-16 w-full">
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          <motion.aside
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="lg:sticky lg:top-8 space-y-3 sm:space-y-4">
              {/* 🔥 CARD DO PERFIL - TRANSPARENTE */}
              <motion.div
                className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-5 md:p-6 shadow-2xl border border-white/20 dark:border-white/10"
                style={{
                  // 🔥 CARDS TRANSPARENTES - Glassmorphism melhorado
                  background: backgroundConfig.type === "image"
                    ? 'rgba(255, 255, 255, 0.15)'
                    : isDarkMode
                      ? 'rgba(17, 24, 39, 0.6)'
                      : 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  boxShadow: `0 8px 32px ${hexToRgba(userAccentColor, 0.2)}, inset 0 0 0 1px rgba(255,255,255,0.1)`
                }}
                whileHover={{ y: -5, boxShadow: `0 12px 40px ${hexToRgba(userAccentColor, 0.3)}` }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                <motion.div
                  className="absolute inset-0 rounded-2xl sm:rounded-3xl"
                  style={{
                    background: `linear-gradient(135deg, ${userAccentColor}20, transparent)`,
                  }}
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />

                <div className="relative z-10">
                  <div className="flex justify-center mb-4 sm:mb-5 md:mb-6">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative group cursor-pointer"
                    >
                      <motion.div
                        className="absolute inset-0 rounded-full blur-2xl opacity-0 group-hover:opacity-75 transition-opacity duration-500"
                        style={{ background: userAccentColor }}
                        animate={{
                          scale: [1, 1.2, 1],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <motion.div
                        className="absolute inset-0 rounded-full border-4 opacity-0 group-hover:opacity-100"
                        style={{ borderColor: userAccentColor }}
                        animate={{
                          scale: [1, 1.3],
                          opacity: [1, 0],
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />

                      {customizations?.profilePictureUrl ? (
                        <div className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full overflow-hidden shadow-2xl bg-white p-1 border-4 relative z-10"
                          style={{
                            borderColor: userAccentColor,
                            boxShadow: `0 0 30px ${hexToRgba(userAccentColor, 0.5)}`
                          }}
                        >
                          <Image
                            src={customizations.profilePictureUrl}
                            alt={`${username}'s profile`}
                            width={160}
                            height={160}
                            className="w-full h-full object-cover rounded-full"
                            priority
                            loading="eager"
                          />
                        </div>
                      ) : (
                        <motion.div
                          className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full flex items-center justify-center shadow-2xl border-4 border-white dark:border-gray-800 relative z-10"
                          style={{
                            background: `linear-gradient(135deg, ${userAccentColor}, ${userAccentColor}dd)`,
                            boxShadow: `0 0 30px ${hexToRgba(userAccentColor, 0.5)}`
                          }}
                          animate={{
                            boxShadow: [
                              `0 0 30px ${hexToRgba(userAccentColor, 0.5)}`,
                              `0 0 40px ${hexToRgba(userAccentColor, 0.7)}`,
                              `0 0 30px ${hexToRgba(userAccentColor, 0.5)}`,
                            ]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <User className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-white" />
                        </motion.div>
                      )}
                    </motion.div>
                  </div>

                  <div className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
                      {/* 🔥 NOME DO USUÁRIO COM PROTEÇÃO DE TEXTO */}
                     <motion.h1
  className="text-2xl sm:text-3xl font-black break-all"
  style={{
    color: userAccentColor,
  }}
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
                          <p className={`text-[11px] font-medium ${getProtectedTextClasses()}`}
                            style={{ color: isDarkMode ? '#e5e7eb' : '#4b5563' }}
                          >
                            Crie seu perfil grátis no <span className="font-bold text-purple-600 dark:text-purple-400">Freelinnk</span>
                          </p>
                        </motion.div>
                      </Link>
                    )}

                    {/* 🔥 DESCRIÇÃO COM PROTEÇÃO DE TEXTO */}
                    {customizations?.description && (
                      <motion.p
                        className={`text-base sm:text-lg leading-relaxed px-4 ${getProtectedTextClasses()}`}
                        style={{ color: isDarkMode ? '#d1d5db' : '#4b5563' }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        {customizations.description}
                      </motion.p>
                    )}

                    {/* 🔥 DATA COM PROTEÇÃO DE TEXTO */}
                    <div className={`flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm flex-wrap pt-2 ${getProtectedTextClasses()}`}
                      style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
                    >
                      <motion.div
                        className="flex items-center gap-1"
                        whileHover={{ scale: 1.05 }}
                      >
                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>Desde {joinDate}</span>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.aside>

          {/* Links Section */}
          <motion.main
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-2 w-full max-w-full"
          >
            <div className="space-y-3 sm:space-y-4">
              {/* 🔥 CARD DOS LINKS - TRANSPARENTE */}
              <motion.div
                className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl border border-white/20 dark:border-white/10"
                style={{
                  // 🔥 CARDS TRANSPARENTES - Glassmorphism melhorado
                  background: backgroundConfig.type === "image"
                    ? 'rgba(255, 255, 255, 0.15)'
                    : isDarkMode
                      ? 'rgba(17, 24, 39, 0.6)'
                      : 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  boxShadow: `0 8px 32px ${hexToRgba(userAccentColor, 0.2)}, inset 0 0 0 1px rgba(255,255,255,0.1)`
                }}
                whileHover={{ y: -2 }}
              >
                {/* Glassmorphism overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    {/* 🔥 TÍTULO DOS LINKS COM PROTEÇÃO */}
                    <motion.h2
                      className={`text-lg sm:text-xl md:text-2xl font-black flex items-center gap-1.5 sm:gap-2 ${getProtectedTextClasses()}`}
                      style={{
                        color: userAccentColor,
                      }}
                    >
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: userAccentColor }} />
                      </motion.div>
                      Links
                    </motion.h2>
                  </div>

                  {/* Links List */}
                  <div className="space-y-2 sm:space-y-2.5">
                    {links && links.length > 0 ? (
  links.map((link, index) => {
    const isCta = isCtaLink(link.url, link.title);
    const isNew = isNewLink(link._creationTime);

    return (
      <motion.div
        key={link._id}
        initial={{ opacity: 0, x: -50, rotateY: -15 }}
        animate={{ opacity: 1, x: 0, rotateY: 0 }}
        transition={{
          delay: index * 0.08,
          type: "spring",
          stiffness: 120,
          damping: 14
        }}
        whileHover={{
          scale: isCta ? 1.05 : 1.03,
          x: 8,
          transition: { type: "spring", stiffness: 400 }
        }}
        whileTap={{ scale: 0.98 }}
        onHoverStart={() => setHoveredLink(link._id)}
        onHoverEnd={() => setHoveredLink(null)}
        className="w-full max-w-full perspective-1000"
      >
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`group relative flex items-center gap-2.5 sm:gap-3 w-full rounded-xl sm:rounded-2xl p-3 sm:p-3.5 md:p-4 font-bold text-sm sm:text-base transition-all duration-300 overflow-hidden ring-offset-[var(--ring-offset-color)] ring-[var(--ring-color)] ${
            isCta ? 'ring-2 ring-offset-2' : ''
          }`}
          style={{
            background: isCta
              ? `linear-gradient(135deg, ${hexToRgba(userAccentColor, 0.15)}, ${hexToRgba(userAccentColor, 0.05)})`
              : backgroundConfig.type === "image"
                ? 'rgba(255, 255, 255, 0.2)'
                : isDarkMode
                  ? 'rgba(31, 41, 55, 0.5)'
                  : 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderWidth: isCta ? '2px' : '2px',
            borderStyle: 'solid',
            borderColor: isCta
              ? userAccentColor
              : hoveredLink === link._id
                ? userAccentColor
                : 'rgba(255,255,255,0.2)',
            boxShadow: isCta
              ? `0 0 25px ${hexToRgba(userAccentColor, 0.3)}, 0 4px 15px rgba(0,0,0,0.1)`
              : hoveredLink === link._id
                ? `0 0 30px ${hexToRgba(userAccentColor, 0.4)}`
                : '0 2px 8px rgba(0,0,0,0.1)',
            '--ring-color': isCta ? userAccentColor : 'transparent',
            '--ring-offset-color': isDarkMode ? '#111827' : '#ffffff',
          } as React.CSSProperties}
          onClick={() => handleTrack(link)}
        >
          {/* 🔥 CTA Pulse Animation */}
          {isCta && (
            <motion.div
              className="absolute inset-0 rounded-xl sm:rounded-2xl"
              style={{
                border: `2px solid ${userAccentColor}`,
              }}
              animate={{
                scale: [1, 1.02, 1],
                opacity: [0.5, 0.2, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}

          {/* Gradient overlay animado */}
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100"
            initial={false}
            animate={{
              background: hoveredLink === link._id
                ? `linear-gradient(135deg, ${hexToRgba(userAccentColor, 0.15)}, transparent)`
                : 'transparent',
            }}
            transition={{ duration: 0.3 }}
          />

          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100"
            style={{
              background: `linear-gradient(90deg, transparent, ${hexToRgba(userAccentColor, 0.2)}, transparent)`
            }}
            animate={hoveredLink === link._id ? {
              x: ['-100%', '200%']
            } : {}}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "linear"
            }}
          />

          {/* Icon */}
          <motion.span
            animate={hoveredLink === link._id ? {
              rotate: [0, -10, 10, 0],
              scale: [1, 1.1, 1],
            } : {}}
            transition={{ duration: 0.5 }}
            className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg flex-shrink-0 overflow-hidden"
            style={{
              background: link.thumbnailUrl
                ? 'transparent'
                : isCta
                  ? `linear-gradient(135deg, ${userAccentColor}, ${hexToRgba(userAccentColor, 0.8)})`
                  : hoveredLink === link._id
                    ? `linear-gradient(135deg, ${userAccentColor}30, ${userAccentColor}50)`
                    : backgroundConfig.type === "image"
                      ? 'rgba(255, 255, 255, 0.3)'
                      : isDarkMode
                        ? 'linear-gradient(135deg, rgba(55, 65, 81, 0.8), rgba(75, 85, 99, 0.8))'
                        : 'linear-gradient(135deg, rgba(249, 250, 251, 0.9), rgba(243, 244, 246, 0.9))',
              boxShadow: isCta
                ? `0 0 20px ${hexToRgba(userAccentColor, 0.5)}`
                : hoveredLink === link._id
                  ? `0 0 15px ${hexToRgba(userAccentColor, 0.4)}`
                  : '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            {link.thumbnailUrl ? (
              <Image
                src={link.thumbnailUrl}
                alt={link.title}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className={isCta ? 'text-white' : ''}>
                {getLinkIcon(link.url, link.title)}
              </span>
            )}
          </motion.span>

          {/* Título + Badges */}
          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
            <div className="flex items-center gap-2 flex-wrap">
            <span
  className="break-words whitespace-normal text-sm sm:text-base font-bold leading-tight transition-all duration-300"
  style={{
    color: hoveredLink === link._id || isCta
      ? userAccentColor
      : isDarkMode
        ? '#f3f4f6'
        : '#1f2937',
  }}
>
  {link.title}
</span>
              {/* ✨ Badge NOVO */}
              {isNew && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                  style={{
                    boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
                  }}
                >
                  Novo
                </motion.span>
              )}

              {/* 🔥 Badge CTA */}
              {isCta && (
                <motion.span
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                  className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded-full text-white shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${userAccentColor}, ${hexToRgba(userAccentColor, 0.8)})`,
                    boxShadow: `0 0 10px ${hexToRgba(userAccentColor, 0.5)}`
                  }}
                >
                  ⚡
                </motion.span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 relative z-10 ml-1">
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.85 }}
              onClick={(e) => {
                e.preventDefault();
                handleReaction(link._id);
              }}
              className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full transition-all duration-300"
              style={{
                background: linkReactions[link._id]
                  ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(220, 38, 38, 0.25))'
                  : backgroundConfig.type === "image"
                    ? 'rgba(255, 255, 255, 0.2)'
                    : isDarkMode
                      ? 'rgba(55, 65, 81, 0.5)'
                      : 'rgba(243, 244, 246, 0.8)',
                boxShadow: linkReactions[link._id]
                  ? '0 0 20px rgba(239, 68, 68, 0.4)'
                  : 'none'
              }}
            >
              <motion.div
                animate={linkReactions[link._id] ? {
                  scale: [1, 1.4, 1],
                  rotate: [0, -15, 15, 0],
                } : {}}
                transition={{ duration: 0.4 }}
              >
                <Heart
                  className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-all duration-300 ${
                    linkReactions[link._id]
                      ? 'text-red-500 fill-current drop-shadow-[0_0_10px_rgba(239,68,68,0.9)]'
                      : 'text-gray-400 hover:text-red-400'
                  }`}
                />
              </motion.div>
              <span
                className="text-[10px] sm:text-xs font-bold"
                style={{ color: backgroundConfig.type === "image" ? '#ffffff' : isDarkMode ? '#d1d5db' : '#4b5563' }}
              >
                {linkReactions[link._id] || 0}
              </span>
            </motion.button>

            <motion.div
              animate={hoveredLink === link._id ? {
                x: [0, 4, 0],
                y: [0, -4, 0],
              } : {}}
              transition={{
                duration: 0.6,
                repeat: hoveredLink === link._id ? Infinity : 0,
                ease: "easeInOut"
              }}
            >
              <ExternalLink
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all duration-300 hidden sm:block"
                style={{
                  color: hoveredLink === link._id
                    ? userAccentColor
                    : backgroundConfig.type === "image"
                      ? 'rgba(255,255,255,0.7)'
                      : 'rgb(156, 163, 175)',
                }}
              />
            </motion.div>
          </div>
        </a>
      </motion.div>
    );
  })
) : (
  // ... resto do código para quando não há links
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
                          animate={{
                            scale: [1, 1.05, 1],
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <LinkIcon
                            className="w-8 h-8 sm:w-10 sm:h-10"
                            style={{ color: userAccentColor }}
                          />
                        </motion.div>
                        <p className={`text-base sm:text-lg font-bold mb-2 ${getProtectedTextClasses()}`}
                          style={{ color: backgroundConfig.type === "image" ? '#ffffff' : isDarkMode ? '#9ca3af' : '#6b7280' }}
                        >
                          Nenhum link cadastrado ainda
                        </p>
                        <p className={`text-xs sm:text-sm ${getProtectedTextClasses()}`}
                          style={{ color: backgroundConfig.type === "image" ? 'rgba(255,255,255,0.7)' : isDarkMode ? '#6b7280' : '#9ca3af' }}
                        >
                          Os links aparecerão aqui quando forem adicionados
                        </p>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* CTA Card para plano free */}
              {plan === 'free' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="relative rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 shadow-2xl text-white overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${userAccentColor}, ${hexToRgba(userAccentColor, 0.8)})`,
                    boxShadow: `0 8px 32px ${hexToRgba(userAccentColor, 0.4)}`
                  }}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: `0 12px 40px ${hexToRgba(userAccentColor, 0.5)}`
                  }}
                >
                  {/* Animated background */}
                  <motion.div
                    className="absolute inset-0 opacity-20"
                    style={{
                      background: 'radial-gradient(circle at 50% 50%, white, transparent)'
                    }}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.2, 0.3, 0.2]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />

                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)'
                    }}
                    animate={{
                      x: ['-100%', '200%']
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />

                  <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                    <div className="text-center sm:text-left">
                      <motion.h3
                        className="text-base sm:text-lg md:text-xl font-black mb-1 sm:mb-2 flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2"
                        animate={{
                          textShadow: [
                            '0 0 10px rgba(255,255,255,0.5)',
                            '0 0 20px rgba(255,255,255,0.8)',
                            '0 0 10px rgba(255,255,255,0.5)',
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                        </motion.div>
                        Quer um perfil assim?
                      </motion.h3>
                      <p className="text-white/90 text-xs sm:text-sm font-semibold">
                        Crie sua página com recursos exclusivos!
                      </p>
                    </div>
                    <Link href="/">
                      <motion.button
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 bg-white rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm shadow-xl hover:shadow-2xl transition-all whitespace-nowrap overflow-hidden"
                        style={{ color: userAccentColor }}
                      >
                        {/* Button shimmer */}
                        <motion.div
                          className="absolute inset-0"
                          style={{
                            background: `linear-gradient(90deg, transparent, ${hexToRgba(userAccentColor, 0.2)}, transparent)`
                          }}
                          animate={{
                            x: ['-100%', '200%']
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "linear"
                          }}
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

        {/* Footer */}
        {plan === 'free' && (
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 sm:mt-12 md:mt-16 pt-4 sm:pt-6 border-t border-white/10 text-center"
          >
            <p className={`text-[10px] sm:text-xs flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap px-4 ${getProtectedTextClasses()}`}
              style={{ color: backgroundConfig.type === "image" ? 'rgba(255,255,255,0.8)' : isDarkMode ? '#9ca3af' : '#6b7280' }}
            >
              Feito com
              <motion.span
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500 fill-current flex-shrink-0" />
              </motion.span>
              por{" "}
              <Link
                href={getBaseUrl() + "/"}
                className="hover:underline font-bold transition-all"
                style={{ color: userAccentColor }}
              >
                Freelinnk
              </Link>
            </p>
          </motion.footer>
        )}
      </div>

      {/* ✅ 🔥 STICKY CTA (Botão flutuante fixo) */}
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
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-3 rounded-full shadow-2xl font-bold text-white text-sm backdrop-blur-md"
                style={{
                  background: `linear-gradient(90deg, ${userAccentColor}, ${hexToRgba(userAccentColor, 0.8)})`,
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


      {/* ✅ 5. BANNER DE COOKIES */}
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
                <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">
                  🍪 Cookies e Privacidade
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Usamos cookies e rastreadores para analisar o tráfego e melhorar sua experiência no perfil de @{username}. Você aceita?
                </p>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={handleDeclineCookies}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Recusar
                </button>
                <button
                  onClick={handleAcceptCookies}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-transform hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${userAccentColor}, ${hexToRgba(userAccentColor, 0.8)})`,
                  }}
                >
                  Aceitar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll to top button */}
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
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.8 }
            });
          }}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-2xl flex items-center justify-center text-white z-40 border-2 border-white/20"
          style={{
            background: `linear-gradient(135deg, ${userAccentColor}, ${hexToRgba(userAccentColor, 0.8)})`,
            boxShadow: `0 4px 20px ${hexToRgba(userAccentColor, 0.5)}`
          }}
        >
          <motion.div
            animate={{ y: [-2, 2, -2] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 rotate-180" />
          </motion.div>
        </motion.button>
      </AnimatePresence>

      {/* Custom Scrollbar */}
      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: ${isDarkMode ? 'rgba(17, 24, 39, 0.5)' : 'rgba(243, 244, 246, 0.5)'};
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, ${userAccentColor}, ${hexToRgba(userAccentColor, 0.7)});
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: ${userAccentColor};
        }

        @media (max-width: 640px) {
          ::-webkit-scrollbar {
            width: 4px;
          }
        }

        * {
          -webkit-tap-highlight-color: transparent;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        html {
          scroll-behavior: smooth;
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}