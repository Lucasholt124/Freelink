// Em /app/(admin)/dashboard/layout.tsx
// (Substitua o arquivo inteiro)

"use client";

import { ReactNode, useState, useEffect, ForwardRefExoticComponent, RefAttributes } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home, Settings, Wand2, Menu, X, Scissors, Target, LayoutGrid, Gift, BrainCircuit, CreditCard, LucideProps
} from "lucide-react";
import clsx from "clsx";
import { UserButton } from "@clerk/nextjs";

interface NavSubItem {
  href: string;
  label: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  new?: boolean;
}

interface NavItem {
    href?: string;
    label: string;
    icon?: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
    new?: boolean;
    subItems?: NavSubItem[];
}

function Sidebar() {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { href: "/dashboard", icon: Home, label: "Visão Geral" },
    { href: "/dashboard/links", icon: LayoutGrid, label: "Meus Links" },
    {
        label: "Ferramentas de IA",
        subItems: [
            { href: "/dashboard/mentor-ia", icon: Wand2, label: "Mentor IA" },
            { href: "/dashboard/brain", icon: BrainCircuit, label: "Brain™", new: true },
        ]
    },
    {
        label: "Marketing",
        subItems: [
            { href: "/dashboard/shortener", icon: Scissors, label: "Encurtador" },
            { href: "/dashboard/giveaway", icon: Gift, label: "Sorteios" },
            { href: "/dashboard/tracking", icon: Target, label: "Rastreamento" },
        ]
    },
    {
        label: "Conta",
        subItems: [
            { href: "/dashboard/settings", icon: Settings, label: "Configurações" },
            { href: "/dashboard/billing", icon: CreditCard, label: "Plano e Cobrança" },
        ]
    },
  ];

  return (
    <nav className="flex flex-col h-full">
      <ul className="flex-grow space-y-1">
        {navItems.map((item, index) => (
          <li key={index}>
            {item.href && item.icon ? (
              <Link href={item.href} className={clsx("flex items-center gap-3 p-2.5 rounded-lg font-medium transition-colors", pathname === item.href ? "bg-purple-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100")}>
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
                {item.new && <span className="ml-auto bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">Novo</span>}
              </Link>
            ) : (
              <div className="pt-3">
                <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{item.label}</h3>
                <ul className="mt-1 space-y-1">
                  {item.subItems?.map(subItem => {
                    const isActive = pathname.startsWith(subItem.href!);
                    return (
                        <li key={subItem.href}>
                            <Link href={subItem.href!} className={clsx("flex items-center gap-3 p-2.5 rounded-lg font-medium text-sm transition-colors", isActive ? "bg-purple-50 text-purple-700" : "text-gray-600 hover:bg-gray-100")}>
                               {subItem.icon && <subItem.icon className="w-5 h-5" />}
                               <span>{subItem.label}</span>
                               {subItem.new && <span className="ml-auto bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">Novo</span>}
                            </Link>
                        </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen bg-gray-50">

      {/* Sidebar para Desktop (fixa e com scroll próprio) */}
      <aside className="w-64 bg-white border-r p-4 hidden lg:flex flex-col flex-shrink-0">
        <div className="mb-4 px-2">
          <Link href="/dashboard" className="text-2xl font-bold text-gray-900">Freelinnk<span className="text-purple-600">.</span></Link>
        </div>
        <div className="flex-grow overflow-y-auto -mr-4 pr-4">
          <Sidebar />
        </div>
        <div className="mt-auto pt-4 border-t flex-shrink-0">
            <div className="flex items-center gap-3 p-2">
                <UserButton afterSignOutUrl="/" />
                <div className="text-sm"><p className="font-semibold">Minha Conta</p></div>
            </div>
        </div>
      </aside>

      {/* Overlay e Sidebar para Mobile */}
      {isSidebarOpen && <div className="lg:hidden fixed inset-0 bg-black/40 z-20" onClick={() => setIsSidebarOpen(false)}></div>}
      <aside className={clsx("lg:hidden fixed top-0 left-0 h-full w-64 bg-white p-4 flex flex-col z-30 transition-transform duration-300 ease-in-out", isSidebarOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="mb-4 px-2 flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold">Freelinnk<span className="text-purple-600">.</span></Link>
          <button onClick={() => setIsSidebarOpen(false)}><X/></button>
        </div>
        <div className="flex-grow overflow-y-auto -mr-4 pr-4">
            <Sidebar />
        </div>
         <div className="mt-auto pt-4 border-t flex-shrink-0">
            <div className="flex items-center gap-3 p-2">
                <UserButton afterSignOutUrl="/" />
                <div className="text-sm"><p className="font-semibold">Minha Conta</p></div>
            </div>
        </div>
      </aside>

      {/* Container Principal do Conteúdo */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="lg:hidden bg-white/80 backdrop-blur-sm border-b p-3 flex justify-between items-center flex-shrink-0 sticky top-0 z-10">
          <button onClick={() => setIsSidebarOpen(true)} className="p-1"><Menu /></button>
          <div><UserButton afterSignOutUrl="/" /></div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
        </main>
      </div>
    </div>
  );
}