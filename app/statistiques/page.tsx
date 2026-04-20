"use client";

import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
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

interface StatsData {
  totalVentes: number;
  totalBenefice: number;
  margeGlobale: number;
  valeurStock: number;
  nbWatches: number;
  nbVendus: number;
  nbEnStock: number;
  parStatut: Record<string, number>;
  parMarque: Record<string, { nb: number; ca: number; benefice: number }>;
  monthly: { mois: string; ca: number; benefice: number }[];
}

const fmt = (v: number) =>
  v.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

const STATUT_FR: Record<string, string> = {
  EN_ATTENTE: "En attente",
  EN_STOCK: "En stock",
  EN_VENTE: "En vente",
  VENDU: "Vendu",
  RETOUR: "Retour",
  SAV: "SAV",
};

export default function StatistiquesPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) return <p className="text-zinc-500">Erreur de chargement.</p>;

  const marqueData = Object.entries(stats.parMarque)
    .sort((a, b) => b[1].ca - a[1].ca)
    .map(([marque, d]) => ({
      marque,
      CA: Math.round(d.ca),
      Bénéfice: Math.round(d.benefice),
      Quantité: d.nb,
    }));

  const statutData = Object.entries(stats.parStatut).map(([key, val]) => ({
    name: STATUT_FR[key] ?? key,
    value: val,
  }));

  const radarData = marqueData.slice(0, 6).map((d) => ({
    marque: d.marque,
    CA: d.CA,
    Bénéfice: d.Bénéfice,
    Quantité: d.Quantité * 5000,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Statistiques</h1>
        <p className="text-zinc-500 text-sm">Analyse détaillée de votre activité</p>
      </div>

      {/* Global perf */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card text-center">
          <p className="text-xs text-zinc-500">Total CA</p>
          <p className="text-lg font-bold text-gold-400 mt-1">{fmt(stats.totalVentes)}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-zinc-500">Bénéfice net</p>
          <p className={`text-lg font-bold mt-1 ${stats.totalBenefice >= 0 ? "text-green-400" : "text-red-400"}`}>
            {fmt(stats.totalBenefice)}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-zinc-500">Marge globale</p>
          <p className="text-lg font-bold text-blue-400 mt-1">{stats.margeGlobale.toFixed(1)}%</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-zinc-500">Valeur stock</p>
          <p className="text-lg font-bold text-purple-400 mt-1">{fmt(stats.valeurStock)}</p>
        </div>
      </div>

      {/* CA par marque */}
      {marqueData.length > 0 ? (
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
                <Legend
                  formatter={(val) => (
                    <span style={{ color: "#a1a1aa", fontSize: 12 }}>{val}</span>
                  )}
                />
                <Bar dataKey="CA" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Bénéfice" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Tableau marques */}
          <div className="card overflow-hidden p-0">
            <div className="px-4 py-3 border-b border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-300">Détail par marque</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-800">
                <tr className="text-left text-zinc-500 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3">Marque</th>
                  <th className="px-4 py-3">Nb vendus</th>
                  <th className="px-4 py-3">CA total</th>
                  <th className="px-4 py-3">Bénéfice</th>
                  <th className="px-4 py-3">Marge moy.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {marqueData.map((d) => {
                  const marge = d.CA > 0 ? (d.Bénéfice / d.CA) * 100 : 0;
                  return (
                    <tr key={d.marque} className="hover:bg-zinc-800/50">
                      <td className="px-4 py-3 font-medium text-white">{d.marque}</td>
                      <td className="px-4 py-3 text-zinc-400">{d.Quantité}</td>
                      <td className="px-4 py-3 text-zinc-300">{fmt(d.CA)}</td>
                      <td className={`px-4 py-3 font-semibold ${d.Bénéfice >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {fmt(d.Bénéfice)}
                      </td>
                      <td className={`px-4 py-3 ${marge >= 0 ? "text-blue-400" : "text-red-400"}`}>
                        {marge.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Evolution + Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card">
              <h3 className="text-sm font-semibold text-zinc-300 mb-4">
                Évolution mensuelle CA
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={stats.monthly} margin={{ left: -20, right: 8, top: 4, bottom: 0 }}>
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
                    <Legend
                      formatter={(val) => (
                        <span style={{ color: "#a1a1aa", fontSize: 11 }}>{val}</span>
                      )}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Statuts */}
          <div className="card">
            <h3 className="text-sm font-semibold text-zinc-300 mb-4">Répartition par statut</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {statutData.map((s) => (
                <div key={s.name} className="bg-zinc-800 rounded-lg px-3 py-3 text-center">
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-xs text-zinc-500 mt-1">{s.name}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="card flex flex-col items-center justify-center py-16 gap-3 text-center">
          <BarChart3 size={40} className="text-zinc-700" />
          <p className="text-zinc-500">Pas encore de données de vente</p>
          <p className="text-xs text-zinc-600">
            Enregistrez des achats et des ventes pour voir les statistiques
          </p>
        </div>
      )}
    </div>
  );
}
