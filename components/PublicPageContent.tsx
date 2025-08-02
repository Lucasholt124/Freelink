"use client";

import { api } from "@/convex/_generated/api";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { User, Share2, Link as LinkIcon, Check } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getBaseUrl } from "@/convex/lib/getBaseUrl";
import { useState } from "react";
import { trackLinkClick } from "@/lib/analytics";
import {
  FaYoutube, FaInstagram, FaFacebook, FaTwitter, FaLinkedin, FaTiktok, FaWhatsapp, FaGithub, FaSpotify, FaTwitch, FaGlobe, FaEnvelope, FaTelegram, FaPinterest, FaDiscord, FaSlack, FaDribbble, FaFigma,
} from "react-icons/fa6";
import { SubscriptionPlan } from "@/lib/subscription";


// --- Props atualizadas para incluir o plano do usuário ---
interface PublicPageContentProps {
  username: string;
  preloadedLinks: Preloaded<typeof api.lib.links.getLinksBySlug>;
  preloadedCustomizations: Preloaded<
    typeof api.lib.customizations.getCustomizationsBySlug
  >;
  plan: SubscriptionPlan; // <-- NOVA PROP: Recebe "free", "pro" ou "ultra"
}

type LinkType = {
  _id: string;
  title: string;
  url: string;
};

function VerifiedBadge() {
  return (
    <span
      className="inline-flex items-center justify-center w-7 h-7 rounded-full border-2 border-purple-500 bg-white group-hover:scale-110 transition-transform duration-200 ease-in-out flex-shrink-0"
      title="Verificado"
      aria-label="Selo de Verificação"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-green-500"
        aria-hidden="true"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </span>
  );
}

function getLinkIcon(url: string) {
  if (!url) return <LinkIcon className="w-6 h-6" />;
  const u = url.toLowerCase();
  if (u.includes("youtube.com") || u.includes("youtu.be"))
    return <FaYoutube className="w-6 h-6 text-[#FF0000]" />;
  if (u.includes("instagram.com"))
    return <FaInstagram className="w-6 h-6 text-[#E1306C]" />;
  if (u.includes("facebook.com"))
    return <FaFacebook className="w-6 h-6 text-[#1877F3]" />;
  if (u.includes("twitter.com") || u.includes("x.com"))
    return <FaTwitter className="w-6 h-6 text-[#1DA1F2]" />;
  if (u.includes("linkedin.com"))
    return <FaLinkedin className="w-6 h-6 text-[#0077B5]" />;
  if (u.includes("tiktok.com"))
    return <FaTiktok className="w-6 h-6 text-[#000000]" />;
  if (u.includes("wa.me") || u.includes("whatsapp.com"))
    return <FaWhatsapp className="w-6 h-6 text-[#25D366]" />;
  if (u.includes("github.com"))
    return <FaGithub className="w-6 h-6 text-[#333]" />;
  if (u.includes("spotify.com"))
    return <FaSpotify className="w-6 h-6 text-[#1DB954]" />;
  if (u.includes("twitch.tv"))
    return <FaTwitch className="w-6 h-6 text-[#9147FF]" />;
  if (u.includes("mailto:"))
    return <FaEnvelope className="w-6 h-6 text-[#EA4335]" />;
  if (u.includes("telegram.me") || u.includes("t.me") || u.includes("telegram.org"))
    return <FaTelegram className="w-6 h-6 text-[#229ED9]" />;
  if (u.includes("pinterest.com"))
    return <FaPinterest className="w-6 h-6 text-[#E60023]" />;
  if (u.includes("discord.gg") || u.includes("discord.com"))
    return <FaDiscord className="w-6 h-6 text-[#5865F2]" />;
  if (u.includes("slack.com"))
    return <FaSlack className="w-6 h-6 text-[#611f69]" />;
  if (u.includes("notion.so") || u.includes("notion.site"))
    return (
      <svg viewBox="0 0 50 50" fill="none" className="w-6 h-6">
        <rect width="50" height="50" rx="12" fill="#fff" />
        <path
          d="M13.5 13.5h23v23h-23v-23z"
          stroke="#000"
          strokeWidth="2.5"
          fill="#fff"
        />
        <path
          d="M19 33V17h3.5l8.5 16h-3.5l-1.5-3H20.5V33H19zm1.5-6.5h5.5l-2.75-5.5-2.75 5.5z"
          fill="#000"
        />
      </svg>
    );
  if (u.includes("dribbble.com"))
    return <FaDribbble className="w-6 h-6 text-[#EA4C89]" />;
  if (u.includes("figma.com"))
    return <FaFigma className="w-6 h-6 text-[#F24E1E]" />;
  if (u.includes("canva.com"))
    return (
      <svg viewBox="0 0 32 32" fill="none" className="w-6 h-6">
        <circle cx="16" cy="16" r="16" fill="#00C4CC" />
        <text
          x="50%"
          y="56%"
          textAnchor="middle"
          fontFamily="Arial, Helvetica, sans-serif"
          fontWeight="bold"
          fontSize="14"
          fill="#fff"
          dy=".3em"
        >
          Canva
        </text>
      </svg>
    );
  if (u.includes("http")) return <FaGlobe className="w-6 h-6 text-[#6366f1]" />;
  return <LinkIcon className="w-6 h-6" />;
}

