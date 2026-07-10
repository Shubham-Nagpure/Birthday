import { useEffect } from "react";
import type { SiteContent } from "@/lib/types";
import s from "../Player.module.css";

export function FinalePage({ content, celebrate }: { content: SiteContent; celebrate: () => void }) {
  useEffect(() => { celebrate(); }, [celebrate]);
  return (
    <section className={s.pg}>
      <h1 className={s.finaleMsg}>{content.finale_msg || "Happy Birthday! 🎉"}</h1>
      {content.from_name && <p className={s.finaleFrom}>With all my love, {content.from_name}</p>}
    </section>
  );
}
