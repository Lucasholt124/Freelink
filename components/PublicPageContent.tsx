"use client";

import { api } from "@/convex/_generated/api";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { User, Share2, Link as LinkIcon, Check, Heart, Sparkles, QrCode, Moon, Sun, MapPin, Calendar, Zap, TrendingUp, Star, Download, ExternalLink, ChevronDown, Shield, Gem, Crown, Rocket } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getBaseUrl } from "@/convex/lib/getBaseUrl";
import { useState, useEffect, useRef } from "react";
import { trackLinkClick } from "@/lib/analytics";
import confetti from 'canvas-confetti';
import {
  FaAmazon, FaApple, FaBandcamp, FaBehance, FaBitbucket, FaCodepen, FaDiscord, FaDribbble,
  FaEnvelope, FaEtsy, FaFacebook, FaFigma, FaGithub, FaGitlab, FaGlobe, FaGoogle, FaInstagram,
  FaKickstarter, FaLinkedin, FaMedium, FaMicrosoft, FaPatreon, FaPaypal, FaPinterest,
  FaPlaystation, FaProductHunt, FaReddit, FaShopify, FaSlack, FaSnapchat, FaSoundcloud, FaSpotify,
  FaStackOverflow, FaSteam, FaTelegram, FaTiktok, FaTrello, FaTwitch, FaTwitter, FaVimeo,
  FaWhatsapp, FaXbox, FaYoutube, FaThreads, FaBluesky, FaMastodon, FaSignal, FaViber,
  FaWeixin, FaLine, FaMeetup, FaUber, FaAirbnb, FaStripe, FaHackerrank, FaKaggle, FaDev,
  FaHashnode, FaSkype, FaAnchorCircleExclamation
} from "react-icons/fa6";
import QRCode from 'qrcode';
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { SubscriptionPlanDetails } from "@/lib/subscription";

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
  x: number; y: number;
  vx: number; vy: number;
  size: number; opacity: number;
}

function ParticleField({ color = "rgba(147, 51, 234, 0.4)" }: { color?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = [];
    const particleCount = window.innerWidth < 768 ? 50 : 150;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.3 + 0.1,
      });
    }

    let animationId: number;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        const dx = mouseX - particle.x;
        const dy = mouseY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100) {
          const force = (100 - distance) / 100;
          particle.vx += (dx / distance) * force * 0.02;
          particle.vy += (dy / distance) * force * 0.02;
        }

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        particle.vx *= 0.99;
        particle.vy *= 0.99;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = color.replace('0.4', String(particle.opacity));
        ctx.fill();

        particles.forEach((otherParticle) => {
          const dx = otherParticle.x - particle.x;
          const dy = otherParticle.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 80) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = color.replace('0.4', String((1 - distance / 80) * 0.1));
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.4 }}
    />
  );
}

