"use client";

import { ReactNode, useState, useEffect, ForwardRefExoticComponent, RefAttributes } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Settings, Wand2, Scissors, Target, LayoutGrid, Gift,
  BrainCircuit, CreditCard, LogOut, ChevronDown, HelpCircle, Sparkles, Star, Rocket, X,
  LucideProps, Menu, Bell, Search, PlusCircle, CircleCheck, ArrowRight, Zap, Crown, TrendingUp, Shield, Clock
} from "lucide-react";
import clsx from "clsx";
import { UserButton } from "@clerk/nextjs";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePushNotifications } from "@/app/hooks/usePushNotifications";
import { useAuth } from "@clerk/clerk-react";

export interface NavSubItem {
  href: string;
  label: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  new?: boolean;
  pro?: boolean;
  ultra?: boolean;
  description?: string;
}

export interface NavItem {
  href?: string;
  label: string;
  icon?: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  new?: boolean;
  subItems?: NavSubItem[];
}

interface SearchResult {
  label: string;
  href: string;
  icon?: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  description?: string;
}

interface SearchResponse {
  label: string;
  href: string;
  tags: string[];
  description?: string;
}

type PlanType = "free" | "pro" | "ultra";

interface SidebarProps {
  userPlan?: PlanType;
}

interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  timestamp: string;
  link?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

