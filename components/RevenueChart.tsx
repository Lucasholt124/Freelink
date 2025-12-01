import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart
} from 'recharts';
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

interface ChartDataPoint {
  date: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface RevenueChartProps {
  data: ChartDataPoint[];
  type?: 'line' | 'bar' | 'area';
  height?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: {
    payload: ChartDataPoint;
    value?: number;
  }[];
  label?: string;
}

export function RevenueChart({ data, type = 'area', height = 300 }: RevenueChartProps) {
  // ✅ CORREÇÃO 1: Exibir centavos exatos (2 casas decimais)
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2, // Era 0
      maximumFractionDigits: 2, // Era 0
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const [month, day] = dateStr.split('-');
    return `${day}/${month}`;
  };

  // ✅ CORREÇÃO 2: Porcentagem Real
  // Procura o primeiro dia que teve alguma movimentação (lucro diferente de 0) para usar como base
  // Isso evita o erro de comparar com o dia 1 se o dia 1 foi zero, mas o dia 2 teve valor.
  const calculateTrend = () => {
    if (data.length < 2) return { value: 0, percent: '0' };

    const lastProfit = data[data.length - 1]?.profit || 0;

    // Encontra o primeiro dia com lucro não-zero para comparar
    const firstNonZeroIndex = data.findIndex(d => d.profit !== 0);
    const baselineProfit = firstNonZeroIndex !== -1 && firstNonZeroIndex < data.length - 1
      ? data[firstNonZeroIndex].profit
      : data[0].profit; // Se tudo for zero, usa o primeiro mesmo

    const trend = lastProfit - baselineProfit;

    let trendPercent = '0';

    if (baselineProfit === 0) {
      // Se a base ainda é zero (ex: começou hoje), define simbolicamente
      if (lastProfit > 0) trendPercent = '100';
      else if (lastProfit < 0) trendPercent = '-100';
      else trendPercent = '0';
    } else {
      // Cálculo real de porcentagem: (Diferença / Base) * 100
      // Math.abs na base garante que o sinal (+/-) venha da diferença (trend)
      trendPercent = ((trend / Math.abs(baselineProfit)) * 100).toFixed(1);
    }

    return { value: trend, percent: trendPercent };
  };

  const { percent: trendPercent } = calculateTrend();

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length > 0) {
      const currentData = payload[0].payload;

      return (
        <div className="bg-white/95 backdrop-blur-sm border-2 border-gray-200 p-4 rounded-xl shadow-xl">
          <p className="font-semibold text-gray-800 mb-2">
            {formatDate(currentData.date)}
          </p>
          <div className="space-y-1">
            <p className="text-sm flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
              <span className="text-gray-600">Receita:</span>
              <span className="font-bold text-emerald-600">
                {formatCurrency(currentData.revenue)}
              </span>
            </p>
            <p className="text-sm flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <span className="text-gray-600">Gastos:</span>
              <span className="font-bold text-red-600">
                {formatCurrency(currentData.expenses)}
              </span>
            </p>
            <p className="text-sm flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              <span className="text-gray-600">Lucro:</span>
              <span className={`font-bold ${currentData.profit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                {formatCurrency(currentData.profit)}
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-4 md:p-6 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Evolução Financeira</h3>
            <p className="text-xs text-gray-500">Últimos {data.length} dias</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {parseFloat(trendPercent) >= 0 ? (
            <Badge className="bg-emerald-100 text-emerald-700 border-0">
              <TrendingUp className="w-3 h-3 mr-1" />
              {trendPercent === '0' ? '0%' : `+${trendPercent}%`}
            </Badge>
          ) : (
            <Badge className="bg-red-100 text-red-700 border-0">
              <TrendingDown className="w-3 h-3 mr-1" />
              {trendPercent}%
            </Badge>
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        {type === 'area' ? (
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              tickFormatter={(value) => formatCurrency(value)}
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '14px' }}
              formatter={(value) => {
                const labels: Record<string, string> = {
                  revenue: '💰 Receita',
                  expenses: '💸 Gastos',
                  profit: '💎 Lucro'
                };
                return labels[value] || value;
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#10B981"
              strokeWidth={2}
              fill="url(#colorRevenue)"
              name="revenue"
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="#EF4444"
              strokeWidth={2}
              fill="url(#colorExpenses)"
              name="expenses"
            />
            <Area
              type="monotone"
              dataKey="profit"
              stroke="#3B82F6"
              strokeWidth={2}
              fill="url(#colorProfit)"
              name="profit"
            />
          </AreaChart>
        ) : type === 'line' ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              tickFormatter={(value) => formatCurrency(value)}
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '14px' }}
              formatter={(value) => {
                const labels: Record<string, string> = {
                  revenue: '💰 Receita',
                  expenses: '💸 Gastos',
                  profit: '💎 Lucro'
                };
                return labels[value] || value;
              }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ fill: '#10B981', r: 4 }}
              activeDot={{ r: 6 }}
              name="revenue"
            />
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="#EF4444"
              strokeWidth={3}
              dot={{ fill: '#EF4444', r: 4 }}
              activeDot={{ r: 6 }}
              name="expenses"
            />
            <Line
              type="monotone"
              dataKey="profit"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={{ fill: '#3B82F6', r: 4 }}
              activeDot={{ r: 6 }}
              name="profit"
            />
          </LineChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              tickFormatter={(value) => formatCurrency(value)}
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '14px' }}
              formatter={(value) => {
                const labels: Record<string, string> = {
                  revenue: '💰 Receita',
                  expenses: '💸 Gastos',
                  profit: '💎 Lucro'
                };
                return labels[value] || value;
              }}
            />
            <Bar dataKey="revenue" fill="#10B981" radius={[8, 8, 0, 0]} name="revenue" />
            <Bar dataKey="expenses" fill="#EF4444" radius={[8, 8, 0, 0]} name="expenses" />
            <Bar dataKey="profit" fill="#3B82F6" radius={[8, 8, 0, 0]} name="profit" />
          </BarChart>
        )}
      </ResponsiveContainer>
    </Card>
  );
}