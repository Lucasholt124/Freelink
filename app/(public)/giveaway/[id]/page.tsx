"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useConvex, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Gift,
  CheckCircle2,
  Loader2,
  X,
  Sparkles,
  Users,
  Star,
  Heart,
  Zap,
  Trophy,
  PartyPopper
} from "lucide-react";

type Participant = {
  id: string;
  name: string;
  identifier: string;
  timestamp: string;
  verified?: boolean;
};

type GiveawayData = {
  id: string;
  title: string;
  participants: Participant[];
  createdAt: string;
  isActive: boolean;
};

const toast = {
  success: (message: string) => {
    const toastEl = document.createElement('div');
    toastEl.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-4 rounded-2xl shadow-2xl z-[9999] flex items-center gap-3 animate-bounce font-medium';
    toastEl.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>${message}`;
    document.body.appendChild(toastEl);
    setTimeout(() => toastEl.remove(), 3000);
  },
  error: (message: string) => {
    const toastEl = document.createElement('div');
    toastEl.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-red-500 to-rose-500 text-white px-6 py-4 rounded-2xl shadow-2xl z-[9999] flex items-center gap-3 animate-bounce font-medium';
    toastEl.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>${message}`;
    document.body.appendChild(toastEl);
    setTimeout(() => toastEl.remove(), 3000);
  },
};

// Componente de confetes flutuantes
const FloatingElements = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute"
        initial={{
          x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400),
          y: -20,
          rotate: 0,
          opacity: 0.7
        }}
        animate={{
          y: typeof window !== 'undefined' ? window.innerHeight + 20 : 800,
          rotate: 360,
          opacity: 0
        }}
        transition={{
          duration: Math.random() * 10 + 10,
          repeat: Infinity,
          delay: Math.random() * 10,
          ease: "linear"
        }}
      >
        {i % 4 === 0 && <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />}
        {i % 4 === 1 && <Heart className="w-4 h-4 text-pink-400" fill="currentColor" />}
        {i % 4 === 2 && <Sparkles className="w-4 h-4 text-purple-400" />}
        {i % 4 === 3 && <Gift className="w-4 h-4 text-blue-400" />}
      </motion.div>
    ))}
  </div>
);

// Logo Freelinnk
const FreelinnkBadge = () => (
  <motion.a
    href="https://freelinnk.com"
    target="_blank"
    rel="noopener noreferrer"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5 }}
    className="fixed bottom-4 right-4 md:bottom-6 md:right-6 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300 z-50"
  >
    <div className="w-6 h-6 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 rounded-lg flex items-center justify-center shadow-md">
      <span className="text-white font-bold text-xs">F</span>
    </div>
    <span className="text-xs font-medium text-gray-600">
      Feito por <span className="font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">Freelinnk</span>
    </span>
  </motion.a>
);

// Contador de participantes animado
const ParticipantCounter = ({ count }: { count: number }) => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    className="flex items-center justify-center gap-2 bg-gradient-to-r from-violet-100 to-fuchsia-100 px-4 py-2 rounded-full"
  >
    <Users className="w-4 h-4 text-violet-600" />
    <span className="text-sm font-bold text-violet-700">
      {count.toLocaleString()} {count === 1 ? 'pessoa participando' : 'pessoas participando'}
    </span>
    <motion.div
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <Zap className="w-4 h-4 text-yellow-500" fill="currentColor" />
    </motion.div>
  </motion.div>
);

