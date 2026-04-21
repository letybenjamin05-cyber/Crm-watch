import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const ventes = await prisma.vente.findMany({
      include: { watch: true },
      orderBy: { dateVente: "desc" },
    });

    const byYear: Record<number, { ca: number; benefice: number; nbVentes: number; ventes: typeof ventes }> = {};

    for (const v of ventes) {
      const y = new Date(v.dateVente).getFullYear();
      if (!byYear[y]) byYear[y] = { ca: 0, benefice: 0, nbVentes: 0, ventes: [] };
      byYear[y].ca += v.prixVente;
      byYear[y].benefice += v.benefice;
      byYear[y].nbVentes += 1;
      byYear[y].ventes.push(v);
    }

    const result = Object.entries(byYear).map(([annee, d]) => ({
      annee: parseInt(annee),
      ...d,
    }));

    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
