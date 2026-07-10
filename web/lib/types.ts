/* Shared domain types — used by the builder, the player, and the API. */

export type PlanId = "free" | "basic" | "premium";

export type PageId =
  | "intro" | "ask" | "story" | "gallery"
  | "letter" | "puzzle" | "quiz" | "reasons" | "finale";

export type TemplateId =
  | "romantic" | "birthday" | "anniversary"
  | "friendship" | "congrats" | "valentine" | "sorry";

export interface GalleryItem { photo?: string; caption?: string; desc?: string; }
export interface QuizItem { q?: string; opt0?: string; opt1?: string; opt2?: string; opt3?: string; correct?: string; }
export interface ReasonItem { reason?: string; }
export interface AskItem { q?: string; }

/** All buyer-entered content. Every field optional — the player has sane fallbacks. */
export interface SiteContent {
  intro_name?: string;
  intro_greeting?: string;
  from_name?: string;

  ask_title?: string;
  ask_message?: string;
  ask_yes?: string;
  ask_no?: string;
  ask?: AskItem[];

  story_text?: string;

  gallery?: GalleryItem[];

  letter_salutation?: string;
  letter_body?: string;
  letter_signoff?: string;

  puzzle_photo?: string;
  puzzle_sub?: string;

  quiz?: QuizItem[];

  reasons?: ReasonItem[];

  finale_msg?: string;
  finale_music?: string;
}

export interface Site {
  slug: string;
  plan: PlanId;
  template: TemplateId;
  pages: PageId[];
  content: SiteContent;
  preview?: boolean;
}

export interface Template {
  id: TemplateId;
  name: string;
  emoji: string;
  tag: string;
  accent: string;
  accent2: string;
  g1: string;
  g2: string;
  pages: PageId[];
}

export interface PageDef {
  id: PageId;
  ico: string;
  name: string;
  desc: string;
  core?: boolean;
}
