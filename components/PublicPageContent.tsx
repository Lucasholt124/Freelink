"use client";

import { api } from "@/convex/_generated/api";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { User, Share2, Link as LinkIcon, Check, Heart, Sparkles, QrCode, Moon, Sun, Calendar, Download, ExternalLink, ChevronDown, Shield, Gem, Crown, Rocket, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getBaseUrl } from "@/convex/lib/getBaseUrl";
import { useState, useEffect, useRef } from "react";
import { trackLinkClick } from "@/lib/analytics";
import confetti from 'canvas-confetti';
import {
  FaFacebook, FaGithub, FaGlobe, FaInstagram,
  FaLinkedin, FaTiktok, FaTwitter, FaYoutube,
  FaWhatsapp
} from "react-icons/fa6";
import QRCode from 'qrcode';
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { SubscriptionPlanDetails } from "@/lib/subscription";

// ==================== INTERFACES ====================
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

// ==================== PARTICLE FIELD - OTIMIZADO ====================
function ParticleField({ color = "rgba(147, 51, 234, 0.4)" }: { color?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = [];
    const particleCount = isMobile ? 20 : isTablet ? 50 : 80;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * (isMobile ? 1.5 : 2.5) + 0.5,
        opacity: Math.random() * 0.4 + 0.2,
      });
    }

    let animationId: number;
    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;
    let lastTime = 0;
    const targetFPS = 60;
    const frameDelay = 1000 / targetFPS;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
      }
    };

    if (!isMobile) {
      window.addEventListener('mousemove', handleMouseMove);
    } else {
      window.addEventListener('touchmove', handleTouchMove, { passive: true });
    }

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;

      if (deltaTime >= frameDelay) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((particle, index) => {
          particle.x += particle.vx;
          particle.y += particle.vy;

          if (!isMobile || mouseX !== canvas.width / 2) {
            const dx = mouseX - particle.x;
            const dy = mouseY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 120) {
              const force = (120 - distance) / 120;
              particle.vx += (dx / distance) * force * 0.03;
              particle.vy += (dy / distance) * force * 0.03;
            }
          }

          if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
          if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

          particle.vx *= 0.98;
          particle.vy *= 0.98;

          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = color.replace('0.4', String(particle.opacity));
          ctx.fill();

          if (!isMobile) {
            particles.slice(index + 1).forEach((otherParticle) => {
              const dx = otherParticle.x - particle.x;
              const dy = otherParticle.y - particle.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < 100) {
                ctx.beginPath();
                ctx.moveTo(particle.x, particle.y);
                ctx.lineTo(otherParticle.x, otherParticle.y);
                ctx.strokeStyle = color.replace('0.4', String((1 - distance / 100) * 0.15));
                ctx.lineWidth = 0.5;
                ctx.stroke();
              }
            });
          }
        });

        lastTime = currentTime;
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      if (!isMobile) {
        window.removeEventListener('mousemove', handleMouseMove);
      } else {
        window.removeEventListener('touchmove', handleTouchMove);
      }
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

