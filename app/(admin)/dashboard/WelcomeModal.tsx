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
    // Verifica se estamos no cliente para evitar erros de SSR
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const isWelcome = urlParams.get('welcome');

      if (isWelcome === 'true') {
        setShowWelcomeModal(true);
        // Limpa a URL sem recarregar a página
        window.history.replaceState({}, '', '/dashboard');
      }
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
      <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto p-0 bg-transparent border-0 shadow-none outline-none sm:rounded-3xl">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative w-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl"
        >
          {/* Efeito de brilho animado */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          />

          {/* Padrão decorativo (Background Pattern) */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-4 left-4 w-16 h-16 sm:w-20 sm:h-20 border-2 border-white rounded-full" />
            <div className="absolute bottom-8 right-8 w-24 h-24 sm:w-32 sm:h-32 border-2 border-white rounded-full" />
            <div className="absolute top-1/2 right-4 w-10 h-10 sm:w-12 sm:h-12 border-2 border-white rounded-full" />
          </div>

          {/* Botão fechar */}
          <button
            onClick={() => setShowWelcomeModal(false)}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-20 backdrop-blur-sm"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </button>

          {/* Conteúdo Principal */}
          <div className="relative p-5 sm:p-8 text-center flex flex-col items-center">

            {/* Emoji animado */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.2, duration: 0.8 }}
              className="mb-3 sm:mb-5 mt-2"
            >
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                className="inline-block text-5xl sm:text-7xl drop-shadow-lg"
              >
                🎉
              </motion.div>
            </motion.div>

            {/* Título */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-3 sm:mb-6"
            >
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight drop-shadow-md">
                Parabéns!
                <br className="sm:hidden" />
                <span className="sm:ml-2">Você está no ar!</span>
              </h2>
              <p className="text-white/90 mt-2 text-sm sm:text-lg font-medium px-2">
                Seu link já está funcionando e pronto para receber visitantes!
              </p>
            </motion.div>

            {/* Container Link Preview */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="w-full bg-black/20 backdrop-blur-md rounded-xl p-3 sm:p-4 mb-4 border border-white/10 shadow-inner"
            >
              <p className="text-white/70 text-xs sm:text-sm mb-1 uppercase tracking-wider font-semibold">Seu link oficial</p>
              <div className="flex items-center justify-center bg-white/10 rounded-lg p-2">
                <p className="text-white font-bold text-sm sm:text-base break-all select-all">
                  {profileUrl.replace(/^https?:\/\//, '')}
                </p>
              </div>
            </motion.div>

            {/* Próximos passos */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="w-full bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 mb-5 border border-white/20"
            >
              <div className="flex items-center gap-2 mb-3 justify-center">
                <Sparkles className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                <p className="text-sm sm:text-base font-bold text-white">Próximos passos</p>
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
                    className="flex items-center gap-3 bg-white/5 rounded-lg p-2"
                  >
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 border border-green-500/30">
                      <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-300" />
                    </div>
                    <span className="text-white/95 text-xs sm:text-sm font-medium">{text}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Botões de ação */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="w-full space-y-2 sm:space-y-3"
            >
              {/* Botão principal - Copiar */}
              <Button
                onClick={handleCopyLink}
                className="w-full bg-white text-purple-600 hover:bg-gray-50 hover:text-purple-700 font-bold h-11 sm:h-12 text-sm sm:text-base rounded-xl shadow-lg transition-all duration-200 active:scale-[0.98] border-0"
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
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="bg-black/20 border-white/20 text-white hover:bg-white/20 hover:text-white font-semibold h-10 sm:h-11 text-xs sm:text-sm rounded-xl transition-all duration-200 active:scale-[0.98]"
                >
                  <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  Compartilhar
                </Button>

                <Button
                  onClick={handleViewProfile}
                  variant="outline"
                  className="bg-black/20 border-white/20 text-white hover:bg-white/20 hover:text-white font-semibold h-10 sm:h-11 text-xs sm:text-sm rounded-xl transition-all duration-200 active:scale-[0.98]"
                >
                  <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  Ver Página
                </Button>
              </div>

              {/* Link para fechar */}
              <button
                onClick={() => setShowWelcomeModal(false)}
                className="w-full py-2 sm:py-3 text-white/70 hover:text-white text-xs sm:text-sm font-medium transition-colors mt-1"
              >
                Pular e ir para o Dashboard
              </button>
            </motion.div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}