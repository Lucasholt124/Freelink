"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {

  Check,
  Link as LinkIcon,
  User,
  Palette,
  Layout,

  Upload,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// --- TIPOS DE PASSOS ---
type Step = "username" | "links" | "identity" | "style";

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [step, setStep] = useState<Step>("username");
  const [loading, setLoading] = useState(false);

  // --- DADOS DO PREVIEW (O QUE APARECE NO CELULAR) ---
  const [preview, setPreview] = useState({
    username: "",
    title: "", // Título do primeiro link
    url: "",   // URL do primeiro link
    bio: "",
    imagePreview: null as string | null,
    imageFile: null as File | null,
    themeColor: "bg-slate-900", // Cor dos botões e detalhes
    bgColor: "bg-slate-50",     // Cor de fundo da página
    themeName: "Clean"
  });

  // --- CONVEX ---
  const checkAvailability = useQuery(
    api.lib.usernames.checkUsernameAvailability,
    preview.username.length >= 3 ? { username: preview.username } : "skip"
  );

  const setUsernameMutation = useMutation(api.lib.usernames.setUsername);
  const updateCustomizations = useMutation(api.lib.customizations.updateCustomizations);
  const generateUploadUrl = useMutation(api.lib.customizations.generateUploadUrl);
  const createLink = useMutation(api.lib.links.createLink);

  // --- VALIDAÇÕES VISUAIS ---
  const isUsernameValid = preview.username.length >= 3 && checkAvailability?.available;
  const isLinkValid = preview.title.length >= 2 && preview.url.length >= 5;
  const isBioValid = preview.bio.length >= 20;

  // --- AÇÕES DO WIZARD (PASSO A PASSO) ---

  // 1. DEFINIR NOME
  const handleStep1 = async () => {
    if (!isUsernameValid) return;
    setLoading(true);
    try {
      await setUsernameMutation({ username: preview.username });
      setStep("links");
    } catch {
      toast.error("Erro ao salvar nome.");
    } finally {
      setLoading(false);
    }
  };

  // 2. ADICIONAR PRIMEIRO LINK
  const handleStep2 = async () => {
    if (!isLinkValid) return;
    // Não salvamos no banco ainda, salvamos tudo no final ou mantemos no state?
    // Vamos salvar agora para garantir persistência gradual como você gosta.
    setLoading(true);
    try {
      await createLink({
        title: preview.title,
        url: preview.url.startsWith("http") ? preview.url : `https://${preview.url}`,
        isFeatured: false,
        badgeType: "new"
      });
      setStep("identity");
    } catch  {
      toast.error("Erro ao criar link.");
    } finally {
      setLoading(false);
    }
  };

  // 3. IDENTIDADE (FOTO + BIO)
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(prev => ({
        ...prev,
        imageFile: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleStep3 = async () => {
    if (!isBioValid) return;
    setLoading(true);
    try {
      let storageId = undefined;
      // Upload da imagem
      if (preview.imageFile) {
        const uploadUrl = await generateUploadUrl({});
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": preview.imageFile.type },
          body: preview.imageFile,
        });
        const json = await res.json();
        storageId = json.storageId;
      }

      await updateCustomizations({
        description: preview.bio,
        profilePictureStorageId: storageId,
        // Padrões
        accentColor: "#0f172a",
        backgroundType: "color",
      });
      setStep("style");
    } catch  {
      toast.error(e.message || "Erro ao salvar perfil.");
    } finally {
      setLoading(false);
    }
  };

  // 4. ESTILO E FINALIZAÇÃO
  const themes = [
    { name: "Minimal", bg: "bg-slate-50", btn: "bg-slate-900" },
    { name: "Dark Mode", bg: "bg-slate-950", btn: "bg-white text-black" },
    { name: "Roxo", bg: "bg-purple-50", btn: "bg-purple-600" },
    { name: "Rosa", bg: "bg-pink-50", btn: "bg-pink-500" },
  ];

  const handleFinish = async () => {
    setLoading(true);
    try {
      // Atualiza apenas as cores finais
      await updateCustomizations({
        backgroundColor1: preview.bgColor === "bg-slate-950" ? "#020617" : "#f8fafc",
        // Aqui você mapearia as classes tailwind para hexadecimais reais no seu app
      });

      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      toast.success("Tudo pronto! 🚀");

      setTimeout(() => {
        router.push("/dashboard?welcome=true");
      }, 1500);
    } catch  {
      toast.error("Erro ao finalizar.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row overflow-hidden font-sans text-slate-900">

      {/* ==================================================
          PAINEL ESQUERDO: O GUIA (WIZARD)
      ================================================== */}
      <div className="w-full md:w-[45%] bg-white p-8 md:p-12 flex flex-col justify-center shadow-xl z-10 relative">
        <div className="max-w-md mx-auto w-full">

          {/* Barra de Progresso */}
          <div className="flex items-center gap-2 mb-8">
            <div className={cn("h-2 rounded-full flex-1 transition-all", step === 'username' ? "bg-slate-900" : "bg-green-500")}></div>
            <div className={cn("h-2 rounded-full flex-1 transition-all", step === 'links' ? "bg-slate-900" : (step === 'username' ? "bg-slate-200" : "bg-green-500"))}></div>
            <div className={cn("h-2 rounded-full flex-1 transition-all", step === 'identity' ? "bg-slate-900" : (step === 'style' ? "bg-green-500" : "bg-slate-200"))}></div>
            <div className={cn("h-2 rounded-full flex-1 transition-all", step === 'style' ? "bg-slate-900" : "bg-slate-200")}></div>
          </div>

          <AnimatePresence mode="wait">

            {/* --- PASSO 1: USERNAME --- */}
            {step === "username" && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="inline-flex p-3 bg-slate-100 rounded-xl mb-2">
                  <Layout className="w-6 h-6 text-slate-700" />
                </div>
                <h1 className="text-3xl font-black tracking-tight">Vamos criar seu endereço</h1>
                <p className="text-slate-500">Comece escolhendo como as pessoas vão te encontrar.</p>

                <div className="space-y-4 pt-4">
                  <Label>Seu Link Único</Label>
                  <div className="relative">
                     <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium select-none">freelinnk.com/</span>
                     <Input
                        className="pl-[135px] h-12 text-lg font-bold border-slate-300 focus:border-slate-900"
                        placeholder="seu-nome"
                        value={preview.username}
                        onChange={(e) => setPreview({...preview, username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '')})}
                        autoFocus
                     />
                     <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {preview.username.length >= 3 && (
                          checkAvailability?.available
                            ? <Check className="text-green-500 w-5 h-5" />
                            : <Loader2 className={cn("w-5 h-5 text-slate-400", !checkAvailability && "animate-spin")} />
                        )}
                     </div>
                  </div>
                  {preview.username.length >= 3 && checkAvailability && !checkAvailability.available && (
                    <p className="text-red-500 text-sm font-medium">Este nome já está em uso.</p>
                  )}
                </div>

                <Button
                  onClick={handleStep1}
                  disabled={!isUsernameValid || loading}
                  className="w-full h-12 text-lg font-bold mt-4"
                >
                  {loading ? <Loader2 className="animate-spin" /> : "Reservar e Continuar"}
                </Button>
              </motion.div>
            )}

            {/* --- PASSO 2: PRIMEIRO LINK --- */}
            {step === "links" && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                 <div className="inline-flex p-3 bg-blue-50 rounded-xl mb-2">
                  <LinkIcon className="w-6 h-6 text-blue-600" />
                </div>
                <h1 className="text-3xl font-black tracking-tight">Adicione o 1º Link</h1>
                <p className="text-slate-500">Veja ele aparecer no celular ao lado em tempo real.</p>

                <div className="space-y-4 pt-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <div>
                    <Label className="mb-2 block">Título do Botão</Label>
                    <Input
                      placeholder="Ex: Meu WhatsApp"
                      className="bg-white"
                      value={preview.title}
                      onChange={(e) => setPreview({...preview, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block">URL (Link)</Label>
                    <Input
                      placeholder="wa.me/..."
                      className="bg-white"
                      value={preview.url}
                      onChange={(e) => setPreview({...preview, url: e.target.value})}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleStep2}
                  disabled={!isLinkValid || loading}
                  className="w-full h-12 text-lg font-bold"
                >
                  {loading ? "Adicionando..." : "Adicionar e Continuar"}
                </Button>
              </motion.div>
            )}

            {/* --- PASSO 3: IDENTIDADE --- */}
            {step === "identity" && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="inline-flex p-3 bg-purple-50 rounded-xl mb-2">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
                <h1 className="text-3xl font-black tracking-tight">Quem é você?</h1>
                <p className="text-slate-500">Dê uma cara para sua página.</p>

                <div className="flex items-center gap-4 pt-2">
                  <div
                    className="w-20 h-20 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-purple-500 overflow-hidden relative"
                    onClick={() => document.getElementById("photo-upload")?.click()}
                  >
                    {preview.imagePreview ? (
                      <img src={preview.imagePreview} className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="w-6 h-6 text-slate-400" />
                    )}
                    <input id="photo-upload" type="file" className="hidden" accept="image/*" onChange={handleImageSelect} />
                  </div>
                  <div className="text-sm text-slate-500">
                    <p className="font-bold text-slate-900">Foto de Perfil</p>
                    <p>Clique para enviar</p>
                  </div>
                </div>

                <div>
                   <Label className="mb-2 block">Sua Bio (Min. 20 caracteres)</Label>
                   <textarea
                      className="w-full p-3 rounded-lg border border-slate-300 focus:border-slate-900 outline-none text-sm min-h-[100px]"
                      placeholder="Ex: Ajudo você a vender mais..."
                      value={preview.bio}
                      onChange={(e) => setPreview({...preview, bio: e.target.value})}
                   />
                   <p className={cn("text-xs mt-1 text-right", preview.bio.length < 20 ? "text-red-500" : "text-green-600")}>
                      {preview.bio.length} / 160
                   </p>
                </div>

                <Button
                  onClick={handleStep3}
                  disabled={!isBioValid || loading}
                  className="w-full h-12 text-lg font-bold"
                >
                  {loading ? "Salvando..." : "Continuar"}
                </Button>
              </motion.div>
            )}

            {/* --- PASSO 4: ESTILO --- */}
            {step === "style" && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="inline-flex p-3 bg-pink-50 rounded-xl mb-2">
                  <Palette className="w-6 h-6 text-pink-600" />
                </div>
                <h1 className="text-3xl font-black tracking-tight">Escolha o Tema</h1>
                <p className="text-slate-500">Qual estilo combina mais com você?</p>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  {themes.map((t) => (
                    <button
                      key={t.name}
                      onClick={() => setPreview({...preview, themeColor: t.btn, bgColor: t.bg, themeName: t.name})}
                      className={cn(
                        "p-4 rounded-xl border text-left transition-all hover:scale-105",
                        preview.themeName === t.name ? "border-slate-900 ring-1 ring-slate-900 bg-slate-50" : "border-slate-200"
                      )}
                    >
                      <div className={cn("w-full h-8 rounded-md mb-2", t.btn)}></div>
                      <span className="font-bold text-sm">{t.name}</span>
                    </button>
                  ))}
                </div>

                <Button
                  onClick={handleFinish}
                  disabled={loading}
                  className="w-full h-12 text-lg font-bold mt-4 bg-gradient-to-r from-purple-600 to-pink-600 border-0"
                >
                  {loading ? "Finalizando..." : "Lançar Página! 🚀"}
                </Button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* ==================================================
          PAINEL DIREITO: O PREVIEW DO CELULAR
      ================================================== */}
      <div className="hidden md:flex flex-1 bg-slate-100 items-center justify-center relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-50"></div>

        {/* O CELULAR */}
        <motion.div
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.2 }}
           className="relative w-[340px] h-[680px] bg-black rounded-[3rem] shadow-2xl border-[8px] border-slate-900 overflow-hidden z-10"
        >
          {/* Dynamic Background */}
          <div className={cn("absolute inset-0 transition-colors duration-500", preview.bgColor)}></div>

          {/* Status Bar Fake */}
          <div className="absolute top-0 w-full h-8 bg-black/10 z-20"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-black rounded-b-xl z-20"></div>

          {/* CONTEÚDO DA TELA */}
          <div className="relative h-full overflow-y-auto no-scrollbar pt-14 px-6 flex flex-col items-center">

             {/* Foto de Perfil */}
             <motion.div
               layout
               className="w-24 h-24 rounded-full bg-slate-200 border-4 border-white shadow-sm overflow-hidden mb-4"
             >
               {preview.imagePreview ? (
                 <img src={preview.imagePreview} className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-slate-400">
                   <User size={32} />
                 </div>
               )}
             </motion.div>

             {/* Nome e Bio */}
             <motion.div layout className="text-center w-full mb-8">
               <h2 className={cn("font-bold text-xl mb-1 transition-colors", preview.bgColor === 'bg-slate-950' ? 'text-white' : 'text-slate-900')}>
                  {user?.firstName || preview.username || "Seu Nome"}
               </h2>
               <p className={cn("text-sm transition-colors px-2", preview.bgColor === 'bg-slate-950' ? 'text-slate-400' : 'text-slate-500')}>
                  {preview.bio || "Sua biografia aparecerá aqui..."}
               </p>
             </motion.div>

             {/* Links */}
             <div className="w-full space-y-3">
               {/* Link Exemplo (Fantasma) ou Link Real */}
               {preview.title ? (
                 <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={cn("w-full py-4 px-6 rounded-xl shadow-sm flex items-center justify-between transition-colors", preview.themeColor)}
                 >
                    <span className={cn("font-medium", preview.themeName === 'Dark Mode' ? 'text-slate-900' : 'text-white')}>{preview.title}</span>
                 </motion.div>
               ) : (
                 // Placeholder Fantasma
                 <div className="w-full py-4 px-6 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 opacity-50">
                    Seu link aparecerá aqui
                 </div>
               )}

               {/* Links Fantasmas para dar volume visual */}
               <div className="w-full h-14 rounded-xl bg-black/5 animate-pulse"></div>
               <div className="w-full h-14 rounded-xl bg-black/5 animate-pulse delay-75"></div>
             </div>

             {/* Branding */}
             <div className="mt-auto pb-8 pt-8">
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-30">Criado com Freelinnk</span>
             </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
}