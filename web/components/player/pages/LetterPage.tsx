import { useState } from "react";
import type { SiteContent } from "@/lib/types";
import s from "../Player.module.css";

export function LetterPage({ content, onNext }: { content: SiteContent; onNext?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <section className={s.pg}>
      <h2 className={s.title}>A Letter for You ✉️</h2>
      <div className={s.envelope} onClick={() => setOpen(true)}>
        <div className={`${s.paper} ${open ? s.paperOpen : ""}`}>
          <p className={s.salu}>{content.letter_salutation || "My Love,"}</p>
          <div className={s.body}>{content.letter_body || ""}</div>
          <p className={s.valed}>{content.letter_signoff || ""}</p>
        </div>
      </div>
      {!open && <p className={s.tip}>Tap the envelope to open it ✨</p>}
      {open && onNext && <button className={s.btn} onClick={onNext}>Continue →</button>}
    </section>
  );
}
