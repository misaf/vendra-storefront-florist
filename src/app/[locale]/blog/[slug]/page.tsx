import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/shared/i18n/navigation";
import { PageShell } from "@/shared/components/layout/page-shell";
import { Breadcrumbs, type BreadcrumbItem } from "@/shared/components/layout/breadcrumbs";
import { JsonLd } from "@/shared/components/seo/json-ld";
import { Button } from "@/shared/components/ui/button";
import { SafeImage } from "@/shared/components/ui/safe-image";
import { ShareButton } from "@/shared/components/ui/share-button";
import { RichText } from "@/shared/components/rich-text";
import { Calendar, ArrowLeft, ArrowRight, BookOpen, Clock } from "lucide-react";
import { isRtlLocale } from "@/shared/lib/locale";
import { getPost, loadRelatedPosts } from "@/modules/blog";
import type { Post as BlogPost } from "@/modules/blog";
import { RelatedEntries } from "@/modules/blog";
import { PLACEHOLDER_IMAGE } from "@/shared/lib/image";
import type { Locale } from "@/shared/i18n/routing";
import { formatLocaleDate } from "@/shared/lib/date";
import { estimateReadingMinutes } from "@/shared/lib/rich-text";
import { createReadableResourcePath } from "@/shared/lib/slug-url";
import {
  articleSchema,
  breadcrumbSchema,
  buildMetadata,
  plainText,
} from "@/shared/seo";

/**
 * One measure for the whole entry: a meta rail, then the column the title, the
 * lead image and the copy all start from. Written once so the three bands can't
 * drift apart — they previously sat on three different containers and started
 * at three different left edges.
 */
const ARTICLE_GRID =
  "grid gap-8 md:grid-cols-[10rem_minmax(0,1fr)] md:gap-12 lg:grid-cols-[12rem_minmax(0,1fr)]";

/** The reading measure — ~70 characters at the article type scale. */
const PROSE_WIDTH = "max-w-[42rem]";

/**
 * The post's own address, independent of how the visitor arrived. `/blog/7`,
 * `/blog/7-real-slug` and `/blog/7-anything-at-all` all resolve to this post,
 * so each has to point its canonical at the same URL rather than declare
 * itself the original.
 */
