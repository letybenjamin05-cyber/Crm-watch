import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const watch = await prisma.watch.findUnique({
      where: { id },
      include: { achat: true, vente: true },
    });
    if (!watch) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(watch);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      marque,
      modele,
      reference,
      calibre,
      diametre,
      etat,
      fullSet,
      statut,
      notes,
      achat,
      vente,
    } = body;

    // Update watch
    const watch = await prisma.watch.update({
      where: { id },
      data: {
        marque,
        modele,
        reference: reference || null,
        calibre: calibre || null,
        diametre: diametre ? parseFloat(diametre) : null,
        etat,
        fullSet: fullSet || false,
        statut,
        notes: notes || null,
      },
    });

    // Upsert achat
    if (achat) {
      const coutTotal =
        (parseFloat(achat.prixMontre) || 0) +
        (parseFloat(achat.fraisProxy) || 0) +
        (parseFloat(achat.fraisPort) || 0) +
        (parseFloat(achat.fraisReparation) || 0) +
        (parseFloat(achat.fraisDouane) || 0);

      await prisma.achat.upsert({
        where: { watchId: id },
        create: {
          watchId: id,
          prixMontre: parseFloat(achat.prixMontre) || 0,
          fraisProxy: parseFloat(achat.fraisProxy) || 0,
          fraisPort: parseFloat(achat.fraisPort) || 0,
          fraisReparation: parseFloat(achat.fraisReparation) || 0,
          fraisDouane: parseFloat(achat.fraisDouane) || 0,
          coutTotal,
          dateAchat: achat.dateAchat ? new Date(achat.dateAchat) : new Date(),
          fournisseur: achat.fournisseur || null,
        },
        update: {
          prixMontre: parseFloat(achat.prixMontre) || 0,
          fraisProxy: parseFloat(achat.fraisProxy) || 0,
          fraisPort: parseFloat(achat.fraisPort) || 0,
          fraisReparation: parseFloat(achat.fraisReparation) || 0,
          fraisDouane: parseFloat(achat.fraisDouane) || 0,
          coutTotal,
          dateAchat: achat.dateAchat ? new Date(achat.dateAchat) : new Date(),
          fournisseur: achat.fournisseur || null,
        },
      });
    }

    // Upsert vente
    if (vente && vente.prixVente) {
      const coutTotal = (await prisma.achat.findUnique({ where: { watchId: id } }))?.coutTotal || 0;
      const prixVente = parseFloat(vente.prixVente);
      const benefice = prixVente - coutTotal;
      const marge = coutTotal > 0 ? (benefice / coutTotal) * 100 : 0;

      await prisma.vente.upsert({
        where: { watchId: id },
        create: {
          watchId: id,
          prixVente,
          plateforme: vente.plateforme || null,
          acheteur: vente.acheteur || null,
          dateVente: vente.dateVente ? new Date(vente.dateVente) : new Date(),
          benefice,
          marge,
        },
        update: {
          prixVente,
          plateforme: vente.plateforme || null,
          acheteur: vente.acheteur || null,
          dateVente: vente.dateVente ? new Date(vente.dateVente) : new Date(),
          benefice,
          marge,
        },
      });
    }

    const updated = await prisma.watch.findUnique({
      where: { id },
      include: { achat: true, vente: true },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.watch.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
