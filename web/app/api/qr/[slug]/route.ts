import QRCode from "qrcode";
import { getSite } from "@/lib/db";
import { baseUrl } from "@/lib/server";

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const row = await getSite(params.slug);
  if (!row) return new Response("not found", { status: 404 });
  const url = `${baseUrl(req)}/s/${row.slug}`;
  const png = await QRCode.toBuffer(url, {
    width: 512,
    margin: 2,
    color: { dark: "#2C1123", light: "#FFFFFF" },
  });
  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=31536000" },
  });
}
