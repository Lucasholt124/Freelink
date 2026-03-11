"use client";

import { ReactNode, useState, useEffect, ForwardRefExoticComponent, RefAttributes } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Settings, Scissors, Target, LayoutGrid, Gift,
  CreditCard, LogOut, ChevronDown, HelpCircle, X,
  LucideProps, Menu, Search, PlusCircle, ArrowRight, Zap, Crown, Shield,
  Calculator, Palette, BarChart3, ChevronRight, Flame, Lock, Users,
  Megaphone
} from "lucide-react";
import clsx from "clsx";
import { UserButton, useClerk } from "@clerk/nextjs";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type LucideIcon = ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;

const Z_INDEX = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  overlay: 30,
  modal: 40,
  popover: 50,
  notification: 60,
  tooltip: 70,
  toast: 80,
  max: 999,
} as const;

const DASHBOARD_CONFIG = {
  MAX_SEARCH_RESULTS: 10,
} as const;

export interface NavSubItem {
  href: string;
  label: string;
  icon: LucideIcon;
  new?: boolean;
  pro?: boolean;
  ultra?: boolean;
  description?: string;
}

export interface NavItem {
  href?: string;
  label: string;
  icon?: LucideIcon;
  new?: boolean;
  subItems?: NavSubItem[];
}

interface SearchResult {
  label: string;
  href: string;
  icon?: LucideIcon;
  description?: string;
}

interface SearchResponse {
  label: string;
  href: string;
  tags: string[];
  description?: string;
}

const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

// 🔥 MENU LIMPO: Focado no que importa
export const navItems: NavItem[] = [
  { href: "/dashboard", icon: Home, label: "Visão Geral" },
  { href: "/dashboard/links", icon: LayoutGrid, label: "Meus Links" },
  {
    label: "Negócios",
    subItems: [
      { href: "/dashboard/profit-calculator", icon: Calculator, label: "Calculadora Financeira", ultra: true, description: "Análise completa" },
    ]
  },
  {
    label: "Marketing",
    subItems: [
      { href: "/dashboard/shortener", icon: Scissors, label: "Encurtador", description: "Links curtos" },
      { href: "/dashboard/giveaway", icon: Gift, label: "Sorteios", pro: true, description: "Engajamento" },
      { href: "/dashboard/ads", icon: Megaphone, label: "Hub de Anúncios", pro: true, new: true, description: "Impulsione produtos" }, // 🔥 NOVO AQUI
      { href: "/dashboard/tracking", icon: Target, label: "Rastreamento", ultra: true, description: "Pixel & Analytics" },
    ]
  },
  {
    label: "Conta",
    subItems: [
      { href: "/dashboard/settings", icon: Settings, label: "Configurações" },
      { href: "/dashboard/billing", icon: CreditCard, label: "Plano e Cobrança" },
      { href: "/dashboard/help", icon: HelpCircle, label: "Suporte" },
    ]
  },
];

const searchableItemsMap: { [key: string]: LucideIcon } = {
  "/dashboard": Home,
  "/dashboard/links": LayoutGrid,
  "/dashboard/profit-calculator": Calculator,
  "/dashboard/shortener": Scissors,
  "/dashboard/giveaway": Gift,
  "/dashboard/tracking": Target,
  "/dashboard/settings": Settings,
  "/dashboard/billing": CreditCard,
  "/dashboard/help": HelpCircle,
};

