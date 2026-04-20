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
} from "lucide-react";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/stock", icon: Package, label: "Stock" },
  { href: "/achats", icon: ShoppingCart, label: "Achats" },
  { href: "/ventes", icon: TrendingUp, label: "Ventes" },
  { href: "/statistiques", icon: BarChart3, label: "Statistiques" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile topbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => setOpen(true)}
          className="text-zinc-400 hover:text-white"
        >
          <Menu size={22} />
        </button>
        <div className="flex items-center gap-2">
          <Watch className="text-gold-400" size={20} />
          <span className="font-bold text-white text-base">WatchCRM</span>
        </div>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-zinc-900 border-r border-zinc-800 z-50 flex flex-col transform transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center">
              <Watch size={18} className="text-black" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">WatchCRM</div>
              <div className="text-xs text-zinc-500">Montres Vintage</div>
            </div>
          </div>
          <button
            className="md:hidden text-zinc-500 hover:text-white"
            onClick={() => setOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-gold-500/10 text-gold-400 border border-gold-500/20"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-zinc-800 text-xs text-zinc-600">
          v1.0 · WatchCRM
        </div>
      </aside>

      {/* Mobile spacer */}
      <div className="md:hidden h-14" />
    </>
  );
}
