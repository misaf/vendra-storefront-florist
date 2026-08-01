import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { StorefrontClient, loadInitialBlog, loadInitialHomeProductCategories } from "@/modules/home";
import { buildMetadata } from "@/shared/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });

  return buildMetadata({
    locale,
    path: "",
    title: t("metadataTitle"),
    description: t("metadataDescription"),
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Blog and product data are independent — load them concurrently.
  const [blog, initialHomeProductCategories] = await Promise.all([
    loadInitialBlog(locale),
    loadInitialHomeProductCategories(locale),
  ]);

  return (
    <StorefrontClient
      initialBlogPosts={blog.initialBlogPosts}
      initialBlogCategory={blog.initialBlogCategory}
      initialHomeProductCategories={initialHomeProductCategories}
    />
  );
}
