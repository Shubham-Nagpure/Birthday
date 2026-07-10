import "dotenv/config";

/* ---- Pricing (INR). Server is the single source of truth — the browser
   price is display-only and is never trusted for charging. ---- */
export const PRICING = {
    currency: "INR",
    free: 0,            // Free "Simple" plan — ad-supported, limited pages, badge
    basic: 1499,        // ₹ for the Basic plan (up to 4 pages)
    premium: 2999,      // ₹ for Premium (all pages)
    addonPage: 399,     // ₹ per page beyond the 4 included in Basic
    basicIncluded: 4,
    freeMaxPages: 3
};

/* Canonical page catalog — must match the frontend PAGES list. */
export const PAGE_IDS = [
    "intro", "ask", "story", "gallery", "letter",
    "puzzle", "quiz", "reasons", "finale"
];

export const CORE_PAGES = ["intro", "story", "gallery", "letter"];

export const PORT = process.env.PORT || 4242;
export const BASE_URL = (process.env.BASE_URL || `http://localhost:${PORT}`).replace(/\/$/, "");

export const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "";
export const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";
export const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "";

/* When keys are missing we run a payment-free TEST_MODE so the whole flow
   is demoable locally without a Razorpay account. */
export const TEST_MODE = !(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET);

/* Compute the authoritative amount (in ₹) for a plan + selected pages. */
export function computeAmount(plan, pages) {
    const clean = (Array.isArray(pages) ? pages : []).filter(p => PAGE_IDS.includes(p));
    if (plan === "premium") return { rupees: PRICING.premium, pages: [...PAGE_IDS] };
    if (plan === "free") return { rupees: PRICING.free, pages: clean.slice(0, PRICING.freeMaxPages) };
    const extra = Math.max(0, clean.length - PRICING.basicIncluded);
    return { rupees: PRICING.basic + extra * PRICING.addonPage, pages: clean };
}
