import { NextResponse } from "next/server";
import { markPaid } from "@/lib/db";
import { RAZORPAY_WEBHOOK_SECRET, hmacSha256 } from "@/lib/server";

// Razorpay server-to-server confirmation — the reliable source of truth.
export async function POST(req: Request) {
  try {
    const raw = await req.text(); // raw body needed for signature check
    if (RAZORPAY_WEBHOOK_SECRET) {
      const expected = hmacSha256(RAZORPAY_WEBHOOK_SECRET, raw);
      const got = req.headers.get("x-razorpay-signature");
      if (expected !== got) return NextResponse.json({ error: "bad signature" }, { status: 400 });
    }
    const payload = JSON.parse(raw);
    if (payload.event === "payment.captured" || payload.event === "order.paid") {
      const orderId =
        payload.payload?.payment?.entity?.order_id || payload.payload?.order?.entity?.id;
      const paymentId = payload.payload?.payment?.entity?.id || null;
      if (orderId) await markPaid(orderId, paymentId);
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("webhook error", e);
    return NextResponse.json({ error: "webhook failed" }, { status: 500 });
  }
}
