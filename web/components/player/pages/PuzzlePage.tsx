import { useMemo, useState } from "react";
import type { SiteContent } from "@/lib/types";
import s from "../Player.module.css";

const EMPTY = 8;

function shuffled(): number[] {
  const order = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  for (let step = 0; step < 60; step++) {
    const e = order.indexOf(EMPTY);
    const opts = [e - 1, e + 1, e - 3, e + 3].filter(
      (x) => x >= 0 && x < 9 && !(x === e - 1 && e % 3 === 0) && !(x === e + 1 && e % 3 === 2)
    );
    const pick = opts[step % opts.length];
    [order[e], order[pick]] = [order[pick], order[e]];
  }
  return order;
}

export function PuzzlePage({ content, onNext }: { content: SiteContent; onNext?: () => void }) {
  const img = /^https?:\/\//.test(content.puzzle_photo || "") ? content.puzzle_photo : "";
  const [order, setOrder] = useState<number[]>(() => shuffled());
  const [moves, setMoves] = useState(0);

  const move = (idx: number) => {
    const e = order.indexOf(EMPTY);
    const r = Math.floor(idx / 3), c = idx % 3, er = Math.floor(e / 3), ec = e % 3;
    if (Math.abs(r - er) + Math.abs(c - ec) === 1) {
      const next = order.slice();
      next[e] = next[idx]; next[idx] = EMPTY;
      setOrder(next);
      setMoves((m) => m + 1);
    }
  };

  const solved = useMemo(() => order.every((v, i) => v === i), [order]);

  return (
    <section className={s.pg}>
      <h2 className={s.title}>Piece Us Together 🧩</h2>
      <p className={s.sub}>{content.puzzle_sub || "Slide the tiles to fix our photo 💕"}</p>
      <div className={s.puzzle}>
        {order.map((v, idx) => (
          <div
            key={idx}
            className={`${s.tile} ${v === EMPTY ? s.tileEmpty : ""}`}
            onClick={() => move(idx)}
            style={
              v !== EMPTY && img
                ? { backgroundImage: `url(${img})`, backgroundPosition: `${-(v % 3) * 97}px ${-Math.floor(v / 3) * 97}px` }
                : undefined
            }
          >
            {v !== EMPTY && !img ? v + 1 : ""}
          </div>
        ))}
      </div>
      <p className={s.moves}>Moves: {moves}{solved ? " · solved! 🎉" : ""}</p>
      {onNext && <button className={s.btn} onClick={onNext}>Continue →</button>}
    </section>
  );
}
