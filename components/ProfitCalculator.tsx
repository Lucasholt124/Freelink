"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Doc } from "@/convex/_generated/dataModel";
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
  Zap,
  Search,
  Check,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Menu,
  Rocket,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
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
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Onboarding } from "./Onboarding";
import { FloatingActionButton } from "./FloatingActionButton";
import { GamificationBar } from "./Gamification";
import { offlineManager } from "@/lib/offlineManager";
import { PDFExporter } from "@/lib/pdfExporter";
import { Download } from "lucide-react";

type TabType = "dashboard" | "produtos" | "vendas" | "gastos" | "resumo" | "metas" | "clientes" | "fornecedores" | "rapido";
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

const handleApiError = (error: unknown, defaultMessage: string) => {
  console.error("API Error:", error);

  if (error instanceof Error) {
    // Erros específicos da API
    if (error.message.includes("duplicate")) {
      toast.error("❌ Já existe um registro com estes dados");
    } else if (error.message.includes("network")) {
      toast.error("❌ Erro de conexão. Verifique sua internet");
    } else if (error.message.includes("unauthorized")) {
      toast.error("❌ Sessão expirada. Recarregue a página");
    } else if (error.message.includes("not found")) {
      toast.error("❌ Registro não encontrado");
    } else {
      toast.error(`❌ ${error.message}`);
    }
  } else {
    toast.error(`❌ ${defaultMessage}`);
  }
};

