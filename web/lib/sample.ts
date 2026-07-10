import type { Site, SiteContent, TemplateId } from "./types";
import { getTemplate } from "./templates";

/** Rich sample content so demo links show every page type populated. */
const SAMPLE: SiteContent = {
  intro_name: "Rajvi",
  intro_greeting: "Hey",
  from_name: "Shubham",
  ask_title: "I have something to ask…",
  ask_message: "You just made me the happiest! 🥰",
  ask_yes: "Yes 💛",
  ask_no: "No",
  ask: [{ q: "Will you be my Valentine?" }, { q: "Are you absolutely sure? 🥺" }],
  story_text:
    "They ask how we met — I say it was ordinary. A simple hello, two strangers.\nBut the real story is you: your calm, your kindness, the way you remember the little things.",
  gallery: [
    { photo: "https://picsum.photos/seed/a/600", caption: "Your glow 🎂", desc: "The day made just for you." },
    { photo: "https://picsum.photos/seed/b/600", caption: "Simple, so stunning 💙", desc: "You light up just as you are." },
    { photo: "https://picsum.photos/seed/c/600", caption: "Our little heart 🤍", desc: "Two hands, one heart." },
  ],
  letter_salutation: "My love,",
  letter_body:
    "Today I want to tell you exactly why you're so special.\nYour honesty, your courage, the way you love completely. I'm luckier than I can say.",
  letter_signoff: "Always yours,\nShubham 🐣",
  puzzle_photo: "https://picsum.photos/seed/p/600",
  puzzle_sub: "Slide the tiles to fix our photo 💕",
  quiz: [
    { q: "Where did we first meet?", opt0: "Online", opt1: "A cafe", opt2: "School", correct: "0" },
    { q: "Our favourite song?", opt0: "That one", opt1: "This one", correct: "1" },
  ],
  reasons: [
    { reason: "You make ordinary days feel like magic." },
    { reason: "Your kindness — even to a stray kitten." },
    { reason: "You remember the little things." },
  ],
  finale_msg: "Happy Birthday, my love! 🎉",
};

/** Build a demo Site for a slug like "demo-valentine". Returns null if not a demo. */
export function demoSite(slug: string): Site | null {
  if (!slug.startsWith("demo-")) return null;
  const templateId = slug.slice(5) as TemplateId;
  const t = getTemplate(templateId);
  return {
    slug,
    plan: "premium",
    template: t.id,
    pages: t.pages,
    content: SAMPLE,
    preview: false,
  };
}
