-- WatchPhoto
CREATE TABLE "WatchPhoto" (
    "id" TEXT NOT NULL,
    "watchId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WatchPhoto_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "WatchPhoto" ADD CONSTRAINT "WatchPhoto_watchId_fkey" FOREIGN KEY ("watchId") REFERENCES "Watch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Client
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT,
    "email" TEXT,
    "telephone" TEXT,
    "instagram" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'PROSPECT',
    "budgetMax" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- WishItem
CREATE TABLE "WishItem" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "marque" TEXT NOT NULL,
    "modele" TEXT,
    "priorite" TEXT NOT NULL DEFAULT 'MOYENNE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WishItem_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "WishItem" ADD CONSTRAINT "WishItem_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- New Watch columns
ALTER TABLE "Watch" ADD COLUMN IF NOT EXISTS "prixMarche" DOUBLE PRECISION;
ALTER TABLE "Watch" ADD COLUMN IF NOT EXISTS "dateRevision" TIMESTAMP(3);
ALTER TABLE "Watch" ADD COLUMN IF NOT EXISTS "dateMiseEnStock" TIMESTAMP(3);
