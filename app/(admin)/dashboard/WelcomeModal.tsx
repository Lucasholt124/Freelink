"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";

interface WelcomeModalProps {
  username: string;
}

export default function WelcomeModal({ username }: WelcomeModalProps) {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isWelcome = urlParams.get('welcome');

    if (isWelcome === 'true') {
      setShowWelcomeModal(true);
      // Limpa a URL
      window.history.replaceState({}, '', '/dashboard');
    }
  }, []);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/${username}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado! 📋");
  };

  return (
    <Dialog open={showWelcomeModal} onOpenChange={setShowWelcomeModal}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-purple-600 to-pink-600 text-white border-0">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center p-6"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: 3 }}
            className="text-6xl mb-4"
          >
            🎉
          </motion.div>

          <h2 className="text-3xl font-black mb-3">
            Parabéns! Você está no ar!
          </h2>

          <p className="text-white/90 mb-6 text-lg">
            Seu link já está funcionando e pronto para receber visitantes!
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6">
            <p className="text-sm text-white/80 mb-2">Próximos passos:</p>
            <ul className="text-left space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-300" />
                Copie seu link abaixo
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-300" />
                Cole na bio do Instagram
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-300" />
                Compartilhe com seus seguidores
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleCopyLink}
              className="w-full bg-white text-purple-600 hover:bg-gray-100 font-bold h-12"
            >
              Copiar Meu Link
            </Button>

            <button
              onClick={() => setShowWelcomeModal(false)}
              className="w-full text-white/80 hover:text-white text-sm"
            >
              Fechar
            </button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
