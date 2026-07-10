import type { TemplateId } from "@/lib/types";
import { TEMPLATES } from "@/lib/templates";
import s from "./Builder.module.css";

export function TemplateStep({
  selected, onPick,
}: { selected: TemplateId; onPick: (id: TemplateId) => void }) {
  return (
    <div className={s.wizard}>
      <div className={s.head}>
        <span className={s.pill}>Step 1 of 3 · Pick a template</span>
        <h1 className={s.title}>Choose a vibe</h1>
        <p className={s.sub}>Each template sets the colours, mood and a starter set of pages. You can tweak everything next.</p>
      </div>
      <div className={s.tplGrid}>
        {TEMPLATES.map((t) => (
          <div
            key={t.id}
            className={s.tplCard}
            onClick={() => onPick(t.id)}
            style={selected === t.id ? { outline: `3px solid ${t.accent}` } : undefined}
          >
            <div className={s.tplPreview} style={{ background: `linear-gradient(135deg, ${t.g1}, ${t.g2})` }}>{t.emoji}</div>
            <div className={s.tplBody}>
              <div className={s.tplName} style={{ color: t.accent }}>{t.name}</div>
              <div className={s.tplTag}>{t.tag}</div>
              <div className={s.tplPages}>{t.pages.length} starter pages</div>
              <button className={`${s.btn} ${s.btnBlock}`} style={{ background: t.accent, marginTop: "1rem" }}>
                Use {t.name} →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
