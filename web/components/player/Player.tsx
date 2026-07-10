"use client";

import { useCallback, useRef, useState, type CSSProperties } from "react";
import type { PageId, Site } from "@/lib/types";
import { getTemplate } from "@/lib/templates";
import { orderedPages } from "@/lib/pages";
import { launchConfetti } from "./confetti";
import { Particles } from "./Particles";
import s from "./Player.module.css";

import { IntroPage } from "./pages/IntroPage";
import { AskPage } from "./pages/AskPage";
import { StoryPage } from "./pages/StoryPage";
import { GalleryPage } from "./pages/GalleryPage";
import { LetterPage } from "./pages/LetterPage";
import { PuzzlePage } from "./pages/PuzzlePage";
import { QuizPage } from "./pages/QuizPage";
import { ReasonsPage } from "./pages/ReasonsPage";
import { FinalePage } from "./pages/FinalePage";

export function Player({ site }: { site: Site }) {
  const t = getTemplate(site.template);
  const flow = orderedPages(site.pages).map((p) => p.id);
  const [idx, setIdx] = useState(0);
  const [flashOn, setFlashOn] = useState(false);
  const confettiRef = useRef<HTMLCanvasElement | null>(null);

  const next = useCallback(() => setIdx((i) => Math.min(i + 1, flow.length - 1)), [flow.length]);
  const celebrate = useCallback(() => {
    if (confettiRef.current) launchConfetti(confettiRef.current);
  }, []);

  // Cinematic exit for the intro: white flash rises, page swaps behind it, flash fades out.
  const cinematicNext = useCallback(() => {
    setFlashOn(true);                                   // white fades in (0.4s)
    window.setTimeout(() => next(), 700);               // swap page behind the white
    window.setTimeout(() => setFlashOn(false), 1150);   // fade white out to reveal it
  }, [next]);

  const current: PageId = flow[idx];
  const isLast = idx === flow.length - 1;
  const onNext = isLast ? undefined : next;
  const c = site.content;

  const themeVars = {
    "--accent": t.accent, "--accent2": t.accent2, "--g1": t.g1, "--g2": t.g2,
  } as CSSProperties;

  return (
    <div className={s.root} style={themeVars}>
      {site.preview && <div className={s.ribbon}>👀 Preview — not published yet</div>}
      <Particles heartColor={t.accent2} />
      <canvas ref={confettiRef} className={s.confetti} />
      <div className={`${s.flash} ${flashOn ? s.flashOn : ""}`} />
      <main className={s.app}>
        {current === "intro" && <IntroPage content={c} onExit={isLast ? undefined : cinematicNext} />}
        {current === "ask" && <AskPage content={c} onNext={onNext} isLast={isLast} celebrate={celebrate} />}
        {current === "story" && <StoryPage content={c} onNext={onNext} />}
        {current === "gallery" && <GalleryPage content={c} onNext={onNext} />}
        {current === "letter" && <LetterPage content={c} onNext={onNext} />}
        {current === "puzzle" && <PuzzlePage content={c} onNext={onNext} />}
        {current === "quiz" && <QuizPage content={c} onNext={onNext} />}
        {current === "reasons" && <ReasonsPage content={c} onNext={onNext} />}
        {current === "finale" && <FinalePage content={c} celebrate={celebrate} />}
      </main>
      {site.plan === "free" && !site.preview && (
        <a className={s.badge} href="/" target="_blank" rel="noopener">Made with 🎁 wishtoria</a>
      )}
    </div>
  );
}
