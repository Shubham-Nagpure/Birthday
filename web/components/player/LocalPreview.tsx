"use client";

import { useEffect, useState } from "react";
import type { Site } from "@/lib/types";
import { Player } from "./Player";

/** Renders a builder preview stored in sessionStorage (no backend needed). */
export function LocalPreview() {
  const [site, setSite] = useState<Site | null>(null);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("wishtoria:preview");
      if (raw) setSite(JSON.parse(raw) as Site);
    } catch { /* ignore */ }
  }, []);

  if (!site) {
    return (
      <main style={{ maxWidth: 560, margin: "4rem auto", padding: "0 1.5rem", fontFamily: "Poppins, sans-serif", textAlign: "center" }}>
        <h1 style={{ fontFamily: "Fredoka, sans-serif" }}>No preview yet 👀</h1>
        <p style={{ color: "#6B5860" }}>Build a surprise and hit “Preview” to see it here.</p>
        <p><a href="/create" style={{ color: "#D6246E", fontWeight: 600 }}>Start building →</a></p>
      </main>
    );
  }
  return <Player site={site} />;
}
