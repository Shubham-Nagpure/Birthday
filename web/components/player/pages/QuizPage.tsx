import { useState } from "react";
import type { SiteContent } from "@/lib/types";
import s from "../Player.module.css";

export function QuizPage({ content, onNext }: { content: SiteContent; onNext?: () => void }) {
  const quiz = (content.quiz || []).filter((q) => q && q.q);
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  if (!quiz.length) {
    return (
      <section className={s.pg}>
        <div className={s.card}><h2 className={s.title}>How Well Do You Know Us? 💭</h2><p>No questions added.</p>
        {onNext && <button className={s.btn} onClick={onNext}>Continue →</button>}</div>
      </section>
    );
  }

  if (qi >= quiz.length) {
    return (
      <section className={s.pg}>
        <div className={s.card}>
          <h3 className={s.qText}>Yayy! 🎉</h3>
          {onNext && <button className={s.btn} onClick={onNext}>Continue →</button>}
        </div>
      </section>
    );
  }

  const q = quiz[qi];
  const correct = Number(q.correct);
  const opts = [q.opt0, q.opt1, q.opt2, q.opt3].filter((x): x is string => !!x);

  const choose = (n: number) => {
    if (picked !== null) return;
    setPicked(n);
    setTimeout(() => { setPicked(null); setQi((v) => v + 1); }, 900);
  };

  return (
    <section className={s.pg}>
      <div className={s.card}>
        <h2 className={s.title}>How Well Do You Know Us? 💭</h2>
        <p className={s.qNum}>Question {qi + 1} of {quiz.length}</p>
        <h3 className={s.qText}>{q.q}</h3>
        {opts.map((o, n) => {
          let cls = s.qOpt;
          if (picked !== null) {
            if (n === correct) cls += " " + s.qRight;
            else if (n === picked) cls += " " + s.qWrong;
          }
          return <button key={n} className={cls} onClick={() => choose(n)}>{o}</button>;
        })}
      </div>
    </section>
  );
}
