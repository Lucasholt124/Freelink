"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Trash2, Plus, Link as LinkIcon, ArrowRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
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
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 shadow-sm"
      >
        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        <span className="text-emerald-700 text-sm font-bold">
          {username} reservado!
        </span>
      </motion.div>

      <div className="space-y-2">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900"
        >
          Seus Primeiros{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">
            Produtos
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-slate-500 font-medium"
        >
          Cole seus links de venda ou redes sociais. <br/><span className="text-xs text-slate-400 font-normal">(Você pode pular isso e fazer depois no painel)</span>
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
                className="p-4 rounded-xl bg-white border-2 border-slate-100 hover:border-emerald-200 transition-colors shadow-sm"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center">
                    {suggestedLink?.icon || getLinkIcon(link.url, link.title)}
                  </div>
                  <div className="flex-1">
                    {link.id.startsWith("suggested-") ? (
                      <p className="text-slate-900 font-bold">{link.title}</p>
                    ) : (
                      <Input
                        value={link.title}
                        onChange={(e) => updateLinkTitle(link.id, e.target.value)}
                        placeholder="Ex: Falar no WhatsApp"
                        className="h-8 border-0 p-0 text-slate-900 font-bold placeholder:text-slate-300 focus-visible:ring-0"
                      />
                    )}
                    <p className="text-slate-400 text-xs font-medium">
                      {platform ? (
                        <span className={cn("font-bold", platform.color)}>
                          {platform.name} reconhecido ✓
                        </span>
                      ) : suggestedLink ? (
                        "Cole a URL abaixo"
                      ) : (
                        "Link de redirecionamento"
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
                  placeholder={suggestedLink?.placeholder || "www.seusite.com"}
                  className="h-11 rounded-lg border-slate-200 placeholder:text-slate-300 focus-visible:ring-emerald-500 font-medium"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      onSubmit(); // Se apertar Enter, avança direto sem travas
                    }
                  }}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={addCustomLink}
          className="w-full p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all flex items-center justify-center gap-2 text-slate-500 hover:text-emerald-600"
        >
          <Plus className="w-5 h-5" />
          <span className="font-bold">Adicionar outro link</span>
        </motion.button>
      </motion.div>

      <div className="flex items-center justify-between text-sm pt-2">
        <div className="flex items-center gap-2 text-slate-500 font-bold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
          <LinkIcon className="w-4 h-4" />
          <span>
            {validLinksCount} link{validLinksCount !== 1 && "s"} preenchido{validLinksCount !== 1 && "s"}
          </span>
        </div>
      </div>

      <Button
        onClick={onSubmit}
        variant={validLinksCount === 0 ? "outline" : "default"}
        className={cn(
          "w-full h-14 text-lg font-bold rounded-2xl shadow-lg group transition-all",
          validLinksCount === 0
            ? "border-slate-300 text-slate-600 hover:bg-slate-100 shadow-none"
            : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/25 text-white"
        )}
      >
        {validLinksCount === 0 ? "Pular e fazer no Painel" : "Continuar"}
        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
      </Button>

      <button
        onClick={onShowPreview}
        className="lg:hidden w-full flex items-center justify-center gap-2 py-2 text-slate-400 hover:text-slate-600 transition-colors"
      >
        <Eye className="w-4 h-4" />
        <span className="text-sm font-bold uppercase">Ver preview</span>
      </button>
    </motion.div>
  );
}