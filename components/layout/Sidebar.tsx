"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  TrendingUp,
  BarChart3,
  Watch,
  Menu,
  X,
  Users,
  Receipt,
} from "lucide-react";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/stock", icon: Package, label: "Stock" },
  { href: "/achats", icon: ShoppingCart, label: "Achats" },
  { href: "/ventes", icon: TrendingUp, label: "Ventes" },
  { href: "/clients", icon: Users, label: "Clients" },
  { href: "/statistiques", icon: BarChart3, label: "Statistiques" },
  { href: "/fiscal", icon: Receipt, label: "Fiscal" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile topbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center gap-3">
        <button onClick={() => setOpen(true)} className="text-zinc-400 hover:text-white">
          <Menu size={22} />
        </button>
        <div className="flex items-center gap-2">
          <Watch className="text-yellow-400" size={20} />
          <span className="font-bold text-white text-base">WatchCRM</span>
        </div>
      </div>

      {open && (
        <div className="md:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setOpen(false)} />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-zinc-900 border-r border-zinc-800 z-50 flex flex-col transform transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Watch size={18} className="text-black" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">WatchCRM</div>
              <div className="text-xs text-zinc-500">Montres Vintage</div>
            </div>
          </div>
          <button className="md:hidden text-zinc-500 hover:text-white" onClick={() => setOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-5 py-4 border-t border-zinc-800 text-xs text-zinc-600">
          v2.0 · WatchCRM
        </div>
      </aside>

      <div className="md:hidden h-14" />
    </>
  );
}
