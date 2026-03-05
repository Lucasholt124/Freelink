"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Trash2, Plus, Link as LinkIcon, AlertCircle, ArrowRight, Eye, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { LinkItem, NicheOption } from "@/app/constants/onboarding-data";
import { getLinkIcon } from "@/app/constants/onboarding-utils";

const detectPlatform = (url: string): { name: string; color: string } | null => {
  const lower = url.toLowerCase();
  if (lower.includes("instagram")) return { name: "Instagram", color: "text-pink-500" };
  if (lower.includes("tiktok")) return { name: "TikTok", color: "text-slate-900" };
  if (lower.includes("youtube")) return { name: "YouTube", color: "text-red-500" };
  if (lower.includes("twitter") || lower.includes("x.com"))
    return { name: "X/Twitter", color: "text-blue-400" };
  if (lower.includes("linkedin")) return { name: "LinkedIn", color: "text-blue-600" };
  if (lower.includes("whatsapp") || lower.includes("wa.me"))
    return { name: "WhatsApp", color: "text-green-500" };
  if (lower.includes("spotify")) return { name: "Spotify", color: "text-green-400" };
  if (lower.includes("github")) return { name: "GitHub", color: "text-slate-700" };
  return null;
};

interface StepLinksProps {
  username: string;
  links: LinkItem[];
  selectedNiche: NicheOption | null;
  updateLinkTitle: (id: string, title: string) => void;
  updateLinkUrl: (id: string, url: string) => void;
  removeLink: (id: string) => void;
  addCustomLink: () => void;
  validLinksCount: number;
  onSubmit: () => void;
  onShowPreview: () => void;
}

export function StepLinks({
  username,
  links,
  selectedNiche,
  updateLinkTitle,
  updateLinkUrl,
  removeLink,
  addCustomLink,
  validLinksCount,
  onSubmit,
  onShowPreview,
}: StepLinksProps) {
  return (
    <motion.div
      key="links"
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
        <span className="text-emerald-700 text-sm font-semibold">
          freelinnk.com/{username} é seu!
        </span>
      </motion.div>

      <div className="space-y-2">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900"
        >
          Adicione seus{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
            links
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-slate-500"
        >
          Preencha os links que aparecem no seu perfil
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-3 max-h-[45vh] overflow-y-auto pr-1 custom-scrollbar"
      >
        <AnimatePresence mode="popLayout">
          {links.map((link, index) => {
            const suggestedLink = selectedNiche?.suggestedLinks[index];
            const platform = link.url ? detectPlatform(link.url) : null;

            return (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-xl bg-white border-2 border-slate-100 hover:border-violet-200 transition-colors shadow-sm"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center">
                    {suggestedLink?.icon || getLinkIcon(link.url, link.title)}
                  </div>
                  <div className="flex-1">
                    {link.id.startsWith("suggested-") ? (
                      <p className="text-slate-900 font-semibold">{link.title}</p>
                    ) : (
                      <Input
                        value={link.title}
                        onChange={(e) => updateLinkTitle(link.id, e.target.value)}
                        placeholder="Título do link"
                        className="h-8 border-0 p-0 text-slate-900 font-semibold placeholder:text-slate-300 focus-visible:ring-0"
                      />
                    )}
                    <p className="text-slate-400 text-xs">
                      {platform ? (
                        <span className={cn("font-medium", platform.color)}>
                          {platform.name} detectado ✓
                        </span>
                      ) : suggestedLink ? (
                        "Cole seu link abaixo"
                      ) : (
                        "Link personalizado"
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => removeLink(link.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <Input
                  value={link.url.replace("https://", "")}
                  onChange={(e) => updateLinkUrl(link.id, e.target.value)}
                  placeholder={suggestedLink?.placeholder || "https://seulink.com"}
                  className="h-11 rounded-lg border-slate-200 placeholder:text-slate-300 focus-visible:ring-violet-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (validLinksCount > 0) {
                        onSubmit();
                      } else {
                        toast.error("Preencha o link antes de continuar");
                      }
                    }
                  }}
                />

                {link.url && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-2 flex items-center gap-2 text-emerald-600"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">Link adicionado</span>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={addCustomLink}
          className="w-full p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-violet-400 hover:bg-violet-50/50 transition-all flex items-center justify-center gap-2 text-slate-500 hover:text-violet-600"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Adicionar outro link</span>
        </motion.button>
      </motion.div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-slate-500">
          <LinkIcon className="w-4 h-4" />
          <span>
            {validLinksCount} link{validLinksCount !== 1 && "s"} preenchido{validLinksCount !== 1 && "s"}
          </span>
        </div>
        {validLinksCount === 0 && (
          <span className="text-amber-600 flex items-center gap-1 font-medium">
            <AlertCircle className="w-4 h-4" />
            Mínimo 1 link
          </span>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-100"
      >
        <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0 mt-0.5">
          <Lightbulb className="w-4 h-4" />
        </div>
        <p className="text-amber-700 text-xs font-medium leading-relaxed">
          Comece com 2-3 links principais. Você pode adicionar mais depois!
        </p>
      </motion.div>

      <Button
        onClick={onSubmit}
        disabled={validLinksCount === 0}
        className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 disabled:opacity-50 group"
      >
        Continuar
        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
      </Button>

      <button
        onClick={onShowPreview}
        className="lg:hidden w-full flex items-center justify-center gap-2 py-2 text-slate-400 hover:text-slate-600 transition-colors"
      >
        <Eye className="w-4 h-4" />
        <span className="text-sm font-medium">Ver preview</span>
      </button>
    </motion.div>
  );
}