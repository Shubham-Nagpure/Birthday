import type { SiteContent } from "@/lib/types";
import { orderedPages } from "@/lib/pages";
import type { BuilderData } from "./Builder";
import s from "./Builder.module.css";

type Content = SiteContent;

export function FormStep({
  data, setContent, onBack, onReview,
}: {
  data: BuilderData;
  setContent: (c: Content) => void;
  onBack: () => void;
  onReview: () => void;
}) {
  const c = data.content;
  const set = (key: keyof Content, value: unknown) => setContent({ ...c, [key]: value });

  // generic repeater helpers (gallery / quiz / reasons / ask)
  function getArr<T>(key: keyof Content): T[] {
    return (c[key] as T[] | undefined) ?? [];
  }
  function setArr(key: keyof Content, arr: unknown[]) { set(key, arr); }
  function addItem(key: keyof Content) { setArr(key, [...getArr(key), {}]); }
  function removeItem(key: keyof Content, i: number) {
    const arr = getArr<Record<string, unknown>>(key).slice();
    arr.splice(i, 1); setArr(key, arr);
  }
  function updateItem(key: keyof Content, i: number, field: string, value: unknown) {
    const arr = getArr<Record<string, unknown>>(key).slice();
    arr[i] = { ...(arr[i] ?? {}), [field]: value }; setArr(key, arr);
  }

  const text = (key: keyof Content, label: string, placeholder = "", hint?: string) => (
    <div className={s.field}>
      <label>{label} {hint && <span className={s.hint}>{hint}</span>}</label>
      <input className={s.input} value={(c[key] as string) ?? ""} placeholder={placeholder}
        onChange={(e) => set(key, e.target.value)} />
    </div>
  );
  const area = (key: keyof Content, label: string, placeholder = "") => (
    <div className={s.field}>
      <label>{label}</label>
      <textarea className={s.textarea} value={(c[key] as string) ?? ""} placeholder={placeholder}
        onChange={(e) => set(key, e.target.value)} />
    </div>
  );

  return (
    <div className={s.wizard}>
      <div className={s.head}>
        <span className={s.pill}>Step 3 of 3 · Add your details</span>
        <h1 className={s.title}>Fill in your story</h1>
        <p className={s.sub}>Only the pages you picked are shown. Everything is optional — the more you add, the more magical it feels. 💫</p>
      </div>

      {orderedPages(data.selected).map((p) => (
        <section key={p.id} className={s.section}>
          <div className={s.fsHead}><span style={{ fontSize: "1.6rem" }}>{p.ico}</span><h2 className={s.fsTitle}>{p.name}</h2></div>

          {p.id === "intro" && (<>
            <div className={s.row2}>{text("intro_name", "Their name", "e.g. Rajvi", "(shown big)")}{text("intro_greeting", "Greeting word", "Hey")}</div>
            {text("from_name", "Your name", "e.g. Shubham", "(from)")}
          </>)}

          {p.id === "ask" && (<>
            <p className={s.fsDesc}>Ask a question where the “No” button runs away — they can only say Yes! 💘</p>
            <div className={s.row2}>{text("ask_title", "Heading", "I have something to ask…")}{text("ask_message", "Message after Yes", "You made me the happiest! 🥰")}</div>
            <div className={s.row2}>{text("ask_yes", "“Yes” button", "Yes 💛")}{text("ask_no", "“No” button", "No")}</div>
            <label style={{ fontWeight: 600, display: "block", margin: "0.5rem 0" }}>Questions <span className={s.hint}>(they must say Yes — “No” dodges)</span></label>
            {getArr<{ q?: string }>("ask").map((item, i) => (
              <div key={i} className={s.repeatItem}>
                <span className={s.riNum}>Question {i + 1}</span>
                <button className={s.riRemove} onClick={() => removeItem("ask", i)}>×</button>
                <input className={s.input} value={item.q ?? ""} placeholder="Will you be my Valentine?"
                  onChange={(e) => updateItem("ask", i, "q", e.target.value)} />
              </div>
            ))}
            <button className={s.btnAdd} onClick={() => addItem("ask")}>＋ Add a question</button>
          </>)}

          {p.id === "story" && area("story_text", "Your story", "How you met, what makes them special…")}

          {p.id === "gallery" && (<>
            <p className={s.fsDesc}>Add photos with a caption and a note. Paste an image link.</p>
            {getArr<{ photo?: string; caption?: string; desc?: string }>("gallery").map((item, i) => (
              <div key={i} className={s.repeatItem}>
                <span className={s.riNum}>Photo {i + 1}</span>
                <button className={s.riRemove} onClick={() => removeItem("gallery", i)}>×</button>
                <div className={s.field}><input className={s.input} value={item.photo ?? ""} placeholder="https://… image link"
                  onChange={(e) => updateItem("gallery", i, "photo", e.target.value)} /></div>
                <div className={s.row2}>
                  <input className={s.input} value={item.caption ?? ""} placeholder="Caption"
                    onChange={(e) => updateItem("gallery", i, "caption", e.target.value)} />
                  <input className={s.input} value={item.desc ?? ""} placeholder="Short note"
                    onChange={(e) => updateItem("gallery", i, "desc", e.target.value)} />
                </div>
              </div>
            ))}
            <button className={s.btnAdd} onClick={() => addItem("gallery")}>＋ Add a photo</button>
          </>)}

          {p.id === "letter" && (<>
            <div className={s.row2}>{text("letter_salutation", "Salutation", "My love,")}{text("letter_signoff", "Sign off", "Always yours, Shubham")}</div>
            {area("letter_body", "Letter body", "Write from the heart…")}
          </>)}

          {p.id === "puzzle" && (<>
            {text("puzzle_photo", "Photo for the puzzle", "https://… image link")}
            {text("puzzle_sub", "Little hint / subtitle", "Slide the tiles to fix our photo 💕")}
          </>)}

          {p.id === "quiz" && (<>
            <p className={s.fsDesc}>Fun questions. Mark the correct answer with the dot.</p>
            {getArr<Record<string, string>>("quiz").map((item, i) => (
              <div key={i} className={s.repeatItem}>
                <span className={s.riNum}>Question {i + 1}</span>
                <button className={s.riRemove} onClick={() => removeItem("quiz", i)}>×</button>
                <div className={s.field}><input className={s.input} value={item.q ?? ""} placeholder="Where did we meet?"
                  onChange={(e) => updateItem("quiz", i, "q", e.target.value)} /></div>
                {[0, 1, 2, 3].map((n) => (
                  <div key={n} className={s.optRow}>
                    <input type="radio" name={`quizc_${i}`} checked={item.correct === String(n)}
                      onChange={() => updateItem("quiz", i, "correct", String(n))} />
                    <input className={s.input} value={item[`opt${n}`] ?? ""} placeholder={`Option ${n + 1}`}
                      onChange={(e) => updateItem("quiz", i, `opt${n}`, e.target.value)} />
                  </div>
                ))}
              </div>
            ))}
            <button className={s.btnAdd} onClick={() => addItem("quiz")}>＋ Add a question</button>
          </>)}

          {p.id === "reasons" && (<>
            <p className={s.fsDesc}>Each reason becomes its own card.</p>
            {getArr<{ reason?: string }>("reasons").map((item, i) => (
              <div key={i} className={s.repeatItem}>
                <span className={s.riNum}>Reason {i + 1}</span>
                <button className={s.riRemove} onClick={() => removeItem("reasons", i)}>×</button>
                <input className={s.input} value={item.reason ?? ""} placeholder="Because you make ordinary days magic."
                  onChange={(e) => updateItem("reasons", i, "reason", e.target.value)} />
              </div>
            ))}
            <button className={s.btnAdd} onClick={() => addItem("reasons")}>＋ Add a reason</button>
          </>)}

          {p.id === "finale" && (<>
            {text("finale_msg", "Final message", "Happy Birthday, my love! 🎉")}
            {text("finale_music", "Background music", "https://… audio link", "(optional)")}
          </>)}
        </section>
      ))}

      <div className={s.summaryBar}>
        <button className={`${s.btn} ${s.btnGhost}`} onClick={onBack}>← Back</button>
        <button className={`${s.btn} ${s.btnLg}`} onClick={onReview}>Review my surprise →</button>
      </div>
    </div>
  );
}
