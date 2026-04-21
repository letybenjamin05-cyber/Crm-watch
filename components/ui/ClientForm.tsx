"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { Client, WishItem } from "@/app/clients/page";

interface Props {
  initial?: Client | null;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const PRIORITES = ["HAUTE", "MOYENNE", "BASSE"];

export default function ClientForm({ initial, onSubmit, onCancel, loading }: Props) {
  const [form, setForm] = useState({
    nom: initial?.nom ?? "",
    prenom: initial?.prenom ?? "",
    email: initial?.email ?? "",
    telephone: initial?.telephone ?? "",
    instagram: initial?.instagram ?? "",
    statut: initial?.statut ?? "PROSPECT",
    budgetMax: initial?.budgetMax?.toString() ?? "",
    notes: initial?.notes ?? "",
  });

  const [wishlist, setWishlist] = useState<WishItem[]>(
    initial?.wishlist ?? []
  );

  const addWish = () =>
    setWishlist([...wishlist, { marque: "", modele: "", priorite: "MOYENNE", notes: "" }]);

  const updateWish = (i: number, field: string, value: string) => {
    const updated = [...wishlist];
    updated[i] = { ...updated[i], [field]: value };
    setWishlist(updated);
  };

  const removeWish = (i: number) => setWishlist(wishlist.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...form,
      wishlist: wishlist.filter((w) => w.marque.trim()),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Identité */}
      <div>
        <h3 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider mb-3">Identité</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Nom *</label>
            <input required className="input" placeholder="Dupont"
              value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
          </div>
          <div>
            <label className="label">Prénom</label>
            <input className="input" placeholder="Jean"
              value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" placeholder="jean@email.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label">Téléphone</label>
            <input className="input" placeholder="+33 6 …"
              value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
          </div>
          <div>
            <label className="label">Instagram</label>
            <input className="input" placeholder="pseudo (sans @)"
              value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} />
          </div>
          <div>
            <label className="label">Statut</label>
            <select className="input" value={form.statut}
              onChange={(e) => setForm({ ...form, statut: e.target.value })}>
              <option value="PROSPECT">Prospect</option>
              <option value="ACTIF">Acheteur actif</option>
              <option value="VIP">VIP</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="label">Budget max (€)</label>
            <input type="number" step="100" className="input" placeholder="5000"
              value={form.budgetMax} onChange={(e) => setForm({ ...form, budgetMax: e.target.value })} />
          </div>
        </div>
        <div className="mt-3">
          <label className="label">Notes</label>
          <textarea className="input min-h-[70px] resize-none" placeholder="Préférences, historique…"
            value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
      </div>

      {/* Wish list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider">Wish List</h3>
          <button type="button" onClick={addWish}
            className="flex items-center gap-1 text-xs text-yellow-400 hover:text-yellow-300">
            <Plus size={14} /> Ajouter
          </button>
        </div>

        {wishlist.length === 0 && (
          <p className="text-xs text-zinc-600 text-center py-4">Aucun souhait — cliquez Ajouter</p>
        )}

        <div className="space-y-3">
          {wishlist.map((w, i) => (
            <div key={i} className="bg-zinc-800 rounded-lg p-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label text-xs">Marque *</label>
                  <input className="input text-sm" placeholder="Rolex"
                    value={w.marque} onChange={(e) => updateWish(i, "marque", e.target.value)} />
                </div>
                <div>
                  <label className="label text-xs">Modèle</label>
                  <input className="input text-sm" placeholder="Submariner"
                    value={w.modele ?? ""} onChange={(e) => updateWish(i, "modele", e.target.value)} />
                </div>
                <div>
                  <label className="label text-xs">Priorité</label>
                  <select className="input text-sm" value={w.priorite}
                    onChange={(e) => updateWish(i, "priorite", e.target.value)}>
                    {PRIORITES.map((p) => (
                      <option key={p} value={p}>{p === "HAUTE" ? "🔴 Haute" : p === "MOYENNE" ? "🟡 Moyenne" : "⚪ Basse"}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button type="button" onClick={() => removeWish(i)}
                    className="w-full p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors flex items-center justify-center gap-1 text-xs">
                    <Trash2 size={13} /> Retirer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800">
        <button type="button" onClick={onCancel} className="btn-secondary">Annuler</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Enregistrement…" : initial ? "Mettre à jour" : "Créer le client"}
        </button>
      </div>
    </form>
  );
}