// ==================== VERIFIED BADGE - ULTRA MODERNA ====================
function VerifiedBadge({ size = "default", plan = "free" }: { size?: "default" | "large"; plan?: string }) {
  const sizeClasses = size === "large" ? "w-9 h-9 sm:w-12 sm:h-12" : "w-7 h-7 sm:w-8 sm:h-8";
  const iconSize = size === "large" ? "w-4 h-4 sm:w-5 sm:h-5" : "w-3 h-3 sm:w-4 sm:h-4";

  const getBadgeConfig = () => {
    switch (plan) {
      case 'premium': return {
        gradient: 'from-purple-500 via-pink-500 to-purple-600',
        glow: 'shadow-purple-500/50',
        icon: Star,
        label: '⭐ Premium'
      };
      case 'pro': return {
        gradient: 'from-blue-500 via-cyan-500 to-blue-600',
        glow: 'shadow-blue-500/50',
        icon: Gem,
        label: '💎 Pro'
      };
      case 'business': return {
        gradient: 'from-yellow-500 via-orange-500 to-yellow-600',
        glow: 'shadow-yellow-500/50',
        icon: Crown,
        label: '👑 Business'
      };
      case 'enterprise': return {
        gradient: 'from-red-500 via-pink-500 to-red-600',
        glow: 'shadow-red-500/50',
        icon: Shield,
        label: '🛡️ Enterprise'
      };
      default: return {
        gradient: 'from-gray-400 to-gray-600',
        glow: 'shadow-gray-500/50',
        icon: Check,
        label: '✓ Verificado'
      };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  return (
    <motion.div
      className="relative inline-flex items-center group"
      whileHover={{ scale: 1.1 }}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
    >
      <motion.span
        className={`absolute inset-0 rounded-full bg-gradient-to-r ${config.gradient} blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500`}
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.span
        className={`relative inline-flex items-center justify-center ${sizeClasses} rounded-full bg-gradient-to-br ${config.gradient} ${config.glow} shadow-2xl flex-shrink-0 border-2 border-white/20`}
        whileHover={{ rotate: [0, -10, 10, -10, 0] }}
        transition={{ duration: 0.5 }}
      >
        <motion.span
          className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
          animate={{
            x: ['-200%', '200%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        <Icon className={`${iconSize} text-white relative z-10 drop-shadow-lg`} />
      </motion.span>

      <motion.span
        className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 shadow-xl"
        initial={{ y: 10, opacity: 0 }}
        whileHover={{ y: 0, opacity: 1 }}
      >
        {config.label}
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
      </motion.span>
    </motion.div>
  );
}

// ==================== GET LINK ICON - COM ANIMAÇÃO ====================
function getLinkIcon(url: string) {
  if (!url) return <LinkIcon className="w-5 h-5 sm:w-6 sm:h-6" />;
  const u = url.toLowerCase();

  const iconMap = [
    {
      match: ['youtube.com', 'youtu.be'],
      icon: FaYoutube,
      color: '#FF0000',
      gradient: 'from-red-600 to-red-500'
    },
    {
      match: ['instagram.com', 'instagr.am'],
      icon: FaInstagram,
      color: '#E1306C',
      gradient: 'from-pink-600 via-purple-600 to-yellow-500'
    },
    {
      match: ['facebook.com', 'fb.com', 'fb.me'],
      icon: FaFacebook,
      color: '#1877F3',
      gradient: 'from-blue-600 to-blue-500'
    },
    {
      match: ['twitter.com', 'x.com', 't.co'],
      icon: FaTwitter,
      color: '#1DA1F2',
      gradient: 'from-sky-600 to-sky-500'
    },
    {
      match: ['linkedin.com', 'lnkd.in'],
      icon: FaLinkedin,
      color: '#0077B5',
      gradient: 'from-blue-700 to-blue-600'
    },
    {
      match: ['tiktok.com', 'vm.tiktok.com'],
      icon: FaTiktok,
      color: '#000000',
      gradient: 'from-gray-900 to-gray-800'
    },
    {
      match: ['github.com', 'github.io'],
      icon: FaGithub,
      color: '#181717',
      gradient: 'from-gray-900 to-gray-800'
    },
    {
      match: ['whatsapp', 'wa.me', 'api.whatsapp.com'],
      icon: FaWhatsapp,
      color: '#25D366',
      gradient: 'from-green-600 to-green-500'
    },
  ];

  for (const item of iconMap) {
    if (item.match.some(match => u.includes(match))) {
      const Icon = item.icon;
      return (
        <motion.div
          className={`flex items-center justify-center w-full h-full bg-gradient-to-br ${item.gradient} rounded-xl`}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-lg" />
        </motion.div>
      );
    }
  }

  if (u.includes('http')) {
    return (
      <motion.div
        className="flex items-center justify-center w-full h-full bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl"
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        <FaGlobe className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-lg" />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-600 to-gray-500 rounded-xl"
      whileHover={{ scale: 1.1, rotate: 5 }}
      transition={{ type: "spring", stiffness: 400 }}
    >
      <LinkIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-lg" />
    </motion.div>
  );
}

// ==================== COMPONENTE PRINCIPAL ====================
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
  const [joinDate] = useState<string>(
    customizations?._creationTime
      ? new Date(customizations._creationTime).getFullYear().toString()
      : "2024"
  );
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

    setTimeout(() => setIsLoading(false), 800);
  }, [profileUrl, username, userAccentColor, customizations]);

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

  // ==================== LOADING STATE ====================
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
              <div className="w-16 h-16 sm:w-24 sm:h-24 border-4 border-transparent border-t-white border-r-white rounded-full animate-spin" />
            </div>
            <motion.h2
              className="text-xl sm:text-2xl font-bold text-white"
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

  const getBackgroundStyle = () => {
    if (backgroundConfig.type === "color") {
      return { background: backgroundConfig.color1 };
    } else if (backgroundConfig.type === "gradient") {
      return { background: `linear-gradient(135deg, ${backgroundConfig.color1}, ${backgroundConfig.color2})` };
    }
    return {};
  };

  // ==================== RENDER ====================
  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'dark' : ''}`}>
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

      <div
        className="fixed inset-0"
        style={getBackgroundStyle()}
      >
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

        <div className="absolute inset-0 opacity-20" style={{ background: `linear-gradient(135deg, ${userAccentColor}33, transparent)` }} />
      </div>

      {/* ==================== HEADER ==================== */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative h-64 sm:h-80 md:h-96 overflow-hidden"
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

        {/* ==================== TOP BUTTONS ==================== */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="relative p-3 sm:p-4 rounded-2xl bg-white/10 backdrop-blur-2xl text-white border border-white/20 shadow-2xl overflow-hidden group"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: `radial-gradient(circle, ${userAccentColor}40, transparent)` }}
            />

            <AnimatePresence mode="wait">
              {isDarkMode ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  exit={{ rotate: 180, scale: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Sun className="w-5 h-5 sm:w-6 sm:h-6 relative z-10" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  exit={{ rotate: 180, scale: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Moon className="w-5 h-5 sm:w-6 sm:h-6 relative z-10" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <div className="flex gap-2 sm:gap-3">
            <motion.button
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowQRCode(!showQRCode)}
              className="relative p-3 sm:p-4 rounded-2xl bg-white/10 backdrop-blur-2xl text-white border border-white/20 shadow-2xl overflow-hidden group"
              title="Ver QR Code"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {showQRCode && (
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  style={{ background: userAccentColor }}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}

              <QrCode className="w-5 h-5 sm:w-6 sm:h-6 relative z-10" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className="relative p-3 sm:p-4 rounded-2xl backdrop-blur-2xl text-white border border-white/20 shadow-2xl overflow-hidden group"
              style={{
                background: shared
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.4), rgba(5, 150, 105, 0.4))'
                  : 'rgba(255, 255, 255, 0.1)'
              }}
              title={shared ? "Link copiado!" : "Compartilhar"}
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {shared && (
                <motion.div
                  className="absolute inset-0 bg-green-500 rounded-2xl"
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 0.6 }}
                />
              )}

              <AnimatePresence mode="wait">
                {shared ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                  >
                    <Check className="w-5 h-5 sm:w-6 sm:h-6 relative z-10" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="share"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Share2 className="w-5 h-5 sm:w-6 sm:h-6 relative z-10" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* ==================== QR CODE DROPDOWN ==================== */}
        <AnimatePresence>
          {showQRCode && qrCodeDataUrl && (
            <motion.div
              initial={{ opacity: 0, y: -30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.9 }}
              className="absolute top-24 right-4 z-30 rounded-3xl shadow-2xl overflow-hidden"
              style={{ maxWidth: 'calc(100vw - 2rem)' }}
            >
              <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl" />

              <motion.div
                className="absolute inset-0 rounded-3xl"
                style={{
                  background: `linear-gradient(135deg, ${userAccentColor}, transparent, ${userAccentColor})`,
                  padding: '2px',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                }}
                animate={{
                  background: [
                    `linear-gradient(0deg, ${userAccentColor}, transparent, ${userAccentColor})`,
                    `linear-gradient(360deg, ${userAccentColor}, transparent, ${userAccentColor})`,
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />

              <div className="relative z-10 p-6 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <QrCode className="w-5 h-5" style={{ color: userAccentColor }} />
                    QR Code
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowQRCode(false)}
                    className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="text-xl">×</span>
                  </motion.button>
                </div>

                <motion.div
                  className="relative p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-inner"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {[
                    { top: -2, left: -2 },
                    { top: -2, right: -2 },
                    { bottom: -2, left: -2 },
                    { bottom: -2, right: -2 },
                  ].map((pos, i) => (
                    <div
                      key={i}
                      className="absolute w-4 h-4 border-2 rounded-sm"
                      style={{
                        ...pos,
                        borderColor: userAccentColor,
                        borderWidth: i % 2 === 0 ? '2px 0 0 2px' : '0 2px 2px 0',
                      }}
                    />
                  ))}

                  <img
                    src={qrCodeDataUrl}
                    alt="QR Code"
                    className="w-48 h-48 sm:w-56 sm:h-56 rounded-xl mx-auto"
                  />
                </motion.div>

                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center">
                  Escaneie para acessar o perfil
                </p>

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
                      origin: { y: 0.6 },
                      colors: [userAccentColor, '#ff00ff', '#00ffff']
                    });
                  }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all relative overflow-hidden group"
                  style={{ background: userAccentColor }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ['-200%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />

                  <Download className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">Baixar QR Code</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ==================== MAIN CONTENT ==================== */}
      <div className="relative -mt-32 sm:-mt-40 md:-mt-48 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-12 sm:pb-16 md:pb-20">
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">

          {/* ==================== SIDEBAR - PROFILE CARD ==================== */}
          <motion.aside
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="lg:sticky lg:top-8 space-y-4 sm:space-y-6">
              <motion.div
                className="relative overflow-hidden rounded-3xl sm:rounded-[2rem] shadow-2xl border border-white/20 dark:border-gray-700/30"
                style={{
                  background: backgroundConfig.type === "image"
                    ? 'rgba(255, 255, 255, 0.95)'
                    : `linear-gradient(135deg, ${userAccentColor}15, rgba(255, 255, 255, 0.95))`,
                }}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="absolute inset-0 backdrop-blur-2xl bg-gradient-to-br from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-900/30" />

                <motion.div
                  className="absolute inset-0 rounded-3xl sm:rounded-[2rem]"
                  style={{
                    background: `linear-gradient(135deg, ${userAccentColor}, transparent, ${userAccentColor})`,
                    padding: '2px',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                  }}
                  animate={{
                    background: [
                      `linear-gradient(0deg, ${userAccentColor}, transparent, ${userAccentColor})`,
                      `linear-gradient(360deg, ${userAccentColor}, transparent, ${userAccentColor})`,
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />

                <div className="relative z-10 p-6 sm:p-8 md:p-10">
                  <div className="flex justify-center mb-6">
                    <motion.div
                      className="relative group"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: `conic-gradient(from 0deg, ${userAccentColor}, transparent, ${userAccentColor})`,
                        }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      />

                      <motion.div
                        className="absolute inset-0 rounded-full blur-2xl"
                        style={{ background: userAccentColor }}
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      />

                      <div className="relative">
                        {customizations?.profilePictureUrl ? (
                          <motion.div
                            className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full overflow-hidden shadow-2xl bg-white p-1.5 border-4 border-white/50 dark:border-gray-700/50 backdrop-blur-xl relative z-10"
                            whileHover={{ rotate: [0, -5, 5, -5, 0] }}
                            transition={{ duration: 0.5 }}
                          >
                            <Image
                              src={customizations.profilePictureUrl}
                              alt={`${username}'s profile`}
                              width={192}
                              height={192}
                              className="w-full h-full object-cover rounded-full"
                              priority
                            />

                            <motion.div
                              className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/40 to-transparent"
                              animate={{
                                x: ['-100%', '100%'],
                                y: ['-100%', '100%'],
                              }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            />
                          </motion.div>
                        ) : (
                          <motion.div
                            className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/50 dark:border-gray-700/50 relative z-10 overflow-hidden"
                            style={{
                              background: `linear-gradient(135deg, ${userAccentColor}, ${userAccentColor}dd)`
                            }}
                            whileHover={{ rotate: [0, -5, 5, -5, 0] }}
                            transition={{ duration: 0.5 }}
                          >
                            <User className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-white drop-shadow-2xl" />

                            <motion.div
                              className="absolute inset-0"
                              style={{
                                background: `linear-gradient(45deg, ${userAccentColor}00, ${userAccentColor}80, ${userAccentColor}00)`,
                              }}
                              animate={{
                                x: ['-200%', '200%'],
                              }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            />
                          </motion.div>
                        )}
                      </div>

                      <motion.div
                        className="absolute bottom-2 right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-green-500 border-4 border-white dark:border-gray-800 shadow-xl"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring", stiffness: 500 }}
                        whileHover={{ scale: 1.2 }}
                      >
                        <motion.div
                          className="absolute inset-0 rounded-full bg-green-500"
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [1, 0, 1],
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </motion.div>
                    </motion.div>
                  </div>

                  <div className="text-center space-y-3 sm:space-y-4">
                    <motion.div
                      className="flex items-center justify-center gap-2 sm:gap-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <motion.h1
                        className="text-2xl sm:text-3xl md:text-4xl font-black bg-clip-text text-transparent"
                        style={{
                          backgroundImage: `linear-gradient(135deg, ${userAccentColor}, ${userAccentColor}dd)`,
                        }}
                        whileHover={{ scale: 1.05 }}
                      >
                        @{username}
                      </motion.h1>
                      {plan !== 'free' && <VerifiedBadge size="large" plan={plan} />}
                    </motion.div>

                    {plan === 'free' && (
                      <Link href={getBaseUrl() + "/"} className="group inline-block">
                        <motion.div
                          className="px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 backdrop-blur-sm"
                          whileHover={{ scale: 1.05, borderColor: 'rgba(168, 85, 247, 0.5)' }}
                        >
                          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3" />
                            Powered by <span className="font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:from-purple-500 group-hover:to-pink-500 transition-all">Freelinnk</span>
                          </p>
                        </motion.div>
                      </Link>
                    )}

                    {customizations?.description && (
                      <motion.div
                        className="relative px-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <p className="text-sm sm:text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                          {customizations.description}
                        </p>

                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full opacity-30" style={{ background: userAccentColor }} />
                        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full opacity-30" style={{ background: userAccentColor }} />
                      </motion.div>
                    )}

                    <motion.div
                      className="flex items-center justify-center gap-2 text-xs sm:text-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: userAccentColor }} />
                        <span className="text-gray-600 dark:text-gray-400 font-semibold">
                          Desde <span style={{ color: userAccentColor }}>{joinDate}</span>
                        </span>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.aside>

          {/* ==================== MAIN - LINKS SECTION ==================== */}
          <motion.main
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="space-y-4">
              <motion.div
                className={`${backgroundConfig.type === "image"
                  ? "bg-white/95 dark:bg-gray-800/95"
                  : "bg-white/90 dark:bg-gray-800/90"
                  } backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 shadow-xl border border-gray-200/50 dark:border-gray-700/50`}
                whileHover={{ y: -2 }}
              >
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2" style={{ color: userAccentColor }}>
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: userAccentColor }} />
                    Links
                  </h2>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {links && links.length > 0 ? (
                    links.map((link, index) => (
                      <motion.div
                        key={link._id}
                        initial={{ opacity: 0, x: -50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{
                          delay: index * 0.08,
                          type: "spring",
                          stiffness: 260,
                          damping: 20
                        }}
                        whileHover={{ scale: 1.03, y: -5 }}
                        onHoverStart={() => setHoveredLink(link._id)}
                        onHoverEnd={() => setHoveredLink(null)}
                      >
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative block w-full rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-500"
                          onClick={() => handleTrack(link)}
                          style={{
                            boxShadow: hoveredLink === link._id
                              ? `0 20px 50px ${userAccentColor}40, 0 0 0 2px ${userAccentColor}`
                              : '0 4px 20px rgba(0,0,0,0.08)',
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/60 dark:from-gray-800/80 dark:to-gray-900/60 backdrop-blur-xl" />

                          <motion.div
                            className="absolute inset-0"
                            style={{
                              background: `linear-gradient(135deg, ${userAccentColor}00, ${userAccentColor}40, ${userAccentColor}00)`,
                              opacity: hoveredLink === link._id ? 1 : 0,
                            }}
                            animate={{
                              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                            }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                          />

                          <motion.div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                            style={{
                              background: `linear-gradient(90deg, transparent, ${userAccentColor}20, transparent)`,
                            }}
                            animate={{
                              x: ['-100%', '100%'],
                            }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />

                          <div className="relative z-10 flex items-center gap-3 sm:gap-4 p-4 sm:p-5 md:p-6">
                            <motion.div
                              className="relative flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden"
                              whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                              transition={{ duration: 0.5 }}
                            >
                              <motion.div
                                className="absolute inset-0 blur-xl"
                                style={{ background: userAccentColor }}
                                animate={{
                                  scale: [1, 1.2, 1],
                                  opacity: [0.3, 0.6, 0.3],
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                              />

                              <div className="relative z-10 w-full h-full flex items-center justify-center">
                                {getLinkIcon(link.url)}
                              </div>
                            </motion.div>

                            <div className="flex-1 min-w-0">
                              <motion.h3
                                className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white truncate transition-colors duration-300"
                                style={{
                                  color: hoveredLink === link._id ? userAccentColor : undefined,
                                }}
                              >
                                {link.title}
                              </motion.h3>

                              <motion.p
                                className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: hoveredLink === link._id ? 1 : 0.7, y: 0 }}
                              >
                                Clique para acessar
                              </motion.p>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleReaction(link._id);
                                }}
                                className="relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full transition-all duration-300 overflow-hidden group/like"
                                style={{
                                  background: linkReactions[link._id]
                                    ? `linear-gradient(135deg, ${userAccentColor}20, ${userAccentColor}10)`
                                    : 'rgba(0,0,0,0.05)',
                                }}
                              >
                                {linkReactions[link._id] && (
                                  <motion.div
                                    className="absolute inset-0 rounded-full"
                                    style={{ background: userAccentColor }}
                                    animate={{
                                      scale: [1, 1.5, 1],
                                      opacity: [0.3, 0, 0.3],
                                    }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                  />
                                )}

                                <Heart
                                  className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${linkReactions[link._id]
                                    ? 'text-red-500 fill-current scale-110'
                                    : 'text-gray-400 group-hover/like:text-red-400'
                                    }`}
                                />
                                <span
                                  className="text-xs sm:text-sm font-bold transition-colors duration-300"
                                  style={{
                                    color: linkReactions[link._id] ? userAccentColor : undefined,
                                  }}
                                >
                                  {linkReactions[link._id] || 0}
                                </span>
                              </motion.button>

                              <motion.div
                                className="hidden sm:flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full"
                                style={{
                                  background: hoveredLink === link._id
                                    ? `linear-gradient(135deg, ${userAccentColor}20, ${userAccentColor}10)`
                                    : 'transparent',
                                }}
                                animate={{
                                  rotate: hoveredLink === link._id ? [0, 15, -15, 0] : 0,
                                }}
                                transition={{ duration: 0.5 }}
                              >
                                <ExternalLink
                                  className="w-5 h-5 transition-colors duration-300"
                                  style={{
                                    color: hoveredLink === link._id ? userAccentColor : 'rgb(156, 163, 175)'
                                  }}
                                />
                              </motion.div>
                            </div>
                          </div>

                          <motion.div
                            className="absolute bottom-0 left-0 right-0 h-1"
                            style={{ background: userAccentColor }}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: hoveredLink === link._id ? 1 : 0 }}
                            transition={{ duration: 0.3 }}
                          />
                        </a>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      className="relative text-center py-16 sm:py-20 px-4 rounded-3xl overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${userAccentColor}05, ${userAccentColor}10)`,
                      }}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    >
                      <div className="absolute top-4 left-4 w-20 h-20 rounded-full opacity-20" style={{ background: userAccentColor }} />
                      <div className="absolute bottom-4 right-4 w-32 h-32 rounded-full opacity-10" style={{ background: userAccentColor }} />

                      <motion.div
                        className="relative inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full mb-6 shadow-xl"
                        style={{
                          background: `linear-gradient(135deg, ${userAccentColor}, ${userAccentColor}dd)`,
                        }}
                        animate={{
                          scale: [1, 1.1, 1],
                          rotate: [0, 10, -10, 0],
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <LinkIcon className="w-10 h-10 sm:w-12 sm:h-12 text-white drop-shadow-lg" />
                      </motion.div>

                      <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                        Nenhum link ainda
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                        Os links aparecerão aqui quando forem adicionados pelo criador
                      </p>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* ==================== CTA BANNER (FREE PLAN) ==================== */}
              {plan === 'free' && (
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
                  className="relative rounded-3xl sm:rounded-[2rem] p-1 overflow-hidden shadow-2xl"
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <motion.div
                    className="absolute inset-0 rounded-3xl sm:rounded-[2rem]"
                    style={{
                      background: `linear-gradient(135deg, ${userAccentColor}, #ff00ff, ${userAccentColor})`,
                      backgroundSize: '200% 200%',
                    }}
                    animate={{
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />

                  <div className="relative rounded-3xl sm:rounded-[2rem] p-6 sm:p-8 md:p-10 overflow-hidden">
                    <div
                      className="absolute inset-0 backdrop-blur-xl"
                      style={{
                        background: `linear-gradient(135deg, ${userAccentColor}f0, ${userAccentColor}e0)`
                      }}
                    />

                    <motion.div
                      className="absolute top-0 right-0 w-40 h-40 sm:w-60 sm:h-60 rounded-full blur-3xl"
                      style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                      animate={{
                        scale: [1, 1.2, 1],
                        x: [0, 20, 0],
                        y: [0, -20, 0],
                      }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    />

                    <motion.div
                      className="absolute bottom-0 left-0 w-32 h-32 sm:w-48 sm:h-48 rounded-full blur-3xl"
                      style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                      animate={{
                        scale: [1, 1.3, 1],
                        x: [0, -20, 0],
                        y: [0, 20, 0],
                      }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />

                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
                      <div className="flex-1 text-center lg:text-left space-y-3">
                        <motion.div
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-2"
                          animate={{
                            scale: [1, 1.05, 1],
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Sparkles className="w-4 h-4 text-yellow-300" />
                          <span className="text-xs sm:text-sm font-bold text-white">
                            Criado com Freelinnk
                          </span>
                        </motion.div>

                        <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight">
                          Crie Sua Página
                          <br />
                          <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                            em 2 Minutos!
                          </span>
                        </h3>

                        <p className="text-base sm:text-lg text-white/90 max-w-md mx-auto lg:mx-0">
                          Links ilimitados, QR Code, estatísticas e muito mais!
                        </p>

                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 mt-4">
                          {[
                            { icon: Rocket, text: 'Grátis Forever' },
                            { icon: Sparkles, text: 'Sem Anúncios' },
                            { icon: Crown, text: 'Upgrades Pro' },
                          ].map((feature, i) => (
                            <motion.div
                              key={i}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.6 + i * 0.1 }}
                              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                            >
                              <feature.icon className="w-3.5 h-3.5 text-white" />
                              <span className="text-xs sm:text-sm font-semibold text-white">
                                {feature.text}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      <Link href="/" className="flex-shrink-0">
                        <motion.button
                          className="group relative px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-black text-base sm:text-lg overflow-hidden shadow-2xl"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          style={{ color: userAccentColor }}
                        >
                          <div className="absolute inset-0 bg-white rounded-2xl" />

                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30"
                            animate={{
                              x: ['-200%', '200%'],
                            }}
                            transition={{ duration: 1, repeat: Infinity }}
                          />

                          <span className="relative z-10 flex items-center gap-2">
                            <Rocket className="w-5 h-5 sm:w-6 sm:h-6" />
                            Começar Grátis
                            <motion.span
                              animate={{ x: [0, 5, 0] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              →
                            </motion.span>
                          </span>
                        </motion.button>
                      </Link>
                    </div>

                    <div className="absolute inset-0 pointer-events-none">
                      {[
                        { icon: Star, delay: 0, x: '10%', y: '20%' },
                        { icon: Heart, delay: 0.5, x: '80%', y: '30%' },
                        { icon: Sparkles, delay: 1, x: '20%', y: '70%' },
                        { icon: Crown, delay: 1.5, x: '85%', y: '75%' },
                      ].map((item, i) => (
                        <motion.div
                          key={i}
                          className="absolute"
                          style={{ left: item.x, top: item.y }}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{
                            opacity: [0, 0.3, 0],
                            scale: [0, 1, 0],
                            y: [0, -20, -40],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: item.delay,
                          }}
                        >
                          <item.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.main>
        </div>

        {/* ==================== FOOTER ==================== */}
        {plan === 'free' && (
          <motion.footer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-16 sm:mt-20 md:mt-24 relative"
          >
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200/50 dark:border-gray-700/50" />
              </div>
              <div className="relative flex justify-center">
                <motion.div
                  className="px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700"
                  style={{
                    background: `linear-gradient(135deg, ${userAccentColor}10, transparent)`,
                  }}
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: userAccentColor }} />
                </motion.div>
              </div>
            </div>

            <div className="text-center space-y-4">
              <motion.p
                className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2 flex-wrap"
                whileHover={{ scale: 1.05 }}
              >
                Feito com
                <motion.span
                  animate={{
                    scale: [1, 1.3, 1],
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Heart className="w-4 h-4 text-red-500 fill-current" />
                </motion.span>
                por
                <Link
                  href={getBaseUrl() + "/"}
                  className="group relative font-bold"
                >
                  <span
                    className="relative z-10 transition-colors duration-300"
                    style={{ color: userAccentColor }}
                  >
                    Freelinnk
                  </span>
                  <motion.span
                    className="absolute bottom-0 left-0 w-full h-0.5 origin-left"
                    style={{ background: userAccentColor }}
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
              </motion.p>

              <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500">
                © {new Date().getFullYear()} Todos os direitos reservados
              </p>
            </div>
          </motion.footer>
        )}
      </div>

      {/* ==================== SCROLL TO TOP BUTTON ==================== */}
      <motion.button
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.1, y: -5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 },
            colors: [userAccentColor, '#ff00ff', '#00ffff']
          });
        }}
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl shadow-2xl flex items-center justify-center text-white z-40 overflow-hidden group"
        style={{
          background: userAccentColor,
          boxShadow: `0 10px 40px ${userAccentColor}66`
        }}
      >
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{ background: userAccentColor }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="relative z-10"
        >
          <ChevronDown className="w-6 h-6 sm:w-7 sm:h-7 rotate-180" />
        </motion.div>

        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100"
          animate={{ x: ['-200%', '200%'] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </motion.button>

      {/* ==================== ESTILOS GLOBAIS ==================== */}
      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 10px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb {
          background: ${userAccentColor};
          border-radius: 10px;
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        ::-webkit-scrollbar-thumb:hover {
          background: ${userAccentColor}dd;
        }

        html {
          scroll-behavior: smooth;
        }

        button, .cursor-pointer {
          -webkit-tap-highlight-color: transparent;
          user-select: none;
        }

        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .glass {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        @media (max-width: 640px) {
          body {
            overscroll-behavior-y: contain;
          }
        }

        @media screen and (max-width: 768px) {
          input, select, textarea {
            font-size: 16px !important;
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .shimmer {
          animation: shimmer 2s infinite linear;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.3) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          background-size: 1000px 100%;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}