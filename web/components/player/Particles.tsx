"use client";

import { useEffect, useRef } from "react";
import s from "./Player.module.css";

/** Floating hearts + gold sparkles drifting upward — ported from the original. */
export function Particles({ heartColor = "#FF4F8B" }: { heartColor?: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    type P = { x: number; y: number; size: number; sy: number; sx: number; alpha: number; heart: boolean; angle: number; spin: number };
    const make = (initial: boolean): P => ({
      x: Math.random() * canvas.width,
      y: initial ? Math.random() * canvas.height : canvas.height + 20,
      size: Math.random() * 8 + 4,
      sy: Math.random() * 0.8 + 0.3,
      sx: Math.sin(Math.random() * 2) * 0.3,
      alpha: Math.random() * 0.5 + 0.2,
      heart: Math.random() > 0.4,
      angle: Math.random() * Math.PI,
      spin: Math.random() * 0.02 - 0.01,
    });

    const ps: P[] = Array.from({ length: 45 }, () => make(true));
    let raf = 0;

    const frame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of ps) {
        p.y -= p.sy; p.x += p.sx; p.angle += p.spin;
        if (p.y < -20 || p.x < -20 || p.x > canvas.width + 20) Object.assign(p, make(false));
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        if (p.heart) {
          const d = p.size;
          ctx.fillStyle = heartColor;
          ctx.beginPath();
          ctx.moveTo(0, d / 4);
          ctx.quadraticCurveTo(0, 0, d / 2, 0);
          ctx.quadraticCurveTo(d, 0, d, d / 4);
          ctx.quadraticCurveTo(d, d / 2, d / 2, d * 0.75);
          ctx.quadraticCurveTo(0, d / 2, 0, d / 4);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillStyle = "#FFD166";
          ctx.shadowBlur = 8;
          ctx.shadowColor = "#FFD166";
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      raf = requestAnimationFrame(frame);
    };
    frame();

    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(raf); };
  }, [heartColor]);

  return <canvas ref={ref} className={s.particles} aria-hidden />;
}
