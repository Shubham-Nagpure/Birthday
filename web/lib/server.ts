import "server-only";
import crypto from "node:crypto";
import Razorpay from "razorpay";
import { prisma } from "./prisma";

export const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "";
export const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";
export const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "";

/** Payment-free mode when keys are absent — lets the app run locally/demo. */
export const TEST_MODE = !(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET);

export const razorpay = TEST_MODE
  ? null
  : new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });

/** Absolute base URL for building share links + QR codes. */
export function baseUrl(req: Request): string {
  const env = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL;
  if (env) return env.replace(/\/$/, "");
  const url = new URL(req.url);
  return `${url.protocol}//${url.host}`;
}

const ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789"; // no ambiguous chars
export function slugId(len = 8): string {
  const bytes = crypto.randomBytes(len);
  let s = "";
  for (let i = 0; i < len; i++) s += ALPHABET[bytes[i] % ALPHABET.length];
  return s;
}

export async function uniqueSlug(): Promise<string> {
  for (let i = 0; i < 6; i++) {
    const s = slugId();
    const existing = await prisma.site.findUnique({ where: { slug: s }, select: { id: true } });
    if (!existing) return s;
  }
  return slugId(10);
}

export function hmacSha256(secret: string, payload: string | Buffer): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}