export default function PublicPageContent({
  username,
  preloadedLinks,
  preloadedCustomizations,
  plan, // <-- RECEBEMOS O PLANO AQUI
}: PublicPageContentProps) {
  const customizations = usePreloadedQuery(preloadedCustomizations);
  const accentColor = customizations?.accentColor || "#6366f1";
  const profileUrl = `${getBaseUrl()}/u/${username}`;
  const [shared, setShared] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Perfil de @${username} no Freelinnk`,
          url: profileUrl,
        });
        setShared(true);
        setTimeout(() => setShared(false), 1800);
      } catch {
        // Usuário cancelou ou erro
      }
    } else {
      await navigator.clipboard.writeText(profileUrl);
      setShared(true);
      setTimeout(() => setShared(false), 1800);
    }
  };

  const links = usePreloadedQuery(preloadedLinks) as LinkType[];

  // Tracking para Tinybird (NÃO usa preventDefault)
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header com gradiente animado */}
      <div
        className="h-56 relative overflow-hidden"
        style={{
          background: `linear-gradient(120deg, ${accentColor} 0%, ${accentColor}ee 100%)`,
        }}
      >
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute -top-10 left-1/2 w-96 h-32 bg-white/20 rounded-full blur-2xl animate-pulse -translate-x-1/2" />
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-white/30 blur-[2px] animate-float"
              style={{
                width: `${18 + Math.random() * 18}px`,
                height: `${18 + Math.random() * 18}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative -mt-32 max-w-3xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex flex-col lg:flex-row lg:gap-12 xl:gap-16">
          {/* Profile Column */}
          <aside className="lg:w-80 lg:flex-shrink-0 mb-12 lg:mb-0">
            <div className="text-center lg:text-left">
              <div className="flex justify-center lg:justify-start mb-6 mt-10">
                <div className="relative group">
                  <div
                    className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-400 via-blue-400 to-pink-400 blur-lg opacity-70 group-hover:opacity-100 transition"
                    style={{ zIndex: 0 }}
                  />
                  {customizations?.profilePictureUrl ? (
                    <div className="w-32 h-32 rounded-full overflow-hidden shadow-2xl bg-white p-1 border-4 border-white relative z-10 animate-profile-pop">
                      <Image
                        src={customizations.profilePictureUrl}
                        alt={`${username}'s profile`}
                        width={128}
                        height={128}
                        className="w-full h-full object-cover rounded-full"
                        priority
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-white relative z-10 animate-profile-pop">
                      <User className="w-14 h-14 text-gray-300" />
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <h1
                    className="text-3xl lg:text-4xl font-extrabold tracking-tight flex items-center text-gray-900"
                    style={{
                      textShadow: "0 2px 8px #0001",
                    }}
                  >
                    @{username}
                  </h1>
                  <VerifiedBadge />
                </div>
                {customizations?.description && (
                  <p className="text-gray-700 text-base leading-relaxed max-w-md mx-auto lg:mx-0 text-center">
                    {customizations.description}
                  </p>
                )}
              </div>
              {/* Botão de compartilhar perfil */}
              <div className="mt-6 flex justify-center lg:justify-start">
                <button
                  onClick={handleShare}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200 ${
                    shared ? "bg-green-500 from-green-500 to-green-600" : ""
                  }`}
                  style={{ letterSpacing: "0.01em" }}
                  aria-label="Compartilhar perfil"
                  type="button"
                >
                  {shared ? (
                    <>
                      <Check className="w-5 h-5" />
                      Link copiado!
                    </>
                  ) : (
                    <>
                      <Share2 className="w-5 h-5" />
                      Compartilhar perfil
                    </>
                  )}
                </button>
              </div>
            </div>
          </aside>

          {/* Links Column */}
          <main className="flex-1 min-w-0">
            <div className="bg-white/95 backdrop-blur-xl border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-2xl animate-fade-in">
              {links && links.length > 0 ? (
                links.map((link) => (
                  <a
                    key={link._id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 w-full rounded-2xl py-4 px-6 mb-4 font-bold text-lg shadow-lg bg-white border-2 border-transparent hover:border-blue-400 transition-all duration-200 relative overflow-hidden hover:scale-[1.025] active:scale-95"
                    style={{
                      color: accentColor,
                      boxShadow: `0 4px 24px 0 ${accentColor}22`,
                    }}
                    onClick={() => handleTrack(link)}
                  >
                    <span className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 group-hover:bg-gray-200 transition">
                      {getLinkIcon(link.url)}
                    </span>
                    <span className="flex-1 truncate">{link.title}</span>
                  </a>
                ))
              ) : (
                <div className="text-center text-gray-400 py-8">
                  Nenhum link cadastrado ainda.
                </div>
              )}
            </div>
          </main>
        </div>

        {/* --- CORREÇÃO PRINCIPAL AQUI --- */}
        {/* O rodapé agora só é renderizado se o plano do usuário for "free" */}
        {plan === 'free' && (
          <footer className="mt-16 pt-8 border-t border-gray-200/50 text-center">
            <p className="text-gray-500 text-sm">
              Distribuído por{" "}
              <Link
                href={getBaseUrl() + "/"}
                className="hover:underline font-semibold"
                style={{ color: accentColor }}
              >
                Freelinnk
              </Link>
            </p>
          </footer>
        )}
      </div>
      {/* Animações */}
      <style jsx global>{`
        .animate-fade-in {
          animation: fadeIn 1.2s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(24px);}
          to { opacity: 1; transform: translateY(0);}
        }
        .animate-profile-pop {
          animation: profilePop 0.8s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes profilePop {
          0% { transform: scale(0.7) rotate(-8deg); opacity: 0; }
          60% { transform: scale(1.1) rotate(2deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); }
        }
        .animate-float {
          animation: float 3.5s ease-in-out infinite alternate;
        }
        @keyframes float {
          from { transform: translateY(0px);}
          to { transform: translateY(-24px);}
        }
      `}</style>
    </div>
  );
}