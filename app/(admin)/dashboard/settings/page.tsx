"use client";

import UsernameForm from "@/components/UsernameForm";
import CustomizationForm from "@/components/CustomizationForm";
import {
  Sparkles,
  Check,
  Zap,
  MessageCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  Layout,
  Palette,
  Plus,
  Lock,
  Users,
  Globe,
  Trash2,
  Crown,
  ArrowRight,
  ChevronRight,
  LogIn,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

// === ANIMAÇÕES ===
const fadeInUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.1 }
  }
};

// === TIPOS ===
interface SubAccount {
  _id: string;
  subUserId: string;
  username: string;
  createdAt: number;
}

// === HELPERS DE PLANO ===
function getPlanLimits(plan: string): number {
  if (plan === "ultra") return 30;
  if (plan === "pro") return 10;
  return 0;
}

function getPlanLabel(plan: string): string {
  if (plan === "ultra") return "Ultra";
  if (plan === "pro") return "Pro";
  return "Free";
}

// === COMPONENTE: CARD DE SUB-CONTA ===
function SubAccountCard({
  sub,
  onDelete,
  onEnter,
}: {
  sub: SubAccount;
  onDelete: (id: string) => void;
  onEnter: (subUserId: string, username: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    onDelete(sub._id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="group flex items-center justify-between gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
    >
      {/* Avatar + Info */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shrink-0 text-sm font-bold text-indigo-600 uppercase select-none">
          {sub.username.slice(0, 2)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            <span className="text-gray-400 font-normal">freelinnk/</span>
            {sub.username}
          </p>
          <p className="text-[11px] text-gray-400">
            Criada em {new Date(sub.createdAt).toLocaleDateString("pt-BR")}
          </p>
        </div>
      </div>

      {/* Ações */}
      <div className="flex items-center gap-2 shrink-0">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onEnter(sub.subUserId, sub.username)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
        >
          <LogIn className="w-3.5 h-3.5" />
          Entrar
        </motion.button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

// === COMPONENTE: MODAL CRIAR SUB-CONTA ===
function CreateSubAccountModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (username: string) => Promise<void>;
}) {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValid = /^[a-z0-9_-]{3,30}$/.test(username);

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    setError("");
    try {
      await onCreate(username);
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Nova Página de Links</h3>
            <p className="text-xs text-gray-500">Crie uma conta separada e independente</p>
          </div>
        </div>

        {/* Input */}
        <div className="space-y-3 mb-6">
          <label className="text-sm font-semibold text-gray-700">
            Username da nova página
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-mono pointer-events-none">
              freelinnk.com/
            </span>
            <input
              autoFocus
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))
              }
              placeholder="nome-da-pagina"
              className="w-full pl-[130px] pr-4 h-12 border border-gray-200 rounded-xl text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
            />
            {username.length >= 3 && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isValid ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400" />
                )}
              </div>
            )}
          </div>
          <p className="text-[11px] text-gray-400">
            3-30 caracteres. Letras, números, hífen e underscore.
          </p>
          {error && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {error}
            </p>
          )}
        </div>

        {/* Info box */}
        <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-800 mb-6">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
          <p>
            Será criada uma conta <strong>free independente</strong>. Ela terá seu próprio painel, links e configurações. Para entrar nela use o botão <strong>Entrar</strong>.
          </p>
        </div>

        {/* Botões */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={!isValid || loading}
            className="flex-1 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Criar Página
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// === COMPONENTE: SEÇÃO DE SUB-CONTAS ===
function SubAccountsSection({ userPlan }: { userPlan: string }) {
  const { user } = useUser();
  const [showModal, setShowModal] = useState(false);

  const limit = getPlanLimits(userPlan);
  const isPro = userPlan === "pro" || userPlan === "ultra";

  // Queries e mutations do Convex
  const subAccounts = useQuery(
    api.lib.subAccounts.getSubAccounts,
    user ? { ownerUserId: user.id } : "skip"
  ) as SubAccount[] | undefined;

  const createSubAccount = useMutation(api.lib.subAccounts.createSubAccount);
  const deleteSubAccount = useMutation(api.lib.subAccounts.deleteSubAccount);

  const count = subAccounts?.length ?? 0;
  const canCreate = isPro && count < limit;

  const handleCreate = async (username: string) => {
    if (!user) return;
    try {
      await createSubAccount({ ownerUserId: user.id, username });
      toast.success(`Página "${username}" criada com sucesso! 🎉`);
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : "Erro ao criar");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSubAccount({ subAccountId: id as never });
      toast.success("Página removida.");
    } catch {
      toast.error("Erro ao remover página.");
    }
  };

  const handleEnter = (subUserId: string, username: string) => {
    // Redireciona para o painel da sub-conta passando o subUserId como parâmetro
    // O painel detecta o parâmetro e carrega os dados daquele userId
    window.open(`/dashboard?subAccount=${subUserId}&username=${username}`, "_blank");
  };

  return (
    <>
      <AnimatePresence>
        {showModal && (
          <CreateSubAccountModal
            onClose={() => setShowModal(false)}
            onCreate={handleCreate}
          />
        )}
      </AnimatePresence>

      <motion.section
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 mb-16 lg:mb-24 scroll-mt-24"
        variants={fadeInUp}
      >
        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="lg:sticky lg:top-24 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="flex items-center justify-center w-7 h-7 rounded bg-gray-100 text-gray-700 font-bold text-xs border border-gray-200">
                  ✦
                </span>
                <h2 className="text-lg font-bold text-gray-900">Múltiplas Páginas</h2>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Crie páginas separadas para clientes, projetos ou marcas diferentes — tudo em uma conta só.
              </p>
            </div>

            {/* Card de plano */}
            <div className={`rounded-xl p-5 border shadow-sm ${
              userPlan === "ultra"
                ? "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200"
                : userPlan === "pro"
                ? "bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200"
                : "bg-gray-900 border-gray-800"
            }`}>
              {isPro ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <Crown className={`w-4 h-4 ${userPlan === "ultra" ? "text-amber-500" : "text-indigo-600"}`} />
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${userPlan === "ultra" ? "text-amber-700" : "text-indigo-700"}`}>
                      Plano {getPlanLabel(userPlan)}
                    </span>
                  </div>
                  <div className="flex items-end gap-1 mb-2">
                    <span className={`text-3xl font-bold ${userPlan === "ultra" ? "text-amber-700" : "text-indigo-700"}`}>
                      {count}
                    </span>
                    <span className={`text-sm mb-1 ${userPlan === "ultra" ? "text-amber-500" : "text-indigo-400"}`}>
                      / {limit} páginas
                    </span>
                  </div>
                  {/* Barra de progresso */}
                  <div className="w-full h-1.5 bg-white/60 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${userPlan === "ultra" ? "bg-amber-500" : "bg-indigo-500"}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((count / limit) * 100, 100)}%` }}
                      transition={{ duration: 0.8, ease: "circOut" }}
                    />
                  </div>
                  <p className={`text-[11px] mt-2 ${userPlan === "ultra" ? "text-amber-600" : "text-indigo-500"}`}>
                    {limit - count} slots disponíveis
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <Lock className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      Plano Free
                    </span>
                  </div>
                  <p className="text-[13px] text-gray-300 mb-4 leading-relaxed">
                    Assine o Pro ou Ultra para criar múltiplas páginas de links.
                  </p>
                  <div className="space-y-2 text-[12px] text-gray-400">
                    <div className="flex items-center gap-2">
                      <ChevronRight className="w-3 h-3 text-indigo-400" />
                      <span><strong className="text-white">Pro</strong> — até 10 páginas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ChevronRight className="w-3 h-3 text-amber-400" />
                      <span><strong className="text-white">Ultra</strong> — até 30 páginas</span>
                    </div>
                  </div>
                  <a
                    href="/pricing"
                    className="mt-4 flex items-center justify-center gap-2 w-full py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all"
                  >
                    Ver Planos <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </>
              )}
            </div>
          </div>
        </aside>

        {/* Conteúdo principal */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Header do card */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                  Suas Páginas
                </h3>
                {count > 0 && (
                  <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {count}
                  </span>
                )}
              </div>

              {/* Botão criar */}
              <motion.button
                whileHover={canCreate ? { scale: 1.02 } : {}}
                whileTap={canCreate ? { scale: 0.97 } : {}}
                onClick={() => canCreate && setShowModal(true)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                  canCreate
                    ? "bg-gray-900 hover:bg-black text-white shadow-sm hover:shadow-md"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {!isPro ? (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    Bloqueado
                  </>
                ) : !canCreate ? (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    Limite atingido
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    Nova Página
                  </>
                )}
              </motion.button>
            </div>

            {/* Lista de sub-contas */}
            <div className="p-6 space-y-3 min-h-[200px]">
              <AnimatePresence>
                {!subAccounts ? (
                  // Loading
                  <div className="flex items-center justify-center py-12">
                    <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
                  </div>
                ) : subAccounts.length === 0 ? (
                  // Empty state
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <div className="w-14 h-14 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center mb-4">
                      <Globe className="w-6 h-6 text-gray-300" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      Nenhuma página criada
                    </p>
                    <p className="text-xs text-gray-400 max-w-[220px] leading-relaxed">
                      {isPro
                        ? "Clique em \"Nova Página\" para criar sua primeira página adicional."
                        : "Assine o Pro ou Ultra para começar a criar páginas para seus clientes."}
                    </p>
                    {isPro && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setShowModal(true)}
                        className="mt-4 flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-gray-900 text-white rounded-xl hover:bg-black transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Criar primeira página
                      </motion.button>
                    )}
                  </motion.div>
                ) : (
                  // Lista
                  subAccounts.map((sub) => (
                    <SubAccountCard
                      key={sub._id}
                      sub={sub}
                      onDelete={handleDelete}
                      onEnter={handleEnter}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Footer info */}
            {isPro && count > 0 && (
              <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/50">
                <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Clique em Entrar para acessar e editar o painel de cada página separadamente.
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.section>
    </>
  );
}

// === PÁGINA PRINCIPAL ===
export default function SettingsPage() {
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(0);

  // Plano do usuário via Clerk publicMetadata
  const userPlan = (user?.publicMetadata?.subscriptionPlan as string) || "free";

  const userSlug = useQuery(
    api.lib.usernames.getUserSlug,
    user ? { userId: user.id } : "skip"
  );

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("freelink_progress");
    if (saved) setCompletedSteps(parseInt(saved));

    if (typeof window !== "undefined" && window.location.search) {
      const cleanUrl =
        window.location.protocol +
        "//" +
        window.location.host +
        window.location.pathname;
      window.history.replaceState({ path: cleanUrl }, "", cleanUrl);
    }
  }, []);

  const updateProgress = (step: number) => {
    const newProgress = Math.max(completedSteps, step);
    setCompletedSteps(newProgress);
    localStorage.setItem("freelink_progress", newProgress.toString());
  };

  const getCleanLink = () => {
    if (!userSlug) return "";
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/${userSlug}`;
  };

  const handleCopyLink = () => {
    const link = getCleanLink();
    if (!link) return;
    navigator.clipboard.writeText(link);
    toast.success("Link copiado!", {
      description: "Pronto para colar na bio! 🚀",
      icon: "🔗",
    });
  };

  const handleVisitLink = () => {
    const link = getCleanLink();
    if (!link) return;
    window.open(link, "_blank");
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] selection:bg-purple-100 selection:text-purple-900 font-sans text-gray-900 overflow-x-hidden">
      <motion.div
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        {/* === HEADER PRINCIPAL === */}
        <motion.header className="mb-10 lg:mb-14" variants={fadeInUp}>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-3">
                Configurações
              </h1>
              <p className="text-gray-500 text-sm sm:text-[15px] leading-relaxed">
                Transforme sua página em uma experiência única. Personalize cada detalhe para refletir sua identidade.
              </p>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50/80 border border-green-200 rounded-full shrink-0 w-fit">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[11px] font-semibold text-green-700 uppercase tracking-wide">
                Alterações salvas automaticamente.
              </span>
            </div>
          </div>

          <div className="mt-8 sm:mt-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Nível do Perfil{" "}
                <span className="text-gray-400 font-normal hidden sm:inline">—</span>{" "}
                <span className="text-gray-500 font-normal text-xs sm:text-sm bg-gray-100 px-2 py-0.5 rounded-full">
                  Passo {Math.min(completedSteps + 1, 2)} de 2
                </span>
              </span>
            </div>

            <div className="relative w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gray-900"
                initial={{ width: 0 }}
                animate={{ width: `${(completedSteps / 2) * 100}%` }}
                transition={{ duration: 0.8, ease: "circOut" }}
              />
            </div>

            <p className="text-xs text-gray-500 mt-2 font-medium">
              {completedSteps === 0 && "🏁 Configure sua URL personalizada"}
              {completedSteps === 1 && "🎨 Defina seu estilo visual"}
              {completedSteps >= 2 && "🚀 Perfil configurado com sucesso!"}
            </p>
          </div>
        </motion.header>

        <div className="w-full h-px bg-gray-200 mb-10 lg:mb-16" />

        {/* === SEÇÃO 0: MÚLTIPLAS PÁGINAS (SUB-CONTAS) === */}
        <SubAccountsSection userPlan={userPlan} />

        <div className="w-full h-px bg-gray-200 mb-10 lg:mb-16" />

        {/* === SEÇÃO 1: URL E IDENTIDADE === */}
        <motion.section
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 mb-16 lg:mb-24 scroll-mt-24"
          id="identity"
          variants={fadeInUp}
        >
          <aside className="lg:col-span-4 space-y-6">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded bg-gray-100 text-gray-700 font-bold text-xs border border-gray-200">
                    1
                  </span>
                  <h2 className="text-lg font-bold text-gray-900">Sua Identidade</h2>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Escolha um nome curto e único. É assim que seus seguidores vão te encontrar.
                </p>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Layout className="w-3 h-3" /> Por que isso importa?
                </p>
                <ul className="space-y-3">
                  {["URL curta e profissional", "Melhor posicionamento", "Fácil de memorizar"].map(
                    (item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-[13px] text-gray-600 font-medium">
                        <Check className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                        {item}
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-1">
                      Seu Link Profissional
                    </h3>
                    {userSlug ? (
                      <p className="text-sm text-purple-600 font-medium truncate flex items-center gap-0.5">
                        <span className="text-gray-400 select-none">freelinnk/</span>
                        <span className="font-bold">{userSlug}</span>
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400 italic">Configure seu nome abaixo...</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors active:scale-95"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copiar
                    </button>
                    <button
                      onClick={handleVisitLink}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors active:scale-95"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Visitar
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <UsernameForm onComplete={() => updateProgress(1)} />
                </div>

                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100/60 text-xs text-amber-800 leading-relaxed">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <p>
                    <span className="font-bold">Dica:</span> Mantenha seu nome curto para facilitar a memorização.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* === SEÇÃO 2: ESTILO VISUAL === */}
        <motion.section
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 scroll-mt-24"
          id="style"
          variants={fadeInUp}
        >
          <aside className="lg:col-span-4 space-y-6">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded bg-gray-100 text-gray-700 font-bold text-xs border border-gray-200">
                    2
                  </span>
                  <h2 className="text-lg font-bold text-gray-900">Estilo Visual</h2>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Sua página é o seu cartão de visitas. Crie algo marcante para capturar a atenção.
                </p>
              </div>

              <div className="bg-gray-900 rounded-xl p-5 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-300">
                    Dica Pro
                  </span>
                </div>
                <p className="text-[13px] text-gray-300 mb-5 leading-relaxed">
                  Páginas com fundo personalizado e identidade visual forte registram:
                </p>
                <div className="grid grid-cols-2 gap-4 border-t border-gray-800 pt-4">
                  <div>
                    <span className="block text-xl font-bold text-white tracking-tight">+40%</span>
                    <span className="text-[10px] uppercase text-gray-500 font-bold">de retenção</span>
                  </div>
                  <div>
                    <span className="block text-xl font-bold text-white tracking-tight">2.5x</span>
                    <span className="text-[10px] uppercase text-gray-500 font-bold">mais cliques</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5 sm:p-8">
                <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                  <Palette className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                    Editor Visual
                  </h3>
                </div>
                <div className="space-y-6">
                  <p className="text-sm text-gray-600">Personalize toda a aparência do seu link.</p>
                  <CustomizationForm onComplete={() => updateProgress(2)} />
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* === FOOTER === */}
        <motion.footer
          className="mt-20 border-t border-gray-200 pt-8 pb-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 shadow-sm hover:shadow-md transition-all cursor-default group">
            <MessageCircle className="w-3.5 h-3.5 text-purple-600 group-hover:scale-110 transition-transform" />
            <span>Dica: Compartilhe seu link nas redes sociais para maximizar seu alcance.</span>
          </div>
          <p className="mt-6 text-[11px] font-medium text-gray-400">
            Feito com 💜 <span className="text-gray-600">freelinnk.com</span>
          </p>
        </motion.footer>
      </motion.div>
    </div>
  );
}