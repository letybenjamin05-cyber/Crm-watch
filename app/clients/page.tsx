"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Search, Trash2, Users, Star, Phone, Mail, Crown } from "lucide-react";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ClientForm from "@/components/ui/ClientForm";

export type WishItem = { id?: string; marque: string; modele?: string; priorite: string; notes?: string };
export type Client = {
  id: string; nom: string; prenom?: string | null; email?: string | null;
  telephone?: string | null; instagram?: string | null; statut: string;
  budgetMax?: number | null; notes?: string | null; wishlist: WishItem[];
  createdAt: string;
};

const STATUT_COLORS: Record<string, string> = {
  PROSPECT: "bg-zinc-700 text-zinc-300",
  ACTIF: "bg-blue-900/50 text-blue-300",
  VIP: "bg-yellow-900/50 text-yellow-300",
};
const STATUT_LABELS: Record<string, string> = { PROSPECT: "Prospect", ACTIF: "Acheteur actif", VIP: "VIP" };
const PRIORITE_COLORS: Record<string, string> = { HAUTE: "text-red-400", MOYENNE: "text-yellow-400", BASSE: "text-zinc-500" };

const fmt = (v: number) => v.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [toDelete, setToDelete] = useState<Client | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const res = await fetch(`/api/clients?${params}`);
    setClients(await res.json());
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchClients, 300);
    return () => clearTimeout(t);
  }, [fetchClients]);

  const handleSave = async (data: Record<string, unknown>) => {
    setSaving(true);
    try {
      if (editing) {
        await fetch(`/api/clients/${editing.id}`, {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } else {
        await fetch("/api/clients", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }
      setShowForm(false); setEditing(null);
      await fetchClients();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/clients/${id}`, { method: "DELETE" });
    await fetchClients();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Clients</h1>
          <p className="text-zinc-500 text-sm">{clients.length} client{clients.length > 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto">
          <Plus size={18} /> Nouveau client
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input className="input pl-9" placeholder="Rechercher nom, email…"
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : clients.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 gap-3 text-center">
          <Users size={40} className="text-zinc-700" />
          <p className="text-zinc-500">Aucun client</p>
          <button onClick={() => setShowForm(true)} className="btn-primary text-sm">Ajouter le premier</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {clients.map((c) => (
            <div key={c.id} className="card hover:border-zinc-700 transition-colors cursor-pointer"
              onClick={() => { setEditing(c); setShowForm(true); }}>
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {c.nom.charAt(0)}{c.prenom?.charAt(0) ?? ""}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">
                      {c.nom} {c.prenom}
                      {c.statut === "VIP" && <Crown size={13} className="inline ml-1 text-yellow-400" />}
                    </div>
                    <span className={`badge text-xs ${STATUT_COLORS[c.statut]}`}>
                      {STATUT_LABELS[c.statut]}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => setToDelete(c)}
                    className="p-1.5 text-zinc-600 hover:text-red-400 rounded-lg">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Contacts */}
              <div className="space-y-1 mb-3">
                {c.email && (
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <Mail size={12} /> {c.email}
                  </div>
                )}
                {c.telephone && (
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <Phone size={12} /> {c.telephone}
                  </div>
                )}
                {c.instagram && (
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <span className="text-zinc-500">@</span> {c.instagram}
                  </div>
                )}
              </div>

              {/* Budget */}
              {c.budgetMax && (
                <div className="text-xs text-zinc-500 mb-2">
                  Budget max : <span className="text-white font-medium">{fmt(c.budgetMax)}</span>
                </div>
              )}

              {/* Wish list */}
              {c.wishlist.length > 0 && (
                <div className="border-t border-zinc-800 pt-2 mt-2">
                  <p className="text-xs text-zinc-500 mb-1.5 flex items-center gap-1">
                    <Star size={11} /> Wish list ({c.wishlist.length})
                  </p>
                  <div className="space-y-1">
                    {c.wishlist.slice(0, 3).map((w, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-zinc-300">{w.marque}{w.modele ? ` ${w.modele}` : ""}</span>
                        <span className={`font-medium ${PRIORITE_COLORS[w.priorite]}`}>
                          {w.priorite === "HAUTE" ? "● Haute" : w.priorite === "MOYENNE" ? "● Moy." : "● Basse"}
                        </span>
                      </div>
                    ))}
                    {c.wishlist.length > 3 && (
                      <p className="text-xs text-zinc-600">+{c.wishlist.length - 3} autres…</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => { setShowForm(false); setEditing(null); }}
        title={editing ? `${editing.nom} ${editing.prenom ?? ""}` : "Nouveau client"} size="lg">
        <ClientForm initial={editing} onSubmit={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null); }} loading={saving} />
      </Modal>

      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && handleDelete(toDelete.id)}
        title="Supprimer le client"
        message={`Supprimer « ${toDelete?.nom} ${toDelete?.prenom ?? ""} » ? Cette action est irréversible.`}
        confirmLabel="Supprimer" />
    </div>
  );
}
