"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Share2, X, Sparkles, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";

interface WelcomeModalProps {
  username: string;
}

export default function WelcomeModal({ username }: WelcomeModalProps) {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isWelcome = urlParams.get('welcome');

    if (isWelcome === 'true') {
      setShowWelcomeModal(true);
      window.history.replaceState({}, '', '/dashboard');
    }
  }, []);

  const profileUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${username}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast.success("Link copiado! 📋", {
        description: "Cole na bio do Instagram ou compartilhe!"
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Erro ao copiar");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `@${username} | Freelinnk`,
          text: `Confira meu perfil no Freelinnk!`,
          url: profileUrl,
        });
      } catch {
        // User cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  const handleViewProfile = () => {
    window.open(profileUrl, '_blank');
  };

  return (
    <Dialog open={showWelcomeModal} onOpenChange={setShowWelcomeModal}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md p-0 bg-transparent border-0 shadow-none">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-2xl sm:rounded-3xl overflow-hidden"
        >
          {/* Efeito de brilho animado */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          />

          {/* Padrão decorativo */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-4 w-20 h-20 border-2 border-white rounded-full" />
            <div className="absolute bottom-8 right-8 w-32 h-32 border-2 border-white rounded-full" />
            <div className="absolute top-1/2 right-4 w-12 h-12 border-2 border-white rounded-full" />
          </div>

          {/* Botão fechar */}
          <button
            onClick={() => setShowWelcomeModal(false)}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </button>

          {/* Conteúdo */}
          <div className="relative p-5 sm:p-8 text-center">

            {/* Emoji animado */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.2, duration: 0.8 }}
              className="mb-4 sm:mb-6"
            >
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                className="inline-block text-5xl sm:text-7xl"
              >
                🎉
              </motion.div>
            </motion.div>

            {/* Título */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl font-black mb-2 sm:mb-3 text-white leading-tight"
            >
              Parabéns!
              <br className="sm:hidden" />
              Você está no ar!
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-white/90 mb-4 sm:mb-6 text-sm sm:text-lg px-2"
            >
              Seu link já está funcionando e pronto para receber visitantes!
            </motion.p>

            {/* Link Preview */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 border border-white/20"
            >
              <p className="text-white/60 text-xs sm:text-sm mb-1">Seu link:</p>
              <p className="text-white font-bold text-sm sm:text-base break-all">
                {profileUrl}
              </p>
            </motion.div>

            {/* Próximos passos */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 border border-white/20"
            >
              <div className="flex items-center gap-2 mb-2 sm:mb-3 justify-center">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <p className="text-sm sm:text-base font-semibold text-white">Próximos passos</p>
              </div>
              <ul className="text-left space-y-2 sm:space-y-3">
                {[
                  "Copie seu link abaixo",
                  "Cole na bio do Instagram",
                  "Compartilhe com seus seguidores"
                ].map((text, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                    className="flex items-center gap-2 sm:gap-3"
                  >
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-300" />
                    </div>
                    <span className="text-white/90 text-xs sm:text-sm">{text}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Botões de ação */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="space-y-2 sm:space-y-3"
            >
              {/* Botão principal - Copiar */}
              <Button
                onClick={handleCopyLink}
                className="w-full bg-white text-purple-600 hover:bg-gray-100 font-bold h-11 sm:h-12 text-sm sm:text-base rounded-xl sm:rounded-2xl shadow-lg transition-all duration-200 active:scale-[0.98]"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-500" />
                    Link Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Copiar Meu Link
                  </>
                )}
              </Button>

              {/* Botões secundários */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 font-semibold h-10 sm:h-11 text-xs sm:text-sm rounded-xl transition-all duration-200 active:scale-[0.98]"
                >
                  <Share2 className="w-4 h-4 mr-1.5 sm:mr-2" />
                  Compartilhar
                </Button>

                <Button
                  onClick={handleViewProfile}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 font-semibold h-10 sm:h-11 text-xs sm:text-sm rounded-xl transition-all duration-200 active:scale-[0.98]"
                >
                  <ExternalLink className="w-4 h-4 mr-1.5 sm:mr-2" />
                  Ver Página
                </Button>
              </div>

              {/* Link para fechar */}
              <button
                onClick={() => setShowWelcomeModal(false)}
                className="w-full py-2 sm:py-3 text-white/70 hover:text-white text-xs sm:text-sm font-medium transition-colors"
              >
                Continuar para o Dashboard
              </button>
            </motion.div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}