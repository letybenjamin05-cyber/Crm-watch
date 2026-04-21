CREATE TABLE "Watch" (
    "id" TEXT NOT NULL,
    "marque" TEXT NOT NULL,
    "modele" TEXT NOT NULL,
    "reference" TEXT,
    "calibre" TEXT,
    "diametre" DOUBLE PRECISION,
    "etat" TEXT NOT NULL DEFAULT 'Bon',
    "fullSet" BOOLEAN NOT NULL DEFAULT false,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "notes" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Watch_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Achat" (
    "id" TEXT NOT NULL,
    "watchId" TEXT NOT NULL,
    "prixMontre" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fraisProxy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fraisPort" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fraisReparation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fraisDouane" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "coutTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dateAchat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fournisseur" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Achat_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Vente" (
    "id" TEXT NOT NULL,
    "watchId" TEXT NOT NULL,
    "prixVente" DOUBLE PRECISION NOT NULL,
    "plateforme" TEXT,
    "acheteur" TEXT,
    "dateVente" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "benefice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "marge" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Vente_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Achat_watchId_key" ON "Achat"("watchId");
CREATE UNIQUE INDEX "Vente_watchId_key" ON "Vente"("watchId");

ALTER TABLE "Achat" ADD CONSTRAINT "Achat_watchId_fkey" FOREIGN KEY ("watchId") REFERENCES "Watch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Vente" ADD CONSTRAINT "Vente_watchId_fkey" FOREIGN KEY ("watchId") REFERENCES "Watch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