function canonicalPath(post: BlogPost): string {
  return `/blog/${createReadableResourcePath(post.id, post.slug)}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });

  try {
    const post = await getPost(slug, locale);

    if (post) {
      return buildMetadata({
        locale,
        path: canonicalPath(post),
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
    path: `/blog/${slug}`,
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
  const ForwardArrow = isRtlLocale(locale) ? ArrowLeft : ArrowRight;

  let post = null;
  let error: string | null = null;

  try {
    post = await getPost(slug, locale);
  } catch (caughtError) {
    console.error("Blog post load failed:", caughtError);
    error = t("blog.loadPostError");
  }

  // A post that does not exist is a 404. A post that failed to *load* is not —
  // it may well exist — so that still renders the message below.
  if (!post && !error) {
    notFound();
  }

  const hasLeadImage = Boolean(post?.image && post.image !== PLACEHOLDER_IMAGE);
  const hasArticleContent = Boolean(post && plainText(post.content));
  const publishedAt = post ? post.publishedAt || post.createdAt : "";
  const readingMinutes = post
    ? estimateReadingMinutes(post.richContent ?? post.content)
    : 0;

  // The trail the page draws, reused verbatim for BreadcrumbList so the markup
  // and the structured data can never describe different journeys.
  const trail = post
    ? [
        { name: t("common.home"), path: "" },
        { name: t("blog.title"), path: "/blog" },
        ...(post.category && post.categorySlug
          ? [
              {
                name: post.category,
                path: `/blog?category=${encodeURIComponent(post.categorySlug)}`,
              },
            ]
          : []),
        { name: post.title, path: canonicalPath(post) },
      ]
    : [];

  const breadcrumbItems: BreadcrumbItem[] = post
    ? [
        { label: t("common.home"), href: "/" },
        { label: t("blog.title"), href: "/blog" },
        ...(post.category && post.categorySlug
          ? [
              {
                label: post.category,
                href: {
                  pathname: "/blog" as const,
                  query: { category: post.categorySlug },
                },
              },
            ]
          : []),
        { label: post.title },
      ]
    : [];

  // Kick off the related fetch without awaiting — streamed on the client.
  const relatedPostsPromise: Promise<BlogPost[]> = post
    ? loadRelatedPosts(post, locale)
    : Promise.resolve([]);

  return (
    <PageShell>
      {error ? (
        <section className="bg-background pb-20 pt-10 sm:pb-28 sm:pt-14">
          <div className="store-container max-w-2xl text-center">
            <span className="golzar-seam mx-auto mb-8 max-w-[10rem]">
              <span className="petal-dot" aria-hidden="true" />
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
                publishedAt,
                modifiedAt: post.updatedAt,
                path: canonicalPath(post),
              }),
              breadcrumbSchema(locale, trail),
            ]}
          />

          {/* One <article>: the heading, the lead image and the copy are the
              same document, not three sibling bands that happen to sit near
              each other. */}
          <article className="bg-background pt-6 sm:pt-8">
            <header className="store-container max-w-6xl">
              <Breadcrumbs
                items={breadcrumbItems}
                label={t("blog.breadcrumb")}
              />

              <div
                className={`${ARTICLE_GRID} mt-6 border-y border-border py-9 lg:py-11`}
              >
                <div className="order-2 flex flex-wrap gap-x-6 gap-y-4 text-sm text-muted-foreground md:order-1 md:block md:space-y-6 md:border-e md:border-border md:pe-8">
                  {post.category ? (
                    <div className="min-w-0">
                      <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        {t("blog.category")}
                      </p>
                      {post.categorySlug ? (
                        <Link
                          href={{
                            pathname: "/blog",
                            query: { category: post.categorySlug },
                          }}
                          // The negative bottom margin keeps the 44px tap target from
                          // stretching the rail, the way Breadcrumbs does it.
                          className="store-dynamic-text -mb-2 mt-2 inline-flex min-h-11 items-center rounded-sm py-2 font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
                        >
                          <bdi>{post.category}</bdi>
                        </Link>
                      ) : (
                        <p className="store-dynamic-text mt-2 font-medium text-foreground">
                          <bdi>{post.category}</bdi>
                        </p>
                      )}
                    </div>
                  ) : null}

                  <div>
                    <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {t("blog.published")}
                    </p>
                    <time
                      dateTime={publishedAt}
                      className="mt-2 inline-flex items-center gap-2 font-medium text-foreground"
                    >
                      <Calendar className="size-3.5 shrink-0" aria-hidden="true" />
                      {formatLocaleDate(publishedAt, locale as Locale)}
                    </time>
                  </div>

                  {readingMinutes > 0 ? (
                    <div>
                      {/* No label above it — "6 min read" already says what it
                          is, where a "Reading time" heading would only repeat
                          the value underneath. */}
                      <time
                        dateTime={`PT${readingMinutes}M`}
                        className="inline-flex items-center gap-2 font-medium text-foreground"
                      >
                        <Clock className="size-3.5 shrink-0" aria-hidden="true" />
                        {t("blog.readingTime", {
                          // A bare ICU placeholder substitutes the raw value,
                          // which put a Latin "3" beside a Persian date on the
                          // same rail. Format it the way the journal index
                          // formats its post count.
                          minutes: new Intl.NumberFormat(locale).format(
                            readingMinutes
                          ),
                        })}
                      </time>
                    </div>
                  ) : null}
                </div>

                <div className="order-1 min-w-0 md:order-2">
                  <span className="golzar-seam mb-5 max-w-[8rem]">
                    <span className="petal-dot" aria-hidden="true" />
                  </span>
                  <h1
                    className="store-dynamic-text store-page-title text-foreground"
                    dir="auto"
                  >
                    {post.title}
                  </h1>
                </div>
              </div>
            </header>

            {hasLeadImage && (
              /* No caption, because the API carries none — inventing one would
                 be worse than the photograph standing on its own. */
              <figure className={`store-container max-w-6xl ${ARTICLE_GRID} mt-8 sm:mt-10`}>
                <div className="hidden md:block" aria-hidden="true" />
                <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-border bg-muted">
                  <SafeImage
                    src={post.image}
                    alt={post.title}
                    fill
                    sizes="(min-width: 1024px) 57rem, (min-width: 768px) 100vw, 100vw"
                    className="object-cover"
                    preload
                    unoptimized
                  />
                </div>
              </figure>
            )}

            <div className="store-section">
              <div className={`store-container max-w-6xl ${ARTICLE_GRID}`}>
                <div className="hidden md:block" aria-hidden="true">
                  <div className="store-sticky h-px w-full bg-border" />
                </div>

                <div className={`min-w-0 ${PROSE_WIDTH}`}>
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

                  {/* Where the entry hands off: one way to pass it on, one way
                      into the shop it belongs to. No product block — the API
                      ties no products to a post, and a guessed recommendation
                      is an advert, not an editorial one. */}
                  <footer className="mt-12 flex flex-col items-start gap-4 border-t border-border pt-6 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
                    <div className="min-w-0">
                      <p className="text-sm leading-6 text-muted-foreground">
                        {t("blog.shopCtaDescription")}
                      </p>
                      <Link
                        href="/products"
                        className="group -my-2 mt-1 inline-flex min-h-11 items-center gap-1.5 rounded-sm py-2 text-sm font-semibold text-foreground"
                      >
                        {t("blog.shopCta")}
                        <ForwardArrow className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                      </Link>
                    </div>
                    <ShareButton
                      title={post.title}
                      label={t("blog.shareArticle")}
                    />
                  </footer>
                </div>
              </div>
            </div>
          </article>

          <Suspense fallback={null}>
            <RelatedEntries
              postsPromise={relatedPostsPromise}
              categoryName={post.category}
              categorySlug={post.categorySlug}
            />
          </Suspense>
        </>
      ) : null}
    </PageShell>
  );
}
