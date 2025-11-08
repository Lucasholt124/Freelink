"use client";

import { useState, useCallback, useMemo } from "react";
import { useAction, useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import confetti from 'canvas-confetti';
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Target,
  Zap,
  Trash2,
  Star,
  ArrowRight,
  Plus,
  X,
  Award,
  RefreshCw,
  Clock,
  History,
  Settings,
  Info,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// =================================================================
// 🎯 TIPOS E CONSTANTES
// =================================================================

const BUSINESS_TYPES = [
  { value: "ecommerce", label: "E-commerce", icon: "🛒" },
  { value: "saas", label: "SaaS / Software", icon: "💻" },
  { value: "freelancer", label: "Freelancer", icon: "👤" },
  { value: "infoproducts", label: "Infoprodutos", icon: "📚" },
  { value: "services", label: "Serviços", icon: "🔧" },
  { value: "physical_store", label: "Loja Física", icon: "🏪" },
  { value: "dropshipping", label: "Dropshipping", icon: "📦" },
  { value: "consulting", label: "Consultoria", icon: "💼" },
  { value: "other", label: "Outro", icon: "✨" }
] as const;

type BusinessType = typeof BUSINESS_TYPES[number]["value"];

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

interface FixedCosts {
  rent: number;
  salaries: number;
  software: number;
  marketing: number;
  utilities: number;
  insurance: number;
  other: number;
}

interface VariableCosts {
  materials: number;
  shipping: number;
  commissions: number;
  packaging: number;
  ads: number;
  fees: number;
  other: number;
}

interface Results {
  totalRevenue: number;
  totalCosts: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  breakEvenPoint: number;
  roi: number;
}

interface Recommendation {
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  potentialSavings: number;
}

interface AIAnalysis {
  score: number;
  insights: string[];
  warnings: string[];
  opportunities: string[];
  benchmarkComparison: {
    industry: string;
    yourMargin: number;
    industryAverage: number;
    status: "above" | "average" | "below";
  };
  recommendations: Recommendation[];
}

interface Scenarios {
  optimistic: {
    revenue: number;
    profit: number;
    margin: number;
  };
  realistic: {
    revenue: number;
    profit: number;
    margin: number;
  };
  pessimistic: {
    revenue: number;
    profit: number;
    margin: number;
  };
}

interface CalculationResult {
  id: Id<"profitCalculations">;
  results: Results;
  aiAnalysis: AIAnalysis;
  scenarios: Scenarios;
}

interface SavedCalculation {
  _id: Id<"profitCalculations">;
  userId: string;
  businessName: string;
  businessType: BusinessType;
  revenue: {
    monthly: number;
    products?: Product[];
  };
  fixedCosts: FixedCosts & { total: number };
  variableCosts: VariableCosts & { total: number };
  results: Results;
  aiAnalysis: AIAnalysis;
  scenarios: Scenarios;
  favorite?: boolean;
  createdAt: number;
}

// =================================================================
// 🎨 COMPONENTE PRINCIPAL
// =================================================================

export default function ProfitCalculatorComponent() {
  // Estados principais
  const [activeTab, setActiveTab] = useState<"calculator" | "history">("calculator");
  const [isCalculating, setIsCalculating] = useState(false);

  // Dados do negócio
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType>("ecommerce");

  // Receita
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [showProducts, setShowProducts] = useState(false);

  // Custos Fixos
  const [fixedCosts, setFixedCosts] = useState<FixedCosts>({
    rent: 0,
    salaries: 0,
    software: 0,
    marketing: 0,
    utilities: 0,
    insurance: 0,
    other: 0
  });

  // Custos Variáveis
  const [variableCosts, setVariableCosts] = useState<VariableCosts>({
    materials: 0,
    shipping: 0,
    commissions: 0,
    packaging: 0,
    ads: 0,
    fees: 0,
    other: 0
  });

  // Resultado
  const [result, setResult] = useState<CalculationResult | null>(null);

  // Convex
  const calculateProfit = useAction(api.profitCalculator.calculateProfit);
  const calculations = useQuery(api.profitCalculator.getCalculations) ?? [];
  const deleteCalculation = useMutation(api.profitCalculator.deleteCalculation);
  const toggleFavorite = useMutation(api.profitCalculator.toggleFavorite);

  // =================================================================
  // 🧮 CÁLCULOS
  // =================================================================

  const totalFixedCosts = useMemo(() => {
    return Object.values(fixedCosts).reduce((sum, val) => sum + (val || 0), 0);
  }, [fixedCosts]);

  const totalVariableCosts = useMemo(() => {
    return Object.values(variableCosts).reduce((sum, val) => sum + (val || 0), 0);
  }, [variableCosts]);

  const totalCosts = totalFixedCosts + totalVariableCosts;

  // =================================================================
  // 🎊 FUNÇÕES AUXILIARES
  // =================================================================

  const triggerConfetti = useCallback(() => {
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B']
    });
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleAddProduct = () => {
    const newProduct: Product = {
      id: Date.now().toString(),
      name: "",
      price: 0,
      quantity: 0,
      total: 0
    };
    setProducts([...products, newProduct]);
  };

  const handleUpdateProduct = (id: string, field: keyof Product, value: string | number) => {
    setProducts(products.map(p => {
      if (p.id === id) {
        const updated = { ...p, [field]: value };
        if (field === 'price' || field === 'quantity') {
          updated.total = updated.price * updated.quantity;
        }
        return updated;
      }
      return p;
    }));
  };

  const handleRemoveProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const calculateProductsRevenue = () => {
    return products.reduce((sum, p) => sum + p.total, 0);
  };

  // =================================================================
  // 🚀 CALCULAR
  // =================================================================

  const handleCalculate = async () => {
    if (!businessName.trim()) {
      toast.error("Digite o nome do seu negócio!");
      return;
    }

    if (monthlyRevenue <= 0 && calculateProductsRevenue() <= 0) {
      toast.error("Informe sua receita mensal!");
      return;
    }

    setIsCalculating(true);

    try {
      const finalRevenue = showProducts ? calculateProductsRevenue() : monthlyRevenue;

      const response = await calculateProfit({
        businessName,
        businessType,
        revenue: {
          monthly: finalRevenue,
          products: showProducts ? products.map(p => ({
            name: p.name,
            price: p.price,
            quantity: p.quantity,
            total: p.total
          })) : undefined
        },
        fixedCosts: {
          ...fixedCosts,
          total: totalFixedCosts
        },
        variableCosts: {
          ...variableCosts,
          total: totalVariableCosts
        }
      });

      setResult(response as CalculationResult);

      toast.success(
        <div className="flex flex-col gap-1">
          <p className="font-bold">✅ Análise concluída!</p>
          <p className="text-xs">Score: {(response as CalculationResult).aiAnalysis.score}/100</p>
        </div>
      );

      triggerConfetti();
      setActiveTab("calculator");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Erro ao calcular");
    } finally {
      setIsCalculating(false);
    }
  };

  const handleDelete = async (id: Id<"profitCalculations">) => {
    try {
      await deleteCalculation({ id });
      toast.success("Cálculo deletado!");
    } catch  {
      toast.error("Erro ao deletar");
    }
  };

  const handleToggleFavorite = async (id: Id<"profitCalculations">, currentFavorite: boolean) => {
    try {
      await toggleFavorite({ id, favorite: !currentFavorite });
      toast.success(currentFavorite ? "Removido dos favoritos" : "⭐ Favoritado!");
    } catch  {
      toast.error("Erro ao favoritar");
    }
  };

  const handleLoadCalculation = (calc: SavedCalculation) => {
    setBusinessName(calc.businessName);
    setBusinessType(calc.businessType);
    setMonthlyRevenue(calc.revenue.monthly);
    setProducts(calc.revenue.products || []);
    setShowProducts(!!calc.revenue.products?.length);
    setFixedCosts({
      rent: calc.fixedCosts.rent || 0,
      salaries: calc.fixedCosts.salaries || 0,
      software: calc.fixedCosts.software || 0,
      marketing: calc.fixedCosts.marketing || 0,
      utilities: calc.fixedCosts.utilities || 0,
      insurance: calc.fixedCosts.insurance || 0,
      other: calc.fixedCosts.other || 0
    });
    setVariableCosts({
      materials: calc.variableCosts.materials || 0,
      shipping: calc.variableCosts.shipping || 0,
      commissions: calc.variableCosts.commissions || 0,
      packaging: calc.variableCosts.packaging || 0,
      ads: calc.variableCosts.ads || 0,
      fees: calc.variableCosts.fees || 0,
      other: calc.variableCosts.other || 0
    });
    setResult({
      id: calc._id,
      results: calc.results,
      aiAnalysis: calc.aiAnalysis,
      scenarios: calc.scenarios
    });
    setActiveTab("calculator");
    toast.success("Cálculo carregado!");
  };

  const handleReset = () => {
    setBusinessName("");
    setBusinessType("ecommerce");
    setMonthlyRevenue(0);
    setProducts([]);
    setShowProducts(false);
    setFixedCosts({
      rent: 0,
      salaries: 0,
      software: 0,
      marketing: 0,
      utilities: 0,
      insurance: 0,
      other: 0
    });
    setVariableCosts({
      materials: 0,
      shipping: 0,
      commissions: 0,
      packaging: 0,
      ads: 0,
      fees: 0,
      other: 0
    });
    setResult(null);
    toast.success("Formulário limpo!");
  };

  // =================================================================
  // 🎨 RENDERIZAÇÃO
  // =================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 pb-12">
      {/* Background decorativo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-6">

        {/* Header com Stats */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="bg-gradient-to-br from-emerald-500 to-blue-600 border-0 shadow-2xl overflow-hidden">
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <DollarSign className="w-6 h-6 mx-auto mb-2 text-emerald-100" />
                    <p className="text-sm text-emerald-100">Receita</p>
                    <p className="text-lg md:text-xl font-bold text-white">
                      {formatCurrency(result.results.totalRevenue)}
                    </p>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="w-6 h-6 mx-auto mb-2 text-white" />
                    <p className="text-sm text-emerald-100">Lucro Líquido</p>
                    <p className={`text-lg md:text-xl font-bold ${
                      result.results.netProfit >= 0 ? 'text-white' : 'text-red-200'
                    }`}>
                      {formatCurrency(result.results.netProfit)}
                    </p>
                  </div>
                  <div className="text-center">
                    <PieChart className="w-6 h-6 mx-auto mb-2 text-blue-100" />
                    <p className="text-sm text-emerald-100">Margem</p>
                    <p className="text-lg md:text-xl font-bold text-white">
                      {result.results.profitMargin.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-center">
                    <Award className="w-6 h-6 mx-auto mb-2 text-yellow-200" />
                    <p className="text-sm text-emerald-100">Score IA</p>
                    <p className="text-lg md:text-xl font-bold text-white">
                      {result.aiAnalysis.score}/100
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "calculator" | "history")} className="space-y-6">
          <TabsList className="grid grid-cols-2 max-w-md mx-auto bg-white shadow-lg">
            <TabsTrigger value="calculator" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-blue-600 data-[state=active]:text-white">
              <Calculator className="w-4 h-4 mr-2" />
              Calculadora
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              <History className="w-4 h-4 mr-2" />
              Histórico ({calculations.length})
            </TabsTrigger>
          </TabsList>

          {/* TAB: CALCULADORA */}
          <TabsContent value="calculator">
            <div className="grid lg:grid-cols-3 gap-6">

              {/* Coluna 1: Informações Básicas */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <Card className="p-6 bg-white shadow-xl border-2">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-xl">
                      <Settings className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Informações Básicas</h3>
                      <p className="text-xs text-gray-500">Configure seu negócio</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Nome do Negócio */}
                    <div>
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        <span className="text-emerald-600">●</span> Nome do Negócio
                      </Label>
                      <Input
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Ex: Loja do João"
                        className="mt-2 border-2 focus:border-emerald-500"
                      />
                    </div>

                    {/* Tipo de Negócio */}
                    <div>
                      <Label className="text-sm font-semibold flex items-center gap-2 mb-2">
                        <span className="text-blue-600">●</span> Tipo de Negócio
                      </Label>
                      <Select value={businessType} onValueChange={(v) => setBusinessType(v as BusinessType)}>
                        <SelectTrigger className="border-2 focus:border-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {BUSINESS_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.icon} {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Receita */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm font-semibold flex items-center gap-2">
                          <span className="text-purple-600">●</span> Receita Mensal
                        </Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowProducts(!showProducts)}
                          className="text-xs h-7"
                        >
                          {showProducts ? 'Modo Simples' : '+ Produtos'}
                        </Button>
                      </div>

                      {!showProducts ? (
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                            R$
                          </span>
                          <Input
                            type="number"
                            value={monthlyRevenue || ''}
                            onChange={(e) => setMonthlyRevenue(parseFloat(e.target.value) || 0)}
                            placeholder="0,00"
                            className="pl-10 border-2 focus:border-purple-500"
                          />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <AnimatePresence>
                            {products.map((product, index) => (
                              <motion.div
                                key={product.id}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-gray-50 rounded-lg p-3 space-y-2"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-semibold text-gray-600">
                                    Produto #{index + 1}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveProduct(product.id)}
                                    className="h-6 w-6 p-0 text-red-500"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                                <Input
                                  placeholder="Nome do produto"
                                  value={product.name}
                                  onChange={(e) => handleUpdateProduct(product.id, 'name', e.target.value)}
                                  className="text-sm"
                                />
                                <div className="grid grid-cols-2 gap-2">
                                  <Input
                                    type="number"
                                    placeholder="Preço"
                                    value={product.price || ''}
                                    onChange={(e) => handleUpdateProduct(product.id, 'price', parseFloat(e.target.value) || 0)}
                                    className="text-sm"
                                  />
                                  <Input
                                    type="number"
                                    placeholder="Qtd"
                                    value={product.quantity || ''}
                                    onChange={(e) => handleUpdateProduct(product.id, 'quantity', parseInt(e.target.value) || 0)}
                                    className="text-sm"
                                  />
                                </div>
                                <div className="text-right text-sm font-bold text-emerald-600">
                                  Total: {formatCurrency(product.total)}
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleAddProduct}
                            className="w-full border-dashed border-2"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar Produto
                          </Button>

                          {products.length > 0 && (
                            <div className="bg-emerald-50 rounded-lg p-3 border-2 border-emerald-200">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-emerald-900">Receita Total:</span>
                                <span className="text-lg font-bold text-emerald-600">
                                  {formatCurrency(calculateProductsRevenue())}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Preview Rápido */}
                <Card className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 border-2">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-500" />
                    Preview Rápido
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Receita:</span>
                      <span className="font-semibold text-emerald-600">
                        {formatCurrency(showProducts ? calculateProductsRevenue() : monthlyRevenue)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Custos Fixos:</span>
                      <span className="font-semibold text-orange-600">
                        {formatCurrency(totalFixedCosts)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Custos Variáveis:</span>
                      <span className="font-semibold text-red-600">
                        {formatCurrency(totalVariableCosts)}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="font-bold">Lucro Estimado:</span>
                      <span className={`font-bold text-lg ${
                        (showProducts ? calculateProductsRevenue() : monthlyRevenue) - totalCosts >= 0
                          ? 'text-emerald-600'
                          : 'text-red-600'
                      }`}>
                        {formatCurrency((showProducts ? calculateProductsRevenue() : monthlyRevenue) - totalCosts)}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Coluna 2: Custos */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-6"
              >
                {/* Custos Fixos */}
                <Card className="p-6 bg-white shadow-xl border-2">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl">
                      <BarChart3 className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">Custos Fixos</h3>
                      <p className="text-xs text-gray-500">Despesas mensais recorrentes</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="font-bold text-orange-600">
                        {formatCurrency(totalFixedCosts)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { key: 'rent' as keyof FixedCosts, label: 'Aluguel', icon: '🏢' },
                      { key: 'salaries' as keyof FixedCosts, label: 'Salários', icon: '👥' },
                      { key: 'software' as keyof FixedCosts, label: 'Software/SaaS', icon: '💻' },
                      { key: 'marketing' as keyof FixedCosts, label: 'Marketing Fixo', icon: '📢' },
                      { key: 'utilities' as keyof FixedCosts, label: 'Contas (luz, água)', icon: '💡' },
                      { key: 'insurance' as keyof FixedCosts, label: 'Seguros', icon: '🛡️' },
                      { key: 'other' as keyof FixedCosts, label: 'Outros', icon: '📝' }
                    ].map(item => (
                      <div key={item.key}>
                        <Label className="text-xs text-gray-600 flex items-center gap-1 mb-1">
                          <span>{item.icon}</span> {item.label}
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                          <Input
                            type="number"
                            value={fixedCosts[item.key] || ''}
                            onChange={(e) => setFixedCosts({
                              ...fixedCosts,
                              [item.key]: parseFloat(e.target.value) || 0
                            })}
                            placeholder="0,00"
                            className="pl-10 text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>

              {/* Coluna 3: Custos Variáveis */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-6"
              >
                {/* Custos Variáveis */}
                <Card className="p-6 bg-white shadow-xl border-2">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl">
                      <TrendingDown className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">Custos Variáveis</h3>
                      <p className="text-xs text-gray-500">Despesas por venda</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="font-bold text-red-600">
                        {formatCurrency(totalVariableCosts)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { key: 'materials' as keyof VariableCosts, label: 'Materiais/Estoque', icon: '📦' },
                      { key: 'shipping' as keyof VariableCosts, label: 'Frete', icon: '🚚' },
                      { key: 'commissions' as keyof VariableCosts, label: 'Comissões', icon: '💰' },
                      { key: 'packaging' as keyof VariableCosts, label: 'Embalagens', icon: '📦' },
                      { key: 'ads' as keyof VariableCosts, label: 'Anúncios (Ads)', icon: '📱' },
                      { key: 'fees' as keyof VariableCosts, label: 'Taxas de Plataforma', icon: '💳' },
                      { key: 'other' as keyof VariableCosts, label: 'Outros', icon: '📝' }
                    ].map(item => (
                      <div key={item.key}>
                        <Label className="text-xs text-gray-600 flex items-center gap-1 mb-1">
                          <span>{item.icon}</span> {item.label}
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                          <Input
                            type="number"
                            value={variableCosts[item.key] || ''}
                            onChange={(e) => setVariableCosts({
                              ...variableCosts,
                              [item.key]: parseFloat(e.target.value) || 0
                            })}
                            placeholder="0,00"
                            className="pl-10 text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Botões de Ação */}
                <div className="space-y-3">
                  <Button
                    onClick={handleCalculate}
                    disabled={isCalculating}
                    className="w-full h-14 text-lg font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 hover:from-emerald-700 hover:via-blue-700 hover:to-purple-700 shadow-2xl shadow-emerald-500/30"
                  >
                    {isCalculating ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Analisando com IA...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Calcular & Analisar
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="w-full"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Limpar Tudo
                  </Button>
                </div>
              </motion.div>
            </div>

            {/* Resultados */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 40 }}
                  className="mt-8 space-y-6"
                >
                  {/* Análise IA */}
                  <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-xl">Análise Inteligente</h3>
                        <p className="text-sm text-gray-600">Powered by IA</p>
                      </div>
                      <div className="text-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center">
                          <div className="text-center">
                            <p className="text-2xl font-black text-white">{result.aiAnalysis.score}</p>
                            <p className="text-[10px] text-white/80">SCORE</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Benchmark */}
                    <div className="mb-6 p-4 bg-white rounded-xl">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Target className="w-5 h-5 text-blue-500" />
                        Comparação com Mercado
                      </h4>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Sua Margem</p>
                          <p className="text-2xl font-bold text-emerald-600">
                            {result.aiAnalysis.benchmarkComparison.yourMargin.toFixed(1)}%
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Média do Setor</p>
                          <p className="text-2xl font-bold text-gray-700">
                            {result.aiAnalysis.benchmarkComparison.industryAverage}%
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Status</p>
                          <Badge className={`${
                            result.aiAnalysis.benchmarkComparison.status === 'above'
                              ? 'bg-emerald-500'
                              : result.aiAnalysis.benchmarkComparison.status === 'average'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}>
                            {result.aiAnalysis.benchmarkComparison.status === 'above' && '🔥 Acima da Média'}
                            {result.aiAnalysis.benchmarkComparison.status === 'average' && '📊 Na Média'}
                            {result.aiAnalysis.benchmarkComparison.status === 'below' && '⚠️ Abaixo da Média'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Insights */}
                    {result.aiAnalysis.insights.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-emerald-700">
                          <CheckCircle2 className="w-5 h-5" />
                          Pontos Fortes ({result.aiAnalysis.insights.length})
                        </h4>
                        <div className="space-y-2">
                          {result.aiAnalysis.insights.map((insight, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200"
                            >
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-gray-700">{insight}</p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Avisos */}
                    {result.aiAnalysis.warnings.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-orange-700">
                          <AlertTriangle className="w-5 h-5" />
                          Atenção ({result.aiAnalysis.warnings.length})
                        </h4>
                        <div className="space-y-2">
                          {result.aiAnalysis.warnings.map((warning, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200"
                            >
                              <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-gray-700">{warning}</p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Oportunidades */}
                    {result.aiAnalysis.opportunities.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-blue-700">
                          <Lightbulb className="w-5 h-5" />
                          Oportunidades ({result.aiAnalysis.opportunities.length})
                        </h4>
                        <div className="space-y-2">
                          {result.aiAnalysis.opportunities.map((opp, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
                            >
                              <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-gray-700">{opp}</p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recomendações com potencial de economia */}
                    {result.aiAnalysis.recommendations.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-purple-700">
                          <Zap className="w-5 h-5" />
                          Recomendações de Otimização
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          {result.aiAnalysis.recommendations.map((rec, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.1 }}
                              className="p-4 bg-white rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-all"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h5 className="font-bold text-gray-900">{rec.title}</h5>
                                <Badge className={`${
                                  rec.impact === 'high' ? 'bg-red-500' :
                                  rec.impact === 'medium' ? 'bg-yellow-500' :
                                  'bg-blue-500'
                                } text-white`}>
                                  {rec.impact === 'high' && '🔥 Alto'}
                                  {rec.impact === 'medium' && '⚡ Médio'}
                                  {rec.impact === 'low' && '💡 Baixo'}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                              <div className="flex items-center justify-between pt-3 border-t">
                                <span className="text-xs text-gray-500">Economia potencial:</span>
                                <span className="font-bold text-emerald-600">
                                  {formatCurrency(rec.potentialSavings)}
                                </span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>

                  {/* Cenários */}
                  <Card className="p-6">
                    <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                      <Target className="w-6 h-6 text-blue-500" />
                      Simulação de Cenários
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      {/* Otimista */}
                      <div className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200">
                        <div className="flex items-center gap-2 mb-4">
                          <TrendingUp className="w-5 h-5 text-emerald-600" />
                          <h4 className="font-bold text-emerald-900">Otimista</h4>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Receita:</span>
                            <span className="font-semibold">{formatCurrency(result.scenarios.optimistic.revenue)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Lucro:</span>
                            <span className="font-bold text-emerald-600">{formatCurrency(result.scenarios.optimistic.profit)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Margem:</span>
                            <span className="font-bold">{result.scenarios.optimistic.margin.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Realista */}
                      <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                        <div className="flex items-center gap-2 mb-4">
                          <BarChart3 className="w-5 h-5 text-blue-600" />
                          <h4 className="font-bold text-blue-900">Realista</h4>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Receita:</span>
                            <span className="font-semibold">{formatCurrency(result.scenarios.realistic.revenue)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Lucro:</span>
                            <span className="font-bold text-blue-600">{formatCurrency(result.scenarios.realistic.profit)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Margem:</span>
                            <span className="font-bold">{result.scenarios.realistic.margin.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Pessimista */}
                      <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border-2 border-orange-200">
                        <div className="flex items-center gap-2 mb-4">
                          <TrendingDown className="w-5 h-5 text-orange-600" />
                          <h4 className="font-bold text-orange-900">Pessimista</h4>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Receita:</span>
                            <span className="font-semibold">{formatCurrency(result.scenarios.pessimistic.revenue)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Lucro:</span>
                            <span className="font-bold text-orange-600">{formatCurrency(result.scenarios.pessimistic.profit)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Margem:</span>
                            <span className="font-bold">{result.scenarios.pessimistic.margin.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* TAB: HISTÓRICO */}
          <TabsContent value="history">
            <div className="space-y-4">
              {calculations.length === 0 ? (
                <Card className="p-20 text-center border-2 border-dashed">
                  <Clock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-bold text-gray-700 mb-2">
                    Nenhum cálculo salvo ainda
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Faça sua primeira análise para começar!
                  </p>
                  <Button onClick={() => setActiveTab("calculator")}>
                    <Calculator className="w-4 h-4 mr-2" />
                    Ir para Calculadora
                  </Button>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {calculations.map((calc) => (
                    <motion.div
                      key={calc._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ y: -4 }}
                    >
                      <Card className="p-6 hover:shadow-2xl transition-all cursor-pointer border-2 hover:border-emerald-300">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-900 mb-1">
                              {calc.businessName}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              {BUSINESS_TYPES.find(t => t.value === calc.businessType)?.icon}{' '}
                              {BUSINESS_TYPES.find(t => t.value === calc.businessType)?.label}
                            </Badge>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleToggleFavorite(calc._id, calc.favorite || false)}
                              className="h-8 w-8"
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  calc.favorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
                                }`}
                              />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDelete(calc._id)}
                              className="h-8 w-8 text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Lucro Líquido:</span>
                            <span className={`font-bold ${
                              calc.results.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'
                            }`}>
                              {formatCurrency(calc.results.netProfit)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Margem:</span>
                            <span className="font-bold">{calc.results.profitMargin.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Score IA:</span>
                            <span className="font-bold text-purple-600">
                              {calc.aiAnalysis?.score ?? 'N/A'}/100
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t">
                          <span className="text-xs text-gray-500">
                            {new Date(calc.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => handleLoadCalculation(calc as SavedCalculation)}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            <ArrowRight className="w-4 h-4 mr-1" />
                            Abrir
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}