"use client";

import { api } from "@/convex/_generated/api";
import { Preloaded, usePreloadedQuery, useQuery } from "convex/react";
import { User, Share2, Link as LinkIcon, Check, Heart, Sparkles, QrCode, Moon, Sun, Calendar, Download, ExternalLink, ChevronDown, Shield, Gem, Crown, Star, Zap, Cookie } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { getBaseUrl } from "@/convex/lib/getBaseUrl";
import { useState, useEffect, useRef, useCallback } from "react";
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

// 🌟 COMPONENTE DE PARTÍCULAS OTIMIZADO
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

      // 60 FPS lock
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

        // Glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = particle.color;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color.replace(/[\d.]+\)$/g, `${particle.opacity})`);
        ctx.fill();

        ctx.shadowBlur = 0;

        // Conexões otimizadas
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

// 💎 BADGE COM EFEITOS PREMIUM
function VerifiedBadge({ size = "default", plan = "free" }: { size?: "default" | "large"; plan?: string }) {
  const sizeClasses = size === "large" ? "w-6 h-6 sm:w-7 sm:h-7" : "w-5 h-5 sm:w-6 sm:h-6";

  const getBadgeConfig = () => {
    switch(plan) {
      case 'premium':
        return {
          gradient: 'from-purple-500 via-pink-500 to-purple-600',
          icon: <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />,
          glow: 'shadow-[0_0_20px_rgba(168,85,247,0.6)]'
        };
      case 'pro':
        return {
          gradient: 'from-blue-500 via-cyan-500 to-blue-600',
          icon: <Gem className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />,
          glow: 'shadow-[0_0_20px_rgba(59,130,246,0.6)]'
        };
      case 'business':
        return {
          gradient: 'from-yellow-500 via-orange-500 to-yellow-600',
          icon: <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />,
          glow: 'shadow-[0_0_20px_rgba(234,179,8,0.6)]'
        };
      case 'enterprise':
        return {
          gradient: 'from-red-500 via-pink-500 to-red-600',
          icon: <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />,
          glow: 'shadow-[0_0_20px_rgba(239,68,68,0.6)]'
        };
      default:
        return {
          gradient: 'from-gray-400 to-gray-600',
          icon: <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />,
          glow: ''
        };
    }
  };

  const config = getBadgeConfig();

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
      {/* Shimmer effect */}
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

// 🎨 ÍCONES DOS LINKS COM ANIMAÇÃO
function getLinkIcon(url: string) {
  if (!url) return <LinkIcon className="w-4 h-4 sm:w-5 sm:h-5" />;
  const u = url.toLowerCase();

  const iconMap = [
    { match: ['youtube.com', 'youtu.be'], icon: <FaYoutube className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF0000]" /> },
    { match: ['instagram.com'], icon: <FaInstagram className="w-4 h-4 sm:w-5 sm:h-5 text-[#E1306C]" /> },
    { match: ['facebook.com', 'fb.com'], icon: <FaFacebook className="w-4 h-4 sm:w-5 sm:h-5 text-[#1877F3]" /> },
    { match: ['twitter.com', 'x.com'], icon: <FaTwitter className="w-4 h-4 sm:w-5 sm:h-5 text-[#1DA1F2]" /> },
    { match: ['linkedin.com'], icon: <FaLinkedin className="w-4 h-4 sm:w-5 sm:h-5 text-[#0077B5]" /> },
    { match: ['tiktok.com'], icon: <FaTiktok className="w-4 h-4 sm:w-5 sm:h-5 text-[#000000]" /> },
    { match: ['github.com'], icon: <FaGithub className="w-4 h-4 sm:w-5 sm:h-5 text-[#181717]" /> },
    { match: ['whatsapp', 'wa.me'], icon: <FaWhatsapp className="w-4 h-4 sm:w-5 sm:h-5 text-[#25D366]" /> },
  ];

  for (const item of iconMap) {
    if (item.match.some(match => u.includes(match))) {
      return item.icon;
    }
  }

  if (u.includes('http')) return <FaGlobe className="w-4 h-4 sm:w-5 sm:h-5 text-[#6366f1]" />;
  return <LinkIcon className="w-4 h-4 sm:w-5 sm:h-5" />;
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

  // ✅ 1. Buscar configurações de rastreamento do perfil (Google/Facebook)
  const trackingSettings = useQuery(api.tracking.getIdsBySlug, { slug: username });

  const profileUrl = `${getBaseUrl()}/u/${username}`;
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

  // ✅ 2. Estado para o consentimento de Cookies
  const [cookieConsent, setCookieConsent] = useState<"granted" | "denied" | null>(null);

  const links = usePreloadedQuery(preloadedLinks) as LinkType[];

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

  // ✅ 3. Verificar se o usuário já deu consentimento anteriormente
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
    // 🎊 CONFETTI ÉPICO
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      colors: [userAccentColor, '#ff00ff', '#00ffff', '#ffff00', '#ff0080']
    };

    interface ConfettiOptions {
      spread?: number;
      startVelocity?: number;
      decay?: number;
      scalar?: number;
    }

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

    // 💝 CONFETTI DE CORAÇÃO
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

  // 🎨 LOADING SCREEN ÉPICO
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${userAccentColor}, ${userAccentColor}dd)`
          }}
        />

        {/* Animated background */}
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
              {/* Outer ring */}
              <motion.div
                className="w-20 h-20 sm:w-28 sm:h-28 border-4 border-transparent border-t-white border-r-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />

              {/* Inner ring */}
              <motion.div
                className="absolute inset-2 sm:inset-3 border-4 border-transparent border-b-white/50 border-l-white/50 rounded-full"
                animate={{ rotate: -360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />

              {/* Center pulse */}
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
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-white rounded-full"
                    animate={{ y: [0, -10, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </div>
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

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'dark' : ''}`}>

      {/* ✅ 4. Scripts de Rastreamento (Google & Facebook) - Só ativam se consentimento for 'granted' */}
      {cookieConsent === 'granted' && trackingSettings && (
        <>
          {/* Google Analytics 4 */}
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

          {/* Facebook Pixel */}
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

      {/* Progress bar */}
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

      {/* Header */}
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

            {/* Animated shimmer */}
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

        {/* Top buttons */}
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

        {/* QR Code Dropdown CORRIGIDO */}
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

      {/* Main Content */}
      <div className="relative -mt-24 sm:-mt-32 md:-mt-40 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-8 sm:pb-12 md:pb-16">
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="lg:sticky lg:top-8 space-y-3 sm:space-y-4">
              {/* Profile Card */}
              <motion.div
                className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 shadow-2xl border border-white/10"
                style={{
                  background: backgroundConfig.type === "image"
                    ? isDarkMode
                      ? 'rgba(17, 24, 39, 0.95)'
                      : 'rgba(255, 255, 255, 0.95)'
                    : isDarkMode
                      ? 'rgba(17, 24, 39, 0.9)'
                      : 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: `0 8px 32px ${hexToRgba(userAccentColor, 0.2)}`
                }}
                whileHover={{ y: -5, boxShadow: `0 12px 40px ${hexToRgba(userAccentColor, 0.3)}` }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Glassmorphism overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

                {/* Animated border */}
                <motion.div
                  className="absolute inset-0 rounded-2xl sm:rounded-3xl"
                  style={{
                    background: `linear-gradient(135deg, ${userAccentColor}40, transparent)`,
                  }}
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />

                <div className="relative z-10">
                  {/* Profile Picture */}
                  <div className="flex justify-center mb-3 sm:mb-4 md:mb-5">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative group cursor-pointer"
                    >
                      {/* Glow effect */}
                      <motion.div
                        className="absolute inset-0 rounded-full blur-2xl opacity-0 group-hover:opacity-75 transition-opacity duration-500"
                        style={{ background: userAccentColor }}
                        animate={{
                          scale: [1, 1.2, 1],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />

                      {/* Ring animation */}
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
                        <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden shadow-2xl bg-white p-1 border-4 relative z-10"
                          style={{
                            borderColor: userAccentColor,
                            boxShadow: `0 0 30px ${hexToRgba(userAccentColor, 0.5)}`
                          }}
                        >
                          <Image
                            src={customizations.profilePictureUrl}
                            alt={`${username}'s profile`}
                            width={128}
                            height={128}
                            className="w-full h-full object-cover rounded-full"
                            priority
                            loading="eager"
                          />
                        </div>
                      ) : (
                        <motion.div
                          className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full flex items-center justify-center shadow-2xl border-4 border-white dark:border-gray-800 relative z-10"
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
                          <User className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-white" />
                        </motion.div>
                      )}
                    </motion.div>
                  </div>

                  {/* Username */}
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
                      <motion.h1
                        className="text-lg sm:text-xl md:text-2xl font-black break-all"
                        style={{
                          color: userAccentColor,
                          textShadow: `0 2px 10px ${hexToRgba(userAccentColor, 0.3)}`
                        }}
                        animate={{
                          textShadow: [
                            `0 2px 10px ${hexToRgba(userAccentColor, 0.3)}`,
                            `0 2px 15px ${hexToRgba(userAccentColor, 0.5)}`,
                            `0 2px 10px ${hexToRgba(userAccentColor, 0.3)}`,
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        @{username}
                      </motion.h1>
                      {plan !== 'free' && <VerifiedBadge size="large" plan={plan} />}
                    </div>

                    {plan === 'free' && (
                      <Link href={getBaseUrl() + "/"} className="group inline-block">
                        <motion.p
                          className="text-[9px] sm:text-[10px] text-gray-400 dark:text-gray-500 opacity-60 hover:opacity-100 transition-opacity"
                          whileHover={{ scale: 1.05 }}
                        >
                          Powered by <span className="font-semibold group-hover:text-purple-500 transition-colors">Freelinnk</span>
                        </motion.p>
                      </Link>
                    )}

                    {customizations?.description && (
                      <motion.p
                        className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed px-1 sm:px-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        {customizations.description}
                      </motion.p>
                    )}

                    <div className="flex items-center justify-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 flex-wrap pt-2">
                      <motion.div
                        className="flex items-center gap-1"
                        whileHover={{ scale: 1.05 }}
                      >
                        <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
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
            className="lg:col-span-2"
          >
            <div className="space-y-3 sm:space-y-4">
              {/* Links Container */}
              <motion.div
                className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl border border-white/10"
                style={{
                  background: backgroundConfig.type === "image"
                    ? isDarkMode
                      ? 'rgba(17, 24, 39, 0.95)'
                      : 'rgba(255, 255, 255, 0.95)'
                    : isDarkMode
                      ? 'rgba(17, 24, 39, 0.9)'
                      : 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: `0 8px 32px ${hexToRgba(userAccentColor, 0.2)}`
                }}
                whileHover={{ y: -2 }}
              >
                {/* Glassmorphism overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <motion.h2
                      className="text-lg sm:text-xl md:text-2xl font-black flex items-center gap-1.5 sm:gap-2"
                      style={{
                        color: userAccentColor,
                        textShadow: `0 2px 10px ${hexToRgba(userAccentColor, 0.3)}`
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
                      links.map((link, index) => (
                        <motion.div
                          key={link._id}
                          initial={{ opacity: 0, x: -50 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: index * 0.05,
                            type: "spring",
                            stiffness: 100
                          }}
                          whileHover={{ scale: 1.02, x: 5 }}
                          onHoverStart={() => setHoveredLink(link._id)}
                          onHoverEnd={() => setHoveredLink(null)}
                        >
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative flex items-center gap-2.5 sm:gap-3 w-full rounded-xl sm:rounded-2xl p-3 sm:p-3.5 md:p-4 font-bold text-sm sm:text-base transition-all duration-300 overflow-hidden"
                            style={{
                              background: isDarkMode
                                ? 'rgba(31, 41, 55, 0.5)'
                                : 'rgba(255, 255, 255, 0.5)',
                              backdropFilter: 'blur(10px)',
                              borderWidth: '2px',
                              borderStyle: 'solid',
                              borderColor: hoveredLink === link._id ? userAccentColor : 'transparent',
                              boxShadow: hoveredLink === link._id
                                ? `0 0 30px ${hexToRgba(userAccentColor, 0.4)}, inset 0 0 20px ${hexToRgba(userAccentColor, 0.1)}`
                                : '0 2px 8px rgba(0,0,0,0.1)',
                            }}
                            onClick={() => handleTrack(link)}
                          >
                            {/* Animated background gradient */}
                            <motion.div
                              className="absolute inset-0"
                              initial={{ opacity: 0 }}
                              animate={{
                                opacity: hoveredLink === link._id ? 0.15 : 0,
                              }}
                              style={{
                                background: `linear-gradient(135deg, ${userAccentColor}, transparent)`,
                              }}
                            />

                            {/* Shimmer effect on hover */}
                            {hoveredLink === link._id && (
                              <motion.div
                                className="absolute inset-0"
                                style={{
                                  background: `linear-gradient(90deg, transparent, ${hexToRgba(userAccentColor, 0.3)}, transparent)`
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
                            )}

                            {/* Icon */}
                            <motion.span
                              whileHover={{ rotate: 360, scale: 1.1 }}
                              transition={{ duration: 0.5 }}
                              className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg flex-shrink-0"
                              style={{
                                background: hoveredLink === link._id
                                  ? `linear-gradient(135deg, ${userAccentColor}20, ${userAccentColor}40)`
                                  : isDarkMode
                                    ? 'linear-gradient(135deg, rgba(55, 65, 81, 0.8), rgba(75, 85, 99, 0.8))'
                                    : 'linear-gradient(135deg, rgba(249, 250, 251, 0.8), rgba(243, 244, 246, 0.8))',
                                boxShadow: hoveredLink === link._id
                                  ? `0 4px 15px ${hexToRgba(userAccentColor, 0.4)}`
                                  : '0 2px 8px rgba(0,0,0,0.1)'
                              }}
                            >
                              {getLinkIcon(link.url)}
                            </motion.span>

                            {/* Title */}
                            <span
                              className="flex-1 transition-all duration-300 truncate text-sm sm:text-base font-bold"
                              style={{
                                color: hoveredLink === link._id
                                  ? userAccentColor
                                  : isDarkMode
                                    ? 'rgb(229, 231, 235)'
                                    : 'rgb(31, 41, 55)',
                                textShadow: hoveredLink === link._id
                                  ? `0 0 10px ${hexToRgba(userAccentColor, 0.5)}`
                                  : 'none'
                              }}
                            >
                              {link.title}
                            </span>

                            {/* Actions */}
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 relative z-10">
                              {/* Like Button */}
                              <motion.button
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleReaction(link._id);
                                }}
                                className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full transition-all duration-300"
                                style={{
                                  background: linkReactions[link._id]
                                    ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2))'
                                    : isDarkMode
                                      ? 'rgba(55, 65, 81, 0.5)'
                                      : 'rgba(243, 244, 246, 0.8)',
                                  boxShadow: linkReactions[link._id]
                                    ? '0 0 15px rgba(239, 68, 68, 0.3)'
                                    : 'none'
                                }}
                              >
                                <motion.div
                                  animate={linkReactions[link._id] ? {
                                    scale: [1, 1.3, 1],
                                  } : {}}
                                  transition={{ duration: 0.3 }}
                                >
                                  <Heart
                                    className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-all duration-300 ${
                                      linkReactions[link._id]
                                        ? 'text-red-500 fill-current drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                                        : 'text-gray-400'
                                    }`}
                                  />
                                </motion.div>
                                <span className="text-[10px] sm:text-xs font-bold text-gray-600 dark:text-gray-400">
                                  {linkReactions[link._id] || 0}
                                </span>
                              </motion.button>

                              {/* External Link Icon */}
                              <motion.div
                                animate={{
                                  x: hoveredLink === link._id ? [0, 3, 0] : 0,
                                  y: hoveredLink === link._id ? [0, -3, 0] : 0,
                                }}
                                transition={{ duration: 0.5, repeat: hoveredLink === link._id ? Infinity : 0 }}
                              >
                                <ExternalLink
                                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all duration-300 hidden sm:block"
                                  style={{
                                    color: hoveredLink === link._id ? userAccentColor : 'rgb(156, 163, 175)',
                                    filter: hoveredLink === link._id
                                      ? `drop-shadow(0 0 8px ${hexToRgba(userAccentColor, 0.8)})`
                                      : 'none'
                                  }}
                                />
                              </motion.div>
                            </div>
                          </a>
                        </motion.div>
                      ))
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
                        <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg font-bold mb-2">
                          Nenhum link cadastrado ainda
                        </p>
                        <p className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm">
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
            <p className="text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap px-4">
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

      {/* ✅ 5. BANNER DE COOKIES (Fixo na parte inferior) */}
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