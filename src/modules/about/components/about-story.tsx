import Image from "next/image";
import { getTranslations } from "next-intl/server";

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
export async function AboutStory({ locale }: { locale: string }) {
  const t = await getTranslations({ locale });

  return (
    <section className="bg-background">
      <div className="store-container store-section-lg grid items-center gap-9 min-[43.75rem]:grid-cols-12 min-[43.75rem]:gap-10 lg:gap-16">
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

        <div className="min-[43.75rem]:col-span-6 lg:col-span-7">
          <p className="store-eyebrow">{t("about.storyEyebrow")}</p>
          <h2 className="store-section-title mt-4 max-w-xl text-foreground">
            {t("about.storyTitle")}
          </h2>
          <p className="store-lede mt-6 max-w-xl text-lg text-foreground">
            {t("about.storyBody1")}
          </p>
          <p className="store-lede mt-4 max-w-xl text-base text-muted-foreground">
            {t("about.storyBody2")}
          </p>
        </div>
      </div>
    </section>
  );
}
