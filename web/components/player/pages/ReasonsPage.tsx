import type { SiteContent } from "@/lib/types";
import s from "../Player.module.css";

export function ReasonsPage({ content, onNext }: { content: SiteContent; onNext?: () => void }) {
  const reasons = (content.reasons || []).filter((r) => r && r.reason);
  return (
    <section className={s.pg}>
      <h2 className={s.title}>Reasons I Love You 💖</h2>
      <div className={s.reasons}>
        {reasons.length
          ? reasons.map((r, i) => (
              <div key={i} className={s.rcard} style={{ animationDelay: `${i * 0.1}s` }}>
                {r.reason}
              </div>
            ))
          : <p>No reasons added.</p>}
      </div>
      {onNext && <button className={s.btn} onClick={onNext}>Reveal the surprise →</button>}
    </section>
  );
}
