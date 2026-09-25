import { getTranslations } from "next-intl/server";
import { Link } from "@/shared/i18n/navigation";

/**
 * The editorial pause between the shop's commerce bands and its journal.
 *
 * The design sets it as one sentence, centred, in the display face on a 900px
 * measure, with a small tracked attribution under it — the quietest band on
 * the page and the only centred one, which is what makes it read as a held
 * breath between two grids rather than as a third grid.
 *
 * It replaced a split band with a photograph of the studio beside a paragraph.
 * The picture was the same studio shot the hero already opens on, and the
 * paragraph teased a story that the about page tells properly; the link below
 * is what carries a reader who wants it.
 *
 * Its copy is its own. This section used to render `about.storyEyebrow`,
 * `about.storyTitle` and `about.storyBody1` — the same three strings the about
 * page opened its story with — so a shopper who followed "learn more" arrived
 * at a paragraph they had just finished reading.
 */
export async function BrandStory({ locale }: { locale: string }) {
  const t = await getTranslations({ locale });

  return (
    <section className="store-scroll-anchor bg-background">
      <div className="store-container store-section-close">
        <div className="mx-auto max-w-[56.25rem] text-center">
          <p className="font-display text-[clamp(1.5rem,2.8vw,2.375rem)] leading-[1.28] text-foreground [.locale-fa_&]:leading-[1.6]">
            {t("home.storyTitle")}
          </p>
          <p className="mt-[1.375rem] text-[0.84375rem] uppercase tracking-[0.06em] text-foreground/60 [.locale-fa_&]:normal-case [.locale-fa_&]:tracking-normal">
            {t("home.storyEyebrow")}
          </p>
          <Link href="/about" className="store-text-action mt-4">
            {t("home.storyLink")}
          </Link>
        </div>
      </div>
    </section>
  );
}
