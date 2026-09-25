import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ContactClient, ContactIntro } from "@/modules/contact";
import { PageShell } from "@/shared/components/layout/page-shell";
import { getStorefrontConfig } from "@/shared/config/storefront";
import { buildMetadata } from "@/shared/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });

  return buildMetadata({
    locale,
    path: "/contact",
    title: t("metadataTitle"),
    description: t("metadataDescription"),
  });
}

export default async function ContactPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ subject?: string | string[] }>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  const contactInfo = getStorefrontConfig().contact;
  const subject = Array.isArray(query.subject) ? query.subject[0] : query.subject;

  return (
    <PageShell>
      <div className="bg-background text-foreground">
        {/* The masthead is static — server-rendered. The form, the map and
            the FAQ accordion beside it need JavaScript. */}
        <ContactIntro locale={locale} />
        <ContactClient
          contactInfo={contactInfo}
          initialSubject={subject?.slice(0, 160)}
        />
      </div>
    </PageShell>
  );
}
