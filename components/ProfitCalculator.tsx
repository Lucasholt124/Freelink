"use client";

import { useEffect, useMemo, useState } from "react";
import { filterCrmCustomers } from "@/lib/crm";
import { ProductCapture } from "@/components/finance/ProductCapture";
import { ProductLabels } from "@/components/finance/ProductLabels";
import { ReceiveSaleDialog } from "@/components/finance/ReceiveSaleDialog";
import { validQuantity, retailNumber, allowsFraction } from "@/lib/retail";
import retailStyles from "@/components/finance/retail.module.css";
import { FinanceNavigation } from "@/components/finance/FinanceNavigation";
import styles from "@/components/finance/finance-workspace.module.css";
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
  Copy,
  MessageSquare,
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
import { RevenueChart } from "./RevenueChart";
import { AnimatePresence } from "framer-motion";
import { AnimatedCard } from "./AnimatedCard";
import { Pagination } from "./Pagination";
import { AnimatedCounter } from "./AnimatedCounter";
import { YearlyChart } from "./finance/YearlyChart";
import { PDVSaleModal } from './finance/PDVSaleModal';

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

const getBrazilDate = (): string => {
  const now = new Date();
  const brazilTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  const year = brazilTime.getFullYear();
  const month = String(brazilTime.getMonth() + 1).padStart(2, "0");
  const day = String(brazilTime.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// 🇧🇷 FUNÇÃO PARA DATA FUTURA (usado em metas)
const getBrazilDatePlusDays = (days: number): string => {
  const now = new Date();
  const brazilTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  brazilTime.setDate(brazilTime.getDate() + days);
  const year = brazilTime.getFullYear();
  const month = String(brazilTime.getMonth() + 1).padStart(2, "0");
  const day = String(brazilTime.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function FinancialManagerPro() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });


  const [showEditCustomer, setShowEditCustomer] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<Id<"customers"> | null>(null);

  const [showEditSupplier, setShowEditSupplier] = useState(false);
  const [editingSupplierId, setEditingSupplierId] = useState<Id<"suppliers"> | null>(null);

  // NOVAS MUTAÇÕES (Assumindo que existem no backend, já que você disse que está 100%)
  const updateCustomer = useMutation(api.profitCalculator.updateCustomer);
  const updateSupplier = useMutation(api.profitCalculator.updateSupplier);
    const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
    const userStats = useQuery(api.gamification.getUserStats);
  const initStats = useMutation(api.gamification.initUserStats);
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [summaryView, setSummaryView] = useState<"month" | "year" | "all">("month");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [captureSeed, setCaptureSeed] = useState<Doc<"products"> | null>(null);
  const [captureCode, setCaptureCode] = useState<string | undefined>(undefined);
  const [labelProducts, setLabelProducts] = useState<Doc<"products">[]>([]);
  const [receivingSale, setReceivingSale] = useState<Doc<"sales"> | null>(null);
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
  const [showPDV, setShowPDV] = useState(false);


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
    date: getBrazilDate(), // ✅ CORRETO
    paymentMethod: "pix" as PaymentMethod,
    paymentStatus: "paid" as SalePaymentStatus,
    notes: "",
  });

  const [expenseForm, setExpenseForm] = useState({
    description: "",
    amount: "",
    categoryName: "Outros",
    type: "one_time" as ExpenseType,
    date: getBrazilDate(), // ✅ CORRETO
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
    birthDate: "",
    status: "ativo",
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
    startDate: getBrazilDate(), // ✅ CORRETO
    endDate: getBrazilDatePlusDays(30), // ✅ 30 dias no futuro
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
   date: getBrazilDate(),
});

  const [quickExpenseForm, setQuickExpenseForm] = useState({
    amount: "",
    description: "",
    category: "Outros",
    paymentMethod: "pix" as PaymentMethod,
  });

const [priceCalcResult, setPriceCalcResult] = useState<PriceCalculationResult | null>(null);
const [productSearchTerm, setProductSearchTerm] = useState("");
const [customerSearchTerm, setCustomerSearchTerm] = useState("");
const [customerStatusFilter, setCustomerStatusFilter] = useState("all");
const [customerSortBy, setCustomerSortBy] = useState("name"); // name, date, lastContact

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

  const [salesPage, setSalesPage] = useState(1);
const SALES_PER_PAGE = 10;

const [expensesPage, setExpensesPage] = useState(1);
const EXPENSES_PER_PAGE = 10;

const paginatedExpenses = useMemo(() => {
  const startIndex = (expensesPage - 1) * EXPENSES_PER_PAGE;
  return expenses.slice(startIndex, startIndex + EXPENSES_PER_PAGE);
}, [expenses, expensesPage]);


const [customersPage, setCustomersPage] = useState(1);
const CUSTOMERS_PER_PAGE = 12;

const filteredAndSortedCustomers = useMemo(
  () => filterCrmCustomers(customers, customerSearchTerm, customerStatusFilter, customerSortBy),
  [customers, customerSearchTerm, customerStatusFilter, customerSortBy],
);

useEffect(() => {
  setCustomersPage(1);
}, [customerSearchTerm, customerStatusFilter, customerSortBy]);

useEffect(() => {
  setCustomersPage((page) => Math.min(page, Math.max(1, Math.ceil(filteredAndSortedCustomers.length / CUSTOMERS_PER_PAGE))));
}, [filteredAndSortedCustomers.length]);

const paginatedCustomers = useMemo(() => {
  const startIndex = (customersPage - 1) * CUSTOMERS_PER_PAGE;
  return filteredAndSortedCustomers.slice(startIndex, startIndex + CUSTOMERS_PER_PAGE);
}, [filteredAndSortedCustomers, customersPage]);

const totalCustomersPages = Math.ceil(filteredAndSortedCustomers.length / CUSTOMERS_PER_PAGE);
const totalExpensesPages = Math.ceil(expenses.length / EXPENSES_PER_PAGE);
const totalSalesPages = Math.ceil(sales.length / SALES_PER_PAGE);

  const paginatedSales = useMemo(() => {
    const startIndex = (salesPage - 1) * SALES_PER_PAGE;
    return sales.slice(startIndex, startIndex + SALES_PER_PAGE);
  }, [sales, salesPage]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };


const [suppliersPage, setSuppliersPage] = useState(1);
const SUPPLIERS_PER_PAGE = 12;

const paginatedSuppliers = useMemo(() => {
  const startIndex = (suppliersPage - 1) * SUPPLIERS_PER_PAGE;
  return suppliers.slice(startIndex, startIndex + SUPPLIERS_PER_PAGE);
}, [suppliers, suppliersPage]);

