"use client";

import { useState } from "react";
import { useQuery, useMutation, useAction, useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
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
  Search,
  Settings,
  Bell,
  Star,
  Users,
  Truck,
  DollarSign,
  TrendingUpIcon,
  FileText,
  Calculator,
  Save,
  AlertTriangle,
  Info,
  BarChart3,
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
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";

type TabType = "dashboard" | "produtos" | "vendas" | "gastos" | "resumo" | "metas" | "clientes" | "fornecedores";

interface ProductFormData {
  name: string;
  costPrice: string;
  salePrice: string;
  sku: string;
  category: string;
  stock: string;
  minStock: string;
  unit: string;
  description: string;
  tags: string[];
  supplierId?: Id<"suppliers">;
}

interface SaleFormData {
  productId: string;
  customerId?: string;
  quantity: string;
  discount: string;
  date: string;
  paymentMethod: string;
  paymentStatus: string;
  notes: string;
}

interface ExpenseFormData {
  description: string;
  amount: string;
  categoryName: string;
  type: "fixed" | "variable" | "one_time";
  date: string;
  paymentMethod: string;
  paymentStatus: string;
  notes: string;
  supplierId?: string;
}

interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  tags: string[];
  notes: string;
}

interface SupplierFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
}

interface GoalFormData {
  type: "revenue" | "profit" | "margin" | "sales_count" | "expense_reduction";
  title: string;
  description: string;
  targetValue: string;
  period: "daily" | "weekly" | "monthly" | "yearly";
  startDate: string;
  endDate: string;
}

interface PriceCalculationResult {
  suggestedPrice: number;
  minPrice: number;
  maxPrice: number;
  targetProfit: number;
  analysis: string[];
}

interface SearchResults {
  products: Array<{ _id: Id<"products">; name: string; salePrice: number; sku?: string; category?: string }>;
  sales: Array<{ _id: Id<"sales">; productName: string; date: string; totalRevenue: number; invoiceNumber?: string; notes?: string }>;
  expenses: Array<{ _id: Id<"expenses">; description: string; date: string; amount: number; categoryName: string; notes?: string }>;
  customers: Array<{ _id: Id<"customers">; name: string; email?: string; phone?: string }>;
  suppliers: Array<{ _id: Id<"suppliers">; name: string; contact?: { email?: string; phone?: string } }>;
}

