// Em app/dashboard/layout.tsx
// (Substitua o arquivo inteiro)

"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    Settings,
    Wand2,
    Menu,
    X,
    PlusCircle,
    Scissors,
    Target,
    LayoutGrid,
    Gift,
    BrainCircuit
} from "lucide-react";
import clsx from "clsx";

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

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => { if (pathname === href) e.preventDefault(); };
  return ( <div className="flex-grow"> <ul className="space-y-1"> {navItems.map((item, index) => ( <li key={index}> {item.href ? ( <Link href={item.href} onClick={(e) => handleLinkClick(e, item.href)} className={clsx("flex items-center gap-3 p-3 rounded-lg font-medium transition-all", pathname === item.href ? "bg-purple-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-200")}> <item.icon className="w-5 h-5" /> <span>{item.label}</span> {item.new && <span className="ml-auto bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">Novo</span>} </Link> ) : ( <div className="pt-4"> <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{item.label}</h3> <ul className="mt-2 space-y-1"> {item.subItems?.map(subItem => ( <li key={subItem.href}> <Link href={subItem.href} onClick={(e) => handleLinkClick(e, subItem.href)} className={clsx("flex items-center gap-3 p-3 rounded-lg font-medium text-sm transition-all", pathname.startsWith(subItem.href) ? "bg-purple-100 text-purple-700" : "text-gray-600 hover:bg-gray-200")}> <subItem.icon className="w-5 h-5" /> <span>{subItem.label}</span> </Link> </li> ))} </ul> </div> )} </li> ))} </ul> </div> );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="flex min-h-screen bg-gray-100/50">
      <aside className="w-72 bg-white border-r border-gray-200/80 p-6 flex-col hidden md:flex shadow-sm">
        <div className="mb-10">
          <Link href="/dashboard" className="text-3xl font-bold text-gray-900 tracking-tighter">Freelinnk<span className="text-purple-600">.</span></Link>
        </div>
        <Sidebar />
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="md:hidden bg-white/80 backdrop-blur-sm border-b border-gray-200/80 p-4 flex justify-between items-center sticky top-0 z-20">
          <Link href="/dashboard" className="text-2xl font-bold text-gray-900 tracking-tighter">Freelinnk<span className="text-purple-600">.</span></Link>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>{isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
        </header>
        {isMobileMenuOpen && <div className="md:hidden bg-white p-6 border-b" onClick={closeMenu}><Sidebar /></div>}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}