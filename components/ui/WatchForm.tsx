"use client";

import { useState } from "react";
import { ETAT_OPTIONS, STATUT_LABELS, type WatchWithRelations } from "@/lib/types";

interface WatchFormProps {
  initial?: WatchWithRelations | null;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const STATUTS = Object.entries(STATUT_LABELS);

const defaultAchat = {
  prixMontre: "",
  fraisProxy: "",
  fraisPort: "",
  fraisReparation: "",
  fraisDouane: "",
  dateAchat: new Date().toISOString().slice(0, 10),
  fournisseur: "",
};

export default function WatchForm({
  initial,
  onSubmit,
  onCancel,
  loading,
}: WatchFormProps) {
  const [watch, setWatch] = useState({
    marque: initial?.marque ?? "",
    modele: initial?.modele ?? "",
    reference: initial?.reference ?? "",
    calibre: initial?.calibre ?? "",
    diametre: initial?.diametre?.toString() ?? "",
    etat: initial?.etat ?? "Bon",
    fullSet: initial?.fullSet ?? false,
    statut: initial?.statut ?? "EN_ATTENTE",
    notes: initial?.notes ?? "",
  });

  const [achat, setAchat] = useState({
    prixMontre: initial?.achat?.prixMontre?.toString() ?? "",
    fraisProxy: initial?.achat?.fraisProxy?.toString() ?? "",
    fraisPort: initial?.achat?.fraisPort?.toString() ?? "",
    fraisReparation: initial?.achat?.fraisReparation?.toString() ?? "",
    fraisDouane: initial?.achat?.fraisDouane?.toString() ?? "",
    dateAchat: initial?.achat?.dateAchat
      ? new Date(initial.achat.dateAchat).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    fournisseur: initial?.achat?.fournisseur ?? "",
  });

  const [vente, setVente] = useState({
    prixVente: initial?.vente?.prixVente?.toString() ?? "",
    plateforme: initial?.vente?.plateforme ?? "",
    acheteur: initial?.vente?.acheteur ?? "",
    dateVente: initial?.vente?.dateVente
      ? new Date(initial.vente.dateVente).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
  });

  const coutTotal =
    (parseFloat(achat.prixMontre) || 0) +
    (parseFloat(achat.fraisProxy) || 0) +
    (parseFloat(achat.fraisPort) || 0) +
    (parseFloat(achat.fraisReparation) || 0) +
    (parseFloat(achat.fraisDouane) || 0);

  const prixVente = parseFloat(vente.prixVente) || 0;
  const benefice = prixVente - coutTotal;
  const marge = coutTotal > 0 ? (benefice / coutTotal) * 100 : 0;

  const showVente = watch.statut === "EN_VENTE" || watch.statut === "VENDU";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ ...watch, achat, ...(showVente ? { vente } : {}) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Fiche montre */}
      <div>
        <h3 className="text-sm font-semibold text-gold-400 uppercase tracking-wider mb-3">
          Fiche Montre
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Marque *</label>
            <input
              required
              className="input"
              placeholder="Rolex, Omega…"
              value={watch.marque}
              onChange={(e) => setWatch({ ...watch, marque: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Modèle *</label>
            <input
              required
              className="input"
              placeholder="Submariner, Speedmaster…"
              value={watch.modele}
              onChange={(e) => setWatch({ ...watch, modele: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Référence</label>
            <input
              className="input"
              placeholder="126610LN"
              value={watch.reference}
              onChange={(e) => setWatch({ ...watch, reference: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Calibre</label>
            <input
              className="input"
              placeholder="3235"
              value={watch.calibre}
              onChange={(e) => setWatch({ ...watch, calibre: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Diamètre (mm)</label>
            <input
              type="number"
              step="0.5"
              className="input"
              placeholder="40"
              value={watch.diametre}
              onChange={(e) => setWatch({ ...watch, diametre: e.target.value })}
            />
          </div>
          <div>
            <label className="label">État</label>
            <select
              className="input"
              value={watch.etat}
              onChange={(e) => setWatch({ ...watch, etat: e.target.value })}
            >
              {ETAT_OPTIONS.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Statut</label>
            <select
              className="input"
              value={watch.statut}
              onChange={(e) => setWatch({ ...watch, statut: e.target.value })}
            >
              {STATUTS.map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 accent-gold-500"
                checked={watch.fullSet}
                onChange={(e) => setWatch({ ...watch, fullSet: e.target.checked })}
              />
              <span className="text-sm text-zinc-300">Full Set (boîte + papiers)</span>
            </label>
          </div>
        </div>
        <div className="mt-3">
          <label className="label">Notes</label>
          <textarea
            className="input min-h-[80px] resize-none"
            placeholder="Observations, particularités…"
            value={watch.notes}
            onChange={(e) => setWatch({ ...watch, notes: e.target.value })}
          />
        </div>
      </div>

      {/* Décomposition coûts achat */}
      <div>
        <h3 className="text-sm font-semibold text-gold-400 uppercase tracking-wider mb-3">
          Coûts d&apos;achat
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Prix montre (€)</label>
            <input
              type="number"
              step="0.01"
              className="input"
              placeholder="0"
              value={achat.prixMontre}
              onChange={(e) => setAchat({ ...achat, prixMontre: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Frais proxy (€)</label>
            <input
              type="number"
              step="0.01"
              className="input"
              placeholder="0"
              value={achat.fraisProxy}
              onChange={(e) => setAchat({ ...achat, fraisProxy: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Port / envoi (€)</label>
            <input
              type="number"
              step="0.01"
              className="input"
              placeholder="0"
              value={achat.fraisPort}
              onChange={(e) => setAchat({ ...achat, fraisPort: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Réparation (€)</label>
            <input
              type="number"
              step="0.01"
              className="input"
              placeholder="0"
              value={achat.fraisReparation}
              onChange={(e) =>
                setAchat({ ...achat, fraisReparation: e.target.value })
              }
            />
          </div>
          <div>
            <label className="label">Douane / TVA (€)</label>
            <input
              type="number"
              step="0.01"
              className="input"
              placeholder="0"
              value={achat.fraisDouane}
              onChange={(e) => setAchat({ ...achat, fraisDouane: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Date achat</label>
            <input
              type="date"
              className="input"
              value={achat.dateAchat}
              onChange={(e) => setAchat({ ...achat, dateAchat: e.target.value })}
            />
          </div>
          <div className="col-span-2">
            <label className="label">Fournisseur / Vendeur</label>
            <input
              className="input"
              placeholder="Nom du vendeur"
              value={achat.fournisseur}
              onChange={(e) => setAchat({ ...achat, fournisseur: e.target.value })}
            />
          </div>
        </div>
        {/* Coût total */}
        <div className="mt-3 bg-zinc-800 rounded-lg px-4 py-3 flex justify-between items-center">
          <span className="text-sm text-zinc-400">Coût total revient</span>
          <span className="text-lg font-bold text-white">
            {coutTotal.toLocaleString("fr-FR", {
              style: "currency",
              currency: "EUR",
            })}
          </span>
        </div>
      </div>

      {/* Vente */}
      {showVente && (
        <div>
          <h3 className="text-sm font-semibold text-gold-400 uppercase tracking-wider mb-3">
            Vente
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Prix de vente (€)</label>
              <input
                type="number"
                step="0.01"
                className="input"
                placeholder="0"
                value={vente.prixVente}
                onChange={(e) => setVente({ ...vente, prixVente: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Plateforme</label>
              <input
                className="input"
                placeholder="Chrono24, eBay, Vestiaire…"
                value={vente.plateforme}
                onChange={(e) => setVente({ ...vente, plateforme: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Acheteur</label>
              <input
                className="input"
                placeholder="Nom acheteur"
                value={vente.acheteur}
                onChange={(e) => setVente({ ...vente, acheteur: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Date vente</label>
              <input
                type="date"
                className="input"
                value={vente.dateVente}
                onChange={(e) => setVente({ ...vente, dateVente: e.target.value })}
              />
            </div>
          </div>
          {/* Calcul automatique */}
          {prixVente > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="bg-zinc-800 rounded-lg px-3 py-2 text-center">
                <p className="text-xs text-zinc-500">Bénéfice</p>
                <p className={`font-bold ${benefice >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {benefice.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                </p>
              </div>
              <div className="bg-zinc-800 rounded-lg px-3 py-2 text-center">
                <p className="text-xs text-zinc-500">Marge</p>
                <p className={`font-bold ${marge >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {marge.toFixed(1)}%
                </p>
              </div>
              <div className="bg-zinc-800 rounded-lg px-3 py-2 text-center">
                <p className="text-xs text-zinc-500">Prix vente</p>
                <p className="font-bold text-white">
                  {prixVente.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Annuler
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Enregistrement…" : initial ? "Mettre à jour" : "Ajouter"}
        </button>
      </div>
    </form>
  );
}
