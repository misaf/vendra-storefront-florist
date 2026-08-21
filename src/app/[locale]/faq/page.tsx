import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { FaqClient, fetchFaqCategories, fetchFaqs } from "@/modules/faq";
import type { Faq, FaqCategory } from "@/modules/faq";
import { JsonLd } from "@/shared/components/seo/json-ld";
import { breadcrumbSchema, buildMetadata, faqPageSchema } from "@/shared/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faq" });

  return buildMetadata({
    locale,
    path: "/faq",
    title: t("metadataTitle"),
    description: t("metadataDescription"),
  });
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faq" });
  const tCommon = await getTranslations({ locale, namespace: "common" });

  let initialFaqs: Faq[] = [];
  let initialCategories: FaqCategory[] = [];
  let initialError: string | null = null;

  try {
    const [faqs, categories] = await Promise.all([
      fetchFaqs({ perPage: 100, locale }),
      fetchFaqCategories(locale),
    ]);
    initialFaqs = faqs;
    initialCategories = categories;
  } catch (error) {
    initialError =
      error instanceof Error ? error.message : "Failed to load FAQs";
  }

  const structuredData = [
    breadcrumbSchema(locale, [
      { name: tCommon("home"), path: "" },
      { name: t("title"), path: "/faq" },
    ]),
  ];

  if (initialFaqs.length > 0) {
    structuredData.push(
      faqPageSchema(
        initialFaqs.map((faq) => ({
          question: faq.question,
          answer: faq.answer,
        }))
      )
    );
  }

  return (
    <>
      <JsonLd data={structuredData} />
      <Suspense fallback={null}>
        <FaqClient
          key={locale}
          initialFaqs={initialFaqs}
          initialCategories={initialCategories}
          initialError={initialError}
        />
      </Suspense>
    </>
  );
}