export default function FinancialManagerPro() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

    const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
    const userStats = useQuery(api.gamification.getUserStats);
  const initStats = useMutation(api.gamification.initUserStats);
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [showAddSale, setShowAddSale] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showPriceCalculator, setShowPriceCalculator] = useState(false);
  const [showQuickSale, setShowQuickSale] = useState(false);
  const [showQuickExpense, setShowQuickExpense] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [editingProductId, setEditingProductId] = useState<Id<"products"> | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const deleteCashFlow = useMutation(api.profitCalculator.deleteCashFlow);

  // ✅ ESTADOS PARA MODO OFFLINE
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSync, setPendingSync] = useState({ sales: 0, expenses: 0, total: 0 });


  useEffect(() => {
    const checkFirstAccess = async () => {
      const seen = localStorage.getItem("onboarding_completed");
      if (!seen) {
        setShowOnboarding(true);
      }

      // Inicializar stats se não existir
      if (!userStats) {
        await initStats();
      }
    };

    checkFirstAccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ INICIALIZAR MODO OFFLINE
  useEffect(() => {
    offlineManager.init();

    // Atualizar status de conexão
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Sincronizar quando voltar online
    offlineManager.onSync(async () => {
      await syncOfflineData();
    });

    // Verificar dados pendentes periodicamente
    checkPendingData();
    const interval = setInterval(checkPendingData, 5000);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkPendingData = async () => {
    const count = await offlineManager.getPendingCount();
    setPendingSync(count);
  };

  const syncOfflineData = async () => {
    try {
      const { sales, expenses } = await offlineManager.syncAll();

      // Sincronizar vendas
      for (const sale of sales) {
        try {
          await addQuickSale({
            costPrice: sale.costPrice,
            amount: sale.salePrice,
            description: sale.description,
            paymentMethod: sale.paymentMethod as PaymentMethod,
            date: sale.date,
          });
          await offlineManager.markAsSynced('sales', sale.id);
          toast.success(`✅ Venda sincronizada: ${sale.description}`);
        } catch (error) {
          console.error('Erro ao sincronizar venda:', error);
        }
      }

      // Sincronizar gastos
      for (const expense of expenses) {
        try {
          await addQuickExpense({
            amount: expense.amount,
            description: expense.description,
            category: expense.category,
            paymentMethod: expense.paymentMethod as PaymentMethod,
          });
          await offlineManager.markAsSynced('expenses', expense.id);
          toast.success(`✅ Gasto sincronizado: ${expense.description}`);
        } catch (error) {
          console.error('Erro ao sincronizar gasto:', error);
        }
      }

      await checkPendingData();
      if (sales.length + expenses.length > 0) {
        toast.success(`🎉 ${sales.length + expenses.length} registros sincronizados!`);
      }
    } catch (error) {
      toast.error('❌ Erro ao sincronizar dados offline');
      console.error(error);
    }
  };
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

const [quickSaleForm, setQuickSaleForm] = useState({
  costPrice: "",
  salePrice: "",
  description: "",
  paymentMethod: "pix" as PaymentMethod,
  date: new Date().toISOString().split("T")[0],
});

  const [quickExpenseForm, setQuickExpenseForm] = useState({
    amount: "",
    description: "",
    category: "Outros",
    paymentMethod: "pix" as PaymentMethod,
  });

  const [priceCalcResult, setPriceCalcResult] = useState<PriceCalculationResult | null>(null);

  const productsQuery = useQuery(api.profitCalculator.getProducts, { activeOnly: false });
  const products = useMemo(() => productsQuery ?? [], [productsQuery]);
  const sales = useQuery(api.profitCalculator.getSalesByMonth, { month: selectedMonth }) ?? [];
  const expenses = useQuery(api.profitCalculator.getExpensesByMonth, { month: selectedMonth }) ?? [];
  const monthlyReport = useQuery(api.profitCalculator.getMonthlyReport, { month: selectedMonth });
  const allMonths = useQuery(api.profitCalculator.getAllMonths, {}) ?? [];
  const dashboard = useQuery(api.profitCalculator.getDashboard, {});
  const alerts = useQuery(api.profitCalculator.getAlerts, { unreadOnly: true }) ?? [];
  const goals = useQuery(api.profitCalculator.getFinancialGoals, { status: "active" }) ?? [];
  const customers = useQuery(api.profitCalculator.getCustomers, {}) ?? [];
  const suppliers = useQuery(api.profitCalculator.getSuppliers, {}) ?? [];
  const dailySummary = useQuery(api.profitCalculator.getDailySummary, {});
  const cashFlow = useQuery(api.profitCalculator.getCashFlow, { limit: 10 }) ?? [];

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
  const clearMonthData = useMutation(api.profitCalculator.clearMonthData);
  const clearAllData = useMutation(api.profitCalculator.clearAllData);
  const addQuickSale = useMutation(api.profitCalculator.addQuickSale);
  const addQuickExpense = useMutation(api.profitCalculator.addQuickExpense);

  const calculatePrice = useAction(api.profitCalculator.calculateSuggestedPrice);
  const generateReport = useAction(api.profitCalculator.generateMonthlyReport);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const quickSaleLucro = useMemo(() => {
    const cost = parseFloat(quickSaleForm.costPrice);
    const sale = parseFloat(quickSaleForm.salePrice);

    if (isNaN(cost) || isNaN(sale) || cost <= 0 || sale <= 0) {
      return 0;
    }

    return sale - cost;
  }, [quickSaleForm.costPrice, quickSaleForm.salePrice]);

  const quickSaleMargin = useMemo(() => {
    const cost = parseFloat(quickSaleForm.costPrice);
    const sale = parseFloat(quickSaleForm.salePrice);

    if (isNaN(cost) || isNaN(sale) || cost <= 0 || sale <= 0) {
      return 0;
    }

    return ((sale - cost) / sale) * 100;
  }, [quickSaleForm.costPrice, quickSaleForm.salePrice]);

  const isValidQuickSale = useMemo(() => {
    const cost = parseFloat(quickSaleForm.costPrice);
    const sale = parseFloat(quickSaleForm.salePrice);

    return !isNaN(cost) && !isNaN(sale) && cost > 0 && sale > cost;
  }, [quickSaleForm.costPrice, quickSaleForm.salePrice]);

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

  const formatMonthName = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });
  };

  const navigateMonth = (direction: "prev" | "next") => {
  const [year, month] = selectedMonth.split("-").map(Number);
  const date = new Date(year, month - 1);
  date.setMonth(date.getMonth() + (direction === "next" ? 1 : -1));

  // Limita navegação: 5 anos para trás, até o mês atual
  const today = new Date();
  const minDate = new Date();
  minDate.setFullYear(today.getFullYear() - 5);

  if (date < minDate) {
    toast.error("⚠️ Não é possível navegar mais de 5 anos para trás");
    return;
  }

  // Permite navegar até o final do mês atual
  const endOfCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  if (date > endOfCurrentMonth) {
    toast.error("⚠️ Não é possível navegar para meses futuros");
    return;
  }

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

  const validateProduct = (form: typeof productForm): string[] => {
  const errors: string[] = [];

  if (!form.name.trim()) errors.push("Nome é obrigatório");
  if (form.name.length > 100) errors.push("Nome muito longo (máx 100 caracteres)");

  const costPrice = parseFloat(form.costPrice);
  const salePrice = parseFloat(form.salePrice);

  if (isNaN(costPrice) || costPrice <= 0) errors.push("Custo deve ser maior que zero");
  if (costPrice > 1000000) errors.push("Custo parece muito alto, confira");

  if (isNaN(salePrice) || salePrice <= 0) errors.push("Preço de venda deve ser maior que zero");
  if (salePrice > 1000000) errors.push("Preço de venda parece muito alto, confira");

  if (salePrice <= costPrice) errors.push("Preço de venda deve ser maior que o custo");

  const margin = ((salePrice - costPrice) / salePrice) * 100;
  if (margin < 5) errors.push("Margem muito baixa (menos de 5%)");
  if (margin > 90) errors.push("Margem muito alta (mais de 90%), confira");

  if (form.stock && parseInt(form.stock) < 0) errors.push("Estoque não pode ser negativo");
  if (form.minStock && parseInt(form.minStock) < 0) errors.push("Estoque mínimo não pode ser negativo");

  return errors;
};

const [isSubmitting, setIsSubmitting] = useState(false);

const handleAddProduct = async () => {
  const errors = validateProduct(productForm);
  if (errors.length > 0) {
    toast.error(errors[0]);
    return;
  }

  setIsSubmitting(true);
  try {
    await addProduct({
      name: productForm.name,
      costPrice: parseFloat(productForm.costPrice),
      salePrice: parseFloat(productForm.salePrice),
      sku: productForm.sku || undefined,
      category: productForm.category || undefined,
      stock: productForm.stock ? parseInt(productForm.stock) : undefined,
      minStock: productForm.minStock ? parseInt(productForm.minStock) : undefined,
      unit: productForm.unit || "un",
      description: productForm.description || undefined,
    });

    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    toast.success("✅ Produto cadastrado com sucesso!");
    setShowAddProduct(false);
    resetProductForm();
  } catch (error) {
    handleApiError(error, "Erro ao cadastrar produto");
  } finally {
    setIsSubmitting(false);
  }
};

  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

const handleEditProduct = async () => {
  if (!editingProductId) return;

  const errors = validateProduct(productForm);
  if (errors.length > 0) {
    toast.error(errors[0]);
    return;
  }

  setIsSubmittingEdit(true);
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
    handleApiError(error, "Erro ao atualizar produto");
  } finally {
    setIsSubmittingEdit(false);
  }
};

const handleDeleteProduct = async (id: Id<"products">, permanent = false) => {
  // ✅ CONFIRMAÇÃO ANTES DE DELETAR
  const product = products.find((p) => p._id === id);
  if (!product) return;

  const confirmMessage = permanent
    ? `⚠️ DELETAR PERMANENTEMENTE "${product.name}"?\n\nIsso vai:\n- Deletar o produto\n- Remover TODAS as vendas deste produto\n- Ajustar estoque e relatórios\n\nNÃO PODE SER DESFEITO!`
    : `Desativar "${product.name}"?\n\nO produto ficará inativo mas os dados serão preservados.`;

  if (!confirm(confirmMessage)) return;

  try {
    const result = await deleteProduct({ id, permanent });

    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ["#EF4444", "#F97316"]
    });

    const message = `✅ Produto ${permanent ? "deletado" : "desativado"}!${
      result.deletedSales ? ` ${result.deletedSales} vendas removidas.` : ""
    }${result.affectedMonths ? ` ${result.affectedMonths} relatórios atualizados.` : ""}`;

    toast.success(message);

    // ✅ NÃO PRECISA MAIS DE RELOAD!
    // O Convex atualiza automaticamente através das queries reativas

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    toast.error(`❌ Erro ao deletar produto: ${errorMessage}`);
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

  const validateSale = (form: typeof saleForm, product: Doc<"products">): string[] => {
  const errors: string[] = [];

  if (!form.productId) errors.push("Selecione um produto");
  if (!form.date) errors.push("Selecione uma data");

  const quantity = parseInt(form.quantity);
  if (isNaN(quantity) || quantity <= 0) {
    errors.push("Quantidade deve ser maior que zero");
  }
  if (quantity > 10000) {
    errors.push("Quantidade muito alta, confira");
  }

  // Valida data
  const saleDate = new Date(form.date);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  if (saleDate > today) {
    errors.push("Data não pode ser no futuro");
  }
  if (saleDate < oneYearAgo) {
    errors.push("Data muito antiga (mais de 1 ano)");
  }

  // Valida estoque
  if (product && product.stock !== undefined) {
    if (product.stock < quantity) {
      errors.push(`Estoque insuficiente! Disponível: ${product.stock}`);
    }
  }

  // Valida desconto
  if (form.discount) {
    const discount = parseFloat(form.discount);
    const totalPrice = product.salePrice * quantity;

    if (discount < 0) errors.push("Desconto não pode ser negativo");
    if (discount >= totalPrice) errors.push("Desconto maior que o valor total");
  }

  return errors;
};

const [, setIsSubmittingSale] = useState(false);

const handleAddSale = async () => {
  const product = products.find((p) => p._id === saleForm.productId);
  if (!product) {
    toast.error("❌ Produto não encontrado!");
    return;
  }

  const errors = validateSale(saleForm, product);
  if (errors.length > 0) {
    toast.error(errors[0]);
    return;
  }

  setIsSubmittingSale(true);
  try {
    await addSale({
      productId: saleForm.productId as Id<"products">,
      customerId: saleForm.customerId ? (saleForm.customerId as Id<"customers">) : undefined,
      quantity: parseInt(saleForm.quantity),
      discount: saleForm.discount ? parseFloat(saleForm.discount) : undefined,
      date: saleForm.date,
      paymentMethod: saleForm.paymentMethod,
      paymentStatus: saleForm.paymentStatus,
      notes: saleForm.notes || undefined,
    });

    await generateReport({ month: saleForm.date.substring(0, 7) });

    confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 }, colors: ["#10B981", "#3B82F6", "#F59E0B"] });

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
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    toast.error(`❌ Erro ao registrar: ${errorMessage}`);
    console.error("Sale creation error:", error);
  } finally {
    setIsSubmittingSale(false);
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

  const validateExpense = (form: typeof expenseForm): string[] => {
  const errors: string[] = [];

  if (!form.description.trim()) errors.push("Descrição é obrigatória");
  if (form.description.length > 200) errors.push("Descrição muito longa (máx 200 caracteres)");

  const amount = parseFloat(form.amount);
  if (isNaN(amount) || amount <= 0) errors.push("Valor deve ser maior que zero");
  if (amount > 1000000) errors.push("Valor muito alto, confira");

  // Valida data
  const expenseDate = new Date(form.date);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  if (expenseDate > today) {
    errors.push("Data não pode ser no futuro");
  }
  if (expenseDate < oneYearAgo) {
    errors.push("Data muito antiga (mais de 1 ano)");
  }

  return errors;
};

const [, setIsSubmittingExpense] = useState(false);

const handleAddExpense = async () => {
  const errors = validateExpense(expenseForm);
  if (errors.length > 0) {
    toast.error(errors[0]);
    return;
  }

  setIsSubmittingExpense(true);
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
    handleApiError(error, "Erro ao registrar gasto");
  } finally {
    setIsSubmittingExpense(false);
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

 const [isSubmittingQuickSale, setIsSubmittingQuickSale] = useState(false);

const handleQuickSale = async () => {
  // ✅ VALIDAÇÃO 1: CAMPOS OBRIGATÓRIOS
  if (!quickSaleForm.costPrice || !quickSaleForm.salePrice) {
    toast.error("❌ Preencha o custo E o preço de venda!");
    return;
  }

  // ✅ VALIDAÇÃO 2: CONVERSÃO E VALORES POSITIVOS
  const costPrice = parseFloat(quickSaleForm.costPrice);
  const salePrice = parseFloat(quickSaleForm.salePrice);

  if (isNaN(costPrice) || isNaN(salePrice)) {
    toast.error("❌ Valores inválidos!");
    return;
  }

  if (costPrice <= 0 || salePrice <= 0) {
    toast.error("❌ Valores devem ser maiores que zero!");
    return;
  }

  // ✅ VALIDAÇÃO 3: PREÇO DE VENDA MAIOR QUE CUSTO
  if (salePrice <= costPrice) {
    toast.error("⚠️ Preço de venda deve ser maior que o custo!");
    return;
  }

  // ✅ VALIDAÇÃO 4: VALORES MUITO ALTOS (SEGURANÇA)
  if (costPrice > 1000000 || salePrice > 1000000) {
    const confirm = window.confirm(
      `⚠️ Valores muito altos detectados!\n\n` +
      `Custo: ${formatCurrency(costPrice)}\n` +
      `Venda: ${formatCurrency(salePrice)}\n\n` +
      `Confirma estes valores?`
    );
    if (!confirm) return;
  }

  // ✅ VALIDAÇÃO 5: DATA NO FUTURO
  const saleDate = new Date(quickSaleForm.date);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  if (saleDate > today) {
    toast.error("❌ Data não pode ser no futuro!");
    return;
  }

  setIsSubmittingQuickSale(true);

  try {
    const lucro = salePrice - costPrice;
    const margem = ((lucro / salePrice) * 100).toFixed(1);

    // ✅ MODO OFFLINE
    if (!navigator.onLine) {
      await offlineManager.saveSaleOffline({
        costPrice,
        salePrice,
        description: quickSaleForm.description || `Venda rápida - Lucro: ${formatCurrency(lucro)}`,
        paymentMethod: quickSaleForm.paymentMethod,
        date: quickSaleForm.date,
      });

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#FFA500", "#FF6347"]
      });

      toast.success(
        `💾 Venda salva offline!\n\n` +
        `💰 Lucro: ${formatCurrency(lucro)}\n` +
        `📊 Margem: ${margem}%\n\n` +
        `Será sincronizada quando voltar online.`
      );

      await checkPendingData();
      setShowQuickSale(false);
      resetQuickSaleForm();
      return;
    }

    // ✅ MODO ONLINE
    await addQuickSale({
      amount: salePrice,
      costPrice: costPrice,
      description: quickSaleForm.description || `Venda rápida - Lucro: ${formatCurrency(lucro)}`,
      paymentMethod: quickSaleForm.paymentMethod,
      date: quickSaleForm.date,
    });

    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 },
      colors: ["#10B981", "#3B82F6", "#8B5CF6"]
    });

    toast.success(
      `🎉 Venda registrada com sucesso!\n\n` +
      `💰 Lucro: ${formatCurrency(lucro)}\n` +
      `📊 Margem: ${margem}%\n` +
      `💳 Pagamento: ${getPaymentMethodLabel(quickSaleForm.paymentMethod)}`
    );

    setShowQuickSale(false);
    resetQuickSaleForm();

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    toast.error(`❌ Erro ao registrar venda: ${errorMessage}`);
    console.error(error);
  } finally {
    setIsSubmittingQuickSale(false);
  }
};

// ✅ FUNÇÃO AUXILIAR PARA RESETAR FORM
const resetQuickSaleForm = () => {
  setQuickSaleForm({
    costPrice: "",
    salePrice: "",
    description: "",
    paymentMethod: "pix",
    date: new Date().toISOString().split("T")[0],
  });
};

