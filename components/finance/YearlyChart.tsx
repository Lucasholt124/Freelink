"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { Card } from "@/components/ui/card";

interface YearlyData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface YearlyChartProps {
  data: YearlyData[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export function YearlyChart({ data }: YearlyChartProps) {
  return (
    <Card className="p-4 md:p-6 bg-white/90 backdrop-blur-xl shadow-lg border-2 border-indigo-100">
      <div className="mb-6">
        <h3 className="text-xl font-black text-gray-800">Desempenho Anual</h3>
        <p className="text-sm text-gray-500">Comparativo de Receitas e Gastos por mês</p>
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickFormatter={(value) => `R$ ${value >= 1000 ? (value / 1000) + 'k' : value}`}
            />
            <Tooltip
              cursor={{ fill: '#f3f4f6' }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-4 border border-gray-100 shadow-xl rounded-xl">
                      <p className="font-bold text-gray-800 mb-3 capitalize text-lg border-b pb-2">{label}</p>
                      {payload.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between gap-4 mb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-sm text-gray-600">
                              {entry.name}:
                            </span>
                          </div>
                          <span className="text-sm font-black" style={{ color: entry.color }}>
                            {formatCurrency(entry.value as number)}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="revenue" name="Receita Total" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={40} />
            <Bar dataKey="expenses" name="Gastos" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}