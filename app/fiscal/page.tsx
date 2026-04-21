"use client";

import { useEffect, useState } from "react";
import { Receipt, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

interface VenteData {
  prixVente: number; benefice: number; dateVente: string;
  watch: { marque: string; modele: string };
}

interface AnneeData {
  annee: number; ca: number; benefice: number; nbVentes: number; ventes: VenteData[];
}

const SEUIL_PARTICULIER = 5000;
const SEUIL_MICRO = 77700;

const fmt = (v: number) =>
  v.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

function SeuilBar({ valeur, seuil, label, color }: { valeur: number; seuil: number; label: string; color: string }) {
  const pct = Math.min(100, (valeur / seuil) * 100);
  const atteint = valeur >= seuil;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-400">{label}</span>
        <div className="flex items-center gap-1.5">
          {atteint ? (
            <AlertTriangle size={14} className="text-red-400" />
          ) : (
            <CheckCircle size={14} className="text-green-400" />
          )}
          <span className={atteint ? "text-red-400 font-semibold" : "text-green-400"}>
            {fmt(valeur)} / {fmt(seuil)}
          </span>
        </div>
      </div>
      <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${atteint ? "bg-red-500" : pct > 75 ? "bg-yellow-500" : "bg-green-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-zinc-600">
        {atteint
          ? `⚠️ Seuil dépassé — obligations déclaratives à vérifier`
          : `Reste ${fmt(seuil - valeur)} avant le seuil`}
      </p>
    </div>
  );
}

export default function FiscalPage() {
  const [data, setData] = useState<AnneeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [anneeActive, setAnneeActive] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    fetch("/api/stats/fiscal")
      .then((r) => r.ok ? r.json() : [])
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const anneeData = data.find((d) => d.annee === anneeActive);
  const annees = data.map((d) => d.annee).sort((a, b) => b - a);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Fiscal</h1>
        <p className="text-zinc-500 text-sm">Suivi annuel et seuils réglementaires</p>
      </div>

      {/* Sélecteur d'année */}
      {annees.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {annees.map((a) => (
            <button key={a} onClick={() => setAnneeActive(a)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                anneeActive === a ? "bg-yellow-500 text-black" : "bg-zinc-800 text-zinc-400 hover:text-white"
              }`}>
              {a}
            </button>
          ))}
        </div>
      )}

      {!anneeData ? (
        <div className="card flex flex-col items-center justify-center py-16 gap-3 text-center">
          <Receipt size={40} className="text-zinc-700" />
          <p className="text-zinc-500">Aucune vente enregistrée pour {anneeActive}</p>
        </div>
      ) : (
        <>
          {/* KPIs annuels */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="card text-center">
              <p className="text-xs text-zinc-500">CA {anneeActive}</p>
              <p className="text-xl font-bold text-yellow-400 mt-1">{fmt(anneeData.ca)}</p>
            </div>
            <div className="card text-center">
              <p className="text-xs text-zinc-500">Bénéfice net</p>
              <p className={`text-xl font-bold mt-1 ${anneeData.benefice >= 0 ? "text-green-400" : "text-red-400"}`}>
                {fmt(anneeData.benefice)}
              </p>
            </div>
            <div className="card text-center col-span-2 md:col-span-1">
              <p className="text-xs text-zinc-500">Transactions</p>
              <p className="text-xl font-bold text-blue-400 mt-1">{anneeData.nbVentes}</p>
            </div>
          </div>

          {/* Seuils */}
          <div className="card space-y-5">
            <h3 className="text-sm font-semibold text-zinc-300">Seuils réglementaires {anneeActive}</h3>

            <SeuilBar
              valeur={anneeData.benefice > 0 ? anneeData.benefice : 0}
              seuil={SEUIL_PARTICULIER}
              label="Particulier – cession de biens"
              color="yellow"
            />

            <SeuilBar
              valeur={anneeData.ca}
              seuil={SEUIL_MICRO}
              label="Micro-entrepreneur – CA annuel"
              color="orange"
            />

            <div className="bg-zinc-800 rounded-lg p-3 text-xs text-zinc-400 space-y-1">
              <p className="font-medium text-zinc-300">⚖️ Rappel réglementaire</p>
              <p>• Au-delà de <strong className="text-white">5 000 €</strong> de plus-values de cession, déclaration obligatoire (article 150 UA CGI).</p>
              <p>• Au-delà de <strong className="text-white">77 700 €</strong> de CA, régime micro-entrepreneur ou BIC obligatoire.</p>
              <p>• Ces informations sont indicatives — consultez un expert-comptable.</p>
            </div>
          </div>

          {/* Historique des ventes */}
          <div className="card overflow-hidden p-0">
            <div className="px-4 py-3 border-b border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-300">Détail des ventes {anneeActive}</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-800">
                <tr className="text-left text-xs text-zinc-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Montre</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Prix vente</th>
                  <th className="px-4 py-3">Bénéfice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {anneeData.ventes.map((v, i) => (
                  <tr key={i} className="hover:bg-zinc-800/50">
                    <td className="px-4 py-3 text-white">{v.watch.marque} {v.watch.modele}</td>
                    <td className="px-4 py-3 text-zinc-400">
                      {new Date(v.dateVente).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "2-digit" })}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{fmt(v.prixVente)}</td>
                    <td className={`px-4 py-3 font-semibold ${v.benefice >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {fmt(v.benefice)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-zinc-700 bg-zinc-800/30">
                <tr className="text-sm font-semibold">
                  <td colSpan={2} className="px-4 py-3 text-zinc-400">TOTAL {anneeActive}</td>
                  <td className="px-4 py-3 text-white">{fmt(anneeData.ca)}</td>
                  <td className={`px-4 py-3 ${anneeData.benefice >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {fmt(anneeData.benefice)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
