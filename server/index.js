import express from "express";
import cors from "cors";
import crypto from "node:crypto";
import QRCode from "qrcode";
import { customAlphabet } from "nanoid";
import { fileURLToPath } from "node:url";
import { dirname, join, extname } from "node:path";
import { mkdirSync } from "node:fs";
import multer from "multer";
import Razorpay from "razorpay";

import { q } from "./db.js";
import {
    PORT, BASE_URL, PRICING, TEST_MODE,
    RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET,
    computeAmount
} from "./config.js";
import { renderSite } from "./player.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const slugId = customAlphabet("abcdefghijkmnpqrstuvwxyz23456789", 8); // no ambiguous chars

const razorpay = TEST_MODE ? null : new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET
});

const app = express();
app.use(cors());

/* ---- Webhook FIRST, with raw body (needed for signature check) ---- */
app.post("/api/webhook", express.raw({ type: "application/json" }), (req, res) => {
    try {
        if (RAZORPAY_WEBHOOK_SECRET) {
            const expected = crypto
                .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
                .update(req.body) // raw Buffer
                .digest("hex");
            const got = req.headers["x-razorpay-signature"];
            if (expected !== got) return res.status(400).json({ error: "bad signature" });
        }
        const payload = JSON.parse(req.body.toString("utf8"));
        if (payload.event === "payment.captured" || payload.event === "order.paid") {
            const orderId = payload.payload?.payment?.entity?.order_id
                || payload.payload?.order?.entity?.id;
            const paymentId = payload.payload?.payment?.entity?.id || null;
            if (orderId) {
                q.markPaid.run({ order_id: orderId, payment_id: paymentId, paid_at: new Date().toISOString() });
            }
        }
        res.json({ ok: true });
    } catch (e) {
        console.error("webhook error", e);
        res.status(500).json({ error: "webhook failed" });
    }
});

app.use(express.json({ limit: "5mb" }));

/* ---- Uploads (photos / music) ---- */
const UPLOAD_DIR = join(__dirname, "uploads");
mkdirSync(UPLOAD_DIR, { recursive: true });
const upload = multer({
    storage: multer.diskStorage({
        destination: UPLOAD_DIR,
        filename: (req, file, cb) => cb(null, slugId() + extname(file.originalname).toLowerCase().slice(0, 6))
    }),
    limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
    fileFilter: (req, file, cb) => {
        const ok = /^image\//.test(file.mimetype) || /^audio\//.test(file.mimetype) || file.mimetype === "video/mp4";
        cb(ok ? null : new Error("Only image or audio files are allowed"), ok);
    }
});

app.post("/api/upload", (req, res) => {
    upload.single("file")(req, res, err => {
        if (err) return res.status(400).json({ error: err.message });
        if (!req.file) return res.status(400).json({ error: "no file" });
        res.json({ url: `${BASE_URL}/uploads/${req.file.filename}`, kind: req.file.mimetype });
    });
});

app.use("/uploads", express.static(UPLOAD_DIR, { maxAge: "365d" }));

/* ---- Static: serve the sales/builder site at / ---- */
app.use("/", express.static(join(__dirname, "..", "sell")));
app.use("/demo", express.static(join(__dirname, ".."))); // original demo site

/* ---- Public config for the frontend (Razorpay key, pricing, mode) ---- */
app.get("/api/config", (req, res) => {
    res.json({
        keyId: RAZORPAY_KEY_ID || null,
        testMode: TEST_MODE,
        pricing: PRICING,
        currency: PRICING.currency
    });
});

function uniqueSlug() {
    let s;
    do { s = slugId(); } while (q.slugExists.get(s));
    return s;
}

/* ---- 1) Create order: compute price server-side, store draft ---- */
app.post("/api/orders", async (req, res) => {
    try {
        const { plan, template, pages, content, email } = req.body || {};
        if (!["free", "basic", "premium"].includes(plan)) return res.status(400).json({ error: "invalid plan" });

        const { rupees, pages: cleanPages } = computeAmount(plan, pages);
        if (!cleanPages.length) return res.status(400).json({ error: "pick at least one page" });
        const amountPaise = rupees * 100;
        const slug = uniqueSlug();
        const now = new Date().toISOString();
        const isFree = plan === "free" || amountPaise === 0;

        let orderId;
        if (isFree) {
            orderId = "free_" + slug;          // no charge — ad-supported free tier
        } else if (TEST_MODE) {
            orderId = "order_test_" + slug;    // fake order id for local demos
        } else {
            const order = await razorpay.orders.create({
                amount: amountPaise,
                currency: PRICING.currency,
                receipt: slug,
                notes: { slug, plan }
            });
            orderId = order.id;
        }

        q.insertDraft.run({
            slug,
            owner_email: email || null,
            plan,
            template: (template || "romantic"),
            pages: JSON.stringify(cleanPages),
            content: JSON.stringify(content || {}),
            amount: amountPaise,
            currency: PRICING.currency,
            razorpay_order_id: orderId,
            created_at: now
        });

        res.json({
            orderId,
            slug,
            amount: amountPaise,
            currency: PRICING.currency,
            keyId: RAZORPAY_KEY_ID || null,
            testMode: TEST_MODE,
            free: isFree
        });
    } catch (e) {
        console.error("order error", e);
        res.status(500).json({ error: "could not create order" });
    }
});

