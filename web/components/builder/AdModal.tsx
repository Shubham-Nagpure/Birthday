import { useEffect, useState } from "react";
import s from "./Builder.module.css";

export function AdModal({ onDone, onUpgrade }: { onDone: () => void; onUpgrade: () => void }) {
  const [n, setN] = useState(5);
  useEffect(() => {
    if (n <= 0) return;
    const id = setTimeout(() => setN((v) => v - 1), 1000);
    return () => clearTimeout(id);
  }, [n]);

  return (
    <div className={s.adOverlay}>
      <div className={s.adModal}>
        <p className={s.adLabel}>Advertisement · your free surprise loads after this</p>
        {/* Paste a Google AdSense unit here in production (see SETUP.md). */}
        <div className={s.adSlot} id="ad-slot">
          <span style={{ fontSize: "2.6rem" }}>🎬</span>
          <strong>Your ad could be here</strong>
          <span style={{ fontFamily: "Poppins, sans-serif", color: "var(--ink-soft)", fontSize: "0.9rem" }}>
            Free surprises are supported by a short ad.
          </span>
        </div>
        <button className={`${s.btn} ${s.btnBlock}`} disabled={n > 0} onClick={onDone}>
          {n > 0 ? `Continue in ${n}s…` : "Continue to your surprise →"}
        </button>
        <button className={s.adUpgrade} onClick={onUpgrade}>Skip ads — upgrade to a paid plan</button>
      </div>
    </div>
  );
}
