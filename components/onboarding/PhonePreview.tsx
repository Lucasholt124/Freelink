"use client";

import { motion, AnimatePresence } from "framer-motion";
import { User, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { LinkItem, TemplateOption } from "@/app/constants/onboarding-data";
import { getPreviewLinkIcon } from "@/app/constants/onboarding-utils";

export function PhonePreview({
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
  iframeKey?: number;
  onRefresh?: () => void;
  isLoading?: boolean;
  className?: string;
}) {
  const bgStyle = template.preview.bg.includes('gradient')
    ? { background: template.preview.bg }
    : { backgroundColor: template.preview.bg };

  return (
    <div className={cn("relative z-10", className)}>
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[80%] h-10 bg-black/30 blur-2xl rounded-full pointer-events-none" />

      <motion.div
        className="relative w-[280px] h-[580px] sm:w-[300px] sm:h-[620px] bg-[#1a1a1a] rounded-[3rem] p-3 shadow-2xl ring-1 ring-white/10 border-[6px] border-[#2a2a2a]"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
      >
        <div className="absolute top-28 -left-[9px] w-[3px] h-10 bg-[#2a2a2a] rounded-l-md" />
        <div className="absolute top-44 -left-[9px] w-[3px] h-16 bg-[#2a2a2a] rounded-l-md" />
        <div className="absolute top-36 -right-[9px] w-[3px] h-20 bg-[#2a2a2a] rounded-r-md" />

        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[30%] h-7 bg-black rounded-full z-30 flex items-center justify-center gap-2 pointer-events-none">
          <div className="w-1.5 h-1.5 rounded-full bg-[#111] blur-[0.5px]" />
        </div>

        <div
          className="w-full h-full rounded-[2.2rem] overflow-hidden relative flex flex-col no-scrollbar overflow-y-auto"
          style={bgStyle}
        >
          <div className="pt-16 pb-6 px-5 flex flex-col items-center text-center shrink-0">
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

            <motion.h2
              className="font-bold text-xl leading-tight mb-2 tracking-tight"
              style={{ color: template.preview.textPrimary }}
            >
              {displayName || "@" + (username || "seu-nome")}
            </motion.h2>

            {bio && (
              <p className="text-xs font-medium opacity-85 max-w-[90%] leading-relaxed line-clamp-3" style={{ color: template.preview.textSecondary }}>
                {bio}
              </p>
            )}
          </div>

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
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="flex items-center gap-3.5 min-w-0 relative z-10 w-full justify-center">
                      <div className="absolute left-0 text-xl opacity-90">
                        {link.iconPreview ? (
                          <img src={link.iconPreview} className="w-6 h-6 object-cover rounded-md" alt="" />
                        ) : (
                          getPreviewLinkIcon(link.url, link.title)
                        )}
                      </div>

                      <span className="text-sm font-bold truncate text-center w-full px-6">
                        {link.title}
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <>
                  <div className="w-full h-14 rounded-xl opacity-20 animate-pulse" style={{ backgroundColor: template.preview.buttonBg }} />
                  <div className="w-full h-14 rounded-xl opacity-10 animate-pulse" style={{ backgroundColor: template.preview.buttonBg }} />
                </>
              )}
            </AnimatePresence>
          </div>

          <div className="absolute bottom-6 left-0 right-0 flex justify-center opacity-70 pointer-events-none">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: template.preview.textPrimary }}>
              <Zap className="w-3 h-3 fill-current" />
              Freelinnk
            </div>
          </div>
        </div>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-36 h-1.5 rounded-full z-30 bg-white/20 backdrop-blur-md" />
      </motion.div>
    </div>
  );
}