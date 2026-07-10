import type { Template, TemplateId } from "./types";

/**
 * Single source of truth for templates (theme + starter pages).
 * Previously duplicated in sell/script.js AND server/player.js — now one place,
 * consumed by both the builder and the player.
 */
export const TEMPLATES: Template[] = [
  { id: "romantic",    name: "Romantic",        emoji: "💖", tag: "Soft pinks for love letters and anniversaries.", accent: "#D6246E", accent2: "#E62D87", g1: "#FFF6D6", g2: "#FFDCE8", pages: ["intro", "story", "gallery", "letter", "reasons"] },
  { id: "birthday",    name: "Birthday",        emoji: "🎂", tag: "Bright and playful for the big day.",            accent: "#E6462D", accent2: "#FF7A45", g1: "#FFF4D6", g2: "#FFE0C2", pages: ["intro", "gallery", "quiz", "reasons", "finale"] },
  { id: "anniversary", name: "Anniversary",     emoji: "💍", tag: "Warm gold — elegant and timeless.",              accent: "#B8873C", accent2: "#D4A24E", g1: "#FFF6E9", g2: "#F7E4D0", pages: ["intro", "story", "gallery", "letter", "finale"] },
  { id: "friendship",  name: "Friendship",      emoji: "🫶", tag: "Sunny orange for your favourite people.",         accent: "#E67E22", accent2: "#F39C12", g1: "#FFF6D6", g2: "#FFEFC2", pages: ["intro", "gallery", "reasons", "finale"] },
  { id: "congrats",    name: "Congrats",        emoji: "🎉", tag: "Fresh green to celebrate a big win.",             accent: "#159A5B", accent2: "#27C06F", g1: "#EAFBF0", g2: "#D6F5E3", pages: ["intro", "story", "gallery", "finale"] },
  { id: "valentine",   name: "Be My Valentine", emoji: "💘", tag: "Ask the big question — the “No” button runs away!", accent: "#E23E6B", accent2: "#FF5A87", g1: "#FFE3EC", g2: "#FFC9DA", pages: ["intro", "ask", "gallery", "finale"] },
  { id: "sorry",       name: "I'm Sorry",       emoji: "🥺", tag: "A gentle apology they can't say no to.",          accent: "#6C7BE0", accent2: "#8A97F0", g1: "#EEF1FF", g2: "#E0E7FF", pages: ["ask", "letter", "finale"] },
];

export const TEMPLATE_MAP: Record<TemplateId, Template> = Object.fromEntries(
  TEMPLATES.map((t) => [t.id, t])
) as Record<TemplateId, Template>;

export function getTemplate(id: string | undefined): Template {
  return TEMPLATE_MAP[(id as TemplateId)] ?? TEMPLATE_MAP.romantic;
}
