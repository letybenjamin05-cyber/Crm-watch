"use client";

import { useEffect, useState, useCallback } from "react";
import { TrendingUp, Search, Edit2, CheckCircle, XCircle } from "lucide-react";
import Modal from "@/components/ui/Modal";
import WatchForm from "@/components/ui/WatchForm";
import StatutBadge from "@/components/ui/StatutBadge";
import { type WatchWithRelations } from "@/lib/types";

const fmt = (v: number) =>
  v.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

const fmtDate = (d: Date | string) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "2-digit" });

export default function VentesPage() {
  const [watches, setWatches] = useState<WatchWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<WatchWithRelations | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchWatches = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const res = await fetch(`/api/watches?${params}`);
    const data: WatchWithRelations[] = await res.json();
    setWatches(data.filter((w) => w.vente || w.statut === "EN_VENTE" || w.statut === "VENDU"));
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchWatches, 300);
    return () => clearTimeout(t);
  }, [fetchWatches]);

  const handleSave = async (data: Record<string, unknown>) => {
    setSaving(true);
    try {
      if (editing) {
        await fetch(`/api/watches/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }
      setShowForm(false);
      setEditing(null);
      await fetchWatches();
    } finally {
      setSaving(false);
    }
  };

  const ventesSold = watches.filter((w) => w.vente);
  const totalCA = ventesSold.reduce((s, w) => s + (w.vente?.prixVente ?? 0), 0);
  const totalBenefice = ventesSold.reduce((s, w) => s + (w.vente?.benefice ?? 0), 0);
  const margeGlobale = totalCA > 0 ? (totalBenefice / totalCA) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Ventes</h1>
          <p className="text-zinc-500 text-sm">
            {ventesSold.length} vente{ventesSold.length > 1 ? "s" : ""} · CA{" "}
            <span className="text-white font-medium">{fmt(totalCA)}</span> · Bénéfice{" "}
            <span className={totalBenefice >= 0 ? "text-green-400 font-medium" : "text-red-400 font-medium"}>
              {fmt(totalBenefice)}
            </span>
          </p>
        </div>
      </div>

      {/* KPIs mini */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center">
          <p className="text-xs text-zinc-500">Chiffre d&apos;affaires</p>
          <p className="text-xl font-bold text-white mt-1">{fmt(totalCA)}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-zinc-500">Bénéfice net</p>
          <p className={`text-xl font-bold mt-1 ${totalBenefice >= 0 ? "text-green-400" : "text-red-400"}`}>
            {fmt(totalBenefice)}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-zinc-500">Marge globale</p>
          <p className={`text-xl font-bold mt-1 ${margeGlobale >= 0 ? "text-blue-400" : "text-red-400"}`}>
            {margeGlobale.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          className="input pl-9"
          placeholder="Rechercher…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : watches.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 gap-3 text-center">
          <TrendingUp size={40} className="text-zinc-700" />
          <p className="text-zinc-500">Aucune vente enregistrée</p>
          <p className="text-xs text-zinc-600">
            Changez le statut d&apos;une montre en &quot;En vente&quot; ou &quot;Vendu&quot; pour la voir ici
          </p>
        </div>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden md:block card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-800">
                <tr className="text-left text-zinc-500 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3">Montre</th>
                  <th className="px-4 py-3">Date vente</th>
                  <th className="px-4 py-3">Plateforme</th>
                  <th className="px-4 py-3">Coût revient</th>
                  <th className="px-4 py-3">Prix vente</th>
                  <th className="px-4 py-3">Bénéfice</th>
                  <th className="px-4 py-3">Marge</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {watches.map((w) => (
                  <tr key={w.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{w.marque} {w.modele}</div>
                      <div className="text-xs text-zinc-500">{w.reference ?? "—"}</div>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {w.vente ? fmtDate(w.vente.dateVente) : "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{w.vente?.plateforme ?? "—"}</td>
                    <td className="px-4 py-3 text-zinc-300">
                      {w.achat ? fmt(w.achat.coutTotal) : "—"}
                    </td>
                    <td className="px-4 py-3 text-white font-medium">
                      {w.vente ? fmt(w.vente.prixVente) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {w.vente ? (
                        <span className={w.vente.benefice >= 0 ? "text-green-400 font-semibold" : "text-red-400 font-semibold"}>
                          {fmt(w.vente.benefice)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {w.vente ? (
                        <div className="flex items-center gap-1.5">
                          {w.vente.marge >= 0 ? (
                            <CheckCircle size={13} className="text-green-400" />
                          ) : (
                            <XCircle size={13} className="text-red-400" />
                          )}
                          <span className={w.vente.marge >= 0 ? "text-green-400" : "text-red-400"}>
                            {w.vente.marge.toFixed(1)}%
                          </span>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatutBadge statut={w.statut} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => { setEditing(w); setShowForm(true); }}
                        className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
                      >
                        <Edit2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              {ventesSold.length > 0 && (
                <tfoot className="border-t border-zinc-700 bg-zinc-800/30">
                  <tr className="text-sm font-semibold">
                    <td colSpan={4} className="px-4 py-3 text-zinc-400">TOTAL</td>
                    <td className="px-4 py-3 text-white">{fmt(totalCA)}</td>
                    <td className={`px-4 py-3 ${totalBenefice >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {fmt(totalBenefice)}
                    </td>
                    <td className={`px-4 py-3 ${margeGlobale >= 0 ? "text-blue-400" : "text-red-400"}`}>
                      {margeGlobale.toFixed(1)}%
                    </td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2">
            {watches.map((w) => (
              <div
                key={w.id}
                className="card cursor-pointer"
                onClick={() => { setEditing(w); setShowForm(true); }}
              >
                <div className="flex justify-between mb-2">
                  <div>
                    <div className="font-semibold text-white">{w.marque} {w.modele}</div>
                    <div className="text-xs text-zinc-500">
                      {w.vente ? fmtDate(w.vente.dateVente) : "Pas encore vendu"} · {w.vente?.plateforme ?? "—"}
                    </div>
                  </div>
                  <StatutBadge statut={w.statut} />
                </div>
                {w.vente && (
                  <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                    <div>
                      <div className="text-zinc-500">Prix vente</div>
                      <div className="text-white font-medium">{fmt(w.vente.prixVente)}</div>
                    </div>
                    <div>
                      <div className="text-zinc-500">Bénéfice</div>
                      <div className={w.vente.benefice >= 0 ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
                        {fmt(w.vente.benefice)}
                      </div>
                    </div>
                    <div>
                      <div className="text-zinc-500">Marge</div>
                      <div className={w.vente.marge >= 0 ? "text-blue-400 font-bold" : "text-red-400 font-bold"}>
                        {w.vente.marge.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Form Modal */}
      <Modal
        open={showForm}
        onClose={() => { setShowForm(false); setEditing(null); }}
        title={editing ? `Modifier — ${editing.marque} ${editing.modele}` : "Nouvelle vente"}
        size="xl"
      >
        <WatchForm
          initial={editing}
          onSubmit={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null); }}
          loading={saving}
        />
      </Modal>
    </div>
  );
}
