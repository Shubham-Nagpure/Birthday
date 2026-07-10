import type { PageId, PlanId } from "./types";
import { PAGE_IDS } from "./pages";

/** Pricing in INR. Server is the single source of truth for charging. */
export const PRICING = {
  currency: "INR",
  free: 0,
  basic: 1499,
  premium: 2999,
  addonPage: 399,
  basicIncluded: 4,
  freeMaxPages: 3,
} as const;

export const CURRENCY_SYMBOL = "₹";

/** Authoritative amount (in ₹) + cleaned page list for a plan + selection. */
export function computeAmount(
  plan: PlanId,
  pages: PageId[] | undefined
): { rupees: number; pages: PageId[] } {
  const clean = (Array.isArray(pages) ? pages : []).filter((p) => PAGE_IDS.includes(p));
  if (plan === "premium") return { rupees: PRICING.premium, pages: [...PAGE_IDS] };
  if (plan === "free") return { rupees: PRICING.free, pages: clean.slice(0, PRICING.freeMaxPages) };
  const extra = Math.max(0, clean.length - PRICING.basicIncluded);
  return { rupees: PRICING.basic + extra * PRICING.addonPage, pages: clean };
}
