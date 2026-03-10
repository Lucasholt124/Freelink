"use client";

import { useState, useMemo, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ShoppingCart, Search, ScanLine, Plus, Minus, Trash2,
  DollarSign, Loader2, User, CreditCard, Calendar
} from "lucide-react";
import { BarcodeScanner } from "./BarcodeScanner";

interface PDVSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Doc<"products">[];
  customers: Doc<"customers">[];
  businessId?: Id<"businesses">;
}

interface CartItem {
  product: Doc<"products">;
  quantity: number;
}

export function PDVSaleModal({ isOpen, onClose, products, customers, businessId }: PDVSaleModalProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [discount, setDiscount] = useState("");
  const [customerId, setCustomerId] = useState<string>("none");
  const [paymentMethod, setPaymentMethod] = useState("pix");

  // Data atual de Brasília (padrão YYYY-MM-DD)
  const [date, setDate] = useState(() => {
    const now = new Date();
    const brazilTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    return `${brazilTime.getFullYear()}-${String(brazilTime.getMonth() + 1).padStart(2, "0")}-${String(brazilTime.getDate()).padStart(2, "0")}`;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const addPDVSale = useMutation(api.profitCalculator.addPDVSale);

  // Limpa o modal ao fechar
  useEffect(() => {
    if (!isOpen) {
      setCart([]);
      setSearchTerm("");
      setDiscount("");
      setCustomerId("none");
      setIsScanning(false);
    }
  }, [isOpen]);

  // ==========================================
  // LÓGICA DO CARRINHO
  // ==========================================
  const addToCart = (product: Doc<"products">) => {
    if (!product.active) {
      toast.error("Este produto está inativo.");
      return;
    }

    setCart((prev) => {
      const existing = prev.find(item => item.product._id === product._id);

      // Valida estoque
      const currentQty = existing ? existing.quantity : 0;
      if (product.stock !== undefined && currentQty + 1 > product.stock) {
        toast.error(`Estoque insuficiente! Só restam ${product.stock} unidades.`);
        return prev;
      }

      if (existing) {
        return prev.map(item =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });

    setSearchTerm("");
  };

  const updateQuantity = (productId: Id<"products">, delta: number) => {
    setCart((prev) => prev.map(item => {
      if (item.product._id === productId) {
        const newQty = item.quantity + delta;
        if (newQty < 1) return item;
        if (item.product.stock !== undefined && newQty > item.product.stock) {
          toast.error(`Máximo disponível: ${item.product.stock}`);
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: Id<"products">) => {
    setCart((prev) => prev.filter(item => item.product._id !== productId));
  };

  // ==========================================
  // LÓGICA DO SCANNER DE CÓDIGO DE BARRAS
  // ==========================================
  const handleScan = (barcode: string) => {
    // Procura o produto pelo código de barras ou SKU
    const foundProduct = products.find(p =>
      (p.barcode && p.barcode === barcode) ||
      (p.sku && p.sku.toLowerCase() === barcode.toLowerCase())
    );

    if (foundProduct) {
      addToCart(foundProduct);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]); // Vibração dupla de sucesso!
      }
      toast.success(`Adicionado: ${foundProduct.name}`);
    } else {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(400); // Vibração longa de erro
      }
      toast.error(`Código não encontrado: ${barcode}`);
    }

    // Fecha a câmera após o bipe
    setIsScanning(false);
  };

  // ==========================================
  // CÁLCULOS TOTAIS
  // ==========================================
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.product.salePrice * item.quantity), 0);
  }, [cart]);

  const discountValue = parseFloat(discount) || 0;
  const total = Math.max(0, subtotal - discountValue);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  // ==========================================
  // FINALIZAR VENDA
  // ==========================================
  const handleCheckout = async () => {
    if (cart.length === 0) return toast.error("O carrinho está vazio!");

    setIsSubmitting(true);
    try {
      const items = cart.map(item => ({
        productId: item.product._id,
        productName: item.product.name,
        quantity: item.quantity,
        costPrice: item.product.costPrice,
        salePrice: item.product.salePrice,
      }));

      await addPDVSale({
        businessId,
        customerId: customerId !== "none" ? (customerId as Id<"customers">) : undefined,
        items,
        discount: discountValue > 0 ? discountValue : undefined,
        date,
        paymentMethod,
        paymentStatus: "paid", // Assumindo que foi pago na hora. (Pode virar select depois se ela vender fiado)
        notes: "Venda via PDV Rápido",
      });

      toast.success("🛒 Venda finalizada com sucesso!");
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao finalizar venda");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtragem de Busca
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const lower = searchTerm.toLowerCase();
    return products.filter(p =>
      p.active && (
        p.name.toLowerCase().includes(lower) ||
        (p.sku && p.sku.toLowerCase().includes(lower))
      )
    ).slice(0, 5); // Mostra os 5 primeiros
  }, [searchTerm, products]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
<DialogContent className="w-full max-w-5xl h-[100dvh] sm:h-auto sm:max-h-[90vh] p-0 flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between shadow-md z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-white text-xl font-black">Frente de Caixa</DialogTitle>
              <DialogDescription className="text-blue-100 text-xs">PDV Ágil com Leitor de Código</DialogDescription>
            </div>
          </div>
        </div>

        {/* CORPO DIVIDIDO EM 2 COLUNAS NO DESKTOP */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

          {/* ESQUERDA: Busca, Câmera e Carrinho */}
          <div className="flex-1 flex flex-col border-r border-gray-200 bg-white overflow-hidden">

            {/* Controles do Topo (Busca e Câmera) */}
            <div className="p-4 border-b border-gray-100 shrink-0 space-y-3">
              {isScanning ? (
                <div className="bg-slate-900 rounded-xl overflow-hidden relative">
                  <BarcodeScanner onScan={handleScan} />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsScanning(false)}
                    className="absolute top-2 right-2 z-20"
                  >
                    Fechar Câmera
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="Buscar por nome ou SKU..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-12 text-lg bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />

                    {/* Resultados da Busca Flutuantes */}
                    {searchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 shadow-xl rounded-xl z-50 overflow-hidden">
                        {searchResults.map(p => (
                          <div
                            key={p._id}
                            onClick={() => addToCart(p)}
                            className="p-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center border-b border-gray-50 last:border-0"
                          >
                            <div>
                              <p className="font-bold text-gray-800">{p.name}</p>
                              <p className="text-xs text-gray-500">{p.stock !== undefined ? `${p.stock} no estoque` : 'Estoque não controlado'}</p>
                            </div>
                            <span className="font-bold text-emerald-600">{formatCurrency(p.salePrice)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => setIsScanning(true)}
                    className="h-12 px-4 bg-indigo-600 hover:bg-indigo-700 shadow-md flex items-center gap-2"
                  >
                    <ScanLine className="w-5 h-5" />
                    <span className="hidden sm:inline">Bipar (Câmera)</span>
                  </Button>
                </div>
              )}
            </div>

            {/* Lista do Carrinho */}
            <ScrollArea className="flex-1 p-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 py-10">
                  <ShoppingCart className="w-16 h-16 mb-4 opacity-50" />
                  <p className="font-medium text-lg">Carrinho vazio</p>
                  <p className="text-sm">Busque um produto ou use a câmera para começar</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {cart.map((item) => (
                      <motion.div
                        key={item.product._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white border border-gray-100 shadow-sm rounded-xl p-3 flex items-center justify-between"
                      >
                        <div className="flex-1 pr-3 min-w-0">
                          <p className="font-bold text-gray-800 truncate">{item.product.name}</p>
                          <p className="text-emerald-600 font-bold text-sm">{formatCurrency(item.product.salePrice)}</p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {/* Controles de Quantidade */}
                          <div className="flex items-center bg-gray-100 rounded-lg p-1">
                            <button onClick={() => updateQuantity(item.product._id, -1)} className="p-1 hover:bg-white rounded shadow-sm text-gray-600">
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.product._id, 1)} className="p-1 hover:bg-white rounded shadow-sm text-gray-600">
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="w-20 text-right font-black text-gray-900 hidden sm:block">
                            {formatCurrency(item.product.salePrice * item.quantity)}
                          </p>
                          <Button size="icon" variant="ghost" className="text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => removeFromCart(item.product._id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </ScrollArea>
          </div>

          {/* DIREITA: Pagamento e Finalização */}
          <div className="w-full md:w-[350px] lg:w-[400px] bg-gray-50 flex flex-col shrink-0">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* Cliente */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-gray-700">
                  <User className="w-4 h-4" /> Cliente (Opcional)
                </Label>
                <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Selecionar cliente..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Consumidor Final (Sem cadastro)</SelectItem>
                    {customers.map(c => (
                      <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Data e Pagamento */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4" /> Data
                  </Label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-white" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-700">
                    <CreditCard className="w-4 h-4" /> Forma
                  </Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                      <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                      <SelectItem value="cash">Dinheiro</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Resumo de Valores */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 space-y-4">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal ({cart.reduce((a,b)=>a+b.quantity,0)} itens)</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-500 whitespace-nowrap">Desconto R$</span>
                  <Input
                    type="number"
                    placeholder="0,00"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="w-24 text-right bg-gray-50 text-red-500 font-bold focus:border-red-400 focus:ring-red-400"
                  />
                </div>

                <div className="pt-4 border-t border-dashed border-gray-200">
                  <div className="flex justify-between items-end">
                    <span className="text-lg font-bold text-gray-900">Total a Pagar</span>
                    <span className="text-3xl font-black text-emerald-600">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Botão Finalizar */}
            <div className="p-6 bg-white border-t border-gray-200 shrink-0">
              <Button
                onClick={handleCheckout}
                disabled={cart.length === 0 || isSubmitting}
                className="w-full h-14 text-lg font-black bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-600/20 rounded-xl"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-6 h-6 mr-2 animate-spin" /> Finalizando...</>
                ) : (
                  <><DollarSign className="w-6 h-6 mr-2" /> RECEBER {formatCurrency(total)}</>
                )}
              </Button>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}