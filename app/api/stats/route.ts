import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [watches, ventes, achats] = await Promise.all([
      prisma.watch.findMany({ include: { achat: true, vente: true } }),
      prisma.vente.findMany({ include: { watch: true } }),
      prisma.achat.findMany({ include: { watch: true } }),
    ]);

    // KPIs globaux
    const totalVentes = ventes.reduce((s, v) => s + v.prixVente, 0);
    const totalCouts = achats.reduce((s, a) => s + a.coutTotal, 0);
    const totalBenefice = ventes.reduce((s, v) => s + v.benefice, 0);
    const margeGlobale = totalVentes > 0 ? (totalBenefice / totalVentes) * 100 : 0;

    // Valeur stock (EN_STOCK ou EN_VENTE)
    const valeurStock = achats
      .filter((a) => ["EN_STOCK", "EN_VENTE"].includes(a.watch.statut))
      .reduce((s, a) => s + a.coutTotal, 0);

    // Par statut
    const parStatut = watches.reduce(
      (acc: Record<string, number>, w) => {
        acc[w.statut] = (acc[w.statut] || 0) + 1;
        return acc;
      },
      {}
    );

    // Par marque (ventes)
    const parMarque: Record<
      string,
      { nb: number; ca: number; benefice: number }
    > = {};
    for (const v of ventes) {
      const marque = v.watch.marque;
      if (!parMarque[marque]) parMarque[marque] = { nb: 0, ca: 0, benefice: 0 };
      parMarque[marque].nb += 1;
      parMarque[marque].ca += v.prixVente;
      parMarque[marque].benefice += v.benefice;
    }

    // Evol mensuelle (12 derniers mois)
    const now = new Date();
    const monthly: { mois: string; ca: number; benefice: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mois = d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
      const monthVentes = ventes.filter((v) => {
        const vd = new Date(v.dateVente);
        return vd.getFullYear() === d.getFullYear() && vd.getMonth() === d.getMonth();
      });
      monthly.push({
        mois,
        ca: monthVentes.reduce((s, v) => s + v.prixVente, 0),
        benefice: monthVentes.reduce((s, v) => s + v.benefice, 0),
      });
    }

    return NextResponse.json({
      totalVentes,
      totalCouts,
      totalBenefice,
      margeGlobale,
      valeurStock,
      nbWatches: watches.length,
      nbVendus: watches.filter((w) => w.statut === "VENDU").length,
      nbEnStock: watches.filter((w) => w.statut === "EN_STOCK").length,
      parStatut,
      parMarque,
      monthly,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
