// Em /components/MobileMenu.tsx
// (Substitua o arquivo inteiro)

"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Plus, Menu, X } from "lucide-react";
import { UserButton, SignInButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import { Button } from "./ui/button";

// Tipagem para os links de navegação recebidos do Header
interface NavLink {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface MobileMenuProps {
  navLinks: NavLink[];
}

export function MobileMenu({ navLinks }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Evita renderização no servidor onde 'window' não existe
  if (typeof window === "undefined") return null;

  return (
    <div className="md:hidden relative">
      <button
        aria-label="Abrir menu"
        className="p-2"
        onClick={() => setOpen(true)}
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      {open &&
        createPortal(
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-sm"
              onClick={() => setOpen(false)}
              aria-label="Fechar menu"
            />

            {/* Conteúdo do Menu */}
            <div
              className="fixed top-0 left-0 right-0 z-[9999] bg-white border-b shadow-lg flex flex-col p-4 gap-2"
              style={{ animation: "slideDown 0.3s ease-out" }}
            >
              <div className="flex justify-between items-center mb-2">
                 <Link href="/" className="text-xl font-bold tracking-tight text-gray-900" onClick={() => setOpen(false)}>
                    Freelinnk<span className="text-purple-600">.</span>
                 </Link>
                <button
                  aria-label="Fechar menu"
                  className="p-2"
                  onClick={() => setOpen(false)}
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* Mapeando os links de navegação recebidos */}
              <nav>
                <ul>
                  {navLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="flex items-center gap-3 px-3 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition"
                        onClick={() => setOpen(false)}
                      >
                        {link.icon}
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Ações específicas de autenticação */}
              <div className="border-t mt-2 pt-3 space-y-3">
                <Authenticated>
                    <Link
                      href="/dashboard/new-link"
                      className="flex items-center justify-center gap-2 px-3 py-3 rounded-lg font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                      onClick={() => setOpen(false)}
                    >
                      <Plus className="w-5 h-5" /> Adicionar Link
                    </Link>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                       <p className="text-sm font-medium text-gray-700">Minha Conta</p>
                       <UserButton afterSignOutUrl="/" />
                    </div>
                </Authenticated>
                <Unauthenticated>
                    <SignInButton mode="modal">
                        <Button className="w-full">Comece Grátis</Button>
                    </SignInButton>
                </Unauthenticated>
              </div>

            </div>
          </>,
          document.body
        )}
      {/* CSS para a animação */}
      <style jsx global>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}