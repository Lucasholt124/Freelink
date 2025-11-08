"use client";

import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
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
  Edit,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Target,
  AlertCircle,
  CheckCircle2,
  Settings,
  Bell,
  Star,
  Users,
  Truck,
  DollarSign,
  FileText,
  Calculator,
  Save,
  AlertTriangle,
  Info,
  BarChart3,
  Loader2,
  RefreshCw,
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
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";

// ✅ TIPOS E INTERFACES
type TabType = "dashboard" | "produtos" | "vendas" | "gastos" | "resumo" | "metas" | "clientes" | "fornecedores";

type GoalType = "revenue" | "profit" | "margin" | "sales_count" | "expense_reduction";
type PaymentMethod = "cash" | "credit_card" | "debit_card" | "pix" | "bank_transfer" | "other";
type SalePaymentStatus = "paid" | "pending" | "overdue" | "cancelled";
type ExpensePaymentStatus = "paid" | "pending" | "overdue";
type ExpenseType = "fixed" | "variable" | "one_time";

interface PriceCalculationResult {
  suggestedPrice: number;
  minPrice: number;
  maxPrice: number;
  targetProfit: number;
  analysis: string[];
}

export default function FinancialManagerPro() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [showAddSale, setShowAddSale] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showPriceCalculator, setShowPriceCalculator] = useState(false);
  const [editingProductId, setEditingProductId] = useState<Id<"products"> | null>(null);

  const [productForm, setProductForm] = useState({
    name: "",
    costPrice: "",
    salePrice: "",
    sku: "",
    category: "",
    stock: "",
    minStock: "",
    unit: "un",
    description: "",
  });

  const [saleForm, setSaleForm] = useState({
    productId: "",
    customerId: "",
    quantity: "",
    discount: "",
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "pix" as PaymentMethod,
    paymentStatus: "paid" as SalePaymentStatus,
    notes: "",
  });

  const [expenseForm, setExpenseForm] = useState({
    description: "",
    amount: "",
    categoryName: "Outros",
    type: "one_time" as ExpenseType,
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "pix" as PaymentMethod,
    paymentStatus: "paid" as ExpensePaymentStatus,
    notes: "",
  });

  const [customerForm, setCustomerForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });

  const [supplierForm, setSupplierForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });

  const [goalForm, setGoalForm] = useState({
    type: "revenue" as GoalType,
    title: "",
    description: "",
    targetValue: "",
    period: "monthly" as "daily" | "weekly" | "monthly" | "yearly",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split("T")[0],
  });

  const [priceCalcForm, setPriceCalcForm] = useState({
    costPrice: "",
    targetMargin: "40",
    category: "",
  });

  const [priceCalcResult, setPriceCalcResult] = useState<PriceCalculationResult | null>(null);
  const clearMonthData = useMutation(api.profitCalculator.clearMonthData);
  const clearAllData = useMutation(api.profitCalculator.clearAllData);


  // Queries
  const products = useQuery(api.profitCalculator.getProducts, { activeOnly: false }) ?? [];
  const sales = useQuery(api.profitCalculator.getSalesByMonth, { month: selectedMonth }) ?? [];
  const expenses = useQuery(api.profitCalculator.getExpensesByMonth, { month: selectedMonth }) ?? [];
  const monthlyReport = useQuery(api.profitCalculator.getMonthlyReport, { month: selectedMonth });
  const allMonths = useQuery(api.profitCalculator.getAllMonths, {}) ?? [];
  const dashboard = useQuery(api.profitCalculator.getDashboard, {});
  const alerts = useQuery(api.profitCalculator.getAlerts, { unreadOnly: true }) ?? [];
  const goals = useQuery(api.profitCalculator.getFinancialGoals, { status: "active" }) ?? [];
  const customers = useQuery(api.profitCalculator.getCustomers, {}) ?? [];
  const suppliers = useQuery(api.profitCalculator.getSuppliers, {}) ?? [];

  // Mutations
  const addProduct = useMutation(api.profitCalculator.addProduct);
  const updateProduct = useMutation(api.profitCalculator.updateProduct);
  const deleteProduct = useMutation(api.profitCalculator.deleteProduct);
  const addSale = useMutation(api.profitCalculator.addSale);
  const deleteSale = useMutation(api.profitCalculator.deleteSale);
  const addExpense = useMutation(api.profitCalculator.addExpense);
  const deleteExpense = useMutation(api.profitCalculator.deleteExpense);
  const addCustomer = useMutation(api.profitCalculator.addCustomer);
  const deleteCustomer = useMutation(api.profitCalculator.deleteCustomer);
  const addSupplier = useMutation(api.profitCalculator.addSupplier);
  const deleteSupplier = useMutation(api.profitCalculator.deleteSupplier);
  const addGoal = useMutation(api.profitCalculator.addFinancialGoal);
  const deleteGoal = useMutation(api.profitCalculator.deleteFinancialGoal);
  const markAlertAsRead = useMutation(api.profitCalculator.markAlertAsRead);

  // Actions
  const calculatePrice = useAction(api.profitCalculator.calculateSuggestedPrice);
  const generateReport = useAction(api.profitCalculator.generateMonthlyReport);

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
      year: "numeric",
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

  const resetProductForm = () => {
    setProductForm({
      name: "",
      costPrice: "",
      salePrice: "",
      sku: "",
      category: "",
      stock: "",
      minStock: "",
      unit: "un",
      description: "",
    });
    setEditingProductId(null);
  };

  const handleAddProduct = async () => {
    if (!productForm.name.trim() || !productForm.costPrice || !productForm.salePrice) {
      toast.error("❌ Preencha nome, custo e preço de venda!");
      return;
    }

    const costPrice = parseFloat(productForm.costPrice);
    const salePrice = parseFloat(productForm.salePrice);

    if (costPrice <= 0 || salePrice <= 0) {
      toast.error("❌ Valores devem ser maiores que zero!");
      return;
    }

    if (salePrice <= costPrice) {
      toast.error("⚠️ Preço de venda deve ser maior que o custo!");
      return;
    }

    try {
      await addProduct({
        name: productForm.name,
        costPrice,
        salePrice,
        sku: productForm.sku || undefined,
        category: productForm.category || undefined,
        stock: productForm.stock ? parseInt(productForm.stock) : undefined,
        minStock: productForm.minStock ? parseInt(productForm.minStock) : undefined,
        unit: productForm.unit || undefined,
        description: productForm.description || undefined,
      });

      toast.success("✅ Produto cadastrado com sucesso!");
      setShowAddProduct(false);
      resetProductForm();
    } catch (error) {
      toast.error("❌ Erro ao cadastrar produto");
      console.error(error);
    }
  };

  const handleEditProduct = async () => {
    if (!editingProductId) return;

    try {
      await updateProduct({
        id: editingProductId,
        name: productForm.name || undefined,
        costPrice: productForm.costPrice ? parseFloat(productForm.costPrice) : undefined,
        salePrice: productForm.salePrice ? parseFloat(productForm.salePrice) : undefined,
        sku: productForm.sku || undefined,
        category: productForm.category || undefined,
        stock: productForm.stock ? parseInt(productForm.stock) : undefined,
        minStock: productForm.minStock ? parseInt(productForm.minStock) : undefined,
        unit: productForm.unit || undefined,
        description: productForm.description || undefined,
      });

      toast.success("✅ Produto atualizado!");
      setShowEditProduct(false);
      resetProductForm();
    } catch (error) {
      toast.error("❌ Erro ao atualizar produto");
      console.error(error);
    }
  };

  const handleDeleteProduct = async (id: Id<"products">, permanent = false) => {
    try {
      const result = await deleteProduct({ id, permanent });
      toast.success(`✅ Produto ${permanent ? 'deletado' : 'desativado'}! ${result.deletedSales ? `${result.deletedSales} vendas removidas` : ''}`);
    } catch (error) {
      toast.error("❌ Erro ao deletar produto");
      console.error(error);
    }
  };

  const openEditProduct = (productId: Id<"products">) => {
    const product = products.find((p) => p._id === productId);
    if (!product) return;

    setProductForm({
      name: product.name,
      costPrice: product.costPrice.toString(),
      salePrice: product.salePrice.toString(),
      sku: product.sku || "",
      category: product.category || "",
      stock: product.stock?.toString() || "",
      minStock: product.minStock?.toString() || "",
      unit: product.unit || "un",
      description: product.description || "",
    });
    setEditingProductId(productId);
    setShowEditProduct(true);
  };

  const handleAddSale = async () => {
    if (!saleForm.productId || !saleForm.quantity || !saleForm.date) {
      toast.error("❌ Preencha produto, quantidade e data!");
      return;
    }

    const product = products.find((p) => p._id === saleForm.productId);
    if (!product) {
      toast.error("❌ Produto não encontrado!");
      return;
    }

    const quantity = parseInt(saleForm.quantity);
    if (product.stock !== undefined && product.stock < quantity) {
      toast.error(`⚠️ Estoque insuficiente! Disponível: ${product.stock}`);
      return;
    }

    try {
      await addSale({
        productId: saleForm.productId as Id<"products">,
        customerId: saleForm.customerId ? (saleForm.customerId as Id<"customers">) : undefined,
        quantity,
        discount: saleForm.discount ? parseFloat(saleForm.discount) : undefined,
        date: saleForm.date,
        paymentMethod: saleForm.paymentMethod,
        paymentStatus: saleForm.paymentStatus,
        notes: saleForm.notes || undefined,
      });

      await generateReport({ month: saleForm.date.substring(0, 7) });

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10B981", "#3B82F6", "#F59E0B"],
      });

      toast.success("🎉 Venda registrada com sucesso!");
      setShowAddSale(false);
      setSaleForm({
        productId: "",
        customerId: "",
        quantity: "",
        discount: "",
        date: new Date().toISOString().split("T")[0],
        paymentMethod: "pix",
        paymentStatus: "paid",
        notes: "",
      });
    } catch (error) {
      toast.error("❌ Erro ao registrar venda");
      console.error(error);
    }
  };

  const handleDeleteSale = async (id: Id<"sales">, saleMonth: string) => {
    try {
      await deleteSale({ id, permanent: true });
      await generateReport({ month: saleMonth });
      toast.success("✅ Venda deletada!");
    } catch (error) {
      toast.error("❌ Erro ao deletar venda");
      console.error(error);
    }
  };

  const handleAddExpense = async () => {
    if (!expenseForm.description.trim() || !expenseForm.amount || !expenseForm.date) {
      toast.error("❌ Preencha descrição, valor e data!");
      return;
    }

    try {
      await addExpense({
        description: expenseForm.description,
        amount: parseFloat(expenseForm.amount),
        categoryName: expenseForm.categoryName,
        type: expenseForm.type,
        date: expenseForm.date,
        paymentMethod: expenseForm.paymentMethod,
        paymentStatus: expenseForm.paymentStatus,
        notes: expenseForm.notes || undefined,
      });

      await generateReport({ month: expenseForm.date.substring(0, 7) });

      toast.success("✅ Gasto registrado!");
      setShowAddExpense(false);
      setExpenseForm({
        description: "",
        amount: "",
        categoryName: "Outros",
        type: "one_time",
        date: new Date().toISOString().split("T")[0],
        paymentMethod: "pix",
        paymentStatus: "paid",
        notes: "",
      });
    } catch (error) {
      toast.error("❌ Erro ao registrar gasto");
      console.error(error);
    }
  };
  const handleClearMonth = async () => {
    if (!confirm(`⚠️ ATENÇÃO! Isso vai DELETAR PERMANENTEMENTE todas as vendas e gastos de ${getCurrentMonthName()}. Esta ação NÃO PODE ser desfeita! Tem certeza?`)) {
      return;
    }

    try {
      const result = await clearMonthData({ month: selectedMonth });
      toast.success(`✅ Limpeza concluída! ${result.deletedSales} vendas e ${result.deletedExpenses} gastos removidos.`);
    } catch (error) {
      toast.error("❌ Erro ao limpar dados");
      console.error(error);
    }
  };

  const handleClearAll = async () => {
    if (!confirm("🚨 PERIGO! Isso vai DELETAR TUDO: produtos, vendas, gastos, clientes, fornecedores, metas e relatórios. IMPOSSÍVEL DESFAZER! Digite 'DELETAR TUDO' para confirmar.")) {
      return;
    }

    const confirmation = prompt("Digite 'DELETAR TUDO' em letras maiúsculas:");
    if (confirmation !== "DELETAR TUDO") {
      toast.error("❌ Cancelado");
      return;
    }

    try {
      const result = await clearAllData({});
      toast.success(`✅ Tudo deletado! ${result.products} produtos, ${result.sales} vendas, ${result.expenses} gastos removidos.`);
    } catch (error) {
      toast.error("❌ Erro ao limpar tudo");
      console.error(error);
    }
  };
  const handleDeleteExpense = async (id: Id<"expenses">, expenseMonth: string) => {
    try {
      await deleteExpense({ id, permanent: true });
      await generateReport({ month: expenseMonth });
      toast.success("✅ Gasto deletado!");
    } catch (error) {
      toast.error("❌ Erro ao deletar gasto");
      console.error(error);
    }
  };

  const handleAddCustomer = async () => {
    if (!customerForm.name.trim()) {
      toast.error("❌ Digite o nome do cliente!");
      return;
    }

    try {
      await addCustomer({
        name: customerForm.name,
        email: customerForm.email || undefined,
        phone: customerForm.phone || undefined,
        address: customerForm.address || undefined,
        notes: customerForm.notes || undefined,
      });

      toast.success("✅ Cliente cadastrado!");
      setShowAddCustomer(false);
      setCustomerForm({ name: "", email: "", phone: "", address: "", notes: "" });
    } catch (error) {
      toast.error("❌ Erro ao cadastrar cliente");
      console.error(error);
    }
  };

  const handleAddSupplier = async () => {
    if (!supplierForm.name.trim()) {
      toast.error("❌ Digite o nome do fornecedor!");
      return;
    }

    try {
      await addSupplier({
        name: supplierForm.name,
        email: supplierForm.email || undefined,
        phone: supplierForm.phone || undefined,
        address: supplierForm.address || undefined,
        notes: supplierForm.notes || undefined,
      });

      toast.success("✅ Fornecedor cadastrado!");
      setShowAddSupplier(false);
      setSupplierForm({ name: "", email: "", phone: "", address: "", notes: "" });
    } catch (error) {
      toast.error("❌ Erro ao cadastrar fornecedor");
      console.error(error);
    }
  };

  const handleAddGoal = async () => {
    if (!goalForm.title.trim() || !goalForm.targetValue) {
      toast.error("❌ Preencha título e valor alvo!");
      return;
    }

    try {
      await addGoal({
        type: goalForm.type,
        title: goalForm.title,
        description: goalForm.description || undefined,
        targetValue: parseFloat(goalForm.targetValue),
        period: goalForm.period,
        startDate: goalForm.startDate,
        endDate: goalForm.endDate,
      });

      toast.success("🎯 Meta criada!");
      setShowAddGoal(false);
    } catch (error) {
      toast.error("❌ Erro ao criar meta");
      console.error(error);
    }
  };

  const handleCalculatePrice = async () => {
    if (!priceCalcForm.costPrice) {
      toast.error("❌ Digite o custo do produto!");
      return;
    }

    try {
      const result = await calculatePrice({
        costPrice: parseFloat(priceCalcForm.costPrice),
        targetMargin: priceCalcForm.targetMargin ? parseFloat(priceCalcForm.targetMargin) : undefined,
        category: priceCalcForm.category || undefined,
      });

      setPriceCalcResult(result);
    } catch (error) {
      toast.error("❌ Erro ao calcular preço");
      console.error(error);
    }
  };

  const handleRegenerateReport = async () => {
    try {
      toast.info("🔄 Regerando relatório...");
      await generateReport({ month: selectedMonth });
      toast.success("✅ Relatório atualizado!");
    } catch (error) {
      toast.error("❌ Erro ao gerar relatório");
      console.error(error);
    }
  };

  const isLoading = products === undefined || dashboard === undefined;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
        <div className="text-center">
          <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-blue-600" />
          <p className="text-xl font-semibold text-gray-700">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 pb-12">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-[1600px] mx-auto px-4 py-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              💼 Gestão Financeira PRO
            </h1>
            <p className="text-gray-600 mt-1">Controle completo e inteligente do seu negócio</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  {alerts.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                      {alerts.length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Alertas ({alerts.length})</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-64">
                  {alerts.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      Nenhum alerta
                    </div>
                  ) : (
                    alerts.map((alert) => (
                      <DropdownMenuItem
                        key={alert._id}
                        className="flex-col items-start p-3 cursor-pointer"
                        onClick={() => markAlertAsRead({ id: alert._id })}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {alert.severity === "critical" && <AlertTriangle className="w-4 h-4 text-red-500" />}
                          {alert.severity === "warning" && <AlertCircle className="w-4 h-4 text-orange-500" />}
                          {alert.severity === "info" && <Info className="w-4 h-4 text-blue-500" />}
                          <span className="font-semibold text-sm">{alert.title}</span>
                        </div>
                        <p className="text-xs text-gray-600">{alert.message}</p>
                      </DropdownMenuItem>
                    ))
                  )}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" onClick={() => setShowPriceCalculator(true)} className="hidden md:flex">
              <Calculator className="w-4 h-4 mr-2" />
              Calcular Preço
            </Button>

            {/* ✅ BOTÕES DE CONFIGURAÇÃO */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="text-red-600">
                  <Settings className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Configurações</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleClearMonth} className="text-orange-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpar Mês Atual
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleClearAll} className="text-red-600 font-bold">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  DELETAR TUDO
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

        </div>


        {/* NAVEGAÇÃO DE MÊS */}
        <Card className="p-4 bg-white/80 backdrop-blur-sm border-2 mb-6">
          <div className="flex items-center justify-between gap-4">
            <Button variant="outline" size="icon" onClick={() => navigateMonth("prev")} className="h-10 w-10 shrink-0">
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

            <Button variant="outline" size="icon" onClick={() => navigateMonth("next")} className="h-10 w-10 shrink-0">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </Card>

        {/* 4 CARDS DE RESUMO */}
        {monthlyReport && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* CARD 1: RECEITA ✅ */}
            <Card className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white overflow-hidden relative">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingCart className="w-5 h-5" />
                  <p className="text-sm font-medium opacity-90">Receita</p>
                </div>
                <p className="text-2xl font-black">{formatCurrency(monthlyReport.totalRevenue)}</p>
                <p className="text-xs opacity-75 mt-1">{monthlyReport.totalSales} vendas</p>
              </div>
              <DollarSign className="absolute -bottom-4 -right-4 w-24 h-24 opacity-10" />
            </Card>

            {/* CARD 2: GASTOS ✅ */}
            <Card className="p-4 bg-gradient-to-br from-red-500 to-red-600 border-0 text-white overflow-hidden relative">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Receipt className="w-5 h-5" />
                  <p className="text-sm font-medium opacity-90">Gastos</p>
                </div>
                <p className="text-2xl font-black">{formatCurrency(monthlyReport.totalExpenses)}</p>
                <p className="text-xs opacity-75 mt-1">{expenses.length} registros</p>
              </div>
              <TrendingDown className="absolute -bottom-4 -right-4 w-24 h-24 opacity-10" />
            </Card>

            {/* CARD 3: LUCRO LÍQUIDO ✅ */}
            <Card
              className={`p-4 border-0 text-white overflow-hidden relative ${
                monthlyReport.netProfit >= 0
                  ? "bg-gradient-to-br from-emerald-500 to-emerald-600"
                  : "bg-gradient-to-br from-orange-500 to-orange-600"
              }`}
            >
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  {monthlyReport.netProfit >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  <p className="text-sm font-medium opacity-90">Lucro Líquido</p>
                </div>
                <p className="text-2xl font-black">{formatCurrency(monthlyReport.netProfit)}</p>
                <p className="text-xs opacity-75 mt-1">Margem: {monthlyReport.profitMargin.toFixed(1)}%</p>
              </div>
              <DollarSign className="absolute -bottom-4 -right-4 w-24 h-24 opacity-10" />
            </Card>

            {/* CARD 4: PRODUTOS ✅ */}
            <Card className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 border-0 text-white overflow-hidden relative">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-5 h-5" />
                  <p className="text-sm font-medium opacity-90">Produtos</p>
                </div>
                <p className="text-2xl font-black">{products.filter((p) => p.active).length}</p>
                <p className="text-xs opacity-75 mt-1">cadastrados</p>
              </div>
              <Package className="absolute -bottom-4 -right-4 w-24 h-24 opacity-10" />
            </Card>
          </div>
        )}



        {/* TABS */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="space-y-6">
          <TabsList className="grid grid-cols-4 md:grid-cols-8 w-full bg-white shadow-lg h-auto p-1">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white py-3 text-xs md:text-sm">
              <BarChart3 className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="produtos" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white py-3 text-xs md:text-sm">
              <Package className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Produtos</span>
            </TabsTrigger>
            <TabsTrigger value="vendas" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-green-600 data-[state=active]:text-white py-3 text-xs md:text-sm">
              <ShoppingCart className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Vendas</span>
            </TabsTrigger>
            <TabsTrigger value="gastos" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-600 data-[state=active]:text-white py-3 text-xs md:text-sm">
              <Receipt className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Gastos</span>
            </TabsTrigger>
            <TabsTrigger value="resumo" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white py-3 text-xs md:text-sm">
              <FileText className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Resumo</span>
            </TabsTrigger>
            <TabsTrigger value="metas" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-600 data-[state=active]:to-orange-600 data-[state=active]:text-white py-3 text-xs md:text-sm">
              <Target className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Metas</span>
            </TabsTrigger>
            <TabsTrigger value="clientes" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-rose-600 data-[state=active]:text-white py-3 text-xs md:text-sm">
              <Users className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Clientes</span>
            </TabsTrigger>
            <TabsTrigger value="fornecedores" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white py-3 text-xs md:text-sm">
              <Truck className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Fornecedores</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB: DASHBOARD */}
          <TabsContent value="dashboard">
            {!dashboard ? (
              <Card className="p-12 text-center">
                <Loader2 className="w-16 h-16 mx-auto mb-4 text-gray-400 animate-spin" />
                <p className="text-gray-500">Carregando dashboard...</p>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                      Receita Total
                    </h3>
                    <p className="text-3xl font-black text-blue-600">
                      {formatCurrency(dashboard.overview.totalRevenue)}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">{dashboard.overview.totalSales} vendas</p>
                  </Card>

                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                      Lucro Líquido
                    </h3>
                    <p className={`text-3xl font-black ${dashboard.overview.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatCurrency(dashboard.overview.netProfit)}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">Margem: {dashboard.overview.profitMargin.toFixed(1)}%</p>
                  </Card>

                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5 text-purple-600" />
                      Produtos
                    </h3>
                    <p className="text-3xl font-black text-purple-600">{dashboard.products.total}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      {dashboard.products.lowStock > 0 && `⚠️ ${dashboard.products.lowStock} com estoque baixo`}
                    </p>
                  </Card>
                </div>

                {dashboard.products.lowStock > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-5 w-5" />
                    <AlertTitle>Estoque Baixo!</AlertTitle>
                    <AlertDescription>
                      {dashboard.products.lowStock} produto{dashboard.products.lowStock > 1 ? 's' : ''} precisa{dashboard.products.lowStock > 1 ? 'm' : ''} de reabastecimento.
                    </AlertDescription>
                  </Alert>
                )}

                {goals.length > 0 && (
                  <Card className="p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-yellow-600" />
                      Metas Ativas
                    </h3>
                    <div className="space-y-4">
                      {goals.slice(0, 3).map((goal) => {
                        const progress = (goal.currentValue / goal.targetValue) * 100;
                        return (
                          <div key={goal._id}>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="font-semibold">{goal.title}</span>
                              <span>{progress.toFixed(0)}%</span>
                            </div>
                            <Progress value={Math.min(100, progress)} className="h-2" />
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
                <h3 className="text-xl font-bold">Seus Produtos ({products.length})</h3>
                <Button onClick={() => setShowAddProduct(true)} className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Produto
                </Button>
              </div>

              {products.length === 0 ? (
                <Card className="p-12 text-center border-2 border-dashed">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-bold mb-2">Nenhum produto cadastrado</h3>
                  <p className="text-gray-500 mb-4">Comece cadastrando seu primeiro produto</p>
                  <Button onClick={() => setShowAddProduct(true)} className="bg-purple-600">
                    Cadastrar Primeiro Produto
                  </Button>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => {
                    const profit = product.salePrice - product.costPrice;
                    const profitMargin = (profit / product.salePrice) * 100;
                    const isLowStock = product.stock !== undefined && product.minStock !== undefined && product.stock <= product.minStock;

                    return (
                      <Card key={product._id} className={`p-4 hover:shadow-lg transition-shadow ${!product.active ? 'opacity-50' : ''}`}>
                        <div className="flex justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-bold text-lg">{product.name}</h4>
                            <div className="flex gap-2 mt-1 flex-wrap">
                              {product.category && <Badge variant="outline">{product.category}</Badge>}
                              {!product.active && <Badge variant="secondary">Inativo</Badge>}
                              {isLowStock && <Badge variant="destructive">Estoque Baixo</Badge>}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-8 w-8">
                                <Settings className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => openEditProduct(product._id)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteProduct(product._id, false)} className="text-orange-600">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                Desativar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteProduct(product._id, true)} className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Deletar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="space-y-2 text-sm mb-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Custo:</span>
                            <span className="font-semibold">{formatCurrency(product.costPrice)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Venda:</span>
                            <span className="font-semibold text-blue-600">{formatCurrency(product.salePrice)}</span>
                          </div>
                          {product.stock !== undefined && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Estoque:</span>
                              <span className={`font-semibold ${isLowStock ? 'text-red-600' : ''}`}>
                                {product.stock} {product.unit || 'un'}
                              </span>
                            </div>
                          )}
                        </div>

                        <Separator className="my-3" />

                        <div className="bg-emerald-50 rounded p-3">
                          <div className="flex justify-between">
                            <div>
                              <p className="text-xs text-gray-600">Lucro/un:</p>
                              <p className="font-bold text-emerald-600">{formatCurrency(profit)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-600">Margem:</p>
                              <p className="font-bold text-emerald-600">{profitMargin.toFixed(1)}%</p>
                            </div>
                          </div>
                        </div>
                      </Card>
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
                <h3 className="text-xl font-bold">Vendas do Mês ({sales.length})</h3>
                <Button onClick={() => setShowAddSale(true)} className="bg-emerald-600 hover:bg-emerald-700" disabled={products.filter(p => p.active).length === 0}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Venda
                </Button>
              </div>

              {products.filter(p => p.active).length === 0 && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Cadastre produtos primeiro</AlertTitle>
                  <AlertDescription>
                    Você precisa ter produtos cadastrados para registrar vendas.
                  </AlertDescription>
                </Alert>
              )}

              {sales.length === 0 ? (
                <Card className="p-12 text-center border-2 border-dashed">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-bold mb-2">Nenhuma venda registrada</h3>
                  <p className="text-gray-500 mb-4">Comece registrando sua primeira venda</p>
                  <Button onClick={() => setShowAddSale(true)} className="bg-emerald-600" disabled={products.filter(p => p.active).length === 0}>
                    Registrar Primeira Venda
                  </Button>
                </Card>
              ) : (
                <div className="space-y-3">
                  {sales.map((sale) => (
                    <Card key={sale._id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold">{sale.productName}</h4>
                            {sale.paymentStatus === "pending" && (
                              <Badge variant="outline" className="text-orange-600">Pendente</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {sale.quantity}x {formatCurrency(sale.salePrice)} • {formatDate(sale.date)}
                          </p>
                          {sale.notes && <p className="text-xs text-gray-500 mt-1">{sale.notes}</p>}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-emerald-600 mb-2">{formatCurrency(sale.profit)}</p>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDeleteSale(sale._id, sale.month)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* TAB: GASTOS */}
          <TabsContent value="gastos">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Gastos do Mês ({expenses.length})</h3>
                <Button onClick={() => setShowAddExpense(true)} className="bg-red-600 hover:bg-red-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Gasto
                </Button>
              </div>

              {expenses.length === 0 ? (
                <Card className="p-12 text-center border-2 border-dashed">
                  <Receipt className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-bold mb-2">Nenhum gasto registrado</h3>
                  <p className="text-gray-500 mb-4">Registre seus gastos para controle financeiro</p>
                  <Button onClick={() => setShowAddExpense(true)} className="bg-red-600">
                    Registrar Primeiro Gasto
                  </Button>
                </Card>
              ) : (
                <div className="space-y-3">
                  {expenses.map((expense) => (
                    <Card key={expense._id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-bold">{expense.description}</h4>
                          <div className="flex gap-2 mt-1 flex-wrap">
                            <Badge variant="outline">{expense.categoryName}</Badge>
                            <Badge variant={expense.type === 'fixed' ? 'default' : 'secondary'}>
                              {expense.type === 'fixed' ? 'Fixo' : expense.type === 'variable' ? 'Variável' : 'Único'}
                            </Badge>
                            {expense.paymentStatus === "pending" && (
                              <Badge variant="outline" className="text-orange-600">Pendente</Badge>
                            )}
                            <span className="text-sm text-gray-600">{formatDate(expense.date)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-600 mb-2">{formatCurrency(expense.amount)}</p>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDeleteExpense(expense._id, expense.month)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* TAB: RESUMO */}
          <TabsContent value="resumo">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Resumo de {getCurrentMonthName()}</h3>
                <div className="flex gap-2">
                  <Button onClick={handleRegenerateReport} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Atualizar
                  </Button> <Button onClick={handleClearMonth} variant="destructive" className="bg-red-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Limpar Mês
                  </Button>
                </div>
              </div>


              {!monthlyReport ? (
                <Card className="p-12 text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-bold mb-2">Sem dados para o mês</h3>
                  <p className="text-gray-500 mb-4">Registre vendas e gastos para gerar o relatório</p>
                  <Button onClick={handleRegenerateReport} className="bg-indigo-600">
                    Gerar Relatório
                  </Button>
                </Card>
              ) : (
                <div className="space-y-6">
                  <Card className="p-6">
                    <div className="grid md:grid-cols-3 gap-6 mb-6">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Receita</p>
                        <p className="text-2xl font-bold text-blue-600">{formatCurrency(monthlyReport.totalRevenue)}</p>
                        <p className="text-xs text-gray-500 mt-1">{monthlyReport.totalSales} vendas</p>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Gastos</p>
                        <p className="text-2xl font-bold text-red-600">{formatCurrency(monthlyReport.totalExpenses)}</p>
                      </div>
                      <div className={`text-center p-4 rounded-lg ${monthlyReport.netProfit >= 0 ? 'bg-emerald-50' : 'bg-orange-50'}`}>
                        <p className="text-sm text-gray-600 mb-1">Lucro Líquido</p>
                        <p className={`text-2xl font-bold ${monthlyReport.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {formatCurrency(monthlyReport.netProfit)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Margem: {monthlyReport.profitMargin.toFixed(1)}%</p>
                      </div>
                    </div>

                    {monthlyReport.topProducts.length > 0 && (
                      <>
                        <Separator className="my-6" />
                        <div>
                          <h4 className="font-bold mb-4 flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-600" />
                            Produtos Mais Vendidos
                          </h4>
                          <div className="space-y-2">
                            {monthlyReport.topProducts.slice(0, 5).map((product, idx) => (
                              <div key={product.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
                                    {idx + 1}
                                  </div>
                                  <div>
                                    <p className="font-semibold">{product.productName}</p>
                                    <p className="text-sm text-gray-600">{product.quantity} vendas • {formatCurrency(product.revenue)}</p>
                                  </div>
                                </div>
                                <p className="font-bold text-emerald-600">{formatCurrency(product.profit)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          {/* TAB: METAS */}
          <TabsContent value="metas">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Suas Metas ({goals.length})</h3>
                <Button onClick={() => setShowAddGoal(true)} className="bg-yellow-600 hover:bg-yellow-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Meta
                </Button>
              </div>

              {goals.length === 0 ? (
                <Card className="p-12 text-center border-2 border-dashed">
                  <Target className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-bold mb-2">Nenhuma meta ativa</h3>
                  <p className="text-gray-500 mb-4">Defina metas para acompanhar seu progresso</p>
                  <Button onClick={() => setShowAddGoal(true)} className="bg-yellow-600">
                    Criar Primeira Meta
                  </Button>
                </Card>
              ) : (
                <div className="space-y-4">
                  {goals.map((goal) => {
                    const progress = (goal.currentValue / goal.targetValue) * 100;
                    return (
                      <Card key={goal._id} className="p-6 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="font-bold text-lg">{goal.title}</h4>
                            {goal.description && <p className="text-sm text-gray-600 mt-1">{goal.description}</p>}
                          </div>
                          <Button size="icon" variant="ghost" onClick={() => deleteGoal({ id: goal._id })}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Progresso:</span>
                            <span className="font-semibold">{progress.toFixed(0)}%</span>
                          </div>
                          <Progress value={Math.min(100, progress)} className="h-3" />
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>{formatCurrency(goal.currentValue)}</span>
                            <span>{formatCurrency(goal.targetValue)}</span>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* TAB: CLIENTES */}
          <TabsContent value="clientes">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Seus Clientes ({customers.length})</h3>
                <Button onClick={() => setShowAddCustomer(true)} className="bg-pink-600 hover:bg-pink-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Cliente
                </Button>
              </div>

              {customers.length === 0 ? (
                <Card className="p-12 text-center border-2 border-dashed">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-bold mb-2">Nenhum cliente cadastrado</h3>
                  <p className="text-gray-500 mb-4">Gerencie seus clientes em um só lugar</p>
                  <Button onClick={() => setShowAddCustomer(true)} className="bg-pink-600">
                    Cadastrar Primeiro Cliente
                  </Button>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {customers.map((customer) => (
                    <Card key={customer._id} className="p-4 hover:shadow-lg transition-shadow">
                      <div className="flex justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-bold">{customer.name}</h4>
                          {customer.email && <p className="text-sm text-gray-600">{customer.email}</p>}
                          {customer.phone && <p className="text-sm text-gray-600">{customer.phone}</p>}
                        </div>
                        <Button size="icon" variant="ghost" onClick={() => deleteCustomer({ id: customer._id })}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                      <Separator className="my-3" />
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-600">Total gasto: <span className="font-semibold">{formatCurrency(customer.totalSpent)}</span></p>
                        <p className="text-gray-600">Pedidos: <span className="font-semibold">{customer.totalOrders}</span></p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* TAB: FORNECEDORES */}
          <TabsContent value="fornecedores">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Seus Fornecedores ({suppliers.length})</h3>
                <Button onClick={() => setShowAddSupplier(true)} className="bg-teal-600 hover:bg-teal-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Fornecedor
                </Button>
              </div>

              {suppliers.length === 0 ? (
                <Card className="p-12 text-center border-2 border-dashed">
                  <Truck className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-bold mb-2">Nenhum fornecedor cadastrado</h3>
                  <p className="text-gray-500 mb-4">Organize seus fornecedores</p>
                  <Button onClick={() => setShowAddSupplier(true)} className="bg-teal-600">
                    Cadastrar Primeiro Fornecedor
                  </Button>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {suppliers.map((supplier) => (
                    <Card key={supplier._id} className="p-4 hover:shadow-lg transition-shadow">
                      <div className="flex justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-bold">{supplier.name}</h4>
                          {supplier.contact?.email && <p className="text-sm text-gray-600">{supplier.contact.email}</p>}
                          {supplier.contact?.phone && <p className="text-sm text-gray-600">{supplier.contact.phone}</p>}
                        </div>
                        <Button size="icon" variant="ghost" onClick={() => deleteSupplier({ id: supplier._id })}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                      {supplier.notes && (
                        <>
                          <Separator className="my-3" />
                          <p className="text-xs text-gray-600">{supplier.notes}</p>
                        </>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* MODAIS */}

      {/* Modal: Adicionar Produto */}
      <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
        {/* ✅ CORREÇÃO: "sm:max-w-2xl" para mobile e "max-h-[90vh] overflow-y-auto" para scroll */}
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>➕ Cadastrar Novo Produto</DialogTitle>
            <DialogDescription>
              Preencha os dados do produto para cadastro no sistema
            </DialogDescription>
          </DialogHeader>
          {/* ✅ CORREÇÃO: "grid-cols-1 md:grid-cols-2" para empilhar no mobile */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nome do Produto *</Label>
                <Input value={productForm.name} onChange={(e) => setProductForm({...productForm, name: e.target.value})} placeholder="Ex: Camiseta Básica" />
              </div>
              <div>
                <Label>SKU / Código</Label>
                <Input value={productForm.sku} onChange={(e) => setProductForm({...productForm, sku: e.target.value})} placeholder="Ex: CAM-001" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Preço de Custo * (R$)</Label>
                <Input type="number" step="0.01" value={productForm.costPrice} onChange={(e) => setProductForm({...productForm, costPrice: e.target.value})} placeholder="0,00" />
              </div>
              <div>
                <Label>Preço de Venda * (R$)</Label>
                <Input type="number" step="0.01" value={productForm.salePrice} onChange={(e) => setProductForm({...productForm, salePrice: e.target.value})} placeholder="0,00" />
              </div>
            </div>

            {/* ✅ CORREÇÃO: "grid-cols-1 md:grid-cols-3" */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Estoque Inicial</Label>
                <Input type="number" value={productForm.stock} onChange={(e) => setProductForm({...productForm, stock: e.target.value})} placeholder="0" />
              </div>
              <div>
                <Label>Estoque Mínimo</Label>
                <Input type="number" value={productForm.minStock} onChange={(e) => setProductForm({...productForm, minStock: e.target.value})} placeholder="0" />
              </div>
              <div>
                <Label>Unidade</Label>
                <Select value={productForm.unit} onValueChange={(v) => setProductForm({...productForm, unit: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="un">Unidade</SelectItem>
                    <SelectItem value="kg">Kg</SelectItem>
                    <SelectItem value="L">Litro</SelectItem>
                    <SelectItem value="m">Metro</SelectItem>
                    <SelectItem value="cx">Caixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Categoria</Label>
              <Input value={productForm.category} onChange={(e) => setProductForm({...productForm, category: e.target.value})} placeholder="Ex: Roupas" />
            </div>

            <div>
              <Label>Descrição</Label>
              <Textarea value={productForm.description} onChange={(e) => setProductForm({...productForm, description: e.target.value})} placeholder="Descrição do produto" rows={3} />
            </div>

            {productForm.costPrice && productForm.salePrice && parseFloat(productForm.salePrice) > parseFloat(productForm.costPrice) && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Lucro por unidade</AlertTitle>
                <AlertDescription>
                  {formatCurrency(parseFloat(productForm.salePrice) - parseFloat(productForm.costPrice))} ({(((parseFloat(productForm.salePrice) - parseFloat(productForm.costPrice)) / parseFloat(productForm.salePrice)) * 100).toFixed(1)}% de margem)
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddProduct(false)}>Cancelar</Button>
            <Button onClick={handleAddProduct} className="bg-purple-600">
              <Save className="w-4 h-4 mr-2" />
              Salvar Produto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Editar Produto */}
      <Dialog open={showEditProduct} onOpenChange={setShowEditProduct}>
        {/* ✅ CORREÇÃO: Responsividade e Scroll */}
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>✏️ Editar Produto</DialogTitle>
            <DialogDescription>Altere as informações do produto</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* ✅ CORREÇÃO: "grid-cols-1 md:grid-cols-2" */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nome do Produto</Label>
                <Input value={productForm.name} onChange={(e) => setProductForm({...productForm, name: e.target.value})} />
              </div>
              <div>
                <Label>SKU</Label>
                <Input value={productForm.sku} onChange={(e) => setProductForm({...productForm, sku: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Custo (R$)</Label>
                <Input type="number" step="0.01" value={productForm.costPrice} onChange={(e) => setProductForm({...productForm, costPrice: e.target.value})} />
              </div>
              <div>
                <Label>Venda (R$)</Label>
                <Input type="number" step="0.01" value={productForm.salePrice} onChange={(e) => setProductForm({...productForm, salePrice: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Estoque</Label>
                <Input type="number" value={productForm.stock} onChange={(e) => setProductForm({...productForm, stock: e.target.value})} />
              </div>
              <div>
                <Label>Estoque Mínimo</Label>
                <Input type="number" value={productForm.minStock} onChange={(e) => setProductForm({...productForm, minStock: e.target.value})} />
              </div>
            </div>
            {/* Outros campos de edição podem ser adicionados aqui, como Categoria, Descrição, Unidade */}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditProduct(false)}>Cancelar</Button>
            <Button onClick={handleEditProduct} className="bg-purple-600">Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Adicionar Venda */}
      <Dialog open={showAddSale} onOpenChange={setShowAddSale}>
        {/* ✅ CORREÇÃO: Scroll */}
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>🛒 Registrar Venda</DialogTitle>
            <DialogDescription>Registre uma nova venda e atualize o estoque automaticamente</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Produto *</Label>
              <Select value={saleForm.productId} onValueChange={(v) => setSaleForm({...saleForm, productId: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {products.filter((p) => p.active).map((p) => (
                    <SelectItem key={p._id} value={p._id}>
                      {p.name} - {formatCurrency(p.salePrice)} {p.stock !== undefined && `(Estoque: ${p.stock})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ✅ CORREÇÃO: "grid-cols-1 md:grid-cols-2" */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Quantidade *</Label>
                <Input type="number" min="1" value={saleForm.quantity} onChange={(e) => setSaleForm({...saleForm, quantity: e.target.value})} placeholder="1" />
              </div>
              <div>
                <Label>Data *</Label>
                <Input type="date" value={saleForm.date} onChange={(e) => setSaleForm({...saleForm, date: e.target.value})} />
              </div>
            </div>

            <div>
              <Label>Cliente (opcional)</Label>
              <Select value={saleForm.customerId || undefined} onValueChange={(v) => setSaleForm({...saleForm, customerId: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Nenhum cliente" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Desconto (R$)</Label>
              <Input type="number" step="0.01" min="0" value={saleForm.discount} onChange={(e) => setSaleForm({...saleForm, discount: e.target.value})} placeholder="0,00" />
            </div>

            <div>
              <Label>Observações</Label>
              <Textarea value={saleForm.notes} onChange={(e) => setSaleForm({...saleForm, notes: e.target.value})} rows={2} placeholder="Informações adicionais sobre a venda" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSale(false)}>Cancelar</Button>
            <Button onClick={handleAddSale} className="bg-emerald-600">
              <Save className="w-4 h-4 mr-2" />
              Registrar Venda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Adicionar Gasto */}
      <Dialog open={showAddExpense} onOpenChange={setShowAddExpense}>
        {/* ✅ CORREÇÃO: Scroll */}
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>💸 Registrar Gasto</DialogTitle>
            <DialogDescription>Registre uma despesa ou gasto do negócio</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Descrição *</Label>
              <Input value={expenseForm.description} onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})} placeholder="Ex: Conta de luz" />
            </div>

            {/* ✅ CORREÇÃO: "grid-cols-1 md:grid-cols-2" */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Valor * (R$)</Label>
                <Input type="number" step="0.01" value={expenseForm.amount} onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})} />
              </div>
              <div>
                <Label>Data *</Label>
                <Input type="date" value={expenseForm.date} onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})} />
              </div>
            </div>

            <div>
              <Label>Categoria</Label>
              <Select value={expenseForm.categoryName} onValueChange={(v) => setExpenseForm({...expenseForm, categoryName: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aluguel">Aluguel</SelectItem>
                  <SelectItem value="Luz/Água">Luz/Água</SelectItem>
                  <SelectItem value="Internet">Internet</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Funcionários">Funcionários</SelectItem>
                  <SelectItem value="Materiais">Materiais</SelectItem>
                  <SelectItem value="Transporte">Transporte</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tipo</Label>
              <Select value={expenseForm.type} onValueChange={(v: "fixed" | "variable" | "one_time") => setExpenseForm({...expenseForm, type: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixo (mensal)</SelectItem>
                  <SelectItem value="variable">Variável</SelectItem>
                  <SelectItem value="one_time">Único</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddExpense(false)}>Cancelar</Button>
            <Button onClick={handleAddExpense} className="bg-red-600">
              <Save className="w-4 h-4 mr-2" />
              Registrar Gasto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Adicionar Cliente */}
      <Dialog open={showAddCustomer} onOpenChange={setShowAddCustomer}>
        {/* ✅ CORREÇÃO: Scroll */}
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>👤 Cadastrar Cliente</DialogTitle>
            <DialogDescription>Adicione um novo cliente ao sistema</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome *</Label>
              <Input value={customerForm.name} onChange={(e) => setCustomerForm({...customerForm, name: e.target.value})} placeholder="Nome completo" />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={customerForm.email} onChange={(e) => setCustomerForm({...customerForm, email: e.target.value})} placeholder="email@exemplo.com" />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input value={customerForm.phone} onChange={(e) => setCustomerForm({...customerForm, phone: e.target.value})} placeholder="(00) 00000-0000" />
            </div>
            <div>
              <Label>Endereço</Label>
              <Input value={customerForm.address} onChange={(e) => setCustomerForm({...customerForm, address: e.target.value})} placeholder="Endereço completo" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddCustomer(false)}>Cancelar</Button>
            <Button onClick={handleAddCustomer} className="bg-pink-600">Salvar Cliente</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Adicionar Fornecedor */}
      <Dialog open={showAddSupplier} onOpenChange={setShowAddSupplier}>
        {/* ✅ CORREÇÃO: Scroll */}
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>🚚 Cadastrar Fornecedor</DialogTitle>
            <DialogDescription>Adicione um novo fornecedor ao sistema</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome *</Label>
              <Input value={supplierForm.name} onChange={(e) => setSupplierForm({...supplierForm, name: e.target.value})} placeholder="Nome da empresa" />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={supplierForm.email} onChange={(e) => setSupplierForm({...supplierForm, email: e.target.value})} placeholder="email@fornecedor.com" />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input value={supplierForm.phone} onChange={(e) => setSupplierForm({...supplierForm, phone: e.target.value})} placeholder="(00) 0000-0000" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSupplier(false)}>Cancelar</Button>
            <Button onClick={handleAddSupplier} className="bg-teal-600">Salvar Fornecedor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Adicionar Meta */}
      <Dialog open={showAddGoal} onOpenChange={setShowAddGoal}>
        {/* ✅ CORREÇÃO: Scroll */}
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>🎯 Criar Meta</DialogTitle>
            <DialogDescription>Defina uma meta financeira para acompanhar seu progresso</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Título *</Label>
              <Input value={goalForm.title} onChange={(e) => setGoalForm({...goalForm, title: e.target.value})} placeholder="Ex: Faturar R$ 10.000" />
            </div>

            <div>
              <Label>Tipo de Meta</Label>
              <Select value={goalForm.type} onValueChange={(v: GoalType) => setGoalForm({...goalForm, type: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Receita Total</SelectItem>
                  <SelectItem value="profit">Lucro Líquido</SelectItem>
                  <SelectItem value="margin">Margem de Lucro (%)</SelectItem>
                  <SelectItem value="sales_count">Número de Vendas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Valor Alvo *</Label>
              <Input type="number" value={goalForm.targetValue} onChange={(e) => setGoalForm({...goalForm, targetValue: e.target.value})} placeholder="10000" />
            </div>

            {/* ✅ CORREÇÃO: "grid-cols-1 md:grid-cols-2" */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Início</Label>
                <Input type="date" value={goalForm.startDate} onChange={(e) => setGoalForm({...goalForm, startDate: e.target.value})} />
              </div>
              <div>
                <Label>Fim</Label>
                <Input type="date" value={goalForm.endDate} onChange={(e) => setGoalForm({...goalForm, endDate: e.target.value})} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddGoal(false)}>Cancelar</Button>
            <Button onClick={handleAddGoal} className="bg-yellow-600">Criar Meta</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Calculadora de Preço */}
      <Dialog open={showPriceCalculator} onOpenChange={setShowPriceCalculator}>
        {/* ✅ CORREÇÃO: Scroll */}
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>🧮 Calculadora de Preço</DialogTitle>
            <DialogDescription>Descubra o preço ideal para seu produto com base em custos e margem</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Custo do Produto * (R$)</Label>
              <Input type="number" step="0.01" value={priceCalcForm.costPrice} onChange={(e) => setPriceCalcForm({...priceCalcForm, costPrice: e.target.value})} placeholder="Ex: 50.00" />
            </div>

            <div>
              <Label>Margem Desejada (%)</Label>
              <Input type="number" value={priceCalcForm.targetMargin} onChange={(e) => setPriceCalcForm({...priceCalcForm, targetMargin: e.target.value})} placeholder="Ex: 40" />
            </div>

            <div>
              <Label>Categoria</Label>
              <Input value={priceCalcForm.category} onChange={(e) => setPriceCalcForm({...priceCalcForm, category: e.target.value})} placeholder="Ex: roupas, eletrônicos" />
            </div>

            <Button onClick={handleCalculatePrice} className="w-full bg-indigo-600">
              <Calculator className="w-4 h-4 mr-2" />
              Calcular Preço Sugerido
            </Button>

            {priceCalcResult && (
              <div className="mt-6 space-y-4">
                <Alert>
                  <Sparkles className="h-5 w-5" />
                  <AlertTitle className="text-lg">Preço Sugerido</AlertTitle>
                  <AlertDescription>
                    <p className="text-3xl font-black text-emerald-600 my-2">
                      {formatCurrency(priceCalcResult.suggestedPrice)}
                    </p>
                    {/* ✅ CORREÇÃO: "grid-cols-1 sm:grid-cols-2" */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mt-4">
                      <div>
                        <p className="text-gray-600">Mínimo:</p>
                        <p className="font-semibold">{formatCurrency(priceCalcResult.minPrice)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Máximo:</p>
                        <p className="font-semibold">{formatCurrency(priceCalcResult.maxPrice)}</p>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <h4 className="font-semibold">Análise:</h4>
                  {priceCalcResult.analysis.map((insight: string, idx: number) => (
                    <p key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      {insight}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}