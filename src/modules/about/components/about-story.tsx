import Image from "next/image";
import { getTranslations } from "next-intl/server";

/**
 * The story, told once and told here.
 *
 * The home page teases it in its own words and links here; this is where the
 * answer actually is, which is why both paragraphs are longer and more specific
 * than anything on the home page. Text leads and the photograph follows, the
 * mirror of the home page's story block, so the two are recognisably the same
 * composition without being the same picture-and-paragraph twice.
 */
export async function AboutStory({ locale }: { locale: string }) {
  const t = await getTranslations({ locale });

  return (
    <section className="bg-background">
      <div className="store-container store-section-lg grid items-center gap-9 min-[43.75rem]:grid-cols-12 min-[43.75rem]:gap-10 lg:gap-16">
        <div className="min-[43.75rem]:col-span-6 lg:col-span-5">
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

        <div className="relative aspect-[5/4] overflow-hidden rounded-2xl bg-secondary sm:aspect-[16/10] min-[43.75rem]:col-span-6 min-[43.75rem]:aspect-[4/3] lg:col-span-7">
          <Image
            src="/contact-consultation.webp"
            alt={t("about.storyImageAlt")}
            fill
            sizes="(min-width: 43.75rem) 52vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
