import { useMemo, useRef, useState } from "react";
import type { SiteContent } from "@/lib/types";
import s from "../Player.module.css";

export function AskPage({
  content, onNext, isLast, celebrate,
}: { content: SiteContent; onNext?: () => void; isLast: boolean; celebrate: () => void }) {
  const questions = useMemo(() => {
    const qs = (content.ask || []).filter((a) => a && a.q).map((a) => a.q as string);
    return qs.length ? qs : ["Will you?"];
  }, [content.ask]);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const noRef = useRef<HTMLButtonElement | null>(null);

  const [ai, setAi] = useState(0);
  const [scale, setScale] = useState(1);
  const [noPos, setNoPos] = useState<{ left: number; top: number } | null>(null);
  const [done, setDone] = useState(false);

  const dodge = () => {
    const stage = stageRef.current, noEl = noRef.current;
    if (!stage || !noEl) return;
    const sr = stage.getBoundingClientRect();
    const nr = noEl.getBoundingClientRect();
    const maxX = Math.max(0, sr.width - nr.width);
    const maxY = Math.max(0, sr.height - nr.height);
    setNoPos({ left: Math.random() * maxX, top: Math.random() * maxY });
    setScale((v) => Math.max(0.45, v - 0.07));
  };

  const yes = () => {
    if (ai + 1 < questions.length) {
      setAi(ai + 1);
      setScale(1);
      setNoPos(null);
    } else {
      setDone(true);
      celebrate();
    }
  };

  if (done) {
    return (
      <section className={s.pg}>
        <h1 className={s.finaleMsg}>{content.ask_message || "Yayy! 🥰"}</h1>
        {!isLast && onNext && <button className={s.btn} onClick={onNext}>Continue →</button>}
      </section>
    );
  }

  return (
    <section className={s.pg}>
      <h2 className={s.title}>{content.ask_title || "I have something to ask…"}</h2>
      <div className={s.askStage} ref={stageRef}>
        <h3 className={s.askQ}>{questions[ai]}</h3>
        <div className={s.askBtns}>
          <button
            className={`${s.btn} ${s.askYes}`}
            style={{ transform: `scale(${1 + (1 - scale) * 0.9})` }}
            onClick={yes}
          >
            {content.ask_yes || "Yes 💛"}
          </button>
          <button
            className={s.askNo}
            ref={noRef}
            style={
              noPos
                ? { position: "absolute", left: noPos.left, top: noPos.top, transform: `scale(${scale})` }
                : { transform: `scale(${scale})` }
            }
            onMouseOver={dodge}
            onMouseDown={(e) => { e.preventDefault(); dodge(); }}
            onClick={(e) => { e.preventDefault(); dodge(); }}
            onTouchStart={(e) => { e.preventDefault(); dodge(); }}
          >
            {content.ask_no || "No"}
          </button>
        </div>
      </div>
    </section>
  );
}
