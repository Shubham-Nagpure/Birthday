/* ===========================================================
   wishtoria builder — landing → template → plan → form → review
   =========================================================== */
(function () {
    "use strict";

    /* ---- Page catalog (mirrors the live demo site's sections) ---- */
    const PAGES = [
        { id: "intro",   ico: "🌟", name: "Name Intro",        desc: "A typewriter greeting that spells out their name with a glow.", core: true },
        { id: "ask",     ico: "💘", name: "Will You? (No runs away)", desc: "Ask a sweet question — the “No” button dodges, so they can only say Yes! Ends with your message." },
        { id: "story",   ico: "📖", name: "Do You Know",       desc: "Your story, revealed line by line — how you met, why they're special.", core: true },
        { id: "gallery", ico: "📸", name: "Memory Gallery",    desc: "A swipeable slideshow of your favourite photos with captions.", core: true },
        { id: "letter",  ico: "✉️", name: "Love Letter",       desc: "A sealed envelope that opens to your heartfelt message.", core: true },
        { id: "puzzle",  ico: "🧩", name: "Sliding Puzzle",    desc: "A playful photo puzzle they slide into place to unlock the next step." },
        { id: "quiz",    ico: "💭", name: "Quiz",              desc: "Fun questions about the two of you, with instant feedback." },
        { id: "reasons", ico: "💖", name: "Reasons I Love You", desc: "A folder that fans open into cards, one reason on each." },
        { id: "finale",  ico: "🎁", name: "Confetti Finale",   desc: "A grand surprise ending with balloons and confetti." }
    ];

    /* ---- Templates (theme + starter pages). Themes mirror server/player.js ---- */
    const TEMPLATES = [
        { id: "romantic",    name: "Romantic",    emoji: "💖", tag: "Soft pinks for love letters and anniversaries.", accent: "#D6246E", accent2: "#E62D87", g1: "#FFF6D6", g2: "#FFDCE8", pages: ["intro", "story", "gallery", "letter", "reasons"] },
        { id: "birthday",    name: "Birthday",    emoji: "🎂", tag: "Bright and playful for the big day.",            accent: "#E6462D", accent2: "#FF7A45", g1: "#FFF4D6", g2: "#FFE0C2", pages: ["intro", "gallery", "quiz", "reasons", "finale"] },
        { id: "anniversary", name: "Anniversary", emoji: "💍", tag: "Warm gold — elegant and timeless.",              accent: "#B8873C", accent2: "#D4A24E", g1: "#FFF6E9", g2: "#F7E4D0", pages: ["intro", "story", "gallery", "letter", "finale"] },
        { id: "friendship",  name: "Friendship",  emoji: "🫶", tag: "Sunny orange for your favourite people.",         accent: "#E67E22", accent2: "#F39C12", g1: "#FFF6D6", g2: "#FFEFC2", pages: ["intro", "gallery", "reasons", "finale"] },
        { id: "congrats",    name: "Congrats",    emoji: "🎉", tag: "Fresh green to celebrate a big win.",             accent: "#159A5B", accent2: "#27C06F", g1: "#EAFBF0", g2: "#D6F5E3", pages: ["intro", "story", "gallery", "finale"] },
        { id: "valentine",   name: "Be My Valentine", emoji: "💘", tag: "Ask the big question — the “No” button runs away!", accent: "#E23E6B", accent2: "#FF5A87", g1: "#FFE3EC", g2: "#FFC9DA", pages: ["intro", "ask", "gallery", "finale"] },
        { id: "sorry",       name: "I'm Sorry",   emoji: "🥺", tag: "A gentle apology they can't say no to.",          accent: "#6C7BE0", accent2: "#8A97F0", g1: "#EEF1FF", g2: "#E0E7FF", pages: ["ask", "letter", "finale"] }
    ];

    // Pricing in INR. These are display defaults; the server recomputes the
    // authoritative amount at checkout (loaded from /api/config when available).
    let BASIC_PRICE = 1499;
    let PREMIUM_PRICE = 2999;
    let EXTRA_PAGE = 399;
    const BASIC_INCLUDED = 4;
    const FREE_MAX = 3;
    const CUR = "₹";

    // Backend config (Razorpay key + mode). Filled by loadConfig().
    let SERVER = { keyId: null, testMode: true, hasBackend: false };
    const API = ""; // same-origin when served by the Node server

    async function loadConfig() {
        try {
            const r = await fetch(API + "/api/config");
            if (!r.ok) throw 0;
            const c = await r.json();
            SERVER.keyId = c.keyId;
            SERVER.testMode = c.testMode;
            SERVER.hasBackend = true;
            if (c.pricing) {
                BASIC_PRICE = c.pricing.basic;
                PREMIUM_PRICE = c.pricing.premium;
                EXTRA_PAGE = c.pricing.addonPage;
            }
            renderPagePicker();
        } catch (e) {
            SERVER.hasBackend = false; // static preview (no server) — flow still works as a demo
        }
    }

    /* ---- App state ---- */
    const state = {
        template: "romantic",
        plan: "basic",
        selected: ["intro", "story", "gallery", "letter"], // default Basic 4
        data: {}
    };

    /* ---- View router ---- */
    const views = {
        landing: document.getElementById("view-landing"),
        templates: document.getElementById("view-templates"),
        plans: document.getElementById("view-plans"),
        form: document.getElementById("view-form"),
        done: document.getElementById("view-done")
    };
    function goto(name) {
        if (!views[name]) return;
        Object.values(views).forEach(v => v.classList.remove("active"));
        views[name].classList.add("active");
        window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
        if (name === "templates") renderTemplates();
        if (name === "plans") renderPagePicker();
        if (name === "form") renderForm();
        if (name === "done") renderReview();
    }
    document.body.addEventListener("click", e => {
        const t = e.target.closest("[data-goto]");
        if (t) { e.preventDefault(); goto(t.getAttribute("data-goto")); }
    });

    /* ---- Landing: feature grid ---- */
    (function renderFeatures() {
        const grid = document.getElementById("feature-grid");
        grid.innerHTML = PAGES.map(p => `
            <div class="feature-card">
                <span class="feature-ico">${p.ico}</span>
                <h3>${p.name}</h3>
                <p>${p.desc}</p>
            </div>`).join("");
    })();

    /* ---- Templates ---- */
    function currentTemplate() { return TEMPLATES.find(t => t.id === state.template) || TEMPLATES[0]; }

    function applyTheme(t) {
        const r = document.documentElement.style;
        r.setProperty("--accent", t.accent);
        r.setProperty("--accent-strong", t.accent);
        r.setProperty("--accent-grad", `linear-gradient(180deg, ${t.accent2} 0%, ${t.accent} 100%)`);
        r.setProperty("--bg-gradient", `linear-gradient(135deg, ${t.g1} 0%, ${t.g2} 100%)`);
    }

    function renderTemplates() {
        const grid = document.getElementById("template-grid");
        grid.innerHTML = TEMPLATES.map(t => `
            <div class="tpl-card ${t.id === state.template ? "selected" : ""}" data-tpl="${t.id}">
                <div class="tpl-preview" style="background:linear-gradient(135deg, ${t.g1}, ${t.g2})">${t.emoji}</div>
                <div class="tpl-body">
                    <div class="tpl-name" style="color:${t.accent}">${t.name}</div>
                    <div class="tpl-tag">${t.tag}</div>
                    <div class="tpl-pages">${t.pages.length} starter pages</div>
                    <button class="btn btn-block tpl-pick" style="background:${t.accent}">Use ${t.name} →</button>
                </div>
            </div>`).join("");
        grid.querySelectorAll(".tpl-card").forEach(card => {
            card.addEventListener("click", () => {
                const t = TEMPLATES.find(x => x.id === card.getAttribute("data-tpl"));
                state.template = t.id;
                state.selected = [...t.pages];
                if (state.plan === "free") state.selected = state.selected.slice(0, FREE_MAX);
                applyTheme(t);
                goto("plans");
            });
        });
    }

    /* ---- Plan toggle ---- */
    document.querySelectorAll(".plan-pill").forEach(pill => {
        pill.addEventListener("click", () => {
            document.querySelectorAll(".plan-pill").forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
            state.plan = pill.getAttribute("data-plan");
            if (state.plan === "premium") state.selected = PAGES.map(p => p.id);
            if (state.plan === "free" && state.selected.length > FREE_MAX) state.selected = state.selected.slice(0, FREE_MAX);
            updatePlanBlurb();
            renderPagePicker();
        });
    });

    function updatePlanBlurb() {
        const el = document.getElementById("plan-blurb");
        if (!el) return;
        if (state.plan === "free") el.innerHTML = `Free forever — pick up to <strong>${FREE_MAX} pages</strong>. Watch one short ad, and your site gets a small “Made with wishtoria” badge.`;
        else if (state.plan === "premium") el.innerHTML = `All ${PAGES.length} pages included, plus background music and custom-domain support.`;
        else el.innerHTML = `Basic includes any ${BASIC_INCLUDED} pages. Extra pages are just <strong>${CUR}${EXTRA_PAGE} each</strong>. No ads, no badge.`;
    }

    /* ---- Page picker ---- */
    function renderPagePicker() {
        const wrap = document.getElementById("page-picker");
        const premium = state.plan === "premium";
        const free = state.plan === "free";
        const atFreeCap = free && state.selected.length >= FREE_MAX;
        wrap.innerHTML = PAGES.map(p => {
            const on = state.selected.includes(p.id);
            const tag = premium ? `<span class="pc-tag incl">Included</span>`
                : free ? `<span class="pc-tag incl">Free</span>`
                : (p.core ? `<span class="pc-tag incl">Basic page</span>`
                          : `<span class="pc-tag">+ ${CUR}${EXTRA_PAGE} add-on</span>`);
            const locked = premium || (free && !on && atFreeCap);
            return `
            <div class="page-card ${on ? "selected" : ""} ${locked ? "locked" : ""}" data-page="${p.id}">
                <div class="pc-check">${on ? "✓" : ""}</div>
                <span class="pc-ico">${p.ico}</span>
                <div class="pc-name">${p.name}</div>
                <div class="pc-desc">${p.desc}</div>
                ${tag}
            </div>`;
        }).join("");

        wrap.querySelectorAll(".page-card").forEach(card => {
            card.addEventListener("click", () => {
                if (premium) return; // all locked-on for premium
                const id = card.getAttribute("data-page");
                const i = state.selected.indexOf(id);
                if (i >= 0) state.selected.splice(i, 1);
                else {
                    if (free && state.selected.length >= FREE_MAX) { alert(`The Free plan includes up to ${FREE_MAX} pages. Upgrade to add more 💛`); return; }
                    state.selected.push(id);
                }
                renderPagePicker();
            });
        });
        updateSummary();
    }

    function priceFor() {
        if (state.plan === "free") return 0;
        if (state.plan === "premium") return PREMIUM_PRICE;
        const extra = Math.max(0, state.selected.length - BASIC_INCLUDED);
        return BASIC_PRICE + extra * EXTRA_PAGE;
    }

    function updateSummary() {
        const count = state.selected.length;
        const countEl = document.getElementById("summary-count");
        const totalEl = document.getElementById("summary-total");
        let note = `${count} page${count === 1 ? "" : "s"} selected`;
        if (state.plan === "free") note += ` · up to ${FREE_MAX} on Free`;
        if (state.plan === "basic") {
            const extra = Math.max(0, count - BASIC_INCLUDED);
            if (extra > 0) note += ` · ${BASIC_INCLUDED} in Basic + ${extra} add-on${extra === 1 ? "" : "s"}`;
        }
        countEl.textContent = note;
        totalEl.textContent = state.plan === "free" ? "Free" : CUR + priceFor();
        const btn = document.getElementById("to-form-btn");
        if (btn) btn.innerHTML = state.plan === "free"
            ? `Watch ad & continue 🎬`
            : `Continue to details <span class="btn-arrow">→</span>`;
    }

    document.getElementById("to-form-btn").addEventListener("click", () => {
        if (state.selected.length === 0) { alert("Please pick at least one page 💕"); return; }
        if (state.plan === "free") showAd(() => goto("form"));
        else goto("form");
    });

    /* ---- Ad interstitial (free plan) ---- */
    function showAd(onDone) {
        const overlay = document.getElementById("ad-overlay");
        const btn = document.getElementById("ad-continue");
        const count = document.getElementById("ad-count");
        overlay.classList.remove("hidden");

        // If a real AdSense unit was pasted into #ad-slot, kick it off.
        try { if (window.adsbygoogle) (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}

        let n = 5;
        count.textContent = n;
        btn.disabled = true;
        btn.innerHTML = `Continue in <span id="ad-count">${n}</span>s…`;
        const timer = setInterval(() => {
            n--;
            if (n > 0) {
                btn.innerHTML = `Continue in <span id="ad-count">${n}</span>s…`;
            } else {
                clearInterval(timer);
                btn.disabled = false;
                btn.textContent = "Continue to your surprise →";
            }
        }, 1000);

        const finish = () => {
            clearInterval(timer);
            overlay.classList.add("hidden");
            btn.removeEventListener("click", finish);
            onDone();
        };
        btn.addEventListener("click", finish);
    }

    document.getElementById("ad-upgrade").addEventListener("click", () => {
        document.getElementById("ad-overlay").classList.add("hidden");
        // bump to Basic and let them continue ad-free
        state.plan = "basic";
        document.querySelectorAll(".plan-pill").forEach(p => p.classList.toggle("active", p.getAttribute("data-plan") === "basic"));
        updatePlanBlurb();
        renderPagePicker();
    });

    /* ============================================================
       FORM RENDERING — one section per selected page
       ============================================================ */
    // ordered by the natural flow of the site
    function orderedSelected() {
        return PAGES.filter(p => state.selected.includes(p.id));
    }

    function renderForm() {
        const host = document.getElementById("form-sections");
        // capture existing values before re-render
        captureForm();
        host.innerHTML = orderedSelected().map(p => sectionHTML(p)).join("");
        restoreForm();
        wireRepeaters();
        refreshPreviews(host);
    }

    // Reusable file uploader. `attr` is name="x" (top-level field) or data-f="x" (inside a repeater).
    function uploaderHTML(key, accept, label, useName) {
        const attr = useName ? `name="${key}"` : `data-f="${key}"`;
        return `
        <div class="uploader">
            <label class="up-btn"><input type="file" accept="${accept}" hidden> ${label}</label>
            <input type="text" ${attr} class="up-url" placeholder="…or paste a link">
            <div class="up-preview"></div>
        </div>`;
    }

    function previewFor(url) {
        if (!url || !/^https?:\/\//.test(url)) return "";
        if (/\.(mp3|wav|ogg|m4a|aac|mp4)(\?|$)/i.test(url) || /\/uploads\//.test(url) && /audio/i.test(url)) {
            return `<audio controls src="${url}" style="width:100%"></audio>`;
        }
        // default to image; audio uploads still get a working <audio> via the ext check above
        return `<img src="${url}" alt="preview" style="max-width:140px;border:2px solid var(--line,#2C1123);border-radius:10px">`;
    }

    function refreshPreviews(scope) {
        (scope || document).querySelectorAll(".uploader").forEach(u => {
            const url = u.querySelector(".up-url").value;
            const box = u.querySelector(".up-preview");
            box.innerHTML = previewFor(url);
        });
    }

    async function handleUpload(fileInput) {
        const file = fileInput.files && fileInput.files[0];
        if (!file) return;
        const uploader = fileInput.closest(".uploader");
        const urlInput = uploader.querySelector(".up-url");
        const box = uploader.querySelector(".up-preview");
        if (!SERVER.hasBackend) {
            box.innerHTML = `<span style="color:#b56;font-family:Poppins,sans-serif;font-size:.85rem">Uploads need the server running. Start <strong>server/</strong>, or paste a link instead.</span>`;
            return;
        }
        box.innerHTML = `<span class="pay-spin">🌀</span> Uploading…`;
        try {
            const fd = new FormData();
            fd.append("file", file);
            const r = await fetch(API + "/api/upload", { method: "POST", body: fd });
            if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || "Upload failed");
            const { url } = await r.json();
            urlInput.value = url;
            captureForm();
            const isAudio = /audio|video/.test(file.type);
            box.innerHTML = isAudio
                ? `<audio controls src="${url}" style="width:100%"></audio>`
                : `<img src="${url}" alt="preview" style="max-width:140px;border:2px solid #2C1123;border-radius:10px">`;
        } catch (e) {
            box.innerHTML = `<span style="color:#b56">${e.message}</span>`;
        }
    }

    function sectionHTML(p) {
        const d = state.data;
        const head = `
            <div class="fs-head"><span class="fs-ico">${p.ico}</span><h2 class="fs-title">${p.name}</h2></div>`;
        let body = "";
        switch (p.id) {
            case "intro":
                body = `
                <p class="fs-desc">The very first thing they'll see.</p>
                <div class="field-row">
                    <div class="field"><label>Their name <span class="hint">(shown big & animated)</span></label>
                        <input type="text" name="intro_name" placeholder="e.g. Rajvi"></div>
                    <div class="field"><label>Greeting word</label>
                        <input type="text" name="intro_greeting" placeholder="Hey"></div>
                </div>
                <div class="field"><label>Your name <span class="hint">(from)</span></label>
                    <input type="text" name="from_name" placeholder="e.g. Shubham"></div>`;
                break;
            case "ask":
                body = `
                <p class="fs-desc">Ask a question where the “No” button runs away — they can only say Yes! 💘 Great for “Will you be my Valentine?” or “Will you forgive me?”.</p>
                <div class="field-row">
                    <div class="field"><label>Heading</label>
                        <input type="text" name="ask_title" placeholder="I have something to ask you…"></div>
                    <div class="field"><label>Message after they say Yes</label>
                        <input type="text" name="ask_message" placeholder="Yayy! You just made me the happiest 🥰"></div>
                </div>
                <div class="field-row">
                    <div class="field"><label>“Yes” button text</label>
                        <input type="text" name="ask_yes" placeholder="Yes 💛"></div>
                    <div class="field"><label>“No” button text</label>
                        <input type="text" name="ask_no" placeholder="No"></div>
                </div>
                <label style="font-weight:600;display:block;margin-bottom:.5rem">Questions <span class="hint">(they must say Yes to each — “No” dodges)</span></label>
                <div class="repeater" data-repeat="ask"></div>
                <button type="button" class="btn-add" data-add="ask">＋ Add a question</button>`;
                break;
            case "story":
                body = `
                <p class="fs-desc">Tell your story — it types out slowly, line by line.</p>
                <div class="field"><label>Your story</label>
                    <textarea name="story_text" placeholder="How you met, what makes them special..."></textarea></div>`;
                break;
            case "gallery":
                body = `
                <p class="fs-desc">Add your favourite photos with a caption and a sweet note. Upload from your device, or paste an image link.</p>
                <div class="repeater" data-repeat="gallery"></div>
                <button type="button" class="btn-add" data-add="gallery">＋ Add a photo</button>`;
                break;
            case "letter":
                body = `
                <p class="fs-desc">Hidden inside an envelope they tap to open.</p>
                <div class="field-row">
                    <div class="field"><label>Salutation</label>
                        <input type="text" name="letter_salutation" placeholder="My love,"></div>
                    <div class="field"><label>Sign off</label>
                        <input type="text" name="letter_signoff" placeholder="Always yours, Shubham"></div>
                </div>
                <div class="field"><label>Letter body</label>
                    <textarea name="letter_body" placeholder="Write from the heart..."></textarea></div>`;
                break;
            case "puzzle":
                body = `
                <p class="fs-desc">They slide a photo into place to continue.</p>
                <div class="field"><label>Photo for the puzzle</label>${uploaderHTML("puzzle_photo", "image/*", "📷 Upload photo", true)}</div>
                <div class="field"><label>Little hint / subtitle</label>
                    <input type="text" name="puzzle_sub" placeholder="Slide the tiles to fix our photo 💕"></div>`;
                break;
            case "quiz":
                body = `
                <p class="fs-desc">Fun questions about the two of you. Pick the correct answer with the dot.</p>
                <div class="repeater" data-repeat="quiz"></div>
                <button type="button" class="btn-add" data-add="quiz">＋ Add a question</button>`;
                break;
            case "reasons":
                body = `
                <p class="fs-desc">Each reason becomes its own card in a folder they open.</p>
                <div class="repeater" data-repeat="reasons"></div>
                <button type="button" class="btn-add" data-add="reasons">＋ Add a reason</button>`;
                break;
            case "finale":
                body = `
                <p class="fs-desc">The grand confetti ending.</p>
                <div class="field"><label>Final message</label>
                    <input type="text" name="finale_msg" placeholder="Happy Birthday, my love! 🎉"></div>
                <div class="field"><label>Background music</label>${uploaderHTML("finale_music", "audio/*,video/mp4", "🎵 Upload song", true)}</div>`;
                break;
        }
        return `<section class="form-section" data-section="${p.id}">${head}${body}</section>`;
    }

    /* ---- Repeaters (gallery / quiz / reasons) ---- */
    const repeatTemplates = {
        gallery(i) {
            return `
            <div class="repeat-item">
                <span class="ri-num">Photo ${i + 1}</span>
                <button type="button" class="ri-remove" data-remove>×</button>
                <div class="field"><label>Photo</label>${uploaderHTML("photo", "image/*", "📷 Upload photo")}</div>
                <div class="field-row">
                    <div class="field"><label>Caption</label><input type="text" data-f="caption" placeholder="Your birthday glow 🎂"></div>
                    <div class="field"><label>Short note</label><input type="text" data-f="desc" placeholder="The day made just for you."></div>
                </div>
            </div>`;
        },
        quiz(i) {
            return `
            <div class="repeat-item">
                <span class="ri-num">Question ${i + 1}</span>
                <button type="button" class="ri-remove" data-remove>×</button>
                <div class="field"><label>Question</label><input type="text" data-f="q" placeholder="Where did we first meet?"></div>
                ${[0,1,2,3].map(n => `
                <div class="opt-row">
                    <input type="radio" name="quizc_${i}" data-f="correct" value="${n}">
                    <input type="text" data-f="opt${n}" placeholder="Answer option ${n + 1}${n === 0 ? " (mark the correct one →← with the dot)" : ""}">
                </div>`).join("")}
            </div>`;
        },
        reasons(i) {
            return `
            <div class="repeat-item">
                <span class="ri-num">Reason ${i + 1}</span>
                <button type="button" class="ri-remove" data-remove>×</button>
                <div class="field"><input type="text" data-f="reason" placeholder="Because you make ordinary days feel like magic."></div>
            </div>`;
        },
        ask(i) {
            return `
            <div class="repeat-item">
                <span class="ri-num">Question ${i + 1}</span>
                <button type="button" class="ri-remove" data-remove>×</button>
                <div class="field"><input type="text" data-f="q" placeholder="${i === 0 ? "Will you be my Valentine?" : "Are you sure? 🥺"}"></div>
            </div>`;
        }
    };

    function wireRepeaters() {
        document.querySelectorAll(".repeater").forEach(rep => {
            const key = rep.getAttribute("data-repeat");
            const saved = (state.data[key] && state.data[key].length) ? state.data[key].length
                        : (key === "quiz" || key === "ask" ? 1 : (key === "reasons" ? 3 : 3));
            rep.innerHTML = "";
            for (let i = 0; i < saved; i++) addRepeat(rep, key, i);
            restoreRepeat(rep, key);
            refreshPreviews(rep);
        });
        document.querySelectorAll("[data-add]").forEach(btn => {
            btn.addEventListener("click", () => {
                const key = btn.getAttribute("data-add");
                const rep = document.querySelector(`.repeater[data-repeat="${key}"]`);
                addRepeat(rep, key, rep.children.length);
            });
        });
    }

    function addRepeat(rep, key, i) {
        const div = document.createElement("div");
        div.innerHTML = repeatTemplates[key](i).trim();
        const node = div.firstChild;
        node.querySelector("[data-remove]").addEventListener("click", () => {
            node.remove();
            renumber(rep, key);
        });
        rep.appendChild(node);
    }

    function renumber(rep, key) {
        [...rep.children].forEach((c, i) => {
            const num = c.querySelector(".ri-num");
            if (num) num.textContent = key === "gallery" ? `Photo ${i+1}` : (key === "quiz" || key === "ask") ? `Question ${i+1}` : `Reason ${i+1}`;
            // fix radio group names for quiz
            if (key === "quiz") c.querySelectorAll('input[type=radio]').forEach(r => r.name = `quizc_${i}`);
        });
    }

    /* ---- Capture / restore form values into state.data ---- */
    function captureForm() {
        const host = document.getElementById("form-sections");
        if (!host.children.length) return;
        // plain fields
        host.querySelectorAll("input[name], textarea[name]").forEach(el => {
            state.data[el.name] = el.value;
        });
        // repeaters
        host.querySelectorAll(".repeater").forEach(rep => {
            const key = rep.getAttribute("data-repeat");
            const arr = [];
            [...rep.children].forEach(item => {
                const obj = {};
                item.querySelectorAll("[data-f]").forEach(f => {
                    if (f.type === "radio") { if (f.checked) obj.correct = f.value; }
                    else obj[f.getAttribute("data-f")] = f.value;
                });
                arr.push(obj);
            });
            state.data[key] = arr;
        });
    }

    function restoreForm() {
        const host = document.getElementById("form-sections");
        host.querySelectorAll("input[name], textarea[name]").forEach(el => {
            if (state.data[el.name] != null) el.value = state.data[el.name];
        });
    }

    function restoreRepeat(rep, key) {
        const arr = state.data[key];
        if (!arr) return;
        [...rep.children].forEach((item, i) => {
            const obj = arr[i]; if (!obj) return;
            item.querySelectorAll("[data-f]").forEach(f => {
                const name = f.getAttribute("data-f");
                if (f.type === "radio") { if (obj.correct === f.value) f.checked = true; }
                else if (obj[name] != null) f.value = obj[name];
            });
        });
    }

    // capture on any input in the form
    document.getElementById("builder-form").addEventListener("input", e => {
        if (e.target.type !== "file") captureForm();
    });
    // file uploads
    document.getElementById("builder-form").addEventListener("change", e => {
        if (e.target.type === "file") handleUpload(e.target);
    });

    document.getElementById("builder-form").addEventListener("submit", e => {
        e.preventDefault();
        captureForm();
        goto("done");
    });

    /* ============================================================
       REVIEW
       ============================================================ */
    function esc(s) { return String(s == null ? "" : s).replace(/[<>&]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c])); }
    function line(label, val) {
        return val ? `<p class="rv-line"><strong>${label}:</strong> ${esc(val)}</p>` : "";
    }

    function renderReview() {
        captureForm();
        const d = state.data;
        const blocks = [];

        const planName = state.plan === "premium" ? "Premium (all pages)" : state.plan === "free" ? "Simple (Free)" : "Basic";
        const totalTxt = state.plan === "free" ? "Free (ad-supported)" : CUR + priceFor();
        blocks.push(`<div class="review-block">
            <h3>🧾 Your plan</h3>
            <p class="rv-line"><strong>Template:</strong> ${currentTemplate().emoji} ${currentTemplate().name}</p>
            <p class="rv-line"><strong>Plan:</strong> ${planName}</p>
            <p class="rv-line"><strong>Pages:</strong> ${orderedSelected().map(p => p.name).join(", ")}</p>
            <p class="rv-line"><strong>Total:</strong> ${totalTxt}</p>
        </div>`);

        const confirmBtn = document.getElementById("confirm-btn");
        confirmBtn.innerHTML = state.plan === "free"
            ? `<span class="btn-spark">✦</span> Create my free site`
            : `<span class="btn-spark">✦</span> Pay & build my site`;

        orderedSelected().forEach(p => {
            let body = "";
            switch (p.id) {
                case "intro":
                    body = line("Their name", d.intro_name) + line("Greeting", d.intro_greeting) + line("From", d.from_name);
                    break;
                case "ask":
                    body = line("Heading", d.ask_title)
                        + (d.ask||[]).filter(a=>a.q).map((a,i)=>`<p class="rv-line"><strong>Q${i+1}:</strong> ${esc(a.q)}</p>`).join("")
                        + line("After Yes", d.ask_message);
                    break;
                case "story":
                    body = d.story_text ? `<p class="rv-line">${esc(d.story_text).slice(0,240)}${d.story_text.length>240?"…":""}</p>` : "";
                    break;
                case "gallery":
                    body = (d.gallery||[]).filter(g=>g.caption||g.photo).map((g,i)=>`<p class="rv-line"><strong>Photo ${i+1}:</strong> ${esc(g.caption||"(no caption)")} ${g.photo?"📎":""}</p>`).join("");
                    break;
                case "letter":
                    body = line("Salutation", d.letter_salutation) + (d.letter_body?`<p class="rv-line">${esc(d.letter_body).slice(0,240)}${d.letter_body.length>240?"…":""}</p>`:"") + line("Sign off", d.letter_signoff);
                    break;
                case "puzzle":
                    body = line("Photo", d.puzzle_photo) + line("Hint", d.puzzle_sub);
                    break;
                case "quiz":
                    body = (d.quiz||[]).filter(q=>q.q).map((q,i)=>{
                        const correct = q.correct != null ? q["opt"+q.correct] : "";
                        return `<p class="rv-line"><strong>Q${i+1}:</strong> ${esc(q.q)}${correct?` — ✓ ${esc(correct)}`:""}</p>`;
                    }).join("");
                    break;
                case "reasons":
                    body = (d.reasons||[]).filter(r=>r.reason).map((r,i)=>`<p class="rv-line"><strong>${i+1}.</strong> ${esc(r.reason)}</p>`).join("");
                    break;
                case "finale":
                    body = line("Message", d.finale_msg) + line("Music", d.finale_music);
                    break;
            }
            if (!body) body = `<p class="review-empty">No details added yet — you can go back and fill this in.</p>`;
            blocks.push(`<div class="review-block"><h3>${p.ico} ${p.name}</h3>${body}</div>`);
        });

        document.getElementById("review-summary").innerHTML = blocks.join("");
        document.getElementById("final-msg").classList.add("hidden");
    }

    /* ---- Payment + build flow ---- */
    const payStatus = () => document.getElementById("pay-status");
    function setStatus(html) {
        const el = payStatus();
        el.classList.remove("hidden");
        el.innerHTML = html;
    }

    function showLive(url, qr) {
        document.getElementById("site-link").textContent = url;
        document.getElementById("site-link").href = url;
        document.getElementById("site-qr").src = qr;
        payStatus().classList.add("hidden");
        document.getElementById("final-msg").classList.remove("hidden");
        document.getElementById("final-msg").scrollIntoView({ behavior: "smooth" });
    }

    async function createOrder() {
        captureForm();
        const email = document.getElementById("buyer-email").value.trim();
        const body = { plan: state.plan, template: state.template, pages: state.selected, content: state.data, email };
        const r = await fetch(API + "/api/orders", {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
        });
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || "Could not start checkout");
        return r.json();
    }

    async function verify(payload) {
        const r = await fetch(API + "/api/verify", {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
        });
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || "Verification failed");
        return r.json();
    }

    /* ---- Live preview (before paying) ---- */
    document.getElementById("preview-btn").addEventListener("click", async () => {
        if (state.selected.length === 0) { alert("Pick at least one page first 💕"); return; }
        if (!SERVER.hasBackend) {
            alert("Live preview needs the server running. Start the server/ and open the site at its address, then Preview will work. 🌀");
            return;
        }
        const btn = document.getElementById("preview-btn");
        const label = btn.textContent;
        btn.disabled = true; btn.textContent = "Building preview…";
        try {
            captureForm();
            const r = await fetch(API + "/api/preview", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan: state.plan, template: state.template, pages: state.selected, content: state.data })
            });
            if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || "Preview failed");
            const res = await r.json();
            document.getElementById("preview-link").textContent = res.url;
            document.getElementById("preview-link").href = res.url;
            document.getElementById("preview-open").href = res.url;
            document.getElementById("preview-qr").src = res.qr;
            const box = document.getElementById("preview-box");
            box.classList.remove("hidden");
            box.scrollIntoView({ behavior: "smooth" });
            window.open(res.url, "_blank");
        } catch (e) {
            alert(e.message);
        } finally {
            btn.disabled = false; btn.textContent = label;
        }
    });

    document.getElementById("preview-copy").addEventListener("click", () => {
        const link = document.getElementById("preview-link").textContent;
        navigator.clipboard.writeText(link).then(() => {
            const b = document.getElementById("preview-copy");
            const t = b.textContent; b.textContent = "✓ Copied!";
            setTimeout(() => b.textContent = t, 1500);
        });
    });

    document.getElementById("confirm-btn").addEventListener("click", async () => {
        // No backend running (static preview): keep the old demo behaviour.
        if (!SERVER.hasBackend) {
            setStatus(`<h2>💌 Demo mode</h2><p>No payment backend is connected yet. Run the <strong>server/</strong> to enable real Razorpay checkout, unique links and QR codes. You can still download your content below.</p>`);
            document.getElementById("final-msg").classList.remove("hidden");
            document.getElementById("site-link").parentElement.classList.add("hidden");
            document.getElementById("site-qr").classList.add("hidden");
            return;
        }

        const email = document.getElementById("buyer-email").value.trim();
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { alert("Please enter a valid email so we can send your link 💌"); return; }

        try {
            setStatus(`<p><span class="pay-spin">🌀</span> Starting secure checkout…</p>`);
            const order = await createOrder();

            // Free plan or TEST_MODE (no Razorpay keys) — skip the gateway, verify directly.
            if (order.free || order.testMode || !order.keyId) {
                setStatus(`<p><span class="pay-spin">🌀</span> Building your ${order.free ? "free " : ""}site…</p>`);
                const res = await verify({ razorpay_order_id: order.orderId });
                return showLive(res.url, res.qr);
            }

            // LIVE: open Razorpay Checkout
            const rzp = new Razorpay({
                key: order.keyId,
                amount: order.amount,
                currency: order.currency,
                name: "wishtoria",
                description: "Your personalized surprise website",
                order_id: order.orderId,
                prefill: { email },
                theme: { color: "#D6246E" },
                handler: async function (resp) {
                    try {
                        setStatus(`<p><span class="pay-spin">🌀</span> Payment received — building your site…</p>`);
                        const res = await verify({
                            razorpay_order_id: resp.razorpay_order_id,
                            razorpay_payment_id: resp.razorpay_payment_id,
                            razorpay_signature: resp.razorpay_signature
                        });
                        showLive(res.url, res.qr);
                    } catch (e) { setStatus(`<h2>⚠️ ${e.message}</h2><p>Your payment may still have gone through — contact support with your email.</p>`); }
                },
                modal: { ondismiss: () => setStatus(`<p>Checkout closed. Click “Pay & build” when you're ready. 💕</p>`) }
            });
            rzp.open();
        } catch (e) {
            setStatus(`<h2>⚠️ ${e.message}</h2>`);
        }
    });

    document.getElementById("copy-link-btn").addEventListener("click", () => {
        const link = document.getElementById("site-link").textContent;
        navigator.clipboard.writeText(link).then(() => {
            const b = document.getElementById("copy-link-btn");
            const t = b.textContent; b.textContent = "✓ Copied!";
            setTimeout(() => b.textContent = t, 1500);
        });
    });

    document.getElementById("download-btn").addEventListener("click", () => {
        captureForm();
        const payload = {
            plan: state.plan,
            pages: state.selected,
            price: priceFor(),
            content: state.data
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "my-wishtoria-site.json";
        a.click();
        URL.revokeObjectURL(url);
    });

    /* ---- Boot ---- */
    applyTheme(currentTemplate());
    updatePlanBlurb();
    loadConfig();

})();
