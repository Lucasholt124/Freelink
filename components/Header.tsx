"use client";

import Link from "next/link";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "./ui/button";
import { Plus, LayoutDashboard, BarChart2, Target, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { MobileMenu } from "@/components/MobileMenu";

// A estrutura de navegação centralizada para o MobileMenu
const navLinks = [
  { href: "/dashboard", label: "Visão Geral", icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: "/dashboard/analytics", label: "Análises", icon: <BarChart2 className="w-5 h-5" /> },
  { href: "/dashboard/tracking", label: "Rastreamento", icon: <Target className="w-5 h-5" />, pro: true },
  { href: "/dashboard/billing", label: "Plano e Cobrança", icon: <CreditCard className="w-5 h-5" /> },
];

function Header({ isFixed = false }: { isFixed?: boolean }) {
  // Busca o plano para passar para o menu mobile
  const planQuery = useQuery(api.users.getMyPlan);
  const plan = planQuery ?? "free";

  return (
    <header
      className={cn(
        "bg-white/80 backdrop-blur-sm border-b border-white/20 shadow-sm",
        isFixed && "sticky top-0 z-50"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 xl:px-2 py-4 flex justify-between items-center">
        {/* Logo (mantido como estava) */}
        <Link
          href="/"
          className="text-2xl font-extrabold tracking-tight flex items-center gap-1 select-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-purple-500 transition"
          aria-label="Ir para a página inicial"
        >
          Free
          <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            linnk
          </span>
        </Link>

        {/* --- SEU DESIGN ORIGINAL DO MENU DESKTOP RESTAURADO --- */}
        <Authenticated>
          <div className="hidden sm:flex gap-2 items-center bg-white/50 backdrop-blur-sm border border-white/20 p-2 rounded-lg">
            <Link
              href="/dashboard/new-link"
              className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-purple-500"
              aria-label="Adicionar link"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">Adicionar link</span>
            </Link>
            <Button
              asChild
              variant="outline"
              className="border-purple-600 text-purple-600 hover:border-purple-700 hover:bg-purple-600 hover:text-white transition-all duration-200 focus-visible:ring-2 focus-visible:ring-purple-500"
              aria-label="Cobrança"
            >
              <Link href="/dashboard/billing">Cobrança</Link>
            </Button>
            <UserButton afterSignOutUrl="/" />
          </div>

          {/* Mobile menu (agora recebe os links e o plano) */}
          <div className="sm:hidden">
            <MobileMenu navLinks={navLinks} plan={plan} />
          </div>
        </Authenticated>

        <Unauthenticated>
          <SignInButton mode="modal">
            <Button
              variant="outline"
              className="border-purple-600 text-purple-600 hover:border-purple-700 hover:bg-purple-600 hover:text-white transition-all duration-200 focus-visible:ring-2 focus-visible:ring-purple-500"
              aria-label="Comece gratuitamente"
            >
              Comece gratuitamente
            </Button>
          </SignInButton>
        </Unauthenticated>
      </div>
    </header>
  );
}

export default Header;