export default function FinancialManagerPro() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const [selectedBusiness] = useState<Id<"businesses"> | undefined>();
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [showAddSale, setShowAddSale] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showPriceCalculator, setShowPriceCalculator] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const customers: Doc<"customers">[] = useQuery(api.profitCalculator.getCustomers, {}) ?? [];
const suppliers: Doc<"suppliers">[] = useQuery(api.profitCalculator.getSuppliers, {}) ?? [];
const addProduct = useMutation(api.profitCalculator.addProduct);
const updateProduct = useMutation(api.profitCalculator.updateProduct);
const deleteProduct = useMutation(api.profitCalculator.deleteProduct);
const addCustomer = useMutation(api.profitCalculator.addCustomer);
const deleteCustomer = useMutation(api.profitCalculator.deleteCustomer);
const addSupplier = useMutation(api.profitCalculator.addSupplier);
const deleteSupplier = useMutation(api.profitCalculator.deleteSupplier);
  const [editingProductId, setEditingProductId] = useState<Id<"products"> | null>(null);

  const [productForm, setProductForm] = useState<ProductFormData>({
    name: "",
    costPrice: "",
    salePrice: "",
    sku: "",
    category: "",
    stock: "",
    minStock: "",
    unit: "un",
    description: "",
    tags: [],
  });

  const [saleForm, setSaleForm] = useState<SaleFormData>({
    productId: "",
    quantity: "",
    discount: "",
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "pix",
    paymentStatus: "paid",
    notes: "",
  });

  const [expenseForm, setExpenseForm] = useState<ExpenseFormData>({
    description: "",
    amount: "",
    categoryName: "Outros",
    type: "one_time",
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "pix",
    paymentStatus: "paid",
    notes: "",
  });

  const [customerForm, setCustomerForm] = useState<CustomerFormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    tags: [],
    notes: "",
  });

  const [supplierForm, setSupplierForm] = useState<SupplierFormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });

  const [goalForm, setGoalForm] = useState<GoalFormData>({
    type: "revenue",
    title: "",
    description: "",
    targetValue: "",
    period: "monthly",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split("T")[0],
  });

  const [priceCalcForm, setPriceCalcForm] = useState({
    costPrice: "",
    targetMargin: "40",
    category: "",
  });
  const [priceCalcResult, setPriceCalcResult] = useState<PriceCalculationResult | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);

  const convex = useConvex();
  const products: Doc<"products">[] = useQuery(api.profitCalculator.getProducts, { activeOnly: false }) ?? [];
  const sales: Doc<"sales">[] = useQuery(api.profitCalculator.getSalesByMonth, { month: selectedMonth }) ?? [];
  const expenses: Doc<"expenses">[] = useQuery(api.profitCalculator.getExpensesByMonth, { month: selectedMonth }) ?? [];
  const monthlyReport: Doc<"monthlyReports"> | null | undefined = useQuery(api.profitCalculator.getMonthlyReport, { month: selectedMonth });
  const allMonths: Doc<"monthlyReports">[] = useQuery(api.profitCalculator.getAllMonths, {}) ?? [];
  const dashboard = useQuery(api.profitCalculator.getDashboard, { businessId: selectedBusiness }) ?? null;
  const alerts: Doc<"alerts">[] = useQuery(api.profitCalculator.getAlerts, { unreadOnly: true }) ?? [];
  const goals: Doc<"financialGoals">[] = useQuery(api.profitCalculator.getFinancialGoals, { status: "active" }) ?? [];


  const addSale = useMutation(api.profitCalculator.addSale);
  const deleteSale = useMutation(api.profitCalculator.deleteSale);
  const addExpense = useMutation(api.profitCalculator.addExpense);
  const deleteExpense = useMutation(api.profitCalculator.deleteExpense);

  const addGoal = useMutation(api.profitCalculator.addFinancialGoal);
  const deleteGoal = useMutation(api.profitCalculator.deleteFinancialGoal);
  const markAlertAsRead = useMutation(api.profitCalculator.markAlertAsRead);

  const calculatePrice = useAction(api.profitCalculator.calculateSuggestedPrice);

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
      tags: [],
    });
    setEditingProductId(null);
  };

  const resetSaleForm = () => {
    setSaleForm({
      productId: "",
      quantity: "",
      discount: "",
      date: new Date().toISOString().split("T")[0],
      paymentMethod: "pix",
      paymentStatus: "paid",
      notes: "",
    });
  };

  const resetExpenseForm = () => {
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
  };

  const handleAddProduct = async () => {
    if (!productForm.name.trim() || !productForm.costPrice || !productForm.salePrice) {
      toast.error("Preencha os campos obrigatórios!");
      return;
    }

    try {
      await addProduct({
        name: productForm.name,
        costPrice: parseFloat(productForm.costPrice),
        salePrice: parseFloat(productForm.salePrice),
        sku: productForm.sku || undefined,
        category: productForm.category || undefined,
        stock: productForm.stock ? parseInt(productForm.stock) : undefined,
        minStock: productForm.minStock ? parseInt(productForm.minStock) : undefined,
        unit: productForm.unit || undefined,
        description: productForm.description || undefined,
        tags: productForm.tags.length > 0 ? productForm.tags : undefined,
        supplierId: productForm.supplierId,
      });

      toast.success("✅ Produto cadastrado!");
      setShowAddProduct(false);
      resetProductForm();
    } catch (error) {
      toast.error("Erro ao cadastrar produto");
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
        tags: productForm.tags.length > 0 ? productForm.tags : undefined,
        supplierId: productForm.supplierId,
      });

      toast.success("✅ Produto atualizado!");
      setShowEditProduct(false);
      resetProductForm();
    } catch (error) {
      toast.error("Erro ao atualizar produto");
      console.error(error);
    }
  };

  const handleDeleteProduct = async (id: Id<"products">, permanent = false) => {
    try {
      await deleteProduct({ id, permanent });
      toast.success(permanent ? "🗑️ Produto deletado!" : "✅ Produto desativado!");
    } catch {
      toast.error("Erro ao deletar produto");
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
      tags: product.tags || [],
      supplierId: product.supplierId,
    });
    setEditingProductId(productId);
    setShowEditProduct(true);
  };

  const handleAddSale = async () => {
    if (!saleForm.productId || !saleForm.quantity || !saleForm.date) {
      toast.error("Preencha os campos obrigatórios!");
      return;
    }

    try {
      await addSale({
        productId: saleForm.productId as Id<"products">,
        customerId: saleForm.customerId as Id<"customers"> | undefined,
        quantity: parseInt(saleForm.quantity),
        discount: saleForm.discount ? parseFloat(saleForm.discount) : undefined,
        date: saleForm.date,
        paymentMethod: saleForm.paymentMethod as "cash" | "credit_card" | "debit_card" | "pix" | "bank_transfer" | "other" | undefined,
        paymentStatus: saleForm.paymentStatus as "paid" | "pending" | "overdue" | "cancelled" | undefined,
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
      resetSaleForm();
    } catch (error) {
      toast.error("Erro ao registrar venda");
      console.error(error);
    }
  };

  const handleDeleteSale = async (id: Id<"sales">, permanent = false) => {
    try {
      await deleteSale({ id, permanent });
      toast.success("🗑️ Venda deletada!");
    } catch {
      toast.error("Erro ao deletar venda");
    }
  };

  const handleAddExpense = async () => {
    if (!expenseForm.description.trim() || !expenseForm.amount || !expenseForm.date) {
      toast.error("Preencha os campos obrigatórios!");
      return;
    }

    try {
      await addExpense({
        description: expenseForm.description,
        amount: parseFloat(expenseForm.amount),
        categoryName: expenseForm.categoryName,
        type: expenseForm.type,
        date: expenseForm.date,
        paymentMethod: expenseForm.paymentMethod as "cash" | "credit_card" | "debit_card" | "pix" | "bank_transfer" | "other" | undefined,
        paymentStatus: expenseForm.paymentStatus as "paid" | "pending" | "overdue" | undefined,
        notes: expenseForm.notes || undefined,
        supplierId: expenseForm.supplierId as Id<"suppliers"> | undefined,
      });

      toast.success("✅ Gasto registrado!");
      setShowAddExpense(false);
      resetExpenseForm();
    } catch (error) {
      toast.error("Erro ao registrar gasto");
      console.error(error);
    }
  };

  const handleDeleteExpense = async (id: Id<"expenses">, permanent = false) => {
    try {
      await deleteExpense({ id, permanent });
      toast.success("🗑️ Gasto deletado!");
    } catch {
      toast.error("Erro ao deletar gasto");
    }
  };

  const handleAddCustomer = async () => {
    if (!customerForm.name.trim()) {
      toast.error("Digite o nome do cliente!");
      return;
    }

    try {
      await addCustomer({
        name: customerForm.name,
        email: customerForm.email || undefined,
        phone: customerForm.phone || undefined,
        address: customerForm.address || undefined,
        tags: customerForm.tags.length > 0 ? customerForm.tags : undefined,
        notes: customerForm.notes || undefined,
      });

      toast.success("✅ Cliente cadastrado!");
      setShowAddCustomer(false);
      setCustomerForm({ name: "", email: "", phone: "", address: "", tags: [], notes: "" });
    } catch (error) {
      toast.error("Erro ao cadastrar cliente");
      console.error(error);
    }
  };

  const handleAddSupplier = async () => {
    if (!supplierForm.name.trim()) {
      toast.error("Digite o nome do fornecedor!");
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
      toast.error("Erro ao cadastrar fornecedor");
      console.error(error);
    }
  };

  const handleAddGoal = async () => {
    if (!goalForm.title.trim() || !goalForm.targetValue) {
      toast.error("Preencha os campos obrigatórios!");
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
      setGoalForm({
        type: "revenue",
        title: "",
        description: "",
        targetValue: "",
        period: "monthly",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split("T")[0],
      });
    } catch (error) {
      toast.error("Erro ao criar meta");
      console.error(error);
    }
  };

  const handleCalculatePrice = async () => {
    if (!priceCalcForm.costPrice) {
      toast.error("Digite o custo do produto!");
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
      toast.error("Erro ao calcular preço");
      console.error(error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Digite algo para buscar!");
      return;
    }

    try {
      const results = await convex.query(api.profitCalculator.globalSearch, {
        query: searchQuery,
      });
      setSearchResults(results);
    } catch (error) {
      toast.error("Erro na busca");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 pb-12">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-[1600px] mx-auto px-4 py-6">
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
                          {alert.severity === "critical" && (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          )}
                          {alert.severity === "warning" && (
                            <AlertCircle className="w-4 h-4 text-orange-500" />
                          )}
                          {alert.severity === "info" && (
                            <Info className="w-4 h-4 text-blue-500" />
                          )}
                          <span className="font-semibold text-sm">{alert.title}</span>
                        </div>
                        <p className="text-xs text-gray-600">{alert.message}</p>
                      </DropdownMenuItem>
                    ))
                  )}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowSearch(true)}
            >
              <Search className="w-5 h-5" />
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowPriceCalculator(true)}
              className="hidden md:flex"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Calcular Preço
            </Button>
          </div>
        </div>

        <Card className="p-4 bg-white/80 backdrop-blur-sm border-2 mb-6">
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

        {monthlyReport && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white overflow-hidden relative">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingCart className="w-5 h-5" />
                  <p className="text-sm font-medium opacity-90">Receita</p>
                </div>
                <p className="text-2xl font-black">{formatCurrency(monthlyReport.totalRevenue)}</p>
                <p className="text-xs opacity-75 mt-1">{monthlyReport.totalSales} vendas</p>
              </div>
              <TrendingUpIcon className="absolute -bottom-4 -right-4 w-24 h-24 opacity-10" />
            </Card>

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

            <Card
              className={`p-4 border-0 text-white overflow-hidden relative ${
                monthlyReport.netProfit >= 0
                  ? "bg-gradient-to-br from-emerald-500 to-emerald-600"
                  : "bg-gradient-to-br from-orange-500 to-orange-600"
              }`}
            >
              <div className="relative z-10">
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
              </div>
              <DollarSign className="absolute -bottom-4 -right-4 w-24 h-24 opacity-10" />
            </Card>

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

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="space-y-6">
          <TabsList className="grid grid-cols-4 md:grid-cols-8 w-full bg-white shadow-lg h-auto p-1">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white py-3 text-xs md:text-sm">
              <BarChart3 className="w-4 h-4 mr-0 md:mr-2" />
              <span className="hidden md:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="produtos" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white py-3 text-xs md:text-sm">
              <Package className="w-4 h-4 mr-0 md:mr-2" />
              <span className="hidden md:inline">Produtos</span>
            </TabsTrigger>
            <TabsTrigger value="vendas" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-green-600 data-[state=active]:text-white py-3 text-xs md:text-sm">
              <ShoppingCart className="w-4 h-4 mr-0 md:mr-2" />
              <span className="hidden md:inline">Vendas</span>
            </TabsTrigger>
            <TabsTrigger value="gastos" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-600 data-[state=active]:text-white py-3 text-xs md:text-sm">
              <Receipt className="w-4 h-4 mr-0 md:mr-2" />
              <span className="hidden md:inline">Gastos</span>
            </TabsTrigger>
            <TabsTrigger value="resumo" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white py-3 text-xs md:text-sm">
              <FileText className="w-4 h-4 mr-0 md:mr-2" />
              <span className="hidden md:inline">Resumo</span>
            </TabsTrigger>
            <TabsTrigger value="metas" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-600 data-[state=active]:to-orange-600 data-[state=active]:text-white py-3 text-xs md:text-sm">
              <Target className="w-4 h-4 mr-0 md:mr-2" />
              <span className="hidden md:inline">Metas</span>
            </TabsTrigger>
            <TabsTrigger value="clientes" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-rose-600 data-[state=active]:text-white py-3 text-xs md:text-sm">
              <Users className="w-4 h-4 mr-0 md:mr-2" />
              <span className="hidden md:inline">Clientes</span>
            </TabsTrigger>
            <TabsTrigger value="fornecedores" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white py-3 text-xs md:text-sm">
              <Truck className="w-4 h-4 mr-0 md:mr-2" />
              <span className="hidden md:inline">Fornecedores</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            {!dashboard ? (
              <Card className="p-12 text-center">
                <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-400 animate-pulse" />
                <p className="text-gray-500">Carregando dashboard...</p>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                      Receita Total
                    </h3>
                    <p className="text-3xl font-black text-blue-600">
                      {formatCurrency(dashboard.overview.totalRevenue)}
                    </p>
                  </Card>

                  <Card className="p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                      Lucro Líquido
                    </h3>
                    <p className={`text-3xl font-black ${
                      dashboard.overview.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(dashboard.overview.netProfit)}
                    </p>
                  </Card>

                  <Card className="p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5 text-purple-600" />
                      Produtos
                    </h3>
                    <p className="text-3xl font-black text-purple-600">
                      {dashboard.products.total}
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
              </div>
            )}
          </TabsContent>

          <TabsContent value="produtos">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Seus Produtos</h3>
                <Button onClick={() => setShowAddProduct(true)} className="bg-purple-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Produto
                </Button>
              </div>

              {products.length === 0 ? (
                <Card className="p-12 text-center border-2 border-dashed">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-bold mb-2">Nenhum produto</h3>
                  <Button onClick={() => setShowAddProduct(true)}>Cadastrar Primeiro Produto</Button>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => {
                    const profit = product.salePrice - product.costPrice;
                    const profitMargin = (profit / product.salePrice) * 100;

                    return (
                      <Card key={product._id} className="p-4">
                        <div className="flex justify-between mb-3">
                          <div>
                            <h4 className="font-bold">{product.name}</h4>
                            {product.category && <Badge variant="outline">{product.category}</Badge>}
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
                              <DropdownMenuItem onClick={() => handleDeleteProduct(product._id, true)} className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Deletar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="space-y-2 text-sm mb-3">
                          <div className="flex justify-between">
                            <span>Custo:</span>
                            <span className="font-semibold">{formatCurrency(product.costPrice)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Venda:</span>
                            <span className="font-semibold text-blue-600">{formatCurrency(product.salePrice)}</span>
                          </div>
                          {product.stock !== undefined && (
                            <div className="flex justify-between">
                              <span>Estoque:</span>
                              <span className="font-semibold">{product.stock} {product.unit}</span>
                            </div>
                          )}
                        </div>

                        <Separator className="my-3" />

                        <div className="bg-emerald-50 rounded p-3">
                          <div className="flex justify-between">
                            <div>
                              <p className="text-xs text-gray-600">Lucro:</p>
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

          <TabsContent value="vendas">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Vendas do Mês</h3>
                <Button onClick={() => setShowAddSale(true)} className="bg-emerald-600" disabled={products.length === 0}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Venda
                </Button>
              </div>

              {sales.length === 0 ? (
                <Card className="p-12 text-center border-2 border-dashed">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-bold mb-2">Nenhuma venda</h3>
                  <Button onClick={() => setShowAddSale(true)} disabled={products.length === 0}>
                    Registrar Primeira Venda
                  </Button>
                </Card>
              ) : (
                <div className="space-y-3">
                  {sales.map((sale) => (
                    <Card key={sale._id} className="p-4">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-bold">{sale.productName}</h4>
                          <p className="text-sm text-gray-600">
                            {sale.quantity}x {formatCurrency(sale.salePrice)} • {formatDate(sale.date)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-emerald-600">{formatCurrency(sale.profit)}</p>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDeleteSale(sale._id, true)}>
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

          <TabsContent value="gastos">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Gastos do Mês</h3>
                <Button onClick={() => setShowAddExpense(true)} className="bg-red-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Gasto
                </Button>
              </div>

              {expenses.length === 0 ? (
                <Card className="p-12 text-center border-2 border-dashed">
                  <Receipt className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-bold mb-2">Nenhum gasto</h3>
                  <Button onClick={() => setShowAddExpense(true)}>Registrar Primeiro Gasto</Button>
                </Card>
              ) : (
                <div className="space-y-3">
                  {expenses.map((expense) => (
                    <Card key={expense._id} className="p-4">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-bold">{expense.description}</h4>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">{expense.categoryName}</Badge>
                            <p className="text-sm text-gray-600">{formatDate(expense.date)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-600">{formatCurrency(expense.amount)}</p>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDeleteExpense(expense._id, true)}>
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

          <TabsContent value="resumo">
            {!monthlyReport ? (
              <Card className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-bold mb-2">Sem dados para o mês</h3>
                <p className="text-gray-500">Registre vendas e gastos para gerar o relatório</p>
              </Card>
            ) : (
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-2xl font-bold mb-6">Resumo de {getCurrentMonthName()}</h3>

                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Receita</p>
                      <p className="text-2xl font-bold text-blue-600">{formatCurrency(monthlyReport.totalRevenue)}</p>
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
                            <div key={product.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
                                  {idx + 1}
                                </div>
                                <div>
                                  <p className="font-semibold">{product.productName}</p>
                                  <p className="text-sm text-gray-600">{product.quantity} vendas</p>
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
          </TabsContent>

          <TabsContent value="metas">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Suas Metas</h3>
                <Button onClick={() => setShowAddGoal(true)} className="bg-yellow-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Meta
                </Button>
              </div>

              {goals.length === 0 ? (
                <Card className="p-12 text-center border-2 border-dashed">
                  <Target className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-bold mb-2">Nenhuma meta ativa</h3>
                  <Button onClick={() => setShowAddGoal(true)}>Criar Primeira Meta</Button>
                </Card>
              ) : (
                <div className="space-y-4">
                  {goals.map((goal) => {
                    const progress = (goal.currentValue / goal.targetValue) * 100;
                    return (
                      <Card key={goal._id} className="p-6">
                        <div className="flex justify-between mb-4">
                          <div>
                            <h4 className="font-bold text-lg">{goal.title}</h4>
                            {goal.description && <p className="text-sm text-gray-600">{goal.description}</p>}
                          </div>
                          <Button size="icon" variant="ghost" onClick={() => deleteGoal({ id: goal._id })}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progresso:</span>
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

          <TabsContent value="clientes">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Seus Clientes</h3>
                <Button onClick={() => setShowAddCustomer(true)} className="bg-pink-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Cliente
                </Button>
              </div>

              {customers.length === 0 ? (
                <Card className="p-12 text-center border-2 border-dashed">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-bold mb-2">Nenhum cliente</h3>
                  <Button onClick={() => setShowAddCustomer(true)}>Cadastrar Primeiro Cliente</Button>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {customers.map((customer) => (
                    <Card key={customer._id} className="p-4">
                      <div className="flex justify-between mb-3">
                        <div>
                          <h4 className="font-bold">{customer.name}</h4>
                          {customer.email && <p className="text-sm text-gray-600">{customer.email}</p>}
                        </div>
                        <Button size="icon" variant="ghost" onClick={() => deleteCustomer({ id: customer._id })}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
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

          <TabsContent value="fornecedores">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Seus Fornecedores</h3>
                <Button onClick={() => setShowAddSupplier(true)} className="bg-teal-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Fornecedor
                </Button>
              </div>

              {suppliers.length === 0 ? (
                <Card className="p-12 text-center border-2 border-dashed">
                  <Truck className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-bold mb-2">Nenhum fornecedor</h3>
                  <Button onClick={() => setShowAddSupplier(true)}>Cadastrar Primeiro Fornecedor</Button>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {suppliers.map((supplier) => (
                    <Card key={supplier._id} className="p-4">
                      <div className="flex justify-between mb-3">
                        <div>
                          <h4 className="font-bold">{supplier.name}</h4>
                          {supplier.contact?.email && <p className="text-sm text-gray-600">{supplier.contact.email}</p>}
                        </div>
                        <Button size="icon" variant="ghost" onClick={() => deleteSupplier({ id: supplier._id })}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                      {supplier.contact?.phone && (
                        <p className="text-sm text-gray-600">Tel: {supplier.contact.phone}</p>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* DIALOGS */}

      <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
  <DialogTitle>➕ Cadastrar Novo Produto</DialogTitle>
  <DialogDescription>
    Preencha os dados do produto para cadastro no sistema
  </DialogDescription>
</DialogHeader>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Nome do Produto *</Label>
                <Input value={productForm.name} onChange={(e) => setProductForm({...productForm, name: e.target.value})} placeholder="Ex: Camiseta Básica" />
              </div>
              <div>
                <Label>SKU / Código</Label>
                <Input value={productForm.sku} onChange={(e) => setProductForm({...productForm, sku: e.target.value})} placeholder="Ex: CAM-001" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Preço de Custo *</Label>
                <Input type="number" step="0.01" value={productForm.costPrice} onChange={(e) => setProductForm({...productForm, costPrice: e.target.value})} placeholder="0,00" />
              </div>
              <div>
                <Label>Preço de Venda *</Label>
                <Input type="number" step="0.01" value={productForm.salePrice} onChange={(e) => setProductForm({...productForm, salePrice: e.target.value})} placeholder="0,00" />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
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

            {productForm.costPrice && productForm.salePrice && (
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

      <Dialog open={showEditProduct} onOpenChange={setShowEditProduct}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
  <DialogTitle>✏️ Editar Produto</DialogTitle>
  <DialogDescription>
    Altere as informações do produto
  </DialogDescription>
</DialogHeader>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Nome do Produto</Label>
                <Input value={productForm.name} onChange={(e) => setProductForm({...productForm, name: e.target.value})} />
              </div>
              <div>
                <Label>SKU</Label>
                <Input value={productForm.sku} onChange={(e) => setProductForm({...productForm, sku: e.target.value})} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Custo</Label>
                <Input type="number" step="0.01" value={productForm.costPrice} onChange={(e) => setProductForm({...productForm, costPrice: e.target.value})} />
              </div>
              <div>
                <Label>Venda</Label>
                <Input type="number" step="0.01" value={productForm.salePrice} onChange={(e) => setProductForm({...productForm, salePrice: e.target.value})} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Estoque</Label>
                <Input type="number" value={productForm.stock} onChange={(e) => setProductForm({...productForm, stock: e.target.value})} />
              </div>
              <div>
                <Label>Estoque Mínimo</Label>
                <Input type="number" value={productForm.minStock} onChange={(e) => setProductForm({...productForm, minStock: e.target.value})} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditProduct(false)}>Cancelar</Button>
            <Button onClick={handleEditProduct}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

     <Dialog open={showAddSale} onOpenChange={setShowAddSale}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>🛒 Registrar Venda</DialogTitle>
      <DialogDescription>
        Registre uma nova venda e atualize o estoque automaticamente
      </DialogDescription>
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
                {p.name} - {formatCurrency(p.salePrice)}
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
            value={saleForm.quantity}
            onChange={(e) => setSaleForm({...saleForm, quantity: e.target.value})}
            placeholder="1"
          />
        </div>
        <div>
          <Label>Data *</Label>
          <Input
            type="date"
            value={saleForm.date}
            onChange={(e) => setSaleForm({...saleForm, date: e.target.value})}
          />
        </div>
      </div>

      <div>
        <Label>Cliente (opcional)</Label>
        <Select
          value={saleForm.customerId || undefined}
          onValueChange={(v) => setSaleForm({...saleForm, customerId: v})}
        >
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
        <Input
          type="number"
          step="0.01"
          min="0"
          value={saleForm.discount}
          onChange={(e) => setSaleForm({...saleForm, discount: e.target.value})}
          placeholder="0,00"
        />
      </div>

      <div>
        <Label>Observações</Label>
        <Textarea
          value={saleForm.notes}
          onChange={(e) => setSaleForm({...saleForm, notes: e.target.value})}
          rows={2}
          placeholder="Informações adicionais sobre a venda"
        />
      </div>
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setShowAddSale(false)}>
        Cancelar
      </Button>
      <Button onClick={handleAddSale} className="bg-emerald-600">
        <Save className="w-4 h-4 mr-2" />
        Registrar Venda
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

      <Dialog open={showAddExpense} onOpenChange={setShowAddExpense}>
        <DialogContent>
          <DialogHeader>
  <DialogTitle>💸 Registrar Gasto</DialogTitle>
  <DialogDescription>
    Registre uma despesa ou gasto do negócio
  </DialogDescription>
</DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Descrição *</Label>
              <Input value={expenseForm.description} onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})} placeholder="Ex: Conta de luz" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Valor *</Label>
                <Input type="number" step="0.01" value={expenseForm.amount} onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})} />
              </div>
              <div>
                <Label>Data *</Label>
                <Input type="date" value={expenseForm.date} onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})} />
              </div>
            </div>

            <div>
              <Label>Categoria</Label>
              <Input value={expenseForm.categoryName} onChange={(e) => setExpenseForm({...expenseForm, categoryName: e.target.value})} />
            </div>

            <div>
              <Label>Tipo</Label>
              <Select value={expenseForm.type} onValueChange={(v: "fixed" | "variable" | "one_time") => setExpenseForm({...expenseForm, type: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixo</SelectItem>
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

      <Dialog open={showAddCustomer} onOpenChange={setShowAddCustomer}>
        <DialogContent>
        <DialogHeader>
  <DialogTitle>👤 Cadastrar Cliente</DialogTitle>
  <DialogDescription>
    Adicione um novo cliente ao sistema
  </DialogDescription>
</DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome *</Label>
              <Input value={customerForm.name} onChange={(e) => setCustomerForm({...customerForm, name: e.target.value})} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={customerForm.email} onChange={(e) => setCustomerForm({...customerForm, email: e.target.value})} />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input value={customerForm.phone} onChange={(e) => setCustomerForm({...customerForm, phone: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddCustomer(false)}>Cancelar</Button>
            <Button onClick={handleAddCustomer} className="bg-pink-600">Salvar Cliente</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddSupplier} onOpenChange={setShowAddSupplier}>
        <DialogContent>
          <DialogHeader>
  <DialogTitle>🚚 Cadastrar Fornecedor</DialogTitle>
  <DialogDescription>
    Adicione um novo fornecedor ao sistema
  </DialogDescription>
</DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome *</Label>
              <Input value={supplierForm.name} onChange={(e) => setSupplierForm({...supplierForm, name: e.target.value})} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={supplierForm.email} onChange={(e) => setSupplierForm({...supplierForm, email: e.target.value})} />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input value={supplierForm.phone} onChange={(e) => setSupplierForm({...supplierForm, phone: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSupplier(false)}>Cancelar</Button>
            <Button onClick={handleAddSupplier} className="bg-teal-600">Salvar Fornecedor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddGoal} onOpenChange={setShowAddGoal}>
        <DialogContent>
          <DialogHeader>
  <DialogTitle>🎯 Criar Meta</DialogTitle>
  <DialogDescription>
    Defina uma meta financeira para acompanhar seu progresso
  </DialogDescription>
</DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Título *</Label>
              <Input value={goalForm.title} onChange={(e) => setGoalForm({...goalForm, title: e.target.value})} placeholder="Ex: Faturar R$ 10.000" />
            </div>

            <div>
              <Label>Tipo de Meta</Label>
              <Select value={goalForm.type} onValueChange={(v: "revenue" | "profit" | "margin" | "sales_count" | "expense_reduction") => setGoalForm({...goalForm, type: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Receita</SelectItem>
                  <SelectItem value="profit">Lucro</SelectItem>
                  <SelectItem value="margin">Margem (%)</SelectItem>
                  <SelectItem value="sales_count">Número de Vendas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Valor Alvo *</Label>
              <Input type="number" value={goalForm.targetValue} onChange={(e) => setGoalForm({...goalForm, targetValue: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
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

      <Dialog open={showPriceCalculator} onOpenChange={setShowPriceCalculator}>
        <DialogContent>
          <DialogHeader>
  <DialogTitle>🧮 Calculadora de Preço</DialogTitle>
  <DialogDescription>
    Descubra o preço ideal para seu produto com base em custos e margem
  </DialogDescription>
</DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Custo do Produto *</Label>
              <Input type="number" step="0.01" value={priceCalcForm.costPrice} onChange={(e) => setPriceCalcForm({...priceCalcForm, costPrice: e.target.value})} placeholder="Ex: 50.00" />
            </div>

            <div>
              <Label>Margem Desejada (%)</Label>
              <Input type="number" value={priceCalcForm.targetMargin} onChange={(e) => setPriceCalcForm({...priceCalcForm, targetMargin: e.target.value})} placeholder="Ex: 40" />
            </div>

            <div>
              <Label>Categoria</Label>
              <Input value={priceCalcForm.category} onChange={(e) => setPriceCalcForm({...priceCalcForm, category: e.target.value})} placeholder="Ex: roupas" />
            </div>

            <Button onClick={handleCalculatePrice} className="w-full">
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
                    <div className="grid grid-cols-2 gap-2 text-sm mt-4">
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
                  {priceCalcResult.analysis.map((insight, idx) => (
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

      <Dialog open={showSearch} onOpenChange={setShowSearch}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
  <DialogTitle>🔍 Buscar em Tudo</DialogTitle>
  <DialogDescription>
    Pesquise produtos, vendas, gastos, clientes e fornecedores
  </DialogDescription>
</DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Digite para buscar..." onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
              <Button onClick={handleSearch}>
                <Search className="w-4 h-4" />
              </Button>
            </div>

            {searchResults && (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {searchResults.products.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Produtos ({searchResults.products.length})
                    </h4>
                    <div className="space-y-2">
                      {searchResults.products.slice(0, 5).map((p) => (
                        <div key={p._id} className="p-2 bg-gray-50 rounded text-sm">
                          <p className="font-semibold">{p.name}</p>
                          <p className="text-gray-600">{formatCurrency(p.salePrice)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.sales.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      Vendas ({searchResults.sales.length})
                    </h4>
                    <div className="space-y-2">
                      {searchResults.sales.slice(0, 5).map((s) => (
                        <div key={s._id} className="p-2 bg-gray-50 rounded text-sm">
                          <p className="font-semibold">{s.productName}</p>
                          <p className="text-gray-600">{formatDate(s.date)} • {formatCurrency(s.totalRevenue)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.expenses.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Receipt className="w-4 h-4" />
                      Gastos ({searchResults.expenses.length})
                    </h4>
                    <div className="space-y-2">
                      {searchResults.expenses.slice(0, 5).map((e) => (
                        <div key={e._id} className="p-2 bg-gray-50 rounded text-sm">
                          <p className="font-semibold">{e.description}</p>
                          <p className="text-gray-600">{formatDate(e.date)} • {formatCurrency(e.amount)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.customers.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Clientes ({searchResults.customers.length})
                    </h4>
                    <div className="space-y-2">
                      {searchResults.customers.slice(0, 5).map((c) => (
                        <div key={c._id} className="p-2 bg-gray-50 rounded text-sm">
                          <p className="font-semibold">{c.name}</p>
                          <p className="text-gray-600">{c.email}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}