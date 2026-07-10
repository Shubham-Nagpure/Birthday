import { NextResponse } from "next/server";
import { PRICING } from "@/lib/pricing";
import { RAZORPAY_KEY_ID, TEST_MODE } from "@/lib/server";

export async function GET() {
  return NextResponse.json({
    keyId: RAZORPAY_KEY_ID || null,
    testMode: TEST_MODE,
    pricing: PRICING,
    currency: PRICING.currency,
  });
}
