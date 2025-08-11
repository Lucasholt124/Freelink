// Em /components/Header.tsx
// (Substitua o arquivo inteiro)

"use client";

import Link from "next/link";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { MobileMenu } from "@/components/MobileMenu";
// =======================================================
// CORREÇÃO: Importando os ícones necessários
// =======================================================
import { LayoutDashboard, Link as LinkIcon, CreditCard, Zap } from "lucide-react";

// =======================================================
// CORREÇÃO: Adicionando a propriedade 'icon' a cada link
// =======================================================
const loggedInNavLinks = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: "/dashboard/links", label: "Meus Links", icon: <LinkIcon className="w-5 h-5" /> },
  { href: "/dashboard/billing", label: "Meu Plano", icon: <CreditCard className="w-5 h-5" /> },
];

const loggedOutNavLinks = [
  { href: "/#features", label: "Recursos", icon: <Zap className="w-5 h-5" /> },
  { href: "/#pricing", label: "Preços", icon: <CreditCard className="w-5 h-5" /> },
];

export function Header({ isFixed = false }: { isFixed?: boolean }) {
  return (
    <header className={cn("bg-white/80 backdrop-blur-sm border-b", isFixed && "sticky top-0 z-50")}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold tracking-tight text-gray-900 flex-shrink-0">
          Freelinnk<span className="text-purple-600">.</span>
        </Link>

        <Unauthenticated>
          {/* Menu Desktop para Deslogados */}
          <nav className="hidden md:flex items-center gap-6">
            {loggedOutNavLinks.map(link => (
              <Link key={link.href} href={link.href} className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="hidden md:flex items-center">
            <SignInButton mode="modal">
              <Button>Comece Grátis</Button>
            </SignInButton>
          </div>
          {/* Menu Mobile para Deslogados */}
          <div className="md:hidden">
            <MobileMenu navLinks={loggedOutNavLinks} />
          </div>
        </Unauthenticated>

        <Authenticated>
          {/* Menu Desktop para Logados */}
          <nav className="hidden md:flex items-center gap-6">
            {loggedInNavLinks.map(link => (
              <Link key={link.href} href={link.href} className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-4">
            <UserButton afterSignOutUrl="/" />
          </div>
          {/* Menu Mobile para Logados */}
          <div className="md:hidden">
            <MobileMenu navLinks={loggedInNavLinks} />
          </div>
        </Authenticated>
      </div>
    </header>
  );
}