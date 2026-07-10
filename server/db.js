import Database from "better-sqlite3";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(join(__dirname, "lovesite.db"));
db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS sites (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    slug                TEXT UNIQUE NOT NULL,
    owner_email         TEXT,
    plan                TEXT NOT NULL,
    template            TEXT NOT NULL DEFAULT 'romantic',
    pages               TEXT NOT NULL,            -- JSON array of page ids
    content             TEXT NOT NULL,            -- JSON object of all form data
    amount              INTEGER NOT NULL,         -- charged amount in paise
    currency            TEXT NOT NULL DEFAULT 'INR',
    status              TEXT NOT NULL DEFAULT 'draft',   -- draft | paid
    razorpay_order_id   TEXT,
    razorpay_payment_id TEXT,
    created_at          TEXT NOT NULL,
    paid_at             TEXT
);
CREATE INDEX IF NOT EXISTS idx_sites_order ON sites(razorpay_order_id);
`);

/* Lightweight migration: add `template` to older databases that predate it. */
const cols = db.prepare(`PRAGMA table_info(sites)`).all().map(c => c.name);
if (!cols.includes("template")) {
    db.exec(`ALTER TABLE sites ADD COLUMN template TEXT NOT NULL DEFAULT 'romantic'`);
}

export const q = {
    insertDraft: db.prepare(`
        INSERT INTO sites (slug, owner_email, plan, template, pages, content, amount, currency, status, razorpay_order_id, created_at)
        VALUES (@slug, @owner_email, @plan, @template, @pages, @content, @amount, @currency, 'draft', @razorpay_order_id, @created_at)
    `),
    bySlug: db.prepare(`SELECT * FROM sites WHERE slug = ?`),
    byOrder: db.prepare(`SELECT * FROM sites WHERE razorpay_order_id = ?`),
    markPaid: db.prepare(`
        UPDATE sites SET status='paid', razorpay_payment_id=@payment_id, paid_at=@paid_at
        WHERE razorpay_order_id=@order_id AND status!='paid'
    `),
    markPreview: db.prepare(`UPDATE sites SET status='preview' WHERE slug=@slug AND status='draft'`),
    slugExists: db.prepare(`SELECT 1 FROM sites WHERE slug = ?`)
};

export default db;
