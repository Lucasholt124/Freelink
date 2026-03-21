"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Globe,
  Copy,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Check,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

const formSchema = z.object({
  username: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .max(30, "Máximo 30 caracteres")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Apenas letras, números, hífen (-) e underscore (_)"
    )
    .transform((val) => val.toLowerCase()),
});

type FormValues = z.infer<typeof formSchema>;

interface UsernameFormProps {
  onComplete?: () => void;
  hideSkip?: boolean;
  effectiveUserId?: string;
}

export default function UsernameForm({ onComplete, hideSkip, effectiveUserId }: UsernameFormProps) {
  const { user } = useUser();
  const [debouncedUsername, setDebouncedUsername] = useState("");
  const [copied, setCopied] = useState(false);

  const targetUserId = effectiveUserId || user?.id;

  // Queries e Mutations
  const currentSlug = useQuery(
    api.lib.usernames.getUserSlug,
    targetUserId ? { userId: targetUserId } : "skip"
  );

  const availabilityCheck = useQuery(
    api.lib.usernames.checkUsernameAvailability,
    debouncedUsername.length >= 3 ? { username: debouncedUsername } : "skip"
  );

  const setUsername = useMutation(api.lib.usernames.setUsername);

  // 🧠 Mutation para salvar o nicho classificado pela IA
  const saveUserNiche = useMutation(api.ads.saveUserNiche);

  // Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: "" },
  });

  const watchedUsername = form.watch("username");

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUsername(watchedUsername.toLowerCase());
    }, 400);
    return () => clearTimeout(timer);
  }, [watchedUsername]);

  // Copy handler
  const handleCopy = useCallback(async () => {
    if (!currentSlug) return;
    const url = `${window.location.origin}/${currentSlug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  }, [currentSlug]);

  // Share handler
  const handleShare = useCallback(async () => {
    if (!currentSlug) return;
    const url = `${window.location.origin}/${currentSlug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Meu link Freelinnk",
          text: "Confira minha página de links!",
          url: url,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          await navigator.clipboard.writeText(url);
          toast.success("Link copiado!");
        }
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
    }
  }, [currentSlug]);

  // Submit handler
  async function onSubmit(values: FormValues) {
    if (!targetUserId) return;

    try {
      const result = await setUsername({
        username: values.username,
        userId: targetUserId,
      });

      if (result.success) {
        // 🧠 CLASSIFICAÇÃO DE NICHO - UMA ÚNICA VEZ ao salvar o username
        // A IA analisa o nome do perfil e grava o nicho na tabela usernames.
        // Nas visitas públicas futuras: ZERO chamadas de IA.
        try {
          const res = await fetch("/api/analyze-niche", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: values.username.replace(/[-_]/g, " "),
              text: user?.fullName || user?.firstName || values.username,
            }),
          });

          if (res.ok) {
            const { niche } = await res.json();
            await saveUserNiche({ niche, userId: targetUserId });
            console.log(`✅ Nicho do perfil "${values.username}" classificado: ${niche}`);
          }
        } catch {
          console.log("⚠️ Classificação de nicho falhou, usando 'geral'");
        }

        // Celebration
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.65 },
          colors: ["#3b82f6", "#6366f1", "#8b5cf6"],
        });

        form.reset();
        onComplete?.();

        toast.custom(
          () => (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4"
            >
              <div className="text-3xl">🎉</div>
              <div>
                <p className="font-bold">URL atualizada!</p>
                <p className="text-sm text-white/80">
                  Seu novo link: freelinnk.com/{values.username}
                </p>
              </div>
            </motion.div>
          ),
          { duration: 4000 }
        );
      } else {
        form.setError("username", {
          message: result.error || "Este nome não está disponível",
        });
      }
    } catch {
      toast.error("Erro ao atualizar URL. Tente novamente.");
    }
  }

  // Status helper
  const getStatus = () => {
    if (!debouncedUsername || debouncedUsername.length < 3) return null;
    if (debouncedUsername !== watchedUsername.toLowerCase()) return "checking";
    if (!availabilityCheck) return "checking";
    if (debouncedUsername === currentSlug) return "current";
    return availabilityCheck.available ? "available" : "taken";
  };

  const status = getStatus();

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* URL Atual - Card Interativo */}
      <AnimatePresence>
        {currentSlug && !hideSkip && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 sm:p-5 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/50 border border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100/50 transition-all duration-300 group"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <motion.div
                  className="p-2.5 bg-white rounded-xl border border-gray-100 shadow-sm group-hover:shadow-md group-hover:border-blue-200 transition-all"
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <Globe className="w-5 h-5 text-blue-600" />
                </motion.div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">
                    Seu Link Ativo
                  </p>
                  <div className="flex items-center gap-1 text-gray-900 font-mono text-sm sm:text-base font-medium truncate">
                    <span className="text-gray-400 hidden sm:inline">freelinnk/</span>
                    <span className="text-gray-400 sm:hidden">../</span>
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-bold">
                      {currentSlug}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 sm:flex-initial">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 text-gray-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all"
                    onClick={handleCopy}
                  >
                    <AnimatePresence mode="wait">
                      {copied ? (
                        <motion.span
                          key="check"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="flex items-center gap-1"
                        >
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-green-600">Copiado!</span>
                        </motion.span>
                      ) : (
                        <motion.span
                          key="copy"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="flex items-center gap-1"
                        >
                          <Copy className="w-4 h-4" />
                          Copiar
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 sm:flex-initial">
                  <Link href={`/${currentSlug}`} target="_blank">
                    <Button
                      size="sm"
                      className="w-full gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
                    >
                      Visitar
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>

            {/* Quick Stats */}
            <motion.div
              className="hidden sm:flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ delay: 0.2 }}
            >
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-yellow-500" />
                Link ativo e funcionando
              </span>
              <span className="text-gray-300">•</span>
              <button
                onClick={handleShare}
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                Compartilhar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Formulário de Alteração */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
                  {currentSlug ? "Alterar URL" : "Escolha sua URL"}
                  {!currentSlug && (
                    <span className="text-xs font-normal text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                      Obrigatório
                    </span>
                  )}
                </FormLabel>
                <FormControl>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-sm pointer-events-none select-none hidden sm:block">
                      freelinnk.com/
                    </div>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-sm pointer-events-none select-none sm:hidden">
                      ../
                    </div>

                    <Input
                      placeholder="seu-nome"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "");
                        field.onChange(value);
                      }}
                      className="pl-[105px] sm:pl-[130px] pr-12 h-12 sm:h-14 border-gray-200 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-medium text-gray-800 text-base rounded-xl"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                    />

                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <AnimatePresence mode="wait">
                        {status === "checking" && (
                          <motion.div key="checking" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                          </motion.div>
                        )}
                        {status === "available" && (
                          <motion.div key="available" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          </motion.div>
                        )}
                        {status === "taken" && (
                          <motion.div key="taken" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                            <AlertCircle className="w-5 h-5 text-red-500" />
                          </motion.div>
                        )}
                        {status === "current" && (
                          <motion.div key="current" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                            <Check className="w-5 h-5 text-gray-400" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-indigo-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity -z-10 blur-xl" />
                  </div>
                </FormControl>

                <div className="min-h-[24px] mt-2">
                  <AnimatePresence mode="wait">
                    {status === "available" && (
                      <motion.p key="available" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="text-sm text-green-600 font-medium flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4" />
                        Perfeito! Este nome está disponível
                      </motion.p>
                    )}
                    {status === "taken" && (
                      <motion.p key="taken" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="text-sm text-red-600 font-medium flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" />
                        Ops! Este nome já está em uso
                      </motion.p>
                    )}
                    {status === "current" && (
                      <motion.p key="current" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="text-sm text-gray-500 font-medium flex items-center gap-1.5">
                        <Check className="w-4 h-4" />
                        Este é seu link atual
                      </motion.p>
                    )}
                  </AnimatePresence>
                  <FormMessage className="text-sm" />
                </div>
              </FormItem>
            )}
          />

          {/* Sugestões quando nome está em uso */}
          <AnimatePresence>
            {status === "taken" && debouncedUsername && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 mb-2 font-medium">
                    💡 Tente uma dessas alternativas:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      `${debouncedUsername}1`,
                      `${debouncedUsername}_`,
                      `${debouncedUsername}-oficial`,
                      `o${debouncedUsername}`,
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => form.setValue("username", suggestion)}
                        className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Button
              type="submit"
              disabled={
                (status !== "available" && status !== null) ||
                form.formState.isSubmitting ||
                !watchedUsername
              }
              className="w-full h-12 sm:h-14 bg-gray-900 hover:bg-black text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold text-base shadow-lg hover:shadow-xl"
            >
              {form.formState.isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Salvando...
                </span>
              ) : currentSlug ? (
                <span className="flex items-center gap-2">
                  Confirmar Alteração
                  <ArrowRight className="w-5 h-5" />
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Criar Meu Link
                </span>
              )}
            </Button>
          </motion.div>

          <p className="text-xs text-center text-gray-400 leading-relaxed">
            {currentSlug
              ? "Você pode alterar sua URL a qualquer momento. Links antigos não serão redirecionados."
              : "Escolha com cuidado! Você poderá alterar depois, mas links antigos não serão redirecionados."}
          </p>
        </form>
      </Form>
    </div>
  );
}