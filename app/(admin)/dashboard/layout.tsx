"use client";

import { ReactNode, useState, useEffect, ForwardRefExoticComponent, RefAttributes } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Settings, Wand2, Menu, X, Scissors, Target, LayoutGrid, Gift,
  BrainCircuit, CreditCard, LucideProps, LogOut, Bell, ChevronDown,
  ExternalLink, BarChart3, HelpCircle, Sparkles, Star, Rocket
} from "lucide-react";
import clsx from "clsx";
import { UserButton } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

type PlanType = "free" | "pro" | "ultra";

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

// Componente de notificações
function NotificationsMenu() {
  const [unread, setUnread] = useState(2);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full">
              {unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="p-3 border-b">
          <h3 className="font-medium">Notificações</h3>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          <div className="p-3 border-b hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
            <div className="flex gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2 h-min mt-0.5">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Novo recurso: FreelinkBrain</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Gere ideias virais de conteúdo em segundos!</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Agora mesmo</p>
              </div>
            </div>
          </div>
          <div className="p-3 border-b hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
            <div className="flex gap-3">
              <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-2 h-min mt-0.5">
                <Star className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Seu link ultrapassou 1000 cliques!</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Seu link Instagram Bio está com ótimo desempenho</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">1 hora atrás</p>
              </div>
            </div>
          </div>
        </div>
        <div className="p-2 border-t">
          <Button variant="ghost" size="sm" className="w-full justify-center text-sm" onClick={() => setUnread(0)}>
            Marcar todas como lidas
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Sidebar aprimorada
function Sidebar({ userPlan = "free" }: { userPlan?: PlanType }) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { href: "/dashboard", icon: Home, label: "Visão Geral" },
    { href: "/dashboard/links", icon: LayoutGrid, label: "Meus Links" },
    {
      label: "Ferramentas de IA",
      subItems: [
        { href: "/dashboard/mentor-ia", icon: Wand2, label: "Mentor.IA", pro: userPlan === "free" },
        { href: "/dashboard/brain", icon: BrainCircuit, label: "FreelinkBrain", new: true, pro: userPlan === "free" },
      ]
    },
    {
      label: "Marketing",
      subItems: [
        { href: "/dashboard/shortener", icon: Scissors, label: "Encurtador" },
        { href: "/dashboard/giveaway", icon: Gift, label: "Sorteios", ultra: userPlan !== "ultra" },
        { href: "/dashboard/tracking", icon: Target, label: "Rastreamento", ultra: userPlan !== "ultra" },
        { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics", pro: userPlan === "free" },
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

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="flex flex-col h-full">
      <ul className="flex-grow space-y-1 py-2">
        {navItems.map((item, index) => (
          <li key={index}>
            {item.href && item.icon ? (
              <Link href={item.href}>
                <div className={clsx(
                  "flex items-center gap-3 p-2.5 rounded-lg font-medium transition-all mx-2",
                  isActive(item.href)
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md shadow-blue-500/10"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}>
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {item.new && (
                    <Badge className="ml-auto bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-[10px]">
                      NOVO
                    </Badge>
                  )}
                </div>
              </Link>
            ) : (
              <div className="pt-4 pb-1">
                <h3 className="px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{item.label}</h3>
                <ul className="mt-1 space-y-1">
                  {item.subItems?.map(subItem => {
                    const isItemActive = isActive(subItem.href);
                    return (
                      <li key={subItem.href}>
                        <Link href={subItem.href}>
                          <div className={clsx(
                            "flex items-center gap-3 py-2 px-4 rounded-lg font-medium text-sm transition-all mx-2",
                            isItemActive
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                          )}>
                            <subItem.icon className={clsx(
                              "w-4 h-4",
                              isItemActive ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-500"
                            )} />
                            <span>{subItem.label}</span>
                            {subItem.new && (
                              <Badge className="ml-auto bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-[10px]">
                                NOVO
                              </Badge>
                            )}
                            {subItem.pro && (
                              <Badge className="ml-auto bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[10px] font-semibold">
                                PRO
                              </Badge>
                            )}
                            {subItem.ultra && (
                              <Badge className="ml-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-semibold">
                                ULTRA
                              </Badge>
                            )}
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* CTA para upgrade baseado no plano atual */}
      {userPlan !== "ultra" && (
        <div className="px-3 mb-4">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-900/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-full">
                {userPlan === "free" ? <Sparkles className="w-4 h-4 text-white" /> : <Rocket className="w-4 h-4 text-white" />}
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                {userPlan === "free" ? "Desbloqueie recursos PRO" : "Evolua para ULTRA"}
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
              {userPlan === "free"
                ? "Acesse ferramentas de IA e analytics avançados."
                : "Automatize seu conteúdo e monetize sua audiência."}
            </p>
            <Link href="/dashboard/billing">
              <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm">
                {userPlan === "free" ? "Conhecer Plano PRO" : "Conhecer Plano ULTRA"}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

// Logo Component
function FreelinkLogo({ size = 32 }: { size?: number }) {
  return (
    <div
      className="relative flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 shadow-md"
      style={{ width: size, height: size }}
    >
      <span className="text-white font-bold" style={{ fontSize: size * 0.6 }}>F</span>
    </div>
  );
}

export default function DashboardLayout({
  children
}: {
  children: ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const [userPlan, setUserPlan] = useState<PlanType>("free");

  // Verificação de plano do usuário
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

  const getPlanBadge = () => {
    switch (userPlan) {
      case "pro":
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
            <Star className="w-3.5 h-3.5 mr-1" />
            PRO
          </Badge>
        );
      case "ultra":
        return (
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <Rocket className="w-3.5 h-3.5 mr-1" />
            ULTRA
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar para Desktop */}
      <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-4 hidden lg:flex flex-col flex-shrink-0 transition-all">
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
        <div className="flex-grow overflow-y-auto -mr-4 pr-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
          <Sidebar userPlan={userPlan} />
        </div>
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
                <Button variant="ghost" size="icon">
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
                  <Link href="/signout">
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

      {/* Overlay e Sidebar para Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-20"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ x: "-100%" }}
        animate={{ x: isSidebarOpen ? 0 : "-100%" }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className="lg:hidden fixed top-0 left-0 h-full w-80 bg-white dark:bg-slate-800 p-4 flex flex-col z-30 shadow-2xl"
      >
        <div className="mb-4 px-2 flex justify-between items-center">
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
            className="hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex-grow overflow-y-auto -mr-4 pr-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
          <Sidebar userPlan={userPlan} />
        </div>
        <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-3 p-2">
            <UserButton afterSignOutUrl="/" />
            <div className="text-sm flex-grow">
              <p className="font-medium text-slate-800 dark:text-slate-200">Minha Conta</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Freelink {userPlan === "ultra" ? "ULTRA" : userPlan === "pro" ? "PRO" : "Free"}
              </p>
            </div>
            <Link href="/signout">
              <Button variant="ghost" size="icon" className="text-slate-500">
                <LogOut className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.aside>

      {/* Container Principal do Conteúdo */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 py-2 px-4 flex justify-between items-center flex-shrink-0 sticky top-0 z-10">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="lg:hidden ml-2">
              <Link href="/dashboard" className="flex items-center">
                <FreelinkLogo size={28} />
                <span className="ml-2 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Freelink
                </span>
              </Link>
            </div>
            <div className="hidden md:flex items-center ml-4 lg:ml-0">
              <Link href="/dashboard/links/new">
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  <ExternalLink className="w-4 h-4 mr-1.5" />
                  Novo Link
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <NotificationsMenu />

            <div className="hidden sm:block">
              <Link href="/dashboard/help">
                <Button variant="ghost" size="icon">
                  <HelpCircle className="w-5 h-5" />
                </Button>
              </Link>
            </div>

            <div className="hidden md:block">
              {userPlan !== "free" ? (
                getPlanBadge()
              ) : (
                <Link href="/dashboard/billing">
                  <Button
                    size="sm"
                    variant="outline"
                    className="mr-2 text-xs border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                    Upgrade
                  </Button>
                </Link>
              )}
            </div>

            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}