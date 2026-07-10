import Link from "next/link";
import { PAGES } from "@/lib/pages";
import s from "./Landing.module.css";

const INSTA = "https://www.instagram.com/wishtoria.in/";

export function Landing() {
  return (
    <div className={s.page}>
      <header className={s.nav}>
        <span className={s.brand}>🎁 wishtoria</span>
        <nav className={s.navLinks}>
          <a href="#how">How it works</a>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#about">About</a>
        </nav>
        <Link href="/create" className={s.btn}>Create Today</Link>
      </header>

      <section className={s.hero}>
        <div>
          <span className={s.pill}>✨ A gift they open in a browser</span>
          <h1 className={s.heroTitle}>Gift a <span className={s.grad}>surprise website</span> for someone you love.</h1>
          <p className={s.heroSub}>Birthday, anniversary, or just because — a personalized, animated journey with their name, your story, a letter, a gallery, a quiz and a confetti finale. Pick a template, fill in your words, share the link or a QR. No code.</p>
          <div className={s.heroCta}>
            <Link href="/create" className={`${s.btn} ${s.btnLg}`}>✦ Create Today →</Link>
            <Link href="/s/demo-valentine" className={`${s.btn} ${s.btnGhost}`} target="_blank">See a live demo</Link>
          </div>
          <div className={s.heroTrust}>
            <span>❤️ 2,400+ surprises made</span>
            <span>⭐ 4.9 / 5</span>
            <span>⚡ Ready in minutes</span>
          </div>
        </div>
        <div className={s.stack} aria-hidden>
          <div className={s.fcard} style={{ top: "8%", left: "6%", background: "#FFF0F5" }}>📖 Your Story</div>
          <div className={s.fcard} style={{ top: "34%", right: "2%", background: "#FFF9E6" }}>📸 Gallery</div>
          <div className={s.fcard} style={{ top: "58%", left: "12%", background: "#F3F0FF" }}>💘 Will you?</div>
          <div className={s.fcard} style={{ top: "78%", right: "8%", background: "#E9FBF3" }}>🎁 Finale</div>
        </div>
      </section>

      <section id="how" className={s.band}>
        <h2 className={s.bandTitle}>How it works</h2>
        <div className={s.grid}>
          <div className={s.card}><span className={s.ico}>1️⃣</span><h3>Pick a template</h3><p>Romantic, birthday, valentine, sorry and more — each with its own vibe.</p></div>
          <div className={s.card}><span className={s.ico}>2️⃣</span><h3>Fill in your love</h3><p>Their name, your story, a letter, photos, a quiz, reasons — as many pages as you want.</p></div>
          <div className={s.card}><span className={s.ico}>3️⃣</span><h3>Share the magic</h3><p>Get a private link and a QR code to share with your special someone.</p></div>
        </div>
      </section>

      <section id="features" className={`${s.band} ${s.bandAlt}`}>
        <div className={s.bandInner}>
          <h2 className={s.bandTitle}>Every page, made personal</h2>
          <div className={s.grid}>
            {PAGES.map((p) => (
              <div key={p.id} className={s.card}><span className={s.ico}>{p.ico}</span><h3>{p.name}</h3><p>{p.desc}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className={s.band}>
        <h2 className={s.bandTitle}>Simple, sweet pricing</h2>
        <p className={s.bandSub}>Start free, upgrade any time.</p>
        <div className={s.prices}>
          <div className={s.price}>
            <h3 className={s.priceName}>Simple</h3>
            <div className={s.priceTag}>Free<span>/site</span></div>
            <ul className={s.feats}><li>✓ Up to 3 pages</li><li>✓ One short ad</li><li>✓ “Made with wishtoria” badge</li><li>✓ Link + QR</li></ul>
            <Link href="/create" className={`${s.btn} ${s.btnBlock}`}>Start free</Link>
          </div>
          <div className={`${s.price} ${s.priceFeat}`}>
            <h3 className={s.priceName}>Basic</h3>
            <div className={s.priceTag}>₹1499<span>/site</span></div>
            <ul className={s.feats}><li>✓ Up to 4 pages</li><li>✓ No ads, no badge</li><li>✓ Extra pages ₹399 each</li><li>✓ Private link + QR</li></ul>
            <Link href="/create" className={`${s.btn} ${s.btnBlock}`}>Choose Basic</Link>
          </div>
          <div className={s.price}>
            <h3 className={s.priceName}>Premium</h3>
            <div className={s.priceTag}>₹2999<span>/site</span></div>
            <ul className={s.feats}><li>✓ All pages included</li><li>✓ Background music</li><li>✓ Custom domain</li><li>✓ Everything unlocked</li></ul>
            <Link href="/create" className={`${s.btn} ${s.btnBlock}`}>Choose Premium</Link>
          </div>
        </div>
      </section>

      <section id="about" className={`${s.band} ${s.bandAlt}`}>
        <div className={s.bandInner}>
          <h2 className={s.bandTitle}>About us</h2>
          <div className={s.about}>
            <p className={s.aboutText}>wishtoria is a tiny studio with one big goal: help you turn a simple “I was thinking of you” into a website they'll never forget. Every template and detail is crafted so anyone — no coding — can gift a moment that feels personal and magical. 💛</p>
            <a className={s.insta} href={INSTA} target="_blank" rel="noopener">📸 @wishtoria.in on Instagram</a>
          </div>
        </div>
      </section>

      <section className={s.ctaFinal}>
        <h2>Ready to make them smile?</h2>
        <p>It only takes a few minutes to create something they'll never forget.</p>
        <Link href="/create" className={`${s.btn} ${s.btnLg}`}>✦ Create Today →</Link>
      </section>

      <footer className={s.footer}>
        <span style={{ fontFamily: "Fredoka, sans-serif", fontWeight: 700, color: "var(--ink)" }}>🎁 wishtoria</span>
        <span><a href={INSTA} target="_blank" rel="noopener" style={{ color: "var(--accent)", fontWeight: 600 }}>📸 Instagram</a> · Made for the ones who love out loud.</span>
      </footer>
    </div>
  );
}
