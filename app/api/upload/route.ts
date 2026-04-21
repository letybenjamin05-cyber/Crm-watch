import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const watchId = formData.get("watchId") as string;
    const files = formData.getAll("files") as File[];

    if (!watchId || !files.length) {
      return NextResponse.json({ error: "watchId et fichiers requis" }, { status: 400 });
    }

    const count = await prisma.watchPhoto.count({ where: { watchId } });
    if (count + files.length > 5) {
      return NextResponse.json({ error: "Maximum 5 photos par montre" }, { status: 400 });
    }

    const saved: string[] = [];

    // Vercel Blob si disponible, sinon base64 en fallback
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = await import("@vercel/blob");
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const blob = await put(`watches/${watchId}/${Date.now()}-${i}-${file.name}`, file, {
          access: "public",
        });
        await prisma.watchPhoto.create({
          data: { watchId, url: blob.url, ordre: count + i },
        });
        saved.push(blob.url);
      }
    } else {
      // Fallback base64 (sans Blob token)
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const bytes = await file.arrayBuffer();
        const base64 = `data:${file.type};base64,${Buffer.from(bytes).toString("base64")}`;
        await prisma.watchPhoto.create({
          data: { watchId, url: base64, ordre: count + i },
        });
        saved.push(base64.slice(0, 50) + "...");
      }
    }

    return NextResponse.json({ urls: saved });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur upload" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { photoId } = await req.json();
    await prisma.watchPhoto.delete({ where: { id: photoId } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
