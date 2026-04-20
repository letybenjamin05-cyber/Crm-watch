import { type LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  color?: string;
  trend?: number;
}

export default function KpiCard({
  title,
  value,
  sub,
  icon: Icon,
  color = "text-gold-400",
  trend,
}: KpiCardProps) {
  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {sub && <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>}
        </div>
        <div className={`p-2 rounded-lg bg-zinc-800 ${color}`}>
          <Icon size={20} />
        </div>
      </div>
      {trend !== undefined && (
        <div className={`text-xs font-medium ${trend >= 0 ? "text-green-400" : "text-red-400"}`}>
          {trend >= 0 ? "+" : ""}
          {trend.toFixed(1)}% vs mois dernier
        </div>
      )}
    </div>
  );
}
