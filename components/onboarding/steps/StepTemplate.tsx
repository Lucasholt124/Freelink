"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Star, Check, Palette, ArrowRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TemplateOption } from "@/app/constants/onboarding-data";

interface StepTemplateProps {
  selectedTemplate: TemplateOption;
  setSelectedTemplate: (t: TemplateOption) => void;
  templateFilter: "all" | "light" | "dark" | "colorful" | "gradient";
  setTemplateFilter: (filter: "all" | "light" | "dark" | "colorful" | "gradient") => void;
  filteredTemplates: TemplateOption[];
  templatesLength: number;
  templatesLightCount: number;
  templatesDarkCount: number;
  templatesColorfulCount: number;
  templatesGradientCount: number;
  onNext: () => void;
  onShowPreview: () => void;
}

export function StepTemplate({
  selectedTemplate,
  setSelectedTemplate,
  templateFilter,
  setTemplateFilter,
  filteredTemplates,
  templatesLength,
  templatesLightCount,
  templatesDarkCount,
  templatesColorfulCount,
  templatesGradientCount,
  onNext,
  onShowPreview,
}: StepTemplateProps) {
  return (
    <motion.div
      key="template"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-5"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 border border-violet-200"
      >
        <Sparkles className="w-4 h-4 text-violet-600" />
        <span className="text-violet-700 text-sm font-semibold">Quase lá! 🎉</span>
      </motion.div>

      <div className="space-y-2">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900"
        >
          Escolha seu{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
            estilo
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-slate-500"
        >
          Mais de 20 templates gratuitos para você escolher ✨
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2 overflow-x-auto pb-2 no-scrollbar"
      >
        {[
          { id: "all", label: "Todos", count: templatesLength },
          { id: "light", label: "Claros", count: templatesLightCount },
          { id: "dark", label: "Escuros", count: templatesDarkCount },
          { id: "colorful", label: "Coloridos", count: templatesColorfulCount },
          { id: "gradient", label: "Gradientes", count: templatesGradientCount },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTemplateFilter(tab.id as typeof templateFilter)}
            className={cn(
              "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all",
              templateFilter === tab.id
                ? "bg-violet-600 text-white shadow-lg"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            {tab.label}
            <span
              className={cn(
                "ml-1.5 text-xs",
                templateFilter === tab.id ? "text-white/70" : "text-slate-400"
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-[40vh] overflow-y-auto pr-1 custom-scrollbar pb-2"
      >
        <AnimatePresence mode="popLayout">
          {filteredTemplates.map((template, index) => {
            const isSelected = selectedTemplate.id === template.id;

            return (
              <motion.button
                key={template.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.02 }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedTemplate(template)}
                className={cn(
                  "relative p-2 rounded-xl border-2 transition-all overflow-hidden",
                  isSelected
                    ? "border-violet-500 shadow-lg ring-2 ring-violet-500/20"
                    : "border-slate-100 hover:border-slate-200 bg-white"
                )}
              >
                {template.popular && (
                  <div className="absolute top-1 right-1 z-10">
                    <div className="w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
                      <Star className="w-2.5 h-2.5 text-white fill-white" />
                    </div>
                  </div>
                )}
                {template.new && (
                  <div className="absolute top-1 right-1 z-10">
                    <div className="px-1.5 py-0.5 bg-emerald-500 rounded text-[8px] text-white font-bold">
                      NEW
                    </div>
                  </div>
                )}

                <div
                  className="w-full h-16 sm:h-20 rounded-lg mb-2 overflow-hidden"
                  style={{ background: template.preview.bg }}
                >
                  <div className="w-full h-full flex flex-col items-center justify-center p-2">
                    <div
                      className="w-4 h-4 rounded-full mb-1"
                      style={{ background: template.preview.cardBg }}
                    />
                    <div className="w-full space-y-1">
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-full h-2 rounded"
                          style={{ background: template.preview.buttonBg }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-slate-700 text-[10px] sm:text-xs font-semibold text-center truncate">
                  {template.name}
                </p>

                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 left-1 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center"
                  >
                    <Check className="w-3 h-3 text-white" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </motion.div>

      <div className="flex items-center justify-center gap-2 py-1 text-sm text-slate-500">
        <Palette className="w-4 h-4" />
        <span>
          Template selecionado: <strong className="text-slate-700">{selectedTemplate.name}</strong>
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-100"
      >
        <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0 mt-0.5">
          <Palette className="w-4 h-4" />
        </div>
        <p className="text-amber-700 text-xs font-medium leading-relaxed">
          Você pode mudar o template a qualquer momento no dashboard
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Button
          onClick={onNext}
          className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 group"
        >
          Revisar e Lançar
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
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