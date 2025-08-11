// Em /app/(admin)/dashboard/layout.tsx
// (Substitua o arquivo inteiro)

"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home, Settings, Wand2, Menu, X, PlusCircle, Scissors, Target, LayoutGrid, Gift, BrainCircuit
} from "lucide-react";
import clsx from "clsx";
import { UserButton } from "@clerk/nextjs";

function Sidebar() {
  const pathname = usePathname();
  const navItems = [
    { href: "/dashboard", icon: Home, label: "Visão Geral" },
    { href: "/dashboard/mentor-ia", icon: Wand2, label: "Mentor IA" },
    { href: "/dashboard/brain", icon: BrainCircuit, label: "Brain™", new: true },
    {
        label: "Minha Página",
        subItems: [
            { href: "/dashboard/links", icon: LayoutGrid, label: "Meus Links" },
            { href: "/dashboard/settings", icon: Settings, label: "Aparência e URL" },
            { href: "/dashboard/new-link", icon: PlusCircle, label: "Adicionar Novo Link" },
        ]
    },
    {
        label: "Ferramentas de Marketing",
        subItems: [
            { href: "/dashboard/giveaway", icon: Gift, label: "Sorteios" },
            { href: "/dashboard/shortener", icon: Scissors, label: "Encurtador" },
            { href: "/dashboard/tracking", icon: Target, label: "Rastreamento (Pixel)" },
        ]
    },
  ];

  return (
    <nav className="flex-grow">
      <ul className="space-y-1">
        {navItems.map((item, index) => (
          <li key={index}>
            {item.href ? (
              <Link href={item.href} className={clsx("flex items-center gap-3 p-3 rounded-lg font-medium transition-colors", pathname === item.href ? "bg-purple-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100")}>
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
                {item.new && <span className="ml-auto bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">Novo</span>}
              </Link>
            ) : (
              <div className="pt-4">
                <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{item.label}</h3>
                <ul className="mt-2 space-y-1">
                  {item.subItems?.map(subItem => {
                    const isActive = pathname.startsWith(subItem.href);
                    return (
                        <li key={subItem.href}>
                            <Link href={subItem.href} className={clsx("flex items-center gap-3 p-3 rounded-lg font-medium text-sm transition-colors", isActive ? "bg-purple-50 text-purple-700" : "text-gray-600 hover:bg-gray-100")}>
                               <subItem.icon className="w-5 h-5" />
                               <span>{subItem.label}</span>
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
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50">

      <aside className="w-64 bg-white border-r p-6 flex-col hidden lg:flex flex-shrink-0">
        <div className="mb-8">
          <Link href="/dashboard" className="text-2xl font-bold text-gray-900">Freelinnk<span className="text-purple-600">.</span></Link>
        </div>
        <Sidebar />
        <div className="mt-auto pt-6 border-t">
            <div className="flex items-center gap-3">
                <UserButton afterSignOutUrl="/" />
                <div className="text-sm"><p className="font-semibold">Minha Conta</p></div>
            </div>
        </div>
      </aside>

      {isSidebarOpen && <div className="lg:hidden fixed inset-0 bg-black/40 z-20" onClick={() => setIsSidebarOpen(false)}></div>}

      <aside className={clsx("lg:hidden fixed top-0 left-0 h-full w-64 bg-white p-6 flex flex-col z-30 transition-transform duration-300 ease-in-out", isSidebarOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="mb-8 flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold">Freelinnk<span className="text-purple-600">.</span></Link>
          <button onClick={() => setIsSidebarOpen(false)}><X/></button>
        </div>
        <Sidebar />
         <div className="mt-auto pt-6 border-t">
            <div className="flex items-center gap-3">
                <UserButton afterSignOutUrl="/" />
                <div className="text-sm"><p className="font-semibold">Minha Conta</p></div>
            </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-y-auto">
        <header className="lg:hidden bg-white/80 backdrop-blur-sm border-b p-4 flex justify-between items-center flex-shrink-0 sticky top-0 z-10">
          <button onClick={() => setIsSidebarOpen(true)}><Menu /></button>
          <div><UserButton afterSignOutUrl="/" /></div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {children}
            </div>
        </main>
      </div>
    </div>
  );
}