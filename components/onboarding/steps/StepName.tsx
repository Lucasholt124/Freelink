"use client";

import React from "react";
import { motion } from "framer-motion";
import { Gift, Camera, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { celebrate } from "@/app/constants/onboarding-utils";

interface StepNameProps {
  displayName: string;
  setDisplayName: (val: string) => void;
  bio: string;
  setBio: (val: string) => void;
  profileImage: { file: File | null; preview: string | null };
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNext: () => void;
}

export function StepName({
  displayName,
  setDisplayName,
  bio,
  setBio,
  profileImage,
  fileInputRef,
  onImageSelect,
  onNext,
}: StepNameProps) {

  const handleContinue = () => {
    if (!displayName.trim()) {
      toast.error("Digite seu nome para continuar");
      return;
    }
    celebrate("small");
    onNext();
  };

  return (
    <motion.div
      key="name"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-5"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-2xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-lg">
            <Gift className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-slate-900 font-bold">Bem-vindo! 👋</p>
            <p className="text-slate-500 text-sm">Vamos criar algo incrível juntos</p>
          </div>
        </div>
      </motion.div>

      <div className="space-y-2">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900"
        >
          Como você se{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
            chama?
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-slate-500"
        >
          Este nome aparecerá na sua página
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        {/* Upload de foto */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current?.click()}
            className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 border-2 border-dashed border-violet-300 flex items-center justify-center overflow-hidden group"
          >
            {profileImage.preview ? (
              <>
                <img
                  src={profileImage.preview}
                  className="w-full h-full object-cover"
                  alt="Preview"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <Camera className="w-6 h-6 text-violet-400" />
                <span className="text-[10px] text-violet-400 font-medium">Foto</span>
              </div>
            )}
          </motion.button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={onImageSelect}
          />
          <div className="flex-1">
            <p className="text-slate-900 font-semibold mb-1">Foto de Perfil</p>
            <p className="text-slate-400 text-sm">
              {profileImage.preview ? "✅ Foto adicionada! Clique para trocar" : "Adicionar foto (opcional)"}
            </p>
            <div className="flex items-center gap-1 mt-1 text-violet-600 text-xs font-medium">
              <TrendingUp className="w-3 h-3" />
              <span>+300% mais cliques com foto</span>
            </div>
          </div>
        </div>

        {/* Nome */}
        <div className="space-y-2">
          <Label className="text-slate-700 font-medium">Seu nome ou marca</Label>
          <Input
            className="h-14 rounded-xl border-slate-200 text-lg font-medium placeholder:text-slate-300 focus-visible:ring-violet-500"
            placeholder="Ex: João Silva"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleContinue();
              }
            }}
          />
          <p className="text-slate-400 text-xs flex items-center gap-1">
            <span className="text-violet-500">↵</span> Pressione Enter para continuar
          </p>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-slate-700 font-medium">Bio curta (opcional)</Label>
            <span className="text-slate-400 text-xs">{bio.length}/80</span>
          </div>
          <Input
            className="h-12 rounded-xl border-slate-200 placeholder:text-slate-300 focus-visible:ring-violet-500"
            placeholder="Ex: Criador de conteúdo | Empreendedor"
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 80))}
            maxLength={80}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleContinue();
              }
            }}
          />
        </div>
      </motion.div>


      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-100"
      >
        <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0 mt-0.5">
          <Camera className="w-4 h-4" />
        </div>
        <p className="text-amber-700 text-xs font-medium leading-relaxed">
          Perfis com foto recebem 3x mais cliques!
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Button
          onClick={handleContinue}
          className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 group"
        >
          Continuar
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </motion.div>
    </motion.div>
  );
}