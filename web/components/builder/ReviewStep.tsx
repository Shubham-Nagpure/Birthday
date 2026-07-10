import { useEffect, useState } from "react";
import type { Site } from "@/lib/types";
import { orderedPages } from "@/lib/pages";
import { getTemplate } from "@/lib/templates";
import { CURRENCY_SYMBOL as CUR } from "@/lib/pricing";
import type { BuilderData } from "./Builder";
import s from "./Builder.module.css";

interface RazorpayCtor { new (opts: Record<string, unknown>): { open: () => void }; }
declare global { interface Window { Razorpay?: RazorpayCtor; } }

function loadScript(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve(true);
    const el = document.createElement("script");
    el.src = src; el.onload = () => resolve(true); el.onerror = () => resolve(false);
    document.body.appendChild(el);
  });
}

export function ReviewStep({ data, price, onBack }: { data: BuilderData; price: number; onBack: () => void }) {
  const c = data.content;
  const pages = orderedPages(data.selected);
  const tpl = getTemplate(data.template);
  const planName = data.plan === "premium" ? "Premium (all pages)" : data.plan === "free" ? "Simple (Free)" : "Basic";
  const totalTxt = data.plan === "free" ? "Free (ad-supported)" : CUR + price;

  const [hasBackend, setHasBackend] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [live, setLive] = useState<{ url: string; qr: string; published: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/config").then((r) => r.ok ? r.json() : Promise.reject()).then(() => setHasBackend(true)).catch(() => setHasBackend(false));
  }, []);

  const line = (label: string, val?: string) => (val ? <p className={s.rvline}><strong>{label}:</strong> {val}</p> : null);
  const payload = () => ({ plan: data.plan, template: data.template, pages: pages.map((p) => p.id), content: c, email });

  const localPreview = () => {
    const site: Site = { slug: "local", plan: data.plan, template: data.template, pages: pages.map((p) => p.id), content: c, preview: true };
    sessionStorage.setItem("wishtoria:preview", JSON.stringify(site));
    window.open("/s/local", "_blank");
  };

  const doPreview = async () => {
    if (!hasBackend) return localPreview();
    setStatus("Building preview…");
    try {
      const r = await fetch("/api/preview", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload()) });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || "Preview failed");
      const res = await r.json();
      setLive({ url: res.url, qr: res.qr, published: false });
      setStatus(null);
      window.open(res.url, "_blank");
    } catch (e) { setStatus((e as Error).message); }
  };

  const doPay = async () => {
    if (!hasBackend) { setStatus("Publishing needs the server running (DATABASE_URL + Razorpay). Use Preview to see it live."); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setStatus("Enter a valid email so we can send your link 💌"); return; }
    setStatus("Starting checkout…");
    try {
      const r = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload()) });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || "Could not start checkout");
      const order = await r.json();

      const finish = async (verifyBody: Record<string, unknown>) => {
        const v = await fetch("/api/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(verifyBody) });
        if (!v.ok) throw new Error((await v.json().catch(() => ({}))).error || "Verification failed");
        const res = await v.json();
        setLive({ url: res.url, qr: res.qr, published: true });
        setStatus(null);
      };

      if (order.free || order.testMode || !order.keyId) {
        setStatus(order.free ? "Building your free site…" : "Building your site (test mode)…");
        return finish({ razorpay_order_id: order.orderId });
      }

      const ok = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!ok || !window.Razorpay) throw new Error("Could not load payment gateway");
      const rzp = new window.Razorpay({
        key: order.keyId, amount: order.amount, currency: order.currency,
        name: "wishtoria", description: "Your personalized surprise website",
        order_id: order.orderId, prefill: { email }, theme: { color: tpl.accent },
        handler: (resp: Record<string, string>) => {
          finish({
            razorpay_order_id: resp.razorpay_order_id,
            razorpay_payment_id: resp.razorpay_payment_id,
            razorpay_signature: resp.razorpay_signature,
          }).catch((e) => setStatus((e as Error).message));
        },
      });
      rzp.open();
      setStatus(null);
    } catch (e) { setStatus((e as Error).message); }
  };

  return (
    <div className={s.wizard}>
      <div className={s.head}>
        <div style={{ fontSize: "3rem" }}>🎉</div>
        <h1 className={s.title}>Your surprise is ready!</h1>
        <p className={s.sub}>Preview it live, then publish. We&apos;ll send the private link to your email.</p>
      </div>

      <div className={s.reviewCard}>
        <div className={s.rblock}>
          <h3>🧾 Your plan</h3>
          <p className={s.rvline}><strong>Template:</strong> {tpl.emoji} {tpl.name}</p>
          <p className={s.rvline}><strong>Plan:</strong> {planName}</p>
          <p className={s.rvline}><strong>Pages:</strong> {pages.map((p) => p.name).join(", ")}</p>
          <p className={s.rvline}><strong>Total:</strong> {totalTxt}</p>
        </div>
        {pages.map((p) => {
          let body: React.ReactNode = null;
          if (p.id === "intro") body = <>{line("Their name", c.intro_name)}{line("From", c.from_name)}</>;
          else if (p.id === "ask") body = <>{line("Heading", c.ask_title)}{(c.ask || []).filter((a) => a.q).map((a, i) => <p key={i} className={s.rvline}><strong>Q{i + 1}:</strong> {a.q}</p>)}{line("After Yes", c.ask_message)}</>;
          else if (p.id === "story") body = c.story_text ? <p className={s.rvline}>{c.story_text.slice(0, 200)}…</p> : null;
          else if (p.id === "gallery") body = <>{(c.gallery || []).filter((g) => g.caption || g.photo).map((g, i) => <p key={i} className={s.rvline}><strong>Photo {i + 1}:</strong> {g.caption || "(no caption)"} {g.photo ? "📎" : ""}</p>)}</>;
          else if (p.id === "letter") body = <>{line("Salutation", c.letter_salutation)}{line("Sign off", c.letter_signoff)}</>;
          else if (p.id === "puzzle") body = <>{line("Photo", c.puzzle_photo)}{line("Hint", c.puzzle_sub)}</>;
          else if (p.id === "quiz") body = <>{(c.quiz || []).filter((q) => q.q).map((q, i) => <p key={i} className={s.rvline}><strong>Q{i + 1}:</strong> {q.q}</p>)}</>;
          else if (p.id === "reasons") body = <>{(c.reasons || []).filter((r) => r.reason).map((r, i) => <p key={i} className={s.rvline}><strong>{i + 1}.</strong> {r.reason}</p>)}</>;
          else if (p.id === "finale") body = line("Message", c.finale_msg);
          return <div key={p.id} className={s.rblock}><h3>{p.ico} {p.name}</h3>{body || <p className={s.rvline} style={{ fontStyle: "italic" }}>No details added yet.</p>}</div>;
        })}
      </div>

      <div className={s.field} style={{ maxWidth: 420, margin: "0 auto" }}>
        <label>Your email <span className={s.hint}>(we send your private link here)</span></label>
        <input className={s.input} type="email" value={email} placeholder="you@example.com" onChange={(e) => setEmail(e.target.value)} />
      </div>

      <div className={s.summaryBar}>
        <button className={`${s.btn} ${s.btnGhost}`} onClick={onBack}>← Edit</button>
        <button className={`${s.btn} ${s.btnGhost}`} onClick={doPreview}>👁 Preview</button>
        <button className={`${s.btn} ${s.btnLg}`} onClick={doPay}>✦ {data.plan === "free" ? "Create my free site" : "Pay & build"}</button>
      </div>

      {status && <div className={s.previewBox}><p className={s.rvline}>{status}</p></div>}

      {live && (
        <div className={s.previewBox}>
          <h3>{live.published ? "💌 Your surprise is live!" : "👀 Preview ready"}</h3>
          <div className={s.previewRow}>
            <img src={live.qr} alt="QR code" width={180} height={180} style={{ border: "2.5px solid var(--line)", borderRadius: 16 }} />
            <div style={{ textAlign: "left" }}>
              <a className={s.siteLink} href={live.url} target="_blank" rel="noopener">{live.url}</a>
              <div style={{ marginTop: "0.8rem", display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                <a className={s.btn} href={live.url} target="_blank" rel="noopener">Open ↗</a>
                <button className={`${s.btn} ${s.btnGhost}`} onClick={() => navigator.clipboard.writeText(live.url)}>📋 Copy link</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
