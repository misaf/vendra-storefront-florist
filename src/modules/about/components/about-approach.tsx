import { getTranslations } from "next-intl/server";
import { HandHeart, Leaf, ScanHeart } from "lucide-react";
import { getStorefrontConfig } from "@/shared/config/storefront";
import { getBrandIcon } from "@/shared/lib/brand-icon";

const BrandIcon = getBrandIcon(getStorefrontConfig().businessType);

const commitments = [
  { key: "valueFreshness", Icon: Leaf },
  { key: "valueCraft", Icon: BrandIcon },
  { key: "valueService", Icon: HandHeart },
  { key: "valueDetail", Icon: ScanHeart },
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
 * Ruled rows rather than cards: this is a list of commitments, and by this
 * point in the page the reader is reading, not scanning tiles.
 */
export async function AboutApproach({ locale }: { locale: string }) {
  const t = await getTranslations({ locale });

  return (
    <section className="bg-secondary/45">
      <div className="store-container store-section-lg grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div>
          <p className="store-eyebrow">{t("about.approachEyebrow")}</p>
          <h2 className="store-section-title mt-4 max-w-md text-foreground">
            {t("about.approachTitle")}
          </h2>
          <p className="store-lede mt-5 max-w-md text-base text-muted-foreground">
            {t("about.approachBody")}
          </p>
        </div>

        {/* The system's petal medallion above each commitment, rather than a
            hairline above it and a small icon inline with its title. The rules
            drew a four-cell table across a band that is a set of statements,
            and the inline icons sat at caption size beside 1.125rem titles —
            too small to read as anything but decoration. */}
        <dl className="grid gap-x-10 gap-y-10 sm:grid-cols-2">
          {commitments.map(({ key, Icon }) => (
            <div key={key}>
              <span
                className="organic-blob flex size-14 items-center justify-center bg-gradient-to-br from-sage-200 to-clay-300 text-clay-900"
                aria-hidden="true"
              >
                <Icon className="size-6" />
              </span>
              <dt className="font-display mt-5 text-lg text-foreground">
                {t(`about.${key}Title`)}
              </dt>
              <dd className="store-lede mt-2.5 text-sm text-muted-foreground">
                {t(`about.${key}Desc`)}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
