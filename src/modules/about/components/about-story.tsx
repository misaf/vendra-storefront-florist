import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { AboutStat } from "../lib/load";

/**
 * The story, told once and told here.
 *
 * The home page teases it in its own words and links here; this is where the
 * answer actually is, which is why both paragraphs are longer and more specific
 * than anything on the home page.
 *
 * The portrait leads and the words follow, cut as the system's leaf — the one
 * asymmetric plate in the storefront, and the shape that tells this band apart
 * from the home page's story block without either leaving the same system. It
 * also picks up the masthead directly above it, which is now words alone.
 */
export async function AboutStory({
  locale,
  stats,
}: {
  locale: string;
  stats: AboutStat[];
}) {
  const t = await getTranslations({ locale });
  const formatCount = new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  });

  return (
    <section className="bg-background">
      <div className="store-container store-section grid items-start gap-9 min-[43.75rem]:grid-cols-12 min-[43.75rem]:gap-[clamp(2.125rem,5vw,3.75rem)]">
        {/* Source order puts the picture first so it leads the band on every
            width, including the phone, where the two stack. */}
        <div className="organic-leaf organic-washed relative aspect-[4/5] overflow-hidden bg-secondary shadow-panel max-[43.74rem]:mx-auto max-[43.74rem]:max-w-sm min-[43.75rem]:col-span-6 min-[43.75rem]:aspect-[4/5] lg:col-span-5">
          <Image
            src="/contact-consultation.webp"
            alt={t("about.storyImageAlt")}
            fill
            sizes="(min-width: 43.75rem) 44vw, calc(100vw - 2rem)"
            className="object-cover"
          />
        </div>

        {/* Prose at reading size on a 17px body, as the design sets the story
            column — not a section heading with a caption under it. The eyebrow
            and the title were repeating what the masthead directly above had
            already said. */}
        <div className="min-[43.75rem]:col-span-6 lg:col-span-7">
          <h2 className="store-section-title max-w-xl text-foreground">
            {t("about.storyTitle")}
          </h2>
          <p className="store-lede mt-6 max-w-xl text-[1.0625rem] leading-[1.72] text-foreground/85">
            {t("about.storyBody1")}
          </p>
          <p className="store-lede mt-[1.375rem] max-w-xl text-[1.0625rem] leading-[1.72] text-foreground/85">
            {t("about.storyBody2")}
          </p>

          {/* The design closes this column on a row of figures. Every one here
              is counted from the storefront's own catalogue and journal rather
              than hand-set, so the page cannot claim a history it has no
              record of — and a shop whose catalogue is unreachable simply does
              not draw the row. */}
          {stats.length > 0 ? (
            <dl className="mt-9 grid gap-[1.625rem] [grid-template-columns:repeat(auto-fit,minmax(min(100%,8.75rem),1fr))]">
              {stats.map((stat) => (
                <div key={stat.key}>
                  <dt className="sr-only">{t(`about.stat${stat.key}` as never)}</dt>
                  <dd className="font-display text-[2.375rem] leading-none text-rose">
                    {formatCount.format(stat.value)}
                  </dd>
                  <p className="mt-1.5 text-[0.84375rem] leading-snug text-foreground/70">
                    {t(`about.stat${stat.key}` as never)}
                  </p>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </div>
    </section>
  );
}
