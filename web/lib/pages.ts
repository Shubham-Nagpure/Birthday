import type { PageDef, PageId } from "./types";

/** Single source of truth for the page catalog (order defines player flow). */
export const PAGES: PageDef[] = [
  { id: "intro",   ico: "🌟", name: "Name Intro",              desc: "A typewriter greeting that spells out their name with a glow.", core: true },
  { id: "ask",     ico: "💘", name: "Will You? (No runs away)", desc: "Ask a sweet question — the “No” button dodges, so they can only say Yes! Ends with your message." },
  { id: "story",   ico: "📖", name: "Do You Know",             desc: "Your story, revealed line by line — how you met, why they're special.", core: true },
  { id: "gallery", ico: "📸", name: "Memory Gallery",          desc: "A swipeable slideshow of your favourite photos with captions.", core: true },
  { id: "letter",  ico: "✉️", name: "Love Letter",             desc: "A sealed envelope that opens to your heartfelt message.", core: true },
  { id: "puzzle",  ico: "🧩", name: "Sliding Puzzle",          desc: "A playful photo puzzle they slide into place to unlock the next step." },
  { id: "quiz",    ico: "💭", name: "Quiz",                    desc: "Fun questions about the two of you, with instant feedback." },
  { id: "reasons", ico: "💖", name: "Reasons I Love You",      desc: "A folder that fans open into cards, one reason on each." },
  { id: "finale",  ico: "🎁", name: "Confetti Finale",         desc: "A grand surprise ending with balloons and confetti." },
];

export const PAGE_IDS: PageId[] = PAGES.map((p) => p.id);
export const CORE_PAGES: PageId[] = PAGES.filter((p) => p.core).map((p) => p.id);
export const PAGE_MAP: Record<PageId, PageDef> = Object.fromEntries(
  PAGES.map((p) => [p.id, p])
) as Record<PageId, PageDef>;

/** Pages in canonical flow order, filtered to a selection. */
export function orderedPages(selected: PageId[]): PageDef[] {
  return PAGES.filter((p) => selected.includes(p.id));
}
