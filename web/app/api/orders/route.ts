import { NextResponse } from "next/server";
import { computeAmount, PRICING } from "@/lib/pricing";
import type { PlanId } from "@/lib/types";
import { createSite } from "@/lib/db";
import { RAZORPAY_KEY_ID, TEST_MODE, razorpay, uniqueSlug } from "@/lib/server";

export async function POST(req: Request) {
  try {
    const { plan, template, pages, content, email } = await req.json();
    if (!["free", "basic", "premium"].includes(plan)) {
      return NextResponse.json({ error: "invalid plan" }, { status: 400 });
    }

    const { rupees, pages: cleanPages } = computeAmount(plan as PlanId, pages);
    if (!cleanPages.length) return NextResponse.json({ error: "pick at least one page" }, { status: 400 });

    const amountPaise = rupees * 100;
    const slug = await uniqueSlug();
    const isFree = plan === "free" || amountPaise === 0;

    let orderId: string;
    if (isFree) {
      orderId = "free_" + slug;
    } else if (TEST_MODE || !razorpay) {
      orderId = "order_test_" + slug;
    } else {
      const order = await razorpay.orders.create({
        amount: amountPaise,
        currency: PRICING.currency,
        receipt: slug,
        notes: { slug, plan },
      });
      orderId = order.id;
    }

    await createSite({
      slug,
      ownerEmail: email || null,
      plan: plan as PlanId,
      template: template || "romantic",
      pages: cleanPages,
      content: content || {},
      amount: amountPaise,
      currency: PRICING.currency,
      status: "draft",
      razorpayOrderId: orderId,
    });

    return NextResponse.json({
      orderId,
      slug,
      amount: amountPaise,
      currency: PRICING.currency,
      keyId: RAZORPAY_KEY_ID || null,
      testMode: TEST_MODE,
      free: isFree,
    });
  } catch (e) {
    console.error("order error", e);
    return NextResponse.json({ error: "could not create order" }, { status: 500 });
  }
}
