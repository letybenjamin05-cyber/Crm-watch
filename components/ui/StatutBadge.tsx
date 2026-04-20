import { STATUT_COLORS, STATUT_LABELS, type Statut } from "@/lib/types";

export default function StatutBadge({ statut }: { statut: string }) {
  const color = STATUT_COLORS[statut as Statut] ?? "bg-zinc-800 text-zinc-300";
  const label = STATUT_LABELS[statut as Statut] ?? statut;
  return (
    <span className={`badge ${color}`}>{label}</span>
  );
}
