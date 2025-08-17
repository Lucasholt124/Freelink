"use client";

import { ReactNode, useState, useEffect, ForwardRefExoticComponent, RefAttributes } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Settings, Wand2, Scissors, Target, LayoutGrid, Gift,
  BrainCircuit, CreditCard, LogOut, ChevronDown, HelpCircle, Sparkles, Star, Rocket, X,
  LucideProps, Menu, Bell, Search, PlusCircle
} from "lucide-react";
import clsx from "clsx";
import { UserButton } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NavSubItem {
  href: string;
  label: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  new?: boolean;
  pro?: boolean;
  ultra?: boolean;
}

interface NavItem {
  href?: string;
  label: string;
  icon?: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  new?: boolean;
  subItems?: NavSubItem[];
}

type PlanType = "free" | "pro" | "ultra";

interface SidebarProps {
  userPlan?: PlanType;
}

function FreelinkLogo({ size = 32 }: { size?: number }) {
  return (
    <div
      className="relative flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 shadow-md overflow-hidden group"
      style={{ width: size, height: size }}
    >
      <motion.div
        className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"
        initial={false}
        animate={{ opacity: [0, 0.2, 0] }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "loop" }}
      />
      <span className="text-white font-bold" style={{ fontSize: size * 0.6 }}>
        F
      </span>
    </div>
  );
}

