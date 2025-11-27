"use client";

import { motion } from "framer-motion";
import { Sparkles, Brain, Wand2, Crown, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface HeroSectionProps {
  userPlan: "pro" | "ultra";
  theme: string;
  setTheme: (theme: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
  isLoading: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export const HeroSection = ({
  userPlan,
  theme,
  setTheme,
  onSubmit,
  isLoading,
  inputRef,
}: HeroSectionProps) => {
  const examples = [
    { text: "Como ganhar seguidores no TikTok", icon: "🚀" },
    { text: "Receitas fitness em 60 segundos", icon: "🥗" },
    { text: "Dicas de investimento para iniciantes", icon: "💰" },
    { text: "Marketing digital para pequenos negócios", icon: "📱" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 mt-4 sm:mt-8 px-2">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className={cn(
          "relative overflow-hidden border-2 p-6 sm:p-10 md:p-12",
          userPlan === 'ultra'
            ? "border-purple-500/50 shadow-2xl shadow-purple-500/10"
            : "border-gray-200 shadow-xl"
        )}>
          {userPlan === 'ultra' && (
            <>
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-500/10 via-pink-500/10 to-transparent rounded-bl-full" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-orange-500/10 via-yellow-500/10 to-transparent rounded-tr-full" />
            </>
          )}

          <div className="relative z-10 text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <Badge
                variant="secondary"
                className={cn(
                  "px-4 py-1.5 text-sm font-semibold",
                  userPlan === 'ultra' && "bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50"
                )}
              >
                {userPlan === 'ultra' ? (
                  <>
                    <Crown className="w-4 h-4 mr-2 text-yellow-500 fill-yellow-500" />
                    Modo Diretor Ativado
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
                    Sua Máquina de Conteúdo
                  </>
                )}
              </Badge>
            </motion.div>

            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Freelinnk
              <span className={cn(
                "bg-clip-text text-transparent bg-gradient-to-r",
                userPlan === 'ultra'
                  ? "from-purple-600 via-pink-500 to-orange-500"
                  : "from-blue-600 via-purple-600 to-pink-600"
              )}>
                Brain
              </span>
              {userPlan === 'ultra' && (
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="inline-block ml-2"
                >
                  ⚡
                </motion.span>
              )}
            </motion.h1>

            <motion.p
              className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {userPlan === 'ultra' ? (
                <>
                  Roteiros <span className="font-bold text-purple-600">frame-a-frame</span> com direção de câmera,
                  psicologia de atenção e <span className="font-bold text-pink-600">neuro-marketing</span> aplicado.
                </>
              ) : (
                <>
                  Transforme qualquer tema em uma <span className="font-bold text-purple-600">campanha completa</span> de
                  conteúdo viral em <span className="font-bold text-pink-600">30 segundos</span>.
                </>
              )}
            </motion.p>

            <motion.form
              onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
              className="space-y-4 pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="space-y-2">
                <Label className="flex items-center justify-center gap-2 text-sm sm:text-base font-semibold">
                  <Wand2 className="w-4 h-4 text-purple-500" />
                  Qual tema você quer dominar?
                </Label>
                <div className="relative max-w-xl mx-auto">
                  <Input
                    ref={inputRef}
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    placeholder="Ex: Como vender pelo Instagram, Receitas fitness..."
                    className={cn(
                      "text-base sm:text-lg py-6 sm:py-7 px-4 sm:px-6 pr-12 rounded-xl border-2 transition-all",
                      "focus:ring-4 focus:ring-purple-500/20",
                      userPlan === 'ultra' && "border-purple-300 focus:border-purple-500"
                    )}
                    maxLength={150}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    {theme.length}/150
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">Experimente:</span>
                {examples.slice(0, 3).map((example, idx) => (
                  <motion.button
                    key={idx}
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setTheme(example.text)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
                  >
                    <span>{example.icon}</span>
                    <span className="hidden sm:inline">{example.text.slice(0, 25)}...</span>
                    <span className="sm:hidden">{example.text.split(' ').slice(0, 3).join(' ')}...</span>
                  </motion.button>
                ))}
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={isLoading || !theme.trim()}
                className={cn(
                  "w-full max-w-md mx-auto h-14 sm:h-16 text-base sm:text-lg font-bold rounded-xl",
                  "transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
                  "shadow-lg hover:shadow-xl",
                  userPlan === 'ultra'
                    ? "bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                )}
              >
                                {userPlan === 'ultra' ? (
                  <>
                    <Brain className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                    <span className="hidden xs:inline">GERAR ROTEIRO ULTRA VIRAL</span>
                    <span className="xs:hidden">GERAR ULTRA</span>
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 ml-2 fill-yellow-300 text-yellow-300" />
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    <span className="hidden xs:inline">Gerar Campanha Completa</span>
                    <span className="xs:hidden">Gerar Campanha</span>
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </motion.form>

            {userPlan === 'pro' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="pt-4"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                  <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    Quer roteiros <strong>frame-a-frame</strong>?
                  </span>
                  <Link
                    href="/dashboard/billing"
                    className="text-xs sm:text-sm font-bold text-purple-600 hover:text-purple-700 underline underline-offset-2 whitespace-nowrap"
                  >
                    Vire Ultra →
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};