import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/shared/i18n/navigation";
import { PageShell } from "@/shared/components/layout/page-shell";
import { JsonLd } from "@/shared/components/seo/json-ld";
import { Button } from "@/shared/components/ui/button";
import { SafeImage } from "@/shared/components/ui/safe-image";
import { RichText } from "@/shared/components/rich-text";
import { Calendar, ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { isRtlLocale } from "@/shared/lib/locale";
import { getPost, loadRelatedPosts } from "@/modules/blog";
import type { Post as BlogPost } from "@/modules/blog";
import { RelatedEntries } from "@/modules/blog";
import { PLACEHOLDER_IMAGE } from "@/shared/lib/image";
import type { Locale } from "@/shared/i18n/routing";
import { formatLocaleDate } from "@/shared/lib/date";
import {
  articleSchema,
  breadcrumbSchema,
  buildMetadata,
  plainText,
} from "@/shared/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  const path = `/blog/${slug}`;

  try {
    const post = await getPost(slug, locale);

    if (post) {
      return buildMetadata({
        locale,
        path,
        type: "article",
        title: post.title,
        description:
          plainText(post.excerpt) ||
          plainText(post.content) ||
          t("metadataDescription"),
        images: post.image ? [post.image] : undefined,
        publishedTime: post.publishedAt || post.createdAt,
        modifiedTime: post.updatedAt,
      });
    }
  } catch {
    // Fall through to generic blog metadata when the API is unavailable.
  }

  return buildMetadata({
    locale,
    path,
    title: t("metadataTitle"),
    description: t("metadataDescription"),
  });
}

