"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp, Package, Euro, BarChart3, Clock,
  ShoppingBag, Wrench, ArrowLeftRight, AlertTriangle, Bell,
} from "lucide-react";
import KpiCard from "@/components/ui/KpiCard";
import dynamic from "next/dynamic";
import Link from "next/link";

const DashboardCharts = dynamic(() => import("@/components/charts/DashboardCharts"), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center py-10">
      <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

interface StatsData {
  totalVentes: number; totalCouts: number; totalBenefice: number;
  margeGlobale: number; valeurStock: number; nbWatches: number;
  nbVendus: number; nbEnStock: number;
  parStatut: Record<string, number>;
  parMarque: Record<string, { nb: number; ca: number; benefice: number }>;
  monthly: { mois: string; ca: number; benefice: number }[];
}

interface Alert {
  type: string; level: "warning" | "danger";
  message: string; watchId: string; watchLabel: string;
}

const STATUT_LABELS: Record<string, string> = {
  EN_ATTENTE: "En attente", EN_STOCK: "En stock", EN_VENTE: "En vente",
  VENDU: "Vendu", RETOUR: "Retour", SAV: "SAV",
};

const fmt = (v: number) =>
  v.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

export default function HomePage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/stats").then((r) => r.ok ? r.json() : null),
      fetch("/api/alerts").then((r) => r.ok ? r.json() : []),
    ])
      .then(([s, a]) => { setStats(s); setAlerts(a ?? []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="card text-center py-16">
        <p className="text-zinc-400 font-medium">Impossible de charger les données</p>
      </div>
    );
  }

  const dangers = alerts.filter((a) => a.level === "danger");
  const warnings = alerts.filter((a) => a.level === "warning");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-1">Vue d&apos;ensemble de votre activité</p>
        </div>
        {alerts.length > 0 && (
          <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-sm">
            <Bell size={14} />
            {alerts.length} alerte{alerts.length > 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Alertes */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {dangers.map((a, i) => (
            <div key={i} className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-red-300 font-medium text-sm">{a.watchLabel}</span>
                <span className="text-red-400 text-sm"> — {a.message}</span>
              </div>
              <Link href={`/stock`} className="text-xs text-red-400 hover:text-red-300 flex-shrink-0">
                Voir →
              </Link>
            </div>
          ))}
          {warnings.map((a, i) => (
            <div key={i} className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-3">
              <AlertTriangle size={16} className="text-yellow-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-yellow-300 font-medium text-sm">{a.watchLabel}</span>
                <span className="text-yellow-400 text-sm"> — {a.message}</span>
              </div>
              <Link href={`/stock`} className="text-xs text-yellow-400 hover:text-yellow-300 flex-shrink-0">
                Voir →
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard title="Chiffre d'affaires" value={fmt(stats.totalVentes)} icon={Euro} color="text-yellow-400" />
        <KpiCard title="Bénéfice net" value={fmt(stats.totalBenefice)} icon={TrendingUp}
          color={stats.totalBenefice >= 0 ? "text-green-400" : "text-red-400"} />
        <KpiCard title="Marge globale" value={`${stats.margeGlobale.toFixed(1)}%`} icon={BarChart3} color="text-blue-400" />
        <KpiCard title="Valeur stock" value={fmt(stats.valeurStock)} icon={Package} color="text-purple-400" />
      </div>

      {/* Statuts */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {[
          { key: "EN_ATTENTE", icon: Clock, color: "text-yellow-400" },
          { key: "EN_STOCK", icon: Package, color: "text-blue-400" },
          { key: "EN_VENTE", icon: ShoppingBag, color: "text-purple-400" },
          { key: "VENDU", icon: TrendingUp, color: "text-green-400" },
          { key: "RETOUR", icon: ArrowLeftRight, color: "text-orange-400" },
          { key: "SAV", icon: Wrench, color: "text-red-400" },
        ].map(({ key, icon: Icon, color }) => (
          <div key={key} className="card text-center py-3">
            <Icon size={18} className={`${color} mx-auto mb-1`} />
            <div className="text-xl font-bold text-white">{stats.parStatut[key] ?? 0}</div>
            <div className="text-xs text-zinc-500">{STATUT_LABELS[key]}</div>
          </div>
        ))}
      </div>

      <DashboardCharts stats={stats} />
    </div>
  );
}