export default function PublicGiveawayPage() {
  const params = useParams();
  const giveawayId = params?.id as string;

  const convex = useConvex();
  const addParticipantMutation = useMutation(api.publicGiveaways.addParticipant);
  const [giveaway, setGiveaway] = useState<GiveawayData | null>(null);
  const [formData, setFormData] = useState({ name: "", identifier: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRegistered, setHasRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    if (!giveawayId) {
      setLoading(false);
      return;
    }

    const loadGiveaway = async () => {
      try {
        const data = await convex.query(api.publicGiveaways.getGiveaway, {
          giveawayId: giveawayId
        });

        if (data) {
          setGiveaway(data as GiveawayData);
        }

        const registered = localStorage.getItem(`registered_${giveawayId}`);
        if (registered) {
          setHasRegistered(true);
        }
      } catch (error) {
        console.error("Erro ao carregar sorteio:", error);
      } finally {
        setLoading(false);
      }
    };

    loadGiveaway();

    const interval = setInterval(loadGiveaway, 5000);
    return () => clearInterval(interval);
  }, [giveawayId, convex]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.identifier) {
      toast.error("Preencha todos os campos!");
      return;
    }

    if (!giveaway) {
      toast.error("Sorteio não encontrado!");
      return;
    }

    setIsSubmitting(true);

    try {
      await addParticipantMutation({
        giveawayId: giveawayId,
        participant: {
          id: formData.identifier,
          name: formData.name,
          identifier: formData.identifier,
          timestamp: new Date().toISOString(),
          verified: false,
        } as Participant,
      });
      localStorage.setItem(`registered_${giveawayId}`, 'true');
      toast.success("Você está participando! 🎉");
      setHasRegistered(true);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Ocorreu um erro desconhecido ao participar.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Gift className="w-16 h-16 text-white" />
          </motion.div>
          <p className="text-white font-medium text-lg">Carregando sorteio...</p>
        </motion.div>
      </div>
    );
  }

  if (!giveaway) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <FloatingElements />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl text-center max-w-md w-full mx-4 border border-white/20"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 bg-gradient-to-br from-red-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <X className="w-10 h-10 text-red-500" />
          </motion.div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Ops! Sorteio não encontrado
          </h1>
          <p className="text-gray-500 text-base md:text-lg">
            Este link pode ter expirado ou o sorteio foi encerrado.
          </p>
        </motion.div>
        <FreelinnkBadge />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-500/10 rounded-full blur-3xl" />
      </div>

      <FloatingElements />

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 20 }}
        className="relative z-10 w-full max-w-lg mx-auto"
      >
        <AnimatePresence mode="wait">
          {hasRegistered ? (
            <motion.div
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 md:p-10 shadow-2xl text-center border border-white/20"
            >
              {/* Confete de sucesso */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className="relative"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: 3 }}
                  className="w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/30"
                >
                  <CheckCircle2 className="w-12 h-12 md:w-14 md:h-14 text-white" />
                </motion.div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute -top-2 -right-2 md:right-[calc(50%-70px)]"
                >
                  <PartyPopper className="w-8 h-8 text-yellow-500" />
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-2xl md:text-4xl font-black text-gray-900 mb-2">
                  Você está dentro! 🎉
                </h1>
                <p className="text-lg md:text-xl font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent mb-4">
                  {giveaway.title}
                </p>
              </motion.div>

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-6 mb-6"
              >
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  <span className="text-lg font-bold text-emerald-800">Boa sorte!</span>
                  <Trophy className="w-6 h-6 text-yellow-500" />
                </div>
                <p className="text-emerald-700 text-sm md:text-base">
                  Aguarde o resultado! Você será notificado se for sorteado.
                </p>
              </motion.div>

              <ParticipantCounter count={giveaway.participants.length} />
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 md:p-10 shadow-2xl border border-white/20"
            >
              {/* Header com ícone animado */}
              <div className="text-center mb-8">
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="relative inline-block"
                >
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-purple-500/30 transform rotate-3">
                    <Gift className="w-10 h-10 md:w-12 md:h-12 text-white" />
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.8, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-1 -right-1"
                  >
                    <Sparkles className="w-6 h-6 text-yellow-400" fill="currentColor" />
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <h1 className="text-2xl md:text-4xl font-black text-gray-900 mt-6 mb-2">
                    🎁 Sorteio Grátis!
                  </h1>
                  <p className="text-lg md:text-2xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                    {giveaway.title}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="mt-4"
                >
                  <ParticipantCounter count={giveaway.participants.length} />
                </motion.div>
              </div>

              {/* Formulário */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                    👤 Seu nome completo
                  </label>
                  <div className={`relative rounded-2xl transition-all duration-300 ${focusedField === 'name' ? 'ring-4 ring-violet-500/20' : ''}`}>
                    <input
                      type="text"
                      placeholder="Digite seu nome aqui..."
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-violet-500 focus:bg-white focus:outline-none transition-all text-gray-900 placeholder-gray-400 text-base md:text-lg font-medium"
                      required
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                    📱 Instagram, Email ou WhatsApp
                  </label>
                  <div className={`relative rounded-2xl transition-all duration-300 ${focusedField === 'identifier' ? 'ring-4 ring-violet-500/20' : ''}`}>
                    <input
                      type="text"
                      placeholder="@seuinstagram ou email..."
                      value={formData.identifier}
                      onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                      onFocus={() => setFocusedField('identifier')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-violet-500 focus:bg-white focus:outline-none transition-all text-gray-900 placeholder-gray-400 text-base md:text-lg font-medium"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2 ml-1">
                    Para entrarmos em contato caso você ganhe! 🏆
                  </p>
                </motion.div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(139, 92, 246, 0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white py-4 md:py-5 rounded-2xl font-bold text-lg md:text-xl shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="relative flex items-center gap-3">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Confirmando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-6 h-6" />
                        Quero Participar!
                        <motion.span
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          🎉
                        </motion.span>
                      </>
                    )}
                  </span>
                </motion.button>
              </form>

              {/* Garantias */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500"
              >
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>100% Grátis</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Sem spam</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Resultado transparente</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <FreelinnkBadge />
    </div>
  );
}