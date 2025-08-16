import { TrendingUp, TrendingDown } from "lucide-react";
import { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: number;
  trend?: number;
  icon: ReactNode;
  color: "blue" | "purple" | "green";
}

const colorVariants = {
  blue: {
    bg: "from-blue-500 to-cyan-500",
    light: "bg-blue-100",
    text: "text-blue-600"
  },
  purple: {
    bg: "from-purple-500 to-pink-500",
    light: "bg-purple-100",
    text: "text-purple-600"
  },
  green: {
    bg: "from-green-500 to-emerald-500",
    light: "bg-green-100",
    text: "text-green-600"
  }
};

export function MetricCard({ title, value, trend, icon, color }: MetricCardProps) {
  const colors = colorVariants[color];

  return (
    <div className="group relative">
      {/* Glow effect */}
      <div className={`absolute -inset-1 bg-gradient-to-r ${colors.bg} rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300`} />

      {/* Card content */}
      <div className="relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
        <div className="flex items-start justify-between mb-6">
          <div className={`p-4 ${colors.light} rounded-2xl group-hover:scale-110 transition-transform duration-300`}>
            <div className={colors.text}>{icon}</div>
          </div>

          {trend && (
                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
              trend > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}>
              {trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-4xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {value.toLocaleString('pt-BR')}
          </p>
        </div>
      </div>
    </div>
  );
}