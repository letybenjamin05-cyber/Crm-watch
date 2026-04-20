export type Statut =
  | "EN_ATTENTE"
  | "EN_STOCK"
  | "EN_VENTE"
  | "VENDU"
  | "RETOUR"
  | "SAV";

export const STATUT_LABELS: Record<Statut, string> = {
  EN_ATTENTE: "En attente",
  EN_STOCK: "En stock",
  EN_VENTE: "En vente",
  VENDU: "Vendu",
  RETOUR: "Retour",
  SAV: "SAV",
};

export const STATUT_COLORS: Record<Statut, string> = {
  EN_ATTENTE: "bg-yellow-100 text-yellow-800",
  EN_STOCK: "bg-blue-100 text-blue-800",
  EN_VENTE: "bg-purple-100 text-purple-800",
  VENDU: "bg-green-100 text-green-800",
  RETOUR: "bg-orange-100 text-orange-800",
  SAV: "bg-red-100 text-red-800",
};

export const ETAT_OPTIONS = [
  "Neuf",
  "Excellent",
  "Très bon",
  "Bon",
  "Passable",
  "Pièces",
];

export type WatchWithRelations = {
  id: string;
  marque: string;
  modele: string;
  reference: string | null;
  calibre: string | null;
  diametre: number | null;
  etat: string;
  fullSet: boolean;
  statut: string;
  notes: string | null;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  achat: {
    id: string;
    prixMontre: number;
    fraisProxy: number;
    fraisPort: number;
    fraisReparation: number;
    fraisDouane: number;
    coutTotal: number;
    dateAchat: Date;
    fournisseur: string | null;
  } | null;
  vente: {
    id: string;
    prixVente: number;
    plateforme: string | null;
    acheteur: string | null;
    dateVente: Date;
    benefice: number;
    marge: number;
  } | null;
};
