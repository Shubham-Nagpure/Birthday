import { useEffect, useMemo, useRef, useState } from "react";
import type { SiteContent } from "@/lib/types";
import s from "../Player.module.css";

/** Grapheme-aware split (handles Marathi/emoji), matching the original. */
function splitGraphemes(text: string): string[] {
  const Seg = (Intl as unknown as { Segmenter?: typeof Intl.Segmenter }).Segmenter;
  if (Seg) return Array.from(new Seg("mr", { granularity: "grapheme" }).segment(text), (x) => x.segment);
  return Array.from(text);
}

type Phase = "typing" | "typed" | "glow" | "zoom";

export function IntroPage({ content, onExit }: { content: SiteContent; onExit?: () => void }) {
  const greeting = content.intro_greeting || "Hey";
  const name = content.intro_name || "My Love";
  const gChars = useMemo(() => splitGraphemes(greeting), [greeting]);
  const nChars = useMemo(() => splitGraphemes(name), [name]);

  const [gCount, setGCount] = useState(0);
  const [nCount, setNCount] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const t = timers.current;
    const push = (fn: () => void, ms: number) => { t.push(setTimeout(fn, ms)); };
    const STEP = 160;

    // 700ms delay, type greeting, 400ms pause, type name, then "typed"
    push(() => {
      gChars.forEach((_, i) => push(() => setGCount(i + 1), i * STEP));
      const afterG = gChars.length * STEP + 400;
      push(() => {
        nChars.forEach((_, i) => push(() => setNCount(i + 1), i * STEP));
        push(() => setPhase("typed"), nChars.length * STEP + 100);
      }, afterG);
    }, 700);

    return () => { t.forEach(clearTimeout); t.length = 0; };
  }, [gChars, nChars]);

  const handleClick = () => {
    if (phase !== "typed") return;
    setPhase("glow");
    if (!onExit) return; // last page — just glow, nothing to advance to
    // glow → zoom → hand off to the Player, which covers the swap with a flash
    timers.current.push(setTimeout(() => setPhase("zoom"), 800));
    timers.current.push(setTimeout(() => onExit(), 1500));
  };

  const exiting = phase === "zoom";

  return (
    <section className={s.pg} onClick={handleClick} role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") handleClick(); }}>
      <div className={s.introContent}>
        <p className={`${s.greet} ${phase === "glow" || phase === "zoom" ? s.greetHide : ""}`}>
          {gChars.map((ch, i) => (
            <span key={i} className={`${s.char} ${i < gCount ? s.charVisible : ""}`}>
              {ch === " " ? " " : ch}
            </span>
          ))}
        </p>
        <h1 className={`${s.bigName} ${phase === "glow" || phase === "zoom" ? s.glow : ""} ${exiting ? s.zoom : ""}`}>
          {nChars.map((ch, i) => (
            <span key={i} className={`${s.char} ${i < nCount ? s.charVisible : ""}`}>
              {ch === " " ? " " : ch}
            </span>
          ))}
        </h1>
        {onExit && <p className={`${s.hint} ${phase === "typed" ? s.hintOn : ""}`}>tap anywhere to begin ✨</p>}
      </div>
    </section>
  );
}
