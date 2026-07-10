import { NextResponse } from "next/server";
import { computeAmount, PRICING } from "@/lib/pricing";
import type { PlanId } from "@/lib/types";
import { createSite, markPreview } from "@/lib/db";
import { baseUrl, uniqueSlug } from "@/lib/server";

// Build a shareable, watermarked site BEFORE paying.
export async function POST(req: Request) {
  try {
    const { plan, template, pages, content, email } = await req.json();
    const p: PlanId = ["free", "basic", "premium"].includes(plan) ? plan : "basic";
    const { pages: cleanPages } = computeAmount(p, pages);
    if (!cleanPages.length) return NextResponse.json({ error: "pick at least one page" }, { status: 400 });

    const slug = await uniqueSlug();
    await createSite({
      slug,
      ownerEmail: email || null,
      plan: p,
      template: template || "romantic",
      pages: cleanPages,
      content: content || {},
      amount: 0,
      currency: PRICING.currency,
      status: "preview",
      razorpayOrderId: "preview_" + slug,
    });
    await markPreview(slug);

    const base = baseUrl(req);
    return NextResponse.json({ slug, url: `${base}/s/${slug}`, qr: `${base}/api/qr/${slug}` });
  } catch (e) {
    console.error("preview error", e);
    return NextResponse.json({ error: "could not build preview" }, { status: 500 });
  }
}
