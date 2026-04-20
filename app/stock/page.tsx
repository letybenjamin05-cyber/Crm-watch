"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Search, Filter, Edit2, Trash2, Package } from "lucide-react";
import StatutBadge from "@/components/ui/StatutBadge";
import Modal from "@/components/ui/Modal";
import WatchForm from "@/components/ui/WatchForm";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { STATUT_LABELS, type WatchWithRelations } from "@/lib/types";

const STATUTS = ["ALL", ...Object.keys(STATUT_LABELS)];

const fmt = (v: number) =>
  v.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

export default function StockPage() {
  const [watches, setWatches] = useState<WatchWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statut, setStatut] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<WatchWithRelations | null>(null);
  const [toDelete, setToDelete] = useState<WatchWithRelations | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchWatches = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statut !== "ALL") params.set("statut", statut);
    if (search) params.set("search", search);
    const res = await fetch(`/api/watches?${params}`);
    const data = await res.json();
    setWatches(data);
    setLoading(false);
  }, [statut, search]);

  useEffect(() => {
    const timer = setTimeout(fetchWatches, 300);
    return () => clearTimeout(timer);
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
      } else {
        await fetch("/api/watches", {
          method: "POST",
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

  const handleDelete = async (id: string) => {
    await fetch(`/api/watches/${id}`, { method: "DELETE" });
    await fetchWatches();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Stock</h1>
          <p className="text-zinc-500 text-sm">{watches.length} montre{watches.length > 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={18} />
          Ajouter une montre
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            className="input pl-9"
            placeholder="Rechercher marque, modèle, référence…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-zinc-500 flex-shrink-0" />
          <select
            className="input w-44"
            value={statut}
            onChange={(e) => setStatut(e.target.value)}
          >
            {STATUTS.map((s) => (
              <option key={s} value={s}>
                {s === "ALL" ? "Tous les statuts" : STATUT_LABELS[s as keyof typeof STATUT_LABELS]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table / Cards */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : watches.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 gap-3 text-center">
          <Package size={40} className="text-zinc-700" />
          <p className="text-zinc-500">Aucune montre trouvée</p>
          <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
            Ajouter la première
          </button>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-800">
                <tr className="text-left text-zinc-500 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3">Montre</th>
                  <th className="px-4 py-3">Référence</th>
                  <th className="px-4 py-3">État</th>
                  <th className="px-4 py-3">Coût revient</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Full Set</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {watches.map((w) => (
                  <tr
                    key={w.id}
                    className="hover:bg-zinc-800/50 transition-colors cursor-pointer"
                    onClick={() => { setEditing(w); setShowForm(true); }}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{w.marque}</div>
                      <div className="text-zinc-500 text-xs">{w.modele}</div>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{w.reference ?? "—"}</td>
                    <td className="px-4 py-3 text-zinc-400">{w.etat}</td>
                    <td className="px-4 py-3 text-zinc-300">
                      {w.achat ? fmt(w.achat.coutTotal) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatutBadge statut={w.statut} />
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs ${w.fullSet ? "text-green-400" : "text-zinc-600"}`}>
                        {w.fullSet ? "✓ Full Set" : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => { setEditing(w); setShowForm(true); }}
                          className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setToDelete(w)}
                          className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2">
            {watches.map((w) => (
              <div
                key={w.id}
                className="card cursor-pointer hover:border-zinc-700 transition-colors"
                onClick={() => { setEditing(w); setShowForm(true); }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold text-white">{w.marque} {w.modele}</div>
                    <div className="text-xs text-zinc-500">{w.reference ?? "Sans référence"} · {w.etat}</div>
                  </div>
                  <StatutBadge statut={w.statut} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">
                    {w.achat ? fmt(w.achat.coutTotal) : "—"}
                  </span>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setToDelete(w)}
                      className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Form Modal */}
      <Modal
        open={showForm}
        onClose={() => { setShowForm(false); setEditing(null); }}
        title={editing ? `Modifier — ${editing.marque} ${editing.modele}` : "Ajouter une montre"}
        size="xl"
      >
        <WatchForm
          initial={editing}
          onSubmit={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null); }}
          loading={saving}
        />
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && handleDelete(toDelete.id)}
        title="Supprimer la montre"
        message={`Voulez-vous vraiment supprimer « ${toDelete?.marque} ${toDelete?.modele} » ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
      />
    </div>
  );
}
