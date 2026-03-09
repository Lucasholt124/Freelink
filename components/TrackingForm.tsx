"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import {
  Loader2, Facebook, BarChart4, Check, Info, Zap, LineChart,
  Target, HelpCircle, ArrowRight, ArrowDown, Globe, BarChart3,
  Users, Eye, AlertCircle, X, Sparkles, LogOut, Crown
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

type FormValues = {
  facebookPixelId: string;
  googleAnalyticsId: string;
};

export function TrackingForm() {
  const { userId: clerkUserId, isLoaded } = useAuth();
  const [subAccount, setSubAccount] = useState<{subUserId: string, username: string} | null>(null);

  // Lê a memória para saber se estamos numa sub-conta
  useEffect(() => {
    const saved = localStorage.getItem("freelinnk_active_subaccount");
    if (saved) {
      try { setSubAccount(JSON.parse(saved)); } catch  {}
    }
  }, []);

  const handleExitSubAccount = () => {
    localStorage.removeItem("freelinnk_active_subaccount");
    setSubAccount(null);
    window.location.reload();
  };

  const effectiveUserId = subAccount?.subUserId || clerkUserId;

  // Busca e salva usando o ID Efetivo
  const currentSettings = useQuery(api.tracking.getMyTrackingIds, effectiveUserId ? { userId: effectiveUserId } : "skip");
  const saveSettings = useMutation(api.tracking.saveTrackingIds);

  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [isFacebookValid, setIsFacebookValid] = useState<boolean | null>(null);
  const [isGoogleValid, setIsGoogleValid] = useState<boolean | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isMobileTooltipOpen, setIsMobileTooltipOpen] = useState<string | null>(null);

  const { register, handleSubmit, formState: { isSubmitting, isDirty }, reset, watch } = useForm<FormValues>();
  const watchedValues = watch();

  useEffect(() => {
    if (currentSettings) {
      reset({
        facebookPixelId: currentSettings.facebookPixelId ?? "",
        googleAnalyticsId: currentSettings.googleAnalyticsId ?? "",
      });
      setIsConfigured(Boolean(currentSettings.facebookPixelId || currentSettings.googleAnalyticsId));
    }
  }, [currentSettings, reset]);

  useEffect(() => {
    const facebookId = watchedValues.facebookPixelId;
    if (!facebookId || facebookId.length === 0) {
      setIsFacebookValid(null);
      return;
    }
    const isValid = /^\d{15,16}$/.test(facebookId);
    setIsFacebookValid(isValid);
  }, [watchedValues.facebookPixelId]);

  useEffect(() => {
    const googleId = watchedValues.googleAnalyticsId;
    if (!googleId || googleId.length === 0) {
      setIsGoogleValid(null);
      return;
    }
    const isValid = /^G-[A-Z0-9]{10}$/.test(googleId);
    setIsGoogleValid(isValid);
  }, [watchedValues.googleAnalyticsId]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    toast.promise(
      saveSettings({
        userId: effectiveUserId || undefined,
        facebookPixelId: data.facebookPixelId?.trim() || undefined,
        googleAnalyticsId: data.googleAnalyticsId?.trim() || undefined,
      }),
      {
        loading: "Salvando configurações...",
        success: (
          <div className="flex items-center gap-2">
            <span className="text-green-600 bg-green-100 p-1 rounded-full"><Check className="h-5 w-5" /></span>
            <div>
              <p className="font-semibold">Configurações salvas!</p>
              <p className="text-sm">Seus rastreadores estão ativos nesta página</p>
            </div>
          </div>
        ),
        error: "Erro ao salvar. Tente novamente.",
      }
    );
  };

  const toggleMobileTooltip = (id: string) => {
    setIsMobileTooltipOpen(isMobileTooltipOpen === id ? null : id);
  };

  if (!isLoaded || currentSettings === undefined) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px] p-6 sm:p-12">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-200 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-purple-600 font-medium">Carregando suas configurações...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full">
      {/* 🔥 BANNER FIXO DE SUB-CONTA 🔥 */}
      {subAccount && (
        <div className="bg-indigo-600 text-white px-4 py-3 flex items-center justify-between shadow-md rounded-t-xl relative z-50 mb-4">
          <div className="flex items-center gap-2">
             <Sparkles className="w-4 h-4 text-indigo-300" />
             <span className="text-sm font-medium hidden sm:inline">
               Editando rastreamento da página: <strong className="bg-white/20 px-2 py-0.5 rounded-md tracking-wider">@{subAccount.username}</strong>
             </span>
             <span className="text-sm font-medium sm:hidden">
               Página: <strong className="bg-white/20 px-2 py-0.5 rounded-md">@{subAccount.username}</strong>
             </span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExitSubAccount}
            className="h-8 text-xs font-bold hover:bg-red-50 hover:text-red-600 transition-colors"
          >
             <LogOut className="w-3 h-3 sm:mr-2" />
             <span className="hidden sm:inline">Voltar</span>
          </Button>
        </div>
      )}

      {/* Cabeçalho */}
      <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-0 mb-4">
        <div className="p-2 sm:p-2.5 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl shadow-md">
          <Target className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Rastreamento
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow animate-pulse">
              <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
              ULTRA
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
            Conecte pixels isolados por cliente • <span className="font-semibold text-purple-600">Otimize campanhas</span>
          </p>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl border border-gray-200/80 shadow-lg animate-fadeIn flex-1">
        <div className="relative overflow-hidden rounded-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 opacity-70"></div>
          <div className="relative z-10 p-2 sm:p-4">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 sm:mb-12">
              <div className="inline-flex items-center justify-center p-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl mb-4">
                <Target className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent">
                Central de Rastreamento
              </h2>
              <p className="mt-2 sm:mt-3 text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-1">
                Configure seus rastreadores para obter insights valiosos sobre os visitantes {subAccount ? <strong className="text-purple-600">desta página específica.</strong> : "do seu link."}
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="max-w-3xl mx-auto mb-6 sm:mb-8">
              <div className={`rounded-xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 shadow-sm ${isConfigured ? 'bg-green-50 border border-green-100' : 'bg-amber-50 border border-amber-100'}`}>
                <div className={`p-2 sm:p-3 rounded-full ${isConfigured ? 'bg-green-100' : 'bg-amber-100'}`}>
                  {isConfigured ? <Zap className={`h-5 w-5 sm:h-6 sm:w-6 text-green-600`} /> : <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />}
                </div>
                <div>
                  <h3 className={`font-semibold text-sm sm:text-base ${isConfigured ? 'text-green-800' : 'text-amber-800'}`}>
                    {isConfigured ? 'Rastreamento Ativo' : 'Rastreamento Não Configurado'}
                  </h3>
                  <p className={`text-xs sm:text-sm ${isConfigured ? 'text-green-600' : 'text-amber-600'}`}>
                    {isConfigured ? 'Seus rastreadores estão ativos e coletando dados.' : 'Configure pelo menos um rastreador para coletar dados.'}
                  </p>
                </div>
              </div>
            </motion.div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 sm:space-y-10 max-w-3xl mx-auto" noValidate>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Facebook Pixel */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} whileHover={{ y: -5 }} className="relative bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                  <div className="p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex gap-2 sm:gap-3 items-center">
                        <div className="p-2 bg-blue-100 rounded-lg"><Facebook className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" /></div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800">Facebook Pixel</h3>
                      </div>
                      <div className="relative hidden sm:block" onMouseEnter={() => setActiveTooltip('facebook')} onMouseLeave={() => setActiveTooltip(null)}>
                        <HelpCircle className="h-5 w-5 text-gray-400 cursor-help" />
                        <AnimatePresence>
                          {activeTooltip === 'facebook' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 w-64 p-3 bg-blue-50 border border-blue-100 rounded-lg shadow-lg z-10 text-xs text-blue-800">
                              <p className="font-semibold">O que é o Facebook Pixel?</p>
                              <p className="mt-1">Ferramenta de análise que permite rastrear conversões, otimizar anúncios e criar públicos-alvo para suas campanhas.</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <div className="sm:hidden">
                        <button type="button" onClick={() => toggleMobileTooltip('facebook')} className="p-1 text-gray-400 focus:outline-none"><HelpCircle className="h-5 w-5" /></button>
                      </div>
                    </div>
                    <AnimatePresence>
                      {isMobileTooltipOpen === 'facebook' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 bg-blue-50 border border-blue-100 rounded-lg p-3 relative overflow-hidden">
                          <button onClick={() => setIsMobileTooltipOpen(null)} className="absolute top-1 right-1 p-1 text-blue-700"><X className="h-4 w-4" /></button>
                          <p className="font-semibold text-xs text-blue-800">O que é o Facebook Pixel?</p>
                          <p className="mt-1 text-xs text-blue-800">Ferramenta de análise que permite rastrear conversões e otimizar anúncios.</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex gap-2 items-center text-xs sm:text-sm text-gray-600"><Users className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" /><span>Rastreia dados de visitantes e conversões</span></div>
                      <div className="flex gap-2 items-center text-xs sm:text-sm text-gray-600"><BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" /><span>Permite retargeting avançado</span></div>
                      <div className="flex gap-2 items-center text-xs sm:text-sm text-gray-600"><LineChart className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" /><span>Otimiza campanhas no Facebook</span></div>
                    </div>
                    <div className="mt-5 sm:mt-6 space-y-2">
                      <div className="flex justify-between">
                        <label htmlFor="facebookPixelId" className="block text-xs sm:text-sm font-semibold text-gray-700">ID do Pixel</label>
                        {isFacebookValid !== null && <span className={`text-xs font-medium ${isFacebookValid ? 'text-green-600' : 'text-red-600'}`}>{isFacebookValid ? 'ID válido' : 'Formato inválido'}</span>}
                      </div>
                      <div className="relative">
                        <input id="facebookPixelId" {...register("facebookPixelId")} type="text" placeholder="Ex: 123456789012345" className={`w-full rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 shadow-sm transition border focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400 ${isFacebookValid === true ? 'border-green-300 bg-green-50/30' : isFacebookValid === false ? 'border-red-300 bg-red-50/30' : 'border-gray-300'}`} disabled={isSubmitting} />
                        {isFacebookValid === true && <div className="absolute right-3 top-1/2 -translate-y-1/2"><div className="bg-green-100 p-1 rounded-full"><Check className="h-4 w-4 text-green-600" /></div></div>}
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1"><Info className="h-3 w-3 flex-shrink-0" />Deve ter 15-16 dígitos numéricos</p>
                    </div>
                  </div>
                </motion.div>

                {/* Google Analytics */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} whileHover={{ y: -5 }} className="relative bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 to-red-600"></div>
                  <div className="p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex gap-2 sm:gap-3 items-center">
                        <div className="p-2 bg-red-100 rounded-lg"><BarChart4 className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" /></div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800">Google Analytics</h3>
                      </div>
                      <div className="relative hidden sm:block" onMouseEnter={() => setActiveTooltip('google')} onMouseLeave={() => setActiveTooltip(null)}>
                        <HelpCircle className="h-5 w-5 text-gray-400 cursor-help" />
                        <AnimatePresence>
                          {activeTooltip === 'google' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 w-64 p-3 bg-red-50 border border-red-100 rounded-lg shadow-lg z-10 text-xs text-red-800">
                              <p className="font-semibold">O que é o Google Analytics 4?</p>
                              <p className="mt-1">Plataforma avançada de análise que permite entender o comportamento dos usuários.</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <div className="sm:hidden">
                        <button type="button" onClick={() => toggleMobileTooltip('google')} className="p-1 text-gray-400 focus:outline-none"><HelpCircle className="h-5 w-5" /></button>
                      </div>
                    </div>
                    <AnimatePresence>
                      {isMobileTooltipOpen === 'google' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 bg-red-50 border border-red-100 rounded-lg p-3 relative overflow-hidden">
                          <button onClick={() => setIsMobileTooltipOpen(null)} className="absolute top-1 right-1 p-1 text-red-700"><X className="h-4 w-4" /></button>
                          <p className="font-semibold text-xs text-red-800">O que é o Google Analytics 4?</p>
                          <p className="mt-1 text-xs text-red-800">Plataforma de análise para entender o comportamento dos usuários.</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex gap-2 items-center text-xs sm:text-sm text-gray-600"><Globe className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" /><span>Rastreia todo o comportamento dos visitantes</span></div>
                      <div className="flex gap-2 items-center text-xs sm:text-sm text-gray-600"><LineChart className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" /><span>Fornece análises detalhadas de tráfego</span></div>
                      <div className="flex gap-2 items-center text-xs sm:text-sm text-gray-600"><Eye className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" /><span>Acompanha eventos personalizados</span></div>
                    </div>
                    <div className="mt-5 sm:mt-6 space-y-2">
                      <div className="flex justify-between">
                        <label htmlFor="googleAnalyticsId" className="block text-xs sm:text-sm font-semibold text-gray-700">ID do GA4</label>
                        {isGoogleValid !== null && <span className={`text-xs font-medium ${isGoogleValid ? 'text-green-600' : 'text-red-600'}`}>{isGoogleValid ? 'ID válido' : 'Formato inválido'}</span>}
                      </div>
                      <div className="relative">
                        <input id="googleAnalyticsId" {...register("googleAnalyticsId")} type="text" placeholder="Ex: G-XXXXXXXXXX" className={`w-full rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 shadow-sm transition border focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-50 disabled:text-gray-400 ${isGoogleValid === true ? 'border-green-300 bg-green-50/30' : isGoogleValid === false ? 'border-red-300 bg-red-50/30' : 'border-gray-300'}`} disabled={isSubmitting} />
                        {isGoogleValid === true && <div className="absolute right-3 top-1/2 -translate-y-1/2"><div className="bg-green-100 p-1 rounded-full"><Check className="h-4 w-4 text-green-600" /></div></div>}
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1"><Info className="h-3 w-3 flex-shrink-0" />Formato: G-XXXXXXXXXX</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4">Como funciona o rastreamento</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-2">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 bg-purple-100 rounded-full mx-auto mb-3"><Globe className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" /></div>
                    <h4 className="text-center text-sm sm:text-base font-semibold text-gray-800 mb-2">1. Visitante acessa seu link</h4>
                    <p className="text-xs sm:text-sm text-gray-600 text-center">Quando alguém clica em seu link, os rastreadores são ativados.</p>
                  </div>
                  <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-4 rounded-xl border border-gray-200">
                    <div className="hidden md:block absolute -left-4 top-1/2 -translate-y-1/2"><ArrowRight className="h-6 w-6 text-gray-400" /></div>
                    <div className="md:hidden absolute -top-4 left-1/2 -translate-x-1/2 rotate-90"><ArrowDown className="h-6 w-6 text-gray-400" /></div>
                    <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 bg-indigo-100 rounded-full mx-auto mb-3"><Zap className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" /></div>
                    <h4 className="text-center text-sm sm:text-base font-semibold text-gray-800 mb-2">2. Dados são coletados</h4>
                    <p className="text-xs sm:text-sm text-gray-600 text-center">Os rastreadores coletam informações sobre visitantes.</p>
                  </div>
                  <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-4 rounded-xl border border-gray-200">
                    <div className="hidden md:block absolute -left-4 top-1/2 -translate-y-1/2"><ArrowRight className="h-6 w-6 text-gray-400" /></div>
                    <div className="md:hidden absolute -top-4 left-1/2 -translate-x-1/2 rotate-90"><ArrowDown className="h-6 w-6 text-gray-400" /></div>
                    <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 bg-blue-100 rounded-full mx-auto mb-3"><BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" /></div>
                    <h4 className="text-center text-sm sm:text-base font-semibold text-gray-800 mb-2">3. Visualize os insights</h4>
                    <p className="text-xs sm:text-sm text-gray-600 text-center">Acesse dados detalhados nas plataformas respectivas.</p>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="flex justify-center sm:justify-end pb-8">
                <button type="submit" disabled={isSubmitting || !isDirty} className="relative inline-flex items-center justify-center rounded-xl w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 text-white text-sm font-semibold shadow-lg transition-all duration-300 overflow-hidden disabled:bg-gray-300 disabled:cursor-not-allowed group bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 bg-size-200 hover:bg-pos-100">
                  <span className="relative flex items-center gap-2">
                    {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin text-white" /> Salvando...</> : <><Zap className="h-5 w-5 text-white" /> Ativar Rastreadores</>}
                  </span>
                </button>
              </motion.div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}