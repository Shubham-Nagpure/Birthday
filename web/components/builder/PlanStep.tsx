import { useState } from "react";
import type { PageId, PlanId } from "@/lib/types";
import { PAGES } from "@/lib/pages";
import { PRICING, CURRENCY_SYMBOL as CUR } from "@/lib/pricing";
import type { BuilderData } from "./Builder";
import { AdModal } from "./AdModal";
import s from "./Builder.module.css";

const FREE_MAX = PRICING.freeMaxPages;

export function PlanStep({
  data, price, onChange, onBack, onContinue,
}: {
  data: BuilderData;
  price: number;
  onChange: (p: Partial<BuilderData>) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const [showAd, setShowAd] = useState(false);
  const { plan, selected } = data;

  const setPlan = (p: PlanId) => {
    let sel = selected;
    if (p === "premium") sel = PAGES.map((x) => x.id);
    if (p === "free" && selected.length > FREE_MAX) sel = selected.slice(0, FREE_MAX);
    onChange({ plan: p, selected: sel });
  };

  const toggle = (id: PageId) => {
    if (plan === "premium") return;
    if (selected.includes(id)) onChange({ selected: selected.filter((x) => x !== id) });
    else {
      if (plan === "free" && selected.length >= FREE_MAX) { alert(`Free includes up to ${FREE_MAX} pages. Upgrade to add more 💛`); return; }
      onChange({ selected: [...selected, id] });
    }
  };

  const blurb =
    plan === "free" ? `Free forever — pick up to ${FREE_MAX} pages. Watch one short ad, and your site gets a small "Made with wishtoria" badge.`
    : plan === "premium" ? `All ${PAGES.length} pages included, plus background music and custom-domain support.`
    : `Basic includes any ${PRICING.basicIncluded} pages. Extra pages are ${CUR}${PRICING.addonPage} each. No ads, no badge.`;

  const proceed = () => {
    if (!selected.length) { alert("Pick at least one page 💕"); return; }
    if (plan === "free") setShowAd(true);
    else onContinue();
  };

  return (
    <div className={s.wizard}>
      <div className={s.head}>
        <span className={s.pill}>Step 2 of 3 · Choose your plan</span>
        <h1 className={s.title}>Build your surprise</h1>
        <p className={s.sub}>{blurb}</p>
      </div>

      <div className={s.planToggle}>
        <button className={`${s.planPill} ${plan === "free" ? s.planActive : ""}`} onClick={() => setPlan("free")}>Simple · Free 🎬</button>
        <button className={`${s.planPill} ${plan === "basic" ? s.planActive : ""}`} onClick={() => setPlan("basic")}>Basic · {CUR}1499</button>
        <button className={`${s.planPill} ${plan === "premium" ? s.planActive : ""}`} onClick={() => setPlan("premium")}>Premium · {CUR}2999</button>
      </div>

      <div className={s.picker}>
        {PAGES.map((p) => {
          const on = selected.includes(p.id);
          const atCap = plan === "free" && selected.length >= FREE_MAX;
          const locked = plan === "premium" || (plan === "free" && !on && atCap);
          const tag =
            plan === "premium" ? <span className={`${s.ptag} ${s.ptagIncl}`}>Included</span>
            : plan === "free" ? <span className={`${s.ptag} ${s.ptagIncl}`}>Free</span>
            : p.core ? <span className={`${s.ptag} ${s.ptagIncl}`}>Basic page</span>
            : <span className={s.ptag}>+ {CUR}{PRICING.addonPage} add-on</span>;
          return (
            <div key={p.id} className={`${s.pcard} ${on ? s.pcardOn : ""} ${locked ? s.pcardLocked : ""}`} onClick={() => toggle(p.id)}>
              <div className={s.pcheck}>{on ? "✓" : ""}</div>
              <span className={s.pico}>{p.ico}</span>
              <div className={s.pname}>{p.name}</div>
              <div className={s.pdesc}>{p.desc}</div>
              {tag}
            </div>
          );
        })}
      </div>

      <div className={s.summaryBar}>
        <button className={`${s.btn} ${s.btnGhost}`} onClick={onBack}>← Back</button>
        <div className={s.summaryInfo}>
          <span className={s.summaryCount}>{selected.length} page{selected.length === 1 ? "" : "s"}{plan === "free" ? ` · up to ${FREE_MAX} on Free` : ""}</span>
          <span className={s.summaryTotal}>{plan === "free" ? "Free" : CUR + price}</span>
        </div>
        <button className={`${s.btn} ${s.btnLg}`} onClick={proceed}>
          {plan === "free" ? "Watch ad & continue 🎬" : "Continue to details →"}
        </button>
      </div>

      {showAd && <AdModal onDone={() => { setShowAd(false); onContinue(); }} onUpgrade={() => { setShowAd(false); setPlan("basic"); }} />}
    </div>
  );
}
