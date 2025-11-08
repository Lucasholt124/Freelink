"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import {
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  Receipt,
  Calendar,
  Plus,
  Trash2,
  BarChart3,
  PieChart,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Target,
  AlertCircle,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

// =================================================================
// 🎯 TIPOS E CONSTANTES
// =================================================================

const EXPENSE_CATEGORIES = [
  { value: "aluguel", label: "Aluguel", icon: "🏢", color: "blue" },
  { value: "luz_agua", label: "Luz e Água", icon: "💡", color: "yellow" },
  { value: "internet", label: "Internet", icon: "📡", color: "purple" },
  { value: "transporte", label: "Transporte", icon: "🚗", color: "green" },
  { value: "alimentacao", label: "Alimentação", icon: "🍔", color: "orange" },
  { value: "marketing", label: "Marketing", icon: "📢", color: "pink" },
  { value: "materiais", label: "Materiais", icon: "📦", color: "indigo" },
  { value: "funcionarios", label: "Funcionários", icon: "👥", color: "cyan" },
  { value: "outros", label: "Outros", icon: "📝", color: "gray" },
] as const;

type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]["value"];

// =================================================================
// 🎨 COMPONENTE PRINCIPAL
// =================================================================

export default function FinancialManagerComponent() {
  // Estado do mês selecionado
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const [activeTab, setActiveTab] = useState<"produtos" | "vendas" | "gastos" | "resumo">("resumo");

  // Dialogs
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddSale, setShowAddSale] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);

  // Formulários
  const [productForm, setProductForm] = useState({
    name: "",
    costPrice: "",
    salePrice: "",
    category: "",
    stock: "",
  });

  const [saleForm, setSaleForm] = useState({
    productId: "",
    quantity: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [expenseForm, setExpenseForm] = useState({
    description: "",
    amount: "",
    category: "outros" as ExpenseCategory,
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  // Queries
  const products = useQuery(api.profitCalculator.getProducts, { activeOnly: false }) ?? [];
  const activeProducts = products.filter((p) => p.active);
  const sales = useQuery(api.profitCalculator.getSalesByMonth, { month: selectedMonth }) ?? [];
  const expenses = useQuery(api.profitCalculator.getExpensesByMonth, { month: selectedMonth }) ?? [];
  const monthlyReport = useQuery(api.profitCalculator.getMonthlyReport, { month: selectedMonth });
  const allMonths = useQuery(api.profitCalculator.getAllMonths) ?? [];

  // Mutations
  const addProduct = useMutation(api.profitCalculator.addProduct);
  const deleteProduct = useMutation(api.profitCalculator.deleteProduct);
  const addSale = useMutation(api.profitCalculator.addSale);
  const deleteSale = useMutation(api.profitCalculator.deleteSale);
  const addExpense = useMutation(api.profitCalculator.addExpense);
  const deleteExpense = useMutation(api.profitCalculator.deleteExpense);
  const generateReport = useAction(api.profitCalculator.generateMonthlyReport);

  // Auto-gerar relatório quando mudar de mês ou dados
  useEffect(() => {
    if (sales.length > 0 || expenses.length > 0) {
      generateReport({ month: selectedMonth }).catch(() => {});
    }
  }, [selectedMonth, sales.length, expenses.length, generateReport]);

  // =================================================================
  // 🧮 FUNÇÕES AUXILIARES
  // =================================================================

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
  };

  const getCurrentMonthName = () => {
    const [year, month] = selectedMonth.split("-");
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const date = new Date(year, month - 1);
    date.setMonth(date.getMonth() + (direction === "next" ? 1 : -1));
    const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    setSelectedMonth(newMonth);
  };

  // =================================================================
  // 🎯 HANDLERS - PRODUTOS
  // =================================================================

  const handleAddProduct = async () => {
    if (!productForm.name.trim() || !productForm.costPrice || !productForm.salePrice) {
      toast.error("Preencha todos os campos obrigatórios!");
      return;
    }

    try {
      await addProduct({
        name: productForm.name,
        costPrice: parseFloat(productForm.costPrice),
        salePrice: parseFloat(productForm.salePrice),
        category: productForm.category || undefined,
        stock: productForm.stock ? parseInt(productForm.stock) : undefined,
      });

      toast.success("✅ Produto cadastrado!");
      setShowAddProduct(false);
      setProductForm({ name: "", costPrice: "", salePrice: "", category: "", stock: "" });
    } catch (error) {
      toast.error("Erro ao cadastrar produto");
      console.error(error);
    }
  };

  const handleDeleteProduct = async (id: Id<"products">) => {
    try {
      await deleteProduct({ id });
      toast.success("🗑️ Produto deletado!");
    } catch {
      toast.error("Erro ao deletar produto");
    }
  };

  // =================================================================
  // 🎯 HANDLERS - VENDAS
  // =================================================================

  const handleAddSale = async () => {
    if (!saleForm.productId || !saleForm.quantity || !saleForm.date) {
      toast.error("Preencha todos os campos!");
      return;
    }

    try {
      await addSale({
        productId: saleForm.productId as Id<"products">,
        quantity: parseInt(saleForm.quantity),
        date: saleForm.date,
        notes: saleForm.notes || undefined,
      });

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10B981", "#3B82F6", "#F59E0B"],
      });

      toast.success("🎉 Venda registrada!");
      setShowAddSale(false);
      setSaleForm({ productId: "", quantity: "", date: new Date().toISOString().split("T")[0], notes: "" });
    } catch (error) {
      toast.error("Erro ao registrar venda");
      console.error(error);
    }
  };

  const handleDeleteSale = async (id: Id<"sales">) => {
    try {
      await deleteSale({ id });
      toast.success("🗑️ Venda deletada!");
    } catch {
      toast.error("Erro ao deletar venda");
    }
  };

  // =================================================================
  // 🎯 HANDLERS - GASTOS
  // =================================================================

  const handleAddExpense = async () => {
    if (!expenseForm.description.trim() || !expenseForm.amount || !expenseForm.date) {
      toast.error("Preencha todos os campos!");
      return;
    }

    try {
      await addExpense({
        description: expenseForm.description,
        amount: parseFloat(expenseForm.amount),
        category: expenseForm.category,
        date: expenseForm.date,
        notes: expenseForm.notes || undefined,
      });

      toast.success("✅ Gasto registrado!");
      setShowAddExpense(false);
      setExpenseForm({
        description: "",
        amount: "",
        category: "outros",
        date: new Date().toISOString().split("T")[0],
        notes: "",
      });
    } catch (error) {
      toast.error("Erro ao registrar gasto");
      console.error(error);
    }
  };

  const handleDeleteExpense = async (id: Id<"expenses">) => {
    try {
      await deleteExpense({ id });
      toast.success("🗑️ Gasto deletado!");
    } catch {
      toast.error("Erro ao deletar gasto");
    }
  };

  // =================================================================
  // 🎨 RENDERIZAÇÃO
  // =================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 pb-12">
      {/* Background decorativo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                💼 Gestão Financeira
              </h1>
              <p className="text-gray-600 mt-1">Controle simples e automático do seu negócio</p>
            </div>
          </div>

          {/* Seletor de Mês */}
          <Card className="p-4 bg-white/80 backdrop-blur-sm border-2">
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth("prev")}
                className="h-10 w-10"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>

              <div className="flex-1 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h2 className="text-xl font-bold capitalize">{getCurrentMonthName()}</h2>
                </div>
                {allMonths.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {allMonths.length} {allMonths.length === 1 ? "mês" : "meses"} registrados
                  </p>
                )}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth("next")}
                className="h-10 w-10"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Cards de Resumo Rápido */}
        {monthlyReport && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
          >
            {/* Receita Total */}
            <Card className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart className="w-5 h-5" />
                <p className="text-sm font-medium opacity-90">Receita</p>
              </div>
              <p className="text-2xl font-black">{formatCurrency(monthlyReport.totalRevenue)}</p>
              <p className="text-xs opacity-75 mt-1">{monthlyReport.totalSales} vendas</p>
            </Card>

            {/* Gastos */}
            <Card className="p-4 bg-gradient-to-br from-red-500 to-red-600 border-0 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Receipt className="w-5 h-5" />
                <p className="text-sm font-medium opacity-90">Gastos</p>
              </div>
              <p className="text-2xl font-black">{formatCurrency(monthlyReport.totalExpenses)}</p>
              <p className="text-xs opacity-75 mt-1">{expenses.length} registros</p>
            </Card>

            {/* Lucro Líquido */}
            <Card
              className={`p-4 border-0 text-white ${
                monthlyReport.netProfit >= 0
                  ? "bg-gradient-to-br from-emerald-500 to-emerald-600"
                  : "bg-gradient-to-br from-orange-500 to-orange-600"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {monthlyReport.netProfit >= 0 ? (
                  <TrendingUp className="w-5 h-5" />
                ) : (
                  <TrendingDown className="w-5 h-5" />
                )}
                <p className="text-sm font-medium opacity-90">Lucro Líquido</p>
              </div>
              <p className="text-2xl font-black">{formatCurrency(monthlyReport.netProfit)}</p>
              <p className="text-xs opacity-75 mt-1">Margem: {monthlyReport.profitMargin.toFixed(1)}%</p>
            </Card>

            {/* Produtos */}
            <Card className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 border-0 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5" />
                <p className="text-sm font-medium opacity-90">Produtos</p>
              </div>
              <p className="text-2xl font-black">{activeProducts.length}</p>
              <p className="text-xs opacity-75 mt-1">cadastrados</p>
            </Card>
          </motion.div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="space-y-6">
          <TabsList className="grid grid-cols-4 max-w-2xl mx-auto bg-white shadow-lg h-auto p-1">
            <TabsTrigger
              value="resumo"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white py-3"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Resumo</span>
            </TabsTrigger>
            <TabsTrigger
              value="produtos"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white py-3"
            >
              <Package className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Produtos</span>
            </TabsTrigger>
            <TabsTrigger
              value="vendas"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-green-600 data-[state=active]:text-white py-3"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Vendas</span>
            </TabsTrigger>
            <TabsTrigger
              value="gastos"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-600 data-[state=active]:text-white py-3"
            >
              <Receipt className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Gastos</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB: RESUMO */}
          <TabsContent value="resumo">
            {!monthlyReport || (sales.length === 0 && expenses.length === 0) ? (
              <Card className="p-12 text-center border-2 border-dashed">
                <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  Comece a usar agora!
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Cadastre seus produtos, registre suas vendas e gastos. O sistema calcula tudo automaticamente!
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button onClick={() => setActiveTab("produtos")} className="bg-purple-600 hover:bg-purple-700">
                    <Package className="w-4 h-4 mr-2" />
                    Cadastrar Produtos
                  </Button>
                  <Button onClick={() => setActiveTab("vendas")} className="bg-emerald-600 hover:bg-emerald-700">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Registrar Vendas
                  </Button>
                  <Button onClick={() => setActiveTab("gastos")} className="bg-red-600 hover:bg-red-700">
                    <Receipt className="w-4 h-4 mr-2" />
                    Adicionar Gastos
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Análise Geral */}
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl">Análise do Mês</h3>
                      <p className="text-sm text-gray-600">Resultado financeiro de {getCurrentMonthName()}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Receita Bruta */}
                    <div className="bg-white rounded-xl p-4 border-2 border-blue-200">
                      <p className="text-sm text-gray-600 mb-2">Receita das Vendas</p>
                      <p className="text-2xl font-bold text-blue-600 mb-1">
                        {formatCurrency(monthlyReport.totalRevenue)}
                      </p>
                      <p className="text-xs text-gray-500">Custo: {formatCurrency(monthlyReport.totalCost)}</p>
                      <Separator className="my-2" />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Lucro Bruto:</span>
                        <span className="font-bold text-emerald-600">
                          {formatCurrency(monthlyReport.grossProfit)}
                        </span>
                      </div>
                    </div>

                    {/* Gastos */}
                    <div className="bg-white rounded-xl p-4 border-2 border-red-200">
                      <p className="text-sm text-gray-600 mb-2">Total de Gastos</p>
                      <p className="text-2xl font-bold text-red-600 mb-1">
                        {formatCurrency(monthlyReport.totalExpenses)}
                      </p>
                      <p className="text-xs text-gray-500">{expenses.length} registros</p>
                      <Separator className="my-2" />
                      <div className="space-y-1">
                        {Object.entries(monthlyReport.expensesByCategory)
                          .filter(([, value]) => (value as number) > 0)
                          .sort(([, a], [, b]) => (b as number) - (a as number))
                          .slice(0, 2)
                          .map(([cat, value]) => {
                            const category = EXPENSE_CATEGORIES.find((c) => c.value === cat);
                            return (
                              <div key={cat} className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">
                                  {category?.icon} {category?.label}:
                                </span>
                                <span className="font-semibold">{formatCurrency(value as number)}</span>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    {/* Lucro Líquido */}
                    <div
                      className={`rounded-xl p-4 border-2 ${
                        monthlyReport.netProfit >= 0
                          ? "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200"
                          : "bg-gradient-to-br from-orange-50 to-red-50 border-orange-200"
                      }`}
                    >
                      <p className="text-sm text-gray-600 mb-2">Lucro Líquido</p>
                      <p
                        className={`text-2xl font-bold mb-1 ${
                          monthlyReport.netProfit >= 0 ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {formatCurrency(monthlyReport.netProfit)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Margem: {monthlyReport.profitMargin.toFixed(1)}%
                      </p>
                      <Separator className="my-2" />
                      <div className="flex items-center gap-2">
                        {monthlyReport.netProfit >= 0 ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span className="text-xs font-semibold text-emerald-700">
                              Mês lucrativo! 🎉
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 text-orange-600" />
                            <span className="text-xs font-semibold text-orange-700">
                              Atenção aos gastos
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Top Produtos */}
                {monthlyReport.topProducts.length > 0 && (
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Zap className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Produtos Mais Vendidos</h3>
                        <p className="text-xs text-gray-500">Top performance do mês</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {monthlyReport.topProducts.slice(0, 5).map((product, index) => (
                        <motion.div
                          key={product.productId}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg"
                        >
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold">
                              {index + 1}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{product.productName}</p>
                            <p className="text-xs text-gray-500">
                              {product.quantity} {product.quantity === 1 ? "venda" : "vendas"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-emerald-600">{formatCurrency(product.profit)}</p>
                            <p className="text-xs text-gray-500">de lucro</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Gastos por Categoria */}
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <PieChart className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Gastos por Categoria</h3>
                      <p className="text-xs text-gray-500">Distribuição dos custos</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {Object.entries(monthlyReport.expensesByCategory)
                      .filter(([, value]) => (value as number) > 0)
                      .sort(([, a], [, b]) => (b as number) - (a as number))
                      .map(([cat, value]) => {
                        const category = EXPENSE_CATEGORIES.find((c) => c.value === cat);
                        const percentage = ((value as number) / monthlyReport.totalExpenses) * 100;
                        return (
                          <div key={cat}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span>{category?.icon}</span>
                                <span className="text-sm font-medium">{category?.label}</span>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-gray-900">{formatCurrency(value as number)}</p>
                                <p className="text-xs text-gray-500">{percentage.toFixed(1)}%</p>
                              </div>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        );
                      })}
                  </div>
                </Card>

                {/* Comparação com Meses Anteriores */}
                {allMonths.length > 1 && (
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Evolução Mensal</h3>
                        <p className="text-xs text-gray-500">Últimos meses</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      {allMonths.slice(0, 6).map((month) => {
                        const [year, monthNum] = month.month.split("-");
                        const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString(
                          "pt-BR",
                          { month: "short", year: "2-digit" }
                        );
                        const isCurrentMonth = month.month === selectedMonth;

                        return (
                          <div
                            key={month.month}
                            className={`p-4 rounded-lg border-2 ${
                              isCurrentMonth
                                ? "bg-gradient-to-br from-blue-50 to-purple-50 border-blue-300"
                                : "bg-gray-50 border-gray-200"
                            }`}
                          >
                            <p className="text-xs font-semibold text-gray-600 uppercase mb-2">
                              {monthName}
                            </p>
                            <p
                              className={`text-lg font-bold ${
                                month.netProfit >= 0 ? "text-emerald-600" : "text-red-600"
                              }`}
                            >
                              {formatCurrency(month.netProfit)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Margem: {month.profitMargin.toFixed(1)}%
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          {/* TAB: PRODUTOS */}
          <TabsContent value="produtos">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Seus Produtos</h3>
                  <p className="text-sm text-gray-500">
                    {activeProducts.length} produto{activeProducts.length !== 1 ? "s" : ""} ativo
                    {activeProducts.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Produto
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>➕ Cadastrar Novo Produto</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label>Nome do Produto *</Label>
                        <Input
                          placeholder="Ex: Camiseta Básica"
                          value={productForm.name}
                          onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Preço de Custo (quanto pagou) *</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0,00"
                              className="pl-10"
                              value={productForm.costPrice}
                              onChange={(e) => setProductForm({ ...productForm, costPrice: e.target.value })}
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Preço de Venda *</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0,00"
                              className="pl-10"
                              value={productForm.salePrice}
                              onChange={(e) => setProductForm({ ...productForm, salePrice: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Categoria (opcional)</Label>
                          <Input
                            placeholder="Ex: Roupas"
                            value={productForm.category}
                            onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Estoque (opcional)</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={productForm.stock}
                            onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                          />
                        </div>
                      </div>

                      {productForm.costPrice && productForm.salePrice && (
                        <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                          <p className="text-sm text-gray-600 mb-1">Lucro por unidade:</p>
                          <p className="text-xl font-bold text-emerald-600">
                            {formatCurrency(
                              parseFloat(productForm.salePrice || "0") - parseFloat(productForm.costPrice || "0")
                            )}
                          </p>
                        </div>
                      )}

                      <Button onClick={handleAddProduct} className="w-full bg-purple-600 hover:bg-purple-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Cadastrar Produto
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {products.length === 0 ? (
                <Card className="p-12 text-center border-2 border-dashed">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-bold text-gray-700 mb-2">Nenhum produto cadastrado</h3>
                  <p className="text-gray-500 mb-6">
                    Cadastre os produtos que você vende para começar a controlar seus lucros
                  </p>
                  <Button
                    onClick={() => setShowAddProduct(true)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Cadastrar Primeiro Produto
                  </Button>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => {
                    const profit = product.salePrice - product.costPrice;
                    const profitMargin = (profit / product.salePrice) * 100;

                    return (
                      <motion.div
                        key={product._id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -4 }}
                      >
                        <Card
                          className={`p-4 ${
                            product.active
                              ? "border-2 border-purple-200 hover:border-purple-400"
                              : "opacity-60 border-2 border-gray-200"
                          } transition-all`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-900 mb-1">{product.name}</h4>
                              {product.category && (
                                <Badge variant="outline" className="text-xs">
                                  {product.category}
                                </Badge>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-red-500"
                                onClick={() => handleDeleteProduct(product._id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-2 text-sm mb-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Custo:</span>
                              <span className="font-semibold">{formatCurrency(product.costPrice)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Venda:</span>
                              <span className="font-semibold">{formatCurrency(product.salePrice)}</span>
                            </div>
                            {product.stock !== undefined && product.stock !== null && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Estoque:</span>
                                <span
                                  className={`font-semibold ${
                                    product.stock <= 5 ? "text-red-600" : "text-gray-900"
                                  }`}
                                >
                                  {product.stock} unidades
                                </span>
                              </div>
                            )}
                          </div>

                          <Separator className="my-3" />

                          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-3 border border-emerald-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-gray-600">Lucro/unidade:</p>
                                <p className="text-lg font-bold text-emerald-600">{formatCurrency(profit)}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-600">Margem:</p>
                                <p className="text-lg font-bold text-emerald-600">{profitMargin.toFixed(1)}%</p>
                              </div>
                            </div>
                          </div>

                          {!product.active && (
                            <div className="mt-3 p-2 bg-gray-100 rounded text-center">
                              <p className="text-xs text-gray-600">Produto inativo</p>
                            </div>
                          )}
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* TAB: VENDAS */}
          <TabsContent value="vendas">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Vendas de {getCurrentMonthName()}</h3>
                  <p className="text-sm text-gray-500">
                    {sales.length} venda{sales.length !== 1 ? "s" : ""} registrada
                    {sales.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <Dialog open={showAddSale} onOpenChange={setShowAddSale}>
                  <DialogTrigger asChild>
                    <Button
                      className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
                      disabled={activeProducts.length === 0}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Venda
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>🛒 Registrar Venda</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label>Produto *</Label>
                        <Select value={saleForm.productId} onValueChange={(v) => setSaleForm({ ...saleForm, productId: v })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o produto" />
                          </SelectTrigger>
                          <SelectContent>
                            {activeProducts.map((p) => (
                              <SelectItem key={p._id} value={p._id}>
                                {p.name} - {formatCurrency(p.salePrice)}
                                {p.stock !== undefined && ` (${p.stock} em estoque)`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Quantidade *</Label>
                          <Input
                            type="number"
                            min="1"
                            placeholder="1"
                            value={saleForm.quantity}
                            onChange={(e) => setSaleForm({ ...saleForm, quantity: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Data da Venda *</Label>
                          <Input
                            type="date"
                            value={saleForm.date}
                            onChange={(e) => setSaleForm({ ...saleForm, date: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Observações (opcional)</Label>
                        <Input
                          placeholder="Ex: Cliente João, pagamento via PIX"
                          value={saleForm.notes}
                          onChange={(e) => setSaleForm({ ...saleForm, notes: e.target.value })}
                        />
                      </div>

                      {saleForm.productId && saleForm.quantity && (
                        <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg border-2 border-emerald-200">
                          {(() => {
                            const product = activeProducts.find((p) => p._id === saleForm.productId);
                            if (!product) return null;
                            const qty = parseInt(saleForm.quantity);
                            const totalRevenue = product.salePrice * qty;
                            const totalCost = product.costPrice * qty;
                            const profit = totalRevenue - totalCost;

                            return (
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Receita:</span>
                                  <span className="font-semibold">{formatCurrency(totalRevenue)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Custo:</span>
                                  <span className="font-semibold text-red-600">
                                    -{formatCurrency(totalCost)}
                                  </span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center">
                                  <span className="font-bold">Lucro:</span>
                                  <span className="text-xl font-black text-emerald-600">
                                    {formatCurrency(profit)}
                                  </span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      <Button onClick={handleAddSale} className="w-full bg-emerald-600 hover:bg-emerald-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Registrar Venda
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {activeProducts.length === 0 ? (
                <Card className="p-12 text-center border-2 border-dashed">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-bold text-gray-700 mb-2">Cadastre produtos primeiro</h3>
                  <p className="text-gray-500 mb-6">
                    Você precisa ter produtos cadastrados para registrar vendas
                  </p>
                  <Button onClick={() => setActiveTab("produtos")} className="bg-purple-600 hover:bg-purple-700">
                    <Package className="w-4 h-4 mr-2" />
                    Ir para Produtos
                  </Button>
                </Card>
              ) : sales.length === 0 ? (
                <Card className="p-12 text-center border-2 border-dashed">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-bold text-gray-700 mb-2">Nenhuma venda neste mês</h3>
                  <p className="text-gray-500 mb-6">Registre suas vendas para acompanhar seus lucros</p>
                  <Button
                    onClick={() => setShowAddSale(true)}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Registrar Primeira Venda
                  </Button>
                </Card>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {sales.map((sale, index) => (
                      <motion.div
                        key={sale._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="p-4 hover:shadow-lg transition-all border-2 hover:border-emerald-300">
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-gradient-to-br from-emerald-100 to-green-100 rounded-lg">
                              <ShoppingCart className="w-5 h-5 text-emerald-600" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-bold text-gray-900">{sale.productName}</h4>
                                  <p className="text-sm text-gray-500">
                                    {sale.quantity}x {formatCurrency(sale.salePrice)} • {formatDate(sale.date)}
                                  </p>
                                  {sale.notes && (
                                    <p className="text-xs text-gray-500 mt-1 italic">{sale.notes}</p>
                                  )}
                                </div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-red-500"
                                  onClick={() => handleDeleteSale(sale._id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>

                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-500 text-xs">Receita</p>
                                  <p className="font-semibold text-blue-600">
                                    {formatCurrency(sale.totalRevenue)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500 text-xs">Custo</p>
                                  <p className="font-semibold text-red-600">
                                    {formatCurrency(sale.totalCost)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500 text-xs">Lucro</p>
                                  <p className="font-bold text-emerald-600">
                                    {formatCurrency(sale.profit)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </TabsContent>

          {/* TAB: GASTOS */}
          <TabsContent value="gastos">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Gastos de {getCurrentMonthName()}</h3>
                  <p className="text-sm text-gray-500">
                    {expenses.length} gasto{expenses.length !== 1 ? "s" : ""} registrado
                    {expenses.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <Dialog open={showAddExpense} onOpenChange={setShowAddExpense}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Gasto
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>💸 Registrar Gasto</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label>Descrição *</Label>
                        <Input
                          placeholder="Ex: Conta de luz"
                          value={expenseForm.description}
                          onChange={(e) =>
                            setExpenseForm({ ...expenseForm, description: e.target.value })
                          }
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Valor *</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0,00"
                              className="pl-10"
                              value={expenseForm.amount}
                              onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Data *</Label>
                          <Input
                            type="date"
                            value={expenseForm.date}
                            onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Categoria *</Label>
                        <Select
                          value={expenseForm.category}
                          onValueChange={(v) => setExpenseForm({ ...expenseForm, category: v as ExpenseCategory })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {EXPENSE_CATEGORIES.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.icon} {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Observações (opcional)</Label>
                        <Input
                          placeholder="Ex: Vencimento dia 15"
                          value={expenseForm.notes}
                          onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                        />
                      </div>

                      <Button onClick={handleAddExpense} className="w-full bg-red-600 hover:bg-red-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Registrar Gasto
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {expenses.length === 0 ? (
                <Card className="p-12 text-center border-2 border-dashed">
                  <Receipt className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-bold text-gray-700 mb-2">Nenhum gasto neste mês</h3>
                  <p className="text-gray-500 mb-6">
                    Registre seus gastos diários para ter controle total do seu negócio
                  </p>
                  <Button
                    onClick={() => setShowAddExpense(true)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Registrar Primeiro Gasto
                  </Button>
                </Card>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {expenses
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((expense, index) => {
                        const category = EXPENSE_CATEGORIES.find((c) => c.value === expense.category);
                        return (
                          <motion.div
                            key={expense._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Card className="p-4 hover:shadow-lg transition-all border-2 hover:border-red-300">
                              <div className="flex items-start gap-4">
                                <div className="p-3 bg-gradient-to-br from-red-100 to-orange-100 rounded-lg">
                                  <Receipt className="w-5 h-5 text-red-600" />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between mb-2">
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-gray-900">{expense.description}</h4>
                                        <Badge variant="outline" className="text-xs">
                                          {category?.icon} {category?.label}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-gray-500">{formatDate(expense.date)}</p>
                                      {expense.notes && (
                                        <p className="text-xs text-gray-500 mt-1 italic">{expense.notes}</p>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <p className="text-xl font-bold text-red-600">
                                        {formatCurrency(expense.amount)}
                                      </p>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-red-500"
                                        onClick={() => handleDeleteExpense(expense._id)}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          </motion.div>
                        );
                      })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}