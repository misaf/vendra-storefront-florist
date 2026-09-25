import { getTranslations } from "next-intl/server";

const commitments = [
  "valueFreshness",
  "valueCraft",
  "valueService",
  "valueDetail",
] as const;

/**
 * What the shop holds itself to.
 *
 * One section where there were three. The page used to run four value cards,
 * then a five-step process, then three trust cards — twelve boxes making the
 * same three statements about fresh flowers, careful design and attentive help,
 * with a step that hedged out loud about delivery timing. Saying a thing three
 * times in three shapes does not make it three times as true; it reads as
 * padding, and padding is what an about page is most often accused of.
 *
 * The design's composition for it: the warm surface, the heading alone across
 * the band on a 20ch measure, and under it a row of commitments each opening
 * with the system's petal — a soft asymmetric plate of the sage-to-clay
 * gradient, decorative and deliberately empty. An earlier edit set an icon
 * inside each petal and split the heading into its own column beside them,
 * which made the band a two-column feature rather than the statement it is.
 */
export async function AboutApproach({ locale }: { locale: string }) {
  const t = await getTranslations({ locale });

  return (
    <section className="bg-card text-card-foreground">
      <div className="store-container store-section-lg">
        <h2 className="store-section-title max-w-[20ch] text-card-foreground">
          {t("about.approachTitle")}
        </h2>
        <p className="store-lede mt-5 max-w-[52ch] text-base text-card-foreground/75">
          {t("about.approachBody")}
        </p>

        <dl className="mt-11 grid gap-[2.125rem] sm:grid-cols-[repeat(auto-fit,minmax(min(100%,16.25rem),1fr))]">
          {commitments.map((key) => (
            <div key={key}>
              <span
                className="organic-blob organic-washed block size-[4.875rem] bg-[linear-gradient(150deg,var(--sage-200),var(--clay-400))]"
                aria-hidden="true"
              />
              <dt className="font-display mt-[1.375rem] text-[1.375rem] leading-tight text-card-foreground [.locale-fa_&]:leading-normal">
                {t(`about.${key}Title`)}
              </dt>
              <dd className="store-lede mt-2.5 text-[0.90625rem] text-card-foreground/75">
                {t(`about.${key}Desc`)}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
