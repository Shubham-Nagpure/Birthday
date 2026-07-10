import { useEffect, useMemo, useRef, useState } from "react";
import type { SiteContent } from "@/lib/types";
import s from "../Player.module.css";

export function StoryPage({ content, onNext }: { content: SiteContent; onNext?: () => void }) {
  const text = content.story_text || "";
  const chars = useMemo(() => Array.from(text), [text]);
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (!chars.length) { setDone(true); return; }
    const t = timers.current;
    // 700ms beat, then reveal a char every 18ms (matches the original)
    t.push(setTimeout(() => {
      chars.forEach((_, i) => t.push(setTimeout(() => {
        setCount(i + 1);
        if (i + 1 === chars.length) setDone(true);
      }, i * 18)));
    }, 700));
    return () => { t.forEach(clearTimeout); t.length = 0; };
  }, [chars]);

  // follow the typing cursor while typing; stop once done so the reader can scroll freely
  useEffect(() => {
    if (done) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [count, done]);

  return (
    <section className={s.storyPg}>
      <h2 className={s.storyTitle}>Do You Know ❤️</h2>
      <div className={s.storyScroll} ref={scrollRef}>
        <p className={s.storyText}>
          {chars.slice(0, count).map((ch, i) => (
            <span key={i} className={s.schar}>{ch}</span>
          ))}
        </p>
      </div>
      {done && onNext && (
        <div className={s.storyBtnWrap}>
          <button className={s.btn} onClick={onNext}>Ready for more →</button>
        </div>
      )}
    </section>
  );
}
