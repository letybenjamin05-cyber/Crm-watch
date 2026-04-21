"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body style={{ background: "#0f0f0f", color: "#f5f0e8", fontFamily: "sans-serif", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", margin: 0 }}>
        <div style={{ textAlign: "center", padding: "2rem", maxWidth: "500px" }}>
          <h2 style={{ color: "#ef4444", marginBottom: "1rem" }}>Erreur critique</h2>
          <p style={{ color: "#a1a1aa", fontSize: "0.875rem", marginBottom: "0.5rem" }}>{error.message}</p>
          {error.digest && (
            <p style={{ color: "#52525b", fontSize: "0.75rem", fontFamily: "monospace" }}>
              {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{ marginTop: "1.5rem", background: "#f59e0b", color: "#000", border: "none", padding: "0.5rem 1.5rem", borderRadius: "0.5rem", cursor: "pointer", fontWeight: "600" }}
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}
