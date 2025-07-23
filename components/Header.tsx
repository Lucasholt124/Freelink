"use client";

import { SignInButton, UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import Link from "next/link";
import { Button } from "./ui/button";
import { Plus, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

// Menu mobile hamburguer (abre/fecha fixo no topo)
function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden relative">
      <button
        aria-label="Abrir menu"
        className="p-2 rounded-lg border border-gray-200 bg-white/80 hover:bg-gray-100 transition"
        onClick={() => setOpen((v) => !v)}
      >
        <Menu className="w-6 h-6 text-purple-600" />
      </button>
      {open && (
        <>
          {/* Overlay escuro para fechar ao clicar fora */}
          <div
            className="fixed inset-0 z-[9998] bg-black/30"
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
          />
          <div
            className="fixed top-0 left-0 right-0 z-[9999] bg-white border-b border-gray-200 shadow-lg flex flex-col p-4 gap-3 animate-fade-in"
            style={{ minHeight: 120 }}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-xl font-bold text-purple-600">Menu</span>
              <button
                aria-label="Fechar menu"
                className="p-2 rounded-lg hover:bg-gray-100 transition"
                onClick={() => setOpen(false)}
              >
                <span className="text-2xl font-bold">&times;</span>
              </button>
            </div>
            <Link
              href="/dashboard/new-link"
              className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition"
              aria-label="Adicionar link"
              onClick={() => setOpen(false)}
            >
              <Plus className="w-4 h-4" />
              Adicionar link
            </Link>
            <Link
              href="/dashboard/billing"
              className="px-3 py-2 rounded-lg font-medium text-purple-600 border border-purple-600 hover:bg-purple-600 hover:text-white transition"
              aria-label="Cobrança"
              onClick={() => setOpen(false)}
            >
              Cobrança
            </Link>
            <div className="px-3 py-2">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Header({ isFixed = false }: { isFixed?: boolean }) {
  return (
    <header
      className={cn(
        "bg-white/80 backdrop-blur-sm border-b border-white/20 shadow-sm",
        isFixed && "sticky top-0 z-50"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 xl:px-2 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="text-2xl font-extrabold tracking-tight flex items-center gap-1 select-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-purple-500 transition"
          aria-label="Ir para o dashboard"
        >
          Free
          <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            link
          </span>
        </Link>

        {/* Desktop menu */}
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
          {/* Mobile menu hamburguer */}
          <MobileMenu />
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