/* ---- 2) Verify payment signature from Razorpay Checkout ---- */
app.post("/api/verify", (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
        const row = q.byOrder.get(razorpay_order_id);
        if (!row) return res.status(404).json({ error: "order not found" });

        const isFree = row.amount === 0 || String(razorpay_order_id).startsWith("free_");
        if (isFree || TEST_MODE) {
            q.markPaid.run({ order_id: razorpay_order_id, payment_id: isFree ? "free" : "pay_test", paid_at: new Date().toISOString() });
        } else {
            const expected = crypto
                .createHmac("sha256", RAZORPAY_KEY_SECRET)
                .update(`${razorpay_order_id}|${razorpay_payment_id}`)
                .digest("hex");
            if (expected !== razorpay_signature) return res.status(400).json({ error: "signature mismatch" });
            q.markPaid.run({ order_id: razorpay_order_id, payment_id: razorpay_payment_id, paid_at: new Date().toISOString() });
        }

        const url = `${BASE_URL}/s/${row.slug}`;
        res.json({ ok: true, slug: row.slug, url, qr: `${BASE_URL}/api/qr/${row.slug}` });
    } catch (e) {
        console.error("verify error", e);
        res.status(500).json({ error: "verification failed" });
    }
});

/* ---- 3) Site content JSON (only if paid) ---- */
app.get("/api/sites/:slug", (req, res) => {
    const row = q.bySlug.get(req.params.slug);
    if (!row) return res.status(404).json({ error: "not found" });
    if (row.status !== "paid") return res.status(402).json({ error: "payment pending" });
    res.json({
        slug: row.slug,
        plan: row.plan,
        pages: JSON.parse(row.pages),
        content: JSON.parse(row.content)
    });
});

/* ---- 3b) Preview: build a shareable, watermarked site BEFORE paying ---- */
app.post("/api/preview", (req, res) => {
    try {
        const { plan, template, pages, content, email } = req.body || {};
        const p = ["free", "basic", "premium"].includes(plan) ? plan : "basic";
        const { pages: cleanPages } = computeAmount(p, pages);
        if (!cleanPages.length) return res.status(400).json({ error: "pick at least one page" });
        const slug = uniqueSlug();
        q.insertDraft.run({
            slug,
            owner_email: email || null,
            plan: p,
            template: (template || "romantic"),
            pages: JSON.stringify(cleanPages),
            content: JSON.stringify(content || {}),
            amount: 0,
            currency: PRICING.currency,
            razorpay_order_id: "preview_" + slug,
            created_at: new Date().toISOString()
        });
        q.markPreview.run({ slug });
        res.json({ slug, url: `${BASE_URL}/s/${slug}`, qr: `${BASE_URL}/api/qr/${slug}` });
    } catch (e) {
        console.error("preview error", e);
        res.status(500).json({ error: "could not build preview" });
    }
});

/* ---- 4) QR code PNG for a site's public link ---- */
app.get("/api/qr/:slug", async (req, res) => {
    const row = q.bySlug.get(req.params.slug);
    if (!row) return res.status(404).send("not found");
    const url = `${BASE_URL}/s/${row.slug}`;
    const png = await QRCode.toBuffer(url, { width: 512, margin: 2, color: { dark: "#2C1123", light: "#FFFFFF" } });
    res.type("png").send(png);
});

/* ---- 5) The buyer's personalized site ---- */
app.get("/s/:slug", (req, res) => {
    const row = q.bySlug.get(req.params.slug);
    if (!row) return res.status(404).send("This surprise link doesn't exist 💔");
    if (row.status !== "paid" && row.status !== "preview") {
        return res.status(402).send("This surprise isn't active yet — payment is still pending.");
    }
    res.type("html").send(renderSite({
        slug: row.slug,
        plan: row.plan,
        template: row.template || "romantic",
        pages: JSON.parse(row.pages),
        content: JSON.parse(row.content),
        preview: row.status === "preview"
    }));
});

app.listen(PORT, () => {
    console.log(`\n🎁 wishtoria server on ${BASE_URL}`);
    console.log(`   Builder:  ${BASE_URL}/`);
    console.log(`   Mode:     ${TEST_MODE ? "TEST_MODE (no real payments)" : "LIVE Razorpay"}\n`);
});
