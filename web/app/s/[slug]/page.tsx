import { notFound } from "next/navigation";
import { Player } from "@/components/player/Player";
import { LocalPreview } from "@/components/player/LocalPreview";
import { demoSite } from "@/lib/sample";
import { getSite } from "@/lib/db";
import type { PageId, PlanId, Site, SiteContent, TemplateId } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SitePage({ params }: { params: { slug: string } }) {
  // Builder preview (client-side, no backend)
  if (params.slug === "local") return <LocalPreview />;
  // Sample demo sites
  const demo = demoSite(params.slug);
  if (demo) return <Player site={demo} />;

  // Real published/preview site from the database
  try {
    const row = await getSite(params.slug);
    if (row && (row.status === "paid" || row.status === "preview")) {
      const site: Site = {
        slug: row.slug,
        plan: row.plan as PlanId,
        template: (row.template as TemplateId) || "romantic",
        pages: row.pages as PageId[],
        content: row.content as SiteContent,
        preview: row.status === "preview",
      };
      return <Player site={site} />;
    }
  } catch {
    // No DB configured (e.g. local dev without DATABASE_URL) — fall through.
  }

  notFound();
}
