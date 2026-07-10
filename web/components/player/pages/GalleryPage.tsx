import { useState } from "react";
import type { SiteContent } from "@/lib/types";
import s from "../Player.module.css";

const isUrl = (u?: string) => !!u && /^https?:\/\//.test(u);

export function GalleryPage({ content, onNext }: { content: SiteContent; onNext?: () => void }) {
  const photos = (content.gallery || []).filter((g) => g && (g.photo || g.caption));
  const [i, setI] = useState(0);
  const move = (dir: number) => {
    if (!photos.length) return;
    setI((prev) => (prev + dir + photos.length) % photos.length);
  };
  const g = photos[i];

  return (
    <section className={s.pg}>
      <h2 className={s.title}>Our Memory Gallery 📸</h2>
      <div className={s.gallery}>
        {g ? (
          <div>
            {isUrl(g.photo) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className={s.slideImg} src={g.photo} alt={g.caption || ""} />
            ) : (
              <div className={`${s.slideImg} ${s.slidePh}`}>📷<span>{g.photo || "Photo"}</span></div>
            )}
            <div className={s.slideInfo}>
              <h3>{g.caption || ""}</h3>
              <p>{g.desc || ""}</p>
            </div>
          </div>
        ) : (
          <div className={s.slideInfo}><p>No photos added.</p></div>
        )}
        {photos.length > 1 && (
          <div className={s.galCtl}>
            <button className={s.gbtn} onClick={() => move(-1)} aria-label="Previous">‹</button>
            <button className={s.gbtn} onClick={() => move(1)} aria-label="Next">›</button>
          </div>
        )}
      </div>
      {onNext && <button className={s.btn} onClick={onNext}>Continue →</button>}
    </section>
  );
}
