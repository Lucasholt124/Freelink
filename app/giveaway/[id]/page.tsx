// app/giveaway/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ConvexProvider, ConvexReactClient, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Gift,
  CheckCircle2,
  Users,
  AlertCircle,
  PartyPopper,
  Instagram,
  Mail,
  Phone,
  Sparkles,
  Heart,
} from "lucide-react";

// Confetti animation
function launchConfetti() {
  const colors = ["#ff0000", "#ffff00", "#00ff00", "#0000ff", "#ff00ff", "#ffa500", "#00ffff"];

  for (let i = 0; i < 60; i++) {
    setTimeout(() => {
      const confettiEl = document.createElement("div");
      const size = Math.random() * 12 + 6;
      const x = Math.random() * 100;
      confettiEl.style.cssText = `
        position: fixed;
        width: ${size}px;
        height: ${size}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        left: ${x}%;
        top: -20px;
        border-radius: ${Math.random() > 0.5 ? "50%" : "3px"};
        z-index: 9999;
        pointer-events: none;
        box-shadow: 0 0 6px rgba(0,0,0,0.1);
      `;
      document.body.appendChild(confettiEl);

      const animation = confettiEl.animate(
        [
          { transform: "translateY(0) rotate(0deg) scale(1)", opacity: "1" },
          {
            transform: `translateY(${window.innerHeight + 100}px) rotate(${Math.random() * 720 - 360}deg) scale(0.5)`,
            opacity: "0",
          },
        ],
        {
          duration: Math.random() * 2500 + 2000,
          easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }
      );

      animation.onfinish = () => {
        if (confettiEl.parentNode) {
          confettiEl.remove();
        }
      };
    }, i * 25);
  }
}

