"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 text-2xl">
        ⚠
      </div>
      <h2 className="text-xl font-bold text-white">Une erreur est survenue</h2>
      <p className="text-zinc-400 text-sm max-w-md">{error.message}</p>
      {error.digest && (
        <p className="text-zinc-600 text-xs font-mono">Digest: {error.digest}</p>
      )}
      <button onClick={reset} className="btn-primary mt-2">
        Réessayer
      </button>
    </div>
  );
}
