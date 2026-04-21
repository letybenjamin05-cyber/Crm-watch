"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  Package,
  Euro,
  BarChart3,
  Clock,
  ShoppingBag,
  Wrench,
  ArrowLeftRight,
} from "lucide-react";
import KpiCard from "@/components/ui/KpiCard";
import dynamic from "next/dynamic";

const DashboardCharts = dynamic(
  () => import("@/components/charts/DashboardCharts"),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center py-10">
        <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  }
);

interface StatsData {
  totalVentes: number;
  totalCouts: number;
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

const STATUT_LABELS: Record<string, string> = {
  EN_ATTENTE: "En attente",
  EN_STOCK: "En stock",
  EN_VENTE: "En vente",
  VENDU: "Vendu",
  RETOUR: "Retour",
  SAV: "SAV",
};

const fmt = (v: number) =>
  v.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
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

  if (!stats) return <p className="text-zinc-500">Erreur de chargement.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-500 text-sm mt-1">Vue d&apos;ensemble de votre activité</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard title="Chiffre d'affaires" value={fmt(stats.totalVentes)} icon={Euro} color="text-yellow-400" />
        <KpiCard
          title="Bénéfice net"
          value={fmt(stats.totalBenefice)}
          icon={TrendingUp}
          color={stats.totalBenefice >= 0 ? "text-green-400" : "text-red-400"}
        />
        <KpiCard title="Marge globale" value={`${stats.margeGlobale.toFixed(1)}%`} icon={BarChart3} color="text-blue-400" />
        <KpiCard title="Valeur stock" value={fmt(stats.valeurStock)} icon={Package} color="text-purple-400" />
      </div>

      {/* Compteurs statuts */}
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

      {/* Charts dynamiques (no SSR) */}
      <DashboardCharts stats={stats} />
    </div>
  );
}
