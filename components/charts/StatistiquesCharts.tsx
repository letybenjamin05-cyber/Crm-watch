"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";

const fmt = (v: number) =>
  v.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

interface MarqueData {
  marque: string;
  CA: number;
  Bénéfice: number;
  Quantité: number;
}

interface MonthlyData {
  mois: string;
  ca: number;
  benefice: number;
}

interface Props {
  marqueData: MarqueData[];
  monthly: MonthlyData[];
}

export default function StatistiquesCharts({ marqueData, monthly }: Props) {
  const radarData = marqueData.slice(0, 6).map((d) => ({
    marque: d.marque,
    CA: d.CA,
    Bénéfice: d.Bénéfice,
    Quantité: d.Quantité * 5000,
  }));

  return (
    <>
      <div className="card">
        <h3 className="text-sm font-semibold text-zinc-300 mb-4">CA & Bénéfice par marque</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={marqueData} margin={{ left: -10, right: 8, top: 4, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="marque" tick={{ fontSize: 11, fill: "#71717a" }} />
            <YAxis tick={{ fontSize: 11, fill: "#71717a" }} tickFormatter={(v) => `${v / 1000}k`} />
            <Tooltip
              contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8 }}
              formatter={(v) => fmt(Number(v))}
            />
            <Legend formatter={(val) => <span style={{ color: "#a1a1aa", fontSize: 12 }}>{val}</span>} />
            <Bar dataKey="CA" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Bénéfice" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="text-sm font-semibold text-zinc-300 mb-4">Évolution mensuelle CA</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthly} margin={{ left: -20, right: 8, top: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="mois" tick={{ fontSize: 10, fill: "#71717a" }} />
              <YAxis tick={{ fontSize: 10, fill: "#71717a" }} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip
                contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8 }}
                formatter={(v) => fmt(Number(v))}
              />
              <Line type="monotone" dataKey="ca" stroke="#f59e0b" strokeWidth={2} dot={false} name="CA" />
              <Line type="monotone" dataKey="benefice" stroke="#22c55e" strokeWidth={2} dot={false} name="Bénéfice" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {radarData.length >= 3 && (
          <div className="card">
            <h3 className="text-sm font-semibold text-zinc-300 mb-4">Radar marques (top 6)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#27272a" />
                <PolarAngleAxis dataKey="marque" tick={{ fontSize: 10, fill: "#71717a" }} />
                <Radar name="CA" dataKey="CA" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
                <Radar name="Bénéfice" dataKey="Bénéfice" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} />
                <Legend formatter={(val) => <span style={{ color: "#a1a1aa", fontSize: 11 }}>{val}</span>} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </>
  );
}
