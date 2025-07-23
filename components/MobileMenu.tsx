"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Plus, Menu } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  // Só renderiza o portal no client
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
          </>,
          document.body
        )}
    </div>
  );
}