export default async function BlogPostDetail({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale });
  const BackArrow = isRtlLocale(locale) ? ArrowRight : ArrowLeft;

  let post = null;
  let error: string | null = null;

  try {
    post = await getPost(slug, locale);
    if (!post) {
      error = t("blog.postNotFound");
    }
  } catch (caughtError) {
    console.error("Blog post load failed:", caughtError);
    error = t("blog.loadPostError");
  }

  const hasLeadImage = Boolean(post?.image && post.image !== PLACEHOLDER_IMAGE);
  const hasArticleContent = Boolean(post && plainText(post.content));

  // Kick off the related fetch without awaiting — streamed on the client.
  const relatedPostsPromise: Promise<BlogPost[]> = post
    ? loadRelatedPosts(post.id, locale)
    : Promise.resolve([]);

  return (
    <PageShell>
      {error ? (
        <section className="bg-background pb-20 pt-10 sm:pb-28 sm:pt-14">
          <div className="store-container max-w-2xl text-center">
            <span className="golzar-seam mx-auto mb-8 max-w-[10rem]">
              <span className="h-px flex-1" aria-hidden="true" />
              <span className="petal-dot" aria-hidden="true" />
              <span className="h-px flex-1" aria-hidden="true" />
            </span>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {t("blog.eyebrow")}
            </p>
            <h1 className="font-display mt-4 text-3xl tracking-tight text-foreground sm:text-4xl">
              {error}
            </h1>
            <p className="mt-4 leading-7 text-muted-foreground">
              {t("blog.errorDescription")}
            </p>
            <Button asChild className="mt-8 gap-2">
              <Link href="/blog">
                <BackArrow className="h-4 w-4" />
                {t("blog.backToBlog")}
              </Link>
            </Button>
          </div>
        </section>
      ) : post ? (
        <>
          <JsonLd
            data={[
              articleSchema(locale, {
                title: post.title,
                description: plainText(post.excerpt) || plainText(post.content),
                image: post.image,
                publishedAt: post.publishedAt || post.createdAt,
                modifiedAt: post.updatedAt,
                path: `/blog/${slug}`,
              }),
              breadcrumbSchema(locale, [
                { name: "Home", path: "" },
                { name: "Blog", path: "/blog" },
                { name: post.title, path: `/blog/${slug}` },
              ]),
            ]}
          />
          <header className="bg-background pt-10 sm:pt-14">
            <div className="store-container max-w-6xl">
              <Link
                href="/blog"
                className="group -my-2 inline-flex min-h-11 items-center gap-1.5 rounded-sm py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <BackArrow className="size-3.5 transition-transform duration-300 group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5" />
                {t("blog.backToBlog")}
              </Link>

              <div className="mt-10 grid gap-8 border-y border-border py-10 md:grid-cols-[10rem_minmax(0,1fr)] md:gap-12 lg:grid-cols-[12rem_minmax(0,1fr)] lg:py-12">
                <aside className="order-2 flex flex-wrap gap-x-6 gap-y-4 text-sm text-muted-foreground md:order-1 md:block md:space-y-7 md:border-e md:border-border md:pe-8">
                  {post.category ? (
                    <div>
                      <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        {t("blog.title")}
                      </p>
                      <p className="mt-2 font-medium text-foreground">
                        {post.category}
                      </p>
                    </div>
                  ) : null}
                  <div>
                    <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {t("blog.latestEntry")}
                    </p>
                    <time
                      dateTime={post.publishedAt || post.createdAt}
                      className="mt-2 inline-flex items-center gap-2 font-medium text-foreground"
                    >
                      <Calendar className="size-3.5" aria-hidden="true" />
                      {formatLocaleDate(
                        post.publishedAt || post.createdAt,
                        locale as Locale
                      )}
                    </time>
                  </div>
                </aside>

                <div className="order-1 md:order-2">
                  <span className="golzar-seam mb-5 max-w-[8rem]">
                    <span className="petal-dot" aria-hidden="true" />
                    <span className="h-px flex-1" aria-hidden="true" />
                  </span>
                  <h1 className="store-dynamic-text store-page-title max-w-4xl text-foreground" dir="auto">
                    {post.title}
                  </h1>
                  {(plainText(post.excerpt) || plainText(post.content)) && (
                    <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl sm:leading-9">
                      {plainText(post.excerpt) || plainText(post.content)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </header>

          {hasLeadImage && (
            <figure className="mx-auto mt-8 max-w-6xl px-4 sm:mt-10 sm:px-6 lg:px-8">
              <div className="relative mx-auto max-w-5xl">
                <div
                  aria-hidden="true"
                  className="absolute -inset-3 rounded-2xl border border-border bg-card/40 sm:-inset-4"
                />
                <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-border bg-muted shadow-2xl shadow-foreground/5">
                  <SafeImage
                    src={post.image}
                    alt={post.title}
                    fill
                    sizes="(min-width: 1024px) 64rem, 100vw"
                    className="object-cover"
                    preload
                    unoptimized
                  />
                </div>
              </div>
            </figure>
          )}

          <article className="store-section bg-background">
            <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[12rem_minmax(0,42rem)_1fr] lg:px-8">
              <div className="hidden lg:block">
                <div className="store-sticky h-px w-full bg-border" />
              </div>
              {hasArticleContent ? (
                <RichText
                  content={post.richContent ?? post.content}
                  density="article"
                />
              ) : (
                <div className="rounded-xl border border-border bg-card/65 p-6 sm:p-8">
                  <span className="flex size-11 items-center justify-center rounded-full bg-secondary text-primary">
                    <BookOpen className="size-5" aria-hidden="true" />
                  </span>
                  <h2 className="font-display mt-5 text-2xl leading-tight text-foreground sm:text-3xl">
                    {t("blog.contentPendingTitle")}
                  </h2>
                  <p className="mt-3 leading-7 text-muted-foreground">
                    {t("blog.contentPendingDescription")}
                  </p>
                  <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                    <Button asChild>
                      <Link href="/blog">{t("blog.viewAllPosts")}</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/contact">{t("common.contact")}</Link>
                    </Button>
                  </div>
                </div>
              )}
              <div className="hidden lg:block" aria-hidden="true" />
            </div>
          </article>

          <Suspense fallback={null}>
            <RelatedEntries postsPromise={relatedPostsPromise} />
          </Suspense>
        </>
      ) : null}
    </PageShell>
  );
}
