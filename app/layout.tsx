import type { Metadata, Viewport } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import PwaRegister from "@/components/layout/PwaRegister";

export const metadata: Metadata = {
  title: "WatchCRM - Gestion Montres Vintage",
  description: "CRM/ERP pour la gestion de stock de montres vintage achat-revente",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WatchCRM",
  },
};

export const viewport: Viewport = {
  themeColor: "#f59e0b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-screen bg-zinc-950">
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-zinc-950 md:ml-64">
            <div className="p-4 md:p-6">{children}</div>
          </main>
        </div>
        <PwaRegister />
      </body>
    </html>
  );
}
