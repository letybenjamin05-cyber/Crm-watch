"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface StatsData {
  parStatut: Record<string, number>;
  parMarque: Record<string, { nb: number; ca: number; benefice: number }>;
  monthly: { mois: string; ca: number; benefice: number }[];
}

const STATUT_LABELS: Record<string, string> = {
  EN_ATTENTE: "En attente",
  EN_STOCK: "En stock",
  EN_VENTE: "En vente",
  VENDU: "Vendu",
  RETOUR: "Retour",
  SAV: "SAV",
};

const PIE_COLORS = ["#f59e0b", "#3b82f6", "#8b5cf6", "#22c55e", "#f97316", "#ef4444"];

const fmt = (v: number) =>
  v.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

export default function DashboardCharts({ stats }: { stats: StatsData }) {
  const pieData = Object.entries(stats.parStatut).map(([key, value]) => ({
    name: STATUT_LABELS[key] ?? key,
    value,
  }));

  const topMarques = Object.entries(stats.parMarque)
    .sort((a, b) => b[1].ca - a[1].ca)
    .slice(0, 5);

  return (
    <>
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card lg:col-span-2">
          <h3 className="text-sm font-semibold text-zinc-300 mb-4">
            Évolution CA & Bénéfice (12 mois)
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stats.monthly} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorBenef" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="mois" tick={{ fontSize: 11, fill: "#71717a" }} />
              <YAxis tick={{ fontSize: 11, fill: "#71717a" }} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip
                contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8 }}
                labelStyle={{ color: "#f4f4f5" }}
                formatter={(v) => fmt(Number(v))}
              />
              <Area type="monotone" dataKey="ca" stroke="#f59e0b" fill="url(#colorCA)" name="CA" />
              <Area type="monotone" dataKey="benefice" stroke="#22c55e" fill="url(#colorBenef)" name="Bénéfice" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold text-zinc-300 mb-4">Répartition statuts</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  iconSize={8}
                  formatter={(value) => (
                    <span style={{ color: "#a1a1aa", fontSize: 11 }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-zinc-600 text-sm">
              Aucune donnée
            </div>
          )}
        </div>
      </div>

      {/* Top marques */}
      {topMarques.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-zinc-300 mb-4">Top marques vendues</h3>
          <div className="space-y-3">
            {topMarques.map(([marque, data]) => (
              <div key={marque} className="flex items-center gap-3">
                <div className="w-24 text-sm text-zinc-300 font-medium truncate">{marque}</div>
                <div className="flex-1 bg-zinc-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 rounded-full"
                    style={{
                      width: `${Math.min(100, (data.ca / (topMarques[0]?.[1].ca || 1)) * 100)}%`,
                    }}
                  />
                </div>
                <div className="text-right min-w-[90px]">
                  <div className="text-sm text-white font-medium">{fmt(data.ca)}</div>
                  <div className="text-xs text-zinc-500">{data.nb} vendu{data.nb > 1 ? "s" : ""}</div>
                </div>
                <div className={`text-sm font-medium min-w-[60px] text-right ${data.benefice >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {fmt(data.benefice)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
