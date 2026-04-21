"use client";

import { useState, useRef } from "react";
import { ETAT_OPTIONS, STATUT_LABELS, type WatchWithRelations } from "@/lib/types";
import { Camera, X, Sparkles, Copy, Check, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface WatchFormProps {
  initial?: WatchWithRelations | null;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const STATUTS = Object.entries(STATUT_LABELS);

function generateAnnonce(watch: {
  marque: string; modele: string; reference?: string; calibre?: string;
  diametre?: string; etat: string; fullSet: boolean; notes?: string;
  prixMarche?: string;
}, coutTotal: number): string {
  const etatNote = watch.notes ?? "Fonctionnement parfait, entretien soigné.";
  const lignes = [
    `🕰️ ${watch.marque} ${watch.modele}${watch.reference ? ` – Réf. ${watch.reference}` : ""}`,
    "",
    `Belle pièce de collection en état ${watch.etat.toLowerCase()}, proposée par un passionné d'horlogerie. ${watch.fullSet ? "Livrée complète boîte et papiers d'origine." : ""}`.trim(),
    "",
    `📋 CARACTÉRISTIQUES`,
    `• Marque : ${watch.marque}`,
    `• Modèle : ${watch.modele}`,
    ...(watch.reference ? [`• Référence : ${watch.reference}`] : []),
    ...(watch.calibre ? [`• Calibre : ${watch.calibre}`] : []),
    ...(watch.diametre ? [`• Diamètre : ${watch.diametre} mm`] : []),
    `• État : ${watch.etat}`,
    `• Full Set : ${watch.fullSet ? "Oui (boîte + papiers)" : "Non"}`,
    "",
    `✅ ÉTAT & NOTES`,
    etatNote,
    "",
    `📦 EXPÉDITION`,
    `Envoi sécurisé en recommandé avec assurance valeur — remise en main propre possible (région parisienne).`,
    "",
    `#${watch.marque.replace(/\s/g, "")} #montrevintage #horlogerie #watchcollector`,
  ];
  return lignes.join("\n");
}

export default function WatchForm({ initial, onSubmit, onCancel, loading }: WatchFormProps) {
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
    prixMarche: (initial as WatchWithRelations & { prixMarche?: number })?.prixMarche?.toString() ?? "",
    dateRevision: (initial as WatchWithRelations & { dateRevision?: Date | string })?.dateRevision
      ? new Date((initial as WatchWithRelations & { dateRevision?: Date | string }).dateRevision!).toISOString().slice(0, 10)
      : "",
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

  const [photos, setPhotos] = useState<{ id?: string; url: string }[]>(
    (initial as WatchWithRelations & { photos?: { id: string; url: string }[] })?.photos ?? []
  );
  const [uploading, setUploading] = useState(false);
  const [annonce, setAnnonce] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"fiche" | "achat" | "vente" | "photos" | "annonce">("fiche");
  const fileRef = useRef<HTMLInputElement>(null);

  const coutTotal = (parseFloat(achat.prixMontre) || 0) + (parseFloat(achat.fraisProxy) || 0)
    + (parseFloat(achat.fraisPort) || 0) + (parseFloat(achat.fraisReparation) || 0)
    + (parseFloat(achat.fraisDouane) || 0);
  const prixVente = parseFloat(vente.prixVente) || 0;
  const benefice = prixVente - coutTotal;
  const marge = coutTotal > 0 ? (benefice / coutTotal) * 100 : 0;
  const prixMarche = parseFloat(watch.prixMarche) || 0;

  // Indicateur marché
  let marcheIcon = <Minus size={14} className="text-zinc-400" />;
  let marcheLabel = "Dans le marché";
  let marcheColor = "text-zinc-400";
  if (prixMarche > 0 && coutTotal > 0) {
    const ratio = (coutTotal / prixMarche) * 100;
    if (ratio < 90) { marcheIcon = <TrendingDown size={14} className="text-green-400" />; marcheLabel = "Sous le marché ✓"; marcheColor = "text-green-400"; }
    else if (ratio > 110) { marcheIcon = <TrendingUp size={14} className="text-red-400" />; marcheLabel = "Au-dessus du marché"; marcheColor = "text-red-400"; }
    else { marcheLabel = "Dans le marché"; marcheColor = "text-yellow-400"; }
  }

  const showVente = watch.statut === "EN_VENTE" || watch.statut === "VENDU";

  const handleFileUpload = async (files: FileList) => {
    if (!initial?.id) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("watchId", initial.id);
    Array.from(files).forEach((f) => fd.append("files", f));
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (res.ok) {
      const updated = await fetch(`/api/watches/${initial.id}`).then((r) => r.json());
      setPhotos(updated.photos ?? []);
    }
    setUploading(false);
  };

  const handleDeletePhoto = async (photoId: string) => {
    await fetch("/api/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoId }),
    });
    setPhotos((p) => p.filter((ph) => ph.id !== photoId));
  };

  const handleGenerateAnnonce = () => {
    const text = generateAnnonce(watch, coutTotal);
    setAnnonce(text);
    setActiveTab("annonce");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(annonce);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ ...watch, achat, ...(showVente ? { vente } : {}) });
  };

  const tabs = [
    { id: "fiche", label: "Fiche" },
    { id: "achat", label: "Achat" },
    ...(showVente ? [{ id: "vente", label: "Vente" }] : []),
    { id: "photos", label: `Photos${photos.length ? ` (${photos.length})` : ""}` },
    { id: "annonce", label: "Annonce" },
  ] as { id: typeof activeTab; label: string }[];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-800 rounded-lg p-1 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.id} type="button"
            className={`flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === t.id ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
            onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* FICHE */}
      {activeTab === "fiche" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Marque *</label>
              <input required className="input" placeholder="Rolex, Omega…"
                value={watch.marque} onChange={(e) => setWatch({ ...watch, marque: e.target.value })} /></div>
            <div><label className="label">Modèle *</label>
              <input required className="input" placeholder="Submariner…"
                value={watch.modele} onChange={(e) => setWatch({ ...watch, modele: e.target.value })} /></div>
            <div><label className="label">Référence</label>
              <input className="input" placeholder="126610LN"
                value={watch.reference} onChange={(e) => setWatch({ ...watch, reference: e.target.value })} /></div>
            <div><label className="label">Calibre</label>
              <input className="input" placeholder="3235"
                value={watch.calibre} onChange={(e) => setWatch({ ...watch, calibre: e.target.value })} /></div>
            <div><label className="label">Diamètre (mm)</label>
              <input type="number" step="0.5" className="input" placeholder="40"
                value={watch.diametre} onChange={(e) => setWatch({ ...watch, diametre: e.target.value })} /></div>
            <div><label className="label">État</label>
              <select className="input" value={watch.etat} onChange={(e) => setWatch({ ...watch, etat: e.target.value })}>
                {ETAT_OPTIONS.map((e) => <option key={e} value={e}>{e}</option>)}
              </select></div>
            <div><label className="label">Statut</label>
              <select className="input" value={watch.statut} onChange={(e) => setWatch({ ...watch, statut: e.target.value })}>
                {STATUTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select></div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-yellow-500"
                  checked={watch.fullSet} onChange={(e) => setWatch({ ...watch, fullSet: e.target.checked })} />
                <span className="text-sm text-zinc-300">Full Set</span>
              </label>
            </div>
            <div><label className="label">Prix marché Chrono24 (€)</label>
              <input type="number" step="0.01" className="input" placeholder="8500"
                value={watch.prixMarche} onChange={(e) => setWatch({ ...watch, prixMarche: e.target.value })} /></div>
            <div><label className="label">Révision planifiée</label>
              <input type="date" className="input"
                value={watch.dateRevision} onChange={(e) => setWatch({ ...watch, dateRevision: e.target.value })} /></div>
          </div>

          {/* Indicateur marché */}
          {prixMarche > 0 && coutTotal > 0 && (
            <div className={`flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-2 text-sm ${marcheColor}`}>
              {marcheIcon}
              <span>{marcheLabel}</span>
              <span className="ml-auto text-xs text-zinc-500">
                Coût {coutTotal.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })} vs marché {prixMarche.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}
              </span>
            </div>
          )}

          <div><label className="label">Notes</label>
            <textarea className="input min-h-[80px] resize-none" placeholder="Observations…"
              value={watch.notes} onChange={(e) => setWatch({ ...watch, notes: e.target.value })} /></div>
        </div>
      )}

      {/* ACHAT */}
      {activeTab === "achat" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {[
              ["prixMontre", "Prix montre (€)"], ["fraisProxy", "Frais proxy (€)"],
              ["fraisPort", "Port / envoi (€)"], ["fraisReparation", "Réparation (€)"],
              ["fraisDouane", "Douane / TVA (€)"],
            ].map(([k, l]) => (
              <div key={k}><label className="label">{l}</label>
                <input type="number" step="0.01" className="input" placeholder="0"
                  value={achat[k as keyof typeof achat]}
                  onChange={(e) => setAchat({ ...achat, [k]: e.target.value })} /></div>
            ))}
            <div><label className="label">Date achat</label>
              <input type="date" className="input" value={achat.dateAchat}
                onChange={(e) => setAchat({ ...achat, dateAchat: e.target.value })} /></div>
            <div className="col-span-2"><label className="label">Fournisseur</label>
              <input className="input" placeholder="Nom du vendeur"
                value={achat.fournisseur} onChange={(e) => setAchat({ ...achat, fournisseur: e.target.value })} /></div>
          </div>
          <div className="bg-zinc-800 rounded-lg px-4 py-3 flex justify-between items-center">
            <span className="text-sm text-zinc-400">Coût total de revient</span>
            <span className="text-lg font-bold text-white">
              {coutTotal.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
            </span>
          </div>
        </div>
      )}

      {/* VENTE */}
      {activeTab === "vente" && showVente && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Prix de vente (€)</label>
              <input type="number" step="0.01" className="input" placeholder="0"
                value={vente.prixVente} onChange={(e) => setVente({ ...vente, prixVente: e.target.value })} /></div>
            <div><label className="label">Plateforme</label>
              <input className="input" placeholder="Chrono24, eBay…"
                value={vente.plateforme} onChange={(e) => setVente({ ...vente, plateforme: e.target.value })} /></div>
            <div><label className="label">Acheteur</label>
              <input className="input" placeholder="Nom"
                value={vente.acheteur} onChange={(e) => setVente({ ...vente, acheteur: e.target.value })} /></div>
            <div><label className="label">Date vente</label>
              <input type="date" className="input" value={vente.dateVente}
                onChange={(e) => setVente({ ...vente, dateVente: e.target.value })} /></div>
          </div>
          {prixVente > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Bénéfice", val: benefice.toLocaleString("fr-FR", { style: "currency", currency: "EUR" }), color: benefice >= 0 ? "text-green-400" : "text-red-400" },
                { label: "Marge", val: `${marge.toFixed(1)}%`, color: marge >= 0 ? "text-blue-400" : "text-red-400" },
                { label: "Prix vente", val: prixVente.toLocaleString("fr-FR", { style: "currency", currency: "EUR" }), color: "text-white" },
              ].map(({ label, val, color }) => (
                <div key={label} className="bg-zinc-800 rounded-lg px-3 py-2 text-center">
                  <p className="text-xs text-zinc-500">{label}</p>
                  <p className={`font-bold ${color}`}>{val}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PHOTOS */}
      {activeTab === "photos" && (
        <div className="space-y-3">
          {!initial?.id && (
            <div className="bg-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-400 text-center">
              Enregistrez d&apos;abord la montre pour ajouter des photos.
            </div>
          )}
          {initial?.id && (
            <>
              <div className="grid grid-cols-3 gap-2">
                {photos.map((p) => (
                  <div key={p.id ?? p.url} className="relative group aspect-square rounded-lg overflow-hidden bg-zinc-800">
                    <img src={p.url} alt="" className="w-full h-full object-cover" />
                    <button type="button"
                      onClick={() => p.id && handleDeletePhoto(p.id)}
                      className="absolute top-1 right-1 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {photos.length < 5 && (
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="aspect-square rounded-lg border-2 border-dashed border-zinc-700 hover:border-yellow-500 flex flex-col items-center justify-center gap-1 text-zinc-500 hover:text-yellow-400 transition-colors">
                    {uploading ? (
                      <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <><Camera size={20} /><span className="text-xs">Ajouter</span></>
                    )}
                  </button>
                )}
              </div>
              <p className="text-xs text-zinc-600 text-center">{photos.length}/5 photos</p>
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)} />
            </>
          )}
        </div>
      )}

      {/* ANNONCE */}
      {activeTab === "annonce" && (
        <div className="space-y-3">
          <button type="button" onClick={handleGenerateAnnonce}
            className="w-full flex items-center justify-center gap-2 btn-primary">
            <Sparkles size={16} /> Générer l&apos;annonce
          </button>
          {annonce && (
            <>
              <div className="relative">
                <textarea
                  className="input min-h-[300px] font-mono text-xs resize-none"
                  value={annonce}
                  onChange={(e) => setAnnonce(e.target.value)}
                />
              </div>
              <button type="button" onClick={handleCopy}
                className="w-full flex items-center justify-center gap-2 btn-secondary">
                {copied ? <><Check size={16} className="text-green-400" /> Copié !</> : <><Copy size={16} /> Copier</>}
              </button>
            </>
          )}
          {!annonce && (
            <p className="text-xs text-zinc-600 text-center">
              Cliquez sur &quot;Générer&quot; pour créer une annonce professionnelle basée sur la fiche.
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800">
        <button type="button" onClick={onCancel} className="btn-secondary">Annuler</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Enregistrement…" : initial ? "Mettre à jour" : "Ajouter"}
        </button>
      </div>
    </form>
  );
}
