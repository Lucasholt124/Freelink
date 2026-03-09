"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Gift,
  CheckCircle2,
  Loader2,
  X,
  Sparkles,
  Star,
  Heart,
  PartyPopper,
  AlertCircle,
  Instagram,
  MessageSquare,
  ArrowRight
} from "lucide-react";
import clsx from "clsx";

// --- Elementos Flutuantes ---
const FloatingElements = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
    {[...Array(12)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute"
        initial={{
          x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 300),
          y: -20,
          rotate: 0,
          opacity: 0.5
        }}
        animate={{
          y: typeof window !== 'undefined' ? window.innerHeight + 20 : 800,
          rotate: 360,
          opacity: 0
        }}
        transition={{
          duration: Math.random() * 5 + 10,
          repeat: Infinity,
          delay: Math.random() * 5,
          ease: "linear"
        }}
      >
        {i % 4 === 0 && <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />}
        {i % 4 === 1 && <Heart className="w-3 h-3 text-pink-400" fill="currentColor" />}
        {i % 4 === 2 && <Sparkles className="w-3 h-3 text-purple-400" />}
        {i % 4 === 3 && <Gift className="w-3 h-3 text-blue-400" />}
      </motion.div>
    ))}
  </div>
);

// --- Badge do Freelinnk ---
const FreelinnkBadge = () => (
  <a
    href="https://freelinnk.com"
    target="_blank"
    rel="noopener noreferrer"
    className="fixed bottom-4 left-0 right-0 mx-auto w-fit flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-purple-100 z-40 active:scale-95 transition-transform"
  >
    <div className="w-5 h-5 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-md flex items-center justify-center">
      <span className="text-white font-bold text-[10px]">F</span>
    </div>
    <span className="text-xs font-medium text-gray-600">
      Sorteio via <span className="font-bold text-purple-600">Freelinnk</span>
    </span>
  </a>
);

// --- Toast ---
const showToast = (message: string, type: 'success' | 'error') => {
  const toastEl = document.createElement('div');
  const bgColor = type === 'success' ? 'bg-emerald-500' : 'bg-red-500';
  toastEl.className = `fixed top-4 left-4 right-4 md:left-1/2 md:right-auto md:transform md:-translate-x-1/2 ${bgColor} text-white px-4 py-3 rounded-xl shadow-2xl z-[9999] flex items-center justify-center gap-2 animate-bounce font-medium text-sm text-center`;
  toastEl.innerHTML = `<span>${message}</span>`;
  document.body.appendChild(toastEl);
  setTimeout(() => {
    if (document.body.contains(toastEl)) document.body.removeChild(toastEl);
  }, 3500);
};

