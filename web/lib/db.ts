import "server-only";
import { prisma } from "./prisma";
import type { PageId, PlanId, SiteContent, TemplateId } from "./types";

export interface NewSite {
  slug: string;
  ownerEmail?: string | null;
  plan: PlanId;
  template: TemplateId;
  pages: PageId[];
  content: SiteContent;
  amount: number; // paise
  currency: string;
  status: "draft" | "preview";
  razorpayOrderId: string;
}

export function createSite(data: NewSite) {
  return prisma.site.create({
    data: { ...data, pages: data.pages as object, content: data.content as object },
  });
}

export function getSite(slug: string) {
  return prisma.site.findUnique({ where: { slug } });
}

export function getSiteByOrder(razorpayOrderId: string) {
  return prisma.site.findUnique({ where: { razorpayOrderId } });
}

export function markPaid(razorpayOrderId: string, razorpayPaymentId: string | null) {
  return prisma.site.updateMany({
    where: { razorpayOrderId, status: { not: "paid" } },
    data: { status: "paid", razorpayPaymentId, paidAt: new Date() },
  });
}

export function markPreview(slug: string) {
  return prisma.site.updateMany({
    where: { slug, status: "draft" },
    data: { status: "preview" },
  });
}
