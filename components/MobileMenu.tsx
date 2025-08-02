"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Plus, Menu, X } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

// Tipagem para os links de navegação recebidos do Header
interface NavLink {
  href: string;
  label: string;
  icon: React.ReactNode;
  pro?: boolean;
}

interface MobileMenuProps {
  navLinks: NavLink[];
  plan: "free" | "pro" | "ultra";
}

export function MobileMenu({ navLinks, plan }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  if (typeof window === "undefined") return null;

  return (
    <div className="sm:hidden relative">
      <button
        aria-label="Abrir menu"
        className="p-2 rounded-lg border border-gray-200 bg-white/80 hover:bg-gray-100 transition"
        onClick={() => setOpen((v) => !v)}
      >
        <Menu className="w-6 h-6 text-purple-600" />
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

            {/* --- SEU DESIGN ORIGINAL DO MENU MOBILE RESTAURADO E MELHORADO --- */}
            <div
              className="fixed top-0 left-0 right-0 z-[9999] bg-white border-b border-gray-200 shadow-lg flex flex-col p-4 gap-3"
              style={{ animation: "fadeInDown 0.3s ease-out" }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xl font-bold text-purple-600">Menu</span>
                <button
                  aria-label="Fechar menu"
                  className="p-2 rounded-lg hover:bg-gray-100 transition"
                  onClick={() => setOpen(false)}
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* Mapeando os links de navegação principais */}
              {navLinks.map((link) => {
                if (link.pro && plan !== "ultra") return null;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition"
                    onClick={() => setOpen(false)}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                );
              })}

              <div className="border-t border-gray-200 mt-2 pt-4 space-y-3">
                <Link
                  href="/dashboard/new-link"
                  className="flex items-center justify-center gap-2 px-3 py-3 rounded-lg font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90 transition"
                  onClick={() => setOpen(false)}
                >
                  <Plus className="w-5 h-5" />
                  Adicionar Link
                </Link>
                <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                   <p className="text-sm font-medium text-gray-700">Minha Conta</p>
                   <UserButton afterSignOutUrl="/" />
                </div>
              </div>
            </div>
          </>,
          document.body
        )}
      {/* CSS para a animação */}
      <style jsx global>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}