"use client";


import { motion } from "framer-motion";
import { CheckCircle2, User, Link as LinkIcon, Lightbulb, Rocket, PartyPopper, Loader2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LinkItem, NicheOption, Step, TemplateOption } from "@/app/constants/onboarding-data";
import { getLinkIcon } from "@/app/constants/onboarding-utils";


interface StepReviewProps {
  displayName: string;
  bio: string;
  username: string;
  profileImage: { preview: string | null };
  selectedNiche: NicheOption | null;
  links: LinkItem[];
  validLinksCount: number;
  selectedTemplate: TemplateOption;
  loading: boolean;
  onEditStep: (step: Step) => void;
  onLaunch: () => void;
  onShowPreview: () => void;
}

export function StepReview({
  displayName,
  bio,
  username,
  profileImage,
  selectedNiche,
  links,
  validLinksCount,
  selectedTemplate,
  loading,
  onEditStep,
  onLaunch,
  onShowPreview,
}: StepReviewProps) {
  return (
    <motion.div
      key="review"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-5"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200"
      >
        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        <span className="text-emerald-700 text-sm font-semibold">Tudo pronto para lançar! 🚀</span>
      </motion.div>

      <div className="space-y-2">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900"
        >
          Revise sua{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
            página
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-slate-500"
        >
          Confira se tudo está certo antes de publicar
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        {/* Perfil */}
        <div className="p-4 rounded-xl bg-white border-2 border-slate-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center overflow-hidden flex-shrink-0">
            {profileImage.preview ? (
              <img src={profileImage.preview} className="w-full h-full object-cover" alt="Perfil" />
            ) : (
              <User className="w-7 h-7 text-violet-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-900 font-bold text-lg truncate">{displayName}</p>
            {bio && <p className="text-slate-500 text-sm truncate">{bio}</p>}
            <p className="text-violet-600 text-xs font-medium mt-0.5">freelinnk.com/{username}</p>
          </div>
          <button
            onClick={() => onEditStep("name")}
            className="text-xs text-violet-600 font-medium hover:underline flex-shrink-0"
          >
            Editar
          </button>
        </div>

        {/* Nicho */}
        {selectedNiche && (
          <div className="p-4 rounded-xl bg-white border-2 border-slate-100 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-3xl flex-shrink-0">
              {selectedNiche.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Área</p>
              <p className="text-slate-900 font-bold">{selectedNiche.name}</p>
            </div>
            <button
              onClick={() => onEditStep("niche")}
              className="text-xs text-violet-600 font-medium hover:underline flex-shrink-0"
            >
              Mudar
            </button>
          </div>
        )}

        {/* Links */}
        <div className="p-4 rounded-xl bg-white border-2 border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-slate-400" />
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                Links ({validLinksCount})
              </p>
            </div>
            <button
              onClick={() => onEditStep("links")}
              className="text-xs text-violet-600 font-medium hover:underline"
            >
              Editar
            </button>
          </div>
          <div className="space-y-2">
            {links
              .filter((l) => l.title && l.url)
              .slice(0, 4)
              .map((link) => (
                <div key={link.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center">
                    {getLinkIcon(link.url, link.title)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-900 text-sm font-medium truncate">{link.title}</p>
                    <p className="text-slate-400 text-xs truncate">
                      {link.url.replace("https://", "")}
                    </p>
                  </div>
                </div>
              ))}
            {validLinksCount > 4 && (
              <p className="text-slate-400 text-xs text-center py-1">+{validLinksCount - 4} mais</p>
            )}
          </div>
        </div>

        {/* Template */}
        <div className="p-4 rounded-xl bg-white border-2 border-slate-100 flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex-shrink-0 overflow-hidden"
            style={{ background: selectedTemplate.preview.bg }}
          >
            <div className="w-full h-full flex flex-col items-center justify-center p-2">
              <div
                className="w-3 h-3 rounded-full mb-1"
                style={{ background: selectedTemplate.preview.cardBg }}
              />
              <div className="w-full space-y-0.5">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-full h-1.5 rounded"
                    style={{ background: selectedTemplate.preview.buttonBg }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Template</p>
            <p className="text-slate-900 font-bold">{selectedTemplate.name}</p>
          </div>
          <button
            onClick={() => onEditStep("template")}
            className="text-xs text-violet-600 font-medium hover:underline flex-shrink-0"
          >
            Mudar
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/80 border border-blue-100"
      >
        <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0 mt-0.5">
          <Lightbulb className="w-4 h-4" />
        </div>
        <p className="text-blue-700 text-xs font-medium leading-relaxed">
          Relaxa! Você pode editar <strong>tudo</strong> isso depois no dashboard. Cores, links, bio,
          foto — tudo é customizável a qualquer momento.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Button
          onClick={onLaunch}
          disabled={loading}
          className="w-full h-16 text-xl font-black rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-700 hover:via-indigo-700 hover:to-blue-700 shadow-xl shadow-violet-500/30 group relative overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ["-200%", "200%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <motion.span className="relative flex items-center gap-3">
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Rocket className="w-6 h-6" />}
            Publicar minha página!
            {!loading && <PartyPopper className="w-5 h-5" />}
          </motion.span>
        </Button>
        <p className="text-center text-slate-400 text-xs mt-3">Sua página estará no ar em segundos</p>
      </motion.div>

      <button
        onClick={onShowPreview}
        className="lg:hidden w-full flex items-center justify-center gap-2 py-2 text-slate-400 hover:text-slate-600 transition-colors"
      >
        <Eye className="w-4 h-4" />
        <span className="text-sm font-medium">Ver preview final</span>
      </button>
    </motion.div>
  );
}