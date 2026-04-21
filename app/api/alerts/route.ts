import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const day60 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const day30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const day15 = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);

    const watches = await prisma.watch.findMany({
      include: { achat: true },
    });

    const alerts: {
      type: "STOCK_LONG" | "REVISION" | "SAV_LONG";
      level: "warning" | "danger";
      message: string;
      watchId: string;
      watchLabel: string;
    }[] = [];

    for (const w of watches) {
      // En stock depuis > 60 jours
      if (w.statut === "EN_STOCK" || w.statut === "EN_VENTE") {
        const ref = w.dateMiseEnStock ?? w.createdAt;
        if (ref < day60) {
          const jours = Math.floor((now.getTime() - ref.getTime()) / (24 * 60 * 60 * 1000));
          alerts.push({
            type: "STOCK_LONG",
            level: "warning",
            message: `En stock depuis ${jours} jours — à relancer`,
            watchId: w.id,
            watchLabel: `${w.marque} ${w.modele}`,
          });
        }
      }

      // Révision planifiée dans < 15 jours
      if (w.dateRevision) {
        const dr = new Date(w.dateRevision);
        if (dr <= day15 && dr >= now) {
          const jours = Math.ceil((dr.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
          alerts.push({
            type: "REVISION",
            level: "warning",
            message: `Révision planifiée dans ${jours} jour${jours > 1 ? "s" : ""}`,
            watchId: w.id,
            watchLabel: `${w.marque} ${w.modele}`,
          });
        }
        // Révision dépassée
        if (dr < now) {
          alerts.push({
            type: "REVISION",
            level: "danger",
            message: `Révision en retard !`,
            watchId: w.id,
            watchLabel: `${w.marque} ${w.modele}`,
          });
        }
      }

      // SAV depuis > 30 jours
      if (w.statut === "SAV") {
        const ref = w.updatedAt;
        if (ref < day30) {
          const jours = Math.floor((now.getTime() - ref.getTime()) / (24 * 60 * 60 * 1000));
          alerts.push({
            type: "SAV_LONG",
            level: "danger",
            message: `En SAV depuis ${jours} jours — urgent`,
            watchId: w.id,
            watchLabel: `${w.marque} ${w.modele}`,
          });
        }
      }
    }

    return NextResponse.json(alerts);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
