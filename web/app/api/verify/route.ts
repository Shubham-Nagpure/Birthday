import { NextResponse } from "next/server";
import { getSiteByOrder, markPaid } from "@/lib/db";
import { RAZORPAY_KEY_SECRET, TEST_MODE, baseUrl, hmacSha256 } from "@/lib/server";

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
    const row = await getSiteByOrder(razorpay_order_id);
    if (!row) return NextResponse.json({ error: "order not found" }, { status: 404 });

    const isFree = row.amount === 0 || String(razorpay_order_id).startsWith("free_");
    if (isFree || TEST_MODE) {
      await markPaid(razorpay_order_id, isFree ? "free" : "pay_test");
    } else {
      const expected = hmacSha256(RAZORPAY_KEY_SECRET, `${razorpay_order_id}|${razorpay_payment_id}`);
      if (expected !== razorpay_signature) {
        return NextResponse.json({ error: "signature mismatch" }, { status: 400 });
      }
      await markPaid(razorpay_order_id, razorpay_payment_id);
    }

    const base = baseUrl(req);
    return NextResponse.json({
      ok: true,
      slug: row.slug,
      url: `${base}/s/${row.slug}`,
      qr: `${base}/api/qr/${row.slug}`,
    });
  } catch (e) {
    console.error("verify error", e);
    return NextResponse.json({ error: "verification failed" }, { status: 500 });
  }
}