export default function PublicGiveawayPage() {
  const params = useParams();

  const rawId = params?.id;
  const giveawayId = Array.isArray(rawId) ? rawId[0] : rawId || "";

  const giveaway = useQuery(api.publicGiveaways.getGiveaway,
    giveawayId ? { giveawayId } : "skip"
  );

  const addParticipantMutation = useMutation(api.publicGiveaways.addParticipant);

  // --- Novos Estados para o Form Multi-step ---
  const [step, setStep] = useState<1 | 2>(1);
  const [contactType, setContactType] = useState<"instagram" | "whatsapp" | null>(null);
  const [formData, setFormData] = useState({ name: "", identifier: "" });
  const [identifierError, setIdentifierError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRegistered, setHasRegistered] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    if (giveawayId) {
      const registered = localStorage.getItem(`registered_${giveawayId}`);
      if (registered) setHasRegistered(true);
    }
  }, [giveawayId]);

  // Função para aplicar máscara de WhatsApp e validar o @
  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIdentifierError("");
    let value = e.target.value;

    if (contactType === "whatsapp") {
      // Deixa apenas números
      value = value.replace(/\D/g, "");
      // Máscara: (99) 99999-9999
      if (value.length <= 11) {
        value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
        value = value.replace(/(\d)(\d{4})$/, "$1-$2");
      } else {
        value = value.slice(0, 15); // Limita tamanho
      }
    } else if (contactType === "instagram") {
      // Se não começar com @ e tiver texto, adiciona o @
      if (value.length > 0 && !value.startsWith('@')) {
        value = '@' + value;
      }
      value = value.replace(/[^@a-zA-Z0-9._]/g, ""); // Remove espaços e caracteres inválidos
    }

    setFormData({ ...formData, identifier: value });
  };

  const handleNextStep = () => {
    if (!formData.name.trim()) {
      showToast("Digite seu nome para continuar!", 'error');
      return;
    }
    if (!contactType) {
      showToast("Escolha como quer ser contatado!", 'error');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação final estrita
    if (contactType === "instagram" && formData.identifier.length < 3) {
      setIdentifierError("Digite um usuário válido");
      return;
    }
    if (contactType === "whatsapp" && formData.identifier.replace(/\D/g, "").length < 10) {
      setIdentifierError("Digite um DDD + Número válido");
      return;
    }

    if (!giveaway) return;
    if (!giveaway.isActive) {
      showToast("Este sorteio já foi encerrado!", 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const tempId = `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      // Salva o identificador junto com o tipo para o criador saber (ex: "Instagram: @lucas")
      const finalIdentifier = `${contactType === 'instagram' ? 'Instagram:' : 'WhatsApp:'} ${formData.identifier}`;

      await addParticipantMutation({
        giveawayId: giveawayId,
        participant: {
          id: tempId,
          name: formData.name,
          identifier: finalIdentifier,
          timestamp: new Date().toISOString(),
          verified: false,
        },
      });

      localStorage.setItem(`registered_${giveawayId}`, 'true');
      setHasRegistered(true);
      showToast("Você está participando! 🍀", 'success');

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(100);
      }
    } catch (error) {
      let msg = "Erro ao participar. Tente novamente.";
      let alreadyRegistered = false;

      if (error instanceof Error && error.message.includes("já está participando")) {
        msg = "Você já está na lista deste sorteio!";
        alreadyRegistered = true;
      }

      showToast(msg, 'error');

      if (alreadyRegistered) {
        localStorage.setItem(`registered_${giveawayId}`, 'true');
        setHasRegistered(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Telas de Estado ---
  if (giveaway === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-white animate-spin" />
      </div>
    );
  }

  if (giveaway === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-3xl shadow-xl text-center max-w-sm w-full">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-6 h-6 text-red-500" />
          </div>
          <h1 className="text-lg font-bold text-gray-900 mb-2">Sorteio não encontrado</h1>
          <p className="text-gray-500 text-sm mb-6">O link pode estar expirado ou incorreto.</p>
          <a href="https://freelinnk.com" className="text-purple-600 font-bold text-sm hover:underline">
            Ir para Freelinnk
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 py-6 px-4 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-purple-400/20 rounded-full blur-[80px]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-blue-400/20 rounded-full blur-[80px]" />
      </div>

      <FloatingElements />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <AnimatePresence mode="wait">
          {!giveaway.isActive ? (
             <motion.div
             key="closed"
             initial={{ scale: 0.95, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl text-center border-2 border-white/20"
           >
             <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
             <h2 className="text-xl font-bold text-gray-800 mb-1">Sorteio Encerrado</h2>
             <p className="text-gray-600 text-sm mb-4">O organizador finalizou este evento.</p>
             <div className="bg-gray-100 rounded-xl p-3">
               <p className="text-xs font-bold text-gray-500 uppercase">Participantes</p>
               <p className="text-2xl font-bold text-purple-600">{giveaway.participants.length}</p>
             </div>
           </motion.div>
          )
          : hasRegistered ? (
            <motion.div
              key="success"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white/95 backdrop-blur-xl rounded-[2rem] p-8 shadow-2xl text-center border border-white/40"
            >
              <div className="relative mb-6 inline-block">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-20 h-20 bg-gradient-to-tr from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30"
                >
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="absolute -top-2 -right-2"
                >
                  <PartyPopper className="w-8 h-8 text-yellow-500 drop-shadow-md" />
                </motion.div>
              </div>

              <h2 className="text-2xl font-black text-gray-800 mb-1">Você está dentro!</h2>
              <p className="text-sm text-gray-500 mb-6 font-medium">Fique atento, boa sorte!</p>

              <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100 mb-6">
                <p className="text-[10px] uppercase tracking-wide text-gray-400 font-bold mb-1">Sorteio</p>
                <p className="text-base font-bold text-purple-700 leading-tight">{giveaway.title}</p>
              </div>

              <div className="flex items-center justify-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full mx-auto w-fit">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
                <p className="text-xs font-bold text-gray-600">
                  {giveaway.participants.length} na torcida
                </p>
              </div>
            </motion.div>
          )
          : (
            <motion.div
              key="form"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white/95 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 shadow-2xl border border-white/40"
            >
              <div className="text-center mb-6">
                <div className="inline-block mb-4">
                  <div className="w-14 h-14 bg-gradient-to-tr from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 rotate-3 mx-auto">
                    <Gift className="w-7 h-7 text-white" />
                  </div>
                </div>

                <h1 className="text-xl font-bold text-gray-400 uppercase tracking-wider mb-1 text-[10px] sm:text-xs">
                  Sorteio Oficial
                </h1>
                <p className="text-xl sm:text-2xl font-black text-gray-800 leading-tight break-words">
                  {giveaway.title}
                </p>
              </div>

              {/* WIZARD: PASSO 1 */}
              {step === 1 && (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Como podemos te chamar?</label>
                    <div className={`transition-all duration-200 rounded-xl bg-gray-50 border-2 ${focusedField === 'name' ? 'border-purple-500 bg-white shadow-sm' : 'border-gray-100'}`}>
                      <input
                        type="text"
                        placeholder="Seu Nome e Sobrenome"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full px-4 py-3.5 bg-transparent outline-none text-gray-800 placeholder-gray-400 font-medium text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Como você prefere ser contatado se ganhar?</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setContactType("instagram")}
                        className={clsx(
                          "flex flex-col items-center justify-center gap-2 py-4 rounded-xl border-2 transition-all",
                          contactType === "instagram" ? "border-pink-500 bg-pink-50 text-pink-700 shadow-sm" : "border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100"
                        )}
                      >
                        <Instagram className="w-6 h-6" />
                        <span className="font-bold text-xs">Instagram</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setContactType("whatsapp")}
                        className={clsx(
                          "flex flex-col items-center justify-center gap-2 py-4 rounded-xl border-2 transition-all",
                          contactType === "whatsapp" ? "border-green-500 bg-green-50 text-green-700 shadow-sm" : "border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100"
                        )}
                      >
                        <MessageSquare className="w-6 h-6" />
                        <span className="font-bold text-xs">WhatsApp</span>
                      </button>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNextStep}
                    className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-4 rounded-xl font-bold text-base shadow-lg mt-4 flex items-center justify-center gap-2"
                  >
                    <span>Continuar</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              )}

              {/* WIZARD: PASSO 2 */}
              {step === 2 && (
                <motion.form
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
                      {contactType === 'instagram' ? "Qual o seu @ do Instagram?" : "Qual o seu número de WhatsApp?"}
                    </label>
                    <div className={`transition-all duration-200 rounded-xl bg-gray-50 border-2 ${identifierError ? 'border-red-400 bg-red-50' : focusedField === 'identifier' ? 'border-purple-500 bg-white shadow-sm' : 'border-gray-100'}`}>
                      <input
                        type={contactType === 'whatsapp' ? "tel" : "text"}
                        placeholder={contactType === 'instagram' ? "@seu_usuario" : "(11) 99999-9999"}
                        value={formData.identifier}
                        onChange={handleIdentifierChange}
                        onFocus={() => setFocusedField('identifier')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full px-4 py-3.5 bg-transparent outline-none text-gray-800 placeholder-gray-400 font-medium text-sm sm:text-base"
                      />
                    </div>
                    {identifierError && <p className="text-red-500 text-xs font-medium mt-1.5 ml-1">{identifierError}</p>}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-4 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-colors"
                    >
                      Voltar
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isSubmitting || !formData.identifier.trim()}
                      className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-4 rounded-xl font-bold text-base shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <span>Confirmar Participação</span>
                          <CheckCircle2 className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>
                  </div>

                  <p className="text-[10px] text-gray-400 text-center mt-2 flex items-center justify-center gap-1">
                    <AlertCircle className="w-3 h-3"/> Prometemos não enviar spam.
                  </p>
                </motion.form>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <FreelinnkBadge />
    </div>
  );
}