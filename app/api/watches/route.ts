import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const statut = searchParams.get("statut");
    const search = searchParams.get("search");

    const watches = await prisma.watch.findMany({
      where: {
        ...(statut && statut !== "ALL" ? { statut } : {}),
        ...(search
          ? {
              OR: [
                { marque: { contains: search, mode: "insensitive" } },
                { modele: { contains: search, mode: "insensitive" } },
                { reference: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: { achat: true, vente: true, photos: { orderBy: { ordre: "asc" } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(watches);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { marque, modele, reference, calibre, diametre, etat, fullSet, statut,
            notes, prixMarche, dateRevision, achat } = body;

    const watch = await prisma.watch.create({
      data: {
        marque, modele,
        reference: reference || null,
        calibre: calibre || null,
        diametre: diametre ? parseFloat(diametre) : null,
        etat: etat || "Bon",
        fullSet: fullSet || false,
        statut: statut || "EN_ATTENTE",
        notes: notes || null,
        prixMarche: prixMarche ? parseFloat(prixMarche) : null,
        dateRevision: dateRevision ? new Date(dateRevision) : null,
        dateMiseEnStock: statut === "EN_STOCK" ? new Date() : null,
        ...(achat ? {
          achat: {
            create: {
              prixMontre: parseFloat(achat.prixMontre) || 0,
              fraisProxy: parseFloat(achat.fraisProxy) || 0,
              fraisPort: parseFloat(achat.fraisPort) || 0,
              fraisReparation: parseFloat(achat.fraisReparation) || 0,
              fraisDouane: parseFloat(achat.fraisDouane) || 0,
              coutTotal: (parseFloat(achat.prixMontre) || 0) + (parseFloat(achat.fraisProxy) || 0)
                + (parseFloat(achat.fraisPort) || 0) + (parseFloat(achat.fraisReparation) || 0)
                + (parseFloat(achat.fraisDouane) || 0),
              dateAchat: achat.dateAchat ? new Date(achat.dateAchat) : new Date(),
              fournisseur: achat.fournisseur || null,
            },
          },
        } : {}),
      },
      include: { achat: true, vente: true, photos: true },
    });

    // Matching wish list clients
    const matches = await prisma.wishItem.findMany({
      where: { marque: { equals: marque, mode: "insensitive" },
               ...(modele ? { OR: [{ modele: null }, { modele: { equals: modele, mode: "insensitive" } }] } : {}) },
      include: { client: true },
    });

    return NextResponse.json({ watch, wishlistMatches: matches }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
