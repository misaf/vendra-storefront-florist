import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/shared/components/layout/page-header";

/**
 * The contact page's opening: the heading and one sentence, on the page's own
 * ground.
 *
 * It replaced a two-column masthead with a photograph beside it and, below
 * that, a four-cell hairline grid of the shop's phone numbers, address and
 * hours — a page that spent two full bands before reaching the form it exists
 * for. The design opens on the words and puts the photograph, the map and
 * those same four facts in one column beside the form, which is where someone
 * looking for them actually looks.
 */
export async function ContactIntro({ locale }: { locale: string }) {
  const t = await getTranslations({ locale });

  return (
    <PageHeader
      title={t("contact.title")}
      description={t("contact.weLoveToHear")}
      className="pb-[1.875rem] sm:pb-[1.875rem]"
    />
  );
}