export const navItems: NavItem[] = [
  { href: "/dashboard", icon: Home, label: "Visão Geral" },
  { href: "/dashboard/links", icon: LayoutGrid, label: "Meus Links" },
  {
    label: "Ferramentas de IA",
    subItems: [
      { href: "/dashboard/mentor-ia", icon: Wand2, label: "Mentor.IA", ultra: true, description: "IA para estratégias" },
      { href: "/dashboard/brain", icon: BrainCircuit, label: "FreelinnkBrain", pro: true, new: true, description: "Gerador de conteúdo" },
      { href: "/dashboard/ai-studio", icon: BrainCircuit, label: "AI Studio", ultra: true, new: true, description: "Criação avançada" },
    ]
  },
  {
    label: "Marketing",
    subItems: [
      { href: "/dashboard/shortener", icon: Scissors, label: "Encurtador", description: "Links curtos" },
      { href: "/dashboard/giveaway", icon: Gift, label: "Sorteios", pro: true, description: "Engajamento" },
      { href: "/dashboard/tracking", icon: Target, label: "Rastreamento", ultra: true, new: true, description: "Analytics completo" },
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

const searchableItemsMap: { [key: string]: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>> } = {
  "/dashboard": Home,
  "/dashboard/links": LayoutGrid,
  "/dashboard/mentor-ia": Wand2,
  "/dashboard/brain": BrainCircuit,
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
      <motion.div
        className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <span className="text-white font-black z-10" style={{ fontSize: size * 0.55 }}>
        F
      </span>
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent"
        initial={{ y: "100%" }}
        animate={{ y: "-100%" }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
    </motion.div>
  );
}

function Sidebar({ userPlan = "free" }: SidebarProps) {
  const pathname = usePathname();
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  useEffect(() => {
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
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <nav className="flex flex-col h-full">
      <ul className="flex-grow space-y-0.5 py-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200/50 dark:scrollbar-thumb-slate-700/50 hover:scrollbar-thumb-slate-300 dark:hover:scrollbar-thumb-slate-600 transition-colors">
        <LayoutGroup>
          {navItems.map((item, idx) => (
            <li key={idx}>
              {item.href && item.icon ? (
                <Link href={item.href} aria-label={item.label}>
                  <motion.div
                    className={clsx(
                      "flex items-center gap-3 p-3 rounded-xl font-medium transition-all mx-2 relative overflow-hidden group",
                      isActive(item.href)
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200"
                    )}
                    whileHover={{ x: isActive(item.href) ? 0 : 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isActive(item.href) && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <motion.div
                      animate={{ rotate: isActive(item.href) ? [0, 360] : 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <item.icon className="w-5 h-5" />
                    </motion.div>
                    <span className="font-medium">{item.label}</span>
                    {isActive(item.href) && (
                      <motion.div
                        className="absolute right-2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <CircleCheck className="w-4 h-4" />
                      </motion.div>
                    )}
                  </motion.div>
                </Link>
              ) : (
                <div className="pt-6 pb-2">
                  <motion.button
                    onClick={() => setActiveGroup(activeGroup === item.label ? null : item.label)}
                    className="px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between w-full hover:text-slate-700 dark:hover:text-slate-300 transition-colors group"
                    whileHover={{ x: 2 }}
                  >
                    <span>{item.label}</span>
                    {item.subItems && (
                      <motion.div
                        animate={{ rotate: activeGroup === item.label ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                      </motion.div>
                    )}
                  </motion.button>
                  <AnimatePresence initial={false}>
                    {(!item.subItems || activeGroup === item.label) && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="mt-2 space-y-0.5 overflow-hidden"
                      >
                        {item.subItems?.map((subItem, subIdx) => {
                          const isItemActive = isActive(subItem.href);
                          return (
                            <motion.li
                              key={subItem.href}
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: subIdx * 0.05 }}
                              onMouseEnter={() => setHoveredItem(subItem.href)}
                              onMouseLeave={() => setHoveredItem(null)}
                            >
                              <Link href={subItem.href} aria-label={subItem.label}>
                                <motion.div
                                  className={clsx(
                                    "flex items-center gap-3 py-2.5 px-4 rounded-xl font-medium text-sm transition-all mx-2 group relative overflow-hidden",
                                    isItemActive
                                      ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 dark:from-blue-900/20 dark:to-purple-900/20 dark:text-blue-300 shadow-sm"
                                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60"
                                  )}
                                  whileHover={{ x: 4, scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <motion.div
                                    className={clsx(
                                      "w-8 h-8 flex items-center justify-center rounded-lg transition-all",
                                      isItemActive
                                        ? "bg-gradient-to-br from-blue-500 to-purple-500 shadow-md"
                                        : hoveredItem === subItem.href
                                        ? "bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600"
                                        : "bg-slate-100 dark:bg-slate-800"
                                    )}
                                    whileHover={{ rotate: [0, -10, 10, 0] }}
                                  >
                                    <subItem.icon className={clsx(
                                      "w-4 h-4",
                                      isItemActive ? "text-white" : "text-slate-600 dark:text-slate-400"
                                    )} />
                                  </motion.div>
                                  <div className="flex-1 flex items-center justify-between min-w-0">
                                    <div className="min-w-0">
                                      <span className="block truncate">{subItem.label}</span>
                                      {subItem.description && hoveredItem === subItem.href && (
                                        <motion.span
                                          initial={{ opacity: 0, y: -5 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          className="text-xs text-slate-500 dark:text-slate-500 block truncate"
                                        >
                                          {subItem.description}
                                        </motion.span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                                      {subItem.new && (
                                        <motion.div
                                          initial={{ scale: 0, rotate: -180 }}
                                          animate={{ scale: 1, rotate: 0 }}
                                          transition={{ type: "spring", bounce: 0.5 }}
                                        >
                                          <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] px-1.5 py-0 font-bold shadow-sm">
                                            <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                                            NEW
                                          </Badge>
                                        </motion.div>
                                      )}
                                      {subItem.pro && (
                                        <motion.div
                                          whileHover={{ scale: 1.1 }}
                                          whileTap={{ scale: 0.95 }}
                                        >
                                          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-[10px] px-1.5 py-0 font-bold shadow-sm">
                                            <Star className="w-2.5 h-2.5 mr-0.5" />
                                            PRO
                                          </Badge>
                                        </motion.div>
                                      )}
                                      {subItem.ultra && (
                                        <motion.div
                                          animate={{
                                            boxShadow: ["0 0 0px rgba(168, 85, 247, 0)", "0 0 10px rgba(168, 85, 247, 0.3)", "0 0 0px rgba(168, 85, 247, 0)"]
                                          }}
                                          transition={{ duration: 2, repeat: Infinity }}
                                        >
                                          <Badge className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 text-white text-[10px] px-1.5 py-0 font-bold shadow-sm">
                                            <Crown className="w-2.5 h-2.5 mr-0.5" />
                                            ULTRA
                                          </Badge>
                                        </motion.div>
                                      )}
                                    </div>
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
        <motion.div
          className="px-3 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-pink-600 rounded-2xl p-[2px] overflow-hidden"
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          >
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-4 overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <motion.div
                    className="bg-gradient-to-br from-purple-500 via-blue-500 to-pink-500 p-2.5 rounded-xl shadow-lg"
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {userPlan === "free" ? <Zap className="w-5 h-5 text-white" /> : <Rocket className="w-5 h-5 text-white" />}
                  </motion.div>
                  <div>
                    <h3 className="font-black text-slate-800 dark:text-slate-200 text-base">
                      {userPlan === "free" ? "Seja PRO" : "Seja ULTRA"}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {userPlan === "free" ? "Desbloqueie tudo" : "Máximo poder"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <motion.div
                    className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400"
                    whileHover={{ x: 2 }}
                  >
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span>Analytics avançados</span>
                  </motion.div>
                  <motion.div
                    className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400"
                    whileHover={{ x: 2 }}
                  >
                    <Shield className="w-3 h-3 text-blue-500" />
                    <span>Recursos exclusivos</span>
                  </motion.div>
                  <motion.div
                    className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400"
                    whileHover={{ x: 2 }}
                  >
                    <Clock className="w-3 h-3 text-purple-500" />
                    <span>Suporte prioritário</span>
                  </motion.div>
                </div>

                <Link href="/dashboard/billing">
                  <motion.button
                    className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white text-sm font-bold py-2.5 rounded-xl shadow-lg relative overflow-hidden group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0"
                      initial={{ x: "-100%" }}
                      animate={{ x: "200%" }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                    />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {userPlan === "free" ? "Começar Agora" : "Evoluir Agora"}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </nav>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const pathname = usePathname();
  const [userPlan, setUserPlan] = useState<PlanType>("free");
  const [userNotifications, setUserNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState<boolean>(true);
  const [showPushPrompt, setShowPushPrompt] = useState(false);

  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { isSupported, isSubscribed, subscribe } = usePushNotifications();

  useEffect(() => {
    const hasSeenPrompt = localStorage.getItem('hasSeenPushPrompt');
    if (authLoaded && isSignedIn && isSupported && !isSubscribed && !hasSeenPrompt) {
      const timer = setTimeout(() => {
        setShowPushPrompt(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [authLoaded, isSignedIn, isSupported, isSubscribed]);

  const handleEnableNotifications = async () => {
    const success = await subscribe();
    if (success) {
      localStorage.setItem('hasSeenPushPrompt', 'true');
      setShowPushPrompt(false);
    }
  };

  const handleDismissPrompt = () => {
    localStorage.setItem('hasSeenPushPrompt', 'true');
    setShowPushPrompt(false);
  };

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!debouncedSearchTerm) {
        setSearchResults([]);
        setSearchLoading(false);
        return;
      }
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedSearchTerm)}`);
        if (!res.ok) throw new Error("Erro ao buscar resultados.");
        const data: SearchResponse[] = await res.json();
        const resultsWithIcons: SearchResult[] = data.map(item => ({
          label: item.label,
          href: item.href,
          icon: searchableItemsMap[item.href],
          description: item.description
        }));
        setSearchResults(resultsWithIcons);
      } catch (error) {
        console.error("Erro na busca:", error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };
    fetchSearchResults();
  }, [debouncedSearchTerm]);

  const handleSearchLinkClick = () => {
    setIsSearchOpen(false);
    setSearchTerm("");
  };

  const fetchNotifications = async () => {
    setNotificationsLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("Erro ao carregar notificações.");
      const data: Notification[] = await res.json();
      setUserNotifications(data);
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    const originalNotifications = [...userNotifications];
    setUserNotifications(current =>
      current.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Erro ao marcar como lida.");
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
      setUserNotifications(originalNotifications);
    }
  };

  const markAllAsRead = async () => {
    const originalNotifications = [...userNotifications];
    setUserNotifications(current =>
      current.map(n => ({ ...n, isRead: true }))
    );
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      if (!res.ok) throw new Error("Erro ao marcar todas como lidas.");
    } catch (error) {
      console.error("Erro ao marcar todas as notificações como lidas:", error);
      setUserNotifications(originalNotifications);
    }
  };

  const unreadNotificationsCount = userNotifications.filter(n => !n.isRead).length;

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
    fetchNotifications();
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
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Badge className="bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 text-white shadow-lg shadow-blue-500/20 font-bold">
              <Star className="w-3.5 h-3.5 mr-1" />
              PRO
            </Badge>
          </motion.div>
        );
      case "ultra":
        return (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Badge className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 text-white shadow-lg shadow-purple-500/20 font-bold">
              <Crown className="w-3.5 h-3.5 mr-1" />
              ULTRA
            </Badge>
          </motion.div>
        );
      default:
        return null;
    }
  };

  const getPageTitle = () => {
    const titles: { [key: string]: string } = {
      "/dashboard": "Visão Geral",
      "/dashboard/links": "Meus Links",
      "/dashboard/mentor-ia": "Mentor.IA",
      "/dashboard/brain": "FreelinkBrain",
      "/dashboard/ai-studio": "AI Studio",
      "/dashboard/shortener": "Encurtador",
      "/dashboard/giveaway": "Sorteios",
      "/dashboard/tracking": "Rastreamento",
      "/dashboard/settings": "Configurações",
      "/dashboard/billing": "Plano e Cobrança",
      "/dashboard/help": "Suporte",
    };
    return Object.entries(titles).find(([path]) => pathname.startsWith(path))?.[1] || "Dashboard";
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50 p-4 flex-col flex-shrink-0 shadow-xl overflow-hidden">
        <div className="mb-8 px-2 flex-shrink-0">
          <Link href="/dashboard" className="flex items-center group">
            <FreelinkLogo size={40} />
            <div className="ml-3">
              <motion.span
                className="text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                whileHover={{ scale: 1.05 }}
              >
                Freelinnk
              </motion.span>
              {userPlan !== "free" && (
                <div className="mt-1">{getPlanBadge()}</div>
              )}
            </div>
          </Link>
        </div>
        <div className="flex-1 overflow-hidden">
          <Sidebar userPlan={userPlan} />
        </div>
        <motion.div
          className="mt-auto pt-4 border-t border-slate-200/50 dark:border-slate-700/50 flex-shrink-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex justify-between items-center px-2 group">
            <div className="flex items-center gap-3 min-w-0">
              <UserButton afterSignOutUrl="/" />
              <div className="text-sm min-w-0">
                <p className="font-bold text-slate-800 dark:text-slate-200 truncate">Minha Conta</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  Freelinnk {userPlan === "ultra" ? "ULTRA" : userPlan === "pro" ? "PRO" : "Free"}
                </p>
              </div>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <motion.button
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex-shrink-0"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2 shadow-2xl border-slate-200/50 dark:border-slate-700/50" align="end">
                <div className="space-y-1">
                  <Link href="/dashboard/settings">
                    <motion.div
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      whileHover={{ x: 2 }}
                    >
                      <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      <span className="text-sm font-medium">Configurações</span>
                    </motion.div>
                  </Link>
                  <Link href="/dashboard/help">
                    <motion.div
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      whileHover={{ x: 2 }}
                    >
                      <HelpCircle className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      <span className="text-sm font-medium">Ajuda & Suporte</span>
                    </motion.div>
                  </Link>
                  <div className="border-t border-slate-200 dark:border-slate-700 my-2" />
                  <Link href="/">
                    <motion.div
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer group"
                      whileHover={{ x: 2 }}
                    >
                      <LogOut className="w-4 h-4 text-red-500 group-hover:text-red-600" />
                      <span className="text-sm font-medium text-red-500 group-hover:text-red-600">Sair</span>
                    </motion.div>
                  </Link>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </motion.div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50 p-4 z-50 lg:hidden flex flex-col shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8 flex-shrink-0">
                <Link href="/dashboard" className="flex items-center min-w-0">
                  <FreelinkLogo size={36} />
                  <span className="ml-3 text-xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent truncate">
                    Freelinnk
                  </span>
                </Link>
                <motion.button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex-shrink-0"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
              <div className="flex-1 overflow-hidden">
                <Sidebar userPlan={userPlan} />
              </div>
              <div className="mt-auto pt-4 border-t border-slate-200/50 dark:border-slate-700/50 flex-shrink-0">
                <div className="flex items-center gap-3 px-2">
                  <UserButton afterSignOutUrl="/" />
                  <div className="text-sm min-w-0">
                    <p className="font-bold text-slate-800 dark:text-slate-200 truncate">Minha Conta</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      Freelinnk {userPlan === "ultra" ? "ULTRA" : userPlan === "pro" ? "PRO" : "Free"}
                    </p>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Push Notification Prompt */}
      <AnimatePresence>
        {showPushPrompt && (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
            className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-[420px] z-50 max-w-[calc(100vw-2rem)]"
          >
            <motion.div
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden"
              whileHover={{ scale: 1.02 }}
            >
              <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 p-[2px]">
                <div className="bg-white dark:bg-slate-800 rounded-t-2xl p-5 relative">
                  <button
                    onClick={handleDismissPrompt}
                    className="absolute top-3 right-3 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="flex items-start gap-4">
                    <motion.div
                      className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl shadow-lg flex-shrink-0"
                      animate={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                    >
                      <Bell className="w-6 h-6 text-white" />
                    </motion.div>
                    <div className="flex-1 pr-8 min-w-0">
                      <h4 className="font-black text-lg mb-1 text-slate-800 dark:text-slate-200 truncate">
                        🔔 Notificações Inteligentes
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                        Receba alertas personalizados para nunca perder o momento certo de postar
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <motion.button
                          onClick={handleEnableNotifications}
                          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-shadow text-sm"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Ativar Agora
                        </motion.button>
                        <motion.button
                          onClick={handleDismissPrompt}
                          className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Talvez Depois
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header - Sticky em todas as telas */}
        <header className="sticky top-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 flex-shrink-0 shadow-sm z-30">
          <div className="px-3 sm:px-6 py-3 sm:py-4 flex justify-between items-center gap-2">
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              <motion.button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex-shrink-0"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Abrir menu"
              >
                <Menu className="w-5 h-5" />
              </motion.button>

              <div className="flex items-center gap-2 min-w-0 flex-1 lg:flex-initial">
                <Link href="/dashboard" className="flex-shrink-0 lg:hidden">
                  <FreelinkLogo size={28} />
                </Link>

                <motion.h1
                  className="text-base sm:text-lg lg:text-2xl font-black text-slate-800 dark:text-slate-200 truncate"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={pathname}
                >
                  {getPageTitle()}
                </motion.h1>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <motion.div
                className="hidden md:block"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href="/dashboard/new-link">
                        <Button className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all font-bold whitespace-nowrap">
                          <PlusCircle className="w-4 h-4 mr-2" />
                          Novo Link
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent className="font-medium">
                      Criar novo link personalizado
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </motion.div>

              {/* Search */}
              <AnimatePresence mode="wait">
                {isSearchOpen ? (
                  <motion.div
                    key="search-open"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "auto", opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="absolute left-0 right-0 top-0 h-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl z-20 flex items-center px-4 md:static md:w-96"
                  >
                    <div className="w-full relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <Input
                        type="search"
                        placeholder="Buscar..."
                        className="w-full pl-10 pr-10 h-9 sm:h-10 border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500 transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                      />
                      <motion.button
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchTerm("");
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    </div>

                    {debouncedSearchTerm && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-full left-0 right-0 mt-2 mx-4 md:mx-0 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden max-h-[60vh] overflow-y-auto"
                      >
                        {searchLoading ? (
                          <div className="p-8 text-center">
                            <motion.div
                              className="w-8 h-8 mx-auto mb-3 border-3 border-purple-500 border-t-transparent rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            <p className="text-sm text-slate-500">Buscando...</p>
                          </div>
                        ) : searchResults.length > 0 ? (
                          <div className="p-2 space-y-1">
                            {searchResults.map((item, idx) => {
                              const IconComponent = item.icon;
                              return (
                                <motion.div
                                  key={item.href}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.05 }}
                                >
                                  <Link
                                    href={item.href}
                                    onClick={handleSearchLinkClick}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all group"
                                  >
                                    {IconComponent && (
                                      <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                                        <IconComponent className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate">
                                        {item.label}
                                      </p>
                                      {item.description && (
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                          {item.description}
                                        </p>
                                      )}
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                                  </Link>
                                </motion.div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="p-8 text-center">
                            <div className="w-12 h-12 mx-auto mb-3 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">
                              <Search className="w-6 h-6 text-slate-400" />
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              Nenhum resultado encontrado
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <motion.button
                    key="search-button"
                    onClick={() => setIsSearchOpen(true)}
                    className="p-2 sm:p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex-shrink-0"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Buscar"
                  >
                    <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Notifications */}
              <Popover>
                <PopoverTrigger asChild>
                  <motion.button
                    className="relative p-2 sm:p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex-shrink-0"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                    {unreadNotificationsCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-lg"
                      >
                        {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                      </motion.span>
                    )}
                  </motion.button>
                </PopoverTrigger>
                <PopoverContent className="w-[calc(100vw-2rem)] sm:w-96 p-0 shadow-2xl border-slate-200/50 dark:border-slate-700/50 rounded-xl overflow-hidden" align="end">
                  <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                        <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                        Notificações
                      </h4>
                      {unreadNotificationsCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white/80 hover:text-white hover:bg-white/20 text-xs sm:text-sm"
                          onClick={markAllAsRead}
                        >
                          Marcar todas
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="max-h-[60vh] sm:max-h-[400px] overflow-y-auto">
                    {notificationsLoading ? (
                      <div className="p-8 text-center">
                        <motion.div
                          className="w-8 h-8 mx-auto mb-3 border-3 border-purple-500 border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <p className="text-sm text-slate-500">Carregando...</p>
                      </div>
                    ) : userNotifications.length > 0 ? (
                      <div className="p-2 space-y-2">
                        {userNotifications.map((notification, idx) => (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                          >
                            <Link
                              href={notification.link || '#'}
                              onClick={() => markNotificationAsRead(notification.id)}
                            >
                              <motion.div
                                className={clsx(
                                  "p-3 sm:p-4 rounded-xl cursor-pointer transition-all",
                                  notification.isRead
                                    ? "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
                                    : "bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 hover:from-purple-100 hover:to-blue-100 dark:hover:from-purple-900/30 dark:hover:to-blue-900/30"
                                )}
                                whileHover={{ x: 4 }}
                              >
                                <div className="flex justify-between items-start gap-3">
                                  <div className="flex-1 min-w-0">
                                    <p className={clsx(
                                      "text-sm leading-relaxed break-words",
                                      notification.isRead
                                        ? "text-slate-600 dark:text-slate-400"
                                        : "text-slate-800 dark:text-slate-200 font-semibold"
                                    )}>
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                                      {new Date(notification.timestamp).toLocaleDateString("pt-BR", {
                                        day: '2-digit',
                                        month: 'short',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </p>
                                  </div>
                                  {!notification.isRead && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg flex-shrink-0 mt-2"
                                    />
                                  )}
                                </div>
                              </motion.div>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <div className="w-12 h-12 mx-auto mb-3 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">
                          <Bell className="w-6 h-6 text-slate-400" />
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Nenhuma notificação
                        </p>
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Help Button - Hidden on small mobile */}
              <motion.div
                className="hidden sm:block"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href="/dashboard/help">
                        <Button variant="ghost" size="icon" className="rounded-xl flex-shrink-0">
                          <HelpCircle className="w-5 h-5" />
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent className="font-medium">
                      Central de Ajuda
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </motion.div>

              {/* Plan Badge or Upgrade - Hidden on mobile */}
              <div className="hidden md:block flex-shrink-0">
                {userPlan !== "free" ? (
                  getPlanBadge()
                ) : (
                  <Link href="/dashboard/billing">
                    <motion.button
                      className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 text-purple-700 dark:text-purple-300 rounded-xl font-bold text-sm hover:from-purple-200 hover:to-pink-200 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 transition-all shadow-sm hover:shadow-md whitespace-nowrap"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Sparkles className="w-4 h-4 inline mr-1.5" />
                      Upgrade
                    </motion.button>
                  </Link>
                )}
              </div>

              {/* Mobile User Button */}
              <div className="lg:hidden flex-shrink-0">
                <UserButton afterSignOutUrl="/" />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 pb-24 lg:pb-4">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-screen-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <motion.div
          className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-700/50 px-2 py-2 safe-area-bottom z-30"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
        >
          <div className="flex items-center justify-around max-w-lg mx-auto">
            <Link href="/dashboard" className="flex-1">
              <motion.button
                className={clsx(
                  "flex flex-col items-center justify-center p-2 rounded-2xl transition-all w-full min-h-[60px]",
                  pathname === "/dashboard"
                    ? "bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-600 dark:text-blue-400"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                )}
                whileTap={{ scale: 0.95 }}
              >
                <Home className="w-5 h-5 mb-1 flex-shrink-0" />
                <span className="text-[10px] font-semibold truncate w-full text-center">Início</span>
              </motion.button>
            </Link>

            <Link href="/dashboard/links" className="flex-1">
              <motion.button
                className={clsx(
                  "flex flex-col items-center justify-center p-2 rounded-2xl transition-all w-full min-h-[60px]",
                  pathname.startsWith("/dashboard/links")
                    ? "bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-600 dark:text-blue-400"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                )}
                whileTap={{ scale: 0.95 }}
              >
                <LayoutGrid className="w-5 h-5 mb-1 flex-shrink-0" />
                <span className="text-[10px] font-semibold truncate w-full text-center">Links</span>
              </motion.button>
            </Link>

            <Link href="/dashboard/new-link" className="flex-1">
              <motion.button
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-3 rounded-2xl shadow-xl flex flex-col items-center justify-center relative overflow-hidden -mt-4 min-h-[68px] mx-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />
                <PlusCircle className="w-6 h-6 relative z-10 flex-shrink-0" />
              </motion.button>
            </Link>

            <Link href="/dashboard/mentor-ia" className="flex-1">
              <motion.button
                className={clsx(
                  "flex flex-col items-center justify-center p-2 rounded-2xl transition-all w-full min-h-[60px]",
                  pathname.startsWith("/dashboard/mentor-ia") || pathname.startsWith("/dashboard/brain") || pathname.startsWith("/dashboard/ai-studio")
                    ? "bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-600 dark:text-blue-400"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                )}
                whileTap={{ scale: 0.95 }}
              >
                <Wand2 className="w-5 h-5 mb-1 flex-shrink-0" />
                <span className="text-[10px] font-semibold truncate w-full text-center">IA</span>
              </motion.button>
            </Link>

            <motion.button
              onClick={() => setIsSidebarOpen(true)}
              className="flex flex-col items-center justify-center p-2 rounded-2xl transition-all flex-1 min-h-[60px] text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              whileTap={{ scale: 0.95 }}
            >
              <Menu className="w-5 h-5 mb-1 flex-shrink-0" />
              <span className="text-[10px] font-semibold truncate w-full text-center">Menu</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}