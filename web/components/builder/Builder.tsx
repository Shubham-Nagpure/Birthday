"use client";

import { useMemo, useState, type CSSProperties } from "react";
import type { PageId, PlanId, SiteContent, TemplateId } from "@/lib/types";
import { getTemplate } from "@/lib/templates";
import { computeAmount } from "@/lib/pricing";
import s from "./Builder.module.css";
import { TemplateStep } from "./TemplateStep";
import { PlanStep } from "./PlanStep";
import { FormStep } from "./FormStep";
import { ReviewStep } from "./ReviewStep";

export type Step = "template" | "plan" | "form" | "review";

export interface BuilderData {
  template: TemplateId;
  plan: PlanId;
  selected: PageId[];
  content: SiteContent;
}

export function Builder() {
  const [step, setStep] = useState<Step>("template");
  const [data, setData] = useState<BuilderData>({
    template: "romantic",
    plan: "basic",
    selected: ["intro", "story", "gallery", "letter"],
    content: {},
  });

  const t = getTemplate(data.template);
  const themeVars = {
    "--accent": t.accent, "--accent2": t.accent2, "--g1": t.g1, "--g2": t.g2,
  } as CSSProperties;

  const price = useMemo(() => computeAmount(data.plan, data.selected).rupees, [data.plan, data.selected]);

  const patch = (p: Partial<BuilderData>) => setData((d) => ({ ...d, ...p }));

  return (
    <div className={s.page} style={themeVars}>
      <header className={s.nav}>
        <a href="/" className={s.brand}><span>🎁</span> wishtoria</a>
        <a href="/" className={`${s.btn} ${s.btnGhost}`} style={{ padding: "0.55rem 1.1rem" }}>← Home</a>
      </header>

      {step === "template" && (
        <TemplateStep
          selected={data.template}
          onPick={(template) => {
            const tpl = getTemplate(template);
            const selected = data.plan === "free" ? tpl.pages.slice(0, 3) : [...tpl.pages];
            patch({ template, selected });
            setStep("plan");
          }}
        />
      )}

      {step === "plan" && (
        <PlanStep
          data={data}
          price={price}
          onChange={patch}
          onBack={() => setStep("template")}
          onContinue={() => setStep("form")}
        />
      )}

      {step === "form" && (
        <FormStep
          data={data}
          setContent={(content) => patch({ content })}
          onBack={() => setStep("plan")}
          onReview={() => setStep("review")}
        />
      )}

      {step === "review" && (
        <ReviewStep
          data={data}
          price={price}
          onBack={() => setStep("form")}
        />
      )}
    </div>
  );
}
