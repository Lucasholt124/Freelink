"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Gift,
  CheckCircle2,
  Loader2,
  X
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

const STORAGE_KEY = 'freelinnk_giveaways';

const getGiveaway = (id: string): GiveawayData | null => {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(STORAGE_KEY);
  const giveaways = data ? JSON.parse(data) : [];
  return giveaways.find((g: GiveawayData) => g.id === id) || null;
};

const saveGiveaway = (giveaway: GiveawayData) => {
  if (typeof window === 'undefined') return;
  const data = localStorage.getItem(STORAGE_KEY);
  const giveaways = data ? JSON.parse(data) : [];
  const index = giveaways.findIndex((g: GiveawayData) => g.id === giveaway.id);

  if (index >= 0) {
    giveaways[index] = giveaway;
  } else {
    giveaways.push(giveaway);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(giveaways));
};

const toast = {
  success: (message: string) => {
    const toastEl = document.createElement('div');
    toastEl.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-2xl z-[9999] animate-bounce';
    toastEl.textContent = message;
    document.body.appendChild(toastEl);
    setTimeout(() => toastEl.remove(), 3000);
  },
  error: (message: string) => {
    const toastEl = document.createElement('div');
    toastEl.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-xl shadow-2xl z-[9999] animate-bounce';
    toastEl.textContent = message;
    document.body.appendChild(toastEl);
    setTimeout(() => toastEl.remove(), 3000);
  },
};

export default function PublicGiveawayPage() {
  const params = useParams();
  const giveawayId = params?.id as string;

  const [giveaway, setGiveaway] = useState<GiveawayData | null>(null);
  const [formData, setFormData] = useState({ name: "", identifier: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRegistered, setHasRegistered] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!giveawayId) {
      setLoading(false);
      return;
    }

    const loadGiveaway = () => {
      const data = getGiveaway(giveawayId);
      if (data) {
        setGiveaway(data);
      }

      const registered = localStorage.getItem(`registered_${giveawayId}`);
      if (registered) {
        setHasRegistered(true);
      }

      setLoading(false);
    };

    loadGiveaway();

    // Poll for updates
    const interval = setInterval(loadGiveaway, 5000);
    return () => clearInterval(interval);
  }, [giveawayId]);

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

    const participant: Participant = {
      id: Date.now().toString(),
      name: formData.name,
      identifier: formData.identifier,
      timestamp: new Date().toISOString(),
      verified: true
    };

    // Check if already participating
    const exists = giveaway.participants.some(p =>
      p.identifier.toLowerCase() === participant.identifier.toLowerCase()
    );

    if (exists) {
      toast.error("Você já está participando!");
      setIsSubmitting(false);
      return;
    }

    // Add participant
    const updatedGiveaway = {
      ...giveaway,
      participants: [...giveaway.participants, participant]
    };

    saveGiveaway(updatedGiveaway);
    localStorage.setItem(`registered_${giveawayId}`, 'true');

    setTimeout(() => {
      toast.success("Você está participando! 🎉");
      setHasRegistered(true);
      setIsSubmitting(false);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (!giveaway) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-md w-full">
          <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Sorteio não encontrado
          </h1>
          <p className="text-gray-600">
            Este link de sorteio não existe ou expirou.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full"
      >
        {hasRegistered ? (
          <div className="text-center">
            <CheckCircle2 className="w-20 h-20 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-green-900 mb-2">
              Você está participando!
            </h1>
            <p className="text-xl font-semibold text-green-700 mb-2">
              {giveaway.title}
            </p>
            <p className="text-green-600 mb-6">
              Boa sorte! 🍀
            </p>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm text-green-800">
                Total de participantes: {giveaway.participants.length}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <Gift className="w-20 h-20 text-purple-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-2">
                Participe do Sorteio!
              </h1>
              <p className="text-xl font-semibold text-purple-600">
                {giveaway.title}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  placeholder="Ex: Maria Silva"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Instagram, Email ou Telefone
                </label>
                <input
                  type="text"
                  placeholder="Ex: @seu_instagram"
                  value={formData.identifier}
                  onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Confirmar Participação
                  </>
                )}
              </button>
            </form>

            <p className="text-xs text-gray-500 text-center mt-4">
              {giveaway.participants.length} pessoas já estão participando
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}