function VerifiedBadge({ size = "default", plan = "free" }: { size?: "default" | "large"; plan?: string }) {
  const sizeClasses = size === "large" ? "w-10 h-10" : "w-7 h-7";

  const getBadgeColor = () => {
    switch(plan) {
      case 'premium': return 'from-purple-500 to-pink-600';
      case 'pro': return 'from-blue-500 to-cyan-600';
      case 'business': return 'from-yellow-500 to-orange-600';
      case 'enterprise': return 'from-red-500 to-pink-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getBadgeIcon = () => {
    switch(plan) {
      case 'premium': return <Star className="w-4 h-4 text-white" />;
      case 'pro': return <Gem className="w-4 h-4 text-white" />;
      case 'business': return <Crown className="w-4 h-4 text-white" />;
      case 'enterprise': return <Shield className="w-4 h-4 text-white" />;
      default: return <Check className="w-4 h-4 text-white" />;
    }
  };

  return (
    <motion.span
      className={`inline-flex items-center justify-center ${sizeClasses} rounded-full bg-gradient-to-r ${getBadgeColor()} transition-transform duration-200 ease-in-out flex-shrink-0 relative`}
      title={`Plano ${plan.charAt(0).toUpperCase() + plan.slice(1)}`}
      whileHover={{ rotate: 360, scale: 1.2 }}
      transition={{ duration: 0.5 }}
    >
      <span className={`absolute inset-0 rounded-full bg-gradient-to-r ${getBadgeColor()} blur-lg opacity-50 animate-pulse`} />
      <span className="relative z-10">
        {getBadgeIcon()}
      </span>
    </motion.span>
  );
}

function ProfileStats({ username, accentColor }: { username: string; accentColor: string }) {
  const [stats, setStats] = useState({
    views: 0,
    likes: 0,
    shares: 0,
    clicks: 0,
  });

  useEffect(() => {
    const savedStats = localStorage.getItem(`stats_${username}`);
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, [username]);

  const statItems = [
    { icon: TrendingUp, value: stats.views, label: "Visualizações" },
    { icon: Heart, value: stats.likes, label: "Curtidas" },
    { icon: Share2, value: stats.shares, label: "Compart." },
    { icon: Zap, value: stats.clicks, label: "Cliques" },
  ];

  return (
    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700/50">
      <div className="grid grid-cols-4 gap-2 text-center">
        {statItems.map((item, index) => (
          <div key={index}>
            <p className="text-2xl font-bold" style={{ color: accentColor }}>{item.value.toLocaleString('pt-BR')}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function getLinkIcon(url: string) {
  if (!url) return <LinkIcon className="w-6 h-6" />;
  const u = url.toLowerCase();

  const iconMap = [
    { match: ['youtube.com', 'youtu.be'], icon: <FaYoutube className="w-6 h-6 text-[#FF0000]" /> },
    { match: ['instagram.com'], icon: <FaInstagram className="w-6 h-6 text-[#E1306C]" /> },
    { match: ['facebook.com', 'fb.com'], icon: <FaFacebook className="w-6 h-6 text-[#1877F3]" /> },
    { match: ['twitter.com', 'x.com'], icon: <FaTwitter className="w-6 h-6 text-[#1DA1F2]" /> },
    { match: ['linkedin.com'], icon: <FaLinkedin className="w-6 h-6 text-[#0077B5]" /> },
    { match: ['tiktok.com'], icon: <FaTiktok className="w-6 h-6 text-[#000000]" /> },
    { match: ['threads.net'], icon: <FaThreads className="w-6 h-6 text-[#000000]" /> },
    { match: ['bsky.app', 'bluesky'], icon: <FaBluesky className="w-6 h-6 text-[#00A8E8]" /> },
    { match: ['mastodon'], icon: <FaMastodon className="w-6 h-6 text-[#6364FF]" /> },
    { match: ['snapchat.com'], icon: <FaSnapchat className="w-6 h-6 text-[#FFFC00]" /> },
    { match: ['reddit.com'], icon: <FaReddit className="w-6 h-6 text-[#FF4500]" /> },
    { match: ['pinterest.com'], icon: <FaPinterest className="w-6 h-6 text-[#E60023]" /> },
    { match: ['discord.gg', 'discord.com'], icon: <FaDiscord className="w-6 h-6 text-[#5865F2]" /> },
    { match: ['wa.me', 'whatsapp.com'], icon: <FaWhatsapp className="w-6 h-6 text-[#25D366]" /> },
    { match: ['telegram.me', 't.me'], icon: <FaTelegram className="w-6 h-6 text-[#229ED9]" /> },
    { match: ['signal.org'], icon: <FaSignal className="w-6 h-6 text-[#3A76F0]" /> },
    { match: ['viber.com'], icon: <FaViber className="w-6 h-6 text-[#7360F2]" /> },
    { match: ['weixin.qq.com', 'wechat'], icon: <FaWeixin className="w-6 h-6 text-[#7BB32E]" /> },
    { match: ['line.me'], icon: <FaLine className="w-6 h-6 text-[#00C300]" /> },
    { match: ['skype.com'], icon: <FaSkype className="w-6 h-6 text-[#00AFF0]" /> },
    { match: ['github.com'], icon: <FaGithub className="w-6 h-6 text-[#181717]" /> },
    { match: ['gitlab.com'], icon: <FaGitlab className="w-6 h-6 text-[#FC6D26]" /> },
    { match: ['bitbucket.org'], icon: <FaBitbucket className="w-6 h-6 text-[#0052CC]" /> },
    { match: ['stackoverflow.com'], icon: <FaStackOverflow className="w-6 h-6 text-[#F58025]" /> },
    { match: ['codepen.io'], icon: <FaCodepen className="w-6 h-6 text-[#000000]" /> },
    { match: ['hackerrank.com'], icon: <FaHackerrank className="w-6 h-6 text-[#2EC866]" /> },
    { match: ['kaggle.com'], icon: <FaKaggle className="w-6 h-6 text-[#20BEFF]" /> },
    { match: ['dev.to'], icon: <FaDev className="w-6 h-6 text-[#0A0A0A]" /> },
    { match: ['hashnode.dev'], icon: <FaHashnode className="w-6 h-6 text-[#2962FF]" /> },
    { match: ['spotify.com'], icon: <FaSpotify className="w-6 h-6 text-[#1DB954]" /> },
    { match: ['twitch.tv'], icon: <FaTwitch className="w-6 h-6 text-[#9147FF]" /> },
    { match: ['soundcloud.com'], icon: <FaSoundcloud className="w-6 h-6 text-[#FF3300]" /> },
    { match: ['bandcamp.com'], icon: <FaBandcamp className="w-6 h-6 text-[#629AA9]" /> },
    { match: ['vimeo.com'], icon: <FaVimeo className="w-6 h-6 text-[#1AB7EA]" /> },
    { match: ['dribbble.com'], icon: <FaDribbble className="w-6 h-6 text-[#EA4C89]" /> },
    { match: ['behance.net'], icon: <FaBehance className="w-6 h-6 text-[#1769FF]" /> },
    { match: ['figma.com'], icon: <FaFigma className="w-6 h-6 text-[#F24E1E]" /> },
    { match: ['notion.so'], icon: <FaAnchorCircleExclamation className="w-6 h-6 text-[#000000]" /> },
    { match: ['trello.com'], icon: <FaTrello className="w-6 h-6 text-[#0052CC]" /> },
    { match: ['slack.com'], icon: <FaSlack className="w-6 h-6 text-[#4A154B]" /> },
    { match: ['shopify.com'], icon: <FaShopify className="w-6 h-6 text-[#96BF48]" /> },
    { match: ['etsy.com'], icon: <FaEtsy className="w-6 h-6 text-[#F45800]" /> },
    { match: ['amazon.com'], icon: <FaAmazon className="w-6 h-6 text-[#FF9900]" /> },
    { match: ['paypal.com'], icon: <FaPaypal className="w-6 h-6 text-[#00457C]" /> },
    { match: ['patreon.com'], icon: <FaPatreon className="w-6 h-6 text-[#FF424D]" /> },
    { match: ['stripe.com'], icon: <FaStripe className="w-6 h-6 text-[#635BFF]" /> },
    { match: ['apple.com'], icon: <FaApple className="w-6 h-6 text-[#000000]" /> },
    { match: ['google.com'], icon: <FaGoogle className="w-6 h-6 text-[#4285F4]" /> },
    { match: ['microsoft.com'], icon: <FaMicrosoft className="w-6 h-6 text-[#5E5E5E]" /> },
    { match: ['xbox.com'], icon: <FaXbox className="w-6 h-6 text-[#107C10]" /> },
    { match: ['playstation.com'], icon: <FaPlaystation className="w-6 h-6 text-[#003791]" /> },
    { match: ['steam'], icon: <FaSteam className="w-6 h-6 text-[#00adee]" /> },
    { match: ['medium.com'], icon: <FaMedium className="w-6 h-6 text-[#000000]" /> },
    { match: ['producthunt.com'], icon: <FaProductHunt className="w-6 h-6 text-[#DA552F]" /> },
    { match: ['kickstarter.com'], icon: <FaKickstarter className="w-6 h-6 text-[#2BDE73]" /> },
    { match: ['meetup.com'], icon: <FaMeetup className="w-6 h-6 text-[#F64060]" /> },
    { match: ['uber.com'], icon: <FaUber className="w-6 h-6 text-[#000000]" /> },
    { match: ['airbnb.com'], icon: <FaAirbnb className="w-6 h-6 text-[#FF5A5F]" /> },
    { match: ['mailto:'], icon: <FaEnvelope className="w-6 h-6 text-[#EA4335]" /> },
  ];

  for (const item of iconMap) {
    if (item.match.some(match => u.includes(match))) {
      return item.icon;
    }
  }

  if (u.includes('http')) return <FaGlobe className="w-6 h-6 text-[#6366f1]" />;
  return <LinkIcon className="w-6 h-6" />;
}

interface PublicPageContentProps {
  username: string;
  preloadedLinks: Preloaded<typeof api.lib.links.getLinksBySlug>;
  preloadedCustomizations: Preloaded<typeof api.lib.customizations.getCustomizationsBySlug>;
  plan: SubscriptionPlanDetails['plan'];
}

type LinkType = {
  _id: string;
  title: string;
  url: string;
};

export default function PublicPageContent({
  username,
  preloadedLinks,
  preloadedCustomizations,
  plan,
}: PublicPageContentProps) {
  const customizations = usePreloadedQuery(preloadedCustomizations);
  const profileUrl = `${getBaseUrl()}/u/${username}`;

  const userAccentColor = customizations?.accentColor || '#6366f1';

  const [shared, setShared] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [linkReactions, setLinkReactions] = useState<Record<string, number>>({});
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [clickCounts, setClickCounts] = useState<Record<string, number>>({});
  const [userLocation, setUserLocation] = useState<string | null>(null);
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

  const links = usePreloadedQuery(preloadedLinks) as LinkType[];

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const hexToRgba = (hex: string, alpha: number) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`
      : `rgba(99, 102, 241, ${alpha})`;
  };

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);

    // Fetch location only if not already set
    if (!userLocation) {
      fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data.country_name) {
          setUserLocation(data.country_name);
        }
      })
      .catch(() => {});
    }

    // Carregar configurações de background do localStorage
    if (customizations?.userId) {
      const savedBg = localStorage.getItem(`bgConfig_${customizations.userId}`);
      if (savedBg) {
        try {
          setBackgroundConfig(JSON.parse(savedBg));
        } catch (e) {
          console.error("Erro ao carregar configurações de fundo:", e);
        }
      }
    }

    const savedReactions = localStorage.getItem(`reactions_${username}`);
    if (savedReactions) {
      setLinkReactions(JSON.parse(savedReactions));
    }

    const savedClicks = localStorage.getItem(`clicks_${username}`);
    if (savedClicks) {
      setClickCounts(JSON.parse(savedClicks));
    }

    // Incrementa visualizações
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

    setTimeout(() => setIsLoading(false), 800);
  }, [profileUrl, username, userAccentColor, customizations?.userId, userLocation]);

  const handleShare = async () => {
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: [userAccentColor, '#ff00ff', '#00ffff', '#ffff00']
    });

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
      particleCount: 30,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#ff0000', '#ff69b4', '#ff1493']
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${userAccentColor}, ${userAccentColor}dd)` }}>
        <motion.div
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-transparent border-t-white border-r-white rounded-full animate-spin" />
            </div>
            <motion.h2
              className="text-2xl font-bold text-white"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Carregando...
            </motion.h2>
          </div>
        </motion.div>
      </div>
    );
  }

  // Função para obter o estilo de fundo baseado nas configurações
  const getBackgroundStyle = () => {
    if (backgroundConfig.type === "color") {
      return { background: backgroundConfig.color1 };
    } else if (backgroundConfig.type === "gradient") {
      return { background: `linear-gradient(135deg, ${backgroundConfig.color1}, ${backgroundConfig.color2})` };
    }
    return {};
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'dark' : ''}`}>
      {/* Partículas só aparecem se não for background de imagem */}
      {backgroundConfig.type !== "image" && (
        <ParticleField color={hexToRgba(userAccentColor, 0.4)} />
      )}

      <motion.div
        className="fixed top-0 left-0 right-0 h-1 transform-origin-0 z-50"
        style={{
          scaleX,
          background: userAccentColor
        }}
      />

      {/* Background principal */}
      <div
        className="fixed inset-0"
        style={getBackgroundStyle()}
      >
        {/* Imagem de fundo em tela inteira */}
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

        {/* Overlay para legibilidade em fundos de imagem */}
        {backgroundConfig.type === "image" && (
          <div className="absolute inset-0 bg-black/20 dark:bg-black/40" />
        )}

        {/* Overlay com a cor de destaque */}
        <div className="absolute inset-0 opacity-20" style={{ background: `linear-gradient(135deg, ${userAccentColor}33, transparent)` }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative h-96 overflow-hidden"
      >
        {backgroundConfig.type === "image" && backgroundConfig.imageUrl && backgroundConfig.style === "header" ? (
          // Imagem apenas no header
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
          // Header padrão com gradiente baseado na cor de destaque
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${userAccentColor}, ${userAccentColor}dd)`,
              clipPath: "polygon(0 0, 100% 0, 100% 85%, 0 100%)",
            }}
          >
            <div className="absolute inset-0 bg-black/10" />
          </div>
        )}

        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-3 rounded-full bg-white/20 backdrop-blur-xl text-white border border-white/30 hover:bg-white/30 transition-all duration-300"
          >
            {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </motion.button>
        </div>
      </motion.div>

      <div className="relative -mt-48 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid lg:grid-cols-3 gap-8 xl:gap-12">
          <motion.aside
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-8 space-y-6">
              <motion.div
                className={`${
                  backgroundConfig.type === "image"
                    ? "bg-white/95 dark:bg-gray-800/95"
                    : "bg-white/90 dark:bg-gray-800/90"
                } backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50 dark:border-gray-700/50`}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex justify-center mb-6">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="relative group"
                  >
                    <div
                      className="absolute inset-0 rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"
                      style={{ background: userAccentColor }}
                    />
                    {customizations?.profilePictureUrl ? (
                      <div className="w-36 h-36 rounded-full overflow-hidden shadow-2xl bg-white p-1 border-4 border-white dark:border-gray-800 relative z-10">
                        <Image
                          src={customizations.profilePictureUrl}
                          alt={`${username}'s profile`}
                          width={144}
                          height={144}
                          className="w-full h-full object-cover rounded-full"
                          priority
                        />
                      </div>
                    ) : (
                      <div
                        className="w-36 h-36 rounded-full flex items-center justify-center shadow-2xl border-4 border-white dark:border-gray-800 relative z-10"
                        style={{ background: `linear-gradient(135deg, ${userAccentColor}, ${userAccentColor}dd)` }}
                      >
                        <User className="w-16 h-16 text-white" />
                      </div>
                    )}
                  </motion.div>
                </div>

                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <h1 className="text-3xl font-black" style={{ color: userAccentColor }}>
                      @{username}
                    </h1>
                    {plan !== 'free' && <VerifiedBadge size="large" plan={plan} />}
                  </div>

                  {customizations?.description && (
                    <motion.p
                      className="text-gray-600 dark:text-gray-400 text-base leading-relaxed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {customizations.description}
                    </motion.p>
                  )}

                  <div className="flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{userLocation}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Desde {joinDate}</span>
                    </div>
                  </div>
                </div>

                <ProfileStats username={username} accentColor={userAccentColor} />

                <div className="flex gap-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleShare}
                    className="flex-1 py-3 px-4 rounded-2xl font-bold text-white shadow-xl transition-all duration-300"
                    style={{
                      background: shared ? 'linear-gradient(135deg, #10b981, #059669)' : userAccentColor
                    }}
                  >
                    {shared ? (
                      <span className="flex items-center justify-center gap-2">
                        <Check className="w-5 h-5" />
                        Copiado!
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Share2 className="w-5 h-5" />
                        Compartilhar
                      </span>
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowQRCode(!showQRCode)}
                    className="p-3 rounded-2xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300"
                  >
                    <QrCode className="w-5 h-5" />
                  </motion.button>
                </div>

                <AnimatePresence>
                  {showQRCode && qrCodeDataUrl && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: -20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: -20 }}
                      className="mt-4 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <img src={qrCodeDataUrl} alt="QR Code" className="w-48 h-48 rounded-xl" />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            const link = document.createElement('a');
                            link.download = `${username}-qrcode.png`;
                            link.href = qrCodeDataUrl;
                            link.click();
                          }}
                          className="flex items-center gap-2 px-4 py-2 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow"
                          style={{ background: userAccentColor }}
                        >
                          <Download className="w-4 h-4" />
                          Baixar QR Code
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </motion.aside>

          <motion.main
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="space-y-4">
              <motion.div
                className={`${
                  backgroundConfig.type === "image"
                    ? "bg-white/95 dark:bg-gray-800/95"
                    : "bg-white/90 dark:bg-gray-800/90"
                } backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-gray-200/50 dark:border-gray-700/50`}
                whileHover={{ y: -2 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black flex items-center gap-2" style={{ color: userAccentColor }}>
                    <Sparkles className="w-6 h-6" style={{ color: userAccentColor }} />
                    Links
                  </h2>
                </div>

                <div className="space-y-3">
                  {links && links.length > 0 ? (
                    links.map((link, index) => (
                      <motion.div
                        key={link._id}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                        onHoverStart={() => setHoveredLink(link._id)}
                        onHoverEnd={() => setHoveredLink(null)}
                      >
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative flex items-center gap-4 w-full rounded-2xl p-5 font-bold text-lg bg-white dark:bg-gray-800 border-2 transition-all duration-300 overflow-hidden"
                          style={{
                            borderColor: hoveredLink === link._id ? userAccentColor : 'transparent',
                            boxShadow: hoveredLink === link._id ? `0 0 30px ${userAccentColor}33` : '0 4px 6px rgba(0,0,0,0.1)'
                          }}
                          onClick={() => handleTrack(link)}
                        >
                          <motion.div
                            className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                            style={{ background: userAccentColor }}
                            initial={{ x: "-100%" }}
                            whileHover={{ x: 0 }}
                            transition={{ duration: 0.3 }}
                          />

                          <motion.span
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                            className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 transition-all duration-300 shadow-inner"
                          >
                            {getLinkIcon(link.url)}
                          </motion.span>

                          <span
                            className="flex-1 text-gray-800 dark:text-gray-200 transition-all duration-300"
                            style={{ color: hoveredLink === link._id ? userAccentColor : '' }}
                          >
                            {link.title}
                          </span>

                          {clickCounts[link._id] && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                              {clickCounts[link._id]} cliques
                            </span>
                          )}

                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.preventDefault();
                              handleReaction(link._id);
                            }}
                            className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900 transition-colors duration-300"
                          >
                            <Heart className={`w-4 h-4 ${linkReactions[link._id] ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {linkReactions[link._id] || 0}
                            </span>
                          </motion.button>

                          <ExternalLink
                            className="w-5 h-5 text-gray-400 transition-colors duration-300"
                            style={{ color: hoveredLink === link._id ? userAccentColor : '' }}
                          />
                        </a>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      className="text-center py-12"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 mb-4">
                        <LinkIcon className="w-10 h-10 text-gray-400" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-lg">
                        Nenhum link cadastrado ainda
                      </p>
                      <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                        Os links aparecerão aqui quando forem adicionados
                      </p>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {plan === 'free' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="rounded-3xl p-8 shadow-2xl text-white relative overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${userAccentColor}, ${userAccentColor}dd)` }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                        <Rocket className="w-6 h-6" />
                        Quer um perfil assim?
                      </h3>
                      <p className="text-white/90">
                        Crie sua página com recursos exclusivos!
                      </p>
                    </div>
                    <Link href="/signup">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 bg-white rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-shadow"
                        style={{ color: userAccentColor }}
                      >
                        Começar Grátis
                      </motion.button>
                    </Link>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.main>
        </div>

        {plan === 'free' && (
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-20 pt-8 border-t border-gray-200/50 dark:border-gray-700/50 text-center"
          >
            <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center justify-center gap-2">
              Feito com <Heart className="w-4 h-4 text-red-500 fill-current" /> por{" "}
              <Link
                href={getBaseUrl() + "/"}
                className="hover:underline font-bold"
                style={{ color: userAccentColor }}
              >
                Freelinnk
              </Link>
            </p>
          </motion.footer>
        )}
      </div>

      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white z-40"
        style={{
          background: userAccentColor,
          boxShadow: `0 0 30px ${userAccentColor}66`
        }}
      >
        <ChevronDown className="w-6 h-6 rotate-180" />
      </motion.button>

      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 10px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }

        ::-webkit-scrollbar-thumb {
          background: ${userAccentColor};
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: ${userAccentColor}dd;
        }
      `}</style>
    </div>
  );
}