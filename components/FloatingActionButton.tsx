// components/FloatingActionButton.tsx - CRIAR NOVO ARQUIVO
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Zap, Receipt, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FloatingActionButtonProps {
  onQuickSale: () => void;
  onQuickExpense: () => void;
  onAddProduct: () => void;
}

export function FloatingActionButton({
  onQuickSale,
  onQuickExpense,
  onAddProduct
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      icon: <Zap className="w-5 h-5" />,
      label: "Venda Rápida",
      onClick: onQuickSale,
      color: "bg-emerald-600 hover:bg-emerald-700",
    },
    {
      icon: <Receipt className="w-5 h-5" />,
      label: "Gasto Rápido",
      onClick: onQuickExpense,
      color: "bg-red-600 hover:bg-red-700",
    },
    {
      icon: <Package className="w-5 h-5" />,
      label: "Novo Produto",
      onClick: onAddProduct,
      color: "bg-purple-600 hover:bg-purple-700",
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40 md:hidden">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-16 right-0 space-y-3"
          >
            {actions.map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 justify-end"
              >
                <span className="bg-gray-900 text-white px-3 py-1 rounded-full text-sm whitespace-nowrap">
                  {action.label}
                </span>
                <Button
                  size="icon"
                  onClick={() => {
                    action.onClick();
                    setIsOpen(false);
                  }}
                  className={`${action.color} rounded-full w-12 h-12 shadow-lg`}
                >
                  {action.icon}
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`rounded-full w-14 h-14 shadow-xl flex items-center justify-center transition-all ${
          isOpen
            ? "bg-gray-800 rotate-45"
            : "bg-gradient-to-r from-blue-600 to-purple-600"
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Plus className="w-6 h-6 text-white" />
        )}
      </motion.button>
    </div>
  );
}