function FreelinkLogo({ size = 32 }: { size?: number }) {
  return (
    <motion.div
      className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 shadow-lg overflow-hidden group"
      style={{ width: size, height: size }}
      whileHover={{ scale: 1.05, rotate: 5 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent" animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} />
      <span className="text-white font-black" style={{ fontSize: size * 0.55, zIndex: Z_INDEX.dropdown }}>F</span>
      <motion.div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent" initial={{ y: "100%" }} animate={{ y: "-100%" }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />
    </motion.div>
  );
}

function SidebarContent({ userPlan, uniqueId }: { userPlan: string; uniqueId: string }) {
  const pathname = usePathname();
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const s = parseInt(localStorage.getItem('freelinnk_streak') || '0');
    setStreak(s);
  }, []);

  useEffect(() => {
    navItems.forEach(item => {
      if (item.subItems) {
        const activeSubItem = item.subItems.find(subItem => pathname.startsWith(subItem.href));
        if (activeSubItem) setActiveGroup(item.label);
      }
    });
  }, [pathname]);

  const isActive = (href: string) => (href === "/dashboard" ? pathname === href : pathname.startsWith(href));

  const isFree = userPlan === "free";
  const isPro = userPlan === "pro";

  // 🔥 BANNERS DE UPGRADE ATUALIZADOS (Foco em Agência/Múltiplas Contas)
  const upgradeCardConfig = isFree ? {
    title: "Destrave seu potencial",
    subtitle: "Crie para múltiplos clientes.",
    gradient: "from-slate-900 to-slate-800",
    lossMessage: "Assine e tenha múltiplas páginas na mesma conta.",
    features: [
      { text: "Rastreamento avançado", icon: Target },
      { text: "Remover branding", icon: Shield },
      { text: "Criar sub-contas", icon: Users },
    ],
    buttonText: "Ver Vantagens Pro",
    buttonGradient: "from-blue-600 to-indigo-600",
    progress: 25,
    socialProof: "847 criadores fizeram upgrade hoje"
  } : {
    title: "Torne-se uma Agência",
    subtitle: "Domine o mercado.",
    gradient: "from-indigo-900 to-violet-900",
    lossMessage: "Crie até 30 páginas completas para os seus clientes.",
    features: [
      { text: "Até 30 Sub-contas", icon: Users },
      { text: "Gestão Financeira", icon: Calculator },
      { text: "Analytics completo", icon: BarChart3 },
    ],
    buttonText: "Virar ULTRA agora",
    buttonGradient: "from-purple-600 to-pink-600",
    progress: 65,
    socialProof: "Os top 5% usam o plano Ultra"
  };

  return (
    <nav className="flex flex-col gap-2 pb-24 md:pb-4">

      {streak > 1 && (
        <div className="mx-3 mb-2 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border border-orange-100 dark:border-orange-900/30 rounded-xl p-3 flex items-center gap-3">
          <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <div>
            <p className="text-xs font-black text-orange-700 dark:text-orange-400">{streak} dias seguidos 🔥</p>
            <p className="text-[10px] text-orange-600/70 dark:text-orange-400/70 font-medium">Não quebre a sequência!</p>
          </div>
        </div>
      )}

      <ul className="space-y-0.5">
        <LayoutGroup id={uniqueId}>
          {navItems.map((item, idx) => (
            <li key={idx}>
              {item.href && item.icon ? (
                <Link href={item.href}>
                  <motion.div className={clsx("flex items-center gap-3 p-3 rounded-xl font-medium transition-all mx-2 relative overflow-hidden group", isActive(item.href) ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200")} whileHover={{ x: isActive(item.href) ? 0 : 4 }} whileTap={{ scale: 0.98 }}>
                    {isActive(item.href) && <motion.div layoutId={`${uniqueId}-activeTab`} className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 -z-10" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium truncate">{item.label}</span>
                  </motion.div>
                </Link>
              ) : (
                <div className="pt-4 pb-1">
                  <motion.button onClick={() => setActiveGroup(activeGroup === item.label ? null : item.label)} className="px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between w-full hover:text-slate-700 dark:hover:text-slate-300 transition-colors group" whileHover={{ x: 2 }}>
                    <span>{item.label}</span>
                    {item.subItems && <ChevronDown className={clsx("w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-transform", activeGroup === item.label && "rotate-180")} />}
                  </motion.button>
                  <AnimatePresence initial={false}>
                    {(!item.subItems || activeGroup === item.label) && (
                      <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="mt-1 space-y-0.5 overflow-hidden">
                        {item.subItems?.map((subItem) => {
                          const isItemActive = isActive(subItem.href);
                          const isItemLocked = (subItem.pro && isFree) || (subItem.ultra && (isFree || isPro));
                          return (
                            <motion.li key={subItem.href} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} onMouseEnter={() => setHoveredItem(subItem.href)} onMouseLeave={() => setHoveredItem(null)}>
                              <Link href={isItemLocked ? "/dashboard/billing" : subItem.href}>
                                <motion.div className={clsx("flex items-center gap-3 py-2.5 px-4 rounded-xl font-medium text-sm transition-all mx-2 group relative overflow-hidden", isItemActive ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 dark:from-blue-900/20 dark:to-purple-900/20 dark:text-blue-300 shadow-sm" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60")} whileHover={{ x: 4, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                  <div className={clsx("w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg transition-all", isItemActive ? "bg-gradient-to-br from-blue-500 to-purple-500 shadow-md" : hoveredItem === subItem.href ? "bg-slate-200 dark:bg-slate-700" : "bg-slate-100 dark:bg-slate-800")}>
                                    {isItemLocked ? (
                                      <Lock className={clsx("w-4 h-4", isItemActive ? "text-white" : "text-slate-400")} />
                                    ) : (
                                      <subItem.icon className={clsx("w-4 h-4", isItemActive ? "text-white" : "text-slate-500")} />
                                    )}
                                  </div>
                                  <div className="flex-1 ml-3 min-w-0">
                                    <span className={clsx("block truncate", isItemLocked && "opacity-60")}>{subItem.label}</span>
                                  </div>

                                  <div className="flex items-center gap-1.5 ml-auto flex-shrink-0">
                                    {subItem.new && <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-[10px] px-1.5 py-0 h-4 shadow-sm border-0 text-white">NEW</Badge>}
                                    {subItem.pro && <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-[10px] px-1.5 py-0 h-4 shadow-sm border-0 text-white">PRO</Badge>}
                                    {subItem.ultra && <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-[10px] px-1.5 py-0 h-4 shadow-sm border-0 text-white">ULTRA</Badge>}
                                  </div>

                                </motion.div>
                              </Link>
                            </motion.li>
                          );
                        })}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </li>
          ))}
        </LayoutGroup>
      </ul>

      {userPlan !== "ultra" && (
        <div className="px-3 mt-4">
          <motion.div whileHover={{ y: -2 }} className={`relative rounded-xl p-[1px] overflow-hidden bg-gradient-to-br ${upgradeCardConfig.gradient}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] skew-x-12" />
            <div className="relative bg-slate-900 rounded-xl p-3 overflow-hidden border border-white/10 shadow-lg">
              <div className="relative z-10 text-white">
                <div className="flex items-center gap-2 mb-1">
                  {isFree ? <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400" /> : <Crown className="w-3 h-3 text-purple-400 fill-purple-400" />}
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{isFree ? "Plano Free" : "Membro Pro"}</span>
                </div>
                <h3 className="font-black text-sm leading-tight mb-0.5">{upgradeCardConfig.title}</h3>
                <p className="text-[10px] text-red-300 font-medium mb-2">{upgradeCardConfig.lossMessage}</p>
                <div className="w-full bg-white/10 h-1 rounded-full mb-3 overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${isFree ? 'from-yellow-400 to-orange-500' : 'from-purple-400 to-pink-500'}`} style={{ width: `${upgradeCardConfig.progress}%` }} />
                </div>
                <div className="space-y-2 mb-3 hidden lg:block">
                  {upgradeCardConfig.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-300/90 font-medium">
                      <div className="p-1 rounded bg-white/10"><feat.icon className="w-3 h-3 text-white" /></div>
                      <span>{feat.text}</span>
                    </div>
                  ))}
                </div>
                <Link href="/dashboard/billing">
                  <motion.button className={`w-full bg-gradient-to-r ${upgradeCardConfig.buttonGradient} text-white text-[10px] font-black py-2 rounded-lg shadow-lg relative overflow-hidden group border border-white/20`} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <span className="relative flex items-center justify-center gap-1.5">{upgradeCardConfig.buttonText} <ArrowRight className="w-3 h-3" /></span>
                  </motion.button>
                </Link>
                <p className="text-[9px] text-slate-500 text-center mt-2 font-medium">
                  ✨ {upgradeCardConfig.socialProof}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </nav>
  );
}

export default function DashboardShell({ children, initialPlan }: { children: ReactNode, initialPlan: string }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const pathname = usePathname();
  const userPlan = initialPlan || "free";
  const { signOut } = useClerk();

  const isDashboardHome = pathname === '/dashboard';

  const handleSearchLinkClick = () => { setIsSearchOpen(false); setSearchTerm(""); };

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!debouncedSearchTerm) { setSearchResults([]); setSearchLoading(false); return; }
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedSearchTerm)}`);
        if (!res.ok) throw new Error("Erro");
        const data: SearchResponse[] = await res.json();
        const resultsWithIcons: SearchResult[] = data.map(item => ({ label: item.label, href: item.href, icon: searchableItemsMap[item.href], description: item.description }));
        setSearchResults(resultsWithIcons.slice(0, DASHBOARD_CONFIG.MAX_SEARCH_RESULTS));
      } catch { setSearchResults([]); } finally { setSearchLoading(false); }
    };
    fetchSearchResults();
  }, [debouncedSearchTerm]);

  const getPlanBadge = () => {
    if (userPlan === "pro") return <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500">PRO</Badge>;
    if (userPlan === "ultra") return <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">ULTRA</Badge>;
    return null;
  };

  const getPageTitle = () => {
    const titles: { [key: string]: string } = { "/dashboard": "Visão Geral", "/dashboard/links": "Meus Links", "/dashboard/settings": "Configurações", "/dashboard/billing": "Plano e Cobrança" };
    return Object.entries(titles).find(([path]) => pathname.startsWith(path))?.[1] || "Dashboard";
  };

  useEffect(() => {
    if (isSidebarOpen) { document.body.style.overflow = 'hidden'; } else { document.body.style.overflow = 'unset'; }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isSidebarOpen]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen relative">

      <div className="fixed inset-0 z-[-1] bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800" />

      <aside className="hidden lg:flex w-72 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50 p-4 flex-col flex-shrink-0 shadow-xl h-screen sticky top-0">
        <div className="mb-4 px-2 flex-shrink-0">
          <Link href="/dashboard" className="flex items-center group">
            <FreelinkLogo size={40} />
            <div className="ml-3">
              <span className="text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Freelinnk</span>
              {userPlan !== "free" && <div className="mt-1">{getPlanBadge()}</div>}
            </div>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
          <SidebarContent userPlan={userPlan} uniqueId="desktop-sidebar" />
        </div>
        <div className="mt-auto pt-4 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between px-2 flex-shrink-0">
          <div className="flex items-center gap-3">
            <UserButton afterSignOutUrl="/" />
            <div className="text-sm">
              <p className="font-bold text-slate-800 dark:text-slate-200">Minha Conta</p>
              <p className="text-xs text-slate-500">{userPlan.toUpperCase()}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => signOut({ redirectUrl: '/' })}>
            <LogOut className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </aside>

      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm lg:hidden z-[100]" style={{ touchAction: "none" }} />
            <motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="fixed left-0 top-0 bottom-0 w-[85%] max-w-xs bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col h-[100dvh] z-[101] shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
                <Link href="/dashboard" className="flex items-center min-w-0">
                  <FreelinkLogo size={32} />
                  <span className="ml-3 text-xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Freelinnk</span>
                </Link>
                <motion.button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </motion.button>
              </div>
              <div className="flex-1 overflow-y-auto overscroll-contain p-4">
                <SidebarContent userPlan={userPlan} uniqueId="mobile-sidebar" />
              </div>
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex-shrink-0 bg-slate-50 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <UserButton afterSignOutUrl="/" />
                  <div className="text-sm">
                    <p className="font-bold text-slate-800 dark:text-white">Minha Conta</p>
                    <p className="text-xs text-slate-500">Plano {userPlan.toUpperCase()}</p>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 relative z-10">

        <header className="sticky top-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-200/50 p-4 flex justify-between items-center z-40">
          <div className="flex items-center gap-4">
            <div className="lg:hidden">
              <motion.button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <Menu className="w-6 h-6 text-slate-700 dark:text-slate-200" />
              </motion.button>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold hidden md:block">{getPageTitle()}</h1>
              {userPlan === 'free' && (
                <Link href="/dashboard/billing">
                  <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[9px] font-bold cursor-pointer hover:bg-slate-200 transition-colors hidden md:flex">
                    FREE — Fazer upgrade
                  </Badge>
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <AnimatePresence>
                {isSearchOpen ? (
                  <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: "260px", opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="absolute right-0 top-1/2 -translate-y-1/2 z-50">
                    <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar..." className="pl-10 h-9 rounded-xl bg-white shadow-xl border border-slate-200 w-full" autoFocus />
                    <motion.button onClick={() => { setIsSearchOpen(false); setSearchTerm("") }} className="absolute right-2 top-1/2 -translate-y-1/2 p-1"><X className="w-4 h-4" /></motion.button>
                    {(searchResults.length > 0 || searchLoading) && (
                      <div className="absolute top-full right-0 w-full bg-white shadow-2xl p-2 rounded-lg mt-2 border border-slate-100">
                        {searchLoading ? ( <div className="p-4 text-center text-xs text-slate-500">Buscando...</div> ) : ( searchResults.map((res, i) => ( <Link href={res.href} key={i} onClick={handleSearchLinkClick}> <div className="p-2 hover:bg-slate-100 rounded flex items-center gap-2 text-sm cursor-pointer"> {res.icon && <res.icon className="w-4 h-4 text-slate-500" />} <span className="truncate">{res.label}</span> </div> </Link> )) )}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.button onClick={() => setIsSearchOpen(true)} className="p-2 hover:bg-slate-100 rounded-full">
                    <Search className="w-5 h-5 text-slate-500" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <Link href="/dashboard/new-link">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow-lg hidden sm:flex">
                <PlusCircle className="w-4 h-4 mr-2" /> Novo Link
              </Button>
            </Link>
            <div className="lg:hidden"><UserButton /></div>
          </div>
        </header>

        <main className="flex-1 w-full p-4 lg:p-8">

          {isDashboardHome && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
            >
              <Link href="/dashboard/settings">
                <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-4 rounded-xl flex items-center gap-4 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/5 transition-all cursor-pointer group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/0 to-purple-500/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-lg group-hover:bg-purple-500 group-hover:text-white transition-colors text-purple-600 dark:text-purple-300">
                    <Palette className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm">Editar Visual da Página</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Alterar cores, tema e foto de perfil</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-full border border-slate-100 dark:border-slate-700 group-hover:border-purple-200">
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-500 transition-colors" />
                  </div>
                </div>
              </Link>

              <Link href="/dashboard/links">
                <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-4 rounded-xl flex items-center gap-4 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/5 transition-all cursor-pointer group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors text-blue-600 dark:text-blue-300">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm">Gerenciar Links e Dados</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Ver estatísticas e editar botões</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-full border border-slate-100 dark:border-slate-700 group-hover:border-blue-200">
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {children}
          <div className="h-24 lg:hidden" />
        </main>
      </div>
    </div>
  );
}