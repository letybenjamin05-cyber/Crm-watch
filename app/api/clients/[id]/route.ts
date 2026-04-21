import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const client = await prisma.client.findUnique({ where: { id }, include: { wishlist: true } });
    if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(client);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { nom, prenom, email, telephone, instagram, statut, budgetMax, notes, wishlist } = body;

    await prisma.client.update({
      where: { id },
      data: {
        nom, prenom: prenom || null, email: email || null,
        telephone: telephone || null, instagram: instagram || null,
        statut, budgetMax: budgetMax ? parseFloat(budgetMax) : null, notes: notes || null,
      },
    });

    if (wishlist !== undefined) {
      await prisma.wishItem.deleteMany({ where: { clientId: id } });
      if (wishlist.length) {
        await prisma.wishItem.createMany({
          data: wishlist.map((w: { marque: string; modele?: string; priorite?: string; notes?: string }) => ({
            clientId: id,
            marque: w.marque,
            modele: w.modele || null,
            priorite: w.priorite || "MOYENNE",
            notes: w.notes || null,
          })),
        });
      }
    }

    const updated = await prisma.client.findUnique({ where: { id }, include: { wishlist: true } });
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.client.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