function Sidebar({ userPlan = "free" }: SidebarProps) {
  const pathname = usePathname();
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  const navItems: NavItem[] = [
    { href: "/dashboard", icon: Home, label: "Visão Geral" },
    { href: "/dashboard/links", icon: LayoutGrid, label: "Meus Links" },
    {
      label: "Ferramentas de IA",
      subItems: [
        { href: "/dashboard/mentor-ia", icon: Wand2, label: "Mentor.IA", pro: userPlan === "free" },
        { href: "/dashboard/brain", icon: BrainCircuit, label: "FreelinkBrain", pro: userPlan === "free", new: true },
      ]
    },
    {
      label: "Marketing",
      subItems: [
        { href: "/dashboard/shortener", icon: Scissors, label: "Encurtador" },
        { href: "/dashboard/giveaway", icon: Gift, label: "Sorteios", ultra: userPlan !== "ultra" },
        { href: "/dashboard/tracking", icon: Target, label: "Rastreamento", ultra: userPlan !== "ultra", new: true },
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

  useEffect(() => {
    // Encontrar e definir grupo ativo com base na navegação atual
    navItems.forEach(item => {
      if (item.subItems) {
        const activeSubItem = item.subItems.find(subItem =>
          pathname.startsWith(subItem.href)
        );
        if (activeSubItem) {
          setActiveGroup(item.label);
        }
      }
    });
  }, [pathname ]);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <nav className="flex flex-col h-full">
      <ul className="flex-grow space-y-1 py-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
        {navItems.map((item, idx) => (
          <li key={idx}>
            {item.href && item.icon ? (
              <Link href={item.href} aria-label={item.label}>
                <div className={clsx(
                  "flex items-center gap-3 p-2.5 rounded-lg font-medium transition-all mx-2 relative overflow-hidden",
                  isActive(item.href)
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}>
                  {isActive(item.href) && (
                    <motion.div
                      className="absolute inset-0 bg-white/10"
                      initial={{ x: -100, opacity: 0.5 }}
                      animate={{ x: 200, opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 2, repeatType: "loop" }}
                    />
                  )}
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
              </Link>
            ) : (
              <div className="pt-4 pb-1">
                <h3 className="px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span>{item.label}</span>
                  {item.subItems && (
                    <button
                      onClick={() => setActiveGroup(activeGroup === item.label ? null : item.label)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      aria-label={`Toggle ${item.label} menu`}
                    >
                      <ChevronDown
                        className={clsx(
                          "w-3.5 h-3.5 transition-transform duration-200",
                          activeGroup === item.label ? "transform rotate-180" : ""
                        )}
                      />
                    </button>
                  )}
                </h3>

                <AnimatePresence initial={false}>
                  {(!item.subItems || activeGroup === item.label) && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-1 space-y-1 overflow-hidden"
                    >
                      {item.subItems?.map(subItem => {
                        const isItemActive = isActive(subItem.href);
                        return (
                          <motion.li
                            key={subItem.href}
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Link href={subItem.href} aria-label={subItem.label}>
                              <div className={clsx(
                                "flex items-center gap-3 py-2 px-4 rounded-lg font-medium text-sm transition-all mx-2 group",
                                isItemActive
                                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                              )}>
                                <div className={clsx(
                                  "w-6 h-6 flex items-center justify-center rounded-md transition-colors",
                                  isItemActive
                                    ? "bg-blue-100 dark:bg-blue-800/50"
                                    : "bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700"
                                )}>
                                  <subItem.icon className={clsx(
                                    "w-3.5 h-3.5",
                                    isItemActive ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-500"
                                  )} />
                                </div>
                                <span>{subItem.label}</span>

                                {subItem.new && (
                                  <span className="ml-auto px-1.5 py-0.5 text-[9px] font-bold uppercase bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-sm">
                                    Novo
                                  </span>
                                )}

                                {subItem.pro && (
                                  <Badge className="ml-auto bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[10px] py-0 px-1.5 font-semibold">
                                    PRO
                                  </Badge>
                                )}

                                {subItem.ultra && (
                                  <Badge className="ml-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] py-0 px-1.5 font-semibold">
                                    ULTRA
                                  </Badge>
                                )}
                              </div>
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
      </ul>

      {userPlan !== "ultra" && (
        <div className="px-3 mb-4">
          <div className="relative bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-900/20 overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-12 h-12 rounded-full bg-gradient-to-r from-purple-400/10 to-blue-400/10 dark:from-purple-400/5 dark:to-blue-400/5"></div>
            <div className="absolute -bottom-8 -left-8 w-16 h-16 rounded-full bg-gradient-to-r from-purple-400/10 to-blue-400/10 dark:from-purple-400/5 dark:to-blue-400/5"></div>

            <div className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-full shadow-sm">
                  {userPlan === "free" ? <Sparkles className="w-4 h-4 text-white" /> : <Rocket className="w-4 h-4 text-white" />}
                </div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200">
                  {userPlan === "free" ? "Desbloqueie recursos PRO" : "Evolua para ULTRA"}
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
                {userPlan === "free"
                  ? "Acesse ferramentas de IA avançadas e analytics completos para seus links."
                  : "Automatize seu conteúdo e monetize sua audiência com recursos exclusivos."}
              </p>
              <Link href="/dashboard/billing">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm shadow-sm relative overflow-hidden group">
                  <span className="relative z-10">
                    {userPlan === "free" ? "Conhecer Plano PRO" : "Conhecer Plano ULTRA"}
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-white/10 z-0"
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 200, opacity: 0.3 }}
                    transition={{ repeat: Infinity, duration: 1.5, repeatType: "loop" }}
                  />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();
  const [userPlan, setUserPlan] = useState<PlanType>("free");
  const [notifications] = useState(3); // Exemplo para notificações

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const res = await fetch("/api/subscription-plan");
        if (res.ok) {
          const data = await res.json();
          setUserPlan(data.plan || "free");
        }
      } catch (error) {
        console.error("Erro ao verificar plano:", error);
      }
    };
    checkSubscription();
  }, []);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSidebarOpen]);

  const getPlanBadge = () => {
    switch (userPlan) {
      case "pro":
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm">
            <Star className="w-3.5 h-3.5 mr-1" />
            PRO
          </Badge>
        );
      case "ultra":
        return (
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm">
            <Rocket className="w-3.5 h-3.5 mr-1" />
            ULTRA
          </Badge>
        );
      default:
        return null;
    }
  };

  // Helper para obter o título da página atual
  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Visão Geral";
    if (pathname.startsWith("/dashboard/links")) return "Meus Links";
    if (pathname.startsWith("/dashboard/mentor-ia")) return "Mentor.IA";
    if (pathname.startsWith("/dashboard/brain")) return "FreelinkBrain";
    if (pathname.startsWith("/dashboard/shortener")) return "Encurtador";
    if (pathname.startsWith("/dashboard/giveaway")) return "Sorteios";
    if (pathname.startsWith("/dashboard/tracking")) return "Rastreamento";
    if (pathname.startsWith("/dashboard/settings")) return "Configurações";
    if (pathname.startsWith("/dashboard/billing")) return "Plano e Cobrança";
    if (pathname.startsWith("/dashboard/help")) return "Suporte";
    return "";
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-4 flex-col flex-shrink-0">
        <div className="mb-6 px-2">
          <Link href="/dashboard" className="flex items-center">
            <FreelinkLogo size={32} />
            <div className="ml-3">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Freelink
              </span>
              {userPlan !== "free" && (
                <div className="mt-0.5">{getPlanBadge()}</div>
              )}
            </div>
          </Link>
        </div>
        <Sidebar userPlan={userPlan} />
        <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
          <div className="flex justify-between items-center px-2">
            <div className="flex items-center gap-3">
              <UserButton afterSignOutUrl="/" />
              <div className="text-sm">
                <p className="font-medium text-slate-800 dark:text-slate-200">Minha Conta</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Freelink {userPlan === "ultra" ? "ULTRA" : userPlan === "pro" ? "PRO" : "Free"}
                </p>
              </div>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-1">
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-0" align="end">
                <div className="p-2">
                  <Link href="/dashboard/settings">
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Configurações
                    </Button>
                  </Link>
                  <Link href="/dashboard/help">
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Ajuda & Suporte
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button variant="ghost" className="w-full justify-start text-sm text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </Button>
                  </Link>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </aside>

      {/* Sidebar mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="lg:hidden fixed top-0 left-0 h-full w-[85vw] max-w-[320px] bg-white dark:bg-slate-800 z-50 shadow-2xl flex flex-col"
            >
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <Link href="/dashboard" className="flex items-center">
                    <FreelinkLogo size={32} />
                    <div className="ml-3">
                      <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Freelink
                      </span>
                      {userPlan !== "free" && (
                        <div className="mt-0.5">{getPlanBadge()}</div>
                      )}
                    </div>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSidebarOpen(false)}
                    className="focus:ring-2 focus:ring-blue-500/30"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <Sidebar userPlan={userPlan} />
              </div>

              <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <UserButton afterSignOutUrl="/" />
                  <div className="text-sm flex-grow">
                    <p className="font-medium text-slate-800 dark:text-slate-200">Minha Conta</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Freelink {userPlan === "ultra" ? "ULTRA" : userPlan === "pro" ? "PRO" : "Free"}
                    </p>
                  </div>
                  <Link href="/">
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Container principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 flex-shrink-0 shadow-sm sticky top-0 z-20">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden focus:ring-2 focus:ring-blue-500/30"
                aria-label="Abrir menu"
              >
                <Menu className="w-5 h-5" />
              </Button>

              <div className="lg:hidden">
                <Link href="/dashboard" className="flex items-center">
                  <FreelinkLogo size={28} />
                  <span className="ml-2 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Freelink
                  </span>
                </Link>
              </div>

              <div className="hidden lg:block">
                <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">{getPageTitle()}</h1>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Barra de busca responsiva */}
              <AnimatePresence>
                {isSearchOpen ? (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "100%", opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 top-0 h-full w-full bg-white dark:bg-slate-800 z-10 flex items-center px-4"
                  >
                    <div className="w-full flex items-center">
                      <Input
                        type="search"
                        placeholder="Buscar links, ferramentas..."
                        className="flex-1 h-9 border-slate-300 dark:border-slate-600 focus-visible:ring-blue-500"
                        autoFocus
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2"
                        onClick={() => setIsSearchOpen(false)}
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSearchOpen(true)}
                    className="focus:ring-2 focus:ring-blue-500/30"
                    aria-label="Buscar"
                  >
                    <Search className="w-5 h-5" />
                  </Button>
                )}
              </AnimatePresence>

              {/* Botão para criar links - desktop */}
              <div className="hidden md:block">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href="/dashboard/new-link">
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-sm">
                          <PlusCircle className="w-4 h-4 mr-2" />
                          Novo Link
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>Criar novo link personalizado</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Notificações */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="relative border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/30">
                      <Bell className="w-5 h-5" />
                      {notifications > 0 && (
                        <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full transform translate-x-1 -translate-y-1">
                          {notifications}
                        </span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Notificações</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Botão de ajuda - desktop */}
              <div className="hidden sm:block">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href="/dashboard/help">
                        <Button variant="ghost" size="icon" className="focus:ring-2 focus:ring-blue-500/30">
                          <HelpCircle className="w-5 h-5" />
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>Ajuda e Suporte</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Badge do plano ou upgrade - tablet/desktop */}
              <div className="hidden md:block">
                {userPlan !== "free" ? (
                  getPlanBadge()
                ) : (
                  <Link href="/dashboard/billing">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700 shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1" />
                      Upgrade
                    </Button>
                  </Link>
                )}
              </div>

              {/* Avatar do usuário - mobile */}
              <div className="lg:hidden">
                <UserButton afterSignOutUrl="/" />
              </div>
            </div>
          </div>
        </header>

        {/* Barra de contexto móvel para sub-páginas (só mostrada em páginas específicas) */}
        {pathname !== "/dashboard" && (
          <div className="lg:hidden border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <div className="container mx-auto px-4 py-2.5 flex items-center justify-between">
              <h1 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                {getPageTitle()}
              </h1>

              {/* Botões contextuais baseados na página */}
              {pathname.startsWith("/dashboard/new-link") && (
                <Link href="/dashboard/new-link">
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs shadow-sm h-8">
                    <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                    Novo Link
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-screen-2xl">
            {children}
          </div>
        </main>

        {/* Barra de navegação móvel */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-around py-2 px-2 z-20">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="icon"
              className={clsx(
                "flex flex-col items-center justify-center h-14 w-14 rounded-xl",
                pathname === "/dashboard" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : ""
              )}
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px] mt-1">Início</span>
            </Button>
          </Link>

          <Link href="/dashboard/links">
            <Button
              variant="ghost"
              size="icon"
              className={clsx(
                "flex flex-col items-center justify-center h-14 w-14 rounded-xl",
                pathname.startsWith("/dashboard/new-link") ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : ""
              )}
            >
              <LayoutGrid className="w-5 h-5" />
              <span className="text-[10px] mt-1">Links</span>
            </Button>
          </Link>

          <Link href="/dashboard/new-link">
            <Button
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-14 w-14 rounded-full shadow-lg flex flex-col items-center justify-center"
            >
              <PlusCircle className="w-6 h-6" />
              <span className="text-[10px] mt-0.5">Criar</span>
            </Button>
          </Link>

          <Link href="/dashboard/mentor-ia">
            <Button
              variant="ghost"
              size="icon"
              className={clsx(
                "flex flex-col items-center justify-center h-14 w-14 rounded-xl",
                pathname.startsWith("/dashboard/mentor-ia") ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : ""
              )}
            >
              <Wand2 className="w-5 h-5" />
              <span className="text-[10px] mt-1">Mentor</span>
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="flex flex-col items-center justify-center h-14 w-14 rounded-xl"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] mt-1">Menu</span>
          </Button>
        </div>
      </div>
    </div>
  );
}