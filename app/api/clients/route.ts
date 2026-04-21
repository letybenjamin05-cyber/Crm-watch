import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const clients = await prisma.client.findMany({
      where: search
        ? {
            OR: [
              { nom: { contains: search, mode: "insensitive" } },
              { prenom: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {},
      include: { wishlist: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(clients);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nom, prenom, email, telephone, instagram, statut, budgetMax, notes, wishlist } = body;
    const client = await prisma.client.create({
      data: {
        nom,
        prenom: prenom || null,
        email: email || null,
        telephone: telephone || null,
        instagram: instagram || null,
        statut: statut || "PROSPECT",
        budgetMax: budgetMax ? parseFloat(budgetMax) : null,
        notes: notes || null,
        ...(wishlist?.length
          ? {
              wishlist: {
                create: wishlist.map((w: { marque: string; modele?: string; priorite?: string; notes?: string }) => ({
                  marque: w.marque,
                  modele: w.modele || null,
                  priorite: w.priorite || "MOYENNE",
                  notes: w.notes || null,
                })),
              },
            }
          : {}),
      },
      include: { wishlist: true },
    });
    return NextResponse.json(client, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