const totalSuppliersPages = Math.ceil(suppliers.length / SUPPLIERS_PER_PAGE);
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
  const openEditCustomer = (customer: Doc<"customers">) => {
    setCustomerForm({
      name: customer.name,
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
      notes: customer.notes || "",
      birthDate: customer.birthDate || "",
      status: customer.status || "",
    });
    setEditingCustomerId(customer._id);
    setShowEditCustomer(true);
  };

  const handleEditCustomer = async () => {
    if (!editingCustomerId) return;
    if (!customerForm.name.trim()) {
      toast.error("❌ Digite o nome do cliente!");
      return;
    }

    try {
      await updateCustomer({
        id: editingCustomerId,
        name: customerForm.name,
        email: customerForm.email || undefined,
        phone: customerForm.phone || undefined,
        address: customerForm.address || undefined,
        notes: customerForm.notes || undefined,
        birthDate: customerForm.birthDate || undefined,
        status: customerForm.status || undefined,
      });

      toast.success("✅ Cliente atualizado com sucesso!");
      setShowEditCustomer(false);
      setCustomerForm({ name: "", email: "", phone: "", address: "", notes: "", birthDate: "", status: ""});
      setEditingCustomerId(null);
    } catch (error) {
      handleApiError(error, "Erro ao atualizar cliente");
    }
  };

  const handleDeleteCustomer = async (id: Id<"customers">, name: string) => {
    if (!confirm(`🗑️ Tem certeza que deseja excluir o cliente "${name}"?\nIsso não pode ser desfeito.`)) {
      return;
    }

    try {
      await deleteCustomer({ id });
      toast.success("✅ Cliente excluído!");
    } catch (error) {
      handleApiError(error, "Erro ao excluir cliente");
    }
  };

  // ------------------------------------------------------------------
  // ✅ FUNÇÕES PARA FORNECEDORES (CORRIGIDO EXCLUIR + ADICIONADO EDITAR)
  // ------------------------------------------------------------------

  const openEditSupplier = (supplier: Doc<"suppliers">) => {
    setSupplierForm({
      name: supplier.name,
      email: supplier.contact?.email || "",
      phone: supplier.contact?.phone || "",
      address: supplier.contact?.address || "",
      notes: supplier.notes || "",
    });
    setEditingSupplierId(supplier._id);
    setShowEditSupplier(true);
  };

  const handleEditSupplier = async () => {
    if (!editingSupplierId) return;
    if (!supplierForm.name.trim()) {
      toast.error("❌ Digite o nome do fornecedor!");
      return;
    }

    try {
      await updateSupplier({
        id: editingSupplierId,
        name: supplierForm.name,
        email: supplierForm.email || undefined,
        phone: supplierForm.phone || undefined,
        address: supplierForm.address || undefined,
        notes: supplierForm.notes || undefined,
      });

      toast.success("✅ Fornecedor atualizado com sucesso!");
      setShowEditSupplier(false);
      setSupplierForm({ name: "", email: "", phone: "", address: "", notes: "" });
      setEditingSupplierId(null);
    } catch (error) {
      handleApiError(error, "Erro ao atualizar fornecedor");
    }
  };

  const handleDeleteSupplier = async (id: Id<"suppliers">, name: string) => {
    if (!confirm(`🗑️ Tem certeza que deseja excluir o fornecedor "${name}"?`)) {
      return;
    }

    try {
      await deleteSupplier({ id });
      toast.success("✅ Fornecedor excluído!");
    } catch (error) {
      handleApiError(error, "Erro ao excluir fornecedor");
    }
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

  if (!Number.isFinite(costPrice) || costPrice < 0) errors.push("Custo deve ser zero ou maior");
  if (costPrice > 1000000) errors.push("Custo parece muito alto, confira");

  if (isNaN(salePrice) || salePrice <= 0) errors.push("Preço de venda deve ser maior que zero");
  if (salePrice > 1000000) errors.push("Preço de venda parece muito alto, confira");

  if (form.stock && !validQuantity(parseFloat(form.stock), form.unit || "un", true)) errors.push("Confira a quantidade em estoque e a unidade de venda");
  if (form.minStock && !validQuantity(parseFloat(form.minStock), form.unit || "un", true)) errors.push("Confira o estoque mínimo e a unidade de venda");

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
      stock: productForm.stock ? parseFloat(productForm.stock) : undefined,
      minStock: productForm.minStock ? parseFloat(productForm.minStock) : undefined,
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
      stock: productForm.stock ? parseFloat(productForm.stock) : undefined,
      minStock: productForm.minStock ? parseFloat(productForm.minStock) : undefined,
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

const handleDuplicateProduct = (product: Doc<"products">) => {
  setCaptureSeed(product);
  setShowAddProduct(true);
};




const addSale = useMutation(api.profitCalculator.addSale);
  const [isSubmittingSale, setIsSubmittingSale] = useState(false);

  const validateSale = (form: typeof saleForm, product: Doc<"products">): string[] => {
    const errors: string[] = [];
    if (!form.productId) errors.push("Selecione um produto");
    if (!form.quantity || parseInt(form.quantity) <= 0) errors.push("Quantidade inválida");
    if (product.stock !== undefined && parseInt(form.quantity) > product.stock) {
      errors.push(`Estoque insuficiente. Disponível: ${product.stock}`);
    }
    if (form.discount && parseFloat(form.discount) < 0) errors.push("Desconto inválido");
    const saleDate = new Date(form.date + "T00:00:00");
    const today = new Date(getBrazilDate() + "T23:59:59");
    if (saleDate > today) errors.push("Data não pode ser no futuro");
    return errors;
  };

  const handleAddSale = async () => {
    const product = products.find((p) => p._id === saleForm.productId);
    if (!product) return toast.error("Produto não encontrado");

    const errors = validateSale(saleForm, product);
    if (errors.length > 0) return toast.error(errors[0]);

    setIsSubmittingSale(true);
    try {
      await addSale({
        productId: product._id,
        customerId: saleForm.customerId ? (saleForm.customerId as Id<"customers">) : undefined,
        quantity: parseInt(saleForm.quantity),
        discount: saleForm.discount ? parseFloat(saleForm.discount) : undefined,
        date: saleForm.date,
        paymentMethod: saleForm.paymentMethod,
        paymentStatus: saleForm.paymentStatus,
        notes: saleForm.notes || undefined,
      });

      await generateReport({ month: saleForm.date.substring(0, 7) });
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      toast.success("✅ Venda registrada com sucesso!");
      setShowAddSale(false);
      setSaleForm({ productId: "", customerId: "", quantity: "", discount: "", date: getBrazilDate(), paymentMethod: "pix", paymentStatus: "paid", notes: "" });
    } catch (error) {
      handleApiError(error, "Erro ao registrar venda");
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

  // ✅ PROCURE a função validateExpense e CORRIJA:

const validateExpense = (form: typeof expenseForm): string[] => {
  const errors: string[] = [];

  if (!form.description.trim()) errors.push("Descrição é obrigatória");
  if (form.description.length > 200) errors.push("Descrição muito longa (máx 200 caracteres)");

  const amount = parseFloat(form.amount);
  if (isNaN(amount) || amount <= 0) errors.push("Valor deve ser maior que zero");
  if (amount > 1000000) errors.push("Valor muito alto, confira");

  // ✅ VALIDAÇÃO DE DATA CORRIGIDA
  const expenseDate = new Date(form.date + "T00:00:00");
  const todayStr = getBrazilDate();
  const today = new Date(todayStr + "T23:59:59");
  const oneYearAgo = new Date(todayStr + "T00:00:00");
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

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
      date: getBrazilDate(),
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
        birthDate: customerForm.birthDate || undefined,
        status: customerForm.status || undefined
      });

      toast.success("✅ Cliente cadastrado!");
      setShowAddCustomer(false);
      setCustomerForm({ name: "", email: "", phone: "", address: "", notes: "", birthDate: "", status: ""});
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
 const saleDate = new Date(quickSaleForm.date + "T00:00:00");
const todayStr = getBrazilDate();
const today = new Date(todayStr + "T23:59:59");

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
    date: getBrazilDate(),
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
          date: getBrazilDate(),
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
  const [productsPage, setProductsPage] = useState(1);
const PRODUCTS_PER_PAGE = 12;
useEffect(() => {
  setProductsPage(1);
}, [searchQuery, filterCategory]);
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

const paginatedProducts = useMemo(() => {
  const startIndex = (productsPage - 1) * PRODUCTS_PER_PAGE;
  return filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
}, [filteredProducts, productsPage]);

const totalProductsPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

// ✅ CORREÇÃO 1: CÁLCULO DE LUCRO REAL (Considerando Custo do Produto)
const chartData = useMemo(() => {
  if (!dailySummary || !sales || !expenses) return [];

  const last7Days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    last7Days.push(dateStr);
  }

  return last7Days.map(date => {
    const daySales = sales.filter(s => s.date === date);
    const dayExpenses = expenses.filter(e => e.date === date);

    const revenue = daySales.reduce((sum, s) => sum + (s.totalRevenue || 0), 0);

    // ANTES: const profit = revenue - expensesTotal; (ERRADO - Ignorava custo do produto)
    // AGORA: Somamos o lucro individual de cada venda (que já desconta o custo)
    const grossProfit = daySales.reduce((sum, s) => sum + (s.profit || 0), 0);

    const expensesTotal = dayExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    // Lucro Líquido = Lucro Bruto das Vendas - Gastos Operacionais (Luz, Aluguel, etc)
    const profit = grossProfit - expensesTotal;

    return { date, revenue, expenses: expensesTotal, profit };
  });
}, [sales, expenses, dailySummary]);
  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));

  const isLoading = productsQuery === undefined || dashboard === undefined;

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
    <div className={styles.workspace}>
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
          onQuickSale={() => setShowPDV(true)}
          onQuickExpense={() => setShowQuickExpense(true)}
          onAddProduct={() => setShowAddProduct(true)}
        />
      </div>

      {/* [CORREÇÃO 1] - Este é agora o ÚNICO container principal. O duplicado foi removido. */}
      <div className={styles.canvas}>

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
        <div className={styles.content}>
          <header className={styles.header}>
            <div className={styles.identity}>
              <div className={styles.brandIcon}><BarChart3 className="w-6 h-6" aria-hidden="true" /></div>
              <div>
                <p className={styles.eyebrow}>Seu negócio em dia <span>Ultra</span></p>
                <h1 className={styles.title}>Financeiro e CRM</h1>
                <p className={styles.subtitle}>Mais organização para cuidar de quem compra de você.</p>
              </div>
            </div>
            <div className={styles.headerActions}>
              <Button onClick={() => setShowPDV(true)} className={styles.primary}><ShoppingCart className="w-4 h-4 mr-2" />Vender</Button>
              <Button variant="outline" onClick={() => { setCustomerForm({ name: "", email: "", phone: "", address: "", notes: "", birthDate: "", status: "" }); setShowAddCustomer(true); }}><Plus className="w-4 h-4 mr-2" />Cliente</Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="relative" aria-label={`Alertas: ${alerts.length}`}>
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
                  <Button variant="outline" size="sm" aria-label="Configurações e exportação">
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
          </header>

          <Card className={styles.month}>
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                size="sm"
                aria-label="Mês anterior"
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
                aria-label="Próximo mês"
                onClick={() => navigateMonth("next")}
                className="h-9 w-9 md:h-10 md:w-10 lg:h-12 lg:w-12 shrink-0 rounded-full hover:bg-blue-50 transition-all"
              >
                <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6" />
              </Button>
            </div>
          </Card>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="space-y-4 md:space-y-6">
            <FinanceNavigation activeTab={activeTab} />
            {activeTab === "dashboard" && <div className={styles.overview}>
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
       <AnimatedCounter
  value={dailySummary.totalRevenue}
  prefix="R$"
  decimals={2}
  duration={1.5}
  className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black text-emerald-600 group-hover:scale-110 transition-transform block"
/>
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
        <AnimatedCounter
  value={dailySummary.totalExpenses}
  prefix="R$"
  decimals={2}
  duration={1.5}
  className="text-xl md:text-2xl lg:text-3xl font-black text-red-600 group-hover:scale-110 transition-transform block"
/>

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
       <AnimatedCounter
  value={dailySummary.netProfit}
  prefix="R$"
  decimals={2}
  duration={1.5}
  className={`text-xl md:text-2xl lg:text-3xl font-black group-hover:scale-110 transition-transform block ${
    dailySummary.netProfit >= 0 ? "text-emerald-600" : "text-orange-600"
  }`}
/>
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
            <Card data-crm-metric="revenue" className="p-4 md:p-5 bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white overflow-hidden relative group hover:scale-105 hover:shadow-2xl transition-all cursor-pointer">
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
            <Card data-crm-metric="expenses" className="p-4 md:p-5 bg-gradient-to-br from-red-500 to-red-600 border-0 text-white overflow-hidden relative group hover:scale-105 hover:shadow-2xl transition-all cursor-pointer">
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
            <Card data-crm-metric="profit" data-negative={monthlyReport.netProfit < 0} className={`p-4 md:p-5 border-0 text-white overflow-hidden relative group hover:scale-105 hover:shadow-2xl transition-all cursor-pointer ${
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
            <Card data-crm-metric="products" className="p-4 md:p-5 bg-gradient-to-br from-purple-500 to-purple-600 border-0 text-white overflow-hidden relative group hover:scale-105 hover:shadow-2xl transition-all cursor-pointer">
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

            </div>}

            <TabsContent value="dashboard">
              {!dashboard ? (
                <Card className="p-12 text-center">
                  <Loader2 className="w-16 h-16 mx-auto mb-4 text-gray-400 animate-spin" />
                  <p className="text-gray-500">Carregando dashboard...</p>
                </Card>
              ) : (
                <div className="space-y-4 md:space-y-6 lg:space-y-8">
                  {/* ✅ LABEL CLARO: Visão geral do negócio */}
                   {chartData.length > 0 && (
    <RevenueChart data={chartData} type="area" height={300} />
  )}
                  <div className="flex items-center gap-3 mb-2">
                    <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                    <div>
                      <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800">Visão geral do negócio</h2>
                      <p className="text-xs md:text-sm text-gray-500">Indicadores acumulados de vendas, gastos e produtos</p>
                    </div>
                    <Badge variant="outline" className="ml-auto text-xs md:text-sm bg-blue-100 text-blue-700 border-blue-300">
                      Todo o período
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
                      onClick={() => setShowPDV(true)} // 🔥 MUDOU AQUI
                      className="h-32 bg-gradient-to-br from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-xl"
                    >
                      <div className="text-center">
                        <ArrowUpRight className="w-10 h-10 mx-auto mb-2" />
                        <p className="text-xl font-black">Frente de Caixa (PDV)</p> {/* Pode até mudar o texto se quiser */}
                        <p className="text-sm opacity-90">Clique para abrir</p>
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
                <div className={retailStyles.retailEntry}>
                  <div><h3>Seu catálogo, pronto para vender</h3><p>Cadastre com foto, organize as opções e encontre cada produto pela etiqueta ou pelo catálogo.</p></div>
                  <div><button type="button" className={retailStyles.secondary} onClick={() => setShowPDV(true)}><ShoppingCart size={16} />Vender</button><button type="button" className={retailStyles.primary} onClick={() => setShowAddProduct(true)}><Plus size={16} />Cadastrar produto</button></div>
                </div>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
<div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
  <div className="relative w-full sm:w-64">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
    <Input
      placeholder="Buscar produtos..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="pl-10 w-full"
    />
  </div>
  {categories.length > 0 && (
    <Select value={filterCategory} onValueChange={setFilterCategory}>
      <SelectTrigger className="w-full sm:w-40">
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
                        if (filteredProducts.length > 0) { // filteredProducts respeita a busca atual
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
                    <Button variant="outline" onClick={() => setLabelProducts(filteredProducts.filter(product => product.active))} disabled={!filteredProducts.some(product => product.active)}>
                      <Copy className="w-4 h-4 mr-2" />Etiquetas
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
                   <AnimatePresence mode="popLayout">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
      {paginatedProducts.map((product, index) => {
        const profit = product.salePrice - product.costPrice;
        const profitMargin = (profit / product.salePrice) * 100;
        const isLowStock =
          product.stock !== undefined &&
          product.minStock !== undefined &&
          product.stock <= product.minStock;

        return (
          <AnimatedCard
            key={product._id}
            delay={index * 0.05}
            className="h-full"
          >
                        <Card key={product._id} className={`p-3 md:p-4 hover:shadow-lg transition-shadow ${!product.active ? "opacity-50" : ""}`}>
                          {product.imageUrl && <img src={product.imageUrl} alt={product.name} className={retailStyles.catalogPhoto} loading="lazy" />}
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
                                <DropdownMenuItem onClick={() => setLabelProducts([product])}>
                                  <Copy className="w-4 h-4 mr-2" />Preparar etiqueta
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openEditProduct(product._id)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>

                                {/* 🔥 O NOVO BOTÃO AQUI 🔥 */}
                                <DropdownMenuItem onClick={() => handleDuplicateProduct(product)}>
                                  <Copy className="w-4 h-4 mr-2 text-blue-500" />
                                  Duplicar
                                </DropdownMenuItem>

                                <DropdownMenuItem onClick={() => handleDeleteProduct(product._id, false)} className="text-orange-600">
                                  <AlertCircle className="w-4 h-4 mr-2" />
                                  Desativar
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
                                <p className="text-[10px] md:text-xs text-gray-600">Lucro/{product.unit || "un"}:</p>
                                <p className="font-bold text-emerald-600 text-sm md:text-base truncate">{formatCurrency(profit)}</p>
                              </div>
                              <div className="text-right flex-1">
                                <p className="text-[10px] md:text-xs text-gray-600">Margem:</p>
                                <p className="font-bold text-emerald-600 text-sm md:text-base">{profitMargin.toFixed(1)}%</p>
                              </div>
                            </div>
                          </div>
                        </Card>
                        </AnimatedCard>

                      );
                    })}
                  </div>
                  </AnimatePresence>

                )}

                {filteredProducts.length > 0 && (
                  <Pagination
                    currentPage={productsPage}
                    totalPages={totalProductsPages}
                    onPageChange={setProductsPage}
                    totalItems={filteredProducts.length}
                    itemsPerPage={PRODUCTS_PER_PAGE}
                  />
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
                    <Button onClick={() => setShowPDV(true)} className="bg-emerald-600 hover:bg-emerald-700" disabled={products.filter((p) => p.active).length === 0}>
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
                    <Button onClick={() => setShowPDV(true)} className="bg-emerald-600" disabled={products.filter((p) => p.active).length === 0}>                      Registrar Primeira Venda
                    </Button>
                  </Card>
                ) : (

                  <AnimatePresence mode="popLayout">
                  <div className="space-y-3">
                     {paginatedSales.map((sale, index) => (
                      <AnimatedCard key={sale._id} delay={index * 0.03}>
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
                              {sale.items?.length ? `${sale.items.length} produto${sale.items.length > 1 ? "s" : ""} na venda` : `${sale.quantity}x ${formatCurrency(sale.salePrice)}`} • {formatDate(sale.date)}
                            </p>
                            {sale.items?.length ? <details className="mt-2 text-xs text-gray-600"><summary className="cursor-pointer text-purple-700">Ver produtos da venda</summary><ul className="mt-2 space-y-1">{sale.items.map((item, itemIndex) => <li key={itemIndex}>{item.productName} · {retailNumber(item.quantity)} {item.unit || "un"} · {formatCurrency(item.salePrice * item.quantity)}</li>)}</ul></details> : null}
                            {sale.notes && <p className="text-xs text-gray-500 mt-1">{sale.notes}</p>}
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Total: <strong className="text-gray-800">{formatCurrency(sale.totalRevenue)}</strong></p>
                            <p className={`font-bold text-xs mb-2 ${sale.profit < 0 ? "text-red-600" : "text-emerald-600"}`}>Lucro: {formatCurrency(sale.profit)}</p>
                            {(sale.paymentStatus === "pending" || sale.paymentStatus === "overdue") && <Button variant="outline" size="sm" className="mr-1" onClick={() => setReceivingSale(sale)}>Registrar recebimento</Button>}
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDeleteSale(sale._id, sale.month)}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                      </AnimatedCard>
                    ))}
                  </div>
                  </AnimatePresence>
                )}
              </div>
              {sales.length > 0 && (
                <Pagination
                  currentPage={salesPage}
                  totalPages={totalSalesPages}
                  onPageChange={setSalesPage}
                  totalItems={sales.length}
                  itemsPerPage={SALES_PER_PAGE}
                />
              )}
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
                  <AnimatePresence mode="popLayout">
                  <div className="space-y-3">
                    {paginatedExpenses.map((expense, index) => (
                      <AnimatedCard key={expense._id} delay={index * 0.03}>
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
                      </AnimatedCard>
                    ))}
                  </div>
                  </AnimatePresence>

                )}
              </div>
              {expenses.length > 0 && (
                <Pagination
                  currentPage={expensesPage}
                  totalPages={totalExpensesPages}
                  onPageChange={setExpensesPage}
                  totalItems={expenses.length}
                  itemsPerPage={EXPENSES_PER_PAGE}
                />
              )}
            </TabsContent>
            <TabsContent value="resumo">
              <div className="space-y-4">

                {/* 🌟 CABEÇALHO DO RESUMO COM AS 3 VISÕES 🌟 */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <FileText className="w-6 h-6 text-indigo-600" />
                    Relatórios da Loja
                  </h3>

                  {/* Os 3 Botões Mágicos de Visão */}
                  <div className="bg-gray-100 p-1 rounded-xl flex gap-1 w-full sm:w-auto">
                    <button
                      onClick={() => setSummaryView("month")}
                      className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${summaryView === "month" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:bg-gray-200"}`}
                    >
                      Mês Atual
                    </button>
                    <button
                      onClick={() => setSummaryView("year")}
                      className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${summaryView === "year" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:bg-gray-200"}`}
                    >
                      Visão Anual
                    </button>
                    <button
                      onClick={() => setSummaryView("all")}
                      className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${summaryView === "all" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:bg-gray-200"}`}
                    >
                      Tudo
                    </button>
                  </div>
                </div>

                {/* 📅 VISÃO 1: MÊS ATUAL (O que você já tinha) */}
                {summaryView === "month" && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-gray-800">Resultado de {formatMonthName(selectedMonth)}</h2>
                        <p className="text-xs text-gray-500">Desempenho detalhado do mês selecionado</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            if (monthlyReport && sales && expenses) {
                              const exporter = new PDFExporter();
                              const salesForPDF = sales.map(s => ({ _id: s._id, productName: s.productName, quantity: s.quantity, salePrice: s.salePrice, totalRevenue: s.totalRevenue, profit: s.profit, date: s.date }));
                              const expensesForPDF = expenses.map(e => ({ _id: e._id, description: e.description, categoryName: e.categoryName, amount: e.amount, date: e.date }));
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
                          <Download className="w-4 h-4 mr-2" /> Exportar PDF
                        </Button>
                        <Button onClick={handleRegenerateReport} variant="outline" size="sm">
                          <RefreshCw className="w-4 h-4 mr-2" /> Atualizar
                        </Button>
                      </div>
                    </div>

                    {!monthlyReport ? (
                      <Card className="p-12 text-center">
                        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-xl font-bold mb-2">Sem dados para este mês</h3>
                        <p className="text-gray-500 mb-4">Registre vendas e gastos para gerar o relatório</p>
                        <Button onClick={handleRegenerateReport} className="bg-indigo-600">Gerar Relatório</Button>
                      </Card>
                    ) : (
                      <div className="space-y-6">
                        <Card className="p-6">
                          <div className="grid md:grid-cols-3 gap-6 mb-6">
                            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                              <p className="text-sm text-gray-600 mb-1">Receita</p>
                              <p className="text-3xl font-black text-blue-600">{formatCurrency(monthlyReport.totalRevenue)}</p>
                              <p className="text-xs text-gray-500 mt-1">{monthlyReport.totalSales} vendas realizadas</p>
                            </div>
                            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-100">
                              <p className="text-sm text-gray-600 mb-1">Gastos Operacionais</p>
                              <p className="text-3xl font-black text-red-600">{formatCurrency(monthlyReport.totalExpenses)}</p>
                            </div>
                            <div className={`text-center p-4 rounded-lg border ${monthlyReport.netProfit >= 0 ? "bg-emerald-50 border-emerald-100" : "bg-orange-50 border-orange-100"}`}>
                              <p className="text-sm text-gray-600 mb-1">LUCRO LÍQUIDO</p>
                              <p className={`text-3xl font-black ${monthlyReport.netProfit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                                {formatCurrency(monthlyReport.netProfit)}
                              </p>
                              <p className="text-xs font-bold text-gray-600 mt-1">Margem Final: {monthlyReport.profitMargin.toFixed(1)}%</p>
                            </div>
                          </div>

                          {monthlyReport.topProducts.length > 0 && (
                            <>
                              <Separator className="my-6" />
                              <div>
                                <h4 className="font-bold mb-4 flex items-center gap-2 text-lg">
                                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                  Top 5 Produtos Mais Vendidos
                                </h4>
                                <div className="space-y-3">
                                  {monthlyReport.topProducts.slice(0, 5).map((product, idx) => (
                                    <div key={product.productId} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:shadow-md transition-all">
                                      <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${idx === 0 ? 'bg-yellow-400 text-yellow-900 shadow-[0_0_15px_rgba(250,204,21,0.5)]' : idx === 1 ? 'bg-gray-300 text-gray-700' : idx === 2 ? 'bg-amber-600 text-white' : 'bg-indigo-100 text-indigo-700'}`}>
                                          {idx + 1}
                                        </div>
                                        <div>
                                          <p className="font-bold text-gray-900">{product.productName}</p>
                                          <p className="text-sm text-gray-500">{product.quantity} unidades vendidas</p>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Lucro</p>
                                        <p className="font-black text-emerald-600 text-lg">{formatCurrency(product.profit)}</p>
                                      </div>
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
                )}

               {/* 📆 VISÃO 2: ANO ATUAL */}
               {summaryView === "year" && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {allMonths.length === 0 ? (
                      <Card className="p-12 text-center border-2 border-dashed">
                        <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-xl font-bold mb-2">Sem histórico suficiente</h3>
                        <p className="text-gray-500">O gráfico anual aparecerá aqui conforme você registra suas vendas nos próximos meses.</p>
                      </Card>
                    ) : (
                      <YearlyChart
                        data={allMonths.map(m => {
                          const [year, monthNum] = m.month.split("-");
                          const dateObj = new Date(parseInt(year), parseInt(monthNum) - 1);
                          return {
                            month: dateObj.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
                            revenue: m.totalRevenue || 0,
                            expenses: m.totalExpenses || 0,
                            profit: m.netProfit || 0
                          };
                        }).reverse()} // Reverse para ficar em ordem cronológica (Jan -> Dez)
                      />
                    )}
                  </div>
                )}

                {/* 🌍 VISÃO 3: TODO O PERÍODO */}
                {summaryView === "all" && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card className="p-8 bg-gradient-to-br from-purple-600 to-indigo-700 text-white border-0 shadow-xl relative overflow-hidden">
                        <div className="relative z-10">
                          <p className="text-purple-200 font-bold uppercase tracking-widest text-sm mb-2">Faturamento Histórico</p>
                          <h2 className="text-5xl font-black mb-2">{formatCurrency(userStats?.totalRevenue || 0)}</h2>
                          <p className="text-purple-100">Desde o primeiro dia no aplicativo</p>
                        </div>
                        <Target className="absolute -bottom-10 -right-10 w-48 h-48 text-purple-500 opacity-20" />
                      </Card>

                      <Card className="p-8 bg-gradient-to-br from-emerald-500 to-green-600 text-white border-0 shadow-xl relative overflow-hidden">
                        <div className="relative z-10">
                          <p className="text-emerald-100 font-bold uppercase tracking-widest text-sm mb-2">Lucro Histórico</p>
                          <h2 className="text-5xl font-black mb-2">{formatCurrency(userStats?.totalProfit || 0)}</h2>
                          <p className="text-emerald-100">O que realmente ficou no bolso</p>
                        </div>
                        <DollarSign className="absolute -bottom-10 -right-10 w-48 h-48 text-emerald-400 opacity-20" />
                      </Card>
                    </div>
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
              <div className="space-y-6">

                {/* HEADER DA ABA */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Users className="w-6 h-6 text-pink-600" />
                      Clientes ({customers.length})
                    </h3>
                    <p className="text-sm text-gray-500">Cadastros, histórico de compras e contato em um só lugar.</p>
                  </div>
                  <Button onClick={() => {
                    setCustomerForm({ name: "", email: "", phone: "", address: "", notes: "", birthDate: "", status: "" });
                    setShowAddCustomer(true);
                  }} className={styles.primary}>
                    <Plus className="w-4 h-4 mr-2" /> Novo Cliente
                  </Button>
                </div>

                {/* SEARCH E FILTROS */}
                {customers.length > 0 && (
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          aria-label="Buscar clientes"
                          placeholder="Nome, e-mail ou telefone"
                          value={customerSearchTerm}
                          onChange={(e) => setCustomerSearchTerm(e.target.value)}
                          className="pl-9 bg-gray-50 border-gray-200"
                        />
                      </div>
                      <div className={`${styles.customerFilters} flex gap-2 w-full md:w-auto pb-1 md:pb-0`}>
                        <Select value={customerStatusFilter} onValueChange={setCustomerStatusFilter}>
                          <SelectTrigger aria-label="Filtrar clientes por status" className="w-[165px] shrink-0 bg-gray-50 border-gray-200">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos os status</SelectItem>
                            <SelectItem value="lead">🔥 Lead</SelectItem>
                            <SelectItem value="ativo">✅ Ativo</SelectItem>
                            <SelectItem value="vip">💎 VIP</SelectItem>
                            <SelectItem value="inativo">❄️ Inativo</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select value={customerSortBy} onValueChange={setCustomerSortBy}>
                          <SelectTrigger aria-label="Ordenar clientes" className="w-[195px] shrink-0 bg-gray-50 border-gray-200">
                            <SelectValue placeholder="Ordenar por" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="name">Nome (A-Z)</SelectItem>
                            <SelectItem value="date">Mais Recentes</SelectItem>
                            <SelectItem value="lastContact">Última compra / cadastro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {customers.length > 0 && <p className={styles.resultCount} role="status">{filteredAndSortedCustomers.length} de {customers.length} clientes encontrados</p>}
                {customers.length > 0 && filteredAndSortedCustomers.length === 0 && (
                  <div className={styles.emptyResults}>
                    <h4>Nenhum cliente encontrado</h4>
                    <p>Tente outro nome, e-mail ou telefone, ou limpe os filtros.</p>
                    <Button variant="outline" onClick={() => { setCustomerSearchTerm(""); setCustomerStatusFilter("all"); }}>Limpar filtros</Button>
                  </div>
                )}

                {/* PAINEL DE AUTOMAÇÕES (Ações do Dia) */}
                {customers.length > 0 && (
                  <details className={styles.opportunities}>
                    <summary>
                      <Sparkles className="w-4 h-4" aria-hidden="true" />
                      Oportunidades de contato
                    <span>Aniversários, novidades e clientes VIP</span>
                    </summary>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                      {/* CARD 1: Aniversariantes */}
                      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-bold text-sm text-gray-800">🎂 Aniversariantes</p>
                          <Badge className="bg-pink-100 text-pink-700">Mimar</Badge>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">Envie os parabéns com um cupom especial para quem faz aniversário este mês.</p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-emerald-700 hover:bg-emerald-50"
                          onClick={() => {
                            const aniversariantes = customers.filter(c => c.birthDate && new Date(c.birthDate).getMonth() === new Date().getMonth());
                            if(aniversariantes.length === 0) return toast.info("Nenhum aniversariante este mês.");
                            // Abre o primeiro aniversariante (pode expandir depois para lista)
                            const c = aniversariantes[0];
                            const phone = c.phone?.replace(/\D/g, '');
                            if(!phone) return toast.error(`${c.name} não tem telefone cadastrado.`);
                            window.open(`https://wa.me/55${phone}?text=Oii%20${c.name}!%20Vi%20que%20seu%20anivers%C3%A1rio%20t%C3%A1%20chegando%20%F0%9F%8E%89%20Pra%20comemorar,%20separei%20um%20cupom%20de%2015%25%20de%20desconto%20pra%20voc%C3%AA%20aqui%20na%20loja!`, '_blank');
                          }}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" /> Enviar Parabéns
                        </Button>
                      </div>

                      {/* CARD 2: Clientes Sumidos (Saudade) */}
                      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-bold text-sm text-gray-800">🥺 Sumidos (+30 dias)</p>
                          <Badge className="bg-orange-100 text-orange-700">Resgatar</Badge>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">Estes clientes não compram há mais de um mês. Mande as novidades!</p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-emerald-700 hover:bg-emerald-50"
                          onClick={() => {
                            const trintaDias = Date.now() - (30 * 24 * 60 * 60 * 1000);
                            const sumidos = customers.filter(c => c.lastPurchase && c.lastPurchase < trintaDias);
                            if(sumidos.length === 0) return toast.info("Nenhum cliente sumido!");
                            const c = sumidos[0];
                            const phone = c.phone?.replace(/\D/g, '');
                            if(!phone) return toast.error(`${c.name} não tem telefone.`);
                            window.open(`https://wa.me/55${phone}?text=Oii%20${c.name},%20tudo%20bem%3F%20%E2%9C%A8%20Tem%20um%20tempinho%20que%20voc%C3%AA%20n%C3%A3o%20vem%20aqui...%20Chegou%20uma%20cole%C3%A7%C3%A3o%20nova%20linda,%20quer%20dar%20uma%20olhada%3F`, '_blank');
                          }}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" /> Mostrar Novidades
                        </Button>
                      </div>

                      {/* CARD 3: Clientes VIP */}
                      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-bold text-sm text-gray-800">💎 Clientes VIPs</p>
                          <Badge className="bg-purple-100 text-purple-700">Fidelizar</Badge>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">Seus melhores compradores. Mande um mimo ou aviso de pré-venda.</p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-emerald-700 hover:bg-emerald-50"
                          onClick={() => {
                            const vips = [...customers].sort((a, b) => b.totalSpent - a.totalSpent);
                            if(vips.length === 0 || vips[0].totalSpent === 0) return toast.info("Ainda sem VIPs.");
                            const c = vips[0];
                            const phone = c.phone?.replace(/\D/g, '');
                            if(!phone) return toast.error(`${c.name} não tem telefone.`);
                            window.open(`https://wa.me/55${phone}?text=Oii%20${c.name}!%20Tudo%20bem%3F%20%F0%9F%92%96%20Como%20voc%C3%AA%20%C3%A9%20nossa%20cliente%20VIP,%20to%20te%20mandando%20em%20primeira%20m%C3%A3o%20as%20novidades%20que%20acabaram%20de%20chegar!`, '_blank');
                          }}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" /> Contatar VIP
                        </Button>
                      </div>

                    </div>
                  </details>
                )}


                {/* LISTA DE CLIENTES */}
                {customers.length === 0 ? (
                  <Card className="p-12 text-center border-2 border-dashed">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-bold mb-2">Nenhum cliente cadastrado</h3>
                    <p className="text-gray-500 mb-4">Cadastre seu primeiro cliente para organizar contatos e acompanhar as compras.</p>
                    <Button onClick={() => setShowAddCustomer(true)} className="bg-pink-600">
                      Cadastrar Primeiro Cliente
                    </Button>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    {paginatedCustomers.map((customer) => (
                      <Card key={customer._id} className={`${styles.customerCard} p-4 hover:shadow-lg transition-all relative group border-gray-100`}>
                        <div className="flex justify-between items-start gap-2 mb-3">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-lg text-gray-800 truncate" title={customer.name}>{customer.name}</h4>
                              {customer.status && (
                                <Badge className={`text-[10px] px-1.5 py-0 hover:bg-opacity-80 border-0 ${
                                  customer.status === 'vip' ? 'bg-purple-100 text-purple-700' :
                                  customer.status === 'inativo' ? 'bg-gray-100 text-gray-600' :
                                  customer.status === 'lead' ? 'bg-orange-100 text-orange-700' :
                                  'bg-emerald-100 text-emerald-700'
                                }`}>
                                  {customer.status === 'vip' && '💎 VIP'}
                                  {customer.status === 'inativo' && '❄️ Inativo'}
                                  {customer.status === 'lead' && '🔥 Lead'}
                                  {customer.status === 'ativo' && '✅ Ativo'}
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-col gap-1 mt-1">
                              {customer.phone && <span className="text-xs text-gray-500 font-mono">📱 {customer.phone}</span>}
                              {customer.birthDate && <span className="text-xs text-gray-500">🎂 {formatDate(customer.birthDate)}</span>}
                            </div>
                          </div>

                          {/* Botões Hover (Editar / Excluir / Zap) */}
                          <div className="flex flex-col gap-1 shrink-0">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                              aria-label={`Editar ${customer.name}`}
                              title="Editar cliente"
                              onClick={() => openEditCustomer(customer)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-red-500 hover:bg-red-50"
                              aria-label={`Excluir ${customer.name}`}
                              title="Excluir cliente"
                              onClick={() => handleDeleteCustomer(customer._id, customer.name)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            {customer.phone && (
                              <Button
                                size="icon"
                                variant="ghost"
                                aria-label={`Abrir WhatsApp de ${customer.name}`}
                                title="Abrir WhatsApp"
                                className="h-8 w-8 text-[#25D366] hover:bg-green-50"
                                onClick={() => {
                                  const phone = customer.phone?.replace(/\D/g, '');
                                  window.open(`https://wa.me/55${phone}`, '_blank');
                                }}
                              >
                                <MessageSquare className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        <Separator className="my-3 opacity-50" />

                        <div className="flex justify-between items-center text-sm">
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide font-bold">Total Gasto</p>
                            <p className="font-black text-pink-600">{formatCurrency(customer.totalSpent)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide font-bold">Pedidos</p>
                            <p className="font-bold text-gray-700">{customer.totalOrders}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {filteredAndSortedCustomers.length > 0 && (
                  <Pagination
                    currentPage={customersPage}
                    totalPages={totalCustomersPages}
                    onPageChange={setCustomersPage}
                    totalItems={filteredAndSortedCustomers.length}
                    itemsPerPage={CUSTOMERS_PER_PAGE}
                  />
                )}
              </div>
            </TabsContent>

            <TabsContent value="fornecedores">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Seus Fornecedores ({suppliers.length})</h3>
                  <Button onClick={() => {
                    setSupplierForm({ name: "", email: "", phone: "", address: "", notes: "" });
                    setShowAddSupplier(true);
                  }} className="bg-teal-600 hover:bg-teal-700">
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
                    {paginatedSuppliers.map((supplier) => (
                      <Card key={supplier._id} className="p-3 md:p-4 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between gap-2 mb-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm md:text-base truncate">{supplier.name}</h4>
                            {supplier.contact?.email && <p className="text-xs md:text-sm text-gray-600 truncate">{supplier.contact.email}</p>}
                            {supplier.contact?.phone && <p className="text-xs md:text-sm text-gray-600">{supplier.contact.phone}</p>}
                          </div>

                          {/* MENU DE AÇÕES */}
                          <div className="flex gap-1">
                             <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 shrink-0 text-blue-600 hover:bg-blue-50"
                              onClick={() => openEditSupplier(supplier)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 shrink-0 text-red-500 hover:bg-red-50"
                              onClick={() => handleDeleteSupplier(supplier._id, supplier.name)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
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
                {suppliers.length > 0 && (
                  <Pagination
                    currentPage={suppliersPage}
                    totalPages={totalSuppliersPages}
                    onPageChange={setSuppliersPage}
                    totalItems={suppliers.length}
                    itemsPerPage={SUPPLIERS_PER_PAGE}
                  />
                )}
              </div>
              {/* DIALOG DE EDIÇÃO DE FORNECEDOR */}
              <Dialog open={showEditSupplier} onOpenChange={setShowEditSupplier}>
                <DialogContent className={`${styles.dialog} w-full md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto p-4 md:p-6`}>
                  <DialogHeader>
                    <DialogTitle>✏️ Editar Fornecedor</DialogTitle>
                    <DialogDescription>Atualize os dados do fornecedor</DialogDescription>
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
                      <div>
                <Label>Data de Aniversário</Label>
                <Input
                  type="date"
                  value={customerForm.birthDate}
                  onChange={(e) => setCustomerForm({ ...customerForm, birthDate: e.target.value })}
                  className="bg-white"
                />
              </div>
                      <Input
                        value={supplierForm.phone}
                        onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                        placeholder="(00) 0000-0000"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowEditSupplier(false)}>Cancelar</Button>
                    <Button onClick={handleEditSupplier} className="bg-teal-600">Salvar Alterações</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>
          </Tabs>
        </div>
      </div>

        <Dialog open={showQuickSale} onOpenChange={setShowQuickSale}>
          <DialogContent className={`${styles.dialog} w-full md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto p-4 md:p-6`}>
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
          <DialogContent className={`${styles.dialog} sm:max-w-md`}>
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

        <ProductCapture
          open={showAddProduct}
          onClose={() => { setShowAddProduct(false); setCaptureSeed(null); setCaptureCode(undefined); }}
          onSaved={() => { setActiveTab("produtos"); setProductsPage(1); setSearchQuery(""); setFilterCategory("all"); }}
          initialCode={captureCode}
          seed={captureSeed}
        />
        <ProductLabels open={labelProducts.length > 0} onClose={() => setLabelProducts([])} products={labelProducts} />
        {receivingSale && <ReceiveSaleDialog key={receivingSale._id} sale={receivingSale} onClose={() => setReceivingSale(null)} />}

        <Dialog open={showEditProduct} onOpenChange={setShowEditProduct}>
          <DialogContent className={`${styles.dialog} w-full md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto p-4 md:p-6`}>
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
                    step={allowsFraction(productForm.unit) ? "0.001" : "1"}
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Estoque Mínimo</Label>
                  <Input
                    type="number"
                    step={allowsFraction(productForm.unit) ? "0.001" : "1"}
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
          <DialogContent className={`${styles.dialog} w-full md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto p-4 md:p-6`}>
            <DialogHeader>
              <DialogTitle>🛒 Registrar Venda</DialogTitle>
              <DialogDescription>
                Registre uma nova venda e atualize o estoque automaticamente
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Produto *</Label>
              <div className="space-y-2">
  <Label>Buscar Produto *</Label>
  <div className="relative">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
    <Input
      placeholder="Digite o nome do produto..."
      value={productSearchTerm}
      onChange={(e) => setProductSearchTerm(e.target.value)}
      className="pl-10 bg-white"
    />
  </div>

  {/* Lista de sugestões que aparece quando digita ou se não tiver produto selecionado */}
  {!saleForm.productId && (
    <div className="border rounded-md max-h-40 overflow-y-auto bg-slate-50 p-1">
      {products
        .filter((p) => p.active && p.name.toLowerCase().includes(productSearchTerm.toLowerCase()))
        .length === 0 ? (
          <p className="text-sm text-gray-500 p-2 text-center">Nenhum produto encontrado</p>
        ) : (
          products
            .filter((p) => p.active && p.name.toLowerCase().includes(productSearchTerm.toLowerCase()))
            .map((p) => (
              <div
                key={p._id}
                onClick={() => {
                  setSaleForm({ ...saleForm, productId: p._id });
                  setProductSearchTerm(p.name); // Preenche o nome no input visualmente
                }}
                className="p-2 hover:bg-blue-100 cursor-pointer rounded text-sm flex justify-between items-center transition-colors"
              >
                <span className="font-medium">{p.name}</span>
                <span className="text-emerald-600 font-bold">{formatCurrency(p.salePrice)}</span>
              </div>
            ))
        )}
    </div>
  )}

  {/* Produto Selecionado (Visualização) */}
  {saleForm.productId && (
    <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg mt-2">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-blue-600" />
        <div>
          <p className="font-bold text-sm text-blue-900">
            {products.find(p => p._id === saleForm.productId)?.name}
          </p>
          <p className="text-xs text-blue-700">
            Preço: {formatCurrency(products.find(p => p._id === saleForm.productId)?.salePrice || 0)}
          </p>
        </div>
      </div>
      <Button
        size="sm"
        variant="ghost"
        className="text-red-500 hover:bg-red-50 h-8 w-8 p-0"
        onClick={() => {
          setSaleForm({ ...saleForm, productId: "" });
          setProductSearchTerm("");
        }}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  )}
</div>
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
              <Button onClick={handleAddSale} className="bg-emerald-600" disabled={isSubmittingSale}>
                {isSubmittingSale ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Registrar Venda
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showAddExpense} onOpenChange={setShowAddExpense}>
          <DialogContent className={`${styles.dialog} w-full md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto p-4 md:p-6`}>
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
{/* DIALOG DE EDIÇÃO DE CLIENTE */}
<Dialog open={showEditCustomer} onOpenChange={setShowEditCustomer}>
          <DialogContent className={`${styles.dialog} w-full md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto p-4 md:p-6`}>
            <DialogHeader>
              <DialogTitle>✏️ Editar Cliente</DialogTitle>
              <DialogDescription>Atualize os dados do cliente</DialogDescription>
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
                <Label>Data de Aniversário</Label>
                <Input
                  type="date"
                  value={customerForm.birthDate}
                  onChange={(e) => setCustomerForm({ ...customerForm, birthDate: e.target.value })}
                  className="bg-white"
                />
              </div>
              <div>
                <Label>Situação do Cliente</Label>
                <Select
                  value={customerForm.status}
                  onValueChange={(v) => setCustomerForm({ ...customerForm, status: v })}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Selecione a situação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead">🔥 Novo Lead</SelectItem>
                    <SelectItem value="ativo">✅ Ativo</SelectItem>
                    <SelectItem value="inativo">❄️ Inativo</SelectItem>
                    <SelectItem value="vip">💎 VIP</SelectItem>
                  </SelectContent>
                </Select>
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
              <Button variant="outline" onClick={() => setShowEditCustomer(false)}>Cancelar</Button>
              <Button onClick={handleEditCustomer} className="bg-blue-600">Salvar Alterações</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={showAddCustomer} onOpenChange={setShowAddCustomer}>
          <DialogContent className={`${styles.dialog} w-full md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto p-4 md:p-6`}>
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
                <Label>Data de Aniversário</Label>
                <Input
                  type="date"
                  value={customerForm.birthDate}
                  onChange={(e) => setCustomerForm({ ...customerForm, birthDate: e.target.value })}
                  className="bg-white"
                />
              </div>
              <div>
                <Label>Situação do Cliente</Label>
                <Select
                  value={customerForm.status}
                  onValueChange={(v) => setCustomerForm({ ...customerForm, status: v })}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Selecione a situação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead">🔥 Novo Lead</SelectItem>
                    <SelectItem value="ativo">✅ Ativo</SelectItem>
                    <SelectItem value="inativo">❄️ Inativo</SelectItem>
                    <SelectItem value="vip">💎 VIP</SelectItem>
                  </SelectContent>
                </Select>
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
          <DialogContent className={`${styles.dialog} w-full md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto p-4 md:p-6`}>
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
          <DialogContent className={`${styles.dialog} w-full md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto p-4 md:p-6`}>
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
          <DialogContent className={`${styles.dialog} w-full md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto p-4 md:p-6`}>
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
        {/* MODAL DE FRENTE DE CAIXA (PDV) */}
        {showPDV && (
          <PDVSaleModal
            isOpen={showPDV}
            onClose={() => setShowPDV(false)}
            products={products}
            customers={customers}
            onCreateProduct={(code) => { setCaptureCode(code); setShowPDV(false); setShowAddProduct(true); }}
          />
        )}
    </div>
  );
}