// Inner component that uses Convex hooks
function GiveawayContent() {
  const params = useParams();
  const giveawayId = params.id as string;

  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [identifierType, setIdentifierType] = useState<"instagram" | "email" | "phone">("instagram");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasParticipated, setHasParticipated] = useState(false);
  const [error, setError] = useState("");
  const [participantCount, setParticipantCount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  // Query do sorteio (pública - sem auth)
  const giveaway = useQuery(api.publicGiveaways.getGiveaway, { giveawayId });
  const addParticipantMutation = useMutation(api.publicGiveaways.addParticipant);

  // Verificar se já participou (localStorage)
  useEffect(() => {
    const participated = localStorage.getItem(`giveaway_participated_${giveawayId}`);
    if (participated) {
      setHasParticipated(true);
    }
  }, [giveawayId]);

  // Atualizar contagem de participantes em tempo real
  useEffect(() => {
    if (giveaway) {
      setParticipantCount(giveaway.participants?.length || 0);
    }
  }, [giveaway]);

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedName = name.trim();
    const trimmedIdentifier = identifier.trim();

    if (!trimmedName) {
      setError("Por favor, digite seu nome!");
      return;
    }

    if (trimmedName.length < 2) {
      setError("Nome muito curto!");
      return;
    }

    if (!trimmedIdentifier) {
      setError("Por favor, digite seu contato!");
      return;
    }

    // Validações específicas
    if (identifierType === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedIdentifier)) {
        setError("Por favor, digite um email válido!");
        return;
      }
    }

    if (identifierType === "phone") {
      const phoneNumbers = trimmedIdentifier.replace(/\D/g, "");
      if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
        setError("Por favor, digite um telefone válido com DDD!");
        return;
      }
    }

    if (identifierType === "instagram") {
      const cleanUsername = trimmedIdentifier.replace("@", "");
      if (cleanUsername.length < 1) {
        setError("Por favor, digite seu @ do Instagram!");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const formattedIdentifier = identifierType === "instagram"
        ? `@${trimmedIdentifier.replace("@", "")}`
        : trimmedIdentifier;

      const result = await addParticipantMutation({
        giveawayId,
        participant: {
          id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          name: trimmedName,
          identifier: formattedIdentifier,
          timestamp: new Date().toISOString(),
          verified: false,
        },
      });

      // Salvar no localStorage para evitar participação dupla
      localStorage.setItem(`giveaway_participated_${giveawayId}`, JSON.stringify({
        name: trimmedName,
        identifier: formattedIdentifier,
        timestamp: new Date().toISOString()
      }));

      setParticipantCount(result.totalParticipants);
      setShowSuccess(true);

      // Lançar confetti!
      launchConfetti();

      // Aguardar animação e mostrar tela de sucesso
      setTimeout(() => {
        setHasParticipated(true);
      }, 2000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao participar. Tente novamente!";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // LOADING
  if (giveaway === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-sm w-full"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          </motion.div>
          <p className="text-gray-600 font-medium">Carregando sorteio...</p>
          <p className="text-gray-400 text-sm mt-2">Aguarde um momento</p>
        </motion.div>
      </div>
    );
  }

  // NÃO ENCONTRADO
  if (giveaway === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-md w-full"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">
            Sorteio não encontrado
          </h1>
          <p className="text-gray-600 mb-6">
            Este link pode estar incorreto ou o sorteio foi removido.
          </p>
          <div className="bg-gray-100 rounded-xl p-4 text-left">
            <p className="text-sm text-gray-500 mb-2">💡 Dicas:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Verifique se o link está correto</li>
              <li>• Peça um novo link ao organizador</li>
              <li>• O sorteio pode ter sido encerrado</li>
            </ul>
          </div>
        </motion.div>
      </div>
    );
  }

  // ENCERRADO
  if (!giveaway.isActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-md w-full"
        >
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Gift className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">
            Sorteio Encerrado
          </h1>
          <p className="text-gray-600 mb-6">
            O sorteio <span className="font-semibold">&quot;{giveaway.title}&quot;</span> já foi finalizado.
          </p>
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6">
            <p className="text-sm text-purple-600 font-medium mb-1">Total de participantes</p>
            <p className="text-4xl font-bold text-purple-700">{participantCount}</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // ANIMAÇÃO DE SUCESSO
  if (showSuccess && !hasParticipated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 10 }}
          className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-md w-full"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="w-14 h-14 text-green-500" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold text-gray-800 mb-2"
          >
            Parabéns! 🎉
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-gray-600 text-lg"
          >
            Você está participando!
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // JÁ PARTICIPOU
  if (hasParticipated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl text-center max-w-md w-full"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </motion.div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
            Você já está participando! 🎉
          </h1>

          <p className="text-gray-600 mb-6 text-base sm:text-lg">
            Boa sorte no sorteio<br/>
            <span className="font-semibold text-purple-600">&quot;{giveaway.title}&quot;</span>
          </p>

          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <Users className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-purple-600 font-medium">Participantes ao vivo</span>
            </div>
            <motion.p
              key={participantCount}
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-5xl font-bold text-purple-700"
            >
              {participantCount}
            </motion.p>
          </div>

          <div className="flex items-center justify-center gap-2 text-gray-500">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <span className="text-sm">Aguarde o resultado do sorteio!</span>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
              Feito com <Heart className="w-3 h-3 text-red-400" /> por Freelinnk
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // FORMULÁRIO PRINCIPAL
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl max-w-md w-full"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            animate={{
              rotate: [0, -10, 10, -10, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              repeatDelay: 2
            }}
            className="inline-block"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Gift className="w-10 h-10 text-purple-600" />
            </div>
          </motion.div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 leading-tight">
            {giveaway.title}
          </h1>

          <p className="text-gray-500 text-sm sm:text-base">
            Preencha seus dados para participar! 🎁
          </p>
        </div>

        {/* Contador ao vivo */}
        <motion.div
          className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 mb-6 border border-purple-100"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping" />
            </div>
            <div className="text-center">
              <p className="text-xs sm:text-sm text-purple-600 font-medium">Participantes ao vivo</p>
              <motion.p
                key={participantCount}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-3xl sm:text-4xl font-bold text-purple-700"
              >
                {participantCount}
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Seu nome completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome"
              maxLength={100}
              className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none text-base"
              disabled={isSubmitting}
              autoComplete="name"
            />
          </div>

          {/* Tipo de contato */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Como quer ser contactado? <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: "instagram" as const, icon: Instagram, label: "Instagram" },
                { type: "email" as const, icon: Mail, label: "Email" },
                { type: "phone" as const, icon: Phone, label: "Telefone" },
              ].map(({ type, icon: Icon, label }) => (
                <motion.button
                  key={type}
                  type="button"
                  onClick={() => {
                    setIdentifierType(type);
                    setIdentifier("");
                    setError("");
                  }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 ${
                    identifierType === type
                      ? "border-purple-500 bg-purple-50 text-purple-700 shadow-md"
                      : "border-gray-200 text-gray-500 hover:border-purple-300 hover:bg-purple-50/50"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${identifierType === type ? "text-purple-600" : ""}`} />
                  <span className="text-xs font-medium">{label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Contato */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {identifierType === "instagram" && "Seu @ do Instagram"}
              {identifierType === "email" && "Seu melhor email"}
              {identifierType === "phone" && "Seu telefone com DDD"}
              <span className="text-red-500"> *</span>
            </label>
            <div className="relative">
              {identifierType === "instagram" && (
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                  @
                </span>
              )}
              <input
                type={identifierType === "email" ? "email" : identifierType === "phone" ? "tel" : "text"}
                value={identifier}
                onChange={(e) => {
                  let value = e.target.value;
                  if (identifierType === "phone") {
                    value = formatPhone(value);
                  }
                  setIdentifier(value);
                  setError("");
                }}
                placeholder={
                  identifierType === "instagram" ? "seu_usuario" :
                  identifierType === "email" ? "seu@email.com" : "(11) 99999-9999"
                }
                maxLength={identifierType === "phone" ? 15 : 100}
                className={`w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none text-base ${
                  identifierType === "instagram" ? "pl-9" : ""
                }`}
                disabled={isSubmitting}
                autoComplete={identifierType === "email" ? "email" : identifierType === "phone" ? "tel" : "off"}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              {identifierType === "instagram" && "Será usado para te contactar se você ganhar"}
              {identifierType === "email" && "Enviaremos um email caso você seja o vencedor"}
              {identifierType === "phone" && "Ligaremos ou enviaremos mensagem se você ganhar"}
            </p>
          </div>

          {/* Erro */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Botão */}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:from-purple-700 hover:to-pink-700 hover:shadow-2xl transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Participando...</span>
              </>
            ) : (
              <>
                <PartyPopper className="w-5 h-5" />
                <span>Participar do Sorteio!</span>
              </>
            )}
          </motion.button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            Ao participar, você concorda com as regras do sorteio.
          </p>
          <p className="text-xs text-gray-300 mt-2 flex items-center justify-center gap-1">
            Feito com <Heart className="w-3 h-3 text-red-400" /> por Freelinnk
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// Main component with Convex Provider
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function GiveawayParticipationPage() {
  return (
    <ConvexProvider client={convex}>
      <GiveawayContent />
    </ConvexProvider>
  );
}