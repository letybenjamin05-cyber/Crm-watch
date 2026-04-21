import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

function getDbUrl() {
  // Sur Vercel (Lambda), seul /tmp est accessible en écriture
  if (process.env.VERCEL) {
    const tmpDb = "/tmp/watchcrm.db";
    // Copier le schéma vide depuis le build si le fichier n'existe pas encore
    if (!fs.existsSync(tmpDb)) {
      const bundledDb = path.join(process.cwd(), "prisma", "dev.db");
      if (fs.existsSync(bundledDb)) {
        fs.copyFileSync(bundledDb, tmpDb);
      }
    }
    return `file:${tmpDb}`;
  }
  return process.env.DATABASE_URL ?? "file:./prisma/dev.db";
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: { db: { url: getDbUrl() } },
    log: process.env.NODE_ENV === "development" ? ["error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