// ✅ FUNÇÃO AUXILIAR PARA LABEL DO MÉTODO DE PAGAMENTO
const getPaymentMethodLabel = (method: string) => {
  const labels: Record<string, string> = {
    pix: "PIX",
    cash: "Dinheiro",
    credit_card: "Cartão de Crédito",
    debit_card: "Cartão de Débito",
    bank_transfer: "Transferência",
    other: "Outro",
  };
  return labels[method] || method;
};

  const handleQuickExpense = async () => {
    if (!quickExpenseForm.amount || !quickExpenseForm.description) {
      toast.error("❌ Preencha valor e descrição!");
      return;
    }

    try {
      // ✅ SE OFFLINE, SALVAR LOCALMENTE
      if (!navigator.onLine) {
        await offlineManager.saveExpenseOffline({
          amount: parseFloat(quickExpenseForm.amount),
          description: quickExpenseForm.description,
          category: quickExpenseForm.category,
          paymentMethod: quickExpenseForm.paymentMethod,
          date: new Date().toISOString().split("T")[0],
        });

        toast.success("💾 Gasto salvo offline!");
        await checkPendingData();
        setShowQuickExpense(false);
        setQuickExpenseForm({
          amount: "",
          description: "",
          category: "Outros",
          paymentMethod: "pix",
        });
        return;
      }

      // ✅ SE ONLINE, SALVAR NORMALMENTE
      await addQuickExpense({
        amount: parseFloat(quickExpenseForm.amount),
        description: quickExpenseForm.description,
        category: quickExpenseForm.category,
        paymentMethod: quickExpenseForm.paymentMethod,
      });

      toast.success("✅ Gasto registrado!");
      setShowQuickExpense(false);
      setQuickExpenseForm({
        amount: "",
        description: "",
        category: "Outros",
        paymentMethod: "pix",
      });
    } catch (error) {
      toast.error("❌ Erro ao registrar gasto");
      console.error(error);
    }
  };

  const handleClearMonth = async () => {
  const monthName = formatMonthName(selectedMonth);

  if (!confirm(
    `⚠️ LIMPAR TODOS OS DADOS DE ${monthName.toUpperCase()}?\n\n` +
    `Isso vai deletar:\n` +
    `- Todas as vendas do mês\n` +
    `- Todos os gastos do mês\n` +
    `- Resumos diários\n` +
    `- Cash flow\n` +
    `- Relatório mensal\n\n` +
    `⚠️ ESTA AÇÃO NÃO PODE SER DESFEITA!`
  )) {
    return;
  }

  // ✅ CONFIRMAÇÃO DUPLA PARA SEGURANÇA
  const confirmation = prompt(
    `Digite "LIMPAR" em letras maiúsculas para confirmar a exclusão de ${monthName}:`
  );

  if (confirmation !== "LIMPAR") {
    toast.error("❌ Operação cancelada");
    return;
  }

  try {
    const result = await clearMonthData({ month: selectedMonth });

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#EF4444", "#F97316", "#F59E0B"]
    });

    toast.success(
      `✅ ${monthName} limpo com sucesso!\n\n` +
      `📊 ${result.deletedSales} vendas\n` +
      `💸 ${result.deletedExpenses} gastos\n` +
      `📅 ${result.deletedSummaries} resumos diários\n` +
      `💰 ${result.deletedCashFlow} movimentações\n` +
      `${result.deletedAlerts ? `🔔 ${result.deletedAlerts} alertas` : ""}`
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    toast.error(`❌ Erro ao limpar mês: ${errorMessage}`);
    console.error(error);
  }
};

  const handleClearAll = async () => {
  // ✅ PRIMEIRA CONFIRMAÇÃO
  if (!confirm(
    `🚨 PERIGO EXTREMO!\n\n` +
    `Isso vai DELETAR PERMANENTEMENTE:\n` +
    `✖️ Todos os produtos\n` +
    `✖️ Todas as vendas\n` +
    `✖️ Todos os gastos\n` +
    `✖️ Todos os clientes\n` +
    `✖️ Todos os fornecedores\n` +
    `✖️ Todas as metas\n` +
    `✖️ Todos os relatórios\n` +
    `✖️ Todo o histórico\n\n` +
    `⚠️ IMPOSSÍVEL DESFAZER!\n\n` +
    `Tem certeza ABSOLUTA?`
  )) {
    return;
  }

  // ✅ CONFIRMAÇÃO DUPLA COM TEXTO EXATO
  const confirmation = prompt(
    `⚠️ ÚLTIMA CHANCE!\n\n` +
    `Digite "DELETAR TUDO" em letras maiúsculas para confirmar:`
  );

  if (confirmation !== "DELETAR TUDO") {
    toast.error("❌ Operação cancelada");
    return;
  }

  // ✅ LOADING TOAST
  const loadingToast = toast.loading("🗑️ Deletando todos os dados...");

  try {
    const result = await clearAllData({});

    // ✅ REMOVER LOADING TOAST
    toast.dismiss(loadingToast);

    // ✅ CONFETTI DE LIMPEZA
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.6 },
      colors: ["#EF4444", "#DC2626", "#B91C1C"]
    });

    // ✅ TOAST DETALHADO COM TODOS OS DADOS
    toast.success(
      `✅ TUDO DELETADO COM SUCESSO!\n\n` +
      `📦 ${result.products} produtos\n` +
      `🛒 ${result.sales} vendas\n` +
      `💸 ${result.expenses} gastos\n` +
      `👥 ${result.customers} clientes\n` +
      `🚚 ${result.suppliers} fornecedores\n` +
      `🎯 ${result.goals} metas\n` +
      `📊 ${result.reports} relatórios\n` +
      `📅 ${result.dailySummaries} resumos diários\n` +
      `💰 ${result.cashFlow} movimentações\n` +
      `🔔 ${result.alerts} alertas\n` +
      `📤 ${result.exports} exportações\n\n` +
      `Sistema resetado! Comece do zero agora.`,
      { duration: 8000 }
    );

    // ✅ NÃO PRECISA MAIS DE RELOAD!
    // O Convex atualiza automaticamente tudo

  } catch (error) {
    toast.dismiss(loadingToast);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    toast.error(`❌ Erro ao limpar tudo: ${errorMessage}`);
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

  const filteredProducts = useMemo(() => {
  if (!products) return [];

  const lowerSearch = searchQuery.toLowerCase().trim();

  return products.filter((product) => {
    // Filtro de busca
    if (lowerSearch) {
      const matchesName = product.name.toLowerCase().includes(lowerSearch);
      const matchesSku = product.sku?.toLowerCase().includes(lowerSearch);
      if (!matchesName && !matchesSku) return false;
    }

    // Filtro de categoria
    if (filterCategory !== "all" && product.category !== filterCategory) {
      return false;
    }

    return true;
  });
}, [products, searchQuery, filterCategory]);

  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));

  const isLoading = products === undefined || dashboard === undefined;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="w-20 h-20 mx-auto mb-6 animate-spin text-blue-600" />
            <div className="absolute inset-0 blur-xl bg-blue-500/20 rounded-full animate-pulse" />
          </div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Carregando...
          </h2>
          <p className="text-gray-600">Preparando seu painel financeiro</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ✅ ONBOARDING */}
      {showOnboarding && !hasSeenOnboarding && (
        <Onboarding
          onComplete={() => {
            setShowOnboarding(false);
            setHasSeenOnboarding(true);
            localStorage.setItem("onboarding_completed", "true");
          }}
          onSkip={() => {
            setShowOnboarding(false);
            setHasSeenOnboarding(true);
            localStorage.setItem("onboarding_completed", "true");
          }}
        />
      )}

      {/* ✅ FLOATING ACTION BUTTON (MOBILE) */}
      <div className="md:hidden">
        <FloatingActionButton
          onQuickSale={() => setShowQuickSale(true)}
          onQuickExpense={() => setShowQuickExpense(true)}
          onAddProduct={() => setShowAddProduct(true)}
        />
      </div>

      {/* [CORREÇÃO 1] - Este é agora o ÚNICO container principal. O duplicado foi removido. */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 pb-6">

        {/* ✅ INDICADOR DE STATUS OFFLINE */}
        {!isOnline && (
          <div className="fixed top-4 right-4 z-50 bg-orange-500 text-white px-4 py-2 rounded-xl shadow-xl flex items-center gap-2 animate-pulse">
            <div className="w-3 h-3 bg-white rounded-full animate-ping" />
            <span className="font-bold text-sm md:text-base">📴 Modo Offline</span>
          </div>
        )}

        {/* ✅ BADGE DE DADOS PENDENTES */}
        {pendingSync.total > 0 && isOnline && (
          <div className="fixed bottom-20 right-4 z-50">
            <button
              onClick={syncOfflineData}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 font-bold hover:scale-105 transition-transform text-sm md:text-base"
            >
              <RefreshCw className="w-5 h-5 animate-spin" />
              Sincronizar {pendingSync.total} registro{pendingSync.total > 1 ? 's' : ''}
            </button>
          </div>
        )}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-700" />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative max-w-[1600px] mx-auto px-3 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4 md:mb-6 lg:mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 lg:p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg">
                <Rocket className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Gestão PRO
                </h1>
                <p className="text-xs md:text-sm lg:text-base text-gray-600">Acabou papel e caneta! 🚀</p>
              </div>
            </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="relative">
                    <Bell className="w-4 h-4" />
                    {alerts.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold animate-pulse">
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
                      <div className="p-8 text-center">
                        <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
                        <p className="text-sm text-gray-500">Tudo certo! 🎉</p>
                      </div>
                    ) : (
                      alerts.map((alert) => (
                        <DropdownMenuItem
                          key={alert._id}
                          className="flex-col items-start p-3 cursor-pointer hover:bg-gray-50"
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

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4" />
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
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      if (monthlyReport && sales && expenses) {
                        const exporter = new PDFExporter();
                        // Mapear dados para o formato esperado pelo PDFExporter
                        const salesForPDF = sales.map(s => ({
                          _id: s._id,
                          productName: s.productName,
                          quantity: s.quantity,
                          salePrice: s.salePrice,
                          totalRevenue: s.totalRevenue,
                          profit: s.profit,
                          date: s.date,
                        }));
                        const expensesForPDF = expenses.map(e => ({
                          _id: e._id,
                          description: e.description,
                          categoryName: e.categoryName,
                          amount: e.amount,
                          date: e.date,
                        }));
                        exporter.exportMonthlyReport(monthlyReport, salesForPDF, expensesForPDF);
                        toast.success("📄 PDF gerado com sucesso!");
                      } else {
                        toast.error("❌ Aguarde o carregamento dos dados");
                      }
                    }}
                    className="text-blue-600"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar PDF do Mês
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <Card className="p-3 md:p-4 lg:p-5 bg-white/90 backdrop-blur-xl border-2 mb-4 md:mb-6 lg:mb-8 shadow-lg">
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth("prev")}
                className="h-9 w-9 md:h-10 md:w-10 lg:h-12 lg:w-12 shrink-0 rounded-full hover:bg-blue-50 transition-all"
              >
                <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" />
              </Button>

              <div className="flex-1 text-center">
                <div className="flex items-center justify-center gap-2 lg:gap-3">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-blue-600" />
                  <h2 className="text-base md:text-xl lg:text-2xl font-bold capitalize">{getCurrentMonthName()}</h2>
                </div>
                {allMonths.length > 0 && (
                  <p className="text-[10px] md:text-xs lg:text-sm text-gray-500 mt-1">
                    {allMonths.length} {allMonths.length === 1 ? "mês" : "meses"} registrados
                  </p>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth("next")}
                className="h-9 w-9 md:h-10 md:w-10 lg:h-12 lg:w-12 shrink-0 rounded-full hover:bg-blue-50 transition-all"
              >
                <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6" />
              </Button>
            </div>
          </Card>

          {/* [CORREÇÃO 2] - GamificationBar foi MOVIDA para cá, logo após o Card do mês */}
          <GamificationBar />

          {dailySummary && (
  <Card className="p-4 md:p-6 lg:p-8 mb-4 md:mb-6 lg:mb-8 bg-gradient-to-br from-emerald-500/10 via-blue-500/10 to-purple-500/10 border-2 border-emerald-200/50 shadow-xl hover:shadow-2xl transition-shadow">
    {/* Header */}
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 lg:gap-4 mb-4 lg:mb-6">
      <div className="flex items-center gap-2 md:gap-3 lg:gap-4">
        <div className="p-2 md:p-2.5 lg:p-3 bg-emerald-600 rounded-xl shadow-lg">
          <Zap className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-base md:text-lg lg:text-xl">Resumo de Hoje</h3>
            <Badge variant="outline" className="text-[10px] md:text-xs bg-emerald-100 text-emerald-700 border-emerald-300">
              Dashboard do Dia
            </Badge>
          </div>
          <p className="text-[10px] md:text-xs lg:text-sm text-gray-600 flex items-center gap-1">
            <Calendar className="w-3 h-3 lg:w-4 lg:h-4" />
            {new Date().toLocaleDateString("pt-BR", {
              weekday: 'short',
              day: '2-digit',
              month: 'short'
            })}
          </p>
        </div>
      </div>

      <Button
        size="sm"
        onClick={() => setActiveTab("rapido")}
        className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto lg:px-6 lg:py-3 shadow-lg hover:shadow-xl transition-all text-sm lg:text-base"
      >
        <Zap className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
        Modo Rápido
      </Button>
    </div>

    {/* Cards de Resumo */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
      {/* 💰 VENDAS */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 md:p-4 lg:p-5 text-center hover:bg-white hover:shadow-lg transition-all group cursor-pointer border border-emerald-100">
        <div className="flex items-center justify-center gap-2 lg:gap-3 mb-2 lg:mb-3">
          <div className="p-1.5 lg:p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
            <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 text-emerald-600" />
          </div>
          <p className="text-xs md:text-sm lg:text-base text-gray-600 font-medium">Vendas</p>
        </div>
        <p className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black text-emerald-600 group-hover:scale-110 transition-transform">
          {formatCurrency(dailySummary.totalRevenue)}
        </p>
        <div className="flex items-center justify-center gap-1 mt-2 lg:mt-3">
          <Badge variant="secondary" className="text-[10px] md:text-xs lg:text-sm">
            {dailySummary.salesCount} {dailySummary.salesCount === 1 ? 'venda' : 'vendas'}
          </Badge>
        </div>
      </div>

      {/* 💸 GASTOS */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 md:p-4 text-center hover:bg-white hover:shadow-lg transition-all group cursor-pointer border border-red-100">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="p-1.5 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
            <ArrowDownRight className="w-3 h-3 md:w-4 md:h-4 text-red-600" />
          </div>
          <p className="text-xs md:text-sm text-gray-600 font-medium">Gastos</p>
        </div>
        <p className="text-xl md:text-2xl lg:text-3xl font-black text-red-600 group-hover:scale-110 transition-transform">
          {formatCurrency(dailySummary.totalExpenses)}
        </p>
        <div className="flex items-center justify-center gap-1 mt-2">
          <Badge variant="secondary" className="text-[10px] md:text-xs">
            {dailySummary.expensesCount} {dailySummary.expensesCount === 1 ? 'gasto' : 'gastos'}
          </Badge>
        </div>
      </div>

      {/* 💚 LUCRO */}
      <div className={`bg-white/80 backdrop-blur-sm rounded-xl p-3 md:p-4 text-center hover:bg-white hover:shadow-lg transition-all group cursor-pointer border-2 ${
        dailySummary.netProfit >= 0 ? "border-emerald-200 ring-2 ring-emerald-100" : "border-orange-200"
      }`}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className={`p-1.5 rounded-lg transition-colors ${
            dailySummary.netProfit >= 0
              ? "bg-emerald-100 group-hover:bg-emerald-200"
              : "bg-orange-100 group-hover:bg-orange-200"
          }`}>
            {dailySummary.netProfit >= 0 ? (
              <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-emerald-600" />
            ) : (
              <TrendingDown className="w-3 h-3 md:w-4 md:h-4 text-orange-600" />
            )}
          </div>
          <p className="text-xs md:text-sm text-gray-600 font-medium">Lucro</p>
        </div>
        <p className={`text-xl md:text-2xl lg:text-3xl font-black group-hover:scale-110 transition-transform ${
          dailySummary.netProfit >= 0 ? "text-emerald-600" : "text-orange-600"
        }`}>
          {formatCurrency(dailySummary.netProfit)}
        </p>
        <div className="flex items-center justify-center gap-1 mt-2">
          {dailySummary.netProfit >= 0 ? (
            <Badge className="bg-emerald-100 text-emerald-700 text-[10px] md:text-xs border-0">
              <Sparkles className="w-3 h-3 mr-1" />
              Positivo
            </Badge>
          ) : (
            <Badge className="bg-orange-100 text-orange-700 text-[10px] md:text-xs border-0">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Atenção
            </Badge>
          )}
        </div>
      </div>
    </div>
  </Card>
)}

          {monthlyReport && (
            <div className="space-y-4 mb-4 md:mb-6">
              {/* ✅ LABEL CLARO: Resumo do Mês */}
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
                <div>
                  <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800">Resumo do Mês</h2>
                  <p className="text-xs md:text-sm text-gray-500">Estatísticas detalhadas de {formatMonthName(selectedMonth)}</p>
                </div>
                <Badge variant="outline" className="ml-auto text-xs md:text-sm bg-indigo-100 text-indigo-700 border-indigo-300">
                  {formatMonthName(selectedMonth)}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {/* 💰 RECEITA */}
            <Card className="p-4 md:p-5 bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white overflow-hidden relative group hover:scale-105 hover:shadow-2xl transition-all cursor-pointer">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <TrendingUp className="w-4 h-4 opacity-75" />
                </div>
                <p className="text-xs md:text-sm font-medium opacity-90 mb-1">Receita Total</p>
                <p className="text-2xl md:text-3xl lg:text-4xl font-black mb-1">
                  {formatCurrency(monthlyReport.totalRevenue)}
                </p>
                <div className="flex items-center gap-2 text-[10px] md:text-xs opacity-75">
                  <Badge variant="secondary" className="bg-white/20 text-white border-0 text-[10px] px-2 py-0">
                    {monthlyReport.totalSales} vendas
                  </Badge>
                </div>
              </div>
              <DollarSign className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 w-20 h-20 md:w-28 md:h-28 opacity-10 group-hover:opacity-20 group-hover:rotate-12 transition-all" />
            </Card>

            {/* 💸 GASTOS */}
            <Card className="p-4 md:p-5 bg-gradient-to-br from-red-500 to-red-600 border-0 text-white overflow-hidden relative group hover:scale-105 hover:shadow-2xl transition-all cursor-pointer">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Receipt className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <TrendingDown className="w-4 h-4 opacity-75" />
                </div>
                <p className="text-xs md:text-sm font-medium opacity-90 mb-1">Total de Gastos</p>
                <p className="text-2xl md:text-3xl lg:text-4xl font-black mb-1">
                  {formatCurrency(monthlyReport.totalExpenses)}
                </p>
                <div className="flex items-center gap-2 text-[10px] md:text-xs opacity-75">
                  <Badge variant="secondary" className="bg-white/20 text-white border-0 text-[10px] px-2 py-0">
                    {expenses.length} registros
                  </Badge>
                </div>
              </div>
              <TrendingDown className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 w-20 h-20 md:w-28 md:h-28 opacity-10 group-hover:opacity-20 group-hover:rotate-12 transition-all" />
            </Card>

            {/* 💚 LUCRO */}
            <Card className={`p-4 md:p-5 border-0 text-white overflow-hidden relative group hover:scale-105 hover:shadow-2xl transition-all cursor-pointer ${
              monthlyReport.netProfit >= 0
                ? "bg-gradient-to-br from-emerald-500 to-emerald-600"
                : "bg-gradient-to-br from-orange-500 to-orange-600"
            }`}>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    {monthlyReport.netProfit >= 0 ? (
                      <TrendingUp className="w-5 h-5 md:w-6 md:h-6" />
                    ) : (
                      <TrendingDown className="w-5 h-5 md:w-6 md:h-6" />
                    )}
                  </div>
                  <Sparkles className="w-4 h-4 opacity-75" />
                </div>
                <p className="text-xs md:text-sm font-medium opacity-90 mb-1">Lucro Líquido</p>
                <p className="text-2xl md:text-3xl lg:text-4xl font-black mb-1">
                  {formatCurrency(monthlyReport.netProfit)}
                </p>
                <div className="flex items-center gap-2 text-[10px] md:text-xs opacity-75">
                  <Badge variant="secondary" className="bg-white/20 text-white border-0 text-[10px] px-2 py-0">
                    Margem: {monthlyReport.profitMargin.toFixed(1)}%
                  </Badge>
                </div>
              </div>
              <Sparkles className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 w-20 h-20 md:w-28 md:h-28 opacity-10 group-hover:opacity-20 group-hover:rotate-12 transition-all" />
            </Card>

            {/* 📦 PRODUTOS */}
            <Card className="p-4 md:p-5 bg-gradient-to-br from-purple-500 to-purple-600 border-0 text-white overflow-hidden relative group hover:scale-105 hover:shadow-2xl transition-all cursor-pointer">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Package className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <Star className="w-4 h-4 opacity-75" />
                </div>
                <p className="text-xs md:text-sm font-medium opacity-90 mb-1">Produtos Ativos</p>
                <p className="text-2xl md:text-3xl lg:text-4xl font-black mb-1">
                  {products.filter((p) => p.active).length}
                </p>
                <div className="flex items-center gap-2 text-[10px] md:text-xs opacity-75">
                  <Badge variant="secondary" className="bg-white/20 text-white border-0 text-[10px] px-2 py-0">
                    cadastrados
                  </Badge>
                </div>
              </div>
              <Package className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 w-20 h-20 md:w-28 md:h-28 opacity-10 group-hover:opacity-20 group-hover:rotate-12 transition-all" />
            </Card>
              </div>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="space-y-4 md:space-y-6">
            {/* ✅ MENU TABLET (md: 768px - lg: 1024px) - Layout otimizado com scroll horizontal */}
            <div className="hidden md:block lg:hidden sticky top-0 z-40 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 pb-2 -mx-3 px-3">
              <div className="overflow-x-auto scrollbar-hide">
                <TabsList className="inline-flex w-max min-w-full bg-white/90 backdrop-blur-xl shadow-xl h-auto p-1.5 rounded-2xl gap-1">
                  <TabsTrigger value="dashboard" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white py-2.5 px-3 rounded-xl transition-all text-xs whitespace-nowrap flex-shrink-0">
                    <BarChart3 className="w-4 h-4 mr-1.5" />
                    Dashboard
                  </TabsTrigger>
                  <TabsTrigger value="rapido" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-green-600 data-[state=active]:text-white py-2.5 px-3 rounded-xl transition-all text-xs whitespace-nowrap flex-shrink-0">
                    <Zap className="w-4 h-4 mr-1.5" />
                    Rápido
                  </TabsTrigger>
                  <TabsTrigger value="produtos" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white py-2.5 px-3 rounded-xl transition-all text-xs whitespace-nowrap flex-shrink-0">
                    <Package className="w-4 h-4 mr-1.5" />
                    Produtos
                  </TabsTrigger>
                  <TabsTrigger value="vendas" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-green-600 data-[state=active]:text-white py-2.5 px-3 rounded-xl transition-all text-xs whitespace-nowrap flex-shrink-0">
                    <ShoppingCart className="w-4 h-4 mr-1.5" />
                    Vendas
                  </TabsTrigger>
                  <TabsTrigger value="gastos" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-600 data-[state=active]:text-white py-2.5 px-3 rounded-xl transition-all text-xs whitespace-nowrap flex-shrink-0">
                    <Receipt className="w-4 h-4 mr-1.5" />
                    Gastos
                  </TabsTrigger>
                  <TabsTrigger value="resumo" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white py-2.5 px-3 rounded-xl transition-all text-xs whitespace-nowrap flex-shrink-0">
                    <FileText className="w-4 h-4 mr-1.5" />
                    Resumo
                  </TabsTrigger>
                  <TabsTrigger value="metas" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-600 data-[state=active]:to-orange-600 data-[state=active]:text-white py-2.5 px-3 rounded-xl transition-all text-xs whitespace-nowrap flex-shrink-0">
                    <Target className="w-4 h-4 mr-1.5" />
                    Metas
                  </TabsTrigger>
                  <TabsTrigger value="clientes" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-rose-600 data-[state=active]:text-white py-2.5 px-3 rounded-xl transition-all text-xs whitespace-nowrap flex-shrink-0">
                    <Users className="w-4 h-4 mr-1.5" />
                    Clientes
                  </TabsTrigger>
                  <TabsTrigger value="fornecedores" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white py-2.5 px-3 rounded-xl transition-all text-xs whitespace-nowrap flex-shrink-0">
                    <Truck className="w-4 h-4 mr-1.5" />
                    Fornecedores
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <div className="hidden lg:block sticky top-0 z-40 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 pb-2">
              <TabsList className="grid grid-cols-9 w-full bg-white/90 backdrop-blur-xl shadow-xl h-auto p-1 rounded-2xl">
                <TabsTrigger value="dashboard" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white py-3 rounded-xl transition-all">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="rapido" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-green-600 data-[state=active]:text-white py-3 rounded-xl transition-all">
                  <Zap className="w-4 h-4 mr-2" />
                  Rápido
                </TabsTrigger>
                <TabsTrigger value="produtos" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white py-3 rounded-xl transition-all">
                  <Package className="w-4 h-4 mr-2" />
                  Produtos
                </TabsTrigger>
                <TabsTrigger value="vendas" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-green-600 data-[state=active]:text-white py-3 rounded-xl transition-all">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Vendas
                </TabsTrigger>
                <TabsTrigger value="gastos" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-600 data-[state=active]:text-white py-3 rounded-xl transition-all">
                  <Receipt className="w-4 h-4 mr-2" />
                  Gastos
                </TabsTrigger>
                <TabsTrigger value="resumo" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white py-3 rounded-xl transition-all">
                  <FileText className="w-4 h-4 mr-2" />
                  Resumo
                </TabsTrigger>
                <TabsTrigger value="metas" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-600 data-[state=active]:to-orange-600 data-[state=active]:text-white py-3 rounded-xl transition-all">
                  <Target className="w-4 h-4 mr-2" />
                  Metas
                </TabsTrigger>
                <TabsTrigger value="clientes" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-rose-600 data-[state=active]:text-white py-3 rounded-xl transition-all">
                  <Users className="w-4 h-4 mr-2" />
                  Clientes
                </TabsTrigger>
                <TabsTrigger value="fornecedores" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white py-3 rounded-xl transition-all">
                  <Truck className="w-4 h-4 mr-2" />
                  Fornecedores
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="md:hidden overflow-x-auto pb-2 -mx-3 px-3 sticky top-0 z-40 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
              <div className="flex gap-2 min-w-max">
                <Button size="sm" variant={activeTab === "dashboard" ? "default" : "outline"} onClick={() => setActiveTab("dashboard")} className={activeTab === "dashboard" ? "bg-blue-600" : ""}>
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Início
                </Button>
                <Button size="sm" variant={activeTab === "rapido" ? "default" : "outline"} onClick={() => setActiveTab("rapido")} className={activeTab === "rapido" ? "bg-emerald-600" : ""}>
                  <Zap className="w-4 h-4 mr-1" />
                  Rápido
                </Button>
                <Button size="sm" variant={activeTab === "produtos" ? "default" : "outline"} onClick={() => setActiveTab("produtos")} className={activeTab === "produtos" ? "bg-purple-600" : ""}>
                  <Package className="w-4 h-4 mr-1" />
                  Produtos
                </Button>
                <Button size="sm" variant={activeTab === "vendas" ? "default" : "outline"} onClick={() => setActiveTab("vendas")} className={activeTab === "vendas" ? "bg-emerald-600" : ""}>
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  Vendas
                </Button>
                <Button size="sm" variant={activeTab === "gastos" ? "default" : "outline"} onClick={() => setActiveTab("gastos")} className={activeTab === "gastos" ? "bg-red-600" : ""}>
                  <Receipt className="w-4 h-4 mr-1" />
                  Gastos
                </Button>
                <Button size="sm" variant={activeTab === "resumo" ? "default" : "outline"} onClick={() => setActiveTab("resumo")} className={activeTab === "resumo" ? "bg-indigo-600" : ""}>
                  <FileText className="w-4 h-4 mr-1" />
                  Resumo
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowMobileMenu(true)}>
                  <Menu className="w-4 h-4 mr-1" />
                  Mais
                </Button>
              </div>
            </div>

            <TabsContent value="dashboard">
              {!dashboard ? (
                <Card className="p-12 text-center">
                  <Loader2 className="w-16 h-16 mx-auto mb-4 text-gray-400 animate-spin" />
                  <p className="text-gray-500">Carregando dashboard...</p>
                </Card>
              ) : (
                <div className="space-y-4 md:space-y-6 lg:space-y-8">
                  {/* ✅ LABEL CLARO: Dashboard do Mês */}
                  <div className="flex items-center gap-3 mb-2">
                    <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                    <div>
                      <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800">Dashboard do Mês</h2>
                      <p className="text-xs md:text-sm text-gray-500">Visão geral de {formatMonthName(selectedMonth)}</p>
                    </div>
                    <Badge variant="outline" className="ml-auto text-xs md:text-sm bg-blue-100 text-blue-700 border-blue-300">
                      {formatMonthName(selectedMonth)}
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                    <Card className="p-4 md:p-6 lg:p-8 hover:shadow-2xl transition-all group bg-white/80 backdrop-blur-sm">
                      <h3 className="font-bold mb-4 lg:mb-6 flex items-center gap-2 lg:gap-3">
                        <div className="p-2 lg:p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                          <DollarSign className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                        </div>
                        <span className="text-sm md:text-base lg:text-lg">Receita Total</span>
                      </h3>
                      <p className="text-3xl md:text-4xl lg:text-5xl font-black text-blue-600">
                        {formatCurrency(dashboard.overview.totalRevenue)}
                      </p>
                      <p className="text-sm lg:text-base text-gray-600 mt-2 lg:mt-3">{dashboard.overview.totalSales} vendas</p>
                    </Card>

                    <Card className="p-4 md:p-6 lg:p-8 hover:shadow-2xl transition-all group bg-white/80 backdrop-blur-sm">
                      <h3 className="font-bold mb-4 lg:mb-6 flex items-center gap-2 lg:gap-3">
                        <div className="p-2 lg:p-3 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                          <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-600" />
                        </div>
                        <span className="text-sm md:text-base lg:text-lg">Lucro Líquido</span>
                      </h3>
                      <p className={`text-3xl md:text-4xl lg:text-5xl font-black ${dashboard.overview.netProfit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {formatCurrency(dashboard.overview.netProfit)}
                      </p>
                      <p className="text-sm lg:text-base text-gray-600 mt-2 lg:mt-3">Margem: {dashboard.overview.profitMargin.toFixed(1)}%</p>
                    </Card>

                    <Card className="p-4 md:p-6 lg:p-8 hover:shadow-2xl transition-all group bg-white/80 backdrop-blur-sm">
                      <h3 className="font-bold mb-4 lg:mb-6 flex items-center gap-2 lg:gap-3">
                        <div className="p-2 lg:p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                          <Package className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
                        </div>
                        <span className="text-sm md:text-base lg:text-lg">Produtos</span>
                      </h3>
                      <p className="text-3xl md:text-4xl lg:text-5xl font-black text-purple-600">{dashboard.products.total}</p>
                      <p className="text-sm lg:text-base text-gray-600 mt-2 lg:mt-3">
                        {dashboard.products.lowStock > 0 && `⚠️ ${dashboard.products.lowStock} com estoque baixo`}
                      </p>
                    </Card>
                  </div>

                  {dashboard.products.lowStock > 0 && (
                    <Alert variant="destructive" className="border-2 border-red-200">
                      <AlertTriangle className="h-5 w-5" />
                      <AlertTitle className="font-bold">Estoque Baixo!</AlertTitle>
                      <AlertDescription>
                        {dashboard.products.lowStock} produto{dashboard.products.lowStock > 1 ? "s" : ""} precisa
                        {dashboard.products.lowStock > 1 ? "m" : ""} de reabastecimento.
                      </AlertDescription>
                    </Alert>
                  )}

                  {goals.length > 0 && (
                    <Card className="p-4 md:p-6 bg-white/80 backdrop-blur-sm">
                      <h3 className="font-bold mb-4 flex items-center gap-2">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          <Target className="w-5 h-5 text-yellow-600" />
                        </div>
                        Metas Ativas
                      </h3>
                      <div className="space-y-4">
                        {goals.slice(0, 3).map((goal) => {
                          const progress = (goal.currentValue / goal.targetValue) * 100;
                          return (
                            <div key={goal._id} className="group">
                              <div className="flex justify-between text-sm mb-2">
                                <span className="font-semibold group-hover:text-blue-600 transition-colors">
                                  {goal.title}
                                </span>
                                <span className="font-bold">{progress.toFixed(0)}%</span>
                              </div>
                              <Progress value={Math.min(100, progress)} className="h-3 bg-gray-200" />
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="rapido">
              <div className="space-y-4">
                <Card className="p-6 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border-2 border-emerald-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-emerald-600 rounded-xl">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black">Modo Papel e Caneta 📝</h2>
                      <p className="text-gray-600">Registre vendas e gastos em segundos!</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Button
                      size="lg"
                      onClick={() => setShowQuickSale(true)}
                      className="h-32 bg-gradient-to-br from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-xl"
                    >
                      <div className="text-center">
                        <ArrowUpRight className="w-10 h-10 mx-auto mb-2" />
                        <p className="text-xl font-black">Registrar Venda</p>
                        <p className="text-sm opacity-90">Clique para adicionar</p>
                      </div>
                    </Button>

                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => setShowQuickExpense(true)}
                      className="h-32 border-2 border-red-300 hover:bg-red-50"
                    >
                      <div className="text-center">
                        <ArrowDownRight className="w-10 h-10 mx-auto mb-2 text-red-600" />
                        <p className="text-xl font-black text-red-600">Registrar Gasto</p>
                        <p className="text-sm text-gray-600">Clique para adicionar</p>
                      </div>
                    </Button>
                  </div>
                </Card>


                <Card className="p-4 md:p-6">
  <div className="flex items-center justify-between mb-4">
    <h3 className="font-bold text-base md:text-lg flex items-center gap-2">
      <Activity className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
      Últimas Movimentações
    </h3>
    {cashFlow.length > 0 && (
      <Badge variant="secondary" className="text-xs">
        {cashFlow.length} hoje
      </Badge>
    )}
  </div>

  {cashFlow.length === 0 ? (
    <div className="text-center py-8 md:py-12">
      <Wallet className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 text-gray-300" />
      <p className="text-sm md:text-base text-gray-500">Nenhuma movimentação hoje</p>
      <p className="text-xs text-gray-400 mt-1">Registre vendas ou gastos para começar</p>
    </div>
  ) : (
    <ScrollArea className="h-[400px] md:h-[500px]">
      <div className="space-y-2 pr-3">
        {cashFlow.map((flow) => (
          <div
            key={flow._id}
            className={`flex items-center justify-between p-3 md:p-4 rounded-xl transition-all hover:shadow-md group ${
              flow.type === "in" ? "bg-emerald-50 hover:bg-emerald-100" : "bg-red-50 hover:bg-red-100"
            }`}
          >
            {/* Lado Esquerdo: Ícone + Info */}
            <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
              <div className={`p-1.5 md:p-2 rounded-lg shrink-0 ${flow.type === "in" ? "bg-emerald-100" : "bg-red-100"}`}>
                {flow.type === "in" ? (
                  <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 text-emerald-600" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 md:w-4 md:h-4 text-red-600" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm md:text-base truncate">
                  {flow.description}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-[10px] md:text-xs text-gray-600">{flow.time}</p>
                  {flow.paymentMethod && (
                    <Badge variant="outline" className="text-[10px] px-1 py-0">
                      {flow.paymentMethod === "pix" && "PIX"}
                      {flow.paymentMethod === "cash" && "Dinheiro"}
                      {flow.paymentMethod === "credit_card" && "Crédito"}
                      {flow.paymentMethod === "debit_card" && "Débito"}
                      {flow.paymentMethod === "bank_transfer" && "Transfer"}
                      {flow.paymentMethod === "other" && "Outro"}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Lado Direito: Valor + Botão Excluir */}
            <div className="flex items-center gap-2 md:gap-3 shrink-0">
              <p className={`text-sm md:text-lg font-bold ${flow.type === "in" ? "text-emerald-600" : "text-red-600"}`}>
                {flow.type === "in" ? "+" : "-"}
                {formatCurrency(flow.amount)}
              </p>

              {/* ✅ BOTÃO EXCLUIR (visível no hover desktop, sempre visível mobile) */}
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 md:h-8 md:w-8 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-red-100"
              onClick={async () => {
  if (!confirm(`❌ Excluir esta movimentação?\n\n"${flow.description}"\n${formatCurrency(flow.amount)}\n\nIsso também vai deletar a venda/gasto relacionado.`)) {
    return;
  }

  try {
    await deleteCashFlow({
      id: flow._id,
      deleteRelatedRecord: true
    });

    confetti({
      particleCount: 30,
      angle: 90,
      spread: 45,
      origin: { y: 0.6 },
      colors: ["#EF4444", "#F59E0B"]
    });

    toast.success("✅ Movimentação excluída! Dashboard e relatórios atualizados automaticamente.");

    // ✅ NÃO PRECISA MAIS DE RELOAD NEM REGENERAR MANUALMENTE!
    // O backend já agenda a regeneração automática

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    toast.error(`❌ Erro ao excluir: ${errorMessage}`);
    console.error(error);
  }
}}
              >
                <Trash2 className="w-3 h-3 md:w-4 md:h-4 text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )}
</Card>
              </div>
            </TabsContent>

            <TabsContent value="produtos">
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none md:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Buscar produtos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {categories.length > 0 && (
                      <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas</SelectItem>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat || ""}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <Button
                      onClick={() => {
                        if (filteredProducts.length > 0) {
                          const exporter = new PDFExporter();
                          exporter.exportProductsReport(filteredProducts);
                          toast.success("📄 PDF de produtos gerado com sucesso!");
                        } else {
                          toast.error("❌ Nenhum produto para exportar");
                        }
                      }}
                      variant="outline"
                      size="sm"
                      className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-300"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Exportar PDF
                    </Button>
                    <Button onClick={() => setShowAddProduct(true)} className="bg-purple-600 hover:bg-purple-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Produto
                    </Button>
                  </div>
                </div>

                {filteredProducts.length === 0 ? (
                  <Card className="p-12 text-center border-2 border-dashed">
                    <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-bold mb-2">
                      {searchQuery || filterCategory !== "all" ? "Nenhum produto encontrado" : "Nenhum produto cadastrado"}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {searchQuery || filterCategory !== "all" ? "Tente ajustar os filtros" : "Comece cadastrando seu primeiro produto"}
                    </p>
                    {!searchQuery && filterCategory === "all" && (
                      <Button onClick={() => setShowAddProduct(true)} className="bg-purple-600">
                        Cadastrar Primeiro Produto
                      </Button>
                    )}
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    {filteredProducts.map((product) => {
                      const profit = product.salePrice - product.costPrice;
                      const profitMargin = (profit / product.salePrice) * 100;
                      const isLowStock =
                        product.stock !== undefined &&
                        product.minStock !== undefined &&
                        product.stock <= product.minStock;

                      return (
                        <Card key={product._id} className={`p-3 md:p-4 hover:shadow-lg transition-shadow ${!product.active ? "opacity-50" : ""}`}>
                          <div className="flex justify-between gap-2 mb-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-base md:text-lg truncate">{product.name}</h4>
                              <div className="flex gap-1.5 mt-1.5 flex-wrap">
                                {product.category && <Badge variant="outline" className="text-xs">{product.category}</Badge>}
                                {!product.active && <Badge variant="secondary" className="text-xs">Inativo</Badge>}
                                {isLowStock && <Badge variant="destructive" className="text-xs">Estoque Baixo</Badge>}
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0">
                                  <Settings className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
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

                          <div className="space-y-1.5 text-sm mb-3">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 text-xs md:text-sm">Custo:</span>
                              <span className="font-semibold text-sm md:text-base">{formatCurrency(product.costPrice)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 text-xs md:text-sm">Venda:</span>
                              <span className="font-semibold text-blue-600 text-sm md:text-base">{formatCurrency(product.salePrice)}</span>
                            </div>
                            {product.stock !== undefined && (
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 text-xs md:text-sm">Estoque:</span>
                                <span className={`font-semibold text-sm md:text-base ${isLowStock ? "text-red-600" : ""}`}>
                                  {product.stock} {product.unit || "un"}
                                </span>
                              </div>
                            )}
                          </div>

                          <Separator className="my-2 md:my-3" />

                          <div className="bg-emerald-50 rounded-lg p-2.5 md:p-3">
                            <div className="flex justify-between items-center gap-2">
                              <div className="flex-1">
                                <p className="text-[10px] md:text-xs text-gray-600">Lucro/un:</p>
                                <p className="font-bold text-emerald-600 text-sm md:text-base truncate">{formatCurrency(profit)}</p>
                              </div>
                              <div className="text-right flex-1">
                                <p className="text-[10px] md:text-xs text-gray-600">Margem:</p>
                                <p className="font-bold text-emerald-600 text-sm md:text-base">{profitMargin.toFixed(1)}%</p>
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
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <h3 className="text-xl font-bold">Vendas do Mês ({sales.length})</h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        if (sales.length > 0) {
                          const exporter = new PDFExporter();
                          // Mapear dados de vendas para o formato esperado pelo PDFExporter
                          const salesForPDF = sales.map(s => ({
                            _id: s._id,
                            productName: s.productName,
                            quantity: s.quantity,
                            salePrice: s.salePrice,
                            totalRevenue: s.totalRevenue,
                            profit: s.profit,
                            date: s.date,
                          }));
                          exporter.exportSalesReport(salesForPDF, selectedMonth);
                          toast.success("📄 PDF de vendas gerado com sucesso!");
                        } else {
                          toast.error("❌ Nenhuma venda para exportar");
                        }
                      }}
                      variant="outline"
                      size="sm"
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Exportar PDF
                    </Button>
                    <Button onClick={() => setShowAddSale(true)} className="bg-emerald-600 hover:bg-emerald-700" disabled={products.filter((p) => p.active).length === 0}>
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Venda
                    </Button>
                  </div>
                </div>

                {products.filter((p) => p.active).length === 0 && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Cadastre produtos primeiro</AlertTitle>
                    <AlertDescription>Você precisa ter produtos cadastrados para registrar vendas.</AlertDescription>
                  </Alert>
                )}

                {sales.length === 0 ? (
                  <Card className="p-12 text-center border-2 border-dashed">
                    <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-bold mb-2">Nenhuma venda registrada</h3>
                    <p className="text-gray-500 mb-4">Comece registrando sua primeira venda</p>
                    <Button onClick={() => setShowAddSale(true)} className="bg-emerald-600" disabled={products.filter((p) => p.active).length === 0}>
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
                              <Badge variant={expense.type === "fixed" ? "default" : "secondary"}>
                                {expense.type === "fixed" ? "Fixo" : expense.type === "variable" ? "Variável" : "Único"}
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

            <TabsContent value="resumo">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <h3 className="text-xl font-bold">Resumo de {getCurrentMonthName()}</h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        if (monthlyReport && sales && expenses) {
                          const exporter = new PDFExporter();
                          // Mapear dados para o formato esperado pelo PDFExporter
                          const salesForPDF = sales.map(s => ({
                            _id: s._id,
                            productName: s.productName,
                            quantity: s.quantity,
                            salePrice: s.salePrice,
                            totalRevenue: s.totalRevenue,
                            profit: s.profit,
                            date: s.date,
                          }));
                          const expensesForPDF = expenses.map(e => ({
                            _id: e._id,
                            description: e.description,
                            categoryName: e.categoryName,
                            amount: e.amount,
                            date: e.date,
                          }));
                          exporter.exportMonthlyReport(monthlyReport, salesForPDF, expensesForPDF);
                          toast.success("📄 PDF gerado com sucesso!");
                        } else {
                          toast.error("❌ Aguarde o carregamento dos dados");
                        }
                      }}
                      variant="outline"
                      size="sm"
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Exportar PDF
                    </Button>
                    <Button onClick={handleRegenerateReport} variant="outline" size="sm">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Atualizar
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
                        <div className={`text-center p-4 rounded-lg ${monthlyReport.netProfit >= 0 ? "bg-emerald-50" : "bg-orange-50"}`}>
                          <p className="text-sm text-gray-600 mb-1">Lucro Líquido</p>
                          <p className={`text-2xl font-bold ${monthlyReport.netProfit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
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
                                <div key={product.productId} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
                                      {idx + 1}
                                    </div>
                                    <div>
                                      <p className="font-semibold">{product.productName}</p>
                                      <p className="text-sm text-gray-600">
                                        {product.quantity} vendas • {formatCurrency(product.revenue)}
                                      </p>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    {customers.map((customer) => (
                      <Card key={customer._id} className="p-3 md:p-4 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between gap-2 mb-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm md:text-base truncate">{customer.name}</h4>
                            {customer.email && <p className="text-xs md:text-sm text-gray-600 truncate">{customer.email}</p>}
                            {customer.phone && <p className="text-xs md:text-sm text-gray-600">{customer.phone}</p>}
                          </div>
                          <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => deleteCustomer({ id: customer._id })}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                        <Separator className="my-2 md:my-3" />
                        <div className="space-y-1 text-xs md:text-sm">
                          <p className="text-gray-600 flex justify-between">
                            <span>Total gasto:</span>
                            <span className="font-semibold">{formatCurrency(customer.totalSpent)}</span>
                          </p>
                          <p className="text-gray-600 flex justify-between">
                            <span>Pedidos:</span>
                            <span className="font-semibold">{customer.totalOrders}</span>
                          </p>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    {suppliers.map((supplier) => (
                      <Card key={supplier._id} className="p-3 md:p-4 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between gap-2 mb-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm md:text-base truncate">{supplier.name}</h4>
                            {supplier.contact?.email && <p className="text-xs md:text-sm text-gray-600 truncate">{supplier.contact.email}</p>}
                            {supplier.contact?.phone && <p className="text-xs md:text-sm text-gray-600">{supplier.contact.phone}</p>}
                          </div>
                          <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => deleteSupplier({ id: supplier._id })}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                        {supplier.notes && (
                          <>
                            <Separator className="my-2 md:my-3" />
                            <p className="text-xs md:text-sm text-gray-600 line-clamp-2">{supplier.notes}</p>
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

        <Dialog open={showQuickSale} onOpenChange={setShowQuickSale}>
          <DialogContent className="w-full md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Zap className="w-5 h-5 text-emerald-600" />
                </div>
                Venda Rápida 💰
              </DialogTitle>
              <DialogDescription>Registre quanto pagou (custo) e por quanto vendeu</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold">Quanto você PAGOU? (Custo) *</Label>
                <div className="relative mt-2">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400" />
                  <Input
                    type="number"
                    step="0.01"
                    value={quickSaleForm.costPrice}
                    onChange={(e) => setQuickSaleForm({ ...quickSaleForm, costPrice: e.target.value })}
                    placeholder="Ex: 50,00"
                    className="pl-10 text-xl font-bold h-14 border-red-200 focus:border-red-400"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">💡 Preço que você pagou pelo produto</p>
              </div>

              <div>
                <Label className="text-base font-semibold">Por quanto VENDEU? *</Label>
                <div className="relative mt-2">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
                  <Input
                    type="number"
                    step="0.01"
                    value={quickSaleForm.salePrice}
                    onChange={(e) => setQuickSaleForm({ ...quickSaleForm, salePrice: e.target.value })}
                    placeholder="Ex: 100,00"
                    className="pl-10 text-xl font-bold h-14 border-emerald-200 focus:border-emerald-400"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">💰 Preço que você vendeu</p>
              </div>

              <div>
                <Label className="text-base font-semibold">Data da Venda *</Label>
                <div className="relative mt-2">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                  <Input
                    type="date"
                    value={quickSaleForm.date}
                    onChange={(e) => setQuickSaleForm({ ...quickSaleForm, date: e.target.value })}
                    className="pl-10 h-12 border-blue-200 focus:border-blue-400"
                  />
                </div>
              </div>

              {quickSaleLucro > 0 && (
                <Alert className="bg-emerald-50 border-emerald-200">
                  <Sparkles className="h-5 w-5 text-emerald-600" />
                  <AlertTitle className="text-emerald-800 font-bold">Lucro Calculado</AlertTitle>
                  <AlertDescription className="space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Lucro:</p>
                        <p className="text-2xl font-black text-emerald-600">{formatCurrency(quickSaleLucro)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Margem:</p>
                        <p className="text-2xl font-black text-emerald-600">{quickSaleMargin.toFixed(1)}%</p>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {quickSaleForm.costPrice &&
                quickSaleForm.salePrice &&
                parseFloat(quickSaleForm.salePrice) <= parseFloat(quickSaleForm.costPrice) && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Atenção!</AlertTitle>
                    <AlertDescription>
                      Você está vendendo pelo mesmo preço ou mais barato que comprou. Revise os valores!
                    </AlertDescription>
                  </Alert>
                )}

              <div>
                <Label>Descrição (opcional)</Label>
                <Input
                  value={quickSaleForm.description}
                  onChange={(e) => setQuickSaleForm({ ...quickSaleForm, description: e.target.value })}
                  placeholder="Ex: Venda de camiseta"
                />
              </div>

              <div>
                <Label>Forma de Pagamento</Label>
                <Select
                  value={quickSaleForm.paymentMethod}
                  onValueChange={(v: PaymentMethod) => setQuickSaleForm({ ...quickSaleForm, paymentMethod: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="cash">Dinheiro</SelectItem>
                    <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                    <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                    <SelectItem value="bank_transfer">Transferência</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setShowQuickSale(false)} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button
                onClick={handleQuickSale}
                className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto disabled:opacity-50"
                disabled={!isValidQuickSale || isSubmittingQuickSale}
              >
                {isSubmittingQuickSale ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Confirmar Venda {quickSaleLucro > 0 && ` (${formatCurrency(quickSaleLucro)})`}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showQuickExpense} onOpenChange={setShowQuickExpense}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Receipt className="w-5 h-5 text-red-600" />
                </div>
                Gasto Rápido 💸
              </DialogTitle>
              <DialogDescription>Registre um gasto rapidamente</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Descrição *</Label>
                <Input
                  value={quickExpenseForm.description}
                  onChange={(e) => setQuickExpenseForm({ ...quickExpenseForm, description: e.target.value })}
                  placeholder="Ex: Conta de luz"
                  autoFocus
                />
              </div>

              <div>
                <Label>Valor *</Label>
                <div className="relative mt-2">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="number"
                    step="0.01"
                    value={quickExpenseForm.amount}
                    onChange={(e) => setQuickExpenseForm({ ...quickExpenseForm, amount: e.target.value })}
                    placeholder="0,00"
                    className="pl-10 text-2xl font-bold h-14"
                  />
                </div>
              </div>

              <div>
                <Label>Categoria</Label>
                <Select
                  value={quickExpenseForm.category}
                  onValueChange={(v) => setQuickExpenseForm({ ...quickExpenseForm, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aluguel">Aluguel</SelectItem>
                    <SelectItem value="Luz/Água">Luz/Água</SelectItem>
                    <SelectItem value="Internet">Internet</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Materiais">Materiais</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowQuickExpense(false)}>
                Cancelar
              </Button>
              <Button onClick={handleQuickExpense} className="bg-red-600 hover:bg-red-700">
                <Check className="w-4 h-4 mr-2" />
                Confirmar Gasto
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
          <SheetContent side="right" className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Menu Completo</SheetTitle>
              <SheetDescription>Todas as funcionalidades</SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setActiveTab("metas");
                  setShowMobileMenu(false);
                }}
              >
                <Target className="w-5 h-5 mr-3" />
                Metas
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setActiveTab("clientes");
                  setShowMobileMenu(false);
                }}
              >
                <Users className="w-5 h-5 mr-3" />
                Clientes
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setActiveTab("fornecedores");
                  setShowMobileMenu(false);
                }}
              >
                <Truck className="w-5 h-5 mr-3" />
                Fornecedores
              </Button>

              <Separator className="my-4" />

              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setShowPriceCalculator(true);
                  setShowMobileMenu(false);
                }}
              >
                <Calculator className="w-5 h-5 mr-3" />
                Calcular Preço
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
          <DialogContent className="w-full md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
            <DialogHeader>
              <DialogTitle>➕ Cadastrar Novo Produto</DialogTitle>
              <DialogDescription>Preencha os dados do produto para cadastro no sistema</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nome do Produto *</Label>
                  <Input
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="Ex: Camiseta Básica"
                  />
                </div>
                <div>
                  <Label>SKU / Código</Label>
                  <Input
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    placeholder="Ex: CAM-001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Preço de Custo * (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={productForm.costPrice}
                    onChange={(e) => setProductForm({ ...productForm, costPrice: e.target.value })}
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <Label>Preço de Venda * (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={productForm.salePrice}
                    onChange={(e) => setProductForm({ ...productForm, salePrice: e.target.value })}
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Estoque Inicial</Label>
                  <Input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Estoque Mínimo</Label>
                  <Input
                    type="number"
                    value={productForm.minStock}
                    onChange={(e) => setProductForm({ ...productForm, minStock: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Unidade</Label>
                  <Select
                    value={productForm.unit}
                    onValueChange={(v) => setProductForm({ ...productForm, unit: v })}
                  >
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
                <Input
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  placeholder="Ex: Roupas"
                />
              </div>

              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Descrição do produto"
                  rows={3}
                />
              </div>

              {productForm.costPrice &&
                productForm.salePrice &&
                parseFloat(productForm.salePrice) > parseFloat(productForm.costPrice) && (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Lucro por unidade</AlertTitle>
                    <AlertDescription>
                      {formatCurrency(parseFloat(productForm.salePrice) - parseFloat(productForm.costPrice))}{" "}
                      (
                      {(
                        ((parseFloat(productForm.salePrice) - parseFloat(productForm.costPrice)) /
                          parseFloat(productForm.salePrice)) *
                        100
                      ).toFixed(1)}
                      % de margem)
                    </AlertDescription>
                  </Alert>
                )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddProduct(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddProduct} className="bg-purple-600" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Produto
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showEditProduct} onOpenChange={setShowEditProduct}>
          <DialogContent className="w-full md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
            <DialogHeader>
              <DialogTitle>✏️ Editar Produto</DialogTitle>
              <DialogDescription>Altere as informações do produto</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nome do Produto</Label>
                  <Input
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>SKU</Label>
                  <Input
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Custo (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={productForm.costPrice}
                    onChange={(e) => setProductForm({ ...productForm, costPrice: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Venda (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={productForm.salePrice}
                    onChange={(e) => setProductForm({ ...productForm, salePrice: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Estoque</Label>
                  <Input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Estoque Mínimo</Label>
                  <Input
                    type="number"
                    value={productForm.minStock}
                    onChange={(e) => setProductForm({ ...productForm, minStock: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditProduct(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEditProduct} className="bg-purple-600" disabled={isSubmittingEdit}>
                {isSubmittingEdit ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showAddSale} onOpenChange={setShowAddSale}>
          <DialogContent className="w-full md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
            <DialogHeader>
              <DialogTitle>🛒 Registrar Venda</DialogTitle>
              <DialogDescription>
                Registre uma nova venda e atualize o estoque automaticamente
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Produto *</Label>
                <Select
                  value={saleForm.productId}
                  onValueChange={(v) => setSaleForm({ ...saleForm, productId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products
                      .filter((p) => p.active)
                      .map((p) => (
                        <SelectItem key={p._id} value={p._id}>
                          {p.name} - {formatCurrency(p.salePrice)}{" "}
                          {p.stock !== undefined && `(Estoque: ${p.stock})`}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Quantidade *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={saleForm.quantity}
                    onChange={(e) => setSaleForm({ ...saleForm, quantity: e.target.value })}
                    placeholder="1"
                  />
                </div>
                <div>
                  <Label>Data *</Label>
                  <Input
                    type="date"
                    value={saleForm.date}
                    onChange={(e) => setSaleForm({ ...saleForm, date: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Cliente (opcional)</Label>
                <Select
                  value={saleForm.customerId || undefined}
                  onValueChange={(v) => setSaleForm({ ...saleForm, customerId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Nenhum cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.name}
                      </SelectItem>
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
                  onChange={(e) => setSaleForm({ ...saleForm, discount: e.target.value })}
                  placeholder="0,00"
                />
              </div>

              <div>
                <Label>Observações</Label>
                <Textarea
                  value={saleForm.notes}
                  onChange={(e) => setSaleForm({ ...saleForm, notes: e.target.value })}
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
          <DialogContent className="w-full md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
            <DialogHeader>
              <DialogTitle>💸 Registrar Gasto</DialogTitle>
              <DialogDescription>Registre uma despesa ou gasto do negócio</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Descrição *</Label>
                <Input
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  placeholder="Ex: Conta de luz"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Valor * (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  />
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
                <Label>Categoria</Label>
                <Select
                  value={expenseForm.categoryName}
                  onValueChange={(v) => setExpenseForm({ ...expenseForm, categoryName: v })}
                >
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
                <Select
                  value={expenseForm.type}
                  onValueChange={(v: ExpenseType) => setExpenseForm({ ...expenseForm, type: v })}
                >
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
              <Button variant="outline" onClick={() => setShowAddExpense(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddExpense} className="bg-red-600">
                <Save className="w-4 h-4 mr-2" />
                Registrar Gasto
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showAddCustomer} onOpenChange={setShowAddCustomer}>
          <DialogContent className="w-full md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
            <DialogHeader>
              <DialogTitle>👤 Cadastrar Cliente</DialogTitle>
              <DialogDescription>Adicione um novo cliente ao sistema</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome *</Label>
                <Input
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div>
                <Label>Endereço</Label>
                <Input
                  value={customerForm.address}
                  onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                  placeholder="Endereço completo"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddCustomer(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddCustomer} className="bg-pink-600">
                Salvar Cliente
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showAddSupplier} onOpenChange={setShowAddSupplier}>
          <DialogContent className="w-full md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
            <DialogHeader>
              <DialogTitle>🚚 Cadastrar Fornecedor</DialogTitle>
              <DialogDescription>Adicione um novo fornecedor ao sistema</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome *</Label>
                <Input
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  placeholder="Nome da empresa"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={supplierForm.email}
                  onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                  placeholder="email@fornecedor.com"
                />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input
                  value={supplierForm.phone}
                  onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                  placeholder="(00) 0000-0000"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddSupplier(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddSupplier} className="bg-teal-600">
                Salvar Fornecedor
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showAddGoal} onOpenChange={setShowAddGoal}>
          <DialogContent className="w-full md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
            <DialogHeader>
              <DialogTitle>🎯 Criar Meta</DialogTitle>
              <DialogDescription>Defina uma meta financeira para acompanhar seu progresso</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Título *</Label>
                <Input
                  value={goalForm.title}
                  onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                  placeholder="Ex: Faturar R$ 10.000"
                />
              </div>

              <div>
                <Label>Tipo de Meta</Label>
                <Select
                  value={goalForm.type}
                  onValueChange={(v: GoalType) => setGoalForm({ ...goalForm, type: v })}
                >
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
                <Input
                  type="number"
                  value={goalForm.targetValue}
                  onChange={(e) => setGoalForm({ ...goalForm, targetValue: e.target.value })}
                  placeholder="10000"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Início</Label>
                  <Input
                    type="date"
                    value={goalForm.startDate}
                    onChange={(e) => setGoalForm({ ...goalForm, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Fim</Label>
                  <Input
                    type="date"
                    value={goalForm.endDate}
                    onChange={(e) => setGoalForm({ ...goalForm, endDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddGoal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddGoal} className="bg-yellow-600">
                Criar Meta
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showPriceCalculator} onOpenChange={setShowPriceCalculator}>
          <DialogContent className="w-full md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
            <DialogHeader>
              <DialogTitle>🧮 Calculadora de Preço</DialogTitle>
              <DialogDescription>
                Descubra o preço ideal para seu produto com base em custos e margem
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Custo do Produto * (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={priceCalcForm.costPrice}
                  onChange={(e) => setPriceCalcForm({ ...priceCalcForm, costPrice: e.target.value })}
                  placeholder="Ex: 50.00"
                />
              </div>

              <div>
                <Label>Margem Desejada (%)</Label>
                <Input
                  type="number"
                  value={priceCalcForm.targetMargin}
                  onChange={(e) => setPriceCalcForm({ ...priceCalcForm, targetMargin: e.target.value })}
                  placeholder="Ex: 40"
                />
              </div>

              <div>
                <Label>Categoria</Label>
                <Input
                  value={priceCalcForm.category}
                  onChange={(e) => setPriceCalcForm({ ...priceCalcForm, category: e.target.value })}
                  placeholder="Ex: roupas, eletrônicos"
                />
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
    </>
  );
}