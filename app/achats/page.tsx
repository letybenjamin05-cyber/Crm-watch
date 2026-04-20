"use client";

import { useEffect, useState, useCallback } from "react";
import { ShoppingCart, Plus, Search, Edit2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import WatchForm from "@/components/ui/WatchForm";
import StatutBadge from "@/components/ui/StatutBadge";
import { type WatchWithRelations } from "@/lib/types";

const fmt = (v: number) =>
  v.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

const fmtDate = (d: Date | string) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "2-digit" });

export default function AchatsPage() {
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
    setWatches(data.filter((w) => w.achat));
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

  const totalAchats = watches.reduce((s, w) => s + (w.achat?.coutTotal ?? 0), 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Achats</h1>
          <p className="text-zinc-500 text-sm">
            {watches.length} achat{watches.length > 1 ? "s" : ""} · Total investi : <span className="text-white font-medium">{fmt(totalAchats)}</span>
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={18} />
          Nouvel achat
        </button>
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

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : watches.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 gap-3 text-center">
          <ShoppingCart size={40} className="text-zinc-700" />
          <p className="text-zinc-500">Aucun achat enregistré</p>
          <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
            Enregistrer un achat
          </button>
        </div>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden md:block card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-800">
                <tr className="text-left text-zinc-500 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3">Montre</th>
                  <th className="px-4 py-3">Date achat</th>
                  <th className="px-4 py-3">Fournisseur</th>
                  <th className="px-4 py-3">Prix montre</th>
                  <th className="px-4 py-3">Proxy</th>
                  <th className="px-4 py-3">Port</th>
                  <th className="px-4 py-3">Répar.</th>
                  <th className="px-4 py-3">Douane</th>
                  <th className="px-4 py-3 font-semibold text-zinc-300">Total revient</th>
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
                      {w.achat ? fmtDate(w.achat.dateAchat) : "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{w.achat?.fournisseur ?? "—"}</td>
                    <td className="px-4 py-3 text-zinc-300">{w.achat ? fmt(w.achat.prixMontre) : "—"}</td>
                    <td className="px-4 py-3 text-zinc-400">{w.achat ? fmt(w.achat.fraisProxy) : "—"}</td>
                    <td className="px-4 py-3 text-zinc-400">{w.achat ? fmt(w.achat.fraisPort) : "—"}</td>
                    <td className="px-4 py-3 text-zinc-400">{w.achat ? fmt(w.achat.fraisReparation) : "—"}</td>
                    <td className="px-4 py-3 text-zinc-400">{w.achat ? fmt(w.achat.fraisDouane) : "—"}</td>
                    <td className="px-4 py-3 font-semibold text-white">
                      {w.achat ? fmt(w.achat.coutTotal) : "—"}
                    </td>
                    <td className="px-4 py-3"><StatutBadge statut={w.statut} /></td>
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
              <tfoot className="border-t border-zinc-700 bg-zinc-800/30">
                <tr className="text-sm font-semibold text-white">
                  <td colSpan={8} className="px-4 py-3 text-zinc-400">TOTAL</td>
                  <td className="px-4 py-3">{fmt(totalAchats)}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
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
                    <div className="text-xs text-zinc-500">{w.achat ? fmtDate(w.achat.dateAchat) : "—"}</div>
                  </div>
                  <StatutBadge statut={w.statut} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                  <div>
                    <div className="text-zinc-500">Montre</div>
                    <div className="text-white">{w.achat ? fmt(w.achat.prixMontre) : "—"}</div>
                  </div>
                  <div>
                    <div className="text-zinc-500">Frais</div>
                    <div className="text-white">
                      {w.achat ? fmt(w.achat.fraisProxy + w.achat.fraisPort + w.achat.fraisReparation + w.achat.fraisDouane) : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-zinc-500">Total</div>
                    <div className="font-bold text-gold-400">{w.achat ? fmt(w.achat.coutTotal) : "—"}</div>
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
        title={editing ? `Modifier — ${editing.marque} ${editing.modele}` : "Nouvel achat"}
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
